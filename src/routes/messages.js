const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');
const { sendMessage, MessageError } = require('../services/messageService');

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
// 全部逻辑（归属校验 → 邮件防轰炸判定 → 落库 → 异步通知）都在 services/messageService.js，
// 与 agent 的 send_project_message 工具共用同一份实现——防轰炸那段一旦分叉成两份，
// 其中一份把统计写到插入之后就会永久停发邮件且不报错（详见该文件头注释）。
// 本路由只负责 HTTP 层：解析 body、把服务层错误按 code 映射成既有状态码与文案。
router.post('/', requireAuth, async (req, res) => {
  try {
    const { demand_id, content, client_msg_id } = req.body;

    const result = await sendMessage({
      supabase:    getClient(),
      user:        req.user,
      demandId:    demand_id,
      content,
      clientMsgId: client_msg_id,
    });

    // 离线重放命中唯一约束：静默幂等返回，不当作错误（响应形状与重构前一致）
    if (result.deduped) return res.json({ ok: true, deduped: true });

    res.json({ status: 'ok', data: result.message });
  } catch (err) {
    // 只按 code 分派、不透传服务层文案：路由的响应体是既有对外契约，
    // 服务层文案是给 agent/模型看的人话，两者刻意解耦（见 messageService 的错误契约注释）。
    if (err instanceof MessageError) {
      if (err.code === 'invalid_input') return res.status(400).json({ error: 'demand_id and content are required' });
      if (err.code === 'too_long')      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
      if (err.code === 'forbidden')     return res.status(403).json({ error: 'Forbidden' });
      // db_error：真实的 supabase 错误已由服务层记进日志，这里直接落到通用 500
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
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
