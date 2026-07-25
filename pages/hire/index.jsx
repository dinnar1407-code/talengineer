import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { REGIONS, RATES_NOTE, getTrackMeta, getIndustriesForTrack } from '../../lib/hireMatrix';
import { getRolesForTrack } from '../../lib/occupations';
import { DICT as UI, TRACK_BLURBS } from '../../lib/i18n/hire-index';
import styles from './hire.module.css';
import ix from './hire-index.module.css';

// /hire 索引页：修复裸路径 404（此前只有 /hire/[track] 子页，/hire 本身无落点）。
// 结构 = hero → 平台机制导语 → 4 方向卡（含行业子链）→ 按职位名带 → 费率表 → 国别指南带 → CTA。
// 数据全部来自单一来源（lib/hireMatrix.js 的 TRACKS/MATRIX/REGIONS + lib/occupations.js），
// 页面自身不重抄任何数字或方向文案，杜绝多处漂移。

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同款写法）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四个方向的展示顺序（与导航 Specialties 菜单一致：plc → robotics → vision → electrical）。
const TRACK_ORDER = ['plc', 'robotics', 'vision', 'electrical'];

// 方向卡简介 TRACK_BLURBS 与页面 UI 字典已迁至 lib/i18n/hire-index.js（2026-07-24 架构 B）。

// 建厂用人指南跨链（与 /hire/[track] 的 GUIDES 同一组三国，slug 对应 /guides/[region] 路由）。
const GUIDES = [
  { slug: 'mexico', flag: '🇲🇽', name: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico', hi: 'मेक्सिको', fr: 'Mexique', de: 'Mexiko', ja: 'メキシコ', ko: '멕시코' } },
  { slug: 'vietnam', flag: '🇻🇳', name: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam', hi: 'वियतनाम', fr: 'Vietnam', de: 'Vietnam', ja: 'ベトナム', ko: '베트남' } },
  { slug: 'thailand', flag: '🇹🇭', name: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan', hi: 'थाईलैंड', fr: 'Thaïlande', de: 'Thailand', ja: 'タイ', ko: '태국' } },
];

export default function HireIndex({ tracks, roles }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/hire`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage 结构化数据：告诉搜索引擎这是"招聘方向"合集页，成员是四个方向页。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    hasPart: tracks.map((t) => ({
      '@type': 'WebPage',
      name: `Hire ${t.meta.label.en} Engineers`,
      url: `${SITE}/hire/${t.track}`,
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${UI.en.title} | Talengineer`}</title>
        <meta name="description" content={UI.en.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={UI.en.title} />
        <meta property="og:description" content={UI.en.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={UI.en.title} />
        <meta name="twitter:description" content={UI.en.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 平台机制导语：跨境用人的两大痛点 + 筛选/认证/托管三道机制 */}
        <div className={styles.block}>
          <p className={styles.lead}>{u.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.lead2}</p>
        </div>

        {/* 四个方向卡：kicker/名称/简介/技能 chips + 卡底"进入方向页"与行业子链 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.tracksTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.tracksIntro}</p>
          <div className={ix.trackGrid}>
            {tracks.map((t) => {
              const blurb = TRACK_BLURBS[t.track][lang] || TRACK_BLURBS[t.track].en;
              return (
                <div key={t.track} className={ix.trackCard}>
                  <p className={ix.trackKicker}>{t.meta.kicker[lang] || t.meta.kicker.en}</p>
                  <h3 className={ix.trackTitle}>{t.meta.label[lang] || t.meta.label.en}</h3>
                  <p className={ix.trackDesc}>{blurb}</p>
                  <div className={ix.trackChips}>
                    {t.meta.skills.map((s) => (
                      <span key={s} className={ix.trackChip}>{s}</span>
                    ))}
                  </div>
                  <div className={ix.trackFoot}>
                    <Link href={`/hire/${t.track}`} className={ix.trackMore}>{u.viewTrack}</Link>
                    {/* 行业垂直页子链：该方向下有矩阵组合才渲染（electrical 暂无，卡底只留方向链） */}
                    {t.industries.length > 0 && (
                      <div className={ix.trackIndustries}>
                        <span className={ix.trackIndustriesLabel}>{u.industriesLabel}</span>
                        {t.industries.map((i) => (
                          <Link
                            key={i.industry}
                            href={`/hire/${t.track}/${i.industry}`}
                            className={ix.trackIndustryLink}
                          >
                            {i.label[lang] || i.label.en}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 按职位名招募带：6 个 /occupations/* 职业页入口（数据来自 lib/occupations.js） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.rolesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.rolesIntro}</p>
          <div className={ix.roleStrip}>
            {roles.map((r) => (
              <Link key={r.role} href={`/occupations/${r.role}`} className={ix.roleLink}>
                {(r.name[lang] || r.name.en)} →
              </Link>
            ))}
          </div>
        </div>

        {/* 费率表：REGIONS 直接 import 渲染（与 /hire/[track] 及 /rates 同一唯一来源） */}
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

        {/* 国别指南带：把索引页流量引向 /guides/[region] 三国指南 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.guidesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.guidesBody}</p>
          <div className={styles.industryLinks}>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className={styles.industryLink}>
                {g.flag} {(g.name[lang] || g.name.en)} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期从单一来源拼装页面数据：方向元数据 + 各方向行业子页 + 六个职业页入口。
// 用 getStaticProps 而非模块顶层计算，保持与 /hire/[track] 一致的数据流（props 可序列化）。
export async function getStaticProps() {
  const tracks = TRACK_ORDER.map((track) => ({
    track,
    meta: getTrackMeta(track), // label/kicker/skills/levels（lib/hireMatrix TRACKS 单一来源）
    industries: getIndustriesForTrack(track), // 该方向下的行业垂直页（electrical 为空数组）
  }));

  // 六个职业页入口：按方向顺序展开（plc 3 个含 SCADA、robotics/vision/electrical 各 1 个）。
  const roles = TRACK_ORDER.flatMap((track) => getRolesForTrack(track));

  return { props: { tracks, roles } };
}
