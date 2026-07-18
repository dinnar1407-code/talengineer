-- Migration 020: PMF×P2×增长 三轨配套（设计规格 2026-07-17，Terry 已批准打包放行）
-- 1) matchmaking_pipeline：人工撮合 PMF 实验的 lead 看板（admin 专用）
-- 2) push_subscriptions：Web Push 订阅（PWA 深化）
-- 3) manual_payouts：跨境收款 manual provider 的线下打款登记（provider 抽象层兜底）
-- 4) talents：TalScore 质量分三列 + payout_provider（stripe|manual|payoneer）
-- 5) demands：auto_dispatch 邀请制路由配置 + fee_pct 单需求费率覆盖（founding 客户让利）
-- 6) api_keys：企业 webhook 回调配置（url + HMAC secret）

CREATE TABLE IF NOT EXISTS public.matchmaking_pipeline (
  id BIGSERIAL PRIMARY KEY,
  line TEXT NOT NULL DEFAULT 'cn',
  company TEXT NOT NULL,
  contact TEXT,
  stage TEXT NOT NULL DEFAULT 'lead',
  demand_id BIGINT,
  note TEXT,
  next_action TEXT,
  next_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.matchmaking_pipeline ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_subs_email ON public.push_subscriptions (user_email);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.manual_payouts (
  id BIGSERIAL PRIMARY KEY,
  milestone_id BIGINT NOT NULL,
  talent_id BIGINT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  evidence_url TEXT,
  note TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.manual_payouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score INT;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score_breakdown JSONB;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score_updated_at TIMESTAMPTZ;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS payout_provider TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE public.demands  ADD COLUMN IF NOT EXISTS auto_dispatch JSONB;
ALTER TABLE public.demands  ADD COLUMN IF NOT EXISTS fee_pct NUMERIC;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
