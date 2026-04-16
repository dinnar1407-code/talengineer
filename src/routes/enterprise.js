const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireApiKey } = require('./apikeys');

// ── Bulk create demands ───────────────────────────────────────────────────────
// POST /api/enterprise/demands/bulk
// Body: { demands: [{ title, description, budget, region, skills, milestones? }] }
router.post('/demands/bulk', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    const { demands } = req.body;

    if (!Array.isArray(demands) || demands.length === 0) {
      return res.status(400).json({ error: 'demands must be a non-empty array' });
    }
    if (demands.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 demands per bulk request' });
    }

    const rows = demands.map(d => ({
      title:       d.title,
      description: d.description || '',
      budget:      d.budget || null,
      region:      d.region || null,
      skills:      Array.isArray(d.skills) ? d.skills.join(',') : (d.skills || ''),
      user_id:     req.apiKeyUserId,
      status:      'open',
    }));

    // Validate required fields
    const invalid = rows.findIndex(r => !r.title);
    if (invalid !== -1) return res.status(400).json({ error: `demands[${invalid}].title is required` });

    const { data, error } = await supabase.from('demands').insert(rows).select('id, title, status');
    if (error) throw error;

    // Optionally create milestones if provided
    const milestoneInserts = [];
    demands.forEach((d, idx) => {
      if (Array.isArray(d.milestones)) {
        d.milestones.forEach(ms => {
          milestoneInserts.push({
            demand_id:  data[idx].id,
            phase_name: ms.phase_name,
            amount:     ms.amount,
            percentage: ms.percentage || 0,
            status:     'locked',
          });
        });
      }
    });

    if (milestoneInserts.length > 0) {
      await supabase.from('project_milestones').insert(milestoneInserts);
    }

    res.json({ status: 'ok', created: data.length, demands: data });
  } catch (err) {
    console.error('[Enterprise] Bulk create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── List demands (enterprise user's own) ─────────────────────────────────────
router.get('/demands', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    const page  = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const from  = page * limit;

    const { data, error, count } = await supabase
      .from('demands')
      .select('id, title, status, budget, region, created_at', { count: 'exact' })
      .eq('user_id', req.apiKeyUserId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;
    res.json({ status: 'ok', data: data || [], total: count || 0, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Rate benchmarks ───────────────────────────────────────────────────────────
router.get('/benchmarks', requireApiKey, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('talents')
      .select('region, rate, verified_score, skills')
      .not('rate', 'is', null);
    if (error) throw error;

    // Parse rates like "$95/hr" or "95"
    const parse = r => parseFloat(String(r).replace(/[^0-9.]/g, '')) || null;
    const byRegion = {};
    (data || []).forEach(t => {
      const num = parse(t.rate);
      if (!num) return;
      const key = t.region || 'Other';
      if (!byRegion[key]) byRegion[key] = [];
      byRegion[key].push(num);
    });

    const summary = Object.entries(byRegion).map(([region, rates]) => {
      rates.sort((a, b) => a - b);
      const avg = rates.reduce((s, v) => s + v, 0) / rates.length;
      const mid = Math.floor(rates.length / 2);
      const median = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
      return { region, count: rates.length, avg: Math.round(avg), median: Math.round(median), min: rates[0], max: rates[rates.length - 1] };
    });

    res.json({ status: 'ok', data: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
