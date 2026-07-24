// ── 企业认证人才池（W2-3）路由：/api/pools ──────────────────────────────────────
// 业务背景：雇主按条件（认证方向/等级、最低 TalScore、地区）圈选一批"预审过"的工程师，
// 形成自己的私有人才池，复购时不必每次从全量列表重新筛。表结构见 migrations/024_wave2.sql
// （talent_pools / talent_pool_members，RLS deny-all，全部经服务端 service_role 访问）。
//
// 安全要点（照 entV1.js 的归属校验口径）：
// 1. 行级属主：每个池只属于创建它的雇主（employer_id === req.user.userId，二者都是 number，
//    users.id 生产为 bigint）。非属主与不存在一律返回同一个 404——不区分二者，避免枚举
//    探测他人池 id（anti-enumeration）。
// 2. PII 白名单：成员/候选人的工程师数据只走 PUBLIC_TALENT_FIELDS，绝不 select('*')
//    把 contact(邮箱)/stripe_account_id/user_id 泄露给雇主端。
// 3. criteria.regions 是雇主可控的 JSON 输入，**禁止拼进 .or()/.ilike 表达式**——
//    逗号/括号会破坏 PostgREST 的过滤 DSL（runAutoInvite 的反面教材）。这里先按
//    min_tal_score 有界取数（limit 数百），region 匹配在 JS 里做子串过滤，天然免疫注入。
// 4. 证书过滤照 talent.js /list 的批量富化模式：一次 .in() 拉回全部候选的有效证书，
//    JS 里过滤 revoked/过期（expires_at 为 NULL = 长期有效），禁 N+1。
const express = require('express');
const router  = express.Router();
const { z } = require('zod');
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── 公开工程师字段白名单（与 src/routes/talent.js 同一 PII 脱敏思路，含 tal_score）──
const PUBLIC_TALENT_FIELDS =
  'id, name, skills, region, rate, pricing_model, level, verified_score, ' +
  'bio, availability, available_from, avatar_url, avg_rating, review_count, ' +
  'portfolio_images, created_at, tal_score';

// 候选扫描上限：有界取数（先按分数排序拉前 300 行），后续 region/证书过滤全在 JS 做。
// 平台当前规模远小于 300，取满也只是几十 KB；绝不把雇主可控字符串拼进 SQL/DSL。
const CANDIDATE_SCAN_LIMIT = 300;
// 候选返回上限：预览用途，30 条足够（与计划规格一致）。
const CANDIDATE_RESULT_LIMIT = 30;

// ── criteria 校验：圈选条件，全部可选，.strip() 静默丢弃未声明字段 ────────────────
// tracks 是 cert_tracks.track_key（plc/robotics/vision/electrical），只用于 JS 内存匹配，
// 不进 SQL；仍用正则限定成"小写 key 形态"，把奇怪输入挡在门外。
const criteriaSchema = z.object({
  tracks:        z.array(z.string().regex(/^[a-z0-9_]{1,32}$/, 'invalid track key')).max(4).optional(),
  min_level:     z.number().int().min(1).max(3).optional(),
  min_tal_score: z.number().min(0).max(100).optional(),
  regions:       z.array(z.string().trim().min(1).max(60)).max(10).optional(),
}).strip();

// ── 建池/改池入参校验 ───────────────────────────────────────────────────────────
const createPoolSchema = z.object({
  name:     z.string().trim().min(1, 'name is required').max(80),
  criteria: criteriaSchema.optional(),
}).strip();

const updatePoolSchema = z.object({
  name:     z.string().trim().min(1, 'name is required').max(80).optional(),
  criteria: criteriaSchema.optional(),
}).strip();

// 加成员入参：talent_id 必须是正整数（talents.id 生产为 bigint）。coerce 兼容字符串数字。
const addMemberSchema = z.object({
  talent_id: z.coerce.number().int().positive(),
}).strip();

// ── 纯函数：把批量证书行折成 Map<talent_id, {track_key: 最高level}> ────────────────
// 与 talent.js /list 的富化逻辑同口径：revoked 已在查询侧排除，这里过滤过期
// （expires_at 为 NULL = 长期有效），每人每方向取最高 level。抽成纯函数便于单元测试。
function buildCertLevelMap(certRows) {
  const now = Date.now();
  const byTalent = new Map();
  (certRows || []).forEach((c) => {
    if (c.expires_at && new Date(c.expires_at).getTime() <= now) return; // 已过期不算
    const trackKey = c.cert_tracks?.track_key;
    if (!trackKey) return;
    const m = byTalent.get(c.talent_id) || {};
    if (m[trackKey] === undefined || c.level > m[trackKey]) m[trackKey] = c.level;
    byTalent.set(c.talent_id, m);
  });
  return byTalent;
}

// ── 纯函数：证书维度是否满足 criteria ───────────────────────────────────────────
// 规则：指定了 tracks → 至少持有其中一个方向的有效证，且 level ≥ min_level（缺省 1）；
//       只指定 min_level → 任一方向达到该 level 即可；两者都没指定 → 不设证书门槛。
function meetsCertCriteria(certLevels, criteria) {
  const minLevel = criteria.min_level || 1;
  const entries = Object.entries(certLevels || {});
  if (criteria.tracks && criteria.tracks.length) {
    return entries.some(([track, level]) => criteria.tracks.includes(track) && level >= minLevel);
  }
  if (criteria.min_level) {
    return entries.some(([, level]) => level >= minLevel);
  }
  return true;
}

// ── 纯函数：region 子串匹配（大小写不敏感）────────────────────────────────────────
// talents.region 是自由文本（如 'US/CA/MX'），criteria.regions 任意命中一个即通过。
// 在 JS 里做子串匹配而非 .or(ilike)——雇主可控字符串绝不进 PostgREST DSL（防注入破坏）。
function matchesRegions(region, regions) {
  if (!regions || !regions.length) return true;
  const hay = String(region || '').toLowerCase();
  return regions.some((r) => hay.includes(String(r).toLowerCase()));
}

// ── 归属校验：取池并核对属主；不存在或非属主统一返回 null（路由侧一律 404）──────────
async function fetchOwnedPool(supabase, poolId, userId) {
  const { data: pool, error } = await supabase
    .from('talent_pools')
    .select('id, employer_id, name, criteria, created_at, updated_at')
    .eq('id', poolId)
    .single();
  // 不存在（error/空）与属主不符走同一条路：调用方返回同一个 404，防枚举
  if (error || !pool || pool.employer_id !== userId) return null;
  return pool;
}

// ── POST /api/pools：新建池 ────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = createPoolSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, criteria } = parsed.data;

    const supabase = getClient();
    const { data, error } = await supabase
      .from('talent_pools')
      .insert([{
        employer_id: req.user.userId, // 归属绑定到登录用户，杜绝替他人建池
        name,
        criteria: criteria || {},
      }])
      .select('id, name, criteria, created_at, updated_at')
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/pools：我的池列表（带 member_count）────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('talent_pools')
      .select('id, name, criteria, created_at, updated_at')
      .eq('employer_id', req.user.userId)
      .order('created_at', { ascending: false })
      .limit(100); // 单雇主的池不会多，100 封顶足够；不做分页保持接口简单
    if (error) throw error;

    // member_count 批量补（一次 .in() 拉全部成员行，JS 里计数，禁 N+1）。
    // 属"增强信息"：失败仅记录日志，列表照常返回（计数显示 0），绝不 500。
    const pools = data || [];
    const countBy = {};
    const ids = pools.map((p) => p.id);
    if (ids.length) {
      try {
        const { data: memberRows, error: memErr } = await supabase
          .from('talent_pool_members')
          .select('pool_id')
          .in('pool_id', ids);
        if (memErr) throw memErr;
        (memberRows || []).forEach((m) => { countBy[m.pool_id] = (countBy[m.pool_id] || 0) + 1; });
      } catch (e) {
        console.error('[pools] member count batch failed:', e);
      }
    }
    res.json({ status: 'ok', data: pools.map((p) => ({ ...p, member_count: countBy[p.id] || 0 })) });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/pools/:id：池详情（含成员，成员工程师数据走 PII 白名单批量 join）──────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' }); // 非属主同 404，防枚举

    const { data: memberRows, error: memErr } = await supabase
      .from('talent_pool_members')
      .select('talent_id, snapshot, added_at')
      .eq('pool_id', pool.id)
      .order('added_at', { ascending: true });
    if (memErr) throw memErr;

    // 成员的工程师当前档案：一次 .in() 批量拉（禁 N+1），只取白名单字段
    const talentIds = (memberRows || []).map((m) => m.talent_id);
    const byId = new Map();
    if (talentIds.length) {
      const { data: talentRows, error: tErr } = await supabase
        .from('talents')
        .select(PUBLIC_TALENT_FIELDS)
        .in('id', talentIds);
      if (tErr) throw tErr;
      (talentRows || []).forEach((t) => byId.set(t.id, t));
    }
    const members = (memberRows || []).map((m) => ({ ...m, talent: byId.get(m.talent_id) || null }));
    res.json({ status: 'ok', data: { ...pool, members } });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── PUT /api/pools/:id：改名 / 改圈选条件 ───────────────────────────────────────
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    const parsed = updatePoolSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const updates = {};
    if (parsed.data.name !== undefined)     updates.name = parsed.data.name;
    if (parsed.data.criteria !== undefined) updates.criteria = parsed.data.criteria;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('talent_pools')
      .update(updates)
      .eq('id', pool.id)
      .select('id, name, criteria, created_at, updated_at')
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── DELETE /api/pools/:id：删池（先清成员再删池，应用层保证不留孤儿行）─────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    // 019+ 惯例不加 FK 约束，级联删除由应用层负责：先删成员行，再删池本体
    const { error: memErr } = await supabase.from('talent_pool_members').delete().eq('pool_id', pool.id);
    if (memErr) throw memErr;
    const { error } = await supabase.from('talent_pools').delete().eq('id', pool.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/pools/:id/candidates：按 criteria 筛选候选工程师（预览，最多 30 条）───
router.get('/:id/candidates', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    // 池里存的 criteria 再过一遍 schema（防历史脏数据/手改 DB），不合法就当没有条件
    const parsedCriteria = criteriaSchema.safeParse(pool.criteria || {});
    const criteria = parsedCriteria.success ? parsedCriteria.data : {};

    // 有界取数：只有 min_tal_score 走 DB 侧过滤（数字，安全）；按 tal_score 降序，
    // NULL 分排最后（nullsFirst:false，否则未打分的人霸榜）。region 过滤绝不进 DSL。
    let query = supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS)
      .order('tal_score', { ascending: false, nullsFirst: false })
      .limit(CANDIDATE_SCAN_LIMIT);
    if (criteria.min_tal_score != null) query = query.gte('tal_score', criteria.min_tal_score);
    const { data, error } = await query;
    if (error) throw error;

    // region：JS 子串匹配（雇主可控字符串免疫 DSL 注入）
    let rows = (data || []).filter((t) => matchesRegions(t.region, criteria.regions));

    // 已入池成员不再出现在候选里（避免重复添加的困惑）
    const { data: memberRows, error: memErr } = await supabase
      .from('talent_pool_members')
      .select('talent_id')
      .eq('pool_id', pool.id);
    if (memErr) throw memErr;
    const memberSet = new Set((memberRows || []).map((m) => m.talent_id));
    rows = rows.filter((t) => !memberSet.has(t.id));

    // 证书批量拉取（一次 .in()，禁 N+1）；这里证书是**过滤条件**而非装饰，
    // 查询失败必须 500 而不能静默放行（否则条件形同虚设）。
    let certMap = new Map();
    const ids = rows.map((t) => t.id);
    if (ids.length) {
      const { data: certRows, error: certErr } = await supabase
        .from('platform_certifications')
        .select('talent_id, level, expires_at, cert_tracks(track_key)')
        .in('talent_id', ids)
        .eq('revoked', false); // 已吊销的证不算
      if (certErr) throw certErr;
      certMap = buildCertLevelMap(certRows);
    }

    const result = rows
      .filter((t) => meetsCertCriteria(certMap.get(t.id) || {}, criteria))
      .slice(0, CANDIDATE_RESULT_LIMIT)
      .map((t) => ({
        ...t,
        // 附认证摘要（前端显示 🎓 徽章，口径与 /api/talent/list 一致）
        certs: Object.entries(certMap.get(t.id) || {}).map(([track_key, level]) => ({ track_key, level })),
      }));
    res.json({ status: 'ok', data: result });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /api/pools/:id/members：手动加成员（校验满足 criteria 的 tracks/min_level）─
router.post('/:id/members', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    const parsed = addMemberSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'talent_id must be a positive integer' });
    const talentId = parsed.data.talent_id;

    // 工程师必须真实存在（只取快照所需的最小字段）
    const { data: talent, error: tErr } = await supabase
      .from('talents')
      .select('id, tal_score')
      .eq('id', talentId)
      .single();
    if (tErr || !talent) return res.status(404).json({ error: 'Engineer not found' });

    // 有效证书（口径同 candidates：revoked 查询侧排除 + JS 过滤过期）
    const { data: certRows, error: certErr } = await supabase
      .from('platform_certifications')
      .select('talent_id, level, expires_at, cert_tracks(track_key)')
      .in('talent_id', [talentId])
      .eq('revoked', false);
    if (certErr) throw certErr;
    const certLevels = buildCertLevelMap(certRows).get(talentId) || {};

    // 加入校验：手动加人也必须满足池的 tracks/min_level 门槛（"认证人才池"名副其实）；
    // min_tal_score/regions 不在手动加人时强制——雇主看过档案后有权破例圈进来。
    const parsedCriteria = criteriaSchema.safeParse(pool.criteria || {});
    const criteria = parsedCriteria.success ? parsedCriteria.data : {};
    if (!meetsCertCriteria(certLevels, criteria)) {
      return res.status(400).json({ error: 'Engineer does not meet the pool certification criteria' });
    }

    // 快照：记录加入时的评分与证书状态，池内展示不随后续变动漂移（表注释同）
    const snapshot = {
      tal_score: talent.tal_score ?? null,
      certs: Object.entries(certLevels).map(([track_key, level]) => ({ track_key, level })),
      added_reason: 'manual',
    };
    const { error: insErr } = await supabase
      .from('talent_pool_members')
      .insert([{ pool_id: pool.id, talent_id: talentId, snapshot }]);
    if (insErr) {
      // 唯一索引 uq_pool_members_pool_talent 撞上 = 已在池里，按幂等成功处理
      if (insErr.code === '23505') return res.json({ status: 'ok', idempotent: true });
      throw insErr;
    }
    res.json({ status: 'ok', data: { pool_id: pool.id, talent_id: talentId, snapshot } });
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── DELETE /api/pools/:id/members/:talentId：移出成员 ───────────────────────────
router.delete('/:id/members/:talentId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const pool = await fetchOwnedPool(supabase, req.params.id, req.user.userId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    const talentId = parseInt(req.params.talentId, 10);
    if (!Number.isInteger(talentId) || talentId <= 0) {
      return res.status(400).json({ error: 'talent_id must be a positive integer' });
    }
    const { error } = await supabase
      .from('talent_pool_members')
      .delete()
      .eq('pool_id', pool.id)
      .eq('talent_id', talentId);
    if (error) throw error;
    res.json({ status: 'ok' }); // 删不存在的成员也返回 ok（幂等删除）
  } catch (err) {
    console.error('[pools]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
// 测试用内部导出（照 newsletter.js 的"router + 可测内部"模式）
module.exports.criteriaSchema    = criteriaSchema;
module.exports.buildCertLevelMap = buildCertLevelMap;
module.exports.meetsCertCriteria = meetsCertCriteria;
module.exports.matchesRegions    = matchesRegions;
module.exports.PUBLIC_TALENT_FIELDS = PUBLIC_TALENT_FIELDS;
