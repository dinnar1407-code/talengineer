import { useState } from 'react';
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

export default function PlaybookArticle({ article }) {
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
