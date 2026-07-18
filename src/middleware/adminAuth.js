const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// admin 双通道鉴权（账号化过渡期）：
// 通道一（主）：Bearer JWT，要求 role=admin 且 adm2fa=true（TOTP 通过后由 /api/auth/admin-2fa 签发）。
//   命中后挂 req.adminEmail / req.adminAuthMethod='jwt-2fa'，供审计中间件记录"谁、用什么方式"操作。
// 通道二（break-glass 应急）：旧共享口令 x-admin-password —— Terry 验证新通道稳定后另行下令移除。
//   仍沿用"各自 SHA-256 再 timingSafeEqual"的恒时比较：摘要等长不会因长度差异抛异常，且防时序侧信道。
//   口令值只用于比较，绝不记录/打印。
//
// 导出形态：模块本身即中间件函数，同时挂 .requireAdmin 别名——
// 兼容既有各路由 `const { requireAdmin } = require('../middleware/adminAuth')` 的挂载方式，避免连锁改动。
function adminAuth(req, res, next) {
  // ── 通道一：Bearer JWT（账号化 + 2FA 后的主通道）──
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      // 显式锁定 HS256（与 jwt.sign 默认算法一致）：纵深防御，堵住 alg=none / 非对称混淆等攻击
      const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
      // 必须同时满足 admin 角色与 adm2fa 声明：普通登录 JWT（无 adm2fa）不得放行，堵住"拿普通 token 冒充 admin"
      if (payload.role === 'admin' && payload.adm2fa === true) {
        req.adminEmail = payload.email;
        req.adminAuthMethod = 'jwt-2fa';
        return next();
      }
    } catch (e) {
      /* 验签失败/过期：静默落入通道二，不向调用方泄露具体原因 */
    }
  }

  // ── 通道二：共享口令（break-glass 应急，恒时比较）──
  const adminPwd = process.env.ADMIN_PASSWORD;
  const provided = req.headers['x-admin-password'];
  if (adminPwd && typeof provided === 'string' && provided.length > 0) {
    // 先各自 SHA-256 再 timingSafeEqual：摘要等长不会因长度不同抛异常，且防时序侧信道
    const providedHash = crypto.createHash('sha256').update(provided).digest();
    const expectedHash = crypto.createHash('sha256').update(adminPwd).digest();
    if (crypto.timingSafeEqual(providedHash, expectedHash)) {
      req.adminEmail = 'shared-password';
      req.adminAuthMethod = 'shared-password';
      return next();
    }
  }

  return res.status(401).json({ error: 'Admin authentication required' });
}

module.exports = adminAuth;
// 别名：保持既有 `const { requireAdmin } = require(...)` 各路由（admin/tax/disputes/training/pipeline/certifications）不变
module.exports.requireAdmin = adminAuth;
