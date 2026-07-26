// ── Cloudflare Turnstile 真人验证（Wave A / A4）────────────────────────────────
// 为什么要它：限流是「按 IP 计数」，防的是同一个 IP 高频；真人验证防的是「同一个人换 IP」。
// 攻击者花几美元就能买上千个住宅代理 IP，per-IP 限流对批量注册基本无效——两者互补，谁也
// 替代不了谁。本平台的真实敞口是批量注册假账号（污染撮合池、薅推荐奖励、发垃圾消息），
// 不是密码爆破（那个已被 authLimiter 的 30 次失败/15min 挡住）。
//
// 挂载点（见 src/app.js）：register、forgot-password。
// 不挂 OAuth 通道——Google/Microsoft 侧已做过人机验证，再来一遍是折磨用户两遍且无额外收益。
//
// 两条 fail 策略（刻意不同，别"统一"）：
//   - 未配置 secret → fail-OPEN 放行 + 启动告警。否则代码一上线、env 还没配，注册立刻全挂。
//     ⚠️ 代价是没配 key 时这层防护等于不存在，只是占位。配 key 才真正生效。
//   - 已配置 secret 但校验失败/超时/网络错 → fail-CLOSED 拒绝。注册不是秒级关键路径，
//     Cloudflare 抖动期间短暂无法注册可以接受；无限量机器人注册不可接受。
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 5000;

let warnedMissingSecret = false;

/**
 * 校验前端提交的 Turnstile token。
 * @param {string} token 前端 widget 产出的 cf-turnstile-response
 * @param {string} [ip]  客户端 IP（req.ip，app.js 已 set('trust proxy',1)，取到的是真实客户端）
 * @returns {Promise<{ok:boolean, skipped?:boolean, reason?:string}>} 永不抛异常
 */
async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // 未配置：放行但留痕（只告警一次，避免刷屏）
  if (!secret) {
    if (!warnedMissingSecret) {
      console.warn('[Turnstile] TURNSTILE_SECRET_KEY not set — human verification is DISABLED (fail-open).');
      warnedMissingSecret = true;
    }
    return { ok: true, skipped: true };
  }

  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'missing-token' };
  }

  // AbortController 做超时：没有它，Cloudflare 挂起时请求会一直吊着，把注册接口拖死。
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);

    const resp = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error(`[Turnstile] siteverify HTTP ${resp.status}`);
      return { ok: false, reason: 'verify-unavailable' };
    }
    const data = await resp.json();
    if (data.success) return { ok: true };

    // 'error-codes' 是 Cloudflare 的诊断码（timeout-or-duplicate / invalid-input-response 等），
    // 只进日志不回前端——回给前端等于告诉刷子"你哪一步被识破了"。
    console.warn('[Turnstile] verification failed:', data['error-codes']);
    return { ok: false, reason: 'failed' };
  } catch (err) {
    // 超时/网络错：已配 key 就按 fail-closed 处理（见文件头策略说明）
    console.error('[Turnstile] siteverify error:', err?.name === 'AbortError' ? 'timeout' : err);
    return { ok: false, reason: 'verify-unavailable' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Express 中间件：校验 body.turnstile_token，不过则拦下。
 * 放在路由处理器之前，所以被拦的请求永远不会碰到业务逻辑（也就不会发邮件、不会写库）。
 */
function requireTurnstile(req, res, next) {
  verifyTurnstile(req.body?.turnstile_token, req.ip)
    .then((result) => {
      if (result.ok) return next();
      // verify-unavailable 回 503 让用户知道该重试；其余按 403（验证没过）。
      if (result.reason === 'verify-unavailable') {
        return res.status(503).json({ error: 'Verification service is temporarily unavailable. Please try again.' });
      }
      return res.status(403).json({ error: 'Human verification failed. Please refresh the page and try again.' });
    })
    .catch((err) => {
      // verifyTurnstile 内部已全包异常，这里只是不让中间件裸崩
      console.error('[Turnstile] middleware error:', err);
      res.status(503).json({ error: 'Verification service is temporarily unavailable. Please try again.' });
    });
}

module.exports = { verifyTurnstile, requireTurnstile };
