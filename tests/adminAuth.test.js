// ── admin 双通道鉴权中间件（TOTP 2FA JWT + break-glass 共享口令）单元测试 ──────
// 主通道：Bearer JWT（role=admin 且 adm2fa=true）；应急通道：x-admin-password 共享口令。
// 用 supertest 起一个最小 express 应用挂上中间件，直接观察 401 / 放行与 req.adminAuthMethod 标记。
// 注：账号化改造后不再对"未配置 ADMIN_PASSWORD"做 503 fail-closed——未认证一律 401。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ADMIN_PASSWORD = 'break-glass-pw'; // 测试用假口令，绝不使用真实值
const express = require('express');
const request = require('supertest');
const adminAuth = require('../src/middleware/adminAuth');

function app() {
  const a = express();
  a.get('/x', adminAuth, (req, res) => res.json({ method: req.adminAuthMethod, email: req.adminEmail }));
  return a;
}

test('无凭证 → 401', async () => {
  await request(app()).get('/x').expect(401);
});

test('共享口令通过，方法标记 shared-password', async () => {
  const r = await request(app()).get('/x').set('x-admin-password', 'break-glass-pw').expect(200);
  assert.equal(r.body.method, 'shared-password');
});

test('共享口令错误 → 401（且长度差异不抛异常）', async () => {
  await request(app()).get('/x').set('x-admin-password', 'x').expect(401);
});

test('adm2fa JWT 通过；无 adm2fa 声明拒绝', async () => {
  const ok = jwt.sign({ email: 'a@b.c', role: 'admin', adm2fa: true }, process.env.JWT_SECRET);
  const bad = jwt.sign({ email: 'a@b.c', role: 'admin' }, process.env.JWT_SECRET);
  const r = await request(app()).get('/x').set('Authorization', `Bearer ${ok}`).expect(200);
  assert.equal(r.body.method, 'jwt-2fa');
  assert.equal(r.body.email, 'a@b.c');
  await request(app()).get('/x').set('Authorization', `Bearer ${bad}`).expect(401);
});

test('非 admin 角色即便带 adm2fa 也拒绝', async () => {
  const t = jwt.sign({ email: 'e@b.c', role: 'engineer', adm2fa: true }, process.env.JWT_SECRET);
  await request(app()).get('/x').set('Authorization', `Bearer ${t}`).expect(401);
});
