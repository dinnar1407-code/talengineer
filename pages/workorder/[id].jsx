import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import Navbar from '../../components/Navbar';
import OfflineBanner from '../../components/OfflineBanner';
import { useOfflineData } from '../../lib/offline/useOfflineData';
import { enqueue } from '../../lib/offline/outbox';
import styles from './workorder.module.css';

const STATUS_LABEL = { checked_in: '🟡 Checked In', completed: '🔵 Awaiting Approval', approved: '✅ Approved & Paid' };

export default function WorkOrder() {
  const router  = useRouter();
  const toast   = useToast();
  const { id }  = router.query; // milestone_id
  const fileRef   = useRef(null);  // 本地 base64 快拍（离线可用）
  const uploadRef = useRef(null);  // 上传到云端存储桶

  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData]               = useState(null);      // { milestone, checkin }
  const [loading, setLoading]         = useState(true);
  const [location, setLocation]       = useState(null);
  const [photos, setPhotos]           = useState([]);        // array of data URLs
  const [notes, setNotes]             = useState('');
  const [step, setStep]               = useState('load');    // load | checkin | working | review | done
  const [submitting, setSubmitting]   = useState(false);
  const [uploading, setUploading]     = useState(false);     // 云端上传照片中
  const [queuedCheckin, setQueuedCheckin]   = useState(false); // 离线签到已入队待同步
  const [queuedComplete, setQueuedComplete] = useState(false); // 离线提交完工已入队待同步

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  // 页面数据经 useOfflineData 拉取：在线正常 fetch，断网时回放 IndexedDB 镜像（真实现由离线同步引擎提供）。
  const { data: woData } = useOfflineData('workorder-' + id, async () => {
    if (!id) return undefined;
    const token = (() => { try { return JSON.parse(localStorage.getItem('tal_user') || '{}').token || ''; } catch { return ''; } })();
    const r = await fetch(`/api/workorder/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return r.json();
  }, [id]);

  const loadedRef = useRef(false); // 首拉是否已拿到数据（供离线兜底判定）

  // woData 到手后落本地 state 并推导当前步骤（原地保留 setData(d => ...) 的乐观更新能力）
  useEffect(() => {
    if (woData == null) return;
    loadedRef.current = true;
    setData(woData);
    const c = woData.checkin;
    if (!c)                              setStep('checkin');
    else if (c.status === 'checked_in')  setStep('working');
    else if (c.status === 'completed')   setStep('review');
    else                                 setStep('done');
    setLoading(false);
  }, [woData]);

  // 兜底：断网首拉被离线 hook 吞错时，2.5s 后收起 loading；若始终没拿到数据则默认落到"签到"步，
  // 让离线签到仍然可用（回网后以服务端状态为准）。若已加载则不覆盖已推导的步骤。
  useEffect(() => {
    const t = setTimeout(() => {
      if (!loadedRef.current) setStep('checkin');
      setLoading(false);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

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
    // 离线：把签到请求原样入队，回网后 outbox 重放；按钮转「已排队待同步」，在线行为不变。
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await enqueue({
        type: 'checkin',
        request: {
          url: `/api/workorder/${id}/checkin`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: { lat: location?.lat, lng: location?.lng },
        },
      });
      setQueuedCheckin(true);
      toast.success('Offline — check-in queued, will sync when back online.');
      return;
    }
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

  // 上传到云端存储桶（bucket=public）：逐张上传，成功一张就把返回的 url 追加进 photos。
  // 与本地 base64 快拍互补——上传后的照片是稳定的公开 URL，不会撑大提交体积。
  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    setUploading(true);
    for (const file of files) {
      try {
        const form = new FormData();          // FormData 不手动设 Content-Type，浏览器自动带 multipart 边界
        form.append('file', file);
        const res  = await fetch('/api/uploads', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentUser.token}` },
          body: form,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Upload failed');
        setPhotos(prev => [...prev, result.url]);
      } catch (err) { toast.error(err.message || 'Upload failed. Please try again.'); }
    }
    setUploading(false);
    e.target.value = ''; // 重置，允许再次选择同一文件
  }

  async function handleComplete() {
    if (!notes.trim()) { toast.warn('Please add completion notes before submitting.'); return; }
    // 离线：把提交完工请求原样入队（type=checkout），回网后 outbox 重放；按钮转「已排队待同步」。
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await enqueue({
        type: 'checkout',
        request: {
          url: `/api/workorder/${id}/complete`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: { notes, photos },
        },
      });
      setQueuedComplete(true);
      toast.success('Offline — submission queued, will sync when back online.');
      return;
    }
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
      if (res.ok) {
        toast.success(`Approved! Payout $${result.payout?.toFixed(2)} sent to engineer.`);
        setData(d => ({ ...d, approvedDemandId: result.demand_id }));
        setStep('done');
      }
      else toast.error(result.error);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.wrap}><div className={styles.spinner} /><p>Loading work order…</p></div>
    </>
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

      {/* 全站共享导航（菜单/语言/主题切换） */}
      <Navbar />

      {/* 离线状态横幅：断网中 + N 条待同步（在线且队列空时组件自渲染为 null） */}
      <OfflineBanner />

      <div className={styles.header}>
        {/* 回退上一页：工单页多从项目/控制台深链进入，返回优先走历史栈，无历史则回控制台 */}
        <button type="button" className={styles.backBtn} onClick={() => (window.history.length > 1 ? router.back() : router.push('/console'))}>←</button>
        <div className={styles.logo}><img src="/img/logo-macaw.svg" alt="" width={26} height={26} style={{ verticalAlign: "middle" }} /> TalEngineer</div>
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
            <button className={styles.btnPrimary} disabled={submitting || queuedCheckin} onClick={handleCheckin}>
              {queuedCheckin ? '⏳ Queued — will sync' : submitting ? 'Checking in…' : '✅ Check In Now'}
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

            <button className={styles.btnCamera} disabled={uploading} onClick={() => uploadRef.current?.click()}>
              {uploading ? '⬆️ Uploading…' : '⬆️ Upload Photos'}
            </button>
            <input ref={uploadRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />

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

            <button className={styles.btnPrimary} disabled={submitting || queuedComplete} onClick={handleComplete}>
              {queuedComplete ? '⏳ Queued — will sync' : submitting ? 'Submitting…' : '🚀 Submit for Approval'}
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
            {currentUser?.role === 'employer' && ms?.demands?.assigned_engineer_id && (
              <a
                href={`/engineer/${ms.demands.assigned_engineer_id}?review=1&demand_id=${ms.demand_id}`}
                className={styles.btnPrimary}
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 10, background: '#f59e0b' }}
              >
                ★ Rate the Engineer
              </a>
            )}
            <a
              href={`/api/workorder/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 10, background: '#6b7280' }}
            >
              📄 Download Work Order PDF
            </a>
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

        {/* 围栏警示：签到点在站点半径之外时提示距离（geofence_ok===false 才显示；null/true 不显示）。
            警示不拦截——签到照常成立，只是给雇主/工程师一个"距站点较远"的可见信号。 */}
        {checkin?.geofence_ok === false && checkin?.distance_m != null && (
          <div style={{ marginTop: 6 }}>
            <span style={{ display: 'inline-block', background: 'rgba(239,68,68,.12)', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
              ⚠️ {(checkin.distance_m / 1000).toFixed(1)}km from site
            </span>
          </div>
        )}
      </div>
    </>
  );
}
