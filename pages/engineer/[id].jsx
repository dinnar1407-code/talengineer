import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import styles from './engineer.module.css';

const CERT_TYPES = ['OSHA-10', 'OSHA-30', 'Electrical License', 'Siemens Certified', 'Rockwell/Allen-Bradley', 'Fanuc Robotics', 'CSIA Certified', 'PMP', 'Other'];

export default function EngineerProfile() {
  const router = useRouter();
  const toast  = useToast();
  const { id } = router.query;
  const [engineer, setEngineer]   = useState(null);
  const [certs, setCerts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm]   = useState({ cert_name: '', cert_type: 'OSHA-10', cert_number: '', issuing_org: '', issue_date: '', expiry_date: '', file_url: '' });
  const [submittingCert, setSubmittingCert] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/talent/profile/${id}`).then(r => r.json()),
      fetch(`/api/certifications/${id}`).then(r => r.json()),
    ]).then(([eng, certsData]) => {
      setEngineer(eng.data || null);
      setCerts(certsData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function submitCert(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    setSubmittingCert(true);
    try {
      const res  = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(certForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Certification submitted for review.');
        setCerts(prev => [data.data, ...prev]);
        setShowCertForm(false);
        setCertForm({ cert_name: '', cert_type: 'OSHA-10', cert_number: '', issuing_org: '', issue_date: '', expiry_date: '', file_url: '' });
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setSubmittingCert(false);
  }

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} style={{ height: 120 }} />
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className={styles.wrap}>
        <div className={styles.notFound}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <h2>Engineer not found</h2>
          <Link href="/talent" className={styles.btnBack}>← Back to Talent Hub</Link>
        </div>
      </div>
    );
  }

  const isVerified = (engineer.verified_score || 0) >= 80;

  return (
    <>
      <Head><title>{engineer.name} | TalEngineer</title></Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>⚙️ TalEngineer</Link>
        <Link href="/talent" className={styles.btnBack}>← Talent Hub</Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.topRow}>
            <div className={styles.avatar}>{engineer.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className={styles.name}>
                {engineer.name}
                {isVerified && <span className={styles.verifiedBadge}>🛡️ Nexus Verified</span>}
              </h1>
              <div className={styles.meta}>
                <span className={styles.chip}>📍 {engineer.region}</span>
                <span className={styles.chip}>⭐ {engineer.level}</span>
                <span className={styles.chip}>💰 {engineer.rate}</span>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className={styles.scoreBanner}>
              <span className={styles.scoreLabel}>Nexus Verified Score</span>
              <span className={styles.scoreVal}>{engineer.verified_score}</span>
              <div className={styles.scoreBar}>
                <div className={styles.scoreBarFill} style={{ width: `${engineer.verified_score}%` }} />
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Skills & Expertise</div>
            <div className={styles.skillsList}>
              {(engineer.skills || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean).map(skill => (
                <span key={skill} className={styles.skillChip}>{skill}</span>
              ))}
            </div>
          </div>

          {engineer.bio && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>About</div>
              <p className={styles.bio}>{engineer.bio}</p>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Member since</span><span>{new Date(engineer.created_at).toLocaleDateString()}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Pricing model</span><span style={{ textTransform: 'capitalize' }}>{engineer.pricing_model || 'Hourly'}</span></div>
            </div>
          </div>

          {/* Certifications */}
          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className={styles.sectionTitle}>Certifications & Licenses</div>
              {currentUser && <button onClick={() => setShowCertForm(v => !v)} style={{ fontSize: 12, background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>+ Add</button>}
            </div>

            {showCertForm && (
              <form onSubmit={submitCert} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} placeholder="Certification Name *" value={certForm.cert_name} onChange={e => setCertForm(f => ({ ...f, cert_name: e.target.value }))} required />
                  <select style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} value={certForm.cert_type} onChange={e => setCertForm(f => ({ ...f, cert_type: e.target.value }))}>
                    {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} placeholder="Cert Number" value={certForm.cert_number} onChange={e => setCertForm(f => ({ ...f, cert_number: e.target.value }))} />
                  <input style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} placeholder="Issuing Organization" value={certForm.issuing_org} onChange={e => setCertForm(f => ({ ...f, issuing_org: e.target.value }))} />
                  <input type="date" style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} placeholder="Issue Date" value={certForm.issue_date} onChange={e => setCertForm(f => ({ ...f, issue_date: e.target.value }))} />
                  <input type="date" style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} placeholder="Expiry Date" value={certForm.expiry_date} onChange={e => setCertForm(f => ({ ...f, expiry_date: e.target.value }))} />
                </div>
                <input style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} placeholder="Certificate File URL (Google Drive / Dropbox link)" value={certForm.file_url} onChange={e => setCertForm(f => ({ ...f, file_url: e.target.value }))} />
                <button type="submit" disabled={submittingCert} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {submittingCert ? 'Submitting…' : 'Submit for Review'}
                </button>
              </form>
            )}

            {certs.length === 0
              ? <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>No certifications added yet.</p>
              : certs.map(cert => (
                <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {cert.cert_name}
                      {cert.status === 'verified' && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}>✅ Verified</span>}
                      {cert.status === 'pending' && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(244,196,48,0.1)', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>⏳ Pending</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {cert.cert_type}{cert.issuing_org ? ` · ${cert.issuing_org}` : ''}{cert.cert_number ? ` · #${cert.cert_number}` : ''}
                      {cert.expiry_date ? ` · Expires ${new Date(cert.expiry_date).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  {cert.file_url && <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', flexShrink: 0 }}>View ↗</a>}
                </div>
              ))
            }
          </div>

          <a
            href={`mailto:${engineer.contact}?subject=TalEngineer Project Inquiry for ${encodeURIComponent(engineer.name)}`}
            className={styles.btnContact}
          >
            📧 Invite to Project
          </a>
        </div>
      </div>
    </>
  );
}
