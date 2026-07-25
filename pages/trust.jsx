import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as UI } from '../lib/i18n/trust';
import styles from './trust.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track]、/pricing 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function Trust() {
  const [lang, setLang] = useLang();
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/trust`;
  const ogImage = `${SITE}/og.png`;

  // 四步流程组件：水平流（带箭头），移动端自动换行、箭头转竖向（CSS 控制）。
  // 不用图片，纯 CSS + 语义 token 画流程。
  function Flow({ steps }) {
    return (
      <div className={styles.flowRow}>
        {steps.map((s, i) => (
          <div key={s.n} className={styles.flowItem}>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon} aria-hidden="true">{s.icon}</div>
              <div className={styles.flowNum}>{s.n}</div>
              <div className={styles.flowTitle}>{s.title}</div>
              <p className={styles.flowDesc}>{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={styles.flowArrow} aria-hidden="true">→</div>
            )}
          </div>
        ))}
      </div>
    );
  }

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
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero：信任是基建不是口号 ──────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 托管资金流四步 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.escrowTag}</span>
          <h2 className={styles.sectionTitle}>{t.escrowTitle}</h2>
          <p className={styles.lead}>{t.escrowLead}</p>
          <Flow steps={t.escrowSteps} />
        </div>

        {/* ── 纠纷与退款流程 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.disputeTag}</span>
          <h2 className={styles.sectionTitle}>{t.disputeTitle}</h2>
          <p className={styles.lead}>{t.disputeLead}</p>
          <Flow steps={t.disputeSteps} />
          <p className={styles.note}>{t.disputeNote}</p>
        </div>

        {/* ── 身份与合规核验 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.verifyTag}</span>
          <h2 className={styles.sectionTitle}>{t.verifyTitle}</h2>
          <p className={styles.lead}>{t.verifyLead}</p>
          <div className={styles.infoGrid}>
            {t.verifyCards.map((c) => (
              <div key={c.title} className={styles.infoCard}>
                <div className={styles.infoIcon} aria-hidden="true">{c.icon}</div>
                <div className={styles.infoTitle}>{c.title}</div>
                <div className={styles.infoMeta}>{c.meta}</div>
                <p className={styles.infoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 现场交付证据链 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.fieldTag}</span>
          <h2 className={styles.sectionTitle}>{t.fieldTitle}</h2>
          <p className={styles.lead}>{t.fieldLead}</p>
          <div className={styles.infoGrid}>
            {t.fieldCards.map((c) => (
              <div key={c.title} className={styles.infoCard}>
                <div className={styles.infoIcon} aria-hidden="true">{c.icon}</div>
                <div className={styles.infoTitle}>{c.title}</div>
                <div className={styles.infoMeta}>{c.meta}</div>
                <p className={styles.infoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
          {/* 诚实空态：founding 叙事，不编造成交统计 */}
          <p className={styles.cohortNote}>{t.cohortNote}</p>
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
