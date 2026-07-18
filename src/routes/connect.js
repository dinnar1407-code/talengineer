const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
// 统一 Stripe 工厂（固定 apiVersion，见 src/config/stripe.js）
const stripe = require('../config/stripe').getStripe();

// ── Start Stripe Connect Express onboarding ───────────────────────────────────
router.post('/onboard', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: talent } = await supabase
      .from('talents')
      .select('id, stripe_account_id')
      .eq('user_id', req.user.userId)
      .single();

    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Please complete registration first.' });

    let accountId = talent.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: { transfers: { requested: true } },
        metadata: { talent_id: String(talent.id), user_id: String(req.user.userId) },
      });
      accountId = account.id;
      await supabase.from('talents').update({ stripe_account_id: accountId }).eq('id', talent.id);
    }

    const domain = process.env.DOMAIN || 'http://localhost:4000';
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${domain}/finance?connect=refresh`,
      return_url:  `${domain}/finance?connect=success`,
      type: 'account_onboarding',
    });

    res.json({ url: link.url });
  } catch (err) {
    console.error('[Connect] Onboard error:', err);
    res.status(500).json({ error: 'Failed to start Stripe Connect onboarding.' });
  }
});

// ── Get Connect account status ────────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: talent } = await supabase
      .from('talents')
      .select('id, stripe_account_id, payout_enabled')
      .eq('user_id', req.user.userId)
      .single();

    if (!talent?.stripe_account_id) return res.json({ status: 'not_connected' });

    const account = await stripe.accounts.retrieve(talent.stripe_account_id);
    const enabled = account.charges_enabled && account.payouts_enabled;

    if (!!enabled !== !!talent.payout_enabled) {
      await supabase.from('talents').update({ payout_enabled: enabled }).eq('id', talent.id);
    }

    res.json({
      status: enabled ? 'active' : 'pending',
      stripe_account_id: talent.stripe_account_id,
    });
  } catch (err) {
    console.error('[Connect] Status error:', err);
    res.status(500).json({ error: 'Failed to check Connect status.' });
  }
});

// ── Balance（工程师查看自己 Connect 账户余额）─────────────────────────────────
// 只操作本人 talent 的账户；金额从分转美元返回。instant_available 为 Stripe
// 判定的"可即时提现"额度（不具资格时为 0 或缺省）。
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: talent } = await supabase
      .from('talents')
      .select('stripe_account_id')
      .eq('user_id', req.user.userId)
      .single();
    if (!talent?.stripe_account_id) return res.status(400).json({ error: 'No Stripe account connected.' });

    const balance = await stripe.balance.retrieve({ stripeAccount: talent.stripe_account_id });
    const sumUsd = (arr) => (arr || []).filter(b => b.currency === 'usd').reduce((s, b) => s + b.amount, 0) / 100;
    res.json({
      status: 'ok',
      available: sumUsd(balance.available),
      pending: sumUsd(balance.pending),
      instant_available: sumUsd(balance.instant_available),
    });
  } catch (err) {
    console.error('[Connect] Balance error:', err);
    res.status(500).json({ error: 'Failed to fetch balance.' });
  }
});

// ── Instant Payout（即时提现，Stripe 收 1% 手续费）───────────────────────────
// 资格由 Stripe 判定（借记卡绑定等）；不合格时返回明确降级文案（标准周期自动到账），
// 绝不影响正常的标准 payout 计划。
router.post('/instant-payout', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: talent } = await supabase
      .from('talents')
      .select('stripe_account_id')
      .eq('user_id', req.user.userId)
      .single();
    if (!talent?.stripe_account_id) return res.status(400).json({ error: 'No Stripe account connected.' });

    const amt = parseFloat(req.body?.amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount.' });

    try {
      const payout = await stripe.payouts.create({
        amount: Math.round(amt * 100),
        currency: 'usd',
        method: 'instant',
      }, { stripeAccount: talent.stripe_account_id });
      res.json({ status: 'ok', payout_id: payout.id, amount: amt });
    } catch (stripeErr) {
      // 资格/额度不足等 Stripe 拒绝：友好降级提示，不当成服务器错误
      console.warn('[Connect] Instant payout declined:', stripeErr.message);
      return res.status(400).json({ error: 'Instant payout unavailable for your account — funds will arrive on the standard schedule (1–2 business days).' });
    }
  } catch (err) {
    console.error('[Connect] Instant payout error:', err);
    res.status(500).json({ error: 'Failed to create payout.' });
  }
});

module.exports = router;
