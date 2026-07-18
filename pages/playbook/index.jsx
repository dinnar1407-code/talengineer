import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
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
  },
  zh: {
    kicker: 'Talengineer 实战指南',
    title: '自动化人才招聘与管理指南',
    sub: '关于费率、招聘、认证与跨境交付的实操型指南，专为工业自动化项目而写。',
    read: '阅读指南 →',
  },
};

export default function PlaybookIndex({ groups }) {
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en;

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
        {groups.map((group) => (
          <section key={group.lang}>
            <h2 className={styles.groupTitle}>
              {LANG_LABEL[group.lang] || group.lang}
            </h2>
            <div className={styles.grid}>
              {group.articles.map((a) => (
                <Link key={a.slug} href={`/playbook/${a.slug}`} className={styles.card}>
                  {a.date && <span className={styles.cardDate}>{a.date}</span>}
                  <b className={styles.cardTitle}>{a.title}</b>
                  <span className={styles.cardDesc}>{a.description}</span>
                  <span className={styles.cardMore}>{d.read}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

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
