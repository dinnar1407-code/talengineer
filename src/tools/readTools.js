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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
});

// ── 2. get_rates（public）────────────────────────────────────────────────────
// 实现要点：复用 src/routes/talent.js GET /rate-benchmarks 的取数与聚合逻辑
// （from('talents').select('region, rate, skills').not('rate','is',null)，按区域聚合
// avg/median/min/max/top_skills）；region 参数过滤聚合结果里的区域（模糊包含），
// specialty 参数过滤 top_skills 命中的区域或按技能出现次数给出费率区间。
// 注意 talent.js 里有 5 分钟进程内缓存（benchmarkCache）——本工具自行聚合时也应
// 避免高频全表拉取（可以简单复算，量小；或加同样的 TTL 缓存）。
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
});
