// ── 推荐计划（W2-4）配置：单一事实来源 ─────────────────────────────────────────
// 与 fees.js 同一哲学：数字/开关只在这里定义，路由与前端一律从这里（或 /api/referral/config）读，
// 避免"改一处漏三处"。
//
// 上线开关：env REFERRAL_ENABLED，默认 false（未设或非 'true' 一律视为关闭）。
// 关闭状态下归因照常记录（用户现在领码、现在推荐都算数），只是对外文案标"即将上线"。
const REFERRAL_ENABLED = process.env.REFERRAL_ENABLED === 'true';

// 奖励规则（2026-07-25 Terry 拍板）：不是固定金额，而是"被推荐人首个 released 里程碑
// 产生的平台佣金"——不同项目金额不同，佣金自然也不同，所以没有一个能写死的数字。
// 实际美元金额在 referralService.evaluateVesting 里逐条计算（里程碑金额 × 该 demand 的
// 实际费率，费率取 fees.js 的 feeFor()，founding 客户 5%/标准 15% 都如实反映），
// 算出来直接快照进 referrals.vest_evidence.reward_usd——事后 PLATFORM_FEE_PCT 环境变量
// 再调整也不会改写历史已兑现的金额（兑现是一次性事件，不是实时公式）。
const REFERRAL_REWARD_RULE = 'first_milestone_platform_fee';

// 兑现规则常量：被推荐用户（无论 employer 侧还是 engineer 侧）在平台上出现
// 【第一个 status='released' 的里程碑】时，该条归因从 attributed → vested。
// 实现是读侧懒评估（referralService.evaluateVesting），不挂任何钱路径钩子。
const VESTING_RULE = 'first_released_milestone';

module.exports = { REFERRAL_ENABLED, REFERRAL_REWARD_RULE, VESTING_RULE };
