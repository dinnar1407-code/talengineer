import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './certification.module.css';

// 站点根 URL：canonical / OG / JSON-LD 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四方向 × L1–L3 认证矩阵。方向口径与 src/routes/demand.js / pages/hire/[track].jsx 一致；
// 每级含义与考核规则的单一来源是 src/config/training.js（MAX_LEVEL=3，L(n) 须先持 L(n-1)）。
const LEVELS = [
  { n: 1, en: 'Fundamentals', zh: '基础' },
  { n: 2, en: 'Independent', zh: '独立' },
  { n: 3, en: 'Expert', zh: '专家' },
];

const TRACKS = [
  {
    key: 'plc',
    en: { name: 'PLC & Controls', cells: ['Executes specified ladder/ST work under guidance', 'Owns a control scope end to end', 'Architects control systems and safety'] },
    zh: { name: 'PLC 与控制', cells: ['在指导下完成范围明确的 ladder/ST 工作', '端到端负责一个控制范围', '架构控制系统，把关安全'] },
  },
  {
    key: 'robotics',
    en: { name: 'Robotics', cells: ['Runs taught programs and defined cell work', 'Programs and commissions a cell solo', 'Designs cells, leads multi-robot commissioning'] },
    zh: { name: '机器人', cells: ['执行示教程序与定义明确的工作站活', '独立完成工作站编程与调试', '设计复杂工作站，带队多机联调'] },
  },
  {
    key: 'vision',
    en: { name: 'Machine Vision', cells: ['Configures inspections and standard lighting', 'Designs robust inspection, calibrates solo', 'Architects demanding vision systems'] },
    zh: { name: '机器视觉', cells: ['配置检测，搭建标准打光', '设计稳健检测，独立标定', '架构高要求的视觉系统'] },
  },
  {
    key: 'electrical',
    en: { name: 'Electrical', cells: ['Produces standard panel layouts and schematics', 'Designs compliant panels and drives solo', 'Architects power distribution and safety'] },
    zh: { name: '电气', cells: ['完成标准电柜布局与图纸', '独立设计合规的电柜与驱动', '架构配电，把关规范与安全'] },
  },
];

// 认证漏斗 —— 每一级写清"卡什么"。数字取自 src/config/training.js（40 分钟 / 10 题 / 70 分 / 7 天冷却）。
// 诚实空态：平台在 beta，没有真实通过率数据，此处不编任何百分比。
const FUNNEL = {
  en: [
    { step: 'Enroll', gate: 'Pick a track and level. L1 is open to everyone; L2 and L3 unlock only after you hold the level below.' },
    { step: 'Study & log time', gate: 'Work through the AI learning path. Study time is timed on the server, not self-reported.' },
    { step: 'AI exam', gate: '40 minutes, 10 questions (5 multiple-choice + 3 scenario + 2 deep-analysis). You need 70/100 to pass.' },
    { step: 'Human review', gate: 'Passing the AI grader is not enough. An admin reviews the paper by hand before anything is issued.' },
    { step: 'Certificate issued', gate: 'The credential is recorded on your engineer profile for employers to see.' },
    { step: 'Assignment unlocked', gate: 'Only now can you be assigned to official on-site projects in that track. No certificate, no assignment.' },
  ],
  zh: [
    { step: '报名', gate: '选方向与等级。L1 对所有人开放；L2、L3 只有持有下一级证书后才解锁。' },
    { step: '学习打卡', gate: '走完 AI 学习路径。学习时长由服务端计时，不是自己报的。' },
    { step: 'AI 实测', gate: '40 分钟，10 题（5 选择 + 3 场景短答 + 2 深度分析）。满分 100，需达 70 分。' },
    { step: '人工复核', gate: '过了 AI 评分还不够。发证前，admin 会逐题人工阅卷把关。' },
    { step: '发证', gate: '证书记入你的工程师档案，雇主可见。' },
    { step: '解锁指派资格', gate: '到这一步才能被指派到该方向的正式现场项目。没有证书，就没有指派。' },
  ],
};

// 反作弊设计 —— 机制叙事，不编数据。数字取自 src/config/training.js（题库 20 套 / 冷却 7 天 / 限时 40 分钟）。
const ANTICHEAT = {
  en: [
    { title: 'Randomized question bank', body: 'Up to 20 exam sets are stored per track × level × language. Every attempt draws one at random, so memorizing a single paper gets you nowhere.' },
    { title: 'Server-side timer', body: 'The 40-minute deadline is enforced on the server. The browser clock is never trusted; a late submission is marked expired.' },
    { title: 'Failure cooldown', body: 'Fail an exam and you wait 7 days before retaking the same track and level — enough to close the door on brute-forcing the bank.' },
    { title: 'Server-side grading', body: 'Multiple-choice answer keys never reach the browser. Grading happens on the server, so you cannot read the answers out of the network tab.' },
  ],
  zh: [
    { title: '随机题库', body: '每 方向 × 等级 × 语言 存最多 20 套考卷。每次开考随机抽一套，背下单套题毫无用处。' },
    { title: '服务端计时', body: '40 分钟的截止时间由服务端把控。浏览器时间从不采信；超时交卷判 expired。' },
    { title: '挂科冷却', body: '挂科后，同方向同等级需等 7 天才能重考——足以关上暴力刷题库的门。' },
    { title: '服务端判分', body: '选择题的答案键绝不下发到浏览器。判分在服务端进行，F12 看网络请求也抄不到答案。' },
  ],
};

const UI = {
  en: {
    kicker: 'Certification',
    title: 'A certificate here is a hard gate, not a badge',
    sub: 'Our certification is not decoration for a profile. It is the switch that decides whether an engineer can be assigned to a project at all. Here is exactly what it takes to earn one — and why it is hard to fake.',
    ctaPrimary: 'Start your certification',
    ctaGhost: 'How the quality score uses it',
    matrixTitle: 'Four tracks, three levels',
    matrixIntro: 'Every track certifies at three levels, from supervised fundamentals to independent expert. You cannot skip a level.',
    progressNote: 'Levels are cumulative: you must hold L1 before attempting L2, and L2 before L3. Each level is a separate timed exam.',
    funnelTitle: 'From enrollment to assignment',
    funnelIntro: 'Six gates, each one blocking the next until it is cleared. We show what each gate checks — not made-up pass rates, because the platform is still in beta and we will not invent numbers.',
    antiTitle: 'Designed against shortcuts',
    antiIntro: 'The exam is built so that the only way through is to actually know the material.',
    relTitle: 'Where the exam lives',
    relBody: 'Certification is earned through the training module. Study the AI learning path, then take the timed exam there — this page explains the rules, /training is where you sit them.',
    relCta: 'Go to /training to enroll',
    ctaHeading: 'Prove it under exam conditions',
    ctaBody: 'Get certified, and unlock the projects that require verified, on-site-ready engineers.',
  },
  zh: {
    kicker: '认证',
    title: '这里的证书是硬门禁，不是徽章装饰',
    sub: '我们的认证不是档案上的点缀。它是决定一位工程师能不能被指派到项目的那个开关。这里把拿到它到底要过几关、为什么难作假，全部讲清楚。',
    ctaPrimary: '开始你的认证',
    ctaGhost: '质量分怎么用它',
    matrixTitle: '四方向，三等级',
    matrixIntro: '每个方向都在三个等级上发证，从需监督的基础到能独立的专家。你不能跳级。',
    progressNote: '等级是累进的：考 L2 须先持 L1，考 L3 须先持 L2。每一级都是一场独立的限时考试。',
    funnelTitle: '从报名到指派',
    funnelIntro: '六道关，每一道都拦住下一道，直到通过为止。我们只讲每道关卡查什么——不编通过率，因为平台仍在 beta，我们不会造数字。',
    antiTitle: '为对付走捷径而设计',
    antiIntro: '这场考试的设计，让唯一的通过方式就是真的掌握内容。',
    relTitle: '考试在哪里',
    relBody: '认证通过培训模块考取。先走完 AI 学习路径，再到那里参加限时考试——本页讲规则，/training 是真正考试的地方。',
    relCta: '去 /training 报名',
    ctaHeading: '在考试条件下证明自己',
    ctaBody: '考取认证，解锁那些需要经过验证、可上现场的工程师的项目。',
  },
};

export default function Certification() {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  const funnel = FUNNEL[lang] || FUNNEL.en;
  const anticheat = ANTICHEAT[lang] || ANTICHEAT.en;

  const canonical = `${SITE}/certification`;
  const ogImage = `${SITE}/og.png`;

  // JSON-LD：4 方向 × 3 等级的认证体系。credentialCategory=certificate，颁发方=Talengineer。
  const credentialsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Talengineer platform certifications',
    itemListElement: TRACKS.flatMap((track, ti) =>
      LEVELS.map((lvl, li) => ({
        '@type': 'ListItem',
        position: ti * LEVELS.length + li + 1,
        item: {
          '@type': 'EducationalOccupationalCredential',
          name: `${track.en.name} — Level ${lvl.n} (${lvl.en})`,
          description: track.en.cells[li],
          credentialCategory: 'certificate',
          educationalLevel: `L${lvl.n} — ${lvl.en}`,
          competencyRequired: track.en.cells[li],
          recognizedBy: { '@type': 'Organization', name: 'Talengineer', url: SITE },
          url: canonical,
        },
      })),
    ),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`Certification — a hard gate, not a badge | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Talengineer certification — a hard gate for on-site assignment" />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talengineer certification — a hard gate for on-site assignment" />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(credentialsJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/training" className={styles.btnPrimary}>{u.ctaPrimary}</Link>
            <Link href="/talscore" className={styles.btnGhost}>{u.ctaGhost}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 4×3 认证矩阵 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.matrixTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.matrixIntro}</p>
          <div className={styles.matrix}>
            {TRACKS.map((track) => {
              const c = track[lang] || track.en;
              return (
                <div key={track.key} className={styles.matrixRow}>
                  <div className={styles.matrixTrack}>{c.name}</div>
                  <div className={styles.matrixCells}>
                    {LEVELS.map((lvl, i) => (
                      <div key={lvl.n} className={styles.matrixCell}>
                        <div className={styles.cellLevel}>
                          L{lvl.n} · {lvl[lang] || lvl.en}
                        </div>
                        <div className={styles.cellDesc}>{c.cells[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.note}>{u.progressNote}</p>
        </div>

        {/* 认证漏斗 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.funnelTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.funnelIntro}</p>
          <ol className={styles.funnel}>
            {funnel.map((f, i) => (
              <li key={f.step} className={styles.funnelStep}>
                <div className={styles.funnelNum}>{i + 1}</div>
                <div className={styles.funnelBody}>
                  <div className={styles.funnelName}>{f.step}</div>
                  <div className={styles.funnelGate}>{f.gate}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 反作弊设计 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.antiTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.antiIntro}</p>
          <div className={styles.antiGrid}>
            {anticheat.map((a) => (
              <div key={a.title} className={styles.antiCard}>
                <div className={styles.antiCardTitle}>{a.title}</div>
                <p className={styles.antiBody}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 与 /training 的关系 */}
        <div className={styles.block}>
          <div className={styles.relCard}>
            <h2 className={styles.relTitle}>{u.relTitle}</h2>
            <p className={styles.relBody}>{u.relBody}</p>
            <Link href="/training" className={styles.btnPrimary}>{u.relCta}</Link>
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <div className={styles.heroBtns} style={{ justifyContent: 'center' }}>
          <Link href="/training" className={styles.btnPrimary}>{u.ctaPrimary}</Link>
          <Link href="/talscore" className={styles.btnGhost}>{u.ctaGhost}</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/training">Training</Link> ·{' '}
          <Link href="/talscore">TalScore</Link> ·{' '}
          <Link href="/talent">Find Engineers</Link>
        </p>
      </footer>
    </div>
  );
}
