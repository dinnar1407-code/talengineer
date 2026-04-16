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
  const [certs, setCerts]         = useState(null);
  const [disputes, setDisputes]   = useState(null);
  const [notifs, setNotifs]       = useState(null);
  const [kycList, setKycList]     = useState(null);
  const [funnel, setFunnel]       = useState(null);

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

  async function loadCerts() {
    if (certs !== null) return;
    try {
      const res  = await fetch('/api/certifications?status=pending', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setCerts(data.data || []);
    } catch { setCerts([]); }
  }

  async function loadDisputes(status = 'open') {
    setDisputes(null);
    try {
      const res  = await fetch(`/api/disputes?status=${status}`, { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setDisputes(data.data || []);
    } catch { setDisputes([]); }
  }

  async function resolveDispute(disputeId, resolution, adminDecision) {
    try {
      const res  = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ resolution, admin_decision: adminDecision }),
      });
      if (res.ok) {
        toast.success(`Dispute #${disputeId} resolved.`);
        setDisputes(prev => prev.filter(d => d.id !== disputeId));
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to resolve.');
      }
    } catch { toast.error('Network error.'); }
  }

  async function loadNotifs() {
    if (notifs !== null) return;
    try {
      const res  = await fetch('/api/admin/notifications', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setNotifs(data);
    } catch { setNotifs({ data: [], byType: {}, unreadCount: 0 }); }
  }

  async function loadKycList(status = 'pending') {
    setKycList(null);
    try {
      const res  = await fetch(`/api/admin/kyc?status=${status}`, { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setKycList(data.data || []);
    } catch { setKycList([]); }
  }

  async function reviewKyc(userId, decision) {
    const note = decision === 'rejected' ? window.prompt('Rejection reason (optional):') : null;
    if (decision === 'rejected' && note === null) return; // cancelled
    try {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ decision, note }),
      });
      if (res.ok) {
        toast.success(`User ${decision}.`);
        setKycList(prev => (prev || []).filter(u => u.id !== userId));
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed.');
      }
    } catch { toast.error('Network error.'); }
  }

  async function loadFunnel() {
    if (funnel !== null) return;
    try {
      const res  = await fetch('/api/admin/analytics', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (res.ok) setFunnel(data);
    } catch {}
  }

  async function reviewCert(certId, status) {
    try {
      await fetch(`/api/certifications/${certId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ status }),
      });
      setCerts(prev => prev.filter(c => c.id !== certId));
      toast.success(status === 'verified' ? 'Certification verified.' : 'Certification rejected.');
    } catch { toast.error('Failed to update.'); }
  }

  const TABS = [
    { id: 'users',     label: `Users (${counts.users})` },
    { id: 'demands',   label: `Projects (${counts.demands})` },
    { id: 'talents',   label: `Engineers (${counts.talents})` },
    { id: 'ledgers',   label: `Ledger (${counts.ledgers})` },
    { id: 'certs',     label: 'Certifications' },
    { id: 'disputes',  label: 'Disputes' },
    { id: 'notifs',    label: `Notifications (${counts.notifications ?? '…'})` },
    { id: 'kyc',       label: 'KYC' },
    { id: 'analytics', label: 'Analytics' },
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
            <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`} onClick={() => { setActiveTab(t.id); if (t.id === 'certs') loadCerts(); if (t.id === 'disputes') loadDisputes(); if (t.id === 'notifs') loadNotifs(); if (t.id === 'kyc') loadKycList(); if (t.id === 'analytics') loadFunnel(); }}>{t.label}</button>
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

        {/* Certifications */}
        {activeTab === 'certs' && (
          <table className={styles.table}>
            <thead><tr><th>Engineer</th><th>Certification</th><th>Type</th><th>Number</th><th>Expiry</th><th>File</th><th>Action</th></tr></thead>
            <tbody>
              {certs === null
                ? <tr><td colSpan={7} className={styles.empty}>Loading…</td></tr>
                : certs.length === 0
                  ? <tr><td colSpan={7} className={styles.empty}>No pending certifications.</td></tr>
                  : certs.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.talents?.name}<br /><span className={styles.muted}>{c.talents?.contact}</span></td>
                      <td>{c.cert_name}</td>
                      <td><span className={`${styles.badge} ${styles.badgeGray}`}>{c.cert_type}</span></td>
                      <td className={styles.muted}>{c.cert_number || '—'}</td>
                      <td className={styles.muted}>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                      <td>{c.file_url ? <a href={c.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 12 }}>View ↗</a> : '—'}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => reviewCert(c.id, 'verified')} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✅ Verify</button>
                        <button onClick={() => reviewCert(c.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✗ Reject</button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        )}

        {/* Disputes */}
        {activeTab === 'disputes' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {['open', 'under_review', 'resolved_engineer', 'resolved_employer', 'resolved_split'].map(s => (
                <button key={s} onClick={() => loadDisputes(s)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>{s.replace(/_/g, ' ')}</button>
              ))}
            </div>
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Milestone</th><th>Opened By</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {disputes === null
                  ? <tr><td colSpan={6} className={styles.empty}>Loading…</td></tr>
                  : disputes.length === 0
                    ? <tr><td colSpan={6} className={styles.empty}>No disputes with this status.</td></tr>
                    : disputes.map(d => (
                      <tr key={d.id}>
                        <td>#{d.id}</td>
                        <td>{d.project_milestones?.phase_name || '—'}<br /><span className={styles.muted}>${parseFloat(d.project_milestones?.amount || 0).toLocaleString()}</span></td>
                        <td className={styles.muted} style={{ fontSize: 12 }}>{d.opened_by_email}</td>
                        <td style={{ maxWidth: 200, fontSize: 12 }}>{d.reason?.slice(0, 80)}{d.reason?.length > 80 ? '…' : ''}</td>
                        <td><span className={`${styles.badge} ${styles.badgeGray}`}>{d.status}</span></td>
                        <td>
                          {!d.status?.startsWith('resolved') && (
                            <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                              <button onClick={() => { const dec = window.prompt('Admin decision note:'); if (dec) resolveDispute(d.id, 'resolved_engineer', dec); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>→ Engineer</button>
                              <button onClick={() => { const dec = window.prompt('Admin decision note:'); if (dec) resolveDispute(d.id, 'resolved_employer', dec); }} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>→ Employer</button>
                              <button onClick={() => { const dec = window.prompt('Admin decision note:'); if (dec) resolveDispute(d.id, 'resolved_split', dec); }} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Split</button>
                              <a href={`/dispute/${d.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--primary)', padding: '3px 8px', border: '1px solid var(--primary)', borderRadius: 4, textAlign: 'center', textDecoration: 'none' }}>View ↗</a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifs' && (
          <div>
            {notifs === null ? (
              <p className={styles.empty}>Loading…</p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  {Object.entries(notifs.byType || {}).map(([type, count]) => (
                    <div key={type} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
                      <strong>{count}</strong> <span style={{ color: 'var(--muted)' }}>{type.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
                    <strong>{notifs.unreadCount}</strong> <span style={{ color: '#92400e' }}>unread</span>
                  </div>
                </div>
                <table className={styles.table}>
                  <thead><tr><th>Type</th><th>User</th><th>Title</th><th>Read</th><th>Date</th></tr></thead>
                  <tbody>
                    {notifs.data.length === 0
                      ? <tr><td colSpan={5} className={styles.empty}>No notifications yet.</td></tr>
                      : notifs.data.map(n => (
                        <tr key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
                          <td><span className={`${styles.badge} ${styles.badgeGray}`}>{n.type.replace(/_/g, ' ')}</span></td>
                          <td className={styles.muted} style={{ fontSize: 12 }}>{n.user_email}</td>
                          <td style={{ maxWidth: 240, fontSize: 13 }}>{n.title}</td>
                          <td>{n.read ? '✅' : '🔵'}</td>
                          <td className={styles.muted}>{new Date(n.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* KYC */}
        {activeTab === 'kyc' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {['pending', 'verified', 'rejected', 'unverified'].map(s => (
                <button key={s} onClick={() => loadKycList(s)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>{s}</button>
              ))}
            </div>
            <table className={styles.table}>
              <thead><tr><th>Email</th><th>Company</th><th>Website</th><th>Phone</th><th>Submitted</th><th>Note</th><th>Action</th></tr></thead>
              <tbody>
                {kycList === null
                  ? <tr><td colSpan={7} className={styles.empty}>Loading…</td></tr>
                  : kycList.length === 0
                    ? <tr><td colSpan={7} className={styles.empty}>No users with this status.</td></tr>
                    : kycList.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontSize: 12 }}>{u.email}</td>
                        <td style={{ fontWeight: 600 }}>{u.company_name || '—'}</td>
                        <td style={{ fontSize: 12 }}>{u.company_website ? <a href={u.company_website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Link ↗</a> : '—'}</td>
                        <td style={{ fontSize: 12 }}>{u.company_phone || '—'}</td>
                        <td className={styles.muted}>{u.kyc_submitted_at ? new Date(u.kyc_submitted_at).toLocaleDateString() : '—'}</td>
                        <td style={{ fontSize: 12, maxWidth: 140 }}>{u.kyc_note || '—'}</td>
                        <td>
                          {u.kyc_status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => reviewKyc(u.id, 'verified')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✅ Verify</button>
                              <button onClick={() => reviewKyc(u.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✗ Reject</button>
                            </div>
                          )}
                          {u.kyc_status !== 'pending' && <span className={`${styles.badge} ${u.kyc_status === 'verified' ? styles.badgeGreen : styles.badgeGray}`}>{u.kyc_status}</span>}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics / Funnel */}
        {activeTab === 'analytics' && (
          <div>
            {funnel === null ? (
              <p className={styles.empty}>Loading…</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Total Posted', value: funnel.funnel?.posted ?? 0 },
                    { label: 'Open', value: funnel.funnel?.open ?? 0 },
                    { label: 'Assigned', value: funnel.funnel?.assigned ?? 0 },
                    { label: 'Completed', value: funnel.funnel?.completed ?? 0 },
                    { label: 'Total Applications', value: funnel.funnel?.total_applies ?? 0 },
                    { label: 'Conversion %', value: `${funnel.funnel?.conversion_pct ?? 0}%` },
                    { label: 'KYC Pending', value: funnel.kyc_pending ?? 0 },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 800 }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Conversion Funnel</div>
                  {[
                    { label: 'Projects Posted', value: funnel.funnel?.posted, color: '#6366f1' },
                    { label: 'Open (Accepting Applications)', value: funnel.funnel?.open, color: '#f59e0b' },
                    { label: 'Assigned / In Progress', value: funnel.funnel?.assigned, color: '#10b981' },
                    { label: 'Completed', value: funnel.funnel?.completed, color: '#059669' },
                  ].map(row => {
                    const pct = funnel.funnel?.posted ? Math.round((row.value / funnel.funnel.posted) * 100) : 0;
                    return (
                      <div key={row.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>{row.label}</span><span style={{ fontWeight: 700 }}>{row.value} ({pct}%)</span>
                        </div>
                        <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                          <div style={{ width: `${pct}%`, background: row.color, height: 6, borderRadius: 4, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
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
