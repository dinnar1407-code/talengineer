import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { getLegalDoc } from '../lib/legal';
import styles from './legal.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页面外壳文案（en/zh）。正文本身来自 content/legal/privacy.{en,zh}.md，
// 这里只放 kicker、草稿横幅、交叉链接等 UI 字串。
const UI = {
  en: {
    kicker: 'Legal',
    draftBanner: 'Draft — pending legal review. This page describes current practice honestly but is not yet the final legal text.',
    updated: 'Last updated',
    crossLabel: 'Also read how the marketplace itself works:',
    crossLink: 'Terms of Service →',
  },
  zh: {
    kicker: '法务',
    draftBanner: '草稿——待法务审核。本页如实描述当前实践，但还不是最终法律文本。',
    updated: '最近更新',
    crossLabel: '也请阅读市场本身的运作规则：',
    crossLink: '服务条款 →',
  },
};

export default function Privacy({ docs }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  // 正文按导航语言取，zh 缺失时回退 en。SSR 首帧 lang='en'（useLang 客户端才生效），
  // 因此首帧必然是合法英文，符合站点 SSR 约定。
  const doc = (lang === 'zh' && docs.zh) ? docs.zh : docs.en;

  // noindex 门控：任一语言版本仍是草稿，就整页 noindex。
  // 与 whitepaper 的手工注释不同，这里与 frontmatter 的 draft 联动（计划 §B1 裁定）：
  // Terry 法务终审通过后把两个 md 的 draft 翻成 false，横幅与 noindex 自动消失，
  // sitemap 侧同样按 draft 守卫收录——发布动作只有"翻 draft"这一个开关。
  const anyDraft = docs.en.draft || Boolean(docs.zh && docs.zh.draft);

  const canonical = `${SITE}/privacy`;
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

        {/* privacy ↔ terms 交叉链接（任务规格要求两页互链） */}
        <div className={styles.crossCard}>
          <p className={styles.crossLabel}>{u.crossLabel}</p>
          <Link href="/terms" className={styles.crossLink}>{u.crossLink}</Link>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期一次性读入 en/zh 两份隐私政策（语言切换在客户端，页面只有一条静态路由）。
export async function getStaticProps() {
  const en = getLegalDoc('privacy', 'en');
  const zh = getLegalDoc('privacy', 'zh');
  // en 缺失属于内容仓库损坏：构建期直接炸出来比线上空页面好（与 whitepaper 同一纪律）。
  if (!en) throw new Error('[privacy] content/legal/privacy.en.md is missing');
  return { props: { docs: { en, zh } } };
}
