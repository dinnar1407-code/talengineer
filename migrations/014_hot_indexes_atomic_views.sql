-- Migration 014: 热点外键索引 + 浏览量原子自增 + 模糊搜索索引（审计 P2 性能债）
--
-- 背景（2026-06-10 审计遗留，2026-07-16 复核确认仍缺）：
-- 1) talents(user_id)：最热查询路径——ownership 归属校验（几乎每个鉴权路由都过）
--    及 workorder/talent/certifications/connect/demand 共 10+ 处按 user_id 查档案，
--    无索引 = 每次全表扫。
-- 2) demands(assigned_engineer_id)：012 只加了列 + FK 约束，Postgres 不会给 FK
--    自动建索引；messages.js 收件箱按它过滤。
-- 3) demands(contact)：messages.js 收件箱按雇主邮箱过滤。
-- 4) 浏览量自增原先是"读后写"（demand.js 先 select 再 update），并发访问丢计数；
--    改为 SQL 函数内单条 UPDATE 原子完成。
-- 5) talent/list 的 skills/region 过滤用前导通配 ILIKE('%x%')，B-tree 无法命中；
--    pg_trgm GIN 索引专治这种模糊匹配（Supabase 自带 pg_trgm 扩展）。
-- 全部语句幂等，可安全重放。

-- ── 热点外键索引 ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_talents_user_id          ON public.talents(user_id);
CREATE INDEX IF NOT EXISTS idx_demands_assigned_engineer ON public.demands(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_demands_contact           ON public.demands(contact);

-- ── 模糊搜索索引（talent/list 的 ILIKE '%kw%' 过滤）─────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_talents_skills_trgm ON public.talents USING gin (skills gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_talents_region_trgm ON public.talents USING gin (region gin_trgm_ops);

-- ── 浏览量原子自增 ────────────────────────────────────────────────────────────
-- 单条 UPDATE 在行锁内完成 读-加-写，并发调用不丢计数。
-- 后端经 service_role 调用（RLS 对其不生效），无需 SECURITY DEFINER。
CREATE OR REPLACE FUNCTION public.increment_demand_view(d_id integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.demands SET view_count = COALESCE(view_count, 0) + 1 WHERE id = d_id;
$$;
