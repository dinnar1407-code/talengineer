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

    // ── 交易关系校验（原路由只挡同需求重复，任意登录用户可给任意工程师刷评价）──
    // 三道门：1) 评价者必须是该 demand 的雇主本人；2) 被评工程师必须是该 demand
    // 实际指派的工程师；3) 该 demand 必须真实成交过（至少一个里程碑已放款/已退款，
    // refunded 也算交易结束——雇主赢了纠纷同样有资格留差评）。
    const { data: demand } = await supabase
      .from('demands')
      .select('employer_id, assigned_engineer_id')
      .eq('id', demand_id)
      .single();
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Only the employer of this project can leave a review.' });
    }
    if (String(demand.assigned_engineer_id) !== String(engineer_id)) {
      return res.status(400).json({ error: 'You can only review the engineer assigned to this project.' });
    }
    const { data: settled } = await supabase
      .from('project_milestones')
      .select('id')
      .eq('demand_id', demand_id)
      .in('status', ['released', 'refunded'])
      .limit(1);
    if (!settled || settled.length === 0) {
      return res.status(400).json({ error: 'You can review once a milestone has been completed and settled.' });
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
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[reviews]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[reviews]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
