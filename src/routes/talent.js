const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { parseDemand, generateTechQuestion, gradeTechAnswer } = require('../services/aiService');

// ── List open demands ─────────────────────────────────────────────────────────
router.get('/demands', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('demands')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AI tech screen: generate question ────────────────────────────────────────
router.post('/screen_question', async (req, res) => {
  try {
    const { skills, level, lang } = req.body;
    const question = await generateTechQuestion(skills, level, lang);
    res.json({ status: 'ok', question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AI tech screen: grade answer ──────────────────────────────────────────────
router.post('/screen_verify', async (req, res) => {
  try {
    const { question, answer, lang } = req.body;
    const result = await gradeTechAnswer(question, answer, lang);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List engineers with filters + pagination ──────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    const supabase = getClient();
    const { region, skills, min_score, page = '0', limit: limitParam = '12' } = req.query;

    const pageNum  = Math.max(0, parseInt(page) || 0);
    const pageSize = Math.min(50, Math.max(1, parseInt(limitParam) || 12));
    const from = pageNum * pageSize;
    const to   = from + pageSize - 1;

    let query = supabase
      .from('talents')
      .select('*', { count: 'exact' })
      .order('verified_score', { ascending: false })
      .range(from, to);

    if (region && region !== 'all') query = query.ilike('region', `%${region}%`);
    if (skills)                     query = query.ilike('skills', `%${skills}%`);
    if (min_score)                  query = query.gte('verified_score', parseInt(min_score));

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ status: 'ok', data, total: count || 0, page: pageNum, pageSize });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update own engineer profile ───────────────────────────────────────────────
const { requireAuth } = require('../middleware/auth');

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const allowed = ['bio', 'region', 'rate', 'pricing_model', 'skills', 'availability', 'available_from', 'avatar_url'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });

    // Find talent by user_id
    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Please create a profile first.' });

    const { data, error } = await supabase.from('talents').update(updates).eq('id', talent.id).select().single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single engineer profile ───────────────────────────────────────────────
router.get('/profile/:id', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('talents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Engineer not found' });
    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Rate benchmarks (public) ──────────────────────────────────────────────────
router.get('/rate-benchmarks', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('talents')
      .select('region, rate, skills')
      .not('rate', 'is', null);
    if (error) throw error;

    const parse = r => parseFloat(String(r).replace(/[^0-9.]/g, '')) || null;
    const byRegion = {};
    const allSkills = new Set();

    (data || []).forEach(t => {
      const num = parse(t.rate);
      if (!num) return;
      const key = t.region || 'Other';
      if (!byRegion[key]) byRegion[key] = { rates: [], skills: {} };
      byRegion[key].rates.push(num);
      (t.skills || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
        allSkills.add(s);
        byRegion[key].skills[s] = (byRegion[key].skills[s] || 0) + 1;
      });
    });

    const summary = Object.entries(byRegion).map(([region, { rates, skills }]) => {
      rates.sort((a, b) => a - b);
      const avg = rates.reduce((s, v) => s + v, 0) / rates.length;
      const mid = Math.floor(rates.length / 2);
      const median = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
      const top_skills = Object.entries(skills).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
      return { region, count: rates.length, avg: Math.round(avg), median: Math.round(median), min: rates[0], max: rates[rates.length - 1], top_skills };
    }).sort((a, b) => b.count - a.count);

    res.json({ status: 'ok', data: summary, skills: [...allSkills].sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
