// Web Push 订阅路由（PWA 深化）—— 由 pwa-push agent 填充（Task 5）
const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/push/vapid-key — 公开端点。前端订阅推送前先来拿 VAPID 公钥。
// env 未配置时返回 { configured:false }，前端据此静默跳过订阅（不报错、不打扰用户）。
router.get('/vapid-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return res.json({ configured: false });
  res.json({ configured: true, publicKey });
});

// POST /api/push/subscribe — 登录态。按 endpoint upsert 一条订阅记录。
// body = 浏览器 PushManager.subscribe() 返回的 PushSubscription JSON（含 endpoint 与 keys）。
// endpoint 唯一，同一浏览器重复订阅只更新不新增。
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const sub = req.body;
    // endpoint 是订阅的唯一标识，缺失说明不是合法的 PushSubscription
    if (!sub || !sub.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    const supabase = getClient();
    if (!supabase) return res.status(503).json({ error: 'Service unavailable' });
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_email: req.user.email, endpoint: sub.endpoint, subscription: sub },
        { onConflict: 'endpoint' }
      );
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[push] subscribe failed:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// DELETE /api/push/subscribe — 登录态。用户退订时按 endpoint 删除本人订阅。
router.delete('/subscribe', requireAuth, async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    const supabase = getClient();
    if (!supabase) return res.status(503).json({ error: 'Service unavailable' });
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_email', req.user.email);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[push] unsubscribe failed:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
