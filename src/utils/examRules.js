// ── 考核规则判定（纯函数，便于单元测试）──────────────────────────────────────
// 所有"能不能开考/算不算超时/该不该发证"的判定集中在这里；
// routes/training.js 只负责取数和落库，不散落业务规则。

const { PASS_SCORE, RETAKE_COOLDOWN_DAYS, MAX_LEVEL } = require('../config/training');

/**
 * 判定某工程师能否开考 指定方向×等级。
 *
 * @param {object} p
 * @param {number} p.level - 要考的等级（1-3）
 * @param {number|null} p.heldLevel - 该方向当前持证等级（无证为 null）；须为未吊销未过期的有效证
 * @param {boolean} p.hasActiveAttempt - 是否有进行中的考试（任意方向）
 * @param {string|Date|null} p.lastFailedAt - 该方向×等级最近一次失败（ai_failed/rejected）的时间
 * @param {Date} p.now - 当前时间（注入便于测试）
 * @returns {{ok: boolean, reason: string|null}}
 *   reason ∈ 'invalid_level' | 'active_attempt' | 'level_locked' | 'already_certified' | 'cooldown'
 */
function canStartExam({ level, heldLevel, hasActiveAttempt, lastFailedAt, now }) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    return { ok: false, reason: 'invalid_level' };
  }
  if (hasActiveAttempt) {
    return { ok: false, reason: 'active_attempt' };
  }
  // 已持有该等级或更高：不用重复考
  if (heldLevel != null && heldLevel >= level) {
    return { ok: false, reason: 'already_certified' };
  }
  // 等级递进：考 L(n) 须已持同方向 L(n-1)；L1 对所有人开放
  if (level > 1 && (heldLevel == null || heldLevel < level - 1)) {
    return { ok: false, reason: 'level_locked' };
  }
  // 挂科冷却
  if (lastFailedAt) {
    const cooldownMs = RETAKE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (now.getTime() - new Date(lastFailedAt).getTime() < cooldownMs) {
      return { ok: false, reason: 'cooldown' };
    }
  }
  return { ok: true, reason: null };
}

/** 交卷时判超时：服务端 deadline 为准，客户端时间不可信。 */
function isExpired(deadline, now) {
  return now.getTime() > new Date(deadline).getTime();
}

/** AI 各题分 → 总分（四舍五入平均）与是否达线。空卷 0 分。 */
function summarizeGrading(perQuestionScores) {
  const valid = (perQuestionScores || []).map(Number).filter((n) => Number.isFinite(n));
  if (valid.length === 0) return { score: 0, passed: false };
  const score = Math.round(valid.reduce((s, n) => s + n, 0) / valid.length);
  return { score, passed: score >= PASS_SCORE };
}

module.exports = { canStartExam, isExpired, summarizeGrading };
