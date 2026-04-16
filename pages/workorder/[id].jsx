import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import styles from './workorder.module.css';

const STATUS_LABEL = { checked_in: '🟡 Checked In', completed: '🔵 Awaiting Approval', approved: '✅ Approved & Paid' };

export default function WorkOrder() {
  const router  = useRouter();
  const toast   = useToast();
  const { id }  = router.query; // milestone_id
  const fileRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData]               = useState(null);      // { milestone, checkin }
  const [loading, setLoading]         = useState(true);
  const [location, setLocation]       = useState(null);
  const [photos, setPhotos]           = useState([]);        // array of data URLs
  const [notes, setNotes]             = useState('');
  const [step, setStep]               = useState('load');    // load | checkin | working | review | done
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/workorder/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        const c = d.checkin;
        if (!c)                        setStep('checkin');
        else if (c.status === 'checked_in')  setStep('working');
        else if (c.status === 'completed')   setStep('review');
        else                                 setStep('done');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function getGPS() {
    if (!navigator.geolocation) { toast.warn('GPS not available on this device.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        toast.success('Location captured.');
      },
      () => toast.warn('Location permission denied — check-in will proceed without GPS.')
    );
  }

  async function handleCheckin() {
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/workorder/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ lat: location?.lat, lng: location?.lng }),
      });
      const result = await res.json();
      if (res.ok) { toast.success('Checked in! Begin your work.'); setStep('working'); setData(d => ({ ...d, checkin: result.data })); }
      else toast.error(result.error);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  function handlePhoto(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPhotos(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  }

  async function handleComplete() {
    if (!notes.trim()) { toast.warn('Please add completion notes before submitting.'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/workorder/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ notes, photos }),
      });
      const result = await res.json();
      if (res.ok) { toast.success('Work submitted for client approval!'); setStep('review'); }
      else toast.error(result.error);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  async function handleApprove() {
    if (!currentUser?.token) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/workorder/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const result = await res.json();
      if (res.ok) { toast.success(`Approved! Payout $${result.payout?.toFixed(2)} sent to engineer.`); setStep('done'); }
      else toast.error(result.error);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  if (loading) return (
    <div className={styles.wrap}><div className={styles.spinner} /><p>Loading work order…</p></div>
  );

  const ms = data?.milestone;
  const checkin = data?.checkin;

  return (
    <>
      <Head>
        <title>Work Order | TalEngineer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0056b3" />
      </Head>

      <div className={styles.header}>
        <div className={styles.logo}>⚙️ TalEngineer</div>
        {checkin && <div className={styles.statusChip}>{STATUS_LABEL[checkin.status] || checkin.status}</div>}
      </div>

      <div className={styles.wrap}>
        {/* Project info */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Project</div>
          <div className={styles.cardTitle}>{ms?.demands?.title || `Milestone #${id}`}</div>
          <div className={styles.cardSub}>{ms?.phase_name} · <strong style={{ color: 'var(--primary)' }}>${(ms?.amount || 0).toLocaleString()}</strong></div>
        </div>

        {/* ── Step: Check In ── */}
        {step === 'checkin' && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>Step 1 — Check In</div>
            <p className={styles.stepDesc}>Confirm your arrival at the job site. GPS is optional but recommended.</p>
            <button className={styles.btnGPS} onClick={getGPS}>
              {location ? `📍 ${location.lat}, ${location.lng}` : '📍 Capture GPS Location'}
            </button>
            <button className={styles.btnPrimary} disabled={submitting} onClick={handleCheckin}>
              {submitting ? 'Checking in…' : '✅ Check In Now'}
            </button>
          </div>
        )}

        {/* ── Step: Working ── */}
        {step === 'working' && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>Step 2 — Document Your Work</div>
            <p className={styles.stepDesc}>Take photos of the installation/repair and add your completion notes.</p>

            <button className={styles.btnCamera} onClick={() => fileRef.current?.click()}>
              📸 Add Photos ({photos.length})
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />

            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((p, i) => (
                  <div key={i} className={styles.photoThumb}>
                    <img src={p} alt={`Photo ${i + 1}`} />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              className={styles.textarea}
              rows={5}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe the work completed: what was done, any issues found, parts used, test results…"
            />

            <button className={styles.btnPrimary} disabled={submitting} onClick={handleComplete}>
              {submitting ? 'Submitting…' : '🚀 Submit for Approval'}
            </button>
          </div>
        )}

        {/* ── Step: Awaiting Review ── */}
        {step === 'review' && (
          <div className={styles.card}>
            <div className={styles.stepTitle}>
              {currentUser?.role === 'employer' ? 'Step 3 — Review & Approve' : '⏳ Awaiting Client Approval'}
            </div>

            {checkin?.completion_notes && (
              <div className={styles.notesBlock}>
                <div className={styles.cardLabel}>Engineer Notes</div>
                <p>{checkin.completion_notes}</p>
              </div>
            )}

            {checkin?.photos?.length > 0 && (
              <div>
                <div className={styles.cardLabel}>Work Photos ({checkin.photos.length})</div>
                <div className={styles.photoGrid}>
                  {checkin.photos.map((p, i) => (
                    <div key={i} className={styles.photoThumb}><img src={p} alt={`Photo ${i + 1}`} /></div>
                  ))}
                </div>
              </div>
            )}

            {currentUser?.role === 'employer' && (
              <button className={styles.btnApprove} disabled={submitting} onClick={handleApprove}>
                {submitting ? 'Processing…' : '✅ Approve & Release Funds'}
              </button>
            )}
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className={`${styles.card} ${styles.doneCard}`}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h2>Work Order Complete</h2>
            <p>Funds have been released to the engineer's Stripe account.</p>
            <button className={styles.btnPrimary} onClick={() => router.push('/finance')}>Back to Dashboard</button>
          </div>
        )}

        {/* Check-in time stamp */}
        {checkin?.checkin_time && (
          <div className={styles.timestamp}>
            Checked in: {new Date(checkin.checkin_time).toLocaleString()}
            {checkin.checkin_lat && ` · 📍 ${checkin.checkin_lat}, ${checkin.checkin_lng}`}
          </div>
        )}
      </div>
    </>
  );
}
