const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Get thread for a demand ───────────────────────────────────────────────────
router.get('/thread/:demandId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // Verify user is party to this demand (employer or assigned engineer)
    const { data: demand } = await supabase
      .from('demands')
      .select('id, title, user_id, assigned_engineer_id, users(email), talents(contact)')
      .eq('id', req.params.demandId)
      .single();

    if (!demand) return res.status(404).json({ error: 'Demand not found' });

    // Fetch messages
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .eq('demand_id', req.params.demandId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark unread messages as read for this user
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('demand_id', req.params.demandId)
      .neq('sender_email', req.user.email)
      .eq('read', false);

    res.json({ status: 'ok', demand: { id: demand.id, title: demand.title }, data: msgs || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Send message ──────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, content } = req.body;

    if (!demand_id || !content?.trim()) {
      return res.status(400).json({ error: 'demand_id and content are required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }

    const { data, error } = await supabase.from('messages').insert({
      demand_id,
      sender_email: req.user.email,
      sender_name:  req.user.name || req.user.email.split('@')[0],
      sender_role:  req.user.role,
      content:      content.trim(),
    }).select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Unread count for current user ─────────────────────────────────────────────
router.get('/unread', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .neq('sender_email', req.user.email)
      .eq('read', false);
    res.json({ status: 'ok', count: count || 0 });
  } catch {
    res.json({ status: 'ok', count: 0 });
  }
});

module.exports = router;
