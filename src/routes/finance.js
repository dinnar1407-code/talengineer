const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Ledger: get financial records for current user ────────────────────────────
router.get('/ledger', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const supabase = getClient();

    const { data, error } = await supabase
      .from('financial_ledgers')
      .select('*')
      .or(`employer_email.eq.${email},engineer_email.eq.${email}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[Finance] Ledger error:', err);
    res.status(500).json({ error: 'Failed to load ledger.' });
  }
});

// ── Milestones: get milestones for a demand ───────────────────────────────────
router.get('/milestones', requireAuth, async (req, res) => {
  try {
    const { demand_id } = req.query;
    const supabase = getClient();

    if (!demand_id) {
      return res.status(400).json({ error: 'demand_id is required' });
    }

    const { data, error } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('demand_id', demand_id)
      .order('percentage', { ascending: true });

    if (error) throw error;

    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    console.error('[Finance] Milestones error:', err);
    res.status(500).json({ error: 'Failed to load milestones.' });
  }
});

module.exports = router;
