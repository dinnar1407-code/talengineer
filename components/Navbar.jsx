import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
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

const DICT = {
  en: {
    findEngineers:  'Find Engineers',
    rateBenchmarks: 'Rate Benchmarks',
    signIn:         'Sign In',
    dashboard:      'Dashboard',
    editProfile:    'Edit Profile',
    apiKeys:        'API Keys',
    signOut:        'Sign Out',
  },
  zh: {
    findEngineers:  '寻找工程师',
    rateBenchmarks: '费率基准',
    signIn:         '登录',
    dashboard:      '控制台',
    editProfile:    '编辑档案',
    apiKeys:        'API 密钥',
    signOut:        '退出登录',
  },
  es: {
    findEngineers:  'Buscar Ingenieros',
    rateBenchmarks: 'Tarifas de Mercado',
    signIn:         'Iniciar sesión',
    dashboard:      'Panel de control',
    editProfile:    'Editar perfil',
    apiKeys:        'Claves API',
    signOut:        'Cerrar sesión',
  },
  vi: {
    findEngineers:  'Tìm Kỹ Sư',
    rateBenchmarks: 'Thị Trường Giá',
    signIn:         'Đăng nhập',
    dashboard:      'Bảng điều khiển',
    editProfile:    'Chỉnh sửa hồ sơ',
    apiKeys:        'Khóa API',
    signOut:        'Đăng xuất',
  },
  hi: {
    findEngineers:  'इंजीनियर खोजें',
    rateBenchmarks: 'बाज़ार दरें',
    signIn:         'साइन इन करें',
    dashboard:      'डैशबोर्ड',
    editProfile:    'प्रोफ़ाइल संपादित करें',
    apiKeys:        'API कुंजियाँ',
    signOut:        'साइन आउट',
  },
  fr: {
    findEngineers:  'Trouver des Ingénieurs',
    rateBenchmarks: 'Tarifs du marché',
    signIn:         'Se connecter',
    dashboard:      'Tableau de bord',
    editProfile:    'Modifier le profil',
    apiKeys:        'Clés API',
    signOut:        'Se déconnecter',
  },
  de: {
    findEngineers:  'Ingenieure finden',
    rateBenchmarks: 'Marktpreise',
    signIn:         'Anmelden',
    dashboard:      'Dashboard',
    editProfile:    'Profil bearbeiten',
    apiKeys:        'API-Schlüssel',
    signOut:        'Abmelden',
  },
  ja: {
    findEngineers:  'エンジニアを探す',
    rateBenchmarks: '市場レート',
    signIn:         'サインイン',
    dashboard:      'ダッシュボード',
    editProfile:    'プロフィール編集',
    apiKeys:        'APIキー',
    signOut:        'サインアウト',
  },
  ko: {
    findEngineers:  '엔지니어 찾기',
    rateBenchmarks: '시장 요율',
    signIn:         '로그인',
    dashboard:      '대시보드',
    editProfile:    '프로필 편집',
    apiKeys:        'API 키',
    signOut:        '로그아웃',
  },
};

export default function Navbar({ lang: langProp, onLangChange }) {
  const [user, setUser]             = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [lang, setLang]             = useState(langProp || 'en');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs]         = useState([]);
  const [bellOpen, setBellOpen]     = useState(false);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
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

  const d = DICT[lang] || DICT.en;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span>⚙️</span> Talengineer
      </Link>

      <nav className={styles.nav}>
        <Link href="/talent" className={styles.navLink}>{d.findEngineers}</Link>
        <Link href="/rates"  className={styles.navLink}>{d.rateBenchmarks}</Link>

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
                <Link href="/finance" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  📊 {d.dashboard}
                </Link>
                {user.role === 'engineer' && (
                  <Link href="/onboarding" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    ✏️ {d.editProfile}
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
          <Link href="/finance" className={styles.btnSignIn}>
            {d.signIn}
          </Link>
        )}

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
  );
}
