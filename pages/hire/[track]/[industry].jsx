import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useLang } from '../../../hooks/useLang';
import { REGIONS, getMatrixPaths, hasMatrixEntry, getMatrixPage } from '../../../lib/hireMatrix';
import styles from './industry.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// UI 标签（章节标题、按钮等），en/zh 两套——与 /hire/[track] 同口径。
const UI = {
  en: {
    home: 'Hire',
    heroApply: 'Apply as an Engineer',
    heroPost: 'Post a Project — Free',
    painTitle: 'Why this industry is different',
    skillsTitle: 'Skills we screen for',
    verifyTitle: 'What platform certification verifies',
    verifyIntro:
      'Every engineer passes a practical AI technical screener before they can be matched. On top of that, they can earn certification in this track at three levels — and only certified engineers can be assigned to your project.',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    ratesNote:
      'Blended hourly rates from active engineer profiles, updated in real time, aligned with our /rates benchmarks. Development work sits toward the middle of each range; on-site commissioning carries a premium. Platform escrow fee is 15% (5% for founding customers).',
    linksTitle: 'Explore related talent',
    linksSameTrack: 'Same specialty · other industries',
    linksSameIndustry: 'Same industry · other specialties',
    linksMore: 'More',
    allTrack: 'All',
    talentLink: 'engineers',
    rates: 'Rate benchmarks',
    pricing: 'Pricing & escrow',
    certification: 'Certification',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    l1: 'L1 — Fundamentals',
    l2: 'L2 — Independent',
    l3: 'L3 — Expert',
  },
  zh: {
    home: '招募',
    heroApply: '以工程师身份申请',
    heroPost: '免费发布项目',
    painTitle: '这个行业为什么不一样',
    skillsTitle: '我们筛选的技能',
    verifyTitle: '平台认证验证什么',
    verifyIntro:
      '每位工程师在被匹配前都要通过一套实操型 AI 技术筛选。在此之上，还可在该方向考取三个级别的认证——只有持证工程师才能被指派到你的项目。',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    ratesNote:
      '来自活跃工程师档案的综合时薪，实时更新，与 /rates 基准同源。开发类工作位于各区间中段，现场调试有溢价。平台托管费为 15%（founding 客户 5%）。',
    linksTitle: '探索相关人才',
    linksSameTrack: '同方向 · 其他行业',
    linksSameIndustry: '同行业 · 其他方向',
    linksMore: '更多',
    allTrack: '查看全部',
    talentLink: '工程师',
    rates: '费率基准',
    pricing: '定价与托管',
    certification: '认证',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    l1: 'L1 — 基础',
    l2: 'L2 — 独立',
    l3: 'L3 — 专家',
  },
};

export default function HireIndustry({ data }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  const c = data.content[lang] || data.content.en;
  const levels = data.levels[lang] || data.levels.en;
  const trackLabel = data.trackLabel[lang] || data.trackLabel.en;
  const kicker = `${data.trackKicker[lang] || data.trackKicker.en} · ${data.industryName[lang] || data.industryName.en}`;

  const canonical = `${SITE}/hire/${data.track}/${data.industry}`;
  const ogImage = `${SITE}/og.png`;

  // Service 结构化数据：带行业的 serviceType，告诉搜索引擎这是"某方向×某行业招募"服务页。
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: data.serviceType,
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

      {/* 面包屑：招募 → 母方向页 → 当前行业 */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/talent">{u.home}</Link>
        <span className={styles.sep}>/</span>
        <Link href={`/hire/${data.track}`}>{trackLabel}</Link>
        <span className={styles.sep}>/</span>
        <span>{data.industryName[lang] || data.industryName.en}</span>
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{kicker}</p>
          <h1 className={styles.heroTitle}>{c.title}</h1>
          <p className={styles.heroSub}>{c.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 行业痛点段（行业专属，非空话） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.painTitle}</h2>
          <p className={styles.lead}>{c.pain1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{c.pain2}</p>
        </div>

        {/* 该方向 + 行业专属技能标签 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.skillsTitle}</h2>
          <div className={styles.chips}>
            {data.skills.map((s) => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
          </div>
        </div>

        {/* 认证等级说明 L1-L3 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.verifyTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.verifyIntro}</p>
          <div className={styles.levelGrid}>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l1}</div>
              <p className={styles.levelDesc}>{levels.l1}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l2}</div>
              <p className={styles.levelDesc}>{levels.l2}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l3}</div>
              <p className={styles.levelDesc}>{levels.l3}</p>
            </div>
          </div>
        </div>

        {/* 各地区费率区间（与 /rates 同源） */}
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
          <p className={styles.note}>{u.ratesNote}</p>
        </div>

        {/* 内链区：同方向其他行业 + 同行业其他方向 + 母页/费率/定价/认证 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.linksTitle}</h2>
          <div className={styles.linkGroups}>
            {data.sameTrack.length > 0 && (
              <div className={styles.linkGroup}>
                <p className={styles.linkGroupTitle}>{u.linksSameTrack}</p>
                <div className={styles.linkList}>
                  {data.sameTrack.map((l) => (
                    <Link
                      key={`${l.track}/${l.industry}`}
                      href={`/hire/${l.track}/${l.industry}`}
                      className={styles.linkItem}
                    >
                      {l.name[lang] || l.name.en} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {data.sameIndustry.length > 0 && (
              <div className={styles.linkGroup}>
                <p className={styles.linkGroupTitle}>{u.linksSameIndustry}</p>
                <div className={styles.linkList}>
                  {data.sameIndustry.map((l) => (
                    <Link
                      key={`${l.track}/${l.industry}`}
                      href={`/hire/${l.track}/${l.industry}`}
                      className={styles.linkItem}
                    >
                      {l.name[lang] || l.name.en} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.linkGroup}>
              <p className={styles.linkGroupTitle}>{u.linksMore}</p>
              <div className={styles.linkList}>
                <Link href={`/hire/${data.track}`} className={styles.linkItem}>
                  {u.allTrack} {trackLabel} {u.talentLink} →
                </Link>
                <Link href="/rates" className={styles.linkItem}>{u.rates} →</Link>
                <Link href="/pricing" className={styles.linkItem}>{u.pricing} →</Link>
                <Link href="/certification" className={styles.linkItem}>{u.certification} →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link> ·{' '}
          <Link href="/pricing">Pricing</Link>
        </p>
      </footer>
    </div>
  );
}

// 8 个方向×行业组合静态预渲染。
export async function getStaticPaths() {
  return {
    paths: getMatrixPaths(),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { track, industry } = params;
  if (!hasMatrixEntry(track, industry)) return { notFound: true };
  return { props: { data: getMatrixPage(track, industry) } };
}
