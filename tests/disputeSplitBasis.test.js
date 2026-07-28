// ── 分账裁决后的「计费基数」一致性测试 ────────────────────────────────────────
//
// 被修的 bug：resolved_split 裁决把里程碑状态改成 released，却从不改 amount——
// amount 一直留着原始托管总额。而平台侧两条独立的「钱」路径都按
// 「status='released' 的里程碑 amount × 费率」算：
//   1) GET /api/admin/stats 的 revenue（平台营收报表）；
//   2) referralService.evaluateVesting 的 reward_usd（推荐奖励，一次性快照、永不重算）。
// 于是 $10,000 的里程碑判 split 只给工程师 $4,000 时，平台实收 $600 被报成 $1,500（虚高 150%），
// 推荐奖励也会按 $10,000 而不是 $4,000 永久记进 vest_evidence。
//
// 修法：在唯一的落盘点（src/routes/disputes.js 的 finalize update）把 amount 改写成 engineerGross，
// 让 amount 的语义统一为「这条里程碑最终真正计费的金额」，下游零特例。
// 因此本文件的三段断言是一条链，缺一不可：
//   A. disputes.js 分账时确实写了 amount=engineerGross（且只在 split 时写）；
//   B. 把改写后的 amount 喂给 admin 营收 → 得到真实的 $600，而不是 $1,500；
//   C. 把改写后的 amount 喂给推荐兑现 → reward_usd 同样是 $600 口径。
//
// 框架：node:test + supertest（非 Jest），依赖注入手法同 disputeRoutes/financeLedger 两套测试。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { installPayDeps } = require('./helpers/mockPayDeps');
const deps = installPayDeps();
const disputesRouter = require('../src/routes/disputes'); // 注入之后再加载
const adminRouter    = require('../src/routes/admin');
const { makeSupabase } = require('./helpers/supabaseChainMock');
const { evaluateVesting } = require('../src/services/referralService');
const { computeResolutionSplit } = require('../src/utils/disputeMath');

const app = express();
app.use(express.json());
app.use('/api/disputes', disputesRouter);
app.use('/api/admin', adminRouter);

// 任务书里的具体事故场景：$10,000 托管、全局 15% 费率、分账判给工程师毛额 $4,000。
const ESCROWED      = 10000; // 原始托管总额（修复前会被当成计费基数）
const ENGINEER_GROSS = 4000; // 真正判给工程师的毛额 = 真正的计费基数
const FEE            = 0.15;
const REAL_CUT       = 600;  // 4000 * 0.15
const INFLATED_CUT   = 1500; // 10000 * 0.15 —— 修复前的错数，任何断言都不许等于它

const ENV_SNAPSHOT = process.env.STRIPE_SECRET_KEY;
beforeEach(() => { deps.reset(); delete process.env.STRIPE_SECRET_KEY; });
process.on('exit', () => {
  if (ENV_SNAPSHOT === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = ENV_SNAPSHOT;
});

function disputeRow({ amount = ESCROWED, demandId = 5 } = {}) {
  return {
    id: 1, status: 'open', demand_id: demandId,
    project_milestones: { id: 9, amount, phase_name: 'P1', demand_id: demandId, stripe_payment_intent: 'pi_x' },
  };
}

// 取 finalize 那次 update 的 payload：终结状态更新（status 是 released/refunded），
// 与前面的 releasing 抢占、失败回滚区分开。
function finalizeUpdate(calls) {
  return calls.filter((c) => c.table === 'project_milestones' && c.method === 'update')
    .map((c) => c.args[0])
    .find((p) => p && (p.status === 'released' || p.status === 'refunded'));
}

// ── A. 落盘点：分账才改写 amount ───────────────────────────────────────────────
describe('PUT /api/disputes/:id/resolve —— 分账后 amount = 工程师毛额', () => {

  it('resolved_split：finalize 时把 amount 改写成 engineerGross（不是原始托管额）', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow(), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_s' });
    deps.stripe.refunds.create.impl   = async () => ({ id: 're_s' });

    const res = await request(app).put('/api/disputes/1/resolve')
      .send({ resolution: 'resolved_split', resolution_amount: ENGINEER_GROSS });
    assert.equal(res.status, 200);

    const payload = finalizeUpdate(calls);
    assert.equal(payload.status, 'released');
    assert.equal(payload.amount, ENGINEER_GROSS, 'amount 必须落成判给工程师的毛额');
    assert.notEqual(payload.amount, ESCROWED, '留着原始托管额就会让下游营收/奖励虚高');

    // 资金侧不受影响（回归保护）：工程师净到手 4000*0.85，雇主退 10000-4000
    assert.equal(res.body.engineer_payout, ENGINEER_GROSS * (1 - FEE));
    assert.equal(res.body.employer_refund, ESCROWED - ENGINEER_GROSS);
  });

  it('resolved_engineer：毛额本就等于托管额 → 不写 amount（不做无谓改动）', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow(), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_e' });

    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_engineer' });
    assert.equal(res.status, 200);

    const payload = finalizeUpdate(calls);
    assert.equal(payload.status, 'released');
    assert.equal('amount' in payload, false, '全判工程师时 amount 无需改动');
  });

  it('resolved_employer：终态 refunded，本就被两条营收口径排除 → 不写 amount', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow(), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
    });
    deps.stripe.refunds.create.impl = async () => ({ id: 're_full' });

    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_employer' });
    assert.equal(res.status, 200);

    const payload = finalizeUpdate(calls);
    assert.equal(payload.status, 'refunded');
    assert.equal('amount' in payload, false);
  });

  it('分账未显式给金额（默认对半分）→ amount 落成一半，与 disputeMath 同一口径', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: [{ data: disputeRow(), error: null }, { data: {}, error: null }],
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: {}, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => ({ id: 'tr_s' });
    deps.stripe.refunds.create.impl   = async () => ({ id: 're_s' });

    const res = await request(app).put('/api/disputes/1/resolve').send({ resolution: 'resolved_split' });
    assert.equal(res.status, 200);

    const expected = computeResolutionSplit({
      resolution: 'resolved_split', totalAmount: ESCROWED, resolutionAmount: undefined, platformFee: FEE,
    }).engineerGross;
    assert.equal(expected, ESCROWED / 2);
    assert.equal(finalizeUpdate(calls).amount, expected);
  });

  it('转账失败回滚为 disputed 时绝不改 amount（裁决未落地，计费基数不能先动）', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    const calls = deps.setDb({
      disputes: { data: disputeRow(), error: null },
      project_milestones: [{ data: [{ id: 9 }], error: null }, { data: null, error: null }],
      demands: { data: { assigned_engineer_id: 7 }, error: null },
      talents: { data: { stripe_account_id: 'acct_e' }, error: null },
    });
    deps.stripe.transfers.create.impl = async () => { throw new Error('transfer boom'); };

    const res = await request(app).put('/api/disputes/1/resolve')
      .send({ resolution: 'resolved_split', resolution_amount: ENGINEER_GROSS });
    assert.equal(res.status, 500);

    const rollback = calls.filter((c) => c.table === 'project_milestones' && c.method === 'update')
      .map((c) => c.args[0])
      .find((p) => p && p.status === 'disputed');
    assert.ok(rollback, '应回滚为 disputed');
    assert.equal('amount' in rollback, false);
    assert.equal(finalizeUpdate(calls), undefined, '未走到终态就不该有 released/refunded 更新');
  });
});

// ── B. 下游一：admin 营收 ─────────────────────────────────────────────────────
describe('GET /api/admin/stats —— 分账里程碑的营收按修正后的基数算', () => {
  function setStatsDb(released) {
    return deps.setDb({
      users:        { data: [], error: null, count: 0 },
      demands:      { data: [], error: null, count: 0 },
      talents:      { data: [], error: null, count: 0 },
      project_milestones: [{ data: [], error: null, count: 0 }, { data: released, error: null }],
      notifications: { data: null, error: null, count: 0 },
    });
  }

  it('分账后的 released 里程碑（amount=4000）→ 营收 $600，而不是虚高的 $1,500', async () => {
    setStatsDb([{ amount: ENGINEER_GROSS, demands: { fee_pct: null } }]);
    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.revenue, REAL_CUT);
    assert.notEqual(res.body.revenue, INFLATED_CUT, '按原始托管额计营收就是 150% 虚报');
  });

  it('正常放款与分账放款混在一起时总营收仍逐条按各自基数算', async () => {
    setStatsDb([
      { amount: 2000,            demands: { fee_pct: null } }, // 正常放款
      { amount: ENGINEER_GROSS,  demands: { fee_pct: null } }, // 分账后已改写
    ]);
    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.body.revenue, 2000 * FEE + ENGINEER_GROSS * FEE);
  });
});

// ── C. 下游二：推荐奖励一次性快照 ──────────────────────────────────────────────
describe('evaluateVesting —— 推荐奖励用同一个修正后的基数快照', () => {
  it('达标里程碑是分账后的（amount=4000）→ reward_usd = $600，不是 $1,500', async () => {
    const { client } = makeSupabase({
      talents: { data: [], error: null },
      demands: { data: [{ id: 100, employer_id: 5, fee_pct: null }], error: null },
      project_milestones: { data: [{ id: 900, demand_id: 100, amount: ENGINEER_GROSS }], error: null },
      referrals: { data: null, error: null },
    });
    const result = await evaluateVesting(client, [{ id: 10, referred_user_id: 5, status: 'attributed' }]);

    const reward = result.get(10).vest_evidence.reward_usd;
    assert.equal(reward, REAL_CUT);
    assert.notEqual(reward, INFLATED_CUT,
      '快照是一次性不可逆写入，基数错了这条推荐奖励永远不会自我纠正');
  });

  it('与 admin 营收同口径：同一条里程碑两处算出的平台抽成必须一模一样', async () => {
    const { client } = makeSupabase({
      talents: { data: [], error: null },
      demands: { data: [{ id: 100, employer_id: 5, fee_pct: 0.05 }], error: null }, // founding 让利单
      project_milestones: { data: [{ id: 900, demand_id: 100, amount: ENGINEER_GROSS }], error: null },
      referrals: { data: null, error: null },
    });
    const result = await evaluateVesting(client, [{ id: 10, referred_user_id: 5, status: 'attributed' }]);

    deps.setDb({
      users:        { data: [], error: null, count: 0 },
      demands:      { data: [], error: null, count: 0 },
      talents:      { data: [], error: null, count: 0 },
      project_milestones: [
        { data: [], error: null, count: 0 },
        { data: [{ amount: ENGINEER_GROSS, demands: { fee_pct: 0.05 } }], error: null },
      ],
      notifications: { data: null, error: null, count: 0 },
    });
    const res = await request(app).get('/api/admin/stats');

    assert.equal(result.get(10).vest_evidence.reward_usd, res.body.revenue);
    assert.equal(res.body.revenue, ENGINEER_GROSS * 0.05);
  });
});
