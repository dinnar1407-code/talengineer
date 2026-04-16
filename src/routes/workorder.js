const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { emailMilestoneReleased, emailRequestReview } = require('../services/email');
const { createNotification } = require('../services/notificationService');

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
      // In-app: notify engineer of payout
      if (talent?.contact) {
        createNotification({
          user_email: talent.contact,
          type: 'milestone_released',
          title: `Funds released: ${ms.phase_name}`,
          body: `$${engineerPayout.toFixed(2)} has been sent to your Stripe account.`,
          link: `/workorder/${ms.id}`,
          demand_id: ms.demand_id,
        });
      }
    }

    await supabase.from('project_milestones').update({ status: 'released', ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }) }).eq('id', ms.id);
    await supabase.from('work_order_checkins').update({ status: 'approved' }).eq('milestone_id', ms.id);

    // Send review request email to employer
    const DOMAIN = process.env.DOMAIN || 'https://talengineer.us';
    const { data: demandFull } = await supabase.from('demands').select('title, users(email), assigned_engineer_id').eq('id', ms.demand_id).single();
    if (demandFull?.users?.email && demand?.assigned_engineer_id) {
      const { data: engineerForReview } = await supabase.from('talents').select('id, name').eq('id', demand.assigned_engineer_id).single();
      if (engineerForReview) {
        emailRequestReview({
          employerEmail: demandFull.users.email,
          engineerName:  engineerForReview.name,
          projectTitle:  demandFull.title,
          reviewUrl:     `${DOMAIN}/engineer/${engineerForReview.id}?review=1&demand_id=${ms.demand_id}`,
        }).catch(console.error);
      }
    }

    res.json({ status: 'ok', payout: engineerPayout, stripe_transfer_id: stripeTransferId, demand_id: ms.demand_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Generate work order PDF (HTML print page) ─────────────────────────────────
router.get('/:milestoneId/pdf', async (req, res) => {
  try {
    const supabase = getClient();

    const { data: ms } = await supabase
      .from('project_milestones')
      .select('*, demands(id, title, description, region, contact, assigned_engineer_id)')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    const { data: checkin } = await supabase
      .from('work_order_checkins')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .single();

    let engineerName = 'N/A', engineerContact = '';
    if (ms.demands?.assigned_engineer_id) {
      const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', ms.demands.assigned_engineer_id).single();
      if (talent) { engineerName = talent.name; engineerContact = talent.contact; }
    }

    const PLATFORM_FEE_RATE = 0.15;
    const totalAmount    = parseFloat(ms.amount) || 0;
    const platformFee    = totalAmount * PLATFORM_FEE_RATE;
    const engineerPayout = totalAmount - platformFee;

    const fmt = (d) => d ? new Date(d).toLocaleString() : 'N/A';
    const statusLabel = { locked: 'Pending', funded: 'Funded — In Escrow', released: 'Released', completed: 'Completed' };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Work Order #${ms.id} — TalEngineer</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0056b3; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-size: 20px; font-weight: 800; color: #0056b3; }
  .doc-title { font-size: 13px; color: #6b7280; text-align: right; }
  .doc-id { font-size: 18px; font-weight: 700; color: #111; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 2px; }
  .field span { font-size: 13px; font-weight: 600; }
  .amounts { background: #f8f9fa; border-radius: 8px; padding: 16px; }
  .amount-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb; }
  .amount-row:last-child { border: none; font-weight: 700; font-size: 15px; padding-top: 8px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(0,86,179,.1); color: #0056b3; }
  .notes-box { background: #f8f9fa; border-radius: 6px; padding: 12px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .sig-block { min-height: 60px; border-bottom: 1px solid #111; padding-bottom: 4px; margin-bottom: 6px; }
  .sig-label { font-size: 11px; color: #6b7280; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print { body { print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">⚙️ TalEngineer</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px;">talengineer.us</div>
  </div>
  <div class="doc-title">
    <div>WORK ORDER</div>
    <div class="doc-id">#WO-${String(ms.id).padStart(5, '0')}</div>
    <div style="margin-top:4px;">Generated: ${fmt(new Date())}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Project Details</div>
  <div class="grid">
    <div class="field"><label>Project Title</label><span>${ms.demands?.title || 'N/A'}</span></div>
    <div class="field"><label>Region</label><span>${ms.demands?.region || 'N/A'}</span></div>
    <div class="field"><label>Milestone</label><span>${ms.phase_name}</span></div>
    <div class="field"><label>Status</label><span class="status-badge">${statusLabel[ms.status] || ms.status}</span></div>
    <div class="field"><label>Project ID</label><span>#${ms.demands?.id || 'N/A'}</span></div>
    <div class="field"><label>Milestone ID</label><span>#${ms.id}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Parties</div>
  <div class="grid">
    <div class="field"><label>Client Contact</label><span>${ms.demands?.contact || 'N/A'}</span></div>
    <div class="field"><label>Assigned Engineer</label><span>${engineerName}</span></div>
    <div class="field"><label></label><span></span></div>
    <div class="field"><label>Engineer Contact</label><span>${engineerContact}</span></div>
  </div>
</div>

${checkin ? `
<div class="section">
  <div class="section-title">Field Work Record</div>
  <div class="grid">
    <div class="field"><label>Check-In Time</label><span>${fmt(checkin.checkin_time || checkin.created_at)}</span></div>
    <div class="field"><label>Completion Time</label><span>${fmt(checkin.checkout_time)}</span></div>
    ${checkin.checkin_lat ? `<div class="field"><label>GPS Location</label><span>${checkin.checkin_lat}, ${checkin.checkin_lng}</span></div>` : ''}
    <div class="field"><label>Work Status</label><span>${checkin.status?.replace('_', ' ').toUpperCase() || 'N/A'}</span></div>
  </div>
  ${checkin.completion_notes ? `
  <div style="margin-top:12px;">
    <div class="section-title">Completion Notes</div>
    <div class="notes-box">${checkin.completion_notes}</div>
  </div>` : ''}
</div>` : ''}

<div class="section">
  <div class="section-title">Payment Summary</div>
  <div class="amounts">
    <div class="amount-row"><span>Milestone Amount</span><span>$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    <div class="amount-row"><span>Platform Fee (15%)</span><span>−$${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    <div class="amount-row"><span>Engineer Payout</span><span>$${engineerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
  </div>
</div>

<div class="signatures">
  <div>
    <div class="sig-block"></div>
    <div class="sig-label">Client Signature &amp; Date</div>
    <div style="margin-top:6px;font-size:12px;color:#6b7280;">${ms.demands?.contact || ''}</div>
  </div>
  <div>
    <div class="sig-block"></div>
    <div class="sig-label">Engineer Signature &amp; Date</div>
    <div style="margin-top:6px;font-size:12px;color:#6b7280;">${engineerName}</div>
  </div>
</div>

<div class="footer">
  This document is automatically generated by TalEngineer. Funds are managed via Stripe escrow.
  For disputes, visit talengineer.us/dispute or email support@talengineer.us
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
