// ── 培训与考核认证的规则常量（单一来源）──────────────────────────────────────
// 集中在这里，routes/training.js 与前端展示（经 GET /api/training/tracks 下发）共用，
// 避免"改及格线漏改前端文案"式漂移。数值先取行业常规，跑起来后按数据调。

// 题型构成（2026-07-16 用户反馈：题量太少、要加选择题和分析题）：
// choice=选择题（4 选 1，服务端按答案键判分，零 AI 成本零误判）；
// scenario=场景短答题（AI 评分）；analysis=深度分析题（多要点长答，AI 评分）。
const EXAM_QUESTION_MIX = { choice: 5, scenario: 3, analysis: 2 };

module.exports = {
  EXAM_QUESTION_MIX,
  // 每卷总题数：由题型构成推导，避免"改构成漏改总数"漂移
  QUESTIONS_PER_EXAM: EXAM_QUESTION_MIX.choice + EXAM_QUESTION_MIX.scenario + EXAM_QUESTION_MIX.analysis,
  // 考试时长（分钟）：服务端在开考时算好 deadline，交卷超时判 expired（10 题上调至 40 分钟）
  EXAM_MINUTES: 40,
  // 及格线（0-100）：AI 各题平均分达线 → ai_passed（仍需 admin 复核才发证）
  PASS_SCORE: 70,
  // 挂科冷却（天）：同方向同等级失败后需等待，防题库刷穿
  RETAKE_COOLDOWN_DAYS: 7,
  // 等级递进：L1 对所有人开放；考 L(n) 须已持有同方向 L(n-1) 有效认证
  MAX_LEVEL: 3,
  // 题库池目标容量（每 方向×等级×语言 存这么多套）：未满则开考时边生成边补池，
  // 满了之后开考纯随机复用、零新增 token。池子越大越难背题。
  EXAM_BANK_SIZE: 20,
};
