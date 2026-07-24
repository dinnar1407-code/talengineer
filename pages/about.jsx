import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './about.module.css';

// 站点根 URL：canonical / OG 用（照 /hire/[track] 房型模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// ── 数字纪律（诚实红线）────────────────────────────────────────────────────────
// 本页出现的所有平台数字，每个只写一次，且各有单一来源：
//   · 15% / 85% / founding 5% / 前 5 单  ← src/config/fees.js（措辞照 pages/pricing.jsx 先例）
//   · 10 题 / 40 分钟 / 70 分及格 / 7 天冷却 / 每池 20 套题  ← src/config/training.js
//   · TalScore 权重 25/25/30/20、贝叶斯平均、纠纷率 >10% 归零  ← src/services/talScore.js
// 除此之外零统计数字：不写团队规模、办公室、融资、GMV、用户数——没有的事不编。
// 需求/市场类表述一律只做结构性陈述（照 lib/regionGuides.js 的口径）。

// 文案字典：en/zh 两套全量，其余语言回退英文（全站 `|| en` 约定，SSR 首帧英文）。
const DICT = {
  en: {
    kicker: 'About Talengineer',
    title: 'Verified engineers for the factory floor',
    sub: 'Talengineer is a global marketplace for certified industrial automation engineers — PLC, robotics, machine vision and electrical. Our mission is to make proven automation skill hireable anywhere: verified before you commit, protected until the work is done.',

    // ── 我们在建什么（口径对齐 public/llms.txt 的定位段）────────────────────
    missionTitle: 'What we are building',
    mission1:
      'Hiring an industrial automation engineer is hard for a reason that has nothing to do with supply: a résumé cannot prove commissioning skill. Anyone can list "Siemens TIA Portal" or "Fanuc" on a profile. Whether they can actually write maintainable logic, debug a cell under time pressure, or make a vision system survive real-world lighting only shows up on the plant floor — usually at the most expensive possible moment. We are building the marketplace that closes that gap.',
    mission2:
      'On Talengineer, an employer describes what they need in natural language — in any of the 9 languages the platform speaks — and AI standardizes it into specs, a scope of work and a milestone plan, then recommends pre-screened, platform-certified engineers. Payment runs through milestone escrow: funds release only after the employer approves each milestone. On-site work is verified with GPS-geofenced check-ins and photo QC, and project chat is live-translated so both sides work in their own language.',
    mission3:
      'We serve two parallel lines of demand. Domestically in the US: manufacturers hiring certified automation engineers for on-site commissioning, retrofits and remote controls work. Cross-border: overseas manufacturers — for example, companies building plants in Mexico, Vietnam or Thailand — hiring local and cross-border engineers with bilingual collaboration built in from the first message.',

    // ── 方法论三卡（三道质量闸）─────────────────────────────────────────────
    methodTitle: 'How we verify skill',
    methodIntro:
      'Three quality gates stand between "claims a skill" and "can be assigned to your project". Each one is published, not proprietary hand-waving.',
    card1Title: 'Hands-on AI screening',
    card1Body:
      'Every engineer takes a practical AI technical screener in their claimed specialty — scenario questions that probe real judgment, not a keyword scan of a résumé. The score is server-signed and becomes the capability baseline that follows them through the platform: it drives default ranking in browse, unlocks the Verified badge, and unscreened profiles start at zero and can be filtered out by employers.',
    card2Title: 'Certification as an assignment gate',
    // 认证数字全部来自 src/config/training.js（10 题/40 分钟/70 分/7 天/20 套），只在这里出现一次。
    card2Body:
      'Four tracks — PLC, robotics, machine vision, electrical — at levels L1 to L3. Each exam is 10 questions in 40 minutes, mixing multiple-choice, scenario and deep-analysis questions; it is AI-graded and then human-reviewed before any certificate is issued. The pass mark is 70, a failed attempt triggers a 7-day cooldown, and papers draw from a bank of up to 20 exam sets per track, level and language, so the exam cannot be memorized. Only certified engineers can be assigned to projects: certification here is a gate, not a badge.',
    card2Link: 'Explore certification →',
    card3Title: 'A public quality score',
    // TalScore 权重与红线来自 src/services/talScore.js（25/25/30/20、贝叶斯、>10% 归零），只在这里出现一次。
    card3Body:
      'TalScore (0–100) weighs AI screening 25, platform certification 25, client ratings 30 and reliability 20. Ratings are Bayesian-averaged so a single five-star review cannot vault a newcomer to the top, and a dispute rate above 10% zeroes the reliability dimension outright. The full algorithm is public — you can read exactly how the number is computed.',
    card3Link: 'Read the TalScore algorithm →',

    // ── founding 阶段的诚实叙事（不编团队规模/办公室/融资）───────────────────
    stageTitle: 'Where we are today',
    stage1:
      'Talengineer is a founding-stage platform, and we would rather say that plainly than dress it up. The mechanisms this site describes — milestone escrow, certification exams, TalScore, the evidence-based dispute process — are live in production today. What we do not yet have is scale, and we will not pretend otherwise: you will find no invented user counts, no growth statistics and no fabricated logos here. Case studies are published one at a time, as real founding orders complete.',
    // founding 费率措辞照 pages/pricing.jsx 先例，数字单一来源 src/config/fees.js，只在这里出现一次。
    stage2:
      'Founding terms reflect that stage. The standard escrow fee is 15% — engineers keep 85% of every released milestone — and founding employers pay just 5% on their first 5 orders. The rate is read from a single backend configuration, so the fee you see is exactly the fee charged.',
    stage3:
      'That same discipline runs through the whole site: every platform number you read here traces back to one configuration source in the codebase, and market statements are kept structural — we describe how things work, not statistics we cannot stand behind.',
    stageLink: 'See full pricing →',

    // ── 联系块 ─────────────────────────────────────────────────────────────
    contactTitle: 'Get in touch',
    contactBody:
      'Questions, partnerships or press — write to us and a human will read it. If your question is about a specific project, the fastest route is to post it and let the AI structure the scope for you.',
    contactEmailLabel: 'Email',
    contactPageLink: 'All contact options →',

    // ── 底部 CTA ───────────────────────────────────────────────────────────
    ctaHeading: 'Work with us',
    ctaBody: 'Post a project for free, or apply to join as an engineer — applying and being listed is free.',
    ctaPost: 'Post a Project — Free',
    ctaApply: 'Apply as an Engineer',
  },

  zh: {
    kicker: '关于 Talengineer',
    title: '为工厂现场而生的持证工程师平台',
    sub: 'Talengineer 是面向持证工业自动化工程师的全球市场——PLC、机器人、机器视觉与电气。我们的使命：让被验证过的自动化技能在任何地方都能被雇到——签约之前先验证，交付完成才放款。',

    missionTitle: '我们在建什么',
    mission1:
      '雇一名工业自动化工程师之所以难，根源与供给无关：简历证明不了调试能力。谁都可以在档案里写上"Siemens TIA Portal"或"Fanuc"，但他能否写出可维护的逻辑、能否顶着时间压力排查一个工作站、能否让视觉系统扛住现实打光——这些只有到了车间现场才见分晓，而且往往在代价最高的时刻暴露。我们要建的，就是把这条鸿沟合上的市场。',
    mission2:
      '在 Talengineer 上，雇主用自然语言描述需求——平台支持的 9 种语言任选其一——AI 将其标准化为规格书、工作范围和里程碑计划，再推荐经过预筛、持平台认证的工程师。付款走里程碑托管：每个里程碑经雇主批准后资金才会释放。现场工作以 GPS 围栏签到和照片质检留证，项目聊天实时互译，双方各用各的母语协作。',
    mission3:
      '我们同时服务两条平行的需求线。美国本土：制造企业为现场调试、产线改造与远程控制工作雇佣持证自动化工程师。跨境：出海制造企业——例如在墨西哥、越南、泰国建厂的公司——雇佣当地及跨境工程师，双语协作从第一条消息起就是内建的。',

    methodTitle: '我们如何验证技能',
    methodIntro:
      '从"声称会"到"可以被指派到你的项目"，中间隔着三道质量闸。每一道都是公开的，不搞黑箱话术。',
    card1Title: '实操型 AI 筛选',
    card1Body:
      '每位工程师都会参加其所报方向的实操型 AI 技术筛选——用场景题考察真实判断力，而不是对简历做关键词扫描。筛选分由服务端签名落库，成为伴随其整个平台生涯的能力基线：决定浏览页默认排序、解锁 Verified 徽章；未筛选的档案从 0 分起步，雇主可一键过滤。',
    card2Title: '认证即指派门槛',
    // 认证数字全部来自 src/config/training.js（10 题/40 分钟/70 分/7 天/20 套），只在这里出现一次。
    card2Body:
      '四个方向——PLC、机器人、机器视觉、电气——各设 L1 至 L3 三个等级。每场考试 40 分钟 10 道题，混合选择题、场景题与深度分析题；先由 AI 评分，再经人工复核，才会发放任何证书。及格线 70 分，挂科后有 7 天冷却期，试卷从每个"方向×等级×语言"最多 20 套的题库中随机抽取，背题刷不穿。只有持证工程师才能被指派到项目：在这里，认证是门槛，不是徽章。',
    card2Link: '了解认证体系 →',
    card3Title: '公开的质量分',
    // TalScore 权重与红线来自 src/services/talScore.js（25/25/30/20、贝叶斯、>10% 归零），只在这里出现一次。
    card3Body:
      'TalScore（0–100 分）的权重构成：AI 筛选 25、平台认证 25、雇主评分 30、可靠性 20。评分采用贝叶斯平均——一条五星好评刷不动排名；纠纷率超过 10%，可靠性维度直接归零。完整算法全文公开——这个数字怎么算出来的，你可以逐条读到。',
    card3Link: '阅读 TalScore 算法 →',

    stageTitle: '我们现在走到哪了',
    stage1:
      'Talengineer 是一个 founding 阶段的平台——我们宁可把这句话说得明明白白，也不粉饰。本站描述的机制——里程碑托管、认证考试、TalScore、基于证据的纠纷流程——今天都真实运行在生产环境。我们还没有的，是规模；对此我们不装：这里没有编造的用户数、没有增长统计、没有虚构的客户 logo。案例研究一单一单发布，只在真实的 founding 订单完成之后。',
    // founding 费率措辞照 pages/pricing.jsx 先例，数字单一来源 src/config/fees.js，只在这里出现一次。
    stage2:
      'founding 阶段的条款也如实反映这一点：标准托管费 15%——工程师保留每笔已放款里程碑的 85%——founding 雇主前 5 单仅收 5%。费率取自单一的后端配置，你看到的费率就是实际收取的费率。',
    stage3:
      '同样的纪律贯穿全站：你在这里读到的每一个平台数字，都能追溯到代码库中唯一的配置来源；市场类表述一律保持结构性——我们描述事情如何运转，不写我们无法背书的统计数字。',
    stageLink: '查看完整定价 →',

    contactTitle: '联系我们',
    contactBody:
      '咨询、合作或媒体垂询——写信给我们，会有真人阅读。如果你的问题关乎一个具体项目，最快的路径是直接发布它，让 AI 帮你把范围结构化。',
    contactEmailLabel: '邮箱',
    contactPageLink: '全部联系方式 →',

    ctaHeading: '与我们同行',
    ctaBody: '免费发布项目，或以工程师身份申请入驻——申请与上架均不收费。',
    ctaPost: '免费发布项目',
    ctaApply: '以工程师身份申请',
  },
};

export default function About() {
  const [lang, setLang] = useLang();
  // 全站约定：只有 en/zh 有全量文案，其余语言回退英文（SSR 首帧也是英文）。
  const d = DICT[lang] || DICT.en;

  const canonical = `${SITE}/about`;
  const ogImage = `${SITE}/og.png`;

  // Organization 结构化数据：告诉搜索引擎/AI 引擎"这是平台主体介绍页"。
  // 只声明可核实的事实（名称/域名/logo/联系邮箱/定位描述），
  // 不写 foundingDate、numberOfEmployees、address 等未确认的实体字段（诚实红线）。
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Talengineer',
    url: SITE,
    logo: `${SITE}/img/logo-macaw.svg`,
    email: 'hello@talengineer.us',
    description: d.sub,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@talengineer.us',
      contactType: 'customer support',
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${d.title} | Talengineer`}</title>
        <meta name="description" content={d.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={d.title} />
        <meta name="twitter:description" content={d.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── 使命 Hero ─────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{d.kicker}</p>
          <h1 className={styles.heroTitle}>{d.title}</h1>
          <p className={styles.heroSub}>{d.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 我们在建什么 ─────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.missionTitle}</h2>
          <p className={styles.lead}>{d.mission1}</p>
          <p className={styles.lead}>{d.mission2}</p>
          <p className={styles.lead}>{d.mission3}</p>
        </div>

        {/* ── 方法论三卡：AI 筛选 / 认证指派门 / 公开 TalScore ─────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.methodTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.methodIntro}</p>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardStep}>01</div>
              <h3 className={styles.cardTitle}>{d.card1Title}</h3>
              <p className={styles.cardBody}>{d.card1Body}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardStep}>02</div>
              <h3 className={styles.cardTitle}>{d.card2Title}</h3>
              <p className={styles.cardBody}>{d.card2Body}</p>
              <Link href="/certification" className={styles.cardLink}>{d.card2Link}</Link>
            </div>
            <div className={styles.card}>
              <div className={styles.cardStep}>03</div>
              <h3 className={styles.cardTitle}>{d.card3Title}</h3>
              <p className={styles.cardBody}>{d.card3Body}</p>
              <Link href="/talscore" className={styles.cardLink}>{d.card3Link}</Link>
            </div>
          </div>
        </div>

        {/* ── founding 阶段诚实叙事 ────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.stageTitle}</h2>
          <p className={styles.lead}>{d.stage1}</p>
          <p className={styles.lead}>{d.stage2}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.stage3}</p>
          <Link href="/pricing" className={styles.inlineLink}>{d.stageLink}</Link>
        </div>

        {/*
          ── 实体信息占位槽（Terry 后补，勿删）───────────────────────────
          法人主体名称 / 注册地 / 经营地址等实体信息由 Terry 确认后再启用。
          启用方式：取消下方注释，并在 DICT 的 en/zh 两份里补上
          entityTitle / entityBody 文案（诚实红线：只写经核实的实体事实）。

          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>{d.entityTitle}</h2>
            <p className={styles.lead}>{d.entityBody}</p>
          </div>
        */}

        {/* ── 联系块 ───────────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{d.contactTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{d.contactBody}</p>
          <p className={styles.contactRow}>
            <span className={styles.contactLabel}>{d.contactEmailLabel}</span>
            <a href="mailto:hello@talengineer.us" className={styles.contactEmail}>
              hello@talengineer.us
            </a>
          </p>
          <Link href="/contact" className={styles.inlineLink}>{d.contactPageLink}</Link>
        </div>
      </div>

      {/* ── 底部 CTA ─────────────────────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{d.ctaHeading}</h2>
        <p>{d.ctaBody}</p>
        <div className={styles.ctaBtns}>
          <Link href="/talent" className={styles.btnPrimary}>{d.ctaPost}</Link>
          <Link href="/talent" className={styles.btnGhost}>{d.ctaApply}</Link>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
