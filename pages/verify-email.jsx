import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// 复用 reset-password 的居中卡片样式（同为"令牌 → 单结果页"形态，不再复制一份 CSS）
import styles from './reset-password.module.css';

// 邮箱验证落地页：注册后邮件里的链接指到这里（/verify-email?token=xxx）。
// 打开即自动调用后端验证，状态机：verifying → success / error。
export default function VerifyEmail() {
  const router = useRouter();
  const [state, setState] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'notoken'
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    // router.query 在首帧可能为空，等 router 就绪再取 token
    if (!router.isReady) return;
    const token = router.query.token;
    if (!token) { setState('notoken'); return; }

    (async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) { setErrMsg(data.error || 'Verification failed.'); setState('error'); return; }
        setState('success');
      } catch {
        setErrMsg('Network error. Please try again.');
        setState('error');
      }
    })();
  }, [router.isReady, router.query.token]);

  const VIEWS = {
    verifying: { icon: '⏳', title: 'Verifying…', body: 'Confirming your email address.' },
    success:   { icon: '✅', title: 'Email Verified', body: 'Your email has been confirmed. Welcome to TalEngineer!' },
    error:     { icon: '⚠️', title: 'Verification Failed', body: errMsg },
    notoken:   { icon: '🔗', title: 'Invalid Link', body: 'This verification link is missing or malformed.' },
  };
  const v = VIEWS[state];

  return (
    <>
      <Head><title>Verify Email | TalEngineer</title></Head>
      <div className={styles.wrap}>
        <div className={styles.box}>
          <div className={styles.icon}>{v.icon}</div>
          <h2>{v.title}</h2>
          <p>{v.body}</p>
          {state === 'success' && (
            <Link href="/console" className={styles.btnPrimary}>Go to Dashboard</Link>
          )}
          {(state === 'error' || state === 'notoken') && (
            <Link href="/talent" className={styles.btnPrimary}>Return to TalEngineer</Link>
          )}
        </div>
      </div>
    </>
  );
}
