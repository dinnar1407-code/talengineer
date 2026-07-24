-- 024: Wave 2 批次基建——推荐计划 + 背调 + 企业人才池 + AI 周报
-- 来源规格：Obsidian《竞对深度调研-官网情报与改善计划-2026-07-18》Wave 2 七项
--          + 《AI-Native改造方案-方法论与计划-2026-07-18》Phase 4。
-- 应用方式：与其他迁移一致，经授权后在 Supabase 生产执行（本文件先入库存档，不动生产）。
-- 全部语句幂等，可安全重放。019+ 惯例：BIGSERIAL/BIGINT、不加 FK 约束（关联在应用层）、
-- 每表 enable row level security 零 policy（deny-all，所有访问经服务端 service_role）。
-- 注意：生产 users.id / talents.id 为 bigint（023 已核实；models/schema.sql 的 UUID 记载过时不可信）。
--
-- 本批表业务背景：
--   1. users.referral_code + referrals —— W2-4 推荐计划。每用户一个推荐码；被推荐人注册时归因
--      （一人只能被推荐一次），兑现走读侧懒评估（referred 用户首个 released 里程碑 → vested），
--      不挂钱路径钩子。奖励金额 Terry 未拍板，表里不存金额。
--   2. background_checks —— W2-5 工程师背调。先 manual（admin 人工复核证据），checkr 为未来
--      接入占位；passed 的有效期由应用层写 expires_at（VALIDITY_DAYS 配置）。
--   3. talent_pools / talent_pool_members —— W2-3 企业认证人才池。雇主按 criteria（方向/等级/
--      分数/地区，jsonb）圈选工程师；成员快照 snapshot 记录加入时的评分与证书状态。
--   4. ai_improvement_reports —— Phase 4 自优化闭环产物。每周从 ai_events 聚合 stats，
--      Gemini 起草改进假设（hypotheses），永远 draft 起步、人审（reviewed/dismissed）——
--      Level 1 纪律：本仓库不存在任何自主改配置的代码路径。

-- ── users.referral_code：每用户的推荐码（8 位大写 base32，应用层生成）──────────
alter table users add column if not exists referral_code text;

-- 唯一索引：码不可撞；NULL 不参与唯一约束，允许大量未领码用户共存
create unique index if not exists uq_users_referral_code on users (referral_code);

-- ── referrals：推荐归因记录 ─────────────────────────────────────────────────
create table if not exists referrals (
  id               bigserial primary key,
  referrer_user_id bigint,
  referred_user_id bigint,
  code             text,
  -- attributed | vested | void
  status           text default 'attributed',
  vested_at        timestamptz,
  -- 兑现证据（如触发 vested 的 milestone id），审计可追溯
  vest_evidence    jsonb,
  created_at       timestamptz not null default now()
);

alter table referrals enable row level security;

-- 一人只能被推荐一次；归因重试（注册流程 fail-open 可能重放）靠它保证幂等
create unique index if not exists uq_referrals_referred_user on referrals (referred_user_id);

-- ── background_checks：工程师背调记录 ───────────────────────────────────────
create table if not exists background_checks (
  id           bigserial primary key,
  talent_id    bigint not null,
  -- manual | checkr
  provider     text default 'manual',
  -- requested | pending | passed | failed
  status       text default 'requested',
  requested_at timestamptz default now(),
  completed_at timestamptz,
  -- passed 后的有效期（应用层写 now()+VALIDITY_DAYS；null=不过期）
  expires_at   timestamptz,
  evidence_url text,
  note         text,
  reviewed_by  text,
  created_at   timestamptz not null default now()
);

alter table background_checks enable row level security;

create index if not exists idx_bgchecks_talent on background_checks (talent_id);
-- 部分唯一索引：同一工程师同一时间只能有一条在途（requested/pending）记录，
-- 挡住"双击/并发请求各插一行"的竞态（应用层原本只有非原子的先查后插）；
-- 覆盖面已含旧 idx_bgchecks_requested 的用途（admin 待办队列扫描），故不再单独保留。
create unique index if not exists uq_bgchecks_talent_inflight on background_checks (talent_id) where status in ('requested', 'pending');

-- ── talent_pools：雇主的认证人才池 ──────────────────────────────────────────
create table if not exists talent_pools (
  id          bigserial primary key,
  employer_id bigint not null,
  name        text not null,
  -- 圈选条件：{tracks:[], min_level, min_tal_score, regions:[]}，应用层 zod 校验
  criteria    jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table talent_pools enable row level security;

create index if not exists idx_talent_pools_employer on talent_pools (employer_id);

-- ── talent_pool_members：池成员 ─────────────────────────────────────────────
create table if not exists talent_pool_members (
  id        bigserial primary key,
  pool_id   bigint not null,
  talent_id bigint not null,
  -- 加入时快照：{tal_score, certs, added_reason}，池内展示不随后续变动漂移
  snapshot  jsonb,
  added_at  timestamptz default now()
);

alter table talent_pool_members enable row level security;

-- 同一池内同一工程师只能有一行，重复加入靠它幂等
create unique index if not exists uq_pool_members_pool_talent on talent_pool_members (pool_id, talent_id);

-- ── ai_improvement_reports：AI 周度自优化报告（人审闭环）────────────────────
create table if not exists ai_improvement_reports (
  id             bigserial primary key,
  period_start   date,
  period_end     date,
  -- 周期内 ai_events 聚合统计（计数/错误率/工具排行）
  stats          jsonb,
  -- Gemini 起草的改进假设 [{title, evidence, proposed_change, risk}]
  hypotheses     jsonb,
  -- 生成本报告所用提示词版本（src/config/prompts.js 的 AGENT_PROMPT_VERSION）
  prompt_version text,
  -- draft | reviewed | dismissed
  status         text default 'draft',
  reviewed_by    text,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

alter table ai_improvement_reports enable row level security;

create index if not exists idx_ai_reports_created on ai_improvement_reports (created_at desc);
