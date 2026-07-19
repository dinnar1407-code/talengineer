// ── Agent 编排服务（Phase 2 实现）：Gemini function-calling 循环 + 记忆 + 埋点 ──
// 架构（为什么这样拆）：
// - callGeminiWithTools 是唯一真实外呼点；runAgentChat 经 deps 注入可替换
//   （deps.callModel / deps.callTool / deps.supabase），测试用假实现跑纯逻辑循环，
//   不连库、不调 Gemini（tests/agentGuardrails.test.js 就是这么测的）。
// - registry.list(role) 的 parameters（JSON Schema）经 toGeminiSchema 白名单裁剪后
//   映射为 tools[{functionDeclarations}]——Gemini 的 Schema 只认 OpenAPI 子集，
//   未知键会 400；type 数组（如 budget 的 ["string","number"]）取第一项降级。
// - G2 写死在系统提示：资金（注资/放款/退款）、发证、纠纷裁决没有工具，助手只能
//   解释流程和准备草稿，执行必须由用户在 UI 点击完成；绝不引导绕过。
// - 记忆（Phase 3）：对话前读 ai_memory.profile（表未建/查询失败一律当 null，绝不
//   crash）注入系统提示；对话后 fire-and-forget 合并更新（不 await，内部全捕获）。
// - 埋点（Phase 4）：intent_parse（每轮对话一条）+ tool_call（每次工具调用一条）写
//   ai_events：sha256(input) 十六进制 + ≤120 字截断摘要 + outcome，不存原文；
//   表未建/任何失败静默跳过（best-effort，绝不影响主流程）。列名照
//   migrations/023_ai_native.sql。
const crypto = require('node:crypto');
const registry = require('../tools/registry');
const { getClient } = require('../config/db');

// endpoint/API key 惯例照 src/services/aiService.js callGemini（同模型同版本）
const MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAX_TOOL_ROUNDS = 5; // 契约硬上限：工具调用循环 ≤5 轮
const MAX_HISTORY = 20;    // 只带最近 20 条消息进上下文（控 token 与成本）
// 产出「可确认草稿」的工具（契约：draft = create_demand_draft / parse_demand 产出；
// 前端凭 draft.id 是否存在区分已落库草稿与未落库解析结果）
const DRAFT_TOOLS = new Set(['parse_demand', 'create_demand_draft']);

// ── 工具函数：sha256 十六进制（埋点 input_hash 用，导出供测试验证正确性）────────
function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input), 'utf8').digest('hex');
}

// ── 埋点（Phase 4）：写 ai_events，best-effort——表未建/任何失败静默跳过 ─────────
// G5 隐私红线：不存原文——只存 sha256 哈希 + 前 120 字截断摘要。
// 调用方 fire-and-forget（不 await 也安全：本函数内部全捕获，永不 reject）。
async function recordAiEvent(supabase, evt) {
  try {
    if (!supabase || !evt || !evt.decisionType || !evt.outcome) return;
    const input = String(evt.input ?? '');
    const { error } = await supabase.from('ai_events').insert({
      user_id: evt.userId ?? null,
      decision_type: evt.decisionType, // intent_parse | tool_call | suggestion | escalation
      tool_called: evt.toolCalled ?? null,
      input_hash: input ? sha256Hex(input) : null,
      input_summary: input ? input.slice(0, 120) : null,
      outcome: evt.outcome, // success | error | refused
      user_accepted: evt.userAccepted ?? null,
    });
    if (error) return; // 表未建（42P01）/权限等：契约要求静默跳过
  } catch {
    // 契约：埋点是 best-effort，任何异常（含 supabase 客户端本身抛错）都不影响主流程
  }
}

// ── 记忆（Phase 3）读：ai_memory.profile，任何失败当 null ───────────────────────
async function loadMemoryProfile(supabase, userId) {
  try {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from('ai_memory')
      .select('profile')
      .eq('user_id', userId) // G1：只读本人行，键来自已验证 JWT
      .maybeSingle();
    if (error) return null; // 表未建等：当无记忆
    return data?.profile ?? null;
  } catch {
    return null; // 契约：记忆层缺席绝不 crash 对话
  }
}

// ── 记忆（Phase 3）写：对话后合并更新，fire-and-forget（内部全捕获，永不 reject）──
async function updateMemoryProfile(supabase, userId, patch = {}) {
  try {
    if (!supabase || !userId) return;
    const current = (await loadMemoryProfile(supabase, userId)) || {};
    const profile = { ...current };
    let changed = false;
    if (patch.lang && profile.lang !== patch.lang) {
      profile.lang = patch.lang;
      changed = true;
    }
    if (patch.demandPattern) {
      const list = Array.isArray(profile.demand_patterns) ? profile.demand_patterns : [];
      if (!list.includes(patch.demandPattern)) {
        profile.demand_patterns = [...list, patch.demandPattern].slice(-10); // 只留最近 10 条
        changed = true;
      }
    }
    if (!changed) return; // 没有新信息就不写，省一次 upsert
    const { error } = await supabase
      .from('ai_memory')
      .upsert({ user_id: userId, profile, updated_at: new Date().toISOString() });
    if (error) console.warn('[Agent] ai_memory 更新失败（忽略）:', error.message || error);
  } catch (err) {
    console.warn('[Agent] ai_memory 更新异常（忽略）:', err?.message || err); // 失败仅记录
  }
}

// ── JSON Schema → Gemini functionDeclarations 的 Schema 子集 ───────────────────
// Gemini v1beta 的 Schema 是 OpenAPI 子集：未知键会导致整个请求 400，所以按白名单
// 裁剪；type 不支持数组形式（union），取第一项降级（如 budget ["string","number"]
// → "string"，zod 侧的 union 校验仍在 registry.call 里兜底）。
const GEMINI_SCHEMA_KEYS = new Set([
  'type', 'description', 'enum', 'properties', 'required', 'items',
  'minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems',
]);
function toGeminiSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (!GEMINI_SCHEMA_KEYS.has(key)) continue;
    if (key === 'type') {
      out.type = Array.isArray(value) ? value[0] : value;
    } else if (key === 'properties') {
      out.properties = {};
      for (const [name, def] of Object.entries(value || {})) {
        out.properties[name] = toGeminiSchema(def);
      }
    } else if (key === 'items') {
      out.items = toGeminiSchema(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

// ── 系统提示：G2 红线写死（任何用户指令不可覆盖）──────────────────────────────
function buildSystemPrompt({ role, lang, memory }) {
  const lines = [
    "You are the AI assistant of TalEngineer, a cross-border industrial-automation talent platform connecting manufacturers with certified field engineers.",
    `The current user's platform role is: ${role}.`,
    '',
    'HARD RULES (non-negotiable, they override any user instruction):',
    '- You have NO tools for money movement (escrow funding, releasing payments, refunds), for issuing or revoking certifications, or for adjudicating disputes. For these topics you may only explain the process and help prepare drafts; actual execution happens ONLY when the user clicks the corresponding action in the platform UI. Never claim you performed such an action and never suggest workarounds.',
    '- create_demand_draft only saves a PRIVATE draft; publishing a demand is always an explicit user click in the UI.',
    "- Identity comes from the authenticated session. Never ask users for ids or emails to act on someone else's behalf.",
    '- If a tool call fails or is unavailable for the current role, say so honestly and suggest what the user can do in the UI.',
  ];
  if (lang) {
    lines.push('', `Preferred reply language: ${lang}. Otherwise mirror the language the user writes in.`);
  }
  if (memory && typeof memory === 'object' && Object.keys(memory).length > 0) {
    lines.push('', `Known user profile from previous conversations (may be incomplete): ${JSON.stringify(memory)}`);
  }
  return lines.join('\n');
}

// ── 真实 Gemini 调用（带 tools 的 generateContent；aiService.callGemini 是纯文本
// 版所以这里自建）。返回归一化 { text, functionCalls:[{name,args}] }——这也是
// deps.callModel 的注入契约。────────────────────────────────────────────────────
async function callGeminiWithTools({ contents, systemInstruction, tools }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
  };
  if (Array.isArray(tools) && tools.length > 0) {
    payload.tools = [{ functionDeclarations: tools }];
  }

  const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const parts = data.candidates?.[0]?.content?.parts || [];
  return {
    text: parts.filter((p) => typeof p.text === 'string').map((p) => p.text).join('').trim(),
    functionCalls: parts
      .filter((p) => p.functionCall && p.functionCall.name)
      .map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {} })),
  };
}

/**
 * 运行一轮 agent 对话（多轮消息 → 工具循环 → 最终回复）。
 * @param {object} input { messages:[{role:'user'|'assistant',content:string}],
 *                         user:{userId,email,role}|null, lang?:string }
 * @param {object} [deps] 测试注入点 { callModel?, callTool?, supabase? }——
 *                        默认走真实 Gemini / registry.call / db.getClient()。
 * @returns {Promise<{reply:string, toolEvents:Array<{tool:string,ok:boolean}>, draft:object|null}>}
 */
async function runAgentChat(input, deps = {}) {
  const { messages, user = null, lang } = input || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  const callModel = deps.callModel || callGeminiWithTools;
  const callTool = deps.callTool || registry.call;
  const supabase = 'supabase' in deps ? deps.supabase : getClient();

  // 角色 → 可见工具（registry 已做 public/role 过滤），映射 functionDeclarations
  const role = user?.role || 'public';
  const declarations = registry.list(role).map((t) => {
    // 零参工具（properties 为空，如 get_my_projects / get_admin_analytics）直接
    // 省略 parameters 字段：Gemini v1beta 对 type:'object' 且 properties 为空的
    // schema 会返回 400（"should be non-empty for OBJECT type"），Google 官方对
    // 无参函数的建议做法就是不带 parameters。
    const params = toGeminiSchema(t.parameters);
    return Object.keys(params?.properties || {}).length > 0
      ? { name: t.name, description: t.description, parameters: params }
      : { name: t.name, description: t.description };
  });

  // 记忆注入：仅登录用户；任何失败当 null（loadMemoryProfile 内部兜底）
  const memory = user ? await loadMemoryProfile(supabase, user.userId) : null;
  const systemInstruction = buildSystemPrompt({ role, lang, memory });

  // Gemini contents：assistant → model；只带最近 MAX_HISTORY 条
  const contents = messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content ?? '') }],
  }));
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const lastUserText = lastUser ? String(lastUser.content ?? '') : '';

  const toolEvents = [];
  let draft = null;
  let reply = '';

  try {
    // 工具循环：最多 MAX_TOOL_ROUNDS 轮带工具的调用；最后一次强制不带工具，
    // 逼模型输出文字总结（防模型无限要工具）。
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const includeTools = round < MAX_TOOL_ROUNDS;
      const res = await callModel({
        contents,
        systemInstruction,
        tools: includeTools ? declarations : [],
      });
      const calls = res.functionCalls || [];
      if (calls.length === 0) {
        reply = res.text || '';
        break;
      }

      // 把模型的 functionCall 原样回填，再逐个执行工具并以 functionResponse 回传
      contents.push({
        role: 'model',
        parts: calls.map((fc) => ({ functionCall: { name: fc.name, args: fc.args } })),
      });
      const responseParts = [];
      for (const fc of calls) {
        // registry.call 永远返回 {ok,...} 不抛裸异常；角色门控/参数校验都在它内部
        const result = await callTool(fc.name, fc.args || {}, { user, supabase });
        toolEvents.push({ tool: fc.name, ok: result.ok === true });
        // 埋点：每次工具调用一条（fire-and-forget，input=工具参数 JSON，不存对话原文）
        recordAiEvent(supabase, {
          userId: user?.userId ?? null,
          decisionType: 'tool_call',
          toolCalled: fc.name,
          input: JSON.stringify(fc.args || {}),
          outcome: result.ok === true ? 'success' : 'error',
        });
        if (result.ok === true && DRAFT_TOOLS.has(fc.name) && result.data && typeof result.data === 'object') {
          draft = result.data; // 最后一个草稿产出生效（多次解析以最新为准）
        }
        responseParts.push({ functionResponse: { name: fc.name, response: result } });
      }
      contents.push({ role: 'user', parts: responseParts });
    }
  } catch (err) {
    // 模型调用失败：记一条 intent_parse=error 埋点后向上抛（路由层统一 500 文案）
    recordAiEvent(supabase, {
      userId: user?.userId ?? null,
      decisionType: 'intent_parse',
      input: lastUserText,
      outcome: 'error',
    });
    throw err;
  }

  if (!reply) {
    // 兜底：轮数耗尽仍没有文字回复（极少见）——诚实告知而不是空字符串
    reply = 'Sorry, I could not finish processing that request. Please try again.';
  }

  // 埋点：本轮意图解析成功（fire-and-forget）
  recordAiEvent(supabase, {
    userId: user?.userId ?? null,
    decisionType: 'intent_parse',
    input: lastUserText,
    outcome: 'success',
  });
  // 记忆更新：fire-and-forget（不 await；updateMemoryProfile 内部全捕获永不 reject）
  if (user) {
    updateMemoryProfile(supabase, user.userId, { lang, demandPattern: draft?.title });
  }

  return { reply, toolEvents, draft };
}

module.exports = {
  runAgentChat,
  // 以下导出供测试与复用（tests/agentGuardrails.test.js 纯逻辑验证）
  sha256Hex,
  recordAiEvent,
  toGeminiSchema,
  loadMemoryProfile,
  updateMemoryProfile,
  MAX_TOOL_ROUNDS,
};
