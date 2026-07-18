# PMF × P2 × 增长 三轨实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已批准规格（../specs/2026-07-17-pmf-p2-growth-design.md）一次交付 PMF 撮合工具与物料、P2 全部工程项、增长内容引擎。

**Architecture:** 主会话先落"脚手架提交"（依赖+迁移 020+路由 stub+挂载），随后 6 个 agent 按互斥文件所有权并行填充；钱路径（fee_pct/payout provider/webhook 触发）由主会话亲改并补测试；最后统一集成验收（npm test ≥129 全绿 + next build）→ 提交部署。

**Tech Stack:** Node/Express + Next.js pages + Supabase + Stripe；新增依赖 web-push、marked、sharp(dev)。

---

## Task 0（主会话）：脚手架提交 —— 其他一切的前置

**Files:** Create `migrations/020_pmf_p2_growth.sql`、`src/routes/pipeline.js`(stub)、`src/routes/push.js`(stub)、`src/routes/entV1.js`(stub)；Modify `src/app.js`(挂载×3)、`package.json`(依赖)

- [ ] Step 1: `npm install web-push marked && npm install -D sharp`
- [ ] Step 2: 写迁移 020（下方 SQL 全文）并经 Supabase MCP 应用生产（设计已获 Terry 放行），SELECT 验证新表/列存在
- [ ] Step 3: 三个 stub 路由（`const router=require('express').Router(); module.exports=router;` + 一行注释注明归属 agent）+ app.js 挂载 `/api/pipeline`、`/api/push`、`/api/v1/ent`
- [ ] Step 4: `npm test`（129 全绿）+ `npx next build` 通过 → commit "scaffold: 三轨脚手架（deps+迁移020+路由stub）"

```sql
-- migrations/020_pmf_p2_growth.sql（迁移应用以此为准）
CREATE TABLE IF NOT EXISTS public.matchmaking_pipeline (
  id BIGSERIAL PRIMARY KEY,
  line TEXT NOT NULL DEFAULT 'cn',            -- cn=中国雇主线 us=美国本土线
  company TEXT NOT NULL,
  contact TEXT,
  stage TEXT NOT NULL DEFAULT 'lead',         -- lead|contacted|interested|scoped|matched|quoted|signed|delivered|lost
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
  status TEXT NOT NULL DEFAULT 'pending',     -- pending|paid|void
  evidence_url TEXT,
  note TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.manual_payouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score INT;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score_breakdown JSONB;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS tal_score_updated_at TIMESTAMPTZ;
ALTER TABLE public.talents  ADD COLUMN IF NOT EXISTS payout_provider TEXT NOT NULL DEFAULT 'stripe'; -- stripe|manual|payoneer
ALTER TABLE public.demands  ADD COLUMN IF NOT EXISTS auto_dispatch JSONB;
ALTER TABLE public.demands  ADD COLUMN IF NOT EXISTS fee_pct NUMERIC;      -- 空=全局 PLATFORM_FEE；0<=x<1
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
```

## Task 1（主会话）：钱路径 —— fee_pct + payout provider + 触发点

**Files:** Modify `src/config/fees.js`、`src/routes/payment.js`、`src/routes/workorder.js`、`src/routes/disputes.js`；Create `src/services/payout/index.js`、`src/services/payout/manual.js`、`src/services/payout/payoneer.js`；Test `tests/feeFor.test.js`、`tests/payoutProvider.test.js`

- [ ] Step 1: fees.js 增加并导出 `feeFor(demand)`：

```js
// 单需求费率覆盖：founding 客户可设 demands.fee_pct（0<=x<1），空/非法回退全局 PLATFORM_FEE
function feeFor(demand) {
  const v = demand ? parseFloat(demand.fee_pct) : NaN;
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : PLATFORM_FEE;
}
```

- [ ] Step 2: `tests/feeFor.test.js`（node:test）：null demand→0.15；fee_pct 0.05→0.05；0→0；1/负数/'abc'→0.15。先跑 FAIL 再实现再 PASS
- [ ] Step 3: payout provider 抽象 `src/services/payout/index.js`：

```js
// 统一放款出口。stripe=现行 transfers.create；manual=登记 manual_payouts 待线下打款；payoneer=未配置即抛错。
// 返回 { transferId|null, manualPayoutId|null }。调用方负责状态机与回滚（语义与现行 transfer 一致：抛错=未放款成功）。
async function sendPayout({ supabase, stripe, talent, milestone, amount, description, metadata, idempotencyKey }) {
  const provider = talent?.payout_provider || 'stripe';
  if (provider === 'manual') {
    const { data, error } = await supabase.from('manual_payouts').insert({
      milestone_id: milestone.id, talent_id: talent.id, amount, note: description, status: 'pending',
    }).select('id').single();
    if (error) throw error;
    return { transferId: null, manualPayoutId: data.id };
  }
  if (provider === 'payoneer') throw new Error('Payoneer payout not configured — see docs/payoneer-setup.md');
  if (!talent?.stripe_account_id) return { transferId: null, manualPayoutId: null }; // 与现行"无账户跳过"语义一致
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100), currency: 'usd', destination: talent.stripe_account_id,
    description, metadata,
  }, { idempotencyKey });
  return { transferId: transfer.id, manualPayoutId: null };
}
```

- [ ] Step 4: payment.js release-milestone 与 workorder.js approve：demand 查询补 `fee_pct`，`PLATFORM_FEE` 计算处改 `feeFor(demand)`；transfer 段改调 `sendPayout`（talent 查询补 `payout_provider, id`）；manual 时通知文案注明"线下打款处理中"
- [ ] Step 5: disputes.js resolve：裁决前按 `dispute.demand_id` 查 `demands.fee_pct`，`computeResolutionSplit` 的 `platformFee` 传 `feeFor(demand)`；工程师转账段改调 `sendPayout`（保持原回滚语义）
- [ ] Step 6: `tests/payoutProvider.test.js`：manual→插 manual_payouts 不调 stripe；payoneer→抛错；stripe 无账户→双 null；stripe 有账户→transfers.create 收到正确 cents。沿用 tests/helpers 假 supabase/stripe
- [ ] Step 7: 触发点（契约见 Task 5/6）：payment.js webhook funded 分支、workorder.js approve 成功后各加 `dispatchWebhook` 与 `recomputeTalScore`（fire-and-forget，try/catch 包裹，绝不影响主流程）
- [ ] Step 8: `npm test` 全绿 → commit "feat: 单需求费率覆盖 + 放款 provider 抽象（钱路径）"

## Task 2（agent pmf-research，网络调研，非代码）：A1 名单 + A2 物料

**Files:** Create `docs/pmf/leads-cn.md`、`docs/pmf/leads-us.md`、`docs/pmf/outreach-cn.md`、`docs/pmf/outreach-us.md`、`docs/pmf/pricing-onepager.md`

- [ ] 中国线名单 30-50 条：出海制造企业（墨/越/泰建厂公开新闻、园区名录、行业协会），字段：公司/行业/出海目的地/规模线索/联系渠道/依据链接
- [ ] 美国线名单 30-50 条：中小制造商+系统集成商（CSIA 会员名录、Automation World 等行业媒体），同字段
- [ ] 外联物料中英双套：冷邮件×3（首触/跟进/案例）+ 定价一页纸（托管 15%、founding 客户 5%、认证工程师价值主张）
- [ ] 验收：名单每条带依据链接；物料话术与 talengineer.us 现有定位一致

## Task 3（agent pipeline-admin）：A3 看板 + A4 费率入口 + B6 提示卡

**Files:** Modify `src/routes/pipeline.js`(填充)、`src/routes/admin.js`、`pages/admin.jsx`；Create `docs/1099-setup.md`

- [ ] pipeline.js：requireAdmin CRUD——GET /（?stage= 过滤）、POST /（company/line/contact/note）、PUT /:id（stage/note/next_action/next_action_at/demand_id）、DELETE /:id；updated_at 每次更新
- [ ] admin.js：新增 `PUT /admin/demands/:id/fee`（requireAdmin，body {fee_pct}，0<=x<1 校验，null 清除）
- [ ] admin.jsx：新面板「🤝 Pipeline」——按 stage 分组列表、行内推进阶段/编辑备注与下一步、关联 demand_id 后可设 founding 费率（调上面端点）；演示兜底 3 条+🧪徽标（沿用 .demoBadge 规范）；Tax Docs 面板顶部加 1099 提示卡（链接 docs/1099-setup.md 内容要点）
- [ ] docs/1099-setup.md：Stripe Express 税表开通步骤清单（Dashboard→Connect→Tax reporting，平台侧已具备 W-9 采集）
- [ ] 验收：npm test 全绿 + build 过

## Task 4（agent talscore-dispatch）：B1 TalScore + B2 邀请制路由

**Files:** Create `src/services/talScore.js`、`tests/talScore.test.js`；Modify `src/routes/talent.js`、`src/routes/demand.js`、`src/routes/reviews.js`、`src/services/email.js`(新模板 emailAutoInvite)、`pages/talent.jsx`、`pages/engineer/[id].jsx`

- [ ] talScore.js 纯函数（先写失败测试再实现）：

```js
// computeTalScore(inputs) → { score:0-100, tier:'bronze|silver|gold|platinum', breakdown:{...} }
// 权重：AI筛选分25% + 平台认证25%（每方向取最高级 L1=8/L2=16/L3=25，封顶25） + 评分30%（贝叶斯：(avg*n + 3.5*5)/(n+5) 映射0-30） + 可靠性20%（完单数封顶10 + 无纠纷10，纠纷率>10%归0）
// tier：>=85 platinum，>=70 gold，>=55 silver，其余 bronze
```

- [ ] `recomputeTalScore(supabase, talentId)`：聚合真实输入（talents/platform_certifications/engineer_reviews/demands 完单/disputes）→ 写 tal_score/breakdown/updated_at；reviews.js 评价成功后触发（fire-and-forget）
- [ ] talent.js：GET /list 支持 `sort=talscore`；读档案时 updated_at>24h 异步补算；PUBLIC_TALENT_FIELDS 加 tal_score
- [ ] demand.js：submit 接受 `auto_dispatch {enabled,min_score,tracks,regions,max_rate,top_n<=5}`（zod 校验）；提交后异步邀请：按规则过滤+matchmaker 打分排序 top_n → createNotification + emailAutoInvite（新模板，语气=邀请申请非指派）→ 邀请名单写回 demand.auto_dispatch.invited；demand.assign 成功后调 `dispatchWebhook(supabase,{userId:demand.employer_id,event:'demand.assigned',payload:{demand_id,engineer_id}})`（契约见 Task 6）
- [ ] talent.jsx 发单表单：折叠"自动邀请"配置；engineer/[id].jsx：TalScore 徽章（四档配色走 token）
- [ ] 验收：tests/talScore.test.js ≥8 用例全绿；npm test + build 过

## Task 5（agent pwa-push）：B3 PWA + Web Push

**Files:** Create `public/sw.js`、`components/PwaSetup.jsx`、`pages/offline.jsx`；Modify `src/routes/push.js`(填充)、`src/services/notificationService.js`、`pages/_app.jsx`、`pages/_document.jsx`(manifest 补链)

- [ ] sw.js：install 预缓存壳（/、/offline、logo、manifest）；fetch 网络优先、失败回退缓存→/offline；版本号常量控缓存更新
- [ ] PwaSetup.jsx：注册 SW、beforeinstallprompt 安装提示条（可关闭、localStorage 记忆）、登录态下请求通知权限并 POST /api/push/subscribe（body=PushSubscription JSON；公钥从 GET /api/push/vapid-key 取）
- [ ] push.js：GET /vapid-key（公开，读 env VAPID_PUBLIC_KEY）；POST /subscribe（requireAuth，upsert by endpoint）；DELETE /subscribe
- [ ] notificationService.js：createNotification 后 fire-and-forget 用 web-push 给该 user_email 全部订阅发 `{title,body,link}`；VAPID env 缺失时静默跳过（console.warn 一次）；410/404 订阅失效即删行
- [ ] Terry 待办（写进最终报告）：`npx web-push generate-vapid-keys` → Railway env VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT(mailto:)
- [ ] 验收：npm test + build 过；SW 语法 node --check

## Task 6（agent ent-api）：B4 企业 API v1 + Webhooks + 开发者文档页

**Files:** Modify `src/routes/entV1.js`(填充)、`src/routes/apikeys.js`、`pages/enterprise.jsx`；Create `src/services/webhookService.js`、`tests/webhookSignature.test.js`、`pages/developers.jsx`

- [ ] entV1.js（全走 requireApiKey，req.apiKeyUserId 即企业身份）：GET /demands（本企业）、POST /demands（zod：title/description/budget/region）、GET /talents（复用 PUBLIC_TALENT_FIELDS 白名单+分页）、GET /demands/:id/milestones（归属校验）
- [ ] webhookService.js 契约（Task 1/4 调用方按此接线）：

```js
// dispatchWebhook(supabase, { userId, event, payload })
// 查 api_keys where user_id=userId and active and webhook_url not null；对每条：
// body = JSON.stringify({ event, payload, timestamp })
// 签名 = HMAC-SHA256(webhook_secret, body) → header 'X-TalEngineer-Signature'
// fetch POST 5s 超时，失败仅 console.warn（fire-and-forget，绝不抛出）
```

- [ ] tests/webhookSignature.test.js：签名可复算验证；secret 缺失不发送；fetch 失败不抛出
- [ ] apikeys.js：`PUT /:id/webhook`（requireAuth 本人 key，body {webhook_url}，写入并生成 webhook_secret=crypto.randomBytes(32).hex，**明文仅本次返回**）；GET / 列表返回 webhook_url（不含 secret）
- [ ] enterprise.jsx：API key 管理区加 webhook 配置；developers.jsx：静态文档页（鉴权方式、端点表、webhook 事件与验签示例代码块，en/zh）
- [ ] 验收：npm test + build 过

## Task 7（agent content-growth）：C1 内容引擎 + C2 SEO + C3 行业落地页

**Files:** Create `lib/playbook.js`、`pages/playbook/index.jsx`、`pages/playbook/[slug].jsx`、`pages/hire/[track].jsx`、`content/playbook/*.md`×10、`scripts/gen-og.js`、`public/og.png`；Modify `pages/sitemap.xml.jsx`、`pages/index.jsx`(仅 Head+Playbook 卡链接)、`pages/talent.jsx`/`pages/rates.jsx`(仅 Head)

- [ ] lib/playbook.js：fs 读 content/playbook/*.md，解析 frontmatter（title/description/date/lang/slug，手写正则，不引 gray-matter），marked 渲染 HTML
- [ ] playbook 列表页（getStaticProps，按 lang 分组）+ 文章页（getStaticPaths/Props，Article JSON-LD，canonical，OG）
- [ ] 文章 10 篇：EN 6 篇（PLC programmer hourly rates 2026 / how to hire a controls engineer / Siemens vs Allen-Bradley talent / SCADA integrator checklist / robot cell commissioning guide / platform certification explained）；中文 4 篇（墨西哥建厂自动化用人指南 / 越南产线迁移工程师怎么找 / 出海工厂远程+驻场混合用人模式 / 托管付款如何降低跨境用人风险）。每篇 ≥800 词、有小标题、结尾 CTA 链 /talent
- [ ] hire/[track].jsx：plc/robotics/vision/electrical 四页（getStaticPaths），en/zh 文案、认证体系说明、费率区间（与 /rates 一致）、CTA、Service JSON-LD、canonical/OG
- [ ] scripts/gen-og.js：sharp 由 SVG 生成 1200×630 public/og.png（深蓝底+Talengineer+口号）；index/talent/rates/playbook/hire 补 canonical+og:image+twitter card；首页 Playbook 资源卡改链真实文章
- [ ] sitemap.xml.jsx：加 /playbook、文章、/hire/* URL
- [ ] 验收：npm test + build 过；`npx next build` 输出含 playbook/hire 静态页

## Task 8（主会话）：集成验收 → 部署 → 收尾

- [ ] 全量 `npm test`（≥129+新增）+ `npx next build`
- [ ] 契约核对：dispatchWebhook/recomputeTalScore 触发点已接（payment/workorder=主会话，demand/reviews=agent）；fee_pct 三处（release/approve/resolve）一致
- [ ] commit + push 部署；线上抽查 /playbook、/developers、/hire/plc、admin pipeline、talent?sort=talscore
- [ ] Obsidian 进度 + 记忆更新；给 Terry 的外部开通清单汇总（VAPID/1099/Payoneer）

## Self-Review 结论

规格逐项对照：A1-A4→Task2/3/1，B1-B7→Task4/5/6/1/3，C1-C3→Task7，横切→Task0/8，无缺口；契约名（feeFor/sendPayout/dispatchWebhook/recomputeTalScore）全文一致；无 TBD/占位。
