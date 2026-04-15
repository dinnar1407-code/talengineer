import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useToast } from '../components/Toast';
import styles from './admin.module.css';

export default function Admin() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [authed, setAuthed]     = useState(false);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Wrong password'); setLoading(false); return; }
      setStats(data);
      setAuthed(true);
    } catch { toast.error('Network error.'); }
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (res.ok) { setStats(data); toast.success('Refreshed.'); }
    } catch { toast.error('Failed to refresh.'); }
    setLoading(false);
  }

  if (!authed) {
    return (
      <>
        <Head><title>Admin | Talengineer</title></Head>
        <div className={styles.loginWrap}>
          <form className={styles.loginBox} onSubmit={handleLogin}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>🔐</div>
            <h2>Admin Dashboard</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Enter your admin password to continue</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" className={styles.input} autoFocus required />
            <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Verifying...' : 'Enter Dashboard'}</button>
          </form>
        </div>
      </>
    );
  }

  const { counts, revenue, recent } = stats;

  const TABS = [
    { id: 'users',   label: `Users (${counts.users})` },
    { id: 'demands', label: `Projects (${counts.demands})` },
    { id: 'talents', label: `Engineers (${counts.talents})` },
    { id: 'ledgers', label: `Ledger (${counts.ledgers})` },
  ];

  return (
    <>
      <Head><title>Admin Dashboard | Talengineer</title></Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Admin Panel</span>
          <button className={styles.btnRefresh} onClick={refresh} disabled={loading}>↻ Refresh</button>
          <button className={styles.btnLogout} onClick={() => { setAuthed(false); setStats(null); }}>Exit</button>
        </div>
      </header>

      <div className={styles.container}>
        {/* Metric cards */}
        <div className={styles.metrics}>
          <MetricCard label="Total Users"     value={counts.users}   icon="👤" />
          <MetricCard label="Total Projects"  value={counts.demands} icon="📋" />
          <MetricCard label="Engineers"       value={counts.talents} icon="🔧" />
          <MetricCard label="Platform Revenue" value={`$${revenue.toFixed(0)}`} icon="💰" highlight />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Users */}
        {activeTab === 'users' && (
          <table className={styles.table}>
            <thead><tr><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {recent.users.length === 0
                ? <tr><td colSpan={3} className={styles.empty}>No users yet.</td></tr>
                : recent.users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td><span className={`${styles.badge} ${u.role === 'engineer' ? styles.badgeBlue : styles.badgeGreen}`}>{u.role}</span></td>
                    <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}

        {/* Projects */}
        {activeTab === 'demands' && (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Status</th><th>Budget</th><th>Posted</th></tr></thead>
            <tbody>
              {recent.demands.length === 0
                ? <tr><td colSpan={4} className={styles.empty}>No projects yet.</td></tr>
                : recent.demands.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td><span className={`${styles.badge} ${styles['status_' + d.status]}`}>{d.status}</span></td>
                    <td>{d.budget}</td>
                    <td className={styles.muted}>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}

        {/* Engineers */}
        {activeTab === 'talents' && (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Region</th><th>Score</th><th>Joined</th></tr></thead>
            <tbody>
              {recent.talents.length === 0
                ? <tr><td colSpan={4} className={styles.empty}>No engineers yet.</td></tr>
                : recent.talents.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td>{t.region}</td>
                    <td>
                      <span className={`${styles.badge} ${t.verified_score >= 80 ? styles.badgeGreen : styles.badgeGray}`}>
                        {t.verified_score >= 80 ? '🛡️ ' : ''}{t.verified_score ?? '—'}
                      </span>
                    </td>
                    <td className={styles.muted}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}

        {/* Ledger */}
        {activeTab === 'ledgers' && (
          <table className={styles.table}>
            <thead><tr><th>Demand ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent.ledgers.length === 0
                ? <tr><td colSpan={4} className={styles.empty}>No ledger entries yet.</td></tr>
                : recent.ledgers.map(l => (
                  <tr key={l.id}>
                    <td>#{l.demand_id || l.id}</td>
                    <td style={{ fontWeight: 600 }}>${(l.total_amount || 0).toLocaleString()}</td>
                    <td><span className={`${styles.badge} ${styles['status_' + l.status]}`}>{l.status}</span></td>
                    <td className={styles.muted}>{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, icon, highlight }) {
  return (
    <div className={`${styles.metricCard} ${highlight ? styles.metricHighlight : ''}`}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={styles.metricVal}>{value}</div>
      <div className={styles.metricLabel}>{label}</div>
    </div>
  );
}
