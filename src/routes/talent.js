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

module.exports = router;
