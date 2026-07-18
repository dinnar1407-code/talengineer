// 离线状态横幅：无 props，各工作面页面顶部挂一个 <OfflineBanner />。
// 两件事：
//   1) 断网时显示「📴 离线中 · 数据截至 HH:MM」（HH:MM = 最后一次在线的时刻，约等于数据的新鲜度）
//   2) 发件箱有排队时显示「N 条待同步」（监听 outbox-change 事件实时更新）
// 在线且队列为空 → 返回 null（不占地方）。
import { useEffect, useState } from 'react';
import { pendingCount } from '../lib/offline/outbox';

export default function OfflineBanner() {
  // 初值给「在线」：服务端渲染时 navigator 不存在，真实状态在 useEffect（仅客户端）里读。
  const [online, setOnline] = useState(true);
  const [lastOnlineAt, setLastOnlineAt] = useState(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    // 挂载即读真实联网状态与当前待同步条数
    setOnline(navigator.onLine);
    setLastOnlineAt(Date.now());
    pendingCount().then(setPending).catch(() => {});

    const onOnline = () => {
      setOnline(true);
      setLastOnlineAt(Date.now()); // 重新在线：更新「数据截至」基准
    };
    const onOffline = () => setOnline(false);
    // 队列变更时重新数一遍待同步条数
    const onOutboxChange = () => { pendingCount().then(setPending).catch(() => {}); };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('outbox-change', onOutboxChange);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('outbox-change', onOutboxChange);
    };
  }, []);

  // 在线且无排队：不显示
  if (online && pending === 0) return null;

  const hhmm = lastOnlineAt
    ? new Date(lastOnlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // 文案：断网优先显示离线状态，再补待同步条数；仅有排队（已回网同步中）则只显示条数。
  let text;
  if (!online) {
    text = `📴 离线中 · 数据截至 ${hhmm}`;
    if (pending > 0) text += ` · ${pending} 条待同步`;
  } else {
    text = `🔄 ${pending} 条待同步`;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3000,
        // 琥珀色半透明底 + 白字：深浅色主题下都清晰可读，不依赖主题变量
        background: 'rgba(180, 83, 9, 0.96)',
        color: '#fff',
        textAlign: 'center',
        padding: '0.4rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        lineHeight: 1.4,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}
    >
      {text}
    </div>
  );
}
