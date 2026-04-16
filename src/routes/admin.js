const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');

// Simple admin password guard (set ADMIN_PASSWORD in Railway env vars)
function requireAdmin(req, res, next) {
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (!adminPwd) return res.status(503).json({ error: 'Admin not configured.' });
  const provided = req.headers['x-admin-password'] || req.query.pwd;
  if (provided !== adminPwd) return res.status(401).json({ error: 'Unauthorized.' });
  next();
}

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const [users, demands, talents, ledgers, notifCount] = await Promise.all([
      supabase.from('users').select('id, email, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('demands').select('id, title, status, budget, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('talents').select('id, name, region, verified_score, created_at', { count: 'exact' }).order('verified_score', { ascending: false }).limit(10),
      supabase.from('ledgers').select('id, demand_id, total_amount, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*', { count: 'exact', head: true }),
    ]);

    const totalRevenue = (ledgers.data || [])
      .filter(l => l.status === 'released')
      .reduce((s, l) => s + (l.total_amount || 0) * 0.15, 0);

    res.json({
      status: 'ok',
      counts: {
        users:         users.count   || 0,
        demands:       demands.count || 0,
        talents:       talents.count || 0,
        ledgers:       ledgers.count || 0,
        notifications: notifCount.count || 0,
      },
      revenue: totalRevenue,
      recent: {
        users:   users.data   || [],
        demands: demands.data || [],
        talents: talents.data || [],
        ledgers: ledgers.data || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/notifications
router.get('/notifications', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    // Count by type
    const byType = (data || []).reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    const unreadCount = (data || []).filter(n => !n.read).length;

    res.json({ status: 'ok', data: data || [], byType, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── KYC: list pending verifications ──────────────────────────────────────────
router.get('/kyc', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const status = req.query.status || 'pending';
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, company_name, company_website, company_phone, kyc_status, kyc_submitted_at, kyc_note')
      .eq('kyc_status', status)
      .order('kyc_submitted_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── KYC: approve or reject ────────────────────────────────────────────────────
router.put('/kyc/:userId', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { decision, note } = req.body; // decision: 'verified' | 'rejected'
    if (!['verified', 'rejected'].includes(decision)) return res.status(400).json({ error: 'decision must be verified or rejected' });

    const { error } = await supabase
      .from('users')
      .update({ kyc_status: decision, kyc_note: note || null, kyc_reviewed_at: new Date().toISOString() })
      .eq('id', req.params.userId);

    if (error) throw error;
    res.json({ status: 'ok', message: `User ${decision}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Analytics: platform conversion funnel ────────────────────────────────────
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();

    const [
      { count: totalDemands },
      { count: openDemands },
      { count: inProgressDemands },
      { count: completedDemands },
      { count: totalApplications },
      { count: pendingKyc },
    ] = await Promise.all([
      supabase.from('demands').select('id', { count: 'exact', head: true }),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('demands').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('demand_applications').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
    ]);

    const assignedDemands = (inProgressDemands || 0) + (completedDemands || 0);
    const conversionRate  = totalDemands ? ((assignedDemands / totalDemands) * 100).toFixed(1) : '0';

    res.json({
      status: 'ok',
      funnel: {
        posted:         totalDemands      || 0,
        open:           openDemands       || 0,
        applied:        null, // demands with ≥1 application — expensive query, skip
        assigned:       assignedDemands,
        completed:      completedDemands  || 0,
        total_applies:  totalApplications || 0,
        conversion_pct: conversionRate,
      },
      kyc_pending: pendingKyc || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
