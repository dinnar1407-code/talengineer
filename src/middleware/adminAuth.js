const crypto = require('crypto');

// Simple admin password guard (set ADMIN_PASSWORD in Railway env vars)
// 平台管理员口令中间件：供 admin / certifications / disputes 等路由共享，避免各处重复实现弱比较
function requireAdmin(req, res, next) {
  const adminPwd = process.env.ADMIN_PASSWORD;
  // 未配置口令时 fail-closed：直接 503 拒绝，绝不放行
  if (!adminPwd) return res.status(503).json({ error: 'Admin not configured.' });
  // 只接受 header 传口令，禁止 query：URL 中的口令会进访问日志/浏览器历史/Referer，极易泄露
  const provided = req.headers['x-admin-password'];
  if (typeof provided !== 'string' || provided.length === 0) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  // 先各自做 SHA-256 再 timingSafeEqual 恒时比较：防时序侧信道，且摘要等长不会因长度不同抛异常
  const providedHash = crypto.createHash('sha256').update(provided).digest();
  const expectedHash = crypto.createHash('sha256').update(adminPwd).digest();
  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

module.exports = { requireAdmin };
