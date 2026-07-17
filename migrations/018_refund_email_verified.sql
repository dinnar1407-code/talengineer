-- Migration 018: 纠纷退款路径 + 注册邮箱验证
--
-- 1) 退款路径（此前托管资金只能转给工程师或冻结，判给雇主时无法原路退回）：
--    - project_milestones.stripe_payment_intent：funding 时落盘 Stripe payment_intent，
--      纠纷判雇主时 refunds.create 按它原路退款（存量老数据没有该值，代码里有
--      按 metadata 搜索 Stripe 的兜底）。
--    - disputes.stripe_refund_id：退款凭证留档（审计用）。
--    - 里程碑终态新增 'refunded'（全额退回雇主）。status CHECK 约束沿用 009 的语义：
--      Supabase 生产库本就没有该约束（009 是 no-op），仅当约束存在时才重建纳入 refunded。
-- 2) 邮箱验证：users.email_verified，默认 FALSE；存量用户回填 TRUE
--   （他们早于验证机制注册，不应被锁出任何功能）。

ALTER TABLE public.project_milestones ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;
ALTER TABLE public.disputes           ADD COLUMN IF NOT EXISTS stripe_refund_id      TEXT;

-- 仅当 status CHECK 约束存在时重建（含 'refunded'）；不存在则保持 no-op，与 009 一致
DO $$
DECLARE
  cons RECORD;
  dropped BOOLEAN := FALSE;
BEGIN
  FOR cons IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'project_milestones'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.project_milestones DROP CONSTRAINT %I', cons.conname);
    dropped := TRUE;
  END LOOP;

  IF dropped THEN
    ALTER TABLE public.project_milestones
      ADD CONSTRAINT project_milestones_status_check
      CHECK (status IN ('locked', 'funded', 'releasing', 'completed', 'released', 'payment_failed', 'disputed', 'refunded'));
  END IF;
END $$;

-- 邮箱验证列 + 存量回填（迁移先于新代码部署执行，此刻全部用户均为"验证机制之前"的存量）
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE public.users SET email_verified = TRUE WHERE email_verified = FALSE;
