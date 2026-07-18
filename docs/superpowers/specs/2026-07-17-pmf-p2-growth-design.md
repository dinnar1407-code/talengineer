# PMF × P2 × 增长 三轨全量设计（2026-07-17，Terry 已批准）

定位：美国本土 + 中国雇主↔海外工程师两线并行；PMF 首批 3-5 单两线同时外联。
"完成"定义：需外部账户的项（1099/Payoneer）交付平台侧全量代码 + 开通清单（选项 A）。

## 轨道 A · PMF 撮合实验

- **A1 目标客户名单**（agent 调研，非代码）：中国线=出海制造企业 30-50 条（墨/越/泰建厂新闻、园区名录、行业协会；含目的地/规模/联系渠道线索）；美国线=中小制造商+系统集成商 30-50 条（CSIA 名录、行业媒体）。交付结构化名单文档。
- **A2 外联物料**：中英双套——冷邮件×3（首触/跟进/案例）、定价一页纸、平台介绍。
- **A3 撮合 Pipeline 看板**：admin 新面板；`matchmaking_pipeline` 表（迁移 020）；阶段流 lead→触达→意向→需求确认→匹配→报价→签单→交付；带备注+下一步行动；演示数据兜底（3 条+🧪徽标）。
- **A4 首单让利**：`demands.fee_pct`（空=全局 15%）；放款/纠纷分账读 `demand.fee_pct ?? PLATFORM_FEE`；钱路径改动补单测。

## 轨道 B · P2 工程

- **B1 TalScore**：纯函数 `src/services/talScore.js`；输入=AI 筛选分+平台认证+评分/单量+纠纷率+按时签到率；**惰性+事件触发重算**（完单/评价/纠纷时重算，读时 >24h 补算；不引外部 cron）；存 `talents.tal_score`+`tal_score_breakdown JSONB`；四档徽章 Bronze/Silver/Gold/Platinum；进列表排序与派单条件。
- **B2 自动派单（邀请制路由）**：发需求可选规则（认证方向+最低 TalScore+区域+费率上限）；复用 matchmaker 打分，top-N 自动发站内+邮件**邀请**；指派仍人工。`demands.auto_dispatch JSONB`。不做 FN 式直接指派。
- **B3 PWA 深化**：手写轻量 Service Worker（不用 next-pwa，Turbopack 兼容）；可安装+离线壳+**Web Push**（`push_subscriptions` 表；VAPID 密钥由 Terry 生成入 env；createNotification 同步推送）。
- **B4 企业 API v1**：`/api/v1/ent/*`（读需求/发需求/查工程师/查里程碑，走 requireApiKey）；webhooks（`api_keys.webhook_url`，milestone.funded/released、demand.assigned，HMAC 签名）；开发者文档页 `/developers`。
- **B5 Instant Pay**：finance 页提现卡；查 Stripe Express 即时到账资格并发起（1% 手续费说明）；不合格降级标准到账提示。
- **B6 1099（开通清单层）**：W-9 已有；交付 Stripe Express 税表配置文档 + admin 提示卡 + 开通清单。
- **B7 跨境收款（开通清单层）**：payout provider 抽象（stripe 现有 / manual 人工打款全流程：admin 标记+凭证 / payoneer stub）；`talents.payout_provider`；放款路径按 provider 分发（补测试）；交付 Payoneer 开通清单。
- **不做**：ServiceNow/SAP 集成。

## 轨道 C · 增长

- **C1 内容引擎**：`content/playbook/*.md` 构建时渲染（不入库）；`/playbook` 列表+文章页；首发 10 篇（EN 6 篇美国长尾：费率/雇佣/认证；中文 4 篇出海线：墨/越建厂用人指南）；agent 起草、Terry 可审。
- **C2 SEO 补全**：全站 canonical、OG/Twitter 卡（品牌 OG 图）、首页 Playbook 卡链真文章；hreflang 不做（同 URL 客户端切语言）。
- **C3 行业落地页**：4 认证方向 × `/hire/[track]`（长尾 SEO+CTA），模板组件。

## 横切

- **迁移 020**（一次打包，Terry 放行一次）：matchmaking_pipeline、push_subscriptions、talents.tal_score/tal_score_breakdown/payout_provider、demands.auto_dispatch/fee_pct、api_keys.webhook_url。
- **测试**：talScore 纯函数、fee_pct 钱路径、webhook 签名、provider 分发；129 基线只增不减。
- **执行**：多 agent 并行、文件所有权互斥、钱路径主会话亲改；新面板全带演示数据兜底。

## 验收

npm test 全绿（≥129）+ next build 通过 + 迁移 020 生产验证 + 部署后线上抽查（/playbook、/developers、/hire/*、pipeline 面板、TalScore 徽章）。
