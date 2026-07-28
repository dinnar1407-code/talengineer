// ── 写工具（9 个：5 个 T1 write + 4 个 T2 confirm）───────────────────────────
// 通用约束同 readTools.js 顶部注释（ctx 形状 / G1 身份 scope / 错误处理）。
// 分层含义与红线见 src/tools/registry.js 的 VALID_TIERS 注释——简言之：
//   write   可逆、只动自己的东西 → 直接执行 + write-ahead 审计
//   confirm 有对外后果、收不回来 → agent 只能提案，用户点确认才执行
// 注册表里永远不会有资金/发证/纠纷裁决/封号类工具，那条红线不随本文件增长而松动。
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ 永久不可入册的 admin 端点（2026-07-27 全量审计 9 个 admin 写端点后定稿） ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// 这段放在本文件头，是因为下一个人要加"能改东西的 admin 工具"时，第一个打开的就是
// 这里（read 层的 admin 工具只会读，从来不是问题）。边界在他动手之前就已经画好。
// 以下七个端点【永远不做成工具，连确认卡也不行】——不是"暂缓"，是不提供这个能力：
//
//   1. PUT  /api/admin/demands/:id/fee     设定平台抽佣比例 —— 资金。
//   2. PUT  /api/disputes/:id/resolve      纠纷裁决，经 Stripe 真的搬钱 —— 资金 + 裁决。
//   3. PUT  /api/certifications/:id/review  外部资质核验 —— 发证。
//   4. POST /api/training/admin/:id/review  写 platform_certifications —— 发证。
//   5. PUT  /api/admin/kyc/:userId         企业实名通过/驳回 —— 合规裁决，驳回=不能开工。
//   6. PUT  /api/bgcheck/admin/:id         背调通过/失败（'failed' 不写 expires_at，永久）。
//   7. POST /api/tax/admin/:id/review      W-9 受理/驳回 —— 驳回=收不到钱。
//
// 5/6/7 是对【真实的人】的合规裁决：一次驳回就让人无法开工或无法收款，与封号同一族。
// 它们还有最糟糕的提示词注入形状——agent 要读的材料正是由"希望被通过的那一方"提交的，
// 一句藏在备注里的指令就可能换来一个通过。排除它们是有意为之，不是漏了。
// （只读镜像不在此列：list_pending_kyc 就是只读的，看得见、批不了。）
//
// 同理不做：DELETE /api/pipeline/:id 的删除工具——删除不可逆，而真实工作流是把线索
// 推进到 stage='lost'（记录还在、能复盘）。删除留在 UI 上由人手点。
const { register } = require('./registry');
const { sendMessage, MAX_CONTENT_LENGTH } = require('../services/messageService');
const { STAGES, PATCHABLE_FIELDS, createLead, updateLead } = require('../services/pipelineService');

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
  // write 而非 confirm：草稿是私有的，不上架、不撮合、不注资，改错了自己删掉即可——
  // 属于可逆写。真正的发布仍要用户在 UI 点，那才是有业务后果的一步。
  tier: 'write',
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

// ── 11. update_my_profile（engineer，T1 可逆写）──────────────────────────────
// 为什么是 write 不是 confirm：改的是自己的档案，改错了再改回来即可，没有对外后果。
// 逻辑与 PUT /api/talent/profile（src/routes/talent.js:210）保持一致——包括"工程师
// 首次调用时创建档案行"那条（2026-07-16 修的：Dashboard 注册的工程师不带 engName，
// 注册时不会建 talents 行）。⚠️ 两处逻辑是各自实现的，改一处记得看另一处。
register({
  name: 'update_my_profile',
  description:
    'Update the current engineer\'s own public profile (bio, skills, region, rate, pricing model, ' +
    'availability). Only fields you pass are changed; omitted fields keep their current values. ' +
    'This affects how the engineer appears in search and matching.',
  parameters: {
    type: 'object',
    properties: {
      bio: { type: 'string', maxLength: 4000, description: 'Short professional bio.' },
      skills: { type: 'string', maxLength: 1000, description: 'Comma-separated skills, e.g. "Siemens TIA Portal, SCADA".' },
      region: { type: 'string', maxLength: 120, description: 'Where the engineer works, e.g. "Mexico (MX)".' },
      rate: { type: 'string', maxLength: 60, description: 'Rate as displayed, e.g. "$95/hr" or "Open".' },
      pricing_model: { type: 'string', enum: ['hourly', 'milestone'], description: 'How the engineer prices work.' },
      availability: {
        type: 'string',
        enum: ['available', 'busy', 'unavailable'],
        description: 'Current availability for new projects.',
      },
    },
    required: [],
  },
  roles: ['engineer'],
  tier: 'write',
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;
    // 只取本次显式给出的字段：把 undefined 一起写进去会把没提到的列覆盖成 null
    const updates = {};
    for (const k of ['bio', 'skills', 'region', 'rate', 'pricing_model', 'availability']) {
      if (args[k] !== undefined) updates[k] = args[k];
    }
    if (Object.keys(updates).length === 0) {
      throw new Error('Tell me which part of the profile to change (bio, skills, region, rate, pricing model, or availability).');
    }

    // G1：档案只能按已验证身份定位，绝不接受参数指定的 user_id
    const { data: talent, error: findErr } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', ctx.user.userId)
      .maybeSingle();
    if (findErr) {
      console.error('[writeTools] update_my_profile lookup failed:', findErr);
      throw new Error('Could not load your profile. Please try again.');
    }

    if (!talent) {
      // 档案还没建（OAuth 注册或 Dashboard 注册的工程师）：首次调用即创建，
      // 默认值与 auth.js 注册路径一致，分数 0 起步走正常筛选提升。
      const { data: userRow } = await supabase
        .from('users').select('name, email').eq('id', ctx.user.userId).maybeSingle();
      const email = userRow?.email || ctx.user.email || '';
      const { data: created, error: createErr } = await supabase
        .from('talents')
        .insert([{
          user_id: ctx.user.userId,
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
        }])
        .select('id, bio, skills, region, rate, pricing_model, availability')
        .single();
      if (createErr) {
        console.error('[writeTools] update_my_profile create failed:', createErr);
        throw new Error('Could not save your profile. Please try again.');
      }
      return created;
    }

    const { data, error } = await supabase
      .from('talents')
      .update(updates)
      .eq('id', talent.id)
      .select('id, bio, skills, region, rate, pricing_model, availability') // 白名单，勿 select('*')
      .single();
    if (error) {
      console.error('[writeTools] update_my_profile update failed:', error);
      throw new Error('Could not save your profile. Please try again.');
    }
    return data;
  },
});

// ── 12. update_demand_draft（employer，T1 可逆写）───────────────────────────
// 只能改【自己的】【还是 draft 的】需求。两个条件都写进 where，缺一不可：
// 少了 employer_id 就能改别人的单；少了 status='draft' 就能改已经上架、可能已经
// 有人投递甚至已注资的活单——那是 T2/T3 的事，绝不能由这个 T1 工具顺手做掉。
register({
  name: 'update_demand_draft',
  description:
    'Edit one of the current employer\'s own project drafts. Only drafts can be edited this way — ' +
    'published projects are not touched. Only fields you pass are changed.',
  parameters: {
    type: 'object',
    properties: {
      demand_id: { type: 'integer', minimum: 1, description: 'Which draft to edit.' },
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', minLength: 1, maxLength: 8000 },
      budget: { type: ['string', 'number'], description: 'Budget in USD (stored as text).' },
      region: { type: 'string', minLength: 1, maxLength: 120 },
      role_required: { type: 'string', maxLength: 300 },
    },
    required: ['demand_id'],
  },
  roles: ['employer'],
  tier: 'write',
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;
    const updates = {};
    for (const k of ['title', 'description', 'region', 'role_required']) {
      if (args[k] !== undefined) updates[k] = args[k];
    }
    if (args.budget !== undefined) updates.budget = String(args.budget); // budget 是文本列
    if (Object.keys(updates).length === 0) {
      throw new Error('Tell me what to change in the draft (title, description, budget, region, or required role).');
    }

    const { data, error } = await supabase
      .from('demands')
      .update(updates)
      .eq('id', args.demand_id)
      .eq('employer_id', ctx.user.userId) // G1 属主门禁
      .eq('status', 'draft')              // 只碰草稿，活单一律不动
      .select('id, title, description, region, budget, role_required, status')
      .maybeSingle();
    if (error) {
      console.error('[writeTools] update_demand_draft failed:', error);
      throw new Error('Could not update the draft. Please try again.');
    }
    if (!data) {
      // 三种情况合并一句话：不存在 / 不是你的 / 已经发布了。分开说等于帮人探测别人的单号。
      throw new Error('No editable draft found with that id. It may already be published, or it is not yours.');
    }
    return data;
  },
});

// ── 13. apply_to_demand（engineer，T2 状态迁移——必须用户确认）───────────────
// 为什么是 confirm 不是 write：投递一旦发出，雇主那边就看到了、也收到了通知，收不回来。
// agent 绝不直接执行——registry 先回「提案 + 确认令牌」，用户在卡片上点了才走
// /api/agent/confirm 真正执行。
//
// ⚠️ G3 注记（Phase 1 定的"注册表里无任何外发工具"）：本工具会触发给雇主的邮件与站内
// 通知，因为它照搬 POST /api/demand/apply（src/routes/demand.js:415）的完整行为——
// 让「在聊天里投递」和「在页面上点投递」结果完全一致，两条路分叉比这个口子更危险。
// 这里的外发是【用户亲手确认的业务动作的副作用】，不是给 agent 一个"发消息"的能力，
// 与 G3 要防的东西不是一回事。但这确实是 G3 的第一次让步，需要 Terry 知情。
register({
  name: 'apply_to_demand',
  description:
    'Apply the current engineer to a published project. This is visible to the employer immediately ' +
    'and cannot be undone, so it always requires explicit user confirmation before it runs.',
  parameters: {
    type: 'object',
    properties: {
      demand_id: { type: 'integer', minimum: 1, description: 'The project to apply to.' },
      message: { type: 'string', maxLength: 2000, description: 'Cover note to the employer.' },
      quoted_rate: { type: 'string', maxLength: 60, description: 'Optional quoted rate, e.g. "$95/hr".' },
      quoted_days: { type: 'integer', minimum: 1, maximum: 3650, description: 'Optional estimated days.' },
      quote_amount: { type: 'number', minimum: 0, description: 'Optional total quote in USD.' },
    },
    required: ['demand_id'],
  },
  roles: ['engineer'],
  tier: 'confirm',
  // 显式声明外发副作用（见 registry 的 VALID_SIDE_EFFECTS 注释）：名字扫描抓不到
  // "apply_to_demand 会发邮件"这件事，所以必须自报。注册期会强制它只能是 confirm 层。
  sideEffects: ['email', 'notification'],
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;

    // G1：投递人只能是已验证身份对应的工程师档案
    const { data: talent, error: tErr } = await supabase
      .from('talents')
      .select('id, name')
      .eq('user_id', ctx.user.userId)
      .maybeSingle();
    if (tErr) {
      console.error('[writeTools] apply_to_demand talent lookup failed:', tErr);
      throw new Error('Could not load your engineer profile. Please try again.');
    }
    if (!talent) throw new Error('You need an engineer profile before applying. Please complete your profile first.');

    // 只能投已上架的单：draft/closed 都不该出现在投递目标里
    const { data: demand, error: dErr } = await supabase
      .from('demands')
      .select('id, title, contact, status')
      .eq('id', args.demand_id)
      .maybeSingle();
    if (dErr) {
      console.error('[writeTools] apply_to_demand demand lookup failed:', dErr);
      throw new Error('Could not load that project. Please try again.');
    }
    if (!demand || demand.status !== 'open') {
      throw new Error('That project is not open for applications.');
    }

    const { error } = await supabase.from('demand_applications').insert({
      demand_id: args.demand_id,
      engineer_id: talent.id,
      message: args.message || '',
      quoted_rate: args.quoted_rate || null,
      quoted_days: args.quoted_days ?? null,
      quote_amount: args.quote_amount ?? null,
    });
    if (error) {
      if (error.code === '23505') throw new Error('You have already applied to this project.');
      console.error('[writeTools] apply_to_demand insert failed:', error);
      throw new Error('Could not submit your application. Please try again.');
    }

    // 通知雇主：与 POST /api/demand/apply 同款（fire-and-forget，失败不回滚投递——
    // 投递已经落库了，通知发不出去是可补救的，把成功的投递报成失败才是错的）
    if (demand.contact) {
      const { emailNewApplication } = require('../services/email');
      const { createNotification } = require('../services/notificationService');
      emailNewApplication({
        employerEmail: demand.contact,
        projectTitle: demand.title,
        engineerName: talent.name,
        applicationMessage: args.message,
      }).catch((e) => console.error('[writeTools] apply notify email failed:', e));
      createNotification({
        user_email: demand.contact,
        type: 'new_application',
        title: `New application for "${demand.title}"`,
        body: `${talent.name} has applied to your project.`,
        link: '/finance',
        demand_id: Number(args.demand_id),
      });
    }

    return { demand_id: Number(args.demand_id), project_title: demand.title, applied: true };
  },
});

// ── 14. publish_demand_draft（employer，T2 状态迁移——必须用户确认）──────────
// 把自己的一份草稿上架。为什么是 confirm：上架后全站工程师都能看到并投递，
// 撤回不了已经看过的人。属主与状态两个条件都写进 where，理由同 update_demand_draft。
//
// 顺带补一个真实缺口：create_demand_draft 不写 contact 列，而 apply_to_demand /
// POST /api/demand/apply 都是靠 demand.contact 决定给谁发"有人投递了"的通知——
// 草稿直接上架的话，雇主永远收不到投递通知。这里上架时把 contact 补成雇主自己的邮箱。
register({
  name: 'publish_demand_draft',
  description:
    'Publish one of the current employer\'s own drafts so engineers can see and apply to it. '
    + 'Once published it is visible platform-wide, so this always requires explicit user confirmation.',
  parameters: {
    type: 'object',
    properties: {
      demand_id: { type: 'integer', minimum: 1, description: 'Which draft to publish.' },
    },
    required: ['demand_id'],
  },
  roles: ['employer'],
  tier: 'confirm',
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;

    const { data: draft, error: findErr } = await supabase
      .from('demands')
      .select('id, title, status, contact')
      .eq('id', args.demand_id)
      .eq('employer_id', ctx.user.userId) // G1 属主门禁
      .maybeSingle();
    if (findErr) {
      console.error('[writeTools] publish_demand_draft lookup failed:', findErr);
      throw new Error('Could not load that draft. Please try again.');
    }
    // 不存在 / 不是你的 合并成一句话，避免帮人探测别人的单号
    if (!draft) throw new Error('No draft found with that id, or it is not yours.');
    if (draft.status !== 'draft') throw new Error(`That project is already ${draft.status}, so there is nothing to publish.`);

    const updates = { status: 'open' };
    // contact 缺失就补雇主自己的邮箱，否则上架后收不到任何投递通知
    if (!draft.contact) updates.contact = ctx.user.email || null;

    const { data, error } = await supabase
      .from('demands')
      .update(updates)
      .eq('id', args.demand_id)
      .eq('employer_id', ctx.user.userId)
      .eq('status', 'draft') // 并发防护：两次确认同时到达时，第二次会匹配不到行
      .select('id, title, status')
      .maybeSingle();
    if (error) {
      console.error('[writeTools] publish_demand_draft failed:', error);
      throw new Error('Could not publish the draft. Please try again.');
    }
    if (!data) throw new Error('That draft was already published.');
    return data;
  },
});

// ── 15. assign_engineer（employer，T2 状态迁移——必须用户确认）───────────────
// 指派是本批里后果最重的一个动作：项目转 in_progress、被选中的申请置 accepted、
// **其余所有待处理申请一律置 rejected**。最后这条从参数上完全看不出来，所以确认卡
// 上专门有一行后果说明（ChatBot 的 confirmNote），别把它删了。
//
// 三道门禁与 POST /api/demand/assign 完全一致，一条都不能少：
//   属主校验（防 IDOR）→ 该工程师确实投过这个项目（防自指派成收款方）→ 认证门禁。
// 认证门禁复用 certService.checkAssignEligibility，不在这里重写规则。
register({
  name: 'assign_engineer',
  description:
    'Assign an engineer who applied to one of the current employer\'s projects. This starts the '
    + 'project, accepts that engineer, and REJECTS all other pending applicants. Always requires '
    + 'explicit user confirmation.',
  parameters: {
    type: 'object',
    properties: {
      demand_id: { type: 'integer', minimum: 1, description: 'The employer\'s own project.' },
      engineer_id: { type: 'integer', minimum: 1, description: 'talents.id of an engineer who already applied.' },
    },
    required: ['demand_id', 'engineer_id'],
  },
  roles: ['employer'],
  tier: 'confirm',
  sideEffects: ['email', 'notification'],
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;
    const { checkAssignEligibility } = require('../services/certService');

    // 门禁 1：属主（防 IDOR——指派别人项目里的工程师）
    const { data: demand, error: dErr } = await supabase
      .from('demands')
      .select('id, employer_id, title, contact, required_cert_track, status')
      .eq('id', args.demand_id)
      .maybeSingle();
    if (dErr) {
      console.error('[writeTools] assign_engineer demand lookup failed:', dErr);
      throw new Error('Could not load that project. Please try again.');
    }
    if (!demand || demand.employer_id !== ctx.user.userId) {
      throw new Error('No project found with that id, or it is not yours.');
    }

    // 门禁 2：该工程师确实投过这个项目（防把没投过的人设成收款方）
    const { data: application, error: aErr } = await supabase
      .from('demand_applications')
      .select('id')
      .eq('demand_id', args.demand_id)
      .eq('engineer_id', args.engineer_id)
      .maybeSingle();
    if (aErr) {
      console.error('[writeTools] assign_engineer application lookup failed:', aErr);
      throw new Error('Could not check applications. Please try again.');
    }
    if (!application) throw new Error('That engineer has not applied to this project.');

    // 门禁 3：认证（现场正式工作授权）——规则在 certService，这里只转述结论
    const eligibility = await checkAssignEligibility(supabase, args.engineer_id, demand.required_cert_track || null);
    if (!eligibility.allowed) {
      throw new Error(eligibility.reason === 'missing_required_track'
        ? `That engineer does not hold the required "${demand.required_cert_track}" platform certification for on-site work.`
        : 'That engineer has not earned a platform certification yet, which is required before on-site assignment. They can get certified at /training.');
    }

    const { error: upErr } = await supabase
      .from('demands')
      .update({ assigned_engineer_id: args.engineer_id, status: 'in_progress' })
      .eq('id', args.demand_id)
      .eq('employer_id', ctx.user.userId);
    if (upErr) {
      console.error('[writeTools] assign_engineer update failed:', upErr);
      throw new Error('Could not assign the engineer. Please try again.');
    }

    // 申请状态流转：中选的 accepted，其余待处理的 rejected（与路由同款）
    await supabase.from('demand_applications')
      .update({ status: 'accepted' })
      .eq('demand_id', args.demand_id).eq('engineer_id', args.engineer_id);
    await supabase.from('demand_applications')
      .update({ status: 'rejected' })
      .eq('demand_id', args.demand_id).neq('engineer_id', args.engineer_id).eq('status', 'pending');

    // 通知工程师（fire-and-forget，同 apply_to_demand 的理由：指派已落库，
    // 通知发不出去是可补救的，把成功的指派报成失败才是错的）
    const { data: talent } = await supabase
      .from('talents').select('name, contact').eq('id', args.engineer_id).maybeSingle();
    if (talent?.contact && demand.title) {
      const { emailEngineerAssigned } = require('../services/email');
      const { createNotification } = require('../services/notificationService');
      emailEngineerAssigned({
        engineerEmail: talent.contact,
        engineerName: talent.name,
        projectTitle: demand.title,
        clientContact: demand.contact,
      }).catch((e) => console.error('[writeTools] assign notify email failed:', e));
      createNotification({
        user_email: talent.contact,
        type: 'engineer_assigned',
        title: `You've been assigned to "${demand.title}"`,
        body: 'Congratulations! You have been selected for this project.',
        link: '/engineer/profile',
        demand_id: Number(args.demand_id),
      });
    }

    return {
      demand_id: Number(args.demand_id),
      engineer_id: Number(args.engineer_id),
      project_title: demand.title,
      engineer_name: talent?.name || null,
      status: 'in_progress',
    };
  },
});

// ── 16. send_project_message（双方，T2——必须用户确认）───────────────────────
// ⚠️ 这一条明确越过了 apply_to_demand 注释划的那条线：那里的外发是"用户亲手确认的业务
// 动作的副作用，不是给 agent 一个裸的发消息能力"，而本工具【就是】那个裸能力，是有意加的。
// Terry 2026-07-27 拍板：安全等级与 apply_to_demand 一致即可——确认卡会把每一个参数
// （含完整正文）原样摆给用户看过之后才发得出去，那张卡就是设计上的防线；不加关键词/内容过滤。
// 逻辑本身不在这里实现：与 POST /api/messages 共用 services/messageService.js 的唯一实现，
// 归属校验与邮件防轰炸两段永远不会在两条路径上分叉。
register({
  name: 'send_project_message',
  description:
    'Send a message in an ongoing project\'s chat thread to the other party (employer ↔ engineer — '
    + 'either the assigned engineer or an applicant already party to this project\'s thread). The '
    + 'other party sees it immediately and it cannot be unsent, so this always requires explicit '
    + 'user confirmation before it runs.',
  parameters: {
    type: 'object',
    properties: {
      demand_id: { type: 'integer', minimum: 1, description: 'The project whose thread to post in.' },
      content: { type: 'string', minLength: 1, maxLength: MAX_CONTENT_LENGTH, description: 'The message text to send.' },
    },
    required: ['demand_id', 'content'],
  },
  // 线程两端都可能想发：雇主发给被指派的工程师，工程师发给雇主。谁是这单的当事方由
  // messageService 里的 assertDemandParticipant 判定，不靠角色本身放行。
  roles: ['employer', 'engineer'],
  tier: 'confirm',
  sideEffects: ['email', 'notification'],
  handler: async (args, ctx) => {
    // clientMsgId 不传：agent 调用永远是"在线"的，没有离线重放场景（幂等靠 registry 的
    // 近重复防护 + 确认令牌绑死 argsHash）。因此返回里的 deduped 结构上不可能为 true。
    const { message } = await sendMessage({
      supabase: ctx.supabase,
      user: ctx.user,
      demandId: args.demand_id,
      content: args.content,
    });
    return {
      demand_id: Number(args.demand_id),
      message_id: message?.id ?? null,
      sent: true,
    };
  },
});

// ── 17/18. 撮合看板 create/update_pipeline_lead（admin，T1 可逆写）────────────
// 为什么是 write 而不是 confirm——这是本批最需要讲清楚的一条：
// 改的是【平台自己的内部销售线索笔记】（matchmaking_pipeline，迁移 020，人工撮合 PMF
// 实验的看板）。没有任何平台用户受影响，不发任何东西给任何人，写错了再改回来就是了。
// 按 registry 的分层定义（VALID_TIERS 注释）这就是 write：直接执行 + write-ahead 审计。
// 因此两者都【不声明 sideEffects】。
// 反过来说：给每条 CRM 备注配一张确认卡，会把"边聊边记"这件事本身毁掉（对话价值全在
// 顺手），却换不来任何安全性——被改坏的只有平台自己的笔记，而且每一次改动都在
// agent_actions 里留着账。真正有后果的 admin 动作在本文件头部的红线里，一个都不入册。
//
// 访问控制不在这里实现：roles:['admin'] 之外，registry.call 还强制 ctx.user.adm2fa===true
// （与后台 TOTP 同一条杠），普通登录签出的 admin 令牌调不动这两个工具。

register({
  name: 'create_pipeline_lead',
  description:
    'Add a company to the internal matchmaking pipeline board (the platform\'s own admin-only '
    + 'sales-lead notes). The new lead always starts at stage "lead". Nothing is sent to the '
    + 'company — this only writes an internal note.',
  parameters: {
    type: 'object',
    properties: {
      company: { type: 'string', minLength: 1, maxLength: 200, description: 'Company name for this lead.' },
      line: {
        type: 'string',
        enum: ['cn', 'us'],
        description: 'Which line this lead belongs to: "cn" (Chinese manufacturers going abroad) or "us" (US domestic). Defaults to "cn".',
      },
      // ⚠️ 列名叫 contact，参数【不能】也叫 contact：registry 的 G1 机械防线
      // （FORBIDDEN_PARAM_NAMES）在注册期就会把 contact 判成"调用方自报身份"并拒绝注册。
      // 这里存的其实是【客户公司那边的】联系人，与调用者身份毫无关系，但那道正则是机械的，
      // 按 G1 注记的要求改名而不是放宽正则——放宽一次，真正的身份字段下次就混进来了。
      contact_person: {
        type: 'string',
        maxLength: 200,
        description: 'Who to talk to at that company (name and/or how to reach them). Stored in the board\'s contact column.',
      },
      note: { type: 'string', maxLength: 4000, description: 'Free-form internal note about this lead.' },
    },
    required: ['company'],
  },
  roles: ['admin'],
  tier: 'write',
  handler: async (args, ctx) => createLead({
    supabase: ctx.supabase,
    company: args.company,
    line: args.line,
    contact: args.contact_person, // 参数名 → 列名的唯一映射点（改名理由见上）
    note: args.note,
  }),
});

register({
  name: 'update_pipeline_lead',
  description:
    'Update one lead on the internal matchmaking pipeline board: move it to another stage, '
    + 'edit the internal note or next action, or link/unlink a project. '
    + 'ONLY the fields you actually pass are changed — anything you leave out keeps its current '
    + 'value. To deliberately clear a field, pass it as an empty string. '
    + 'Leads are never deleted; a lead that goes nowhere is moved to stage "lost".',
  parameters: {
    type: 'object',
    properties: {
      id: { type: 'integer', minimum: 1, description: 'Which lead to update (id from list_pipeline_leads).' },
      stage: { type: 'string', enum: STAGES, description: 'Move the lead to this stage.' },
      // ── 部分更新语义怎么在 schema 里表达 ────────────────────────────────────
      // 三种意图必须彼此可分，而且不能靠 null（本 schema 里根本没有 null 这个类型，
      // 见下方 demand_id 注释）：
      //   不传这个键        → 该列不动（zod 对缺省 optional 不会造键；服务层再用
      //                        `!== undefined` 兜一道，两种形状都安全）
      //   传空串 ''         → 显式清空成 NULL（服务层 `x || null`，与路由逐字同源）
      //   传有内容的字符串   → 写入
      // 所以这几个字段【绝不能】加 minLength:1——加了就再也表达不出"清空"，
      // 模型只能改成别的内容或者干脆不动它。
      note: { type: 'string', maxLength: 4000, description: 'Internal note. Empty string clears it.' },
      next_action: { type: 'string', maxLength: 500, description: 'What to do next. Empty string clears it.' },
      next_action_at: {
        type: 'string',
        maxLength: 40,
        description: 'When to do it, ISO 8601 (e.g. "2026-08-01T09:00:00Z"). Empty string clears it.',
      },
      // demand_id 同时收整数与字符串，与路由的 Number(demand_id) 一致（路由本来就接受
      // "5" 这种字符串），并让空串 '' 表达"解除关联"。为什么不用 type:['integer','null']：
      // registry 的 JSON Schema→zod 转换没有 'null' 分支，会退化成 z.any()，等于整个字段
      // 不再校验——为了表达一个"清空"把类型校验整个废掉，代价远大于收益。
      //
      // ⚠️ union 里【string 必须排在前面】，且不能带 minimum：agentService 的
      // toGeminiSchema 不支持 union，一律取 value[0] 降级（见那里的注释），所以模型看到的
      // 就是第一项。写成 ['integer','string'] + minimum:1 的话，模型拿到的是
      // "integer, minimum 1"——它根本发不出 '' 这个值，"解除关联"在对话里就是死路一条，
      // 而这恰恰是这批工具存在的意义。仓库里其他 union（如 budget:['string','number']）
      // 也都是把宽松那一项放在前面，同一个道理。
      // 顺带：maxLength 挂在 integer 上是全注册表唯一一处类型/约束错配，而 Gemini v1beta
      // 对非法键是整个请求 400（不是忽略该字段）——那会打挂 admin 的每一轮对话，不止这个工具。
      // 数值合法性不靠 schema：0/-3/2.5 由 pipelineService 拒掉，错误文案还更像人话。
      demand_id: {
        type: ['string', 'integer'],
        maxLength: 20,
        description: 'Link this lead to a project id. Empty string unlinks it.',
      },
    },
    required: ['id'],
  },
  roles: ['admin'],
  tier: 'write',
  handler: async (args, ctx) => {
    // 工具侧前置条件（与 update_my_profile / update_demand_draft 同款）：一个字段都没给
    // 就别浪费一次审计写入 + 一次 UPDATE 去空转 updated_at。注意这【不是】部分更新逻辑
    // 的一部分——patch 怎么建仍然只有 pipelineService.buildUpdatePatch 一份实现，
    // 这里只判断"你到底想改什么"。
    if (!PATCHABLE_FIELDS.some((k) => args[k] !== undefined)) {
      throw new Error('Tell me what to change on that lead (stage, note, next action, when, or which project it is linked to).');
    }
    // args 整个交给服务层：**键的有无就是意图**。在这里先解构再重组，正是把
    // "没传"变成 "undefined→null" 的那一步——所以这里一个字段都不摘。
    return updateLead({ supabase: ctx.supabase, id: args.id, fields: args });
  },
});
