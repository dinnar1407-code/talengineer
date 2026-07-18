// ── 放款 provider 抽象（sendPayout）单元测试 ──────────────────────────────────
// 钱路径分发逻辑：stripe 转账 / manual 登记线下打款 / payoneer 未配置抛错 / 无账户跳过。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { sendPayout } = require('../src/services/payout');

// 最小假 supabase：只支持 from('manual_payouts').insert(...).select('id').single()
function fakeSupabase() {
  const calls = { inserts: [] };
  return {
    calls,
    from(table) {
      return {
        insert(row) {
          calls.inserts.push({ table, row });
          return { select: () => ({ single: async () => ({ data: { id: 77 }, error: null }) }) };
        },
      };
    },
  };
}

function fakeStripe() {
  const calls = { transfers: [] };
  return {
    calls,
    transfers: {
      create: async (params, opts) => { calls.transfers.push({ params, opts }); return { id: 'tr_test_1' }; },
    },
  };
}

const BASE = {
  milestone: { id: 5 },
  amount: 850,
  description: 'payout test',
  metadata: { milestone_id: '5' },
  idempotencyKey: 'k-1',
};

describe('sendPayout', () => {
  it('manual provider → 登记 manual_payouts（pending），不碰 Stripe', async () => {
    const supabase = fakeSupabase(); const stripe = fakeStripe();
    const r = await sendPayout({ ...BASE, supabase, stripe, talent: { id: 9, payout_provider: 'manual' } });
    assert.equal(r.manualPayoutId, 77);
    assert.equal(r.transferId, null);
    assert.equal(stripe.calls.transfers.length, 0);
    const ins = supabase.calls.inserts[0];
    assert.equal(ins.table, 'manual_payouts');
    assert.equal(ins.row.milestone_id, 5);
    assert.equal(ins.row.amount, 850);
    assert.equal(ins.row.status, 'pending');
  });

  it('payoneer provider → 未配置抛错（调用方回滚状态机）', async () => {
    const supabase = fakeSupabase(); const stripe = fakeStripe();
    await assert.rejects(
      () => sendPayout({ ...BASE, supabase, stripe, talent: { id: 9, payout_provider: 'payoneer' } }),
      /Payoneer/
    );
  });

  it('stripe provider 无 Connect 账户 → 双 null 跳过（与现行语义一致）', async () => {
    const supabase = fakeSupabase(); const stripe = fakeStripe();
    const r = await sendPayout({ ...BASE, supabase, stripe, talent: { id: 9, payout_provider: 'stripe', stripe_account_id: null } });
    assert.equal(r.transferId, null);
    assert.equal(r.manualPayoutId, null);
    assert.equal(stripe.calls.transfers.length, 0);
  });

  it('stripe provider 有账户 → transfers.create 收到正确分值与幂等键', async () => {
    const supabase = fakeSupabase(); const stripe = fakeStripe();
    const r = await sendPayout({ ...BASE, supabase, stripe, talent: { id: 9, stripe_account_id: 'acct_x' } });
    assert.equal(r.transferId, 'tr_test_1');
    const call = stripe.calls.transfers[0];
    assert.equal(call.params.amount, 85000); // 850 → cents
    assert.equal(call.params.destination, 'acct_x');
    assert.equal(call.opts.idempotencyKey, 'k-1');
  });

  it('provider 未设置默认 stripe', async () => {
    const supabase = fakeSupabase(); const stripe = fakeStripe();
    const r = await sendPayout({ ...BASE, supabase, stripe, talent: { id: 9, stripe_account_id: 'acct_y' } });
    assert.equal(r.transferId, 'tr_test_1');
  });
});
