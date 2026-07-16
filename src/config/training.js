// ── 培训与考核认证的规则常量（单一来源）──────────────────────────────────────
// 集中在这里，routes/training.js 与前端展示（经 GET /api/training/tracks 下发）共用，
// 避免"改及格线漏改前端文案"式漂移。数值先取行业常规，跑起来后按数据调。

module.exports = {
  // 每卷题数（AI 按方向×等级生成场景题）
  QUESTIONS_PER_EXAM: 5,
  // 考试时长（分钟）：服务端在开考时算好 deadline，交卷超时判 expired
  EXAM_MINUTES: 30,
  // 及格线（0-100）：AI 各题平均分达线 → ai_passed（仍需 admin 复核才发证）
  PASS_SCORE: 70,
  // 挂科冷却（天）：同方向同等级失败后需等待，防题库刷穿
  RETAKE_COOLDOWN_DAYS: 7,
  // 等级递进：L1 对所有人开放；考 L(n) 须已持有同方向 L(n-1) 有效认证
  MAX_LEVEL: 3,
};
