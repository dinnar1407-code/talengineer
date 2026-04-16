const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Submit review ─────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, engineer_id, rating, comment } = req.body;

    if (!demand_id || !engineer_id || !rating) {
      return res.status(400).json({ error: 'demand_id, engineer_id, and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Prevent duplicate review
    const { data: existing } = await supabase
      .from('engineer_reviews')
      .select('id')
      .eq('demand_id', demand_id)
      .eq('reviewer_email', req.user.email)
      .single();
    if (existing) return res.status(400).json({ error: 'You have already reviewed this project.' });

    const { data, error } = await supabase.from('engineer_reviews').insert({
      demand_id, engineer_id, rating, comment: comment || null, reviewer_email: req.user.email,
    }).select().single();

    if (error) throw error;

    // Update cached avg_rating on talents table if column exists
    const { data: reviews } = await supabase
      .from('engineer_reviews')
      .select('rating')
      .eq('engineer_id', engineer_id);

    if (reviews?.length) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await supabase.from('talents').update({ avg_rating: Math.round(avg * 10) / 10, review_count: reviews.length }).eq('id', engineer_id);
    }

    res.json({ status: 'ok', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List reviews for engineer ─────────────────────────────────────────────────
router.get('/engineer/:engineerId', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('engineer_reviews')
      .select('id, rating, comment, reviewer_email, created_at, demands(title)')
      .eq('engineer_id', req.params.engineerId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Check if current user already reviewed a demand ───────────────────────────
router.get('/check/:demandId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data } = await supabase
      .from('engineer_reviews')
      .select('id, rating')
      .eq('demand_id', req.params.demandId)
      .eq('reviewer_email', req.user.email)
      .single();
    res.json({ status: 'ok', reviewed: !!data, review: data || null });
  } catch {
    res.json({ status: 'ok', reviewed: false, review: null });
  }
});

module.exports = router;
