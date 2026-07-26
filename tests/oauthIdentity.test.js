// ── OAuth 身份关联（POST /api/auth/oauth-token）HTTP 级集成测试 ────────────────
// 被测的是 Wave A/A1 的核心：从「按 email 认人」改成「按 (provider, provider_sub) 认人」。
// 这几条断言直接对应几个真实事故场景，别删：
//   - 同一个人开了第二个通道（Google→Microsoft）不能被建成两个账号；
//   - 用户在 provider 侧改了邮箱，我方仍要认得出他是老用户；
//   - provider 没验证邮箱时，绝不允许拿邮箱认领一个已存在的账号（账号接管防线）。
// 框架：node:test + supertest（非 Jest）。db 用 require.cache 预注入假模块。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const express = require('express');
const request = require('supertest');

const { makeSupabase } = require('./helpers/supabaseChainMock');

// JWT_SECRET 必须在 require(auth) 之前设好——auth.js 在模块加载时就捕获了它
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-oauth-identity';

// ── 预注入假 ../config/db（auth.js 在 handler 内调 getClient()，故可逐用例换客户端）──
const dbState = { client: null };
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true, exports: { getClient: () => dbState.client },
};

const authRouter = require('../src/routes/auth'); // 注入之后再加载

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// ── 造一个带 auth.getUser 的假 Supabase 客户端 ────────────────────────────────
// tableResults: { 表名: {data,error} | [{data,error}, ...] }（数组=按终结调用顺序依次返回）
function setDb(tableResults, supabaseUser) {
  const { client, calls } = makeSupabase(tableResults);
  client.auth = {
    getUser: async () => (supabaseUser
      ? { data: { user: supabaseUser }, error: null }
      : { data: { user: null }, error: { message: 'invalid session' } }),
  };
  dbState.client = client;
  return calls;
}

// Supabase 返回的 user 对象（只保留本路由真正读到的字段）
function oauthUser({ provider = 'google', sub = 'sub-123', email = 'a@b.com', confirmed = true } = {}) {
  return {
    id: 'supabase-uuid-1',
    email,
    email_confirmed_at: confirmed ? '2026-01-01T00:00:00Z' : null,
    app_metadata: { provider },
    identities: [{ provider, id: sub }],
    user_metadata: { full_name: 'Test User' },
  };
}

const OK = { data: null, error: null }; // 空结果（未命中 / insert 成功无返回）

beforeEach(() => { dbState.client = null; });

describe('POST /api/auth/oauth-token —— 按 (provider, sub) 认人', () => {

  it('缺 access_token：400', async () => {
    setDb({}, null);
    const res = await request(app).post('/api/auth/oauth-token').send({ role: 'employer' });
    assert.equal(res.status, 400);
  });

  it('Supabase 会话无效：401（不泄漏细节）', async () => {
    setDb({}, null);
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 'bad' });
    assert.equal(res.status, 401);
  });

  it('provider 不在白名单（如 apple）：400——Supabase 后台被误开第三个通道时的最后一道闸', async () => {
    setDb({}, oauthUser({ provider: 'apple' }));
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't', role: 'employer' });
    assert.equal(res.status, 400);
  });

  it('azure（Microsoft）在白名单内：放行', async () => {
    setDb({
      auth_identities: [{ data: { user_id: 7 }, error: null }],
      users: [{ data: { id: 7, email: 'a@b.com', role: 'engineer', name: 'Old' }, error: null }],
    }, oauthUser({ provider: 'azure', sub: 'ms-sub-9' }));
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 200);
    assert.equal(res.body.role, 'engineer');
  });

  it('身份行命中：直接登录该账号，不建号——邮箱在 provider 侧改过也认得出', async () => {
    // 关键：Supabase 回来的 email 与库里 users.email 不同（用户改了邮箱），仍须认出是同一人
    const calls = setDb({
      auth_identities: [{ data: { user_id: 7 }, error: null }],
      users: [{ data: { id: 7, email: 'old@b.com', role: 'employer', name: 'Boss' }, error: null }],
    }, oauthUser({ email: 'new@b.com' }));

    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'old@b.com'); // 以库里为准
    assert.equal(res.body.is_new_user, false); // 老用户不能被再送去 onboarding
    // 没有走建号：users 表没有 insert
    assert.equal(calls.some((c) => c.table === 'users' && c.method === 'insert'), false);
    // 也没有重复写身份行
    assert.equal(calls.some((c) => c.table === 'auth_identities' && c.method === 'insert'), false);
  });

  it('身份未命中但 email 命中已有账号（已验证邮箱）：关联并补写身份行，不建号', async () => {
    // 这是「密码老用户第一次点 Google」和「Google 老用户第一次点 Microsoft」的路径
    const calls = setDb({
      auth_identities: [OK, OK],                       // ① select 未命中 ② insert 成功
      users: [{ data: { id: 42, email: 'a@b.com', role: 'employer', name: 'Boss' }, error: null }],
    }, oauthUser({ provider: 'azure', sub: 'ms-1' }));

    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'a@b.com');
    assert.equal(calls.some((c) => c.table === 'users' && c.method === 'insert'), false);

    const link = calls.find((c) => c.table === 'auth_identities' && c.method === 'insert');
    assert.ok(link, '必须补写 auth_identities 行，否则下次登录又要走 email 关联');
    assert.deepEqual(link.args[0], [{
      user_id: 42, provider: 'azure', provider_sub: 'ms-1', email_at_link: 'a@b.com',
    }]);
  });

  it('身份未命中 + email 命中，但 provider 未验证邮箱：403（账号接管防线）', async () => {
    const calls = setDb({
      auth_identities: [OK],
      users: [{ data: { id: 42, email: 'a@b.com', role: 'employer', name: 'Boss' }, error: null }],
    }, oauthUser({ confirmed: false }));

    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 403);
    // 绝不能悄悄关联上去
    assert.equal(calls.some((c) => c.table === 'auth_identities' && c.method === 'insert'), false);
  });

  it('全新用户但没带 role：400 + code ROLE_REQUIRED（供 /login 弹角色选择后重试）', async () => {
    const calls = setDb({ auth_identities: [OK], users: [OK] }, oauthUser());
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'ROLE_REQUIRED');
    assert.equal(calls.some((c) => c.table === 'users' && c.method === 'insert'), false);
  });

  it('全新用户 + 带 role：建号（password 空串）并写身份行', async () => {
    const calls = setDb({
      auth_identities: [OK, OK],
      users: [OK, { data: { id: 99, email: 'a@b.com', role: 'engineer', name: 'Test User' }, error: null }],
    }, oauthUser({ sub: 'g-new' }));

    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't', role: 'engineer' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    // 前端据此把新工程师送去 /onboarding 补 talents 档案——漏了他就进不了任何撮合
    assert.equal(res.body.is_new_user, true);

    const ins = calls.find((c) => c.table === 'users' && c.method === 'insert');
    assert.ok(ins);
    // password:'' 是 OAuth 账户的标记——/login 路由据此拒绝密码登录，防任意密码绕过鉴权
    assert.equal(ins.args[0][0].password, '');
    assert.equal(ins.args[0][0].role, 'engineer');

    const link = calls.find((c) => c.table === 'auth_identities' && c.method === 'insert');
    assert.deepEqual(link.args[0], [{
      user_id: 99, provider: 'google', provider_sub: 'g-new', email_at_link: 'a@b.com',
    }]);
  });

  it('role 只对新用户生效：老用户传 role=employer 也不改库里的 engineer', async () => {
    setDb({
      auth_identities: [{ data: { user_id: 7 }, error: null }],
      users: [{ data: { id: 7, email: 'a@b.com', role: 'engineer', name: 'Eng' }, error: null }],
    }, oauthUser());
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't', role: 'employer' });
    assert.equal(res.status, 200);
    assert.equal(res.body.role, 'engineer'); // 前端传什么都不影响
  });

  it('非法 role 值：400（防自封 admin）', async () => {
    setDb({}, oauthUser());
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't', role: 'admin' });
    assert.equal(res.status, 400);
  });

  it('auth_identities 表还没建（迁移 025 未执行，42P01）：降级回按 email 认人，登录不挂', async () => {
    // 部署顺序红线是"迁移先上生产再 push"，但纪律万一被漏掉，用户的登录不该整条崩掉
    const calls = setDb({
      auth_identities: [{ data: null, error: { code: '42P01', message: 'relation "auth_identities" does not exist' } }],
      users: [{ data: { id: 42, email: 'a@b.com', role: 'employer', name: 'Boss' }, error: null }],
    }, oauthUser());

    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    // 表都不存在，就别再去 insert 身份行（那次 insert 必然也失败，会把 200 变成 500）
    assert.equal(calls.some((c) => c.table === 'auth_identities' && c.method === 'insert'), false);
  });

  it('身份行并发写入撞唯一键（23505）：不报错，照常发 JWT', async () => {
    setDb({
      auth_identities: [OK, { data: null, error: { code: '23505', message: 'duplicate key' } }],
      users: [{ data: { id: 42, email: 'a@b.com', role: 'employer', name: 'Boss' }, error: null }],
    }, oauthUser());
    const res = await request(app).post('/api/auth/oauth-token').send({ access_token: 't' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });
});
