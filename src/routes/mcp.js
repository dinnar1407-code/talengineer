// ── MCP 适配器路由（P1-3）─────────────────────────────────────────────────────
// POST /api/mcp：JSON-RPC 2.0 无状态端点（MCP Streamable HTTP 的最小实现）。
// 支持三个方法：initialize / tools/list / tools/call。
//
// 鉴权：复用 src/routes/apikeys.js 的 requireApiKey（Bearer TE_...）；
//   通过后 ctx.user = { userId: req.apiKeyUserId, email: null, role: 'employer' }
//   ——字段名 userId 与 src/middleware/auth.js req.user / ownership.js 口径一致。
//
// 工具面收窄（比 registry.list('employer') 更严）：显式白名单 = 4 个 public 读工具
//   （search_engineers / get_rates / get_certification_info / parse_demand）
//   + get_my_projects / get_milestone_status / create_demand_draft。
//   tools/list 与 tools/call 过同一份白名单——registry 角色门控之外再加一道，
//   保证 draft_sow / get_match_recommendations 等 employer 工具不经 MCP 外泄。
//
// 错误分层（MCP 规范语义）：
//   - JSON-RPC 传输层错误：请求形状坏 → -32600；方法不存在 → -32601；
//     tools/call 的 name 缺失/非白名单 → -32602（协议级"无效参数"）。
//   - 工具执行结果错误：registry.call 返回 {ok:false}（参数校验失败/业务失败）
//     → 映射为 result.content + isError:true，不是 JSON-RPC error——
//     这样 MCP 客户端的 LLM 能"看到"错误文案并自行修正参数重试。
//   - JSON 解析失败（-32700）发生在全局 express.json() 中间件，到不了本路由，
//     由全局错误处理兜底（返回 400），此处不重复处理。
const express = require('express');
const router = express.Router();
const registry = require('../tools/registry');
const { requireApiKey } = require('./apikeys');
const { getClient } = require('../config/db');

// MCP 暴露的工具白名单（tools/list 与 tools/call 共用同一份）。
const MCP_TOOLS = [
  'search_engineers',
  'get_rates',
  'get_certification_info',
  'parse_demand',
  'get_my_projects',
  'get_milestone_status',
  'create_demand_draft',
];
const MCP_TOOL_SET = new Set(MCP_TOOLS);

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'talengineer-mcp', version: '1.0.0' };

// ── JSON-RPC 2.0 响应构造 ────────────────────────────────────────────────────
function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id: id === undefined ? null : id, error: { code, message } };
}

/**
 * 纯逻辑：处理一条已解析的 JSON-RPC 请求。
 * 与 Express 解耦，方便单元测试直接调用（tests/mcp.test.js）。
 * 注意：registry 用属性访问（registry.call / registry.list）而非解构，
 * 测试可以临时 patch registry.call 而无需重载本模块。
 *
 * @param {object} body 已解析的请求体
 * @param {object} ctx  { user: {userId,email,role}, supabase }
 * @returns {Promise<object|null>} JSON-RPC 响应对象；notification（无 id）返回 null
 */
async function handleRpc(body, ctx) {
  // 请求形状校验：必须是单个 JSON-RPC 2.0 请求对象（不支持 batch——
  // MCP 2025-06-18 规范已移除 JSON-RPC batching）。
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return rpcError(null, -32600, 'Invalid Request: expected a single JSON-RPC 2.0 request object');
  }
  const { jsonrpc, id, method, params } = body;
  const hasId = id !== undefined;
  if (jsonrpc !== '2.0' || typeof method !== 'string' || !method) {
    return rpcError(hasId ? id : null, -32600, 'Invalid Request: "jsonrpc" must be "2.0" and "method" must be a string');
  }

  // notification（无 id，如 notifications/initialized）：按 JSON-RPC 2.0 规范不回响应。
  if (!hasId) return null;

  switch (method) {
    case 'initialize':
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case 'tools/list': {
      // registry.list 先按角色过滤（employer 视角），再过 MCP 白名单收窄；
      // registry 元数据 parameters（JSON Schema）直接就是 MCP 的 inputSchema。
      const tools = registry
        .list(ctx.user?.role || 'public')
        .filter((t) => MCP_TOOL_SET.has(t.name))
        .map((t) => ({ name: t.name, description: t.description, inputSchema: t.parameters }));
      return rpcResult(id, { tools });
    }

    case 'tools/call': {
      const name = params?.name;
      if (typeof name !== 'string' || !name) {
        return rpcError(id, -32602, 'Invalid params: "name" (string) is required');
      }
      // 非白名单工具一律按"未知工具"处理（协议级 -32602），
      // 不透露该工具是否在平台其他面存在。
      if (!MCP_TOOL_SET.has(name)) {
        return rpcError(id, -32602, `Unknown tool: ${name}`);
      }
      const rawArgs = params.arguments;
      if (rawArgs !== undefined && (typeof rawArgs !== 'object' || rawArgs === null || Array.isArray(rawArgs))) {
        return rpcError(id, -32602, 'Invalid params: "arguments" must be an object');
      }

      // registry.call 永远返回 {ok, ...}，绝不抛裸异常。
      const out = await registry.call(name, rawArgs || {}, ctx);
      if (out.ok) {
        return rpcResult(id, {
          content: [{ type: 'text', text: JSON.stringify(out.data) }],
          isError: false,
        });
      }
      // 工具级失败（参数校验/业务失败）→ isError 内容结果，非 JSON-RPC 传输层错误。
      return rpcResult(id, {
        content: [{ type: 'text', text: out.error }],
        isError: true,
      });
    }

    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

router.post('/', requireApiKey, async (req, res) => {
  try {
    // 身份只来自已验证的 API key（requireApiKey 写入 req.apiKeyUserId）；
    // API key 仅对 employer/admin 发放（apikeys.js /generate），MCP 面统一按 employer 角色。
    const ctx = {
      user: { userId: req.apiKeyUserId, email: null, role: 'employer' },
      supabase: getClient(),
    };
    const response = await handleRpc(req.body, ctx);
    // notification：202 Accepted 无响应体（MCP Streamable HTTP 规范）。
    if (response === null) return res.status(202).end();
    return res.json(response);
  } catch (err) {
    // 兜底：handleRpc 理论上不抛（registry.call 自包错误），但路由层仍不裸崩。
    console.error('[mcp]', err);
    return res.json(rpcError(req.body?.id, -32603, 'Internal error'));
  }
});

module.exports = router;
// 纯逻辑与白名单额外导出，供单元测试直接调用/断言。
module.exports.handleRpc = handleRpc;
module.exports.MCP_TOOLS = MCP_TOOLS;
