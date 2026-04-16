const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');

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

    // Notify the other party (fire-and-forget, don't block response)
    ;(async () => {
      try {
        const { data: demand } = await supabase
          .from('demands')
          .select('title, contact, assigned_engineer_id')
          .eq('id', demand_id)
          .single();
        if (!demand) return;

        let recipientEmail;
        if (req.user.role === 'employer') {
          // Notify the assigned engineer
          if (demand.assigned_engineer_id) {
            const { data: eng } = await supabase
              .from('talents')
              .select('contact')
              .eq('id', demand.assigned_engineer_id)
              .single();
            recipientEmail = eng?.contact;
          }
        } else {
          // Notify the employer
          recipientEmail = demand.contact;
        }

        if (recipientEmail && recipientEmail !== req.user.email) {
          createNotification({
            user_email: recipientEmail,
            type: 'new_message',
            title: `New message on "${demand.title}"`,
            body: content.trim().slice(0, 120),
            link: `/messages/${demand_id}`,
            demand_id: parseInt(demand_id),
          });
        }
      } catch {}
    })();

    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Inbox: list all threads for current user ──────────────────────────────────
router.get('/inbox', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // Collect demand_ids where user sent a message
    const { data: sent } = await supabase
      .from('messages')
      .select('demand_id')
      .eq('sender_email', req.user.email);

    const demandIdSet = new Set((sent || []).map(m => m.demand_id));

    // For employers: include all demands they own (even if engineer messaged first)
    if (req.user.role === 'employer') {
      const { data: owned } = await supabase
        .from('demands')
        .select('id')
        .eq('contact', req.user.email);
      (owned || []).forEach(d => demandIdSet.add(d.id));
    }

    // For engineers: include demands where they're the assigned engineer (employer may have messaged first)
    if (req.user.role === 'engineer') {
      const { data: talent } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      if (talent) {
        const { data: assigned } = await supabase
          .from('demands')
          .select('id')
          .eq('assigned_engineer_id', talent.id);
        (assigned || []).forEach(d => demandIdSet.add(d.id));
      }
    }

    const demandIds = [...demandIdSet];
    if (!demandIds.length) return res.json({ status: 'ok', data: [] });

    // Get demand metadata
    const { data: demands } = await supabase
      .from('demands')
      .select('id, title, status, region')
      .in('id', demandIds);

    // For each demand, fetch latest message + unread count
    const threads = await Promise.all((demands || []).map(async demand => {
      const [{ data: latest }, { count: unread }] = await Promise.all([
        supabase.from('messages')
          .select('content, sender_name, created_at')
          .eq('demand_id', demand.id)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase.from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('demand_id', demand.id)
          .eq('read', false)
          .neq('sender_email', req.user.email),
      ]);
      const last = latest?.[0];
      return {
        demand_id: demand.id,
        title:     demand.title,
        status:    demand.status,
        region:    demand.region,
        last_message:      last?.content || '',
        last_message_time: last?.created_at || null,
        last_sender:       last?.sender_name || '',
        unread_count:      unread || 0,
      };
    }));

    threads.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
    res.json({ status: 'ok', data: threads });
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
