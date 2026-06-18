const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');
const { createNotification } = require('../services/notificationService');

// ── Get thread for a demand ───────────────────────────────────────────────────
router.get('/thread/:demandId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // ── 归属校验：必须在任何消息读取 / markRead 写入之前 ─────────────────────
    // 防 IDOR：原代码只校验登录、且 select 引用了 demands 上不存在的列
    //（user_id / assigned_engineer_id）以及无外键的嵌套 talents(contact)，
    // 既会报 relationship 错误，也让任意登录用户能读他人项目的聊天记录。
    // 改用统一助手：雇主 / 参与工程师 / admin 才放行，否则 404（不存在）或 403（非当事方）。
    const { allowed, demand } = await assertDemandParticipant(supabase, req.params.demandId, req.user);
    if (!demand) return res.status(404).json({ error: 'Demand not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    // 标题用于前端展示：助手只取了 id/employer_id，这里单独补查 title。
    const { data: demandMeta } = await supabase
      .from('demands')
      .select('id, title')
      .eq('id', req.params.demandId)
      .single();

    // Fetch messages
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .eq('demand_id', req.params.demandId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 仅当显式带 ?markRead=1 时才标记已读，普通轮询只读不写，避免每次轮询都触发 UPDATE
    if (req.query.markRead === '1') {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('demand_id', req.params.demandId)
        .neq('sender_email', req.user.email)
        .eq('read', false);
    }

    res.json({ status: 'ok', demand: { id: demandMeta?.id ?? demand.id, title: demandMeta?.title || '' }, data: msgs || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[messages]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
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

    // ── 归属校验：与"读消息"是同一孪生漏洞 ────────────────────────────────────
    // 不校验写侧的当事方，任意登录用户可向他人项目的消息线程写入消息（骚扰/钓鱼），
    // 也会让 inbox 里出现非当事方的消息，破坏消息可见性模型。
    const { allowed } = await assertDemandParticipant(supabase, demand_id, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

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
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[messages]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[messages]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
