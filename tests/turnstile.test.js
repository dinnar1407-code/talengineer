// ── Turnstile 真人验证的单元/中间件测试（src/utils/turnstile.js）────────────────
// 重点断言的是两条【刻意不同】的 fail 策略，改坏了不会有别的测试拦住：
//   - 未配 secret → fail-OPEN（否则代码一上线、env 还没配，注册立刻全挂）
//   - 已配 secret 但校验不过 / 超时 / 网络错 → fail-CLOSED（宁可短暂不能注册，不放机器人）
// fetch 用全局桩替换（Node 18+ 的 global.fetch），不发真实网络请求。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { verifyTurnstile, requireTurnstile } = require('../src/utils/turnstile');

const REAL_FETCH = global.fetch;
const REAL_SECRET = process.env.TURNSTILE_SECRET_KEY;

// 记录 siteverify 的入参，供断言"确实带了 secret/response/remoteip"
let lastCall = null;
function stubFetch(impl) {
  global.fetch = async (url, opts) => {
    lastCall = { url, body: opts?.body ? Object.fromEntries(opts.body) : null };
    return impl();
  };
}
const jsonResp = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

beforeEach(() => { lastCall = null; });
afterEach(() => {
  global.fetch = REAL_FETCH;
  if (REAL_SECRET === undefined) delete process.env.TURNSTILE_SECRET_KEY;
  else process.env.TURNSTILE_SECRET_KEY = REAL_SECRET;
});

describe('verifyTurnstile', () => {

  it('未配 TURNSTILE_SECRET_KEY：fail-open 放行并标记 skipped（不发网络请求）', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    stubFetch(() => { throw new Error('不应该被调用'); });
    const r = await verifyTurnstile('any-token', '1.2.3.4');
    assert.equal(r.ok, true);
    assert.equal(r.skipped, true);
    assert.equal(lastCall, null);
  });

  it('已配 secret 但前端没带 token：拒绝（不发网络请求）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: true }));
    const r = await verifyTurnstile('', '1.2.3.4');
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'missing-token');
    assert.equal(lastCall, null);
  });

  it('siteverify 返回 success:true：通过，且请求带上 secret/response/remoteip', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: true }));
    const r = await verifyTurnstile('tok-1', '9.9.9.9');
    assert.equal(r.ok, true);
    assert.equal(lastCall.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.deepEqual(lastCall.body, { secret: 'sk_test', response: 'tok-1', remoteip: '9.9.9.9' });
  });

  it('siteverify 返回 success:false：拒绝（reason=failed）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: false, 'error-codes': ['timeout-or-duplicate'] }));
    const r = await verifyTurnstile('tok-1');
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'failed');
  });

  it('siteverify HTTP 非 2xx：按 verify-unavailable 拒绝（fail-closed）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({}, 500));
    const r = await verifyTurnstile('tok-1');
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'verify-unavailable');
  });

  it('网络异常：按 verify-unavailable 拒绝，且不向上抛（fail-closed 且不裸崩）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => { throw new Error('ECONNRESET'); });
    const r = await verifyTurnstile('tok-1');
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'verify-unavailable');
  });

  it('无 ip 时不带 remoteip 字段', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: true }));
    await verifyTurnstile('tok-1');
    assert.deepEqual(lastCall.body, { secret: 'sk_test', response: 'tok-1' });
  });
});

describe('requireTurnstile 中间件', () => {
  // 被拦下的请求必须【永远碰不到】业务逻辑——这是它挂在路由之前的全部意义
  function makeApp() {
    const app = express();
    app.use(express.json());
    let reached = false;
    app.post('/x', requireTurnstile, (req, res) => { reached = true; res.json({ status: 'ok' }); });
    app.reachedBusiness = () => reached;
    return app;
  }

  it('校验通过：放行到业务处理器', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: true }));
    const app = makeApp();
    const res = await request(app).post('/x').send({ turnstile_token: 'tok' });
    assert.equal(res.status, 200);
    assert.equal(app.reachedBusiness(), true);
  });

  it('校验不过：403，且业务处理器一次都没被执行（不写库、不发邮件）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => jsonResp({ success: false, 'error-codes': ['invalid-input-response'] }));
    const app = makeApp();
    const res = await request(app).post('/x').send({ turnstile_token: 'bad' });
    assert.equal(res.status, 403);
    assert.equal(app.reachedBusiness(), false);
    // Cloudflare 的诊断码不回前端——回了等于告诉刷子哪一步被识破
    assert.equal(JSON.stringify(res.body).includes('invalid-input-response'), false);
  });

  it('验证服务不可用：503（让用户知道该重试，而不是以为自己填错了）', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'sk_test';
    stubFetch(() => { throw new Error('down'); });
    const app = makeApp();
    const res = await request(app).post('/x').send({ turnstile_token: 'tok' });
    assert.equal(res.status, 503);
    assert.equal(app.reachedBusiness(), false);
  });

  it('未配 secret：直接放行（代码可先于 env 上线）', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const app = makeApp();
    const res = await request(app).post('/x').send({});
    assert.equal(res.status, 200);
    assert.equal(app.reachedBusiness(), true);
  });
});
