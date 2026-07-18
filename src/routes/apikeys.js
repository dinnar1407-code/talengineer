const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Middleware: verify API key (for enterprise endpoints) ─────────────────────
async function requireApiKey(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer TE_')) return res.status(401).json({ error: 'Missing or invalid API key. Keys must start with TE_' });

  const rawKey = auth.slice(7);
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const supabase = getClient();

  const { data: apiKey } = await supabase.from('api_keys').select('id, user_id, active').eq('key_hash', keyHash).single();
  if (!apiKey || !apiKey.active) return res.status(401).json({ error: 'Invalid or revoked API key.' });

  await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('id', apiKey.id);
  req.apiKeyUserId = apiKey.user_id;
  next();
}

module.exports.requireApiKey = requireApiKey;

// ── Generate API key ──────────────────────────────────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    // API Key（企业 API 接入）仅对 employer/企业账号与 admin 开放。
    // 普通工程师 / 个人用户不发放 API 权限——他们用不到，且发了会扩大攻击面。
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'API keys are only available for employer/enterprise accounts.' });
    }

    const supabase = getClient();
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing key name' });

    // Limit: 5 active keys per user
    const { count } = await supabase.from('api_keys').select('id', { count: 'exact' }).eq('user_id', req.user.userId).eq('active', true);
    if (count >= 5) return res.status(400).json({ error: 'Maximum 5 active API keys per account.' });

    const rawKey  = 'TE_' + crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 16) + '…';

    const { data, error } = await supabase.from('api_keys').insert({
      user_id: req.user.userId, name, key_hash: keyHash, key_prefix: keyPrefix,
    }).select().single();

    if (error) throw error;

    // Return raw key ONCE — never stored in plaintext
    res.json({ status: 'ok', key: rawKey, key_prefix: keyPrefix, id: data.id, name, message: 'Save this key now — it will not be shown again.' });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[apikeys]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── List API keys (masked) ────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    // 列表补 webhook_url，供前端显示"该 key 是否已配 webhook / 配到哪"；
    // 绝不返回 webhook_secret（签名密钥，仅在 PUT /:id/webhook 生成时明文返回一次）。
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, last_used, active, created_at, webhook_url')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[apikeys]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Revoke API key ────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    await supabase.from('api_keys').update({ active: false }).eq('id', req.params.id).eq('user_id', req.user.userId);
    res.json({ status: 'ok' });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[apikeys]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Configure webhook for an API key ──────────────────────────────────────────
// 企业客户为自己的某个 key 配置 webhook 接收地址；服务端生成 webhook_secret（签名密钥）。
// 语义与生成 API key 一致：webhook_secret 明文【仅本次响应返回一次】，之后只存不返回，
// 客户端须立即保存用于验签（HMAC-SHA256，见 webhookService.js / /developers 文档）。
router.put('/:id/webhook', requireAuth, async (req, res) => {
  try {
    const { webhook_url } = req.body;

    // 校验 URL 合法且为 http(s)：避免存进无法请求的垃圾值，或 file:/gopher: 等非 HTTP 协议。
    let parsedUrl;
    try { parsedUrl = new URL(webhook_url); }
    catch { return res.status(400).json({ error: 'Invalid webhook_url. Must be a valid URL.' }); }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'webhook_url must use http or https.' });
    }

    const supabase = getClient();
    // 生成签名密钥（32 字节 → 64 位十六进制）。
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // 只能改自己的 key：user_id 过滤 + .single()；影响 0 行时返回 404（既做归属校验又防 IDOR）。
    const { data, error } = await supabase
      .from('api_keys')
      .update({ webhook_url: parsedUrl.toString(), webhook_secret: webhookSecret })
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .select('id, name, webhook_url')
      .single();
    if (error || !data) return res.status(404).json({ error: 'API key not found.' });

    // webhook_secret 明文仅此一次返回；此后任何接口都不再回传。
    res.json({
      status: 'ok',
      id: data.id,
      webhook_url: data.webhook_url,
      webhook_secret: webhookSecret,
      message: 'Save this webhook secret now — it will not be shown again.',
    });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案。
    console.error('[apikeys]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports.router = router;
