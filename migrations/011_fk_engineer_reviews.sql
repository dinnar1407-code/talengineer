-- Migration 011: 给 engineer_reviews.demand_id 补外键 -> demands(id)
--
-- 背景：reviews.js 用 PostgREST 嵌套联表 .select('...demands(title)')，
-- 需要外键关系才能联表；migration 005 建表时漏了该外键，
-- 导致线上 /api/reviews/engineer/:id 报 "Could not find a relationship"。
-- 幂等：仅当约束不存在时添加。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_engineer_reviews_demand') THEN
    ALTER TABLE public.engineer_reviews
      ADD CONSTRAINT fk_engineer_reviews_demand
      FOREIGN KEY (demand_id) REFERENCES public.demands(id) ON DELETE CASCADE;
  END IF;
END $$;
