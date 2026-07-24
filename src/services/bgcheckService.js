// ── 背调服务（W2-5）────────────────────────────────────────────────────────────
// provider 抽象照 src/services/payout/index.js 的手法：统一入口按 provider 分发，
//   manual → 建一行 background_checks(status='requested') 等 admin 人工复核证据；
//   checkr → 商务未开通，直接抛错（stub 接入点：将来在此调 Checkr API 建 candidate + invitation，
//            回调 webhook 更新 status——webhook 属钱路径纪律范畴，单独立项，本批不做）。
// 语义与 sendPayout 一致：抛错 = 未发起成功，调用方负责向客户端报错；成功返回现状行。
//
// 安全前提（IDOR 红线）：本服务只接收 talent_id，"talent_id 属于谁"必须由路由层从
// req.user.userId → talents.user_id 反查得出，绝不信任客户端 body 里的 talent_id。

const { DEFAULT_PROVIDER } = require('../config/bgcheck');

// 对外/对内展示背调行时选取的列（表里没有 PII，但仍显式列出，与 PUBLIC_TALENT_FIELDS 同纪律）
const CHECK_FIELDS = 'id, talent_id, provider, status, requested_at, completed_at, expires_at, evidence_url, note, created_at';

/**
 * 判断一条背调记录当前是否有效。
 * 规则：status 必须是 passed，且 expires_at 为 NULL（长期有效）或尚未过期。
 * 纯函数（不碰数据库），便于单测过期矩阵。
 * @param {object|null} check background_checks 行（至少含 status / expires_at）
 * @returns {boolean}
 */
function isValid(check) {
  if (!check || check.status !== 'passed') return false;
  if (!check.expires_at) return true; // NULL = 长期有效
  return new Date(check.expires_at).getTime() > Date.now();
}

/**
 * 发起一次背调（幂等）：
 *   - 已有 requested / pending（在途）→ 直接返回现状，不重复建行；
 *   - 已有仍有效的 passed → 同样返回现状（有效期内无需重背）；
 *   - 否则按 provider 分发新建。
 * @param {object} supabase Supabase client（依赖注入，便于测试）
 * @param {number} talentId 服务端反查得到的工程师 id（绝不来自客户端 body）
 * @param {string} [provider] 背调渠道，默认 manual
 * @returns {Promise<{check: object, created: boolean}>} created=false 表示幂等命中现状
 */
async function requestCheck(supabase, talentId, provider = DEFAULT_PROVIDER) {
  // 取该工程师最近几条记录判断幂等：在途（requested/pending）或仍有效的 passed 都算"现状"。
  // limit(5) 足够覆盖"历史过期 + 最新在途"的组合，避免无谓拉全部历史。
  async function findActive() {
    const { data: rows, error } = await supabase
      .from('background_checks')
      .select(CHECK_FIELDS)
      .eq('talent_id', talentId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (rows || []).find((r) => r.status === 'requested' || r.status === 'pending' || isValid(r));
  }

  const active = await findActive();
  if (active) return { check: active, created: false };

  // ── provider 分发（照 payout/index.js）──────────────────────────────────────
  if (provider === 'checkr') {
    // Checkr 接入点（stub）：Terry 开通账号后在此实现
    //   1) POST /v1/candidates 建候选人 → 2) POST /v1/invitations 发起套餐 →
    //   3) webhook 回调更新 status/completed_at（webhook 单独立项，不在本批范围）。
    throw new Error('Checkr provider not configured — manual review only for now');
  }

  // manual（默认）：建 requested 行，进 admin 复核队列（admin 面板 BG Checks tab 处置）
  const { data: created, error: insErr } = await supabase
    .from('background_checks')
    .insert({ talent_id: talentId, provider: 'manual', status: 'requested' })
    .select(CHECK_FIELDS)
    .single();
  if (insErr) {
    // 23505 = 唯一部分索引 uq_bgchecks_talent_inflight 拦住了并发的第二条在途行——
    // 不是错误，是这次竞态"输了"，回读现状返回，保持幂等契约（调用方看不出竞态存在过）。
    if (insErr.code === '23505') {
      const raced = await findActive();
      if (raced) return { check: raced, created: false };
    }
    throw insErr;
  }
  return { check: created, created: true };
}

/**
 * 批量查询一组工程师的"是否已背调"状态（给 /api/talent/list 富化用）。
 * 一次 .in() 拉回全部 passed 记录，JS 里按 isValid 过滤过期——禁 N+1。
 * @param {object} supabase Supabase client
 * @param {number[]} talentIds 本页工程师 id 列表
 * @returns {Promise<Map<number, boolean>>} talent_id → true（仅收录当前有效的）
 */
async function batchStatus(supabase, talentIds) {
  const map = new Map();
  if (!Array.isArray(talentIds) || !talentIds.length) return map;
  const { data, error } = await supabase
    .from('background_checks')
    .select('talent_id, status, expires_at')
    .in('talent_id', talentIds)
    .eq('status', 'passed');
  if (error) throw error;
  (data || []).forEach((r) => { if (isValid(r)) map.set(r.talent_id, true); });
  return map;
}

/**
 * 列出当前持有有效背调的全部 talent_id（给 /list 的 bg_checked=true 过滤用）。
 * 过滤必须发生在数据库侧的 .in('id', ids) 上才能与分页/计数共存——
 * 所以这里先取"有效集合"，路由再把它塞进主查询；集合为空时路由侧短路返回空页。
 * 只按 status='passed' 下推查询（在途/失败的行不参与），过期判断在 JS 里做
 * （expires_at 为 NULL = 长期有效，SQL 里表达"NULL 或未来"反而绕）。
 * @param {object} supabase Supabase client
 * @returns {Promise<number[]>} 去重后的有效 talent_id 列表
 */
async function listValidTalentIds(supabase) {
  const { data, error } = await supabase
    .from('background_checks')
    .select('talent_id, status, expires_at')
    .eq('status', 'passed');
  if (error) throw error;
  return [...new Set((data || []).filter(isValid).map((r) => r.talent_id))];
}

module.exports = { isValid, requestCheck, batchStatus, listValidTalentIds, CHECK_FIELDS };
