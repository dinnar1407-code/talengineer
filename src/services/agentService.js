// ── Agent 编排服务（Phase 2）——可加载桩，由实现 agent 填充 ───────────────────
// 契约（实现者必读）：
// - Gemini function-calling 循环：registry.list(role) 的 {name,description,parameters}
//   直接映射为 tools[{functionDeclarations}]；参照 src/services/aiService.js 的
//   callGemini 学 API key（process.env.GEMINI_API_KEY）与 endpoint 惯例
//   （generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent），
//   但 callGemini 是纯文本版——需自己实现带 tools 的 generateContent 调用与
//   functionCall/functionResponse 回传；工具调用循环硬上限 5 轮。
// - 工具执行一律走 registry.call(name, args, ctx)；ctx = { user, supabase }，
//   user 形状 { userId, email, role }（与 src/middleware/auth.js req.user 一致）或 null。
// - 系统提示写死 G2：资金（注资/放款/退款）、发证、纠纷裁决只能解释和准备草稿，
//   执行必须由用户在 UI 点击完成；助手无相应工具、也绝不引导绕过。
// - 记忆（Phase 3）：对话前读 ai_memory.profile（表可能未建——catch 后当 null，
//   绝不 crash）注入上下文；对话后 fire-and-forget 更新（不 await、失败仅记录）。
// - 埋点（Phase 4）：每次意图解析/工具调用写 ai_events（sha256(input) 十六进制 +
//   ≤120 字摘要 + outcome；不存原文；表未建则静默跳过）。列名照
//   migrations/023_ai_native.sql：user_id/decision_type/tool_called/input_hash/
//   input_summary/outcome/user_accepted。
// - 返回形状（src/routes/agent.js 依赖）：
//   { reply: string, toolEvents: [{tool, ok}], draft: object|null }
//   draft = create_demand_draft / parse_demand 产出的可确认草稿（无则 null）。

/**
 * 运行一轮 agent 对话（多轮消息 → 工具循环 → 最终回复）。
 * @param {object} input { messages:[{role:'user'|'assistant',content:string}],
 *                         user:{userId,email,role}|null, lang?:string }
 * @returns {Promise<{reply:string, toolEvents:Array<{tool:string,ok:boolean}>, draft:object|null}>}
 */
async function runAgentChat(_input) {
  throw new Error('NOT_IMPLEMENTED');
}

module.exports = { runAgentChat };
