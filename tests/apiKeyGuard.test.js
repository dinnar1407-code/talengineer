// ── 企业 API Key 守卫 requireApiKey 的单元测试 ──────────────────────────────
// requireApiKey 保护企业接口：要求 Authorization: Bearer TE_<key>，
// 把 key 做 SHA-256 后在 api_keys 表查 active 记录，命中才放行并记录 req.apiKeyUserId。
//
// 关键技巧（说明给初学者）：
// apikeys.js 顶部用 `const { getClient } = require('../config/db')` 解构拿到了函数引用。
// 这是“在 import 那一刻就把函数复制到局部变量”，之后再改 db.getClient 也不会影响它。
// 所以要 mock，必须“先把 db.getClient 换掉，再让 apikeys.js 重新执行一次解构”。
// 做法：删掉 require 缓存里的 apikeys 模块，patch 好 db.getClient 后再重新 require。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../src/config/db');
const apikeysPath = require.resolve('../src/routes/apikeys');
const db = require('../src/config/db');
const { createSupabaseMock } = require('./helpers/supabaseMock');

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

// 在 db.getClient 已被 patch 的前提下，重新加载 apikeys.js，
// 使其顶部解构出来的 getClient 指向我们 patch 后的函数。
function loadRequireApiKeyFresh() {
  delete require.cache[apikeysPath];
  return require('../src/routes/apikeys').requireApiKey;
}

describe('requireApiKey（企业 API Key 守卫）', () => {
  let originalGetClient;
  beforeEach(() => { originalGetClient = db.getClient; });
  afterEach(() => {
    // 还原 getClient 并清掉被我们污染的 apikeys 缓存，避免影响其它测试文件。
    db.getClient = originalGetClient;
    delete require.cache[apikeysPath];
  });

  it('缺少 Authorization 头：返回 401，且不查数据库（前缀检查在取 client 之前）', async () => {
    let dbTouched = false;
    db.getClient = () => { dbTouched = true; return createSupabaseMock().client; };
    const requireApiKey = loadRequireApiKeyFresh();
    const res = makeRes();
    let nextCalled = false;

    await requireApiKey({ headers: {} }, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.equal(dbTouched, false, '前缀都不对就不该查库');
  });

  it('前缀不是 TE_（如普通 JWT Bearer）：返回 401', async () => {
    db.getClient = () => createSupabaseMock().client;
    const requireApiKey = loadRequireApiKeyFresh();
    const res = makeRes();
    let nextCalled = false;

    await requireApiKey(
      { headers: { authorization: 'Bearer eyJhbGciOi...' } },
      res, () => { nextCalled = true; }
    );

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('key 在库中不存在：返回 401（Invalid or revoked）', async () => {
    db.getClient = () => createSupabaseMock({ api_keys: { data: null, error: null } }).client;
    const requireApiKey = loadRequireApiKeyFresh();
    const res = makeRes();
    let nextCalled = false;

    await requireApiKey(
      { headers: { authorization: 'Bearer TE_deadbeef' } },
      res, () => { nextCalled = true; }
    );

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('key 存在但 active=false（已吊销）：返回 401', async () => {
    db.getClient = () => createSupabaseMock({
      api_keys: { data: { id: 1, user_id: 42, active: false }, error: null },
    }).client;
    const requireApiKey = loadRequireApiKeyFresh();
    const res = makeRes();
    let nextCalled = false;

    await requireApiKey(
      { headers: { authorization: 'Bearer TE_somekey' } },
      res, () => { nextCalled = true; }
    );

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('有效且 active 的 key：放行，并把 user_id 写到 req.apiKeyUserId', async () => {
    // .single() 查 key 命中 active；随后 update().eq() 记录 last_used 也走 mock（thenable 兜底）。
    db.getClient = () => createSupabaseMock({
      api_keys: { data: { id: 1, user_id: 42, active: true }, error: null },
    }).client;
    const requireApiKey = loadRequireApiKeyFresh();
    const req = { headers: { authorization: 'Bearer TE_validkey' } };
    const res = makeRes();
    let nextCalled = false;

    await requireApiKey(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(req.apiKeyUserId, 42);
    assert.equal(res.statusCode, null);
  });
});
