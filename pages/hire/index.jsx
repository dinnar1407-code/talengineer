import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import { REGIONS, RATES_NOTE, getTrackMeta, getIndustriesForTrack } from '../../lib/hireMatrix';
import { getRolesForTrack } from '../../lib/occupations';
import styles from './hire.module.css';
import ix from './hire-index.module.css';

// /hire 索引页：修复裸路径 404（此前只有 /hire/[track] 子页，/hire 本身无落点）。
// 结构 = hero → 平台机制导语 → 4 方向卡（含行业子链）→ 按职位名带 → 费率表 → 国别指南带 → CTA。
// 数据全部来自单一来源（lib/hireMatrix.js 的 TRACKS/MATRIX/REGIONS + lib/occupations.js），
// 页面自身不重抄任何数字或方向文案，杜绝多处漂移。

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同款写法）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四个方向的展示顺序（与导航 Specialties 菜单一致：plc → robotics → vision → electrical）。
const TRACK_ORDER = ['plc', 'robotics', 'vision', 'electrical'];

// 方向卡的一句话简介：索引页专属文案（结构性陈述，零统计数字）。
// 方向页的完整文案在 pages/hire/[track].jsx，这里只做"进入前的一口简介"，不重复母页正文。
const TRACK_BLURBS = {
  plc: {
    en: 'Siemens, Rockwell, Mitsubishi and Beckhoff programmers for logic design, migration and commissioning — matched by platform, not just by keyword.',
    zh: 'Siemens、Rockwell、Mitsubishi、Beckhoff 程序员，覆盖逻辑设计、迁移与调试——按平台匹配，而不只是按关键词。',
  },
  robotics: {
    en: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, programming and on-site commissioning, screened on real path and integration problems.',
    zh: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、编程与现场调试，在真实的路径与集成问题上完成筛选。',
  },
  vision: {
    en: 'Inspection, guidance and measurement engineers across Cognex, Keyence and Halcon — verified where vision projects actually fail: lighting, calibration, variation.',
    zh: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量工程师——在视觉项目真正翻车的地方验证：打光、标定、来料变化。',
  },
  electrical: {
    en: 'Panel design, drives and power specialists — EPLAN, UL/IEC and safe, buildable schematics that survive commissioning.',
    zh: '电柜设计、驱动与配电专家——EPLAN、UL/IEC，画得出经得起调试的安全可施工图纸。',
  },
};

// 建厂用人指南跨链（与 /hire/[track] 的 GUIDES 同一组三国，slug 对应 /guides/[region] 路由）。
const GUIDES = [
  { slug: 'mexico', flag: '🇲🇽', name: { en: 'Mexico', zh: '墨西哥' } },
  { slug: 'vietnam', flag: '🇻🇳', name: { en: 'Vietnam', zh: '越南' } },
  { slug: 'thailand', flag: '🇹🇭', name: { en: 'Thailand', zh: '泰国' } },
];

// 页面文案（en/zh 两套，其余语言回退 en——全站 `|| en` 约定，SSR 首帧英文）。
const UI = {
  en: {
    kicker: 'Hire Engineers',
    title: 'Hire Certified Industrial Automation Engineers',
    sub: 'PLC, robotics, machine vision and electrical specialists — pre-screened by a practical AI assessment, certified at three levels, and delivering under milestone escrow.',
    heroPost: 'Post a Project — Free',
    heroApply: 'Apply as an Engineer',
    lead1:
      'Hiring automation talent across borders usually fails in one of two places: you cannot verify that a résumé keyword means real depth on your exact controller, robot or camera; or the money side of a cross-border engagement is too risky for either party to commit. This page is the map of how we solve both — pick a specialty, an industry or a role title, and every path leads to the same verified pool.',
    lead2:
      'Every engineer on the platform passes a practical AI technical screener before they can be matched, and can earn platform certification in their track at three levels — only certified engineers can be assigned to your project. Payment runs through milestone escrow: funds are held and released stage by stage as work is accepted, protecting both sides of the border.',
    tracksTitle: 'Browse by specialty',
    tracksIntro:
      'Four certification tracks. Each specialty page covers what we screen for, what the three certification levels mean, and regional rate ranges.',
    viewTrack: 'View specialty →',
    industriesLabel: 'By industry:',
    rolesTitle: 'Hire by role title',
    rolesIntro:
      'If you think in job titles rather than certification tracks, start from the role — each role page maps the title to the right track, skills and certification path.',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    guidesTitle: 'Setting up in a new country?',
    guidesBody:
      'Read our country hiring guides for local rate ranges, certification and on-the-ground commissioning before you build.',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
  },
  zh: {
    kicker: '招聘工程师',
    title: '雇佣持证工业自动化工程师',
    sub: 'PLC、机器人、机器视觉与电气专家——通过实操型 AI 筛选、三级认证，在里程碑托管下交付。',
    heroPost: '免费发布项目',
    heroApply: '以工程师身份申请',
    lead1:
      '跨境招募自动化人才，通常卡在两个地方：一是没法验证简历上的关键词，在你这台具体的控制器、机器人或相机上到底有没有真功夫；二是跨境合作的资金风险，让双方都不敢先迈一步。这一页就是我们解决这两件事的地图——无论从方向、行业还是职位名进入，每条路都通向同一个经过验证的工程师池。',
    lead2:
      '平台上每位工程师在被匹配前，都要先通过一套实操型 AI 技术筛选，并可在所属方向考取三个级别的平台认证——只有持证工程师才能被指派到你的项目。付款走里程碑托管：资金先托管，随每阶段验收逐步释放，跨境双方都有保障。',
    tracksTitle: '按方向浏览',
    tracksIntro: '四条认证方向。每个方向页涵盖：我们筛选什么、三级认证分别意味着什么、各地区费率区间。',
    viewTrack: '进入方向页 →',
    industriesLabel: '按行业：',
    rolesTitle: '按职位名招募',
    rolesIntro: '如果你习惯用职位名而不是认证方向思考，就从职位入手——每个职位页会把职位名映射到对应的方向、技能与认证路径。',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    guidesTitle: '要在新国家建厂？',
    guidesBody: '动工前，先读我们的分国用人指南：了解当地费率区间、认证与落地调试。',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
  },
};

export default function HireIndex({ tracks, roles }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/hire`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage 结构化数据：告诉搜索引擎这是"招聘方向"合集页，成员是四个方向页。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    hasPart: tracks.map((t) => ({
      '@type': 'WebPage',
      name: `Hire ${t.meta.label.en} Engineers`,
      url: `${SITE}/hire/${t.track}`,
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${UI.en.title} | Talengineer`}</title>
        <meta name="description" content={UI.en.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={UI.en.title} />
        <meta property="og:description" content={UI.en.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={UI.en.title} />
        <meta name="twitter:description" content={UI.en.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 平台机制导语：跨境用人的两大痛点 + 筛选/认证/托管三道机制 */}
        <div className={styles.block}>
          <p className={styles.lead}>{u.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.lead2}</p>
        </div>

        {/* 四个方向卡：kicker/名称/简介/技能 chips + 卡底"进入方向页"与行业子链 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.tracksTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.tracksIntro}</p>
          <div className={ix.trackGrid}>
            {tracks.map((t) => {
              const blurb = TRACK_BLURBS[t.track][lang] || TRACK_BLURBS[t.track].en;
              return (
                <div key={t.track} className={ix.trackCard}>
                  <p className={ix.trackKicker}>{t.meta.kicker[lang] || t.meta.kicker.en}</p>
                  <h3 className={ix.trackTitle}>{t.meta.label[lang] || t.meta.label.en}</h3>
                  <p className={ix.trackDesc}>{blurb}</p>
                  <div className={ix.trackChips}>
                    {t.meta.skills.map((s) => (
                      <span key={s} className={ix.trackChip}>{s}</span>
                    ))}
                  </div>
                  <div className={ix.trackFoot}>
                    <Link href={`/hire/${t.track}`} className={ix.trackMore}>{u.viewTrack}</Link>
                    {/* 行业垂直页子链：该方向下有矩阵组合才渲染（electrical 暂无，卡底只留方向链） */}
                    {t.industries.length > 0 && (
                      <div className={ix.trackIndustries}>
                        <span className={ix.trackIndustriesLabel}>{u.industriesLabel}</span>
                        {t.industries.map((i) => (
                          <Link
                            key={i.industry}
                            href={`/hire/${t.track}/${i.industry}`}
                            className={ix.trackIndustryLink}
                          >
                            {i.label[lang] || i.label.en}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 按职位名招募带：6 个 /occupations/* 职业页入口（数据来自 lib/occupations.js） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.rolesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.rolesIntro}</p>
          <div className={ix.roleStrip}>
            {roles.map((r) => (
              <Link key={r.role} href={`/occupations/${r.role}`} className={ix.roleLink}>
                {(r.name[lang] || r.name.en)} →
              </Link>
            ))}
          </div>
        </div>

        {/* 费率表：REGIONS 直接 import 渲染（与 /hire/[track] 及 /rates 同一唯一来源） */}
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
              {REGIONS.map((r) => (
                <tr key={r.region.en}>
                  <td>{r.region[lang] || r.region.en}</td>
                  <td>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>{RATES_NOTE[lang] || RATES_NOTE.en}</p>
        </div>

        {/* 国别指南带：把索引页流量引向 /guides/[region] 三国指南 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.guidesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.guidesBody}</p>
          <div className={styles.industryLinks}>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className={styles.industryLink}>
                {g.flag} {(g.name[lang] || g.name.en)} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期从单一来源拼装页面数据：方向元数据 + 各方向行业子页 + 六个职业页入口。
// 用 getStaticProps 而非模块顶层计算，保持与 /hire/[track] 一致的数据流（props 可序列化）。
export async function getStaticProps() {
  const tracks = TRACK_ORDER.map((track) => ({
    track,
    meta: getTrackMeta(track), // label/kicker/skills/levels（lib/hireMatrix TRACKS 单一来源）
    industries: getIndustriesForTrack(track), // 该方向下的行业垂直页（electrical 为空数组）
  }));

  // 六个职业页入口：按方向顺序展开（plc 3 个含 SCADA、robotics/vision/electrical 各 1 个）。
  const roles = TRACK_ORDER.flatMap((track) => getRolesForTrack(track));

  return { props: { tracks, roles } };
}
