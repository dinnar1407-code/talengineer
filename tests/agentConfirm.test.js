// ── T2 确认机制 + 写路径审计（Wave B / B1+B2）─────────────────────────────────
// 三块：
//   1) confirmToken：四种伪造方式（换用户/换工具/改参数/过期）必须全被挡
//   2) registry 写路径：匿名拒绝、write-ahead 审计（记不上就不执行）、近重复防护
//   3) POST /api/agent/confirm：令牌不对不执行、对了才执行
// 框架：node:test + supertest（非 Jest）。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-agent-confirm';

const { issue, verify } = require('../src/services/confirmToken');
const registry = require('../src/tools/registry');

const USER = { userId: 7, email: 'eng@x.com', role: 'engineer' };
const ARGS = { demand_id: 42, message: 'hi' };

// ── 1. 确认令牌 ──────────────────────────────────────────────────────────────
describe('confirmToken：绑死 (user, tool, argsHash)', () => {

  it('原样回传：通过', () => {
    const t = issue({ userId: 7, tool: 'apply_to_demand', args: ARGS });
    assert.equal(verify(t, { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, true);
  });

  it('键序不同但内容相同：通过（哈希前做了稳定序列化）', () => {
    // 模型两次生成同一组参数时键序不保证一致，不归一化会误判成"参数被改过"
    const t = issue({ userId: 7, tool: 'apply_to_demand', args: { demand_id: 42, message: 'hi' } });
    assert.equal(verify(t, { userId: 7, tool: 'apply_to_demand', args: { message: 'hi', demand_id: 42 } }).ok, true);
  });

  it('换成别的用户：拒绝（A 的令牌不能确认成 B 的动作）', () => {
    const t = issue({ userId: 7, tool: 'apply_to_demand', args: ARGS });
    assert.equal(verify(t, { userId: 8, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });

  it('换成别的工具：拒绝（改简介的令牌不能拿去投递项目）', () => {
    const t = issue({ userId: 7, tool: 'update_my_profile', args: ARGS });
    assert.equal(verify(t, { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });

  it('参数被改过：拒绝——用户确认的不是这份', () => {
    const t = issue({ userId: 7, tool: 'apply_to_demand', args: ARGS });
    const r = verify(t, { userId: 7, tool: 'apply_to_demand', args: { ...ARGS, demand_id: 999 } });
    assert.equal(r.ok, false);
    assert.match(r.error, /changed/i);
  });

  it('拿登录 JWT 冒充确认令牌：拒绝（purpose 不符）', () => {
    const loginToken = jwt.sign({ userId: 7, email: 'eng@x.com', role: 'engineer' }, process.env.JWT_SECRET);
    assert.equal(verify(loginToken, { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });

  it('已过期：拒绝，且文案与伪造一致不泄露"签名其实是对的"', () => {
    const expired = jwt.sign(
      { purpose: 'tool_confirm', userId: 7, tool: 'apply_to_demand', argsHash: 'x' },
      process.env.JWT_SECRET,
      { expiresIn: -10 },
    );
    assert.equal(verify(expired, { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });

  it('别的密钥签的：拒绝', () => {
    const foreign = jwt.sign({ purpose: 'tool_confirm', userId: 7, tool: 'apply_to_demand', argsHash: 'x' }, 'other-secret');
    assert.equal(verify(foreign, { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });

  it('空令牌：拒绝', () => {
    assert.equal(verify('', { userId: 7, tool: 'apply_to_demand', args: ARGS }).ok, false);
  });
});

// ── 2. registry 写路径 ───────────────────────────────────────────────────────
// 造一个可编程的假 supabase：能分别控制 agent_actions 的去重查询与 begin 插入的结果，
// 并记录 handler 是否真的被执行过（写路径的每条断言归根结底都是"到底执行了没有"）。
function makeWriteDb({ dupHit = false, beginFails = false, onTalents } = {}) {
  const state = { handlerRan: false, auditInserts: 0, auditUpdates: 0 };
  const client = {
    from(table) {
      if (table === 'agent_actions') {
        return {
          // 去重查询链：select().eq()...gte().limit() → 数组
          select: () => builderChain(() => (dupHit ? [{ id: 1 }] : [])),
          insert: () => ({
            select: () => ({
              single: async () => {
                state.auditInserts++;
                return beginFails
                  ? { data: null, error: { message: 'audit table missing' } }
                  : { data: { id: 99 }, error: null };
              },
            }),
          }),
          update: () => ({ eq: async () => { state.auditUpdates++; return { error: null }; } }),
        };
      }
      state.handlerRan = true;
      return onTalents ? onTalents(table) : defaultTalents();
    },
  };
  return { client, state };

  function builderChain(finish) {
    const b = {};
    ['eq', 'gte', 'lt', 'order'].forEach((m) => { b[m] = () => b; });
    b.limit = async () => ({ data: finish(), error: null });
    return b;
  }
  function defaultTalents() {
    const b = {};
    ['select', 'eq', 'update', 'insert'].forEach((m) => { b[m] = () => b; });
    b.maybeSingle = async () => ({ data: { id: 5 }, error: null });
    b.single = async () => ({ data: { id: 5, bio: 'new bio' }, error: null });
    return b;
  }
}

describe('registry 写路径：身份、审计、去重', () => {

  it('匿名调写工具：拒绝，且 handler 一次都没跑', async () => {
    const { client, state } = makeWriteDb();
    const res = await registry.call('update_my_profile', { bio: 'x' }, { user: null, supabase: client });
    assert.equal(res.ok, false);
    assert.equal(state.handlerRan, false);
  });

  it('没有 supabase：拒绝（审计都无从谈起，就不该执行）', async () => {
    const res = await registry.call('update_my_profile', { bio: 'x' }, { user: USER, supabase: null });
    assert.equal(res.ok, false);
  });

  it('审计 begin 失败：拒绝执行——"做了但没记上"不允许出现', async () => {
    const { client, state } = makeWriteDb({ beginFails: true });
    const res = await registry.call('update_my_profile', { bio: 'x' }, { user: USER, supabase: client });
    assert.equal(res.ok, false);
    assert.equal(state.auditInserts, 1, '应当尝试过记账');
    assert.equal(state.handlerRan, false, '记账失败后绝不能执行 handler');
  });

  it('正常写：先记 pending 再执行，最后回填结果', async () => {
    const { client, state } = makeWriteDb();
    const res = await registry.call('update_my_profile', { bio: 'new bio' }, { user: USER, supabase: client });
    assert.equal(res.ok, true);
    assert.equal(state.auditInserts, 1);
    assert.equal(state.handlerRan, true);
    assert.equal(state.auditUpdates, 1, '执行完必须回填 ok/error');
  });

  it('近重复：同人同工具同参数刚做过 → 不重复执行，且如实告知', async () => {
    const { client, state } = makeWriteDb({ dupHit: true });
    const res = await registry.call('update_my_profile', { bio: 'x' }, { user: USER, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /moments ago/i);
    assert.equal(state.handlerRan, false);
    assert.equal(state.auditInserts, 0, '重复调用不该再插一条审计');
  });

  it('confirm 层未确认：只回提案 + 令牌，handler 不执行、也不记审计', async () => {
    const { client, state } = makeWriteDb();
    const res = await registry.call('apply_to_demand', { demand_id: 42 }, { user: USER, supabase: client });
    assert.equal(res.ok, false);
    assert.equal(res.needsConfirmation, true);
    assert.equal(res.tool, 'apply_to_demand');
    assert.deepEqual(res.args, { demand_id: 42 });
    assert.ok(res.confirmToken);
    assert.equal(state.handlerRan, false);
    assert.equal(state.auditInserts, 0);
  });

  it('读工具不进审计表（ai_events 已埋点，别把审计表淹了）', async () => {
    const { client, state } = makeWriteDb();
    await registry.call('get_rates', {}, { user: USER, supabase: client });
    assert.equal(state.auditInserts, 0);
  });
});

// ── 3. POST /api/agent/confirm ───────────────────────────────────────────────
describe('POST /api/agent/confirm', () => {
  const dbState = { client: null };
  const dbPath = require.resolve('../src/config/db');
  require.cache[dbPath] = {
    id: dbPath, filename: dbPath, loaded: true, exports: { getClient: () => dbState.client },
  };
  const agentRouter = require('../src/routes/agent');

  const app = express();
  app.use(express.json());
  app.use('/api/agent', agentRouter);

  const authHeader = () => `Bearer ${jwt.sign(USER, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

  beforeEach(() => { dbState.client = null; });

  it('未登录：401（确认即执行，匿名不许执行任何写操作）', async () => {
    const res = await request(app).post('/api/agent/confirm').send({ tool: 'apply_to_demand', args: {} });
    assert.equal(res.status, 401);
  });

  it('缺 tool：400', async () => {
    const res = await request(app).post('/api/agent/confirm')
      .set('Authorization', authHeader()).send({ args: {} });
    assert.equal(res.status, 400);
  });

  it('令牌是别人的：400，且 handler 一次没跑', async () => {
    const { client, state } = makeWriteDb();
    dbState.client = client;
    const stolen = issue({ userId: 999, tool: 'apply_to_demand', args: ARGS });
    const res = await request(app).post('/api/agent/confirm')
      .set('Authorization', authHeader())
      .send({ confirm_token: stolen, tool: 'apply_to_demand', args: ARGS });
    assert.equal(res.status, 400);
    assert.equal(state.handlerRan, false);
  });

  it('参数与确认时不一致：400，且 handler 一次没跑', async () => {
    const { client, state } = makeWriteDb();
    dbState.client = client;
    const token = issue({ userId: USER.userId, tool: 'apply_to_demand', args: ARGS });
    const res = await request(app).post('/api/agent/confirm')
      .set('Authorization', authHeader())
      .send({ confirm_token: token, tool: 'apply_to_demand', args: { ...ARGS, demand_id: 1 } });
    assert.equal(res.status, 400);
    assert.equal(state.handlerRan, false);
  });

  it('令牌合法：执行并记审计', async () => {
    // apply_to_demand 的 handler 会查 talents → demands → 插 demand_applications
    const seq = [];
    const { client, state } = makeWriteDb({
      onTalents: (table) => {
        seq.push(table);
        const b = {};
        ['select', 'eq'].forEach((m) => { b[m] = () => b; });
        b.maybeSingle = async () => (table === 'talents'
          ? { data: { id: 5, name: 'Li' }, error: null }
          : { data: { id: 42, title: 'Line 3 retrofit', contact: null, status: 'open' }, error: null });
        b.insert = async () => ({ error: null });
        return b;
      },
    });
    dbState.client = client;

    const args = { demand_id: 42, message: 'hi' };
    const token = issue({ userId: USER.userId, tool: 'apply_to_demand', args });
    const res = await request(app).post('/api/agent/confirm')
      .set('Authorization', authHeader())
      .send({ confirm_token: token, tool: 'apply_to_demand', args });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.applied, true);
    assert.equal(state.handlerRan, true);
    assert.equal(state.auditInserts, 1, 'confirm 层执行同样要 write-ahead 审计');
    assert.ok(seq.includes('talents') && seq.includes('demands'));
  });
});
