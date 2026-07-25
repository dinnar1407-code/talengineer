import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './about.module.css';
import { DICT } from '../lib/i18n/about';

// 站点根 URL：canonical / OG 用（照 /hire/[track] 房型模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function About() {
  const [lang, setLang] = useLang();
  // 全站约定：只有 en/zh 有全量文案，其余语言回退英文（SSR 首帧也是英文）。
  const d = DICT[lang] || DICT.en;

  const canonical = `${SITE}/about`;
  const ogImage = `${SITE}/og.png`;

  // Organization 结构化数据：告诉搜索引擎/AI 引擎"这是平台主体介绍页"。
  // 只声明可核实的事实（名称/域名/logo/联系邮箱/定位描述），
  // 不写 foundingDate、numberOfEmployees、address 等未确认的实体字段（诚实红线）。
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Talengineer',
    url: SITE,
    logo: `${SITE}/img/logo-macaw.svg`,
    email: 'hello@talengineer.us',
    description: d.sub,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@talengineer.us',
      contactType: 'customer support',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── 使命 Hero ─────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{d.kicker}</p>
          <h1 className={styles.heroTitle}>{d.title}</h1>
          <p className={styles.heroSub}>{d.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 我们在建什么 ─────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.missionTitle}</h2>
          <p className={styles.lead}>{d.mission1}</p>
          <p className={styles.lead}>{d.mission2}</p>
          <p className={styles.lead}>{d.mission3}</p>
        </div>

        {/* ── 方法论三卡：AI 筛选 / 认证指派门 / 公开 TalScore ─────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.methodTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.methodIntro}</p>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardStep}>01</div>
              <h3 className={styles.cardTitle}>{d.card1Title}</h3>
              <p className={styles.cardBody}>{d.card1Body}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardStep}>02</div>
              <h3 className={styles.cardTitle}>{d.card2Title}</h3>
              <p className={styles.cardBody}>{d.card2Body}</p>
              <Link href="/certification" className={styles.cardLink}>{d.card2Link}</Link>
            </div>
            <div className={styles.card}>
              <div className={styles.cardStep}>03</div>
              <h3 className={styles.cardTitle}>{d.card3Title}</h3>
              <p className={styles.cardBody}>{d.card3Body}</p>
              <Link href="/talscore" className={styles.cardLink}>{d.card3Link}</Link>
            </div>
          </div>
        </div>

        {/* ── founding 阶段诚实叙事 ────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.stageTitle}</h2>
          <p className={styles.lead}>{d.stage1}</p>
          <p className={styles.lead}>{d.stage2}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.stage3}</p>
          <Link href="/pricing" className={styles.inlineLink}>{d.stageLink}</Link>
        </div>

        {/*
          ── 实体信息占位槽（Terry 后补，勿删）───────────────────────────
          法人主体名称 / 注册地 / 经营地址等实体信息由 Terry 确认后再启用。
          启用方式：取消下方注释，并在 DICT 的 en/zh 两份里补上
          entityTitle / entityBody 文案（诚实红线：只写经核实的实体事实）。

          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>{d.entityTitle}</h2>
            <p className={styles.lead}>{d.entityBody}</p>
          </div>
        */}

        {/* ── 联系块 ───────────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.contactTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.contactBody}</p>
          <p className={styles.contactRow}>
            <span className={styles.contactLabel}>{d.contactEmailLabel}</span>
            <a href="mailto:hello@talengineer.us" className={styles.contactEmail}>
              hello@talengineer.us
            </a>
          </p>
          <Link href="/contact" className={styles.inlineLink}>{d.contactPageLink}</Link>
        </div>
      </div>

      {/* ── 底部 CTA ─────────────────────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{d.ctaHeading}</h2>
        <p>{d.ctaBody}</p>
        <div className={styles.ctaBtns}>
          <Link href="/talent" className={styles.btnPrimary}>{d.ctaPost}</Link>
          <Link href="/talent" className={styles.btnGhost}>{d.ctaApply}</Link>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
