const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

module.exports = router;
