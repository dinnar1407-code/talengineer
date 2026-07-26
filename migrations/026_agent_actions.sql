-- 026: agent_actions —— Agent 工具调用审计表（Wave B / B1）
-- 背景：ChatBot 现在只有 1 个写工具（create_demand_draft，且只写 draft）。要把工具面
-- 从 10 个扩到覆盖全站，写权限是绕不开的一步——而**没有审计就不能给写权限**：出了事
-- 分不清是模型干的、外部 MCP agent 干的、还是用户自己在 UI 点的。本表就是那张入场券。
--
-- 记账纪律（见 src/tools/registry.js）：**本表只记写操作**（tier='write'/'confirm'）。
-- 读工具不入本表——它们没有副作用，而且 ai_events 已经逐次记录了每个 tool_call 埋点；
-- 把 6 个读工具也灌进来只会把表撑大 10 倍，冲淡真正要查的那几行。
--
-- 写操作走 **write-ahead**：先插 status='pending' 行，**插不进去就直接拒绝执行**；
-- 执行完再 update 成 ok/error。顺序反过来（先执行后记账）就会出现"做了但没记上"，
-- 那样这张表就不能作为追责依据了——审计的价值全在于它没有缺口。
--
-- 近重复防护：写工具执行前查最近 N 秒内同 (user_id, tool, args_hash) 且 ok 的行，
-- 命中则直接返回上次结果不重复执行。防的是 agent 循环把同一个动作重试两遍
-- （不是严格幂等键——用户过一会儿故意再做一次同样的事，应该被允许）。
--
-- 应用方式：与其他迁移一致，经授权后在 Supabase 生产执行（本文件先入库存档，不动生产）。
-- 全部语句幂等，可安全重放。019+ 惯例：BIGSERIAL/BIGINT、不加 FK 约束（关联在应用层）、
-- enable row level security 零 policy（deny-all，所有访问经服务端 service_role）。

create table if not exists agent_actions (
  id           bigserial primary key,
  user_id      bigint,                     -- → users.id；公开只读工具可为 null（未登录也能聊）
  role         text        not null,       -- 调用时的角色快照：public/employer/engineer/admin
  tool         text        not null,
  tier         text        not null,       -- read | write | confirm（与 registry 的 tier 同源）
  args         jsonb,                      -- 工具入参（G1 保证其中永不含身份字段）；过大时应用层截断
  args_hash    text,                       -- sha256(canonical(args))，近重复防护用
  status       text        not null,       -- pending | ok | error
  error        text,                       -- 失败原因（给人看的文案，不含内部细节）
  confirmed    boolean     not null default false, -- 是否经过用户点确认（tier='confirm' 的必为 true）
  source       text        not null default 'agent', -- agent（站内 ChatBot）| mcp（外部 API key）
  ip           text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- 按人查："这个用户的 agent 都做过什么"——出事时的第一条查询路径
create index if not exists idx_agent_actions_user on agent_actions (user_id, created_at desc);

-- 按工具查："apply_to_demand 这个工具最近被调了多少次"——用量与异常检测
create index if not exists idx_agent_actions_tool on agent_actions (tool, created_at desc);

-- 近重复防护的查询路径：同人 + 同工具 + 同参数，取最近若干秒
create index if not exists idx_agent_actions_dedupe
  on agent_actions (user_id, tool, args_hash, created_at desc);

alter table agent_actions enable row level security;
