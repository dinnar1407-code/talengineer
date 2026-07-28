// ── AI-Native 工具注册表（Phase 1 地基）───────────────────────────────────────
// 职责：register（注册期红线校验 + 由 JSON Schema 预编译 zod 验证器）、
//       list（按角色过滤可见工具）、call（角色门控 → 参数校验 → 执行 → 统一包装，
//       绝不向上抛裸异常——agent 循环/MCP 适配器拿到的永远是 {ok, ...} 结构）。
//
// 三条红线（来源=已批准的 AI-Native 改造方案；G1 在注册期机械防守）：
//   G1 身份字段禁入参：任何工具的 parameters 禁止出现 userId/email 类身份字段，
//      身份只能来自 ctx.user（已验证 JWT，形状 { userId, email, role }——与
//      src/middleware/auth.js 的 req.user 完全一致，注意是 userId 不是 id）；
//      handler 内所有查询必须显式 scope 到 ctx.user.userId（service key 无 RLS 兜底）。
//   G2 注册表里永远不存在 资金（注资/放款/退款）、发证、纠纷裁决 类工具；
//      唯一写工具 create_demand_draft 只落 status='draft'。
//   G3 外发（邮件/推送/SMS）能力必须显式声明 sideEffects 且只能是 tier='confirm'。
//      原文是"无任何外发工具"，2026-07-27 由 Terry 拍板收窄为本条：send_project_message
//      有意提供了"在项目线程里发消息"这个裸外发能力，防线改由确认卡承担（用户看过完整
//      参数后亲手点确认才发得出去）。守卫测试的名字扫描保留，新增外发工具仍会被挡下，
//      要放行必须同样走一次产品拍板并在测试里显式登记。
//
// ctx 约定（由路由层构造，registry 不负责组装）：
//   ctx = { user: {userId, email, role}|null, supabase }
//   user 只能来自已验证的 JWT（requireAuth 语义）或 API key 映射（mcp.js）。
const { z } = require('zod');
const audit = require('../services/agentAudit');
const { issue: issueConfirmToken } = require('../services/confirmToken');

// 工具存储：name → { name, description, parameters, roles, tier, handler, validator }
const tools = new Map();

const VALID_ROLES = ['public', 'employer', 'engineer', 'admin'];

// ── 风险分层（Wave B）——按【可逆性】分，不按模块分 ──────────────────────────
//   read    无副作用。直接执行，不进 agent_actions（ai_events 已逐次埋点）。
//   write   可逆写（改自己的档案、改自己的草稿）。直接执行 + write-ahead 审计。
//   confirm 状态迁移，有业务后果（投递、发布、指派）。**agent 不许直接执行**——
//           先回「提案 + 确认令牌」，用户在卡片上点了才走 /api/agent/confirm 执行。
//
// 注册表里【永远】不存在第四类：资金（注资/放款/退款）、发证、纠纷裁决、封号。
// 那些只能由用户在原生 UI 完成，agent 至多给一个预填好的跳转链接。这条是 Terry 拍板的
// 红线（2026-07-25），不是"能执行但要二次确认"，是根本不提供这个能力。别在后续松动。
const VALID_TIERS = ['read', 'write', 'confirm'];

// ── 外发副作用声明 ───────────────────────────────────────────────────────────
// G3 原本靠"工具名里不许出现 send/email/notify"的静态扫描守住。那是个名字启发式：
// apply_to_demand 会给雇主发邮件，名字却完全扫不出来——守卫会在毫不知情的情况下放行。
// 所以外发必须【显式声明】：任何有外发副作用的工具都要写 sideEffects，且守卫测试强制
// 这类工具只能是 tier='confirm'（必须人点过确认）。名字扫描继续保留，两道互补：
// 一道防"直接给 agent 一个发消息的能力"，一道防"外发藏在别的动作里悄悄发生"。
const VALID_SIDE_EFFECTS = ['email', 'notification', 'push'];

// G1 机械防线：parameters（含嵌套）里禁止出现的字段名。
// 这些名字意味着"调用方自报身份"，一旦放进参数，模型/外部 Agent 就能冒充任意用户。
const FORBIDDEN_PARAM_NAMES = /^(user_?id|e-?_?mail|employer_?id|owner_?id|contact|contact_?email)$/i;

// ── JSON Schema（扁平子集）→ zod 验证器 ──────────────────────────────────────
// 为什么转换而不是让工具各写一份 zod：parameters 的 JSON Schema 是单一来源，
// 同一份直接喂给 Gemini functionDeclarations 和 MCP tools/list，验证器由它推导，
// 三处永不漂移。支持子集：object/string(enum,minLength,maxLength)/number/integer
// (minimum,maximum)/boolean/array(items,minItems,maxItems)/type 数组（union，如
// budget 的 ["string","number"]）。未知/缺失 type 宽松放行为 z.any()。
function propToZod(def) {
  if (!def || typeof def !== 'object') return z.any();
  const types = Array.isArray(def.type) ? def.type : [def.type];
  const parts = types.map((t) => {
    switch (t) {
      case 'string': {
        if (Array.isArray(def.enum) && def.enum.length > 0) return z.enum(def.enum);
        let s = z.string();
        if (def.minLength != null) s = s.min(def.minLength);
        if (def.maxLength != null) s = s.max(def.maxLength);
        return s;
      }
      case 'integer':
      case 'number': {
        let n = z.number();
        if (t === 'integer') n = n.int();
        if (def.minimum != null) n = n.min(def.minimum);
        if (def.maximum != null) n = n.max(def.maximum);
        return n;
      }
      case 'boolean':
        return z.boolean();
      case 'array': {
        let a = z.array(def.items ? propToZod(def.items) : z.any());
        if (def.minItems != null) a = a.min(def.minItems);
        if (def.maxItems != null) a = a.max(def.maxItems);
        return a;
      }
      case 'object':
        return buildObjectValidator(def);
      default:
        return z.any();
    }
  });
  return parts.length === 1 ? parts[0] : z.union(parts);
}

function buildObjectValidator(schema) {
  const shape = {};
  const required = new Set(schema.required || []);
  for (const [key, def] of Object.entries(schema.properties || {})) {
    let field = propToZod(def);
    if (!required.has(key)) field = field.optional();
    shape[key] = field;
  }
  // zod v4 的 z.object 默认剥离未知键（strip）——模型多传的野字段安全丢弃，不报错。
  return z.object(shape);
}

// ── G1 注册期检查：递归扫 parameters 里所有属性名 ────────────────────────────
function assertNoIdentityParams(schema, path = []) {
  if (!schema || typeof schema !== 'object') return;
  for (const [key, def] of Object.entries(schema.properties || {})) {
    if (FORBIDDEN_PARAM_NAMES.test(key)) {
      throw new Error(
        `G1 violation: tool parameter "${[...path, key].join('.')}" is an identity field. ` +
        'Identity must come from ctx.user (verified JWT), never from tool arguments.'
      );
    }
    assertNoIdentityParams(def, [...path, key]);
    if (def && def.items) assertNoIdentityParams(def.items, [...path, key, '[]']);
  }
}

/**
 * 注册一个工具。注册期即校验形状与 G1 红线——坏定义在启动时炸掉（fail-fast），
 * 而不是等到运行时被模型调用才发现。
 * @param {object} tool { name, description, parameters(JSON Schema object),
 *                        roles(⊆ public/engineer/employer/admin), tier(read|write|confirm),
 *                        handler(async (args, ctx) => data) }
 */
function register(tool) {
  if (!tool || typeof tool !== 'object') throw new Error('register: tool must be an object');
  const { name, description, parameters, roles, tier, sideEffects, handler } = tool;
  if (typeof name !== 'string' || !name.trim()) throw new Error('register: tool.name is required');
  if (tools.has(name)) throw new Error(`register: duplicate tool name "${name}"`);
  if (typeof description !== 'string' || !description.trim()) {
    throw new Error(`register(${name}): description is required`);
  }
  if (!parameters || parameters.type !== 'object') {
    throw new Error(`register(${name}): parameters must be a JSON Schema object with type "object"`);
  }
  if (!Array.isArray(roles) || roles.length === 0 || roles.some((r) => !VALID_ROLES.includes(r))) {
    throw new Error(`register(${name}): roles must be a non-empty subset of ${VALID_ROLES.join('/')}`);
  }
  // tier 强制显式声明，不给默认值：默认成 read 的话，某天有人加写工具忘了写 tier，
  // 它就会绕过 write-ahead 审计静默执行——审计有缺口比没有审计更糟（会误以为查得全）。
  if (!VALID_TIERS.includes(tier)) {
    throw new Error(`register(${name}): tier must be one of ${VALID_TIERS.join('/')}`);
  }
  const effects = sideEffects || [];
  if (!Array.isArray(effects) || effects.some((e) => !VALID_SIDE_EFFECTS.includes(e))) {
    throw new Error(`register(${name}): sideEffects must be a subset of ${VALID_SIDE_EFFECTS.join('/')}`);
  }
  // 有外发就必须过人手：注册期就挡住，不等守卫测试才发现。read/write 都是"不用点确认
  // 就会执行"的层，把邮件/推送挂在那上面等于把外发能力直接交给模型。
  if (effects.length > 0 && tier !== 'confirm') {
    throw new Error(`register(${name}): tools with outbound side effects must be tier "confirm", got "${tier}"`);
  }
  if (typeof handler !== 'function') throw new Error(`register(${name}): handler must be a function`);

  assertNoIdentityParams(parameters); // G1

  tools.set(name, {
    name,
    description,
    parameters,
    roles: [...roles],
    tier,
    sideEffects: [...effects],
    handler,
    validator: buildObjectValidator(parameters), // 预编译，call 时零转换开销
  });
}

/**
 * 返回某角色可见的工具（元数据，不含 handler/validator）。
 * 规则：roles 含 'public' 的对所有人可见；其余需 roles 含该 role。
 * @param {string} [role='public']
 * @returns {Array<{name, description, parameters, roles}>}
 */
function list(role) {
  const r = role || 'public';
  return [...tools.values()]
    .filter((t) => t.roles.includes('public') || t.roles.includes(r))
    .map((t) => ({
      name: t.name, description: t.description, parameters: t.parameters,
      roles: [...t.roles], tier: t.tier, sideEffects: [...t.sideEffects],
    }));
}

/**
 * 调用工具：存在性 → 角色门控 → zod 参数校验 → 按 tier 分流 → handler。
 * 永远返回 { ok:true, data } 或 { ok:false, error:string }，绝不向上抛裸异常
 * （handler 抛错被捕获包装；真实错误 console.error 留给日志/Sentry，error 文案给模型看）。
 * tier='confirm' 且未确认时另有一种返回：{ ok:false, needsConfirmation:true, tool, args, confirmToken }。
 * @param {string} name 工具名
 * @param {object} args 模型/调用方传入的参数（未知键被剥离）
 * @param {object} ctx { user: {userId,email,role}|null, supabase, confirmed?:boolean,
 *                       source?:'agent'|'mcp', ip?:string }
 */
async function call(name, args, ctx = {}) {
  try {
    const tool = tools.get(name);
    if (!tool) return { ok: false, error: `Unknown tool: ${name}` };

    const role = ctx.user?.role || 'public';
    if (!(tool.roles.includes('public') || tool.roles.includes(role))) {
      return { ok: false, error: `Tool "${name}" is not available for role "${role}"` };
    }

    // ── admin 工具必须过 2FA ───────────────────────────────────────────────
    // HTTP 后台（middleware/adminAuth.js）要求 JWT 同时满足 role='admin' 且 adm2fa=true，
    // 注释写明是为了"堵住拿普通 token 冒充 admin"。这里必须用同一条杠：普通登录（含 OAuth）
    // 签出的 token 带 role 但不带 adm2fa，若此处只看 role，agent 就成了同一批数据更弱的入口，
    // 后台辛苦加的 TOTP 被一条聊天绕过。两边的 admin 门槛必须一样高。
    //
    // 只卡"因为 admin 才被放行"的工具：public 层工具 admin 照常可用，不需要第二因子。
    // 位置必须在 tier 分流【之前】——read 层有 early return，放到后面等于只保护写工具，
    // 而 admin 工具里有一半是 read（get_platform_stats / list_pending_kyc /
    // list_pipeline_leads），那样它们会整批漏在门外。放在这里，新加的 admin 工具无论
    // 哪一层都自动继承这道门（回归测试见 tests/toolsRegistry.test.js 的 2FA 套件）。
    const admittedAsAdmin = role === 'admin' && !tool.roles.includes('public');
    if (admittedAsAdmin && ctx.user?.adm2fa !== true) {
      return {
        ok: false,
        error: 'Admin actions need two-factor sign-in. Please sign in through the admin console (/admin) first.',
      };
    }

    const parsed = tool.validator.safeParse(args || {});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue.path?.length ? issue.path.join('.') : '(arguments)';
      return { ok: false, error: `Invalid arguments: ${where} — ${issue.message}` };
    }
    const safeArgs = parsed.data;

    // ── 读工具：无副作用，直接执行 ─────────────────────────────────────────
    if (tool.tier === 'read') {
      const data = await tool.handler(safeArgs, ctx);
      return { ok: true, data };
    }

    // ── 以下是写路径。两个硬前提 ───────────────────────────────────────────
    // 身份：匿名不许写（handler 内的 scope 全靠 ctx.user.userId，没有它就无从限定范围）
    if (!ctx.user?.userId) return { ok: false, error: 'Please sign in to perform this action.' };
    // 数据库：审计写不进去就不许执行，没有 client 连审计都无从谈起
    if (!ctx.supabase) return { ok: false, error: 'This action is temporarily unavailable. Please try again later.' };

    // ── T2：未经用户确认 → 只回提案 + 令牌，绝不执行 ───────────────────────
    // 令牌绑死 (user, tool, argsHash)，保证用户点确认时执行的就是他看到的那份，见 confirmToken.js
    if (tool.tier === 'confirm' && ctx.confirmed !== true) {
      return {
        ok: false,
        needsConfirmation: true,
        tool: name,
        args: safeArgs,
        confirmToken: issueConfirmToken({ userId: ctx.user.userId, tool: name, args: safeArgs }),
      };
    }

    const argsHash = audit.hashArgs(safeArgs);

    // 近重复防护：防 agent 循环把同一个动作重试两遍。如实告知而不是假装成功——
    // 回 {ok:true} 会让模型以为又做了一次，然后对用户说"已经帮你做了两次"。
    const isDup = await audit.findRecentDuplicate(ctx.supabase, {
      userId: ctx.user.userId, tool: name, argsHash,
    });
    if (isDup) {
      return { ok: false, error: 'This exact action was just performed moments ago, so it was not repeated.' };
    }

    // ── write-ahead 审计：先记账，记不上就不执行 ───────────────────────────
    let auditId;
    try {
      auditId = await audit.begin(ctx.supabase, {
        userId: ctx.user.userId,
        role,
        tool: name,
        tier: tool.tier,
        args: safeArgs,
        argsHash,
        confirmed: ctx.confirmed === true,
        source: ctx.source || 'agent',
        ip: ctx.ip,
      });
    } catch (err) {
      console.error(`[toolRegistry] audit begin failed for "${name}":`, err);
      return { ok: false, error: 'This action is temporarily unavailable. Please try again later.' };
    }

    try {
      const data = await tool.handler(safeArgs, ctx);
      await audit.complete(ctx.supabase, auditId, { ok: true });
      return { ok: true, data };
    } catch (err) {
      // 先把失败落到审计行，再交给外层 catch 统一包装成 {ok:false}
      await audit.complete(ctx.supabase, auditId, { ok: false, error: err?.message });
      throw err;
    }
  } catch (err) {
    console.error(`[toolRegistry] tool "${name}" failed:`, err);
    return { ok: false, error: err?.message || 'Tool execution failed' };
  }
}

module.exports = { register, list, call };

// ── 统一注册首批工具 ─────────────────────────────────────────────────────────
// 放在 module.exports 之后：工具文件 require('./registry') 时拿到的是已赋值的
// exports（Node 循环依赖下部分执行的模块返回当前 exports，register 已就绪）。
require('./readTools');
require('./aiTools');
require('./writeTools');
