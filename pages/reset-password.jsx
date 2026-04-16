import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import styles from './reset-password.module.css';

export default function ResetPassword() {
  const router  = useRouter();
  const toast   = useToast();
  const [token, setToken]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    const t = router.query.token;
    if (t) setToken(t);
  }, [router.query]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match.'); return; }
    if (password.length < 8)  { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Reset failed.'); setLoading(false); return; }
      setDone(true);
      toast.success('Password updated! You can now sign in.');
      setTimeout(() => router.push('/finance'), 2500);
    } catch { toast.error('Network error. Please try again.'); }
    setLoading(false);
  }

  if (!token) {
    return (
      <>
        <Head><title>Reset Password | TalEngineer</title></Head>
        <div className={styles.wrap}>
          <div className={styles.box}>
            <div className={styles.icon}>🔗</div>
            <h2>Invalid Link</h2>
            <p>This password reset link is missing or has expired.</p>
            <Link href="/finance" className={styles.btnPrimary}>Return to Sign In</Link>
          </div>
        </div>
      </>
    );
  }

  if (done) {
    return (
      <>
        <Head><title>Password Updated | TalEngineer</title></Head>
        <div className={styles.wrap}>
          <div className={styles.box}>
            <div className={styles.icon}>✅</div>
            <h2>Password Updated</h2>
            <p>Redirecting you to the dashboard…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Reset Password | TalEngineer</title></Head>
      <div className={styles.wrap}>
        <form className={styles.box} onSubmit={handleSubmit}>
          <div className={styles.icon}>🔐</div>
          <h2>Set New Password</h2>
          <p className={styles.sub}>Choose a strong password (min. 8 characters).</p>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            className={styles.input} placeholder="New password" required autoFocus
          />
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            className={styles.input} placeholder="Confirm new password" required
          />
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
          <Link href="/finance" className={styles.backLink}>← Back to Sign In</Link>
        </form>
      </div>
    </>
  );
}
