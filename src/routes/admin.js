const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
// 管理员口令校验已提炼为共享中间件（已移除 query.pwd 通道，仅接受 header：SHA-256 恒时比较 + 未配置 503 fail-closed）
const { requireAdmin } = require('../middleware/adminAuth');
const { PLATFORM_FEE } = require('../config/fees'); // 抽佣比例单一来源（营收估算与真实放款用同一费率）

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const [users, demands, talents, ledgers, notifCount] = await Promise.all([
      supabase.from('users').select('id, email, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('demands').select('id, title, status, budget, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('talents').select('id, name, region, verified_score, created_at', { count: 'exact' }).order('verified_score', { ascending: false }).limit(10),
      supabase.from('ledgers').select('id, demand_id, total_amount, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
    ]);

    // 费率取自集中配置（审计残留修复：此前硬编码 0.15，Railway 调 PLATFORM_FEE_PCT 后这里会漂移）
    const totalRevenue = (ledgers.data || [])
      .filter(l => l.status === 'released')
      .reduce((s, l) => s + (l.total_amount || 0) * PLATFORM_FEE, 0);

    res.json({
      status: 'ok',
      counts: {
        users:         users.count   || 0,
        demands:       demands.count || 0,
        talents:       talents.count || 0,
        ledgers:       ledgers.count || 0,
        notifications: notifCount.count || 0,
      },
      revenue: totalRevenue,
      recent: {
        users:   users.data   || [],
        demands: demands.data || [],
        talents: talents.data || [],
        ledgers: ledgers.data || [],
      },
    });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/admin/notifications
router.get('/notifications', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    // Count by type
    const byType = (data || []).reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    const unreadCount = (data || []).filter(n => !n.read).length;

    res.json({ status: 'ok', data: data || [], byType, unreadCount });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── KYC: list pending verifications ──────────────────────────────────────────
router.get('/kyc', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const status = req.query.status || 'pending';
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, company_name, company_website, company_phone, kyc_status, kyc_submitted_at, kyc_note')
      .eq('kyc_status', status)
      .order('kyc_submitted_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── KYC: approve or reject ────────────────────────────────────────────────────
router.put('/kyc/:userId', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { decision, note } = req.body; // decision: 'verified' | 'rejected'
    if (!['verified', 'rejected'].includes(decision)) return res.status(400).json({ error: 'decision must be verified or rejected' });

    const { error } = await supabase
      .from('users')
      .update({ kyc_status: decision, kyc_note: note || null, kyc_reviewed_at: new Date().toISOString() })
      .eq('id', req.params.userId);

    if (error) throw error;
    res.json({ status: 'ok', message: `User ${decision}.` });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Analytics: platform conversion funnel ────────────────────────────────────
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();

    const [
      { count: totalDemands },
      { count: openDemands },
      { count: inProgressDemands },
      { count: completedDemands },
      { count: totalApplications },
      { count: pendingKyc },
      { data: demandOwners },
      { count: totalDisputes },
      { data: reviewRows },
      { data: talentScores },
    ] = await Promise.all([
      supabase.from('demands').select('id', { count: 'exact', head: true }),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('demand_applications').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
      // ── PMF 验证指标的数据源（设计文档"七、如何验证"：复购/纠纷率/口碑）──
      // 表当前都是小数据量，拉回 Node 里聚合即可；量级上来后再下推 SQL。
      supabase.from('demands').select('employer_id').limit(1000),
      supabase.from('disputes').select('id', { count: 'exact', head: true }),
      supabase.from('engineer_reviews').select('rating').limit(1000),
      supabase.from('talents').select('verified_score').limit(1000),
    ]);

    const assignedDemands = (inProgressDemands || 0) + (completedDemands || 0);
    const conversionRate  = totalDemands ? ((assignedDemands / totalDemands) * 100).toFixed(1) : '0';

    // ── PMF 指标（路径 A 判定信号）────────────────────────────────────────────
    // 复购雇主：发过 ≥2 单的雇主数——"愿付溢价且复购"是 A 成立进阶段二的核心判据。
    const ownerCounts = {};
    (demandOwners || []).forEach((d) => {
      if (d.employer_id != null) ownerCounts[d.employer_id] = (ownerCounts[d.employer_id] || 0) + 1;
    });
    const uniqueEmployers = Object.keys(ownerCounts).length;
    const repeatEmployers = Object.values(ownerCounts).filter((n) => n >= 2).length;

    // 纠纷率：纠纷数 / 已成交需求数（交付质量的反向指标）。
    const disputeRate = assignedDemands ? (((totalDisputes || 0) / assignedDemands) * 100).toFixed(1) : '0';

    // 口碑：全部评价的平均分（交付质量的正向指标）。
    const ratings = (reviewRows || []).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
    const avgRating = ratings.length ? (ratings.reduce((s, n) => s + n, 0) / ratings.length).toFixed(2) : null;

    // 筛选分覆盖率：分数 >0 的工程师占比——决定何时可以拧开入网门槛（MIN_POOL_VERIFIED_SCORE）。
    const scores = talentScores || [];
    const scoredTalents = scores.filter((t) => (t.verified_score || 0) > 0).length;

    res.json({
      status: 'ok',
      funnel: {
        posted:         totalDemands      || 0,
        open:           openDemands       || 0,
        applied:        null, // demands with ≥1 application — expensive query, skip
        assigned:       assignedDemands,
        completed:      completedDemands  || 0,
        total_applies:  totalApplications || 0,
        conversion_pct: conversionRate,
      },
      pmf: {
        unique_employers:  uniqueEmployers,
        repeat_employers:  repeatEmployers,
        repeat_rate_pct:   uniqueEmployers ? ((repeatEmployers / uniqueEmployers) * 100).toFixed(1) : '0',
        disputes_total:    totalDisputes || 0,
        dispute_rate_pct:  disputeRate,
        avg_rating:        avgRating,
        reviews_total:     ratings.length,
        talents_total:     scores.length,
        talents_scored:    scoredTalents,
      },
      kyc_pending: pendingKyc || 0,
    });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
