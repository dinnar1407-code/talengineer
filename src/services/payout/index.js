// ── 放款 provider 抽象（跨境收款第一步）────────────────────────────────────────
// 统一放款出口，按 talents.payout_provider 分发：
//   stripe   → 现行 Stripe Connect transfers.create（美系工程师）
//   manual   → 登记 manual_payouts 待线下打款（拉美/东南亚等 Stripe Express 覆盖不到的工程师；
//              admin 线下支付后在后台标记 paid 并留凭证）
//   payoneer → 商务开通前不可用，直接抛错（见 docs/payoneer-setup.md）
// 语义与现行 transfer 一致：抛错 = 未放款成功，调用方负责状态机回滚；
// 返回 { transferId|null, manualPayoutId|null }，双 null = 无账户跳过（与现行行为一致）。
async function sendPayout({ supabase, stripe, talent, milestone, amount, description, metadata, idempotencyKey }) {
  const provider = talent?.payout_provider || 'stripe';

  if (provider === 'manual') {
    const { data, error } = await supabase.from('manual_payouts').insert({
      milestone_id: milestone.id, talent_id: talent.id, amount, note: description, status: 'pending',
    }).select('id').single();
    if (error) throw error;
    return { transferId: null, manualPayoutId: data.id };
  }

  if (provider === 'payoneer') {
    throw new Error('Payoneer payout not configured — see docs/payoneer-setup.md');
  }

  // stripe（默认）：无 Connect 账户时跳过（与现行"无账户不转账"语义一致）
  if (!talent?.stripe_account_id) return { transferId: null, manualPayoutId: null };
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    destination: talent.stripe_account_id,
    description,
    metadata,
  }, { idempotencyKey });
  return { transferId: transfer.id, manualPayoutId: null };
}

module.exports = { sendPayout };
