// ── 背调路由（W2-5，挂载 /api/bgcheck）────────────────────────────────────────
// 工程师侧：POST /request 发起背调（幂等）、GET /me 查自己的背调状态。
// admin 侧：GET /admin-list 复核队列（分页）、PUT /admin/:id 通过/驳回（写审计）。
//
// IDOR 红线：talent_id 一律由服务端从 req.user.userId → talents.user_id 反查，
// 绝不接收 body 里的 talent_id——否则任何登录用户都能替别人发起背调（伪造队列/骚扰）。
//
// 价格纪律：背调定价 Terry 未拍板（src/config/bgcheck.js 里 BGCHECK_PRICE_USD=null），
// 本路由不涉及任何收费/金额；将来接 Stripe 收费属钱路径，单独立项。

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { clampPagination } = require('../utils/pagination'); // 分页钳制（与 talent 列表同口径）
const { VALIDITY_DAYS } = require('../config/bgcheck');
const { requestCheck, isValid, CHECK_FIELDS } = require('../services/bgcheckService');

// ── admin 写操作审计（同型照抄 src/routes/admin.js 的 auditLog）────────────────
// admin.js 的 auditLog 是文件内局部函数、未导出；红线要求不动 admin.js，
// 故此处同型落一行 admin_audit_logs：fire-and-forget、只记 body 键名不记值
// （evidence_url/note 可能含敏感线索，值不进审计表）、写失败仅记日志不阻塞主流程。
function auditLog(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const supabase = getClient();
    if (supabase) {
      supabase.from('admin_audit_logs').insert({
        admin_email: req.adminEmail || null,
        auth_method: req.adminAuthMethod || null,
        action: `${req.method} ${req.baseUrl}${req.path}`,
        target: req.params?.id || null,
        meta: { bodyKeys: Object.keys(req.body || {}) },
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      }).then(() => {}, (e) => console.error('[bgcheck:audit]', e));
    }
  }
  next();
}

// ── POST /api/bgcheck/request：工程师发起背调（幂等）──────────────────────────
router.post('/request', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // talent_id 服务端反查（IDOR 防线）：只认登录态的 userId，body 里传什么都不看。
    // 无 talents 行 → 404（照 demand.js /apply 的模式：先建档才可发起背调）。
    const { data: talent } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Please complete registration first.' });

    // requestCheck 幂等：在途或有效 passed 直接返回现状（created=false）
    const { check, created } = await requestCheck(supabase, talent.id);
    res.json({ status: 'ok', data: check, created });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[bgcheck]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/bgcheck/me：查自己的最新背调状态 ────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // 同样服务端反查 talent；未建档不当错误处理（照 kyc /status 的口径）：
    // data:null + valid:false，前端显示"先完善档案"。
    const { data: talent } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', req.user.userId)
      .maybeSingle();
    if (!talent) return res.json({ status: 'ok', data: null, valid: false });

    // 取最新一条即可（requestCheck 幂等保证同一时刻至多一条在途）。
    // 用 .limit(1) 取首行而非 .single()，避免 0 行时报错（照 talent /me 的手法）。
    const { data: rows, error } = await supabase
      .from('background_checks')
      .select(CHECK_FIELDS)
      .eq('talent_id', talent.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;

    const check = (rows && rows[0]) || null;
    res.json({ status: 'ok', data: check, valid: isValid(check) });
  } catch (err) {
    console.error('[bgcheck]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/bgcheck/admin-list?status=&page=&limit=：admin 复核队列 ──────────
// 默认只看 requested（待办队列，migration 024 为此建了部分索引）；分页走 clampPagination。
const ADMIN_LIST_STATUSES = ['requested', 'pending', 'passed', 'failed'];

router.get('/admin-list', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const status = ADMIN_LIST_STATUSES.includes(req.query.status) ? req.query.status : 'requested';
    const { pageNum, pageSize, from, to } = clampPagination(req.query.page, req.query.limit);

    const { data, error, count } = await supabase
      .from('background_checks')
      .select(CHECK_FIELDS + ', reviewed_by', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      // page 越界（PGRST103）按"翻过最后一页"处理，返回空页而非 500（与 talent /list 同口径）
      if (error.code === 'PGRST103') {
        return res.json({ status: 'ok', data: [], total: count || 0, page: pageNum, pageSize });
      }
      throw error;
    }

    // 批量补工程师姓名（admin 复核得知道在审谁）：一次 .in() 禁 N+1；
    // name 属公开白名单字段，不碰 contact 等 PII。补名失败仅记日志，列表照常返回。
    let rows = data || [];
    const ids = [...new Set(rows.map((r) => r.talent_id))];
    if (ids.length) {
      try {
        const { data: talents, error: tErr } = await supabase
          .from('talents')
          .select('id, name')
          .in('id', ids);
        if (tErr) throw tErr;
        const nameById = new Map((talents || []).map((t) => [t.id, t.name]));
        rows = rows.map((r) => ({ ...r, talent_name: nameById.get(r.talent_id) || null }));
      } catch (e) {
        console.error('[bgcheck] talent name batch failed:', e);
      }
    }

    res.json({ status: 'ok', data: rows, total: count || 0, page: pageNum, pageSize });
  } catch (err) {
    console.error('[bgcheck]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── PUT /api/bgcheck/admin/:id：admin 复核决定（passed / failed）──────────────
// zod .strip()：丢弃未知字段而非报错（与 newsletter/demand 的 schema 纪律一致）。
const decisionSchema = z.object({
  decision: z.enum(['passed', 'failed']),
  evidence_url: z.string().min(1).max(2048).optional(), // 复核依据（如 COI/证明文件链接）
  note: z.string().max(2000).optional(),
}).strip();

router.put('/admin/:id', requireAdmin, auditLog, async (req, res) => {
  try {
    const supabase = getClient();
    const parsed = decisionSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: "decision must be 'passed' or 'failed'" });
    const { decision, evidence_url, note } = parsed.data;

    const patch = {
      status: decision,
      completed_at: new Date().toISOString(),
      reviewed_by: req.adminEmail || null,
      evidence_url: evidence_url || null,
      note: note || null,
    };
    // passed 才有有效期：now + VALIDITY_DAYS（单一来源 src/config/bgcheck.js）；
    // failed 不写 expires_at（失败结论不存在"过期后自动变好"）。
    if (decision === 'passed') {
      patch.expires_at = new Date(Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    }

    // 条件更新（照钱路径状态机的手法）：只允许 requested/pending → 终态，
    // 已决定过的行不可再改（防重复点击/并发双写）；0 行命中 = 不存在或已决定 → 404。
    const { data, error } = await supabase
      .from('background_checks')
      .update(patch)
      .eq('id', req.params.id)
      .in('status', ['requested', 'pending'])
      .select('id');
    if (error) throw error;
    if (!data || !data.length) return res.status(404).json({ error: 'Check not found or already decided.' });

    res.json({ status: 'ok', message: `Background check ${decision}.` });
  } catch (err) {
    console.error('[bgcheck]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
// 供单元测试直接校验 schema 形状（照 newsletter.js 的可测导出手法）
module.exports.decisionSchema = decisionSchema;
