import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../hooks/useTheme';
// 导航菜单结构的单一配置源（lib/navConfig.js，CJS 纯数据）：
// - MENU：5 个下拉分组 + 1 个扁平 Pricing 链接（方案 A1 定稿结构）
// - CTA_POST_PROJECT：右侧「发布项目」CTA（从首页私有 header 收编而来，与页脚同源）
// - t：九语 label 取词函数（lang 未知时回退英文，与全站 `|| en` 约定一致）
import { MENU, CTA_POST_PROJECT, t as navT } from '../lib/navConfig';
import styles from './Navbar.module.css';

const LS_USER_KEY = 'tal_user';
const LS_LANG_KEY = 'tal_lang';

const ROLE_LABEL = { employer: 'Employer', engineer: 'Engineer' };
const ROLE_COLOR  = { employer: '#10b981', engineer: '#0056b3' };

const LANGS = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'es', label: '🇲🇽 Español' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ko', label: '🇰🇷 한국어' },
];

// 内联 DICT 只保留「账号类」字串（登录/控制台/档案/认证中心/API 密钥/退出）——
// 营销导航的九语 label 已全部迁入 lib/navConfig.js（一个文件给翻译、结构可测）。
// 本次修复：certCenter 此前有 7 种语言缺翻译（会渲染 undefined），现已九语齐全。
const DICT = {
  en: {
    signIn:      'Sign In',
    dashboard:   'Dashboard',
    editProfile: 'My Profile',
    certCenter:  'Certification Center',
    apiKeys:     'API Keys',
    signOut:     'Sign Out',
  },
  zh: {
    signIn:      '登录',
    dashboard:   '控制台',
    editProfile: '我的档案',
    certCenter:  '认证中心',
    apiKeys:     'API 密钥',
    signOut:     '退出登录',
  },
  es: {
    signIn:      'Iniciar sesión',
    dashboard:   'Panel de control',
    editProfile: 'Mi perfil',
    certCenter:  'Centro de certificación',
    apiKeys:     'Claves API',
    signOut:     'Cerrar sesión',
  },
  vi: {
    signIn:      'Đăng nhập',
    dashboard:   'Bảng điều khiển',
    editProfile: 'Hồ sơ của tôi',
    certCenter:  'Trung tâm chứng nhận',
    apiKeys:     'Khóa API',
    signOut:     'Đăng xuất',
  },
  hi: {
    signIn:      'साइन इन करें',
    dashboard:   'डैशबोर्ड',
    editProfile: 'मेरी प्रोफ़ाइल',
    certCenter:  'प्रमाणन केंद्र',
    apiKeys:     'API कुंजियाँ',
    signOut:     'साइन आउट',
  },
  fr: {
    signIn:      'Se connecter',
    dashboard:   'Tableau de bord',
    editProfile: 'Mon profil',
    certCenter:  'Centre de certification',
    apiKeys:     'Clés API',
    signOut:     'Se déconnecter',
  },
  de: {
    signIn:      'Anmelden',
    dashboard:   'Dashboard',
    editProfile: 'Mein Profil',
    certCenter:  'Zertifizierungszentrum',
    apiKeys:     'API-Schlüssel',
    signOut:     'Abmelden',
  },
  ja: {
    signIn:      'サインイン',
    dashboard:   'ダッシュボード',
    editProfile: 'マイプロフィール',
    certCenter:  '認定センター',
    apiKeys:     'APIキー',
    signOut:     'サインアウト',
  },
  ko: {
    signIn:      '로그인',
    dashboard:   '대시보드',
    editProfile: '내 프로필',
    certCenter:  '인증 센터',
    apiKeys:     'API 키',
    signOut:     '로그아웃',
  },
};

export default function Navbar({ lang: langProp, onLangChange }) {
  const [user, setUser]                     = useState(null);
  const [menuOpen, setMenuOpen]             = useState(false);         // 桌面端用户头像下拉菜单的开关
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);         // 移动端汉堡菜单的开关
  const [lang, setLang]                     = useState(langProp || 'en');
  const { theme, toggle: toggleTheme }      = useTheme();               // 全站浅/深主题
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifs, setNotifs]                 = useState([]);
  const [bellOpen, setBellOpen]             = useState(false);
  // 桌面端菜单下拉：openKey 记录当前展开的分组 key（同一时刻最多展开一个）。
  // 面板条件渲染（照通知铃下拉先例）：SSR 首帧一律不渲染面板，零水合风险。
  const [openKey, setOpenKey]               = useState(null);
  // 移动端抽屉内的手风琴：mobileOpenKey 记录展开的分组（同一时刻最多一个）。
  const [mobileOpenKey, setMobileOpenKey]   = useState(null);
  const menuRef       = useRef(null);        // 头像下拉菜单容器 ref（用于点击外部关闭）
  const bellRef       = useRef(null);        // 铃铛通知容器 ref（用于点击外部关闭）
  const mobileMenuRef = useRef(null);        // 汉堡菜单抽屉 ref（用于点击外部关闭）
  const navRef        = useRef(null);        // 桌面菜单条容器 ref（点击外部关闭下拉分组）
  const triggerRefs   = useRef({});          // 各下拉分组触发按钮的 ref 表（Esc 关闭后把焦点还给触发器）

  useEffect(() => {
    // Load user
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }

    // Load lang
    const savedLang = localStorage.getItem(LS_LANG_KEY);
    if (savedLang && DICT[savedLang]) setLang(savedLang);

    function onStorage(e) {
      if (e.key === LS_USER_KEY) {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
      if (e.key === LS_LANG_KEY && e.newValue && DICT[e.newValue]) {
        setLang(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);

    function onClickOutside(e) {
      if (menuRef.current       && !menuRef.current.contains(e.target))       setMenuOpen(false);
      if (bellRef.current       && !bellRef.current.contains(e.target))       setBellOpen(false);
      // 点击汉堡菜单抽屉外部时自动收起（汉堡按钮本身通过 toggle 逻辑处理，不需要排除）
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
      // 点击桌面菜单条外部时收起当前展开的下拉分组（复用同一 mousedown 监听模式）
      if (navRef.current        && !navRef.current.contains(e.target))        setOpenKey(null);
    }
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  // Keep internal lang in sync if parent passes langProp
  useEffect(() => {
    if (langProp && DICT[langProp]) setLang(langProp);
  }, [langProp]);

  const fetchUnread = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const stored = localStorage.getItem(LS_USER_KEY);
      const token = stored ? JSON.parse(stored)?.token : null;
      if (!token) return;
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { count } = await res.json();
        setUnreadCount(count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    fetchUnread(user);
    const timer = setInterval(() => fetchUnread(user), 30_000);
    return () => clearInterval(timer);
  }, [user, fetchUnread]);

  async function openBell() {
    setBellOpen(v => !v);
    if (bellOpen) return;
    try {
      const stored = localStorage.getItem(LS_USER_KEY);
      const token = stored ? JSON.parse(stored)?.token : null;
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setNotifs(data || []);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      const stored = localStorage.getItem(LS_USER_KEY);
      const token = stored ? JSON.parse(stored)?.token : null;
      if (!token) return;
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }

  function switchLang(l) {
    setLang(l);
    localStorage.setItem(LS_LANG_KEY, l);
    if (onLangChange) onLangChange(l);
  }

  async function handleLogout() {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  }

  // Esc 关闭当前下拉分组，并把焦点还给触发按钮（无障碍：用户不会「丢焦点」）。
  // 挂在菜单条容器上冒泡处理，比每个面板单独挂监听简单。
  function onMenuKeyDown(e) {
    if (e.key !== 'Escape' || !openKey) return;
    const trigger = triggerRefs.current[openKey];
    setOpenKey(null);
    if (trigger) trigger.focus();
  }

  // 关闭移动抽屉时顺带收起手风琴（下次打开回到全收起的干净状态）
  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setMobileOpenKey(null);
  }

  const d = DICT[lang] || DICT.en;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    // 使用 Fragment 包裹，这样移动端抽屉可以渲染在 header 外部，避免被 sticky header 裁剪
    <>
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <img src="/img/logo-macaw.svg" alt="TalEngineer" width={28} height={28} /> Talengineer
      </Link>

      {/* 汉堡按钮：只在移动端(<768px)显示，点击切换移动菜单的开/关状态 */}
      <button
        className={styles.hamburgerBtn}
        onClick={() => setMobileMenuOpen(v => !v)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-menu"
      >
        {/* 通过 aria-label 和文字内容传递语义；☰ 为开，✕ 为关 */}
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={styles.nav}>
        {/*
          桌面端菜单条：完全由 lib/navConfig.js 的 MENU 驱动（5 下拉分组 + 扁平 Pricing）。
          交互约定（方案 A2 定稿）：
          - hover 展开（onMouseEnter/Leave 挂在分组 wrapper 上）；
          - click 只开不关：iPad 等触屏会先触发 mouseenter 再触发 click，
            若 click 是 toggle 就会「开了又立刻关」（双触发 bug），所以 click 永远 setOpenKey(key)；
          - 关闭途径 = 鼠标移出 / 点击外部(mousedown 监听 + navRef) / Esc(焦点还给触发器) / 点面板内链接。
        */}
        <div className={styles.menuBar} ref={navRef} onKeyDown={onMenuKeyDown}>
          {MENU.map((g) => (
            g.link ? (
              /* 扁平项（Pricing）：有 link 无 items，渲染成普通链接 */
              <Link key={g.key} href={g.link.href} className={styles.navLink}>
                {navT(g.label, lang)}
              </Link>
            ) : (
              <div
                key={g.key}
                className={styles.navGroup}
                onMouseEnter={() => setOpenKey(g.key)}
                onMouseLeave={() => setOpenKey(k => (k === g.key ? null : k))}
              >
                <button
                  type="button"
                  className={styles.navGroupBtn}
                  ref={el => { triggerRefs.current[g.key] = el; }}
                  aria-haspopup="true"
                  aria-expanded={openKey === g.key}
                  onClick={() => setOpenKey(g.key)}
                >
                  {navT(g.label, lang)} <span className={styles.navChevron}>▾</span>
                </button>
                {/* 面板条件渲染（照通知铃下拉先例）：SSR/首帧不输出，无水合风险 */}
                {openKey === g.key && (
                  <div className={styles.navPanel}>
                    {g.items.map((l) => (
                      <Link
                        key={l.key}
                        href={l.href}
                        className={styles.navPanelLink}
                        onClick={() => setOpenKey(null)}
                      >
                        {navT(l.label, lang)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {user && (
          <Link href="/messages" className={styles.navLink} style={{ position: 'relative' }}>
            💬
          </Link>
        )}

        {user && (
          <div className={styles.bellWrap} ref={bellRef}>
            <button className={styles.bellBtn} onClick={openBell} aria-label="Notifications">
              🔔
              {unreadCount > 0 && (
                <span className={styles.bellBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            {bellOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className={styles.markRead} onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifs.map(n => (
                    <Link
                      key={n.id}
                      href={n.link || '/finance'}
                      className={`${styles.notifItem} ${n.read ? styles.notifRead : ''}`}
                      onClick={() => setBellOpen(false)}
                    >
                      <div className={styles.notifTitle}>{n.title}</div>
                      {n.body && <div className={styles.notifBody}>{n.body}</div>}
                      <div className={styles.notifTime}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className={styles.userMenu} ref={menuRef}>
            <button className={styles.avatarBtn} onClick={() => setMenuOpen(v => !v)}>
              <div className={styles.avatar} style={{ background: ROLE_COLOR[user.role] || '#6b7280' }}>
                {initials}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name || user.email.split('@')[0]}</span>
                <span className={styles.userRole} style={{ color: ROLE_COLOR[user.role] }}>
                  {ROLE_LABEL[user.role] || user.role}
                </span>
              </div>
              <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownEmail}>{user.email}</div>
                  <span className={styles.dropdownRoleBadge} style={{ background: ROLE_COLOR[user.role] + '18', color: ROLE_COLOR[user.role] }}>
                    {ROLE_LABEL[user.role] || user.role}
                  </span>
                </div>
                <Link href="/console" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  📊 {d.dashboard}
                </Link>
                {user.role === 'engineer' && (
                  <Link href="/onboarding" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    👤 {d.editProfile}
                  </Link>
                )}
                {user.role === 'engineer' && (
                  <Link href="/training" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    🎓 {d.certCenter}
                  </Link>
                )}
                <Link href="/enterprise" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  🔑 {d.apiKeys}
                </Link>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} style={{ color: '#ef4444' }} onClick={handleLogout}>
                  {d.signOut}
                </button>
              </div>
            )}
          </div>
        ) : (
          /*
            未登录右侧（方案 A1）：Sign In 文字链 + 「发布项目」主 CTA。
            CTA 链接对象来自 navConfig 的 CTA_POST_PROJECT（首页私有 header 收编而来，
            与菜单/页脚里的 postProject 同源，文案/落点永不漂移）。
          */
          <>
            <Link href="/finance" className={styles.navLink}>
              {d.signIn}
            </Link>
            <Link href={CTA_POST_PROJECT.href} className={styles.btnSignIn}>
              {navT(CTA_POST_PROJECT.label, lang)}
            </Link>
          </>
        )}

        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title="Toggle light / dark"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className={styles.divider} />
        <select
          className={styles.langSelect}
          value={lang}
          onChange={e => switchLang(e.target.value)}
        >
          {LANGS.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </nav>
    </header>

    {/*
      移动端导航抽屉：
      - 只在窄屏可见（通过 CSS 控制）
      - mobileMenuOpen 为 true 时用 .mobileMenuOpen 类展开
      - ref 用于检测点击外部区域后收起
      - 菜单分组渲染成手风琴（accordion）：分组头是 aria-expanded 按钮，
        面板用 max-height 过渡展开/收起（与抽屉本身 .mobileMenuOpen 同一动画手法）
    */}
    <div
      id="mobile-nav-menu"
      ref={mobileMenuRef}
      className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {MENU.map((g) => (
        g.link ? (
          /* 扁平项（Pricing）：直接是链接，点击后关闭抽屉 */
          <Link
            key={g.key}
            href={g.link.href}
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            {navT(g.label, lang)}
          </Link>
        ) : (
          <div key={g.key}>
            {/* 手风琴分组头：toggle 展开状态（同一时刻只展开一个分组） */}
            <button
              type="button"
              className={styles.mobileAccBtn}
              aria-expanded={mobileOpenKey === g.key}
              onClick={() => setMobileOpenKey(k => (k === g.key ? null : g.key))}
            >
              <span>{navT(g.label, lang)}</span>
              <span className={styles.mobileAccChevron} aria-hidden="true">▾</span>
            </button>
            {/* 手风琴面板：max-height 过渡（与 .mobileMenuOpen 同一动画手法） */}
            <div
              className={`${styles.mobileAccPanel} ${mobileOpenKey === g.key ? styles.mobileAccPanelOpen : ''}`}
            >
              {g.items.map((l) => (
                <Link
                  key={l.key}
                  href={l.href}
                  className={styles.mobileAccLink}
                  onClick={closeMobileMenu}
                >
                  {navT(l.label, lang)}
                </Link>
              ))}
            </div>
          </div>
        )
      ))}

      {/* 登录用户才显示消息入口 */}
      {user && (
        <Link
          href="/messages"
          className={styles.mobileNavLink}
          onClick={closeMobileMenu}
        >
          💬 Messages
        </Link>
      )}

      {/* 未登录时显示登录 + 发布项目 CTA（与桌面端右侧一致） */}
      {!user && (
        <Link
          href="/finance"
          className={styles.mobileNavLink}
          onClick={closeMobileMenu}
        >
          {d.signIn}
        </Link>
      )}
      {!user && (
        <Link
          href={CTA_POST_PROJECT.href}
          className={styles.mobileNavLink}
          onClick={closeMobileMenu}
          style={{ color: 'var(--primary, #0056b3)', fontWeight: 700 }}
        >
          {navT(CTA_POST_PROJECT.label, lang)}
        </Link>
      )}

      {/* 登录用户：控制台快捷入口 */}
      {user && (
        <Link
          href="/console"
          className={styles.mobileNavLink}
          onClick={closeMobileMenu}
        >
          📊 {d.dashboard}
        </Link>
      )}
    </div>
    </>
  );
}
