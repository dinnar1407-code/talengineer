// SWR 式离线数据 hook：先渲染 IndexedDB 镜像（毫秒级、断网也有），后台再请求刷新。
// 返回 { data, offline, syncedAt, refresh }：
//   data     —— 当前展示的数据（镜像或最新）
//   offline  —— 后台请求失败（断网）时为 true，此时 data 是镜像
//   syncedAt —— 这份数据的同步时间戳（供「数据截至」显示）
//   refresh  —— 手动重新拉取
import { useState, useEffect, useCallback } from 'react';
import { mirrorGet, mirrorPut } from './idb';

export function useOfflineData(domain, fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [offline, setOffline] = useState(false);

  // 拉取最新数据：成功则更新内存 + 落镜像 + offline=false；失败（断网）则 offline=true 保持镜像。
  const refresh = useCallback(async () => {
    try {
      const fresh = await fetcher();
      if (fresh !== undefined && fresh !== null) {
        setData(fresh);
        setSyncedAt(Date.now());
        setOffline(false);
        mirrorPut(domain, fresh); // 不 await：落盘失败不影响页面展示
      }
    } catch (e) {
      setOffline(true); // 网络失败：保持镜像数据不动
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let alive = true;
    // 先渲染镜像：仅当内存里还没有数据时才用镜像回填，避免覆盖已刷新的新值。
    mirrorGet(domain).then((hit) => {
      if (alive && hit) {
        setData((cur) => (cur === null ? hit.data : cur));
        setSyncedAt((cur) => (cur === null ? hit.syncedAt : cur));
      }
    });
    refresh();
    // 回网自动重新拉取
    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => {
      alive = false;
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, offline, syncedAt, refresh };
}
