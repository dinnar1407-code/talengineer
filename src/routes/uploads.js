const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const multer  = require('multer');
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── 文件上传统一入口 ──────────────────────────────────────────────────────────
// 前端（头像/作品集/完工照片/COI/税务文件）都走这一个端点，由 query bucket 决定落哪个桶：
//   bucket=public(默认) → 公开桶 uploads：读时可直接拼公开 URL 返回给前端。
//   bucket=tax          → 私有桶 tax-docs：含 TIN 等敏感信息，只回存储路径，绝不回公开 URL，
//                          后续读取一律由 /api/tax 的管理员端点签发 5 分钟短时签名 URL。
// 上传均用服务端 service key（src/config/db.js 的 client）执行，不开放客户端直传，避免越权写桶。

// 允许的 MIME 白名单：图片三种 + PDF。tax 桶要求"只收 PDF 与图片"，与此集合一致，故共用。
const ALLOWED_MIME = {
  'image/jpeg':      'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'application/pdf': 'pdf',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// memoryStorage：文件读进内存 Buffer（req.file.buffer），再由我们主动上传到 Supabase Storage，
// 不落本地磁盘（Railway 容器文件系统是临时的，且我们要转存到云端桶）。
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_SIZE },
  // fileFilter：MIME 不在白名单直接拒绝。cb(err) 抛出的错误会在下方被兜成 400 明确文案。
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME[file.mimetype]) return cb(null, true);
    cb(new Error('Unsupported file type. Allowed: JPG, PNG, WebP, PDF.'));
  },
}).single('file'); // 单文件，字段名固定为 file

// ── POST /api/uploads ─────────────────────────────────────────────────────────
// requireAuth 先跑（只读 Authorization 头，无需先解析 body）；随后手动调用 multer 中间件，
// 这样能就地捕获 multer 的错误（超限/类型）并回 400 明确文案，而不是落到全局 500 兜底。
router.post('/', requireAuth, (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    // multer 层错误：超大小限制 / 白名单拒绝 —— 都属于"调用方可纠正"的问题，回 400 明确文案。
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: 'Upload failed. Please check your file and try again.' });
      }
      // fileFilter 抛出的自定义 Error（类型不允许）
      return res.status(400).json({ error: err.message || 'Invalid file.' });
    }

    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided. Field name must be "file".' });

      // 桶选择：仅 tax 走私有桶，其余（含默认）走公开桶。
      const isTax      = req.query.bucket === 'tax';
      const bucketName = isTax ? 'tax-docs' : 'uploads';

      // 扩展名从 MIME 反查（不信任用户提供的原始文件名，避免路径/双扩展名等注入面）。
      const ext = ALLOWED_MIME[req.file.mimetype];
      // 路径按用户分目录 + 随机 UUID，天然防重名、防用户之间互相覆盖。
      const path = `${req.user.userId}/${crypto.randomUUID()}.${ext}`;

      const supabase = getClient();
      const { error: upErr } = await supabase.storage
        .from(bucketName)
        .upload(path, req.file.buffer, { contentType: req.file.mimetype });
      if (upErr) throw upErr;

      // 私有桶：只回路径，绝不回公开 URL（读取走签名 URL）。
      if (isTax) return res.json({ status: 'ok', path });

      // 公开桶：拼出可直接访问的公开 URL 一并返回，前端拿去直接填表单/预览。
      const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
      res.json({ status: 'ok', url, path });
    } catch (e) {
      // 真实错误进日志（供 Sentry/运维排查），客户端只收到通用文案。
      console.error('[uploads]', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });
});

module.exports = router;
