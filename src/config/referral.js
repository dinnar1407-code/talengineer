// ── 推荐计划（W2-4）配置：单一事实来源 ─────────────────────────────────────────
// 与 fees.js 同一哲学：数字/开关只在这里定义，路由与前端一律从这里（或 /api/referral/config）读，
// 避免"改一处漏三处"。
//
// 上线开关：env REFERRAL_ENABLED，默认 false（未设或非 'true' 一律视为关闭）。
// 关闭状态下归因照常记录（用户现在领码、现在推荐都算数），只是对外文案标"即将上线"。
const REFERRAL_ENABLED = process.env.REFERRAL_ENABLED === 'true';

// 奖励金额占位：待 Terry 定价，null = 前端隐藏一切金额区块（数字纪律：未拍板的数字不对外展示）。
// 定价后改成数字即可，前端会自动开始渲染金额。
const REFERRAL_REWARD_USD = null;

// 兑现规则常量：被推荐用户（无论 employer 侧还是 engineer 侧）在平台上出现
// 【第一个 status='released' 的里程碑】时，该条归因从 attributed → vested。
// 实现是读侧懒评估（referralService.evaluateVesting），不挂任何钱路径钩子。
const VESTING_RULE = 'first_released_milestone';

module.exports = { REFERRAL_ENABLED, REFERRAL_REWARD_USD, VESTING_RULE };
