const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Submit a certification ────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { cert_name, cert_type, cert_number, issuing_org, issue_date, expiry_date, file_url } = req.body;
    if (!cert_name) return res.status(400).json({ error: 'Missing cert_name' });

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data, error } = await supabase.from('engineer_certifications').insert({
      talent_id: talent.id, cert_name, cert_type, cert_number, issuing_org, issue_date, expiry_date, file_url, status: 'pending',
    }).select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get certifications for a talent ──────────────────────────────────────────
router.get('/:talentId', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('engineer_certifications')
      .select('*')
      .eq('talent_id', req.params.talentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete own certification ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    await supabase.from('engineer_certifications').delete().eq('id', req.params.id).eq('talent_id', talent.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: verify or reject ───────────────────────────────────────────────────
router.put('/:id/review', async (req, res) => {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd || req.headers['x-admin-password'] !== adminPwd) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const supabase = getClient();
    const { status, admin_notes } = req.body;
    if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const { data, error } = await supabase
      .from('engineer_certifications')
      .update({ status, admin_notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: list pending certs ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd || req.headers['x-admin-password'] !== adminPwd) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const supabase = getClient();
    const statusFilter = req.query.status || 'pending';
    const { data, error } = await supabase
      .from('engineer_certifications')
      .select('*, talents(id, name, contact)')
      .eq('status', statusFilter)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
