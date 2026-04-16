import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import styles from './Navbar.module.css';

const LS_USER_KEY = 'tal_user';
const LS_LANG_KEY = 'tal_lang';

const ROLE_LABEL = { employer: 'Employer', engineer: 'Engineer' };
const ROLE_COLOR  = { employer: '#10b981', engineer: '#0056b3' };

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
};

export default function Navbar({ lang: langProp, onLangChange }) {
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang]         = useState(langProp || 'en');
  const menuRef = useRef(null);

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
        {['en', 'zh', 'es'].map(l => (
          <button
            key={l}
            className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
            onClick={() => switchLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </nav>
    </header>
  );
}
