# PWA 完整离线优先 + 四包全量 设计规格

- 日期：2026-07-17
- 状态：已获 Terry 批准（口头），待 spec 审阅
- 范围来源：Issue & Bug & ToDo.md 🔵开发侧 backlog（除 Payoneer）+ 移动端/PWA 深化
- 关联决策：PWA 档位 = 完整离线优先；admin 切换 = 并行过渡（保留 break-glass）

---

## 0. 总览

五条轨道一次交付：

| 轨道 | 内容 | 主要文件域 |
|---|---|---|
| 一 | PWA 完整离线优先（镜像+发件箱+同步引擎） | `lib/offline/*`、`public/sw.js`、各工作面页面 |
| 二 | 现场作业包（GPS 围栏 + QC 图落盘） | `src/routes/workorder.js`、`src/socketServer.js`、迁移 021 |
| 三 | 体验一致性包（ConsoleShell 统一外壳 + 9 语补齐） | `components/ConsoleShell.jsx`、`pages/finance.jsx`、`pages/talent.jsx`、console/onboarding/training DICT |
| 四 | 安全包（admin 账号化+2FA+审计 + CSP 白名单） | `src/middleware/adminAuth.js`、`src/routes/admin.js`、`pages/admin.jsx`、`src/app.js` |
| 五 | 质量运维包（GitHub Actions CI + 生产 E2E 冒烟 + Analytics SQL 聚合） | `.github/workflows/*`、`e2e/*`、`src/routes/admin.js`、迁移 021 |

统一约束：

- 钱路径不变式不动：里程碑状态机、幂等键、feeFor、sendPayout 语义保持现状。
- 迁移 021 一次打包，**应用生产前需 Terry 单独放行**。
- 测试框架 = node:test + node:assert/strict（不是 Jest）。
- 部署 = push main → Railway 自动部署。

---

## 1. 轨道一：PWA 完整离线优先

### 1.1 架构三件套

**数据镜像**（`lib/offline/idb.js` + `lib/offline/sync.js`）

- IndexedDB 库：`tal-offline`，object store 按数据域划分：`projects`、`milestones`、`messages`、`transactions`、`profile`、`certs`、`meta`（同步时间戳等）。
- 读取模式 = stale-while-revalidate：页面挂载先渲染本地镜像（毫秒级），后台照常请求 API，成功后同时刷新 UI 与镜像；断网时只用镜像。
- 提供 React hook `useOfflineData(storeKey, fetcher)` 封装上述模式，各工作面页面替换现有裸 fetch。
- 镜像只存**当前登录用户自己的数据**；登出时清空全部 store。

**变更发件箱**（`lib/offline/outbox.js`）

- object store `outbox`：`{ id, type, payload, idempotencyKey, createdAt, status: pending|syncing|failed, failReason }`。
- 可排队的写操作（白名单制）：签到/签出、warroom 发消息、QC 拍照上传、工程师申请付款、档案编辑。
- **不可排队**（必须在线，UI 直接禁用并提示）：雇主通过/拒绝/放款、争议操作、Stripe 相关一切操作。
- 回网重放：按序、带幂等键；服务端照常校验，被拒的条目标 `failed` + 原因，通知用户，不自动重试非网络类失败。

**同步引擎触发**

- Chrome/Android：Service Worker Background Sync（tag `outbox-sync`），SW 与页面走 `postMessage` 通道。
- iOS Safari（无 Background Sync）：`online` 事件 + 应用启动/回前台时重放。
- 全局组件 `OfflineBanner`：断网时顶部横幅「离线中 · 数据截至 HH:MM」；发件箱非空时显示「N 条待同步」；队列条目在对应界面挂「待同步」徽章。

### 1.2 冲突策略

- **服务端是唯一权威**，尤其钱路径。重放时非法状态迁移（如里程碑已被对方操作）→ 服务端正常拒绝 → 条目 `failed` + 用户可读原因。不做双向合并、不做 CRDT。
- 档案类字段 last-write-wins。
- 幂等：签到本身是 upsert（天然幂等）；发消息/申请付款带客户端生成的幂等键，服务端相应接口需支持重复提交去重（申请付款复用现有幂等键机制；发消息新增 `client_msg_id` 去重）。

### 1.3 覆盖矩阵

| 界面 | 离线读 | 离线写 |
|---|---|---|
| console 七屏（仪表盘/项目/托管/消息/找工程师/档案/学习） | ✅ 镜像（找工程师=缓存上次结果） | 档案编辑排队；其余只读 |
| 项目详情 / 工单 | ✅ | 签到/签出、申请付款排队 |
| warroom | ✅ 消息读缓存 | 发消息、QC 拍照排队 |
| finance | ✅ 只读镜像 + 「数据截至」时间戳 | ❌ 全部禁用 |
| training | ✅ 进度只读 | ❌ 考试必须在线 |
| admin 后台 / 营销页 | ❌ 不镜像（保留现有缓存降级） | ❌ |

### 1.4 SW 升级（`public/sw.js`）

- `/_next/static/*` 不可变资源改 **cache-first**（现为网络优先，浪费带宽）。
- 页面导航保持网络优先 → 缓存 → /offline 降级（现状不变）。
- 新增 `sync` 事件监听（`outbox-sync`）与页面消息通道。
- CACHE_VERSION 递增至 `tal-v2`。

### 1.5 安装引导

- iOS：无 beforeinstallprompt，检测 Safari 非 standalone 时展示「添加到主屏幕」引导浮层（可关闭，localStorage 记忆）。
- Android/Chrome：继续用现有 PwaSetup 的 beforeinstallprompt 流程。

---

## 2. 轨道二：现场作业包

### 2.1 GPS 签到地理围栏

- 迁移 021：`demands` 加 `site_lat double precision`、`site_lng double precision`、`site_radius_m int default 500`；`work_order_checkins` 加 `distance_m numeric`、`geofence_ok boolean`（可空）。
- 雇主在发需求表单（可选字段）或项目页补填站点坐标。
- 签到接口（`src/routes/workorder.js` POST `/:milestoneId/checkin`）：站点坐标存在且签到带 lat/lng 时，服务端 Haversine 计算距离，写入 `distance_m` 与 `geofence_ok = distance_m <= site_radius_m`；任一侧缺坐标则两字段为 null（跳过校验）。
- **策略 = 警示不拦截**：越界签到照常成功；雇主项目页与 admin 全部数据视图展示「⚠️ 距站点 X km」异常标记。理由：厂房内 GPS 漂移常见，硬拦制造支持负担。
- 纯函数 `src/utils/geo.js`（haversineMeters）+ node:test 单测。

### 2.2 QC 图片落盘

- 迁移 021：Supabase Storage 新增**私有 bucket `qc-images`**（工厂内部照片不进公开 bucket）。
- 流程改造（`src/socketServer.js` `uploadQualityImage`）：base64 → sharp 压缩（限宽 1600、JPEG q80）→ 上传 `qc-images/{demandId}/{ts}.jpg` → `project_messages` 插入一条图片消息（内容存 storage 路径标记，如 `[qc-image:path]`）→ AI 分析流程原样保留。
- 历史消息拉取（socket 历史 + REST）：遇到 `[qc-image:path]` 标记时生成 600s 签名 URL 注入返回体；前端 warroom 渲染签名 URL。
- 收益：聊天里的 QC 图可回看（现在刷新即失）；离线排队场景下 blob 先存 outbox，回网走同一上传路径。

---

## 3. 轨道三：体验一致性包

### 3.1 ConsoleShell 统一外壳

- 抽出 `components/ConsoleShell.jsx`：左侧栏（角色感知菜单）+ 顶栏（回退/语言/主题/铃铛）——从现有 console.jsx 提取，console 首先自用（行为零变化）。
- `/finance`、`/talent`（仅登录态）套用 ConsoleShell；未登录访问 `/talent` 保持现有公开营销形态。
- **保留独立路由**，不合并进 `?screen=`：深链接稳定、改动面小；console 左侧栏对应入口从内嵌屏切换为路由跳转（用户无感）。

### 3.2 9 语补齐

- console / onboarding / training 三处 per-page DICT 从 en/zh 补到全站 9 语（en/zh/es/pt/de/fr/ja/ko/ar，以现有语言选择器为准）。
- 模式不变：页内 DICT + `{...DICT.en, ...(DICT[lang]||{})}` merge。
- 交付门槛：key 对齐校验脚本全量输出（不许 `tail` 截断），9 语 key 集完全一致。

---

## 4. 轨道四：安全包

### 4.1 admin 账号化（并行过渡）

- 登录：admin 用户（users.role='admin'）走正常 `/api/auth/login` 拿 JWT → 若 `totp_enabled` 则要求提交 TOTP 码换取含 `adm2fa: true` 声明的**短期管理令牌（12h）**；未绑定 TOTP 的 admin 首次登录强制走绑定流程（otplib 生成 secret，页面展示 otpauth URL 二维码，验证一次成功后置 `totp_enabled=true`）。
- 迁移 021：`users` 加 `totp_secret text`、`totp_enabled boolean default false`；新表 `admin_audit_logs (id bigserial PK, admin_email text, auth_method text, action text, target text, meta jsonb, ip text, created_at timestamptz default now())`。
- `src/middleware/adminAuth.js` 改为双通道：① Bearer JWT 且 `role='admin'` 且 `adm2fa=true`（主通道）；② 旧 `x-admin-password`（break-glass 后门，`auth_method='shared-password'` 入审计）。**ADMIN_PASSWORD 机制本体不动**，仅并联新通道；Terry 验证稳定后另行下令再废除。
- 审计：admin 路由的所有**写操作**（POST/PUT/DELETE）经中间件自动落 `admin_audit_logs`；pages/admin.jsx 增「审计日志」面板（最近 200 条，只读）。
- 明确不做：细粒度权限矩阵（单管理员场景纯摆设；`role` 字段已留扩展余地）。

### 4.2 CSP 白名单化

- `src/app.js` helmet 配置从 `contentSecurityPolicy: false` 改为强制白名单：
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com`（Next.js pages router 内联运行时所需；框架现实）
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://*.supabase.co`
  - `connect-src 'self' https://*.supabase.co https://api.stripe.com wss: https://*.ingest.sentry.io`
  - `frame-src https://js.stripe.com https://checkout.stripe.com`
  - `worker-src 'self'`
- 验收：上线前 headless 全页面冒烟（首页/console/finance/admin/warroom/talent/训练），console 无 CSP violation 报错。

---

## 5. 轨道五：质量运维包

### 5.1 CI（GitHub Actions）

- `.github/workflows/ci.yml`：push/PR 到 main 触发，Node 22，`npm ci` → `npm test`（node --test 全量）→ `next build`。目的：挡「留下语法错误直接进 main」类事故。

### 5.2 E2E 生产冒烟

- `@playwright/test`（devDependency）+ `e2e/smoke.spec.js`：对 `https://talengineer.us` 跑只读冒烟——公开页渲染（首页/talent/playbook/developers）、演示账号登录、console 七屏加载、finance 加载、无 console error。
- 触发方式：`.github/workflows/e2e-smoke.yml`，手动 workflow_dispatch + 每日定时；演示账号凭据走 GitHub Secrets（`E2E_EMAIL`/`E2E_PASSWORD`），不入库。
- 明确不做：本地 E2E 测试数据库（只读冒烟不值得一套隔离 Supabase；PR 层有单测+build 兜底）。

### 5.3 admin Analytics SQL 聚合

- 迁移 021：建 Postgres 聚合函数（如 `admin_analytics_summary()` 返回用户数/需求数/GMV/托管余额等，`admin_rates_summary()` 返回费率分布），SECURITY DEFINER。
- `src/routes/admin.js` analytics/rates 端点改 `supabase.rpc()` 调用，删除 Node 端 `limit(1000)` 内存聚合。
- 单测：函数返回 shape 校验（mock supabase.rpc）。

---

## 6. 迁移 021 汇总（`migrations/021_offline_field_admin.sql`）

全部只增不改，对现有数据零影响：

1. `demands`：`site_lat`、`site_lng`、`site_radius_m int default 500`
2. `work_order_checkins`：`distance_m numeric`、`geofence_ok boolean`
3. `users`：`totp_secret text`、`totp_enabled boolean default false`
4. 新表 `admin_audit_logs`（含索引 `created_at desc`）
5. `project_messages`：`client_msg_id text`（唯一约束 `demand_id + client_msg_id`，可空）——离线消息去重
6. Storage：私有 bucket `qc-images`
7. Analytics 聚合函数 ×2

**应用生产前单独等 Terry 放行**（与 018/019/020 同规矩）。

---

## 7. 测试与验收

- 单测（node:test）：Haversine 与围栏判定、outbox 重放幂等逻辑（纯函数部分）、TOTP 校验流、CSP 响应头存在性、analytics rpc shape、QC 图路径标记解析。
- E2E 冒烟：五轨用户可见面全覆盖（见 5.2）。
- 人工走查：Chrome DevTools offline 模式过关键流——断网打开已访问工单 → 签到排队 → 回网自动补传 → 服务端落库带 distance_m；admin 新登录流（JWT+TOTP）与 break-glass 后门各走一遍。
- 回归门槛：`npm test` 全绿 + `next build` 通过 + CI 工作流首跑成功。

## 8. 不做什么

- Payoneer 真实 API（等商务开通）
- 原生壳 App（Capacitor/商店上架）
- admin 后台与营销页的离线镜像
- 双向冲突合并 / CRDT
- 细粒度 admin 权限矩阵
- 本地 E2E 测试数据库
