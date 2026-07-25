import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { getAllPlaybookMeta, getAllPlaybookSlugs, getPlaybookBySlug } from '../../lib/playbook';
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

// 文末订阅卡文案：按文章语言选择（en/zh），复用 calculator 的 lead-capture 视觉与状态机。
const NEWSLETTER = {
  en: {
    title: 'Get the next playbook in your inbox',
    body: 'Practical guides on hiring and managing automation engineers across borders. No spam, unsubscribe anytime.',
    placeholder: 'you@company.com',
    btn: 'Subscribe',
    btnSending: 'Sending…',
    ok: 'Thanks — you are subscribed.',
    already: 'You are already on the list — thanks for coming back.',
    err: 'Something went wrong. Please check the email and try again.',
    invalid: 'Please enter a valid email address.',
  },
  zh: {
    title: '把下一篇指南发到你的邮箱',
    body: '关于跨境雇佣与管理自动化工程师的实操指南。不发垃圾邮件，随时可退订。',
    placeholder: 'you@company.com',
    btn: '订阅',
    btnSending: '发送中…',
    ok: '谢谢——你已订阅。',
    already: '你已经在订阅列表里了——欢迎回来。',
    err: '出了点问题，请检查邮箱后重试。',
    invalid: '请输入有效的邮箱地址。',
  },
};

// 邮箱基础校验（前端只做轻校验，真正的权威校验在后端 zod）。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 相关文章带标题（按文章语言取，与文末 CTA 同口径）。
const RELATED_TITLE = { en: 'Related guides', zh: '相关指南' };

// 语言切换带（翻译组机制 2026-07-24）：本文所在翻译组存在其他语言版本时，
// 在文首出一条「Read in: English / 中文 / …」。前缀按文章语言取（en/zh，其余回退 en）。
const READ_IN = { en: 'Read in:', zh: '阅读其他语言版本：' };

// 语言展示名：切换带里用完整母语名（比索引页徽章的短码更适合做链接文字）。
// 覆盖全站 9 语（hooks/useLang SUPPORTED 同口径）。
const LANG_NAME = {
  en: 'English', zh: '中文', es: 'Español', vi: 'Tiếng Việt', hi: 'हिन्दी',
  fr: 'Français', de: 'Deutsch', ja: '日本語', ko: '한국어',
};

export default function PlaybookArticle({ article, related, variants }) {
  const [lang, setLang] = useLang();
  const cta = CTA[article.lang] || CTA.en;
  // 订阅卡文案按文章语言取（与文末 CTA 同口径，独立于导航语言切换）。
  const nl = NEWSLETTER[article.lang] || NEWSLETTER.en;

  // Lead capture 状态：idle | sending | ok | already | error | invalid（复用 calculator 的状态机）。
  const [email, setEmail] = useState('');
  const [leadState, setLeadState] = useState('idle');

  // 提交订阅：轻校验邮箱 → POST /api/newsletter/subscribe，source 固定 'playbook'。
  async function handleSubscribe(e) {
    e.preventDefault();
    if (leadState === 'sending') return;
    if (!EMAIL_RE.test(email.trim())) {
      setLeadState('invalid');
      return;
    }
    setLeadState('sending');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'playbook', lang: article.lang }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setLeadState(json.already ? 'already' : 'ok');
      } else {
        setLeadState('error');
      }
    } catch (err) {
      // 网络等异常：给用户可重试的错误提示，不吞错。
      console.error('[playbook] subscribe failed', err);
      setLeadState('error');
    }
  }

  const canonical = `${SITE}/playbook/${article.slug}`;
  const ogImage = `${SITE}/og.png`;

  // hreflang alternates：同翻译组（getStaticProps 里按 article.group 挑出的 variants）
  // 互相声明语言版本，帮搜索引擎把同一篇文章的九语变体识别为彼此的翻译而非重复内容。
  // x-default 优先指向组内的 en 变体；组内没有 en（如仅 zh 的独立文章）就回退本文自身，
  // 因为总要有一个 x-default 目标，且本文是那种情况下唯一能确定存在的页面。
  const hreflangSiblings = [{ slug: article.slug, lang: article.lang }, ...variants];
  const xDefaultSlug = hreflangSiblings.find((v) => v.lang === 'en')?.slug || article.slug;

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
        {hreflangSiblings.map((v) => (
          <link key={v.lang} rel="alternate" hrefLang={v.lang} href={`${SITE}/playbook/${v.slug}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/playbook/${xDefaultSlug}`} />
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

        {/* 语言切换带：同翻译组存在其他语言版本时才渲染，链到各兄弟 slug。
            样式走内联（本页 CSS module 只读，与文末订阅卡同一约定）。 */}
        {variants && variants.length > 0 && (
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
              margin: '14px 0 0', padding: '10px 14px', fontSize: 14,
              border: '1px solid var(--border)', borderRadius: 10,
            }}
          >
            <span>{READ_IN[article.lang] || READ_IN.en}</span>
            {variants.map((v) => (
              <Link
                key={v.slug}
                href={`/playbook/${v.slug}`}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                {LANG_NAME[v.lang] || v.lang}
              </Link>
            ))}
          </div>
        )}

        {article.date && <div className={styles.articleMeta}>{article.date}</div>}

        {/* marked 已把 markdown 渲染成受控的 HTML；内容来自仓库内的静态文件，非用户输入。 */}
        <div
          className={styles.article}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* 文末订阅卡：复用 ctaBox 卡片外观，表单/提示走内联样式（本页 CSS module 只读）。 */}
        <div className={styles.ctaBox}>
          <h3>{nl.title}</h3>
          <p>{nl.body}</p>
          <form
            onSubmit={handleSubscribe}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, margin: '0 auto' }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // 用户重新输入时清掉上一轮的错误态，回到 idle。
                if (leadState === 'invalid' || leadState === 'error') setLeadState('idle');
              }}
              placeholder={nl.placeholder}
              aria-label={nl.placeholder}
              style={{
                flex: '1 1 220px', minWidth: 0, padding: '11px 14px', fontSize: 15,
                border: '1px solid var(--border)', borderRadius: 10,
                background: 'var(--bg)', color: 'var(--text)',
              }}
            />
            <button
              type="submit"
              disabled={leadState === 'sending'}
              style={{
                background: 'var(--primary)', color: 'var(--primary-ink)', fontWeight: 700,
                padding: '11px 22px', borderRadius: 10, border: 'none',
                cursor: leadState === 'sending' ? 'default' : 'pointer',
                opacity: leadState === 'sending' ? 0.7 : 1,
              }}
            >
              {leadState === 'sending' ? nl.btnSending : nl.btn}
            </button>
          </form>
          {leadState === 'ok' && <p style={{ margin: '14px 0 0', color: 'var(--primary)' }}>{nl.ok}</p>}
          {leadState === 'already' && <p style={{ margin: '14px 0 0', color: 'var(--primary)' }}>{nl.already}</p>}
          {leadState === 'invalid' && <p style={{ margin: '14px 0 0', color: '#ef4444' }}>{nl.invalid}</p>}
          {leadState === 'error' && <p style={{ margin: '14px 0 0', color: '#ef4444' }}>{nl.err}</p>}
        </div>

        <div className={styles.ctaBox}>
          <h3>{cta.heading}</h3>
          <p>{cta.body}</p>
          <Link href="/talent" className={styles.ctaBtn}>{cta.btn}</Link>
        </div>

        {/* 相关文章带（内链系统 B4）：构建期在 getStaticProps 里按 同track→同type 挑好 ≤3 篇，
            这里只负责渲染；复用列表页的 grid/card 样式，零新增 CSS。 */}
        {related && related.length > 0 && (
          <section>
            <h2 className={styles.groupTitle}>
              {RELATED_TITLE[article.lang] || RELATED_TITLE.en}
            </h2>
            <div className={styles.grid}>
              {related.map((r) => (
                <Link key={r.slug} href={`/playbook/${r.slug}`} className={styles.card}>
                  {r.date && <span className={styles.cardDate}>{r.date}</span>}
                  <b className={styles.cardTitle}>{r.title}</b>
                  <span className={styles.cardDesc}>{r.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
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
// 同时算好相关文章带（≤3 篇）：优先同 track，一篇同 track 都没有才回退同 type；
// 组内再把与本文同语言的排到前面（读者大概率想继续读同语言的内容）。
export async function getStaticProps({ params }) {
  const article = getPlaybookBySlug(params.slug);
  if (!article) return { notFound: true };

  // 候选池：全部已发布文章（getAllPlaybookMeta 已过滤草稿），排除本文自身。
  const candidates = getAllPlaybookMeta().filter((m) => m.slug !== article.slug);
  let pool = candidates.filter((m) => m.track === article.track);
  if (pool.length === 0) pool = candidates.filter((m) => m.type === article.type);
  // 同语言优先：两次 filter 拼接是稳定的（保留各自组内的日期倒序）。
  pool = [
    ...pool.filter((m) => m.lang === article.lang),
    ...pool.filter((m) => m.lang !== article.lang),
  ];
  // 只带渲染需要的字段进 props，避免把整份 meta 塞进页面数据。
  const related = pool.slice(0, 3).map(({ slug, title, description, date }) => ({
    slug, title, description, date,
  }));

  // 语言切换带（翻译组机制）：同 group 的其他已发布语言版本。
  // candidates 来自 getAllPlaybookMeta（草稿已滤），所以绝不会链到 draft 兄弟——
  // 比如月报 en/zh 同组但都是草稿时，切换带自然不出现。只带 slug/lang 两个渲染字段。
  const variants = candidates
    .filter((m) => m.group === article.group)
    .map(({ slug, lang }) => ({ slug, lang }));

  return { props: { article, related, variants } };
}
