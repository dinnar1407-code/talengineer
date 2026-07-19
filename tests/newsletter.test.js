// ── Newsletter 订阅路由的纯逻辑单元测试（不连库）────────────────────────────────
// 覆盖两块：
//   1) subscribeSchema —— zod 入参校验：非法 email/source 必须被拒，合法输入放行、lang 可选。
//   2) HMAC 退订签名 —— 正确签名验证通过、伪造/缺失/异常签名一律拒绝。
// 与 scoreToken.test.js 同样的口径：必须在 require 路由之前设好 JWT_SECRET，
// 因为 newsletter.js 在模块加载时读取 process.env.JWT_SECRET 计算 HMAC 密钥。
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-newsletter';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { subscribeSchema, unsubscribeSig, verifySig } = require('../src/routes/newsletter');

describe('subscribeSchema（订阅入参 zod 校验）', () => {

  it('合法输入：通过，lang 可选可省', () => {
    const ok1 = subscribeSchema.safeParse({ email: 'a@b.com', source: 'calculator', lang: 'zh' });
    assert.equal(ok1.success, true);
    assert.equal(ok1.data.email, 'a@b.com');

    const ok2 = subscribeSchema.safeParse({ email: 'x@y.io', source: 'footer' });
    assert.equal(ok2.success, true); // 缺 lang 也应通过
  });

  it('非法 email：拒绝', () => {
    assert.equal(subscribeSchema.safeParse({ email: 'not-an-email', source: 'calculator' }).success, false);
    assert.equal(subscribeSchema.safeParse({ email: '', source: 'calculator' }).success, false);
    assert.equal(subscribeSchema.safeParse({ source: 'calculator' }).success, false); // email 缺失
  });

  it('非法 source（不在 calculator|playbook|footer 内）：拒绝', () => {
    assert.equal(subscribeSchema.safeParse({ email: 'a@b.com', source: 'hacker' }).success, false);
    assert.equal(subscribeSchema.safeParse({ email: 'a@b.com' }).success, false); // source 缺失
  });

  it('未知字段被 strip 丢弃而非报错', () => {
    const r = subscribeSchema.safeParse({ email: 'a@b.com', source: 'playbook', evil: 'DROP TABLE' });
    assert.equal(r.success, true);
    assert.equal(r.data.evil, undefined); // 未知字段不落进 data
  });
});

describe('HMAC 退订签名（unsubscribeSig / verifySig）', () => {

  it('正确签名：验证通过', () => {
    const email = 'user@example.com';
    const sig = unsubscribeSig(email);
    assert.equal(verifySig(email, sig), true);
  });

  it('同一邮箱签名稳定，不同邮箱签名不同', () => {
    assert.equal(unsubscribeSig('a@b.com'), unsubscribeSig('a@b.com'));
    assert.notEqual(unsubscribeSig('a@b.com'), unsubscribeSig('c@d.com'));
  });

  it('伪造签名：拒绝', () => {
    const email = 'user@example.com';
    const forged = 'deadbeef'.repeat(8); // 64 hex 字符，长度像真签名但内容是假的
    assert.equal(verifySig(email, forged), false);
  });

  it('拿别人邮箱的签名冒充：拒绝', () => {
    const sigForOther = unsubscribeSig('other@example.com');
    assert.equal(verifySig('victim@example.com', sigForOther), false);
  });

  it('签名缺失/空串/非字符串：拒绝且不抛错', () => {
    const email = 'user@example.com';
    assert.equal(verifySig(email, undefined), false);
    assert.equal(verifySig(email, ''), false);
    assert.equal(verifySig(email, null), false);
    assert.equal(verifySig(email, 12345), false);
  });

  it('长度不等的乱字符串：拒绝且不抛错（timingSafeEqual 需等长）', () => {
    const email = 'user@example.com';
    assert.equal(verifySig(email, 'short'), false);
    assert.equal(verifySig(email, 'x'.repeat(200)), false);
  });
});
