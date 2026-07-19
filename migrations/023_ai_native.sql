-- 023: AI-Native Phase 3/4 基建——ai_memory（记忆/画像层）+ ai_events（决策埋点）
-- 来源规格：Obsidian《AI-Native改造方案-方法论与计划-2026-07-18》Phase 3 与 Phase 4。
-- 应用方式：与其他迁移一致，经授权后在 Supabase 生产执行（本文件先入库存档）。
-- 注意：生产 users.id 为 bigint（已经 information_schema 核实；models/schema.sql 的 UUID 记载已过时）。

-- ── ai_memory：每用户一行的结构化偏好档案 ─────────────────────────────────────
-- profile 结构（jsonb，Agent 读写，示例键）：
--   { "factories": [{"name":"蒙特雷厂","region":"Mexico"}], "stacks": ["Rockwell","Siemens"],
--     "lang": "zh", "timezone": "America/Monterrey", "demand_patterns": ["PLC 调试"] }
create table if not exists ai_memory (
  user_id    bigint primary key references users(id) on delete cascade,
  profile    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- RLS 开启零 policy = deny-all；读写只经服务端（agentService 在调用者 JWT 校验后、
-- 以其 user_id 为键操作本人行——G1：绝不接受外部传入的任意 user_id）。
alter table ai_memory enable row level security;

-- ── ai_events：Agent 决策埋点（Phase 4 自优化闭环的原料，随 Phase 2 上线即记）──
-- G5 隐私红线：不存用户输入原文——input_hash（sha256）+ input_summary（截断/摘要）。
create table if not exists ai_events (
  id            bigserial primary key,
  user_id       bigint,
  -- intent_parse | tool_call | suggestion | escalation
  decision_type text not null,
  tool_called   text,
  input_hash    text,
  input_summary text,
  -- success | error | refused
  outcome       text not null,
  -- 用户是否采纳建议（如：确认发布了 Agent 起草的需求）
  user_accepted boolean,
  created_at    timestamptz not null default now()
);

alter table ai_events enable row level security;

create index if not exists idx_ai_events_created on ai_events (created_at desc);
create index if not exists idx_ai_events_type    on ai_events (decision_type);
