import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getGuidePaths, getGuide } from '../../lib/regionGuides';
import styles from './guides.module.css';
import ix from './guides-index.module.css';

// /guides 索引页：修复裸路径 404（此前只有 /guides/[region] 详情页，/guides 本身无落点）。
// 结构 = hero → 跨境用人导语（结构性陈述，regionGuides 同款口径，零编造统计）→ 三国卡
// → 相关 Playbook 文章 → CTA。索引页只做 en/zh 两语（详情页保持四语——plan §B1 约定）。

// 站点根 URL：canonical / OG 用（与 /guides/[region] 同款写法）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 三国显示名（en/zh；索引页只做两语，与 [region].jsx 的 REGION_META 同源同名）。
const REGION_NAMES = {
  mexico: { en: 'Mexico', zh: '墨西哥' },
  vietnam: { en: 'Vietnam', zh: '越南' },
  thailand: { en: 'Thailand', zh: '泰国' },
};

// 语言代码 → 徽章显示文本（指南内容语言因地而异：墨西哥/越南四语、泰国两语）。
const LANG_BADGES = { en: 'EN', zh: '中文', es: 'ES', vi: 'VI' };

// 相关 Playbook 文章（手工策展：与建厂迁移主题直接相关的两篇；文章本体为中文，
// en 标签做英文释义并标注语言，避免英文读者点进去才发现是中文——诚实预期）。
const RELATED_ARTICLES = [
  {
    slug: 'mexico-factory-automation-hiring',
    title: {
      en: 'Finding automation engineers for a Mexico factory build',
      zh: '墨西哥建厂：自动化工程师怎么找',
    },
    meta: { en: 'Playbook guide · in Chinese', zh: 'Playbook 指南 · 中文' },
  },
  {
    slug: 'vietnam-production-line-migration',
    title: {
      en: 'Engineer staffing for a Vietnam production-line migration',
      zh: '越南产线迁移的工程师配置指南',
    },
    meta: { en: 'Playbook guide · in Chinese', zh: 'Playbook 指南 · 中文' },
  },
];

// 页面文案（en/zh 两套，其余语言回退 en——全站 `|| en` 约定，SSR 首帧英文）。
// 导语只写结构性事实（产能迁移方向、人才池增速跟不上产线落地速度、本地+跨境的组合解法），
// 与 lib/regionGuides.js 的口径一致，不出现任何编造的统计数字。
const UI = {
  en: {
    kicker: 'Country Guides',
    title: 'Country hiring guides for cross-border factory projects',
    sub: 'Where manufacturing capacity is moving, what the local automation talent pool actually looks like, and how to staff your line with a local core plus cross-border support.',
    heroPost: 'Post a Project — Free',
    heroBrowse: 'Browse engineers',
    blurbTitle: 'Why cross-border staffing is the hard part',
    blurb1:
      'Manufacturing capacity keeps relocating — nearshoring pulls investment into Mexico, and China-plus-one strategies push electronics and light manufacturing into Vietnam and Thailand. In every one of these destinations the same structural problem repeats: new lines are being stood up faster than the local pool of experienced PLC, robotics and machine-vision engineers can grow, and the engineers who do exist are usually already committed.',
    blurb2:
      'The usual fallback — flying engineers in from headquarters — is slow and expensive, and it meets language and time-zone friction on the floor. The durable answer is a local core supported across borders: local certified engineers for commissioning and day-to-day support, paired with remote or fly-in specialists when local depth runs out, coordinated in one project room and protected by milestone escrow. Each guide below breaks this down for one destination.',
    cardsTitle: 'Pick your destination',
    readGuide: 'Read the guide →',
    articlesTitle: 'From the Playbook',
    articlesIntro:
      'Deeper, article-length treatments of the same decisions — written for manufacturers planning a build or a line migration.',
    ctaHeading: 'Ready to staff your line?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers — local and cross-border. Milestone escrow protects both sides.',
  },
  zh: {
    kicker: '国别指南',
    title: '跨境建厂项目的分国用人指南',
    sub: '制造产能在往哪儿迁、当地自动化人才池的真实样貌，以及如何用"本地核心 + 跨境支持"为产线配人。',
    heroPost: '免费发布项目',
    heroBrowse: '浏览工程师',
    blurbTitle: '为什么跨境用人才是难点',
    blurb1:
      '制造产能仍在持续迁移——近岸外包(nearshoring)把投资涌向墨西哥，"中国+1"策略把电子与轻工制造推向越南与泰国。在每个目的地，同一个结构性问题都在重演：新产线落地的速度，快于当地有经验的 PLC、机器人、机器视觉工程师池的增长，而现有的人手大多已被占满。',
    blurb2:
      '常见的退路——从总部空运工程师过去——既慢又贵，到了现场还撞上语言与时区的摩擦。经得起时间考验的答案，是有跨境支持的本地核心：本地持证工程师负责调试与日常支持，本地深度不够时搭配远程或飞抵的专家，在同一个项目间协同，并由里程碑托管保障。下面每篇指南，把这套思路落到一个具体目的地。',
    cardsTitle: '选择目的地',
    readGuide: '阅读指南 →',
    articlesTitle: '来自 Playbook',
    articlesIntro: '同一批决策的文章级深度展开——写给正在规划建厂或产线迁移的制造企业。',
    ctaHeading: '准备好为产线配人了吗？',
    ctaBody: '发布项目，与经过预审、持证的本地与跨境工程师精准匹配。里程碑托管保障双方权益。',
  },
};

export default function GuidesIndex({ guides }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/guides`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage 结构化数据：三篇国别指南的合集页。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    hasPart: guides.map((g) => ({
      '@type': 'WebPage',
      name: g.card.en.title,
      url: `${SITE}/guides/${g.region}`,
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${UI.en.title} | Talengineer`}</title>
        <meta name="description" content={UI.en.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={UI.en.title} />
        <meta property="og:description" content={UI.en.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={UI.en.title} />
        <meta name="twitter:description" content={UI.en.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={ix.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroBrowse}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 跨境用人导语：结构性事实（迁移方向 + 人才池瓶颈 + 本地/跨境组合解法），零统计数字 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.blurbTitle}</h2>
          <p className={styles.lead}>{u.blurb1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.blurb2}</p>
        </div>

        {/* 三国卡：旗帜 + 国名 + 指南一句话 + 内容语言徽章，整卡可点进详情页 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.cardsTitle}</h2>
          <div className={ix.guideGrid}>
            {guides.map((g) => {
              const card = g.card[lang] || g.card.en;
              const name = REGION_NAMES[g.region][lang] || REGION_NAMES[g.region].en;
              return (
                <Link key={g.region} href={`/guides/${g.region}`} className={ix.guideCard}>
                  <div className={ix.guideFlag} aria-hidden="true">{g.flag}</div>
                  <h3 className={ix.guideName}>{name}</h3>
                  <p className={ix.guideSub}>{card.sub}</p>
                  <div className={ix.langBadges}>
                    {g.langs.map((l) => (
                      <span key={l} className={ix.langBadge}>{LANG_BADGES[l] || l}</span>
                    ))}
                  </div>
                  <span className={ix.guideMore}>{u.readGuide}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 相关 Playbook 文章：建厂/迁移主题的两篇深度文章（中文本体，英文标签注明语言） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.articlesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.articlesIntro}</p>
          <div className={ix.articleList}>
            {RELATED_ARTICLES.map((a) => (
              <Link key={a.slug} href={`/playbook/${a.slug}`} className={ix.articleItem}>
                <p className={ix.articleTitle}>{a.title[lang] || a.title.en}</p>
                <p className={ix.articleMeta}>{a.meta[lang] || a.meta.en}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期从 lib/regionGuides 单一来源取三国数据，并瘦身为卡片所需字段
// （flag/langs + en/zh 的 title/sub）——索引页不需要整份四语正文，props 越小水合越轻。
export async function getStaticProps() {
  const guides = getGuidePaths().map(({ params }) => {
    const g = getGuide(params.region);
    return {
      region: g.region,
      flag: g.flag,
      langs: g.langs,
      card: {
        en: { title: g.content.en.title, sub: g.content.en.sub },
        zh: { title: g.content.zh.title, sub: g.content.zh.sub },
      },
    };
  });

  return { props: { guides } };
}
