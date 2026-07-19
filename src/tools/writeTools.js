// ── 写工具（首批仅 1 个，Phase 1；G2：注册表里唯一的写操作）─────────────────
// 形状已定稿（实现者勿改 name/parameters/roles）；handler 由实现 agent 填充。
// 通用约束同 readTools.js 顶部注释（ctx 形状 / G1 身份 scope / 错误处理）。
const { register } = require('./registry');

// ── 10. create_demand_draft（employer）───────────────────────────────────────
// 实现要点：
// - insert demands 照 src/routes/entV1.js POST /demands 的模式，但两处不同：
//   employer_id = ctx.user.userId（G1，绝不接受参数指定），status = 'draft'（G2，
//   唯一允许的落库状态——发布=用户在 UI 点「确认发布」走现有端点，不经过本工具）。
// - budget 是文本列：落库前统一 String(budget)（entV1 同款）。
// - 返回白名单字段 id, title, description, region, budget, status, created_at。
//
// ⚠️ 安全项（不是可选项，随本工具实现一起落地）——草稿泄漏面已排查（2026-07-18）：
// - src/routes/demand.js GET /:id（约 391 行）：公开单查 select('*') 无 status 过滤，
//   草稿可被 id 枚举读到 → 必须排除 draft（如查到 status==='draft' 按 404 返回；
//   该路由无鉴权，无法做属主例外，草稿的查看走 get_my_projects / 雇主自己的列表）。
// - src/routes/talent.js GET /demands（约 27 行）：已 eq('status','open')，安全，勿动。
// - pages/sitemap.xml.jsx：已 eq('status','open')，安全，勿动。
// - src/routes/demand.js GET /my、entV1.js GET /demands：属主视角，草稿可见是预期行为。
register({
  name: 'create_demand_draft',
  description:
    'Save a project demand as a DRAFT for the current employer. Drafts are private, never ' +
    'listed publicly, and never matched or funded — the user must explicitly publish it in the ' +
    'UI to make it live. This is the only write tool available to the assistant.',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200, description: 'Project title.' },
      description: {
        type: 'string',
        minLength: 1,
        maxLength: 8000,
        description: 'Standardized project description / scope of work.',
      },
      budget: {
        type: ['string', 'number'],
        description: 'Budget in USD, e.g. 12000 or "$12,000" (stored as text).',
      },
      region: { type: 'string', minLength: 1, maxLength: 120, description: 'Project region, e.g. "Mexico".' },
      role_required: {
        type: 'string',
        maxLength: 300,
        description: 'Roles/skills required, e.g. "Senior PLC Programmer, Siemens S7-1500".',
      },
      project_type: { type: 'string', maxLength: 120, description: 'Optional project type label.' },
      location: { type: 'string', maxLength: 200, description: 'Optional site location.' },
    },
    required: ['title', 'description', 'budget', 'region'],
  },
  roles: ['employer'],
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;

    // 插入行照 entV1.js POST /demands 的模式；G1/G2 两处硬编码：
    // - employer_id 只来自已验证身份（ctx.user.userId），G1 机械防线也保证参数里不可能有它；
    // - status 写死 'draft'——发布必须由用户在 UI 点「确认发布」走现有端点，工具永远发不了单。
    const row = {
      employer_id: ctx.user.userId,
      title: args.title,
      description: args.description,
      budget: String(args.budget), // budget 是文本列，数字统一转字符串（entV1 同款）
      region: args.region,
      status: 'draft',
    };
    // 可选列：仅在提供时写入，避免把 undefined 显式落成 null 覆盖默认
    if (args.role_required) row.role_required = args.role_required;
    if (args.project_type) row.project_type = args.project_type;
    if (args.location) row.location = args.location;

    const { data, error } = await supabase
      .from('demands')
      .insert([row])
      .select('id, title, description, region, budget, status, created_at') // 返回白名单，勿 select('*')
      .single();
    if (error) {
      console.error('[writeTools] create_demand_draft insert failed:', error);
      throw new Error('Failed to save the draft. Please try again.');
    }
    return data;
  },
});
