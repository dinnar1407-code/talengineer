import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import styles from './Navbar.module.css';

const LS_USER_KEY = 'tal_user';

const ROLE_LABEL = { employer: 'Employer', engineer: 'Engineer' };
const ROLE_COLOR = { employer: '#10b981', engineer: '#0056b3' };

export default function Navbar({ lang, onLangChange }) {
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }

    // Listen for storage changes (login/logout in another tab)
    function onStorage(e) {
      if (e.key === LS_USER_KEY) {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch {}
      }
    }
    window.addEventListener('storage', onStorage);

    // Close dropdown on outside click
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span>⚙️</span> Talengineer
      </Link>

      <nav className={styles.nav}>
        <Link href="/talent" className={styles.navLink}>Find Engineers</Link>
        <Link href="/rates"  className={styles.navLink}>Rate Benchmarks</Link>

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
                  📊 Dashboard
                </Link>
                {user.role === 'engineer' && (
                  <Link href="/onboarding" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    ✏️ Edit Profile
                  </Link>
                )}
                <Link href="/enterprise" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  🔑 API Keys
                </Link>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} style={{ color: '#ef4444' }} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/finance" className={styles.btnSignIn}>
            Sign In
          </Link>
        )}

        {onLangChange && (
          <>
            <div className={styles.divider} />
            {['en', 'zh', 'es'].map(l => (
              <button
                key={l}
                className={`${styles.langBtn} ${lang === l ? styles.langActive : ''}`}
                onClick={() => onLangChange(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </>
        )}
      </nav>
    </header>
  );
}
