import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import { getWhitepaper } from '../lib/whitepaper';
import styles from './whitepaper.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页面外壳文案（en/zh）。白皮书正文本身来自 content/whitepaper/{en,zh}.md，
// 这里只放门控卡、目录、草稿横幅等 UI 文案。
//
// ⚠️ 诚实软门（critic 裁定的红线）：全文本来就在静态 HTML 源码里，
// 邮箱门只是 lead capture、不是访问控制——文案绝不暗示更强的保护，
// 也绝不谎称"已发邮件"（本站目前不发任何 newsletter 邮件）。
const UI = {
  en: {
    kicker: 'Whitepaper',
    draftBanner: 'Draft — AI-drafted, pending final review. Not for external distribution.',
    tocTitle: 'What is inside',
    gateTitle: 'Read the full whitepaper',
    gateBody:
      'Enter your email to unlock the full text right here on this page, and to hear from us when we publish new guides. No spam, unsubscribe anytime.',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'Unlock full text',
    gateBtnSending: 'Unlocking…',
    gateOk: 'Thanks — the full text is unlocked below.',
    gateAlready: 'Welcome back — the full text is unlocked below.',
    gateErr: 'Something went wrong. Please check the email and try again.',
    gateInvalid: 'Please enter a valid email address.',
    ctaTitle: 'Ready to solve your overseas staffing?',
    ctaBody: 'Post a project and match with pre-screened, certified engineers under milestone escrow.',
    ctaBtn: 'Browse Engineers →',
  },
  zh: {
    kicker: '白皮书',
    draftBanner: '草稿 — AI 起草，待终审。请勿对外分发。',
    tocTitle: '本文目录',
    gateTitle: '阅读白皮书全文',
    gateBody:
      '输入邮箱即可在本页解锁全文，并在我们发布新指南时收到消息。不发垃圾邮件，随时可退订。',
    gatePlaceholder: 'you@company.com',
    gateBtn: '解锁全文',
    gateBtnSending: '解锁中…',
    gateOk: '谢谢——全文已在下方解锁。',
    gateAlready: '欢迎回来——全文已在下方解锁。',
    gateErr: '出了点问题，请检查邮箱后重试。',
    gateInvalid: '请输入有效的邮箱地址。',
    ctaTitle: '准备好解决海外用人问题了吗？',
    ctaBody: '发布项目，在里程碑托管下与经过预审、持证的工程师匹配。',
    ctaBtn: '浏览工程师 →',
  },
};

// 邮箱基础校验（前端只做轻校验，真正的权威校验在后端 zod）。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 从渲染好的 HTML 里抽 <h2> 做目录预览。
// 在组件里用同一段确定性正则（服务端/客户端结果一致），不会造成 hydration 不匹配。
function extractToc(html) {
  const matches = String(html || '').match(/<h2[^>]*>([\s\S]*?)<\/h2>/g) || [];
  return matches.map((h) => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
}

export default function Whitepaper({ papers }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  // 白皮书正文按导航语言取，zh 缺失时回退 en。SSR 首帧 lang='en'（useLang 客户端才生效），
  // 因此首帧必然是合法英文，符合站点 SSR 约定。
  const doc = (lang === 'zh' && papers.zh) ? papers.zh : papers.en;

  // 邮箱软门状态机（照 calculator）：idle | sending | ok | already | error | invalid。
  // ok/already 即视为"已解锁"——这只是 lead capture，不做任何真正的访问控制。
  const [email, setEmail] = useState('');
  const [leadState, setLeadState] = useState('idle');
  const unlocked = leadState === 'ok' || leadState === 'already';

  const toc = useMemo(() => extractToc(doc.html), [doc.html]);

  async function handleUnlock(e) {
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
        body: JSON.stringify({ email: email.trim(), source: 'whitepaper', lang }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setLeadState(json.already ? 'already' : 'ok');
      } else {
        setLeadState('error');
      }
    } catch (err) {
      // 网络等异常：给用户可重试的错误提示，不吞错。
      console.error('[whitepaper] subscribe failed', err);
      setLeadState('error');
    }
  }

  const canonical = `${SITE}/whitepaper`;
  const ogImage = `${SITE}/og.png`;

  // Article 结构化数据（与 playbook 文章页同型）。
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: doc.title,
    description: doc.description,
    inLanguage: doc.lang,
    datePublished: doc.date || undefined,
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
        <title>{`${doc.title} | Talengineer`}</title>
        <meta name="description" content={doc.description} />
        {/*
          草稿期 robots noindex（Wave2 F6 红线）：白皮书未经 Terry 终审前不得被搜索引擎收录。
          终审通过后的放行动作 = 手工删掉这行 + 把 /whitepaper 加进 sitemap/llms.txt
          （登记在收官报告的 Terry 待办里），不与 frontmatter 的 draft 字段自动联动。
        */}
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={doc.title} />
        <meta property="og:description" content={doc.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={doc.title} />
        <meta name="twitter:description" content={doc.description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{doc.title}</h1>
          <p className={styles.heroSub}>{doc.description}</p>
          {doc.date && <p className={styles.heroDate}>{doc.date}</p>}
        </div>
      </div>

      <div className={styles.container}>
        {/* 草稿横幅：draft:true 期间始终显示，提醒任何看到这页的人这还不是定稿。 */}
        {doc.draft && <div className={styles.draftBanner}>{u.draftBanner}</div>}

        {/* 目录预览：解锁前给读者看清楚全文有什么，判断值不值得留邮箱。 */}
        <div className={styles.tocCard}>
          <h2 className={styles.tocTitle}>{u.tocTitle}</h2>
          <ol className={styles.tocList}>
            {toc.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        {/* 邮箱软门：提交成功（含重复订阅）即在页内渲染全文。 */}
        {!unlocked && (
          <div className={styles.gateCard}>
            <h2 className={styles.gateTitle}>{u.gateTitle}</h2>
            <p className={styles.gateBody}>{u.gateBody}</p>
            <form className={styles.gateForm} onSubmit={handleUnlock}>
              <input
                type="email"
                className={styles.emailInput}
                placeholder={u.gatePlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // 用户重新输入时清掉上一轮的错误态，回到 idle。
                  if (leadState === 'invalid' || leadState === 'error') setLeadState('idle');
                }}
                aria-label={u.gatePlaceholder}
              />
              <button type="submit" className={styles.gateBtn} disabled={leadState === 'sending'}>
                {leadState === 'sending' ? u.gateBtnSending : u.gateBtn}
              </button>
            </form>
            {leadState === 'invalid' && <p className={styles.gateMsgErr}>{u.gateInvalid}</p>}
            {leadState === 'error' && <p className={styles.gateMsgErr}>{u.gateErr}</p>}
          </div>
        )}

        {/* 解锁后：确认提示 + 全文。marked 渲染自仓库内静态文件，非用户输入。 */}
        {unlocked && (
          <>
            <p className={styles.gateMsgOk}>
              {leadState === 'already' ? u.gateAlready : u.gateOk}
            </p>
            <div
              className={styles.article}
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
            <div className={styles.ctaBox}>
              <h3>{u.ctaTitle}</h3>
              <p>{u.ctaBody}</p>
              <Link href="/talent" className={styles.ctaBtn}>{u.ctaBtn}</Link>
            </div>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/playbook">Playbook</Link> ·{' '}
          <Link href="/calculator">Cost Calculator</Link>
        </p>
      </footer>
    </div>
  );
}

// 构建期一次性读入 en/zh 两份白皮书（语言切换在客户端，页面本身只有一条静态路由）。
export async function getStaticProps() {
  const en = getWhitepaper('en');
  const zh = getWhitepaper('zh');
  // en 缺失属于内容仓库损坏，构建期直接炸出来比线上空页面好。
  if (!en) throw new Error('[whitepaper] content/whitepaper/en.md is missing');
  return { props: { papers: { en, zh } } };
}
