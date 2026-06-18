const express = require('express');
const router  = express.Router();
const { getClient }   = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/notifications — list latest 20 for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', req.user.email)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[notifications]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', req.user.email)
      .eq('read', false);
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[notifications]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    await supabase.from('notifications').update({ read: true }).eq('user_email', req.user.email).eq('read', false);
    res.json({ ok: true });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[notifications]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    await supabase.from('notifications').update({ read: true })
      .eq('id', req.params.id).eq('user_email', req.user.email);
    res.json({ ok: true });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[notifications]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
