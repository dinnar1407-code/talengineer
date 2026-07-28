const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
// 管理员口令校验已提炼为共享中间件（已移除 query.pwd 通道，仅接受 header：SHA-256 恒时比较 + 未配置 503 fail-closed）
const { requireAdmin } = require('../middleware/adminAuth');
const { feeFor } = require('../config/fees'); // 抽佣比例单一来源（营收估算与真实放款用同一费率；含 demands.fee_pct 单需求覆盖）
const { clampPagination } = require('../utils/pagination'); // 分页钳制（与 talent 列表同口径的可测纯函数）

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
    const [users, demands, talents, ledgers, releasedMs, notifCount] = await Promise.all([
      supabase.from('users').select('id, email, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('demands').select('id, title, status, budget, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('talents').select('id, name, region, verified_score, created_at', { count: 'exact' }).order('verified_score', { ascending: false }).limit(10),
      // 台账 = project_milestones（真正的资金系统之实）。此前这里查的是 `ledgers`——
      // 生产库压根没有这张表，supabase-js 遇到不存在的表不抛异常、只把 error 放进返回值，
      // 于是 data 恒为 null、count 恒为 null、营收恒为 0，且全程没有任何报错可见。
      supabase.from('project_milestones').select('id, demand_id, amount, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      // 营收必须扫全量已放款里程碑，不能复用上面那条 limit(10) 的最近列表——
      // 否则"平台总营收"会悄悄变成"最近 10 条里的营收"，那是比恒为 0 更危险的错数。
      // 带出 demands(fee_pct) 是为了对 founding 客户按其单独费率计佣。
      //
      // 计费基数依赖的不变量：project_milestones.amount = 这条里程碑「最终真正计费的金额」。
      // 纠纷分账（resolved_split）时 src/routes/disputes.js 会把 amount 改写成判给工程师的毛额，
      // 所以这里无需为纠纷做任何特例——直接 amount × 费率即是平台实收。
      // （同一不变量被 src/services/referralService.js 的推荐奖励快照复用，两处口径必须一致。）
      supabase.from('project_milestones').select('amount, demands(fee_pct)').eq('status', 'released'),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
    ]);

    // 单表查询失败不该再像 `ledgers` 那样静默变 0：如实记日志，便于下次一眼看见。
    if (releasedMs.error) console.error('[admin] revenue query failed:', releasedMs.error);

    // 费率经 feeFor 取：demands.fee_pct 合法时优先（founding 让利单不能按标准费率计营收），
    // 否则回退全局 PLATFORM_FEE——与 payment/workorder/disputes 三条真实放款路径同一口径。
    const totalRevenue = (releasedMs.data || [])
      .reduce((s, m) => s + (m.amount || 0) * feeFor(m.demands), 0);

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
        // 前端 pages/admin.jsx 读的是 total_amount，而里程碑表的列名是 amount → 这里映射。
        ledgers: (ledgers.data || []).map(m => ({
          id: m.id, demand_id: m.demand_id, total_amount: m.amount,
          status: m.status, created_at: m.created_at,
        })),
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
// admin_analytics_summary() 下推聚合，取代此前 Node 端 limit(1000) 拉全表内存聚合。
// RPC 返回与旧端点同形状的 jsonb：funnel{...} + pmf{...}（复购/纠纷率/口碑/筛选分覆盖——
// 撮合实验的判定仪表，必须完整保留）+ kyc_pending + 新增 totals{经营总量}。
// 直接铺进响应根（{status:'ok', ...data}）与旧 /analytics 响应兼容，前端漏斗/PMF 面板即可复用。
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.rpc('admin_analytics_summary');
    if (error) throw error;
    res.json({ status: 'ok', ...(data || {}) });
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

// ── GET /api/admin/checkins — 最近 100 条现场签到（含 GPS 围栏结果，只读）────────
// 需求标题与工程师名各用一次 in() 批量查回填，避免逐行 N+1。
router.get('/checkins', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: checkins, error } = await supabase
      .from('work_order_checkins')
      .select('*')
      .order('checkin_time', { ascending: false })
      .limit(100);
    if (error) throw error;
    const rows = checkins || [];

    // 批量取需求标题 + 工程师名（各一次 in() 查询）
    const demandIds   = [...new Set(rows.map(r => r.demand_id).filter(v => v != null))];
    const engineerIds = [...new Set(rows.map(r => r.engineer_id).filter(v => v != null))];
    const [demandsRes, talentsRes] = await Promise.all([
      demandIds.length   ? supabase.from('demands').select('id, title').in('id', demandIds)   : Promise.resolve({ data: [] }),
      engineerIds.length ? supabase.from('talents').select('id, name').in('id', engineerIds)  : Promise.resolve({ data: [] }),
    ]);
    const demandTitle  = Object.fromEntries((demandsRes.data || []).map(x => [x.id, x.title]));
    const engineerName = Object.fromEntries((talentsRes.data || []).map(x => [x.id, x.name]));

    const data = rows.map(r => ({
      ...r,
      demand_title:  demandTitle[r.demand_id]   || null,
      engineer_name: engineerName[r.engineer_id] || null,
    }));
    res.json({ status: 'ok', data });
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

// ── GET /api/admin/subscribers — newsletter 订阅列表（分页、created_at 倒序，可选 source/lang 过滤）──
// leads 面板数据源：读 newsletter_subscribers 白名单字段（email/source/lang/created_at/unsubscribed_at）。
// 分页复用 clampPagination（与 talent 列表同口径）；page 越界返回 200+空数组而非 500。
router.get('/subscribers', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    // page/limit 来自用户可控 query，先钳制成安全整数再算 .range()
    const { pageNum, pageSize, from, to } = clampPagination(req.query.page, req.query.limit);

    let query = supabase
      .from('newsletter_subscribers')
      // 只选白名单字段（不含内部 id），按订阅时间倒序
      .select('email, source, lang, created_at, unsubscribed_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // 可选过滤：来源（calculator/playbook/footer）与语言，各自精确匹配
    if (req.query.source) query = query.eq('source', req.query.source);
    if (req.query.lang)   query = query.eq('lang', req.query.lang);

    const { data, error, count } = await query;
    if (error) {
      // 翻过最后一页时 PostgREST 返回 PGRST103：按空页处理，返回 200+空数组
      if (error.code === 'PGRST103') {
        return res.json({ status: 'ok', data: [], total: count || 0, page: pageNum, pageSize });
      }
      throw error;
    }
    res.json({ status: 'ok', data: data || [], total: count || 0, page: pageNum, pageSize });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[admin]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
