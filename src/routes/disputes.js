const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLATFORM_FEE = 0.15;

function requireAdmin(req, res, next) {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || req.headers['x-admin-password'] !== pwd) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Open a dispute ────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id, reason } = req.body;
    if (!milestone_id || !reason) return res.status(400).json({ error: 'Missing milestone_id or reason' });

    // Check milestone is funded (can't dispute locked or released)
    const { data: ms } = await supabase.from('project_milestones').select('status').eq('id', milestone_id).single();
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    if (!['funded', 'completed'].includes(ms.status)) return res.status(400).json({ error: `Cannot dispute a milestone with status: ${ms.status}` });

    // Only one open dispute per milestone
    const { data: existing } = await supabase.from('disputes').select('id').eq('milestone_id', milestone_id).eq('status', 'open').single();
    if (existing) return res.status(400).json({ error: 'A dispute is already open for this milestone.' });

    // Freeze milestone
    await supabase.from('project_milestones').update({ status: 'disputed' }).eq('id', milestone_id);

    const { data, error } = await supabase.from('disputes').insert({
      milestone_id, demand_id, reason, opened_by_email: req.user.email, status: 'open',
    }).select().single();
    if (error) throw error;

    res.json({ status: 'ok', data });
  } catch (err) {
    console.error('[Disputes] Open error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get dispute by milestone ──────────────────────────────────────────────────
router.get('/milestone/:milestoneId', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ status: 'ok', data: data || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get dispute by id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('disputes')
      .select('*, project_milestones(phase_name, amount), demands(title)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Submit evidence ───────────────────────────────────────────────────────────
router.put('/:id/evidence', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { evidence, party } = req.body; // party: 'employer' | 'engineer'
    if (!['employer', 'engineer'].includes(party)) return res.status(400).json({ error: 'party must be employer or engineer' });

    const field = party === 'employer' ? 'employer_evidence' : 'engineer_evidence';
    const { data, error } = await supabase
      .from('disputes')
      .update({ [field]: evidence, status: 'under_review' })
      .eq('id', req.params.id)
      .select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: list open disputes ─────────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const statusFilter = req.query.status || 'open';
    const { data, error } = await supabase
      .from('disputes')
      .select('*, project_milestones(phase_name, amount), demands(title)')
      .eq('status', statusFilter)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: resolve dispute ────────────────────────────────────────────────────
router.put('/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { resolution, admin_decision, resolution_amount } = req.body;
    // resolution: 'resolved_engineer' | 'resolved_employer' | 'resolved_split'

    const { data: dispute } = await supabase
      .from('disputes')
      .select('*, project_milestones(id, amount, phase_name, demand_id)')
      .eq('id', req.params.id)
      .single();
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    const ms          = dispute.project_milestones;
    const totalAmount = parseFloat(ms.amount) || 0;

    let engineerPayout = 0;
    if (resolution === 'resolved_engineer') engineerPayout = totalAmount * (1 - PLATFORM_FEE);
    else if (resolution === 'resolved_split') engineerPayout = parseFloat(resolution_amount) || totalAmount * 0.5 * (1 - PLATFORM_FEE);

    // Transfer to engineer if payout > 0
    let stripeTransferId = null;
    if (engineerPayout > 0 && process.env.STRIPE_SECRET_KEY) {
      const { data: demand } = await supabase.from('demands').select('assigned_engineer_id').eq('id', ms.demand_id).single();
      if (demand?.assigned_engineer_id) {
        const { data: talent } = await supabase.from('talents').select('stripe_account_id').eq('id', demand.assigned_engineer_id).single();
        if (talent?.stripe_account_id) {
          const transfer = await stripe.transfers.create({
            amount: Math.round(engineerPayout * 100),
            currency: 'usd',
            destination: talent.stripe_account_id,
            description: `TalEngineer dispute resolution: ${ms.phase_name}`,
            metadata: { dispute_id: String(req.params.id) },
          });
          stripeTransferId = transfer.id;
        }
      }
    }

    // Update dispute + milestone
    await supabase.from('disputes').update({ status: resolution, admin_decision, resolution_amount: engineerPayout, resolved_at: new Date().toISOString() }).eq('id', req.params.id);
    await supabase.from('project_milestones').update({ status: 'released', ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }) }).eq('id', ms.id);

    console.log(`[Dispute] #${req.params.id} resolved as ${resolution}. Engineer payout: $${engineerPayout}`);
    res.json({ status: 'ok', resolution, engineer_payout: engineerPayout, stripe_transfer_id: stripeTransferId });
  } catch (err) {
    console.error('[Disputes] Resolve error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
