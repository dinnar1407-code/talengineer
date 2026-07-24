// ── 背调（W2-5）单元 + HTTP 路由测试 ──────────────────────────────────────────
// 覆盖四块：
//   1) bgcheckService.isValid 的过期判定矩阵（纯函数）；
//   2) requestCheck 幂等（在途/有效 passed 命中现状不重复建行；checkr 未配置抛错）；
//   3) /api/bgcheck 路由：IDOR 防线（talent_id 只从登录态反查，body 传的一律无视）、
//      admin 复核生命周期（条件更新 + expires_at + 审计行）；
//   4) /api/talent/list 的 bg_checked 过滤参数拼装（DB 侧 .in() 与分页共存）与徽章富化。
// 为什么全走 mock：套件必须完全离线（无 DB/无网络）；Supabase 用 supabaseChainMock，
// db/auth/adminAuth 用 mockPayDeps 的 require.cache 预注入（router 在 require 时捕获依赖，
// 注入必须发生在 require 之前——顺序是 load-bearing 的）。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');

// 先装假依赖，再 require 被测路由（顺序不可颠倒）
const { installPayDeps } = require('./helpers/mockPayDeps');
const deps = installPayDeps();

const bgcheckRouter = require('../src/routes/bgcheck');
const talentRouter = require('../src/routes/talent');
const { isValid, requestCheck, batchStatus, listValidTalentIds } = require('../src/services/bgcheckService');
const { makeSupabase } = require('./helpers/supabaseChainMock');
const { VALIDITY_DAYS } = require('../src/config/bgcheck');

// 最小 express app：复刻 src/app.js 的挂载方式（json 解析 + 路由前缀）
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/bgcheck', bgcheckRouter);
  app.use('/api/talent', talentRouter);
  return app;
}

// 在 calls 记录里找某表某方法的调用（照 paymentRoutes.test.js 的 findCall 手法）
function findCall(calls, table, method) {
  return calls.find((c) => c.table === table && c.method === method);
}

const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2000-01-01T00:00:00.000Z';

// ── 1) isValid 过期判定矩阵 ───────────────────────────────────────────────────
describe('bgcheckService.isValid', () => {
  it('null / 在途 / failed → 一律无效', () => {
    assert.equal(isValid(null), false);
    assert.equal(isValid({ status: 'requested', expires_at: null }), false);
    assert.equal(isValid({ status: 'pending', expires_at: FUTURE }), false);
    assert.equal(isValid({ status: 'failed', expires_at: null }), false);
  });

  it('passed + expires_at 为 NULL（长期有效）→ 有效', () => {
    assert.equal(isValid({ status: 'passed', expires_at: null }), true);
  });

  it('passed + 未过期 → 有效；passed + 已过期 → 无效', () => {
    assert.equal(isValid({ status: 'passed', expires_at: FUTURE }), true);
    assert.equal(isValid({ status: 'passed', expires_at: PAST }), false);
  });
});

// ── 2) requestCheck 幂等 ─────────────────────────────────────────────────────
describe('bgcheckService.requestCheck', () => {
  it('已有 requested 在途 → 返回现状不建行（created=false，无 insert）', async () => {
    const { client, calls } = makeSupabase({
      background_checks: { data: [{ id: 1, talent_id: 9, status: 'requested', expires_at: null }], error: null },
    });
    const r = await requestCheck(client, 9);
    assert.equal(r.created, false);
    assert.equal(r.check.id, 1);
    assert.equal(calls.some((c) => c.table === 'background_checks' && c.method === 'insert'), false);
  });

  it('已有仍有效的 passed → 同样幂等命中现状', async () => {
    const { client, calls } = makeSupabase({
      background_checks: { data: [{ id: 2, talent_id: 9, status: 'passed', expires_at: FUTURE }], error: null },
    });
    const r = await requestCheck(client, 9);
    assert.equal(r.created, false);
    assert.equal(r.check.id, 2);
    assert.equal(calls.some((c) => c.table === 'background_checks' && c.method === 'insert'), false);
  });

  it('只有已过期的 passed → 重新建 requested 行（created=true）', async () => {
    const { client, calls } = makeSupabase({
      background_checks: [
        { data: [{ id: 3, talent_id: 9, status: 'passed', expires_at: PAST }], error: null }, // 查询现状
        { data: { id: 4, talent_id: 9, status: 'requested' }, error: null },                  // insert 返回
      ],
    });
    const r = await requestCheck(client, 9);
    assert.equal(r.created, true);
    assert.equal(r.check.id, 4);
    const ins = findCall(calls, 'background_checks', 'insert');
    assert.ok(ins, 'should insert a new requested row');
    assert.deepEqual(ins.args[0], { talent_id: 9, provider: 'manual', status: 'requested' });
  });

  it('checkr provider 未配置 → 抛错（不建行）', async () => {
    const { client, calls } = makeSupabase({ background_checks: { data: [], error: null } });
    await assert.rejects(() => requestCheck(client, 9, 'checkr'), /not configured/);
    assert.equal(calls.some((c) => c.table === 'background_checks' && c.method === 'insert'), false);
  });

  it('并发丢掉的建行请求（insert 23505，被唯一部分索引拦下）→ 回读现状返回，不向上抛错', async () => {
    const { client, calls } = makeSupabase({
      background_checks: [
        { data: [], error: null },                                                                // ① 初次查询：无在途/有效行
        { data: null, error: { code: '23505' } },                                                  // ② insert：竞态中输了（另一请求先建了行）
        { data: [{ id: 6, talent_id: 9, status: 'requested', expires_at: null }], error: null },   // ③ 回读：赢家建的现状行
      ],
    });
    const r = await requestCheck(client, 9);
    assert.equal(r.created, false);
    assert.equal(r.check.id, 6);
    // insert 确实发起过（竞态真的发生过），但最终没有向上抛错——幂等契约保住了
    assert.ok(calls.some((c) => c.table === 'background_checks' && c.method === 'insert'));
    // 回读发生了第二次 limit 查询（初次查询 + 23505 后的回读，各一次）
    assert.equal(calls.filter((c) => c.table === 'background_checks' && c.method === 'limit').length, 2);
  });
});

// ── batchStatus / listValidTalentIds（列表富化 + 过滤的取数口径）──────────────
describe('bgcheckService.batchStatus / listValidTalentIds', () => {
  it('batchStatus：只收录当前有效的 passed；空 id 列表不发查询', async () => {
    const { client, calls } = makeSupabase({
      background_checks: {
        data: [
          { talent_id: 1, status: 'passed', expires_at: null },
          { talent_id: 2, status: 'passed', expires_at: PAST }, // 已过期 → 不收录
        ],
        error: null,
      },
    });
    const map = await batchStatus(client, [1, 2, 3]);
    assert.equal(map.get(1), true);
    assert.equal(map.has(2), false);
    assert.equal(map.has(3), false);
    // 批量 .in() 下推（禁 N+1）
    const inCall = findCall(calls, 'background_checks', 'in');
    assert.deepEqual(inCall.args, ['talent_id', [1, 2, 3]]);

    const empty = await batchStatus(client, []);
    assert.equal(empty.size, 0);
  });

  it('listValidTalentIds：JS 侧滤过期 + 去重', async () => {
    const { client } = makeSupabase({
      background_checks: {
        data: [
          { talent_id: 7, status: 'passed', expires_at: FUTURE },
          { talent_id: 7, status: 'passed', expires_at: null },   // 同人两条 → 去重
          { talent_id: 8, status: 'passed', expires_at: PAST },    // 过期 → 剔除
        ],
        error: null,
      },
    });
    assert.deepEqual(await listValidTalentIds(client), [7]);
  });
});

// ── 3) /api/bgcheck 路由（HTTP 层）───────────────────────────────────────────
describe('POST /api/bgcheck/request', () => {
  beforeEach(() => { deps.reset(); });

  it('未登录 → 401', async () => {
    const res = await request(makeApp()).post('/api/bgcheck/request').send({});
    assert.equal(res.status, 401);
  });

  it('IDOR 防线：talent_id 从登录态反查，body 里传别人的 talent_id 一律无视', async () => {
    deps.setUser({ userId: 42, email: 'eng@example.com', role: 'engineer' });
    const calls = deps.setDb({
      talents: { data: { id: 9 }, error: null }, // user_id=42 反查得 talent 9
      background_checks: [
        { data: [], error: null },                                        // 无现状
        { data: { id: 5, talent_id: 9, status: 'requested' }, error: null }, // insert 返回
      ],
    });
    const res = await request(makeApp()).post('/api/bgcheck/request').send({ talent_id: 999 });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.data.talent_id, 9);
    // 反查条件必须是登录态 userId
    const eqCall = calls.find((c) => c.table === 'talents' && c.method === 'eq');
    assert.deepEqual(eqCall.args, ['user_id', 42]);
    // insert 落的是反查出的 talent 9，不是 body 里的 999
    const ins = findCall(calls, 'background_checks', 'insert');
    assert.equal(ins.args[0].talent_id, 9);
  });

  it('无 talents 档案行 → 404（照 /apply 模式）', async () => {
    deps.setUser({ userId: 42, email: 'eng@example.com', role: 'engineer' });
    deps.setDb({ talents: { data: null, error: null } });
    const res = await request(makeApp()).post('/api/bgcheck/request').send({});
    assert.equal(res.status, 404);
  });
});

describe('GET /api/bgcheck/me', () => {
  beforeEach(() => { deps.reset(); });

  it('有有效 passed 记录 → data + valid:true；未建档 → data:null 不报错', async () => {
    deps.setUser({ userId: 42, email: 'eng@example.com', role: 'engineer' });
    deps.setDb({
      talents: { data: { id: 9 }, error: null },
      background_checks: { data: [{ id: 5, talent_id: 9, status: 'passed', expires_at: FUTURE }], error: null },
    });
    const res = await request(makeApp()).get('/api/bgcheck/me');
    assert.equal(res.status, 200);
    assert.equal(res.body.valid, true);
    assert.equal(res.body.data.id, 5);

    deps.setDb({ talents: { data: null, error: null } });
    const res2 = await request(makeApp()).get('/api/bgcheck/me');
    assert.equal(res2.status, 200);
    assert.equal(res2.body.data, null);
    assert.equal(res2.body.valid, false);
  });
});

describe('PUT /api/bgcheck/admin/:id（复核生命周期）', () => {
  beforeEach(() => { deps.reset(); });

  it('passed → 条件更新 + completed_at + expires_at=now+VALIDITY_DAYS + 审计行', async () => {
    const calls = deps.setDb({
      background_checks: { data: [{ id: 5 }], error: null }, // 条件更新命中 1 行
      admin_audit_logs: { data: null, error: null },
    });
    const res = await request(makeApp())
      .put('/api/bgcheck/admin/5')
      .send({ decision: 'passed', evidence_url: 'https://example.com/coi.pdf', note: 'looks good' });
    assert.equal(res.status, 200);

    const upd = findCall(calls, 'background_checks', 'update');
    assert.equal(upd.args[0].status, 'passed');
    assert.ok(upd.args[0].completed_at, 'completed_at should be set');
    assert.equal(upd.args[0].evidence_url, 'https://example.com/coi.pdf');
    // expires_at ≈ now + VALIDITY_DAYS 天（容忍 10 秒执行误差）
    const expires = new Date(upd.args[0].expires_at).getTime();
    const expected = Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000;
    assert.ok(Math.abs(expires - expected) < 10 * 1000, 'expires_at should be now + VALIDITY_DAYS');
    // 条件更新：只允许 requested/pending → 终态（幂等/防并发双写）
    const inCall = findCall(calls, 'background_checks', 'in');
    assert.deepEqual(inCall.args, ['status', ['requested', 'pending']]);
    // 审计行（同型照抄 admin.js auditLog：只记键名不记值）
    const audit = findCall(calls, 'admin_audit_logs', 'insert');
    assert.ok(audit, 'should write an admin_audit_logs row');
    assert.equal(audit.args[0].action, 'PUT /api/bgcheck/admin/5');
    assert.deepEqual(audit.args[0].meta.bodyKeys.sort(), ['decision', 'evidence_url', 'note']);
  });

  it('failed → 不写 expires_at', async () => {
    const calls = deps.setDb({
      background_checks: { data: [{ id: 5 }], error: null },
      admin_audit_logs: { data: null, error: null },
    });
    const res = await request(makeApp()).put('/api/bgcheck/admin/5').send({ decision: 'failed' });
    assert.equal(res.status, 200);
    const upd = findCall(calls, 'background_checks', 'update');
    assert.equal(upd.args[0].status, 'failed');
    assert.equal('expires_at' in upd.args[0], false);
  });

  it('非法 decision → 400 且不发更新；已决定过的行（0 行命中）→ 404', async () => {
    const calls = deps.setDb({ admin_audit_logs: { data: null, error: null } });
    const res = await request(makeApp()).put('/api/bgcheck/admin/5').send({ decision: 'approved' });
    assert.equal(res.status, 400);
    assert.equal(calls.some((c) => c.table === 'background_checks' && c.method === 'update'), false);

    deps.setDb({
      background_checks: { data: [], error: null }, // 条件更新 0 行命中
      admin_audit_logs: { data: null, error: null },
    });
    const res2 = await request(makeApp()).put('/api/bgcheck/admin/5').send({ decision: 'passed' });
    assert.equal(res2.status, 404);
  });
});

// ── 4) /api/talent/list 的 bg_checked 过滤 + 徽章富化 ─────────────────────────
describe('GET /api/talent/list（bg_checked 集成）', () => {
  beforeEach(() => { deps.reset(); });

  it('bg_checked=true → 先取有效集合，再 DB 侧 .in(\'id\', ids) 过滤（与分页共存）', async () => {
    const calls = deps.setDb({
      background_checks: [
        // 第 1 次：listValidTalentIds（7 有效、8 过期）
        { data: [{ talent_id: 7, status: 'passed', expires_at: null }, { talent_id: 8, status: 'passed', expires_at: PAST }], error: null },
        // 第 2 次：batchStatus 富化
        { data: [{ talent_id: 7, status: 'passed', expires_at: null }], error: null },
      ],
      talents: { data: [{ id: 7, name: 'Eng A', tal_score: 80 }], error: null },
      platform_certifications: { data: [], error: null },
    });
    const res = await request(makeApp()).get('/api/talent/list?bg_checked=true');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].bg_checked, true);
    // 过滤必须下推到 talents 主查询（.in('id', [7])，过期的 8 不在集合里）
    const inCall = calls.find((c) => c.table === 'talents' && c.method === 'in');
    assert.deepEqual(inCall.args, ['id', [7]]);
    // 主查询仍带 range（分页与过滤共存）
    assert.ok(findCall(calls, 'talents', 'range'), 'pagination range should still apply');
  });

  it('bg_checked=true 且有效集合为空 → 短路返回空页（不查 talents）', async () => {
    const calls = deps.setDb({
      background_checks: { data: [], error: null },
      talents: { data: [{ id: 7, name: 'Eng A' }], error: null },
    });
    const res = await request(makeApp()).get('/api/talent/list?bg_checked=true');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
    assert.equal(res.body.total, 0);
    // 短路发生在 await 主查询之前：不应对 talents 追加 .in 过滤
    assert.equal(calls.some((c) => c.table === 'talents' && c.method === 'in'), false);
  });

  it('不带 bg_checked → 契约不回归，且每行富化 bg_checked 布尔徽章', async () => {
    deps.setDb({
      talents: { data: [{ id: 7, name: 'Eng A' }, { id: 8, name: 'Eng B' }], error: null },
      platform_certifications: { data: [], error: null },
      background_checks: { data: [{ talent_id: 7, status: 'passed', expires_at: FUTURE }], error: null },
    });
    const res = await request(makeApp()).get('/api/talent/list');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    // 既有契约字段仍在
    assert.ok(Array.isArray(res.body.data));
    assert.equal(typeof res.body.page, 'number');
    assert.equal(typeof res.body.pageSize, 'number');
    assert.ok(Array.isArray(res.body.data[0].certs), 'certs enrichment should still work');
    // 新增富化：7 已背调、8 未背调
    assert.equal(res.body.data[0].bg_checked, true);
    assert.equal(res.body.data[1].bg_checked, false);
  });

  it('背调富化批量失败 → 静默省略字段，列表照常返回（绝不 500）', async () => {
    deps.setDb({
      talents: { data: [{ id: 7, name: 'Eng A' }], error: null },
      platform_certifications: { data: [], error: null },
      background_checks: { data: null, error: { message: 'boom' } }, // batchStatus 抛错
    });
    const res = await request(makeApp()).get('/api/talent/list');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal('bg_checked' in res.body.data[0], false);
  });
});
