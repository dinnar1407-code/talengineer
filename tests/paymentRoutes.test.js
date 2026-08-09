// ── 支付状态机 HTTP 级集成测试（src/routes/payment.js）─────────────────────────
// 全站最关键的"钱路径"：fund-milestone / release-milestone / webhook / confirm-funding。
// 用 supertest 打真实 HTTP，用 require.cache 预注入的假 db/stripe/auth（见 helpers/mockPayDeps.js）。
// 框架：node:test + node:assert/strict（非 Jest）。
//
// 重要顺序：先 installPayDeps() 注入假模块，再 require 被测 router（它在加载时就捕获 stripe 单例）。

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { installPayDeps } = require('./helpers/mockPayDeps');
const deps = installPayDeps();
const paymentRouter = require('../src/routes/payment'); // 注入之后再加载，捕获假 stripe

// 复刻 src/app.js 的挂载方式：webhook 路径先用 express.raw 取原始字节（Stripe 验签需要），
// 其余路径用 express.json。
function makeApp() {
  const app = express();
  app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  app.use('/api/payment', paymentRouter);
  return app;
}
const app = makeApp();

// 环境变量快照：用例内按需设置 STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET，afterEach 还原。
const ENV_KEYS = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'DOMAIN'];
const ENV_SNAPSHOT = {};
ENV_KEYS.forEach((k) => { ENV_SNAPSHOT[k] = process.env[k]; });

const EMPLOYER = { userId: 42, email: 'emp@x.com', role: 'employer' };

beforeEach(() => {
  deps.reset();
  ENV_KEYS.forEach((k) => { delete process.env[k]; });
  deps.setUser(EMPLOYER); // 默认已登录雇主；未登录用例显式 setUser(null)
});
afterEach(() => {
  ENV_KEYS.forEach((k) => {
    if (ENV_SNAPSHOT[k] === undefined) delete process.env[k];
    else process.env[k] = ENV_SNAPSHOT[k];
  });
});

// 便捷：从 dbCalls 里找某表某方法的调用（读 update/insert 的 payload 或断言过滤条件）
function findCall(calls, table, method, predicate) {
  return calls.find((c) => c.table === table && c.method === method && (!predicate || predicate(c)));
}

// ── fund-milestone ────────────────────────────────────────────────────────────
describe('POST /api/payment/fund-milestone', () => {
  it('未带 auth → 401', async () => {
    deps.setUser(null);
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 401);
  });

  it('里程碑不存在 → 404', async () => {
    deps.setDb({ project_milestones: { data: null, error: { code: 'PGRST116' } } });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 404);
  });

  it('demand_id 与里程碑真实归属不符 → 400', async () => {
    deps.setDb({ project_milestones: { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null } });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 999 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /demand_id does not match/);
  });

  it('非雇主本人 → 403', async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null },
      demands: { data: { employer_id: 99 }, error: null }, // 归属别人
    });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 403);
  });

  it('已 funded → 幂等返回（不创建新 session）', async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'funded', amount: 1000, demand_id: 5 }, error: null },
      demands: { data: { employer_id: 42 }, error: null },
    });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.idempotent, true);
    assert.equal(deps.stripe.checkout.sessions.create.calls.length, 0, '幂等路径不应创建支付会话');
  });

  it("状态非 locked|payment_failed（如 releasing）→ 409", async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'releasing', amount: 1000, demand_id: 5 }, error: null },
      demands: { data: { employer_id: 42 }, error: null },
    });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 409);
  });

  it('locked 且金额取库值 → 创建 session 成功（unit_amount=库值*100，响应带 url）', async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'locked', amount: '500.50', phase_name: 'P1', demand_id: 5 }, error: null },
      demands: { data: { employer_id: 42 }, error: null },
    });
    deps.stripe.checkout.sessions.create.impl = async () => ({ id: 'cs_live', url: 'https://stripe.test/checkout/cs_live' });
    const res = await request(app).post('/api/payment/fund-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.url, 'https://stripe.test/checkout/cs_live');
    assert.equal(res.body.session_id, 'cs_live');
    const arg = deps.stripe.checkout.sessions.create.calls[0][0];
    assert.equal(arg.line_items[0].price_data.unit_amount, 50050, '金额必须以库值 *100 取整，不信任客户端');
  });
});

// ── webhook ───────────────────────────────────────────────────────────────────
describe('POST /api/payment/webhook', () => {
  function postWebhook() {
    return request(app)
      .post('/api/payment/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'test-sig')
      .send('{}');
  }

  it('无 STRIPE_WEBHOOK_SECRET → 503（fail-closed 让 Stripe 重试）', async () => {
    // 不设 STRIPE_WEBHOOK_SECRET
    const res = await postWebhook();
    assert.equal(res.status, 503);
    assert.equal(deps.stripe.webhooks.constructEvent.calls.length, 0);
  });

  it('签名校验抛错 → 400', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => { throw new Error('bad signature'); };
    const res = await postWebhook();
    assert.equal(res.status, 400);
  });

  it('checkout.session.completed → 里程碑 locked→funded 且 stripe_payment_intent 落盘', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'checkout.session.completed',
      data: { object: { metadata: { milestone_id: '1' }, payment_intent: 'pi_abc' } },
    });
    const calls = deps.setDb({
      project_milestones: { data: [{ id: 1, demand_id: 5 }], error: null }, // update...select 返回一行
      demands: [
        { data: {}, error: null },                                       // demands 状态更新
        { data: { title: 'Proj', assigned_engineer_id: null }, error: null }, // 无工程师 → 不发通知
      ],
    });
    const res = await postWebhook();
    assert.equal(res.status, 200);
    const upd = findCall(calls, 'project_milestones', 'update');
    assert.equal(upd.args[0].status, 'funded');
    assert.equal(upd.args[0].stripe_payment_intent, 'pi_abc', 'payment_intent 必须落盘供纠纷退款用');
    // 确认状态机守卫：仅 locked/payment_failed 可转 funded
    const inFilter = findCall(calls, 'project_milestones', 'in');
    assert.deepEqual(inFilter.args, ['status', ['locked', 'payment_failed']]);
  });

  // P1 尾账（W1）：demands→in_progress 更新失败时，入账结果与 Stripe 回执不受影响
  // （里程碑已 funded，重试修不了 demand），但绝不能静默——settlementService 会 CRITICAL 告警
  it('checkout.session.completed 但 demands 更新失败 → 仍 200 且里程碑已 funded', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'checkout.session.completed',
      data: { object: { metadata: { milestone_id: '1' }, payment_intent: 'pi_abc' } },
    });
    const calls = deps.setDb({
      project_milestones: { data: [{ id: 1, demand_id: 5 }], error: null },
      demands: [
        { data: null, error: { message: 'db down' } },                        // demands 更新失败
        { data: { title: 'Proj', assigned_engineer_id: null }, error: null }, // 通知查询照常
      ],
    });
    const res = await postWebhook();
    assert.equal(res.status, 200, '入账已成功，必须回 200 阻止 Stripe 无意义重试');
    const upd = findCall(calls, 'project_milestones', 'update');
    assert.equal(upd.args[0].status, 'funded');
  });

  it('checkout.session.completed 但 0 行更新（重复事件）→ 不发通知', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'checkout.session.completed',
      data: { object: { metadata: { milestone_id: '1' }, payment_intent: 'pi_abc' } },
    });
    deps.setDb({ project_milestones: { data: [], error: null } }); // 0 行
    const res = await postWebhook();
    assert.equal(res.status, 200);
    assert.equal(deps.email.emailMilestoneFunded.calls.length, 0, '重复事件不应重复发信');
    assert.equal(deps.notify.calls.length, 0, '重复事件不应重复站内通知');
  });

  it('payment_intent.payment_failed → locked→payment_failed，demand_id 以 DB 行为准（不信 metadata）', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'payment_intent.payment_failed',
      // metadata.demand_id 故意投毒为 999：W1 治理后该值必须被无视，demands 更新只认 DB 返回的 5
      data: { object: { metadata: { milestone_id: '1', demand_id: '999' }, last_payment_error: { message: 'declined' } } },
    });
    const calls = deps.setDb({
      project_milestones: [
        { data: [{ id: 1, demand_id: 5 }], error: null },              // update...select 返回真实归属
        { data: { phase_name: 'P1', demand_id: 5 }, error: null },     // 通知查询
      ],
      demands: [
        { data: {}, error: null },                                     // demands update
        { data: { title: 'Proj', contact: null }, error: null },       // 无 contact → 不发信
      ],
    });
    const res = await postWebhook();
    assert.equal(res.status, 200);
    const upd = findCall(calls, 'project_milestones', 'update');
    assert.equal(upd.args[0].status, 'payment_failed');
    const guard = findCall(calls, 'project_milestones', 'eq', (c) => c.args[0] === 'status' && c.args[1] === 'locked');
    assert.ok(guard, '必须带 .eq(status, locked) 守卫，只有 locked 才转 payment_failed');
    // 零信任断言：demands 更新的 id 过滤必须是 DB 返回的 5，绝不能是 metadata 里的 999
    const demandEq = findCall(calls, 'demands', 'eq', (c) => c.args[0] === 'id');
    assert.equal(demandEq.args[1], 5, 'demands 更新必须用 DB 返回的 demand_id，不能信任 metadata');
  });

  // ── fail-closed 回归（P1 治理：此前三个分支静默吞 DB 错误并回 200，Stripe 不再重试）──
  it('payment_failed 分支落库失败 → 500（让 Stripe 重试）', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'payment_intent.payment_failed',
      data: { object: { metadata: { milestone_id: '1' }, last_payment_error: { message: 'declined' } } },
    });
    deps.setDb({ project_milestones: { data: null, error: { message: 'db down' } } });
    const res = await postWebhook();
    assert.equal(res.status, 500);
  });

  it('charge.dispute.created 冻结失败 → 500（拒付期间绝不能保持可放款）', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'charge.dispute.created',
      data: { object: { metadata: { milestone_id: '1' }, charge: 'ch_1', amount: 100000, reason: 'fraudulent' } },
    });
    deps.setDb({ project_milestones: { data: null, error: { message: 'db down' } } });
    const res = await postWebhook();
    assert.equal(res.status, 500);
  });

  it('transfer.failed 回滚失败 → 500（不能让里程碑卡在 released 而钱未到账）', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'transfer.failed',
      data: { object: { id: 'tr_1', metadata: { milestone_id: '1' } } },
    });
    deps.setDb({ project_milestones: { data: null, error: { message: 'db down' } } });
    const res = await postWebhook();
    assert.equal(res.status, 500);
  });

  it('transfer.failed → released 回滚 funded 且清空 transfer_id', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    deps.stripe.webhooks.constructEvent.impl = () => ({
      type: 'transfer.failed',
      data: { object: { id: 'tr_1', metadata: { milestone_id: '1' } } },
    });
    const calls = deps.setDb({ project_milestones: { data: {}, error: null } });
    const res = await postWebhook();
    assert.equal(res.status, 200);
    const upd = findCall(calls, 'project_milestones', 'update');
    assert.equal(upd.args[0].status, 'funded');
    assert.equal(upd.args[0].stripe_transfer_id, null, 'transfer 失败必须清空 transfer_id 以便重试');
    const guard = findCall(calls, 'project_milestones', 'eq', (c) => c.args[0] === 'status' && c.args[1] === 'released');
    assert.ok(guard, '仅 released 状态可回滚');
  });
});

// ── confirm-funding ─────────────────────────────────────────────────────────────
describe('POST /api/payment/confirm-funding', () => {
  it('Stripe session 无效（retrieve 抛错）→ 400', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => { throw new Error('no such session'); };
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /Invalid Stripe session/);
  });

  it('payment_status 非 paid → 400', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'unpaid', metadata: { milestone_id: '1' } });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /Payment not completed/);
  });

  it('metadata.milestone_id 不匹配 → 400', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '999' } });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /does not match/);
  });

  it('amount_total 与托管额不符 → 400', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '1' }, amount_total: 999 });
    deps.setDb({ project_milestones: { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null } });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /Paid amount does not match/);
  });

  it('非雇主 → 403', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '1' }, amount_total: 100000 });
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null },
      demands: { data: { employer_id: 99 }, error: null },
    });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 403);
  });

  it('0 行更新但当前已 funded → 幂等 ok（webhook 抢先入账）', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '1' }, amount_total: 100000 });
    deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null }, // 首次 select
        { data: [], error: null },                                                      // update...select 0 行
        { data: { status: 'funded' }, error: null },                                    // 再查当前状态
      ],
      demands: { data: { employer_id: 42 }, error: null },
    });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 200);
    assert.equal(res.body.idempotent, true);
  });

  it('成功路径 → 落盘 stripe_payment_intent 并返回 ok', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '1' }, amount_total: 100000, payment_intent: 'pi_confirm' });
    const calls = deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null }, // select
        { data: [{ id: 1 }], error: null },                                             // update...select 一行
      ],
      demands: [
        { data: { employer_id: 42 }, error: null }, // 归属校验
        { data: {}, error: null },                  // demands 状态更新
      ],
    });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    const upd = findCall(calls, 'project_milestones', 'update');
    assert.equal(upd.args[0].status, 'funded');
    assert.equal(upd.args[0].stripe_payment_intent, 'pi_confirm');
  });

  // P1 治理（settlementService 收敛）后确立的行为：confirm-funding 赢得竞态时，
  // 与 webhook 路径一样给被指派工程师发"里程碑已托管"通知（此前该路径静默丢通知）。
  it('赢家路径 → 给被指派工程师发通知（与 webhook 路径行为一致）', async () => {
    deps.stripe.checkout.sessions.retrieve.impl = async () => ({ payment_status: 'paid', metadata: { milestone_id: '1' }, amount_total: 100000, payment_intent: 'pi_win' });
    deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'locked', amount: 1000, demand_id: 5 }, error: null }, // 首次 select
        { data: [{ id: 1, demand_id: 5 }], error: null },                               // update...select 一行（赢家）
        { data: { phase_name: 'P1', amount: 1000 }, error: null },                      // 通知用 phase/amount 查询
      ],
      demands: [
        { data: { employer_id: 42 }, error: null },                        // 归属校验
        { data: {}, error: null },                                         // demands → in_progress
        { data: { employer_id: 42 }, error: null },                        // 企业 webhook 的 employer 查询
        { data: { title: 'Proj', assigned_engineer_id: 7 }, error: null }, // 工程师查询
      ],
      talents: { data: { name: 'Eng', contact: 'eng@x.com' }, error: null },
    });
    const res = await request(app).post('/api/payment/confirm-funding').send({ session_id: 'cs_x', milestone_id: 1 });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(deps.email.emailMilestoneFunded.calls.length, 1);
    assert.equal(deps.email.emailMilestoneFunded.calls[0][0].engineerEmail, 'eng@x.com');
    assert.equal(deps.notify.calls.length, 1);
    assert.equal(deps.notify.calls[0][0].type, 'milestone_funded');
  });
});

// ── release-milestone ────────────────────────────────────────────────────────────
describe('POST /api/payment/release-milestone', () => {
  it('非雇主 → 403', async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'funded', amount: 1000, phase_name: 'P1' }, error: null },
      demands: { data: { employer_id: 99, assigned_engineer_id: 7 }, error: null },
    });
    const res = await request(app).post('/api/payment/release-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 403);
  });

  it('已 released → 幂等（不重复转账）', async () => {
    deps.setDb({
      project_milestones: { data: { id: 1, status: 'released', amount: 1000, phase_name: 'P1', stripe_transfer_id: 'tr_old' }, error: null },
    });
    const res = await request(app).post('/api/payment/release-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.idempotent, true);
    assert.equal(deps.stripe.transfers.create.calls.length, 0);
  });

  it('funded→releasing 抢占失败（0 行）→ 409', async () => {
    deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'funded', amount: 1000, phase_name: 'P1' }, error: null }, // select
        { data: [], error: null },                                                          // claim 0 行
      ],
      demands: { data: { employer_id: 42, assigned_engineer_id: 7 }, error: null },
    });
    const res = await request(app).post('/api/payment/release-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 409);
  });

  it('transfers.create 抛错 → 回滚 funded 并 500', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'funded', amount: 1000, phase_name: 'P1' }, error: null }, // select
        { data: [{ id: 1 }], error: null },                                                 // claim 成功
        { data: null, error: null },                                                        // 回滚 update
      ],
      demands: { data: { employer_id: 42, assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => { throw new Error('transfer boom'); };
    const res = await request(app).post('/api/payment/release-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 500);
    const rollback = calls.filter((c) => c.table === 'project_milestones' && c.method === 'update')
      .find((c) => c.args[0].status === 'funded');
    assert.ok(rollback, '转账失败必须把 releasing 回滚为 funded');
  });

  it('成功 → released + transfer id 落盘 + payout = amount*0.85', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      project_milestones: [
        { data: { id: 1, status: 'funded', amount: 1000, phase_name: 'P1' }, error: null }, // select
        { data: [{ id: 1 }], error: null },                                                 // claim
        { data: [{ id: 1 }], error: null },                                                 // finalize
      ],
      demands: { data: { employer_id: 42, assigned_engineer_id: 7 }, error: null },
      talents: [
        { data: { stripe_account_id: 'acct_e' }, error: null }, // 转账前查 stripe_account_id
        { data: { name: 'Eng', contact: 'eng@x.com' }, error: null }, // 通知查询
      ],
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_new' });
    const res = await request(app).post('/api/payment/release-milestone').send({ milestone_id: 1, demand_id: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.stripe_transfer_id, 'tr_new');
    assert.equal(res.body.payout_details.engineer_payout, 850, 'payout = 1000*(1-0.15)');
    assert.equal(res.body.payout_details.platform_fee, 150);
    assert.equal(deps.stripe.transfers.create.calls[0][0].amount, 85000, '转账金额 = payout*100');
    const finalize = calls.filter((c) => c.table === 'project_milestones' && c.method === 'update')
      .find((c) => c.args[0].status === 'released');
    assert.equal(finalize.args[0].stripe_transfer_id, 'tr_new');
  });
});
