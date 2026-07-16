// ── 学习时长/打卡统计（纯函数，便于单元测试）─────────────────────────────────
// routes/training.js 的 /study/summary 用：把 study_sessions 行聚合成
// "今日已学 X 秒 · 累计 Y 秒 · 打卡 Z 天"。时区按调用方传入的 now 本地日界。

// 单次学习封顶（秒）：4 小时。防"开着页面挂机一晚上"刷时长；
// 结算与聚合都用同一封顶，历史脏数据也不会污染统计。
const SESSION_CAP_SECONDS = 4 * 60 * 60;

/** 本地日期键（YYYY-MM-DD），用于"同一天算一次打卡"。 */
function dayKey(dateLike) {
  const t = new Date(dateLike);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/**
 * 聚合学习记录。
 * @param {Array<{started_at, duration_seconds}>} sessions
 * @param {Date} now - 注入便于测试
 * @returns {{total_seconds, today_seconds, days_count, sessions_count}}
 */
function summarizeStudy(sessions, now) {
  const today = dayKey(now);
  let total = 0;
  let todaySec = 0;
  const days = new Set();
  let counted = 0;

  for (const s of sessions || []) {
    const dur = Math.min(Math.max(0, Number(s.duration_seconds) || 0), SESSION_CAP_SECONDS);
    if (dur <= 0) continue; // 未结算/零时长的会话不计入打卡
    counted += 1;
    total += dur;
    const day = dayKey(s.started_at);
    days.add(day);
    if (day === today) todaySec += dur;
  }
  return { total_seconds: total, today_seconds: todaySec, days_count: days.size, sessions_count: counted };
}

module.exports = { summarizeStudy, SESSION_CAP_SECONDS };
