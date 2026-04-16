import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from './rates.module.css';

export default function Rates() {
  const [benchmarks, setBenchmarks] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetch('/api/talent/rate-benchmarks')
      .then(r => r.json())
      .then(d => {
        setBenchmarks(d.data || []);
        const allSkills = new Set();
        (d.skills || []).forEach(s => allSkills.add(s));
        setSkills([...allSkills]);
      })
      .catch(() => setBenchmarks([]));
  }, []);

  const filtered = benchmarks
    ? (selectedSkill ? benchmarks.filter(b => b.top_skills?.includes(selectedSkill)) : benchmarks)
    : null;

  return (
    <>
      <Head>
        <title>Automation Engineer Rate Benchmarks | Talengineer</title>
        <meta name="description" content="Live market rates for automation and industrial engineers by region. Compare $USD/hr rates for PLC, SCADA, robotics, and electrical engineering." />
      </Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <nav className={styles.nav}>
          <Link href="/talent">Find Engineers</Link>
          <Link href="/finance" className={styles.btnCta}>Post a Project</Link>
        </nav>
      </header>

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Live Market Data</div>
          <h1>Automation Engineer<br />Rate Benchmarks</h1>
          <p>Real-time market rates for industrial automation talent by region. Data sourced from active engineer profiles on Talengineer.</p>
        </div>
      </div>

      <div className={styles.container}>
        {skills.length > 0 && (
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>Filter by skill:</span>
            <button className={`${styles.chip} ${!selectedSkill ? styles.chipActive : ''}`} onClick={() => setSelectedSkill('')}>All Skills</button>
            {skills.slice(0, 12).map(s => (
              <button key={s} className={`${styles.chip} ${selectedSkill === s ? styles.chipActive : ''}`} onClick={() => setSelectedSkill(s)}>{s}</button>
            ))}
          </div>
        )}

        {filtered === null ? (
          <div className={styles.grid}>
            {[0,1,2,3,4,5].map(i => <div key={i} className={styles.cardSkeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No rate data available yet.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((b, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardRegion}>{b.region}</div>
                <div className={styles.cardRate}>${b.median}<span>/hr</span></div>
                <div className={styles.cardLabel}>Median Rate</div>
                <div className={styles.cardStats}>
                  <div className={styles.stat}><div className={styles.statVal}>${b.min}</div><div className={styles.statLabel}>Min</div></div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}><div className={styles.statVal}>${b.avg}</div><div className={styles.statLabel}>Avg</div></div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}><div className={styles.statVal}>${b.max}</div><div className={styles.statLabel}>Max</div></div>
                </div>
                <div className={styles.cardCount}>{b.count} engineer{b.count !== 1 ? 's' : ''} sampled</div>
                {b.top_skills?.length > 0 && (
                  <div className={styles.skillList}>
                    {b.top_skills.slice(0, 3).map(s => <span key={s} className={styles.skillChip}>{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.infoBox}>
          <h2>About This Data</h2>
          <p>Rates are self-reported by engineers on the Talengineer platform and updated in real time. Figures represent hourly rates in USD. Rates may vary based on project complexity, duration, certifications held, and urgency.</p>
          <p style={{ marginTop: 12 }}>
            <strong>Industrial specialties tracked:</strong> PLC programming, SCADA/HMI development, robotics (Fanuc, KUKA, ABB), electrical panel design, Siemens TIA Portal, Rockwell Studio 5000, process control, and more.
          </p>
          <Link href="/talent" className={styles.btnBrowse}>Browse Available Engineers →</Link>
        </div>

        <div className={styles.ctaBox}>
          <div>
            <h2>Need to hire an automation engineer?</h2>
            <p>Post your project and get matched with pre-screened engineers. Escrow payment protects both parties.</p>
          </div>
          <Link href="/finance" className={styles.btnCta2}>Post a Project</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> · <Link href="/rates">Rate Benchmarks</Link> · <Link href="/enterprise">Enterprise API</Link></p>
      </footer>
    </>
  );
}
