import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useLang } from '../../hooks/useLang';
import styles from './hire.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 各地区费率区间（与 /rates 的地区基准一致，全站统一口径）。
const REGIONS = [
  { region: { en: 'North America', zh: '北美' }, rate: '$75–140/hr' },
  { region: { en: 'Western Europe', zh: '西欧' }, rate: '$70–120/hr' },
  { region: { en: 'Eastern Europe', zh: '东欧' }, rate: '$40–75/hr' },
  { region: { en: 'Mexico & Latin America', zh: '墨西哥及拉美' }, rate: '$35–65/hr' },
  { region: { en: 'China', zh: '中国' }, rate: '$35–70/hr' },
  { region: { en: 'Southeast Asia', zh: '东南亚' }, rate: '$30–55/hr' },
  { region: { en: 'India & South Asia', zh: '印度及南亚' }, rate: '$25–50/hr' },
];

// UI 标签（章节标题、按钮等），en/zh 两套。
const UI = {
  en: {
    heroApply: 'Apply as an Engineer',
    heroPost: 'Post a Project — Free',
    skillsTitle: 'Skills we screen for',
    verifyTitle: 'What platform certification verifies',
    verifyIntro:
      'Every engineer passes a practical AI technical screener before they can be matched. On top of that, they can earn certification in this track at three levels — and only certified engineers can be assigned to your project.',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    ratesNote:
      'Blended hourly rates from active engineer profiles, updated in real time. Development work sits toward the middle of each range; on-site commissioning carries a premium. Platform escrow fee is 15% (5% for founding customers).',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    l1: 'L1 — Fundamentals',
    l2: 'L2 — Independent',
    l3: 'L3 — Expert',
  },
  zh: {
    heroApply: '以工程师身份申请',
    heroPost: '免费发布项目',
    skillsTitle: '我们筛选的技能',
    verifyTitle: '平台认证验证什么',
    verifyIntro:
      '每位工程师在被匹配前都要通过一套实操型 AI 技术筛选。在此之上，还可在该方向考取三个级别的认证——只有持证工程师才能被指派到你的项目。',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    ratesNote:
      '来自活跃工程师档案的综合时薪，实时更新。开发类工作位于各区间中段，现场调试有溢价。平台托管费为 15%（founding 客户 5%）。',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    l1: 'L1 — 基础',
    l2: 'L2 — 独立',
    l3: 'L3 — 专家',
  },
};

// 四个方向的内容（plc / robotics / vision / electrical），en/zh 各一套。
const TRACKS = {
  plc: {
    serviceType: 'PLC Programming Talent',
    skills: ['Siemens TIA Portal', 'Rockwell Studio 5000', 'Ladder / ST', 'Mitsubishi', 'Beckhoff TwinCAT', 'Safety PLC'],
    en: {
      kicker: 'PLC & Controls',
      title: 'Hire Certified PLC Programmers',
      sub: 'Pre-screened Siemens, Rockwell, Mitsubishi and Beckhoff programmers — verified by practical assessment and ready to deliver on milestone escrow.',
      lead1:
        'PLC programming is the core of almost every automation project. The hard part of hiring is not finding people who list a platform on a résumé — it is confirming they can write clean, maintainable logic and commission it under pressure on your exact controller.',
      lead2:
        'We match by platform, not just by keyword. Whether your installed base is Siemens S7-1500 or Rockwell ControlLogix, you can filter to engineers whose depth has been demonstrated under test conditions.',
      l1: 'Solid fundamentals — executes well-specified ladder/ST work under some guidance.',
      l2: 'Owns a scope end to end, makes sound design decisions, delivers with minimal oversight.',
      l3: 'Architects control systems, handles difficult commissioning and safety, leads technically.',
    },
    zh: {
      kicker: 'PLC 与控制',
      title: '雇佣持证 PLC 程序员',
      sub: '经过预审的 Siemens、Rockwell、Mitsubishi、Beckhoff 程序员——实操验证，可在里程碑托管下交付。',
      lead1:
        'PLC 编程是几乎每个自动化项目的核心。招人真正的难点，不是找到简历上写着某个平台的人，而是确认他能写出干净、可维护的逻辑，并在你这台具体控制器上顶着压力完成调试。',
      lead2:
        '我们按平台匹配，而不只是按关键词。无论你的设备是 Siemens S7-1500 还是 Rockwell ControlLogix，都能筛出在测试条件下被验证过深度的工程师。',
      l1: '基础扎实——在一定指导下完成范围明确的 ladder/ST 工作。',
      l2: '能端到端负责一个范围，做出合理设计决策，少量监督即可交付。',
      l3: '能架构控制系统，处理疑难调试与安全，技术上带队。',
    },
  },
  robotics: {
    serviceType: 'Industrial Robotics Talent',
    skills: ['Fanuc', 'KUKA', 'ABB', 'Yaskawa', 'Cell commissioning', 'Path optimization'],
    en: {
      kicker: 'Robotics',
      title: 'Hire Certified Robotics Engineers',
      sub: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, programming and on-site commissioning — verified and escrow-protected.',
      lead1:
        'Robot cell commissioning is hands-on, high-pressure and platform-specific. A mistake is expensive and public, so this is exactly the phase where verified skill matters most.',
      lead2:
        'Our robotics engineers are screened on real path, tooling and integration problems, and can be certified at three levels so you can match seniority to the risk of the job.',
      l1: 'Executes taught programs and well-defined cell work with guidance.',
      l2: 'Programs and commissions a cell independently, integrates PLC and peripherals.',
      l3: 'Designs complex cells, tunes cycle time, leads difficult multi-robot commissioning.',
    },
    zh: {
      kicker: '机器人',
      title: '雇佣持证机器人工程师',
      sub: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、编程与现场调试——经过验证，托管保障。',
      lead1:
        '机器人工作站调试是高压、动手、平台专属的活。一旦出错代价高且显眼，所以这恰恰是最需要验证过技能的环节。',
      lead2:
        '我们的机器人工程师会在真实的路径、工装与集成问题上被筛选，并可考取三个级别的认证，让你按任务风险匹配资历。',
      l1: '在指导下执行示教程序与范围明确的工作站工作。',
      l2: '独立完成工作站编程与调试，集成 PLC 与外围设备。',
      l3: '设计复杂工作站，优化节拍，带队完成疑难的多机联调。',
    },
  },
  vision: {
    serviceType: 'Machine Vision Talent',
    skills: ['Cognex', 'Keyence', 'Halcon', 'Lighting & optics', 'Calibration', 'Inspection & guidance'],
    en: {
      kicker: 'Machine Vision',
      title: 'Hire Certified Machine Vision Engineers',
      sub: 'Inspection, guidance and measurement specialists across Cognex, Keyence and Halcon — verified where it counts: lighting, calibration and real-world variation.',
      lead1:
        'Machine vision is where "it worked in the lab" projects break on the floor. Lighting, optics, calibration and part-presentation variation decide whether a system is reliable — and none of that shows up on a résumé.',
      lead2:
        'We screen vision engineers on the practical judgment that separates a demo from a production-grade system, and certify them at three levels of depth.',
      l1: 'Configures well-defined inspections and sets up standard lighting.',
      l2: 'Designs robust inspection/guidance, handles calibration and variation independently.',
      l3: 'Architects demanding vision systems, solves difficult lighting and accuracy problems.',
    },
    zh: {
      kicker: '机器视觉',
      title: '雇佣持证机器视觉工程师',
      sub: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量专家——在真正关键处验证：打光、标定与现实变化。',
      lead1:
        '机器视觉正是"实验室里好好的、到现场就不对"的重灾区。打光、光学、标定与来料变化决定系统是否可靠——而这些简历上都看不出来。',
      lead2:
        '我们在"把 demo 和量产级系统区分开"的实操判断上筛选视觉工程师，并按三个深度级别发放认证。',
      l1: '配置范围明确的检测，搭建标准打光。',
      l2: '设计稳健的检测/引导，独立处理标定与变化。',
      l3: '架构高要求的视觉系统，解决疑难的打光与精度问题。',
    },
  },
  electrical: {
    serviceType: 'Industrial Electrical Engineering Talent',
    skills: ['Panel design', 'EPLAN', 'VFD / drives', 'Schematic capture', 'UL / IEC', 'Power distribution'],
    en: {
      kicker: 'Electrical',
      title: 'Hire Certified Electrical Engineers',
      sub: 'Panel design, drives and power specialists — EPLAN, UL/IEC and safe, buildable schematics, verified and escrow-protected.',
      lead1:
        'The electrical design decides whether a machine is safe, buildable and maintainable. Poor panel design and sloppy schematics create problems that surface at the worst possible time — during commissioning.',
      lead2:
        'Our electrical engineers are screened on real panel, drive and code-compliance problems, and can be certified at three levels so you get the right seniority for the job.',
      l1: 'Produces standard panel layouts and schematics under guidance.',
      l2: 'Designs compliant panels and drive systems independently, owns the electrical scope.',
      l3: 'Architects power distribution and complex electrical systems, handles code and safety.',
    },
    zh: {
      kicker: '电气',
      title: '雇佣持证电气工程师',
      sub: '电柜设计、驱动与配电专家——EPLAN、UL/IEC，安全且可施工的图纸，经过验证、托管保障。',
      lead1:
        '电气设计决定一台机器是否安全、可施工、可维护。糟糕的电柜设计和潦草的图纸，会在最糟糕的时刻——调试期间——集中爆发。',
      lead2:
        '我们在真实的电柜、驱动与合规问题上筛选电气工程师，并可考取三个级别的认证，让你为任务配到合适的资历。',
      l1: '在指导下完成标准电柜布局与图纸。',
      l2: '独立设计合规的电柜与驱动系统，负责电气范围。',
      l3: '架构配电与复杂电气系统，处理规范与安全。',
    },
  },
};

const TRACK_SLUGS = Object.keys(TRACKS);

export default function HireTrack({ track }) {
  const [lang, setLang] = useLang();
  const t = TRACKS[track];
  const c = t[lang] || t.en;
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/hire/${track}`;
  const ogImage = `${SITE}/og.png`;

  // Service 结构化数据：告诉搜索引擎这是一个"招募某方向工程师"的服务页。
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: t.serviceType,
    name: c.title,
    description: c.sub,
    areaServed: 'Worldwide',
    url: canonical,
    provider: { '@type': 'Organization', name: 'Talengineer', url: SITE },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

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
        <div className={styles.block}>
          <p className={styles.lead}>{c.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{c.lead2}</p>
        </div>

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.skillsTitle}</h2>
          <div className={styles.chips}>
            {t.skills.map((s) => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.verifyTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.verifyIntro}</p>
          <div className={styles.levelGrid}>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l1}</div>
              <p className={styles.levelDesc}>{c.l1}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l2}</div>
              <p className={styles.levelDesc}>{c.l2}</p>
            </div>
            <div className={styles.levelCard}>
              <div className={styles.levelTag}>{u.l3}</div>
              <p className={styles.levelDesc}>{c.l3}</p>
            </div>
          </div>
        </div>

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
          <p className={styles.note}>{u.ratesNote}</p>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
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

// 四个方向静态预渲染。
export async function getStaticPaths() {
  return {
    paths: TRACK_SLUGS.map((track) => ({ params: { track } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (!TRACKS[params.track]) return { notFound: true };
  return { props: { track: params.track } };
}
