// ── 管理员口令中间件 requireAdmin 的单元测试 ────────────────────────────────
// 这是 admin/纠纷/认证等敏感路由的守门人。它读 process.env.ADMIN_PASSWORD，
// 比较请求头 x-admin-password，用 timingSafeEqual 做恒时比较。
// 我们用手写的 req/res/next mock 来观察它最终走向 503 / 401 / 放行哪条分支。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const { requireAdmin } = require('../src/middleware/adminAuth');

// 极简的 res mock：记录 status 码与 json 负载；status() 返回自身以支持链式 .status().json()。
function makeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return res;
}

describe('requireAdmin（管理员口令守卫）', () => {
  // 保存原始环境变量，测试结束后还原，避免污染其它用例。
  let originalPwd;
  beforeEach(() => { originalPwd = process.env.ADMIN_PASSWORD; });
  afterEach(() => {
    if (originalPwd === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPwd;
  });

  it('未配置 ADMIN_PASSWORD 时 fail-closed：返回 503，绝不放行', () => {
    delete process.env.ADMIN_PASSWORD;
    const res = makeRes();
    let nextCalled = false;

    requireAdmin({ headers: {} }, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 503);
    assert.equal(nextCalled, false);
  });

  it('缺少 x-admin-password 请求头：返回 401', () => {
    process.env.ADMIN_PASSWORD = 'topsecret';
    const res = makeRes();
    let nextCalled = false;

    requireAdmin({ headers: {} }, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('口令为空字符串：返回 401', () => {
    process.env.ADMIN_PASSWORD = 'topsecret';
    const res = makeRes();
    let nextCalled = false;

    requireAdmin({ headers: { 'x-admin-password': '' } }, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('口令错误（长度相同）：返回 401', () => {
    process.env.ADMIN_PASSWORD = 'topsecret';
    const res = makeRes();
    let nextCalled = false;

    requireAdmin({ headers: { 'x-admin-password': 'wrongpass' } }, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('口令错误（长度不同）：仍返回 401，且不因长度差异抛异常', () => {
    // 设计上先各自 SHA-256 再比较，摘要等长，所以长度不同也不会让 timingSafeEqual 抛错。
    process.env.ADMIN_PASSWORD = 'topsecret';
    const res = makeRes();
    let nextCalled = false;

    assert.doesNotThrow(() => {
      requireAdmin({ headers: { 'x-admin-password': 'x' } }, res, () => { nextCalled = true; });
    });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('口令正确：调用 next() 放行，不写任何错误响应', () => {
    process.env.ADMIN_PASSWORD = 'topsecret';
    const res = makeRes();
    let nextCalled = false;

    requireAdmin({ headers: { 'x-admin-password': 'topsecret' } }, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null); // 没有写过任何状态码
  });
});
