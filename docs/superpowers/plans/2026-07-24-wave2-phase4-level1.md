# Wave 2 × Phase 4 × Level 1 脚手架 执行计划（2026-07-24）

> **来源规格**：Obsidian `10-OPC/03-Talengineer/竞对深度调研-官网情报与改善计划-2026-07-18.md`（Wave 2 七项）+ `AI-Native改造方案-方法论与计划-2026-07-18.md`（Phase 4 / Level 1）。
> **执行口径**（Terry 已授权开工）：原方案把这些排在"PMF 验证后"，本工程**只建基础设施与产品功能**，凡依赖真实数据的对外展示一律诚实空态/实时真数，不编造统计；Level 1 只建脚手架（版本化+人审+熔断文档），无任何自主行为；保险（W2-6）按原方案就是探索，只出调研文档。
> **部署纪律**：全部本地提交；收官统一请求 Terry 授权 push（=Railway 自动部署）+ 迁移 024 上生产。迁移文件先入库存档，不动生产。

## 硬性红线（沿用融合工程 + 本批新增）

- **钱路径零改动**：`src/routes/payment.js`、`src/routes/workorder.js`、`src/routes/disputes.js`、`src/services/payout/index.js`、`src/config/fees.js` 五文件本工程不许碰。referral 兑现用**读侧懒评估**（见 F2），不挂 milestone 释放钩子。
- **G1-G5 照旧**：工具注册表本批**零新增工具**（agentGuardrails 的 10 工具计数断言不动）；ai_events 只存哈希+120 字摘要；Agent 无外发。
- **数字纪律**：referral 奖励金额、背调价格是 Terry 未拍板的新数字——**一律不对外展示具体金额**；config 里留 null/0 占位并注释"待 Terry 定价"，前端在未配置时隐藏金额区块。已有数字（费率/TalScore 档位/认证等级）继续单一来源自 fees.js / talScore.js / training.js。
- **诚实空态**：覆盖地图、月报全部用实时真实聚合数据（哪怕数字很小），配 founding cohort 叙事；白皮书/月报正文标注「AI 起草待 Terry 终审」，不发布即不承诺。
- **PII 白名单**：talents 永不 select('*') 对外；新聚合端点只出聚合数。demands 公开 GET 有 select('*') 陷阱——新增 demands 敏感列（本批没有）必须同步 strip。
- **DB 约定**：migration 024 幂等（IF NOT EXISTS/ON CONFLICT）、小写 SQL、每表 `enable row level security` 零 policy（deny-all）、BIGSERIAL/BIGINT（users.id 生产是 bigint，docs/schema.sql 已过时不可信）、019+ 惯例不加 FK 约束、中文头注释。
- **错误形状**：成功 `{status:'ok', data}`；失败 console.error('[tag]', err) + 通用文案；副作用 fire-and-forget。
- **前端约定**：页面 = hire/[track].jsx 模板（useLang + en/zh 内联 dict + canonical/OG + JSON-LD + module.css 全用 var(--token)）；SSR 首帧必须是合法英文（useLang 客户端才生效）；admin 面板走 authHeaders() 双通道。
- **测试约定**：node:test + node:assert/strict；supabaseChainMock.js（不是旧版 supabaseMock）；require.cache 预注入照 mockPayDeps 模式；文件 tests/<subject>.test.js；中文头注释。跑完 `npm test` 必须全绿（现 242），`next build` 必须过。

## 分工（文件所有权互斥）

### M — 迁移 + 计划入库（先行，单 agent）
`migrations/024_wave2.sql`：
- `users.referral_code text`（唯一索引 uq_users_referral_code，NULL 允许多个）
- `referrals`：id bigserial PK, referrer_user_id bigint, referred_user_id bigint, code text, status text default 'attributed'（-- attributed|vested|void）, vested_at timestamptz, vest_evidence jsonb, created_at；**uq(referred_user_id)**（一人只能被推荐一次，归因重试幂等）
- `background_checks`：id bigserial PK, talent_id bigint not null, provider text default 'manual'（-- manual|checkr）, status text default 'requested'（-- requested|pending|passed|failed）, requested_at timestamptz default now(), completed_at, expires_at, evidence_url text, note text, reviewed_by text, created_at；idx(talent_id), partial idx(status='requested')
- `talent_pools`：id bigserial PK, employer_id bigint not null, name text not null, criteria jsonb default '{}', created_at, updated_at；idx(employer_id)
- `talent_pool_members`：id bigserial PK, pool_id bigint not null, talent_id bigint not null, snapshot jsonb, added_at timestamptz default now()；uq(pool_id, talent_id)
- `ai_improvement_reports`：id bigserial PK, period_start date, period_end date, stats jsonb, hypotheses jsonb, prompt_version text, status text default 'draft'（-- draft|reviewed|dismissed）, reviewed_by text, reviewed_at, created_at；idx(created_at desc)

### F1 — 覆盖地图（W2-1）
**own**：`src/routes/coverage.js`（新，挂 /api/coverage）、`pages/coverage.jsx` + `coverage.module.css`、`tests/coverage.test.js`
- GET /api/coverage/summary（公开，无参）：从 talents（region, tal_score, availability）+ platform_certifications（valid=非 revoked 且未过期，复用 certService.getValidCertifications 的口径但需批量版：直接一次查询在 JS 里过滤）聚合出 `{regions:[{region, engineers, certified, tiers:{platinum,gold,silver,bronze,unrated}, tracks:{plc:{count,max_level},...}}], totals:{engineers, certified, tracks:{...}}}`。region 归一：trim，空→'Other'。tier 用 talScore.tierFor（不重复硬编码 85/70/55），**但 tal_score 为 NULL/0 的工程师必须单列 `unrated`，绝不落进 bronze**（tierFor(null) 会静默返回 bronze——那是"未评分"不是"低质量"，公开页显示成 bronze 就是造假）。5 分钟模块级 TTL 缓存（照 benchmarkCache 模式）。只出聚合数，零 PII。
- 页面：en/zh，hero + region 卡片网格（每卡：工程师数/认证数/档位分布条/方向徽章）+ 方向汇总条 + founding 叙事段（数字小是事实，文案：real-time, founding cohort）。Dataset JSON-LD 指向 /api/coverage/summary（照 rates.jsx）。空态（0 工程师的 region 不渲染；全空显示 founding 文案）。

### F2 — Referral（W2-4）
**own**：`src/config/referral.js`、`src/services/referralService.js`、`src/routes/referral.js`（挂 /api/referral）、`src/routes/auth.js`（本批唯一属主）、`pages/referral.jsx` + `referral.module.css`、`tests/referral.test.js`
- config：`REFERRAL_ENABLED`（env，默认 false）、奖励金额占位 null（注释：待 Terry 定价，null=前端隐藏金额）、`VESTING_RULE='first_released_milestone'` 常量注释。
- 归因：registerSchema 加 `referral_code`（可选，zod 会静默丢弃未声明字段，必须显式加）；注册成功后 fail-open 归因（查 users.referral_code 找 referrer；自荐拦截 referrer.id !== 新用户 id 且 email 不同；任何失败不阻断注册）。**OAuth 分支同样处理**（/oauth-token 新建用户处，front 端暂无入口传 code，后端先支持 body.referral_code）。
- 码生成：getOrCreateCode(userId)：8 位大写 base32 随机，冲突重试 3 次，写 users.referral_code。
- 懒兑现 evaluateVesting：referred 用户任一 project_milestones status='released'（employer 侧：demand.employer_id=referred；engineer 侧：milestone.demand_id → demands.assigned_engineer_id → talents.id 且 talents.user_id=referred，多次查询组装，别指望 FK embedding）→ status='vested' + vested_at + vest_evidence（milestone id）。**⚠️ demands.assigned_engineer_id 列真实存在**（migration 012 建、014 加索引）——ownership.js:6 和 workorder.js:295 的「没有该列」注释是**过时的**，不要信。**批量评估**：收集全部 attributed 的 referred ids，一次 .in() 查 milestones/demands，禁止每人一查的 N+1；vest 更新必须条件更新 `.eq('status','attributed')` 保幂等/防并发。在 GET /api/referral/me 和 admin 列表加载时触发（读侧，不碰钱路径）。
- 路由：GET /api/referral/me（requireAuth：我的码+我推荐的人+状态）；GET /api/referral/config（公开：enabled + 文案开关用）；GET /api/referral/admin-list（requireAdmin，clampPagination 分页）。admin 面板在集成批做。
- 页面 /referral：en/zh。enabled=false 时：说明计划即将上线+登录可先领码（归因从今天就算数）；enabled=true 时也**不显示金额**（config 为 null 就隐藏），显示规则文案。登录态读 localStorage 'tal_user' token 拉 /me 显示码+推荐列表。
- 测试：schema 归因字段、码生成冲突重试、evaluateVesting 判定矩阵（employer/engineer/未达/幂等）、自荐拦截——全走 supabaseChainMock。

### F3 — 企业认证人才池（W2-3）
**own**：`src/routes/pools.js`（挂 /api/pools）、`src/routes/entV1.js`（本批唯一属主）、`pages/pools.jsx` + `pools.module.css`、`tests/pools.test.js`
- criteria zod .strip()：`{tracks:string[]<=4（cert track_key）, min_level:1-3, min_tal_score:0-100, regions:string[]<=10}`，全可选。
- 路由（requireAuth，行级属主 employer_id===req.user.userId，非属主 404 防枚举）：POST /api/pools；GET /api/pools（我的，带 member_count）；GET /api/pools/:id（含 members，成员数据走 PUBLIC_TALENT_FIELDS 白名单 join——批量 .in()）；PUT /api/pools/:id（改名/改 criteria）；DELETE；POST /:id/members {talent_id}（校验 talent 满足 criteria 的 tracks/min_level：有效证书批量查；snapshot 存 {tal_score, certs, added_reason:'manual'}）；DELETE /:id/members/:talentId。
- GET /api/pools/:id/candidates：按 criteria 筛 talents，PUBLIC_TALENT_FIELDS，limit 30，排序 tal_score desc nullsFirst:false。**证书过滤照 talent.js /list 的 certs 富化批量模式**（一次 .in('talent_id', ids) join cert_tracks，JS 里过滤 revoked/过期）——**不要照 runAutoInvite**（它就是 N+1 反面教材，且其 .or(region.ilike) 会被逗号/括号注入破坏 PostgREST DSL）。**criteria.regions 是雇主可控 JSON，禁止拼进 .or()/.ilike 表达式**——先按 min_tal_score 有界取数（limit 数百），region 匹配在 JS 里做 substring 过滤。
- entV1 加只读：GET /api/v1/ent/pools、GET /api/v1/ent/pools/:id（requireApiKey，employer_id=req.apiKeyUserId，PII 白名单，anti-enum 404）。
- 页面 /pools：ConsoleShell（employer 视角），en/zh：池列表+新建表单（criteria 选择器：方向 chips/等级/最低分/region）+池详情（criteria 摘要、候选预览（TalScoreBadge+认证徽章）、成员表、加/移成员）。未登录跳 /onboarding。
- 测试：criteria schema、属主 404、candidates 过滤逻辑（chainMock 预置 talents+certs）、成员加入校验。

### F4 — 背调（W2-5）
**own**：`src/config/bgcheck.js`、`src/services/bgcheckService.js`、`src/routes/bgcheck.js`（挂 /api/bgcheck）、`src/routes/talent.js`（本批唯一属主）、`pages/talent.jsx`（本批唯一属主）、`tests/bgcheck.test.js`
- config：`VALIDITY_DAYS=365`、`PROVIDERS=['manual','checkr']`、`DEFAULT_PROVIDER='manual'`、价格占位 null（待 Terry 定价+开 Checkr 账号，注释）。
- service：requestCheck(talentId)（已有 requested/pending 或有效 passed 则幂等返回现状）；provider 抽象照 payout/index.js：manual=建行等 admin 复核；checkr=throw 'not configured'（stub 注释接入点）；isValid(check)=passed && (expires_at null || 未过期)；batchStatus(talentIds)→Map（批量 .in()，给 list 富化用）。
- 路由：POST /api/bgcheck/request（requireAuth；**talent_id 一律服务端从 req.user.userId → talents.user_id 反查，绝不收 body 里的 talent_id**——否则就是替别人发起背调的 IDOR；无 talents 行照 /apply 的 404 模式）；GET /api/bgcheck/me；admin：GET /api/bgcheck/admin-list?status=（clampPagination）、PUT /api/bgcheck/admin/:id {decision:'passed'|'failed', evidence_url?, note?}（requireAdmin + 写 admin_audit_logs——照 admin.js KYC 复核的 auditLog 机制，不可导出则同型落一行审计）；passed 设 completed_at+expires_at=now+VALIDITY_DAYS。
- talent.js：/list 富化加 `bg_checked:boolean`（best-effort try/catch，失败静默省略，禁 N+1）；新 query 参数 `bg_checked=true` 过滤（先查有效 check 的 talent_id 集合再 .in()——注意与分页共存：过滤在 DB 侧 .in() 完成）。
- pages/talent.jsx：卡片加 🛡️ 徽章（bg_checked===true 才渲染，双主题 rgba 底色照 TalScoreBadge 手法）+ 筛选行加「已背调」checkbox（en/zh dict）。
- 测试：requestCheck 幂等、isValid 过期矩阵、admin decision 生命周期（chainMock）、list 过滤参数拼装。

### F5 — Phase 4 闭环 + Level 1 脚手架
**own**：`src/config/prompts.js`（新）、`src/services/agentService.js`（本批唯一属主）、`src/services/aiAnalysisService.js`、`src/routes/aiops.js`（挂 /api/aiops）、`.github/workflows/ai-weekly.yml`、`docs/ai/level1-charter.md`、`tests/aiAnalysis.test.js`
- **G4 版本化**：buildSystemPrompt 的提示词模板整体搬进 src/config/prompts.js，导出 `AGENT_PROMPT_VERSION`（'2026-07-24.1'）+ `buildSystemPrompt`；文件头开版本变更日志注释块。agentService 改为 import（行为零变化——现有 agentGuardrails/agent 相关测试必须原样全绿）。aiService 的内联 prompt 本批不搬（登记在 charter 的后续清单里）。
- **采纳率信号：本批明确砍掉（critic 裁定）**。原因：ChatBot「确认发布」打的是通用 /api/demand/submit（pages/talent.jsx 和人工发单也走它），在那里挂 userAccepted:true 会把非 AI 发单计入分子；且 publishDraft 是全新 body 新建 demand、parse_demand 草稿无 id、ai_events 无关联列——分子分母不同源，算出来的采纳率就是假数字（违反数字纪律）。**demand.js 本批零改动，agentService 不发 suggestion 事件**。charter 里登记为待办：等 draft→publish 携带真实关联 id 后再启。
- **周分析**：aiAnalysisService：`computeAiStats(rows)` 纯函数（按 decision_type/outcome/tool 计数、错误率、工具排行——只基于现存的 intent_parse/tool_call/success/error 事件；'refused'/'escalation'/'suggestion' 等未来枚举容忍但不专门呈现）；`runWeekly({supabase, callModel})`：取 7 天 ai_events（idx 已有）→ stats → callGemini（prompt 进 prompts.js，版本化；JSON 模式用既有 'Output EXACTLY this JSON structure' 咒语）产出 hypotheses[{title, evidence, proposed_change, risk}] → insert ai_improvement_reports（prompt_version 记当前版本）。Gemini 失败不炸：hypotheses=[] + stats 照存。
- 路由 aiops.js：POST /api/aiops/run-weekly——鉴权 `Authorization: Bearer ${process.env.AIOPS_CRON_SECRET}`，env 未设→503 fail-closed（照 webhook 纪律），**比对用 crypto.timingSafeEqual**（照 newsletter.js verifySig，不许 ===）；GET /api/aiops/reports（requireAdmin，clampPagination）；PUT /api/aiops/reports/:id {status:'reviewed'|'dismissed'}（requireAdmin + admin_audit_logs 审计行）。
- workflow ai-weekly.yml：cron 周一 03:47 UTC，curl -X POST 带 GH secret AIOPS_CRON_SECRET，重试 3 次（照 keepalive.yml）。Terry 外部待办：GH secret + Railway env 各设一份。
- **Level 1 charter**（docs/ai/level1-charter.md）：照抄方法论四条硬护栏（跑满一季度、只改 Level 0 配置、永远人审、连续 3 轮无产出即停）+ 当前状态（Level 0 起算 2026-07-19，最早评估 2026-10-19）+ prompt 版本化清单（已搬/待搬）+ 「本仓库不存在任何自主改配置代码路径」声明。
- 测试：computeAiStats 矩阵（空/单类/混合/未知枚举容忍）、run-weekly 鉴权（无 secret 503/错 secret 401/对 secret 走通——chainMock+假 callModel）、prompts.js 导出形状 + agentService 行为不回归（现有测试即回归网）。

### F6 — 白皮书门控 + 月报引擎（W2-7 + W2-2）
**own**：`content/whitepaper/`（en.md/zh.md）、`lib/whitepaper.js`、`lib/playbook.js`（本批唯一属主）、`pages/whitepaper.jsx` + `whitepaper.module.css`、`src/routes/newsletter.js` + `tests/newsletter.test.js`（本批唯一属主）、`scripts/gen-market-report.js`、`docs/runbooks/monthly-report.md`、`content/playbook/market-report-2026-07-en.md` + `-zh.md`
- **终审前不得公开（critic 裁定的红线修正）**：
  - lib/playbook.js 加 `draft` frontmatter 字段解析；`getAllPlaybookMeta()` 和 `getAllPlaybookSlugs()` **默认过滤 draft:true**（否则月报一落盘就被 /playbook 索引页+sitemap 自动收录公开）。月报双语 md 全带 `draft: true`，Terry 终审后翻 false 即发布。
  - /whitepaper 页 Head 加 `<meta name="robots" content="noindex">`（草稿期），**本批不进 sitemap/llms.txt**；终审通过后的放行动作（去 noindex+进 sitemap/llms）登记在收官报告的 Terry 待办里。
- newsletter：subscribeSchema source 枚举加 'whitepaper'（+ 测试同步）。
- 白皮书《中国制造出海：海外建厂用人白皮书》草稿 en/zh：素材=lib/regionGuides.js 三国指南真实内容+平台方法论（认证/托管/TalScore），**不编造行业统计**，引用外部数据必须带出处否则不写；顶部显著标注「Draft — AI 起草，待 Terry 终审后才可对外」。
- lib/whitepaper.js：照 lib/playbook.js 的 frontmatter 解析复用（直接 import 其函数或同型实现，build-time only）。
- 页面 /whitepaper：en/zh；hero+目录预览+邮箱门（leadState 状态机照 calculator，source:'whitepaper'）→ 提交成功即解锁全文渲染（诚实软门：全文在静态 HTML 源码里本来就有，这只是 lead capture 不是访问控制，文案不得暗示更强的保护；不谎称"已发邮件"——就说"输入邮箱解锁全文"）。Article JSON-LD。
- 月报：scripts/gen-market-report.js（node 内置 fetch）：拉生产 https://talengineer.us/api/talent/rate-benchmarks（现在就活）+ /api/coverage/summary（404 则该节跳过并标注）→ 生成 content/playbook/market-report-{YYYY-MM}-{en,zh}.md（type: market-data，`draft: true`，正文=数据快照表+方法论说明+founding 叙事；顶部「AI 起草待终审」）。**本批实际跑一次**产出 2026-07 首期双语草稿（真数据）。runbook 写清月度流程：跑脚本→Terry 终审→draft 翻 false→commit→部署即发布。
- 测试：newsletter 枚举更新；lib/playbook draft 过滤（新 tests 或并入现有）；whitepaper loader 形状（如与 playbook 共享实现则薄测）。

### F7 — 保险代购探索（W2-6，纯研究，无代码）
**own**：`docs/research/2026-07-24-insurance-gl-exploration.md` + Obsidian 副本
- 调研：美国现场工业服务的 GL/professional liability 按单/短期模式（Thimble、NEXT、Coverdash 类）、Field Nation/WorkMarket 对承包商保险的要求与变现方式、COI 验证惯例；结合 TalEngineer 现状（/trust 已有 COI/KYC 叙事）出：可行模式对比、启动门槛（现场单量）、推荐路线与触发条件。全部带来源 URL；查不实的不写。

### I — 集成收口（F1-F6 之后，单 agent）
**own**：`src/app.js`、`pages/admin.jsx`、`pages/sitemap.xml.jsx`、`public/llms.txt`、`pages/index.jsx`（footer）
- app.js 挂载：/api/coverage、/api/referral、/api/pools、/api/bgcheck、/api/aiops（5 个，一个都不能漏——漏了就是静默 404）。
- admin.jsx 三新 tab（照 TABS/loadX/conditional 模式 + authHeaders()）：🤝 Referral（admin-list + 触发懒兑现的刷新）、🛡️ BG Checks（requested 队列 + passed/failed 决定 + evidence/note）、🧠 AI Weekly（reports 列表 + stats 摘要 + hypotheses 卡 + reviewed/dismissed）。en/zh dict 增量。
- sitemap staticPages 加 /coverage /referral（**/whitepaper 草稿期不进**）；llms.txt 手工加 coverage/referral 两页+能力描述（pools 是登录态、whitepaper 待终审，都不进）。
- index.jsx footer 对应列加链接（注意 6 轨网格折行——上批刚修过，加链接进既有列不动列数）。

### V — 验证与审查（收官）
1. `npm test` 全绿（242+新增）+ `next build` 通过。
2. **挂载断言**：grep 确认 app.js 五个新 app.use 全在 + 五个路由文件都导出 router（漏挂 = 静默 404）。
3. 对抗审查工作流：安全（新端点鉴权/IDOR/枚举/PII 泄漏——重点 pools 属主、bgcheck admin、aiops secret、referral 归因注入）、正确性（懒兑现幂等、缓存、分页共存、draft 过滤真的挡住了 playbook 索引/sitemap）、回归（agentService 行为、talent.js /list 既有契约、newsletter 既有枚举调用方）。
4. 双主题/双语走查清单（新四页 + admin 三 tab）。
5. 收官报告：Terry 外部待办集中列（migration 024 授权、AIOPS_CRON_SECRET×2、白皮书/月报终审+放行动作、referral 定价、Checkr 账号）。
6. **部署顺序红线（018 教训）：迁移 024 必须先在 Supabase 生产应用并核实（list_migrations），然后才 push 代码**——顺序反了 pools/bgcheck/aiops/referral 全线 500。

## 明确不做（本批边界）
- **采纳率信号（suggestion/user_accepted 闭环）不做**——ChatBot 发布走通用 /submit 无法诚实归因（critic 裁定），等 draft→publish 携带真实关联 id 再启；demand.js 本批零改动。
- 不发任何邮件（newsletter 发送引擎仍不存在——月报/白皮书都是站内+lead capture）。
- 不做真地图组件（region 是自由文本；聚合卡片即 W2-1 的诚实形态）。
- 不接 Checkr 真 API、不接 Stripe 背调收费（webhook 是钱路径，等 Terry 开账号后单独立项）。
- referral 不自动发钱（admin 看板人工处置；金额未定不展示）。
- Level 1 无任何自主执行路径；Phase 4 假设生成永远只进人审看板。
- 工具注册表零新增。
