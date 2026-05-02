# TalEngineer — 项目上下文

跨境工业自动化工程师交付平台（类似 Upwork，专注工业自动化领域）。连接出海制造企业与全球工业自动化工程师。

## 技术栈

- **后端**：Node.js + Express.js，入口 `src/server.js`
- **前端**：Next.js + React（混合 SSR 与静态 HTML 页面）
- **实时通信**：Socket.IO（WarRoom 项目聊天室）
- **数据库**：PostgreSQL，托管在 **Supabase**（`src/config/db.js`）
- **AI**：Google Gemini API（需求解析、技术筛选、多语言翻译、日报生成）
- **支付**：Stripe + Stripe Connect（跨境收款，15% 平台佣金）
- **邮件**：Resend
- **监控**：Sentry
- **部署**：Railway

## 项目结构

```
src/
  config/       数据库、支付、邮件配置
  middleware/   JWT 认证中间件
  models/       SQL schema 定义
  routes/       17 个 API 路由模块
  services/     业务逻辑（aiService.js 是核心）
  server.js     Express + Socket.IO 入口
pages/          Next.js 前端页面
migrations/     数据库迁移脚本（8 个版本）
scripts/        后台 AI 代理脚本
sdk/agent-nexus/ Python Genesis Protocol SDK
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

`/api/talent`、`/api/demand`、`/api/payment`、`/api/auth`、`/api/finance`、`/api/workorder`、`/api/messages`、`/api/disputes`、`/api/reviews`、`/api/certifications`、`/api/enterprise`、`/api/apikeys`、`/api/iot`、`/api/admin`、`/api/notifications`、`/api/kyc`

## 后台 AI 代理

- **Ghost HR**：爬取 LinkedIn/Reddit，AI 解析工程师信息，发冷邮件招募（`scripts/runGhostHR.js`）
- **Nexus-QC**：Gemini Vision 分析现场照片质检
- **Nexus-PM**：生成项目日报、催促提醒
- **Nexus-CFO**：自动处理支付路由和佣金

## 开发注意事项

- 修改支付逻辑前必须在 Stripe 测试模式下验证
- WarRoom 实时翻译依赖 Gemini，不要硬编码语言列表
- Stripe Connect 涉及跨境合规，改动需谨慎
- 数据库迁移在 `migrations/` 目录，按版本顺序执行
- 环境变量参考 `.env.example`

## 用户角色

- `employer`：发布需求、付款的企业方
- `engineer`：接单的工程师（需通过 KYC 和技术筛选）
- `admin`：平台管理员

## 当前状态

v15.1，已部署到 Railway，进入 beta 测试阶段。
