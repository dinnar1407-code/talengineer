-- Migration 010: 补 project_milestones.stripe_transfer_id 列
--
-- 背景：放款(release)链路在 payment.js / workorder.js / disputes.js 多处
-- SELECT/UPDATE 该列以记录 Stripe 转账 ID，但旧 schema 与 001-009 从未定义它，
-- 导致生产库缺列 → 放款请求 404 失败（资损级缺陷，详见测试报告 CRITICAL-1）。
-- 本迁移补上该列；幂等，可安全重放。
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
