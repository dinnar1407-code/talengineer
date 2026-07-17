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

/**
 * 混合题型判分合并：选择题服务端按答案键判（100/0，零 AI 成本零误判），
 * 开放题（scenario/analysis，含无 type 的旧卷）按出现顺序消费 AI 的评分结果。
 *
 * @param {Array} questions - 完整考卷（选择题含 answer_index/explanation）
 * @param {Array} answers - [{a}]，选择题 a 为选项下标，开放题 a 为文本
 * @param {Array} aiPerQuestion - AI 对开放题（按出现顺序）的 [{score, feedback}]
 * @returns {Array<{score, feedback}>} 与 questions 等长、顺序一致
 */
function mergeGrading(questions, answers, aiPerQuestion) {
  let aiCursor = 0;
  return (questions || []).map((q, i) => {
    if (q && q.type === 'choice') {
      // 空串/缺失必须判未作答：Number('') === 0 会被误认为"选了 A"
      const raw = answers?.[i]?.a;
      const picked = raw === '' || raw == null ? NaN : Number(raw);
      const correct = Number.isInteger(picked) && picked === q.answer_index;
      const letter = String.fromCharCode(65 + (q.answer_index ?? 0));
      return {
        score: correct ? 100 : 0,
        feedback: `${correct ? '✅' : `❌ → ${letter}`}${q.explanation ? ` ${q.explanation}` : ''}`,
      };
    }
    // 开放题：AI 结果缺失时按 0 分（fail-closed），不默认给分
    const g = (aiPerQuestion || [])[aiCursor++] || { score: 0, feedback: 'Not graded.' };
    return { score: Number(g.score) || 0, feedback: g.feedback || '' };
  });
}

/**
 * 决定这次开考从题库池取题还是新生成一套。
 * 池子未满 → 生成新套（并入库补池）；已满 → 随机复用池中一套（零新增 token）。
 *
 * @param {number} bankSize - 当前该 方向×等级×语言 池子里已有套数
 * @param {number} targetSize - 目标容量（EXAM_BANK_SIZE）
 * @param {number} rnd - 0..1 随机数（注入便于测试）
 * @returns {{generate: boolean, index: number|null}}
 *   generate=true 生成新套；否则复用 index 指向的那套（0..bankSize-1）
 */
function selectBankSlot(bankSize, targetSize, rnd) {
  if (bankSize < targetSize) return { generate: true, index: null };
  // rnd 理论上 <1，Math.min 兜住 rnd===1 的极端，保证 index 不越界
  return { generate: false, index: Math.min(bankSize - 1, Math.floor(rnd * bankSize)) };
}

module.exports = { canStartExam, isExpired, summarizeGrading, mergeGrading, selectBankSlot };
