// ── 纠纷裁决 / 退款路径 HTTP 级集成测试（src/routes/disputes.js）─────────────────
// 覆盖 PUT /:id/resolve 的资金分配（工程师转账 / 雇主退款 / 分账）与开纠纷门禁 POST /。
// requireAdmin 直通、requireAuth 可配（见 helpers/mockPayDeps.js）；ownership/disputeMath/fees 用真模块。
// 框架：node:test + node:assert/strict（非 Jest）。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { installPayDeps } = require('./helpers/mockPayDeps');
const deps = installPayDeps();
const disputesRouter = require('../src/routes/disputes'); // 注入之后再加载

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/disputes', disputesRouter);
  return app;
}
const app = makeApp();

const ENV_KEYS = ['STRIPE_SECRET_KEY'];
const ENV_SNAPSHOT = {};
ENV_KEYS.forEach((k) => { ENV_SNAPSHOT[k] = process.env[k]; });

beforeEach(() => {
  deps.reset();
  ENV_KEYS.forEach((k) => { delete process.env[k]; });
});
afterEach(() => {
  ENV_KEYS.forEach((k) => {
    if (ENV_SNAPSHOT[k] === undefined) delete process.env[k];
    else process.env[k] = ENV_SNAPSHOT[k];
  });
});

// 一条 dispute 行（含内嵌 project_milestones，供 resolve 读取托管额与 payment_intent）
function disputeRow({ amount = 1000, demandId = 5, pi = 'pi_x' } = {}) {
  return {
    id: 1, status: 'open', demand_id: demandId,
    project_milestones: { id: 9, amount, phase_name: 'P1', demand_id: demandId, stripe_payment_intent: pi },
  };
}

function findUpdate(calls, table, statusValue) {
  return calls.filter((c) => c.table === table && c.method === 'update')
    .find((c) => c.args[0] && c.args[0].status === statusValue);
}

// ── resolve：裁决资金分配 ─────────────────────────────────────────────────────
describe('PUT /api/disputes/:id/resolve', () => {
  it('resolution 非白名单 → 400（不消费原子守卫）', async () => {
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_bogus' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /resolution must be one of/);
  });

  it('resolution_amount 超托管总额 → 400', async () => {
    deps.setDb({ disputes: { data: disputeRow({ amount: 1000 }), error: null } });
    const res = await request(app).put('/api/disputes/1/resolve')
      .send({ resolution: 'resolved_split', resolution_amount: 2000 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /no more than the escrowed total/);
  });

  it('disputed→releasing 抢占失败（0 行）→ 409', async () => {
    deps.setDb({
      disputes: { data: disputeRow(), error: null },
      project_milestones: { data: [], error: null }, // claim 0 行
    });
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_engineer' });
    assert.equal(res.status, 409);
  });

  it('resolved_engineer → 转账 0.85、无退款、终态 released', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow({ amount: 1000 }), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_e' });
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_engineer' });
    assert.equal(res.status, 200);
    assert.equal(res.body.engineer_payout, 850, '工程师净到手 = 1000*(1-0.15)');
    assert.equal(res.body.employer_refund, 0);
    assert.equal(deps.stripe.transfers.create.calls[0][0].amount, 85000);
    assert.equal(deps.stripe.refunds.create.calls.length, 0, '全判工程师不应退款');
    assert.ok(findUpdate(calls, 'project_milestones', 'released'), '终态应为 released');
  });

  it('resolved_employer → refunds.create 收到全额 cents、终态 refunded、平台不抽费', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow({ amount: 1000, pi: 'pi_x' }), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
    });
    deps.stripe.refunds.create.impl = async () => ({ id: 're_full' });
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_employer' });
    assert.equal(res.status, 200);
    assert.equal(res.body.employer_refund, 1000);
    assert.equal(res.body.engineer_payout, 0);
    const refundArg = deps.stripe.refunds.create.calls[0][0];
    assert.equal(refundArg.amount, 100000, '全额退款 1000*100，平台不抽费');
    assert.equal(refundArg.payment_intent, 'pi_x', '按里程碑落盘的 payment_intent 原路退款');
    assert.equal(deps.stripe.transfers.create.calls.length, 0, '判雇主不应给工程师转账');
    assert.ok(findUpdate(calls, 'project_milestones', 'refunded'), '终态应为 refunded');
  });

  it('resolved_split(毛额300/托管1000) → 工程师转账 255、雇主退款 700', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    deps.setDb({
      disputes: [{ data: disputeRow({ amount: 1000, pi: 'pi_x' }), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_s' });
    deps.stripe.refunds.create.impl = async () => ({ id: 're_s' });
    const res = await request(app).put('/api/disputes/1/resolve')
      .send({ resolution: 'resolved_split', resolution_amount: 300 });
    assert.equal(res.status, 200);
    assert.equal(res.body.engineer_payout, 255, '毛额 300*(1-0.15)=255');
    assert.equal(res.body.employer_refund, 700, '托管 1000 - 毛额 300 = 700');
    assert.equal(deps.stripe.transfers.create.calls[0][0].amount, 25500);
    assert.equal(deps.stripe.refunds.create.calls[0][0].amount, 70000);
  });

  it('退款抛错且工程师未转账 → 回滚 disputed 并 500', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: { data: disputeRow({ amount: 1000, pi: 'pi_x' }), error: null },
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: null, error: null }], // claim, 回滚
    });
    deps.stripe.refunds.create.impl = async () => { throw new Error('refund boom'); };
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_employer' });
    assert.equal(res.status, 500);
    assert.ok(findUpdate(calls, 'project_milestones', 'disputed'), '退款失败且未转账应整体回滚为 disputed');
  });

  it('老数据无 stripe_payment_intent → 走 paymentIntents.search 兜底', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    deps.setDb({
      disputes: [{ data: disputeRow({ amount: 1000, pi: null }), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
    });
    deps.stripe.paymentIntents.search.impl = async () => ({ data: [{ id: 'pi_found' }] });
    deps.stripe.refunds.create.impl = async () => ({ id: 're_found' });
    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_employer' });
    assert.equal(res.status, 200);
    assert.match(deps.stripe.paymentIntents.search.calls[0][0].query, /milestone_id.*9/);
    assert.equal(deps.stripe.refunds.create.calls[0][0].payment_intent, 'pi_found');
  });
});

// ── open：开纠纷门禁 ──────────────────────────────────────────────────────────
describe('POST /api/disputes/ (open dispute)', () => {
  it('非当事人 → 403（ownership 真模块判定）', async () => {
    deps.setUser({ userId: 8, email: 'stranger@x.com', role: 'employer' });
    deps.setDb({
      project_milestones: { data: { status: 'funded', demand_id: 5 }, error: null },
      demands: { data: { id: 5, employer_id: 99 }, error: null }, // 归属别人
      talents: { data: null, error: null },                       // 调用者无 talent 档案
    });
    const res = await request(app).post('/api/disputes').send({ milestone_id: 1, reason: 'bad work' });
    assert.equal(res.status, 403);
  });

  it('里程碑状态非 funded|completed → 400', async () => {
    deps.setUser({ userId: 42, email: 'emp@x.com', role: 'employer' });
    deps.setDb({
      project_milestones: { data: { status: 'locked', demand_id: 5 }, error: null },
      demands: { data: { id: 5, employer_id: 42 }, error: null }, // 当事雇主，先过门禁再撞状态校验
    });
    const res = await request(app).post('/api/disputes').send({ milestone_id: 1, reason: 'x' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /Cannot dispute a milestone with status/);
  });
});
