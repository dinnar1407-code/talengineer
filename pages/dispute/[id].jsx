import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import { useLang } from '../../hooks/useLang';
import Navbar from '../../components/Navbar';
import styles from './dispute.module.css';

const LS_USER_KEY = 'tal_user';

const STATUS_LABELS = {
  open:              { label: 'Open', color: '#ef4444' },
  under_review:      { label: 'Under Review', color: '#f59e0b' },
  resolved_engineer: { label: 'Resolved — Engineer', color: '#10b981' },
  resolved_employer: { label: 'Resolved — Employer', color: '#10b981' },
  resolved_split:    { label: 'Resolved — Split', color: '#10b981' },
};

// ── 流程时间线与流程说明的中英文案（该页其余数据展示保持原样英文）─────────────
const FLOW = {
  en: {
    timelineTitle: 'Dispute Progress',
    filed: 'Dispute opened',
    filedSub: (d) => `Filed on ${d}`,
    evidence: 'Evidence submission',
    evidenceDeadline: (d) => `Evidence deadline: ${d}`,
    daysLeft: (n) => `${n} day${n === 1 ? '' : 's'} left to submit evidence`,
    windowClosed: 'Evidence window closed',
    review: 'Platform review',
    reviewSub: 'Our team reviews both sides’ evidence and decides.',
    decision: 'Decision',
    decisionPending: 'Awaiting resolution',
    payout: 'Engineer payout',
    resLabels: {
      resolved_engineer: 'Full amount awarded to the engineer',
      resolved_employer: 'Full amount refunded to the employer',
      resolved_split: 'Funds split between the parties',
    },
    processSummary: 'How the dispute process works',
    processSteps: [
      'Either party opens a dispute on a funded milestone.',
      'Both sides have a 5-day window to submit evidence.',
      'After the evidence deadline passes, the platform reviews the case and issues a decision.',
      'The decision can award the full amount to the engineer, fully refund the employer, or split the funds proportionally. Funds are always handled through the original payment path.',
    ],
  },
  zh: {
    timelineTitle: '纠纷进度',
    filed: '纠纷开启',
    filedSub: (d) => `开启于 ${d}`,
    evidence: '双方举证',
    evidenceDeadline: (d) => `举证截止：${d}`,
    daysLeft: (n) => `距举证截止还剩 ${n} 天`,
    windowClosed: '举证已截止',
    review: '平台审理',
    reviewSub: '平台审阅双方证据后作出裁决。',
    decision: '裁决结果',
    decisionPending: '等待裁决',
    payout: '工程师所得',
    resLabels: {
      resolved_engineer: '全额判给工程师',
      resolved_employer: '全额退回雇主',
      resolved_split: '按比例分账',
    },
    processSummary: '纠纷处理流程说明',
    processSteps: [
      '任一方可对已托管的里程碑发起纠纷。',
      '双方有 5 天举证期提交证据。',
      '举证期截止后，平台审阅案情并作出裁决。',
      '裁决可为全额判给工程师、全额退回雇主，或按比例分账；资金一律按原路处理。',
    ],
  },
};

export default function DisputePage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const [lang] = useLang();
  const L = lang === 'zh' ? FLOW.zh : FLOW.en; // 仅区分中英，其余语言回退英文

  const [currentUser, setCurrentUser] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState('');
  const [party, setParty] = useState('employer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const token = (() => { try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || '{}').token || ''; } catch { return ''; } })();
    fetch(`/api/disputes/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => {
        setDispute(d.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function submitEvidence(e) {
    e.preventDefault();
    if (!evidence.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/disputes/${id}/evidence`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser?.token}` },
        body: JSON.stringify({ evidence, party }),
      });
      const data = await res.json();
      if (res.ok) {
        setDispute(data.data);
        setEvidence('');
        toast.success('Evidence submitted. Our team will review within 24–48 hours.');
      } else {
        toast.error(data.error || 'Failed to submit evidence.');
      }
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  const statusInfo = dispute ? (STATUS_LABELS[dispute.status] || { label: dispute.status, color: '#6b7280' }) : null;
  const isResolved = dispute?.status?.startsWith('resolved_');

  // ── 流程时间线：① 开启 → ② 举证（倒计时/已截止）→ ③ 审理 → ④ 裁决 ──────────
  // 每步状态 done / active / pending，决定圆点与连接线的样式。
  let flowSteps = [];
  if (dispute) {
    const deadline = dispute.evidence_deadline ? new Date(dispute.evidence_deadline) : null;
    const nowMs    = Date.now();
    const expired  = deadline ? nowMs > deadline.getTime() : false;
    // 向上取整到天；已过期则为 0，未过期至少显示剩 1 天
    const daysLeft = deadline ? Math.max(0, Math.ceil((deadline.getTime() - nowMs) / 86400000)) : null;

    flowSteps = [
      {
        key: 'filed', state: 'done', label: L.filed,
        sub: L.filedSub(new Date(dispute.created_at).toLocaleDateString()),
      },
      {
        key: 'evidence',
        state: isResolved || expired ? 'done' : 'active',
        label: L.evidence,
        sub: deadline ? L.evidenceDeadline(deadline.toLocaleDateString()) : null,
        // 仅未裁决时显示倒计时/截止徽标
        badge: isResolved || !deadline ? null
          : (expired ? { text: L.windowClosed, expired: true } : { text: L.daysLeft(daysLeft), expired: false }),
      },
      {
        key: 'review',
        state: isResolved ? 'done' : (expired || dispute.status === 'under_review') ? 'active' : 'pending',
        label: L.review,
        sub: L.reviewSub,
      },
      {
        key: 'decision',
        state: isResolved ? 'done' : 'pending',
        label: L.decision,
        sub: isResolved ? null : L.decisionPending,
        decision: isResolved ? {
          label: L.resLabels[dispute.status] || dispute.status,
          amount: dispute.resolution_amount != null ? parseFloat(dispute.resolution_amount).toLocaleString() : null,
        } : null,
      },
    ];
  }

  return (
    <>
      <Head>
        <title>Dispute #{id} | Talengineer</title>
      </Head>

      {/* 全站共享导航（菜单/语言/主题切换）；原自带 logo 与 Navbar 重复，仅保留返回链接条 */}
      <Navbar />

      <header className={styles.header}>
        <Link href="/finance" className={styles.backLink}>← Back to Dashboard</Link>
      </header>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingWrap}>
            {[0,1,2].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : !dispute ? (
          <div className={styles.notFound}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2>Dispute Not Found</h2>
            <p>This dispute doesn't exist or you don't have permission to view it.</p>
            <Link href="/finance" className={styles.btnBack}>Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className={styles.pageHeader}>
              <div>
                <div className={styles.breadcrumb}>Dispute Resolution</div>
                <h1>Dispute #{dispute.id}</h1>
                {dispute.project_milestones && (
                  <p className={styles.subtitle}>Milestone: {dispute.project_milestones.phase_name} · ${parseFloat(dispute.project_milestones.amount || 0).toLocaleString()}</p>
                )}
              </div>
              <div className={styles.statusPill} style={{ background: statusInfo.color + '18', color: statusInfo.color, borderColor: statusInfo.color + '40' }}>
                {statusInfo.label}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.main}>
                {/* Progress timeline + process explanation */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>{L.timelineTitle}</h2>
                  <div className={styles.timeline}>
                    {flowSteps.map((s, i) => (
                      <div key={s.key} className={styles.tlStep}>
                        <div className={styles.tlRail}>
                          <div className={`${styles.tlDot} ${s.state === 'done' ? styles.tlDotDone : s.state === 'active' ? styles.tlDotActive : ''}`} />
                          {i < flowSteps.length - 1 && <div className={`${styles.tlConnector} ${s.state === 'done' ? styles.tlConnectorDone : ''}`} />}
                        </div>
                        <div className={styles.tlBody}>
                          <div className={`${styles.tlLabel} ${s.state === 'pending' ? styles.tlLabelPending : ''}`}>{s.label}</div>
                          {s.sub && <div className={styles.tlSub}>{s.sub}</div>}
                          {s.badge && (
                            <span className={`${styles.tlCountdown} ${s.badge.expired ? styles.tlCountdownExpired : ''}`}>{s.badge.text}</span>
                          )}
                          {s.decision && (
                            <div className={styles.tlSub}>
                              {s.decision.label}
                              {s.decision.amount != null && <> · <span className={styles.tlAmount}>{L.payout}: ${s.decision.amount}</span></>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <details className={styles.processBlock}>
                    <summary className={styles.processSummary}>{L.processSummary}</summary>
                    <ol className={styles.processList}>
                      {L.processSteps.map((t, i) => <li key={i}>{t}</li>)}
                    </ol>
                  </details>
                </div>

                {/* Dispute details */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Dispute Details</h2>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Opened by</span>
                    <span className={styles.detailVal}>{dispute.opened_by_email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Filed</span>
                    <span className={styles.detailVal}>{new Date(dispute.created_at).toLocaleString()}</span>
                  </div>
                  {dispute.resolved_at && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Resolved</span>
                      <span className={styles.detailVal}>{new Date(dispute.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.reasonBox}>
                    <div className={styles.reasonLabel}>Reason</div>
                    <p>{dispute.reason}</p>
                  </div>
                </div>

                {/* Evidence section */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Evidence Submitted</h2>
                  {!dispute.employer_evidence && !dispute.engineer_evidence ? (
                    <p className={styles.noEvidence}>No evidence submitted yet.</p>
                  ) : (
                    <>
                      {dispute.employer_evidence && (
                        <div className={styles.evidenceBlock}>
                          <div className={styles.evidenceLabel}>🏭 Employer Evidence</div>
                          <p>{dispute.employer_evidence}</p>
                        </div>
                      )}
                      {dispute.engineer_evidence && (
                        <div className={styles.evidenceBlock}>
                          <div className={styles.evidenceLabel}>🔧 Engineer Evidence</div>
                          <p>{dispute.engineer_evidence}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Admin decision */}
                {isResolved && dispute.admin_decision && (
                  <div className={`${styles.card} ${styles.resolutionCard}`}>
                    <h2 className={styles.cardTitle}>Admin Decision</h2>
                    <p>{dispute.admin_decision}</p>
                    {dispute.resolution_amount != null && (
                      <div className={styles.payoutRow}>
                        <span>Engineer Payout</span>
                        <span className={styles.payoutAmount}>${parseFloat(dispute.resolution_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit evidence form */}
                {!isResolved && currentUser && (
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Submit Your Evidence</h2>
                    <p className={styles.formDesc}>Provide documentation, communications, or explanation to support your case. Be factual and specific.</p>
                    <form onSubmit={submitEvidence}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>I am the</label>
                        <select value={party} onChange={e => setParty(e.target.value)} className={styles.select}>
                          <option value="employer">Employer / Project Owner</option>
                          <option value="engineer">Engineer / Contractor</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Evidence / Statement</label>
                        <textarea
                          value={evidence}
                          onChange={e => setEvidence(e.target.value)}
                          className={styles.textarea}
                          placeholder="Describe the situation, attach links to documents, messages, or deliverables..."
                          rows={6}
                          required
                        />
                      </div>
                      <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit Evidence'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className={styles.sidebar}>
                <div className={styles.infoCard}>
                  <h3>How Disputes Work</h3>
                  <ol className={styles.steps}>
                    <li><strong>Filed</strong> — Either party opens a dispute on a funded milestone</li>
                    <li><strong>Evidence</strong> — Both parties submit supporting evidence within 5 days</li>
                    <li><strong>Review</strong> — Our team reviews evidence within 48–72 hours</li>
                    <li><strong>Decision</strong> — Admin resolves in favour of engineer, employer, or splits funds</li>
                  </ol>
                </div>

                <div className={styles.infoCard}>
                  <h3>Milestone Funds</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Funds are frozen during dispute resolution. No transfers will occur until admin makes a decision.</p>
                  {dispute.project_milestones?.amount && (
                    <div className={styles.frozenAmount}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>${parseFloat(dispute.project_milestones.amount).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Currently frozen in escrow</div>
                    </div>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h3>Contact Support</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>For urgent matters, email us directly:</p>
                  <a href="mailto:disputes@talengineer.us" className={styles.btnContact}>disputes@talengineer.us</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
