# TalEngineer — 项目上下文

跨境工业自动化工程师交付平台（类似 Upwork，专注工业自动化领域）。连接出海制造企业与全球工业自动化工程师。

## 技术栈

- **后端**：Node.js + Express.js，生产入口 `src/nextServer.js`（Next.js 自定义服务器：`/api/*` 与 `/socket.io/*` 交给 Express 应用 `src/app.js`，其余路由全部由 Next.js 渲染）
- **前端**：Next.js（Pages Router）+ React
- **实时通信**：Socket.IO（WarRoom 项目聊天室，统一实现在 `src/socketServer.js`）
- **数据库**：PostgreSQL，托管在 **Supabase**（`src/config/db.js`）
- **AI**：Google Gemini API（需求解析、技术筛选、多语言翻译、日报生成）
- **支付**：Stripe + Stripe Connect（跨境收款，15% 平台佣金）
- **邮件**：Resend
- **监控**：Sentry（`instrument.js`，由 nextServer 启动时加载）
- **部署**：Railway

## 项目结构

```
src/
  config/         数据库、支付、邮件、撮合参数配置
  middleware/     JWT 认证中间件
  models/         SQL schema 定义
  routes/         31 个 API 路由模块
  services/       业务逻辑（aiService.js 是核心）
  tools/          Agent 工具注册表（读 / 写 / AI 工具）
  utils/          纯函数工具（争议分账、考试规则、地理、分页等）
  app.js          Express 应用（仅 /api 与静态资源，无页面路由）
  socketServer.js Socket.IO 统一实现（握手 JWT 鉴权 + 房间校验）
  nextServer.js   生产入口：Next.js + Express + Socket.IO
pages/            Next.js 前端页面（Pages Router，含动态路由子目录）
components/       共享 React 组件（Navbar、Footer、Toast、ChatBot 等）
lib/              前端共享逻辑（i18n 页面字典、离线 outbox、导航配置等）
hooks/            React hooks（useLang、useTheme）
migrations/       数据库迁移脚本（26 个，按编号顺序执行）
scripts/          运营脚本（Ghost HR、OG 图、手册 PDF、市场报告、手册截图）
tests/            node --test 单元 / 集成测试（npm test）
e2e/              Playwright 生产只读冒烟测试
```

## 核心数据表

| 表名 | 用途 |
|------|------|
| users | 用户（employer / engineer / admin） |
| talents | 工程师档案（技能、费率、验证分数） |
| demands | 项目需求 |
| project_milestones | 里程碑付款（Stripe 托管） |
| financial_ledgers | 财务账本 |
| project_messages | WarRoom 聊天（多语言翻译） |

完整 schema 见 `SUPABASE_SCHEMA.sql` 和 `src/models/schema.sql`。

## API 路由

31 个模块（`src/routes/`）：`admin`、`agent`、`aiops`、`apikeys`、`auth`、`bgcheck`、`certifications`、`connect`、`coverage`、`demand`、`disputes`、`enterprise`、`entV1`、`finance`、`iot`、`kyc`、`mcp`、`messages`、`newsletter`、`notifications`、`payment`、`pipeline`、`pools`、`push`、`referral`、`reviews`、`talent`、`tax`、`training`、`uploads`、`workorder`

## 后台 AI 能力

- **Ghost HR**（`scripts/runGhostHR.js`）：AI 解析工程师档案并生成冷邮件招募。注意：当前跑的是脚本内置的 mock 档案（并非真实爬虫），且没有任何定时任务调用它，需手动运行。
- **Nexus-QC / Nexus-PM**：`src/services/aiService.js` 内的 prompt 角色——Gemini Vision 质检现场照片、生成项目日报与催办消息，由 WarRoom（socketServer）流程触发。
- 支付路由与佣金拆分逻辑在 `src/routes/payment.js` 与 `src/services/payout/`（无独立代理进程）。

## 开发注意事项

- 修改支付逻辑前必须在 Stripe 测试模式下验证
- WarRoom 实时翻译依赖 Gemini，不要硬编码语言列表
- Stripe Connect 涉及跨境合规，改动需谨慎
- 数据库迁移在 `migrations/` 目录，按编号顺序执行
- 日志脱敏：用户邮箱/姓名等 PII 落日志前用 `maskEmail`（`src/services/referralService.js`）打码；错误日志走 console.error 并已接 Sentry
- 环境变量参考 `.env.example`

## 用户角色

- `employer`：发布需求、付款的企业方
- `engineer`：接单的工程师（需通过 KYC 和技术筛选）
- `admin`：平台管理员（TOTP 第二因子）

## 当前状态

v15.1，已部署到 Railway，进入 beta 测试阶段。P3 死代码治理已完成（legacy 入口 `src/server.js` 与静态 HTML 页面已退役，唯一入口为 `src/nextServer.js`）。
