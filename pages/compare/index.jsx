// ── 对比页索引（/compare）────────────────────────────────────────────────────
// 四个对比的入口。每张卡直接把该页的「一句话回答」露出来——索引页本身也应该能回答问题，
// 而不是只做一排链接。
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { DICT, COMPARISONS, SLUGS } from '../../lib/i18n/compare';
import { pageJsonLd } from '../../lib/jsonLd';
import styles from './compare.module.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 结构化数据固定英文（理由见 lib/jsonLd.js）：CollectionPage + 四个成员页
const JSON_LD = pageJsonLd({
  path: '/compare',
  type: 'CollectionPage',
  name: DICT.en.indexTitle,
  description: DICT.en.indexSub,
  extra: {
    hasPart: SLUGS.map((s) => ({
      '@type': 'WebPage',
      name: COMPARISONS.en[s].question,
      url: `${SITE}/compare/${s}`,
    })),
  },
});

export default function CompareIndex() {
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en;
  const canonical = `${SITE}/compare`;

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${d.indexTitle} | Talengineer`}</title>
        <meta name="description" content={d.indexSub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={d.indexTitle} />
        <meta property="og:description" content={d.indexSub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <main className={styles.main}>
        <p className={styles.kicker}>{d.kicker}</p>
        <h1 className={styles.h1}>{d.indexTitle}</h1>
        <p className={styles.indexSub}>{d.indexSub}</p>

        <div className={styles.cards}>
          {SLUGS.map((s) => {
            const c = (COMPARISONS[lang] && COMPARISONS[lang][s]) || COMPARISONS.en[s];
            return (
              <Link key={s} href={`/compare/${s}`} className={styles.card}>
                <h2 className={styles.cardTitle}>{c.question}</h2>
                {/* 卡片直接露出该页的一句话回答（截断），索引页本身也要能回答问题 */}
                <p className={styles.cardBody}>{c.answer}</p>
                <span className={styles.cardCta}>{d.indexRead} →</span>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
