import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useLang } from '../../hooks/useLang';
import { getAllPlaybookSlugs, getPlaybookBySlug } from '../../lib/playbook';
import styles from './playbook.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 文末 CTA 文案：按文章语言选择（en/zh）。
const CTA = {
  en: {
    heading: 'Ready to hire verified automation engineers?',
    body: 'Post a project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    btn: 'Browse Engineers →',
    back: 'All guides',
  },
  zh: {
    heading: '准备好雇佣经过验证的自动化工程师了吗？',
    body: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    btn: '浏览工程师 →',
    back: '全部指南',
  },
};

export default function PlaybookArticle({ article }) {
  const [lang, setLang] = useLang();
  const cta = CTA[article.lang] || CTA.en;

  const canonical = `${SITE}/playbook/${article.slug}`;
  const ogImage = `${SITE}/og.png`;

  // Article 结构化数据，帮助搜索引擎理解这是一篇文章。
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: article.lang,
    datePublished: article.date || undefined,
    image: ogImage,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    author: { '@type': 'Organization', name: 'Talengineer' },
    publisher: {
      '@type': 'Organization',
      name: 'Talengineer',
      logo: { '@type': 'ImageObject', url: `${SITE}/icon-192.png` },
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${article.title} | Talengineer`}</title>
        <meta name="description" content={article.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <article className={styles.articleWrap}>
        <div className={styles.breadcrumb}>
          <Link href="/playbook">{cta.back}</Link> ／ {article.title}
        </div>

        {article.date && <div className={styles.articleMeta}>{article.date}</div>}

        {/* marked 已把 markdown 渲染成受控的 HTML；内容来自仓库内的静态文件，非用户输入。 */}
        <div
          className={styles.article}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        <div className={styles.ctaBox}>
          <h3>{cta.heading}</h3>
          <p>{cta.body}</p>
          <Link href="/talent" className={styles.ctaBtn}>{cta.btn}</Link>
        </div>
      </article>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link> ·{' '}
          <Link href="/playbook">Playbook</Link>
        </p>
      </footer>
    </div>
  );
}

// 构建期枚举全部文章 slug，为每篇预渲染静态页。
export async function getStaticPaths() {
  return {
    paths: getAllPlaybookSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

// 构建期取单篇文章（含渲染好的 HTML）。找不到则 404。
export async function getStaticProps({ params }) {
  const article = getPlaybookBySlug(params.slug);
  if (!article) return { notFound: true };
  return { props: { article } };
}
