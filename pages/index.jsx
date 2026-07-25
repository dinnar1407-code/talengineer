import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
// 共享导航栏 + 页脚（方案 A2「首页收编」）：删除原私有内联 header/footer，
// 与全站其余 28 页统一使用同一套组件；语言/主题切换均由 Navbar 内部提供。
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// FOOTER_META：Organization JSON-LD 的 description 与页脚 tagline 同源（不重抄一份文案）
import { FOOTER_META } from '../lib/navConfig';
import { useLang } from '../hooks/useLang';
import styles from './index.module.css';

// ── 文案词典：已迁至 lib/i18n/index.js（架构 B 抽离，2026-07-24），此处仅导入 ──
import { DICT } from '../lib/i18n/index';

// 把 /api/talent/list 返回的工程师行映射成 Featured 卡片所需结构（真实数据，替代此前的虚构占位人物）
function initialsOfName(name) {
  return (name || '?').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
function mapFeaturedEngineer(t) {
  const chips = (t.skills || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return {
    id: t.id,
    initials: initialsOfName(t.name),
    name: t.name || 'Engineer',
    loc: (t.region || '').trim(),
    chips,
    bio: t.bio || '',
    rate: t.rate || '—',
    ratingLine: t.avg_rating ? `★ ${t.avg_rating} (${t.review_count || 0})` : (t.level || ''),
  };
}

export default function Home() {
  const [lang, setLang] = useLang();
  const [featuredEngineers, setFeaturedEngineers] = useState(null); // null → Featured 板块不渲染

  // Featured engineers：拉取公开的真实工程师数据；失败或空数组时整个板块不渲染，绝不回退到虚构人物
  useEffect(() => {
    let alive = true;
    fetch('/api/talent/list?limit=3&sort=verified')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j || j.status !== 'ok') return;
        const rows = Array.isArray(j.data) ? j.data : [];
        if (rows.length) setFeaturedEngineers(rows.slice(0, 3).map(mapFeaturedEngineer));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // 逐 key 回退到英文：zh 提供全量，其余语言缺失的 key 用英文兜底
  const d = { ...DICT.en, ...(DICT[lang] || {}) };

  // Featured engineers：真实数据优先；/api/talent/list 为空或失败时回退到本地化演示卡（带「🧪」徽标）
  const engIsDemo = !(featuredEngineers && featuredEngineers.length > 0);
  const engList = engIsDemo ? (d.demoEngineers || []) : featuredEngineers;
  // 演示徽标样式（描边 chip，深浅色均可读，走全站 --accent token 并带琥珀色兜底）
  const demoBadgeStyle = { display: 'inline-block', marginLeft: 10, fontSize: 12, fontWeight: 700, color: 'var(--accent, #b26a00)', background: 'transparent', border: '1px solid var(--accent, #f5b301)', borderRadius: 999, padding: '2px 10px', verticalAlign: 'middle' };

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DICT.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Talengineer',
    url: 'https://talengineer.us',
    logo: 'https://talengineer.us/img/logo-macaw.svg',
    // 与页脚 tagline 同源（lib/navConfig FOOTER_META）；JSON-LD 固定英文，与全站约定一致
    description: FOOTER_META.tagline.en,
  };
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Talengineer',
    url: 'https://talengineer.us',
  };

  return (
    <>
      <Head>
        <title>Talengineer | AI-Verified Industrial Automation Talent, Without Borders</title>
        <meta
          name="description"
          content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers — screened with a practical AI assessment and certified through platform exams. Milestone escrow protects both sides; an AI project manager works in nine languages."
        />
        {/* 规范链接 + Open Graph / Twitter 分享卡（og.png 由 scripts/gen-og.js 生成）*/}
        <link rel="canonical" href="https://talengineer.us/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Talengineer | AI-Verified Industrial Automation Talent, Without Borders" />
        <meta property="og:description" content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers. Milestone escrow protects both sides; an AI project manager works in nine languages." />
        <meta property="og:url" content="https://talengineer.us/" />
        <meta property="og:image" content="https://talengineer.us/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talengineer | AI-Verified Industrial Automation Talent" />
        <meta name="twitter:description" content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers. Milestone escrow protects both sides." />
        <meta name="twitter:image" content="https://talengineer.us/og.png" />
        {/* 品牌字体：Archivo（标题/字标）、IBM Plex Sans（正文）、IBM Plex Mono（数字/kicker）*/}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </Head>

      <div className={styles.page}>
        {/*
          共享导航栏（方案 A2「首页收编」）：
          - 原私有内联 header（品牌字标 + 扁平链接 + 语言胶囊 + 主题切换 + 汉堡抽屉）已删除，
            全部能力由共享 Navbar 提供（下拉菜单/语言/主题/移动抽屉）；
          - Post-a-Project CTA 已上移进 Navbar（navConfig CTA_POST_PROJECT，与页脚同源）；
          - 两代 header 同为 64px sticky，hero 偏移不变。
        */}
        <Navbar lang={lang} onLangChange={setLang} />

        <main>
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <div className={styles.heroKicker}>{d.heroKicker}</div>
              <h1 className={styles.heroH1}>{d.heroH1}</h1>
              <p className={styles.heroSub}>{d.heroSub}</p>
            </div>
            <div className={styles.heroCards}>
              {/* 左卡：固定深蓝渐变（两种模式都深色）*/}
              <div className={styles.hireCard}>
                <span className={styles.hireKicker}>{d.cardHiringKicker}</span>
                <b className={styles.cardTitleDark}>{d.cardHiringTitle}</b>
                <p className={styles.hireBody}>{d.cardHiringBody}</p>
                <div className={styles.cardCtaRow}>
                  <Link href="/talent" className={styles.hireCta}>{d.cardHiringCta}</Link>
                  <span className={styles.hireNote}>{d.cardHiringNote}</span>
                </div>
              </div>
              {/* 右卡：跟随主题 */}
              <div className={styles.engCard}>
                <span className={styles.engKicker}>{d.cardEngKicker}</span>
                <b className={styles.cardTitle}>{d.cardEngTitle}</b>
                <p className={styles.engBody}>{d.cardEngBody}</p>
                <div className={styles.cardCtaRow}>
                  <Link href="/talent" className={styles.engCta}>{d.cardEngCta}</Link>
                  <span className={styles.engNote}>{d.cardEngNote}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroSpacer} />
          </section>

          {/* ── STATS TICKER ──────────────────────────────────────────────── */}
          <section className={styles.ticker}>
            <div className={styles.tickerInner}>
              {d.stats.map((s, i) => (
                <div key={i} className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── SPECIALTY CATEGORIES ──────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.kicker}>{d.catKicker}</div>
                  <h2 className={styles.h2}>{d.catH2}</h2>
                </div>
                <Link href="/talent" className={styles.headLink}>{d.catAll}</Link>
              </div>
              <div className={styles.catGrid}>
                {d.categories.map((c, i) => (
                  <Link href="/talent" key={i} className={styles.catCard}>
                    <span className={styles.catEmoji}>{c.emoji}</span>
                    <b className={styles.catName}>{c.name}</b>
                    <span className={styles.catTools}>{c.tools}</span>
                    <span className={styles.catStat}>{c.count} {d.engineersWord} · {d.avgWord} ${c.rate}/hr</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section id="how-it-works" className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.howKicker}</div>
                <h2 className={styles.h2}>{d.howH2}</h2>
              </div>
              <div className={styles.howGrid}>
                <div className={styles.howCard}>
                  <div className={`${styles.howColTitle} ${styles.howColEmployer}`}>{d.forEmployers}</div>
                  <div className={styles.stepList}>
                    {d.employerSteps.map((s, i) => (
                      <div key={i} className={styles.step}>
                        <span className={`${styles.stepNum} ${styles.stepNumEmployer}`}>{i + 1}</span>
                        <div>
                          <b className={styles.stepTitle}>{s.title}</b>
                          <p className={styles.stepBody}>{s.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.howCard}>
                  <div className={`${styles.howColTitle} ${styles.howColEngineer}`}>{d.forEngineers}</div>
                  <div className={styles.stepList}>
                    {d.engineerSteps.map((s, i) => (
                      <div key={i} className={styles.step}>
                        <span className={`${styles.stepNum} ${styles.stepNumEngineer}`}>{i + 1}</span>
                        <div>
                          <b className={styles.stepTitle}>{s.title}</b>
                          <p className={styles.stepBody}>{s.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURED ENGINEERS（真实数据优先；为空/失败时回退到本地化演示卡 + 徽标）──────── */}
          {engList.length > 0 && (
            <section className={styles.section}>
              <div className={styles.container}>
                <div className={styles.sectionHead}>
                  <div>
                    <div className={styles.kicker}>{d.featKicker}</div>
                    <h2 className={styles.h2}>{d.featH2}{engIsDemo && <span style={demoBadgeStyle}>🧪 {d.demoData} · Demo</span>}</h2>
                  </div>
                  <Link href="/talent" className={styles.headLink}>{d.featBrowseAll}</Link>
                </div>
                <div className={styles.engGrid}>
                  {engList.map((e) => (
                    <div key={e.id} className={styles.engineerCard}>
                      <div className={styles.engTop}>
                        <span className={styles.avatar}>{e.initials}</span>
                        <div className={styles.engMeta}>
                          <b className={styles.engName}>{e.name}</b>
                          <div className={styles.engLoc}>{e.loc}</div>
                        </div>
                        <span className={styles.verifiedBadge}>{d.verified}</span>
                      </div>
                      <div className={styles.chipRow}>
                        {e.chips.map((ch, j) => <span key={j} className={styles.chip}>{ch}</span>)}
                      </div>
                      <p className={styles.engBio}>{e.bio}</p>
                      <div className={styles.engFooter}>
                        <span className={styles.engRate}>{e.rate}</span>
                        <span className={styles.engRating}>{e.ratingLine}</span>
                        {/* 演示卡不深链到 /engineer/{id}（不存在），改指 /talent；真实卡照常进档案 */}
                        <Link href={engIsDemo ? '/talent' : `/engineer/${e.id}`} className={styles.viewProfile}>{d.viewProfile}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── RATE BENCHMARKS (fixed navy) ──────────────────────────────── */}
          <section className={styles.rateBand}>
            <div className={styles.rateInner}>
              <div className={styles.rateLeft}>
                <div className={styles.rateKicker}>{d.rateKicker}</div>
                <h2 className={styles.rateH2}>{d.rateH2}</h2>
                <p className={styles.rateBody}>{d.rateBody}</p>
                <Link href="/rates" className={styles.rateCta}>{d.rateCta}</Link>
              </div>
              <div className={styles.rateTable}>
                <div className={styles.rateHeadRow}>
                  <span>{d.rateColRegion}</span><span>{d.rateColPlc}</span><span>{d.rateColRobot}</span>
                </div>
                {d.rateRows.map((r, i) => (
                  <div key={i} className={styles.rateRow}>
                    <span>{r.region}</span>
                    <span className={styles.mono}>{r.plc}</span>
                    <span className={styles.mono}>{r.robot}</span>
                  </div>
                ))}
                <div className={styles.rateFootnote}>{d.rateFootnote}</div>
              </div>
            </div>
          </section>

          {/* ── TRUST ─────────────────────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.container}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.trustKicker}</div>
                <h2 className={styles.h2}>{d.trustH2}</h2>
              </div>
              <div className={styles.trustGrid}>
                {d.trust.map((t, i) => (
                  <div key={i} className={styles.trustCard}>
                    <span className={styles.trustEmoji}>{t.emoji}</span>
                    <b className={styles.trustTitle}>{t.title}</b>
                    <p className={styles.trustBody}>{t.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <h2 className={`${styles.h2} ${styles.h2Center}`}>{d.testiH2}</h2>
              <div className={styles.testiGrid}>
                {d.testimonials.map((t, i) => (
                  <figure key={i} className={styles.testiCard}>
                    <span className={styles.stars}>★★★★★</span>
                    <blockquote className={styles.quote}>{t.quote}</blockquote>
                    <figcaption className={styles.attribution}>
                      <b>{t.author}</b> · {t.meta}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {/* 高意图 CTA：从证言区把访客引到已建成但零链入的客户案例页 */}
              <div className={styles.sectionHeadCenter} style={{ marginTop: 28 }}>
                <Link href="/case-studies" className={styles.headLink}>{d.caseStudiesCta}</Link>
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.faqContainer}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.faqKicker}</div>
                <h2 className={styles.h2}>{d.faqH2}</h2>
              </div>
              <div className={styles.faqList}>
                {d.faqs.map((f, i) => (
                  <details key={i} className={styles.faqItem} open={i === 0}>
                    <summary className={styles.faqSummary}>{f.q}</summary>
                    <p className={styles.faqAnswer}>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── RESOURCES ─────────────────────────────────────────────────── */}
          <section id="resources" className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <h2 className={`${styles.h2} ${styles.h2Sm}`}>{d.resH2}</h2>
                <Link href="/playbook" className={styles.headLink}>{d.resAll}</Link>
              </div>
              <div className={styles.resGrid}>
                {d.resources.map((r, i) => (
                  <Link href={r.href} key={i} className={styles.resCard}>
                    <span className={styles.resTag}>{r.tag}</span>
                    <b className={styles.resTitle}>{r.title}</b>
                    <span className={styles.resTeaser}>{r.teaser}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA (fixed brand gradient) ──────────────────────────── */}
          <section className={styles.finalCta}>
            <h2 className={styles.ctaH2}>{d.ctaH2}</h2>
            <p className={styles.ctaSub}>{d.ctaSub}</p>
            <div className={styles.ctaBtns}>
              <Link href="/talent" className={styles.ctaPost}>{d.ctaPost}</Link>
              <Link href="/talent" className={styles.ctaApply}>{d.ctaApply}</Link>
            </div>
          </section>
        </main>

        {/*
          共享页脚（components/Footer，数据来自 lib/navConfig FOOTER_COLUMNS/FOOTER_META）：
          原内联豪华页脚已删除——其中 About/Contact/Privacy & Terms 曾是指向 '/' 的死链、
          Resources 是 '#resources' 页内锚点，现统一走 navConfig 的真实落点（/about /contact /privacy /resources）。
        */}
        <Footer lang={lang} />
      </div>

      <ChatBot lang={lang} />
    </>
  );
}
