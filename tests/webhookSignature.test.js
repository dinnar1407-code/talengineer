// ── 企业 Webhook 签名派发（webhookService）单元测试 ──────────────────────────────
// 框架：node:test + node:assert/strict（与全站一致，非 Jest）。
// 用 helpers/supabaseChainMock 提供假 supabase（支持 .not()/.eq() 链 + await 取预置结果），
// 用替换 global.fetch 的方式拦截出站请求，断言签名可复算、缺 secret 不发、失败不抛。

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { makeSupabase } = require('./helpers/supabaseChainMock');
const { dispatchWebhook } = require('../src/services/webhookService');

// 每个用例可能替换 global.fetch；用完还原，避免污染其它测试文件。
const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

describe('dispatchWebhook', () => {
  it('签名可被接收方用同一 secret + 原始 body 复算验证', async () => {
    const secret = 'a'.repeat(64);
    const { client } = makeSupabase({
      api_keys: { data: [{ webhook_url: 'https://hook.test/e', webhook_secret: secret }], error: null },
    });

    let captured = null;
    global.fetch = async (url, opts) => { captured = { url, opts }; return { ok: true, status: 200 }; };

    await dispatchWebhook(client, { userId: 42, event: 'milestone.funded', payload: { milestone_id: 7 } });

    assert.ok(captured, 'fetch 应被调用');
    assert.equal(captured.url, 'https://hook.test/e');
    assert.equal(captured.opts.method, 'POST');

    // 用发送出去的原始 body（含 timestamp）复算 HMAC，必须与请求头里的签名一致。
    const sig = captured.opts.headers['X-TalEngineer-Signature'];
    const expected = crypto.createHmac('sha256', secret).update(captured.opts.body).digest('hex');
    assert.equal(sig, expected);

    // body 结构 = { event, payload, timestamp }
    const parsed = JSON.parse(captured.opts.body);
    assert.equal(parsed.event, 'milestone.funded');
    assert.deepEqual(parsed.payload, { milestone_id: 7 });
    assert.ok(parsed.timestamp, 'body 应带 timestamp');
  });

  it('给多条 key 各自签名并派发', async () => {
    const { client } = makeSupabase({
      api_keys: { data: [
        { webhook_url: 'https://a.test/e', webhook_secret: 'a'.repeat(64) },
        { webhook_url: 'https://b.test/e', webhook_secret: 'b'.repeat(64) },
      ], error: null },
    });
    const urls = [];
    global.fetch = async (url) => { urls.push(url); return { ok: true }; };
    await dispatchWebhook(client, { userId: 1, event: 'demand.assigned', payload: {} });
    assert.deepEqual(urls.sort(), ['https://a.test/e', 'https://b.test/e']);
  });

  it('webhook_secret 缺失 → 不发送（绝不发未签名请求）', async () => {
    const { client } = makeSupabase({
      api_keys: { data: [{ webhook_url: 'https://hook.test/e', webhook_secret: null }], error: null },
    });
    let called = false;
    global.fetch = async () => { called = true; return { ok: true }; };
    await dispatchWebhook(client, { userId: 42, event: 'demand.assigned', payload: {} });
    assert.equal(called, false);
  });

  it('无任何配置 webhook 的 key → 不发送', async () => {
    const { client } = makeSupabase({ api_keys: { data: [], error: null } });
    let called = false;
    global.fetch = async () => { called = true; return { ok: true }; };
    await dispatchWebhook(client, { userId: 1, event: 'x', payload: {} });
    assert.equal(called, false);
  });

  it('fetch 失败（网络错误/超时）→ 绝不抛出', async () => {
    const { client } = makeSupabase({
      api_keys: { data: [{ webhook_url: 'https://down.test/e', webhook_secret: 'b'.repeat(64) }], error: null },
    });
    global.fetch = async () => { throw new Error('ECONNREFUSED'); };
    await assert.doesNotReject(
      dispatchWebhook(client, { userId: 42, event: 'milestone.released', payload: { id: 1 } }),
    );
  });

  it('DB 查询出错 → 绝不抛出，且不发送', async () => {
    const { client } = makeSupabase({ api_keys: { data: null, error: { message: 'db down' } } });
    let called = false;
    global.fetch = async () => { called = true; return { ok: true }; };
    await assert.doesNotReject(
      dispatchWebhook(client, { userId: 42, event: 'x', payload: {} }),
    );
    assert.equal(called, false);
  });
});
