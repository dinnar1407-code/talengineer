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
const { requireAuth } = require('../middleware/auth');
const { verify: verifyConfirmToken } = require('../services/confirmToken');
const registry = require('../tools/registry');

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
      { messages, user, lang: typeof lang === 'string' ? lang : undefined, ip: req.ip },
      { supabase: getClient() },
    );
    // { reply, toolEvents, draft, pendingConfirmation:{tool,args,confirmToken}|null }
    return res.json(result);
  } catch (err) {
    // 仓库惯例（照 demand.js）：真实错误进日志，客户端只回通用文案
    console.error('[Agent] chat failed:', err);
    return res.status(500).json({ error: 'Agent chat failed. Please try again later.' });
  }
});

// ── POST /api/agent/confirm：执行一个用户已确认的 T2 工具（Wave B / B2）──────
// 契约：body { confirm_token, tool, args }。令牌由 registry 在工具 tier='confirm' 且
// 未确认时签发（见 src/services/confirmToken.js），绑死 (userId, tool, argsHash)。
//
// 这里【必须】用 requireAuth 而不是 optionalUser：确认即执行，匿名不许执行任何写操作。
// 令牌里的 userId 会与 req.user.userId 比对——光有令牌不够，还得是本人。
//
// 参数由前端回传而非从令牌里解出，是为了让服务端能重算哈希做比对：这样"用户确认的"
// 与"实际执行的"必然是同一份。令牌里只放哈希，也顺带让令牌不至于把业务数据带出去。
router.post('/confirm', requireAuth, async (req, res) => {
  try {
    const { confirm_token: confirmToken, tool, args } = req.body || {};
    if (typeof tool !== 'string' || !tool) {
      return res.status(400).json({ error: 'Missing tool.' });
    }
    const safeArgs = args && typeof args === 'object' && !Array.isArray(args) ? args : {};

    const verdict = verifyConfirmToken(confirmToken, { userId: req.user.userId, tool, args: safeArgs });
    if (!verdict.ok) return res.status(400).json({ error: verdict.error });

    // confirmed:true 是这条路径独有的——registry 只认它，别的地方都传不进来
    const result = await registry.call(tool, safeArgs, {
      user: req.user,
      supabase: getClient(),
      confirmed: true,
      source: 'agent',
      ip: req.ip,
    });
    if (!result.ok) return res.status(400).json({ error: result.error || 'Action failed.' });

    return res.json({ status: 'ok', data: result.data });
  } catch (err) {
    console.error('[Agent] confirm failed:', err);
    return res.status(500).json({ error: 'Could not complete that action. Please try again.' });
  }
});

module.exports = router;
