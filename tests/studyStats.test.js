// ── 学习时长/打卡统计（studyStats）单元测试 ──────────────────────────────────
// 打卡天数、今日时长、单次封顶（防挂机）是学习激励的口径，必须稳定可信。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { summarizeStudy, SESSION_CAP_SECONDS } = require('../src/utils/studyStats');

const NOW = new Date('2026-07-16T15:00:00'); // 本地时间口径
const session = (startedAt, dur) => ({ started_at: startedAt, duration_seconds: dur });

describe('summarizeStudy（学习统计聚合）', () => {

  it('累计/今日/打卡天数各算各的', () => {
    const r = summarizeStudy([
      session('2026-07-16T09:00:00', 600),   // 今天 10 分钟
      session('2026-07-16T12:00:00', 1200),  // 今天 20 分钟
      session('2026-07-15T10:00:00', 1800),  // 昨天 30 分钟
      session('2026-07-10T10:00:00', 900),   // 更早
    ], NOW);
    assert.equal(r.total_seconds, 4500);
    assert.equal(r.today_seconds, 1800);
    assert.equal(r.days_count, 3);   // 16/15/10 三天
    assert.equal(r.sessions_count, 4);
  });

  it('单次超过封顶按封顶记（防挂机刷时长）', () => {
    const r = summarizeStudy([session('2026-07-16T01:00:00', 999999)], NOW);
    assert.equal(r.total_seconds, SESSION_CAP_SECONDS);
  });

  it('未结算（时长空/0/负数）的会话不计入打卡', () => {
    const r = summarizeStudy([
      session('2026-07-16T09:00:00', null),
      session('2026-07-16T10:00:00', 0),
      session('2026-07-16T11:00:00', -5),
    ], NOW);
    assert.deepEqual(r, { total_seconds: 0, today_seconds: 0, days_count: 0, sessions_count: 0 });
  });

  it('空列表安全返回全 0', () => {
    assert.deepEqual(summarizeStudy([], NOW), { total_seconds: 0, today_seconds: 0, days_count: 0, sessions_count: 0 });
    assert.deepEqual(summarizeStudy(null, NOW), { total_seconds: 0, today_seconds: 0, days_count: 0, sessions_count: 0 });
  });
});
