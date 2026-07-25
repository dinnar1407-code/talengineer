import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './rates.module.css';
// 九语 UI 字典已抽到 lib/i18n/rates.js（2026-07-24 架构 B 试点，逐字节原样搬移），
// 取值仍用 DICT[lang] || DICT.en 惯用式，完整性由 tests/i18nParity.test.js 守护。
import { DICT } from '../lib/i18n/rates';

// 按方向浏览的四个正门（链向真实存在的 /hire/[track] 页），修复矩阵页弱链入。
// label 走 9 语，与首页 footerSpecialties 口径一致。
const SPECIALTIES = [
  { href: '/hire/plc',        label: { en: 'PLC Programming', zh: 'PLC 编程', es: 'Programación de PLC', vi: 'Lập trình PLC', hi: 'PLC प्रोग्रामिंग', fr: 'Programmation PLC', de: 'PLC-Programmierung', ja: 'PLCプログラミング', ko: 'PLC 프로그래밍' } },
  { href: '/hire/vision',     label: { en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy', hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전' } },
  { href: '/hire/robotics',   label: { en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot công nghiệp', hi: 'रोबोटिक्स', fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스' } },
  { href: '/hire/electrical', label: { en: 'Panel Design', zh: '电柜设计', es: 'Diseño de tableros', vi: 'Thiết kế tủ điện', hi: 'पैनल डिज़ाइन', fr: "Conception d'armoires", de: 'Schaltschrankdesign', ja: '制御盤設計', ko: '패널 설계' } },
];

// 分国用人指南入口（链向真实存在的 /guides/[region] 页），修复 /guides 零链入孤儿。
const RATE_GUIDES = [
  { href: '/guides/mexico',   label: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico', hi: 'मेक्सिको', fr: 'Mexique', de: 'Mexiko', ja: 'メキシコ', ko: '멕시코' } },
  { href: '/guides/vietnam',  label: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam', hi: 'वियतनाम', fr: 'Vietnam', de: 'Vietnam', ja: 'ベトナム', ko: '베트남' } },
  { href: '/guides/thailand', label: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan', hi: 'थाईलैंड', fr: 'Thaïlande', de: 'Thailand', ja: 'タイ', ko: '태국' } },
];

export default function Rates() {
  const [lang, setLang] = useLang();
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

  const d = DICT[lang] || DICT.en;

  // Dataset JSON-LD（AI-Native Phase 0 语义层）：把费率行情标注为 schema.org 数据集，
  // 让搜索引擎与 AI 爬虫把 /rates 识别为可引用的行业数据源（含公开 JSON 端点）。
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Industrial Automation Engineer Rate Benchmarks',
    description:
      'Live hourly-rate benchmarks (USD) for industrial automation engineers by region and specialty — PLC, SCADA/HMI, robotics, electrical. Self-reported by active engineers on Talengineer, updated in real time.',
    url: 'https://talengineer.us/rates',
    creator: { '@type': 'Organization', name: 'Talengineer', url: 'https://talengineer.us' },
    isAccessibleForFree: true,
    variableMeasured: ['hourly rate (USD)', 'region', 'specialty', 'sample size'],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: 'https://talengineer.us/api/talent/rate-benchmarks',
    },
  };

  return (
    <>
      <Head>
        <title>{`${d.metaTitle} | Talengineer`}</title>
        <meta name="description" content={d.metaDescription} />
        <link rel="canonical" href="https://talengineer.us/rates" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${d.metaTitle} | Talengineer`} />
        <meta property="og:description" content={d.metaDescription} />
        <meta property="og:url" content="https://talengineer.us/rates" />
        <meta property="og:image" content="https://talengineer.us/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${d.metaTitle} | Talengineer`} />
        <meta name="twitter:description" content={d.metaDescription} />
        <meta name="twitter:image" content="https://talengineer.us/og.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {skills.length > 0 && (
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>{d.filterLabel}</span>
            <button className={`${styles.chip} ${!selectedSkill ? styles.chipActive : ''}`} onClick={() => setSelectedSkill('')}>{d.allSkills}</button>
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
          <div className={styles.empty}>{d.noData}</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((b, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardRegion}>{b.region}</div>
                <div className={styles.cardRate}>${b.median}<span>/hr</span></div>
                <div className={styles.cardLabel}>{d.medianRate}</div>
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
          <h2>{d.aboutTitle}</h2>
          <p>{d.aboutBody1}</p>
          <p style={{ marginTop: 12 }}>{d.aboutBody2}</p>
          <Link href="/talent" className={styles.btnBrowse}>{d.browseBtn}</Link>
        </div>

        {/* 高意图交叉入口：成本计算器 CTA + 按方向浏览(/hire) + 分国用人指南(/guides)，
            把费率页流量导向已建成的下游页面，修复弱链/孤儿入口。 */}
        <div className={styles.infoBox}>
          <Link href="/calculator" className={styles.btnBrowse}>{d.calcCta}</Link>
          <p style={{ marginTop: 18, marginBottom: 8, fontWeight: 600 }}>{d.bySpecLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALTIES.map((s) => (
              <Link key={s.href} href={s.href} className={styles.skillChip} style={{ textDecoration: 'none' }}>
                {s.label[lang] || s.label.en}
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 18, marginBottom: 8, fontWeight: 600 }}>{d.guidesLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RATE_GUIDES.map((g) => (
              <Link key={g.href} href={g.href} className={styles.skillChip} style={{ textDecoration: 'none' }}>
                {g.label[lang] || g.label.en}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.ctaBox}>
          <div>
            <h2>{d.ctaTitle}</h2>
            <p>{d.ctaBody}</p>
          </div>
          <Link href="/finance" className={styles.btnCta2}>{d.ctaBtn}</Link>
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </>
  );
}
