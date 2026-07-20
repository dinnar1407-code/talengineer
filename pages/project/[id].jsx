import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import Navbar from '../../components/Navbar';
import { useLang } from '../../hooks/useLang';
import styles from './project.module.css';

const STATUS_COLOR = { open: '#10b981', in_progress: '#0056b3', completed: '#6b7280', payment_failed: '#ef4444' };

export default function ProjectDetail({ initialProject = null }) {
  const router = useRouter();
  const toast  = useToast();
  const [lang, setLang] = useLang();
  const { id } = router.query;

  // SEO 修复（审计 P2）：project 数据优先由 getServerSideProps 服务端注入，
  // 失败时回退客户端 fetch（applications 需登录态，始终客户端拉取）。
  const [project, setProject]       = useState(initialProject);
  const [applications, setApplications] = useState(null);
  const [loading, setLoading]       = useState(!initialProject);
  const [currentUser, setCurrentUser] = useState(null);
  const [applying, setApplying]     = useState(false);
  const [applyMsg, setApplyMsg]     = useState('');
  const [quotedRate, setQuotedRate] = useState('');
  const [quotedDays, setQuotedDays] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [assigning, setAssigning]   = useState(null);

  // 站点坐标（GPS 围栏）+ 现场签到记录（均雇主视角）
  const [siteLat, setSiteLat]       = useState('');
  const [siteLng, setSiteLng]       = useState('');
  const [siteRadius, setSiteRadius] = useState('');
  const [savingSite, setSavingSite] = useState(false);
  const [checkins, setCheckins]     = useState(null);   // 该单的签到记录（含围栏结果）或 null（未拉取）

  // 双向评价（工程师→雇主）
  const [employerRating, setEmployerRating]       = useState(null);   // { avg, count, reviews } 或 null
  const [showEmployerReviews, setShowEmployerReviews] = useState(false); // 评论列表展开态
  const [myEmployerReview, setMyEmployerReview]   = useState(null);   // { reviewed, review } 或 null（未拉取）
  const [empRating, setEmpRating]     = useState(5);   // 星级输入，默认 5 星
  const [empComment, setEmpComment]   = useState('');  // 评论框
  const [submittingEmpReview, setSubmittingEmpReview] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tal_user');
    if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch {} }
  }, []);

  // 客户端路由切换时同步新的 SSR props
  useEffect(() => {
    if (initialProject) { setProject(initialProject); setLoading(false); }
  }, [initialProject]);

  useEffect(() => {
    // SSR 已注入时跳过；仅服务端注水失败时兜底
    if (!id || initialProject) return;
    fetch(`/api/demand/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d.data || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, initialProject]);

  useEffect(() => {
    if (!project || !currentUser || currentUser.role !== 'employer') return;
    fetch(`/api/demand/${id}/applications`, {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    })
      .then(r => r.json())
      .then(d => setApplications(d.data || []))
      .catch(() => setApplications([]));
  }, [project, currentUser]);

  // 站点坐标回显：项目数据到手后，把已有的 site_lat/lng/radius 填进输入框
  useEffect(() => {
    if (!project) return;
    if (project.site_lat != null)      setSiteLat(String(project.site_lat));
    if (project.site_lng != null)      setSiteLng(String(project.site_lng));
    if (project.site_radius_m != null) setSiteRadius(String(project.site_radius_m));
  }, [project]);

  // 雇主视角拉取现场签到记录（含围栏结果）——仅雇主本人可见，走鉴权端点
  useEffect(() => {
    if (!project || !currentUser || currentUser.role !== 'employer' || !id) return;
    fetch(`/api/demand/${id}/checkins`, {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    })
      .then(r => r.json())
      .then(d => setCheckins(d.data || []))
      .catch(() => setCheckins([]));
  }, [project, currentUser]);

  // 生效费率（Founding 让利销售钩子）：仅需求所有者/admin 可见。公开 GET /:id（SSR 与
  // 兜底 fetch 都不带 token）不含 effective_fee_pct，这里带 token 重拉一次——服务端据 token
  // 判定属主才返回该字段，工程师/他人拿不到（不泄露他人商业条款）。拿到后并入 project 触发费率展示。
  useEffect(() => {
    if (!id || !currentUser?.token) return;
    fetch(`/api/demand/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
      .then(r => r.json())
      .then(d => {
        if (d?.data?.effective_fee_pct != null) {
          setProject(prev => (prev ? { ...prev, effective_fee_pct: d.data.effective_fee_pct } : prev));
        }
      })
      .catch(() => {});
  }, [id, currentUser]);

  // 是否已结算：至少一个里程碑已放款/退款——决定"评价雇主"入口是否出现
  const settled = !!project?.milestones?.some(m => ['released', 'refunded'].includes(m.status));

  // 拉取雇主评分（公开端点，无需登录）
  useEffect(() => {
    if (!project?.employer_id) return;
    fetch(`/api/reviews/employer/${project.employer_id}`)
      .then(r => r.json())
      .then(d => setEmployerRating(d.data || null))
      .catch(() => {});
  }, [project?.employer_id]);

  // 工程师且已结算时，查自己是否已评价过该雇主（决定入口显示表单还是只读）
  useEffect(() => {
    if (!id || !currentUser?.token || currentUser.role !== 'engineer' || !settled) return;
    fetch(`/api/reviews/employer/check/${id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    })
      .then(r => r.json())
      .then(d => setMyEmployerReview(d))
      .catch(() => {});
  }, [id, currentUser, settled]);

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

  async function handleSaveSite() {
    if (!currentUser?.token) { toast.error(lang === 'zh' ? '请先登录。' : 'Please sign in first.'); return; }
    setSavingSite(true);
    try {
      const res = await fetch('/api/demand/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        // 空输入框传 undefined（不是空串）：避免服务端把 Number('') 误当 0 存成 (0,0)。半径留空则用缺省 500。
        body: JSON.stringify({
          demand_id: id,
          site_lat: siteLat === '' ? undefined : siteLat,
          site_lng: siteLng === '' ? undefined : siteLng,
          site_radius_m: siteRadius === '' ? undefined : siteRadius,
        }),
      });
      const data = await res.json();
      if (res.ok) toast.success(lang === 'zh' ? '站点坐标已保存。' : 'Site coordinates saved.');
      else toast.error(data.error);
    } catch { toast.error(lang === 'zh' ? '网络错误。' : 'Network error.'); }
    setSavingSite(false);
  }

  async function handleSubmitEmployerReview(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error(lang === 'zh' ? '请先登录。' : 'Please sign in first.'); return; }
    setSubmittingEmpReview(true);
    try {
      const res  = await fetch('/api/reviews/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: id, rating: empRating, comment: empComment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(lang === 'zh' ? '评价已提交，谢谢！' : 'Review submitted — thank you!');
        // 本地立即切到只读态，无需重拉 check
        setMyEmployerReview({ reviewed: true, review: { rating: empRating, comment: empComment } });
        // 刷新雇主评分展示，让新评分立刻体现
        if (project?.employer_id) {
          fetch(`/api/reviews/employer/${project.employer_id}`)
            .then(r => r.json()).then(d => setEmployerRating(d.data || null)).catch(() => {});
        }
      } else toast.error(data.error);
    } catch { toast.error(lang === 'zh' ? '网络错误。' : 'Network error.'); }
    setSubmittingEmpReview(false);
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

  // 平台费率展示（仅需求所有者可见）：effective_fee_pct 只由带鉴权的 GET /:id 返回，
  // 非属主视角为 undefined → showFee=false → 整个费率块不渲染（不泄露他人商业条款）。
  // Founding 让利 = 生效费率低于标准 15%；feePctNum 取一位小数、避免浮点尾数（0.15*100=15.0000002）。
  // 纯展示：数值只用来"显示"，真实放款抽佣以服务端 feeFor 为准。
  const feePct    = project.effective_fee_pct;                 // 0..1 或 undefined
  const showFee   = feePct != null;
  const isFounding = showFee && feePct < 0.15;
  const feePctNum = showFee ? Math.round(feePct * 1000) / 10 : 0; // e.g. 5 / 12.5 / 15

  return (
    <>
      {/* title 用单个模板字符串 child（混排 children 会被 Next 服务端丢弃，SSR 后 title 变空） */}
      <Head><title>{`${project.title} | TalEngineer`}</title></Head>

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

          {/* ── 雇主评分（点击展开评论列表）── */}
          {project.employer_id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border, #e5e7eb)' }}>
              <button
                type="button"
                onClick={() => employerRating?.count > 0 && setShowEmployerReviews(v => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
                  padding: 0, cursor: employerRating?.count > 0 ? 'pointer' : 'default', color: 'var(--text, #111827)', fontSize: 14,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '雇主评分' : 'Employer'}:</span>
                {employerRating && employerRating.count > 0 ? (
                  <strong style={{ color: '#f59e0b' }}>
                    ★ {employerRating.avg.toFixed(1)}
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}> ({employerRating.count})</span>
                  </strong>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '暂无评价' : 'No reviews yet'}</span>
                )}
                {employerRating?.count > 0 && (
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{showEmployerReviews ? '▲' : '▼'}</span>
                )}
              </button>
              {showEmployerReviews && employerRating?.reviews?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {employerRating.reviews.map((r, i) => (
                    <div key={i} style={{ background: 'var(--surface-2, #f8f9fa)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.reviewer_name || 'Anonymous'}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: 13, color: 'var(--text, #374151)', margin: 0 }}>{r.comment}</p>}
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Milestones ── */}
        {project.milestones?.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>💼 Escrow Milestones</h3>

            {/* 平台费率（仅需求所有者可见）：Founding 让利 = 费率 < 15% 时高亮专享徽章。
                effective_fee_pct 仅经带鉴权的 GET /:id 返回，工程师/公开视角 showFee=false → 不渲染。 */}
            {showFee && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, margin: '2px 0 14px', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '平台费率' : 'Platform fee'}:</span>
                <strong style={{ color: isFounding ? '#059669' : 'var(--text, #111827)' }}>{feePctNum}%</strong>
                {isFounding && (
                  <span style={{ background: 'rgba(5,150,105,0.12)', color: '#059669', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, border: '1px solid rgba(5,150,105,0.35)' }}>
                    ⭐ {lang === 'zh' ? 'Founding 专享' : 'Founding rate'}
                  </span>
                )}
                <span style={{ color: 'var(--muted)' }}>· {lang === 'zh' ? '标准 15%' : 'Standard 15%'}</span>
              </div>
            )}

            <div className={styles.milestoneList}>
              {project.milestones.map(m => (
                <div key={m.id} className={styles.milestone}>
                  <div>
                    <div className={styles.milestoneName}>{m.phase_name}</div>
                    <div className={styles.milestonePercent}>{(m.percentage * 100).toFixed(0)}% of total</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.milestoneAmount}>${(m.amount || 0).toLocaleString()}</div>
                    {/* 预计平台费金额（金额 × 生效费率）——仅属主可见的展示估算，不参与真实放款 */}
                    {showFee && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {lang === 'zh' ? '预计平台费' : 'Est. platform fee'} ${((m.amount || 0) * feePct).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    )}
                    <span className={`${styles.msBadge} ${styles['ms_' + (m.status || 'locked')]}`}>{(m.status || 'locked').toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Review the employer（该单已指派工程师、结算后可评价）── */}
        {currentUser?.role === 'engineer' && settled && project.assigned_engineer_id && myEmployerReview && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>⭐ {lang === 'zh' ? '评价雇主' : 'Review the Employer'}</h3>
            {myEmployerReview.reviewed ? (
              <div>
                <div style={{ color: '#f59e0b', fontSize: 20, letterSpacing: 2 }}>
                  {'★'.repeat(myEmployerReview.review?.rating || 0)}{'☆'.repeat(5 - (myEmployerReview.review?.rating || 0))}
                </div>
                {myEmployerReview.review?.comment && (
                  <p style={{ marginTop: 8, color: 'var(--text, #374151)' }}>{myEmployerReview.review.comment}</p>
                )}
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                  {lang === 'zh' ? '你已提交对该雇主的评价。' : 'You have already reviewed this employer.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmployerReview}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEmpRating(n)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, padding: 0, color: n <= empRating ? '#f59e0b' : 'var(--border, #d1d5db)' }}
                    >
                      {n <= empRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={empComment}
                  onChange={e => setEmpComment(e.target.value)}
                  placeholder={lang === 'zh' ? '分享一下和这位雇主合作的体验……' : 'Share your experience working with this employer…'}
                />
                <button type="submit" className={styles.btnApply} disabled={submittingEmpReview}>
                  {submittingEmpReview ? (lang === 'zh' ? '提交中…' : 'Submitting…') : (lang === 'zh' ? '提交评价' : 'Submit Review')}
                </button>
              </form>
            )}
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

        {/* ── Site coordinates (employer) — GPS 围栏中心 ── */}
        {currentUser?.role === 'employer' && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>📌 {lang === 'zh' ? '站点坐标（GPS 围栏）' : 'Site Coordinates (GPS Geofence)'}</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -6, marginBottom: 14 }}>
              {lang === 'zh'
                ? '设置现场坐标后，工程师签到会自动计算与站点的距离并标注是否在范围内。'
                : 'Once set, engineer check-ins auto-compute distance from the site and flag out-of-range visits.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{lang === 'zh' ? '纬度' : 'Latitude'}</label>
                <input type="number" className={styles.textarea} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 0 }} value={siteLat} onChange={e => setSiteLat(e.target.value)} placeholder="e.g. 31.2304" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{lang === 'zh' ? '经度' : 'Longitude'}</label>
                <input type="number" className={styles.textarea} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 0 }} value={siteLng} onChange={e => setSiteLng(e.target.value)} placeholder="e.g. 121.4737" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{lang === 'zh' ? '半径（米）' : 'Radius (m)'}</label>
                <input type="number" className={styles.textarea} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 0 }} value={siteRadius} onChange={e => setSiteRadius(e.target.value)} placeholder="500" min="50" max="50000" />
              </div>
            </div>
            <button className={styles.btnApply} disabled={savingSite} onClick={handleSaveSite}>
              {savingSite ? (lang === 'zh' ? '保存中…' : 'Saving…') : (lang === 'zh' ? '保存站点坐标' : 'Save Site Coordinates')}
            </button>
          </div>
        )}

        {/* ── On-site check-in records (employer) — 含围栏警示徽章 ── */}
        {currentUser?.role === 'employer' && checkins && checkins.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>📍 {lang === 'zh' ? '现场签到记录' : 'On-site Check-ins'}</h3>
            {checkins.map(c => {
              const ms = project.milestones?.find(m => m.id === c.milestone_id);
              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border, #eee)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{ms?.phase_name || `Milestone #${c.milestone_id}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {c.checkin_time ? new Date(c.checkin_time).toLocaleString() : ''}{c.status ? ` · ${c.status}` : ''}
                    </div>
                  </div>
                  {/* 围栏警示：仅 geofence_ok===false 才显示距离徽章；null/true 不显示 */}
                  {c.geofence_ok === false && c.distance_m != null && (
                    <span style={{ background: 'rgba(239,68,68,.12)', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                      ⚠️ {lang === 'zh' ? `距站点 ${(c.distance_m / 1000).toFixed(1)}km` : `${(c.distance_m / 1000).toFixed(1)}km from site`}
                    </span>
                  )}
                </div>
              );
            })}
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

// ── 服务端渲染（审计 P2 SEO 修复）────────────────────────────────────────────
// 项目详情页被 sitemap 收录；服务端拉好公开数据注入 props，爬虫首屏即拿到
// 完整 title/正文。失败回退客户端渲染。详细说明见 pages/engineer/[id].jsx 同款实现。
export async function getServerSideProps({ params }) {
  const base = process.env.INTERNAL_API_BASE || `http://127.0.0.1:${process.env.PORT || 4000}`;
  try {
    const r = await fetch(`${base}/api/demand/${encodeURIComponent(params.id)}`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`demand -> ${r.status}`);
    const d = await r.json();
    return { props: { initialProject: d.data || null } };
  } catch {
    return { props: { initialProject: null } };
  }
}
