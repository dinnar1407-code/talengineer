// ── Agent 对话路由（Phase 2）——可加载桩，由实现 agent 填充 ───────────────────
// 契约（实现者必读）：
// - POST /api/agent/chat，body { messages:[{role:'user'|'assistant',content:string}], lang? }。
// - Bearer 可选鉴权：有 Authorization 头且 JWT 有效 → ctx.user = { userId, email, role }
//   （jwt.verify 语义照 src/middleware/auth.js requireAuth，但 token 无效/缺失时不 401，
//   降级为 ctx.user = null → registry 只放行 public 只读工具；未登录也可聊）。
// - ctx.supabase = require('../config/db').getClient()。
// - 调 src/services/agentService.js 的 runAgentChat({ messages, user, lang })，
//   响应 { reply, toolEvents:[{tool,ok}], draft:object|null }。
// - 错误处理照仓库惯例：console.error 记录真实错误，客户端只回通用文案（见 demand.js）。
const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
  res.status(501).json({ error: 'Agent chat is not implemented yet.' });
});

module.exports = router;
