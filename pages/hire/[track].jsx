import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getIndustriesForTrack, RATES_NOTE } from '../../lib/hireMatrix';
import { DICT as UI, TRACKS } from '../../lib/i18n/hire-track';
import styles from './hire.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 各地区费率区间（与 /rates 的地区基准一致，全站统一口径）。
const REGIONS = [
  { region: { en: 'North America', zh: '北美' }, rate: '$75–140/hr' },
  { region: { en: 'Western Europe', zh: '西欧' }, rate: '$70–120/hr' },
  { region: { en: 'Eastern Europe', zh: '东欧' }, rate: '$40–75/hr' },
  { region: { en: 'Mexico & Latin America', zh: '墨西哥及拉美' }, rate: '$35–65/hr' },
  { region: { en: 'China', zh: '中国' }, rate: '$35–70/hr' },
  { region: { en: 'Southeast Asia', zh: '东南亚' }, rate: '$30–55/hr' },
  { region: { en: 'India & South Asia', zh: '印度及南亚' }, rate: '$25–50/hr' },
];

// 建厂用人指南跨链（regional，与 /guides/[region] 路由一致）。方向页无论哪个 track 都可能跨国建厂，
// 所以统一给出三国指南入口，修复 /guides 全站零链入的孤儿问题。
const GUIDES = [
  { slug: 'mexico', name: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico', hi: 'मेक्सिको', fr: 'Mexique', de: 'Mexiko', ja: 'メキシコ', ko: '멕시코' } },
  { slug: 'vietnam', name: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam', hi: 'वियतनाम', fr: 'Vietnam', de: 'Vietnam', ja: 'ベトナム', ko: '베트남' } },
  { slug: 'thailand', name: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan', hi: 'थाईलैंड', fr: 'Thaïlande', de: 'Thailand', ja: 'タイ', ko: '태국' } },
];

// UI 与 TRACKS 字典已迁至 lib/i18n/hire-track.js（2026-07-24 架构 B）。
const TRACK_SLUGS = Object.keys(TRACKS);

export default function HireTrack({ track, industries, roles }) {
  const [lang, setLang] = useLang();
  const t = TRACKS[track];
  const c = t[lang] || t.en;
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/hire/${track}`;
  const ogImage = `${SITE}/og.png`;

  // Service 结构化数据：告诉搜索引擎这是一个"招募某方向工程师"的服务页。
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: t.serviceType,
    name: c.title,
    description: c.sub,
    areaServed: 'Worldwide',
    url: canonical,
    provider: { '@type': 'Organization', name: 'Talengineer', url: SITE },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${c.title} | Talengineer`}</title>
        <meta name="description" content={c.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={c.title} />
        <meta name="twitter:description" content={c.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{c.kicker}</p>
          <h1 className={styles.heroTitle}>{c.title}</h1>
          <p className={styles.heroSub}>{c.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.block}>
          <p className={styles.lead}>{c.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{c.lead2}</p>
        </div>

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.skillsTitle}</h2>
          <div className={styles.chips}>
            {t.skills.map((s) => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.verifyTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.verifyIntro}</p>
          <div className={styles.levelGrid}>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l1}</div>
              <p className={styles.levelDesc}>{c.l1}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l2}</div>
              <p className={styles.levelDesc}>{c.l2}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l3}</div>
              <p className={styles.levelDesc}>{c.l3}</p>
            </div>
          </div>
        </div>

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.ratesTitle}</h2>
          <table className={styles.rateTable}>
            <thead>
              <tr>
                <th>{u.regionCol}</th>
                <th>{u.rateCol}</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => (
                <tr key={r.region.en}>
                  <td>{r.region[lang] || r.region.en}</td>
                  <td>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>{RATES_NOTE[lang] || RATES_NOTE.en}</p>
        </div>

        {/* 建厂用人指南跨链：把方向页流量引到已建成但零链入的 /guides/[region] 国别指南 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.guidesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.guidesBody}</p>
          <div className={styles.industryLinks}>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className={styles.industryLink}>
                {(g.name[lang] || g.name.en)} →
              </Link>
            ))}
          </div>
        </div>

        {/* 行业子页入口（W1-1 垂直矩阵）：该方向下有行业页才渲染（electrical 暂无） */}
        {industries && industries.length > 0 && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>{u.industriesTitle}</h2>
            <div className={styles.industryLinks}>
              {industries.map((i) => (
                <Link
                  key={i.industry}
                  href={`/hire/${track}/${i.industry}`}
                  className={styles.industryLink}
                >
                  {(i.label[lang] || i.label.en)} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 常见职位名带：链去 /occupations/[role] 职业页（B4 内链系统）。
            清单构建期来自 lib/occupations.js 的 getRolesForTrack 单一来源；
            scada-engineer 因认证归属会出现在 plc 方向下（刻意设计）。 */}
        {roles && roles.length > 0 && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>{u.rolesTitle}</h2>
            <div className={styles.industryLinks}>
              {roles.map((r) => (
                <Link
                  key={r.role}
                  href={`/occupations/${r.role}`}
                  className={styles.industryLink}
                >
                  {(r.name[lang] || r.name.en)} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}

// 四个方向静态预渲染。
export async function getStaticPaths() {
  return {
    paths: TRACK_SLUGS.map((track) => ({ params: { track } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (!TRACKS[params.track]) return { notFound: true };
  // 常见职位名带数据：构建期动态引 lib/occupations.js（单一来源），
  // 避免顶层 import 把职业内容数据一并打进本页客户端 bundle。
  const { getRolesForTrack } = await import('../../lib/occupations.js');
  return {
    props: {
      track: params.track,
      // 行业子页入口链数据（构建期从 lib/hireMatrix 单一来源取，防手写清单漂移）
      industries: getIndustriesForTrack(params.track),
      roles: getRolesForTrack(params.track),
    },
  };
}
