/* TalEngineer Service Worker — PWA 离线壳 + Web Push
 * 网络优先的缓存策略：优先走网络拿最新内容，失败才回退缓存 / 离线页。
 * 只处理同源 GET 的页面与静态资源，接口（/api）一律放行不缓存。
 */

// 缓存版本号：改动预缓存内容或缓存策略时递增，activate 会清掉旧版本缓存。
const CACHE_VERSION = 'tal-v1';
const CACHE_NAME = `talengineer-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// 应用壳：install 时预缓存，保证断网也能打开首页与降级页。
const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/img/logo-macaw.svg',
];

// install：预缓存壳资源；skipWaiting 让新版本 SW 立即进入激活流程。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// activate：删除所有非当前版本的缓存；clients.claim 让已打开的页面立刻受新 SW 控制。
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// fetch：仅拦截同源 GET 的页面/静态资源。
// 网络优先 → 失败回退缓存 → 导航请求再降级到 /offline。
// 非 GET、跨源、以及 /api 接口一律不拦截（避免缓存动态数据或干扰鉴权）。
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 跨源资源不管
  if (url.pathname.startsWith('/api')) return;      // 接口不缓存

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 只把成功的同源基础响应写入缓存，供离线时回退
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        // 网络失败：先尝试命中缓存
        const cached = await caches.match(request);
        if (cached) return cached;
        // 打开页面的导航请求降级到离线页
        if (request.mode === 'navigate') {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return Response.error();
      })
  );
});

// push：收到服务端推送时弹出系统通知。payload = { title, body, link }。
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || 'TalEngineer';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { link: data.link || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// notificationclick：点击通知时聚焦已有窗口并跳转，或新开一个窗口。
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(link);
    })
  );
});
