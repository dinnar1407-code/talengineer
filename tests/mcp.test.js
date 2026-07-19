// ── MCP 适配器（/api/mcp，JSON-RPC 2.0）单元测试 ─────────────────────────────
// 覆盖三层：
// 1) JSON-RPC 协议层：错误码语义（-32600 无效请求 / -32601 方法不存在 / -32602 无效参数）、
//    id 回显、notification 不回响应。
// 2) MCP 工具面：tools/list 只含 7 个白名单工具（draft_sow / get_match_recommendations /
//    get_admin_analytics 绝不能出现）；tools/call 过同一份白名单。
// 3) 结果包装：registry.call 的 {ok:true} → content:[{type:'text',...}]；
//    {ok:false} → isError:true 的内容结果（不是 JSON-RPC 传输层错误）。
// 4) 路由接线：requireApiKey 守卫生效（无 key → 401）；有效 key → ctx.user 映射
//    { userId: api key 的 user_id, role: 'employer' }。
//
// 测试技巧（说明给初学者）：
// - handleRpc 是纯逻辑（不依赖 Express），大部分用例直接调它，快且稳定。
// - mcp.js 里 registry 用属性访问（registry.call(...)）而非解构，所以测试可以
//   临时替换 registry.call 来控制工具返回值——不用真跑工具 handler（那些依赖数据库）。
// - 路由层测试沿用 apiKeyGuard.test.js 的套路：先 patch db.getClient，再删 require
//   缓存重载 apikeys/mcp，让它们顶部解构到的 getClient 指向 mock。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const registry = require('../src/tools/registry');
const { handleRpc, MCP_TOOLS } = require('../src/routes/mcp');

// employer 视角的 ctx（MCP 面固定 employer 角色）。
function makeCtx() {
  return { user: { userId: 42, email: null, role: 'employer' }, supabase: {} };
}

describe('MCP 适配器 — JSON-RPC 协议层（handleRpc 纯逻辑）', () => {
  it('无效请求（缺 jsonrpc/method）：返回 -32600', async () => {
    const resp = await handleRpc({ id: 1 }, makeCtx());
    assert.equal(resp.jsonrpc, '2.0');
    assert.equal(resp.id, 1);
    assert.equal(resp.error.code, -32600);
  });

  it('无效请求（body 是数组，不支持 batch）：返回 -32600、id 为 null', async () => {
    const resp = await handleRpc([{ jsonrpc: '2.0', id: 1, method: 'initialize' }], makeCtx());
    assert.equal(resp.error.code, -32600);
    assert.equal(resp.id, null);
  });

  it('未知方法：返回 -32601 Method not found，且回显请求 id', async () => {
    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 'req-9', method: 'resources/list' },
      makeCtx()
    );
    assert.equal(resp.id, 'req-9');
    assert.equal(resp.error.code, -32601);
    assert.match(resp.error.message, /resources\/list/);
  });

  it('notification（无 id）：不回响应（返回 null）', async () => {
    const resp = await handleRpc(
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      makeCtx()
    );
    assert.equal(resp, null);
  });

  it('initialize：返回 protocolVersion / capabilities.tools / serverInfo', async () => {
    const resp = await handleRpc({ jsonrpc: '2.0', id: 1, method: 'initialize' }, makeCtx());
    assert.equal(resp.jsonrpc, '2.0');
    assert.equal(resp.id, 1);
    assert.equal(typeof resp.result.protocolVersion, 'string');
    assert.deepEqual(resp.result.capabilities, { tools: {} });
    assert.equal(resp.result.serverInfo.name, 'talengineer-mcp');
  });
});

describe('MCP 适配器 — tools/list 白名单', () => {
  it('只含 7 个白名单工具，employer 的其余工具不外泄', async () => {
    const resp = await handleRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, makeCtx());
    const names = resp.result.tools.map((t) => t.name).sort();
    assert.deepEqual(names, [...MCP_TOOLS].sort());

    // 明确断言不该出现的工具（employer 角色可见但被 MCP 白名单挡下 / admin 工具）。
    for (const banned of ['draft_sow', 'get_match_recommendations', 'get_admin_analytics']) {
      assert.ok(!names.includes(banned), `${banned} 不应出现在 MCP tools/list`);
    }
  });

  it('每个工具是 MCP 形状：name/description/inputSchema（JSON Schema object）', async () => {
    const resp = await handleRpc({ jsonrpc: '2.0', id: 3, method: 'tools/list' }, makeCtx());
    for (const tool of resp.result.tools) {
      assert.equal(typeof tool.name, 'string');
      assert.equal(typeof tool.description, 'string');
      assert.equal(tool.inputSchema.type, 'object');
      // registry 内部字段（roles/handler/validator）不得泄漏到 MCP 元数据。
      assert.equal(tool.roles, undefined);
      assert.equal(tool.handler, undefined);
    }
  });
});

describe('MCP 适配器 — tools/call', () => {
  let originalCall;
  beforeEach(() => { originalCall = registry.call; });
  afterEach(() => { registry.call = originalCall; });

  it('缺 name：返回 -32602 Invalid params', async () => {
    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 4, method: 'tools/call', params: {} },
      makeCtx()
    );
    assert.equal(resp.error.code, -32602);
  });

  it('arguments 不是对象：返回 -32602', async () => {
    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'get_rates', arguments: 'oops' } },
      makeCtx()
    );
    assert.equal(resp.error.code, -32602);
  });

  it('非白名单工具（即使 registry 里注册了，如 draft_sow）：返回 -32602', async () => {
    for (const name of ['draft_sow', 'get_admin_analytics', 'no_such_tool']) {
      const resp = await handleRpc(
        { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name } },
        makeCtx()
      );
      assert.equal(resp.error.code, -32602, `${name} 应被白名单挡下`);
    }
  });

  it('{ok:true}：结果包成 content:[{type:"text", text: JSON}]，isError:false', async () => {
    let captured = null;
    registry.call = async (name, args, ctx) => {
      captured = { name, args, ctx };
      return { ok: true, data: { engineers: [{ id: 7 }], total: 1 } };
    };

    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'search_engineers', arguments: { track: 'plc' } } },
      makeCtx()
    );

    assert.equal(resp.id, 8);
    assert.equal(resp.error, undefined);
    assert.equal(resp.result.isError, false);
    assert.equal(resp.result.content.length, 1);
    assert.equal(resp.result.content[0].type, 'text');
    assert.deepEqual(JSON.parse(resp.result.content[0].text), { engineers: [{ id: 7 }], total: 1 });
    // 透传检查：工具名、参数、ctx（含 employer 身份）原样进 registry.call。
    assert.equal(captured.name, 'search_engineers');
    assert.deepEqual(captured.args, { track: 'plc' });
    assert.equal(captured.ctx.user.userId, 42);
    assert.equal(captured.ctx.user.role, 'employer');
  });

  it('arguments 省略时默认 {}（可选参数工具可无参调用）', async () => {
    let captured = null;
    registry.call = async (name, args) => { captured = args; return { ok: true, data: [] }; };

    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'get_rates' } },
      makeCtx()
    );
    assert.equal(resp.result.isError, false);
    assert.deepEqual(captured, {});
  });

  it('{ok:false}：映射为 isError:true 的内容结果，不是 JSON-RPC error', async () => {
    registry.call = async () => ({ ok: false, error: '该需求不存在或你无权查看' });

    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 10, method: 'tools/call', params: { name: 'get_milestone_status', arguments: { demandId: 999 } } },
      makeCtx()
    );

    assert.equal(resp.error, undefined, '工具级失败不能变成 JSON-RPC 传输层错误');
    assert.equal(resp.result.isError, true);
    assert.equal(resp.result.content[0].type, 'text');
    assert.equal(resp.result.content[0].text, '该需求不存在或你无权查看');
  });

  it('真 registry 参数校验：白名单工具传坏参 → isError:true（不碰 handler）', async () => {
    // 不 patch registry.call：limit 超上限（契约 limit<=10）会被 zod 校验拦下，
    // registry 返回 {ok:false, error:'Invalid arguments...'}——handler 不会被执行，
    // 所以这个用例不依赖并行 agent 的 handler 实现进度。
    const resp = await handleRpc(
      { jsonrpc: '2.0', id: 11, method: 'tools/call', params: { name: 'search_engineers', arguments: { limit: 999 } } },
      makeCtx()
    );
    assert.equal(resp.result.isError, true);
    assert.match(resp.result.content[0].text, /Invalid arguments/);
  });
});

describe('MCP 适配器 — 路由接线（requireApiKey + ctx 组装）', () => {
  const express = require('express');
  const supertest = require('supertest');
  const db = require('../src/config/db');
  const { createSupabaseMock } = require('./helpers/supabaseMock');

  const apikeysPath = require.resolve('../src/routes/apikeys');
  const mcpPath = require.resolve('../src/routes/mcp');

  let originalGetClient;
  let originalCall;
  beforeEach(() => {
    originalGetClient = db.getClient;
    originalCall = registry.call;
  });
  afterEach(() => {
    db.getClient = originalGetClient;
    registry.call = originalCall;
    // 清掉被污染的模块缓存，让其它测试拿到干净的模块。
    delete require.cache[apikeysPath];
    delete require.cache[mcpPath];
  });

  // patch 好 db.getClient 后重载 apikeys + mcp（两者顶部都解构了 getClient）。
  function makeApp(tableResults) {
    db.getClient = () => createSupabaseMock(tableResults).client;
    delete require.cache[apikeysPath];
    delete require.cache[mcpPath];
    const freshMcp = require('../src/routes/mcp');
    const app = express();
    app.use(express.json());
    app.use('/api/mcp', freshMcp);
    return app;
  }

  it('无 API key：401，JSON-RPC 逻辑不执行', async () => {
    const app = makeApp({});
    const res = await supertest(app)
      .post('/api/mcp')
      .send({ jsonrpc: '2.0', id: 1, method: 'initialize' });
    assert.equal(res.status, 401);
    assert.equal(res.body.jsonrpc, undefined);
  });

  it('有效 key：200，ctx.user = { userId: key 的 user_id, role: employer }', async () => {
    const app = makeApp({
      api_keys: { data: { id: 1, user_id: 42, active: true }, error: null },
    });

    // initialize 走通全链路。
    const init = await supertest(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer TE_validkey')
      .send({ jsonrpc: '2.0', id: 1, method: 'initialize' });
    assert.equal(init.status, 200);
    assert.equal(init.body.result.serverInfo.name, 'talengineer-mcp');

    // tools/call 验证 ctx 组装：registry 是单例（未删缓存），patch call 可捕获 ctx。
    let capturedCtx = null;
    registry.call = async (name, args, ctx) => { capturedCtx = ctx; return { ok: true, data: {} }; };
    const call = await supertest(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer TE_validkey')
      .send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_rates' } });
    assert.equal(call.status, 200);
    assert.equal(call.body.result.isError, false);
    assert.equal(capturedCtx.user.userId, 42, '身份必须来自 API key 映射的 user_id');
    assert.equal(capturedCtx.user.role, 'employer');
    assert.equal(capturedCtx.user.email, null);
  });

  it('notification（无 id）：202 无响应体', async () => {
    const app = makeApp({
      api_keys: { data: { id: 1, user_id: 42, active: true }, error: null },
    });
    const res = await supertest(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer TE_validkey')
      .send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    assert.equal(res.status, 202);
  });
});
