import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as T } from '../lib/i18n/case-studies';
import { pageJsonLd } from '../lib/jsonLd';
import styles from './case-studies.module.css';

// 结构化数据（schema.org）。固定取 en 文案——JSON-LD 是给机器读的单一事实源，
// 跟着 UI 语言变会让同一个 @id 在不同语言下出现互相矛盾的描述。见 lib/jsonLd.js。
const JSON_LD = pageJsonLd({
  path: '/case-studies',
  type: 'CollectionPage',
  name: T.en.title,
  description: T.en.metaDesc,
});


// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页内双语文案（en/zh）已迁至 lib/i18n/case-studies.js（2026-07-24，架构 B 迁移）。
export default function CaseStudies() {
  const [lang, setLang] = useLang();
  const t = T[lang] || T.en;

  // 骨架卡字段（将来每单案例展示的维度）。这里只是结构说明，不含任何真实/编造数据。
  const fields = [
    { label: t.f1Label, val: t.f1Val },
    { label: t.f2Label, val: t.f2Val },
    { label: t.f3Label, val: t.f3Val },
    { label: t.f4Label, val: t.f4Val },
    { label: t.f5Label, val: t.f5Val },
    { label: t.f6Label, val: t.f6Val },
  ];

  const canonical = `${SITE}/case-studies`;
  const ogImage = `${SITE}/og.png`;

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${t.title} | Talengineer`}</title>
        <meta name="description" content={t.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.title} />
        <meta name="twitter:description" content={t.metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 诚实空态 ─────────────────────────────── */}
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>{t.emptyTitle}</h2>
          <p className={styles.emptyBody}>{t.emptyBody}</p>
        </div>

        {/* ── 案例卡骨架：说明将来每单展示什么 ───────── */}
        <div className={styles.skeletonBlock}>
          <h2 className={styles.sectionTitle}>{t.skeletonTitle}</h2>
          <p className={styles.skeletonNote}>{t.skeletonNote}</p>
          <div className={styles.skeletonGrid}>
            {fields.map((f) => (
              <div key={f.label} className={styles.skeletonCard}>
                <div className={styles.skeletonBar} aria-hidden="true" />
                <h3 className={styles.skeletonLabel}>{f.label}</h3>
                <p className={styles.skeletonVal}>{f.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底部 CTA：成为 founding 客户 ───────────────── */}
      <div className={styles.finalCta}>
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaBody}</p>
        <div className={styles.ctaBtns}>
          <Link href="/pricing" className={styles.btnPrimary}>{t.ctaBtn}</Link>
          <Link href="/playbook" className={styles.btnGhost}>{t.ctaGhost}</Link>
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
