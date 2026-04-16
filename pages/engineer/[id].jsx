import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import styles from './engineer.module.css';

const CERT_TYPES = ['OSHA-10', 'OSHA-30', 'Electrical License', 'Siemens Certified', 'Rockwell/Allen-Bradley', 'Fanuc Robotics', 'CSIA Certified', 'PMP', 'General Liability Insurance', 'Workers Comp Insurance', 'Other'];

const AVAIL_LABEL = { available: { label: '🟢 Available Now', color: '#10b981' }, busy: { label: '🟡 Available Soon', color: '#f59e0b' }, unavailable: { label: '🔴 Not Available', color: '#ef4444' } };

function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

export default function EngineerProfile() {
  const router = useRouter();
  const toast  = useToast();
  const { id, review: reviewParam, demand_id: demandIdParam } = router.query;

  const [engineer, setEngineer]   = useState(null);
  const [certs, setCerts]         = useState([]);
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Cert form
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm]   = useState({ cert_name: '', cert_type: 'OSHA-10', cert_number: '', issuing_org: '', issue_date: '', expiry_date: '', file_url: '' });
  const [submittingCert, setSubmittingCert] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewComment, setReviewComment]   = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/talent/profile/${id}`).then(r => r.json()),
      fetch(`/api/certifications/${id}`).then(r => r.json()),
      fetch(`/api/reviews/engineer/${id}`).then(r => r.json()),
    ]).then(([eng, certsData, reviewsData]) => {
      setEngineer(eng.data || null);
      setCerts(certsData.data || []);
      setReviews(reviewsData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Auto-open review form if arrived from email link
  useEffect(() => {
    if (reviewParam === '1' && currentUser?.token && id) {
      checkAlreadyReviewed();
    }
  }, [reviewParam, currentUser, id]);

  async function checkAlreadyReviewed() {
    if (!demandIdParam || !currentUser?.token) return;
    try {
      const res  = await fetch(`/api/reviews/check/${demandIdParam}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      const data = await res.json();
      if (data.reviewed) { setAlreadyReviewed(true); }
      else { setShowReviewForm(true); }
    } catch {}
  }

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

  async function submitReview(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    if (!demandIdParam) { toast.error('No project associated with this review.'); return; }
    setSubmittingReview(true);
    try {
      const res  = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: parseInt(demandIdParam), engineer_id: parseInt(id), rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted! Thank you.');
        setReviews(prev => [data.data, ...prev]);
        setShowReviewForm(false);
        setAlreadyReviewed(true);
        // Update avg in UI
        setEngineer(e => e ? { ...e, review_count: (e.review_count || 0) + 1 } : e);
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setSubmittingReview(false);
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
  const avgRating  = engineer.avg_rating || (reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : null);
  const skills     = (engineer.skills || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  const availInfo  = AVAIL_LABEL[engineer.availability] || AVAIL_LABEL.available;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name:        engineer.name,
    description: engineer.bio || `${engineer.level || 'Automation'} engineer specializing in ${skills.slice(0,3).join(', ')}`,
    jobTitle:    `${engineer.level || 'Automation'} Engineer`,
    knowsAbout:  skills,
    address:     { '@type': 'Place', name: engineer.region },
    ...(avgRating && reviews.length >= 3 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    url: `https://talengineer.us/engineer/${id}`,
  };

  return (
    <>
      <Head>
        <title>{engineer.name} — Automation Engineer | TalEngineer</title>
        <meta name="description" content={`${engineer.name} is a${isVerified ? ' verified' : 'n'} automation engineer in ${engineer.region}. Specializes in ${skills.slice(0,3).join(', ')}. ${avgRating ? `Rated ${avgRating}/5.` : ''} Hire via TalEngineer.`} />
        <meta property="og:title" content={`${engineer.name} | TalEngineer Engineer Profile`} />
        <meta property="og:description" content={`${engineer.bio || `${engineer.level} engineer in ${engineer.region}`}`} />
        <meta property="og:url" content={`https://talengineer.us/engineer/${id}`} />
        <link rel="canonical" href={`https://talengineer.us/engineer/${id}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>⚙️ TalEngineer</Link>
        <Link href="/talent" className={styles.btnBack}>← Talent Hub</Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.topRow}>
            <div className={styles.avatar}>{engineer.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h1 className={styles.name}>
                {engineer.name}
                {isVerified && <span className={styles.verifiedBadge}>🛡️ Nexus Verified</span>}
              </h1>
              <div className={styles.meta}>
                <span className={styles.chip}>📍 {engineer.region}</span>
                {engineer.level && <span className={styles.chip}>⭐ {engineer.level}</span>}
                {engineer.rate  && <span className={styles.chip}>💰 {engineer.rate}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {/* Availability badge */}
                <span style={{ fontSize: 12, fontWeight: 700, color: availInfo.color }}>{availInfo.label}</span>
                {engineer.availability === 'busy' && engineer.available_from && (
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>from {new Date(engineer.available_from).toLocaleDateString()}</span>
                )}
                {/* Avg rating */}
                {avgRating && reviews.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {avgRating} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </span>
                )}
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
              {skills.map(skill => (
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
                  <input type="date" style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} value={certForm.issue_date} onChange={e => setCertForm(f => ({ ...f, issue_date: e.target.value }))} />
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
                      {cert.status === 'pending'  && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(244,196,48,0.1)', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>⏳ Pending</span>}
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

          {/* Reviews */}
          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className={styles.sectionTitle}>
                Client Reviews {reviews.length > 0 && `(${reviews.length})`}
                {avgRating && <span style={{ marginLeft: 8, color: '#f59e0b' }}>★ {avgRating}</span>}
              </div>
              {currentUser?.role === 'employer' && !alreadyReviewed && demandIdParam && (
                <button onClick={() => setShowReviewForm(v => !v)} style={{ fontSize: 12, background: '#f59e0b', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                  ★ Leave Review
                </button>
              )}
              {alreadyReviewed && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>✅ Reviewed</span>}
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>Rating</label>
                  <StarRating value={reviewRating} onChange={setReviewRating} size={30} />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Describe your experience — quality of work, communication, professionalism…"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={submittingReview} style={{ marginTop: 10, background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviews.length === 0
              ? <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>No reviews yet.</p>
              : reviews.map(rev => (
                <div key={rev.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <StarRating value={rev.rating} size={16} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  {rev.comment && <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{rev.comment}</p>}
                  {rev.demands?.title && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Project: {rev.demands.title}</div>}
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
