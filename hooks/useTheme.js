import { useState, useEffect, useCallback } from 'react';

// ── 全站主题 hook ──────────────────────────────────────────────────────────
// 真值存在 <html data-theme> 上（由 _document 行内脚本在首帧前写好），
// 这里读取并订阅它的变化，切换时同步写回 <html> + localStorage('tal-theme')。
// 用 MutationObserver 让多个消费者（共享 Navbar、落地页自带导航）保持同步。
const LS_KEY = 'tal-theme';

function readTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  // SSR / 首帧统一 'light'，挂载后再同步真实值，避免 hydration 不一致
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    setThemeState(readTheme());

    // 订阅 <html data-theme> 变化：任一处切换，所有消费者同步
    const obs = new MutationObserver(() => setThemeState(readTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // 跨标签页同步
    function onStorage(e) {
      if (e.key === LS_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);

    return () => { obs.disconnect(); window.removeEventListener('storage', onStorage); };
  }, []);

  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return;
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(LS_KEY, next); } catch {}
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggle };
}
