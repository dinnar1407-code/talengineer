import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { getAllPlaybookMeta } from '../lib/playbook';
import { getWhitepaper } from '../lib/whitepaper';
import { getOccupationPaths, getOccupationPage } from '../lib/occupations';
import styles from './resources.module.css';
import { DICT } from '../lib/i18n/resources';

// 站点根 URL：canonical / OG 用。构建期从环境变量读，回退线上域名。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export default function Resources({ latest, marketArticles, roles, whitepaper }) {
  const [lang, setLang] = useLang();
  // SSR 首帧英文规则：useLang 初值 'en'，服务端渲染出合法英文页；
  // 客户端水合后按 localStorage 切到用户语言，与全站 `|| en` 约定一致。
  const d = DICT[lang] || DICT.en;

  const pageTitle = 'Resource Hub — Guides, Market Data & Platform Mechanics | Talengineer';
  const pageDesc =
    'All Talengineer resources in one place: the automation hiring Playbook, live rate benchmarks and coverage data, role-by-role hiring guides, country guides, and the platform mechanics pages.';
  const canonical = `${SITE}/resources`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage 结构化数据：告诉搜索引擎这是一个"资源集合"枢纽页，
  // hasPart 列出各策展分区背后的核心落点页（只列站内一级入口，不逐篇列文章）。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Talengineer', url: SITE },
    hasPart: [
      { '@type': 'WebPage', name: 'Automation Hiring Playbook', url: `${SITE}/playbook` },
      { '@type': 'WebPage', name: 'Rate Benchmarks', url: `${SITE}/rates` },
      { '@type': 'WebPage', name: 'Cost Calculator', url: `${SITE}/calculator` },
      { '@type': 'WebPage', name: 'Engineer Coverage Map', url: `${SITE}/coverage` },
      { '@type': 'WebPage', name: 'Hire by Specialty & Industry', url: `${SITE}/hire` },
      { '@type': 'WebPage', name: 'Hire by Role Title', url: `${SITE}/occupations` },
      { '@type': 'WebPage', name: 'Country Hiring Guides', url: `${SITE}/guides` },
      { '@type': 'WebPage', name: 'How It Works', url: `${SITE}/how-it-works` },
      { '@type': 'WebPage', name: 'Pricing', url: `${SITE}/pricing` },
      { '@type': 'WebPage', name: 'Trust Center', url: `${SITE}/trust` },
      { '@type': 'WebPage', name: 'TalScore', url: `${SITE}/talscore` },
      { '@type': 'WebPage', name: 'Certification Exams', url: `${SITE}/certification` },
      { '@type': 'WebPage', name: 'Case Studies', url: `${SITE}/case-studies` },
    ],
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{d.kicker}</p>
          <h1 className={styles.heroTitle}>{d.title}</h1>
          <p className={styles.heroSub}>{d.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 板块一：Playbook 最新文章（唯一的自动 feed，构建期 top 6）────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{d.playbookTitle}</h2>
            <Link href="/playbook" className={styles.viewAll}>{d.playbookViewAll}</Link>
          </div>
          <p className={styles.sectionIntro}>{d.playbookIntro}</p>
          <div className={styles.grid}>
            {latest.map((a) => (
              <Link key={a.slug} href={`/playbook/${a.slug}`} className={styles.card}>
                <span className={styles.cardMeta}>
                  {a.date && <span className={styles.cardDate}>{a.date}</span>}
                  <span className={styles.cardType}>{d.typeLabels[a.type] || a.type}</span>
                </span>
                <b className={styles.cardTitle}>{a.title}</b>
                <span className={styles.cardDesc}>{a.description}</span>
                <span className={styles.cardMore}>{d.read}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 板块二：市场数据（三张手工卡 + 自动过滤的 market-data 类文章）──────
            数字本身都在落点页上实时呈现，本板块只描述"数据从哪来"，不抄任何数字。 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{d.marketTitle}</h2>
          <p className={styles.sectionIntro}>{d.marketIntro}</p>
          <div className={styles.toolGrid}>
            {d.marketCards.map((c) => (
              <Link key={c.href} href={c.href} className={styles.toolCard}>
                <b className={styles.toolName}>{c.name}</b>
                <span className={styles.toolDesc}>{c.desc}</span>
                <span className={styles.cardMore}>{d.read}</span>
              </Link>
            ))}
          </div>
          {/* market-data 类文章自动带：getAllPlaybookMeta 构建期过滤，
              新市场月报落盘（非草稿）即自动出现在这里，零手工维护。 */}
          {marketArticles.length > 0 && (
            <div className={styles.articleList}>
              <b className={styles.articleListTitle}>{d.marketArticlesTitle}</b>
              {marketArticles.map((a) => (
                <Link key={a.slug} href={`/playbook/${a.slug}`} className={styles.articleRow}>
                  {a.date && <span className={styles.articleDate}>{a.date}</span>}
                  <span className={styles.articleTitle}>{a.title}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── 板块三：招聘指南（方向矩阵 + 职业页带 + 国别指南）────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{d.hiringTitle}</h2>
          <div className={styles.toolGrid}>
            <Link href={d.hireCard.href} className={styles.toolCard}>
              <b className={styles.toolName}>{d.hireCard.name}</b>
              <span className={styles.toolDesc}>{d.hireCard.desc}</span>
              <span className={styles.cardMore}>{d.read}</span>
            </Link>
            <Link href={d.guidesCard.href} className={styles.toolCard}>
              <b className={styles.toolName}>{d.guidesCard.name}</b>
              <span className={styles.toolDesc}>{d.guidesCard.desc}</span>
              {/* 三国名并排展示（整卡链接到 /guides 索引，索引页再分流到国别页） */}
              <span className={styles.cardMore}>
                {['mexico', 'vietnam', 'thailand'].map((g, i) => (
                  <span key={g}>
                    {i > 0 && ' · '}
                    {d.guideNames[g]}
                  </span>
                ))}
                {' →'}
              </span>
            </Link>
          </div>
          {/* 职业页带：数据来自 lib/occupations 构建期枚举（单一来源，新增职业自动出现） */}
          <div className={styles.pillBlock}>
            <b className={styles.pillLabel}>{d.rolesLabel}</b>
            <div className={styles.pillRow}>
              {roles.map((r) => (
                <Link key={r.slug} href={`/occupations/${r.slug}`} className={styles.pill}>
                  {(r.name[lang] || r.name.en)}
                </Link>
              ))}
              <Link href="/occupations" className={`${styles.pill} ${styles.pillAccent}`}>
                {d.rolesAll}
              </Link>
            </div>
          </div>
        </section>

        {/* ── 板块四：平台机制页群（数字单一来源页，本页只导航不抄数）────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{d.platformTitle}</h2>
          <p className={styles.sectionIntro}>{d.platformIntro}</p>
          <div className={styles.toolGrid}>
            {d.platformCards.map((c) => (
              <Link key={c.href} href={c.href} className={styles.toolCard}>
                <b className={styles.toolName}>{c.name}</b>
                <span className={styles.toolDesc}>{c.desc}</span>
                <span className={styles.cardMore}>{d.read}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 板块五：案例（founding 诚实口径，与 public/llms.txt 完全一致）───── */}
        <section className={styles.section}>
          <Link href="/case-studies" className={styles.wideCard}>
            <b className={styles.toolName}>{d.caseTitle}</b>
            <span className={styles.toolDesc}>{d.caseDesc}</span>
            <span className={styles.cardMore}>{d.caseCta}</span>
          </Link>
        </section>

        {/* ── 板块六：白皮书卡——仅在构建期 draft !== true 时渲染 ──────────────
            今天 content/whitepaper/en.md 是 draft: true，此卡整体隐藏；
            Terry 终审翻 draft: false 后，下一次构建自动出现，无需改本文件。 */}
        {whitepaper && (
          <section className={styles.section}>
            <Link href="/whitepaper" className={styles.wideCard}>
              <span className={styles.wpKicker}>{d.wpKicker}</span>
              <b className={styles.toolName}>{whitepaper.title}</b>
              <span className={styles.toolDesc}>{whitepaper.description}</span>
              <span className={styles.cardMore}>{d.wpCta}</span>
            </Link>
          </section>
        )}
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期取数：本页所有"自动"内容都在这里一次算好，运行时零请求。
export async function getStaticProps() {
  // 全部文章元数据（lib 已按日期倒序、已剔除草稿——发布门控在 lib 单点实现）。
  const meta = getAllPlaybookMeta();

  // 只往 props 里放页面用得到的字段，压小页面 JSON 体积。
  const trim = (m) => ({
    slug: m.slug,
    title: m.title,
    description: m.description,
    date: m.date,
    type: m.type,
  });

  // 自动 feed：最新 6 篇（en/zh 混排，各卡显示自己语言的标题，与 playbook 索引一致）。
  const latest = meta.slice(0, 6).map(trim);

  // 市场数据板块的自动文章带：按 taxonomy type 过滤，新月报落盘即自动收录。
  const marketArticles = meta.filter((m) => m.type === 'market-data').map(trim);

  // 职业页带：构建期从 lib/occupations 单一来源枚举，避免手写清单漂移。
  const roles = getOccupationPaths().map(({ params }) => {
    const page = getOccupationPage(params.role);
    return { slug: params.role, name: page.name };
  });

  // 白皮书卡的构建期门控：draft 为 true（今天的状态）则传 null，页面整卡不渲染。
  // 只透传标题/描述两个展示字段，不把整篇 HTML 塞进本页 props。
  const wp = getWhitepaper('en');
  const whitepaper =
    wp && wp.draft !== true ? { title: wp.title, description: wp.description } : null;

  return { props: { latest, marketArticles, roles, whitepaper } };
}
