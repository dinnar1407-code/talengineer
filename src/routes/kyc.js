const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Get current user's KYC status ─────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('users')
      .select('kyc_status, company_name, company_website, company_phone, kyc_submitted_at, kyc_note')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;
    res.json({ status: 'ok', data: data || { kyc_status: 'unverified' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Submit company info for KYC review ───────────────────────────────────────
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { company_name, company_website, company_phone } = req.body;

    if (!company_name?.trim()) return res.status(400).json({ error: 'Company name is required.' });

    // Check current status — don't allow re-submission if already verified
    const { data: user } = await supabase.from('users').select('kyc_status').eq('id', req.user.userId).single();
    if (user?.kyc_status === 'verified') return res.status(400).json({ error: 'Already verified.' });

    const { error } = await supabase
      .from('users')
      .update({
        company_name:     company_name.trim(),
        company_website:  company_website?.trim() || null,
        company_phone:    company_phone?.trim()   || null,
        kyc_status:       'pending',
        kyc_submitted_at: new Date().toISOString(),
        kyc_note:         null,
      })
      .eq('id', req.user.userId);

    if (error) throw error;
    res.json({ status: 'ok', message: 'Verification submitted. Our team will review within 24 hours.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
