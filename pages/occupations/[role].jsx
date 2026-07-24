import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import styles from './occupations.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同一约定）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// UI 标签（章节标题、按钮、流程步骤等），en/zh 两套；其余 7 语按全站规则回退英文。
// 诚实红线备注：
// - ratesNote 不在本文件手抄，走 data.ratesNote（单一来源 lib/hireMatrix.js RATES_NOTE，
//   与 /hire/[track] 等 4 个消费页共用同一份文案，杜绝多处漂移）。
//   15%/5% 数字单一来源 = src/config/fees.js，职业页不另立口径、不发明职业级费率差异。
// - certIntro 的考试机制描述与 src/config/training.js 同口径，但刻意不复写
//   具体题数/时长/及格分/冷却天数——那些数字的展示位留给 /certification 与
//   /how-it-works（各页数字单一来源原则，防漂移），这里只写结构性机制。
const UI = {
  en: {
    heroApply: 'Apply as an Engineer',
    heroPost: 'Post a Project — Free',
    dutiesTitle: 'What this role delivers',
    skillsTitle: 'Skills we screen for',
    trackSkillsCaption: 'Track fundamentals',
    roleSkillsCaption: 'Role-specific',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    certTitle: 'Certification path',
    certIntro:
      'Every engineer passes a practical AI technical screener before they can be matched at all. Beyond that, they can earn certification in this track at three sequential levels — each higher level requires holding the one below it. Exams mix auto-graded multiple-choice with AI-scored scenario and analysis questions; results are reviewed by a platform admin before any certificate is issued, failed attempts carry a cooldown before retake, and only certified engineers can be assigned to your project.',
    certLink: 'Explore the Certification Center →',
    scadaNote:
      'A note on SCADA: TalEngineer runs four certification tracks — PLC & Controls, Robotics, Machine Vision and Electrical. There is no separate SCADA certificate; SCADA engineers are screened and certified within the PLC & Controls track, where supervisory work technically belongs.',
    l1: 'L1 — Fundamentals',
    l2: 'L2 — Independent',
    l3: 'L3 — Expert',
    hiwTitle: 'How hiring works',
    steps: [
      {
        t: 'Post your project',
        d: 'Scope the work and break it into milestones — our AI intake helps structure the brief before any engineer sees it.',
      },
      {
        t: 'Match with certified engineers',
        d: 'You are matched with pre-screened engineers certified in this track — filter by platform depth and certification level.',
      },
      {
        t: 'Fund milestone escrow',
        d: 'Funds for each milestone are held in escrow before work starts — the engineer knows the budget is real; you keep control of release.',
      },
      {
        t: 'Accept and release',
        d: 'Review each milestone deliverable and release payment on acceptance. If something is contested, a defined evidence-based dispute path protects both sides.',
      },
    ],
    hiwLink: 'See the full hiring process →',
    linksTitle: 'Keep exploring',
    linksTrack: 'Specialty page',
    linksIndustries: 'By industry',
    linksSiblings: 'Related roles',
    linksPlaybook: 'From the Playbook',
    faqTitle: 'Frequently asked questions',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
  },
  zh: {
    heroApply: '以工程师身份申请',
    heroPost: '免费发布项目',
    dutiesTitle: '这个职位交付什么',
    skillsTitle: '我们筛选的技能',
    trackSkillsCaption: '方向基本功',
    roleSkillsCaption: '职位专属',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    certTitle: '认证路径',
    certIntro:
      '每位工程师在被匹配之前，都要先通过一套实操型 AI 技术筛选。在此之上，还可在该方向考取逐级递进的三级认证——考更高级别须先持有低一级的有效认证。试卷混合自动判分的选择题与 AI 评分的场景题、分析题；成绩需经平台管理员复核后才发证，挂科后需经过冷却期才能重考，并且只有持证工程师才能被指派到你的项目。',
    certLink: '前往认证中心 →',
    scadaNote:
      '关于 SCADA 的说明：TalEngineer 目前只有四条认证方向——PLC 与控制、机器人、机器视觉、电气。不存在独立的 SCADA 证书；SCADA 工程师在 PLC 与控制方向下筛选与认证，监控层工作在技术上也确实归属于此。',
    l1: 'L1 — 基础',
    l2: 'L2 — 独立',
    l3: 'L3 — 专家',
    hiwTitle: '招聘流程怎么走',
    steps: [
      {
        t: '发布项目',
        d: '明确工作范围并拆成里程碑——AI 需求解析会先帮你把需求梳理成结构化的项目简报，再给工程师看。',
      },
      {
        t: '匹配持证工程师',
        d: '与经过预审、在该方向持证的工程师匹配——可按平台深度与认证级别筛选。',
      },
      {
        t: '注资里程碑托管',
        d: '每个里程碑的资金在开工前进入托管——工程师知道预算是真的，放款权仍在你手里。',
      },
      {
        t: '验收与放款',
        d: '逐里程碑验收交付物，确认后放款。如有争议，有明确的举证式纠纷路径保障双方。',
      },
    ],
    hiwLink: '查看完整招聘流程 →',
    linksTitle: '继续探索',
    linksTrack: '方向母页',
    linksIndustries: '按行业',
    linksSiblings: '相关职位',
    linksPlaybook: 'Playbook 文章',
    faqTitle: '常见问题',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
  },
};

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
