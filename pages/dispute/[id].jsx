import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import styles from './dispute.module.css';

const LS_USER_KEY = 'tal_user';

const STATUS_LABELS = {
  open:              { label: 'Open', color: '#ef4444' },
  under_review:      { label: 'Under Review', color: '#f59e0b' },
  resolved_engineer: { label: 'Resolved — Engineer', color: '#10b981' },
  resolved_employer: { label: 'Resolved — Employer', color: '#10b981' },
  resolved_split:    { label: 'Resolved — Split', color: '#10b981' },
};

export default function DisputePage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

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

  return (
    <>
      <Head>
        <title>Dispute #{id} | Talengineer</title>
      </Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
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
                    <li><strong>Evidence</strong> — Both parties submit supporting evidence within 72 hours</li>
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
