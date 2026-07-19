-- 022: newsletter 订阅表（竞对改善 W1-3/W1-4：成本计算器 lead capture + 订阅基建）
-- 应用方式：与其他迁移一致，经授权后在 Supabase 生产执行（本文件先入库存档）。

create table if not exists newsletter_subscribers (
  id              bigserial primary key,
  email           text not null unique,
  -- 订阅来源：calculator（成本计算器）| playbook（文末）| footer（页脚）
  source          text,
  -- 订阅时的界面语言（用于将来分语言发信）
  lang            text,
  created_at      timestamptz not null default now(),
  -- 退订时间：非空即视为已退订（软删除，保留记录防重复订阅打扰）
  unsubscribed_at timestamptz
);

-- RLS 开启且不建任何 policy = 默认拒绝所有 anon/authenticated 直连访问；
-- 读写只经服务端 service key（src/routes/newsletter.js），与全库 RLS deny-all 纪律一致。
alter table newsletter_subscribers enable row level security;

-- 按来源统计订阅转化用
create index if not exists idx_newsletter_source on newsletter_subscribers (source);
