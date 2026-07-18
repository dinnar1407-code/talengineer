// 企业 API v1（requireApiKey 鉴权）—— 由 ent-api agent 填充（Task 6）
// 全部端点走 requireApiKey；req.apiKeyUserId 即企业用户身份（= demands.employer_id）。
// 与 legacy 的 /api/enterprise（一次性批量导入接口）区分：v1 是给企业客户"正式对接"的稳定端点，
// 对外只暴露字段白名单，绝不返回工程师 PII（contact/stripe_account_id/user_id 等）。
const express = require('express');
const router  = express.Router();
const { z } = require('zod');
const { getClient } = require('../config/db');
const { requireApiKey } = require('./apikeys');

// ── 公开工程师字段白名单（与 src/routes/talent.js 同一 PII 脱敏思路）──────────────
// 绝不 select('*')：那样会把 contact(邮箱)/stripe_account_id(支付账户)/user_id(内部主键) 等
// 敏感列泄露给企业调用方。这里显式列出"可对外展示"的列，敏感列天然排除在外。
const PUBLIC_TALENT_FIELDS =
  'id, name, skills, region, rate, pricing_model, level, verified_score, ' +
  'bio, availability, available_from, avatar_url, avg_rating, review_count, ' +
  'portfolio_images, created_at';

// ── 分页钳制（与 talent.js 一致）：page>=0；limit 限制 1~50，防一次拉太多 ─────────────
function clampPage(pageParam, limitParam) {
  const page  = Math.max(0, parseInt(pageParam) || 0);
  const limit = Math.min(50, Math.max(1, parseInt(limitParam) || 20));
  const from  = page * limit;
  return { page, limit, from, to: from + limit - 1 };
}

// ── POST /demands 入参校验：企业方创建需求的最小必填集 ────────────────────────────
// budget 允许字符串（'$12,000'）或数字（12000）——demands.budget 是文本列，落库前统一转字符串。
const createDemandSchema = z.object({
  title:       z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  budget:      z.union([z.string(), z.number()]).refine(v => String(v).trim() !== '', 'budget is required'),
  region:      z.string().min(1, 'region is required'),
});

// ── GET /demands：列出本企业发布的需求（employer_id = apiKeyUserId）───────────────
router.get('/demands', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    const { page, limit, from, to } = clampPage(req.query.page, req.query.limit);
    const { data, error, count } = await supabase
      .from('demands')
      .select('id, title, description, region, budget, status, created_at', { count: 'exact' })
      .eq('employer_id', req.apiKeyUserId)
      .order('created_at', { ascending: false })
      .range(from, to);
    // 翻过最后一页时 PostgREST 返回 PGRST103，按空结果处理而非 500（与 talent.js 同）。
    if (error) {
      if (error.code === 'PGRST103') return res.json({ status: 'ok', data: [], total: count || 0, page, pageSize: limit });
      throw error;
    }
    res.json({ status: 'ok', data: data || [], total: count || 0, page, pageSize: limit });
  } catch (err) {
    // 真实错误记录到日志（供 Sentry/排查），客户端只收到通用文案。
    console.error('[entV1]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /demands：企业方创建单个需求 ────────────────────────────────────────────
router.post('/demands', requireApiKey, async (req, res) => {
  try {
    const parsed = createDemandSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { title, description, budget, region } = parsed.data;

    const supabase = getClient();
    const { data, error } = await supabase
      .from('demands')
      .insert([{
        employer_id: req.apiKeyUserId, // 归属绑定到 API key 的企业用户，防止越权替他人建单
        title,
        description,
        budget: String(budget),
        region,
        status: 'open',
      }])
      .select('id, title, description, region, budget, status, created_at')
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    console.error('[entV1]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /talents：公开工程师目录（白名单字段 + 分页，无 PII）──────────────────────
router.get('/talents', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    const { page, limit, from, to } = clampPage(req.query.page, req.query.limit);
    let query = supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS, { count: 'exact' }) // 只查白名单列，排除 PII
      .order('verified_score', { ascending: false })
      .range(from, to);
    if (req.query.region && req.query.region !== 'all') query = query.ilike('region', `%${req.query.region}%`);
    if (req.query.skills)                                query = query.ilike('skills', `%${req.query.skills}%`);
    const { data, error, count } = await query;
    if (error) {
      if (error.code === 'PGRST103') return res.json({ status: 'ok', data: [], total: count || 0, page, pageSize: limit });
      throw error;
    }
    res.json({ status: 'ok', data: data || [], total: count || 0, page, pageSize: limit });
  } catch (err) {
    console.error('[entV1]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /demands/:id/milestones：本企业需求的里程碑（归属校验）─────────────────────
router.get('/demands/:id/milestones', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    // 先校验归属：该需求必须属于本企业。不属于（或不存在）一律 404——不区分二者，避免枚举探测他人需求 id。
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('id, employer_id')
      .eq('id', req.params.id)
      .single();
    if (demandErr || !demand || demand.employer_id !== req.apiKeyUserId) {
      return res.status(404).json({ error: 'Demand not found' });
    }
    const { data, error } = await supabase
      .from('project_milestones')
      .select('id, phase_name, percentage, amount, status, created_at')
      .eq('demand_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[entV1]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
