const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const { getClient } = require('../config/db');
const { parseDemand, generateTechQuestion, gradeTechAnswer } = require('../services/aiService');
const { clampPagination } = require('../utils/pagination'); // 分页钳制逻辑抽成可测的纯函数

// 签名分数 token 用的密钥：与登录 JWT 同一密钥（部署上已存在，无需新增配置）。
// 用途见下方 /screen_verify：把 AI 筛选分签名后发给前端，注册时凭 token 落库，
// 防止"前端自报 verified_score=100"刷撮合排名。
const JWT_SECRET = process.env.JWT_SECRET;
// token 有效期：够走完"答题→填表→提交注册"的向导流程即可，过期需重新筛选。
const SCORE_TOKEN_TTL = '30m';

// ── 公开接口字段白名单（PII 脱敏）────────────────────────────────────────────────
// 公开的工程师列表/档案接口任何人都能访问，绝不能 select('*') 把整行返回出去：
// 那样会泄露 contact(邮箱，属于个人隐私 PII)、stripe_account_id(支付账户)、user_id(内部主键) 等敏感字段。
// 这里显式列出“允许对外展示”的列，只查这些列；上面提到的敏感列被天然排除在外。
// 注意：仅用于公开读接口；登录后的属主接口(如 PUT /profile)不受影响。
const PUBLIC_TALENT_FIELDS =
  'id, name, skills, region, rate, pricing_model, level, verified_score, ' +
  'bio, availability, available_from, avatar_url, avg_rating, review_count, ' +
  'portfolio_images, created_at';

// ── List open demands ─────────────────────────────────────────────────────────
router.get('/demands', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('demands')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── AI tech screen: generate question ────────────────────────────────────────
router.post('/screen_question', async (req, res) => {
  try {
    const { skills, level, lang } = req.body;
    const question = await generateTechQuestion(skills, level, lang);
    res.json({ status: 'ok', question });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── AI tech screen: grade answer ──────────────────────────────────────────────
router.post('/screen_verify', async (req, res) => {
  try {
    const { question, answer, lang } = req.body;
    const result = await gradeTechAnswer(question, answer, lang);

    // 落地第二步（撮合模型硬化）：给 AI 打出的分数签名，注册时凭 token 落库。
    // 此前注册接口直接信任前端自报的 verified_score，任何人都能抓包改成 100 分刷
    // 撮合排名；现在分数由服务端签名（同 JWT_SECRET），前端只能原样转交，改不了。
    // purpose 字段防止拿登录 JWT 之类的其他 token 冒充分数凭证。
    if (typeof result.score === 'number' && JWT_SECRET) {
      const score = Math.max(0, Math.min(100, Math.round(result.score)));
      result.score_token = jwt.sign({ score, purpose: 'screen_score' }, JWT_SECRET, { expiresIn: SCORE_TOKEN_TTL });
    }

    res.json(result);
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── List engineers with filters + pagination ──────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    const supabase = getClient();
    const {
      region, skills, min_score,
      availability, verified_only, sort,
      page = '0', limit: limitParam = '12',
    } = req.query;

    // 分页参数钳制(clamp)到合法范围，防止越界/非法值导致 500：
    // - parseInt 解析失败(NaN/非数字)时退回默认值；
    // - page 用 Math.max(0, ...) 兜底，负数/NaN 一律当 0(第一页)；
    // - limit 用 Math.min(50, Math.max(1, ...))，限制在 1~50 之间，防止一次拉太多。
    // 若 page 越过实际数据范围(如 page=9999)，Supabase 的 .range() 会返回空数组 + 200，
    // 不会报错——下面的 data || [] 再兜一层底，确保对客户端始终是 200 + 空数组，绝不 500。
    // 钳制逻辑已抽到 ../utils/pagination 的 clampPagination（纯函数，便于单元测试与复用）
    const { pageNum, pageSize, from, to } = clampPagination(page, limitParam);

    // Determine sort column
    let orderCol = 'verified_score', orderAsc = false;
    if (sort === 'newest')    { orderCol = 'created_at'; orderAsc = false; }
    else if (sort === 'rate') { orderCol = 'created_at'; orderAsc = false; } // rate is text, fallback

    let query = supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS, { count: 'exact' }) // 公开接口只查白名单字段，排除 contact/stripe_account_id/user_id 等 PII
      .order(orderCol, { ascending: orderAsc })
      .range(from, to);

    if (region && region !== 'all')   query = query.ilike('region', `%${region}%`);
    if (skills)                        query = query.ilike('skills', `%${skills}%`);
    if (min_score)                     query = query.gte('verified_score', parseInt(min_score));
    if (availability && availability !== 'all') query = query.eq('availability', availability);
    if (verified_only === 'true')      query = query.gt('verified_score', 0);

    const { data, error, count } = await query;
    // page 越界时 PostgREST 返回 PGRST103(range not satisfiable) 错误，而非空结果。
    // 这种情况按"翻过了最后一页"处理：返回 200 + 空数组，而不是 500。
    if (error) {
      if (error.code === 'PGRST103') {
        return res.json({ status: 'ok', data: [], total: count || 0, page: pageNum, pageSize });
      }
      throw error;
    }

    // If sort=available, push available engineers first client-side
    let sorted = data || [];
    if (sort === 'available') {
      const order = { available: 0, busy: 1, unavailable: 2 };
      sorted = sorted.sort((a, b) => (order[a.availability] ?? 3) - (order[b.availability] ?? 3));
    }

    res.json({ status: 'ok', data: sorted, total: count || 0, page: pageNum, pageSize });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Update own engineer profile ───────────────────────────────────────────────
const { requireAuth } = require('../middleware/auth');

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const allowed = ['bio', 'region', 'rate', 'pricing_model', 'skills', 'availability', 'available_from', 'avatar_url'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });

    // Find talent by user_id
    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) {
      // 修复（2026-07-16 用户反馈）：Dashboard 注册的工程师不带 engName，注册时不会建
      // talents 档案行；而 /onboarding"编辑档案"向导走的就是本端点，原来直接 404 把向导
      // 第三步卡死。改为：工程师身份 + 档案缺失 → 首次调用即创建（默认值与 auth.js 注册
      // 一致，本次传入的字段优先；分数 0 起步，走正常筛选/考核提升）。其他角色仍 404。
      if (req.user.role !== 'engineer') {
        return res.status(404).json({ error: 'Engineer profile not found. Please create a profile first.' });
      }
      const { data: userRow } = await supabase.from('users').select('name, email').eq('id', req.user.userId).single();
      const email = userRow?.email || req.user.email || '';
      const { data: created, error: createErr } = await supabase.from('talents').insert([{
        user_id: req.user.userId,
        name: userRow?.name || email.split('@')[0] || 'Engineer',
        skills: 'Automation Engineer',
        region: 'US/CA/MX',
        rate: 'Open',
        pricing_model: 'hourly',
        level: 'Mid',
        verified_score: 0,
        bio: '',
        contact: email,
        ...updates,
      }]).select().single();
      if (createErr) throw createErr;
      return res.json({ status: 'ok', data: created });
    }

    const { data, error } = await supabase.from('talents').update(updates).eq('id', talent.id).select().single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Update portfolio images ───────────────────────────────────────────────────
router.put('/portfolio', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { portfolio_images } = req.body;

    if (!Array.isArray(portfolio_images)) return res.status(400).json({ error: 'portfolio_images must be an array' });
    if (portfolio_images.length > 12) return res.status(400).json({ error: 'Maximum 12 portfolio items' });

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data, error } = await supabase
      .from('talents')
      .update({ portfolio_images })
      .eq('id', talent.id)
      .select('portfolio_images')
      .single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get single engineer profile ───────────────────────────────────────────────
router.get('/profile/:id', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS) // 公开档案只查白名单字段，排除 contact/stripe_account_id/user_id 等 PII
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Engineer not found' });
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Rate benchmarks (public) ──────────────────────────────────────────────────
// 进程内 TTL 缓存（审计 P2 修复）：这是公开端点，此前每次请求都全表拉 talents
// 并在 Node 内存聚合——被刷时数据库跟着挨打。费率基准本质是慢变统计数据，
// 5 分钟缓存足够新鲜；缓存只存最终聚合结果（几 KB），不存原始行。
// 注意：Railway 单实例部署，进程内缓存即可；将来多实例时各实例独立缓存也无一致性问题（只读统计）。
const BENCHMARK_CACHE_TTL_MS = 5 * 60 * 1000;
let benchmarkCache = null;        // { payload, expiresAt }

router.get('/rate-benchmarks', async (req, res) => {
  try {
    // 命中未过期缓存：直接返回，不碰数据库
    if (benchmarkCache && benchmarkCache.expiresAt > Date.now()) {
      return res.json(benchmarkCache.payload);
    }

    const supabase = getClient();
    const { data, error } = await supabase
      .from('talents')
      .select('region, rate, skills')
      .not('rate', 'is', null);
    if (error) throw error;

    const parse = r => parseFloat(String(r).replace(/[^0-9.]/g, '')) || null;
    const byRegion = {};
    const allSkills = new Set();

    (data || []).forEach(t => {
      const num = parse(t.rate);
      if (!num) return;
      const key = t.region || 'Other';
      if (!byRegion[key]) byRegion[key] = { rates: [], skills: {} };
      byRegion[key].rates.push(num);
      (t.skills || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
        allSkills.add(s);
        byRegion[key].skills[s] = (byRegion[key].skills[s] || 0) + 1;
      });
    });

    const summary = Object.entries(byRegion).map(([region, { rates, skills }]) => {
      rates.sort((a, b) => a - b);
      const avg = rates.reduce((s, v) => s + v, 0) / rates.length;
      const mid = Math.floor(rates.length / 2);
      const median = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
      const top_skills = Object.entries(skills).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
      return { region, count: rates.length, avg: Math.round(avg), median: Math.round(median), min: rates[0], max: rates[rates.length - 1], top_skills };
    }).sort((a, b) => b.count - a.count);

    const payload = { status: 'ok', data: summary, skills: [...allSkills].sort() };
    benchmarkCache = { payload, expiresAt: Date.now() + BENCHMARK_CACHE_TTL_MS };
    res.json(payload);
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露数据库/内部细节
    console.error('[talent]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
