// ── 写工具（6 个：3 个 T1 write + 3 个 T2 confirm）───────────────────────────
// 通用约束同 readTools.js 顶部注释（ctx 形状 / G1 身份 scope / 错误处理）。
// 分层含义与红线见 src/tools/registry.js 的 VALID_TIERS 注释——简言之：
//   write   可逆、只动自己的东西 → 直接执行 + write-ahead 审计
//   confirm 有对外后果、收不回来 → agent 只能提案，用户点确认才执行
// 注册表里永远不会有资金/发证/纠纷裁决/封号类工具，那条红线不随本文件增长而松动。
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
