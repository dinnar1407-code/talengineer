// 同步引擎：把「读缓存」和「发件箱重放」的触发时机集中在这里。
// runSync() 在 PwaSetup 挂载时全局调用一次，负责绑定三个重放触发器（回网/SW 唤醒/回前台）。

const { mirrorGet, mirrorPut } = require('./idb');
const { replayAll } = require('./outbox');

// SWR 式取数：先拿本地镜像兜底，再跑 fetcher；
// fetcher 成功 → 落镜像并返回新值；fetcher 失败（断网）→ 回退镜像数据。
async function mirrorFetch(domain, fetcher) {
  const cached = await mirrorGet(domain);
  try {
    const fresh = await fetcher();
    if (fresh != null) {
      await mirrorPut(domain, fresh);
      return fresh;
    }
    return cached ? cached.data : null;
  } catch (e) {
    return cached ? cached.data : null; // 网络失败：回退镜像
  }
}

// 广播 outbox-change，让 OfflineBanner 刷新待同步计数。
function emitOutboxChange() {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('outbox-change'));
  }
}

// 幂等标记：保证事件监听只绑定一次，重复调用 runSync 不会重复绑定。
let bound = false;

// 启动同步引擎：立即重放一次，并绑定回网/SW 消息/回前台三个触发器。
function runSync() {
  if (typeof window === 'undefined') return;

  // 立即尝试重放一次（在线才会真正发出请求），完成后广播让横幅更新计数。
  replayAll().catch(() => {}).then(emitOutboxChange, emitOutboxChange);

  if (bound) return; // 已绑定过就只跑重放、不重复绑事件
  bound = true;

  // 触发器一：浏览器 online 事件（网络恢复）
  window.addEventListener('online', () => {
    replayAll().catch(() => {}).then(emitOutboxChange, emitOutboxChange);
  });

  // 触发器二：回到前台（切回本标签页），弱网下常比 online 事件更早触发
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      replayAll().catch(() => {}).then(emitOutboxChange, emitOutboxChange);
    }
  });

  // 触发器三：Service Worker 的 Background Sync 广播（页面关了又被唤醒时走这条）
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'outbox-sync') {
        replayAll().catch(() => {}).then(emitOutboxChange, emitOutboxChange);
      }
    });
  }
}

module.exports = { mirrorFetch, runSync };
