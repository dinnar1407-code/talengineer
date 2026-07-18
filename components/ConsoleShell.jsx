import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import styles from './ConsoleShell.module.css';

// ── ConsoleShell：console / finance / talent 三页共用的统一外壳 ────────────────
// 提供左侧栏（logo、角色感知菜单、角色切换/静态标签、用户脚注、退出）+ 顶栏
// （汉堡、标题、搜索、主题/语言切换、通知铃铛、主 CTA）。业务内容通过 children 注入。
//
// props 契约（其他任务按此接入，勿改）：
//   user      {email,name,role,token} 或 null（null 时不渲染外壳，由页面自行处理未登录）
//   active    高亮菜单 key：dashboard|projects|escrow|messages|find|profile|learning|finance|admin
//   title     顶栏标题
//   lang/setLang/theme/setTheme  语言与主题受控值（外壳只做 zh/en 快速切换与深浅切换）
// 可选扩展（console 专用，finance/talent 不传即回退默认行为）：
//   subtitle    顶栏副标题
//   role        当前生效角色（超级管理员切换视角用）；缺省回退 user.role
//   onRoleChange(r)  超级管理员切换视角回调；提供时才渲染角色切换 Tab
//   onNavigate(key)  console 七屏菜单点击回调（页内 setScreen）；缺省则跳 /console?screen=key
//   unreadTotal 消息菜单未读徽标数

// 页内小字典：先做 en/zh，其余语言回退英文（9 语后续由 i18n 任务补齐）
const DICT = {
  en: {
    workspace: 'Workspace', employer: 'Employer', engineer: 'Engineer', admin: 'Admin',
    navDashboard: 'Dashboard', navProjects: 'Projects', navEscrow: 'Escrow & Payments',
    navMessages: 'Messages', navFinance: 'Finance', navFind: 'Find Engineers',
    navProfile: 'Profile & Certification', navLearning: 'Training & Cert', navAdmin: 'Admin · All Data',
    searchPh: 'Search projects, engineers…',
    ctaPost: '＋ Post a Project', ctaBrowse: '＋ Browse Projects', ctaManage: '＋ Manage Platform',
    roleEmployerLabel: 'Employer · OEM', roleEngineerLabel: 'Engineer · Verified', roleAdminLabel: 'Super Admin · Platform',
    notifications: 'Notifications', markAllRead: 'Mark all read', notifEmpty: 'No notifications', loading: 'Loading…',
    settings: 'Settings', logout: 'Sign out',
  },
  zh: {
    workspace: '工作台', employer: '雇主', engineer: '工程师', admin: '管理员',
    navDashboard: '仪表盘', navProjects: '项目', navEscrow: '托管与支付',
    navMessages: '消息', navFinance: '财务', navFind: '寻找工程师',
    navProfile: '档案与认证', navLearning: '学习与考核', navAdmin: '管理 · 全部数据',
    searchPh: '搜索项目、工程师…',
    ctaPost: '＋ 发布项目', ctaBrowse: '＋ 浏览项目', ctaManage: '＋ 平台管理',
    roleEmployerLabel: '雇主 · 设备厂商', roleEngineerLabel: '工程师 · 已认证', roleAdminLabel: '超级管理员 · 平台',
    notifications: '通知', markAllRead: '全部已读', notifEmpty: '暂无通知', loading: '加载中…',
    settings: '设置', logout: '退出登录',
  },
};

// 姓名/邮箱取首字母做头像
function initialsOf(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (email || '?')[0].toUpperCase();
}
// 相对时间：now/2m/3h/5d，超 7 天回落本地短日期（与 console 保持一致）
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

export default function ConsoleShell({
  user, active, title, subtitle,
  role, onRoleChange, onNavigate, unreadTotal = 0,
  lang, setLang, theme, setTheme, children,
}) {
  const router = useRouter();
  const [sbOpen, setSbOpen] = useState(false);        // 移动端侧栏抽屉开合
  const [notifications, setNotifications] = useState(null); // 铃铛数据（null=加载中）
  const [notifUnread, setNotifUnread] = useState(0);        // 铃铛未读数
  const [notifOpen, setNotifOpen] = useState(false);        // 铃铛下拉开合

  // 铃铛数据自取：用 user.token 拉通知列表 + 未读数（从 console 搬入，外壳自管）
  useEffect(() => {
    if (!user?.token) return;
    const h = { Authorization: `Bearer ${user.token}` };
    let alive = true;
    fetch('/api/notifications', { headers: h })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => { if (alive) setNotifications(j.data || []); })
      .catch(() => { if (alive) setNotifications([]); });
    fetch('/api/notifications/unread-count', { headers: h })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => { if (alive) setNotifUnread(j.count || 0); })
      .catch(() => {});
    return () => { alive = false; };
  }, [user?.token]);

  const d = { ...DICT.en, ...(DICT[lang] || {}) };

  // 角色推导：优先用受控 role（console 超管切换视角），否则回退 user.role
  const effRole = role || user?.role || 'employer';
  const isSuper = user?.role === 'admin';        // 超级账户：可切换视角
  const isEmployer = effRole === 'employer';
  const isEngineer = effRole === 'engineer';
  const isAdminView = effRole === 'admin';

  // 角色感知菜单：finance/learning 为路由跳转，其余为 console 七屏（页内切换或跳 /console）
  const navItems = [
    { key: 'dashboard', icon: '▦', label: d.navDashboard },
    { key: 'projects', icon: '📁', label: d.navProjects },
    { key: 'escrow', icon: '💰', label: d.navEscrow },
    { key: 'messages', icon: '💬', label: d.navMessages, badge: unreadTotal },
    { key: 'finance', icon: '🏦', label: d.navFinance, href: '/finance' },
  ];
  if (isEmployer) navItems.push({ key: 'find', icon: '🔍', label: d.navFind });
  if (isEngineer) navItems.push({ key: 'profile', icon: '👤', label: d.navProfile });
  if (isEngineer) navItems.push({ key: 'learning', icon: '🎓', label: d.navLearning, href: '/training' });
  if (isAdminView) navItems.push({ key: 'admin', icon: '🛡️', label: d.navAdmin });

  // 菜单点击：有 href 直接跳；console 七屏在本页则回调 onNavigate（页内 setScreen），
  // 否则（finance/talent 上点击）跳 /console?screen=key
  function handleNav(item) {
    setSbOpen(false);
    if (item.href) { router.push(item.href); return; }
    if (onNavigate) onNavigate(item.key);
    else router.push(`/console?screen=${item.key}`);
  }

  // 铃铛"全部已读"：真实调用 /api/notifications/read-all，成功后清零徽标并本地标记已读
  async function markAllRead() {
    if (!user?.token) return;
    try {
      await fetch('/api/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
      setNotifUnread(0);
      setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
    } catch { /* 静默：未读数下次刷新会回正 */ }
  }
  // 点击某条通知：有 link 则跳转，并关闭面板
  function openNotif(n) {
    setNotifOpen(false);
    if (n.link) router.push(n.link);
  }

  // 退出：先清离线镜像（换账号不能读到上一个人的数据），再登出 supabase + 清本地登录态，跳登录页。
  // mirrorClearAll 用 fire-and-forget 包 try/catch，不阻塞登出主流程。
  async function handleLogout() {
    try { require('../lib/offline/idb').mirrorClearAll(); } catch { /* 离线库不可用时忽略 */ }
    try { await supabase.auth.signOut(); } catch { /* OAuth 会话登出失败不阻塞 */ }
    try { localStorage.removeItem('tal_user'); } catch { /* 隐私模式等无 localStorage */ }
    window.location.href = '/finance';
  }

  if (!user) return null; // 无用户：外壳不渲染，页面各自处理未登录态

  const userInitials = initialsOf(user.name, user.email);
  const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const roleLabel = isEmployer ? d.roleEmployerLabel : isEngineer ? d.roleEngineerLabel : d.roleAdminLabel;
  const primaryCta = isEmployer ? d.ctaPost : isEngineer ? d.ctaBrowse : d.ctaManage;
  const primaryHref = isAdminView ? '/admin' : '/talent';

  return (
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
          {/* 角色切换仅超级管理员且父级提供 onRoleChange 时开放；否则显示静态身份标签 */}
          {isSuper && onRoleChange ? (
            <div className={styles.roleSwitch}>
              <button className={`${styles.roleTab} ${isEmployer ? styles.roleTabActive : ''}`} onClick={() => { onRoleChange('employer'); setSbOpen(false); }}>{d.employer}</button>
              <button className={`${styles.roleTab} ${isEngineer ? styles.roleTabActive : ''}`} onClick={() => { onRoleChange('engineer'); setSbOpen(false); }}>{d.engineer}</button>
              <button className={`${styles.roleTab} ${isAdminView ? styles.roleTabActive : ''}`} onClick={() => { onRoleChange('admin'); setSbOpen(false); }}>{d.admin}</button>
            </div>
          ) : (
            <div className={styles.roleStatic}>{isEmployer ? d.employer : isEngineer ? d.engineer : d.admin}</div>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map(it => (
            <button key={it.key} className={`${styles.navItem} ${active === it.key ? styles.navItemActive : ''}`} onClick={() => handleNav(it)}>
              <span className={styles.navIcon}>{it.icon}</span>
              <span className={styles.navLabel}>{it.label}</span>
              {it.key === 'messages' && it.badge > 0 && <span className={styles.navBadge}>{it.badge}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sbFooter}>
          <span className={styles.sbAvatar}>{userInitials}</span>
          <div className={styles.sbUserMeta}>
            <div className={styles.sbUserName}>{userName}</div>
            <div className={styles.sbUserRole}>{roleLabel}</div>
          </div>
          <Link href="/onboarding" className={styles.sbGear} title={d.settings}>⚙</Link>
          <button className={styles.sbLogout} onClick={handleLogout} title={d.logout} aria-label={d.logout}>⏻</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.hamburger} onClick={() => setSbOpen(v => !v)} aria-label="Menu">☰</button>
          <div>
            <div className={styles.topTitle}>{title}</div>
            {subtitle && <div className={styles.topSub}>{subtitle}</div>}
          </div>
          <div className={styles.grow} />
          <div className={styles.search}>
            <span>🔍</span>
            <input placeholder={d.searchPh} />
          </div>
          <button className={styles.iconBtn} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {/* 语言快速切换：外壳文案为 en/zh，按钮显示"对面"语言标签，点击即切换 */}
          <button className={styles.iconBtn} onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} title="Toggle language" aria-label="Toggle language">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          {/* 通知铃铛：点击展开下拉面板（真实 /api/notifications），面板外点击关闭 */}
          <div className={styles.notifWrap}>
            <button className={styles.iconBtn} onClick={() => setNotifOpen(v => !v)} aria-label="Notifications">
              🔔{notifUnread > 0 && <span className={styles.bellBadge}>{notifUnread}</span>}
            </button>
            {notifOpen && (
              <>
                <div className={styles.notifBackdrop} onClick={() => setNotifOpen(false)} />
                <div className={styles.notifPanel}>
                  <div className={styles.notifHead}>
                    <b>{d.notifications}</b>
                    {notifUnread > 0 && <button className={styles.markAllBtn} onClick={markAllRead}>{d.markAllRead}</button>}
                  </div>
                  <div className={styles.notifScroll}>
                    {notifications === null ? (
                      <div className={styles.stateBox}>{d.loading}</div>
                    ) : notifications.length === 0 ? (
                      <div className={styles.stateBox}>{d.notifEmpty}</div>
                    ) : notifications.slice(0, 10).map(n => (
                      <button key={n.id} className={`${styles.notifItem} ${n.read ? '' : styles.notifUnreadItem}`} onClick={() => openNotif(n)}>
                        <div className={styles.notifItemTitle}>{n.title}</div>
                        {n.body && <div className={styles.notifItemBody}>{n.body}</div>}
                        <div className={styles.notifItemTime}>{relTime(n.created_at)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <Link href={primaryHref} className={styles.ctaBtn}>{primaryCta}</Link>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
