# AI-Native 改造 × 竞对改善计划 融合执行计划（2026-07-18）

> **来源规格**（均已定稿）：Obsidian `10-OPC/03-Talengineer/AI-Native改造方案-方法论与计划-2026-07-18.md` + `竞对深度调研-官网情报与改善计划-2026-07-18.md`。
> **执行方式**：subagent-driven，文件所有权互斥；迁移与钱路径主会话亲自处理。
> **部署纪律**：全部本地提交，收官统一请求 Terry 授权 push（=Railway 自动部署）+ 迁移上生产。

## 融合逻辑（为什么不按原文档各自阶段走）

1. **Wave 0 的 4 个新页面 = Phase 0 语义层的载体**：新页面出生即带 JSON-LD + 被 llms.txt 收录，一批改动一次部署（两份文档各自都指明了这一点）。
2. **W1-3 成本计算器与 P1 `get_rates` 工具共用数据契约**：都吃 `/api/talent/rate-benchmarks`，Stage 2 先定契约，Stage 3 工具直接复用。
3. **P2 admin copilot 直接服务 PMF 实验**（Terry 查 pipeline 卡单），不算抢优先级。
4. **PMF 不让位**：本工程全程是 B 轨开发，不产生任何需要 Terry 现在介入的事项；Terry 外部待办集中列在文末。

## 硬性红线（先于任何代码）

- **G1 权限**：工具层必须走调用者 JWT + RLS 上下文，禁 service-role 绕过。
- **G2 执行权**：资金/发证/裁决类动作 Agent 仅草稿，人类点击执行。
- **G3 外发**：Agent 无自主外发能力。
- **G4 版本化**：prompt/工具定义/阈值入 git。
- **G5 隐私**：埋点不存用户输入原文（哈希+摘要）。
- **数字纪律**：所有对外展示的数字（费率/题库规模/认证等级/TalScore 构成）单一来源自代码配置（`src/config/fees.js`、`src/config/training.js`、`src/services/talScore.js`），**绝不手编**——FieldEngineer 数字自相矛盾是调研里点名的反面教材。
- **诚实空态**：无真实数据处用 founding cohort 叙事，不编造统计（沿用 Terry 的 demo 数据铁律）。

---

## Stage 1 — 语义 × 展示合并批（Phase 0 + Wave 0，本周级）

| # | 任务 | 文件（所有权互斥） | 要点 |
|---|---|---|---|
| T1 | **/pricing 定价页** | `pages/pricing.jsx` + `pricing.module.css` | FN 双轨模板：工程师侧透明（85% 到手+为什么值）＋雇主侧 founding 方案（前 5 单 5%）＋**风险逆转承诺**（首里程碑不满意全额退款，托管+退款路径已支撑）＋FAQ。en/zh |
| T2 | **/trust 信任中心** | `pages/trust.jsx` + `trust.module.css` | 托管流程图、退款路径、5 天举证纠纷流程、COI/KYC/W-9 核验、GPS 签到+QC 图交付证据链。en/zh |
| T3 | **/talscore 算法公开页** | `pages/talscore.jsx` + `talscore.module.css` | 四维构成+徽章门槛+事件触发重算，PSS 提问式文案（"Did the engineer deliver on time?"）。数字读 `talScore.js`。en/zh |
| T4 | **/certification 认证漏斗页** | `pages/certification.jsx` + `certification.module.css` | 4 方向×L1-L3 矩阵 + 「报名→学习打卡→AI 实测→人工复核→发证」漏斗可视化（Toptal 模式）+ 题库规模（读 `training.js`）。en/zh |
| T5 | **语义层接线** | `public/llms.txt`、`pages/rates.jsx`（Dataset JSON-LD）、`pages/sitemap.xml.jsx`、`pages/index.jsx`（导航/footer 链新页）、OG 图（`scripts/gen-og.js`） | llms.txt：平台定位（双线）+能力清单+入口 URL+定价模式；certification 页带 Course/EducationalOccupationalCredential JSON-LD；4 新页入 sitemap |
| T6 | **外联物料风险逆转** | `docs/pmf/pricing-onepager.md`、`docs/pmf/outreach-*.md` + Obsidian 同步 | 把退款承诺写进话术与定价一页纸（物料同步规矩：源改必同步 Obsidian） |
| T7 | **Automate America 深挖简报** | 无仓库文件（研究任务，产出 Obsidian 简报） | 注册体验/供给规模/费率/信任机制/流量估计；后台 agent 与开发并行 |

**页面模板契约**：照 `pages/hire/[track].jsx` 模式——Navbar + `useLang` + 页内 en/zh UI dict + module.css + canonical/OG + JSON-LD；主题走 globals token（html[data-theme] 双主题必须都测）。

## Stage 2 — 垂直矩阵 × 增长基建批（Wave 1 可建子集）

| # | 任务 | 文件 | 要点 |
|---|---|---|---|
| T8 | **垂直页矩阵** | `pages/hire/[track]/[industry].jsx`（或数据驱动扩展现有 [track].jsx，执行时定） | 方向×行业 8 页：PLC×汽车/半导体/食品饮料/制药；机器人×汽车/3C；视觉×半导体/包装。中国线地域页 3 页（墨西哥/越南/泰国建厂用人指南，en/zh/es） |
| T9 | **内容 taxonomy + 首篇** | `lib/playbook.js`、`content/playbook/*`、taxonomy 文档 | 分类：指南/案例/市场数据/认证解读 × 4 方向 × 雇主/工程师；playbook 加类型标签；新文 1 篇（AI 起草，标注待 Terry 终审）；周更节奏=流程文档，不是本工程交付 |
| T10 | **成本计算器 + newsletter** | `pages/calculator.jsx`、`src/routes/newsletter.js`（新）、`migrations/022_newsletter.sql` | 输入岗位/地区/时长→对比本地雇佣成本（数据=rate-benchmarks，与 P1 get_rates 同契约）；邮箱收完整报告→订阅表；Resend 复用；订阅入口：计算器/playbook 文末/footer |
| T11 | **case-studies 骨架** | `pages/case-studies.jsx` + 案例采集模板（docs/pmf/case-template.md） | 空态=founding cohort 叙事；每单采集字段：行业/痛点/匹配耗时/里程碑/脱敏照片/双方引语授权 |
| T12 | **竞对监控固化** | Obsidian 监控清单 | 季度复查清单（调研附录 URL 全集）+ Automate America/JOINER 每月一瞥 |
| T13 | **语义层增量** | `public/llms.txt`、`pages/sitemap.xml.jsx` | 新增页面入 llms.txt/sitemap |

## Stage 3 — AI-Native 动作层 × 编排层（Phase 1+2+3+4 埋点）

| # | 任务 | 文件 | 要点 |
|---|---|---|---|
| T14 | **内部工具注册表** | `src/tools/`（registry.js + 各工具文件）| 首批 8-10 工具（parse_demand / search_engineers / get_match_recommendations / get_rates / get_certification_info / get_my_projects / get_milestone_status / draft_sow / create_demand_draft），统一签名 + JSON Schema 描述；**G1：走调用者 JWT 上下文**，复用现有路由鉴权中间件逻辑 |
| T15 | **对外 MCP 适配器** | `src/routes/mcp.js`（挂企业 API v1 的 API-key 鉴权上）+ `pages/developers.jsx` 卖点更新 | 只读工具 + create_demand_draft；/developers 新叙事：「第一个 AI Agent 可直接调用的工业自动化人才平台」 |
| T16 | **ChatBot → Agent** | `components/ChatBot.jsx`、`src/routes/`（agent 端点）、`src/services/agentService.js`（新） | Gemini function calling 调度 T14 工具；三侧场景（雇主自然语言发单→草稿+候选→UI 确认发布；工程师找单；admin 运营 copilot）；**G2/G3 红线写死**；对话入库 |
| T17 | **ai_memory** | `migrations/023_ai_native.sql`（与 T18 同批） | user_id 主键 + profile jsonb；RLS 本人可读；Agent 注入上下文 |
| T18 | **ai_events 埋点** | 同 023 | decision_type/tool_called/input_hash/outcome/user_accepted；G5 不存原文 |

## 不做（本工程边界）

Wave 2 全部（覆盖地图/行业月报/人才池/referral/背调/保险/白皮书）；Phase 4 闭环与 Level 1；G2/Trustpilot/Clutch 注册（Terry 外部动作）；周更文章的长期执行（只交 taxonomy+首篇+流程）。

## Terry 外部待办（收官时集中提醒，不阻塞开发）

G2/Trustpilot/Clutch 商家注册占位；VAPID→Railway；Stripe 1099-NEC；Payoneer 商务申请；首篇新文终审定调。

## 验收

- `npm test` 全绿 + `next build` 通过；新页面双主题/双语走查；llms.txt 可被抓取（部署后验证）
- 工具层单测：权限上下文传递（G1）+ 写类工具仅草稿态（G2）
- 迁移 022/023 SQL 就绪但**不动生产**，随 push 授权一起请示
