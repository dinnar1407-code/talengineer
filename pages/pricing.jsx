import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './pricing.module.css';
// 九语 UI 字典已抽到 lib/i18n/pricing.js（2026-07-24 架构 B：en/zh 逐字节原样搬移，
// 其余 7 语按 lib/i18n/glossary.js 术语表灌注）。取值仍用 UI[lang] || UI.en 惯用式
// （useLang 是客户端 hook，SSR 首帧必须是合法英文），完整性由 tests/i18nParity.test.js 守护。
import { DICT as UI } from '../lib/i18n/pricing';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function Pricing() {
  const [lang, setLang] = useLang();
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/pricing`;
  const ogImage = `${SITE}/og.png`;

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定（照 pages/index.jsx 的 faqJsonLd）。
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UI.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.metaTitle} />
        <meta name="twitter:description" content={t.metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero：透明定价宣言 ─────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{t.ctaApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 工程师侧（透明轨）───────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.engTag}</span>
          <h2 className={styles.sectionTitle}>{t.engTitle}</h2>
          <div className={styles.priceCard}>
            <div className={styles.priceTag}>{t.engFee}</div>
            <p className={styles.priceLabel}>{t.engFeeLabel}</p>
            <p className={styles.priceMeta}>{t.engKeepLabel}</p>
          </div>

          <h3 className={styles.subTitle}>{t.engWhyTitle}</h3>
          <div className={styles.valueGrid}>
            {t.engWhy.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon} aria-hidden="true">{v.icon}</div>
                <div className={styles.valueTitle}>{v.title}</div>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 雇主侧（founding 轨）────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.empTag}</span>
          <h2 className={styles.sectionTitle}>{t.empTitle}</h2>
          <div className={styles.priceRow}>
            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.priceTag}>{t.empFounding}</div>
              <p className={styles.priceLabel}>{t.empFoundingLabel}</p>
            </div>
            <div className={styles.priceCard}>
              <div className={styles.priceTag}>{t.empStandard}</div>
              <p className={styles.priceLabel}>{t.empStandardLabel}</p>
            </div>
          </div>
          <p className={styles.priceMeta}>{t.empUpfront}</p>
          <p className={styles.note}>{t.empFoundingNote}</p>

          <h3 className={styles.subTitle}>{t.escrowTitle}</h3>
          <div className={styles.stepRow}>
            {t.escrowSteps.map((s) => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 风险逆转承诺 ───────────────────────────────────────────── */}
        <div className={styles.block}>
          <div className={styles.riskBox}>
            <h2 className={styles.riskTitle}>{t.riskTitle}</h2>
            <p className={styles.riskSub}>{t.riskSub}</p>
            <div className={styles.riskPoints}>
              {t.riskPoints.map((p) => (
                <div key={p.title} className={styles.riskPoint}>
                  <div className={styles.riskCheck} aria-hidden="true">✓</div>
                  <div>
                    <div className={styles.riskPointTitle}>{p.title}</div>
                    <p className={styles.riskPointDesc}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 定价 FAQ ───────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
          <div className={styles.faqList}>
            {t.faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.q}</div>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底部 CTA ─────────────────────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSub}</p>
        <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
