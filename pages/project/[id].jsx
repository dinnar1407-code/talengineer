import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import Navbar from '../../components/Navbar';
import { useLang } from '../../hooks/useLang';
import styles from './project.module.css';

const STATUS_COLOR = { open: '#10b981', in_progress: '#0056b3', completed: '#6b7280', payment_failed: '#ef4444' };

export default function ProjectDetail() {
  const router = useRouter();
  const toast  = useToast();
  const [lang, setLang] = useLang();
  const { id } = router.query;

  const [project, setProject]       = useState(null);
  const [applications, setApplications] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [applying, setApplying]     = useState(false);
  const [applyMsg, setApplyMsg]     = useState('');
  const [quotedRate, setQuotedRate] = useState('');
  const [quotedDays, setQuotedDays] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [assigning, setAssigning]   = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/demand/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d.data || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!project || !currentUser || currentUser.role !== 'employer') return;
    fetch(`/api/demand/${id}/applications`, {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    })
      .then(r => r.json())
      .then(d => setApplications(d.data || []))
      .catch(() => setApplications([]));
  }, [project, currentUser]);

  async function handleApply(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    setApplying(true);
    try {
      const res  = await fetch('/api/demand/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: id, message: applyMsg, quoted_rate: quotedRate, quoted_days: quotedDays || undefined, quote_amount: quoteAmount || undefined }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Application submitted!'); setApplyMsg(''); }
      else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setApplying(false);
  }

  async function handleAssign(engineerId) {
    setAssigning(engineerId);
    try {
      const res  = await fetch('/api/demand/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: id, engineer_id: engineerId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Engineer assigned! Email notification sent.');
        setApplications(prev => prev.map(a => ({
          ...a,
          status: a.talents?.id === engineerId ? 'accepted' : 'rejected',
        })));
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setAssigning(null);
  }

  if (loading) return (
    <div className={styles.wrap}>
      {[0,1,2].map(i => <div key={i} className={styles.skeleton} />)}
    </div>
  );

  if (!project) return (
    <div className={styles.wrap}>
      <div className={styles.notFound}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <h2>Project not found</h2>
        <Link href="/talent" className={styles.btnBack}>← Back to Talent Hub</Link>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>{project.title} | TalEngineer</title></Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.wrap}>
        {/* ── Project header ── */}
        <div className={styles.card}>
          <div className={styles.projectHeader}>
            <div>
              <h1 className={styles.title}>{project.title}</h1>
              <div className={styles.meta}>
                <span className={styles.chip}>📍 {project.location || project.region}</span>
                <span className={styles.chip}>⚙️ {project.role_required}</span>
                <span className={styles.chip}>💰 {project.budget}</span>
                <span className={styles.chip}>📋 {project.project_type}</span>
              </div>
            </div>
            <div className={styles.statusBadge} style={{ background: `${STATUS_COLOR[project.status] || '#6b7280'}22`, color: STATUS_COLOR[project.status] || '#6b7280', borderColor: STATUS_COLOR[project.status] || '#6b7280' }}>
              {project.status?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          <p className={styles.desc}>{project.description}</p>
          <div className={styles.postedDate}>Posted {new Date(project.created_at).toLocaleDateString()}</div>
        </div>

        {/* ── Milestones ── */}
        {project.milestones?.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>💼 Escrow Milestones</h3>
            <div className={styles.milestoneList}>
              {project.milestones.map(m => (
                <div key={m.id} className={styles.milestone}>
                  <div>
                    <div className={styles.milestoneName}>{m.phase_name}</div>
                    <div className={styles.milestonePercent}>{(m.percentage * 100).toFixed(0)}% of total</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.milestoneAmount}>${(m.amount || 0).toLocaleString()}</div>
                    <span className={`${styles.msBadge} ${styles['ms_' + (m.status || 'locked')]}`}>{(m.status || 'locked').toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Apply (for engineers) ── */}
        {currentUser?.role === 'engineer' && project.status === 'open' && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>🙋 Apply to This Project</h3>
            <form onSubmit={handleApply}>
              {/* Quote fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Your Rate</label>
                  <input
                    className={styles.textarea}
                    style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                    value={quotedRate}
                    onChange={e => setQuotedRate(e.target.value)}
                    placeholder="e.g. $80/hr or $1200 flat"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Est. Days</label>
                  <input
                    type="number"
                    className={styles.textarea}
                    style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                    value={quotedDays}
                    onChange={e => setQuotedDays(e.target.value)}
                    placeholder="e.g. 3"
                    min="1"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Total Quote (USD)</label>
                  <input
                    type="number"
                    className={styles.textarea}
                    style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder="e.g. 1200"
                    min="0"
                  />
                </div>
              </div>
              <textarea
                className={styles.textarea}
                rows={4}
                value={applyMsg}
                onChange={e => setApplyMsg(e.target.value)}
                placeholder="Introduce yourself and explain why you're a great fit for this project…"
              />
              <button type="submit" className={styles.btnApply} disabled={applying}>
                {applying ? 'Submitting…' : 'Submit Proposal'}
              </button>
            </form>
          </div>
        )}

        {/* ── Applications (for employers) ── */}
        {currentUser?.role === 'employer' && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>📋 Applications {applications !== null && `(${applications.length})`}</h3>
            {applications === null
              ? <div className={styles.skeleton} />
              : applications.length === 0
                ? <p className={styles.empty}>No applications yet. Engineers will appear here once they apply.</p>
                : applications.map(app => (
                  <div key={app.id} className={styles.appRow}>
                    <div className={styles.appInfo}>
                      <div className={styles.appName}>
                        {app.talents?.name}
                        {(app.talents?.verified_score || 0) >= 80 && <span className={styles.verifiedChip}>🛡️ Verified ({app.talents.verified_score})</span>}
                      </div>
                      <div className={styles.appMeta}>
                        <span>{app.talents?.region}</span>
                        <span>·</span>
                        <span>{app.talents?.skills?.split(',')[0]}</span>
                        <span>·</span>
                        <span>{app.talents?.rate}</span>
                      </div>
                      {/* Quote details */}
                      {(app.quoted_rate || app.quoted_days || app.quote_amount) && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '6px 0' }}>
                          {app.quoted_rate   && <span style={{ background: 'rgba(0,86,179,.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>💰 {app.quoted_rate}</span>}
                          {app.quoted_days   && <span style={{ background: 'rgba(16,185,129,.08)', color: '#059669', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>📅 {app.quoted_days}d</span>}
                          {app.quote_amount  && <span style={{ background: 'rgba(245,158,11,.08)', color: '#d97706', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>🧾 ${Number(app.quote_amount).toLocaleString()} total</span>}
                        </div>
                      )}
                      {app.message && <p className={styles.appMsg}>{app.message}</p>}
                    </div>
                    <div className={styles.appActions}>
                      {app.status === 'accepted'
                        ? <span className={styles.acceptedBadge}>✅ Assigned</span>
                        : app.status === 'rejected'
                          ? <span className={styles.rejectedBadge}>Declined</span>
                          : (
                            <>
                              <Link href={`/engineer/${app.talents?.id}`} className={styles.btnViewProfile}>View Profile</Link>
                              <button
                                className={styles.btnAssign}
                                disabled={assigning === app.talents?.id}
                                onClick={() => handleAssign(app.talents?.id)}
                              >
                                {assigning === app.talents?.id ? 'Assigning…' : 'Assign'}
                              </button>
                            </>
                          )
                      }
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </>
  );
}
