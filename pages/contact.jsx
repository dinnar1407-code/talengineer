import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './contact.module.css';
import { DICT } from '../lib/i18n/contact';

// 站点根 URL：canonical / OG 用（照 /hire/[track] 房型模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function Contact() {
  const [lang, setLang] = useLang();
  // 全站约定：只有 en/zh 有全量文案，其余语言回退英文（SSR 首帧也是英文）。
  const d = DICT[lang] || DICT.en;

  const canonical = `${SITE}/contact`;
  const ogImage = `${SITE}/og.png`;

  // ContactPage 结构化数据：标记这是平台的联系页，主实体指向 Organization
  // 及其唯一的公开联系邮箱（不写电话/地址等尚未公开的字段——诚实红线）。
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: d.title,
    description: d.sub,
    url: canonical,
    mainEntity: {
      '@type': 'Organization',
      name: 'Talengineer',
      url: SITE,
      email: 'hello@talengineer.us',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@talengineer.us',
        contactType: 'customer support',
      },
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${d.title} | Talengineer`}</title>
        <meta name="description" content={d.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={d.title} />
        <meta name="twitter:description" content={d.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{d.kicker}</p>
          <h1 className={styles.heroTitle}>{d.title}</h1>
          <p className={styles.heroSub}>{d.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 三张联系卡：邮箱 / 雇主发单 / 工程师入驻 ─────────────────── */}
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">✉️</div>
            <h2 className={styles.cardTitle}>{d.card1Title}</h2>
            <p className={styles.cardBody}>{d.card1Body}</p>
            {/* mailto 直达唯一公开邮箱 */}
            <a href="mailto:hello@talengineer.us" className={styles.cardCta}>
              {d.card1Cta}
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">🏭</div>
            <h2 className={styles.cardTitle}>{d.card2Title}</h2>
            <p className={styles.cardBody}>{d.card2Body}</p>
            <Link href="/talent" className={styles.cardCta}>{d.card2Cta}</Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">🛠️</div>
            <h2 className={styles.cardTitle}>{d.card3Title}</h2>
            <p className={styles.cardBody}>{d.card3Body}</p>
            <Link href="/talent" className={styles.cardCta}>{d.card3Cta}</Link>
          </div>
        </div>

        {/* ── 诚实预期块：不编 SLA，只说真人阅读+尽快回复 ─────────────── */}
        <div className={styles.expectBlock}>
          <h2 className={styles.sectionTitle}>{d.expectTitle}</h2>
          <p className={styles.lead}>{d.expectBody}</p>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
