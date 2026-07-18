const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
// 管理员口令校验已提炼为共享中间件（已移除 query.pwd 通道，仅接受 header：SHA-256 恒时比较 + 未配置 503 fail-closed）
const { requireAdmin } = require('../middleware/adminAuth');
const { PLATFORM_FEE } = require('../config/fees'); // 抽佣比例单一来源（营收估算与真实放款用同一费率）

// ── admin 写操作审计中间件 ────────────────────────────────────────────────────
// 挂在 requireAdmin 之后：此时 req.adminEmail / req.adminAuthMethod 已就绪（谁、用哪条通道）。
// 对 POST/PUT/DELETE fire-and-forget 落一条 admin_audit_logs，不 await、不阻塞主流程；写失败仅记日志。
// 只记 body 的键名（bodyKeys）不记值——避免把口令、证据等敏感值写进审计表。
function auditLog(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const supabase = getClient();
    if (supabase) {
      supabase.from('admin_audit_logs').insert({
        admin_email: req.adminEmail || null,
        auth_method: req.adminAuthMethod || null,
        action: `${req.method} ${req.baseUrl}${req.path}`,
        target: req.params?.id || req.params?.userId || null,
        meta: { bodyKeys: Object.keys(req.body || {}) },
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      }).then(() => {}, (e) => console.error('[admin:audit]', e));
    }
  }
  next();
}

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
router.put('/kyc/:userId', requireAdmin, auditLog, async (req, res) => {
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

// ── Analytics: 平台汇总（SQL 聚合）───────────────────────────────────────────
// 改用 admin_analytics_summary() SQL 函数下推聚合，取代此前 Node 端 limit(1000) 拉全表内存聚合
// （量级上来后内存聚合会漏数且慢）。RPC 返回 jsonb：
//   users_total / users_engineers / users_employers / demands_total / demands_assigned /
//   milestones_total / gmv_released / escrow_funded
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.rpc('admin_analytics_summary');
    if (error) throw error;
    res.json({ status: 'ok', summary: data || {} });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Rates: 工程师费率分布（SQL 聚合）─────────────────────────────────────────
// admin_rates_summary() 返回 jsonb：count / avg_rate / min_rate / max_rate
router.get('/rates', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.rpc('admin_rates_summary');
    if (error) throw error;
    res.json({ status: 'ok', summary: data || {} });
  } catch (err) {
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/admin/audit-logs — 最近 200 条管理员写操作审计（只读）──────────────
router.get('/audit-logs', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── PUT /api/admin/demands/:id/fee：单需求费率覆盖（founding 客户让利）─────────────
// body {fee_pct}：null 清除（回退全局 PLATFORM_FEE）；否则须 0<=x<1（如 0.05=5%），越界即 400。
// 费率生效逻辑在 config/fees.js 的 feeFor(demand) 里，此处仅负责写入 demands.fee_pct。
router.put('/demands/:id/fee', requireAdmin, auditLog, async (req, res) => {
  try {
    const supabase = getClient();
    const { fee_pct } = req.body;

    let value;
    if (fee_pct === null || fee_pct === '' || fee_pct === undefined) {
      value = null; // 清除覆盖，回退全局费率
    } else {
      const v = parseFloat(fee_pct);
      // 只接受 [0,1) 区间：>=1 意味着抽走全部乃至倒贴，非法；负数同理
      if (!Number.isFinite(v) || v < 0 || v >= 1) {
        return res.status(400).json({ error: 'fee_pct must be a number in [0, 1), or null to clear.' });
      }
      value = v;
    }

    const { data, error } = await supabase
      .from('demands')
      .update({ fee_pct: value })
      .eq('id', req.params.id)
      .select('id, fee_pct')
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin:fee]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
