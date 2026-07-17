import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../hooks/useTheme';
import styles from './console.module.css';

const LS_USER_KEY = 'tal_user';
const SCREEN_KEYS = ['dashboard', 'projects', 'escrow', 'messages', 'find', 'profile', 'admin'];

// ── UI 文案（en/zh 先行，其余语言回退英文）。示例业务数据（项目名/工程师/金额）为占位，
//    待接入真实 Supabase 数据；这里不翻译，代表 DB 行。──────────────────────────────
const DICT = {
  en: {
    workspace: 'Workspace', employer: 'Employer', engineer: 'Engineer', admin: 'Admin',
    navDashboard: 'Dashboard', navProjects: 'Projects', navEscrow: 'Escrow & Payments',
    navMessages: 'Messages', navFind: 'Find Engineers', navProfile: 'Profile & Certification',
    navAdmin: 'Admin · All Data',
    searchPh: 'Search projects, engineers…',
    ctaPost: '＋ Post a Project', ctaBrowse: '＋ Browse Projects', ctaManage: '＋ Manage Platform',
    subDashEmployer: 'Overview of your active projects and escrow',
    subDashEngineer: 'Your projects, earnings, and tasks',
    subProjects: 'Milestones, timelines, and escrow status',
    subEscrow: 'Milestone-protected funds via Stripe',
    subMessages: 'AI PM translates in real time',
    subFind: 'AI-verified automation talent',
    subProfile: 'Your AI Technical Screener status',
    subAdmin: 'Manage every page and all platform data',
    roleEmployerLabel: 'Employer · OEM', roleEngineerLabel: 'Engineer · Verified', roleAdminLabel: 'Super Admin · Platform',
    // Dashboard
    mActive: 'Active projects', mEscrow: 'In escrow', mReview: 'Awaiting review', mUnread: 'Unread messages',
    mActiveSub: '▲ 2 this month', mEscrowSub: 'across 4 milestones', mReviewSub: '● action needed', mUnreadSub: '2 need translation',
    recentActivity: 'Recent milestone activity', allProjects: 'All projects →', yourTodos: 'Your to-dos',
    // Projects
    filterAll: 'All 7', filterProgress: 'In progress 4', filterReview: 'Review 2', milestoneTimeline: 'Milestone timeline',
    approveRelease: 'Approve & release', requestChanges: 'Request changes',
    // Escrow
    heldInEscrow: 'Held in escrow', releasedToDate: 'Released to date', pendingAction: 'Pending your action',
    heldSub: '4 active milestones', releasedSub: '18 milestones', pendingSub: '1 awaiting release',
    transactions: 'Transactions', stripeNote: 'Stripe · escrow-protected',
    thMilestone: 'Milestone', thProject: 'Project', thDate: 'Date', thAmount: 'Amount', thStatus: 'Status',
    // Messages
    messages: 'Messages', composerPh: 'Type in English — auto-translated…',
    // Find
    findPh: 'Search by skill, platform, or region…', search: 'Search', verified: '✓ Verified', invite: 'Invite',
    noEngineers: 'No engineers to show yet.',
    // Profile
    screenerStatus: 'AI Technical Screener status', passed: 'PASSED', takeAssessment: 'Take assessment →',
    notTaken: '— not taken', skillsPlatforms: 'Skills & platforms', addSkill: '+ Add skill',
    aiVerifiedEngineer: '🛡️ AI-Verified Engineer', jobs: 'Jobs', rating: 'Rating',
    // Admin
    adminDataTitle: 'Platform data manager', adminDataDesc: 'Users, demands, certifications, exams, payouts and PMF signals.',
    adminOpen: 'Open Admin Data Manager →', adminPagesTitle: 'All pages', adminPagesDesc: 'Jump into any page as the super admin.',
  },
  zh: {
    workspace: '工作台', employer: '雇主', engineer: '工程师', admin: '管理员',
    navDashboard: '仪表盘', navProjects: '项目', navEscrow: '托管与支付',
    navMessages: '消息', navFind: '寻找工程师', navProfile: '档案与认证',
    navAdmin: '管理 · 全部数据',
    searchPh: '搜索项目、工程师…',
    ctaPost: '＋ 发布项目', ctaBrowse: '＋ 浏览项目', ctaManage: '＋ 平台管理',
    subDashEmployer: '你的活跃项目与托管概览',
    subDashEngineer: '你的项目、收入与待办',
    subProjects: '里程碑、进度与托管状态',
    subEscrow: '经 Stripe 的里程碑资金托管',
    subMessages: 'AI 项目经理实时翻译',
    subFind: '经 AI 认证的自动化人才',
    subProfile: '你的 AI 技术筛选状态',
    subAdmin: '管理所有页面与全部平台数据',
    roleEmployerLabel: '雇主 · 设备厂商', roleEngineerLabel: '工程师 · 已认证', roleAdminLabel: '超级管理员 · 平台',
    mActive: '活跃项目', mEscrow: '托管中', mReview: '待审核', mUnread: '未读消息',
    mActiveSub: '▲ 本月 +2', mEscrowSub: '分布在 4 个里程碑', mReviewSub: '● 需要处理', mUnreadSub: '2 条需翻译',
    recentActivity: '近期里程碑动态', allProjects: '全部项目 →', yourTodos: '你的待办',
    filterAll: '全部 7', filterProgress: '进行中 4', filterReview: '待审 2', milestoneTimeline: '里程碑时间线',
    approveRelease: '通过并放款', requestChanges: '要求修改',
    heldInEscrow: '托管中', releasedToDate: '累计已放款', pendingAction: '待你处理',
    heldSub: '4 个活跃里程碑', releasedSub: '18 个里程碑', pendingSub: '1 个待放款',
    transactions: '交易记录', stripeNote: 'Stripe · 托管保护',
    thMilestone: '里程碑', thProject: '项目', thDate: '日期', thAmount: '金额', thStatus: '状态',
    messages: '消息', composerPh: '用英文输入 —— 自动翻译…',
    findPh: '按技能、平台或地区搜索…', search: '搜索', verified: '✓ 已认证', invite: '邀请',
    noEngineers: '暂无可展示的工程师。',
    screenerStatus: 'AI 技术筛选状态', passed: '已通过', takeAssessment: '去考试 →',
    notTaken: '— 未参加', skillsPlatforms: '技能与平台', addSkill: '+ 添加技能',
    aiVerifiedEngineer: '🛡️ AI 认证工程师', jobs: '接单', rating: '评分',
    adminDataTitle: '平台数据管理', adminDataDesc: '用户、需求、认证、考试、打款与 PMF 信号。',
    adminOpen: '打开管理后台 →', adminPagesTitle: '所有页面', adminPagesDesc: '以超级管理员身份进入任意页面。',
  },
};

// ── 占位业务数据（代表 DB 行，后续接入真实数据）──────────────────────────────
const FEED = [
  { dot: 'var(--success)', title: 'M2 · SCADA integration — approved', sub: 'Line-3 Retrofit · Priya K.', amt: '$8,000' },
  { dot: 'var(--accent)', title: 'M3 · FAT documentation — awaiting your review', sub: 'Weld-cell #4 · Diego R.', amt: '$6,500' },
  { dot: 'var(--primary)', title: 'M1 · PLC migration — funded to escrow', sub: 'Packaging Line VN · Minh N.', amt: '$12,000' },
  { dot: 'var(--text-muted)', title: 'M4 · Commissioning — not started', sub: 'Line-3 Retrofit · Priya K.', amt: '$5,000', muted: true },
];
const TODOS = [
  { icon: '📝', title: 'Review M3 deliverable', sub: 'Weld-cell #4 · due today', active: true },
  { icon: '💬', title: 'Reply to Minh N.', sub: '2 messages · auto-translated' },
  { icon: '💰', title: 'Fund M4 milestone', sub: 'Line-3 Retrofit · $5,000' },
];
const PROJECTS = [
  {
    name: 'Line-3 SCADA Retrofit', status: 'review', meta: '🇮🇳 Priya K. · Ignition SCADA · 4 milestones',
    pct: 62, done: '2 of 4 milestones', total: '$27,000',
    detailMeta: ['🇮🇳 Priya K.', 'Ignition SCADA · OPC UA', 'Started Apr 2'],
    milestones: [
      { state: 'done', title: 'M1 · Requirements & tag database', sub: 'Released Apr 10', amt: '$8,000 released', cls: 'good' },
      { state: 'done', title: 'M2 · SCADA integration', sub: 'Approved Apr 24', amt: '$8,000 released', cls: 'good' },
      { state: 'await', title: 'M3 · FAT documentation', sub: 'Submitted · awaiting your review', amt: '$6,000 funded', cls: 'warn', actions: true },
      { state: 'todo', title: 'M4 · On-site commissioning', sub: 'Not started', amt: '$5,000', muted: true },
    ],
  },
  {
    name: 'Weld-cell #4 Integration', status: 'active', meta: '🇲🇽 Diego R. · Fanuc Robotics · 3 milestones',
    pct: 40, done: '1 of 3 milestones', total: '$18,500',
    detailMeta: ['🇲🇽 Diego R.', 'Fanuc Robotics · RoboGuide', 'Started Apr 12'],
    milestones: [
      { state: 'done', title: 'M1 · Cell layout & safety', sub: 'Released Apr 20', amt: '$6,000 released', cls: 'good' },
      { state: 'await', title: 'M2 · Robot programming', sub: 'In progress', amt: '$7,500 funded', cls: 'warn', actions: true },
      { state: 'todo', title: 'M3 · Commissioning & FAT', sub: 'Not started', amt: '$5,000', muted: true },
    ],
  },
  {
    name: 'Packaging Line VN', status: 'active', meta: '🇻🇳 Minh N. · Siemens TIA · 5 milestones',
    pct: 20, done: '1 of 5 milestones', total: '$41,000',
    detailMeta: ['🇻🇳 Minh N.', 'Siemens TIA · WinCC', 'Started Apr 18'],
    milestones: [
      { state: 'done', title: 'M1 · PLC migration', sub: 'Funded to escrow Apr 22', amt: '$12,000 funded', cls: 'warn' },
      { state: 'todo', title: 'M2 · HMI development', sub: 'Not started', amt: '$9,000', muted: true },
      { state: 'todo', title: 'M3 · Line integration', sub: 'Not started', amt: '$10,000', muted: true },
    ],
  },
];
const TRANSACTIONS = [
  { ms: 'M3 · FAT documentation', proj: 'Line-3 Retrofit', date: 'Apr 28', amt: '$6,500', status: 'funded' },
  { ms: 'M1 · PLC migration', proj: 'Packaging Line VN', date: 'Apr 22', amt: '$12,000', status: 'locked' },
  { ms: 'M2 · SCADA integration', proj: 'Line-3 Retrofit', date: 'Apr 24', amt: '$8,000', status: 'released' },
  { ms: 'M1 · Requirements & tags', proj: 'Line-3 Retrofit', date: 'Apr 10', amt: '$8,000', status: 'released' },
];
const CONVERSATIONS = [
  { initials: 'MN', name: 'Minh N. 🇻🇳', time: '2m', preview: 'Tôi đã hoàn thành phần migration…', active: true, dot: true },
  { initials: 'DR', name: 'Diego R. 🇲🇽', time: '1h', preview: 'FAT report attached, ready for review' },
  { initials: 'PK', name: 'Priya K. 🇮🇳', time: '3h', preview: 'Thanks, will start M4 next week' },
];
const THREAD = [
  { side: 'their', text: 'Tôi đã hoàn thành phần migration PLC, đang chạy thử nghiệm FAT.', tag: 'EN', trans: "I've completed the PLC migration and am now running the FAT test.", time: '10:24' },
  { side: 'mine', text: 'Great work! Please attach the FAT checklist when ready.', tag: 'VI', trans: 'Làm tốt lắm! Vui lòng đính kèm danh sách kiểm tra FAT khi sẵn sàng.', time: '10:26 · Seen' },
  { side: 'their', text: 'Vâng, tôi sẽ gửi trong hôm nay.', tag: 'EN', trans: "Sure, I'll send it over today.", time: '10:27' },
];
const ENGINEERS_PLACEHOLDER = [
  { id: null, initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Ho Chi Minh · 9 yrs', chips: ['TIA Portal', 'WinCC', 'Profinet'], rate: '$38/hr', star: '4.9', verified: true },
  { id: null, initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey · 12 yrs', chips: ['Fanuc', 'Studio 5000', 'Vision'], rate: '$52/hr', star: '5.0', verified: true },
  { id: null, initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune · 8 yrs', chips: ['Ignition', 'OPC UA', 'Python'], rate: '$34/hr', star: '4.8', verified: true },
];
const CERT_SCORES = [
  { label: 'PLC Programming (Siemens TIA)', score: 92, cls: 'good' },
  { label: 'SCADA / HMI (WinCC)', score: 88, cls: 'good' },
  { label: 'Industrial Networking (Profinet)', score: 76, cls: 'mid' },
  { label: 'Robotics (Fanuc)', score: null },
];
const PROFILE_SKILLS = ['Siemens TIA Portal', 'WinCC', 'Profinet', 'S7-1500', 'Safety PLC'];

// 超级管理员"所有页面"入口
const ADMIN_PAGES = [
  { icon: '🏠', label: 'Landing', href: '/' },
  { icon: '🔍', label: 'Find Engineers', href: '/talent' },
  { icon: '📈', label: 'Rate Benchmarks', href: '/rates' },
  { icon: '📊', label: 'Finance & Escrow', href: '/finance' },
  { icon: '💬', label: 'Messages', href: '/messages' },
  { icon: '🎓', label: 'Training & Cert', href: '/training' },
  { icon: '👤', label: 'Profile Editor', href: '/onboarding' },
  { icon: '🔑', label: 'Enterprise API', href: '/enterprise' },
];

function initialsOf(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (email || '?')[0].toUpperCase();
}
// 把 /api/talent/list 的行映射成引擎卡片所需结构
function mapEngineer(t) {
  const skills = (t.skills || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  return {
    id: t.id,
    initials: initialsOf(t.name),
    name: t.name || 'Engineer',
    loc: (t.region || '').trim(),
    chips: skills,
    rate: t.rate || '—',
    star: t.avg_rating ? Number(t.avg_rating).toFixed(1) : '—',
    verified: (t.verified_score || 0) >= 60,
  };
}

export default function Console() {
  const router = useRouter();
  const [lang, setLang] = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('employer');
  const [screen, setScreen] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(0);
  const [sbOpen, setSbOpen] = useState(false);
  const [engineers, setEngineers] = useState(null); // null → 用占位

  // 登录校验 + 默认角色
  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) { router.replace('/finance'); return; }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      setRole(u.role === 'engineer' ? 'engineer' : u.role === 'admin' ? 'admin' : 'employer');
    } catch { router.replace('/finance'); }
  }, []);

  // ?screen= 深链
  useEffect(() => {
    const s = router.query.screen;
    if (typeof s === 'string' && SCREEN_KEYS.includes(s)) setScreen(s);
  }, [router.query.screen]);

  // Find Engineers 复用公开 /api/talent/list；失败静默回退占位
  useEffect(() => {
    let alive = true;
    fetch('/api/talent/list?limit=6')
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!alive || !j) return;
        const rows = j.data || j.talents || [];
        if (Array.isArray(rows) && rows.length) setEngineers(rows.slice(0, 6).map(mapEngineer));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const d = { ...DICT.en, ...(DICT[lang] || {}) };
  if (!user) return null;

  const isSuper = user.role === 'admin';           // 超级账户：可管理所有页面和数据
  const isEmployer = role === 'employer';
  const isEngineer = role === 'engineer';
  const isAdminView = role === 'admin';

  // 角色专属屏幕越界时回退到 dashboard
  let effScreen = screen;
  if (!isEmployer && effScreen === 'find') effScreen = 'dashboard';
  if (!isEngineer && effScreen === 'profile') effScreen = 'dashboard';
  if (effScreen === 'admin' && !isSuper) effScreen = 'dashboard';

  function go(s) { setScreen(s); setSbOpen(false); }
  function switchRole(r) {
    setRole(r);
    if (r !== 'employer' && screen === 'find') setScreen('dashboard');
    if (r !== 'engineer' && screen === 'profile') setScreen('dashboard');
    if (r !== 'admin' && screen === 'admin') setScreen('dashboard');
    setSbOpen(false);
  }

  const navItems = [
    { key: 'dashboard', icon: '▦', label: d.navDashboard },
    { key: 'projects', icon: '📁', label: d.navProjects, badge: '7' },
    { key: 'escrow', icon: '💰', label: d.navEscrow },
    { key: 'messages', icon: '💬', label: d.navMessages, badge: '5' },
  ];
  if (isEmployer) navItems.push({ key: 'find', icon: '🔍', label: d.navFind });
  if (isEngineer) navItems.push({ key: 'profile', icon: '👤', label: d.navProfile });
  if (isAdminView) navItems.push({ key: 'admin', icon: '🛡️', label: d.navAdmin });

  const titles = {
    dashboard: [d.navDashboard, isEmployer ? d.subDashEmployer : isEngineer ? d.subDashEngineer : d.subAdmin],
    projects: [d.navProjects, d.subProjects],
    escrow: [d.navEscrow, d.subEscrow],
    messages: [d.navMessages, d.subMessages],
    find: [d.navFind, d.subFind],
    profile: [d.navProfile, d.subProfile],
    admin: [d.navAdmin, d.subAdmin],
  };
  const [pageTitle, pageSub] = titles[effScreen] || titles.dashboard;
  const primaryCta = isEmployer ? d.ctaPost : isEngineer ? d.ctaBrowse : d.ctaManage;
  const primaryHref = isAdminView ? '/admin' : '/talent';
  const userInitials = initialsOf(user.name, user.email);
  const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const roleLabel = isEmployer ? d.roleEmployerLabel : isEngineer ? d.roleEngineerLabel : d.roleAdminLabel;
  const proj = PROJECTS[selectedProject] || PROJECTS[0];
  const engineersToShow = engineers || ENGINEERS_PLACEHOLDER;

  return (
    <>
      <Head><title>Console | Talengineer</title></Head>

      <div className={styles.shell}>
        <div className={sbOpen ? styles.backdropOpen : styles.backdrop} onClick={() => setSbOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`${styles.sidebar} ${sbOpen ? styles.sidebarOpen : ''}`}>
          <Link href="/" className={styles.sbLogo}>
            <img src="/img/logo-macaw.svg" alt="" width={28} height={28} />
            <b>Talengineer</b>
          </Link>

          <div className={styles.sbSection}>
            <div className={styles.sbLabel}>{d.workspace}</div>
            <div className={styles.roleSwitch}>
              <button className={`${styles.roleTab} ${isEmployer ? styles.roleTabActive : ''}`} onClick={() => switchRole('employer')}>{d.employer}</button>
              <button className={`${styles.roleTab} ${isEngineer ? styles.roleTabActive : ''}`} onClick={() => switchRole('engineer')}>{d.engineer}</button>
              {isSuper && <button className={`${styles.roleTab} ${isAdminView ? styles.roleTabActive : ''}`} onClick={() => switchRole('admin')}>{d.admin}</button>}
            </div>
          </div>

          <nav className={styles.nav}>
            {navItems.map(it => (
              <button key={it.key} className={`${styles.navItem} ${effScreen === it.key ? styles.navItemActive : ''}`} onClick={() => go(it.key)}>
                <span className={styles.navIcon}>{it.icon}</span>
                <span className={styles.navLabel}>{it.label}</span>
                {it.badge && <span className={styles.navBadge}>{it.badge}</span>}
              </button>
            ))}
          </nav>

          <div className={styles.sbFooter}>
            <span className={styles.sbAvatar}>{userInitials}</span>
            <div className={styles.sbUserMeta}>
              <div className={styles.sbUserName}>{userName}</div>
              <div className={styles.sbUserRole}>{roleLabel}</div>
            </div>
            <Link href="/onboarding" className={styles.sbGear} title="Settings">⚙</Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className={styles.main}>
          <header className={styles.topbar}>
            <button className={styles.hamburger} onClick={() => setSbOpen(v => !v)} aria-label="Menu">☰</button>
            <div>
              <div className={styles.topTitle}>{pageTitle}</div>
              <div className={styles.topSub}>{pageSub}</div>
            </div>
            <div className={styles.grow} />
            <div className={styles.search}>
              <span>🔍</span>
              <input placeholder={d.searchPh} />
            </div>
            <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className={styles.iconBtn} aria-label="Notifications">🔔<span className={styles.bellBadge}>3</span></button>
            <Link href={primaryHref} className={styles.ctaBtn}>{primaryCta}</Link>
          </header>

          <main className={styles.content}>
            {/* ===== DASHBOARD ===== */}
            {effScreen === 'dashboard' && (
              <div className={styles.stack}>
                <div className={styles.metricGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mActive}</div>
                    <div className={styles.metricNum}>7</div>
                    <div className={`${styles.metricSub} ${styles.metricSubGood}`}>{d.mActiveSub}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mEscrow}</div>
                    <div className={`${styles.metricNum} ${styles.metricNumPrimary}`}>$48,200</div>
                    <div className={styles.metricSub}>{d.mEscrowSub}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mReview}</div>
                    <div className={styles.metricNum}>2</div>
                    <div className={`${styles.metricSub} ${styles.metricSubWarn}`}>{d.mReviewSub}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mUnread}</div>
                    <div className={styles.metricNum}>5</div>
                    <div className={styles.metricSub}>{d.mUnreadSub}</div>
                  </div>
                </div>

                <div className={styles.dash2col}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <b>{d.recentActivity}</b>
                      <button className={styles.linkBtn} onClick={() => go('projects')}>{d.allProjects}</button>
                    </div>
                    <div className={styles.feed}>
                      {FEED.map((f, i) => (
                        <div key={i} className={styles.feedRow}>
                          <span className={styles.dot} style={{ background: f.dot }} />
                          <div className={styles.feedMain}>
                            <div className={styles.feedTitle}>{f.title}</div>
                            <div className={styles.feedSub}>{f.sub}</div>
                          </div>
                          <span className={styles.mono} style={{ fontSize: 13, color: f.muted ? 'var(--text-muted)' : 'var(--text)' }}>{f.amt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardHead}><b>{d.yourTodos}</b></div>
                    <div className={styles.todoList}>
                      {TODOS.map((t, i) => (
                        <div key={i} className={`${styles.todo} ${t.active ? styles.todoActive : ''}`}>
                          <span style={{ fontSize: 15 }}>{t.icon}</span>
                          <div>
                            <div className={styles.todoTitle}>{t.title}</div>
                            <div className={styles.todoSub}>{t.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROJECTS ===== */}
            {effScreen === 'projects' && (
              <div className={styles.projGrid}>
                <div className={styles.projList}>
                  <div className={styles.pillRow}>
                    <button className={`${styles.pill} ${styles.pillActive}`}>{d.filterAll}</button>
                    <button className={`${styles.pill} ${styles.pillMuted}`}>{d.filterProgress}</button>
                    <button className={`${styles.pill} ${styles.pillMuted}`}>{d.filterReview}</button>
                  </div>
                  {PROJECTS.map((p, i) => (
                    <button key={i} className={`${styles.projCard} ${i === selectedProject ? styles.projCardActive : ''}`} onClick={() => setSelectedProject(i)}>
                      <div className={styles.projTop}>
                        <b className={styles.projName}>{p.name}</b>
                        <span className={`${styles.badge} ${p.status === 'review' ? styles.badgeReview : styles.badgeActive}`}>{p.status === 'review' ? 'REVIEW' : 'ACTIVE'}</span>
                      </div>
                      <div className={styles.projMeta}>{p.meta}</div>
                      <div className={styles.progress}><div className={styles.progressFill} style={{ width: `${p.pct}%` }} /></div>
                      <div className={styles.projFoot}><span>{p.done}</span><span className={styles.mono} style={{ color: 'var(--text)' }}>{p.total}</span></div>
                    </button>
                  ))}
                </div>

                <div className={styles.detailCard}>
                  <div className={styles.detailHead}>
                    <div className={styles.detailTitleRow}>
                      <b className={styles.detailTitle}>{proj.name}</b>
                      <span className={`${styles.badge} ${proj.status === 'review' ? styles.badgeReview : styles.badgeActive}`}>{proj.status === 'review' ? 'REVIEW NEEDED' : 'ACTIVE'}</span>
                    </div>
                    <div className={styles.detailMeta}>
                      {proj.detailMeta.map((m, i) => (<span key={i}>{i > 0 && '· '}{m}</span>))}
                    </div>
                  </div>
                  <div className={styles.timeline}>
                    <div className={styles.tlLabel}>{d.milestoneTimeline}</div>
                    <div style={{ position: 'relative', paddingLeft: 26 }}>
                      <div className={styles.timeLine} />
                      {proj.milestones.map((m, i) => (
                        <div key={i} className={styles.node}>
                          <span className={`${styles.nodeDot} ${m.state === 'done' ? styles.nodeDone : m.state === 'await' ? styles.nodeAwait : styles.nodeTodo}`}>
                            {m.state === 'done' ? '✓' : m.state === 'await' ? '●' : ''}
                          </span>
                          <div className={styles.msRow}>
                            <div>
                              <b className={`${styles.msTitle} ${m.muted ? styles.msTitleMuted : ''}`}>{m.title}</b>
                              <div className={styles.msSub}>{m.sub}</div>
                            </div>
                            <span className={styles.msAmt} style={{ color: m.cls === 'good' ? 'var(--success)' : m.cls === 'warn' ? 'var(--accent)' : 'var(--text-muted)' }}>{m.amt}</span>
                          </div>
                          {m.actions && (
                            <div className={styles.msActions}>
                              <button className={styles.btnApprove} onClick={() => router.push('/finance')}>{d.approveRelease}</button>
                              <button className={styles.btnChanges} onClick={() => router.push('/finance')}>{d.requestChanges}</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ESCROW ===== */}
            {effScreen === 'escrow' && (
              <div className={styles.stack}>
                <div className={styles.escrowGrid}>
                  <div className={styles.escrowHero}>
                    <div className={styles.escrowHeroLabel}>{d.heldInEscrow}</div>
                    <div className={styles.escrowHeroNum}>$48,200</div>
                    <div className={styles.escrowHeroSub}>{d.heldSub}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.releasedToDate}</div>
                    <div className={styles.metricNum}>$124,500</div>
                    <div className={`${styles.metricSub} ${styles.metricSubGood}`}>{d.releasedSub}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.pendingAction}</div>
                    <div className={styles.metricNum} style={{ color: 'var(--accent)' }}>$6,500</div>
                    <div className={styles.metricSub}>{d.pendingSub}</div>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHead}><b>{d.transactions}</b><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.stripeNote}</span></div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>{d.thMilestone}</th><th>{d.thProject}</th><th>{d.thDate}</th>
                          <th className={styles.tRight}>{d.thAmount}</th><th className={styles.tRight}>{d.thStatus}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TRANSACTIONS.map((t, i) => (
                          <tr key={i}>
                            <td>{t.ms}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.proj}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.date}</td>
                            <td className={`${styles.tRight} ${styles.mono}`} style={{ fontSize: 13 }}>{t.amt}</td>
                            <td className={styles.tRight}>
                              <span className={`${styles.chip} ${t.status === 'funded' ? styles.chipFunded : t.status === 'locked' ? styles.chipLocked : styles.chipReleased}`}>
                                {t.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MESSAGES ===== */}
            {effScreen === 'messages' && (
              <div className={styles.msgWrap}>
                <div className={styles.convList}>
                  <div className={styles.convHead}><b>{d.messages}</b></div>
                  <div className={styles.convScroll}>
                    {CONVERSATIONS.map((c, i) => (
                      <button key={i} className={`${styles.conv} ${c.active ? styles.convActive : ''}`} onClick={() => router.push('/messages')}>
                        <span className={`${styles.convAvatar} ${c.active ? styles.convAvatarActive : ''}`}>{c.initials}</span>
                        <div className={styles.convBody}>
                          <div className={styles.convTop}><b className={styles.convName}>{c.name}</b><span className={styles.convTime}>{c.time}</span></div>
                          <div className={styles.convPreview}>{c.preview}</div>
                        </div>
                        {c.dot && <span className={styles.convDot} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.thread}>
                  <div className={styles.threadHead}>
                    <span className={styles.threadAvatar}>MN</span>
                    <div className={styles.grow}>
                      <div className={styles.threadName}>Minh N. 🇻🇳</div>
                      <div className={styles.threadSub}>Packaging Line VN · Siemens TIA</div>
                    </div>
                    <span className={styles.aiChip}>✨ AI PM · VI ⇄ EN</span>
                  </div>
                  <div className={styles.bubbles}>
                    {THREAD.map((m, i) => (
                      <div key={i} className={m.side === 'mine' ? styles.bubbleMine : styles.bubbleTheir}>
                        <div className={m.side === 'mine' ? styles.bubMine : styles.bubTheir}>
                          <div>{m.text}</div>
                          <div className={`${styles.trans} ${m.side === 'mine' ? styles.transMine : ''}`}>
                            <span className={`${styles.transTag} ${m.side === 'mine' ? styles.transTagMine : ''}`}>✨ {m.tag}</span>&nbsp; {m.trans}
                          </div>
                        </div>
                        <div className={`${styles.msgTime} ${m.side === 'mine' ? styles.msgTimeMine : ''}`}>{m.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.composer}>
                    <input placeholder={d.composerPh} onFocus={() => router.push('/messages')} readOnly />
                    <button className={styles.sendBtn} onClick={() => router.push('/messages')}>➤</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== FIND ENGINEERS ===== */}
            {effScreen === 'find' && (
              <div className={styles.stack}>
                <div className={styles.findBar}>
                  <span>🔍</span>
                  <input placeholder={d.findPh} />
                  <span className={styles.filterChip}>PLC ✕</span>
                  <span className={styles.filterChip}>🇻🇳 Vietnam ✕</span>
                  <Link href="/talent" className={styles.searchBtn}>{d.search}</Link>
                </div>
                <div className={styles.engGrid}>
                  {engineersToShow.length === 0 && <div className={styles.emptyNote}>{d.noEngineers}</div>}
                  {engineersToShow.map((e, i) => (
                    <div key={i} className={styles.engCard}>
                      <div className={styles.engTop}>
                        <span className={styles.engAvatar}>{e.initials}</span>
                        <div className={styles.engMeta}>
                          <b className={styles.engName}>{e.name}</b>
                          <div className={styles.engLoc}>{e.loc}</div>
                        </div>
                        {e.verified && <span className={styles.verChip}>{d.verified}</span>}
                      </div>
                      <div className={styles.chipRow}>
                        {e.chips.map((c, j) => <span key={j} className={styles.techChip}>{c}</span>)}
                      </div>
                      <div className={styles.engFoot}>
                        <span className={styles.engRate}>{e.rate}</span>
                        <span className={styles.engStar}>★ {e.star}</span>
                        <Link href={e.id ? `/engineer/${e.id}` : '/talent'} className={styles.inviteBtn}>{d.invite}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PROFILE & CERTIFICATION ===== */}
            {effScreen === 'profile' && (
              <div className={styles.profGrid}>
                <div className={styles.profCard}>
                  <span className={styles.profAvatar}>{userInitials}</span>
                  <b className={styles.profName}>{userName}</b>
                  <div className={styles.profLoc}>🇻🇳 Ho Chi Minh City · 9 yrs experience</div>
                  <span className={styles.verBadge}>{d.aiVerifiedEngineer}</span>
                  <div className={styles.profStats}>
                    <div><div className={styles.profStatNum}>27</div><div className={styles.profStatLbl}>{d.jobs}</div></div>
                    <div><div className={`${styles.profStatNum} ${styles.profStatNumAccent}`}>4.9</div><div className={styles.profStatLbl}>{d.rating}</div></div>
                    <div><div className={`${styles.profStatNum} ${styles.profStatNumPrimary}`}>$38</div><div className={styles.profStatLbl}>/hr</div></div>
                  </div>
                </div>
                <div className={styles.certStack}>
                  <div className={styles.certCard}>
                    <div className={styles.certHead}><b>{d.screenerStatus}</b><span className={`${styles.badge} ${styles.badgePassed}`}>{d.passed}</span></div>
                    <div className={styles.scoreList}>
                      {CERT_SCORES.map((s, i) => (
                        <div key={i}>
                          <div className={`${styles.scoreTop} ${s.score == null ? styles.scoreTopMuted : ''}`}>
                            <span>{s.label}{s.score == null ? ` ${d.notTaken}` : ''}</span>
                            <span className={`${styles.scoreVal} ${s.cls === 'good' ? styles.scoreValGood : s.cls === 'mid' ? styles.scoreValMid : ''}`}>{s.score == null ? '—' : `${s.score} / 100`}</span>
                          </div>
                          <div className={styles.scoreBar}>
                            {s.score != null && <div className={`${styles.scoreFill} ${s.cls === 'good' ? styles.scoreFillGood : styles.scoreFillMid}`} style={{ width: `${s.score}%` }} />}
                          </div>
                          {s.score == null && <Link href="/training" className={styles.takeBtn}>{d.takeAssessment}</Link>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.certCard}>
                    <b style={{ fontSize: 15, color: 'var(--text)' }}>{d.skillsPlatforms}</b>
                    <div className={styles.skillWrap}>
                      {PROFILE_SKILLS.map((s, i) => <span key={i} className={styles.skillChip}>{s}</span>)}
                      <Link href="/onboarding" className={`${styles.skillChip} ${styles.addSkill}`}>{d.addSkill}</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ADMIN · ALL DATA (super account only) ===== */}
            {effScreen === 'admin' && isSuper && (
              <div className={styles.stack}>
                <div className={styles.escrowGrid}>
                  <div className={styles.escrowHero}>
                    <div className={styles.escrowHeroLabel}>{d.adminDataTitle}</div>
                    <div className={styles.escrowHeroNum} style={{ fontSize: 22, marginTop: 10 }}>{d.adminDataDesc}</div>
                    <Link href="/admin" className={styles.searchBtn} style={{ display: 'inline-block', marginTop: 14, background: '#fff', color: '#0056b3' }}>{d.adminOpen}</Link>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mActive}</div>
                    <div className={styles.metricNum}>7</div>
                    <div className={styles.metricSub}>{d.recentActivity}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.heldInEscrow}</div>
                    <div className={`${styles.metricNum} ${styles.metricNumPrimary}`}>$48,200</div>
                    <div className={styles.metricSub}>{d.heldSub}</div>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHead}><b>{d.adminPagesTitle}</b><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.adminPagesDesc}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, padding: 16 }}>
                    {ADMIN_PAGES.map((p, i) => (
                      <Link key={i} href={p.href} className={styles.todo} style={{ textDecoration: 'none', alignItems: 'center' }}>
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <div className={styles.todoTitle}>{p.label}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
