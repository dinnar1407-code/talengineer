// ── TalScore 质量分服务 ───────────────────────────────────────────────────────
// TalScore 是工程师的综合质量分（0-100），把四个可信信号加权成一个可排序、可设门槛的数字，
// 供撮合排序、邀请制路由的分数门槛、以及前端"四档徽章"使用。
//
// 为什么这么设计：
//   - AI 筛选分（25%）：入网时 AI 技术面试的分数，能力基线。
//   - 平台认证（25%）：平台考核颁发的正式认证，等级越高越可信；比自报文本硬得多。
//   - 评分（30%）：真实成交后雇主打的分。用"贝叶斯平均"而非裸均分——评价数少时向
//     全站先验（3.5 星）收缩，避免"1 条 5 星"把新人刷到榜首。
//   - 可靠性（20%）：真实完单数（越多越稳）+ 无纠纷奖励；纠纷率过高直接归零（红线）。
//
// computeTalScore 是纯函数（不碰数据库，便于单测）；recomputeTalScore 负责从 Supabase
// 聚合真实输入并写回 talents 表。

// ── 权重与档位常量（单一来源，改这里即改全站口径）─────────────────────────────
const WEIGHTS = { ai: 25, certification: 25, rating: 30, reliability: 20 }; // 合计 100
// 每方向"最高级 → 认证点数"映射；单方向 L3 即达认证维度封顶（25）。
const CERT_LEVEL_POINTS = { 1: 8, 2: 16, 3: 25 };
// 评分贝叶斯先验：假想每人自带 5 条 3.5 星的"全站平均"评价，评价越少越靠近它。
const RATING_PRIOR_MEAN = 3.5;
const RATING_PRIOR_WEIGHT = 5;
const MAX_STARS = 5;
// 可靠性：完单最多计 10 分（1 分/单，封顶）；纠纷率超过 10% 视为高风险，可靠性维度归 0。
const RELIABILITY_COMPLETED_CAP = 10;
const NO_DISPUTE_BONUS = 10;
const DISPUTE_RATE_LIMIT = 0.10;
// tier 阈值（含下界）：>=85 platinum，>=70 gold，>=55 silver，其余 bronze。
const TIER_THRESHOLDS = [
  { min: 85, tier: 'platinum' },
  { min: 70, tier: 'gold' },
  { min: 55, tier: 'silver' },
];

// 保留一位小数，避免浮点尾巴污染 breakdown（如 3.9500000001）。
const round1 = (x) => Math.round(x * 10) / 10;

/**
 * 按总分判定 tier 档位。
 * @param {number} score 0-100
 * @returns {'bronze'|'silver'|'gold'|'platinum'}
 */
function tierFor(score) {
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier;
  }
  return 'bronze';
}

/**
 * 纯函数：把四个维度输入折算成 { score, tier, breakdown }。
 * @param {Object} inputs
 * @param {number}  inputs.verifiedScore   AI 技术筛选分（0-100）
 * @param {Array<{track_key:string, level:number}>} inputs.certifications 有效平台认证
 * @param {number} [inputs.avgRating]      平均评分（1-5，无评价传 0）
 * @param {number} [inputs.reviewCount]    评价条数
 * @param {number} [inputs.completedOrders] 完单数
 * @param {number} [inputs.disputes]       纠纷数
 * @returns {{ score:number, tier:string, breakdown:{ai:number,certification:number,rating:number,reliability:number} }}
 */
function computeTalScore(inputs = {}) {
  const {
    verifiedScore = 0,
    certifications = [],
    avgRating = 0,
    reviewCount = 0,
    completedOrders = 0,
    disputes = 0,
  } = inputs;

  // 1) AI 筛选分：0-100 线性映射到 0-25。
  const verified = Math.max(0, Math.min(100, Number(verifiedScore) || 0));
  const ai = (verified / 100) * WEIGHTS.ai;

  // 2) 平台认证：每方向取最高级的点数，累加后封顶 25。
  const highestByTrack = {};
  for (const c of certifications || []) {
    if (!c || !c.track_key) continue;
    const lvl = Number(c.level) || 0;
    if (!highestByTrack[c.track_key] || lvl > highestByTrack[c.track_key]) {
      highestByTrack[c.track_key] = lvl;
    }
  }
  let certRaw = 0;
  for (const track in highestByTrack) {
    certRaw += CERT_LEVEL_POINTS[highestByTrack[track]] || 0;
  }
  const certification = Math.min(certRaw, WEIGHTS.certification);

  // 3) 评分：贝叶斯平均 (avg*n + prior*w)/(n+w) → 映射 0-30。
  const n = Math.max(0, Number(reviewCount) || 0);
  const avg = Math.max(0, Number(avgRating) || 0);
  const bayes = (avg * n + RATING_PRIOR_MEAN * RATING_PRIOR_WEIGHT) / (n + RATING_PRIOR_WEIGHT);
  const rating = (bayes / MAX_STARS) * WEIGHTS.rating;

  // 4) 可靠性：完单分（封顶 10）+ 无纠纷奖励（10）；纠纷率 > 10% 整个维度归 0。
  const completed = Math.max(0, Number(completedOrders) || 0);
  const disputeCount = Math.max(0, Number(disputes) || 0);
  // 无完单但有纠纷 → 视为纠纷率 100%（高风险）；两者皆 0 → 0。
  const disputeRate = completed > 0 ? disputeCount / completed : (disputeCount > 0 ? 1 : 0);
  let reliability;
  if (disputeRate > DISPUTE_RATE_LIMIT) {
    reliability = 0;
  } else {
    const completedPoints = Math.min(completed, RELIABILITY_COMPLETED_CAP);
    const noDisputeBonus = disputeCount === 0 ? NO_DISPUTE_BONUS : 0;
    reliability = completedPoints + noDisputeBonus;
  }

  const breakdown = {
    ai: round1(ai),
    certification: round1(certification),
    rating: round1(rating),
    reliability: round1(reliability),
  };
  const score = Math.round(ai + certification + rating + reliability);
  return { score, tier: tierFor(score), breakdown };
}

/**
 * 从 Supabase 聚合真实输入，算出 TalScore 并写回 talents 表。
 * fire-and-forget 调用（评价后、读档案超 24h 时触发）——失败仅记录，不抛出影响主流程。
 * @param {object} supabase Supabase 客户端
 * @param {number|string} talentId talents.id
 * @returns {Promise<object|null>} computeTalScore 的结果；talent 不存在或出错返回 null
 */
async function recomputeTalScore(supabase, talentId) {
  if (!supabase || !talentId) return null;
  try {
    // 1) 基础档案：AI 筛选分（评分改从 engineer_reviews 现算，保证新鲜）。
    const { data: talent, error: talentErr } = await supabase
      .from('talents')
      .select('verified_score')
      .eq('id', talentId)
      .single();
    if (talentErr || !talent) return null;

    // 2) 有效平台认证（复用门禁服务的过滤：吊销/过期已排除）。
    const { getValidCertifications } = require('./certService');
    let certifications = [];
    try {
      certifications = await getValidCertifications(supabase, talentId);
    } catch (e) {
      certifications = []; // 认证查询失败按无证处理，不阻断打分
    }

    // 3) 评分：现算平均分与条数（不依赖 talents 缓存，避免读到旧值）。
    const { data: reviews } = await supabase
      .from('engineer_reviews')
      .select('rating')
      .eq('engineer_id', talentId);
    const reviewCount = (reviews || []).length;
    const avgRating = reviewCount
      ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviewCount)
      : 0;

    // 4) 完单与纠纷：先取该工程师被指派的所有需求，再据此数完单/查纠纷。
    const { data: assigned } = await supabase
      .from('demands')
      .select('id, status')
      .eq('assigned_engineer_id', talentId);
    const demandIds = (assigned || []).map((d) => d.id);
    const completedOrders = (assigned || []).filter((d) => d.status === 'completed').length;

    let disputes = 0;
    if (demandIds.length) {
      const { data: disputeRows } = await supabase
        .from('disputes')
        .select('id')
        .in('demand_id', demandIds);
      disputes = (disputeRows || []).length;
    }

    const result = computeTalScore({
      verifiedScore: talent.verified_score || 0,
      certifications,
      avgRating,
      reviewCount,
      completedOrders,
      disputes,
    });

    await supabase
      .from('talents')
      .update({
        tal_score: result.score,
        tal_score_breakdown: result.breakdown,
        tal_score_updated_at: new Date().toISOString(),
      })
      .eq('id', talentId);

    return result;
  } catch (err) {
    console.error('[TalScore] recompute failed for talent', talentId, err);
    return null;
  }
}

module.exports = { computeTalScore, tierFor, recomputeTalScore };
