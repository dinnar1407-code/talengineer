// ── Newsletter 订阅路由（公开，无需登录）───────────────────────────────────────
// PMF 增长基建：成本计算器 / playbook / footer 等入口收集邮箱，落库 newsletter_subscribers。
// 全局 /api/ 速率限制（app.js）已覆盖本路由，这里不再重复做限流。
// 退订用无状态 HMAC 签名（不建带状态的 token 表）：sig = HMAC-SHA256(email, JWT_SECRET)。
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { z }   = require('zod');
const { getClient } = require('../config/db');

// 模块加载时读取密钥（与 middleware/auth.js 同样的时机口径）。生产环境恒有 JWT_SECRET。
const JWT_SECRET = process.env.JWT_SECRET || '';

// 订阅入参校验：email 必须合法、source 限定三个已知入口、lang 可选。
// .strip() 丢弃未知字段而非报错，兼容前端多传字段。
const subscribeSchema = z.object({
  email:  z.string().email('Invalid email address'),
  source: z.enum(['calculator', 'playbook', 'footer']),
  lang:   z.string().max(8).optional(),
}).strip();

/**
 * 生成退订签名：HMAC-SHA256(email, JWT_SECRET) 的十六进制。
 * 无状态——不落库任何 token，退订链接自带签名即可验真。
 * @param {string} email 订阅邮箱（调用方应传已规范化的小写邮箱）
 * @returns {string} hex 签名
 */
function unsubscribeSig(email) {
  return crypto.createHmac('sha256', JWT_SECRET).update(String(email)).digest('hex');
}

/**
 * 校验退订签名。用 timingSafeEqual 做定长时序安全比较，避免签名比对的计时侧信道。
 * 长度不等或非字符串直接判否（timingSafeEqual 要求等长 Buffer）。
 * @param {string} email 订阅邮箱
 * @param {string} sig   待校验的 hex 签名
 * @returns {boolean}
 */
function verifySig(email, sig) {
  if (!sig || typeof sig !== 'string') return false;
  const expected = unsubscribeSig(email);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(sig, 'utf8');
  if (a.length !== b.length) return false;   // 定长比较前置：长度不同必然不匹配
  return crypto.timingSafeEqual(a, b);
}

// POST /subscribe —— 落库一条订阅；邮箱唯一冲突（23505）幂等返回。
router.post('/subscribe', async (req, res) => {
  try {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'A valid email and source are required.' });
    }
    const { email, source, lang } = parsed.data;
    const supabase = getClient();

    // email 统一小写落库：与退订查询口径一致，避免大小写导致查不到同一条。
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase(), source, lang: lang || null });

    if (error) {
      // 23505 = Postgres unique_violation：邮箱已订阅，幂等成功（不报错、不重复插）。
      if (error.code === '23505') return res.json({ ok: true, already: true });
      throw error;
    }
    res.json({ ok: true });
  } catch (err) {
    // 完整错误进日志（供 Sentry/排查），只回通用文案，避免泄露数据库内部细节。
    console.error('[newsletter]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /unsubscribe?email=&sig= —— 验签通过则置 unsubscribed_at=now()，返回纯文本确认。
router.get('/unsubscribe', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase();
    const sig   = String(req.query.sig || '');

    // 验签失败（含缺参、伪造签名）：403，不透露该邮箱是否存在。
    if (!email || !verifySig(email, sig)) {
      return res.status(403).type('text/plain').send('Invalid or expired unsubscribe link.');
    }

    const supabase = getClient();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email);
    if (error) throw error;

    res.type('text/plain').send('You have been unsubscribed. 你已成功退订。');
  } catch (err) {
    console.error('[newsletter]', err);
    res.status(500).type('text/plain').send('Something went wrong. Please try again.');
  }
});

module.exports = router;
// 导出纯逻辑函数供单元测试（不连库）：签名生成/校验、入参 schema。
module.exports.subscribeSchema = subscribeSchema;
module.exports.unsubscribeSig  = unsubscribeSig;
module.exports.verifySig       = verifySig;
