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
//   G3 无任何外发（邮件/推送/SMS）工具。
//
// ctx 约定（由路由层构造，registry 不负责组装）：
//   ctx = { user: {userId, email, role}|null, supabase }
//   user 只能来自已验证的 JWT（requireAuth 语义）或 API key 映射（mcp.js）。
const { z } = require('zod');

// 工具存储：name → { name, description, parameters, roles, handler, validator }
const tools = new Map();

const VALID_ROLES = ['public', 'employer', 'engineer', 'admin'];

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
 *                        roles(⊆ public/employer/engineer/admin), handler(async (args, ctx) => data) }
 */
function register(tool) {
  if (!tool || typeof tool !== 'object') throw new Error('register: tool must be an object');
  const { name, description, parameters, roles, handler } = tool;
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
  if (typeof handler !== 'function') throw new Error(`register(${name}): handler must be a function`);

  assertNoIdentityParams(parameters); // G1

  tools.set(name, {
    name,
    description,
    parameters,
    roles: [...roles],
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
    .map((t) => ({ name: t.name, description: t.description, parameters: t.parameters, roles: [...t.roles] }));
}

/**
 * 调用工具：存在性 → 角色门控（ctx.user?.role || 'public'）→ zod 参数校验 → handler。
 * 永远返回 { ok:true, data } 或 { ok:false, error:string }，绝不向上抛裸异常
 * （handler 抛错被捕获包装；真实错误 console.error 留给日志/Sentry，error 文案给模型看）。
 * @param {string} name 工具名
 * @param {object} args 模型/调用方传入的参数（未知键被剥离）
 * @param {object} ctx { user: {userId,email,role}|null, supabase }
 */
async function call(name, args, ctx = {}) {
  try {
    const tool = tools.get(name);
    if (!tool) return { ok: false, error: `Unknown tool: ${name}` };

    const role = ctx.user?.role || 'public';
    if (!(tool.roles.includes('public') || tool.roles.includes(role))) {
      return { ok: false, error: `Tool "${name}" is not available for role "${role}"` };
    }

    const parsed = tool.validator.safeParse(args || {});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue.path?.length ? issue.path.join('.') : '(arguments)';
      return { ok: false, error: `Invalid arguments: ${where} — ${issue.message}` };
    }

    const data = await tool.handler(parsed.data, ctx);
    return { ok: true, data };
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
