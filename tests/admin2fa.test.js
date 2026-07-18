// ── otplib API 面回归测试（守门员）────────────────────────────────────────────
// 背景：otplib v13 移除了 authenticator 导出，src/routes/auth.js 用的 v12 API
// （generateSecret/generate/verify/keyuri）在 v13 下全为 undefined，两个 2FA 端点恒 500。
// 这条测试直接锁住 auth.js 依赖的 API 面，未来依赖误升级会当场变红，防止复发。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const otplib = require('otplib');

test('otplib.authenticator 导出存在，且 auth.js 依赖的方法齐全', () => {
  assert.ok(otplib.authenticator, 'authenticator 导出必须存在（v13 移除了它）');
  assert.equal(typeof otplib.authenticator.generateSecret, 'function');
  assert.equal(typeof otplib.authenticator.generate, 'function');
  assert.equal(typeof otplib.authenticator.verify, 'function');
  assert.equal(typeof otplib.authenticator.keyuri, 'function');
});

test('generateSecret → generate → verify 闭环：正确码 true，错误码 false', () => {
  const { authenticator } = otplib;
  const secret = authenticator.generateSecret();
  const token = authenticator.generate(secret); // 模拟认证器 App 当前时间步出的码
  assert.equal(authenticator.verify({ token, secret }), true, '当前时间步的真码应校验通过');
  // 取一个确定不等于真码的 6 位串：默认时间窗内不会命中，故必为 false
  const wrong = token === '000000' ? '999999' : '000000';
  assert.equal(authenticator.verify({ token: wrong, secret }), false, '错误码必须校验失败');
});

test('keyuri 返回含 otpauth:// 的绑定 URL（供认证器扫码/录入）', () => {
  const { authenticator } = otplib;
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri('admin@example.com', 'TalEngineer Admin', secret);
  assert.equal(typeof uri, 'string');
  assert.match(uri, /^otpauth:\/\//);
});
