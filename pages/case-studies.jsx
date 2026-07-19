import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './case-studies.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页内双语文案（en/zh）。
const T = {
  en: {
    title: 'Case Studies',
    metaDesc: 'Real, de-identified delivery stories from Talengineer projects. We are delivering the first cohort now — each completed project will be published here.',
    kicker: 'Case Studies',
    heroTitle: 'Real deliveries, published as they happen',
    heroSub: 'We are delivering the first projects with our founding customers right now. As each one completes, we will publish a de-identified case study here — with the details that actually matter, and nothing invented.',
    emptyTitle: 'The first cases are being written on the shop floor',
    emptyBody: 'We would rather show you nothing than show you a fabricated case. There are no demo stories on this page. The moment a founding project reaches its milestones, its story goes up here — verified, de-identified, and told from both sides.',
    skeletonTitle: 'What every published case will show',
    skeletonNote: 'Placeholder — the cards below outline the structure of a real case, not an actual project.',
    f1Label: 'Industry & site',
    f1Val: 'Sector, plant type, and country — de-identified',
    f2Label: 'The need',
    f2Val: 'What broke, what was being built, why it was urgent',
    f3Label: 'Time to match',
    f3Val: 'Hours from posted demand to a verified engineer assigned',
    f4Label: 'Milestones',
    f4Val: 'Number of milestones and the value band delivered under escrow',
    f5Label: 'Both voices',
    f5Val: 'A quote from the employer and from the engineer — with consent on record',
    f6Label: 'Proof',
    f6Val: 'De-identified on-site photos of the delivered work',
    ctaTitle: 'Want to be one of the first case studies?',
    ctaBody: 'Founding customers get the 5% platform fee (first 5 orders) and milestone escrow — first milestone not satisfied, full refund. Your project could be the first story on this page.',
    ctaBtn: 'Become a founding customer',
    ctaGhost: 'See how matching works',
  },
  zh: {
    title: '案例研究',
    metaDesc: '来自 Talengineer 真实项目的脱敏交付故事。我们正在交付首批项目——每一单完成后都会发布在这里。',
    kicker: '案例研究',
    heroTitle: '真实交付，完成一单发布一单',
    heroSub: '我们正在与 founding 客户交付首批项目。每完成一单，就会在这里发布一篇脱敏案例——只讲真正重要的细节，绝不编造。',
    emptyTitle: '首批案例正在车间里被书写',
    emptyBody: '我们宁可什么都不给你看，也不会给你看一个编造的案例。本页没有任何演示故事。只要一个 founding 项目达成里程碑，它的故事就会发布在这里——经过验证、脱敏，并由双方共同讲述。',
    skeletonTitle: '每篇发布的案例都会展示什么',
    skeletonNote: '占位示意——下面的卡片说明的是真实案例的结构，而非某个实际项目。',
    f1Label: '行业与现场',
    f1Val: '所属行业、工厂类型与国家——脱敏处理',
    f2Label: '需求',
    f2Val: '出了什么问题、在建什么、为何紧急',
    f3Label: '匹配耗时',
    f3Val: '从发布需求到指派持证工程师所用的小时数',
    f4Label: '里程碑',
    f4Val: '托管下交付的里程碑数量与金额区间',
    f5Label: '双方之声',
    f5Val: '雇主与工程师各一段引语——授权记录在案',
    f6Label: '交付佐证',
    f6Val: '交付成果的脱敏现场照片',
    ctaTitle: '想成为首批案例之一吗？',
    ctaBody: 'Founding 客户享 5% 平台费（前 5 单）与里程碑托管——首个里程碑不满意，全额退款。你的项目，可能就是这一页上的第一个故事。',
    ctaBtn: '成为 founding 客户',
    ctaGhost: '了解匹配如何运作',
  },
};

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

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/pricing">Pricing</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link>
        </p>
      </footer>
    </div>
  );
}
