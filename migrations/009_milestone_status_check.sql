-- Migration 009: 重建 project_milestones.status 的 CHECK 约束
--
-- 背景：旧版 src/models/schema.sql 建库的环境中，status CHECK 约束不含
-- 'releasing' / 'payment_failed' / 'disputed'，会导致支付状态机
--（放款抢占、付款失败重试、争议冻结）写入时被约束直接拒绝。
-- 本迁移把旧约束删除并重建为与当前代码一致的完整状态集合。
--
-- 注意：Supabase 生产库（SUPABASE_SCHEMA.sql）的 project_milestones.status
-- 本来就没有 CHECK 约束——此时下方 DO 块找不到可删除的旧约束，
-- 整个迁移为空操作（no-op），可安全重复执行。
-- 运行方式：Supabase SQL Editor 或 psql 直接执行。

DO $$
DECLARE
  cons RECORD;
  dropped BOOLEAN := FALSE;
BEGIN
  -- 旧约束名由 Postgres 自动生成（通常是 project_milestones_status_check，
  -- 但不保证），所以不写死名字，从系统目录把引用 status 列的 CHECK 约束全部找出
  FOR cons IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'project_milestones'
      AND con.contype = 'c'                                  -- 只看 CHECK 约束
      AND pg_get_constraintdef(con.oid) ILIKE '%status%'     -- 且约束定义涉及 status 列
  LOOP
    EXECUTE format('ALTER TABLE public.project_milestones DROP CONSTRAINT %I', cons.conname);
    dropped := TRUE;
  END LOOP;

  -- 只有确实删除了旧约束才重建（保持"无 CHECK 的库不动"的空操作语义）
  IF dropped THEN
    ALTER TABLE public.project_milestones
      ADD CONSTRAINT project_milestones_status_check
      CHECK (status IN ('locked', 'funded', 'releasing', 'completed', 'released', 'payment_failed', 'disputed'));
  END IF;
END $$;
