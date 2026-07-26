-- 025: auth_identities —— 多 OAuth 通道身份关联表（Wave A / A1）
-- 背景：/api/auth/oauth-token 此前按 email 认人（.eq('email', user.email)）。这在单通道
-- （只有 Google）下能用，一旦开第二个通道（Microsoft/azure）就有两个问题：
--   1. 同一个人在两个 provider 用了不同邮箱 → 被当成两个人，建出两个账号，项目/钱/认证分裂；
--   2. 用户在 provider 侧改了邮箱 → 我方按 email 找不到人，又建一个新账号。
-- 根治：身份的稳定锚点是 (provider, provider_sub)——provider 自己的用户主键，永不变、
-- 不随邮箱变。email 只在【首次关联】时作为线索，把 OAuth 身份挂到已有账号上。
--
-- ⚠️ 按 email 关联已有账号只在 provider 已验证邮箱时才安全（否则是账号接管漏洞：
-- 攻击者在一个不验证邮箱的 IdP 上注册受害者的邮箱即可登入受害者账号）。Google 与
-- Microsoft 均验证邮箱，且路由层额外强制 email_confirmed_at 存在才允许关联，见 auth.js。
--
-- 应用方式：与其他迁移一致，经授权后在 Supabase 生产执行（本文件先入库存档，不动生产）。
-- 全部语句幂等，可安全重放。019+ 惯例：BIGSERIAL/BIGINT、不加 FK 约束（关联在应用层）、
-- enable row level security 零 policy（deny-all，所有访问经服务端 service_role）。
-- 注意：生产 users.id 为 bigint（023/024 已核实；models/schema.sql 的 UUID 记载过时不可信）。

create table if not exists auth_identities (
  id             bigserial primary key,
  user_id        bigint      not null,          -- → users.id（应用层关联，无 FK 约束，同 019+ 惯例）
  provider       text        not null,          -- 'google' | 'azure'（Supabase 里 Microsoft 叫 azure）
  provider_sub   text        not null,          -- provider 侧的稳定用户主键（OIDC sub），认人的真正锚点
  email_at_link  text,                          -- 关联当时的邮箱快照，仅供排查（绝不用它认人）
  created_at     timestamptz not null default now()
);

-- 认人的唯一锚点：同一个 provider 的同一个 sub 只能指向一个账号。
-- 也是并发登录的护栏——两个请求同时首登时，后到的那个撞唯一键，路由层捕获后改走查询分支。
create unique index if not exists uq_auth_identities_provider_sub
  on auth_identities (provider, provider_sub);

-- 同一账号在同一 provider 下只应有一条身份（防重复关联把一个人挂成多条）
create unique index if not exists uq_auth_identities_user_provider
  on auth_identities (user_id, provider);

-- 反查某账号绑了哪些通道（账号设置页 / 排查用）
create index if not exists idx_auth_identities_user on auth_identities (user_id);

alter table auth_identities enable row level security;
