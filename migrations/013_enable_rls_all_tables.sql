-- Migration 013: 给所有 public 表开启 RLS(行级安全) — 修复 CRITICAL-2(数据库裸奔)
--
-- 背景：全部表 RLS 关闭 + anon key 打进前端 → 任何匿名访客可直读全部 users(含密码哈希)、
-- 并写任意表。前置条件：后端 SUPABASE_KEY 已从 anon 换成 service_role(绕过 RLS)。
-- deny-all(开 RLS 不配策略)= 仅后端 service_role 可访问，匿名/普通角色直连一律被拒。
-- 前端只用 anon key 做 OAuth(auth schema，不受 public 表 RLS 影响)，故不受冲击。
-- ENABLE RLS 幂等，可安全重放。
ALTER TABLE public.talents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demands                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledgers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_checkins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages               ENABLE ROW LEVEL SECURITY;
