// ── 考核规则（examRules）单元测试 ─────────────────────────────────────────────
// 认证发的是"现场正式工作授权"，开考资格/超时/及格判定必须逐分支测到。
// 纯函数 + 注入 now，不碰数据库。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { canStartExam, isExpired, summarizeGrading } = require('../src/utils/examRules');
const { PASS_SCORE, RETAKE_COOLDOWN_DAYS } = require('../src/config/training');

const NOW = new Date('2026-07-16T12:00:00Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe('canStartExam（开考资格判定）', () => {

  it('非法等级（0 / 4 / 小数）：invalid_level', () => {
    for (const level of [0, 4, 1.5]) {
      const r = canStartExam({ level, heldLevel: null, hasActiveAttempt: false, lastFailedAt: null, now: NOW });
      assert.equal(r.ok, false);
      assert.equal(r.reason, 'invalid_level');
    }
  });

  it('已有进行中的考试：active_attempt', () => {
    const r = canStartExam({ level: 1, heldLevel: null, hasActiveAttempt: true, lastFailedAt: null, now: NOW });
    assert.deepEqual(r, { ok: false, reason: 'active_attempt' });
  });

  it('已持同级或更高证：already_certified（不许重复刷同级）', () => {
    assert.equal(canStartExam({ level: 2, heldLevel: 2, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).reason, 'already_certified');
    assert.equal(canStartExam({ level: 1, heldLevel: 3, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).reason, 'already_certified');
  });

  it('等级递进锁：无证考 L2、持 L1 考 L3 都拦', () => {
    assert.equal(canStartExam({ level: 2, heldLevel: null, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).reason, 'level_locked');
    assert.equal(canStartExam({ level: 3, heldLevel: 1, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).reason, 'level_locked');
  });

  it('挂科冷却：冷却期内拦、冷却期满放行', () => {
    const inCooldown = canStartExam({ level: 1, heldLevel: null, hasActiveAttempt: false, lastFailedAt: daysAgo(RETAKE_COOLDOWN_DAYS - 1), now: NOW });
    assert.deepEqual(inCooldown, { ok: false, reason: 'cooldown' });
    const after = canStartExam({ level: 1, heldLevel: null, hasActiveAttempt: false, lastFailedAt: daysAgo(RETAKE_COOLDOWN_DAYS + 1), now: NOW });
    assert.equal(after.ok, true);
  });

  it('正常路径：新人考 L1、持 L1 考 L2 都放行', () => {
    assert.equal(canStartExam({ level: 1, heldLevel: null, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).ok, true);
    assert.equal(canStartExam({ level: 2, heldLevel: 1, hasActiveAttempt: false, lastFailedAt: null, now: NOW }).ok, true);
  });
});

describe('isExpired（服务端限时判定）', () => {
  it('deadline 之前不超时、之后超时', () => {
    assert.equal(isExpired('2026-07-16T12:30:00Z', NOW), false);
    assert.equal(isExpired('2026-07-16T11:59:59Z', NOW), true);
  });
});

describe('summarizeGrading（整卷总分与及格线）', () => {
  it('平均分达线通过、不达线不通过', () => {
    // 平均 75 ≥ 及格线（70）
    assert.deepEqual(summarizeGrading([80, 60, 70, 90, 75]), { score: 75, passed: 75 >= PASS_SCORE });
    // 平均 55 < 及格线
    const low = summarizeGrading([50, 60]);
    assert.equal(low.score, 55);
    assert.equal(low.passed, false);
  });

  it('空卷/全非法分数：0 分不通过（fail-closed）', () => {
    assert.deepEqual(summarizeGrading([]), { score: 0, passed: false });
    assert.deepEqual(summarizeGrading(['abc', null, undefined]), { score: 0, passed: false });
  });

  it('混入非法分数只按合法分数平均', () => {
    const r = summarizeGrading([100, 'x', 80]);
    assert.equal(r.score, 90);
  });
});
