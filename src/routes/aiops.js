// ── AI Ops 路由（Phase 4 闭环）：周报触发 + 人审看板接口 ─────────────────────────
// 挂载点：/api/aiops（由 src/app.js 统一挂载）。三个端点：
//   POST /run-weekly       —— GH Actions 周一 cron 打的触发器（ai-weekly.yml）。
//                             鉴权走独立的 AIOPS_CRON_SECRET（不是 admin 口令）：
//                             cron 只该有「触发分析」这一个能力，不该拿 admin 全量权限。
//   GET  /reports          —— admin 人审看板列表（分页）。
//   PUT  /reports/:id      —— admin 复核裁决（reviewed/dismissed），落审计行。
// Level 1 纪律：本路由只读写 ai_improvement_reports 一张表，报告永远 draft 起步、
// 人审终局；没有任何端点会把假设「应用」到配置——那条代码路径在本仓库不存在。
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { z } = require('zod');
const { getClient } = require('../config/db');
const { requireAdmin } = require('../middleware/adminAuth');
const { clampPagination } = require('../utils/pagination');
const { runWeekly } = require('../services/aiAnalysisService');

// ── admin 写操作审计中间件（同型照抄 src/routes/admin.js 的 auditLog——它未导出，
// 且 admin.js 不在本批可改清单里，故本地落一份同形状实现）─────────────────────────
// 挂在 requireAdmin 之后：req.adminEmail / req.adminAuthMethod 已就绪。
// fire-and-forget：不 await、不阻塞主流程；只记 body 键名不记值（防敏感值入审计表）。
function auditLog(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const supabase = getClient();
    if (supabase) {
      supabase.from('admin_audit_logs').insert({
        admin_email: req.adminEmail || null,
        auth_method: req.adminAuthMethod || null,
        action: `${req.method} ${req.baseUrl}${req.path}`,
        target: req.params?.id || null,
        meta: { bodyKeys: Object.keys(req.body || {}) },
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      }).then(() => {}, (e) => console.error('[aiops:audit]', e));
    }
  }
  next();
}

// ── cron 鉴权：Bearer AIOPS_CRON_SECRET，恒时比较 ────────────────────────────────
// 为什么先各自 SHA-256 再 timingSafeEqual（照 adminAuth.js 口令通道 / newsletter.js
// verifySig 的恒时比较纪律，不许 ===）：timingSafeEqual 要求等长 Buffer，先取摘要
// 保证恒等长，长度差异既不会抛异常也不会泄露长度信息。
// env 未配置 → 503 fail-closed（照 webhook 纪律）：宁可 cron 失败告警，也不能裸奔。
// 注意：process.env 在【请求时】读取而非模块加载时——Railway 改环境变量后重启即生效，
// 测试也能逐用例改写。
function verifyCronAuth(req, res) {
  const secret = process.env.AIOPS_CRON_SECRET;
  if (!secret) {
    res.status(503).json({ error: 'Service not configured' });
    return false;
  }
  const header = req.headers.authorization || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!provided) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const providedHash = crypto.createHash('sha256').update(provided).digest();
  const expectedHash = crypto.createHash('sha256').update(secret).digest();
  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ── POST /api/aiops/run-weekly：跑一次周度分析（GH Actions cron 专用）────────────
router.post('/run-weekly', async (req, res) => {
  try {
    if (!verifyCronAuth(req, res)) return; // 失败分支已由 verifyCronAuth 写响应
    const report = await runWeekly();
    // 返回完整报告行：cron 日志里能直接看到本周 stats 概况，便于排查
    res.json({ status: 'ok', data: report });
  } catch (err) {
    console.error('[aiops:run-weekly]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/aiops/reports?page=&limit=&status=：人审看板列表（admin）────────────
router.get('/reports', requireAdmin, async (req, res) => {
  try {
    const { pageNum, pageSize, from, to } = clampPagination(req.query.page, req.query.limit);
    const supabase = getClient();
    let query = supabase
      .from('ai_improvement_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    // status 过滤：只认三个合法值，非法值宽松忽略（返回全部，避免前端笔误得空列表）
    if (['draft', 'reviewed', 'dismissed'].includes(req.query.status)) {
      query = query.eq('status', req.query.status);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({
      status: 'ok',
      data: { reports: data || [], total: count || 0, page: pageNum, limit: pageSize },
    });
  } catch (err) {
    console.error('[aiops:reports]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// 复核裁决入参：只接受两个终局状态；.strip() 丢弃未知字段（房规）。
// 不允许改回 draft——人审是单向门，误判就 dismissed 后重跑周报，不走回头路。
const reviewSchema = z.object({
  status: z.enum(['reviewed', 'dismissed']),
}).strip();

// ── PUT /api/aiops/reports/:id：人审裁决（admin + 审计）─────────────────────────
router.put('/reports/:id', requireAdmin, auditLog, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid report id' });
    }
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "status must be 'reviewed' or 'dismissed'" });
    }
    const supabase = getClient();
    // 用 .select() 而非 .single() 收尾：id 不存在时 data 为空数组走 404，
    // 而 .single() 会把「0 行」当错误抛，与真实 DB 故障混在一起分不清。
    const { data, error } = await supabase
      .from('ai_improvement_reports')
      .update({
        status: parsed.data.status,
        reviewed_by: req.adminEmail || null, // requireAdmin 挂上的身份（jwt-2fa 邮箱或 shared-password）
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ status: 'ok', data: data[0] });
  } catch (err) {
    console.error('[aiops:review]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
