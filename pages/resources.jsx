import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { getAllPlaybookMeta } from '../lib/playbook';
import { getWhitepaper } from '../lib/whitepaper';
import { getOccupationPaths, getOccupationPage } from '../lib/occupations';
import styles from './resources.module.css';

// 站点根 URL：canonical / OG 用。构建期从环境变量读，回退线上域名。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// ⚠️ 诚实红线说明（本页设计约束，改动前必读）：
// 1. 本页刻意不出现任何平台数字（费率、佣金比例、题量等）——所有数字都留在
//    各自拥有"单一来源"的页面上（/pricing←fees.js、/rates←实时档案数据、
//    /certification←training.js、/talscore←talScore.js）。资源枢纽只做导航与
//    结构性描述，避免成为数字漂移面。
// 2. 不做"500+ 资源"式的体量包装——站点内容还在早期积累阶段，页面按
//    "策展分区 + 一个自动 feed"组织，诚实于实际体量。
// 3. 案例卡使用 llms.txt 同款 founding 诚实口径（案例随每单完成逐篇发布），
//    白皮书卡仅在 content/whitepaper 的 draft 翻 false 后才渲染（构建期判定）。

// ── 语言字典（en/zh 两套全量文案；其余语言按全站约定 || en 回退）──────────
const DICT = {
  en: {
    kicker: 'Resource Hub',
    title: 'Guides, market data and platform mechanics — in one place',
    sub: 'Everything we have published so far, organized by what you are trying to do: benchmark rates, hire for a specific role, plan a cross-border build, or understand exactly how the platform works. New material is added as we write it — no filler.',

    // 板块一：Playbook 最新文章（构建期自动 top 6）
    playbookTitle: 'Latest from the Playbook',
    playbookIntro:
      'Practical, no-fluff guides on rates, hiring, certification and cross-border delivery for industrial automation projects. The six most recent articles are below.',
    playbookViewAll: 'View all Playbook articles →',
    read: 'Read →',
    typeLabels: { guide: 'Guide', 'market-data': 'Market Data', certification: 'Certification', case: 'Case Study' },

    // 板块二：市场数据（三张手工卡 + 自动过滤出的 market-data 类文章）
    marketTitle: 'Market data',
    marketIntro:
      'Live numbers aggregated from active engineer profiles on the platform — plus the articles we write when the data says something worth reading.',
    marketCards: [
      {
        href: '/rates',
        name: 'Rate Benchmarks',
        desc: 'Real-time hourly rate ranges for industrial automation talent by region and skill, sourced from active engineer profiles on Talengineer.',
      },
      {
        href: '/calculator',
        name: 'Cost Calculator',
        desc: 'Estimate what a verified, escrow-protected automation engineer costs on Talengineer versus hiring a local full-time engineer. Free, no signup required.',
      },
      {
        href: '/coverage',
        name: 'Coverage Map',
        desc: 'Where our engineers are — by region, TalScore tier and specialty. Aggregated in real time from active engineer profiles.',
      },
    ],
    marketArticlesTitle: 'Market-data articles',

    // 板块三：招聘指南（方向/行业矩阵 + 职业页带 + 国别指南）
    hiringTitle: 'Hiring guides',
    hireCard: {
      href: '/hire',
      name: 'Browse by specialty & industry',
      desc: 'Four certification tracks — PLC, robotics, machine vision and electrical — each with regional rate context and industry-specific pages underneath.',
    },
    rolesLabel: 'Hire by role title',
    rolesAll: 'All roles →',
    guidesCard: {
      href: '/guides',
      name: 'Country hiring guides',
      desc: 'Setting up production in Mexico, Vietnam or Thailand? Local rate context, certification and on-the-ground commissioning — read before you build.',
    },
    guideNames: { mexico: 'Mexico', vietnam: 'Vietnam', thailand: 'Thailand' },

    // 板块四：平台机制页（数字单一来源的解释页群）
    platformTitle: 'How the platform works',
    platformIntro:
      'The mechanics pages. Every number on them is written once, from a single source in the codebase — so what you read is what the platform actually does.',
    platformCards: [
      {
        href: '/how-it-works',
        name: 'How It Works',
        desc: 'The full walkthrough: how a project runs from posting to escrow release, for employers and for engineers — plus how quality is enforced and what happens in a dispute.',
      },
      {
        href: '/pricing',
        name: 'Pricing',
        desc: 'The complete fee schedule, published. What employers pay, what engineers keep, and the guarantee terms — with nothing hidden in a sales call.',
      },
      {
        href: '/trust',
        name: 'Trust Center',
        desc: 'How milestone escrow, identity verification, dispute handling and the other platform safeguards actually work.',
      },
      {
        href: '/talscore',
        name: 'TalScore',
        desc: 'How engineer reputation scores are computed — the inputs, the weights and the red lines. The formula is public.',
      },
      {
        href: '/certification',
        name: 'Certification Exams',
        desc: 'How platform certification works: tracks, levels and exam mechanics — and why only certified engineers can be assigned to projects.',
      },
    ],

    // 板块五：案例（founding 诚实口径，与 llms.txt 一致）
    caseTitle: 'Case studies',
    caseDesc:
      'Real, de-identified delivery stories from Talengineer projects. We are delivering the founding cohort now — each completed project is published here as it wraps. No composite or invented cases.',
    caseCta: 'Visit case studies →',

    // 板块六：白皮书（仅非草稿时渲染；文案来自 whitepaper frontmatter）
    wpKicker: 'Whitepaper',
    wpCta: 'Read the whitepaper →',
  },
  zh: {
    kicker: '资源中心',
    title: '指南、市场数据与平台机制，一站集齐',
    sub: '我们迄今发布的全部内容，按你的目的组织：对标费率、按职位招人、规划跨境建厂，或搞清平台到底如何运转。新内容随写随加——不注水。',

    playbookTitle: '实战指南·最新文章',
    playbookIntro:
      '关于费率、招聘、认证与跨境交付的实操型指南，专为工业自动化项目而写。下面是最新的六篇。',
    playbookViewAll: '查看全部实战指南 →',
    read: '阅读 →',
    typeLabels: { guide: '指南', 'market-data': '市场数据', certification: '认证解读', case: '案例' },

    marketTitle: '市场数据',
    marketIntro: '来自平台活跃工程师档案的实时聚合数据——以及当数据里有值得写的东西时，我们写下的文章。',
    marketCards: [
      {
        href: '/rates',
        name: '费率基准',
        desc: '按地区与技能实时展示工业自动化人才的时薪区间，数据来源于 Talengineer 平台的活跃工程师档案。',
      },
      {
        href: '/calculator',
        name: '成本计算器',
        desc: '估算在 Talengineer 上使用经过验证、托管保障的自动化工程师，与本地全职招聘相比的成本。免费，无需注册。',
      },
      {
        href: '/coverage',
        name: '工程师覆盖地图',
        desc: '我们的工程师分布在哪里——按地区、TalScore 等级与专业方向，基于活跃档案实时聚合。',
      },
    ],
    marketArticlesTitle: '市场数据类文章',

    hiringTitle: '招聘指南',
    hireCard: {
      href: '/hire',
      name: '按专业方向与行业浏览',
      desc: '四个认证方向——PLC、机器人、机器视觉、电气——每个方向下附地区费率背景与细分行业页面。',
    },
    rolesLabel: '按职位名招聘',
    rolesAll: '全部职位 →',
    guidesCard: {
      href: '/guides',
      name: '分国用人指南',
      desc: '要在墨西哥、越南或泰国建产线？当地费率背景、认证与落地调试——动工之前先读。',
    },
    guideNames: { mexico: '墨西哥', vietnam: '越南', thailand: '泰国' },

    platformTitle: '平台机制',
    platformIntro: '机制解释页群。上面的每个数字都只写一次、来自代码库的单一来源——你读到的就是平台实际的运转方式。',
    platformCards: [
      {
        href: '/how-it-works',
        name: '平台如何运转',
        desc: '全流程走读：一个项目从发布到托管放款如何推进——雇主视角与工程师视角，以及质量如何被把关、发生纠纷时会怎样。',
      },
      {
        href: '/pricing',
        name: '定价',
        desc: '完整费率表，全部公开。雇主付什么、工程师拿什么、保障条款是什么——没有任何藏在销售电话里的内容。',
      },
      {
        href: '/trust',
        name: '信任中心',
        desc: '里程碑托管、身份核验、纠纷处理及其他平台保障机制的实际运作方式。',
      },
      {
        href: '/talscore',
        name: 'TalScore 信誉分',
        desc: '工程师信誉分如何计算——输入项、权重与红线。公式全部公开。',
      },
      {
        href: '/certification',
        name: '认证考试',
        desc: '平台认证如何运作：方向、级别与考试机制——以及为什么只有持证工程师才能被指派到项目。',
      },
    ],

    caseTitle: '案例研究',
    caseDesc:
      '来自 Talengineer 真实项目、经过脱敏的交付故事。我们正在交付 founding 客户群——每完成一单就发布一篇。不做拼凑案例，不编造案例。',
    caseCta: '查看案例 →',

    wpKicker: '白皮书',
    wpCta: '阅读白皮书 →',
  },
};

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
