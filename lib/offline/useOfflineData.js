// SWR 式离线数据 hook（stub）：T2 会替换为真实现。stub 直接透传 fetcher，行为与现状裸 fetch 等价。
import { useState, useEffect } from 'react';

export function useOfflineData(domain, fetcher, deps = []) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(() => fetcher())
      .then((v) => { if (alive && v !== undefined) setData(v); })
      .catch(() => {});
    return () => { alive = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, offline: false, syncedAt: null, refresh: () => {} };
}
