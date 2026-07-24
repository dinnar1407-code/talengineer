import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './how-it-works.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track]、/pricing、/trust 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// ── 页内文案词典（en / zh 两套，其余 7 语沿用全站 `|| en` 回退约定）────────────
//
// 数字纪律（诚实红线）：本页每个平台数字只写一次，且都标注单一来源：
//   - 「9 种语言」          ← hooks/useLang.js SUPPORTED（雇主流第 1 步）
//   - 「15% / 5% / 前 5 单」 ← src/config/fees.js PLATFORM_FEE + pricing.jsx founding 口径（雇主流第 6 步）
//   - 「10 题 / 40 分钟 / 70 分 / L1–L3 / 7 天冷却」 ← src/config/training.js（工程师流第 3 步）
//   - 「25 / 25 / 30 / 20」  ← src/services/talScore.js WEIGHTS（质量三闸 TalScore 卡）
//   - 「5 天举证窗口」       ← src/routes/disputes.js（措辞对齐 pages/trust.jsx）
// 除上述之外零统计数字——不编造成交量、匹配率、工程师人数。
// FAQ 刻意与 /pricing 的 FAQ 不重复（那边覆盖费率计算/谁付费/founding 资格/退款/跨境/发票）。
const UI = {
  en: {
    metaTitle: 'How It Works — From Brief to Released Milestone | Talengineer',
    metaDesc:
      'The full Talengineer flow on both sides: employers post, AI structures the scope, certified engineers deliver against milestone escrow with a GPS and photo evidence trail; engineers apply free, pass a practical screen, get certified, and are paid through Stripe Connect on release.',
    kicker: 'How it works',
    heroTitle: 'From a posted brief to a released milestone.',
    heroSub:
      'Talengineer connects manufacturers with certified industrial-automation engineers across borders. Here is the full journey on both sides of the marketplace — what gets verified, when money moves, and what protects each party at every step.',
    ctaPost: 'Post a Project — Free',
    ctaApply: 'Apply as an Engineer',

    lead1:
      'Cross-border engineering work fails for predictable reasons: skills that cannot be verified, scopes that mean different things to each side, and payment terms that force one party to simply trust the other. Every step below exists to remove one of those failure modes — skills are tested instead of claimed, scope is structured before any money moves, and payment sits in escrow until work is approved.',
    lead2:
      'The same flow protects both sides. Employers never pay for work they have not approved; engineers never start work that is not already funded.',

    // ── 雇主 6 步流 ─────────────────────────────────────────────────
    empTag: 'For employers',
    empTitle: 'Hiring in six steps',
    empLead:
      'From the moment you describe the job to the moment funds release, every checkpoint is designed so you commit money only against verified people and inspectable deliverables.',
    empSteps: [
      {
        n: '1',
        title: 'Post your project — in your own language',
        // 「9 种语言」唯一出处：hooks/useLang.js SUPPORTED 共 9 项。
        desc: 'Describe the machine, the control platform, the site and the deadline in whichever of the platform’s 9 supported languages you work in. Posting costs nothing, and you don’t need to translate anything — the platform handles language from here on.',
      },
      {
        n: '2',
        title: 'AI structures it into a scope and milestones',
        desc: 'The platform’s AI reads your description and turns it into a structured technical scope with a milestone plan — deliverable by deliverable — so both sides negotiate against the same document instead of a vague brief. Payment checkpoints end up mapped to concrete engineering outcomes, not calendar dates.',
      },
      {
        n: '3',
        title: 'Match with certified engineers — and choose',
        desc: 'You are matched to engineers by track, platform and region, ranked by verified screening scores and ratings — and only engineers holding a valid platform certification can be officially assigned to your project (in the track you specify, if you require one). You review the matches and decide who to work with; nothing is committed until you choose.',
      },
      {
        n: '4',
        title: 'Fund the milestone into escrow',
        desc: 'You fund each milestone through Stripe Checkout. It is marked funded only after the payment actually clears, and it stays in escrow until you approve the deliverable — so the engineer starts knowing the money is secured, and you start knowing it cannot move without you.',
      },
      {
        n: '5',
        title: 'Delivery with an evidence trail',
        desc: 'For on-site work, the engineer checks in by GPS against a server-side geofence — the location cannot be faked client-side — and submits QC completion photos that attach to the milestone. Remote progress is logged in the project workroom, where messages are translated between your language and the engineer’s.',
      },
      {
        n: '6',
        title: 'Approve and release',
        // 「15% / 5% / 前 5 单」唯一出处：src/config/fees.js PLATFORM_FEE=0.15 +
        // founding 让利口径照 pricing.jsx（前 5 家签约雇主、各自前 5 单）。
        desc: 'Funds move only on your approval — never on a timer. On release, the platform fee is deducted from the milestone: 15% standard, or 5% for founding clients on their first 5 orders. That fee is the only charge; there is no separate markup on the engineer’s rate.',
      },
    ],

    // ── 工程师 5 步流 ───────────────────────────────────────────────
    engTag: 'For engineers',
    engTitle: 'Joining in five steps',
    engLead:
      'The path from application to first payout is built around one idea: prove skill once, properly, and let that verified record — not marketing — win you the work.',
    engSteps: [
      {
        n: '1',
        title: 'Apply — it’s free',
        desc: 'Create your engineer profile with your tracks, platforms, region and rate. Applying costs nothing, and there is no bidding treadmill afterwards: projects are matched to verified skill, not auctioned to the lowest quote.',
      },
      {
        n: '2',
        title: 'Pass the practical AI screen',
        desc: 'As part of onboarding, you complete a hands-on AI technical interview in your discipline. It scores real engineering judgment — the kind that doesn’t show up in résumé keywords — and that score becomes the verified score on your profile, feeding your ranking in browse and matches.',
      },
      {
        n: '3',
        title: 'Get certified — L1 to L3',
        // 考试数字唯一出处：src/config/training.js —— QUESTIONS_PER_EXAM=10、
        // EXAM_MINUTES=40、PASS_SCORE=70、RETAKE_COOLDOWN_DAYS=7、MAX_LEVEL=3，
        // AI 判分 + admin 复核后才发证（ai_passed ≠ 发证）。
        desc: 'Certification is what unlocks assignments. Each exam is 10 questions — a mix of multiple-choice, scenario and deep-analysis items — in a 40-minute window, with a pass mark of 70. AI grades the paper and a human admin reviews every pass before a certificate is issued; a failed attempt carries a 7-day cooldown before retake. Levels run L1 to L3, and each level requires holding the one below it.',
      },
      {
        n: '4',
        title: 'Get matched',
        desc: 'Employers’ projects are matched to certified engineers by track, platform and region. When you are matched, you see the structured scope and milestone plan up front — and the milestone is funded into escrow before you start, so you never begin work on a promise.',
      },
      {
        n: '5',
        title: 'Get paid through Stripe Connect on release',
        desc: 'When the employer approves a milestone, escrow releases to your connected Stripe account minus the platform fee — no invoicing chase, no net-60 terms. Where Stripe payouts are not yet available in your country, the platform processes a manual payout instead.',
      },
    ],

    // ── 质量三闸 ───────────────────────────────────────────────────
    gatesTag: 'Quality gates',
    gatesTitle: 'Three gates between an applicant and your project',
    gatesLead:
      'Matching is only as good as the vetting behind it. Three independent gates stand between someone applying and someone being assigned to your project — each enforced by the platform, not self-reported, and each with its own page explaining exactly how it works.',
    gates: [
      {
        icon: '🧪',
        title: 'Practical screen',
        desc: 'Every engineer takes a hands-on AI technical interview during onboarding. It tests the judgment a résumé cannot show — how someone actually reasons through a commissioning problem in their discipline — and the result becomes the verified score shown on their profile.',
        linkLabel: 'Apply as an engineer →',
        href: '/talent',
      },
      {
        icon: '🎓',
        title: 'Certification gate',
        desc: 'Only engineers holding a valid platform certification can be officially assigned to a project — and when your project specifies a required certification track, the certificate must be in that track. The certificate is checked again at on-site check-in, so a revoked badge stops work at the door.',
        linkLabel: 'Certification exams →',
        href: '/certification',
      },
      {
        icon: '📊',
        title: 'TalScore',
        // 权重唯一出处：src/services/talScore.js WEIGHTS = { ai:25, certification:25, rating:30, reliability:20 }；
        // 贝叶斯先验与纠纷红线同文件。
        desc: 'A single 0–100 quality score weighting the AI screen at 25, certification at 25, employer ratings at 30 and delivery reliability at 20. Ratings use a Bayesian average so one 5-star review cannot game the ranking, and a high dispute rate zeroes the reliability dimension outright.',
        linkLabel: 'How TalScore works →',
        href: '/talscore',
      },
    ],

    // ── 纠纷路径 ───────────────────────────────────────────────────
    dispTag: 'When something goes wrong',
    dispTitle: 'The dispute path is built into the escrow',
    dispLead:
      'If a delivery is contested, the money does not move while you argue. Either party can trigger a process with a fixed evidence window and a human decision at the end:',
    dispSteps: [
      {
        n: '1',
        title: 'Open',
        desc: 'Either party opens a dispute on a funded milestone. It is immediately frozen to “disputed” — no funds can move while it is under review.',
      },
      {
        n: '2',
        title: 'Evidence',
        // 「5 天举证窗口」唯一出处：src/routes/disputes.js（措辞对齐 pages/trust.jsx）。
        desc: 'Both sides have a 5-day window to submit evidence. Each party’s side is recorded server-side from their role in the project — it cannot be spoofed.',
      },
      {
        n: '3',
        title: 'Admin review',
        desc: 'A platform admin reviews the milestone spec and both evidence submissions before any funds move — the decision is human, made against the written scope.',
      },
      {
        n: '4',
        title: 'Resolution',
        desc: 'The admin rules for the engineer, for the employer, or a split. A ruling for the employer refunds the full escrowed amount to the original payment method; a split refunds the balance not awarded.',
      },
    ],
    dispNote: 'Full detail on escrow, disputes, identity verification and the on-site evidence chain lives in the Trust Center.',
    dispLink: 'Read the Trust Center →',

    // ── FAQ（刻意不与 /pricing FAQ 重复）────────────────────────────
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Do I choose the engineer, or does the platform assign one?',
        a: 'You choose. The platform’s job is to narrow the field: it matches your project to engineers by track, platform and region, ranked by verified screening score and ratings, and you decide who to work with. Only engineers holding a valid platform certification can be officially assigned — in the track you specify, if you require one. Nothing is committed until you have chosen an engineer and funded a milestone yourself.',
      },
      {
        q: 'How are engineers vetted before they appear in a match?',
        a: 'Three ways, all enforced by the platform rather than self-reported: a practical AI technical screen taken at onboarding that sets a verified score on their profile, a certification exam gate — only certified engineers can be officially assigned, and in the track you require if you specify one — and TalScore, an ongoing quality score built from screen results, certifications, employer ratings and delivery reliability that powers browse sorting and pool shortlists.',
      },
      {
        q: 'What is the difference between the AI screen and platform certification?',
        a: 'The screen is a hands-on technical interview engineers take during onboarding; it feeds the verified score on their profile and their ranking in browse and matches. Certification is a separate, deeper exam track with graded levels — AI scores each paper and a human admin reviews it before any certificate is issued. The screen shapes how visible and well-ranked an engineer is; certification is the hard gate that allows them to be officially assigned to your project.',
      },
      {
        q: 'Can work be delivered on-site as well as remotely?',
        a: 'Yes. On-site commissioning is a first-class flow: the engineer must hold a valid certification to check in at the site, the check-in location is computed on the server against a geofence so it cannot be faked, and completion photos attach to the milestone as the record you approve against.',
      },
      {
        q: 'Will escrow release automatically if I forget to review a delivery?',
        a: 'No. Funds move only on your explicit approval — the platform never auto-releases on a timer. If you and the engineer disagree about a delivery, either side can open a dispute, which freezes the milestone until an admin has reviewed the evidence from both parties.',
      },
      {
        q: 'How do milestones get defined for my project?',
        a: 'When you post, the platform’s AI structures your description into a technical scope and a milestone plan, so payment checkpoints map to concrete deliverables — a design reviewed, a cell commissioned — rather than calendar dates. Each milestone is then funded and approved separately, which keeps every payment tied to something you can inspect.',
      },
    ],

    finalTitle: 'See the whole flow on one milestone',
    finalSub: 'Post a project for free, fund a single milestone, and watch every step on this page work before you approve.',
  },

  zh: {
    metaTitle: '运作方式 — 从需求描述到里程碑放款 | Talengineer',
    metaDesc:
      'Talengineer 双边完整流程：雇主发布需求、AI 结构化拆解范围、持证工程师在里程碑托管下交付（GPS + 照片证据链）；工程师免费申请、通过实操筛选、考取认证、放款时经 Stripe Connect 收款。',
    kicker: '运作方式',
    heroTitle: '从一份需求描述，到一笔放款的里程碑。',
    heroSub:
      'Talengineer 连接出海制造企业与全球持证工业自动化工程师。这里是市场两侧的完整旅程——哪些环节被验证、钱在什么时候流动、每一步保护的是谁。',
    ctaPost: '免费发布项目',
    ctaApply: '以工程师身份申请',

    lead1:
      '跨境工程合作的失败原因高度可预测：技能无法验证、范围双方各有各的理解、付款条款迫使一方对另一方全然信任。下面的每一步都为消除其中一个失败模式而存在——技能靠测试而不是靠自述，范围在资金流动前先被结构化，付款则一直托管到工作被验收为止。',
    lead2:
      '同一套流程同时保护双方：雇主绝不为未验收的工作付钱，工程师绝不为没注资的项目开工。',

    empTag: '面向雇主',
    empTitle: '招聘六步流',
    empLead:
      '从你描述需求到资金放款，每个检查点的设计目标都一样：只让你把钱押在经过验证的人和可检验的交付物上。',
    empSteps: [
      {
        n: '1',
        title: '用你自己的语言发布项目',
        // 「9 种语言」唯一出处：hooks/useLang.js SUPPORTED 共 9 项。
        desc: '用平台支持的 9 种语言中你最顺手的那一种，描述设备、控制平台、现场与工期。发布不收费，也不需要你翻译任何内容——从这一刻起，语言由平台处理。',
      },
      {
        n: '2',
        title: 'AI 把需求结构化成范围与里程碑',
        desc: '平台的 AI 读取你的描述，把它拆解成结构化的技术范围和逐项交付的里程碑计划——让双方对着同一份文档谈，而不是对着一段含糊的简述各自想象。付款节点因此对应到具体的工程产出，而不是日历日期。',
      },
      {
        n: '3',
        title: '匹配持证工程师——由你选人',
        desc: '你的项目按方向、平台与地区匹配工程师，并按验证过的筛选分与评价排序——只有持有有效平台认证的工程师才能被正式指派到项目（如果你为项目指定了认证方向，还须持有该方向的证书）。你审阅匹配结果、决定与谁合作；在你选定之前，什么都不会发生。',
      },
      {
        n: '4',
        title: '为里程碑注资入托管',
        desc: '你通过 Stripe Checkout 为每个里程碑注资。付款真正到账后才标记为已托管，且在你验收交付前一直停在托管里——工程师开工时知道钱已锁定，你也知道没有你的批准它动不了。',
      },
      {
        n: '5',
        title: '带证据链的交付',
        desc: '现场作业时，工程师按服务端地理围栏做 GPS 签到——位置在服务端计算，客户端无法造假——并提交附在里程碑上的质检完工照片。远程进展则记录在项目作战室里，消息在你和工程师各自的语言之间自动翻译。',
      },
      {
        n: '6',
        title: '验收并放款',
        // 「15% / 5% / 前 5 单」唯一出处：src/config/fees.js PLATFORM_FEE=0.15 +
        // founding 让利口径照 pricing.jsx（前 5 家签约雇主、各自前 5 单）。
        desc: '资金只在你批准时流动——绝不按倒计时自动放款。放款时从里程碑中扣除平台费：标准 15%，founding 客户前 5 单为 5%。这笔费用是唯一的收费，工程师费率上没有另外的加价。',
      },
    ],

    engTag: '面向工程师',
    engTitle: '入驻五步流',
    engLead:
      '从申请到第一笔到账，整条路径围绕一个理念：把技能认认真真地证明一次，然后让这份被验证的记录——而不是营销——替你赢得项目。',
    engSteps: [
      {
        n: '1',
        title: '申请——免费',
        desc: '创建你的工程师档案：方向、平台、地区与费率。申请不收任何费用，之后也没有竞价跑步机：项目按被验证的技能匹配，而不是拍卖给报价最低的人。',
      },
      {
        n: '2',
        title: '通过实操 AI 筛选',
        desc: '入驻流程中，你要完成本专业的实操型 AI 技术面试。它打分的是真实的工程判断——那种简历关键词里看不出来的东西——这个分数会成为你档案上的筛选分，计入浏览排序与匹配。',
      },
      {
        n: '3',
        title: '考取认证——L1 到 L3',
        // 考试数字唯一出处：src/config/training.js —— QUESTIONS_PER_EXAM=10、
        // EXAM_MINUTES=40、PASS_SCORE=70、RETAKE_COOLDOWN_DAYS=7、MAX_LEVEL=3，
        // AI 判分 + admin 复核后才发证（ai_passed ≠ 发证）。
        desc: '认证是解锁指派的钥匙。每卷 10 题——选择题、场景题与深度分析题混合——限时 40 分钟，及格线 70 分。AI 判分之后，每一份通过的试卷都要经人工 admin 复核才会发证；挂科后有 7 天冷却期方可重考。等级从 L1 到 L3，考更高一级须先持有低一级的有效认证。',
      },
      {
        n: '4',
        title: '获得匹配',
        desc: '雇主的项目按方向、平台与地区匹配给持证工程师。匹配后你会预先看到结构化的范围与里程碑计划——且里程碑在你开工前就已注资入托管，你永远不必为一句承诺开工。',
      },
      {
        n: '5',
        title: '放款时经 Stripe Connect 收款',
        desc: '雇主验收里程碑后，托管扣除平台费放款到你绑定的 Stripe 账户——不用追着开发票，也没有 60 天账期。若你所在国家暂不支持 Stripe 放款，平台会改用人工打款处理。',
      },
    ],

    gatesTag: '质量三闸',
    gatesTitle: '从申请人到你的项目之间，隔着三道闸',
    gatesLead:
      '匹配的质量取决于背后的审核。任何人从提交申请到被指派上你的项目，中间隔着三道彼此独立的闸门——每一道都由平台强制执行而非自述，每一道都有专门页面讲清楚它究竟怎么运作。',
    gates: [
      {
        icon: '🧪',
        title: '实操筛选',
        desc: '每位工程师在入驻时都要通过一场实操型 AI 技术面试。它测的是简历展示不了的判断力——一个人在自己专业里究竟怎样推演一个调试问题——结果会成为档案上展示的筛选分。',
        linkLabel: '以工程师身份申请 →',
        href: '/talent',
      },
      {
        icon: '🎓',
        title: '认证指派门',
        desc: '只有持有有效平台认证的工程师才能被正式指派到项目——如果项目指定了必需的认证方向，证书还必须属于该方向。证书在现场签到时还会再查一次，证被吊销就当场拦在门口。',
        linkLabel: '认证考试 →',
        href: '/certification',
      },
      {
        icon: '📊',
        title: 'TalScore 质量分',
        // 权重唯一出处：src/services/talScore.js WEIGHTS = { ai:25, certification:25, rating:30, reliability:20 }；
        // 贝叶斯先验与纠纷红线同文件。
        desc: '一个 0–100 的综合质量分：AI 筛选占 25、平台认证占 25、雇主评分占 30、交付可靠性占 20。评分用贝叶斯平均，一条五星好评刷不动排名；纠纷率过高则可靠性维度直接归零。',
        linkLabel: 'TalScore 如何计算 →',
        href: '/talscore',
      },
    ],

    dispTag: '万一出问题',
    dispTitle: '纠纷路径就长在托管里',
    dispLead:
      '交付有争议时，钱不会在争论期间流动。任一方都可以触发一套有固定举证窗口、最终由人裁决的流程：',
    dispSteps: [
      {
        n: '1',
        title: '开纠纷',
        desc: '任一当事方都可对已托管里程碑开纠纷。它会被立即冻结为"争议中"——复核期间没有任何资金能流动。',
      },
      {
        n: '2',
        title: '举证',
        // 「5 天举证窗口」唯一出处：src/routes/disputes.js（措辞对齐 pages/trust.jsx）。
        desc: '双方有 5 天窗口提交证据。每一方属于哪一侧由服务端按其在项目中的身份判定——无法伪造。',
      },
      {
        n: '3',
        title: 'admin 复核',
        desc: '在任何资金流动之前，平台 admin 会对照里程碑规格审阅双方提交的证据——裁决由人做出，依据是白纸黑字的范围。',
      },
      {
        n: '4',
        title: '裁决',
        desc: 'admin 判给工程师、判给雇主，或分账。判给雇主则托管全额原路退回原支付方式；分账则退回未判给对方的那部分。',
      },
    ],
    dispNote: '关于托管、纠纷、身份核验与现场证据链的完整细节，都在信任中心。',
    dispLink: '阅读信任中心 →',

    faqTitle: '常见问题',
    faqs: [
      {
        q: '是我自己选工程师，还是平台指定？',
        a: '你自己选。平台的职责是收窄候选范围：按方向、平台与地区匹配工程师，并按验证过的筛选分与评价排序，最终与谁合作由你决定。只有持有有效平台认证的工程师才能被正式指派——如果你为项目指定了认证方向，还须持有该方向证书。在你选定工程师并亲自为里程碑注资之前，什么都不会发生。',
      },
      {
        q: '工程师在出现在匹配结果里之前，经过了哪些审核？',
        a: '三道，全部由平台强制执行而非自述：入驻时的实操型 AI 技术筛选，结果成为档案上的筛选分；认证考试指派门——只有持证工程师才能被正式指派，且如项目指定方向须持有该方向证书；以及 TalScore——由筛选成绩、认证、雇主评分与交付可靠性共同构成的持续质量分，驱动浏览排序与人才池筛选。',
      },
      {
        q: 'AI 筛选和平台认证有什么区别？',
        a: '筛选是入驻时的实操技术面试，结果计入档案的筛选分，影响浏览排序与匹配。认证则是另一条更深的考核轨道，分等级递进——AI 给每份试卷打分，且任何证书发出前都要经人工 admin 复核。筛选决定一个工程师排名靠不靠前；认证才是决定他能否被正式指派到你项目上的硬门槛。',
      },
      {
        q: '既支持远程，也支持现场交付吗？',
        a: '支持。现场调试是一等公民流程：工程师到场签到必须持有效认证，签到位置在服务端对照地理围栏计算、无法造假，完工照片则附在里程碑上，成为你验收时对照的记录。',
      },
      {
        q: '如果我忘了审阅交付，托管会自动放款吗？',
        a: '不会。资金只在你明确批准时流动——平台绝不按倒计时自动放款。如果你和工程师对交付有分歧，任一方都可以开纠纷，里程碑随即冻结，直到 admin 审阅完双方证据为止。',
      },
      {
        q: '我的项目里程碑是怎么定出来的？',
        a: '你发布需求时，平台的 AI 会把描述结构化成技术范围和里程碑计划，让付款节点对应到具体交付物——一版评审过的设计、一个调试完的工作站——而不是日历日期。之后每个里程碑单独注资、单独验收，让每一笔付款都绑在你能亲自检验的东西上。',
      },
    ],

    finalTitle: '用一个里程碑看完整条流程',
    finalSub: '免费发布项目，只为一个里程碑注资，在你验收之前亲眼看本页每一步如何生效。',
  },
};

export default function HowItWorks() {
  const [lang, setLang] = useLang();
  // SSR 首帧英文规则：服务端不知道用户语言，先渲染英文；客户端水合后 useLang 读
  // localStorage 再切换。非 en/zh 语言回退英文（`|| en`），与全站约定一致。
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/how-it-works`;
  const ogImage = `${SITE}/og.png`;

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定（照 pages/pricing.jsx 的 faqJsonLd 先例）。
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UI.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // 步骤时间线子组件：竖排编号步骤（雇主 6 步 / 工程师 5 步 / 纠纷 4 步共用）。
  // 纯展示、无状态，放在页面组件内即可（单页私用，不值得抽成全局组件）。
  function StepList({ steps }) {
    return (
      <ol className={styles.stepList}>
        {steps.map((s) => (
          <li key={s.n} className={styles.stepItem}>
            <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.metaTitle} />
        <meta name="twitter:description" content={t.metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{t.ctaApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 开篇：为什么流程长这样 ───────────────────────────────────── */}
        <div className={styles.block}>
          <p className={styles.lead}>{t.lead1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.lead2}</p>
        </div>

        {/* ── 雇主 6 步流 ─────────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.empTag}</span>
          <h2 className={styles.sectionTitle}>{t.empTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.empLead}</p>
          <StepList steps={t.empSteps} />
        </div>

        {/* ── 工程师 5 步流 ───────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.engTag}</span>
          <h2 className={styles.sectionTitle}>{t.engTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.engLead}</p>
          <StepList steps={t.engSteps} />
        </div>

        {/* ── 质量三闸：每张卡链接到各自的深入页面 ─────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.gatesTag}</span>
          <h2 className={styles.sectionTitle}>{t.gatesTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.gatesLead}</p>
          <div className={styles.gateGrid}>
            {t.gates.map((g) => (
              <div key={g.href} className={styles.gateCard}>
                <div className={styles.gateIcon} aria-hidden="true">{g.icon}</div>
                <div className={styles.gateTitle}>{g.title}</div>
                <p className={styles.gateDesc}>{g.desc}</p>
                <Link href={g.href} className={styles.gateLink}>{g.linkLabel}</Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── 纠纷路径（措辞对齐 /trust，细节链接过去）─────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.dispTag}</span>
          <h2 className={styles.sectionTitle}>{t.dispTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{t.dispLead}</p>
          <StepList steps={t.dispSteps} />
          <p className={styles.note}>
            {t.dispNote}{' '}
            <Link href="/trust" className={styles.inlineLink}>{t.dispLink}</Link>
          </p>
        </div>

        {/* ── FAQ（与 /pricing FAQ 零重复：那边讲钱，这边讲流程）─────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
          <div className={styles.faqList}>
            {t.faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.q}</div>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底部 CTA ─────────────────────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSub}</p>
        <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
      </div>

      {/* 全站共享页脚（数据来自 lib/navConfig，与顶部导航共用同一链接注册表） */}
      <Footer lang={lang} />
    </div>
  );
}
