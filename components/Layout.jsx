import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Layout.module.css';

export default function Layout({ children, title = 'Talengineer', description = '' }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('tal_lang') || 'en';
    setLangState(saved);
  }, []);

  function setLang(l) {
    setLangState(l);
    localStorage.setItem('tal_lang', l);
    // Dispatch custom event so pages can react
    window.dispatchEvent(new CustomEvent('langChange', { detail: l }));
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span>⚙️</span> Talengineer
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/#how-it-works">How it Works</Link>
          <Link href="/talent">Find Engineers</Link>
          <Link href="/finance" className={styles.btnLogin}>Sign In</Link>
          <div className={styles.divider} />
          {['en', 'zh', 'es'].map((l) => (
            <button
              key={l}
              className={`${styles.langBtn} ${lang === l ? styles.active : ''}`}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main>{children}</main>
    </>
  );
}
