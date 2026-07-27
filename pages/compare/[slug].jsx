// ── 对比页（/compare/[slug]）─────────────────────────────────────────────────
// 接住决策期问题："该走中介还是平台""为什么不用通用自由职业平台""和 XX 有什么区别"。
// 买家和 AI 都是先问这些，再问"谁能干"——这类页面缺席，那部分提问就与我们无关。
//
// 版式刻意固定为 answer-first：最上面是一段自包含的直接回答，能被整段引用；
// 表格、取舍、FAQ 都排在它之后。内容纪律见 lib/i18n/compare.js 头注释。
//
// 结构化数据：pageJsonLd 的 WebPage 节点 + FAQPage（faqEntity）并入同一个 @graph，
// 于是本页的 FAQ 与全站 Organization 挂在同一个实体上。
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { DICT, COMPARISONS, COMPARISON_META, SLUGS } from '../../lib/i18n/compare';
import { pageJsonLd, faqEntity } from '../../lib/jsonLd';
import styles from './compare.module.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

export async function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { slug: params.slug } };
}

export default function ComparePage({ slug }) {
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en;
  // 内容缺某语言时逐页回退英文（不是整页回退），保证结构永远完整
  const c = (COMPARISONS[lang] && COMPARISONS[lang][slug]) || COMPARISONS.en[slug];
  const meta = COMPARISON_META[slug];

  const canonical = `${SITE}/compare/${slug}`;
  // JSON-LD 固定英文：机器读的单一事实源，跟着 UI 语言变会让同一个 @id 出现矛盾描述
  const cEn = COMPARISONS.en[slug];
  const jsonLd = pageJsonLd({
    path: `/compare/${slug}`,
    // FAQPage 是 WebPage 的子类型。本页既是对比页也是问答页，用更具体的类型让抓取器
    // 直接认出成对的问答。显式写出来，而不是依赖 faqEntity 的 @type 去覆盖默认值——
    // 靠覆盖得到的正确结果，下次有人改 faqEntity 时就会悄悄变错。
    type: 'FAQPage',
    name: cEn.question,
    description: cEn.metaDesc,
    extra: faqEntity(cEn.faqs),
  });

  return (
    <div className={styles.page}>
      <Head>
        {/* 单一子节点：next/head 的 <title> 混合子节点会渲染成空标签 */}
        <title>{`${c.metaTitle} | Talengineer`}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <main className={styles.main}>
        <p className={styles.kicker}>{d.kicker}</p>
        <h1 className={styles.h1}>{c.question}</h1>

        {/* ── answer-first：整页最重要的一块，自包含、可整段引用 ── */}
        <section className={styles.answer} aria-label={d.answerLabel}>
          <p className={styles.answerLabel}>{d.answerLabel}</p>
          <p className={styles.answerBody}>{c.answer}</p>
        </section>

        <h2 className={styles.h2}>{d.tableTitle}</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{d.colDim}</th>
                <th scope="col">{c.label}</th>
                <th scope="col">{d.colUs}</th>
              </tr>
            </thead>
            <tbody>
              {d.dims.map((dim, i) => (
                <tr key={dim}>
                  <th scope="row">{dim}</th>
                  <td>{c.them[i]}</td>
                  <td className={styles.usCell}>{d.us[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 诚实取舍：没有这一节的对比页在买家眼里就是软文 */}
        <div className={styles.twoCol}>
          <section className={styles.col}>
            <h2 className={styles.h3}>{d.whenThemTitle}</h2>
            <ul className={styles.list}>
              {c.themWhen.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </section>
          <section className={styles.col}>
            <h2 className={styles.h3}>{d.whenUsTitle}</h2>
            <ul className={styles.list}>
              {c.usWhen.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </section>
        </div>

        <h2 className={styles.h2}>{d.faqTitle}</h2>
        <dl className={styles.faq}>
          {c.faqs.map((f) => (
            <div key={f.q} className={styles.faqItem}>
              <dt className={styles.faqQ}>{f.q}</dt>
              <dd className={styles.faqA}>{f.a}</dd>
            </div>
          ))}
        </dl>

        {/* 点名竞对的页面必须标出信息来源与核实日期，读者可自行核对 */}
        {meta.external && (
          <p className={styles.source}>
            {d.asOfLabel} {meta.asOf} · <a href={meta.external} rel="nofollow noopener" target="_blank">{meta.external.replace(/^https?:\/\//, '')}</a>
            <br />{d.sourceNote}
          </p>
        )}

        <section className={styles.cta}>
          <h2 className={styles.h3}>{d.ctaTitle}</h2>
          <p>{d.ctaBody}</p>
          <Link href="/talent" className={styles.ctaBtn}>{d.ctaBtn}</Link>
        </section>

        <nav className={styles.others} aria-label={d.indexTitle}>
          {SLUGS.filter((s) => s !== slug).map((s) => {
            const other = (COMPARISONS[lang] && COMPARISONS[lang][s]) || COMPARISONS.en[s];
            return <Link key={s} href={`/compare/${s}`} className={styles.otherLink}>{other.label}</Link>;
          })}
        </nav>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
