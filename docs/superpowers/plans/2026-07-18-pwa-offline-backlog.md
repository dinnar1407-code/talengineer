# PWA 完整离线优先 + 四包全量 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一次交付五轨——PWA 完整离线优先（镜像+发件箱+同步）、现场作业包（GPS 围栏+QC 图落盘）、体验一致性包（ConsoleShell+9语）、安全包（admin 2FA/审计+CSP）、质量运维包（CI+E2E+SQL 聚合）。

**Architecture:** 离线三件套（IndexedDB 镜像 / Outbox 发件箱 / SWR 同步引擎）挂在 `lib/offline/`，服务端永远是钱路径唯一权威；Task 0 先落 stub 让六个并行 agent 可独立编译；钱路径文件（workorder/payment）与迁移 021 由主会话亲自处理。

**Tech Stack:** Next.js 16 pages router + Express + Supabase + IndexedDB（手写包装，零新前端依赖）+ otplib（TOTP）+ @playwright/test（E2E）+ GitHub Actions。测试 = **node:test + node:assert/strict**（不是 Jest）。

---

## 全局规矩（每个 agent 必读）

1. **文件所有权互斥**：只改自己任务名下的文件。碰到需要改别人文件的需求，在完成报告里说明，不要动手。
2. 测试框架 `node --test`，断言 `node:assert/strict`。跑法：`npm test`（全量）或 `node --test tests/xxx.test.js`（单文件）。
3. 代码注释用中文，说明"做什么+为什么"（用户是初学者，Terry 要求）。
4. 每个任务完成时 `git add <自己的文件> && git commit`（不要 `git add -A`，不要 push——push 由主会话在集成阶段统一做）。
5. 迁移 021 只写文件**不应用生产**——生产应用由主会话单独征得 Terry 授权。
6. i18n 模式：页内 `DICT` + `{...DICT.en, ...(DICT[lang]||{})}` merge；9 语 = **en, zh, es, vi, hi, fr, de, ja, ko**。
7. GateGuard 钩子会拦每个文件的首次 Edit/Write 和首次 Bash：按提示在消息里呈现要求的事实，然后原样重试同一操作即可。

## 文件所有权矩阵

| 任务 | Owner | 文件 |
|---|---|---|
| T0 脚手架 | 主会话 | `package.json`、`migrations/021_offline_field_admin.sql`、`lib/offline/*`(stub)、`components/OfflineBanner.jsx`(stub) |
| T1 围栏+钱路径 | 主会话 | `src/utils/geo.js`、`tests/geo.test.js`、`src/routes/workorder.js` |
| T2 离线核心 | agent offline-core | `lib/offline/idb.js`、`lib/offline/outbox.js`、`lib/offline/replayCore.js`、`lib/offline/sync.js`、`lib/offline/useOfflineData.js`、`components/OfflineBanner.jsx`、`public/sw.js`、`components/PwaSetup.jsx`、`tests/replayCore.test.js` |
| T3 控制台离线接线 | agent offline-wire（Phase B） | `pages/console.jsx`、`pages/finance.jsx` |
| T4 统一外壳 | agent shell | `components/ConsoleShell.jsx`(新)、`components/ConsoleShell.module.css`(新)、`pages/console.jsx`、`pages/finance.jsx`、`pages/talent.jsx` |
| T5 现场作业+通信 | agent fieldwork | `src/socketServer.js`、`src/routes/messages.js`、`src/routes/demand.js`、`pages/warroom.jsx`、`pages/project/[id].jsx`、`pages/workorder/[id].jsx` |
| T6 安全包 | agent security | `src/middleware/adminAuth.js`、`src/routes/auth.js`、`src/routes/admin.js`、`pages/admin.jsx`、`src/app.js`、`tests/adminAuth.test.js` |
| T7 CI+E2E | agent ops | `.github/workflows/ci.yml`、`.github/workflows/e2e-smoke.yml`、`playwright.config.js`、`e2e/smoke.spec.js` |
| T8 9语补齐 | agent i18n（Phase C） | `pages/console.jsx`、`pages/onboarding.jsx`、`pages/training.jsx`（仅 DICT 区域） |
| T9 集成验收 | 主会话 | 全仓只读核查 + push + 迁移授权 + 生产验证 |

**冲突消解**：`console.jsx`/`finance.jsx` 被 T4→T3→T8 依次修改（严格分阶段串行）；`talent.jsx` 只归 T4；`admin.jsx`/`admin.js`/`app.js` 只归 T6；`workorder.js` 只归 T1（主会话）。

**T4 与 T3 的时序说明**：T4 在 Phase A 改 console/finance 的**布局层**，T3 在 Phase B 改**数据层**——串行执行，T3 开工时以 T4 提交后的最新文件为准。

## 阶段依赖

```
Phase A（并行）: T0 → { T1, T2, T4, T5, T6, T7 }
Phase B        : T3（依赖 T2 的真实现 + T4 的外壳落位）
Phase C        : T8（依赖 T3 定稿 console.jsx）→ T9 集成验收
```

T5 在 Phase A 引用 `lib/offline/outbox` 的 **stub 契约**编码（T0 已建 stub，可编译可 build），真实现由 T2 并行补上——运行期行为在 T9 统一验证。

---

## 契约汇总（跨任务接口，所有 agent 以此为准）

```js
// lib/offline/idb.js —— IndexedDB 包装（库名 tal-offline，stores: mirror / outbox / meta）
openDb()                       // -> Promise<IDBDatabase>
mirrorGet(domain)              // -> Promise<{data, syncedAt} | null>   domain: 'projects'|'milestones'|'messages'|'transactions'|'profile'|'certs'|'notifications'|'training'|自定义
mirrorPut(domain, data)        // -> Promise<void>（自动盖 syncedAt=Date.now()）
mirrorClearAll()               // -> Promise<void>（登出时调用）

// lib/offline/outbox.js —— 变更发件箱
enqueue({ type, request })     // type: 'checkin'|'checkout'|'message'|'qc-image'|'profile-edit'
                               // request: { url, method, headers, body }  完整请求描述符，重放时原样发出
                               // 返回 Promise<opId>；内部生成 idempotencyKey 并注入 body（见各接口约定）
listPending()                  // -> Promise<op[]>  op: {id,type,request,idempotencyKey,createdAt,status,failReason}
replayAll()                    // 按 createdAt 序重放；网络失败保留 pending，4xx 标 failed；返回 {done,failed,remaining}
pendingCount()                 // -> Promise<number>；变化时 window.dispatchEvent(new CustomEvent('outbox-change'))

// lib/offline/replayCore.js —— 纯函数（node:test 可测）
orderOps(ops)                  // 按 createdAt 升序排序（稳定）
classifyFailure(status)        // -> 'retry'（网络错/5xx/429）| 'fail'（其余 4xx）
markerParse(text)              // '[qc-image:abc/1.jpg]' -> {kind:'qc-image', path:'abc/1.jpg'} | null

// lib/offline/sync.js
mirrorFetch(domain, fetcher)   // SWR：先回镜像，后台 fetcher() 成功则 mirrorPut + 返回新值
runSync()                      // replayAll + 触发 'outbox-change'；绑定 online 事件与 SW message

// lib/offline/useOfflineData.js —— React hook
useOfflineData(domain, fetcher, deps) // -> { data, offline, syncedAt, refresh }

// QC 图消息标记（T5 写入 / T2 markerParse / warroom 渲染）
'[qc-image:<storage路径>]'      // project_messages.original_text 中的标记；历史拉取时服务端注入 image_url 签名字段

// 离线消息去重（T5 服务端 / T3+T5 客户端）
POST /api/messages body 可带 client_msg_id；重复 (demand_id, client_msg_id) 返回 200 {deduped:true}

// admin 2FA（T6 服务端 / T6 admin.jsx）
POST /api/auth/admin-2fa-setup  (Bearer 基础JWT, role=admin) -> {secret, otpauthUrl}
POST /api/auth/admin-2fa {code} (Bearer 基础JWT) -> {token}  // token 含 adm2fa:true，12h
admin API 鉴权：Authorization: Bearer <adm2fa token> 或旧 x-admin-password（break-glass）

// 围栏字段（T1 写入 / T5、T6 展示）
work_order_checkins.distance_m (numeric|null), geofence_ok (boolean|null)
demands.site_lat, site_lng (double precision|null), site_radius_m (int, default 500)
```

---

### Task 0: 脚手架（主会话）

**Files:**
- Modify: `package.json`（deps）
- Create: `migrations/021_offline_field_admin.sql`
- Create: `lib/offline/idb.js`、`lib/offline/outbox.js`、`lib/offline/replayCore.js`、`lib/offline/sync.js`、`lib/offline/useOfflineData.js`（stub）
- Create: `components/OfflineBanner.jsx`（stub）

- [ ] **Step 0.1: 安装依赖**

```bash
npm install otplib && npm install -D @playwright/test
```

- [ ] **Step 0.2: 写迁移 021（完整 SQL，只建文件不应用）**

```sql
-- 021: 五轨工程 —— GPS 围栏字段 + admin 账号化 + 离线消息去重 + analytics SQL 聚合 + qc-images 私有 bucket
-- 全部只增不改，对现有数据零影响。

-- ── 围栏：需求站点坐标 + 签到距离 ─────────────────────────────
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_lat double precision;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_lng double precision;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_radius_m integer DEFAULT 500;

ALTER TABLE work_order_checkins ADD COLUMN IF NOT EXISTS distance_m numeric;
ALTER TABLE work_order_checkins ADD COLUMN IF NOT EXISTS geofence_ok boolean;

-- ── admin 账号化：TOTP + 审计日志 ────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id bigserial PRIMARY KEY,
  admin_email text NOT NULL,
  auth_method text NOT NULL,          -- 'jwt-2fa' | 'shared-password'
  action text NOT NULL,               -- 'POST /api/admin/xxx'
  target text,                        -- 资源 id（若有）
  meta jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs (created_at DESC);
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;  -- 服务端 service key 访问，deny-all 与全库一致

-- ── 离线消息去重 ─────────────────────────────────────────────
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS client_msg_id text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pm_client_msg
  ON project_messages (demand_id, client_msg_id) WHERE client_msg_id IS NOT NULL;

-- ── QC 图私有 bucket ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('qc-images', 'qc-images', false)
  ON CONFLICT (id) DO NOTHING;

-- ── admin analytics SQL 聚合（替代 Node 端 limit(1000) 内存聚合）──
CREATE OR REPLACE FUNCTION admin_analytics_summary() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT jsonb_build_object(
    'users_total',      (SELECT count(*) FROM users),
    'users_engineers',  (SELECT count(*) FROM users WHERE role = 'engineer'),
    'users_employers',  (SELECT count(*) FROM users WHERE role = 'employer'),
    'demands_total',    (SELECT count(*) FROM demands),
    'demands_assigned', (SELECT count(*) FROM demands WHERE assigned_engineer_id IS NOT NULL),
    'milestones_total', (SELECT count(*) FROM project_milestones),
    'gmv_released',     (SELECT coalesce(sum(amount), 0) FROM project_milestones WHERE status = 'released'),
    'escrow_funded',    (SELECT coalesce(sum(amount), 0) FROM project_milestones WHERE status IN ('funded', 'releasing'))
  );
$$;

CREATE OR REPLACE FUNCTION admin_rates_summary() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT jsonb_build_object(
    'count',    count(*),
    'avg_rate', round(avg(r), 2),
    'min_rate', min(r),
    'max_rate', max(r)
  )
  FROM (
    SELECT (substring(rate FROM '\d+(?:\.\d+)?'))::numeric AS r
    FROM talents WHERE rate ~ '\d'
  ) t;
$$;
```

- [ ] **Step 0.3: 建 lib/offline stub（可编译、可 build、行为为空）**

每个 stub 导出契约汇总里的同名函数，实现为安全空操作。例（`lib/offline/outbox.js` stub，其余同理）：

```js
// 离线发件箱（stub）：T2 会替换为真实现。stub 保证并行任务可编译、可 build。
async function enqueue() { return null; }
async function listPending() { return []; }
async function replayAll() { return { done: 0, failed: 0, remaining: 0 }; }
async function pendingCount() { return 0; }
module.exports = { enqueue, listPending, replayAll, pendingCount };
```

`useOfflineData.js` stub 返回 `{ data: null, offline: false, syncedAt: null, refresh: () => {} }`；`components/OfflineBanner.jsx` stub：`export default function OfflineBanner() { return null; }`

- [ ] **Step 0.4: 验证 stub 不破坏构建并提交**

```bash
npm test && npx next build
git add package.json package-lock.json migrations/021_offline_field_admin.sql lib/offline components/OfflineBanner.jsx
git commit -m "scaffold: 五轨脚手架（otplib/@playwright/test + 迁移021 + lib/offline stubs）"
```

---

### Task 1: GPS 围栏 + workorder 集成（主会话，钱路径亲自动手）

**Files:**
- Create: `src/utils/geo.js`
- Create: `tests/geo.test.js`
- Modify: `src/routes/workorder.js`（仅 checkin 段；**approve/sendPayout 段一行不动**）

- [ ] **Step 1.1: 写失败测试 `tests/geo.test.js`**

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { haversineMeters, geofenceCheck } = require('../src/utils/geo');

test('haversine 北京-上海约 1068km（±10km）', () => {
  const d = haversineMeters(39.9042, 116.4074, 31.2304, 121.4737);
  assert.ok(Math.abs(d - 1068000) < 10000, `got ${d}`);
});

test('haversine 同点距离为 0', () => {
  assert.equal(haversineMeters(31.23, 121.47, 31.23, 121.47), 0);
});

test('geofenceCheck 500m 内 ok=true', () => {
  // 相距约 111m（纬度差 0.001 度）
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: 500, lat: 31.2314, lng: 121.4737 });
  assert.equal(r.ok, true);
  assert.ok(r.distanceM > 100 && r.distanceM < 130);
});

test('geofenceCheck 超半径 ok=false', () => {
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: 100, lat: 31.2404, lng: 121.4737 });
  assert.equal(r.ok, false);
});

test('geofenceCheck 缺坐标返回双 null（跳过校验）', () => {
  assert.deepEqual(geofenceCheck({ siteLat: null, siteLng: null, radiusM: 500, lat: 31, lng: 121 }), { distanceM: null, ok: null });
  assert.deepEqual(geofenceCheck({ siteLat: 31, siteLng: 121, radiusM: 500, lat: undefined, lng: undefined }), { distanceM: null, ok: null });
});

test('geofenceCheck 半径缺省 500', () => {
  const r = geofenceCheck({ siteLat: 31.2304, siteLng: 121.4737, radiusM: null, lat: 31.2314, lng: 121.4737 });
  assert.equal(r.ok, true); // 111m < 默认 500m
});
```

- [ ] **Step 1.2: 跑测试确认失败**

Run: `node --test tests/geo.test.js`
Expected: FAIL（Cannot find module '../src/utils/geo'）

- [ ] **Step 1.3: 实现 `src/utils/geo.js`**

```js
// 地理围栏工具：Haversine 大圆距离 + 签到围栏判定。
// 为什么服务端算：客户端可伪造，距离与判定必须由服务端落库才可信。
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球平均半径（米）
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 任一侧坐标缺失 → {null, null} 表示跳过校验（警示不拦截策略的一部分）
function geofenceCheck({ siteLat, siteLng, radiusM, lat, lng }) {
  const nums = [siteLat, siteLng, lat, lng].map((v) => parseFloat(v));
  if (!nums.every(Number.isFinite)) return { distanceM: null, ok: null };
  const d = haversineMeters(nums[0], nums[1], nums[2], nums[3]);
  const r = Number.isFinite(parseFloat(radiusM)) ? parseFloat(radiusM) : 500;
  return { distanceM: Math.round(d), ok: d <= r };
}

module.exports = { haversineMeters, geofenceCheck };
```

- [ ] **Step 1.4: 跑测试确认通过**

Run: `node --test tests/geo.test.js`
Expected: 6 pass

- [ ] **Step 1.5: workorder checkin 集成**

在 `src/routes/workorder.js` POST `/:milestoneId/checkin`：demand 查询（现有 cert 校验用的那次 select）追加 `site_lat, site_lng, site_radius_m`；upsert 前调用：

```js
const { geofenceCheck } = require('../utils/geo');
// ……现有 demand 获取后：
const fence = geofenceCheck({
  siteLat: demand?.site_lat, siteLng: demand?.site_lng,
  radiusM: demand?.site_radius_m, lat, lng,
});
```

upsert 对象追加 `distance_m: fence.distanceM, geofence_ok: fence.ok`。响应体把 `fence` 一并返回（前端提示用）。**照常放行签到——警示不拦截。**

- [ ] **Step 1.6: 全量回归 + 提交**

```bash
npm test
git add src/utils/geo.js tests/geo.test.js src/routes/workorder.js
git commit -m "feat: GPS 签到地理围栏（Haversine 服务端判定，警示不拦截）"
```

---

### Task 2: 离线核心三件套（agent offline-core）

**Files:**
- Rewrite stubs: `lib/offline/idb.js`、`outbox.js`、`replayCore.js`、`sync.js`、`useOfflineData.js`
- Rewrite stub: `components/OfflineBanner.jsx`
- Modify: `public/sw.js`、`components/PwaSetup.jsx`
- Create: `tests/replayCore.test.js`

- [ ] **Step 2.1: 写失败测试 `tests/replayCore.test.js`**

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { orderOps, classifyFailure, markerParse } = require('../lib/offline/replayCore');

test('orderOps 按 createdAt 升序稳定排序', () => {
  const ops = [{ id: 'b', createdAt: 200 }, { id: 'a', createdAt: 100 }, { id: 'c', createdAt: 200 }];
  assert.deepEqual(orderOps(ops).map((o) => o.id), ['a', 'b', 'c']);
});

test('classifyFailure 网络错/5xx/429 重试，其余 4xx 失败', () => {
  assert.equal(classifyFailure(0), 'retry');     // 网络错（无响应）
  assert.equal(classifyFailure(500), 'retry');
  assert.equal(classifyFailure(429), 'retry');
  assert.equal(classifyFailure(400), 'fail');
  assert.equal(classifyFailure(409), 'fail');
});

test('markerParse 解析 qc-image 标记', () => {
  assert.deepEqual(markerParse('[qc-image:42/1699999.jpg]'), { kind: 'qc-image', path: '42/1699999.jpg' });
  assert.equal(markerParse('普通消息'), null);
  assert.equal(markerParse('[qc-image:]'), null);
});
```

- [ ] **Step 2.2: 确认失败**

Run: `node --test tests/replayCore.test.js`
Expected: FAIL（stub 无这些导出）

- [ ] **Step 2.3: 实现 `replayCore.js`（纯函数）**

```js
// 发件箱重放的纯决策逻辑：抽成纯函数便于 node:test 覆盖（IndexedDB 只能在浏览器测）。
function orderOps(ops) {
  return [...ops].sort((a, b) => a.createdAt - b.createdAt || String(a.id).localeCompare(String(b.id)));
}
// status=0 表示 fetch 抛错（网络断）；5xx/429 服务端临时问题 → 保留重试；其余 4xx 是业务拒绝 → 终态失败
function classifyFailure(status) {
  if (!status || status >= 500 || status === 429) return 'retry';
  return 'fail';
}
function markerParse(text) {
  const m = /^\[qc-image:(.+)\]$/.exec(text || '');
  return m && m[1] ? { kind: 'qc-image', path: m[1] } : null;
}
module.exports = { orderOps, classifyFailure, markerParse };
```

- [ ] **Step 2.4: 确认通过，然后实现三件套其余模块**

Run: `node --test tests/replayCore.test.js` → 3 pass。然后实现：

- `idb.js`：库 `tal-offline` v1，stores `mirror`/`outbox`/`meta`；**SSR 安全**——`typeof indexedDB === 'undefined'` 时所有函数返回空值不抛错（Next 预渲染会在 Node 环境 import 这些模块）。
- `outbox.js`：enqueue 生成 `idempotencyKey = crypto.randomUUID()` 并注入 body（type='message' 时作为 `client_msg_id`；'checkin'/'checkout' 附 `idempotency_key` 字段）；`replayAll` 用 `orderOps` 排序后逐条 `fetch(request.url, { method, headers, body: JSON.stringify(body) })`，按 `classifyFailure(resp.status)` 决定保留/终态失败；每次队列变更 `window.dispatchEvent(new CustomEvent('outbox-change'))`；enqueue 成功后 `navigator.serviceWorker?.ready.then(r => r.sync?.register('outbox-sync')).catch(() => {})`。
- `sync.js`：`mirrorFetch` = 先 `mirrorGet` 回缓存，后台 fetcher 成功则 `mirrorPut`；`runSync()` 绑定 `window` 的 `online` 事件、SW `message` 事件（`{type:'outbox-sync'}` → replayAll）、`visibilitychange` 回前台重放。

- [ ] **Step 2.5: 实现 `useOfflineData.js`**

```js
// SWR 式离线数据 hook：先渲染 IndexedDB 镜像（毫秒级），后台请求刷新。
// 断网时 offline=true 且只有镜像数据；回网后自动 revalidate。
import { useState, useEffect, useCallback } from 'react';
import { mirrorGet, mirrorPut } from './idb';

export function useOfflineData(domain, fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetcher();
      if (fresh !== undefined && fresh !== null) {
        setData(fresh); setSyncedAt(Date.now()); setOffline(false);
        mirrorPut(domain, fresh);
      }
    } catch (e) {
      setOffline(true); // 网络失败：保持镜像数据
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    mirrorGet(domain).then((hit) => {
      if (alive && hit) {
        setData((cur) => (cur === null ? hit.data : cur));
        setSyncedAt((cur) => (cur === null ? hit.syncedAt : cur));
      }
    });
    refresh();
    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => { alive = false; window.removeEventListener('online', onOnline); };
  }, [refresh]);

  return { data, offline, syncedAt, refresh };
}
```

- [ ] **Step 2.6: `OfflineBanner.jsx` 真实现**

`navigator.onLine` + `online/offline` 事件 → 顶部固定横幅「📴 离线中 · 数据截至 HH:MM」；监听 `outbox-change` 事件调用 `pendingCount()` 显示「N 条待同步」；在线且队列空时返回 null。组件无 props（契约 `<OfflineBanner />`），由 T3/T5 在各工作面页面引入——**不要**改 `_app.jsx`（不在本任务所有权内）。

- [ ] **Step 2.7: `public/sw.js` 升级**

`CACHE_VERSION` 改 `'tal-v2'`；fetch 处理器（现有 `/api` 放行判断之后）加 `/_next/static/` cache-first 分支：

```js
  // Next 构建产物带内容哈希、永不变化：cache-first 省流量提速（尤其厂区弱网）
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return resp;
      }))
    );
    return;
  }
```

文件尾部加 Background Sync 广播（SW 自身不碰业务逻辑，只叫醒页面）：

```js
// Background Sync：回网时浏览器唤醒 SW，SW 广播消息让页面执行 outbox 重放
self.addEventListener('sync', (event) => {
  if (event.tag === 'outbox-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'outbox-sync' }));
      })
    );
  }
});
```

- [ ] **Step 2.8: `PwaSetup.jsx` 增 iOS 安装引导**

检测 `typeof navigator !== 'undefined' && navigator.standalone !== true && /iPhone|iPad/.test(navigator.userAgent)` 且 `!localStorage.getItem('tal-ios-a2hs-dismissed')` → 底部浮层「📲 添加到主屏幕：点分享按钮 → 添加到主屏幕」+ 关闭钮（写 localStorage 记忆）。Android/Chrome 的 beforeinstallprompt 流程保持不动。

另外：PwaSetup 挂载时调用 `runSync()`（`lib/offline/sync.js`）——PwaSetup 已全局挂载（负责 SW 注册），是同步引擎全局初始化的天然位置（绑定 online/SW message/回前台三个触发器，全站生效）。

- [ ] **Step 2.9: 回归 + 提交**

```bash
npm test && npx next build
git add lib/offline components/OfflineBanner.jsx components/PwaSetup.jsx public/sw.js tests/replayCore.test.js
git commit -m "feat: 离线核心三件套（IndexedDB 镜像 + Outbox 发件箱 + SWR 同步）+ SW v2"
```

---

### Task 3: 控制台离线接线（agent offline-wire，Phase B）

**Files:**
- Modify: `pages/console.jsx`、`pages/finance.jsx`

前置：T2 真实现与 T4 外壳均已提交——开工前直接读最新文件。

- [ ] **Step 3.1: console.jsx 数据层换 `useOfflineData`**

现有各裸 fetch（356/377/382/387/399/408/412/419/423/427 行附近，以最新文件为准）逐个包装，domain 对应：`/api/demand/my`→'projects'、`/api/finance/milestones`→'milestones'、`/api/messages/inbox`→'messages'、`/api/finance/ledger`→'transactions'、`/api/talent/me`→'profile'、`/api/training/my`→'training'、`/api/notifications`→'notifications'、`/api/talent/list`（找工程师）→'talent-last'（缓存上次搜索结果）。**演示数据规则不变**：真数据优先，空/失败 → 3 条演示 + 🧪 测试数据徽章。

- [ ] **Step 3.2: 顶部挂 `<OfflineBanner />>`**（console 与 finance 各自页面级引入，不动 _app.jsx）。

- [ ] **Step 3.3: 档案编辑离线排队**

console 档案屏保存按钮在 `navigator.onLine === false` 时改走 `outbox.enqueue({ type: 'profile-edit', request: { url, method, headers, body } })`（url/method/headers/body 就是把现有在线保存的 fetch 参数原样搬进去）+ toast「已离线保存，回网自动同步」；在线时行为完全不变。

- [ ] **Step 3.4: finance.jsx 只读镜像**

数据 fetch 包 `useOfflineData('transactions-fin', ...)`；`offline===true` 时页头显著显示「数据截至 {new Date(syncedAt).toLocaleString()}」，且**全部资金操作按钮（充值/提现/放款/Instant Payout）disabled + title「离线状态不可操作资金」**——钱路径必须在线的铁律在 UI 层的体现。

- [ ] **Step 3.5: 回归 + 提交**

```bash
npm test && npx next build
git add pages/console.jsx pages/finance.jsx
git commit -m "feat: console/finance 离线镜像接线（SWR 读 + 档案编辑排队 + 资金操作离线禁用）"
```

---

### Task 4: ConsoleShell 统一外壳（agent shell）

**Files:**
- Create: `components/ConsoleShell.jsx`、`components/ConsoleShell.module.css`
- Modify: `pages/console.jsx`、`pages/finance.jsx`、`pages/talent.jsx`

- [ ] **Step 4.1: 从 console.jsx 提取外壳**

左侧栏（logo、角色感知菜单、主题/语言切换）+ 顶栏（回退、标题、铃铛）整体搬到 `ConsoleShell.jsx`。props 契约：

```jsx
<ConsoleShell
  user={currentUser}          // {email,name,role,token} 或 null
  active="dashboard"          // 高亮菜单 key: dashboard|projects|escrow|messages|find|profile|learning|finance
  title="仪表盘"               // 顶栏标题
  lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
>{children}</ConsoleShell>
```

菜单项 `finance` 为路由跳转 `/finance`（不再内嵌屏）；其余菜单保持 console 内 `?screen=` 切换。CSS 从 console.module.css **复制**相关类到 ConsoleShell.module.css（不删原文件中的类，避免误伤未迁移引用）。

- [ ] **Step 4.2: console.jsx 改用 ConsoleShell**，删除被提取的重复 JSX。验收：七屏切换、角色菜单、语言/主题切换、铃铛下拉全部与改造前行为一致。外壳的**登出动作**追加一行：`require('../lib/offline/idb')` 的 `mirrorClearAll()`（fire-and-forget）——换账号不能读到上一个人的镜像数据。

- [ ] **Step 4.3: finance.jsx 登录态套壳**：`currentUser` 存在时整页包 `<ConsoleShell user={...} active="finance" ...>`；未登录保持现状。

- [ ] **Step 4.4: talent.jsx 登录态套壳**：登录用户访问时包 ConsoleShell（active="find"）；**未登录访客保持现有公开营销页形态一字不动**（同文件内按 `currentUser` 分支）。

- [ ] **Step 4.5: 回归 + 提交**

```bash
npm test && npx next build
git add components/ConsoleShell.jsx components/ConsoleShell.module.css pages/console.jsx pages/finance.jsx pages/talent.jsx
git commit -m "feat: ConsoleShell 统一外壳（console 自用 + finance/talent 登录态套壳）"
```

---

### Task 5: 现场作业 + 通信（agent fieldwork）

**Files:**
- Modify: `src/socketServer.js`、`src/routes/messages.js`、`src/routes/demand.js`、`pages/warroom.jsx`、`pages/project/[id].jsx`、`pages/workorder/[id].jsx`

- [ ] **Step 5.1: QC 图落盘（socketServer.js `uploadQualityImage`，169 行附近）**

```js
// QC 图先落盘再分析：私有 bucket + 消息标记，聊天历史从此可回看（原先刷新即失）
const sharp = require('sharp');
const base64 = (imageData.split(',')[1] || '');
const raw = Buffer.from(base64, 'base64');
const jpg = await sharp(raw).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
const storagePath = `${projectId}/${Date.now()}.jpg`;
const { error: upErr } = await supabase.storage.from('qc-images')
  .upload(storagePath, jpg, { contentType: 'image/jpeg' });
if (!upErr) {
  // 消息行字段以本文件 104 行现有 insert 形状为准；original_text 用契约标记格式
  await supabase.from('project_messages').insert([{ /* 同现有字段 */ original_text: `[qc-image:${storagePath}]` }]);
}
// 既有 Gemini 分析流程原样继续（一行不动）
```

- [ ] **Step 5.2: 历史消息注入签名 URL**

socket 拉历史（134 行附近）与 `messages.js` GET `/thread/:demandId` 两处：对每行 `original_text` 匹配 `/^\[qc-image:(.+)\]$/` → `supabase.storage.from('qc-images').createSignedUrl(path, 600)` → 行上附加 `image_url` 字段（签名失败则不附加，前端显示「图片暂不可用」）。

- [ ] **Step 5.3: warroom.jsx 渲染 + 离线**

- 渲染：消息行有 `image_url` 时显示 `<img src={image_url}>`（替代原 base64 内联 HTML）。
- 历史读缓存：拉历史包 `useOfflineData('warroom-' + projectId, ...)`。
- 离线发文字消息：`navigator.onLine===false` 时 `outbox.enqueue({ type: 'message', request: { url: '/api/messages', method: 'POST', headers: {...含token}, body: { demand_id, content } } })`（outbox 自动注入 client_msg_id），本地乐观插入消息行 + 「待同步」徽章。
- 离线拍照：提示「离线状态，图片将在回网后上传」，把 base64 以 `type:'qc-image'` 入队（request 描述符同上但 body 带 imageData）；回网后 warroom 页面打开时检测 pending 的 qc-image 条目走 socket `uploadQualityImage` 重发并 markDone——图片走 socket 而非 REST，是因为 QC 分析管线挂在 socket 事件上。

- [ ] **Step 5.4: messages.js 去重**

POST `/` 接受可选 `client_msg_id`，insert 时带上；捕获 Postgres 唯一冲突（error.code === '23505'）返回 `res.json({ ok: true, deduped: true })`——重放重复消息静默幂等。

- [ ] **Step 5.5: 站点坐标编辑**

- `demand.js` POST `/submit` 接受可选 `site_lat/site_lng/site_radius_m`，校验：lat∈[-90,90]、lng∈[-180,180]、radius∈[50,50000]，非法 400。
- `demand.js` 新增 `PUT /site`（requireAuth，校验 demand 归属请求者=该 demand 雇主），只允许更新这三个字段，同样校验。
- `pages/project/[id].jsx` 雇主视角加「站点坐标」卡片：三输入框 + 保存按钮 → `PUT /api/demand/site`；已有值回显。

- [ ] **Step 5.6: 围栏结果展示**

`pages/project/[id].jsx`（雇主视角签到记录）与 `pages/workorder/[id].jsx`（签到状态区）：`geofence_ok === false` 时显示「⚠️ 距站点 {(distance_m/1000).toFixed(1)}km」徽章；`null`/`true` 不显示警示。

- [ ] **Step 5.7: workorder/[id].jsx 离线排队**

签到/签出/提交完工按钮在离线时 `outbox.enqueue({ type: 'checkin'|'checkout', request: {...现有 fetch 参数原样} })` + 按钮态改「已排队待同步」；在线行为不变。页面数据包 `useOfflineData('workorder-' + id, ...)`；顶部挂 `<OfflineBanner />`。

- [ ] **Step 5.8: 回归 + 提交**

```bash
npm test && npx next build
git add src/socketServer.js src/routes/messages.js src/routes/demand.js pages/warroom.jsx "pages/project/[id].jsx" "pages/workorder/[id].jsx"
git commit -m "feat: QC 图私有落盘+签名回看 + 消息离线去重 + 站点坐标与围栏展示 + 工单离线排队"
```

---

### Task 6: 安全包（agent security）

**Files:**
- Modify: `src/middleware/adminAuth.js`、`src/routes/auth.js`、`src/routes/admin.js`、`pages/admin.jsx`、`src/app.js`
- Create: `tests/adminAuth.test.js`

- [ ] **Step 6.1: 写失败测试 `tests/adminAuth.test.js`**

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.ADMIN_PASSWORD = 'break-glass-pw';
const express = require('express');
const request = require('supertest');
const adminAuth = require('../src/middleware/adminAuth');

function app() {
  const a = express();
  a.get('/x', adminAuth, (req, res) => res.json({ method: req.adminAuthMethod }));
  return a;
}

test('无凭证 → 401', async () => {
  await request(app()).get('/x').expect(401);
});

test('共享口令通过，方法标记 shared-password', async () => {
  const r = await request(app()).get('/x').set('x-admin-password', 'break-glass-pw').expect(200);
  assert.equal(r.body.method, 'shared-password');
});

test('adm2fa JWT 通过；无 adm2fa 声明拒绝', async () => {
  const ok = jwt.sign({ email: 'a@b.c', role: 'admin', adm2fa: true }, process.env.JWT_SECRET);
  const bad = jwt.sign({ email: 'a@b.c', role: 'admin' }, process.env.JWT_SECRET);
  const r = await request(app()).get('/x').set('Authorization', `Bearer ${ok}`).expect(200);
  assert.equal(r.body.method, 'jwt-2fa');
  await request(app()).get('/x').set('Authorization', `Bearer ${bad}`).expect(401);
});
```

（若现有 `adminAuth.js` 导出形态不是单函数——先读现文件，保持对 `admin.js` 现有挂载方式的兼容，测试相应对齐。）

- [ ] **Step 6.2: 确认失败后重写 `src/middleware/adminAuth.js`**

Run: `node --test tests/adminAuth.test.js` → FAIL。然后：

```js
// admin 双通道鉴权（并行过渡期）：
// 通道一（主）：Bearer JWT，要求 role=admin 且 adm2fa=true（TOTP 已过）
// 通道二（break-glass）：旧共享口令 x-admin-password —— Terry 验证新通道稳定后下令移除
const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(h.slice(7), process.env.JWT_SECRET);
      if (payload.role === 'admin' && payload.adm2fa === true) {
        req.adminEmail = payload.email;
        req.adminAuthMethod = 'jwt-2fa';
        return next();
      }
    } catch (e) { /* 验签失败落入通道二 */ }
  }
  const pass = req.headers['x-admin-password'];
  if (pass && process.env.ADMIN_PASSWORD && pass === process.env.ADMIN_PASSWORD) {
    req.adminEmail = 'shared-password';
    req.adminAuthMethod = 'shared-password';
    return next();
  }
  return res.status(401).json({ error: 'Admin authentication required' });
};
```

Run: `node --test tests/adminAuth.test.js` → 3 pass

- [ ] **Step 6.3: 2FA 端点（auth.js 尾部追加）**

```js
const { authenticator } = require('otplib');

// 绑定：基础 JWT（role=admin）换 TOTP secret。已启用后不允许重复绑定（防被顶替换 secret）。
router.post('/admin-2fa-setup', requireAuth, async (req, res) => {
  const { data: u } = await supabase.from('users').select('role, totp_enabled').eq('email', req.user.email).single();
  if (!u || u.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  if (u.totp_enabled) return res.status(400).json({ error: '2FA already enabled' });
  const secret = authenticator.generateSecret();
  await supabase.from('users').update({ totp_secret: secret }).eq('email', req.user.email);
  res.json({ secret, otpauthUrl: authenticator.keyuri(req.user.email, 'TalEngineer Admin', secret) });
});

// 验证：首次成功 = 启用；之后每次登录用它换 12h 管理令牌
router.post('/admin-2fa', requireAuth, async (req, res) => {
  const { code } = req.body || {};
  const { data: u } = await supabase.from('users').select('role, totp_secret, totp_enabled').eq('email', req.user.email).single();
  if (!u || u.role !== 'admin' || !u.totp_secret) return res.status(403).json({ error: 'Admin 2FA not set up' });
  if (!authenticator.verify({ token: String(code || ''), secret: u.totp_secret })) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
  if (!u.totp_enabled) await supabase.from('users').update({ totp_enabled: true }).eq('email', req.user.email);
  const token = jwt.sign({ email: req.user.email, role: 'admin', adm2fa: true }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});
```

（`supabase`/`requireAuth`/`jwt`/`JWT_SECRET` 沿用 auth.js 文件内既有引用与命名。）

- [ ] **Step 6.4: 审计中间件（admin.js，adminAuth 之后挂）**

```js
// 审计：所有 admin 写操作自动落 admin_audit_logs（fire-and-forget，不阻塞业务）
router.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    supabase.from('admin_audit_logs').insert([{
      admin_email: req.adminEmail || 'unknown',
      auth_method: req.adminAuthMethod || 'unknown',
      action: `${req.method} ${req.baseUrl}${req.path}`,
      target: req.params?.id || null,
      meta: { bodyKeys: Object.keys(req.body || {}) },   // 只记键名不记值：避免敏感值入日志
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
    }]).then(({ error }) => { if (error) console.error('[Audit] insert failed:', error.message); });
  }
  next();
});
```

新增 `GET /audit-logs`：最近 200 条 `order('created_at', { ascending: false }).limit(200)`。

- [ ] **Step 6.5: analytics 改 rpc**

`admin.js` 现 analytics / rates 端点改 `const { data, error } = await supabase.rpc('admin_analytics_summary')`（rates 用 `admin_rates_summary`），删除 Node 端 `limit(1000)` 聚合代码；`pages/admin.jsx` 对应面板字段对齐新返回 shape（函数返回 jsonb 直出，键名见 Task 0 迁移 SQL）。

- [ ] **Step 6.6: admin.jsx 登录流改造**

登录卡改双 Tab：
- 「账号登录（推荐）」：email+密码 → `/api/auth/login` → 若返回用户 role=admin：`totp_enabled` 为真直接弹 TOTP 码输入，否则先调 `admin-2fa-setup` 展示 secret+otpauthUrl（等宽字体可复制，提示「在 Google Authenticator / 1Password 手动输入密钥」）再输码 → `/api/auth/admin-2fa` → 存 adm2fa token（localStorage `tal_admin_token`），后续 admin API 全部改用 `Authorization: Bearer`。
- 「口令登录（应急）」：保留现有 x-admin-password 流程不动。

新增「审计日志」侧栏面板（表格：时间/邮箱/方式/操作/目标/IP，只读，GET /audit-logs）。全部数据视图签到行加围栏列：`geofence_ok===false` → 「⚠️ {(distance_m/1000).toFixed(1)}km」。

- [ ] **Step 6.7: CSP（app.js）**

helmet 配置将 `contentSecurityPolicy: false` 替换为：

```js
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'], // Next pages-router 内联运行时所需
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
    connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.stripe.com', 'wss:', 'https://*.ingest.sentry.io'],
    frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
    workerSrc: ["'self'"],
  },
},
```

- [ ] **Step 6.8: 回归 + 提交**

```bash
npm test && npx next build
git add src/middleware/adminAuth.js src/routes/auth.js src/routes/admin.js pages/admin.jsx src/app.js tests/adminAuth.test.js
git commit -m "feat: admin 账号化（TOTP 2FA + 双通道过渡 + 审计日志）+ CSP 白名单 + analytics SQL 聚合"
```

---

### Task 7: CI + E2E（agent ops）

**Files:**
- Create: `.github/workflows/ci.yml`、`.github/workflows/e2e-smoke.yml`、`playwright.config.js`、`e2e/smoke.spec.js`

- [ ] **Step 7.1: `ci.yml`**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1
          NEXT_PUBLIC_SUPABASE_URL: https://ci-placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder
```

先本地验证占位 env 是否够 build 过：`env -i PATH=$PATH HOME=$HOME NEXT_PUBLIC_SUPABASE_URL=https://ci-placeholder.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x npx next build`；若还缺其它 env，把实际缺项以占位值补进 workflow env 块。

- [ ] **Step 7.2: `e2e-smoke.yml`**

```yaml
name: E2E Smoke (production)
on:
  workflow_dispatch:
  schedule:
    - cron: '0 9 * * *'   # 每日 UTC 09:00
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          E2E_BASE_URL: https://talengineer.us
          E2E_EMAIL: ${{ secrets.E2E_EMAIL }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

- [ ] **Step 7.3: `playwright.config.js`**

```js
// 生产只读冒烟配置：单浏览器、串行、失败留 trace
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 45000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://talengineer.us',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
});
```

- [ ] **Step 7.4: `e2e/smoke.spec.js`**

```js
// 生产只读冒烟：公开页渲染 + 演示账号登录 + console 七屏 + finance。
// 红线：只读——不点任何会写数据/动钱的按钮。
const { test, expect } = require('@playwright/test');

const PUBLIC_PAGES = ['/', '/talent', '/playbook', '/developers', '/rates'];
for (const path of PUBLIC_PAGES) {
  test(`公开页渲染: ${path}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const resp = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(resp.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors).toEqual([]);
  });
}

test.describe('登录态', () => {
  test.skip(!process.env.E2E_EMAIL, '缺 E2E_EMAIL/E2E_PASSWORD secrets');

  test('登录 → console 七屏 → finance', async ({ page, request }) => {
    const login = await request.post('/api/auth/login', {
      data: { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD },
    });
    expect(login.ok()).toBeTruthy();
    const body = await login.json();  // 字段名以 src/routes/auth.js login 实际返回为准，先读代码对齐
    await page.addInitScript(([u]) => {
      localStorage.setItem('tal_user', JSON.stringify(u));
    }, [{ email: process.env.E2E_EMAIL, name: body.user?.name || 'E2E', role: body.user?.role || 'employer', token: body.token }]);

    for (const screen of ['dashboard', 'projects', 'escrow', 'messages', 'find', 'profile', 'learning']) {
      await page.goto(`/console?screen=${screen}`, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).not.toBeEmpty();
    }
    await page.goto('/finance', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
```

- [ ] **Step 7.5: 本地验证 + 提交**

```bash
npx playwright install chromium
npx playwright test e2e/smoke.spec.js
```

Expected: 公开页 5 例 pass；登录态无 secrets 自动 skip（符合预期）。

```bash
git add .github playwright.config.js e2e
git commit -m "ci: GitHub Actions 单测+build 门禁 + 生产 E2E 只读冒烟"
```

---

### Task 8: 9 语补齐（agent i18n，Phase C）

**Files:**
- Modify: `pages/console.jsx`、`pages/onboarding.jsx`、`pages/training.jsx`（仅各自 DICT 对象）

- [ ] **Step 8.1: 三个文件各自的 `DICT` 从 en/zh 扩到九语**

语言集：**en, zh, es, vi, hi, fr, de, ja, ko**（与 talent.jsx 一致）。翻译要求：技术词准确（milestone/escrow/certification 等按行业惯例）、UI 短语简洁、占位符（`{n}` 等）原样保留。

- [ ] **Step 8.2: key 对齐校验（全量输出，禁止 tail 截断——上次的教训）**

```bash
node -e "
const fs=require('fs');
for (const f of ['pages/console.jsx','pages/onboarding.jsx','pages/training.jsx']) {
  const src=fs.readFileSync(f,'utf8');
  const m=src.match(/const DICT\s*=\s*\{[\s\S]*?\n\};/);
  const DICT=eval('('+m[0].replace(/^const DICT\s*=\s*/,'').replace(/;\s*$/,'')+')');
  const ref=Object.keys(DICT.en).sort().join(',');
  for (const l of ['zh','es','vi','hi','fr','de','ja','ko']) {
    const k=Object.keys(DICT[l]||{}).sort().join(',');
    console.log(f, l, k===ref ? 'OK' : 'MISMATCH');
    if (k!==ref) {
      const en=new Set(Object.keys(DICT.en)), cur=new Set(Object.keys(DICT[l]||{}));
      console.log('  missing:', [...en].filter(x=>!cur.has(x)).join(','));
      console.log('  extra:', [...cur].filter(x=>!en.has(x)).join(','));
    }
  }
}"
```

全部 OK 才算过。（若 DICT 含 JSX/模板字符串导致 eval 失败，退化为逐语言 key 正则提取比对，原则不变：9 语 key 集完全一致。）

- [ ] **Step 8.3: 回归 + 提交**

```bash
npm test && npx next build
git add pages/console.jsx pages/onboarding.jsx pages/training.jsx
git commit -m "i18n: console/onboarding/training 补齐 9 语（es/vi/hi/fr/de/ja/ko）"
```

---

### Task 9: 集成验收（主会话）

- [ ] **Step 9.1**: `npm test`（预期 159 例 + 新增全绿）+ `npx next build` 通过。
- [ ] **Step 9.2**: 全仓核查：`git log --oneline` 确认 T0-T8 提交齐；抽查钱路径 diff——`payment.js`/`disputes.js` 应零改动、`workorder.js` 仅 checkin 段（`git diff 3fb7dd0..HEAD -- src/routes/payment.js src/routes/disputes.js` 应为空）。
- [ ] **Step 9.3**: push main → Railway 自动部署（~10-15 分钟）。
- [ ] **Step 9.4**: **AskUserQuestion 请求 Terry 授权迁移 021 应用生产**（Supabase MCP `apply_migration`）。注意：push 与迁移应同窗口完成——未迁移前，围栏/2FA/审计/rpc 端点在生产会因缺列缺表报错。
- [ ] **Step 9.5**: 生产验证：`curl -sI https://talengineer.us | grep -i content-security`（CSP 头在）；headless 全页面冒烟无 CSP violation；旧口令访问 `/api/admin/*` 仍通（break-glass）；CI 首跑绿；配 GitHub Secrets（`gh secret set E2E_EMAIL` / `E2E_PASSWORD`，值=演示账号）后手动触发 E2E 冒烟一次。
- [ ] **Step 9.6**: 离线走查（Chrome DevTools offline）：console 断网可读镜像、工单签到排队回网补传、finance 离线禁操作。发现问题当场修。
- [ ] **Step 9.7**: Obsidian 更新：Issue & Bug & ToDo.md（🔵backlog 9 项划掉 8 项，Payoneer 留档；新增 Terry 待办：「admin 2FA 绑定步骤」「新通道稳定后下令删共享口令」）；记忆文件同步（talengineer 相关）。
