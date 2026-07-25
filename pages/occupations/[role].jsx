import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { DICT as UI } from '../../lib/i18n/occupations-role';
import styles from './occupations.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同一约定）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// UI 字典（含诚实红线备注）已迁至 lib/i18n/occupations-role.js（2026-07-24 架构 B）。

export default function OccupationPage({ data }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  // 职业文案：en/zh 全量，其余语言回退英文（SSR 首帧英文规则，与全站一致）。
  const c = data.content[lang] || data.content.en;
  const levels = data.trackMeta.levels[lang] || data.trackMeta.levels.en;
  const roleName = data.name[lang] || data.name.en;

  const canonical = `${SITE}/occupations/${data.role}`;
  const ogImage = `${SITE}/og.png`;

  // Occupation 结构化数据：描述"这是一个什么职业、需要哪些技能"。
  // 诚实红线：刻意不加 estimatedSalary 字段——费率区间是地区综合口径（REGIONS），
  // 不是本职业的统计工资数据，塞进结构化字段就成了编造统计。
  const occupationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: roleName,
    description: c.sub,
    // 技能 = 方向基本功 + 职位专属，两组合并成一个逗号串。
    skills: [...data.trackMeta.skills, ...data.roleSkills].join(', '),
    mainEntityOfPage: canonical,
  };

  // FAQPage 结构化数据：4 条 FAQ 来自 lib/occupations.js（与页面渲染同一数据源）。
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${c.title} | Talengineer`}</title>
        <meta name="description" content={c.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={c.title} />
        <meta name="twitter:description" content={c.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(occupationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{c.kicker}</p>
          <h1 className={styles.heroTitle}>{c.title}</h1>
          <p className={styles.heroSub}>{c.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 角色职责（lead1/lead2：结构性陈述，零编造统计）───── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.dutiesTitle}</h2>
          <p className={styles.lead}>{c.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{c.lead2}</p>
        </div>

        {/* ── 技能 chips：方向基本功 + 职位专属两排并列 ─────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.skillsTitle}</h2>
          <p className={styles.chipsCaption}>{u.trackSkillsCaption}</p>
          <div className={styles.chips}>
            {data.trackMeta.skills.map((s) => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
          </div>
          <p className={styles.chipsCaption}>{u.roleSkillsCaption}</p>
          <div className={styles.chips}>
            {data.roleSkills.map((s) => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
          </div>
        </div>

        {/* ── 各地区费率区间：REGIONS 直接来自 lib/hireMatrix（与 /hire/[track]、
             /rates 同一唯一来源）；ratesNote 与 /hire/[track] 完全同文 ───── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.ratesTitle}</h2>
          <table className={styles.rateTable}>
            <thead>
              <tr>
                <th>{u.regionCol}</th>
                <th>{u.rateCol}</th>
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r) => (
                <tr key={r.region.en}>
                  <td>{r.region[lang] || r.region.en}</td>
                  <td>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>{data.ratesNote[lang] || data.ratesNote.en}</p>
        </div>

        {/* ── 认证路径：方向 L1-L3（文案经 getTrackMeta 取自 lib/hireMatrix
             单一来源）+ 考试机制结构性描述（口径同 src/config/training.js，
             不复写具体数字）；SCADA 页额外渲染"认证归属 PLC 方向"的诚实声明 ── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.certTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.certIntro}</p>
          {data.role === 'scada-engineer' && (
            <p className={styles.certNote}>{u.scadaNote}</p>
          )}
          <div className={styles.levelGrid}>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l1}</div>
              <p className={styles.levelDesc}>{levels.l1}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l2}</div>
              <p className={styles.levelDesc}>{levels.l2}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l3}</div>
              <p className={styles.levelDesc}>{levels.l3}</p>
            </div>
          </div>
          <p className={styles.blockLink}>
            <Link href="/certification" className={styles.inlineLink}>{u.certLink}</Link>
          </p>
        </div>

        {/* ── 招聘流程 4 步（托管 mini-flow），链去 /how-it-works 看全流程 ── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.hiwTitle}</h2>
          <div className={styles.steps}>
            {u.steps.map((s, i) => (
              <div key={s.t} className={styles.stepCard}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepTitle}>{s.t}</div>
                <p className={styles.stepDesc}>{s.d}</p>
              </div>
            ))}
          </div>
          <p className={styles.blockLink}>
            <Link href="/how-it-works" className={styles.inlineLink}>{u.hiwLink}</Link>
          </p>
        </div>

        {/* ── 关联链接带：方向母页 / 行业垂直页 / 兄弟职业 / Playbook 文章
             （数据在 lib/occupations.js 构建期算好；空组不渲染）─────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.linksTitle}</h2>
          <div className={styles.linkGroups}>
            <div className={styles.linkGroup}>
              <p className={styles.linkGroupTitle}>{u.linksTrack}</p>
              <div className={styles.linkList}>
                <Link href={data.links.trackPage.href} className={styles.linkItem}>
                  {(data.links.trackPage.label[lang] || data.links.trackPage.label.en)} →
                </Link>
              </div>
            </div>

            {data.links.industries.length > 0 && (
              <div className={styles.linkGroup}>
                <p className={styles.linkGroupTitle}>{u.linksIndustries}</p>
                <div className={styles.linkList}>
                  {data.links.industries.map((l) => (
                    <Link key={l.href} href={l.href} className={styles.linkItem}>
                      {(l.label[lang] || l.label.en)} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {data.links.siblings.length > 0 && (
              <div className={styles.linkGroup}>
                <p className={styles.linkGroupTitle}>{u.linksSiblings}</p>
                <div className={styles.linkList}>
                  {data.links.siblings.map((l) => (
                    <Link key={l.href} href={l.href} className={styles.linkItem}>
                      {(l.label[lang] || l.label.en)} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {data.links.playbook.length > 0 && (
              <div className={styles.linkGroup}>
                <p className={styles.linkGroupTitle}>{u.linksPlaybook}</p>
                <div className={styles.linkList}>
                  {/* Playbook 文章标题在 getStaticProps 里经 lib/playbook 解析
                      （每篇文章只有一种语言的 frontmatter title，按原文渲染） */}
                  {data.links.playbook.map((l) => (
                    <Link key={l.href} href={l.href} className={styles.linkItem}>
                      {l.title} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FAQ（4 条，来自 lib/occupations.js，与 FAQPage JSON-LD 同源）── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.faqTitle}</h2>
          {c.faq.map((f) => (
            <div key={f.q} className={styles.faqItem}>
              <h3 className={styles.faqQ}>{f.q}</h3>
              <p className={styles.faqA}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 底部 CTA + 全站共享页脚 ───────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 6 个职业页静态预渲染（slug 清单来自 lib/occupations.js 单一来源）。
export async function getStaticPaths() {
  // 动态 import：lib/occupations.js 只在构建期（Node 环境）需要，
  // 这样它（及其上游 lib/hireMatrix 数据）不会进客户端 bundle。
  const { getOccupationPaths } = await import('../../lib/occupations.js');
  return {
    paths: getOccupationPaths(),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { getOccupationPage } = await import('../../lib/occupations.js');
  // lib/playbook 用到 fs/marked，只能在构建期引（Next 会把它从客户端 bundle 剔除）。
  const { getAllPlaybookMeta } = await import('../../lib/playbook');

  const data = getOccupationPage(params.role);
  if (!data) return { notFound: true };

  // 把手工策展的 Playbook slug 解析成真实文章标题；slug 不存在（或为草稿被
  // getAllPlaybookMeta 过滤）时直接剔除——宁可少一条链接，也不渲染死链。
  const allMeta = getAllPlaybookMeta();
  const playbook = data.links.playbook
    .map((p) => {
      const meta = allMeta.find((m) => m.slug === p.slug);
      return meta ? { href: p.href, title: meta.title } : null;
    })
    .filter(Boolean);

  return {
    props: { data: { ...data, links: { ...data.links, playbook } } },
  };
}
