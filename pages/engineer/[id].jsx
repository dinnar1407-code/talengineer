import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './engineer.module.css';

export default function EngineerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/talent/profile/${id}`)
      .then(r => r.json())
      .then(d => { setEngineer(d.data || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} style={{ height: 120 }} />
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className={styles.wrap}>
        <div className={styles.notFound}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <h2>Engineer not found</h2>
          <Link href="/talent" className={styles.btnBack}>← Back to Talent Hub</Link>
        </div>
      </div>
    );
  }

  const isVerified = (engineer.verified_score || 0) >= 80;

  return (
    <>
      <Head><title>{engineer.name} | TalEngineer</title></Head>

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>⚙️ TalEngineer</Link>
        <Link href="/talent" className={styles.btnBack}>← Talent Hub</Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.topRow}>
            <div className={styles.avatar}>{engineer.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className={styles.name}>
                {engineer.name}
                {isVerified && <span className={styles.verifiedBadge}>🛡️ Nexus Verified</span>}
              </h1>
              <div className={styles.meta}>
                <span className={styles.chip}>📍 {engineer.region}</span>
                <span className={styles.chip}>⭐ {engineer.level}</span>
                <span className={styles.chip}>💰 {engineer.rate}</span>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className={styles.scoreBanner}>
              <span className={styles.scoreLabel}>Nexus Verified Score</span>
              <span className={styles.scoreVal}>{engineer.verified_score}</span>
              <div className={styles.scoreBar}>
                <div className={styles.scoreBarFill} style={{ width: `${engineer.verified_score}%` }} />
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Skills & Expertise</div>
            <div className={styles.skillsList}>
              {(engineer.skills || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean).map(skill => (
                <span key={skill} className={styles.skillChip}>{skill}</span>
              ))}
            </div>
          </div>

          {engineer.bio && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>About</div>
              <p className={styles.bio}>{engineer.bio}</p>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Member since</span><span>{new Date(engineer.created_at).toLocaleDateString()}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Pricing model</span><span style={{ textTransform: 'capitalize' }}>{engineer.pricing_model || 'Hourly'}</span></div>
            </div>
          </div>

          <a
            href={`mailto:${engineer.contact}?subject=TalEngineer Project Inquiry for ${encodeURIComponent(engineer.name)}`}
            className={styles.btnContact}
          >
            📧 Invite to Project
          </a>
        </div>
      </div>
    </>
  );
}
