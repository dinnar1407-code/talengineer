const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { emailMilestoneFunded, emailMilestoneReleased, emailPaymentFailed } = require('../services/email');
const { createNotification } = require('../services/notificationService');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLATFORM_FEE = 0.15; // 15% platform take rate

// ── Fund Milestone ────────────────────────────────────────────────────────────
router.post('/fund-milestone', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id, amount, phase_name } = req.body;

    if (!milestone_id || !demand_id) {
      return res.status(400).json({ error: 'Missing milestone_id or demand_id' });
    }

    // ── Idempotency check: already funded? ──────────────────────────────────
    const { data: existing, error: fetchErr } = await supabase
      .from('project_milestones')
      .select('id, status, amount')
      .eq('id', milestone_id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (existing.status === 'funded' || existing.status === 'released') {
      return res.json({
        status: 'ok',
        idempotent: true,
        message: `Milestone already ${existing.status}. No action taken.`,
      });
    }

    // ── Update milestone status ─────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from('project_milestones')
      .update({ status: 'funded' })
      .eq('id', milestone_id)
      .eq('status', 'locked'); // only update if still locked (race condition guard)

    if (updateErr) throw updateErr;

    // Update demand to in_progress
    await supabase
      .from('demands')
      .update({ status: 'in_progress' })
      .eq('id', demand_id);

    res.json({
      status: 'ok',
      message: `$${amount || existing.amount} locked for milestone [${phase_name}].`,
    });

  } catch (err) {
    console.error('[Payment] Fund milestone error:', err);
    res.status(500).json({ error: 'Failed to fund milestone. Please try again.' });
  }
});

// ── Release Milestone ─────────────────────────────────────────────────────────
router.post('/release-milestone', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id } = req.body;

    if (!milestone_id || !demand_id) {
      return res.status(400).json({ error: 'Missing milestone_id or demand_id' });
    }

    // ── Idempotency check: already released? ────────────────────────────────
    const { data: milestone, error: msErr } = await supabase
      .from('project_milestones')
      .select('id, status, amount, phase_name, stripe_transfer_id')
      .eq('id', milestone_id)
      .single();

    if (msErr || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (milestone.status === 'released') {
      return res.json({
        status: 'ok',
        idempotent: true,
        message: 'Milestone already released. No duplicate transfer made.',
        stripe_transfer_id: milestone.stripe_transfer_id,
      });
    }

    if (milestone.status !== 'funded') {
      return res.status(400).json({ error: `Cannot release milestone with status: ${milestone.status}. Must be 'funded' first.` });
    }

    // ── Calculate payout ────────────────────────────────────────────────────
    const totalAmount = parseFloat(milestone.amount) || 0;
    const platformFee = totalAmount * PLATFORM_FEE;
    const engineerPayout = totalAmount - platformFee;

    // ── Verify requester is the employer for this demand ────────────────────
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id, assigned_engineer_id')
      .eq('id', demand_id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    let stripeTransferId = null;

    if (demand?.assigned_engineer_id && process.env.STRIPE_SECRET_KEY) {
      const { data: talent } = await supabase
        .from('talents')
        .select('stripe_account_id')
        .eq('id', demand.assigned_engineer_id)
        .single();

      if (talent?.stripe_account_id) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(engineerPayout * 100), // cents
          currency: 'usd',
          destination: talent.stripe_account_id,
          description: `TalEngineer payout: ${milestone.phase_name}`,
          metadata: { milestone_id, demand_id },
        });
        stripeTransferId = transfer.id;
        console.log(`[Payment] Stripe transfer ${stripeTransferId}: $${engineerPayout} → ${talent.stripe_account_id}`);
      }
    } else {
      console.log(`[Payment] Skipping Stripe transfer — no engineer assigned or Stripe key missing. Payout: $${engineerPayout}`);
    }

    // ── Mark as released (store transfer ID for idempotency) ────────────────
    await supabase
      .from('project_milestones')
      .update({
        status: 'released',
        ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }),
      })
      .eq('id', milestone_id);

    console.log(`[Payment] Milestone ${milestone_id} released. Total: $${totalAmount}, Fee: $${platformFee}, Payout: $${engineerPayout}`);

    // Notify engineer (email + in-app)
    if (demand?.assigned_engineer_id) {
      const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', demand.assigned_engineer_id).single();
      if (talent?.contact) {
        emailMilestoneReleased({ engineerEmail: talent.contact, engineerName: talent.name, phaseName: milestone.phase_name, payout: engineerPayout }).catch(console.error);
        createNotification({
          user_email: talent.contact,
          type: 'milestone_released',
          title: `Funds released: ${milestone.phase_name}`,
          body: `$${engineerPayout.toFixed(2)} has been sent to your Stripe account.`,
          link: `/workorder/${milestone_id}`,
          demand_id: parseInt(demand_id),
        });
      }
    }

    res.json({
      status: 'ok',
      payout_details: {
        total: totalAmount,
        platform_fee: platformFee,
        engineer_payout: engineerPayout,
      },
      stripe_transfer_id: stripeTransferId,
      message: `Funds released. Platform fee: $${platformFee.toFixed(2)}.`,
    });

  } catch (err) {
    console.error('[Payment] Release milestone error:', err);
    res.status(500).json({ error: 'Failed to release milestone. Please try again.' });
  }
});

// ── Stripe Webhook ────────────────────────────────────────────────────────────
// Must be mounted BEFORE express.json() — uses raw body
router.post('/webhook', async (req, res) => {
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[Webhook] STRIPE_WEBHOOK_SECRET not set — skipping verification.');
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, secret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = getClient();

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object;
    const milestoneId = session.metadata?.milestone_id;
    const demandId    = session.metadata?.demand_id;

    if (milestoneId) {
      await supabase
        .from('project_milestones')
        .update({ status: 'funded' })
        .eq('id', milestoneId)
        .eq('status', 'locked');

      if (demandId) {
        await supabase
          .from('demands')
          .update({ status: 'in_progress' })
          .eq('id', demandId);
      }

      console.log(`[Webhook] Milestone ${milestoneId} funded via Stripe webhook.`);

      // Notify assigned engineer
      if (milestoneId && demandId) {
        const { data: demand } = await supabase.from('demands').select('title, assigned_engineer_id').eq('id', demandId).single();
        if (demand?.assigned_engineer_id) {
          const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', demand.assigned_engineer_id).single();
          const { data: ms } = await supabase.from('project_milestones').select('phase_name, amount').eq('id', milestoneId).single();
          if (talent?.contact && ms) {
            emailMilestoneFunded({ engineerEmail: talent.contact, engineerName: talent.name, projectTitle: demand.title, phaseName: ms.phase_name, amount: ms.amount }).catch(console.error);
            createNotification({
              user_email: talent.contact,
              type: 'milestone_funded',
              title: `Milestone funded: ${ms.phase_name}`,
              body: `$${ms.amount} is now held in escrow for "${demand.title}". You can check in to begin work.`,
              link: `/workorder/${milestoneId}`,
              demand_id: parseInt(demandId),
            });
          }
        }
      }
    }
  }

  // ── Payment failed ──────────────────────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const intent      = event.data.object;
    const milestoneId = intent.metadata?.milestone_id;
    const demandId    = intent.metadata?.demand_id;

    if (milestoneId) {
      await supabase
        .from('project_milestones')
        .update({ status: 'payment_failed' })
        .eq('id', milestoneId)
        .eq('status', 'locked');

      console.warn(`[Webhook] Payment failed for milestone ${milestoneId}. Reason: ${intent.last_payment_error?.message}`);
    }

    if (demandId) {
      await supabase
        .from('demands')
        .update({ status: 'payment_failed' })
        .eq('id', demandId)
        .eq('status', 'open');
    }

    // Notify employer
    if (milestoneId) {
      const { data: ms } = await supabase.from('project_milestones').select('phase_name, demand_id').eq('id', milestoneId).single();
      if (ms) {
        const { data: demand } = await supabase.from('demands').select('title, contact').eq('id', ms.demand_id).single();
        if (demand?.contact) {
          emailPaymentFailed({ employerEmail: demand.contact, projectTitle: demand.title, phaseName: ms.phase_name }).catch(console.error);
        }
      }
    }
  }

  // ── Dispute (chargeback) created ────────────────────────────────────────────
  if (event.type === 'charge.dispute.created') {
    const dispute     = event.data.object;
    const milestoneId = dispute.metadata?.milestone_id;

    // Freeze any funded milestone tied to this charge
    if (milestoneId) {
      await supabase
        .from('project_milestones')
        .update({ status: 'disputed' })
        .eq('id', milestoneId)
        .in('status', ['funded', 'locked']);
    }

    console.error(`[Webhook] Dispute created — charge ${dispute.charge}, amount $${(dispute.amount / 100).toFixed(2)}, reason: ${dispute.reason}`);
  }

  // ── Transfer failed (engineer payout failed) ────────────────────────────────
  if (event.type === 'transfer.failed') {
    const transfer    = event.data.object;
    const milestoneId = transfer.metadata?.milestone_id;

    if (milestoneId) {
      // Roll back to funded so it can be retried
      await supabase
        .from('project_milestones')
        .update({ status: 'funded', stripe_transfer_id: null })
        .eq('id', milestoneId)
        .eq('status', 'released');
    }

    console.error(`[Webhook] Transfer failed — ${transfer.id}, milestone ${milestoneId || 'unknown'}`);
  }

  res.json({ received: true });
});

// ── Confirm funding (legacy client-side fallback) ─────────────────────────────
router.post('/confirm-funding', async (req, res) => {
  try {
    const supabase = getClient();
    const { session_id, milestone_id, demand_id } = req.body;
    if (!session_id || !milestone_id) return res.status(400).json({ error: 'Missing params' });

    await supabase.from('project_milestones').update({ status: 'funded' }).eq('id', milestone_id).eq('status', 'locked');
    if (demand_id) await supabase.from('demands').update({ status: 'in_progress' }).eq('id', demand_id);

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
