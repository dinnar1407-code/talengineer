import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './how-it-works.module.css';
import { DICT as UI } from '../lib/i18n/how-it-works';

// 站点根 URL：canonical / OG 用（与 /hire/[track]、/pricing、/trust 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function HowItWorks() {
  const [lang, setLang] = useLang();
  // SSR 首帧英文规则：服务端不知道用户语言，先渲染英文；客户端水合后 useLang 读
  // localStorage 再切换。非 en/zh 语言回退英文（`|| en`），与全站约定一致。
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/how-it-works`;
  const ogImage = `${SITE}/og.png`;

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定（照 pages/pricing.jsx 的 faqJsonLd 先例）。
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UI.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // 步骤时间线子组件：竖排编号步骤（雇主 6 步 / 工程师 5 步 / 纠纷 4 步共用）。
  // 纯展示、无状态，放在页面组件内即可（单页私用，不值得抽成全局组件）。
  function StepList({ steps }) {
    return (
      <ol className={styles.stepList}>
        {steps.map((s) => (
          <li key={s.n} className={styles.stepItem}>
            <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
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
        {/* ── 开篇：为什么流程长这样 ───────────────────────────────────── */}
        <div className={styles.block}>
          <p className={styles.lead}>{t.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.lead2}</p>
        </div>

        {/* ── 雇主 6 步流 ─────────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.empTag}</span>
          <h2 className={styles.sectionTitle}>{t.empTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.empLead}</p>
          <StepList steps={t.empSteps} />
        </div>

        {/* ── 工程师 5 步流 ───────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.engTag}</span>
          <h2 className={styles.sectionTitle}>{t.engTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.engLead}</p>
          <StepList steps={t.engSteps} />
        </div>

        {/* ── 质量三闸：每张卡链接到各自的深入页面 ─────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.gatesTag}</span>
          <h2 className={styles.sectionTitle}>{t.gatesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.gatesLead}</p>
          <div className={styles.gateGrid}>
            {t.gates.map((g) => (
              <div key={g.href} className={styles.gateCard}>
                <div className={styles.gateIcon} aria-hidden="true">{g.icon}</div>
                <div className={styles.gateTitle}>{g.title}</div>
                <p className={styles.gateDesc}>{g.desc}</p>
                <Link href={g.href} className={styles.gateLink}>{g.linkLabel}</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── 纠纷路径（措辞对齐 /trust，细节链接过去）─────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.dispTag}</span>
          <h2 className={styles.sectionTitle}>{t.dispTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.dispLead}</p>
          <StepList steps={t.dispSteps} />
          <p className={styles.note}>
            {t.dispNote}{' '}
            <Link href="/trust" className={styles.inlineLink}>{t.dispLink}</Link>
          </p>
        </div>

        {/* ── FAQ（与 /pricing FAQ 零重复：那边讲钱，这边讲流程）─────────── */}
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

      {/* 全站共享页脚（数据来自 lib/navConfig，与顶部导航共用同一链接注册表） */}
      <Footer lang={lang} />
    </div>
  );
}
