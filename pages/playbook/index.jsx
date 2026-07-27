import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getAllPlaybookMeta } from '../../lib/playbook';
import { selectGroupVariants } from '../../lib/playbookGroups';
import { DICT } from '../../lib/i18n/playbook-index';
import { pageJsonLd } from '../../lib/jsonLd';
import styles from './playbook.module.css';

// 结构化数据（schema.org）。固定取 en 文案——JSON-LD 是给机器读的单一事实源，
// 跟着 UI 语言变会让同一个 @id 在不同语言下出现互相矛盾的描述。见 lib/jsonLd.js。
const JSON_LD = pageJsonLd({
  path: '/playbook',
  type: 'CollectionPage',
  name: DICT.en.title,
  description: DICT.en.sub,
});


// 站点根 URL：canonical / OG 用。构建期从环境变量读，回退线上域名。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 「也提供」徽章里的语言短标（翻译组机制 2026-07-24）：
// 覆盖全站 9 语（hooks/useLang SUPPORTED 同口径）；zh/ja/ko 用母语字样，其余用大写码。
const LANG_BADGE = {
  en: 'EN', zh: '中文', es: 'ES', vi: 'VI', hi: 'HI',
  fr: 'FR', de: 'DE', ja: '日本語', ko: '한국어',
};

// 列表页顶部文案已迁至 lib/i18n/playbook-index.js（2026-07-24，架构 B 迁移）。
// 类型筛选的展示顺序（内容 taxonomy，竞对改善 W1-2）。
const TYPE_ORDER = ['guide', 'market-data', 'certification', 'case'];

// 受众筛选的展示顺序（taxonomy 受众维度激活，与 4 篇工程师文章同批上线）。
// 注意 'both' 不出 chip：它是"双受众"文章的标注值，选任一受众 chip 时都算命中。
const AUD_ORDER = ['employer', 'engineer'];

// 受众命中判定：文章 audience 精确等于所选受众，或标注为 both（双受众文章两边都算）。
const matchesAudience = (article, aud) =>
  !aud || article.audience === aud || article.audience === 'both';

export default function PlaybookIndex({ articles }) {
  const [lang, setLang] = useLang();
  const [typeFilter, setTypeFilter] = useState('');
  // 受众筛选状态：'' = 不过滤（全部受众），镜像 typeFilter 的模式。
  const [audFilter, setAudFilter] = useState('');
  const d = DICT[lang] || DICT.en;

  // 翻译组去重（替代旧的按语言分区）：每组只出一张卡——当前 UI 语言的变体优先，
  // 缺译回退 en，再缺取组内现存的那篇。useLang 首帧恒为 'en'（客户端 effect 才读
  // localStorage），所以 SSR 首帧 = 完整 en 行为，静态 HTML 对搜索引擎稳定。
  const selected = selectGroupVariants(articles, lang);

  // 按类型 + 受众客户端过滤（两个维度是 AND 关系），作用在已按组去重的集合上。
  const visibleArticles = selected.filter(
    (a) => (!typeFilter || a.type === typeFilter) && matchesAudience(a, audFilter)
  );

  // 只给实际存在的类型出筛选 chip，避免空筛选项（口径 = 当前语言选出的组代表集）。
  const presentTypes = TYPE_ORDER.filter((t) => selected.some((a) => a.type === t));

  // 只给选中后有结果的受众出 chip（both 文章让两个受众都"存在"），避免空态筛选项。
  const presentAuds = AUD_ORDER.filter((aud) =>
    selected.some((a) => matchesAudience(a, aud))
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
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

        {/* 单一网格（翻译组机制）：不再按语言分区——每个翻译组只展示一张卡。
            组内有其他语言版本时，卡片带「也提供: EN/中文/…」小徽章提示可切换。 */}
        <div className={styles.grid}>
          {visibleArticles.map((a) => (
            <Link key={a.group} href={`/playbook/${a.slug}`} className={styles.card}>
              <span className={styles.cardMeta}>
                {a.date && <span className={styles.cardDate}>{a.date}</span>}
                <span className={styles.cardType}>{d.typeLabels[a.type] || a.type}</span>
                {a.otherLangs.length > 0 && (
                  <span className={styles.cardType}>
                    {d.also} {a.otherLangs.map((l) => LANG_BADGE[l] || l).join(' / ')}
                  </span>
                )}
              </span>
              <b className={styles.cardTitle}>{a.title}</b>
              <span className={styles.cardDesc}>{a.description}</span>
              <span className={styles.cardMore}>{d.read}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}

// 构建期读取全部已发布文章元数据（日期倒序、草稿已滤）。
// 翻译组的去重/回退在客户端做（依赖当前 UI 语言），这里只透传整份 meta——
// 这样切语言无需重新请求，selectGroupVariants 直接在浏览器里重挑变体。
export async function getStaticProps() {
  return { props: { articles: getAllPlaybookMeta() } };
}
