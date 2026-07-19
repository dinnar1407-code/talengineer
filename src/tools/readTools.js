// ── 只读工具（首批 6 个，Phase 1）────────────────────────────────────────────
// 本文件只定义 {name, description, parameters, roles} 元数据（已定稿，实现者勿改形状）
// + handler 桩（throw NOT_IMPLEMENTED，由实现 agent 填充）。
// 每个 handler 的实现要点写在工具定义上方注释里——那是契约的一部分。
//
// 通用约束（全部 handler 适用）：
// - ctx = { user: {userId, email, role}|null, supabase }；身份只用 ctx.user.userId。
// - 绝不 select('*') 返回给外部；公开工具只出白名单字段。
// - handler 返回纯数据（registry.call 负责包装成 {ok, data}）；可预期的业务失败
//   （如无权限/不存在）直接 throw new Error('人话文案')，registry 会包装成 {ok:false,error}。
const { register } = require('./registry');
const { getValidCertifications } = require('../services/certService');
const { assertDemandParticipant } = require('../middleware/ownership');
const TRAINING = require('../config/training');

// 公开工程师字段白名单——照抄 src/routes/entV1.js 的 PUBLIC_TALENT_FIELDS（PII 脱敏思路一致）：
// 绝不泄露 contact(邮箱)/stripe_account_id/user_id 等敏感列。
const PUBLIC_TALENT_FIELDS =
  'id, name, skills, region, rate, pricing_model, level, verified_score, ' +
  'bio, availability, available_from, avatar_url, avg_rating, review_count, ' +
  'portfolio_images, created_at';

// 导出给其他工具实现复用（aiTools 的 get_match_recommendations 也必须走这份白名单）
module.exports = { PUBLIC_TALENT_FIELDS };

// ── 1. search_engineers（public）─────────────────────────────────────────────
// 实现要点：supabase.from('talents').select(PUBLIC_TALENT_FIELDS)；
// region/skill 用 ilike 模糊匹配（照 entV1.js GET /talents 的写法）；
// maxRate 参考 src/routes/demand.js runAutoInvite 的费率解析（rate 是文本列，
// parseFloat(String(rate).replace(/[^0-9.]/g,''))，解析不出数字的不排除）；
// track 过滤复用 src/services/certService.js 的 getValidCertifications（持该方向有效证）；
// 排序 verified_score desc，limit 默认 5、硬上限 10（schema 已钳制）。
register({
  name: 'search_engineers',
  description:
    'Search the public directory of certified industrial-automation engineers. ' +
    'Filter by certification track, region, skill keyword, and max hourly rate (USD). ' +
    'Returns public profile fields only (no contact info).',
  parameters: {
    type: 'object',
    properties: {
      track: {
        type: 'string',
        description: 'Certification track key to require (e.g. "plc", "robotics" — see get_certification_info).',
      },
      region: { type: 'string', maxLength: 120, description: 'Region keyword, e.g. "Mexico", "US".' },
      skill: { type: 'string', maxLength: 120, description: 'Skill keyword, e.g. "Siemens S7-1500".' },
      maxRate: { type: 'number', minimum: 0, description: 'Maximum hourly rate in USD.' },
      limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Max results (default 5, hard cap 10).' },
    },
  },
  roles: ['public'],
  handler: async (args, ctx) => {
    const { track, region, skill, maxRate } = args;
    const limit = args.limit || 5; // schema 已钳制 1~10，默认 5

    // track/maxRate 是取回后的内存过滤（rate 是文本列、认证在另一张表，DB 层过滤不了），
    // 有这类后置过滤时取更大的候选池（30），否则过滤后凑不满 limit 条。
    const hasPostFilter = track != null || maxRate != null;
    const poolSize = hasPostFilter ? 30 : limit;

    let query = ctx.supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS) // 只查白名单列，绝不 select('*')（不泄露 contact/user_id 等 PII）
      .order('verified_score', { ascending: false })
      .limit(poolSize);
    // region/skill 模糊匹配，照 entV1.js GET /talents 的写法
    if (region) query = query.ilike('region', `%${region}%`);
    if (skill) query = query.ilike('skills', `%${skill}%`);

    const { data, error } = await query;
    if (error) throw error;
    let pool = data || [];

    // 费率上限：rate 是文本列（如 "$45/hr"），解析照 demand.js runAutoInvite——
    // 解析不出数字的不排除（不因缺字段误杀）。
    if (maxRate != null) {
      pool = pool.filter((t) => {
        const num = parseFloat(String(t.rate || '').replace(/[^0-9.]/g, ''));
        return !Number.isFinite(num) || num <= maxRate;
      });
    }

    // 认证方向过滤：必须持该方向的有效平台认证（复用门禁服务 getValidCertifications；
    // 单个查询失败按不满足处理，宁缺毋滥——与 runAutoInvite 同思路）。
    if (track != null) {
      const want = String(track).toLowerCase();
      const certified = [];
      for (const t of pool) {
        if (certified.length >= limit) break; // 凑够即停，省认证查询
        try {
          const certs = await getValidCertifications(ctx.supabase, t.id);
          if (certs.some((c) => String(c.track_key || '').toLowerCase() === want)) certified.push(t);
        } catch (e) { /* 认证查询失败 → 按不持证处理 */ }
      }
      pool = certified;
    }

    return { engineers: pool.slice(0, limit) };
  },
});

// ── 2. get_rates（public）────────────────────────────────────────────────────
// 实现要点：复用 src/routes/talent.js GET /rate-benchmarks 的取数与聚合逻辑
// （from('talents').select('region, rate, skills').not('rate','is',null)，按区域聚合
// avg/median/min/max/top_skills）；region 参数过滤聚合结果里的区域（模糊包含），
// specialty 参数过滤 top_skills 命中的区域或按技能出现次数给出费率区间。
// 注意 talent.js 里有 5 分钟进程内缓存（benchmarkCache）——本工具自行聚合时也应
// 避免高频全表拉取（可以简单复算，量小；或加同样的 TTL 缓存）。

// 5 分钟进程内 TTL 缓存（照 talent.js benchmarkCache 的做法）：公开工具可能被模型
// 高频调用，费率基准是慢变统计——缓存只存最终聚合结果（几 KB），不存原始行；
// region/specialty 过滤在缓存之外做（缓存的是全量聚合，过滤只是视图）。
const RATES_CACHE_TTL_MS = 5 * 60 * 1000;
let ratesCache = null; // { summary, expiresAt }

register({
  name: 'get_rates',
  description:
    'Get hourly-rate benchmarks (average / median / min / max, USD) for industrial-automation ' +
    'engineers, aggregated by region, optionally filtered by region or specialty keyword.',
  parameters: {
    type: 'object',
    properties: {
      region: { type: 'string', maxLength: 120, description: 'Region keyword filter, e.g. "Mexico".' },
      specialty: { type: 'string', maxLength: 120, description: 'Specialty/skill keyword filter, e.g. "SCADA".' },
    },
  },
  roles: ['public'],
  handler: async (args, ctx) => {
    let summary;
    if (ratesCache && ratesCache.expiresAt > Date.now()) {
      summary = ratesCache.summary; // 命中未过期缓存：不碰数据库
    } else {
      // 取数与聚合逻辑照 src/routes/talent.js GET /rate-benchmarks
      const { data, error } = await ctx.supabase
        .from('talents')
        .select('region, rate, skills')
        .not('rate', 'is', null);
      if (error) throw error;

      const parse = (r) => parseFloat(String(r).replace(/[^0-9.]/g, '')) || null;
      const byRegion = {};
      (data || []).forEach((t) => {
        const num = parse(t.rate);
        if (!num) return; // 解析不出数字的行不参与统计
        const key = t.region || 'Other';
        if (!byRegion[key]) byRegion[key] = { rates: [], skills: {} };
        byRegion[key].rates.push(num);
        (t.skills || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => {
          byRegion[key].skills[s] = (byRegion[key].skills[s] || 0) + 1;
        });
      });

      summary = Object.entries(byRegion).map(([region, { rates, skills }]) => {
        rates.sort((a, b) => a - b);
        const avg = rates.reduce((s, v) => s + v, 0) / rates.length;
        const mid = Math.floor(rates.length / 2);
        const median = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
        const top_skills = Object.entries(skills).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
        return {
          region, count: rates.length, avg: Math.round(avg), median: Math.round(median),
          min: rates[0], max: rates[rates.length - 1], top_skills,
        };
      }).sort((a, b) => b.count - a.count);

      ratesCache = { summary, expiresAt: Date.now() + RATES_CACHE_TTL_MS };
    }

    // 过滤在缓存之外做（模糊包含，大小写不敏感）
    let result = summary;
    if (args.region) {
      const kw = args.region.toLowerCase();
      result = result.filter((r) => r.region.toLowerCase().includes(kw));
    }
    if (args.specialty) {
      const kw = args.specialty.toLowerCase();
      result = result.filter((r) => r.top_skills.some((s) => s.toLowerCase().includes(kw)));
    }
    return { currency: 'USD', unit: 'per hour', benchmarks: result };
  },
});

// ── 3. get_certification_info（public）───────────────────────────────────────
// 实现要点：方向清单读 cert_tracks 表（track_key, name_en, name_zh, is_active——
// 照 src/routes/training.js GET /tracks 的查询），规则数字读 src/config/training.js
// （QUESTIONS_PER_EXAM/EXAM_MINUTES/PASS_SCORE/RETAKE_COOLDOWN_DAYS/MAX_LEVEL 等，
// 单一来源，不得硬编码）。track 参数=只返回该方向；L1-L3 等级说明可用
// aiService.js generateExamQuestions 里的 levelDesc 措辞。
register({
  name: 'get_certification_info',
  description:
    'Explain the platform certification system: 4 tracks × levels L1-L3, exam format, ' +
    'pass score, retake cooldown, and why certification is required before on-site assignment. ' +
    'Optionally scoped to one track.',
  parameters: {
    type: 'object',
    properties: {
      track: { type: 'string', description: 'Track key to scope the answer to (omit for all tracks).' },
    },
  },
  roles: ['public'],
  handler: async (args, ctx) => {
    // 方向清单读 cert_tracks 表（照 src/routes/training.js GET /tracks 的查询）
    const { data, error } = await ctx.supabase
      .from('cert_tracks')
      .select('track_key, name_en, name_zh, description')
      .eq('is_active', true)
      .order('id');
    if (error) throw error;

    let tracks = data || [];
    if (args.track) {
      const want = String(args.track).toLowerCase();
      tracks = tracks.filter((t) => String(t.track_key || '').toLowerCase() === want);
      if (tracks.length === 0) {
        const known = (data || []).map((t) => t.track_key).join(', ');
        throw new Error(`Unknown certification track "${args.track}". Available tracks: ${known || '(none)'}`);
      }
    }

    return {
      tracks,
      // L1-L3 等级说明措辞照 aiService.js generateExamQuestions 的 levelDesc
      levels: [
        { level: 'L1', description: 'Entry level — fundamentals, safety basics, common tooling.' },
        { level: 'L2', description: 'Intermediate level — independent commissioning, troubleshooting, integration.' },
        { level: 'L3', description: 'Advanced level — architecture decisions, complex fault diagnosis, leading on-site delivery.' },
      ],
      // 规则数字单一来源 src/config/training.js，绝不硬编码
      rules: {
        questions_per_exam: TRAINING.QUESTIONS_PER_EXAM,
        exam_minutes: TRAINING.EXAM_MINUTES,
        pass_score: TRAINING.PASS_SCORE,
        retake_cooldown_days: TRAINING.RETAKE_COOLDOWN_DAYS,
        max_level: TRAINING.MAX_LEVEL,
        level_progression: 'L1 is open to everyone; taking L(n) requires holding a valid L(n-1) certification in the same track.',
      },
      // 门禁政策措辞照 src/services/certService.js 顶部注释的业务规则
      policy: 'Engineers can browse, apply and communicate without certification, but must hold a valid platform certification before being formally assigned to a project (with a second gate at on-site check-in).',
    };
  },
});

// ── 4. get_my_projects（employer/engineer/admin）─────────────────────────────
// 实现要点（G1：一切按 ctx.user.userId 过滤）：
// - employer：from('demands').select(...).eq('employer_id', ctx.user.userId)
//   （照 src/routes/demand.js GET /my 的模式，可带 project_milestones 关联）。
// - engineer：两跳——先 talents.select('id').eq('user_id', ctx.user.userId) 拿 talent.id，
//   再 demand_applications.eq('engineer_id', talent.id).eq('status','accepted') 关联 demands
//   （关系模型照 src/middleware/ownership.js 注释；不要依赖 demands.assigned_engineer_id
//   单查——applications 路径已从生产库核实，最稳）。
// - admin：可看全量，但仍应 limit 钳制（如 50）。
register({
  name: 'get_my_projects',
  description:
    'List the projects (demands) of the current authenticated user: an employer sees demands ' +
    'they posted; an engineer sees demands they are assigned to; an admin sees recent platform projects.',
  parameters: { type: 'object', properties: {} },
  roles: ['employer', 'engineer', 'admin'],
  handler: async (_args, ctx) => {
    const role = ctx.user.role; // 角色门控已保证 role ∈ employer/engineer/admin
    // demand 字段白名单（照 entV1.js GET /demands 的列），不 select('*')
    const DEMAND_FIELDS = 'id, title, description, region, budget, status, created_at';

    if (role === 'employer') {
      // 照 src/routes/demand.js GET /my：显式按 employer_id = 当前用户 过滤（G1）
      const { data, error } = await ctx.supabase
        .from('demands')
        .select(`${DEMAND_FIELDS}, project_milestones(id, phase_name, status, amount)`)
        .eq('employer_id', ctx.user.userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return { role, projects: data || [] };
    }

    if (role === 'engineer') {
      // 两跳（照 ownership.js 的归属模型）：user_id → talents.id → accepted 申请 → demands
      const { data: talent } = await ctx.supabase
        .from('talents')
        .select('id')
        .eq('user_id', ctx.user.userId)
        .single();
      if (!talent) return { role, projects: [] }; // 无工程师档案 → 没有被指派的项目

      const { data, error } = await ctx.supabase
        .from('demand_applications')
        .select(`status, demands(${DEMAND_FIELDS})`)
        .eq('engineer_id', talent.id)
        .eq('status', 'accepted') // 只看已被正式指派的
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return { role, projects: (data || []).map((r) => r.demands).filter(Boolean) };
    }

    // admin：可看全量，但仍 limit 钳制
    const { data, error } = await ctx.supabase
      .from('demands')
      .select(DEMAND_FIELDS)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return { role, projects: data || [] };
  },
});

// ── 5. get_milestone_status（employer/engineer/admin）────────────────────────
// 实现要点：必须先用 src/middleware/ownership.js 的 assertDemandParticipant(
// ctx.supabase, demandId, ctx.user) 校验当事方（防 IDOR）；不允许/不存在一律
// throw new Error('Project not found or you are not a participant')——不区分二者，
// 防 id 枚举探测（照 entV1.js milestones 端点的做法）。通过后查 project_milestones
// .select('id, phase_name, percentage, amount, status, created_at')（白名单，勿 select('*')）。
register({
  name: 'get_milestone_status',
  description:
    'Get the milestone list and payment status for one project (demand) the current user ' +
    'participates in (as employer, assigned/applied engineer, or admin).',
  parameters: {
    type: 'object',
    properties: {
      demandId: { type: 'integer', minimum: 1, description: 'The demand (project) id.' },
    },
    required: ['demandId'],
  },
  roles: ['employer', 'engineer', 'admin'],
  handler: async (args, ctx) => {
    // 防 IDOR：先当事方校验；"不存在"与"无权限"统一同一文案，
    // 不区分二者防 id 枚举探测（照 entV1.js milestones 端点的做法）。
    const { allowed } = await assertDemandParticipant(ctx.supabase, args.demandId, ctx.user);
    if (!allowed) throw new Error('Project not found or you are not a participant');

    const { data, error } = await ctx.supabase
      .from('project_milestones')
      .select('id, phase_name, percentage, amount, status, created_at') // 白名单，勿 select('*')
      .eq('demand_id', args.demandId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { demandId: args.demandId, milestones: data || [] };
  },
});

// ── 6. get_admin_analytics（admin）───────────────────────────────────────────
// 实现要点：只读聚合，一行搞定——ctx.supabase.rpc('admin_analytics_summary')
// （SQL 函数在 migrations/021_offline_field_admin.sql，已在生产；用法照
// src/routes/admin.js 第 146 行）。返回 rpc 的 jsonb 结果原样。
register({
  name: 'get_admin_analytics',
  description:
    'Platform-wide aggregate analytics for admins (user/demand/milestone counts and totals). ' +
    'Read-only summary; no per-user personal data.',
  parameters: { type: 'object', properties: {} },
  roles: ['admin'],
  handler: async (_args, ctx) => {
    // 只读聚合下推到 SQL（migrations/021 的 admin_analytics_summary；用法照 admin.js:146）
    const { data, error } = await ctx.supabase.rpc('admin_analytics_summary');
    if (error) throw error;
    return data;
  },
});
