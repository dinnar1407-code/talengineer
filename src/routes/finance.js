const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');

// ── Ledger: get financial records for current user ────────────────────────────
router.get('/ledger', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const supabase = getClient();

    // 防 PostgREST 过滤注入（审计 P3）：.or() 是把 email 直接拼进过滤 DSL 字符串，
    // 若 email 含 , ( ) " 或空白等 DSL 元字符就能改写过滤逻辑、越权读他人账本。
    // 上游注册虽有 zod email 校验，但账本归属是资金数据的唯一作用域，这里再设一道闸：
    // 只放行不含 DSL 元字符的常规邮箱，异常值直接 400（正常用户不可能触发）。
    if (!/^[^,()"\s]+@[^,()"\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid account email.' });
    }

    const { data, error } = await supabase
      .from('financial_ledgers')
      .select('*')
      .or(`employer_email.eq.${email},engineer_email.eq.${email}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[Finance] Ledger error:', err);
    res.status(500).json({ error: 'Failed to load ledger.' });
  }
});

// ── Milestones: get milestones for a demand ───────────────────────────────────
router.get('/milestones', requireAuth, async (req, res) => {
  try {
    const { demand_id } = req.query;
    const supabase = getClient();

    if (!demand_id) {
      return res.status(400).json({ error: 'demand_id is required' });
    }

    // ── 归属校验：里程碑含金额/托管信息，只有当事方能看 ──────────────────────
    // 防 IDOR：原代码任意登录用户改 demand_id 就能读他人项目的里程碑金额。
    // 允许该 demand 的雇主、或对其申请过/被指派的工程师、或 admin；其余 403。
    const { allowed, demand } = await assertDemandParticipant(supabase, demand_id, req.user);
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('demand_id', demand_id)
      .order('percentage', { ascending: true });

    if (error) throw error;

    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[Finance] Milestones error:', err);
    res.status(500).json({ error: 'Failed to load milestones.' });
  }
});

module.exports = router;
