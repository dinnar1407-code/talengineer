// IndexedDB 包装：离线镜像 + 发件箱的底层存储。
// 库名 tal-offline，三个 store：
//   mirror —— 各接口数据的本地镜像（domain 做主键），断网时页面直接读它
//   outbox —— 变更发件箱（离线时排队的写请求，回网重放）
//   meta   —— 预留的杂项元数据 store
// 为什么手写而不用 idb 库：零新依赖（厂区弱网也不想多下一个包），够用即可。
//
// SSR 安全：Next 预渲染会在 Node 环境 import 本模块，而 Node 没有 indexedDB。
// 所以所有函数在 `typeof indexedDB === 'undefined'` 时返回空值、绝不抛错，让服务端渲染安全通过。

const DB_NAME = 'tal-offline';
const DB_VERSION = 1;

// 单例：数据库只开一次，之后复用同一个 Promise，避免重复 open。
let dbPromise = null;

// 打开（或首次创建）数据库。没有 indexedDB（SSR/Node）时返回 null。
function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    // onupgradeneeded 只在版本变化（含首次创建）时触发，在这里建 store。
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('mirror')) db.createObjectStore('mirror', { keyPath: 'domain' });
      if (!db.objectStoreNames.contains('outbox')) db.createObjectStore('outbox', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// 把一个 IDBRequest 包成 Promise（onsuccess → resolve(result)，onerror → reject）。
// outbox.js 也会用到它，所以一并导出。
function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 等一个事务真正提交完成（写操作要等 oncomplete 才算落盘）。
function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// 读镜像：命中返回 { data, syncedAt }，未命中或无 IndexedDB 返回 null。
async function mirrorGet(domain) {
  const db = await openDb();
  if (!db) return null;
  const tx = db.transaction('mirror', 'readonly');
  const row = await promisifyRequest(tx.objectStore('mirror').get(domain));
  return row ? { data: row.data, syncedAt: row.syncedAt } : null;
}

// 写镜像：自动盖上 syncedAt=Date.now()（记录这份数据是什么时候同步下来的，供「数据截至」显示）。
async function mirrorPut(domain, data) {
  const db = await openDb();
  if (!db) return;
  const tx = db.transaction('mirror', 'readwrite');
  tx.objectStore('mirror').put({ domain, data, syncedAt: Date.now() });
  await txDone(tx);
}

// 清空所有镜像：登出/换账号时调用，避免下一个人读到上一个人的缓存数据。
async function mirrorClearAll() {
  const db = await openDb();
  if (!db) return;
  const tx = db.transaction('mirror', 'readwrite');
  tx.objectStore('mirror').clear();
  await txDone(tx);
}

module.exports = { openDb, promisifyRequest, txDone, mirrorGet, mirrorPut, mirrorClearAll };
