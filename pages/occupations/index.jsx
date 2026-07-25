import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { DICT as UI } from '../../lib/i18n/occupations-index';
import styles from './occupations.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同一约定）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// UI 字典已迁至 lib/i18n/occupations-index.js（2026-07-24 架构 B）。

export default function OccupationsIndex({ groups }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/occupations`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage + ItemList 结构化数据：告诉搜索引擎这是 6 个职业页的目录页。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: groups
        .flatMap((g) => g.roles)
        .map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.name.en,
          url: `${SITE}/occupations/${r.role}`,
        })),
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${u.title} | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={u.title} />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={u.title} />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* 导语：解释"职位名 vs 认证方向"的映射逻辑 */}
        <div className={styles.block}>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.lead}</p>
        </div>

        {/* ── 按认证方向分组的职业卡（组标题链去方向母页）────────── */}
        {groups.map((g) => (
          <div key={g.track} className={styles.block}>
            <h2 className={styles.sectionTitle}>
              <Link href={`/hire/${g.track}`} className={styles.groupTitleLink}>
                {g.kicker[lang] || g.kicker.en}
              </Link>
            </h2>
            <div className={styles.roleGrid}>
              {g.roles.map((r) => (
                <Link key={r.role} href={`/occupations/${r.role}`} className={styles.roleCard}>
                  <div className={styles.roleName}>{r.name[lang] || r.name.en}</div>
                  <p className={styles.roleSub}>{r.sub[lang] || r.sub.en}</p>
                  <span className={styles.roleMore}>{u.viewRole} →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── 底部 CTA + 全站共享页脚 ───────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.ctaBtn}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期把 6 个职业按方向分组（数据全部来自 lib 单一来源，页面不手写清单）。
export async function getStaticProps() {
  const { getRolesForTrack, getOccupationPage } = await import('../../lib/occupations.js');
  const { getTrackMeta } = await import('../../lib/hireMatrix.js');

  // 方向展示顺序与 /hire/[track] 的 4 方向一致；scada-engineer 因认证归属
  // 会出现在 plc 组下（lib/occupations.js 的刻意设计，见其文件头注释）。
  const TRACK_ORDER = ['plc', 'robotics', 'vision', 'electrical'];

  const groups = TRACK_ORDER.map((track) => {
    const meta = getTrackMeta(track);
    return {
      track,
      kicker: meta.kicker,
      roles: getRolesForTrack(track).map(({ role, name }) => {
        // 卡片描述直接复用职业页 hero 的 sub（同一来源，不另写一份摘要）。
        const page = getOccupationPage(role);
        return { role, name, sub: { en: page.content.en.sub, zh: page.content.zh.sub } };
      }),
    };
  });

  return { props: { groups } };
}
