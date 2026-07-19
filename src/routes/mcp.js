// ── MCP 适配器路由（P1-3）——可加载桩，由实现 agent 填充 ─────────────────────
// 契约（实现者必读）：
// - POST /api/mcp：JSON-RPC 2.0 无状态端点，支持 initialize / tools/list / tools/call；
//   未知 method 回 JSON-RPC error（code -32601）；解析失败回 -32700/-32600。
// - 鉴权复用 src/routes/apikeys.js 的 requireApiKey（Bearer TE_...，middleware 挂在
//   router.post 上）；⚠️ 契约修正（以代码实态为准）：ctx.user 字段名是 userId 不是 id——
//   ctx.user = { userId: req.apiKeyUserId, email: null, role: 'employer' }，
//   与 src/middleware/auth.js req.user / ownership.js 的 user.userId 消费口径一致。
// - ctx.supabase = require('../config/db').getClient()。
// - 工具面收窄（比 registry.list('employer') 更严）：只暴露 public 读工具
//   （search_engineers/get_rates/get_certification_info/parse_demand）+
//   get_my_projects / get_milestone_status / create_demand_draft——用显式白名单
//   过滤 registry.list('employer') 的结果，tools/call 也要过同一份白名单。
// - tools/list 直接输出 registry 元数据映射为 MCP 工具形状
//   （{name, description, inputSchema: parameters}）；tools/call 走 registry.call，
//   {ok:false} 映射为 MCP content 错误结果（isError: true），不是 JSON-RPC 传输层错误。
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // 桩：保持 JSON-RPC 响应形状，方便调用方在实现前就能识别"未就绪"而非"端点不存在"
  res.status(501).json({
    jsonrpc: '2.0',
    id: (req.body && req.body.id) ?? null,
    error: { code: -32603, message: 'MCP adapter is not implemented yet.' },
  });
});

module.exports = router;
