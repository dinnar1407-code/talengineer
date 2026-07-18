import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../components/Toast';
import ConsoleShell from '../components/ConsoleShell';
import styles from './console.module.css';

const LS_USER_KEY = 'tal_user';
const SCREEN_KEYS = ['dashboard', 'projects', 'escrow', 'messages', 'find', 'profile', 'admin'];

// ── UI 文案（en/zh 先行，其余语言回退英文）。所有屏幕现已绑定真实 API，
//    这里只保留纯 UI 文案；业务数据（项目名/金额/工程师）全部来自后端。──────────
const DICT = {
  en: {
    workspace: 'Workspace', employer: 'Employer', engineer: 'Engineer', admin: 'Admin',
    navDashboard: 'Dashboard', navProjects: 'Projects', navEscrow: 'Escrow & Payments',
    navMessages: 'Messages', navFind: 'Find Engineers', navProfile: 'Profile & Certification',
    navTraining: 'Training & Cert', navAdmin: 'Admin · All Data',
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
    // Notifications
    notifications: 'Notifications', markAllRead: 'Mark all read', notifEmpty: 'No notifications',
    // Dashboard
    mActive: 'Active projects', mEscrow: 'In escrow', mReview: 'Awaiting review', mUnread: 'Unread messages',
    mReviewSub: '● action needed', mMilestones: 'milestones', mConversations: 'conversations',
    recentActivity: 'Recent activity', allProjects: 'All projects →', yourTodos: 'Your to-dos',
    feedEmpty: 'No activity yet', todosEmpty: "You're all caught up 🎉",
    // Projects
    filterAll: 'All', filterProgress: 'In progress', filterReview: 'Review', milestoneTimeline: 'Milestone timeline',
    approveRelease: 'Approve & Release', requestChanges: 'Request Changes',
    submitPayment: 'Submit & Request Payment', awaitingApproval: 'Awaiting approval',
    projEmptyEmp: 'No projects yet', projEmptyEmpSub: 'Post your first project and our AI will match engineers.',
    projEmptyEng: 'No active projects yet', projEmptyEngSub: 'Once you are assigned and a milestone is funded, projects appear here.',
    postProject: 'Post a project', openFinance: 'Open Finance →', ofMilestones: 'milestones',
    // Escrow
    heldInEscrow: 'Held in escrow', releasedToDate: 'Released to date', pendingAction: 'Pending your action',
    transactions: 'Transactions', stripeNote: 'Stripe · escrow-protected',
    thMilestone: 'Milestone', thProject: 'Project', thDate: 'Date', thAmount: 'Amount', thStatus: 'Status',
    escrowEmpty: 'No escrow transactions yet',
    // Messages
    messages: 'Messages', composerPh: 'Type a quick reply…', pickConv: 'Select a conversation',
    convEmpty: 'No conversations yet', convEmptySub: 'Apply to a project or message an engineer to start.',
    openChat: 'Open full chat →', send: 'Send', browse: 'Browse Projects',
    // Find
    findPh: 'Search by skill, platform, or region…', search: 'Search', verified: '✓ Verified', invite: 'Invite',
    noEngineers: 'No engineers to show yet.',
    // Profile
    screenerStatus: 'Certification status', passed: 'CERTIFIED', takeAssessment: 'Take assessment →',
    skillsPlatforms: 'Skills & platforms', addSkill: '+ Add skill',
    aiVerifiedEngineer: '🛡️ AI-Verified Engineer', aiScoreLabel: 'AI score', rating: 'Rating',
    myCerts: 'My certifications', examHistory: 'Assessment history',
    certEmpty: 'No certifications yet', certEmptySub: 'Pass an assessment to become assignable for on-site work.',
    profileEmpty: 'Complete your engineer profile', profileEmptySub: 'Publish your profile to start getting matched.',
    editProfile: 'Edit profile →', noSkills: 'No skills listed yet.',
    // Todos
    tFund: 'Fund milestone', tRelease: 'Review & release', tApplicants: 'new applicant(s)',
    tCheckin: 'Start work / submit', tCertify: 'Get certified — required before assignment',
    tRetake: 'Retake exam', tExamPending: 'Exam pending review', tCompleteProfile: 'Complete your profile',
    // Exam status labels
    stCertified: 'Certified', stAiPassed: 'Pending review', stSubmitted: 'Under review',
    stAiFailed: 'Not passed', stRejected: 'Rejected', stExpired: 'Expired', stInProgress: 'In progress',
    // Generic states
    loading: 'Loading…', errLoad: 'Failed to load. Please retry.',
    // 测试阶段演示数据徽标 + 演示模式深链拦截文案
    demoData: 'Demo data', demoReadonly: 'Demo data — not actionable',
    // Admin
    adminDataTitle: 'Platform data manager', adminDataDesc: 'Users, demands, certifications, exams, payouts and PMF signals.',
    adminOpen: 'Open Admin Data Manager →', adminPagesTitle: 'All pages', adminPagesDesc: 'Jump into any page as the super admin.',
  },
  zh: {
    workspace: '工作台', employer: '雇主', engineer: '工程师', admin: '管理员',
    navDashboard: '仪表盘', navProjects: '项目', navEscrow: '托管与支付',
    navMessages: '消息', navFind: '寻找工程师', navProfile: '档案与认证',
    navTraining: '学习与考核', navAdmin: '管理 · 全部数据',
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
    notifications: '通知', markAllRead: '全部已读', notifEmpty: '暂无通知',
    mActive: '活跃项目', mEscrow: '托管中', mReview: '待审核', mUnread: '未读消息',
    mReviewSub: '● 需要处理', mMilestones: '个里程碑', mConversations: '个会话',
    recentActivity: '近期动态', allProjects: '全部项目 →', yourTodos: '你的待办',
    feedEmpty: '暂无动态', todosEmpty: '待办已清空 🎉',
    filterAll: '全部', filterProgress: '进行中', filterReview: '待审', milestoneTimeline: '里程碑时间线',
    approveRelease: '通过并放款', requestChanges: '要求修改',
    submitPayment: '提交完工·申请付款', awaitingApproval: '等待雇主审批',
    projEmptyEmp: '还没有项目', projEmptyEmpSub: '发布第一个项目，AI 会为你匹配工程师。',
    projEmptyEng: '暂无进行中的项目', projEmptyEngSub: '被指派且里程碑托管后，项目会出现在这里。',
    postProject: '发布项目', openFinance: '前往财务 →', ofMilestones: '个里程碑',
    heldInEscrow: '托管中', releasedToDate: '累计已放款', pendingAction: '待你处理',
    transactions: '交易记录', stripeNote: 'Stripe · 托管保护',
    thMilestone: '里程碑', thProject: '项目', thDate: '日期', thAmount: '金额', thStatus: '状态',
    escrowEmpty: '暂无托管交易',
    messages: '消息', composerPh: '快速回复…', pickConv: '选择一个对话',
    convEmpty: '暂无对话', convEmptySub: '申请项目或联系工程师后开始对话。',
    openChat: '打开完整聊天 →', send: '发送', browse: '浏览项目',
    findPh: '按技能、平台或地区搜索…', search: '搜索', verified: '✓ 已认证', invite: '邀请',
    noEngineers: '暂无可展示的工程师。',
    screenerStatus: '认证状态', passed: '已认证', takeAssessment: '去考试 →',
    skillsPlatforms: '技能与平台', addSkill: '+ 添加技能',
    aiVerifiedEngineer: '🛡️ AI 认证工程师', aiScoreLabel: 'AI 分', rating: '评分',
    myCerts: '我的认证', examHistory: '考核记录',
    certEmpty: '还没有认证', certEmptySub: '通过考核后即可被指派现场工作。',
    profileEmpty: '完善你的工程师档案', profileEmptySub: '发布档案后开始被匹配。',
    editProfile: '编辑档案 →', noSkills: '还没有填写技能。',
    tFund: '为里程碑托管资金', tRelease: '审批并放款', tApplicants: '位新申请者',
    tCheckin: '开工 / 提交完工', tCertify: '去考证 —— 被指派前的必备',
    tRetake: '重考', tExamPending: '考核待复核', tCompleteProfile: '完善你的档案',
    stCertified: '已认证', stAiPassed: '待复核', stSubmitted: '人工复核中',
    stAiFailed: '未通过', stRejected: '已驳回', stExpired: '已过期', stInProgress: '进行中',
    loading: '加载中…', errLoad: '加载失败，请重试。',
    // 测试阶段演示数据徽标 + 演示模式深链拦截文案
    demoData: '测试数据', demoReadonly: '演示数据不可操作',
    adminDataTitle: '平台数据管理', adminDataDesc: '用户、需求、认证、考试、打款与 PMF 信号。',
    adminOpen: '打开管理后台 →', adminPagesTitle: '所有页面', adminPagesDesc: '以超级管理员身份进入任意页面。',
  },
};

// ── 保留：Find Engineers 的静默回退占位（/api/talent/list 失败时用，现状不动）──────
const ENGINEERS_PLACEHOLDER = [
  { id: null, initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Ho Chi Minh · 9 yrs', chips: ['TIA Portal', 'WinCC', 'Profinet'], rate: '$38/hr', star: '4.9', verified: true },
  { id: null, initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey · 12 yrs', chips: ['Fanuc', 'Studio 5000', 'Vision'], rate: '$52/hr', star: '5.0', verified: true },
  { id: null, initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune · 8 yrs', chips: ['Ignition', 'OPC UA', 'Python'], rate: '$34/hr', star: '4.8', verified: true },
];

// ── 测试阶段演示数据：仅当对应真实数据为空 / 请求失败时兜底展示，且必带「🧪 测试数据 · Demo」徽标。
//    字段结构已重塑为当前渲染所需（来源：git a9fa494 的占位常量）。真实数据永远优先。────────────
const DEMO_TS = Date.now();
const demoAgo = (min) => new Date(DEMO_TS - min * 60000).toISOString();

// 活动流 + 铃铛面板（对应 /api/notifications 的字段形状）
const DEMO_NOTIFICATIONS = [
  { id: 'demo-n1', type: 'engineer_assigned', title: 'M2 · SCADA integration — approved', body: 'Line-3 Retrofit · Priya K. · $8,000', created_at: demoAgo(35), read: false },
  { id: 'demo-n2', type: 'exam_result', title: 'M3 · FAT documentation — awaiting your review', body: 'Weld-cell #4 · Diego R. · $6,500', created_at: demoAgo(180), read: false },
  { id: 'demo-n3', type: 'new_application', title: 'M1 · PLC migration — funded to escrow', body: 'Packaging Line VN · Minh N. · $12,000', created_at: demoAgo(1440), read: true },
];

// 待办清单（对应 dashboard todos 的字段形状）
const DEMO_TODOS = [
  { icon: '📝', title: 'Review M3 deliverable', sub: 'Weld-cell #4 · due today', active: true },
  { icon: '💬', title: 'Reply to Minh N.', sub: '2 messages · auto-translated' },
  { icon: '💰', title: 'Fund M4 milestone', sub: 'Line-3 Retrofit · $5,000' },
];

// 项目 + 里程碑：归一化后与真实 projects 同结构（demandId/name/meta/budget/milestones[]/派生字段）。
// milestones 字段对齐 /api/finance/milestones：id/phase_name/status/amount/created_at。
// 一处定义、三屏共用：Dashboard 指标卡、Escrow 交易表、Projects 时间线都从这里派生。
const DEMO_PROJECTS = [
  {
    demandId: 'demo-p1', name: 'Line-3 SCADA Retrofit', meta: '🇮🇳 Priya K. · Ignition SCADA', budget: '$22,000',
    milestones: [
      { id: 'demo-p1-m1', phase_name: 'M1 · Requirements & tag database', status: 'released', amount: 8000, created_at: demoAgo(60 * 24 * 20) },
      { id: 'demo-p1-m2', phase_name: 'M2 · SCADA integration', status: 'released', amount: 8000, created_at: demoAgo(60 * 24 * 12) },
      { id: 'demo-p1-m3', phase_name: 'M3 · FAT documentation', status: 'completed', amount: 6000, created_at: demoAgo(60 * 24 * 3) },
    ],
  },
  {
    demandId: 'demo-p2', name: 'Weld-cell #4 Integration', meta: '🇲🇽 Diego R. · Fanuc Robotics', budget: '$18,500',
    milestones: [
      { id: 'demo-p2-m1', phase_name: 'M1 · Cell layout & safety', status: 'released', amount: 6000, created_at: demoAgo(60 * 24 * 14) },
      { id: 'demo-p2-m2', phase_name: 'M2 · Robot programming', status: 'funded', amount: 7500, created_at: demoAgo(60 * 24 * 5) },
      { id: 'demo-p2-m3', phase_name: 'M3 · Commissioning & FAT', status: 'locked', amount: 5000, created_at: demoAgo(60 * 24 * 2) },
    ],
  },
  {
    demandId: 'demo-p3', name: 'Packaging Line VN', meta: '🇻🇳 Minh N. · Siemens TIA', budget: '$31,000',
    milestones: [
      { id: 'demo-p3-m1', phase_name: 'M1 · PLC migration', status: 'funded', amount: 12000, created_at: demoAgo(60 * 24 * 4) },
      { id: 'demo-p3-m2', phase_name: 'M2 · HMI development', status: 'locked', amount: 9000, created_at: demoAgo(60 * 24 * 1) },
      { id: 'demo-p3-m3', phase_name: 'M3 · Line integration', status: 'locked', amount: 10000, created_at: demoAgo(60 * 12) },
    ],
  },
].map((p) => {
  // 与组件内真实 projects 的派生保持一致：msCount/doneCount/pct/needsReview
  const ms = p.milestones;
  const doneCount = ms.filter((m) => m.status === 'released').length;
  const needsReview = ms.some((m) => ['funded', 'completed'].includes(m.status));
  return { ...p, msCount: ms.length, doneCount, pct: ms.length ? Math.round((doneCount / ms.length) * 100) : 0, needsReview };
});

// 会话列表（对应 /api/messages/inbox 的字段形状）
const DEMO_CONVERSATIONS = [
  { demand_id: 'demo-c1', title: 'Packaging Line VN', region: '🇻🇳 Minh N.', last_message: 'Tôi đã hoàn thành phần migration…', last_message_time: demoAgo(2), unread_count: 2 },
  { demand_id: 'demo-c2', title: 'Weld-cell #4', region: '🇲🇽 Diego R.', last_message: 'FAT report attached, ready for review', last_message_time: demoAgo(60), unread_count: 0 },
  { demand_id: 'demo-c3', title: 'Line-3 Retrofit', region: '🇮🇳 Priya K.', last_message: 'Thanks, will start M4 next week', last_message_time: demoAgo(180), unread_count: 0 },
];

// 会话消息（mine=自己发的，避免依赖真实 user.email）
const DEMO_THREAD = [
  { id: 'demo-t1', mine: false, sender_name: 'Minh N. 🇻🇳', content: "I've completed the PLC migration and am now running the FAT test.", created_at: demoAgo(20) },
  { id: 'demo-t2', mine: true, sender_name: 'You', content: 'Great work! Please attach the FAT checklist when ready.', created_at: demoAgo(18) },
  { id: 'demo-t3', mine: false, sender_name: 'Minh N. 🇻🇳', content: "Sure, I'll send it over today.", created_at: demoAgo(17) },
];

// 认证 & 考核（对应 /api/training/my：certifications[] + attempts[]）
const DEMO_CERTIFICATIONS = [
  { track_name_en: 'PLC Programming (Siemens TIA)', track_name_zh: 'PLC 编程（西门子 TIA）', level: 2 },
  { track_name_en: 'SCADA / HMI (WinCC)', track_name_zh: 'SCADA / HMI（WinCC）', level: 2 },
  { track_name_en: 'Industrial Networking (Profinet)', track_name_zh: '工业网络（Profinet）', level: 1 },
];
const DEMO_ATTEMPTS = [
  { id: 'demo-a1', level: 2, status: 'certified', score: 92, cert_tracks: { name_en: 'PLC Programming (Siemens TIA)', name_zh: 'PLC 编程（西门子 TIA）' } },
  { id: 'demo-a2', level: 2, status: 'certified', score: 88, cert_tracks: { name_en: 'SCADA / HMI (WinCC)', name_zh: 'SCADA / HMI（WinCC）' } },
  { id: 'demo-a3', level: 1, status: 'submitted', score: 76, cert_tracks: { name_en: 'Industrial Networking (Profinet)', name_zh: '工业网络（Profinet）' } },
];
// 档案技能（对应 talentProfile.skills 逗号串拆出的 chip）
const DEMO_PROFILE_SKILLS = ['Siemens TIA Portal', 'WinCC', 'Profinet'];

// 超级管理员"所有页面"入口（每项均指向真实存在的路由）
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

// ── 纯工具函数 ────────────────────────────────────────────────────────────────
function initialsOf(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (email || '?')[0].toUpperCase();
}
function money(n) { return '$' + Number(n || 0).toLocaleString(); }
// 相对时间：紧凑单位（now/2m/3h/5d），跨语言通用；超过 7 天回落到本地短日期
function relTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd}d`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function shortDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
// 通知类型 → 活动流圆点颜色
function notifDot(type) {
  const map = {
    new_application: 'var(--primary)',
    engineer_assigned: 'var(--success)',
    certification: 'var(--success)',
    exam_result: 'var(--accent)',
    new_message: 'var(--primary)',
  };
  return map[type] || 'var(--text-muted)';
}
// 里程碑真实状态 → 时间线节点视图（released=完成绿 / funded|completed=进行中黄 / locked=未开始灰）
// 生命周期：locked（待托管）→ funded（已托管，工程师做工）→ completed（工程师提交，待雇主审批）→ released（已放款）
function msView(m) {
  const amt = money(m.amount);
  if (m.status === 'released') return { state: 'done', cls: 'good', amt: `${amt} released` };
  if (m.status === 'funded') return { state: 'await', cls: 'warn', amt: `${amt} funded` };
  if (m.status === 'completed') return { state: 'await', cls: 'warn', amt: `${amt} in review` };
  return { state: 'todo', cls: 'muted', amt, muted: true }; // locked / 其他
}
// 托管交易状态 → chip 样式类
function chipClass(status) {
  if (status === 'released') return styles.chipReleased;
  if (status === 'locked') return styles.chipLocked;
  return styles.chipFunded; // funded / completed
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
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('employer');
  const [screen, setScreen] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(0);
  const [engineers, setEngineers] = useState(null); // null → 用占位

  // ── 真实数据（null=加载中，[]/{}=已加载）──────────────────────────────────────
  const [notifications, setNotifications] = useState(null);   // 活动流（/api/notifications）；铃铛下拉已移至 ConsoleShell 自取
  const [threads, setThreads] = useState(null);               // 消息收件箱（/api/messages/inbox）
  const [ledger, setLedger] = useState(null);                 // 工程师项目来源（/api/finance/ledger）
  const [myDemands, setMyDemands] = useState(null);           // 雇主项目来源（/api/demand/my）
  const [analytics, setAnalytics] = useState(null);           // 雇主申请统计（/api/demand/analytics）
  const [milestonesByDemand, setMilestonesByDemand] = useState({}); // 里程碑明细（/api/finance/milestones）
  const [training, setTraining] = useState(null);             // 认证与考核（/api/training/my）
  const [talentProfile, setTalentProfile] = useState(null);   // 工程师档案（/api/talent/me），null 也可能是"未建档"
  const [talentLoaded, setTalentLoaded] = useState(false);    // 区分"加载中"与"已加载但无档案"
  const [errors, setErrors] = useState({});                   // 各资源错误标记

  // ── 消息线程（控制台内只读 + 快捷回复；深操作仍跳 /messages）──────────────────
  const [activeThread, setActiveThread] = useState(null);
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

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

  // Find Engineers 复用公开 /api/talent/list；失败静默回退占位（现状不动）
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

  // ── 主数据加载：随登录态与当前角色视图重新拉取 ────────────────────────────────
  // 通用（任意登录）：通知活动流 + 未读数 + 消息收件箱。
  // 雇主/管理员：demand/my（项目）+ analytics（申请数）→ 各项目里程碑。
  // 工程师：finance/ledger（参与方项目）+ training/my（认证）+ talent/me（档案）→ 各项目里程碑。
  useEffect(() => {
    if (!user) return;
    const h = { Authorization: `Bearer ${user.token}` };
    let alive = true;
    setErrors({});

    fetch('/api/notifications', { headers: h })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => { if (alive) setNotifications(j.data || []); })
      .catch(() => { if (alive) { setNotifications([]); setErrors(e => ({ ...e, notif: true })); } });

    fetch('/api/messages/inbox', { headers: h })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => { if (alive) setThreads(j.data || []); })
      .catch(() => { if (alive) { setThreads([]); setErrors(e => ({ ...e, inbox: true })); } });

    // 逐个 demand 拉里程碑明细（当事方接口，雇主/被指派工程师/admin 都放行）。
    // beta 规模项目数量少，并行拉取即可；覆盖项目详情时间线 + 托管交易 + 待办推导。
    async function loadMilestones(ids) {
      const uniq = [...new Set(ids.filter(Boolean))];
      if (!uniq.length) { if (alive) setMilestonesByDemand({}); return; }
      const entries = await Promise.all(uniq.map(async id => {
        try {
          const res = await fetch(`/api/finance/milestones?demand_id=${id}`, { headers: h });
          const data = await res.json();
          return [id, res.ok ? (data.data || []) : []];
        } catch { return [id, []]; }
      }));
      if (alive) setMilestonesByDemand(Object.fromEntries(entries));
    }

    if (role === 'employer' || role === 'admin') {
      fetch('/api/demand/my', { headers: h })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => { if (!alive) return; const rows = j.data || []; setMyDemands(rows); loadMilestones(rows.map(dm => dm.id)); })
        .catch(() => { if (alive) { setMyDemands([]); setErrors(e => ({ ...e, demands: true })); } });
      fetch('/api/demand/analytics', { headers: h })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => { if (alive) setAnalytics(j); })
        .catch(() => {});
    }

    if (role === 'engineer') {
      fetch('/api/finance/ledger', { headers: h })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => { if (!alive) return; const rows = j.data || []; setLedger(rows); loadMilestones(rows.map(l => l.demand_id)); })
        .catch(() => { if (alive) { setLedger([]); setErrors(e => ({ ...e, ledger: true })); } });
      fetch('/api/training/my', { headers: h })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => { if (alive) setTraining({ certifications: j.certifications || [], attempts: j.attempts || [] }); })
        .catch(() => { if (alive) { setTraining({ certifications: [], attempts: [] }); setErrors(e => ({ ...e, training: true })); } });
      fetch('/api/talent/me', { headers: h })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => { if (alive) { setTalentProfile(j.data || null); setTalentLoaded(true); } })
        .catch(() => { if (alive) { setTalentProfile(null); setTalentLoaded(true); setErrors(e => ({ ...e, talent: true })); } });
    }

    return () => { alive = false; };
  }, [user, role]);

  // 进入消息屏时自动选中第一个会话
  useEffect(() => {
    if (threads && threads.length && activeThread == null) selectThread(threads[0].demand_id);
  }, [threads]);

  async function loadThread(demandId) {
    if (!user) return;
    setThread(null);
    setErrors(e => ({ ...e, thread: false }));
    try {
      const res = await fetch(`/api/messages/thread/${demandId}?markRead=1`, { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      if (res.ok) setThread(data);
      else { setThread({ data: [] }); setErrors(e => ({ ...e, thread: true })); }
    } catch { setThread({ data: [] }); setErrors(e => ({ ...e, thread: true })); }
  }
  function selectThread(id) {
    setActiveThread(id); setReplyText('');
    // 演示会话没有真实线程可拉：直接注入演示消息，不打 API
    if (String(id).startsWith('demo-')) { setThread({ data: DEMO_THREAD }); return; }
    loadThread(id);
  }

  // 快捷回复：真实发送到 /api/messages，成功后重载线程（深度操作仍跳 /messages）
  async function sendReply() {
    const content = replyText.trim();
    if (!content || activeThread == null || sending) return;
    if (String(activeThread).startsWith('demo-')) return; // 演示会话不可真实发送
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ demand_id: activeThread, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setReplyText(''); loadThread(activeThread); }
      else toast.error(data.error || 'Failed to send.');
    } catch { toast.error('Network error.'); }
    setSending(false);
  }

  const d = { ...DICT.en, ...(DICT[lang] || {}) };
  if (!user) return null;

  const isSuper = user.role === 'admin';           // 超级账户：可管理所有页面和数据、可切换视角
  const isEmployer = role === 'employer';
  const isEngineer = role === 'engineer';
  const isAdminView = role === 'admin';

  // 角色专属屏幕越界时回退到 dashboard
  let effScreen = screen;
  if (!isEmployer && effScreen === 'find') effScreen = 'dashboard';
  if (!isEngineer && effScreen === 'profile') effScreen = 'dashboard';
  if (effScreen === 'admin' && !isSuper) effScreen = 'dashboard';

  // 七屏切换（作为 onNavigate 传给 ConsoleShell；外壳负责关闭移动端抽屉）
  function go(s) { setScreen(s); }
  // 超级管理员切换视角（作为 onRoleChange 传给 ConsoleShell）
  function switchRole(r) {
    setRole(r);
    if (r !== 'employer' && screen === 'find') setScreen('dashboard');
    if (r !== 'engineer' && screen === 'profile') setScreen('dashboard');
    if (r !== 'admin' && screen === 'admin') setScreen('dashboard');
  }

  // ── 归一化项目模型（两种来源，同一渲染结构）──────────────────────────────────
  // 雇主/管理员：/api/demand/my（含标题/预算/状态）；工程师：/api/finance/ledger（参与方账本反推）。
  // 里程碑一律取 milestonesByDemand（真实明细，含日期/金额/状态）。
  const titleByDemand = {};
  (threads || []).forEach(t => { if (t.title) titleByDemand[t.demand_id] = t.title; });

  const projects = (isEngineer
    ? (ledger || []).map(l => ({
        demandId: l.demand_id,
        name: titleByDemand[l.demand_id] || `Project #${l.demand_id}`,
        meta: l.employer_email || '',
        budget: money(l.total_amount),
      }))
    : (myDemands || []).map(dm => ({
        demandId: dm.id,
        name: dm.title,
        meta: [dm.region, dm.budget].filter(Boolean).join(' · '),
        budget: dm.budget || '',
      }))
  ).map(p => {
    const ms = milestonesByDemand[p.demandId] || [];
    const doneCount = ms.filter(m => m.status === 'released').length;
    const needsReview = ms.some(m => ['funded', 'completed'].includes(m.status));
    return {
      ...p, milestones: ms, msCount: ms.length, doneCount,
      pct: ms.length ? Math.round((doneCount / ms.length) * 100) : 0,
      needsReview,
    };
  });

  const sourceLoading = isEngineer ? ledger === null : myDemands === null;
  const sourceError = isEngineer ? errors.ledger : errors.demands;
  const milestonesPending = projects.length > 0 && Object.keys(milestonesByDemand).length === 0;
  // 真实项目为空或请求失败（已加载完但零条）→ 用演示项目兜底。demo 会一并驱动 Projects 时间线、
  // Escrow 交易表与 Dashboard 指标卡，保证三屏数据一致，且各处顶部都会打「🧪」徽标。
  const projectsDemo = !sourceLoading && projects.length === 0;
  const projList = projectsDemo ? DEMO_PROJECTS : projects;
  const projIndex = Math.min(selectedProject, Math.max(0, projList.length - 1));
  const proj = projList[projIndex] || null;

  // ── 派生指标（真实里程碑聚合；projList 已含演示兜底）──────────────────────────
  const allMs = projList.flatMap(p => p.milestones);
  // 托管中 = 已托管未放款（funded 工程师做工 + completed 待雇主审批），资金都还锁在托管里
  const escrowedMs = allMs.filter(m => ['funded', 'completed'].includes(m.status));
  const heldSum = escrowedMs.reduce((s, m) => s + Number(m.amount || 0), 0);
  const escrowedCount = escrowedMs.length;
  const releasedSum = allMs.filter(m => m.status === 'released').reduce((s, m) => s + Number(m.amount || 0), 0);
  const releasedCount = allMs.filter(m => m.status === 'released').length;
  // 待处理：雇主=待审批放款(completed)；工程师=待提交完工(funded)
  const reviewCount = isEmployer
    ? allMs.filter(m => m.status === 'completed').length
    : allMs.filter(m => m.status === 'funded').length;
  // 会话：真实收件箱为空或失败 → 演示会话兜底（同时驱动未读数与会话数）
  const convsDemo = threads !== null && (errors.inbox || threads.length === 0);
  const convsToShow = convsDemo ? DEMO_CONVERSATIONS : (threads || []);
  const demoConv = convsToShow.find(c => c.demand_id === activeThread) || convsToShow[0] || null;
  const unreadTotal = convsToShow.reduce((s, t) => s + (t.unread_count || 0), 0);
  // 活动流：真实通知为空或失败 → 演示通知兜底
  const feedIsDemo = notifications !== null && (errors.notif || notifications.length === 0);
  const feedToShow = feedIsDemo ? DEMO_NOTIFICATIONS : (notifications || []);

  // ── 待办推导（雇主/工程师视角不同；逻辑就近注释）──────────────────────────────
  const todos = [];
  if (isEmployer) {
    // 雇主：locked=待托管资金；completed=工程师已提交、待审批放款
    projects.forEach(p => p.milestones.forEach(m => {
      if (m.status === 'locked') todos.push({ icon: '💰', title: `${d.tFund}: ${m.phase_name}`, sub: p.name });
      else if (m.status === 'completed') todos.push({ icon: '📝', title: `${d.tRelease}: ${m.phase_name}`, sub: p.name, active: true });
    }));
    // 新申请：analytics 里 pending_count>0 的项目
    (analytics?.data || []).forEach(row => {
      if ((row.pending_count || 0) > 0) todos.push({ icon: '👤', title: `${row.pending_count} ${d.tApplicants}`, sub: row.title });
    });
  } else if (isEngineer) {
    // 工程师：funded=已托管、待开工/提交完工申请付款
    projects.forEach(p => p.milestones.forEach(m => {
      if (m.status === 'funded') todos.push({ icon: '📍', title: `${d.tCheckin}: ${m.phase_name}`, sub: p.name, active: true });
    }));
    // 认证：一个证都没有 → 提示去考证（被指派前的硬门槛）
    if (training && (training.certifications || []).length === 0) todos.push({ icon: '🎓', title: d.tCertify, sub: '' });
    // 考核记录：失败可重考；已交/AI通过等待复核
    (training?.attempts || []).forEach(a => {
      const tname = lang === 'zh' ? a.cert_tracks?.name_zh : a.cert_tracks?.name_en;
      if (['ai_failed', 'rejected'].includes(a.status)) todos.push({ icon: '🎓', title: `${d.tRetake}: ${tname || ''}`, sub: '' });
      else if (['submitted', 'ai_passed'].includes(a.status)) todos.push({ icon: '⏳', title: `${d.tExamPending}: ${tname || ''}`, sub: '' });
    });
    // 未建档 → 提示完善档案
    if (talentLoaded && !talentProfile) todos.push({ icon: '📇', title: d.tCompleteProfile, sub: '' });
  }
  const todosToShow = todos.slice(0, 8);
  // 待办：真实项目为空（同 projectsDemo 判据）→ 演示待办兜底
  const todosDemo = projectsDemo;

  // 顶栏标题/副标题：按当前屏派生，传给 ConsoleShell（侧栏导航已移入外壳）
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
  const userInitials = initialsOf(user.name, user.email);
  const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  // Find Engineers：真实 talent/list 未填充 → 占位工程师兜底（回退逻辑保留，回退时打徽标）
  const findIsDemo = engineers === null;
  const engineersToShow = engineers || ENGINEERS_PLACEHOLDER;
  const activeConv = convsToShow.find(c => c.demand_id === activeThread) || null;

  // 考核状态标签本地化
  const stLabel = { certified: d.stCertified, ai_passed: d.stAiPassed, submitted: d.stSubmitted, ai_failed: d.stAiFailed, rejected: d.stRejected, expired: d.stExpired, in_progress: d.stInProgress };

  // 认证 & 技能：真实为空或失败 → 演示兜底
  const trainingHasReal = training && ((training.certifications || []).length > 0 || (training.attempts || []).length > 0);
  const certIsDemo = training !== null && !trainingHasReal;
  const certCerts = certIsDemo ? DEMO_CERTIFICATIONS : (training?.certifications || []);
  const certAttempts = certIsDemo ? DEMO_ATTEMPTS : (training?.attempts || []);
  const skillsList = (talentProfile?.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const skillsIsDemo = talentLoaded && skillsList.length === 0;   // 未建档或无技能 → 演示技能
  const skillsToShow = skillsIsDemo ? DEMO_PROFILE_SKILLS : skillsList;

  // 演示徽标：小圆角 chip，样式见 .demoBadge（同一元素在多处复用，非列表无需 key）
  const demoBadge = <span className={styles.demoBadge}>🧪 {d.demoData} · Demo</span>;

  // 认证卡正文（真实/演示共用同一渲染，避免重复 JSX）
  function certBody(certs, attempts) {
    return (
      <>
        {certs.length > 0 && (
          <div style={{ marginBottom: attempts.length ? 18 : 0 }}>
            <div className={styles.tlLabel}>{d.myCerts}</div>
            {certs.map((c, i) => (
              <div key={i} className={styles.certRow}>
                <span className={styles.certTrack}>{lang === 'zh' ? c.track_name_zh : c.track_name_en}</span>
                <span className={styles.certLevel}>L{c.level}</span>
              </div>
            ))}
          </div>
        )}
        {attempts.length > 0 && (
          <div>
            <div className={styles.tlLabel}>{d.examHistory}</div>
            <div className={styles.scoreList}>
              {attempts.map(a => {
                const good = (a.score ?? 0) >= 70;
                return (
                  <div key={a.id}>
                    <div className={styles.scoreTop}>
                      <span>{(lang === 'zh' ? a.cert_tracks?.name_zh : a.cert_tracks?.name_en) || `L${a.level}`} · {stLabel[a.status] || a.status}</span>
                      <span className={`${styles.scoreVal} ${a.score != null ? (good ? styles.scoreValGood : styles.scoreValMid) : ''}`}>{a.score != null ? `${a.score} / 100` : '—'}</span>
                    </div>
                    <div className={styles.scoreBar}>
                      {a.score != null && <div className={`${styles.scoreFill} ${good ? styles.scoreFillGood : styles.scoreFillMid}`} style={{ width: `${a.score}%` }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Head><title>Console | Talengineer</title></Head>

      {/* 统一外壳：左侧栏 + 顶栏 + 铃铛均由 ConsoleShell 提供；本页只负责七屏内容。
          role/onRoleChange 传入让超管切换视角，onNavigate 让七屏在页内切换（不跳转）。 */}
      <ConsoleShell
        user={user}
        active={effScreen}
        title={pageTitle}
        subtitle={pageSub}
        role={role}
        onRoleChange={switchRole}
        onNavigate={go}
        unreadTotal={unreadTotal}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      >
            {/* ===== DASHBOARD ===== */}
            {effScreen === 'dashboard' && (
              <div className={styles.stack}>
                {/* 指标卡演示值：真实项目为空时兜底，徽标置于指标卡组上方 */}
                {projectsDemo && <div>{demoBadge}</div>}
                <div className={styles.metricGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mActive}</div>
                    <div className={styles.metricNum}>{sourceLoading ? '…' : projList.length}</div>
                    <div className={styles.metricSub}>{allMs.length} {d.mMilestones}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mEscrow}</div>
                    <div className={`${styles.metricNum} ${styles.metricNumPrimary}`}>{sourceLoading ? '…' : money(heldSum)}</div>
                    <div className={styles.metricSub}>{escrowedCount} {d.mMilestones}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mReview}</div>
                    <div className={styles.metricNum}>{sourceLoading ? '…' : reviewCount}</div>
                    <div className={`${styles.metricSub} ${reviewCount > 0 ? styles.metricSubWarn : ''}`}>{reviewCount > 0 ? d.mReviewSub : ''}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.mUnread}</div>
                    <div className={styles.metricNum}>{threads === null ? '…' : unreadTotal}</div>
                    <div className={styles.metricSub}>{convsToShow.length} {d.mConversations}</div>
                  </div>
                </div>

                <div className={styles.dash2col}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b>{d.recentActivity}</b>{feedIsDemo && demoBadge}</span>
                      <button className={styles.linkBtn} onClick={() => go('projects')}>{d.allProjects}</button>
                    </div>
                    <div className={styles.feed}>
                      {notifications === null ? (
                        <div className={styles.stateBox}>{d.loading}</div>
                      ) : feedToShow.map(n => (
                        <div key={n.id} className={styles.feedRow}>
                          <span className={styles.dot} style={{ background: notifDot(n.type) }} />
                          <div className={styles.feedMain}>
                            <div className={styles.feedTitle}>{n.title}</div>
                            <div className={styles.feedSub}>{n.body}</div>
                          </div>
                          <span className={styles.mono} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{relTime(n.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardHead}><span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b>{d.yourTodos}</b>{todosDemo && demoBadge}</span></div>
                    <div className={styles.todoList}>
                      {sourceLoading ? (
                        <div className={styles.stateBox}>{d.loading}</div>
                      ) : todosDemo ? (
                        DEMO_TODOS.map((t, i) => (
                          <div key={i} className={`${styles.todo} ${t.active ? styles.todoActive : ''}`}>
                            <span style={{ fontSize: 15 }}>{t.icon}</span>
                            <div>
                              <div className={styles.todoTitle}>{t.title}</div>
                              {t.sub && <div className={styles.todoSub}>{t.sub}</div>}
                            </div>
                          </div>
                        ))
                      ) : todosToShow.length === 0 ? (
                        <div className={styles.stateBox}><div className={styles.stateIcon}>✅</div><b>{d.todosEmpty}</b></div>
                      ) : todosToShow.map((t, i) => (
                        <div key={i} className={`${styles.todo} ${t.active ? styles.todoActive : ''}`}>
                          <span style={{ fontSize: 15 }}>{t.icon}</span>
                          <div>
                            <div className={styles.todoTitle}>{t.title}</div>
                            {t.sub && <div className={styles.todoSub}>{t.sub}</div>}
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
              sourceLoading ? (
                <div className={styles.stateBox}>{d.loading}</div>
              ) : (
                <div className={styles.stack}>
                  {/* 真实项目为空或请求失败 → 演示项目兜底，徽标置顶 */}
                  {projectsDemo && <div>{demoBadge}</div>}
                  <div className={styles.projGrid}>
                  <div className={styles.projList}>
                    {projList.map((p, i) => (
                      <button key={p.demandId} className={`${styles.projCard} ${i === projIndex ? styles.projCardActive : ''}`} onClick={() => setSelectedProject(i)}>
                        <div className={styles.projTop}>
                          <b className={styles.projName}>{p.name}</b>
                          <span className={`${styles.badge} ${p.needsReview ? styles.badgeReview : styles.badgeActive}`}>{p.needsReview ? 'REVIEW' : 'ACTIVE'}</span>
                        </div>
                        <div className={styles.projMeta}>{p.meta}</div>
                        <div className={styles.progress}><div className={styles.progressFill} style={{ width: `${p.pct}%` }} /></div>
                        <div className={styles.projFoot}><span>{p.doneCount} / {p.msCount} {d.ofMilestones}</span><span className={styles.mono} style={{ color: 'var(--text)' }}>{p.budget}</span></div>
                      </button>
                    ))}
                  </div>

                  {proj && (
                    <div className={styles.detailCard}>
                      <div className={styles.detailHead}>
                        <div className={styles.detailTitleRow}>
                          <b className={styles.detailTitle}>{proj.name}</b>
                          <span className={`${styles.badge} ${proj.needsReview ? styles.badgeReview : styles.badgeActive}`}>{proj.needsReview ? 'REVIEW NEEDED' : 'ACTIVE'}</span>
                        </div>
                        <div className={styles.detailMeta}>
                          {proj.meta && <span>{proj.meta}</span>}
                        </div>
                      </div>
                      <div className={styles.timeline}>
                        <div className={styles.tlLabel}>{d.milestoneTimeline}</div>
                        {proj.milestones.length === 0 ? (
                          <div className={styles.stateBox}>{milestonesPending ? d.loading : d.escrowEmpty}</div>
                        ) : (
                          <div style={{ position: 'relative', paddingLeft: 26 }}>
                            <div className={styles.timeLine} />
                            {proj.milestones.map((m, i) => {
                              const v = msView(m);
                              return (
                                <div key={m.id ?? i} className={styles.node}>
                                  <span className={`${styles.nodeDot} ${v.state === 'done' ? styles.nodeDone : v.state === 'await' ? styles.nodeAwait : styles.nodeTodo}`}>
                                    {v.state === 'done' ? '✓' : v.state === 'await' ? '●' : ''}
                                  </span>
                                  <div className={styles.msRow}>
                                    <div>
                                      <b className={`${styles.msTitle} ${v.muted ? styles.msTitleMuted : ''}`}>{m.phase_name}</b>
                                      <div className={styles.msSub}>{(m.status || 'locked').toUpperCase()}</div>
                                    </div>
                                    <span className={styles.msAmt} style={{ color: v.cls === 'good' ? 'var(--success)' : v.cls === 'warn' ? 'var(--accent)' : 'var(--text-muted)' }}>{v.amt}</span>
                                  </div>
                                  {/* 里程碑动作分角色（基于真实 status）：
                                      雇主 · completed（工程师已提交）→ 通过并放款 / 要求修改（真实放款在 /finance）
                                      工程师 · funded（已托管）→ 提交完工·申请付款（真实提交在工单页 /workorder/{id}）
                                      工程师 · completed → 只读"等待雇主审批"徽标 */}
                                  {isEmployer && m.status === 'completed' && (
                                    <div className={styles.msActions}>
                                      <button className={styles.btnApprove} onClick={() => router.push('/finance')}>{d.approveRelease}</button>
                                      <button className={styles.btnChanges} onClick={() => router.push('/finance')}>{d.requestChanges}</button>
                                    </div>
                                  )}
                                  {isEngineer && m.status === 'funded' && (
                                    <div className={styles.msActions}>
                                      {/* 演示项目的里程碑没有真实工单页，禁用防误跳 */}
                                      <button className={styles.btnApprove} disabled={projectsDemo} title={projectsDemo ? d.demoReadonly : undefined} onClick={() => router.push(`/workorder/${m.id}`)}>{d.submitPayment}</button>
                                    </div>
                                  )}
                                  {isEngineer && m.status === 'completed' && (
                                    <div className={styles.msActions}>
                                      <span className={styles.awaitingBadge}>⏳ {d.awaitingApproval}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )
            )}

            {/* ===== ESCROW ===== */}
            {effScreen === 'escrow' && (
              <div className={styles.stack}>
                {/* 真实项目为空/失败 → 金额与交易表均来自演示项目，徽标置顶 */}
                {projectsDemo && <div>{demoBadge}</div>}
                <div className={styles.escrowGrid}>
                  <div className={styles.escrowHero}>
                    <div className={styles.escrowHeroLabel}>{d.heldInEscrow}</div>
                    <div className={styles.escrowHeroNum}>{sourceLoading ? '…' : money(heldSum)}</div>
                    <div className={styles.escrowHeroSub}>{escrowedCount} {d.mMilestones}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.releasedToDate}</div>
                    <div className={styles.metricNum}>{sourceLoading ? '…' : money(releasedSum)}</div>
                    <div className={`${styles.metricSub} ${styles.metricSubGood}`}>{releasedCount} {d.mMilestones}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.pendingAction}</div>
                    <div className={styles.metricNum} style={{ color: 'var(--accent)' }}>{sourceLoading ? '…' : reviewCount}</div>
                    <div className={styles.metricSub}>{reviewCount > 0 ? d.mReviewSub : ''}</div>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHead}><b>{d.transactions}</b><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.stripeNote}</span></div>
                  {sourceLoading || milestonesPending ? (
                    <div className={styles.stateBox}>{d.loading}</div>
                  ) : allMs.length === 0 ? (
                    <div className={styles.stateBox}><div className={styles.stateIcon}>💰</div><b>{d.escrowEmpty}</b></div>
                  ) : (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>{d.thMilestone}</th><th>{d.thProject}</th><th>{d.thDate}</th>
                            <th className={styles.tRight}>{d.thAmount}</th><th className={styles.tRight}>{d.thStatus}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projList.flatMap(p => p.milestones.map(m => ({ ...m, projName: p.name })))
                            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                            .map((t, i) => (
                              <tr key={t.id ?? i}>
                                <td>{t.phase_name}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.projName}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{shortDate(t.created_at)}</td>
                                <td className={`${styles.tRight} ${styles.mono}`} style={{ fontSize: 13 }}>{money(t.amount)}</td>
                                <td className={styles.tRight}>
                                  <span className={`${styles.chip} ${chipClass(t.status)}`}>{(t.status || 'locked').toUpperCase()}</span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== MESSAGES ===== */}
            {effScreen === 'messages' && (
              <div className={styles.msgWrap}>
                <div className={styles.convList}>
                  <div className={styles.convHead}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b>{d.messages}</b>{convsDemo && demoBadge}</span></div>
                  <div className={styles.convScroll}>
                    {threads === null ? (
                      <div className={styles.stateBox}>{d.loading}</div>
                    ) : convsToShow.map(c => (
                      <button key={c.demand_id} className={`${styles.conv} ${c.demand_id === activeThread ? styles.convActive : ''}`} onClick={() => selectThread(c.demand_id)}>
                        <span className={`${styles.convAvatar} ${c.demand_id === activeThread ? styles.convAvatarActive : ''}`}>{initialsOf(c.title || `#${c.demand_id}`)}</span>
                        <div className={styles.convBody}>
                          <div className={styles.convTop}><b className={styles.convName}>{c.title || `Project #${c.demand_id}`}</b><span className={styles.convTime}>{relTime(c.last_message_time)}</span></div>
                          <div className={styles.convPreview}>{c.last_message || d.pickConv}</div>
                        </div>
                        {c.unread_count > 0 && <span className={styles.convDot} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.thread}>
                  {activeThread == null ? (
                    <div className={styles.threadEmpty}>{d.pickConv}</div>
                  ) : (
                    <>
                      <div className={styles.threadHead}>
                        <span className={styles.threadAvatar}>{initialsOf(activeConv?.title || `#${activeThread}`)}</span>
                        <div className={styles.grow}>
                          <div className={styles.threadName}>{activeConv?.title || `Project #${activeThread}`}</div>
                          <div className={styles.threadSub}>{activeConv?.region || ''}</div>
                        </div>
                        {String(activeThread).startsWith('demo-')
                          ? <span className={styles.aiChip} title={d.demoReadonly} style={{ opacity: .55, cursor: 'not-allowed' }}>{d.openChat}</span>
                          : <Link href={`/messages/${activeThread}`} className={styles.aiChip}>{d.openChat}</Link>}
                      </div>
                      <div className={styles.bubbles}>
                        {thread === null ? (
                          <div className={styles.stateBox}>{d.loading}</div>
                        ) : errors.thread ? (
                          <div className={styles.stateBox}>{d.errLoad}</div>
                        ) : (thread.data || []).length === 0 ? (
                          <div className={styles.stateBox}>{d.pickConv}</div>
                        ) : (thread.data || []).map(msg => {
                          // 演示消息自带 mine 标记（不依赖真实邮箱），真实消息按发件人邮箱判定
                          const mine = msg.mine !== undefined ? msg.mine : msg.sender_email === user.email;
                          return (
                            <div key={msg.id} className={mine ? styles.bubbleMine : styles.bubbleTheir}>
                              <div className={mine ? styles.bubMine : styles.bubTheir}>
                                <div>{msg.content}</div>
                              </div>
                              <div className={`${styles.msgTime} ${mine ? styles.msgTimeMine : ''}`}>{msg.sender_name} · {relTime(msg.created_at)}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.composer}>
                        <input
                          placeholder={d.composerPh}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendReply(); }}
                        />
                        <button className={styles.sendBtn} onClick={sendReply} disabled={sending} aria-label={d.send}>➤</button>
                      </div>
                    </>
                  )}
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
                {/* 真实工程师数据未返回时展示占位样例，打演示徽标 */}
                {findIsDemo && <div>{demoBadge}</div>}
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
                  <div className={styles.profLoc}>{talentProfile?.region || '—'}</div>
                  {(talentProfile?.verified_score || 0) >= 60 && <span className={styles.verBadge}>{d.aiVerifiedEngineer}</span>}
                  <div className={styles.profStats}>
                    <div><div className={styles.profStatNum}>{talentProfile?.verified_score ?? '—'}</div><div className={styles.profStatLbl}>{d.aiScoreLabel}</div></div>
                    <div><div className={`${styles.profStatNum} ${styles.profStatNumAccent}`}>{talentProfile?.avg_rating ? Number(talentProfile.avg_rating).toFixed(1) : '—'}</div><div className={styles.profStatLbl}>{d.rating}</div></div>
                    <div><div className={`${styles.profStatNum} ${styles.profStatNumPrimary}`}>{talentProfile?.rate || '—'}</div><div className={styles.profStatLbl}>/hr</div></div>
                  </div>
                </div>
                <div className={styles.certStack}>
                  <div className={styles.certCard}>
                    <div className={styles.certHead}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b>{d.screenerStatus}</b>{certIsDemo && demoBadge}</span>
                      {certCerts.length > 0 && !certIsDemo && <span className={`${styles.badge} ${styles.badgePassed}`}>{d.passed}</span>}
                    </div>
                    {training === null ? (
                      <div className={styles.stateBox}>{d.loading}</div>
                    ) : (
                      <>
                        {/* 真实认证/考核为空 → certCerts/certAttempts 已是演示数据（certIsDemo 打徽标）；
                            演示态仍保留"去考核"入口，引导真实动作 */}
                        {certBody(certCerts, certAttempts)}
                        {certIsDemo && (
                          <div style={{ marginTop: 14 }}>
                            <Link href="/training" className={styles.stateCta}>{d.takeAssessment}</Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className={styles.certCard}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b style={{ fontSize: 15, color: 'var(--text)' }}>{d.skillsPlatforms}</b>{skillsIsDemo && demoBadge}</span>
                    {/* 无档案/无技能 → skillsToShow 已是演示技能（skillsIsDemo 打徽标），"添加技能"入口保留引导建档 */}
                    <div className={styles.skillWrap}>
                      {skillsToShow.map((s, i) => <span key={i} className={styles.skillChip}>{s}</span>)}
                      <Link href="/onboarding" className={`${styles.skillChip} ${styles.addSkill}`}>{d.addSkill}</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ADMIN · ALL DATA (super account only) — 页面入口 grid，保持现状 ===== */}
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
                    <div className={styles.metricNum}>{sourceLoading ? '…' : projects.length}</div>
                    <div className={styles.metricSub}>{d.recentActivity}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>{d.heldInEscrow}</div>
                    <div className={`${styles.metricNum} ${styles.metricNumPrimary}`}>{sourceLoading ? '…' : money(heldSum)}</div>
                    <div className={styles.metricSub}>{escrowedCount} {d.mMilestones}</div>
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
      </ConsoleShell>
    </>
  );
}
