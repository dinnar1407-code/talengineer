import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
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
    // 双 Tab 登录 + TOTP 2FA
    tabAccount: 'Account · 2FA', tabPassword: 'Password · break-glass',
    emailPh: 'Admin email', pwdPh: 'Password', continueBtn: 'Continue',
    codePh: '6-digit code', verifyBtn: 'Verify & Enter', backBtn: 'Back',
    setupTitle: 'Enable 2FA — add this key to your authenticator',
    setupHint: 'Enter this secret manually in Google Authenticator / 1Password.',
    emergencyHint: 'Emergency shared-password access. Prefer account login.',
    // 审计日志面板
    navAudit: 'Audit Log', subAudit: 'Admin action audit trail',
    thTime: 'Time', thMethod: 'Method', thTarget: 'Target', thIp: 'IP', emptyAudit: 'No audit entries.',
    // 签到记录面板
    navCheckins: 'Check-ins', subCheckins: 'On-site GPS check-in log',
    thFence: 'Geofence', emptyCheckins: 'No check-ins yet.',
    navUsers: 'Users', navProjects: 'Projects', navEngineers: 'Engineers', navLedger: 'Ledger',
    navCerts: 'Certifications', navExamReview: 'Cert Exams', navDisputes: 'Disputes',
    navNotifs: 'Notifications', navKyc: 'KYC', navAnalytics: 'Analytics',
    // Newsletter 订阅 leads 面板
    navSubscribers: 'Newsletter', subSubscribers: 'Newsletter subscribers (lead capture)',
    thSource: 'Source', thLang: 'Lang', thUnsub: 'Unsubscribed',
    emptySubscribers: 'No subscribers yet.', csvExport: '⬇ Export CSV', filterAll: 'All',
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
    // Pipeline board (matchmaking PMF)
    navPipeline: 'Pipeline', subPipeline: 'Matchmaking lead board (PMF experiment)',
    pipeCompany: 'Company', pipeLine: 'Line', pipeLineCn: '🇨🇳 CN employers', pipeLineUs: '🇺🇸 US domestic',
    pipeContact: 'Contact', pipeNote: 'Note', pipeNextAction: 'Next action', pipeNextAt: 'Next action at',
    pipeDemandId: 'Demand ID', pipeAdd: '+ Add lead', pipeAll: 'All', pipeSave: 'Save', pipeDelete: 'Delete',
    pipeFee: 'Founding fee', pipeSetFee: 'Set fee', demoData: 'Demo data',
    stages: { lead: 'Lead', contacted: 'Contacted', interested: 'Interested', scoped: 'Scoped', matched: 'Matched', quoted: 'Quoted', signed: 'Signed', delivered: 'Delivered', lost: 'Lost' },
    // 1099 tip card (Tax Docs panel header)
    taxTipTitle: '1099 tax forms — issue to US engineers',
    taxTip1: 'W-9 is collected here; 1099-NEC is the year-end filing for engineers paid ≥ $600 via Stripe.',
    taxTip2: 'Enable in Stripe Dashboard → Connect → Tax reporting (1099-NEC); Stripe auto-aggregates transfers per Connect account.',
    taxTip3: 'manual / payoneer payouts are outside Stripe 1099 — handle separately.',
    taxTipDoc: 'Full setup checklist: docs/1099-setup.md',
  },
  zh: {
    backConsole: '← 控制台', adminPanel: '管理面板', superAdmin: '超级管理员',
    refresh: '↻ 刷新', exit: '退出',
    loginTitle: '管理后台', loginSub: '请输入管理员密码以继续',
    loginPh: '管理员密码', loginBtn: '进入后台', loginBtnBusy: '验证中…',
    // 双 Tab 登录 + TOTP 2FA
    tabAccount: '账号登录 · 2FA', tabPassword: '口令登录 · 应急',
    emailPh: '管理员邮箱', pwdPh: '密码', continueBtn: '下一步',
    codePh: '6 位验证码', verifyBtn: '验证并进入', backBtn: '返回',
    setupTitle: '启用 2FA —— 把此密钥加入认证器',
    setupHint: '在 Google Authenticator / 1Password 中手动输入下方密钥。',
    emergencyHint: '应急共享口令通道，优先使用账号登录。',
    // 审计日志面板
    navAudit: '审计日志', subAudit: '管理员操作审计',
    thTime: '时间', thMethod: '方式', thTarget: '目标', thIp: 'IP', emptyAudit: '暂无审计记录。',
    // 签到记录面板
    navCheckins: '签到记录', subCheckins: '现场 GPS 签到记录',
    thFence: '围栏', emptyCheckins: '暂无签到记录。',
    navUsers: '用户', navProjects: '项目', navEngineers: '工程师', navLedger: '账本',
    navCerts: '资质认证', navExamReview: '考证复核', navDisputes: '纠纷',
    navNotifs: '通知', navKyc: 'KYC 审核', navAnalytics: '数据分析',
    // Newsletter 订阅 leads 面板
    navSubscribers: '邮件订阅', subSubscribers: 'Newsletter 订阅名单（lead 收集）',
    thSource: '来源', thLang: '语言', thUnsub: '退订时间',
    emptySubscribers: '暂无订阅。', csvExport: '⬇ 导出 CSV', filterAll: '全部',
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
    // 撮合 Pipeline 看板（PMF 实验）
    navPipeline: '撮合看板', subPipeline: '人工撮合线索看板（PMF 实验）',
    pipeCompany: '公司', pipeLine: '线', pipeLineCn: '🇨🇳 中国雇主线', pipeLineUs: '🇺🇸 美国本土线',
    pipeContact: '联系方式', pipeNote: '备注', pipeNextAction: '下一步', pipeNextAt: '下一步时间',
    pipeDemandId: '需求编号', pipeAdd: '+ 新增线索', pipeAll: '全部', pipeSave: '保存', pipeDelete: '删除',
    pipeFee: 'founding 费率', pipeSetFee: '设置费率', demoData: '演示数据',
    stages: { lead: '线索', contacted: '已接触', interested: '有意向', scoped: '已了解需求', matched: '已匹配', quoted: '已报价', signed: '已签约', delivered: '已交付', lost: '已流失' },
    // 1099 提示卡（Tax Docs 面板顶部）
    taxTipTitle: '1099 税表 —— 给美国工程师出表',
    taxTip1: '平台已在此采集 W-9；1099-NEC 是"年付 ≥ $600 者次年出表"这一步（走 Stripe 收款的工程师）。',
    taxTip2: '开通路径：Stripe Dashboard → Connect → Tax reporting（选 1099-NEC）；Stripe 会按 Connect 账户自动汇总放款额。',
    taxTip3: 'manual / payoneer 收款不在 Stripe 1099 覆盖内，需单独处理。',
    taxTipDoc: '完整开通清单见 docs/1099-setup.md',
  },
};

// stage 顺序（看板分组与阶段选择器共用；与后端 pipeline.js 的白名单一致）
const PIPELINE_STAGES = ['lead', 'contacted', 'interested', 'scoped', 'matched', 'quoted', 'signed', 'delivered', 'lost'];

// 演示兜底：真实看板为空时展示 3 条示例线索，帮助理解看板用法（🧪 徽标标明非真实数据）
const DEMO_PIPELINE = [
  { id: 'demo-1', line: 'cn', company: 'Shenzhen Hongtai Automation', contact: 'Ms. Chen · WeChat', stage: 'contacted', demand_id: null, note: '墨西哥新厂产线自动化，考虑 PLC + 视觉', next_action: '发案例 + 报价单', next_action_at: null },
  { id: 'demo-2', line: 'us', company: 'Midwest Controls LLC', contact: 'John · john@example.com', stage: 'scoped', demand_id: null, note: 'AB PLC 改造，2 名驻场工程师', next_action: '安排技术通话', next_action_at: null },
  { id: 'demo-3', line: 'cn', company: '越南某电子代工厂', contact: '采购总监（引荐）', stage: 'quoted', demand_id: null, note: '产线迁移，SCADA 集成', next_action: '等签约回执', next_action_at: null },
];

// 看板行内样式常量（静态值，模块级定义避免每次渲染重建）
const pipeCardStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 10, background: 'var(--surface)' };
const pipeInputStyle = { width: '100%', padding: '7px 9px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' };
const pipeLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 };

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
  const [subscribers, setSubscribers] = useState(null); // Newsletter 订阅 leads（分页读，默认拉第一页）
  const [subSource, setSubSource] = useState('all');    // 订阅来源筛选：all|calculator|playbook|footer
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
  // 撮合 Pipeline 看板：列表 + 新增表单 + 行内编辑草稿（键为行 id）
  const [pipeline, setPipeline]   = useState(null);
  const [pipelineForm, setPipelineForm] = useState({ company: '', line: 'cn', contact: '', note: '' });
  const [pipelineDrafts, setPipelineDrafts] = useState({});
  // ── 账号化 2FA 登录 + 审计面板状态 ──────────────────────────────────────────
  const [adminToken, setAdminToken] = useState(null);   // 账号化 admin 令牌（带 adm2fa，localStorage 持久）
  const [loginMode, setLoginMode]   = useState('account'); // 'account'（推荐）| 'password'（应急）
  const [acctEmail, setAcctEmail]   = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [loginJwt, setLoginJwt]     = useState(null);    // 账号登录后的普通 JWT，仅用于走 2FA setup/verify
  const [twoFAStage, setTwoFAStage] = useState('creds'); // 'creds' | 'code'
  const [setupInfo, setSetupInfo]   = useState(null);    // { secret, otpauthUrl } 或 null（已启用直接输码）
  const [totpCode, setTotpCode]     = useState('');
  const [auditLogs, setAuditLogs]   = useState(null);
  const [rates, setRates]           = useState(null);    // 费率分布（admin_rates_summary）
  const [checkins, setCheckins]     = useState(null);    // 现场签到（含 GPS 围栏结果）

  const d = { ...DICT.en, ...(DICT[lang] || {}) };

  // 统一 admin API 鉴权头：优先账号化 Bearer 令牌，无令牌则回退共享口令（应急通道）。
  function authHeaders(json = false) {
    const h = json ? { 'Content-Type': 'application/json' } : {};
    if (adminToken) h.Authorization = `Bearer ${adminToken}`;
    else if (password) h['x-admin-password'] = password;
    return h;
  }

  // 会话恢复：localStorage 有令牌就用 Bearer 探测 /stats，通过即免登录进后台；失效则清理。
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('tal_admin_token') : null;
    if (!t) return;
    setAdminToken(t);
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${t}` } })
      .then(async (res) => {
        if (res.ok) { setStats(await res.json()); setAuthed(true); }
        else { localStorage.removeItem('tal_admin_token'); setAdminToken(null); }
      })
      .catch(() => {});
  }, []);

  // 登录卡 Tab 按钮样式（激活态高亮）
  const tabStyle = (active) => ({
    flex: 1, padding: '8px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text)',
  });

  // ── 应急口令登录（break-glass）：沿用旧流程，用 x-admin-password 直连 /stats ──
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats', { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Wrong password'); setLoading(false); return; }
      setStats(data);
      setAuthed(true);
    } catch { toast.error('Network error.'); }
    setLoading(false);
  }

  // ── 账号登录第一步：邮箱+密码换普通 JWT，确认 admin 角色后探测 2FA 状态 ──
  async function handleAccountCreds(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acctEmail, password: acctPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); setLoading(false); return; }
      if (data.role !== 'admin') { toast.error('This account is not an admin.'); setLoading(false); return; }
      setLoginJwt(data.token);
      // 探测是否已启用 2FA：调 setup —— 200=首次(返回密钥待录入)，400=已启用(直接输码)
      const su = await fetch('/api/auth/admin-2fa-setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.token}` },
      });
      setSetupInfo(su.ok ? await su.json() : null);
      setTwoFAStage('code');
    } catch { toast.error('Network error.'); }
    setLoading(false);
  }

  // ── 账号登录第二步：一次性码换取 adm2fa 令牌，存 localStorage 后 Bearer 进后台 ──
  async function handle2FACode(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/admin-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginJwt}` },
        body: JSON.stringify({ code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Invalid code'); setLoading(false); return; }
      localStorage.setItem('tal_admin_token', data.token);
      setAdminToken(data.token);
      // 立即用新令牌拉一次 /stats 进后台（此时 adminToken 状态可能还没刷新，直接用 data.token）
      const sres  = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${data.token}` } });
      const sdata = await sres.json();
      if (sres.ok) { setStats(sdata); setAuthed(true); setTotpCode(''); }
      else { toast.error(sdata.error || 'Failed to load dashboard.'); }
    } catch { toast.error('Network error.'); }
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats', { headers: authHeaders() });
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
          <div className={styles.loginBox}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>🔐</div>
            <h2>{d.loginTitle}</h2>

            {/* 双 Tab：账号登录（推荐，走 TOTP 2FA）/ 口令登录（应急 break-glass）*/}
            <div style={{ display: 'flex', gap: 8, margin: '14px 0 18px' }}>
              <button type="button" onClick={() => setLoginMode('account')} style={tabStyle(loginMode === 'account')}>{d.tabAccount}</button>
              <button type="button" onClick={() => setLoginMode('password')} style={tabStyle(loginMode === 'password')}>{d.tabPassword}</button>
            </div>

            {loginMode === 'account' ? (
              twoFAStage === 'creds' ? (
                /* 第一步：邮箱 + 密码 */
                <form onSubmit={handleAccountCreds}>
                  <input type="email" value={acctEmail} onChange={e => setAcctEmail(e.target.value)} placeholder={d.emailPh} className={styles.input} autoFocus required />
                  <input type="password" value={acctPassword} onChange={e => setAcctPassword(e.target.value)} placeholder={d.pwdPh} className={styles.input} required />
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? d.loginBtnBusy : d.continueBtn}</button>
                </form>
              ) : (
                /* 第二步：首次展示密钥待录入认证器 + 输入一次性码 */
                <form onSubmit={handle2FACode}>
                  {setupInfo && (
                    <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.setupTitle}</div>
                      <div style={{ color: 'var(--muted)', marginBottom: 8 }}>{d.setupHint}</div>
                      <code style={{ display: 'block', wordBreak: 'break-all', fontFamily: 'monospace', background: 'var(--surface)', padding: '8px 10px', borderRadius: 6, userSelect: 'all' }}>{setupInfo.secret}</code>
                    </div>
                  )}
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" value={totpCode} onChange={e => setTotpCode(e.target.value)} placeholder={d.codePh} className={styles.input} autoFocus required />
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? d.loginBtnBusy : d.verifyBtn}</button>
                  <button type="button" onClick={() => { setTwoFAStage('creds'); setTotpCode(''); setSetupInfo(null); }} style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, width: '100%' }}>← {d.backBtn}</button>
                </form>
              )
            ) : (
              /* 应急口令登录（break-glass）*/
              <form onSubmit={handleLogin}>
                <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{d.emergencyHint}</p>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={d.loginPh} className={styles.input} required />
                <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? d.loginBtnBusy : d.loginBtn}</button>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  const { counts, revenue, recent } = stats;

  async function loadCerts() {
    if (certs !== null) return;
    try {
      const res  = await fetch('/api/certifications?status=pending', { headers: authHeaders() });
      const data = await res.json();
      setCerts(data.data || []);
    } catch { setCerts([]); }
  }

  async function loadDisputes(status = 'open') {
    setDisputes(null);
    setSelectedDispute(null);   // 切换筛选时收起裁决表单
    setResolveResult(null);
    try {
      const res  = await fetch(`/api/disputes?status=${status}`, { headers: authHeaders() });
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
        headers: authHeaders(true),
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
      const res  = await fetch(`/api/tax/admin/list?status=${status}`, { headers: authHeaders() });
      const data = await res.json();
      setTaxDocs(data.data || []);
    } catch { setTaxDocs([]); }
  }

  async function viewTaxDoc(id) {
    try {
      const res  = await fetch(`/api/tax/admin/${id}/url`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.url) window.open(data.url, '_blank', 'noopener');
      else toast.error(data.error || 'Failed to load file.');
    } catch { toast.error('Network error.'); }
  }

  async function reviewTaxDoc(id, action, note) {
    try {
      const res  = await fetch(`/api/tax/admin/${id}/review`, {
        method: 'POST',
        headers: authHeaders(true),
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

  // ── 🤝 Pipeline 看板（人工撮合 PMF 实验）契约见 /api/pipeline/* 与 /api/admin/demands/:id/fee ──
  async function loadPipeline(stage = 'all') {
    setPipeline(null);
    setPipelineDrafts({});
    try {
      const qs   = stage && stage !== 'all' ? `?stage=${stage}` : '';
      const res  = await fetch(`/api/pipeline${qs}`, { headers: authHeaders() });
      const data = await res.json();
      setPipeline(data.data || []);
    } catch { setPipeline([]); }
  }

  async function createLead(e) {
    e.preventDefault();
    if (!pipelineForm.company.trim()) { toast.error('Company is required.'); return; }
    try {
      const res  = await fetch('/api/pipeline', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(pipelineForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Lead added.');
        setPipeline(prev => [data.data, ...(prev || [])]);
        setPipelineForm({ company: '', line: 'cn', contact: '', note: '' });
      } else { toast.error(data.error || 'Failed.'); }
    } catch { toast.error('Network error.'); }
  }

  // 部分更新：把返回行合并回列表；成功返回 true 供调用方决定后续提示/清理
  async function patchLead(id, patch) {
    try {
      const res  = await fetch(`/api/pipeline/${id}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok) {
        setPipeline(prev => (prev || []).map(r => (r.id === id ? data.data : r)));
        return true;
      }
      toast.error(data.error || 'Failed.');
    } catch { toast.error('Network error.'); }
    return false;
  }

  async function advanceStage(id, stage) {
    const ok = await patchLead(id, { stage });
    if (ok) toast.success(`→ ${d.stages[stage] || stage}`);
  }

  async function saveLead(id) {
    const draft = pipelineDrafts[id];
    if (!draft) return;
    const ok = await patchLead(id, {
      note: draft.note,
      next_action: draft.next_action,
      next_action_at: draft.next_action_at || null,
      demand_id: draft.demand_id === '' ? null : draft.demand_id,
    });
    if (ok) {
      toast.success('Saved.');
      setPipelineDrafts(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
  }

  async function deleteLead(id) {
    if (!window.confirm('Delete this lead?')) return;
    try {
      const res = await fetch(`/api/pipeline/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { toast.success('Deleted.'); setPipeline(prev => (prev || []).filter(r => r.id !== id)); }
      else { const dd = await res.json(); toast.error(dd.error || 'Failed.'); }
    } catch { toast.error('Network error.'); }
  }

  // founding 费率：写到关联的 demand 上（契约见 /api/admin/demands/:id/fee，空串=清除覆盖）
  async function setDemandFee(demandId, feePct) {
    try {
      const res  = await fetch(`/api/admin/demands/${demandId}/fee`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ fee_pct: feePct === '' ? null : feePct }),
      });
      const data = await res.json();
      if (res.ok) toast.success(feePct === '' ? 'Fee cleared.' : `Fee set to ${(parseFloat(feePct) * 100).toFixed(1)}%.`);
      else toast.error(data.error || 'Failed.');
    } catch { toast.error('Network error.'); }
  }

  // 行内编辑草稿：无草稿时以当前行数据初始化（next_action_at 截成 datetime-local 需要的 16 位）
  function draftFor(row) {
    return pipelineDrafts[row.id] || {
      note: row.note || '',
      next_action: row.next_action || '',
      next_action_at: row.next_action_at ? String(row.next_action_at).slice(0, 16) : '',
      demand_id: row.demand_id != null ? String(row.demand_id) : '',
      fee_pct: '',
    };
  }
  function setDraft(row, field, value) {
    setPipelineDrafts(prev => ({ ...prev, [row.id]: { ...draftFor(row), [field]: value } }));
  }

  // 单行渲染：演示数据只读展示；真实数据可行内推进阶段 / 编辑备注与下一步 / 关联需求后设费率
  function renderPipelineRow(row, isDemo) {
    const lineBadge = <span className={`${styles.badge} ${styles.badgeGray}`}>{row.line === 'us' ? d.pipeLineUs : d.pipeLineCn}</span>;
    if (isDemo) {
      return (
        <div key={row.id} style={pipeCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600 }}>{row.company} {lineBadge}</div>
            <span className={`${styles.badge} ${styles.badgeGray}`}>{d.stages[row.stage] || row.stage}</span>
          </div>
          <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>{row.contact}</div>
          {row.note && <div style={{ fontSize: 13, marginTop: 6 }}>{row.note}</div>}
          {row.next_action && <div style={{ fontSize: 12, marginTop: 4, color: 'var(--muted)' }}>▶ {row.next_action}</div>}
        </div>
      );
    }
    const draft = draftFor(row);
    const dirty = !!pipelineDrafts[row.id];
    return (
      <div key={row.id} style={pipeCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>{row.company} {lineBadge} {row.contact && <span className={styles.muted} style={{ fontSize: 12, fontWeight: 400 }}>· {row.contact}</span>}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={row.stage} onChange={e => advanceStage(row.id, e.target.value)} style={{ ...pipeInputStyle, width: 'auto' }}>
              {PIPELINE_STAGES.map(s => <option key={s} value={s}>{d.stages[s] || s}</option>)}
            </select>
            <button onClick={() => deleteLead(row.id)} title={d.pipeDelete} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#ef4444', padding: '5px 9px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>🗑</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <div>
            <label style={pipeLabelStyle}>{d.pipeNote}</label>
            <input value={draft.note} onChange={e => setDraft(row, 'note', e.target.value)} style={pipeInputStyle} />
          </div>
          <div>
            <label style={pipeLabelStyle}>{d.pipeNextAction}</label>
            <input value={draft.next_action} onChange={e => setDraft(row, 'next_action', e.target.value)} style={pipeInputStyle} />
          </div>
          <div>
            <label style={pipeLabelStyle}>{d.pipeNextAt}</label>
            <input type="datetime-local" value={draft.next_action_at} onChange={e => setDraft(row, 'next_action_at', e.target.value)} style={pipeInputStyle} />
          </div>
          <div>
            <label style={pipeLabelStyle}>{d.pipeDemandId}</label>
            <input type="number" min="1" value={draft.demand_id} onChange={e => setDraft(row, 'demand_id', e.target.value)} placeholder="—" style={pipeInputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={() => saveLead(row.id)} disabled={!dirty} style={{ background: dirty ? 'var(--primary)' : 'var(--border)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: dirty ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700 }}>{d.pipeSave}</button>
          {/* 关联 demand 后才能设 founding 费率 */}
          {row.demand_id != null && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginLeft: 'auto' }}>
              <div>
                <label style={pipeLabelStyle}>{d.pipeFee}（demand #{row.demand_id}）</label>
                <input type="number" min="0" max="0.99" step="0.01" value={draft.fee_pct} onChange={e => setDraft(row, 'fee_pct', e.target.value)} placeholder="0.05" style={{ ...pipeInputStyle, width: 100 }} />
              </div>
              <button onClick={() => setDemandFee(row.demand_id, draft.fee_pct)} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{d.pipeSetFee}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  async function loadNotifs() {
    if (notifs !== null) return;
    try {
      const res  = await fetch('/api/admin/notifications', { headers: authHeaders() });
      const data = await res.json();
      setNotifs(data);
    } catch { setNotifs({ data: [], byType: {}, unreadCount: 0 }); }
  }

  async function loadKycList(status = 'pending') {
    setKycList(null);
    try {
      const res  = await fetch(`/api/admin/kyc?status=${status}`, { headers: authHeaders() });
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
        headers: authHeaders(true),
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

  // analytics（漏斗 + PMF 信号 + 经营总量，SQL 聚合直接铺进响应根）+ rates（费率分布 summary）
  async function loadFunnel() {
    if (funnel !== null) return;
    try {
      const [aRes, rRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers: authHeaders() }),
        fetch('/api/admin/rates', { headers: authHeaders() }),
      ]);
      const aData = await aRes.json();
      const rData = await rRes.json();
      if (aRes.ok) setFunnel(aData); // 含 funnel / pmf / kyc_pending / totals
      if (rRes.ok) setRates(rData.summary || {});
    } catch {}
  }

  // 审计日志：最近 200 条管理员写操作（只读）
  async function loadAuditLogs() {
    if (auditLogs !== null) return;
    try {
      const res  = await fetch('/api/admin/audit-logs', { headers: authHeaders() });
      const data = await res.json();
      setAuditLogs(data.data || []);
    } catch { setAuditLogs([]); }
  }

  // 现场签到：最近 100 条（含 GPS 围栏结果）
  async function loadCheckins() {
    if (checkins !== null) return;
    try {
      const res  = await fetch('/api/admin/checkins', { headers: authHeaders() });
      const data = await res.json();
      setCheckins(data.data || []);
    } catch { setCheckins([]); }
  }

  // ── Newsletter 订阅 leads：分页读 newsletter_subscribers（契约见 /api/admin/subscribers）──
  // 后端按 created_at 倒序、支持 source/lang 过滤；这里只取第一页（limit=50），按来源筛选。
  async function loadSubscribers(source = subSource) {
    setSubscribers(null);
    setSubSource(source);
    try {
      const qs = source && source !== 'all' ? `&source=${source}` : '';
      const res  = await fetch(`/api/admin/subscribers?limit=50${qs}`, { headers: authHeaders() });
      const data = await res.json();
      setSubscribers(data.data || []);
    } catch { setSubscribers([]); }
  }

  // 导出当前已加载的订阅列表为 CSV（纯前端，不额外打后端）。含逗号/引号/换行的值按 RFC 4180 转义。
  function exportSubscribersCsv() {
    const rows = subscribers || [];
    if (rows.length === 0) { toast.error('Nothing to export.'); return; }
    const cols = ['email', 'source', 'lang', 'created_at', 'unsubscribed_at'];
    const esc  = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'newsletter_subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── 培训认证：待复核考卷（AI 出分后由人工把最后一关再发证）──────────────────
  async function loadExamPending() {
    if (examPending !== null) return;
    try {
      const res  = await fetch('/api/training/admin/pending', { headers: authHeaders() });
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
        headers: authHeaders(true),
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
        headers: authHeaders(true),
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
    { id: 'subscribers', icon: '📧', label: d.navSubscribers },
    { id: 'taxDocs',    icon: '🧾', label: d.navTaxDocs },
    { id: 'pipeline',   icon: '🤝', label: d.navPipeline },
    { id: 'analytics',  icon: '📊', label: d.navAnalytics },
    { id: 'checkins',   icon: '📍', label: d.navCheckins },
    { id: 'audit',      icon: '🗂️', label: d.navAudit },
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
    subscribers: [d.navSubscribers, d.subSubscribers],
    taxDocs: [d.navTaxDocs, d.subTaxDocs],
    pipeline: [d.navPipeline, d.subPipeline],
    analytics: [d.navAnalytics, d.subAnalytics],
    checkins: [d.navCheckins, d.subCheckins],
    audit: [d.navAudit, d.subAudit],
  };
  const [pageTitle, pageSub] = titles[activeTab] || titles.users;

  function selectTab(id) {
    setActiveTab(id);
    if (id === 'certs') loadCerts();
    if (id === 'examReview') loadExamPending();
    if (id === 'disputes') loadDisputes();
    if (id === 'notifs') loadNotifs();
    if (id === 'kyc') loadKycList();
    if (id === 'subscribers') loadSubscribers();
    if (id === 'taxDocs') loadTaxDocs();
    if (id === 'pipeline') loadPipeline();
    if (id === 'analytics') loadFunnel();
    if (id === 'checkins') loadCheckins();
    if (id === 'audit') loadAuditLogs();
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
            <button className={styles.btnLogout} onClick={() => {
              // 退出：清空后台状态 + 抹掉账号化令牌与应急口令，回到登录卡
              setAuthed(false); setStats(null); setAdminToken(null); setPassword('');
              setTwoFAStage('creds'); setTotpCode(''); setSetupInfo(null); setLoginJwt(null);
              if (typeof window !== 'undefined') localStorage.removeItem('tal_admin_token');
            }}>{d.exit}</button>
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

              {/* Newsletter 订阅 leads：来源筛选 + CSV 导出 + 列表（email/source/lang/订阅时间/退订时间）*/}
              {activeTab === 'subscribers' && (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    {['all', 'calculator', 'playbook', 'footer'].map(s => (
                      <button
                        key={s}
                        onClick={() => loadSubscribers(s)}
                        style={{
                          padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12,
                          border: '1px solid var(--border)',
                          background: subSource === s ? 'var(--primary)' : 'var(--surface)',
                          color: subSource === s ? '#fff' : 'var(--text)',
                        }}
                      >{s === 'all' ? d.filterAll : s}</button>
                    ))}
                    <button
                      onClick={exportSubscribersCsv}
                      disabled={!subscribers || subscribers.length === 0}
                      style={{
                        marginLeft: 'auto', padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700,
                        border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
                        cursor: (!subscribers || subscribers.length === 0) ? 'not-allowed' : 'pointer',
                        opacity: (!subscribers || subscribers.length === 0) ? 0.5 : 1,
                      }}
                    >{d.csvExport}</button>
                  </div>
                  <table className={styles.table}>
                    <thead><tr><th>{d.thEmail}</th><th>{d.thSource}</th><th>{d.thLang}</th><th>{d.thDate}</th><th>{d.thUnsub}</th></tr></thead>
                    <tbody>
                      {subscribers === null
                        ? <tr><td colSpan={5} className={styles.empty}>{d.loading}</td></tr>
                        : subscribers.length === 0
                          ? <tr><td colSpan={5} className={styles.empty}>{d.emptySubscribers}</td></tr>
                          : subscribers.map((s, i) => (
                            <tr key={s.email || i} style={{ opacity: s.unsubscribed_at ? 0.55 : 1 }}>
                              <td style={{ fontSize: 12 }}>{s.email}</td>
                              <td><span className={`${styles.badge} ${styles.badgeGray}`}>{s.source || '—'}</span></td>
                              <td className={styles.muted}>{s.lang || '—'}</td>
                              <td className={styles.muted}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                              <td className={styles.muted}>{s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString() : '—'}</td>
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
                  {/* 1099 提示卡：出表流程要点 + 指引文档 */}
                  <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🧾 {d.taxTipTitle}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                      <li>{d.taxTip1}</li>
                      <li>{d.taxTip2}</li>
                      <li>{d.taxTip3}</li>
                    </ul>
                    <div style={{ fontSize: 12, marginTop: 8 }}>📄 <code style={{ fontSize: 11, background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>{d.taxTipDoc}</code></div>
                  </div>
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

              {/* 🤝 Pipeline 看板（人工撮合 PMF 实验）*/}
              {activeTab === 'pipeline' && (
                <div>
                  {/* 新增线索 */}
                  <form onSubmit={createLead} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
                    <div style={{ minWidth: 180 }}>
                      <label style={pipeLabelStyle}>{d.pipeCompany}</label>
                      <input value={pipelineForm.company} onChange={e => setPipelineForm(f => ({ ...f, company: e.target.value }))} placeholder={d.pipeCompany} style={pipeInputStyle} />
                    </div>
                    <div>
                      <label style={pipeLabelStyle}>{d.pipeLine}</label>
                      <select value={pipelineForm.line} onChange={e => setPipelineForm(f => ({ ...f, line: e.target.value }))} style={pipeInputStyle}>
                        <option value="cn">{d.pipeLineCn}</option>
                        <option value="us">{d.pipeLineUs}</option>
                      </select>
                    </div>
                    <div style={{ minWidth: 160 }}>
                      <label style={pipeLabelStyle}>{d.pipeContact}</label>
                      <input value={pipelineForm.contact} onChange={e => setPipelineForm(f => ({ ...f, contact: e.target.value }))} placeholder={d.pipeContact} style={pipeInputStyle} />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={pipeLabelStyle}>{d.pipeNote}</label>
                      <input value={pipelineForm.note} onChange={e => setPipelineForm(f => ({ ...f, note: e.target.value }))} placeholder={d.pipeNote} style={pipeInputStyle} />
                    </div>
                    <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>{d.pipeAdd}</button>
                  </form>

                  {/* 阶段筛选 */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {['all', ...PIPELINE_STAGES].map(s => (
                      <button key={s} onClick={() => loadPipeline(s)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>{s === 'all' ? d.pipeAll : (d.stages[s] || s)}</button>
                    ))}
                  </div>

                  {pipeline === null ? (
                    <p className={styles.empty}>{d.loading}</p>
                  ) : (() => {
                    const isDemo = pipeline.length === 0; // 真实为空 → 演示兜底 3 条
                    const rows = isDemo ? DEMO_PIPELINE : pipeline;
                    return (
                      <div>
                        {isDemo && <div style={{ marginBottom: 12 }}><span className={consoleStyles.demoBadge}>🧪 {d.demoData} · Demo</span></div>}
                        {PIPELINE_STAGES.filter(s => rows.some(r => r.stage === s)).map(s => (
                          <div key={s} style={{ marginBottom: 18 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{d.stages[s] || s} <span className={styles.muted}>({rows.filter(r => r.stage === s).length})</span></div>
                            {rows.filter(r => r.stage === s).map(row => renderPipelineRow(row, isDemo))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Analytics（admin_analytics_summary：漏斗 + PMF 信号 + 经营总量；admin_rates_summary：费率分布）*/}
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
                      {/* PMF 验证指标（复购/纠纷率/口碑/筛选分覆盖 —— 撮合实验的判定仪表） */}
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
                      {/* 经营总量（totals 块，SQL 聚合新增）*/}
                      {funnel.totals && (
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
                          <div style={{ fontWeight: 700, marginBottom: 12 }}>Business Totals（经营总量）</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                            {[
                              { label: 'Total Users', value: funnel.totals.users_total ?? 0 },
                              { label: 'Engineers', value: funnel.totals.users_engineers ?? 0 },
                              { label: 'Employers', value: funnel.totals.users_employers ?? 0 },
                              { label: 'Milestones', value: funnel.totals.milestones_total ?? 0 },
                              { label: 'GMV Released', value: `$${Number(funnel.totals.gmv_released || 0).toLocaleString()}` },
                              { label: 'Escrow Funded', value: `$${Number(funnel.totals.escrow_funded || 0).toLocaleString()}` },
                            ].map(stat => (
                              <div key={stat.label} style={{ background: 'var(--primary-bg, transparent)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{stat.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* 工程师费率分布（admin_rates_summary）*/}
                      {rates && (
                        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
                          <div style={{ fontWeight: 700, marginBottom: 10 }}>Engineer Rate Benchmarks</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                            {[
                              { label: 'Count', value: rates.count ?? 0 },
                              { label: 'Avg Rate', value: `$${Number(rates.avg_rate || 0).toFixed(0)}` },
                              { label: 'Min Rate', value: `$${Number(rates.min_rate || 0).toFixed(0)}` },
                              { label: 'Max Rate', value: `$${Number(rates.max_rate || 0).toFixed(0)}` },
                            ].map(stat => (
                              <div key={stat.label} style={{ background: 'var(--primary-bg, transparent)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{stat.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Conversion Funnel 条形图 */}
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

              {/* 签到记录：现场 GPS 签到 + 围栏结果（只读）*/}
              {activeTab === 'checkins' && (
                <table className={styles.table}>
                  <thead><tr><th>{d.thTime}</th><th>{d.thEngineer}</th><th>{d.thTitle}</th><th>{d.thStatus}</th><th>{d.thFence}</th></tr></thead>
                  <tbody>
                    {checkins === null
                      ? <tr><td colSpan={5} className={styles.empty}>{d.loading}</td></tr>
                      : checkins.length === 0
                        ? <tr><td colSpan={5} className={styles.empty}>{d.emptyCheckins}</td></tr>
                        : checkins.map(c => (
                          <tr key={c.id}>
                            <td className={styles.muted}>{c.checkin_time ? new Date(c.checkin_time).toLocaleString() : '—'}</td>
                            <td style={{ fontSize: 12 }}>{c.engineer_name || `#${c.engineer_id}`}</td>
                            <td style={{ fontSize: 12 }}>{c.demand_title || `#${c.demand_id}`}</td>
                            <td><span className={`${styles.badge} ${styles.badgeGray}`}>{c.status}</span></td>
                            <td>
                              {/* 围栏：仅 geofence_ok===false 才警示越界距离；null（未开围栏）/true 显示 — */}
                              {c.geofence_ok === false
                                ? <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠️ {(Number(c.distance_m || 0) / 1000).toFixed(1)}km</span>
                                : <span className={styles.muted}>—</span>}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              )}

              {/* 审计日志：管理员写操作审计（只读）*/}
              {activeTab === 'audit' && (
                <table className={styles.table}>
                  <thead><tr><th>{d.thTime}</th><th>{d.thEmail}</th><th>{d.thMethod}</th><th>{d.thAction}</th><th>{d.thTarget}</th><th>{d.thIp}</th></tr></thead>
                  <tbody>
                    {auditLogs === null
                      ? <tr><td colSpan={6} className={styles.empty}>{d.loading}</td></tr>
                      : auditLogs.length === 0
                        ? <tr><td colSpan={6} className={styles.empty}>{d.emptyAudit}</td></tr>
                        : auditLogs.map(a => (
                          <tr key={a.id}>
                            <td className={styles.muted}>{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td>
                            <td style={{ fontSize: 12 }}>{a.admin_email || '—'}</td>
                            <td><span className={`${styles.badge} ${styles.badgeGray}`}>{a.auth_method || '—'}</span></td>
                            <td style={{ fontSize: 12 }}>{a.action}</td>
                            <td className={styles.muted}>{a.target || '—'}</td>
                            <td className={styles.muted} style={{ fontSize: 12 }}>{a.ip || '—'}</td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
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

      {/* Admin copilot：全站同款 Maisui 助手，admin 场景后端已就绪 get_admin_analytics 工具 */}
      <ChatBot lang={lang} />
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
