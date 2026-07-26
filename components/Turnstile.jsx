import { useEffect, useRef } from 'react';

// ── Cloudflare Turnstile 挂件（Wave A / A4）───────────────────────────────────
// 服务端对应 src/utils/turnstile.js；两边同一个开关逻辑：没配 key 就当不存在。
//   - 没配 NEXT_PUBLIC_TURNSTILE_SITE_KEY → 本组件渲染 null，表单照常可提交
//     （服务端也 fail-open）。这样代码可以先于 env 上线，不会把注册打挂。
//   - 配了 → 渲染挑战框，拿到 token 交给父组件随表单一起 POST（字段名 turnstile_token）。
//
// 用显式渲染（?render=explicit + turnstile.render）而不是隐式的 class="cf-turnstile"：
// React 会重排 DOM，隐式扫描在 SPA 里经常扫不到或重复渲染出两个框。
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// 是否启用——供父组件决定"没拿到 token 时要不要拦住提交"
export const turnstileEnabled = Boolean(SITE_KEY);

// 脚本全局只加载一次（多个挂件共用同一份 promise，避免重复插 <script>）
let scriptPromise = null;
function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile script failed to load')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * @param {(token: string) => void} onToken 拿到 token 时回调；过期/出错时回调空串（父组件据此禁用提交）
 */
export default function Turnstile({ onToken }) {
  const boxRef = useRef(null);
  const widgetIdRef = useRef(null);
  // 回调放 ref：父组件每次重渲染都会传新函数，直接进 useEffect 依赖会导致挂件被反复销毁重建
  const cbRef = useRef(onToken);
  cbRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(boxRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => cbRef.current(token),
          // token 有生命期（约 5 分钟），过期后必须清掉——否则用户慢慢填完表单提交，
          // 服务端会以 timeout-or-duplicate 拒绝，用户看到的却是莫名其妙的"验证失败"
          'expired-callback': () => cbRef.current(''),
          'error-callback': () => cbRef.current(''),
        });
      })
      .catch((err) => {
        // 脚本加载失败（网络/拦截插件）：不阻断页面，服务端那侧会兜住
        console.error('[Turnstile] load failed:', err);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* 挂件已被卸载，忽略 */ }
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={boxRef} style={{ margin: '4px 0 12px' }} />;
}
