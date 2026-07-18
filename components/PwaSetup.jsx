import { useEffect, useState } from 'react';
import { runSync } from '../lib/offline/sync';

// 全站挂载一次（_app.jsx）：注册 Service Worker、显示安装提示条、登录态下订阅 Web Push、启动离线同步引擎。
const LS_USER_KEY = 'tal_user';
const LS_INSTALL_DISMISSED = 'tal_pwa_install_dismissed';
const LS_IOS_A2HS_DISMISSED = 'tal-ios-a2hs-dismissed';

// base64url 编码的 VAPID 公钥 → Uint8Array（PushManager.subscribe 的 applicationServerKey 要求）
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

// 从 localStorage 的 tal_user 取登录 token（与全站 REST 请求同源）
function getToken() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY) || '{}').token || '';
  } catch {
    return '';
  }
}

export default function PwaSetup() {
  const [installEvent, setInstallEvent] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosA2hs, setShowIosA2hs] = useState(false);

  // 1) 注册 Service Worker（离线壳 + 推送接收）
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] SW registration failed:', err && err.message);
    });
  }, []);

  // 1.5) 启动离线同步引擎：PwaSetup 全站挂载，是同步引擎全局初始化的天然位置。
  // runSync 内部绑定 online / SW message / 回前台三个触发器（幂等，重复调用不重复绑定）。
  useEffect(() => {
    runSync();
  }, []);

  // 1.6) iOS 安装引导：iOS Safari 不支持 beforeinstallprompt，只能提示用户手动"添加到主屏幕"。
  // 条件：非已安装（standalone）+ 是 iPhone/iPad + 用户没关闭过提示。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isIos = /iPhone|iPad/.test(navigator.userAgent);
    const isStandalone = navigator.standalone === true; // iOS 专有：已加到主屏幕运行时为 true
    if (isIos && !isStandalone && !localStorage.getItem(LS_IOS_A2HS_DISMISSED)) {
      setShowIosA2hs(true);
    }
  }, []);

  // 2) 安装提示条：捕获 beforeinstallprompt，用户关闭后记住（localStorage）不再打扰
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function onBeforeInstall(e) {
      e.preventDefault(); // 阻止浏览器默认弹窗，改由我们自己的提示条触发
      if (localStorage.getItem(LS_INSTALL_DISMISSED) === '1') return;
      setInstallEvent(e);
      setShowInstall(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  // 3) 登录态下订阅 Web Push：拉公钥 → 请求权限 → PushManager.subscribe → 上报后端
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const token = getToken();
    if (!token) return; // 未登录不订阅

    let cancelled = false;
    (async () => {
      try {
        // 拿 VAPID 公钥；env 未配置（configured:false）时静默跳过
        const keyRes = await fetch('/api/push/vapid-key');
        if (!keyRes.ok) return;
        const { configured, publicKey } = await keyRes.json();
        if (!configured || !publicKey) return;

        // 请求通知权限：仅在未决定（default）时弹一次；已拒绝直接放弃
        if (Notification.permission === 'denied') return;
        let permission = Notification.permission;
        if (permission === 'default') permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const reg = await navigator.serviceWorker.ready;
        // 已有订阅则复用，避免每次进站都重新订阅
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }
        if (cancelled) return;

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(sub),
        });
      } catch (err) {
        // 推送订阅是增强功能，失败不影响主流程，仅告警
        console.warn('[PWA] push subscribe failed:', err && err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch {
      // 用户取消也无所谓，收起提示条即可
    }
    setInstallEvent(null);
    setShowInstall(false);
  }

  function dismissInstall() {
    localStorage.setItem(LS_INSTALL_DISMISSED, '1'); // 记住用户已关闭，下次不再弹
    setShowInstall(false);
  }

  function dismissIosA2hs() {
    localStorage.setItem(LS_IOS_A2HS_DISMISSED, '1'); // 记住用户已关闭，下次不再提示
    setShowIosA2hs(false);
  }

  // 两个提示条互相独立：Android 走 beforeinstallprompt，iOS 走手动引导；都没有就不渲染。
  if (!showInstall && !showIosA2hs) return null;

  return (
    <>
      {showInstall && (
    <div
      role="dialog"
      aria-label="Install TalEngineer"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '1rem',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: 'calc(100vw - 2rem)',
        padding: '0.75rem 1rem',
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
      }}
    >
      <img src="/icon-192.png" alt="" width={32} height={32} style={{ borderRadius: 6 }} />
      <span style={{ flex: 1 }}>Install TalEngineer for quick access / 安装到桌面，一键直达</span>
      <button
        type="button"
        onClick={handleInstall}
        style={{
          padding: '0.4rem 0.9rem',
          fontWeight: 600,
          color: 'var(--primary-ink)',
          background: 'var(--primary)',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismissInstall}
        aria-label="Dismiss"
        style={{
          padding: '0.4rem 0.5rem',
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.1rem',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
      )}

      {showIosA2hs && (
        <div
          role="dialog"
          aria-label="Add to Home Screen"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '1rem',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: 'calc(100vw - 2rem)',
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
          }}
        >
          <span style={{ flex: 1 }}>📲 添加到主屏幕：点分享按钮 → 添加到主屏幕</span>
          <button
            type="button"
            onClick={dismissIosA2hs}
            aria-label="Dismiss"
            style={{
              padding: '0.4rem 0.5rem',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
