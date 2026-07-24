// ── 背调（Background Check，W2-5）配置单一来源 ────────────────────────────────
// 照 src/config/fees.js 的思路：所有背调相关的"数字/枚举"集中在这里，
// 路由/服务层统一 require 本文件，避免"改一处漏三处"的漂移。
//
// 为什么先做 manual：Checkr 等三方背调商需要 Terry 开企业账号 + 走合规流程，
// 本批只建基础设施——工程师发起申请 → admin 人工复核证据 → 发"已背调"徽章。
// checkr 仅作为 provider 占位（服务层遇到即抛错），接入点见 bgcheckService.js。

// passed 后的有效期（天）：背调结论有时效性（人员状况会变化），一年后需重新背调。
// 应用层在 admin 复核通过时写 expires_at = now + VALIDITY_DAYS 天。
const VALIDITY_DAYS = 365;

// 支持的背调渠道枚举（与 migrations/024_wave2.sql 的 background_checks.provider 注释一致）：
//   manual —— 平台人工复核（当前唯一可用渠道）
//   checkr —— 三方自动背调（未接入，占位）
const PROVIDERS = ['manual', 'checkr'];
const DEFAULT_PROVIDER = 'manual';

// 背调价格占位：待 Terry 定价 + 开 Checkr 账号后再定（数字纪律：未拍板的数字不对外展示）。
// null = 前端隐藏一切金额区块；接入收费时再改为具体数值并走 Stripe（钱路径，单独立项）。
const BGCHECK_PRICE_USD = null;

module.exports = { VALIDITY_DAYS, PROVIDERS, DEFAULT_PROVIDER, BGCHECK_PRICE_USD };
