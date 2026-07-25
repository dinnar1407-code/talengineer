import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { getLegalDoc } from '../lib/legal';
// 页面外壳文案（en/zh）字典：已迁至 lib/i18n/terms.js（2026-07-24 机械搬移）
import { DICT as UI } from '../lib/i18n/terms';
import styles from './legal.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function Terms({ docs }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  // 正文按导航语言取，该语言译文缺失时回退 en（2026-07-24 九语铺开：docs 现覆盖
  // 全部 9 种站点语言，取值惯用式改用通用 docs[lang] || docs.en，不再只硬编码 zh）。
  // SSR 首帧 lang='en'（useLang 客户端才生效），因此首帧必然是合法英文，符合站点 SSR 约定。
  const doc = docs[lang] || docs.en;

  // noindex 门控：任一语言版本仍是草稿，就整页 noindex。
  // Terry 法务终审通过后把所有语言 md 的 draft 翻成 false，横幅与 noindex 自动消失，
  // sitemap 侧同样按 draft 守卫收录——发布动作只有"翻 draft"这一个开关（计划 §B1）。
  const anyDraft = Object.values(docs).some((d) => d.draft);

  const canonical = `${SITE}/terms`;
  const ogImage = `${SITE}/og.png`;

  // WebPage 结构化数据：法务文档不是文章（无作者叙事），用最朴素的 WebPage 类型。
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: doc.title,
    description: doc.description,
    inLanguage: doc.lang,
    dateModified: doc.date || undefined,
    url: canonical,
    publisher: { '@type': 'Organization', name: 'Talengineer', url: SITE },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${doc.title} | Talengineer`}</title>
        <meta name="description" content={doc.description} />
        {/* 草稿期 robots noindex：法务草稿未经终审前不得被搜索引擎收录（计划 §B1 红线）。 */}
        {anyDraft && <meta name="robots" content="noindex" />}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={doc.title} />
        <meta property="og:description" content={doc.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={doc.title} />
        <meta name="twitter:description" content={doc.description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{doc.title}</h1>
          <p className={styles.heroSub}>{doc.description}</p>
          {doc.date && <p className={styles.heroDate}>{u.updated}: {doc.date}</p>}
        </div>
      </div>

      <div className={styles.container}>
        {/* 草稿横幅：draft:true 期间始终显示，提醒任何看到这页的人这还不是定稿。 */}
        {anyDraft && <div className={styles.draftBanner}>{u.draftBanner}</div>}

        {/* 正文：marked 渲染自仓库内静态 markdown（非用户输入），注入是安全的。 */}
        <div className={styles.article} dangerouslySetInnerHTML={{ __html: doc.html }} />

        {/* terms ↔ privacy 交叉链接（任务规格要求两页互链） */}
        <div className={styles.crossCard}>
          <p className={styles.crossLabel}>{u.crossLabel}</p>
          <Link href="/privacy" className={styles.crossLink}>{u.crossLink}</Link>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 站点九语清单（与 lib/legal.js LANGS / hooks/useLang.js SUPPORTED 同口径）。
const ALL_LANGS = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];

// 构建期一次性读入九语服务条款（语言切换在客户端，页面只有一条静态路由）。
// 2026-07-24 九语铺开：从固定 en/zh 两语改为遍历 ALL_LANGS，缺译的语言（当前应无）
// 直接跳过——渲染侧 docs[lang] || docs.en 兜底，不会因为某语言缺文件而构建失败。
export async function getStaticProps() {
  const docs = {};
  for (const lang of ALL_LANGS) {
    const d = getLegalDoc('terms', lang);
    if (d) docs[lang] = d;
  }
  // en 缺失属于内容仓库损坏：构建期直接炸出来比线上空页面好（与 whitepaper 同一纪律）。
  if (!docs.en) throw new Error('[terms] content/legal/terms.en.md is missing');
  return { props: { docs } };
}
