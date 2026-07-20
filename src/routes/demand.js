const express = require('express');
const router  = express.Router();
const { z } = require('zod');
const { getClient } = require('../config/db');
const { parseDemand } = require('../services/aiService');
const { runMatchmaker, scoreEngineer, extractKeywords } = require('../services/matchmakerService');
const { requireAuth } = require('../middleware/auth');
const { emailNewApplication, emailEngineerAssigned, emailAutoInvite } = require('../services/email');
const { createNotification } = require('../services/notificationService');
const { checkAssignEligibility, getValidCertifications } = require('../services/certService'); // 认证门禁（现场正式工作授权）
const { feeFor } = require('../config/fees'); // 生效费率单一真值来源（founding 让利折算）——本文件只读它做展示，绝不参与放款金额计算
const jwt = require('jsonwebtoken'); // 公开路由 GET /:id 里对可选 token 做属主判定（决定是否附加 effective_fee_pct）

// ── 自动邀请配置校验（邀请制路由 B2）─────────────────────────────────────────────
// 雇主发单时可选开启"自动邀请"：平台按 TalScore/认证方向/区域/费率挑选合格工程师，
// 主动邀请其**申请**（非指派）。这里用 zod 校验前端传入的配置，非法字段安全兜底。
const autoDispatchSchema = z.object({
  enabled:   z.boolean().optional().default(false),
  min_score: z.number().min(0).max(100).optional(),          // TalScore 门槛
  tracks:    z.array(z.string()).max(4).optional(),           // 要求的认证方向（任一命中即可）
  regions:   z.array(z.string()).max(10).optional(),          // 区域关键词（任一命中即可）
  max_rate:  z.number().positive().optional(),                // 费率上限（数字，缺费率信息不排除）
  top_n:     z.number().int().min(1).max(5).optional().default(3), // 邀请人数，硬上限 5
}).strip(); // 丢弃未知字段而非报错，兼容旧客户端

/**
 * 自动邀请（邀请制路由 B2）：按 auto_dispatch 规则挑选合格工程师并邀请其申请。
 * 复用 matchmakerService 的关键词打分思路（不改动它），叠加 TalScore/认证/区域/费率四道过滤。
 * fire-and-forget 调用——发单已成功，邀请失败只记录，不回滚发单。
 * @param {object} demand 刚落库的 demand 行（需含 id/title/role_required/description）
 * @param {object} config autoDispatchSchema 解析后的配置
 */
async function runAutoInvite(demand, config) {
  try {
    const supabase = getClient();
    if (!supabase) return;

    // 1) 候选池：先按区域关键词粗筛（任一命中）；无区域限制则全量取前 100。
    let query = supabase
      .from('talents')
      .select('id, name, contact, skills, region, rate, verified_score, tal_score, avg_rating, review_count, availability');
    if (config.regions?.length) {
      const orExpr = config.regions.map((r) => `region.ilike.%${r}%`).join(',');
      query = query.or(orExpr);
    }
    const { data: candidates } = await query.limit(100);
    let pool = candidates || [];

    // 2) TalScore 门槛：低于 min_score 的剔除（未打分视为 0，达不到门槛）。
    if (typeof config.min_score === 'number') {
      pool = pool.filter((t) => (t.tal_score || 0) >= config.min_score);
    }

    // 3) 费率上限：能解析出数字且超上限的剔除；无费率信息的保留（不因缺字段误杀）。
    if (typeof config.max_rate === 'number') {
      pool = pool.filter((t) => {
        const num = parseFloat(String(t.rate || '').replace(/[^0-9.]/g, ''));
        return !Number.isFinite(num) || num <= config.max_rate;
      });
    }

    // 4) 认证方向门槛：必须持指定 track 之一的有效证（复用门禁服务的过滤）。
    if (config.tracks?.length) {
      const filtered = [];
      for (const t of pool) {
        try {
          const certs = await getValidCertifications(supabase, t.id);
          if (certs.some((c) => config.tracks.includes(c.track_key))) filtered.push(t);
        } catch (e) { /* 认证查询失败按不满足处理，宁缺毋滥 */ }
      }
      pool = filtered;
    }

    // 5) 关键词打分排序，取 top_n。
    const keywords = extractKeywords((demand.role_required || '') + ' ' + (demand.description || ''));
    const ranked = pool
      .map((t) => ({ ...t, _score: scoreEngineer(t, keywords) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, config.top_n || 3);

    // 6) 邀请：站内通知 + 邮件（语气=邀请申请，非指派）。
    const invited = [];
    for (const eng of ranked) {
      if (eng.contact) {
        emailAutoInvite({ engineerEmail: eng.contact, engineerName: eng.name, projectTitle: demand.title, demandId: demand.id }).catch(console.error);
        createNotification({
          user_email: eng.contact,
          type: 'auto_invite',
          title: `You're invited to apply: "${demand.title}"`,
          body: 'An employer is inviting qualified certified engineers to apply for this project.',
          link: `/demand/${demand.id}`,
          demand_id: demand.id,
        });
      }
      invited.push({ engineer_id: eng.id, name: eng.name, tal_score: eng.tal_score || 0 });
    }

    // 7) 邀请名单写回 demand.auto_dispatch.invited，便于雇主端追踪。
    await supabase
      .from('demands')
      .update({ auto_dispatch: { ...config, invited, invited_at: new Date().toISOString() } })
      .eq('id', demand.id);

    console.log(`🎯 [Demand] Auto-invited ${invited.length} engineer(s) for Demand #${demand.id}`);
  } catch (err) {
    console.error('[Demand] Auto-invite error:', err);
  }
}

/**
 * 校验站点坐标三元组（GPS 围栏用）。
 * 语义：三个字段全空 = "本单不设站点"，合法且返回空 values（调用方据此不落任何字段）；
 *       只要有一个非空，就要求 lat/lng 均合法（radius 缺省 500）。
 * 边界：lat∈[-90,90]、lng∈[-180,180]、radius∈[50,50000]，任一越界返回 ok=false 带错误文案。
 * 为什么用助手：POST /submit 与 PUT /site 两处都要同一套校验，抽一处避免规则漂移。
 * @returns {{ok:boolean, error?:string, values?:{site_lat:number,site_lng:number,site_radius_m:number}}}
 */
function validateSiteCoords({ site_lat, site_lng, site_radius_m }) {
  // 空串/null/undefined 一律视为"未提供"：关键点是 Number('')===0 会把空输入误存成 (0,0)，
  // 之后所有真实签到都会误报几千 km。必须显式把空值挡在解析之前。
  const isBlank = (v) => v === '' || v == null;
  const latBlank = isBlank(site_lat);
  const lngBlank = isBlank(site_lng);
  const radBlank = isBlank(site_radius_m);

  // 三者全空 = 不设站点，合法跳过（发单时站点可选）。
  if (latBlank && lngBlank && radBlank) return { ok: true, values: {} };

  // 经纬度必须成对提供：半填（只有一个，或只填了半径）直接 400，杜绝 (0,0) 之类脏数据落库。
  if (latBlank || lngBlank) {
    return { ok: false, error: 'site_lat and site_lng must both be provided' };
  }

  const lat = parseFloat(site_lat);
  const lng = parseFloat(site_lng);
  const radius = radBlank ? 500 : parseFloat(site_radius_m); // 缺省半径 500m
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { ok: false, error: 'Invalid site_lat (must be a number between -90 and 90)' };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { ok: false, error: 'Invalid site_lng (must be a number between -180 and 180)' };
  }
  if (!Number.isFinite(radius) || radius < 50 || radius > 50000) {
    return { ok: false, error: 'Invalid site_radius_m (must be between 50 and 50000)' };
  }
  return { ok: true, values: { site_lat: lat, site_lng: lng, site_radius_m: Math.round(radius) } };
}

// ── Parse demand (AI) ─────────────────────────────────────────────────────────
router.post('/parse', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'Missing raw_text' });
    const parsedData = await parseDemand(raw_text);
    res.json({ status: 'ok', data: parsedData });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Submit demand (manual form) ───────────────────────────────────────────────
// 注：曾有无鉴权的 POST /quick_launch（'Zero-UI quick launch'）直发端点，任何外部
// 脚本无凭证即可以 status='open' 落库并触发 matchmaker 对工程师外发邮件，绕过
// 「发布必须人类点击确认」护栏（2026-07 安全审计）。现 ChatBot 走 /api/agent/chat
// 草稿 + 本 /submit 人类确认发布，该端点已整体删除，勿再回加无鉴权发布路径。
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { title, role_required, region, project_type, location, budget, description, contact, milestones, required_cert_track, auto_dispatch } = req.body;

    if (!title) return res.status(400).json({ error: 'Missing title' });

    // 可选站点坐标（GPS 围栏）：非法直接 400；未提供则 values 为空、不落任何站点字段（现有发单行为不变）。
    const siteCheck = validateSiteCoords(req.body);
    if (!siteCheck.ok) return res.status(400).json({ error: siteCheck.error });

    // 自动邀请配置（可选）：zod 校验；非法则安全忽略（不阻断发单）。仅在 enabled 时落库并触发邀请。
    let autoDispatch = null;
    if (auto_dispatch) {
      const parsed = autoDispatchSchema.safeParse(auto_dispatch);
      if (parsed.success && parsed.data.enabled) autoDispatch = parsed.data;
    }

    // 可选：雇主指定本单要求的认证方向（培训认证模块）。
    // 只接受字典里存在且启用的 track_key，非法值静默忽略（不阻断发单）。
    let certTrack = null;
    if (required_cert_track) {
      const { data: trackRow } = await supabase.from('cert_tracks')
        .select('track_key').eq('track_key', required_cert_track).eq('is_active', true).single();
      certTrack = trackRow ? trackRow.track_key : null;
    }

    const budgetAmount = parseFloat((budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000;

    // Use authenticated user's ID; fall back to 1 only for legacy callers
    const employerId = req.user?.userId || 1;

    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .insert([{ employer_id: employerId, title, role_required, region, project_type, location, budget, description, contact: contact || req.user.email, status: 'open', required_cert_track: certTrack, auto_dispatch: autoDispatch, ...siteCheck.values }])
      .select()
      .single();

    if (demandErr) throw demandErr;

    if (milestones?.length > 0) {
      const msData = milestones.map(m => ({
        demand_id: demand.id,
        phase_name: m.phase_name,
        percentage: m.percentage,
        amount: budgetAmount * m.percentage,
        status: 'locked',
      }));
      const { error: msErr } = await supabase.from('project_milestones').insert(msData);
      if (msErr) throw msErr;
    }

    setTimeout(() => { runMatchmaker(demand.id).catch(console.error); }, 1000);

    // 开启了自动邀请：稍后异步挑人邀请（与 matchmaker 并行，互不阻塞发单响应）。
    if (autoDispatch) {
      setTimeout(() => { runAutoInvite(demand, autoDispatch).catch(console.error); }, 1500);
    }

    res.json({ status: 'ok', id: demand.id });
  } catch (err) {
    console.error('[Demand] Submit error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Update site coordinates (employer) ────────────────────────────────────────
// 雇主为已发布的需求设置/更新现场站点坐标（GPS 围栏中心 + 半径）。
// 只允许更新 site_lat/site_lng/site_radius_m 三个字段；归属校验防 IDOR（仅该单雇主可改）。
router.put('/site', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id } = req.body;
    if (!demand_id) return res.status(400).json({ error: 'Missing demand_id' });

    // 校验坐标合法性（与 /submit 同一套规则）
    const siteCheck = validateSiteCoords(req.body);
    if (!siteCheck.ok) return res.status(400).json({ error: siteCheck.error });
    // /site 是"设置站点"语义：必须给出经纬度（校验助手保证有效、radius 缺省 500）
    if (siteCheck.values.site_lat == null || siteCheck.values.site_lng == null) {
      return res.status(400).json({ error: 'site_lat and site_lng are required' });
    }

    // 归属校验：只有该 demand 的雇主本人可改站点坐标（防 IDOR，模式同 /assign）
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', demand_id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // update 对象只含三个站点字段，杜绝顺带改到别的列
    const { error: updErr } = await supabase
      .from('demands')
      .update(siteCheck.values)
      .eq('id', demand_id);
    if (updErr) throw updErr;

    res.json({ status: 'ok', data: siteCheck.values });
  } catch (err) {
    console.error('[Demand] Site update error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get my demands (employer) ─────────────────────────────────────────────────
router.get('/my', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('demands')
      .select('*, project_milestones(id, phase_name, status, amount)')
      .eq('employer_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // 生效费率（Founding 让利销售钩子）：本接口按 employer_id 过滤，返回的都是调用者本人的需求，
    // 故可安全附加 effective_fee_pct（= feeFor(demand)，把 demands.fee_pct 折算成生效费率，无覆盖则 0.15）。
    // 仅属主视角出现，公开/工程师接口不含此字段——避免泄露他人商业条款。
    // 纯展示：feeFor 仍是放款抽佣的唯一真值来源，这里只读它、绝不参与任何金额计算。
    const enriched = (data || []).map((dm) => ({ ...dm, effective_fee_pct: feeFor(dm) }));
    res.json({ status: 'ok', data: enriched });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Employer analytics ────────────────────────────────────────────────────────
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    const { data: demands } = await supabase
      .from('demands')
      .select('id, title, status, view_count, created_at')
      .eq('employer_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (!demands?.length) return res.json({ status: 'ok', data: [], totals: { projects: 0, views: 0, applicants: 0, assigned: 0 } });

    const demandIds = demands.map(d => d.id);

    // Applicant counts per demand
    const { data: apps } = await supabase
      .from('demand_applications')
      .select('demand_id, status')
      .in('demand_id', demandIds);

    const appsByDemand = (apps || []).reduce((acc, a) => {
      if (!acc[a.demand_id]) acc[a.demand_id] = { total: 0, pending: 0, accepted: 0 };
      acc[a.demand_id].total++;
      if (a.status === 'pending')  acc[a.demand_id].pending++;
      if (a.status === 'accepted') acc[a.demand_id].accepted++;
      return acc;
    }, {});

    const enriched = demands.map(d => ({
      ...d,
      view_count:      d.view_count || 0,
      applicant_count: appsByDemand[d.id]?.total    || 0,
      pending_count:   appsByDemand[d.id]?.pending  || 0,
      accepted_count:  appsByDemand[d.id]?.accepted || 0,
    }));

    const totals = {
      projects:   demands.length,
      views:      enriched.reduce((s, d) => s + d.view_count, 0),
      applicants: enriched.reduce((s, d) => s + d.applicant_count, 0),
      assigned:   demands.filter(d => d.status === 'in_progress' || d.status === 'completed').length,
    };

    res.json({ status: 'ok', data: enriched, totals });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get single demand with milestones ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const supabase = getClient();
    const { data: demand, error } = await supabase
      .from('demands')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !demand) return res.status(404).json({ error: 'Project not found' });

    // 草稿不对外可见（AI 写工具 create_demand_draft 落的 status='draft' 行）：
    // 本路由无鉴权且 select('*')，不挡就能被 id 枚举读到未发布内容。一律按 404
    // 处理且与"不存在"同文案（不区分二者，防探测）；无鉴权做不了属主例外——
    // 草稿的查看走属主视角（GET /my / get_my_projects），发布后 status='open' 自然公开。
    if (demand.status === 'draft') return res.status(404).json({ error: 'Project not found' });

    // Fire-and-forget view count increment
    // 原子自增（审计 P3 修复）：旧写法是"读后写"（拿 demand.view_count 加 1 再 update），
    // 并发访问互相覆盖丢计数；改用 migration 014 的 SQL 函数在行锁内单条 UPDATE 完成。
    // 兜底：若目标库尚未应用 014（函数不存在报错），退回旧写法——宁可偶发丢计数也不丢功能。
    supabase.rpc('increment_demand_view', { d_id: Number(req.params.id) }).then(({ error: rpcErr }) => {
      if (rpcErr) {
        supabase.from('demands').update({ view_count: (demand.view_count || 0) + 1 }).eq('id', req.params.id).then(() => {}).catch(() => {});
      }
    }).catch(() => {});

    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('demand_id', req.params.id)
      .order('created_at', { ascending: true });

    const payload = { ...demand, milestones: milestones || [] };

    // 生效费率（Founding 让利销售钩子）：仅需求所有者（employer 本人）或 admin 可见，
    // 公开/工程师视角一律不含——避免泄露他人商业条款。本路由公开无鉴权，这里对
    // Authorization 头做「可选解码」：带合法 token 且属主/admin 才附加 effective_fee_pct；
    // 匿名 / 无效或过期 token / 他人一律跳过（现有公开返回保持不变）。
    // 纯展示：feeFor 是放款抽佣的唯一真值来源，这里只读它、绝不参与任何金额计算。
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        if (decoded && (decoded.userId === demand.employer_id || decoded.role === 'admin')) {
          payload.effective_fee_pct = feeFor(demand);
        }
      } catch (e) { /* 无效/过期 token 按匿名处理，不附加费率 */ }
    }

    res.json({ status: 'ok', data: payload });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Apply to a demand (engineer) ──────────────────────────────────────────────
router.post('/apply', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, message } = req.body;
    if (!demand_id) return res.status(400).json({ error: 'Missing demand_id' });

    // Get engineer's talent profile
    const { data: talent } = await supabase
      .from('talents')
      .select('id, name')
      .eq('user_id', req.user.userId)
      .single();

    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Please complete registration first.' });

    const { quoted_rate, quoted_days, quote_amount } = req.body;

    // Insert application
    const { error } = await supabase
      .from('demand_applications')
      .insert({
        demand_id,
        engineer_id: talent.id,
        message:      message || '',
        quoted_rate:  quoted_rate  || null,
        quoted_days:  quoted_days  ? parseInt(quoted_days)     : null,
        quote_amount: quote_amount ? parseFloat(quote_amount)  : null,
      });

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'You have already applied to this project.' });
      throw error;
    }

    // Notify employer (email + in-app)
    const { data: demand } = await supabase.from('demands').select('title, contact').eq('id', demand_id).single();
    if (demand?.contact) {
      emailNewApplication({ employerEmail: demand.contact, projectTitle: demand.title, engineerName: talent.name, applicationMessage: message }).catch(console.error);
      createNotification({
        user_email: demand.contact,
        type: 'new_application',
        title: `New application for "${demand.title}"`,
        body: `${talent.name} has applied to your project.`,
        link: `/finance`,
        demand_id: parseInt(demand_id),
      });
    }

    res.json({ status: 'ok', message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('[Demand] Apply error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get applications for a demand (employer) ──────────────────────────────────
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // Verify requester owns this demand
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // 字段白名单：只把"可公开给该需求雇主"的展示字段返回给前端。
    // 这里新增 avg_rating（平均评分 1-5）、review_count（评价条数）、availability（接单状态），
    // 用于雇主端"为什么推荐这位"的质量徽章——它们都不是 PII，可安全展示。
    // 注意：contact（邮箱）虽在白名单里，但那是被指派后联系工程师所必需的既有字段，本次不动；
    // 严禁加入 stripe_account_id、身份证件等真正的 PII。
    const { data, error } = await supabase
      .from('demand_applications')
      .select('*, talents(id, name, skills, region, rate, verified_score, avg_rating, review_count, availability, contact)')
      .eq('demand_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 附加平台认证摘要（培训认证模块）：雇主指派前需要知道谁持证/持什么方向的证。
    // 批量 join：一次性拉取本页所有申请人的有效平台认证（避免逐人 N+1 查询）。
    // 语义与 certService.getValidCertifications 对齐——只取 revoked=false，再在内存里
    // 滤掉已过期（expires_at 为空视为长期），并映射成同款 {track_key,...,level} 结构，
    // 使 platform_certs 字段形状与前端申请人卡（finance.jsx / project/[id].jsx）消费的完全一致。
    // 注意：这里只影响「展示」；正式指派门禁仍由 POST /assign 独立经 certService 判定，互不耦合。
    const talentIds = [...new Set((data || []).map((app) => app.talents?.id).filter((v) => v != null))];
    const certsByTalent = {};
    if (talentIds.length) {
      try {
        const { data: certRows } = await supabase
          .from('platform_certifications')
          .select('talent_id, level, issued_at, expires_at, cert_tracks(track_key, name_en, name_zh)')
          .in('talent_id', talentIds)
          .eq('revoked', false);
        const now = Date.now();
        for (const c of certRows || []) {
          if (c.expires_at && new Date(c.expires_at).getTime() <= now) continue; // 已过期不展示（与门禁"有效证"口径一致）
          (certsByTalent[c.talent_id] = certsByTalent[c.talent_id] || []).push({
            track_key:     c.cert_tracks?.track_key,
            track_name_en: c.cert_tracks?.name_en,
            track_name_zh: c.cert_tracks?.name_zh,
            level:         c.level,
            issued_at:     c.issued_at,
            expires_at:    c.expires_at,
          });
        }
      } catch (e) { /* 展示层容错：认证批量查询失败则全部按未持证展示，不阻断申请列表 */ }
    }
    const enriched = (data || []).map((app) => ({
      ...app,
      platform_certs: certsByTalent[app.talents?.id] || [],
    }));

    res.json({ status: 'ok', data: enriched });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get check-ins for a demand (employer) — 现场签到记录 + 围栏结果 ───────────────
// 仅雇主本人可见：签到含 GPS 距离/围栏判定，属敏感信息，绝不能塞进公开的 GET /:id（SSR/爬虫可读）。
router.get('/:id/checkins', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // 归属校验：只有该 demand 的雇主本人可查签到记录（防 IDOR，模式同 /:id/applications）
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // select('*') 兼容迁移 021 尚未应用的库：distance_m/geofence_ok 列不存在时字段缺省，
    // 前端据 geofence_ok===false 才显示围栏警示，缺省(undefined)自然不显示。
    const { data: checkins } = await supabase
      .from('work_order_checkins')
      .select('*')
      .eq('demand_id', req.params.id)
      .order('checkin_time', { ascending: false });

    res.json({ status: 'ok', data: checkins || [] });
  } catch (err) {
    console.error('[demand]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Assign engineer to demand (employer) ──────────────────────────────────────
router.post('/assign', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, engineer_id } = req.body;
    if (!demand_id || !engineer_id) return res.status(400).json({ error: 'Missing demand_id or engineer_id' });

    // Verify requester owns this demand
    // 防 IDOR：只有该需求的雇主本人才能指派工程师
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id, title, contact, required_cert_track')
      .eq('id', demand_id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // Verify the engineer actually applied to this demand
    // 防止把未申请该项目的工程师（含攻击者自指派）设为收款方
    const { data: application, error: appErr } = await supabase
      .from('demand_applications')
      .select('id')
      .eq('demand_id', demand_id)
      .eq('engineer_id', engineer_id)
      .single();
    if (appErr || !application) return res.status(400).json({ error: 'Engineer has not applied to this project.' });

    // ── 认证门禁（"现场正式工作授权"，2026-07-16 培训认证模块）─────────────────
    // 工程师可自由浏览/申请/沟通，但被正式指派前必须持有效平台认证；
    // 需求若指定 required_cert_track，还必须持该方向的证。规则详见 certService.js。
    const eligibility = await checkAssignEligibility(supabase, engineer_id, demand.required_cert_track || null);
    if (!eligibility.allowed) {
      const msg = eligibility.reason === 'missing_required_track'
        ? `This engineer does not hold the required "${demand.required_cert_track}" platform certification for on-site work.`
        : 'This engineer has not yet earned a platform certification, which is required before official on-site assignment. They can get certified at /training.';
      return res.status(403).json({ error: msg, reason: eligibility.reason });
    }

    // Assign engineer
    await supabase.from('demands').update({ assigned_engineer_id: engineer_id, status: 'in_progress' }).eq('id', demand_id);

    // Update application statuses
    await supabase.from('demand_applications').update({ status: 'accepted' }).eq('demand_id', demand_id).eq('engineer_id', engineer_id);
    await supabase.from('demand_applications').update({ status: 'rejected' }).eq('demand_id', demand_id).neq('engineer_id', engineer_id).eq('status', 'pending');

    // Notify engineer (email + in-app)
    const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', engineer_id).single();
    if (talent?.contact && demand?.title) {
      emailEngineerAssigned({ engineerEmail: talent.contact, engineerName: talent.name, projectTitle: demand.title, clientContact: demand.contact }).catch(console.error);
      createNotification({
        user_email: talent.contact,
        type: 'engineer_assigned',
        title: `You've been assigned to "${demand.title}"`,
        body: 'Congratulations! You have been selected for this project.',
        link: '/engineer/profile',
        demand_id: parseInt(demand_id),
      });
    }

    // 企业 Webhook（B4）：指派成功后通知雇主配置的 webhook（fire-and-forget，绝不影响指派）。
    // dispatchWebhook 由 webhookService（另一 agent）实现；require 放在 try 内，文件缺失也只 warn。
    try {
      const { dispatchWebhook } = require('../services/webhookService');
      dispatchWebhook(supabase, {
        userId: demand.employer_id,
        event: 'demand.assigned',
        payload: { demand_id: parseInt(demand_id), engineer_id: parseInt(engineer_id) },
      }).catch((e) => console.warn('[Demand] webhook dispatch failed:', e.message));
    } catch (e) {
      console.warn('[Demand] webhook dispatch skipped:', e.message);
    }

    res.json({ status: 'ok', message: 'Engineer assigned successfully.' });
  } catch (err) {
    console.error('[Demand] Assign error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
