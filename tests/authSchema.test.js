// ── 注册/登录输入校验（Zod schema）的单元测试 ───────────────────────────────
// 输入校验是安全第一道闸：挡住非法邮箱、弱密码、非法角色等。
// registerSchema / loginSchema 已从 src/routes/auth.js 导出（挂在 router 上，不影响 app.use）。
// 这里用 safeParse 直接喂各种合法/非法输入，断言成功/失败及报错文案。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { registerSchema, loginSchema } = require('../src/routes/auth');

describe('registerSchema（注册输入校验）', () => {

  it('合法的 employer 注册：通过', () => {
    const r = registerSchema.safeParse({
      email: 'boss@factory.com', password: 'supersecret', role: 'employer',
    });
    assert.equal(r.success, true);
  });

  it('合法的 engineer 注册（含可选工程师字段）：通过', () => {
    const r = registerSchema.safeParse({
      email: 'eng@plc.io', password: 'longpass123', role: 'engineer',
      engName: 'Li', engPricingModel: 'milestone',
    });
    assert.equal(r.success, true);
  });

  it('非法邮箱：失败，报“Invalid email address”', () => {
    const r = registerSchema.safeParse({
      email: 'not-an-email', password: 'longpass123', role: 'employer',
    });
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, 'Invalid email address');
  });

  it('密码过短（< 8 位）：失败，报最小长度文案', () => {
    const r = registerSchema.safeParse({
      email: 'a@b.com', password: 'short', role: 'employer',
    });
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, 'Password must be at least 8 characters');
  });

  it('密码恰好 8 位：边界值通过', () => {
    const r = registerSchema.safeParse({
      email: 'a@b.com', password: '12345678', role: 'engineer',
    });
    assert.equal(r.success, true);
  });

  it('非法 role（如 hacker/admin 自封）：失败', () => {
    // 注意：role 只允许 employer / engineer，禁止用户自封 admin，这是权限提升防线。
    const r = registerSchema.safeParse({
      email: 'a@b.com', password: 'longpass123', role: 'admin',
    });
    assert.equal(r.success, false);
  });

  it('缺少必填字段（无 password）：失败', () => {
    const r = registerSchema.safeParse({ email: 'a@b.com', role: 'employer' });
    assert.equal(r.success, false);
  });

  it('缺少必填字段（无 role）：失败', () => {
    const r = registerSchema.safeParse({ email: 'a@b.com', password: 'longpass123' });
    assert.equal(r.success, false);
  });

  it('非法 engPricingModel：失败（枚举只接受 hourly/milestone）', () => {
    const r = registerSchema.safeParse({
      email: 'a@b.com', password: 'longpass123', role: 'engineer',
      engPricingModel: 'weekly',
    });
    assert.equal(r.success, false);
  });
});

describe('loginSchema（登录输入校验）', () => {

  it('合法登录：通过', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    assert.equal(r.success, true);
  });

  it('非法邮箱：失败', () => {
    const r = loginSchema.safeParse({ email: 'bad', password: 'x' });
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, 'Invalid email address');
  });

  it('空密码：失败（登录要求密码至少 1 位）', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, 'Password is required');
  });

  it('缺少 email 字段：失败', () => {
    const r = loginSchema.safeParse({ password: 'x' });
    assert.equal(r.success, false);
  });
});
