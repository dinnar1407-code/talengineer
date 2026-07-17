const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// ── W-9 税务文件采集（"先收表申报、后置人工核验"）────────────────────────────────
// 文件本体已由 /api/uploads?bucket=tax 上传到私有桶 tax-docs，前端拿到 storage_path 后调此处登记。
// 表 tax_documents（迁移 019）：doc_type='w9'，status submitted|received|rejected。
// RLS 对该表 deny-all，一切读写走服务端 service key（getClient）；敏感内容只以短时签名 URL 呈现给管理员。

// ── POST /api/tax/w9：工程师提交 W-9 登记 ─────────────────────────────────────
router.post('/w9', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { storage_path } = req.body;
    if (!storage_path) return res.status(400).json({ error: 'Missing storage_path' });

    // 防重复提交：同一用户已有 submitted/received 的 w9，就不再收新的（rejected 允许重交）。
    const { data: existing } = await supabase
      .from('tax_documents')
      .select('id, status')
      .eq('user_id', req.user.userId)
      .eq('doc_type', 'w9')
      .in('status', ['submitted', 'received']);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a W-9. It is under review.' });
    }

    // talent_id 反查（可空）：非工程师身份也允许提交税表，故用 maybeSingle 容忍无档案。
    const { data: talent } = await supabase
      .from('talents').select('id').eq('user_id', req.user.userId).maybeSingle();

    const { data, error } = await supabase.from('tax_documents').insert({
      user_id:      req.user.userId,
      talent_id:    talent?.id || null,
      doc_type:     'w9',
      storage_path,
      status:       'submitted',
    }).select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[tax:w9]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/tax/my：本人已提交的税务文件（不含他人数据）──────────────────────
router.get('/my', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('tax_documents')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[tax:my]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/tax/admin/list?status=submitted：管理员待办列表 ────────────────────
// tax_documents.user_id 未声明到 users 的外键，无法用 PostgREST 内嵌 join，故先查文档、
// 再按 user_id 批量取 users 的 email/name 在内存合并，回填成 users:{email,name} 与全站内嵌形状一致。
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const statusFilter = req.query.status || 'submitted';

    const { data: docs, error } = await supabase
      .from('tax_documents')
      .select('*')
      .eq('status', statusFilter)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const userIds = [...new Set((docs || []).map(d => d.user_id).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email, name').in('id', userIds);
      userMap = Object.fromEntries((users || []).map(u => [u.id, { email: u.email, name: u.name }]));
    }
    const rows = (docs || []).map(d => ({ ...d, users: userMap[d.user_id] || null }));
    res.json({ status: 'ok', data: rows });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[tax:admin:list]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /api/tax/admin/:id/review：管理员标记已收讫 / 退回 ────────────────────
router.post('/admin/:id/review', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { action, note } = req.body;
    if (!['received', 'rejected'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

    const { data, error } = await supabase
      .from('tax_documents')
      .update({ status: action, note: note || null, reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[tax:admin:review]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/tax/admin/:id/url：为私有桶文件签发 5 分钟短时签名 URL ─────────────
router.get('/admin/:id/url', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: doc, error: lookupErr } = await supabase
      .from('tax_documents').select('storage_path').eq('id', req.params.id).maybeSingle();
    if (lookupErr) throw lookupErr;
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { data, error } = await supabase.storage.from('tax-docs').createSignedUrl(doc.storage_path, 300);
    if (error) throw error;
    res.json({ status: 'ok', url: data.signedUrl });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[tax:admin:url]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
