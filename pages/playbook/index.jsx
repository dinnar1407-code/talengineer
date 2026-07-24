import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getAllPlaybookMeta } from '../../lib/playbook';
import styles from './playbook.module.css';

// 站点根 URL：canonical / OG 用。构建期从环境变量读，回退线上域名。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 语言分组展示名（列表页按 lang 分组）。
const LANG_LABEL = { en: 'English guides', zh: '中文指南' };

// 列表页顶部文案（跟随导航语言切换；只做 en/zh 两套，其余回退英文）。
const DICT = {
  en: {
    kicker: 'Talengineer Playbook',
    title: 'Guides for hiring and managing automation talent',
    sub: 'Practical, no-fluff guides on rates, hiring, certification, and cross-border delivery for industrial automation projects.',
    read: 'Read guide →',
    typeAll: 'All',
    typeLabels: { guide: 'Guide', 'market-data': 'Market Data', certification: 'Certification', case: 'Case Study' },
    audAll: 'All audiences',
    audLabels: { employer: 'For employers', engineer: 'For engineers' },
  },
  zh: {
    kicker: 'Talengineer 实战指南',
    title: '自动化人才招聘与管理指南',
    sub: '关于费率、招聘、认证与跨境交付的实操型指南，专为工业自动化项目而写。',
    read: '阅读指南 →',
    typeAll: '全部',
    typeLabels: { guide: '指南', 'market-data': '市场数据', certification: '认证解读', case: '案例' },
    audAll: '全部受众',
    audLabels: { employer: '雇主向', engineer: '工程师向' },
  },
};

// 类型筛选的展示顺序（内容 taxonomy，竞对改善 W1-2）。
const TYPE_ORDER = ['guide', 'market-data', 'certification', 'case'];

// 受众筛选的展示顺序（taxonomy 受众维度激活，与 4 篇工程师文章同批上线）。
// 注意 'both' 不出 chip：它是"双受众"文章的标注值，选任一受众 chip 时都算命中。
const AUD_ORDER = ['employer', 'engineer'];

// 受众命中判定：文章 audience 精确等于所选受众，或标注为 both（双受众文章两边都算）。
const matchesAudience = (article, aud) =>
  !aud || article.audience === aud || article.audience === 'both';

export default function PlaybookIndex({ groups }) {
  const [lang, setLang] = useLang();
  const [typeFilter, setTypeFilter] = useState('');
  // 受众筛选状态：'' = 不过滤（全部受众），镜像 typeFilter 的模式。
  const [audFilter, setAudFilter] = useState('');
  const d = DICT[lang] || DICT.en;

  // 按类型 + 受众客户端过滤（两个维度是 AND 关系）；只展示筛选后仍有文章的语言组。
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      articles: g.articles.filter(
        (a) => (!typeFilter || a.type === typeFilter) && matchesAudience(a, audFilter)
      ),
    }))
    .filter((g) => g.articles.length > 0);

  // 只给实际存在的类型出筛选 chip，避免空筛选项。
  const presentTypes = TYPE_ORDER.filter((t) =>
    groups.some((g) => g.articles.some((a) => a.type === t))
  );

  // 只给选中后有结果的受众出 chip（both 文章让两个受众都"存在"），避免空态筛选项。
  const presentAuds = AUD_ORDER.filter((aud) =>
    groups.some((g) => g.articles.some((a) => matchesAudience(a, aud)))
  );

  const pageTitle = 'Automation Hiring Playbook | Talengineer';
  const pageDesc =
    'Practical guides on PLC programmer rates, hiring controls engineers, SCADA due-diligence, robot cell commissioning, and cross-border automation delivery.';
  const canonical = `${SITE}/playbook`;

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
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={`${SITE}/og.png`} />
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
        {presentTypes.length > 1 && (
          <div className={styles.typeChips}>
            <button
              className={`${styles.chip} ${typeFilter === '' ? styles.chipActive : ''}`}
              onClick={() => setTypeFilter('')}
            >
              {d.typeAll}
            </button>
            {presentTypes.map((t) => (
              <button
                key={t}
                className={`${styles.chip} ${typeFilter === t ? styles.chipActive : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {d.typeLabels[t] || t}
              </button>
            ))}
          </div>
        )}

        {/* 第二排 chips：受众维度（taxonomy audience 激活）。复用类型 chips 的样式与交互模式；
            两个受众都有内容时才渲染整排（单受众时筛选没有意义，照 presentTypes.length > 1 的门槛）。 */}
        {presentAuds.length > 1 && (
          <div className={styles.typeChips}>
            <button
              className={`${styles.chip} ${audFilter === '' ? styles.chipActive : ''}`}
              onClick={() => setAudFilter('')}
            >
              {d.audAll}
            </button>
            {presentAuds.map((aud) => (
              <button
                key={aud}
                className={`${styles.chip} ${audFilter === aud ? styles.chipActive : ''}`}
                onClick={() => setAudFilter(aud)}
              >
                {d.audLabels[aud] || aud}
              </button>
            ))}
          </div>
        )}

        {visibleGroups.map((group) => (
          <section key={group.lang}>
            <h2 className={styles.groupTitle}>
              {LANG_LABEL[group.lang] || group.lang}
            </h2>
            <div className={styles.grid}>
              {group.articles.map((a) => (
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
        ))}
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}

// 构建期读取全部文章元数据，按语言分组（英文组在前）。
export async function getStaticProps() {
  const meta = getAllPlaybookMeta();

  // 按 lang 归并；保留 getAllPlaybookMeta 已做的日期倒序。
  const byLang = {};
  meta.forEach((m) => {
    (byLang[m.lang] = byLang[m.lang] || []).push(m);
  });

  // 展示顺序：en 优先，其余按字母序。
  const order = Object.keys(byLang).sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a < b ? -1 : 1));
  const groups = order.map((l) => ({ lang: l, articles: byLang[l] }));

  return { props: { groups } };
}
