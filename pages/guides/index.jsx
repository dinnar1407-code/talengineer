import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getGuidePaths, getGuide } from '../../lib/regionGuides';
import { DICT as UI } from '../../lib/i18n/guides-index';
import styles from './guides.module.css';
import ix from './guides-index.module.css';

// /guides 索引页：修复裸路径 404（此前只有 /guides/[region] 详情页，/guides 本身无落点）。
// 结构 = hero → 跨境用人导语（结构性陈述，regionGuides 同款口径，零编造统计）→ 三国卡
// → 相关 Playbook 文章 → CTA。索引页只做 en/zh 两语（详情页保持四语——plan §B1 约定）。

// 站点根 URL：canonical / OG 用（与 /guides/[region] 同款写法）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 三国显示名（en/zh；索引页只做两语，与 [region].jsx 的 REGION_META 同源同名）。
const REGION_NAMES = {
  mexico: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico', hi: 'मेक्सिको', fr: 'Mexique', de: 'Mexiko', ja: 'メキシコ', ko: '멕시코' },
  vietnam: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam', hi: 'वियतनाम', fr: 'Vietnam', de: 'Vietnam', ja: 'ベトナム', ko: '베트남' },
  thailand: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan', hi: 'थाईलैंड', fr: 'Thaïlande', de: 'Thailand', ja: 'タイ', ko: '태국' },
};

// 语言代码 → 徽章显示文本（指南内容语言因地而异：墨西哥/越南四语、泰国两语）。
const LANG_BADGES = { en: 'EN', zh: '中文', es: 'ES', vi: 'VI', hi: 'HI', fr: 'FR', de: 'DE', ja: 'JA', ko: 'KO' };

// 相关 Playbook 文章（手工策展：与建厂迁移主题直接相关的两篇；文章本体为中文，
// en 标签做英文释义并标注语言，避免英文读者点进去才发现是中文——诚实预期）。
const RELATED_ARTICLES = [
  {
    slug: 'mexico-factory-automation-hiring',
    title: {
      en: 'Finding automation engineers for a Mexico factory build',
      zh: '墨西哥建厂：自动化工程师怎么找',
      es: 'Cómo encontrar ingenieros de automatización para construir una fábrica en México',
      vi: 'Tìm kỹ sư tự động hóa cho một dự án xây dựng nhà máy tại Mexico',
      hi: 'मेक्सिको में फ़ैक्ट्री बनाने के लिए ऑटोमेशन इंजीनियर कैसे खोजें',
      fr: 'Trouver des ingénieurs en automatisation pour la construction d’une usine au Mexique',
      de: 'Automatisierungsingenieure für den Bau einer Fabrik in Mexiko finden',
      ja: 'メキシコでの工場建設に向けたオートメーションエンジニアの探し方',
      ko: '멕시코 공장 건설을 위한 자동화 엔지니어 찾기',
    },
    meta: {
      en: 'Playbook guide · in Chinese', zh: 'Playbook 指南 · 中文',
      es: 'Guía del Playbook · en chino', vi: 'Hướng dẫn Playbook · bằng tiếng Trung',
      hi: 'Playbook गाइड · चीनी भाषा में', fr: 'Guide Playbook · en chinois',
      de: 'Playbook-Leitfaden · auf Chinesisch', ja: 'Playbookガイド・中国語', ko: 'Playbook 가이드 · 중국어',
    },
  },
  {
    slug: 'vietnam-production-line-migration',
    title: {
      en: 'Engineer staffing for a Vietnam production-line migration',
      zh: '越南产线迁移的工程师配置指南',
      es: 'Dotación de ingenieros para una migración de línea de producción en Vietnam',
      vi: 'Bố trí kỹ sư cho một dự án di dời dây chuyền sản xuất tại Việt Nam',
      hi: 'वियतनाम में प्रोडक्शन लाइन माइग्रेशन के लिए इंजीनियर स्टाफ़िंग',
      fr: 'Recrutement d’ingénieurs pour une migration de ligne de production au Vietnam',
      de: 'Ingenieurbesetzung für eine Produktionslinienverlagerung nach Vietnam',
      ja: 'ベトナムでの生産ライン移転に向けたエンジニア配置',
      ko: '베트남 생산 라인 이전을 위한 엔지니어 인력 배치',
    },
    meta: {
      en: 'Playbook guide · in Chinese', zh: 'Playbook 指南 · 中文',
      es: 'Guía del Playbook · en chino', vi: 'Hướng dẫn Playbook · bằng tiếng Trung',
      hi: 'Playbook गाइड · चीनी भाषा में', fr: 'Guide Playbook · en chinois',
      de: 'Playbook-Leitfaden · auf Chinesisch', ja: 'Playbookガイド・中国語', ko: 'Playbook 가이드 · 중국어',
    },
  },
];

// 页面文案（en/zh 两套）已迁至 lib/i18n/guides-index.js（2026-07-24，架构 B 迁移）。
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
        <title>{`${(UI[lang] || UI.en).title} | Talengineer`}</title>
        <meta name="description" content={(UI[lang] || UI.en).sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={(UI[lang] || UI.en).title} />
        <meta property="og:description" content={(UI[lang] || UI.en).sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={(UI[lang] || UI.en).title} />
        <meta name="twitter:description" content={(UI[lang] || UI.en).sub} />
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
