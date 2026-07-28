const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');

// ── Ledger: get financial records for current user ────────────────────────────
// 数据源 = project_milestones（真正的资金系统之实：payment/workorder/disputes 都读写它）。
// 旧实现查的是 financial_ledgers——那张表永远是 0 行（没有任何代码成功往里写过），
// 所以本接口过去恒返回空数组，前端一直落在 DEMO_LEDGER 兜底上，看起来"只是还没数据"。
// 一旦真钱开始流动，指向错表就会让用户永远看不到自己的真实交易，故整条改写。
//
// 作用域一律服务端解析（req.user.userId / req.user.role），绝不接受客户端传来的
// email / demand_id 之类参数——账本是资金数据，越权读一次就是事故。
// 顺带：旧版为防 .or() 过滤 DSL 注入而设的邮箱正则闸已随 .or() 一起删除——
// 现在过滤条件全部是服务端自己查出来的整型 id，没有任何用户可控字符串进过滤器，
// 那道闸已无保护对象，留着只会误导后来人以为这里仍有注入面。
router.get('/ledger', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { userId, role } = req.user;

    // 1) 先算出"属于本人的项目 id 集合"，两种角色两条路径
    let demandIds = [];
    if (role === 'employer') {
      // 雇主：demands.employer_id 直接就是 users.id
      const { data, error } = await supabase
        .from('demands')
        .select('id')
        .eq('employer_id', userId);
      if (error) throw error;
      demandIds = (data || []).map((d) => d.id);
    } else {
      // 工程师：要走两跳——users.id → talents.id → demands.assigned_engineer_id
      // （demands.assigned_engineer_id 外键指向 talents.id，不是 users.id，别少跳一步）。
      // 没有 talents 档案的账号（含 admin——admin 不是任何一笔资金的当事方）自然拿到空集合。
      const { data: talent, error: talentErr } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (talentErr) throw talentErr;
      if (talent) {
        const { data, error } = await supabase
          .from('demands')
          .select('id')
          .eq('assigned_engineer_id', talent.id);
        if (error) throw error;
        demandIds = (data || []).map((d) => d.id);
      }
    }

    // 2) 一个项目都没有 → 直接空数组返回。别拿空数组去 .in()（PostgREST 语义边界不必试探），
    //    前端对空数组已有正确的空态处理。
    if (demandIds.length === 0) {
      return res.json({ status: 'ok', data: [] });
    }

    // 3) 取这些项目下的全部里程碑。嵌套 embed 走的是真实外键：
    //    project_milestones.demand_id → demands.id，demands.assigned_engineer_id → talents.id，
    //    两条都是库里唯一的一条外键，不存在歧义，一次查询就能带出项目名与双方邮箱。
    const { data, error } = await supabase
      .from('project_milestones')
      .select('id, demand_id, amount, status, created_at, demands(title, contact, talents(contact))')
      .in('demand_id', demandIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 4) 映射成前端 pages/finance.jsx 期望的行结构（字段名保持不变，前端零改动）。
    //    status 直接透传 project_milestones 的真实状态词汇
    //    （locked/funded/releasing/completed/released/payment_failed/disputed），
    //    不做任何状态改写——账本上的状态必须与资金机器里的状态一字不差。
    const rows = (data || []).map((m) => ({
      id: m.id,
      demand_id: m.demand_id,
      project_title: m.demands?.title || null,
      employer_email: m.demands?.contact || null,
      engineer_email: m.demands?.talents?.contact || null,
      total_amount: m.amount,
      status: m.status,
      created_at: m.created_at,
    }));

    res.json({ status: 'ok', data: rows });
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
