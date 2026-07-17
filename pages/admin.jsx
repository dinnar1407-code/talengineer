import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useToast } from '../components/Toast';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../hooks/useTheme';
import styles from './admin.module.css';
import consoleStyles from './console.module.css';

// ── UI 文案（标签/标题类；表格正文数据与逐行操作按钮保持英文原样，不在此翻译）──────
const DICT = {
  en: {
    backConsole: '← Console', adminPanel: 'Admin Panel', superAdmin: 'Super Admin',
    refresh: '↻ Refresh', exit: 'Exit',
    loginTitle: 'Admin Dashboard', loginSub: 'Enter your admin password to continue',
    loginPh: 'Admin password', loginBtn: 'Enter Dashboard', loginBtnBusy: 'Verifying...',
    navUsers: 'Users', navProjects: 'Projects', navEngineers: 'Engineers', navLedger: 'Ledger',
    navCerts: 'Certifications', navExamReview: 'Cert Exams', navDisputes: 'Disputes',
    navNotifs: 'Notifications', navKyc: 'KYC', navAnalytics: 'Analytics',
    subUsers: 'All registered accounts',
    subProjects: 'Posted projects and their status',
    subEngineers: 'Verified automation engineers',
    subLedger: 'Financial ledger entries',
    subCerts: 'Pending certification review',
    subExamReview: 'AI-graded exams awaiting manual sign-off',
    subDisputes: 'Milestone disputes to resolve',
    subNotifs: 'Platform notification log',
    subKyc: 'Employer KYC review queue',
    subAnalytics: 'Funnel, PMF signals and conversion',
    metricUsers: 'Total Users', metricProjects: 'Total Projects', metricEngineers: 'Engineers', metricRevenue: 'Platform Revenue',
    loading: 'Loading…',
    emptyUsers: 'No users yet.', emptyProjects: 'No projects yet.', emptyEngineers: 'No engineers yet.',
    emptyCerts: 'No pending certifications.', emptyExams: 'No exams pending review. 🎉',
    emptyDisputes: 'No disputes with this status.', emptyNotifs: 'No notifications yet.',
    emptyKyc: 'No users with this status.', emptyLedger: 'No ledger entries yet.',
    thEmail: 'Email', thRole: 'Role', thJoined: 'Joined',
    thTitle: 'Title', thStatus: 'Status', thBudget: 'Budget', thPosted: 'Posted',
    thName: 'Name', thRegion: 'Region', thScore: 'Score',
    thEngineer: 'Engineer', thCertification: 'Certification', thType: 'Type', thNumber: 'Number', thExpiry: 'Expiry', thFile: 'File', thAction: 'Action',
    thId: 'ID', thMilestone: 'Milestone', thOpenedBy: 'Opened By', thReason: 'Reason',
    thUser: 'User', thRead: 'Read', thDate: 'Date',
    thCompany: 'Company', thWebsite: 'Website', thPhone: 'Phone', thSubmitted: 'Submitted', thNote: 'Note',
    thDemandId: 'Demand ID', thAmount: 'Amount',
    navTaxDocs: 'Tax Docs', subTaxDocs: 'W-9 / tax document review queue',
    // Dispute resolution form
    resolveTitle: 'Resolve Dispute', reviewBtn: 'Review', closeBtn: 'Close',
    evEmployer: 'Employer evidence', evEngineer: 'Engineer evidence', evNone: 'Not submitted',
    evDeadline: 'Evidence deadline',
    resDir: 'Resolution', resEngineer: 'Award full amount to engineer', resEmployer: 'Refund full amount to employer', resSplit: 'Split funds',
    grossLabel: 'Gross awarded to engineer ($)',
    grossHint: 'Platform fee is deducted from this amount; the remainder is refunded to the employer.',
    decisionLabel: 'Decision note', decisionPh: 'Explain the ruling for both parties…',
    submitRuling: 'Submit Ruling', submittingRuling: 'Submitting…',
    resPayout: 'Engineer payout', resRefund: 'Employer refund',
    // Tax docs panel
    taxThType: 'Type', taxView: 'View file', taxReceived: 'Mark received', taxReject: 'Return',
    taxRejectPh: 'Reason for returning…', taxConfirmReject: 'Confirm return', taxCancel: 'Cancel',
    emptyTax: 'No tax documents with this status.',
  },
  zh: {
    backConsole: '← 控制台', adminPanel: '管理面板', superAdmin: '超级管理员',
    refresh: '↻ 刷新', exit: '退出',
    loginTitle: '管理后台', loginSub: '请输入管理员密码以继续',
    loginPh: '管理员密码', loginBtn: '进入后台', loginBtnBusy: '验证中…',
    navUsers: '用户', navProjects: '项目', navEngineers: '工程师', navLedger: '账本',
    navCerts: '资质认证', navExamReview: '考证复核', navDisputes: '纠纷',
    navNotifs: '通知', navKyc: 'KYC 审核', navAnalytics: '数据分析',
    subUsers: '全部注册账户',
    subProjects: '已发布项目及其状态',
    subEngineers: '已认证的自动化工程师',
    subLedger: '财务账本记录',
    subCerts: '待复核的资质认证',
    subExamReview: 'AI 已评分、待人工把关发证的考卷',
    subDisputes: '待处理的里程碑纠纷',
    subNotifs: '平台通知记录',
    subKyc: '雇主 KYC 审核队列',
    subAnalytics: '转化漏斗、PMF 信号与转化率',
    metricUsers: '用户总数', metricProjects: '项目总数', metricEngineers: '工程师', metricRevenue: '平台收入',
    loading: '加载中…',
    emptyUsers: '暂无用户。', emptyProjects: '暂无项目。', emptyEngineers: '暂无工程师。',
    emptyCerts: '暂无待复核的认证。', emptyExams: '暂无待复核考卷。🎉',
    emptyDisputes: '该状态下暂无纠纷。', emptyNotifs: '暂无通知。',
    emptyKyc: '该状态下暂无用户。', emptyLedger: '暂无账本记录。',
    thEmail: '邮箱', thRole: '角色', thJoined: '加入时间',
    thTitle: '标题', thStatus: '状态', thBudget: '预算', thPosted: '发布时间',
    thName: '姓名', thRegion: '地区', thScore: '评分',
    thEngineer: '工程师', thCertification: '认证', thType: '类型', thNumber: '编号', thExpiry: '有效期', thFile: '文件', thAction: '操作',
    thId: '编号', thMilestone: '里程碑', thOpenedBy: '发起人', thReason: '原因',
    thUser: '用户', thRead: '已读', thDate: '日期',
    thCompany: '公司', thWebsite: '网站', thPhone: '电话', thSubmitted: '提交时间', thNote: '备注',
    thDemandId: '需求编号', thAmount: '金额',
    navTaxDocs: '税务文件', subTaxDocs: 'W-9 等税务文件审核队列',
    // 纠纷裁决表单
    resolveTitle: '裁决纠纷', reviewBtn: '裁决', closeBtn: '关闭',
    evEmployer: '雇主证据', evEngineer: '工程师证据', evNone: '未提交',
    evDeadline: '举证截止',
    resDir: '裁决方向', resEngineer: '全额判给工程师', resEmployer: '全额退回雇主', resSplit: '按比例分账',
    grossLabel: '判给工程师的毛额（$）',
    grossHint: '平台费从毛额中抽取，余额退回雇主。',
    decisionLabel: '裁决说明', decisionPh: '向双方说明裁决理由……',
    submitRuling: '提交裁决', submittingRuling: '提交中……',
    resPayout: '工程师所得', resRefund: '雇主退款',
    // 税务文件面板
    taxThType: '类型', taxView: '查看文件', taxReceived: '确认收讫', taxReject: '退回',
    taxRejectPh: '退回原因……', taxConfirmReject: '确认退回', taxCancel: '取消',
    emptyTax: '该状态下暂无税务文件。',
  },
};

export default function Admin() {
  const toast = useToast();
  const [lang, setLang] = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [authed, setAuthed]     = useState(false);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [sbOpen, setSbOpen]       = useState(false);
  const [certs, setCerts]         = useState(null);
  const [disputes, setDisputes]   = useState(null);
  const [notifs, setNotifs]       = useState(null);
  const [kycList, setKycList]     = useState(null);
  const [funnel, setFunnel]       = useState(null);
  const [examPending, setExamPending] = useState(null); // 培训认证：待复核考卷
  // 纠纷裁决：选中的纠纷 + 表单 + 返回结果
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolveForm, setResolveForm] = useState({ resolution: 'resolved_engineer', resolution_amount: '', admin_decision: '' });
  const [resolveResult, setResolveResult] = useState(null);
  const [resolving, setResolving] = useState(false);
  // 税务文件面板：列表 + 行内退回备注
  const [taxDocs, setTaxDocs]     = useState(null);
  const [taxRejectId, setTaxRejectId] = useState(null);
  const [taxRejectNote, setTaxRejectNote] = useState('');

  const d = { ...DICT.en, ...(DICT[lang] || {}) };

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
            <h2>{d.loginTitle}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>{d.loginSub}</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={d.loginPh} className={styles.input} autoFocus required />
            <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? d.loginBtnBusy : d.loginBtn}</button>
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
    setSelectedDispute(null);   // 切换筛选时收起裁决表单
    setResolveResult(null);
    try {
      const res  = await fetch(`/api/disputes?status=${status}`, { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setDisputes(data.data || []);
    } catch { setDisputes([]); }
  }

  // 打开某纠纷的裁决表单卡：重置表单与上一次的返回结果
  function openResolveForm(dp) {
    setSelectedDispute(dp);
    setResolveForm({ resolution: 'resolved_engineer', resolution_amount: '', admin_decision: '' });
    setResolveResult(null);
  }

  async function submitResolution(e) {
    e.preventDefault();
    if (!selectedDispute) return;
    const { resolution, resolution_amount, admin_decision } = resolveForm;
    if (!admin_decision.trim()) { toast.error('Decision note is required.'); return; }
    // 仅 split 才传毛额；全给/全退由后端按托管总额计算
    const body = { resolution, admin_decision };
    if (resolution === 'resolved_split') body.resolution_amount = resolution_amount;
    setResolving(true);
    try {
      const res  = await fetch(`/api/disputes/${selectedDispute.id}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Dispute #${selectedDispute.id} resolved.`);
        setResolveResult(data); // { engineer_payout, employer_refund, refund_error? }
        setDisputes(prev => (prev || []).filter(d => d.id !== selectedDispute.id));
      } else {
        toast.error(data.error || 'Failed to resolve.');
      }
    } catch { toast.error('Network error.'); }
    setResolving(false);
  }

  // ── Tax Docs 面板（契约见 /api/tax/admin/*，另一 agent 并行实现）──────────────
  async function loadTaxDocs(status = 'submitted') {
    setTaxDocs(null);
    setTaxRejectId(null); setTaxRejectNote('');
    try {
      const res  = await fetch(`/api/tax/admin/list?status=${status}`, { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setTaxDocs(data.data || []);
    } catch { setTaxDocs([]); }
  }

  async function viewTaxDoc(id) {
    try {
      const res  = await fetch(`/api/tax/admin/${id}/url`, { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (res.ok && data.url) window.open(data.url, '_blank', 'noopener');
      else toast.error(data.error || 'Failed to load file.');
    } catch { toast.error('Network error.'); }
  }

  async function reviewTaxDoc(id, action, note) {
    try {
      const res  = await fetch(`/api/tax/admin/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ action, note: note || null }),
      });
      if (res.ok) {
        toast.success(action === 'received' ? 'Marked received.' : 'Document returned.');
        setTaxDocs(prev => (prev || []).filter(t => t.id !== id));
        setTaxRejectId(null); setTaxRejectNote('');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed.');
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

  // ── 培训认证：待复核考卷（AI 出分后由人工把最后一关再发证）──────────────────
  async function loadExamPending() {
    if (examPending !== null) return;
    try {
      const res  = await fetch('/api/training/admin/pending', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      setExamPending(data.data || []);
    } catch { setExamPending([]); }
  }

  async function reviewExam(attemptId, approve) {
    const note = approve ? '' : (window.prompt('Rejection note (optional):') ?? null);
    if (!approve && note === null) return; // 取消
    try {
      const res = await fetch(`/api/training/admin/${attemptId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ approve, note }),
      });
      if (res.ok) {
        toast.success(approve ? '🎓 Certification issued.' : 'Attempt rejected.');
        setExamPending(prev => (prev || []).filter(a => a.id !== attemptId));
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed.');
      }
    } catch { toast.error('Network error.'); }
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
    { id: 'users',      icon: '👤', label: d.navUsers,     badge: String(counts.users) },
    { id: 'demands',    icon: '📋', label: d.navProjects,  badge: String(counts.demands) },
    { id: 'talents',    icon: '🔧', label: d.navEngineers, badge: String(counts.talents) },
    { id: 'ledgers',    icon: '💰', label: d.navLedger,    badge: String(counts.ledgers) },
    { id: 'certs',      icon: '📜', label: d.navCerts },
    { id: 'examReview', icon: '🎓', label: d.navExamReview },
    { id: 'disputes',   icon: '⚖️', label: d.navDisputes },
    { id: 'notifs',     icon: '🔔', label: d.navNotifs, badge: counts.notifications != null ? String(counts.notifications) : undefined },
    { id: 'kyc',        icon: '🪪', label: d.navKyc },
    { id: 'taxDocs',    icon: '🧾', label: d.navTaxDocs },
    { id: 'analytics',  icon: '📊', label: d.navAnalytics },
  ];

  const titles = {
    users: [d.navUsers, d.subUsers],
    demands: [d.navProjects, d.subProjects],
    talents: [d.navEngineers, d.subEngineers],
    ledgers: [d.navLedger, d.subLedger],
    certs: [d.navCerts, d.subCerts],
    examReview: [d.navExamReview, d.subExamReview],
    disputes: [d.navDisputes, d.subDisputes],
    notifs: [d.navNotifs, d.subNotifs],
    kyc: [d.navKyc, d.subKyc],
    taxDocs: [d.navTaxDocs, d.subTaxDocs],
    analytics: [d.navAnalytics, d.subAnalytics],
  };
  const [pageTitle, pageSub] = titles[activeTab] || titles.users;

  function selectTab(id) {
    setActiveTab(id);
    if (id === 'certs') loadCerts();
    if (id === 'examReview') loadExamPending();
    if (id === 'disputes') loadDisputes();
    if (id === 'notifs') loadNotifs();
    if (id === 'kyc') loadKycList();
    if (id === 'taxDocs') loadTaxDocs();
    if (id === 'analytics') loadFunnel();
    setSbOpen(false);
  }

  return (
    <>
      <Head><title>Admin Dashboard | Talengineer</title></Head>

      <div className={consoleStyles.shell}>
        <div className={sbOpen ? consoleStyles.backdropOpen : consoleStyles.backdrop} onClick={() => setSbOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`${consoleStyles.sidebar} ${sbOpen ? consoleStyles.sidebarOpen : ''}`}>
          <Link href="/" className={consoleStyles.sbLogo}>
            <img src="/img/logo-macaw.svg" alt="" width={28} height={28} />
            <b>Talengineer</b>
          </Link>

          <nav className={consoleStyles.nav}>
            {TABS.map(t => (
              <button key={t.id} className={`${consoleStyles.navItem} ${activeTab === t.id ? consoleStyles.navItemActive : ''}`} onClick={() => selectTab(t.id)}>
                <span className={consoleStyles.navIcon}>{t.icon}</span>
                <span className={consoleStyles.navLabel}>{t.label}</span>
                {t.badge !== undefined && <span className={consoleStyles.navBadge}>{t.badge}</span>}
              </button>
            ))}
          </nav>

          <div className={consoleStyles.sbFooter}>
            <span className={consoleStyles.sbAvatar}>🛡️</span>
            <div className={consoleStyles.sbUserMeta}>
              <div className={consoleStyles.sbUserName}>{d.adminPanel}</div>
              <div className={consoleStyles.sbUserRole}>{d.superAdmin}</div>
            </div>
            <Link href="/console" className={consoleStyles.sbGear} title="Console">←</Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className={consoleStyles.main}>
          <header className={consoleStyles.topbar}>
            <button className={consoleStyles.hamburger} onClick={() => setSbOpen(v => !v)} aria-label="Menu">☰</button>
            <div>
              <div className={consoleStyles.topTitle}>{pageTitle}</div>
              <div className={consoleStyles.topSub}>{pageSub}</div>
            </div>
            <div className={consoleStyles.grow} />
            <Link href="/console" className={consoleStyles.linkBtn}>{d.backConsole}</Link>
            <button className={consoleStyles.iconBtn} onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={consoleStyles.iconBtn} onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} title="Toggle language" aria-label="Toggle language">
              {lang === 'zh' ? 'EN' : '中'}
            </button>
            <button className={styles.btnRefresh} onClick={refresh} disabled={loading}>{d.refresh}</button>
            <button className={styles.btnLogout} onClick={() => { setAuthed(false); setStats(null); }}>{d.exit}</button>
          </header>

          <main className={consoleStyles.content}>
            <div className={consoleStyles.stack}>
              {/* Metric cards */}
              <div className={styles.metrics}>
                <MetricCard label={d.metricUsers}    value={counts.users}   icon="👤" />
                <MetricCard label={d.metricProjects} value={counts.demands} icon="📋" />
                <MetricCard label={d.metricEngineers} value={counts.talents} icon="🔧" />
                <MetricCard label={d.metricRevenue}  value={`$${revenue.toFixed(0)}`} icon="💰" highlight />
              </div>

              {/* Users */}
              {activeTab === 'users' && (
                <table className={styles.table}>
                  <thead><tr><th>{d.thEmail}</th><th>{d.thRole}</th><th>{d.thJoined}</th></tr></thead>
                  <tbody>
                    {recent.users.length === 0
                      ? <tr><td colSpan={3} className={styles.empty}>{d.emptyUsers}</td></tr>
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
                  <thead><tr><th>{d.thTitle}</th><th>{d.thStatus}</th><th>{d.thBudget}</th><th>{d.thPosted}</th></tr></thead>
                  <tbody>
                    {recent.demands.length === 0
                      ? <tr><td colSpan={4} className={styles.empty}>{d.emptyProjects}</td></tr>
                      : recent.demands.map(dm => (
                        <tr key={dm.id}>
                          <td style={{ fontWeight: 600 }}>{dm.title}</td>
                          <td><span className={`${styles.badge} ${styles['status_' + dm.status]}`}>{dm.status}</span></td>
                          <td>{dm.budget}</td>
                          <td className={styles.muted}>{new Date(dm.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )}

              {/* Engineers */}
              {activeTab === 'talents' && (
                <table className={styles.table}>
                  <thead><tr><th>{d.thName}</th><th>{d.thRegion}</th><th>{d.thScore}</th><th>{d.thJoined}</th></tr></thead>
                  <tbody>
                    {recent.talents.length === 0
                      ? <tr><td colSpan={4} className={styles.empty}>{d.emptyEngineers}</td></tr>
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
                  <thead><tr><th>{d.thEngineer}</th><th>{d.thCertification}</th><th>{d.thType}</th><th>{d.thNumber}</th><th>{d.thExpiry}</th><th>{d.thFile}</th><th>{d.thAction}</th></tr></thead>
                  <tbody>
                    {certs === null
                      ? <tr><td colSpan={7} className={styles.empty}>{d.loading}</td></tr>
                      : certs.length === 0
                        ? <tr><td colSpan={7} className={styles.empty}>{d.emptyCerts}</td></tr>
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

              {/* 培训认证：考卷复核发证（AI 出分 → 人工把最后一关） */}
              {activeTab === 'examReview' && (
                <div>
                  {examPending === null ? <p className={styles.empty}>{d.loading}</p>
                    : examPending.length === 0 ? <p className={styles.empty}>{d.emptyExams}</p>
                    : examPending.map(a => (
                      <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <div>
                            <b>{a.talents?.name}</b> <span className={styles.muted}>({a.talents?.contact})</span>
                            <span style={{ marginLeft: 10 }}>{a.cert_tracks?.name_en} · <b>L{a.level}</b></span>
                          </div>
                          <div>
                            <span className={`${styles.badge} ${a.status === 'ai_passed' ? styles.badgeGreen || '' : styles.badgeGray || ''}`}>
                              {a.status === 'ai_passed' ? `AI ✅ ${a.score}/100` : a.status === 'ai_failed' ? `AI ❌ ${a.score}/100` : '📝 needs manual grading'}
                            </span>
                          </div>
                        </div>
                        {/* 答卷详情：折叠展示，复核时人工抽查 */}
                        <details style={{ marginBottom: 10 }}>
                          <summary style={{ cursor: 'pointer', fontSize: 13 }}>View answers & AI feedback</summary>
                          {(a.questions || []).map((q, i) => (
                            <div key={i} style={{ fontSize: 13, borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
                              <div><b>Q{i + 1}.</b> {q.q}</div>
                              <div style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>💬 {(a.answers?.[i]?.a) || '(no answer)'}</div>
                              {a.ai_grading?.per_question?.[i] && (
                                <div className={styles.muted}>AI: {a.ai_grading.per_question[i].score}/100 — {a.ai_grading.per_question[i].feedback}</div>
                              )}
                            </div>
                          ))}
                          {a.ai_grading?.overall_feedback && <div style={{ fontSize: 13, marginTop: 6 }}>Overall: {a.ai_grading.overall_feedback}</div>}
                          {a.review_note && <div style={{ fontSize: 13, marginTop: 6, color: '#f59e0b' }}>Note: {a.review_note}</div>}
                        </details>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => reviewExam(a.id, true)} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>🎓 Issue Certificate</button>
                          <button onClick={() => reviewExam(a.id, false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✗ Reject</button>
                        </div>
                      </div>
                    ))}
                </div>
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
                    <thead><tr><th>{d.thId}</th><th>{d.thMilestone}</th><th>{d.thOpenedBy}</th><th>{d.thReason}</th><th>{d.thStatus}</th><th>{d.thAction}</th></tr></thead>
                    <tbody>
                      {disputes === null
                        ? <tr><td colSpan={6} className={styles.empty}>{d.loading}</td></tr>
                        : disputes.length === 0
                          ? <tr><td colSpan={6} className={styles.empty}>{d.emptyDisputes}</td></tr>
                          : disputes.map(dp => (
                            <tr key={dp.id}>
                              <td>#{dp.id}</td>
                              <td>{dp.project_milestones?.phase_name || '—'}<br /><span className={styles.muted}>${parseFloat(dp.project_milestones?.amount || 0).toLocaleString()}</span></td>
                              <td className={styles.muted} style={{ fontSize: 12 }}>{dp.opened_by_email}</td>
                              <td style={{ maxWidth: 200, fontSize: 12 }}>{dp.reason?.slice(0, 80)}{dp.reason?.length > 80 ? '…' : ''}</td>
                              <td><span className={`${styles.badge} ${styles.badgeGray}`}>{dp.status}</span></td>
                              <td>
                                {!dp.status?.startsWith('resolved') && (
                                  <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                                    <button onClick={() => openResolveForm(dp)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>⚖️ {d.reviewBtn}</button>
                                    <a href={`/dispute/${dp.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--primary)', padding: '3px 8px', border: '1px solid var(--primary)', borderRadius: 4, textAlign: 'center', textDecoration: 'none' }}>View ↗</a>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>

                  {/* 裁决表单卡：选中某纠纷后展开，显示双方证据全文 + 举证截止 + 裁决表单 */}
                  {selectedDispute && (
                    <div style={{ marginTop: 20, border: '1px solid var(--primary)', borderRadius: 10, padding: 20, background: 'var(--surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{d.resolveTitle} #{selectedDispute.id}</div>
                        <button onClick={() => { setSelectedDispute(null); setResolveResult(null); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>{d.closeBtn}</button>
                      </div>

                      {/* 举证截止 */}
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                        {d.evDeadline}: {selectedDispute.evidence_deadline ? new Date(selectedDispute.evidence_deadline).toLocaleString() : '—'}
                      </div>

                      {/* 双方证据全文 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🏭 {d.evEmployer}</div>
                          <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: selectedDispute.employer_evidence ? 'var(--text)' : 'var(--muted)' }}>{selectedDispute.employer_evidence || d.evNone}</div>
                        </div>
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🔧 {d.evEngineer}</div>
                          <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: selectedDispute.engineer_evidence ? 'var(--text)' : 'var(--muted)' }}>{selectedDispute.engineer_evidence || d.evNone}</div>
                        </div>
                      </div>

                      {resolveResult ? (
                        /* 裁决成功后的资金结果回显 */
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 13 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span>{d.resPayout}</span><span style={{ fontWeight: 800, color: '#059669' }}>${Number(resolveResult.engineer_payout || 0).toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span>{d.resRefund}</span><span style={{ fontWeight: 800 }}>${Number(resolveResult.employer_refund || 0).toLocaleString()}</span>
                          </div>
                          {resolveResult.refund_error && (
                            <div style={{ marginTop: 8, color: '#ef4444', fontSize: 12 }}>⚠️ {resolveResult.refund_error}</div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={submitResolution}>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>{d.resDir}</label>
                            <select value={resolveForm.resolution} onChange={e => setResolveForm(f => ({ ...f, resolution: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontSize: 14 }}>
                              <option value="resolved_engineer">{d.resEngineer}</option>
                              <option value="resolved_employer">{d.resEmployer}</option>
                              <option value="resolved_split">{d.resSplit}</option>
                            </select>
                          </div>

                          {resolveForm.resolution === 'resolved_split' && (
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>{d.grossLabel}</label>
                              <input type="number" min="0" step="0.01" value={resolveForm.resolution_amount} onChange={e => setResolveForm(f => ({ ...f, resolution_amount: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontSize: 14 }} required />
                              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{d.grossHint}</div>
                            </div>
                          )}

                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>{d.decisionLabel}</label>
                            <textarea value={resolveForm.admin_decision} onChange={e => setResolveForm(f => ({ ...f, admin_decision: e.target.value }))} placeholder={d.decisionPh} rows={4} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} required />
                          </div>

                          <button type="submit" disabled={resolving} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700, opacity: resolving ? 0.6 : 1 }}>
                            {resolving ? d.submittingRuling : d.submitRuling}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifs' && (
                <div>
                  {notifs === null ? (
                    <p className={styles.empty}>{d.loading}</p>
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
                        <thead><tr><th>{d.thType}</th><th>{d.thUser}</th><th>{d.thTitle}</th><th>{d.thRead}</th><th>{d.thDate}</th></tr></thead>
                        <tbody>
                          {notifs.data.length === 0
                            ? <tr><td colSpan={5} className={styles.empty}>{d.emptyNotifs}</td></tr>
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
                    <thead><tr><th>{d.thEmail}</th><th>{d.thCompany}</th><th>{d.thWebsite}</th><th>{d.thPhone}</th><th>{d.thSubmitted}</th><th>{d.thNote}</th><th>{d.thAction}</th></tr></thead>
                    <tbody>
                      {kycList === null
                        ? <tr><td colSpan={7} className={styles.empty}>{d.loading}</td></tr>
                        : kycList.length === 0
                          ? <tr><td colSpan={7} className={styles.empty}>{d.emptyKyc}</td></tr>
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

              {/* Tax Docs：W-9 等税务文件审核（查看签名 URL / 确认收讫 / 退回带备注）*/}
              {activeTab === 'taxDocs' && (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {['submitted', 'received', 'rejected'].map(s => (
                      <button key={s} onClick={() => loadTaxDocs(s)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>{s}</button>
                    ))}
                  </div>
                  <table className={styles.table}>
                    <thead><tr><th>{d.thEmail}</th><th>{d.taxThType}</th><th>{d.thSubmitted}</th><th>{d.thStatus}</th><th>{d.thAction}</th></tr></thead>
                    <tbody>
                      {taxDocs === null
                        ? <tr><td colSpan={5} className={styles.empty}>{d.loading}</td></tr>
                        : taxDocs.length === 0
                          ? <tr><td colSpan={5} className={styles.empty}>{d.emptyTax}</td></tr>
                          : taxDocs.map(t => (
                            <tr key={t.id}>
                              <td style={{ fontSize: 12 }}>{t.users?.email || t.users?.name || `#${t.user_id}`}</td>
                              <td><span className={`${styles.badge} ${styles.badgeGray}`}>{t.doc_type || '—'}</span></td>
                              <td className={styles.muted}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                              <td><span className={`${styles.badge} ${t.status === 'received' ? styles.badgeGreen : styles.badgeGray}`}>{t.status}</span></td>
                              <td>
                                {taxRejectId === t.id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
                                    <textarea value={taxRejectNote} onChange={e => setTaxRejectNote(e.target.value)} placeholder={d.taxRejectPh} rows={2} style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button onClick={() => reviewTaxDoc(t.id, 'rejected', taxRejectNote)} disabled={!taxRejectNote.trim()} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: taxRejectNote.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, opacity: taxRejectNote.trim() ? 1 : 0.5 }}>{d.taxConfirmReject}</button>
                                      <button onClick={() => { setTaxRejectId(null); setTaxRejectNote(''); }} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>{d.taxCancel}</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button onClick={() => viewTaxDoc(t.id)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{d.taxView}</button>
                                    {t.status === 'submitted' && (
                                      <>
                                        <button onClick={() => reviewTaxDoc(t.id, 'received', null)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{d.taxReceived}</button>
                                        <button onClick={() => { setTaxRejectId(t.id); setTaxRejectNote(''); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{d.taxReject}</button>
                                      </>
                                    )}
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

              {/* Analytics / Funnel */}
              {activeTab === 'analytics' && (
                <div>
                  {funnel === null ? (
                    <p className={styles.empty}>{d.loading}</p>
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
                      {/* PMF 验证指标（设计文档"七、如何验证"：复购/纠纷率/口碑/筛选分覆盖） */}
                      {funnel.pmf && (
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>PMF Signals（路径 A 判定指标）</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>核心判据：雇主复购 + 低纠纷 + 高口碑 → 精英策展成立，可进阶段二</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                            {[
                              { label: 'Repeat Employers（复购雇主）', value: `${funnel.pmf.repeat_employers} / ${funnel.pmf.unique_employers}` },
                              { label: 'Repeat Rate（复购率）', value: `${funnel.pmf.repeat_rate_pct}%` },
                              { label: 'Dispute Rate（纠纷率）', value: `${funnel.pmf.dispute_rate_pct}%（${funnel.pmf.disputes_total} 起）` },
                              { label: 'Avg Rating（平均评分）', value: funnel.pmf.avg_rating != null ? `⭐ ${funnel.pmf.avg_rating}（${funnel.pmf.reviews_total} 条）` : '暂无评价' },
                              { label: 'Scored Talents（筛选分覆盖）', value: `${funnel.pmf.talents_scored} / ${funnel.pmf.talents_total}` },
                            ].map(stat => (
                              <div key={stat.label} style={{ background: 'var(--primary-bg, transparent)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{stat.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                  <thead><tr><th>{d.thDemandId}</th><th>{d.thAmount}</th><th>{d.thStatus}</th><th>{d.thDate}</th></tr></thead>
                  <tbody>
                    {recent.ledgers.length === 0
                      ? <tr><td colSpan={4} className={styles.empty}>{d.emptyLedger}</td></tr>
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
          </main>
        </div>
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
