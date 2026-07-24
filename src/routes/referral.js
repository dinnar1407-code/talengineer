// ── 推荐计划（W2-4）路由：/api/referral ────────────────────────────────────────
// 三个端点：
//   GET /config     公开——enabled 开关 + 兑现规则（前端文案分支用；金额未定价恒为 null）
//   GET /me         requireAuth——我的推荐码（懒生成）+ 我推荐的人及状态（触发读侧懒兑现）
//   GET /admin-list requireAdmin——全量归因列表（分页），加载时同页触发懒兑现
// 挂载（集成批负责）：app.use('/api/referral', require('./routes/referral'))
//
// 红线遵守：不碰任何钱路径文件；兑现只在读侧发生（evaluateVesting）；
// 不对外展示任何奖励金额（REFERRAL_REWARD_USD=null 待 Terry 定价）。
const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { clampPagination } = require('../utils/pagination');
const { REFERRAL_ENABLED, REFERRAL_REWARD_USD, VESTING_RULE } = require('../config/referral');
const { getOrCreateCode, evaluateVesting, maskEmail } = require('../services/referralService');

// ── GET /config：公开配置（无 PII、无金额泄漏风险）───────────────────────────
// 前端 /referral 页据 enabled 切换"已上线/即将上线"文案；reward_usd 为 null 时隐藏金额区块。
router.get('/config', (req, res) => {
  res.json({
    status: 'ok',
    data: {
      enabled: REFERRAL_ENABLED,
      reward_usd: REFERRAL_REWARD_USD, // null = 待 Terry 定价，前端隐藏金额
      vesting_rule: VESTING_RULE,
    },
  });
});

// ── GET /me：我的码 + 我推荐的人 ─────────────────────────────────────────────
// 读侧懒兑现的触发点之一：加载列表时批量评估 attributed 行是否可 vested。
// 被推荐人邮箱打码返回（PII 纪律：referrer 只需认出是谁，不需要完整邮箱）。
router.get('/me', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const userId = req.user.userId;

    // 懒生成推荐码：第一次访问本端点即领码（enabled=false 时也可先领，归因从今天就算数）
    const code = await getOrCreateCode(supabase, userId);

    const { data: rows, error } = await supabase
      .from('referrals')
      .select('id, referred_user_id, status, vested_at, created_at')
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const list = rows || [];

    // 读侧懒兑现：批量评估（内部 fail-open，失败不影响本响应）
    const vestedNow = await evaluateVesting(supabase, list);

    // 批量取被推荐人邮箱（一次 .in()，打码后返回）
    const referredIds = [...new Set(list.map((r) => r.referred_user_id).filter((v) => v != null))];
    const emailById = {};
    if (referredIds.length > 0) {
      const { data: us, error: uErr } = await supabase
        .from('users')
        .select('id, email')
        .in('id', referredIds);
      if (uErr) throw uErr;
      (us || []).forEach((u) => { emailById[u.id] = maskEmail(u.email); });
    }

    // 合并本次刚兑现的状态（无需回读数据库）
    const referrals = list.map((r) => {
      const v = vestedNow.get(r.id);
      return {
        id: r.id,
        referred_email: emailById[r.referred_user_id] || null,
        status: v ? 'vested' : r.status,
        vested_at: v ? v.vested_at : r.vested_at,
        created_at: r.created_at,
      };
    });

    res.json({ status: 'ok', data: { code, enabled: REFERRAL_ENABLED, referrals } });
  } catch (err) {
    console.error('[Referral] me error:', err);
    res.status(500).json({ error: 'Failed to load referral info. Please try again.' });
  }
});

// ── GET /admin-list：admin 全量归因列表（分页）───────────────────────────────
// 读侧懒兑现的触发点之二：admin 打开面板/点刷新时，当前页的 attributed 行会被批量评估。
// admin 可见双方完整邮箱（requireAdmin 双通道鉴权后属可信上下文，人工处置奖励要能联系人）。
router.get('/admin-list', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { pageNum, pageSize, from, to } = clampPagination(req.query.page, req.query.limit);

    const { data: rows, error } = await supabase
      .from('referrals')
      .select('id, referrer_user_id, referred_user_id, code, status, vested_at, vest_evidence, created_at')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    const list = rows || [];

    // 当前页懒兑现（fail-open）
    const vestedNow = await evaluateVesting(supabase, list);

    // 双方邮箱一次批量查（referrer + referred 的 id 并集）
    const userIds = [...new Set(
      list.flatMap((r) => [r.referrer_user_id, r.referred_user_id]).filter((v) => v != null)
    )];
    const emailById = {};
    if (userIds.length > 0) {
      const { data: us, error: uErr } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);
      if (uErr) throw uErr;
      (us || []).forEach((u) => { emailById[u.id] = u.email; });
    }

    const data = list.map((r) => {
      const v = vestedNow.get(r.id);
      return {
        ...r,
        status: v ? 'vested' : r.status,
        vested_at: v ? v.vested_at : r.vested_at,
        vest_evidence: v ? v.vest_evidence : r.vest_evidence,
        referrer_email: emailById[r.referrer_user_id] || null,
        referred_email: emailById[r.referred_user_id] || null,
      };
    });

    res.json({ status: 'ok', data, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error('[Referral] admin-list error:', err);
    res.status(500).json({ error: 'Failed to load referrals. Please try again.' });
  }
});

module.exports = router;
