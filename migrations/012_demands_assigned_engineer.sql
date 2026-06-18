-- Migration 012: 给 demands 补 assigned_engineer_id 列(外键 -> talents.id)
--
-- 背景：/api/demand/assign 写入、workorder approve(放款)、disputes resolve(转账)、
-- messages 通知等多处读写 demands.assigned_engineer_id，但该列在生产库及两份 schema
-- 文件里均从未定义(纯代码/schema 不一致)，导致指派与放款链路失败。
-- 该列存 talents.id(被指派工程师)。/assign 同时会把对应 demand_applications 置为 accepted，
-- 二者保持一致。幂等可重放。
ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS assigned_engineer_id BIGINT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_demands_assigned_engineer') THEN
    ALTER TABLE public.demands
      ADD CONSTRAINT fk_demands_assigned_engineer
      FOREIGN KEY (assigned_engineer_id) REFERENCES public.talents(id) ON DELETE SET NULL;
  END IF;
END $$;
