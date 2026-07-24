// ── 覆盖地图聚合端点（W2-1）───────────────────────────────────────────────────
// 公开的"平台工程师覆盖情况"统计：按地区聚合工程师数量、有效认证数量、TalScore 档位
// 分布与四大方向（plc/robotics/vision/electrical）的认证覆盖。给 /coverage 前端页与
// AI 爬虫（Dataset JSON-LD 指到这里）当数据源。
//
// 设计要点（为什么这样写）：
// 1) 只出聚合数字，零 PII——绝不返回任何工程师个体信息（连 id 都不出）。查询只取
//    id/region/tal_score/availability 四列（id 仅用于内存里跟认证表对齐，不进响应）。
// 2) 各一次查询：talents 全量 + platform_certifications 全量（revoked 在查询侧过滤，
//    expires_at 在 JS 侧过滤——与 certService.getValidCertifications 同一口径，但那是
//    单人版会造成 N+1，这里改用批量一次拉回）。当前数据规模小，全表拉取成本可忽略；
//    真正的防刷靠下面的 5 分钟缓存。
// 3) 进程内 5 分钟 TTL 缓存（照 talent.js 的 benchmarkCache 模式）：公开端点被刷时
//    数据库不挨打；覆盖统计是慢变数据，5 分钟足够新鲜。Railway 单实例部署，进程内即可。
// 4) tier 档位复用 talScore.tierFor（不重复硬编码 85/70/55）。⚠️ 关键：tal_score 为
//    NULL/0 的工程师必须单列 'unrated'（未评分），绝不落进 bronze——tierFor(null) 会
//    静默返回 bronze，但"从未评分"不等于"低质量"，公开页把新人显示成 bronze 就是造假。

const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { tierFor } = require('../services/talScore'); // 档位阈值单一来源，禁止在这里复制 85/70/55

// 缓存 TTL 与 talent.js 的 rate-benchmarks 保持一致口径（5 分钟）。
const COVERAGE_CACHE_TTL_MS = 5 * 60 * 1000;
let coverageCache = null; // { payload, expiresAt }

/**
 * 纯函数：把 talents 行 + 认证行聚合成覆盖摘要（不碰数据库，便于单测）。
 *
 * @param {Array<{id:number, region:string|null, tal_score:number|null, availability:string|null}>} talentRows
 * @param {Array<{talent_id:number, level:number, expires_at:string|null, cert_tracks:{track_key:string}|null}>} certRows
 *   注意：revoked=true 的行应已在查询侧被过滤掉；本函数只负责过期过滤（expires_at
 *   为 NULL = 长期有效，与 certService 口径一致）。
 * @returns {{regions:Array, totals:Object}}
 *   regions: [{ region, engineers, available, certified,
 *               tiers:{platinum,gold,silver,bronze,unrated}, tracks:{[track_key]:{count,max_level}} }]
 *   totals:  { engineers, available, certified, tracks:{...} }
 *   regions 按工程师数降序；只包含有工程师的地区（0 人的地区天然不会出现）。
 */
function buildCoverageSummary(talentRows, certRows) {
  const now = Date.now();

  // ── 第一步：把有效认证按 talent_id 归组，每人每方向只留最高 level ────────────
  // 为什么每人每方向只算一次：region 的 tracks.count 语义是"该地区持有该方向有效认证
  // 的工程师人数"，同一人同方向的 L1+L2 两张证只能算 1 人（取最高级 L2）。
  const highestByTalent = new Map(); // talent_id -> { track_key -> 最高 level }
  (certRows || []).forEach((c) => {
    // 已过期不算（expires_at 为 NULL = 长期有效）
    if (c.expires_at && new Date(c.expires_at).getTime() <= now) return;
    const trackKey = c.cert_tracks?.track_key;
    if (!trackKey) return;
    const level = Number(c.level) || 0;
    const m = highestByTalent.get(c.talent_id) || {};
    if (m[trackKey] === undefined || level > m[trackKey]) m[trackKey] = level;
    highestByTalent.set(c.talent_id, m);
  });

  // ── 第二步：逐个工程师归入地区桶并累加各维度 ─────────────────────────────────
  const emptyTiers = () => ({ platinum: 0, gold: 0, silver: 0, bronze: 0, unrated: 0 });
  const regionMap = new Map(); // region 名 -> 聚合桶
  const totals = { engineers: 0, available: 0, certified: 0, tracks: {} };

  // 方向计数的公共累加逻辑（region 桶与 totals 复用同一份，避免两处漂移）
  const bumpTracks = (tracksObj, highest) => {
    Object.entries(highest).forEach(([trackKey, level]) => {
      const t = tracksObj[trackKey] || (tracksObj[trackKey] = { count: 0, max_level: 0 });
      t.count += 1;
      if (level > t.max_level) t.max_level = level;
    });
  };

  (talentRows || []).forEach((t) => {
    // region 归一：trim 后为空（含 NULL）→ 'Other'，与 rate-benchmarks 的桶口径一致
    const region = String(t.region || '').trim() || 'Other';
    let bucket = regionMap.get(region);
    if (!bucket) {
      bucket = { region, engineers: 0, available: 0, certified: 0, tiers: emptyTiers(), tracks: {} };
      regionMap.set(region, bucket);
    }

    bucket.engineers += 1;
    totals.engineers += 1;

    // 可接单人数（availability === 'available'）：支撑前端"实时可用"叙事
    if (t.availability === 'available') {
      bucket.available += 1;
      totals.available += 1;
    }

    // ⚠️ 档位判定红线：NULL/0/非数字 一律进 'unrated'，只有真实正分才走 tierFor。
    // tierFor(null/0) 会返回 bronze——那是"未评分"不是"低质量"，公开统计必须区分。
    const score = Number(t.tal_score) || 0;
    const tier = score > 0 ? tierFor(score) : 'unrated';
    bucket.tiers[tier] += 1;

    // 认证覆盖：该工程师持任一方向有效认证即计入 certified；方向明细逐 track 累加
    const highest = highestByTalent.get(t.id);
    if (highest && Object.keys(highest).length > 0) {
      bucket.certified += 1;
      totals.certified += 1;
      bumpTracks(bucket.tracks, highest);
      bumpTracks(totals.tracks, highest);
    }
  });

  // 按工程师数降序：前端卡片网格从大到小排，最有覆盖的地区先看到
  const regions = [...regionMap.values()].sort((a, b) => b.engineers - a.engineers);
  return { regions, totals };
}

// ── GET /api/coverage/summary（公开，无参数）─────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    // 命中未过期缓存：直接返回，不碰数据库（照 benchmarkCache 模式）
    if (coverageCache && coverageCache.expiresAt > Date.now()) {
      return res.json(coverageCache.payload);
    }

    const supabase = getClient();

    // 查询一：talents 全量（只取聚合所需 4 列；id 仅用于内存对齐认证表，绝不进响应）
    const { data: talentRows, error: talentErr } = await supabase
      .from('talents')
      .select('id, region, tal_score, availability');
    if (talentErr) throw talentErr;

    // 查询二：全部未吊销的平台认证（吊销在查询侧滤掉；过期在 buildCoverageSummary
    // 的 JS 侧滤——与 certService.getValidCertifications 同一"有效"口径的批量版）
    const { data: certRows, error: certErr } = await supabase
      .from('platform_certifications')
      .select('talent_id, level, expires_at, cert_tracks(track_key)')
      .eq('revoked', false);
    if (certErr) throw certErr;

    const payload = {
      status: 'ok',
      data: buildCoverageSummary(talentRows, certRows),
      // 生成时间戳：前端展示"数据截至"用；缓存期内可能落后至多 5 分钟，属诚实的慢变统计
      generated_at: new Date().toISOString(),
    };
    coverageCache = { payload, expiresAt: Date.now() + COVERAGE_CACHE_TTL_MS };
    res.json(payload);
  } catch (err) {
    // 真实错误完整记录到日志(供 Sentry/排查)，但只向客户端返回通用文案，避免泄露内部细节
    console.error('[coverage]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
// 纯聚合函数随 router 一并导出，供单测直接调用（照 newsletter.js 导出 schema 的手法）
module.exports.buildCoverageSummary = buildCoverageSummary;
