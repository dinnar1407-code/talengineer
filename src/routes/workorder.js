const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { emailMilestoneReleased } = require('../services/email');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PLATFORM_FEE = 0.15;

// ── Get work order status for a milestone ─────────────────────────────────────
router.get('/:milestoneId', async (req, res) => {
  try {
    const supabase = getClient();
    const { data: ms } = await supabase
      .from('project_milestones')
      .select('*, demands(id, title, description, assigned_engineer_id)')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    const { data: checkin } = await supabase
      .from('work_order_checkins')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .single();

    res.json({ status: 'ok', milestone: ms, checkin: checkin || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Engineer: check in ────────────────────────────────────────────────────────
router.post('/:milestoneId/checkin', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { lat, lng } = req.body;

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data: ms } = await supabase.from('project_milestones').select('id, demand_id, status').eq('id', req.params.milestoneId).single();
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    if (ms.status !== 'funded') return res.status(400).json({ error: 'Milestone must be funded before check-in.' });

    const { data, error } = await supabase.from('work_order_checkins').upsert({
      milestone_id: parseInt(req.params.milestoneId),
      demand_id: ms.demand_id,
      engineer_id: talent.id,
      checkin_lat: lat || null,
      checkin_lng: lng || null,
      status: 'checked_in',
    }, { onConflict: 'milestone_id,engineer_id' }).select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Engineer: submit completion ───────────────────────────────────────────────
router.post('/:milestoneId/complete', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { notes, photos } = req.body;

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data, error } = await supabase
      .from('work_order_checkins')
      .update({ completion_notes: notes || '', photos: photos || [], status: 'completed', checkout_time: new Date().toISOString() })
      .eq('milestone_id', req.params.milestoneId)
      .eq('engineer_id', talent.id)
      .select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Employer: approve completion → release funds ──────────────────────────────
router.post('/:milestoneId/approve', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    const { data: ms } = await supabase
      .from('project_milestones')
      .select('id, amount, phase_name, demand_id, stripe_transfer_id, status')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    if (ms.status === 'released') return res.json({ status: 'ok', idempotent: true });

    const { data: checkin } = await supabase.from('work_order_checkins').select('*').eq('milestone_id', req.params.milestoneId).eq('status', 'completed').single();
    if (!checkin) return res.status(400).json({ error: 'Engineer has not submitted work for review yet.' });

    const totalAmount   = parseFloat(ms.amount) || 0;
    const engineerPayout = totalAmount * (1 - PLATFORM_FEE);

    const { data: demand } = await supabase.from('demands').select('assigned_engineer_id').eq('id', ms.demand_id).single();
    let stripeTransferId = null;

    if (demand?.assigned_engineer_id && process.env.STRIPE_SECRET_KEY) {
      const { data: talent } = await supabase.from('talents').select('stripe_account_id, name, contact').eq('id', demand.assigned_engineer_id).single();
      if (talent?.stripe_account_id) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(engineerPayout * 100),
          currency: 'usd',
          destination: talent.stripe_account_id,
          description: `TalEngineer payout: ${ms.phase_name}`,
          metadata: { milestone_id: String(ms.id), demand_id: String(ms.demand_id) },
        });
        stripeTransferId = transfer.id;
        emailMilestoneReleased({ engineerEmail: talent.contact, engineerName: talent.name, phaseName: ms.phase_name, payout: engineerPayout }).catch(console.error);
      }
    }

    await supabase.from('project_milestones').update({ status: 'released', ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }) }).eq('id', ms.id);
    await supabase.from('work_order_checkins').update({ status: 'approved' }).eq('milestone_id', ms.id);

    res.json({ status: 'ok', payout: engineerPayout, stripe_transfer_id: stripeTransferId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
