// 变更发件箱：离线时把「写请求」排进 IndexedDB 队列，回网后按顺序重放。
// 服务端永远是钱路径唯一权威——发件箱只负责"补发离线期间的写"，不做任何本地结算。
//
// op 记录形状：
//   { id, type, request:{url,method,headers,body}, idempotencyKey, createdAt, status, failReason }
//   type: 'checkin'|'checkout'|'message'|'qc-image'|'profile-edit'
//   status: 'pending'（待重放）| 'failed'（业务拒绝，终态）
//
// 幂等：每条入队都生成一个 UUID 幂等键，注入 body，服务端据此去重——
//   回网重放若与在线时已提交的请求撞车，服务端认得出是同一笔，不会重复扣钱/重复建消息。

const { orderOps, classifyFailure } = require('./replayCore');
const { openDb, promisifyRequest, txDone } = require('./idb');

// 生成随机 id：优先用 crypto.randomUUID（浏览器/Node18+ 都有），兜底用时间戳+随机串。
function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// 读当下登录 token（与全站 REST 请求同源，存在 localStorage 的 tal_user.token）。
// typeof 守卫 + try/catch：SSR 无 localStorage、或 JSON 损坏时安全返回空串，绝不抛错。
function currentToken() {
  if (typeof localStorage === 'undefined') return '';
  try {
    return JSON.parse(localStorage.getItem('tal_user') || '{}').token || '';
  } catch (e) {
    return '';
  }
}

// 队列每次变更都广播事件，OfflineBanner 收到后重新数「N 条待同步」。
function emitChange() {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('outbox-change'));
  }
}

// 入队成功后请求浏览器的 Background Sync：回网时即使页面已关，浏览器也会唤醒 SW 触发重放。
// 能力不支持就静默跳过（catch 吞掉），不影响主流程。
function registerBackgroundSync() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  navigator.serviceWorker.ready
    .then((r) => r.sync && r.sync.register('outbox-sync'))
    .catch(() => {});
}

// 入队一条离线写请求，返回 opId。
async function enqueue({ type, request }) {
  const idempotencyKey = genId();
  // 拷贝一份 request/body，避免改到调用方传入的对象；再按类型注入幂等键。
  const req = { ...request, body: { ...(request && request.body) } };
  if (type === 'message') {
    req.body.client_msg_id = idempotencyKey; // 消息去重键：服务端 (demand_id, client_msg_id) 唯一
  } else if (type === 'checkin' || type === 'checkout') {
    req.body.idempotency_key = idempotencyKey; // 签到/签出幂等键
  }
  const op = { id: genId(), type, request: req, idempotencyKey, createdAt: Date.now(), status: 'pending', failReason: null };

  const db = await openDb();
  if (!db) return null; // SSR/无 IndexedDB：无法入队
  const tx = db.transaction('outbox', 'readwrite');
  tx.objectStore('outbox').put(op);
  await txDone(tx);

  emitChange();
  registerBackgroundSync();
  return op.id;
}

// 列出所有待重放（status='pending'）的 op。
async function listPending() {
  const db = await openDb();
  if (!db) return [];
  const tx = db.transaction('outbox', 'readonly');
  const all = await promisifyRequest(tx.objectStore('outbox').getAll());
  return (all || []).filter((op) => op.status === 'pending');
}

// 待同步条数（OfflineBanner 用）。
async function pendingCount() {
  return (await listPending()).length;
}

// 标记完成 = 直接从队列删除（重放成功或 T5 用 socket 重发图片成功后调用）。
async function markDone(id) {
  const db = await openDb();
  if (!db) return;
  const tx = db.transaction('outbox', 'readwrite');
  tx.objectStore('outbox').delete(id);
  await txDone(tx);
  emitChange();
}

// 标记失败 = 置为终态 'failed' 并记原因（业务拒绝的 4xx，重发也没用，留档不再重放）。
// 用原生 onsuccess 回调在同一事务里 get→put，避免 await 跨微任务导致事务提前提交。
async function markFailed(id, reason) {
  const db = await openDb();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const op = getReq.result;
      if (op) {
        op.status = 'failed';
        op.failReason = reason || null;
        store.put(op);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  emitChange();
}

// 重放前重建请求头：
//   M-2：有 body 却没声明 Content-Type（任意大小写）→ 默认补 application/json，否则服务端解析不了 body
//   I-2：入队时存的是旧 token，用户可能已重登；先清掉任意大小写的 authorization，再用当下 token 覆盖
function buildReplayHeaders(rawHeaders, body) {
  const headers = { ...(rawHeaders || {}) };
  const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type');
  if (body != null && !hasContentType) headers['Content-Type'] = 'application/json';
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === 'authorization') delete headers[k];
  }
  const token = currentToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// 重放全部待发请求：按 createdAt 排序后逐条发出。
//   2xx      → markDone（删除）
//   retry 类 → 保留 pending，下次再发（网络错/5xx/429/401/403）
//   fail 类  → markFailed（终态，其余 4xx）
// 返回 { done, failed, remaining }。
async function doReplayAll() {
  const pending = await listPending();
  const ordered = orderOps(pending);
  let done = 0;
  let failed = 0;
  for (const op of ordered) {
    // socket 目标 op（/socket/ 前缀占位 url，如 qc-image 图片 / warroom 文字消息）专走 warroom 的 socket 重发路径，
    // warroom 回网时检测 pending 后经 socket 重发 + markDone。这里若按 HTTP 重放，会打到占位 url 得 404，
    // 或错投到 REST 端点（如文字消息投 messages 表 demand_id 类型不符 → 500 → retry 永久卡队列）。
    // 一律跳过，留在 pending 等页面处理；remaining 计数自然把它算进去。
    if (op.type === 'qc-image' || String(op.request?.url || '').startsWith('/socket/')) continue;
    const { url, method, headers, body } = op.request || {};
    let status;
    try {
      const resp = await fetch(url, {
        method: method || 'POST',
        headers: buildReplayHeaders(headers, body),
        body: body != null ? JSON.stringify(body) : undefined,
      });
      status = resp.status;
    } catch (e) {
      status = 0; // fetch 抛错 = 网络断，按重试处理
    }
    if (status >= 200 && status < 300) {
      await markDone(op.id);
      done += 1;
    } else if (classifyFailure(status) === 'fail') {
      await markFailed(op.id, `HTTP ${status}`);
      failed += 1;
    }
    // retry：什么都不做，保留 pending
  }
  const remaining = (await listPending()).length;
  return { done, failed, remaining };
}

// I-1：单飞保护。弱网抖动下 online / visibilitychange / SW message 几乎同时触发，
// 若并发跑 doReplayAll，同一条 op 会被发 2-4 次（冗余请求，且把安全押注在服务端幂等上）。
// 用模块级 in-flight Promise 复用：进行中就返回同一个 Promise，跑完再清空。
let inflight = null;
async function replayAll() {
  if (inflight) return inflight;
  inflight = doReplayAll().finally(() => { inflight = null; });
  return inflight;
}

module.exports = { enqueue, listPending, pendingCount, markDone, markFailed, replayAll };
