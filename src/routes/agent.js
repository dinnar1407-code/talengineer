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
const jwt = require('jsonwebtoken');
const router = express.Router();
const { runAgentChat } = require('../services/agentService');
const { getClient } = require('../config/db');

const MAX_MESSAGES = 40;        // 单次请求最多带 40 条历史（控滥用与 token 成本）
const MAX_CONTENT_LENGTH = 8000; // 单条消息内容上限（与 parse_demand 工具入参上限一致）

// 可选鉴权：与 requireAuth 同一套 jwt.verify 语义（payload = { userId, email, role }），
// 但 token 缺失/无效不 401——降级为匿名（ctx.user=null → registry 只放行 public 工具）。
function optionalUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return null; // 无效/过期 token：未登录也可聊（public 只读工具）
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { messages, lang } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: `messages must be a non-empty array (max ${MAX_MESSAGES} items)` });
    }
    for (const m of messages) {
      const validRole = m && (m.role === 'user' || m.role === 'assistant');
      const validContent =
        typeof m?.content === 'string' && m.content.trim() && m.content.length <= MAX_CONTENT_LENGTH;
      if (!validRole || !validContent) {
        return res.status(400).json({
          error: `each message needs role "user"|"assistant" and non-empty string content (max ${MAX_CONTENT_LENGTH} chars)`,
        });
      }
    }

    const user = optionalUser(req);
    const result = await runAgentChat(
      { messages, user, lang: typeof lang === 'string' ? lang : undefined },
      { supabase: getClient() },
    );
    return res.json(result); // { reply, toolEvents:[{tool,ok}], draft:object|null }
  } catch (err) {
    // 仓库惯例（照 demand.js）：真实错误进日志，客户端只回通用文案
    console.error('[Agent] chat failed:', err);
    return res.status(500).json({ error: 'Agent chat failed. Please try again later.' });
  }
});

module.exports = router;
