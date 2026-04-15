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
    const [users, demands, talents, ledgers] = await Promise.all([
      supabase.from('users').select('id, email, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('demands').select('id, title, status, budget, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
      supabase.from('talents').select('id, name, region, verified_score, created_at', { count: 'exact' }).order('verified_score', { ascending: false }).limit(10),
      supabase.from('ledgers').select('id, demand_id, total_amount, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
    ]);

    const totalRevenue = (ledgers.data || [])
      .filter(l => l.status === 'released')
      .reduce((s, l) => s + (l.total_amount || 0) * 0.15, 0);

    res.json({
      status: 'ok',
      counts: {
        users:   users.count   || 0,
        demands: demands.count || 0,
        talents: talents.count || 0,
        ledgers: ledgers.count || 0,
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

module.exports = router;
