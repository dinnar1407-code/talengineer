// ── /how-it-works 页语言字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/how-it-works.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 纯机械搬移：文案、数字、来源注释零改动；页面侧 `import { DICT as UI }` 保持
// 原变量名，渲染逻辑一行未动（UI[lang] || UI.en 惯用式仍在页面）。
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
const DICT = {
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

  es: {
    metaTitle: "Cómo funciona — De la solicitud al hito liberado | Talengineer",
    metaDesc: "El flujo completo de Talengineer en ambos lados: los empleadores publican, la IA estructura el alcance, los ingenieros certificados entregan bajo depósito en garantía por hitos con un rastro de evidencia GPS y fotográfica; los ingenieros postulan gratis, aprueban una evaluación práctica, se certifican y cobran mediante Stripe Connect al liberarse el pago.",
    kicker: "Cómo funciona",
    heroTitle: "De una solicitud publicada a un hito liberado.",
    heroSub: "Talengineer conecta a fabricantes con ingenieros de automatización industrial certificados a través de fronteras. Este es el recorrido completo en ambos lados del mercado: qué se verifica, cuándo se mueve el dinero y qué protege a cada parte en cada paso.",
    ctaPost: "Publicar un proyecto — Gratis",
    ctaApply: "Postularse como ingeniero",
    lead1: "El trabajo de ingeniería transfronterizo falla por razones predecibles: habilidades que no se pueden verificar, alcances que significan cosas distintas para cada lado y condiciones de pago que obligan a una parte a confiar ciegamente en la otra. Cada paso a continuación existe para eliminar uno de esos modos de falla: las habilidades se evalúan en vez de declararse, el alcance se estructura antes de que se mueva cualquier dinero, y el pago permanece en depósito en garantía hasta que el trabajo se aprueba.",
    lead2: "El mismo flujo protege a ambas partes. Los empleadores nunca pagan por un trabajo que no han aprobado; los ingenieros nunca inician un trabajo que no está ya financiado.",
    empTag: "Para empleadores",
    empTitle: "Contratar en seis pasos",
    empLead: "Desde el momento en que describe el trabajo hasta el momento en que se liberan los fondos, cada punto de control está diseñado para que solo comprometa dinero con personas verificadas y entregables inspeccionables.",
    empSteps: [
      {
        n: "1",
        title: "Publique su proyecto — en su propio idioma",
        desc: "Describa la máquina, la plataforma de control, el sitio y el plazo en cualquiera de los 9 idiomas que admite la plataforma. Publicar no cuesta nada y no necesita traducir nada — la plataforma se encarga del idioma a partir de aquí.",
      },
      {
        n: "2",
        title: "La IA lo estructura en un alcance y hitos",
        desc: "La IA de la plataforma lee su descripción y la convierte en un alcance técnico estructurado con un plan de hitos — entregable por entregable — para que ambas partes negocien sobre el mismo documento en lugar de una solicitud vaga. Los puntos de pago terminan vinculados a resultados de ingeniería concretos, no a fechas del calendario.",
      },
      {
        n: "3",
        title: "Reciba coincidencias con ingenieros certificados — y elija",
        desc: "Se le muestran coincidencias de ingenieros por especialidad, plataforma y región, clasificados por puntuaciones de evaluación verificadas y calificaciones — y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente a su proyecto (en la especialidad que usted indique, si lo requiere). Usted revisa las coincidencias y decide con quién trabajar; nada se compromete hasta que elija.",
      },
      {
        n: "4",
        title: "Financie el hito en depósito en garantía",
        desc: "Usted financia cada hito mediante Stripe Checkout. Se marca como financiado solo después de que el pago se acredita realmente, y permanece en depósito en garantía hasta que usted aprueba el entregable — así el ingeniero comienza sabiendo que el dinero está asegurado, y usted sabe que no puede moverse sin su autorización.",
      },
      {
        n: "5",
        title: "Entrega con un rastro de evidencia",
        desc: "Para el trabajo en sitio, el ingeniero registra su llegada por GPS contra una geocerca del lado del servidor — la ubicación no se puede falsear desde el cliente — y presenta fotos de finalización de control de calidad que se adjuntan al hito. El avance remoto se registra en la sala de trabajo del proyecto, donde los mensajes se traducen entre su idioma y el del ingeniero.",
      },
      {
        n: "6",
        title: "Aprobar y liberar",
        desc: "Los fondos se mueven solo con su aprobación — nunca por un temporizador. Al liberarse, la comisión de la plataforma se descuenta del hito: 15% estándar, o 5% para clientes fundadores en sus primeras 5 órdenes. Esa comisión es el único cobro; no hay ningún sobreprecio adicional sobre la tarifa del ingeniero.",
      },
    ],
    engTag: "Para ingenieros",
    engTitle: "Unirse en cinco pasos",
    engLead: "El camino desde la postulación hasta el primer pago se construye alrededor de una sola idea: demuestre su habilidad una vez, de forma rigurosa, y deje que ese historial verificado — no el marketing — le consiga el trabajo.",
    engSteps: [
      {
        n: "1",
        title: "Postule — es gratis",
        desc: "Cree su perfil de ingeniero con sus especialidades, plataformas, región y tarifa. Postularse no cuesta nada, y después no hay una rueda interminable de ofertas: los proyectos se asignan según habilidad verificada, no se subastan a la cotización más baja.",
      },
      {
        n: "2",
        title: "Apruebe la evaluación práctica con IA",
        desc: "Como parte del proceso de incorporación, completa una entrevista técnica práctica con IA en su disciplina. Evalúa el criterio real de ingeniería — el tipo que no aparece en las palabras clave de un currículum — y esa puntuación se convierte en la puntuación verificada de su perfil, que alimenta su clasificación en la búsqueda y en las coincidencias.",
      },
      {
        n: "3",
        title: "Certifíquese — de L1 a L3",
        desc: "La certificación es lo que desbloquea las asignaciones. Cada examen consta de 10 preguntas — una combinación de opción múltiple, escenarios y análisis profundo — en una ventana de 40 minutos, con una calificación mínima de aprobación de 70. La IA califica el examen y un administrador humano revisa cada aprobación antes de emitir un certificado; un intento fallido conlleva un enfriamiento de 7 días antes de repetir. Los niveles van de L1 a L3, y cada nivel requiere tener el anterior.",
      },
      {
        n: "4",
        title: "Reciba coincidencias",
        desc: "Los proyectos de los empleadores se emparejan con ingenieros certificados por especialidad, plataforma y región. Cuando le asignan una coincidencia, ve el alcance estructurado y el plan de hitos por adelantado — y el hito ya está financiado en depósito en garantía antes de que usted comience, así que nunca empieza a trabajar sobre una promesa.",
      },
      {
        n: "5",
        title: "Cobre mediante Stripe Connect al liberarse el pago",
        desc: "Cuando el empleador aprueba un hito, el depósito en garantía se libera a su cuenta de Stripe conectada menos la comisión de la plataforma — sin perseguir facturas, sin condiciones a 60 días. Donde los retiros de fondos de Stripe aún no están disponibles en su país, la plataforma procesa un pago manual en su lugar.",
      },
    ],
    gatesTag: "Filtros de calidad",
    gatesTitle: "Tres filtros entre un postulante y su proyecto",
    gatesLead: "El emparejamiento es tan bueno como la evaluación que hay detrás. Tres filtros independientes se interponen entre alguien que postula y alguien asignado a su proyecto — cada uno aplicado por la plataforma, no autodeclarado, y cada uno con su propia página que explica exactamente cómo funciona.",
    gates: [
      {
        icon: "🧪",
        title: "Evaluación práctica",
        desc: "Cada ingeniero realiza una entrevista técnica práctica con IA durante la incorporación. Evalúa el criterio que un currículum no puede mostrar — cómo razona realmente alguien un problema de puesta en marcha en su disciplina — y el resultado se convierte en la puntuación verificada que se muestra en su perfil.",
        linkLabel: "Postularse como ingeniero →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "Filtro de certificación",
        desc: "Solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente a un proyecto — y cuando su proyecto especifica una especialidad de certificación requerida, el certificado debe corresponder a esa especialidad. El certificado se verifica de nuevo al registrar la llegada en el sitio, así que una credencial revocada detiene el trabajo en la puerta.",
        linkLabel: "Exámenes de certificación →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "Una puntuación de calidad única de 0 a 100 que pondera la evaluación de IA en 25, la certificación en 25, las calificaciones de los empleadores en 30 y la confiabilidad de entrega en 20. Las calificaciones usan un promedio bayesiano para que una sola reseña de 5 estrellas no pueda manipular la clasificación, y una tasa alta de disputas anula por completo la dimensión de confiabilidad.",
        linkLabel: "Cómo funciona TalScore →",
        href: "/talscore",
      },
    ],
    dispTag: "Cuando algo sale mal",
    dispTitle: "El proceso de disputas está integrado en el depósito en garantía",
    dispLead: "Si una entrega se disputa, el dinero no se mueve mientras se discute. Cualquiera de las partes puede iniciar un proceso con una ventana de evidencia fija y una decisión humana al final:",
    dispSteps: [
      {
        n: "1",
        title: "Abrir",
        desc: "Cualquiera de las partes abre una disputa sobre un hito financiado. Se congela de inmediato como \"en disputa\" — ningún fondo puede moverse mientras está en revisión.",
      },
      {
        n: "2",
        title: "Evidencia",
        desc: "Ambas partes tienen una ventana de 5 días para presentar evidencia. El lado de cada parte se registra del lado del servidor según su rol en el proyecto — no se puede falsificar.",
      },
      {
        n: "3",
        title: "Revisión del administrador",
        desc: "Un administrador de la plataforma revisa la especificación del hito y ambas presentaciones de evidencia antes de que se mueva cualquier fondo — la decisión es humana, tomada contra el alcance escrito.",
      },
      {
        n: "4",
        title: "Resolución",
        desc: "El administrador falla a favor del ingeniero, del empleador, o divide la decisión. Un fallo a favor del empleador reembolsa el monto total en garantía al método de pago original; una división reembolsa el saldo no adjudicado.",
      },
    ],
    dispNote: "El detalle completo sobre depósito en garantía, disputas, verificación de identidad y la cadena de evidencia en sitio está en el Centro de Confianza.",
    dispLink: "Leer el Centro de Confianza →",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Elijo yo al ingeniero, o lo asigna la plataforma?",
        a: "Usted elige. El trabajo de la plataforma es acotar el campo: empareja su proyecto con ingenieros por especialidad, plataforma y región, clasificados por puntuación de evaluación verificada y calificaciones, y usted decide con quién trabajar. Solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente — en la especialidad que usted indique, si lo requiere. Nada se compromete hasta que usted haya elegido un ingeniero y financiado un hito usted mismo.",
      },
      {
        q: "¿Cómo se evalúa a los ingenieros antes de que aparezcan en una coincidencia?",
        a: "De tres formas, todas aplicadas por la plataforma en lugar de autodeclaradas: una evaluación técnica práctica con IA que se realiza en la incorporación y establece una puntuación verificada en su perfil, un filtro de examen de certificación — solo los ingenieros certificados pueden ser asignados oficialmente, y en la especialidad que usted requiera si la especifica — y TalScore, una puntuación de calidad continua construida a partir de los resultados de la evaluación, las certificaciones, las calificaciones de los empleadores y la confiabilidad de entrega, que impulsa el orden de búsqueda y las listas cortas de grupos de talento.",
      },
      {
        q: "¿Cuál es la diferencia entre la evaluación con IA y la certificación de la plataforma?",
        a: "La evaluación es una entrevista técnica práctica que los ingenieros realizan durante la incorporación; alimenta la puntuación verificada de su perfil y su clasificación en la búsqueda y las coincidencias. La certificación es una vía de examen separada y más profunda con niveles calificados — la IA califica cada examen y un administrador humano lo revisa antes de emitir cualquier certificado. La evaluación determina qué tan visible y bien clasificado está un ingeniero; la certificación es el filtro estricto que le permite ser asignado oficialmente a su proyecto.",
      },
      {
        q: "¿El trabajo se puede entregar tanto en sitio como en remoto?",
        a: "Sí. La puesta en marcha en sitio es un flujo de primera clase: el ingeniero debe tener una certificación vigente para registrar su llegada en el sitio, la ubicación de llegada se calcula en el servidor contra una geocerca para que no se pueda falsear, y las fotos de finalización se adjuntan al hito como el registro contra el que usted aprueba.",
      },
      {
        q: "¿El depósito en garantía se liberará automáticamente si olvido revisar una entrega?",
        a: "No. Los fondos se mueven solo con su aprobación explícita — la plataforma nunca libera automáticamente por un temporizador. Si usted y el ingeniero no están de acuerdo sobre una entrega, cualquiera de las partes puede abrir una disputa, lo que congela el hito hasta que un administrador haya revisado la evidencia de ambas partes.",
      },
      {
        q: "¿Cómo se definen los hitos de mi proyecto?",
        a: "Cuando usted publica, la IA de la plataforma estructura su descripción en un alcance técnico y un plan de hitos, para que los puntos de pago se vinculen a entregables concretos — un diseño revisado, una celda puesta en marcha — en lugar de fechas del calendario. Cada hito se financia y se aprueba por separado, lo que mantiene cada pago vinculado a algo que usted puede inspeccionar.",
      },
    ],
    finalTitle: "Vea todo el flujo en un solo hito",
    finalSub: "Publique un proyecto gratis, financie un solo hito y observe cómo funciona cada paso de esta página antes de que usted apruebe.",
  },

  vi: {
    metaTitle: "Cách thức hoạt động — Từ yêu cầu đến cột mốc đã giải ngân | Talengineer",
    metaDesc: "Toàn bộ quy trình Talengineer cho cả hai phía: nhà tuyển dụng đăng dự án, AI cấu trúc hóa phạm vi công việc, kỹ sư có chứng chỉ bàn giao theo ký quỹ cột mốc với dấu vết bằng chứng GPS và ảnh chụp; kỹ sư ứng tuyển miễn phí, vượt qua bài sàng lọc thực hành, lấy chứng chỉ, và được trả lương qua Stripe Connect khi giải ngân.",
    kicker: "Cách thức hoạt động",
    heroTitle: "Từ một yêu cầu đã đăng đến một cột mốc đã giải ngân.",
    heroSub: "Talengineer kết nối các nhà sản xuất với kỹ sư tự động hóa công nghiệp có chứng chỉ trên toàn cầu. Đây là hành trình đầy đủ ở cả hai phía của thị trường — điều gì được xác minh, khi nào tiền được chuyển, và điều gì bảo vệ mỗi bên ở từng bước.",
    ctaPost: "Đăng dự án — Miễn phí",
    ctaApply: "Ứng tuyển làm kỹ sư",
    lead1: "Công việc kỹ thuật xuyên biên giới thất bại vì những lý do có thể dự đoán được: kỹ năng không thể xác minh, phạm vi công việc mà mỗi bên hiểu theo một cách khác nhau, và điều khoản thanh toán buộc một bên phải hoàn toàn tin tưởng bên kia. Mỗi bước dưới đây tồn tại để loại bỏ một trong những kiểu thất bại đó — kỹ năng được kiểm tra thay vì tự khai báo, phạm vi được cấu trúc trước khi bất kỳ khoản tiền nào được chuyển, và khoản thanh toán nằm trong ký quỹ cho đến khi công việc được nghiệm thu.",
    lead2: "Cùng một quy trình bảo vệ cả hai bên. Nhà tuyển dụng không bao giờ trả tiền cho công việc chưa được nghiệm thu; kỹ sư không bao giờ bắt đầu công việc chưa được cấp vốn.",
    empTag: "Dành cho nhà tuyển dụng",
    empTitle: "Tuyển dụng trong sáu bước",
    empLead: "Từ khoảnh khắc bạn mô tả công việc đến khoảnh khắc tiền được giải ngân, mỗi điểm kiểm soát được thiết kế để bạn chỉ cam kết tiền với những người đã được xác minh và sản phẩm bàn giao có thể kiểm tra được.",
    empSteps: [
      {
        n: "1",
        title: "Đăng dự án — bằng chính ngôn ngữ của bạn",
        desc: "Mô tả máy móc, nền tảng điều khiển, hiện trường và thời hạn bằng bất kỳ ngôn ngữ nào trong 9 ngôn ngữ mà nền tảng hỗ trợ mà bạn quen dùng. Đăng dự án không tốn phí, và bạn không cần dịch bất cứ điều gì — từ đây nền tảng sẽ xử lý phần ngôn ngữ.",
      },
      {
        n: "2",
        title: "AI cấu trúc hóa thành phạm vi công việc và các cột mốc",
        desc: "AI của nền tảng đọc mô tả của bạn và biến nó thành phạm vi kỹ thuật có cấu trúc cùng kế hoạch cột mốc — từng sản phẩm bàn giao một — để cả hai bên đàm phán trên cùng một tài liệu thay vì một yêu cầu mơ hồ. Các điểm thanh toán từ đó gắn với kết quả kỹ thuật cụ thể, chứ không phải theo ngày trên lịch.",
      },
      {
        n: "3",
        title: "Ghép nối với kỹ sư có chứng chỉ — và bạn chọn",
        desc: "Bạn được ghép nối với các kỹ sư theo lĩnh vực, nền tảng và khu vực, xếp hạng theo điểm sàng lọc đã xác minh và đánh giá — và chỉ những kỹ sư đang giữ chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức cho dự án của bạn (đúng lĩnh vực bạn chỉ định, nếu bạn yêu cầu). Bạn xem xét các kết quả ghép nối và quyết định làm việc với ai; không có gì được cam kết cho đến khi bạn chọn.",
      },
      {
        n: "4",
        title: "Nạp tiền cột mốc vào ký quỹ",
        desc: "Bạn nạp tiền cho từng cột mốc qua Stripe Checkout. Cột mốc chỉ được đánh dấu đã nạp sau khi thanh toán thực sự được xác nhận, và vẫn nằm trong ký quỹ cho đến khi bạn nghiệm thu sản phẩm bàn giao — nhờ vậy kỹ sư bắt đầu công việc khi biết tiền đã được đảm bảo, còn bạn biết rằng tiền không thể bị chuyển đi nếu không có sự đồng ý của bạn.",
      },
      {
        n: "5",
        title: "Bàn giao kèm dấu vết bằng chứng",
        desc: "Với công việc tại hiện trường, kỹ sư check-in bằng GPS đối chiếu với hàng rào địa lý phía máy chủ — vị trí không thể giả mạo từ phía client — và nộp ảnh hoàn công kiểm tra chất lượng gắn kèm cột mốc. Tiến độ từ xa được ghi nhận trong phòng làm việc dự án, nơi tin nhắn được dịch tự động giữa ngôn ngữ của bạn và của kỹ sư.",
      },
      {
        n: "6",
        title: "Nghiệm thu và giải ngân",
        desc: "Tiền chỉ được chuyển khi bạn phê duyệt — không bao giờ theo bộ đếm thời gian. Khi giải ngân, phí nền tảng được trừ từ cột mốc: 15% tiêu chuẩn, hoặc 5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên. Khoản phí đó là khoản thu duy nhất; không có khoản cộng thêm nào khác vào mức phí của kỹ sư.",
      },
    ],
    engTag: "Dành cho kỹ sư",
    engTitle: "Gia nhập trong năm bước",
    engLead: "Con đường từ khi ứng tuyển đến lần chi trả đầu tiên được xây dựng quanh một ý tưởng: chứng minh kỹ năng một lần, một cách nghiêm túc, và để hồ sơ đã xác minh đó — chứ không phải marketing — mang việc về cho bạn.",
    engSteps: [
      {
        n: "1",
        title: "Ứng tuyển — miễn phí",
        desc: "Tạo hồ sơ kỹ sư của bạn với lĩnh vực, nền tảng, khu vực và mức phí. Ứng tuyển không tốn phí, và sau đó không có vòng xoay đấu giá không hồi kết: dự án được ghép nối theo kỹ năng đã xác minh, không đấu giá cho báo giá thấp nhất.",
      },
      {
        n: "2",
        title: "Vượt qua bài sàng lọc AI thực hành",
        desc: "Là một phần của quá trình onboarding, bạn hoàn thành một buổi phỏng vấn kỹ thuật AI thực hành trong lĩnh vực của mình. Bài kiểm tra đánh giá khả năng phán đoán kỹ thuật thực sự — loại khả năng không hiện ra trong các từ khóa hồ sơ — và điểm số đó trở thành điểm đã xác minh trên hồ sơ của bạn, ảnh hưởng đến thứ hạng của bạn khi duyệt và ghép nối.",
      },
      {
        n: "3",
        title: "Lấy chứng chỉ — từ L1 đến L3",
        desc: "Chứng chỉ là thứ mở khóa việc phân công. Mỗi kỳ thi gồm 10 câu hỏi — kết hợp trắc nghiệm, tình huống và phân tích chuyên sâu — trong thời gian 40 phút, với điểm đạt là 70. AI chấm bài và một quản trị viên con người xem xét lại từng bài đạt trước khi cấp chứng chỉ; một lần thi trượt sẽ có thời gian chờ 7 ngày trước khi thi lại. Các cấp độ đi từ L1 đến L3, và mỗi cấp yêu cầu đã có cấp thấp hơn liền kề.",
      },
      {
        n: "4",
        title: "Được ghép nối",
        desc: "Các dự án của nhà tuyển dụng được ghép nối với kỹ sư có chứng chỉ theo lĩnh vực, nền tảng và khu vực. Khi được ghép nối, bạn thấy trước phạm vi công việc có cấu trúc và kế hoạch cột mốc — và cột mốc đã được nạp tiền vào ký quỹ trước khi bạn bắt đầu, nên bạn không bao giờ bắt tay vào việc chỉ dựa trên một lời hứa.",
      },
      {
        n: "5",
        title: "Nhận thanh toán qua Stripe Connect khi giải ngân",
        desc: "Khi nhà tuyển dụng nghiệm thu một cột mốc, tiền ký quỹ được giải ngân vào tài khoản Stripe đã liên kết của bạn sau khi trừ phí nền tảng — không phải đòi hóa đơn, không có điều khoản công nợ 60 ngày. Ở những quốc gia mà Stripe chưa hỗ trợ rút tiền, nền tảng sẽ xử lý chi trả thủ công thay thế.",
      },
    ],
    gatesTag: "Các vòng kiểm soát chất lượng",
    gatesTitle: "Ba vòng kiểm soát giữa một người ứng tuyển và dự án của bạn",
    gatesLead: "Việc ghép nối chỉ tốt bằng khâu sàng lọc phía sau nó. Ba vòng kiểm soát độc lập nằm giữa việc một người ứng tuyển và việc người đó được phân công vào dự án của bạn — mỗi vòng do nền tảng thực thi, không phải tự khai báo, và mỗi vòng có trang riêng giải thích chính xác cách nó hoạt động.",
    gates: [
      {
        icon: "🧪",
        title: "Sàng lọc thực hành",
        desc: "Mỗi kỹ sư đều trải qua một buổi phỏng vấn kỹ thuật AI thực hành trong quá trình onboarding. Nó kiểm tra khả năng phán đoán mà một hồ sơ không thể thể hiện được — cách một người thực sự suy luận qua một vấn đề chạy thử trong lĩnh vực của họ — và kết quả trở thành điểm đã xác minh hiển thị trên hồ sơ của họ.",
        linkLabel: "Ứng tuyển làm kỹ sư →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "Vòng chứng chỉ",
        desc: "Chỉ những kỹ sư đang giữ chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức vào một dự án — và khi dự án của bạn chỉ định một lĩnh vực chứng chỉ bắt buộc, chứng chỉ đó phải thuộc đúng lĩnh vực ấy. Chứng chỉ được kiểm tra lại một lần nữa tại thời điểm check-in hiện trường, nên một chứng chỉ đã bị thu hồi sẽ chặn công việc ngay từ cửa.",
        linkLabel: "Kỳ thi chứng chỉ →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "Một điểm chất lượng duy nhất từ 0 đến 100, trong đó bài sàng lọc AI chiếm trọng số 25, chứng chỉ chiếm 25, đánh giá của nhà tuyển dụng chiếm 30 và độ tin cậy trong bàn giao chiếm 20. Đánh giá sử dụng trung bình Bayes để một đánh giá 5 sao đơn lẻ không thể thao túng thứ hạng, và tỷ lệ tranh chấp cao sẽ triệt tiêu hoàn toàn thành phần độ tin cậy.",
        linkLabel: "TalScore hoạt động như thế nào →",
        href: "/talscore",
      },
    ],
    dispTag: "Khi có sự cố",
    dispTitle: "Quy trình tranh chấp được tích hợp sẵn trong ký quỹ",
    dispLead: "Nếu một sản phẩm bàn giao bị khiếu nại, tiền sẽ không di chuyển trong khi hai bên tranh luận. Bất kỳ bên nào cũng có thể kích hoạt một quy trình với thời hạn nộp bằng chứng cố định và một quyết định của con người ở cuối:",
    dispSteps: [
      {
        n: "1",
        title: "Mở tranh chấp",
        desc: "Bất kỳ bên nào cũng có thể mở tranh chấp trên một cột mốc đã được nạp tiền. Cột mốc lập tức bị đóng băng thành \"đang tranh chấp\" — không khoản tiền nào có thể di chuyển trong khi đang được xem xét.",
      },
      {
        n: "2",
        title: "Bằng chứng",
        desc: "Cả hai bên có thời hạn 5 ngày để nộp bằng chứng. Vai trò của mỗi bên được ghi nhận phía máy chủ dựa trên vai trò của họ trong dự án — không thể giả mạo.",
      },
      {
        n: "3",
        title: "Quản trị viên xem xét",
        desc: "Một quản trị viên nền tảng xem xét đặc tả cột mốc và bằng chứng nộp lên từ cả hai bên trước khi bất kỳ khoản tiền nào di chuyển — quyết định do con người đưa ra, dựa trên phạm vi công việc đã ghi rõ bằng văn bản.",
      },
      {
        n: "4",
        title: "Phán quyết",
        desc: "Quản trị viên phán quyết có lợi cho kỹ sư, cho nhà tuyển dụng, hoặc chia đôi. Phán quyết có lợi cho nhà tuyển dụng sẽ hoàn trả toàn bộ số tiền ký quỹ về phương thức thanh toán ban đầu; phán quyết chia đôi hoàn trả phần số dư không được trao cho kỹ sư.",
      },
    ],
    dispNote: "Chi tiết đầy đủ về ký quỹ, tranh chấp, xác minh danh tính và chuỗi bằng chứng tại hiện trường có trong Trung tâm Tin cậy.",
    dispLink: "Đọc Trung tâm Tin cậy →",
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      {
        q: "Tôi tự chọn kỹ sư, hay nền tảng tự phân công?",
        a: "Bạn tự chọn. Nhiệm vụ của nền tảng là thu hẹp phạm vi lựa chọn: ghép nối dự án của bạn với các kỹ sư theo lĩnh vực, nền tảng và khu vực, xếp hạng theo điểm sàng lọc đã xác minh và đánh giá, còn bạn quyết định làm việc với ai. Chỉ những kỹ sư đang giữ chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức — đúng lĩnh vực bạn chỉ định, nếu bạn yêu cầu. Không có gì được cam kết cho đến khi bạn đã chọn một kỹ sư và tự mình nạp tiền cho một cột mốc.",
      },
      {
        q: "Kỹ sư được sàng lọc như thế nào trước khi xuất hiện trong kết quả ghép nối?",
        a: "Bằng ba cách, tất cả đều do nền tảng thực thi thay vì tự khai báo: một bài sàng lọc kỹ thuật AI thực hành được thực hiện khi onboarding, thiết lập điểm đã xác minh trên hồ sơ của họ; một vòng kỳ thi chứng chỉ — chỉ kỹ sư có chứng chỉ mới được phân công chính thức, và đúng lĩnh vực bạn yêu cầu nếu bạn chỉ định; và TalScore, một điểm chất lượng liên tục được xây dựng từ kết quả sàng lọc, chứng chỉ, đánh giá của nhà tuyển dụng và độ tin cậy trong bàn giao, chi phối thứ tự duyệt và danh sách rút gọn trong nguồn nhân tài.",
      },
      {
        q: "Sự khác biệt giữa bài sàng lọc AI và chứng chỉ nền tảng là gì?",
        a: "Bài sàng lọc là một buổi phỏng vấn kỹ thuật thực hành mà kỹ sư thực hiện trong quá trình onboarding; nó tạo nên điểm đã xác minh trên hồ sơ và thứ hạng của họ khi duyệt và ghép nối. Chứng chỉ là một lộ trình thi riêng biệt, sâu hơn, có các cấp độ được chấm điểm — AI chấm từng bài thi và một quản trị viên con người xem xét lại trước khi cấp bất kỳ chứng chỉ nào. Bài sàng lọc quyết định mức độ hiển thị và xếp hạng của một kỹ sư; chứng chỉ là vòng bắt buộc cho phép họ được phân công chính thức vào dự án của bạn.",
      },
      {
        q: "Công việc có thể được bàn giao cả tại hiện trường lẫn từ xa không?",
        a: "Có. Chạy thử tại hiện trường là một quy trình chính thức: kỹ sư phải giữ chứng chỉ còn hiệu lực để check-in tại hiện trường, vị trí check-in được tính toán phía máy chủ đối chiếu với hàng rào địa lý nên không thể giả mạo, và ảnh hoàn công được gắn vào cột mốc như bản ghi mà bạn dựa vào để nghiệm thu.",
      },
      {
        q: "Ký quỹ có tự động giải ngân nếu tôi quên xem xét một lần bàn giao không?",
        a: "Không. Tiền chỉ di chuyển khi bạn phê duyệt rõ ràng — nền tảng không bao giờ tự động giải ngân theo bộ đếm thời gian. Nếu bạn và kỹ sư không đồng ý về một lần bàn giao, bất kỳ bên nào cũng có thể mở tranh chấp, việc này sẽ đóng băng cột mốc cho đến khi quản trị viên đã xem xét bằng chứng từ cả hai bên.",
      },
      {
        q: "Các cột mốc của dự án tôi được xác định như thế nào?",
        a: "Khi bạn đăng dự án, AI của nền tảng cấu trúc hóa mô tả của bạn thành phạm vi kỹ thuật và kế hoạch cột mốc, để các điểm thanh toán gắn với sản phẩm bàn giao cụ thể — một bản thiết kế đã được xem xét, một cụm máy đã chạy thử — thay vì theo ngày trên lịch. Sau đó mỗi cột mốc được nạp tiền và nghiệm thu riêng biệt, giữ cho mỗi khoản thanh toán gắn với một thứ mà bạn có thể kiểm tra được.",
      },
    ],
    finalTitle: "Xem toàn bộ quy trình chỉ với một cột mốc",
    finalSub: "Đăng dự án miễn phí, nạp tiền cho một cột mốc duy nhất, và xem từng bước trên trang này hoạt động trước khi bạn nghiệm thu.",
  },

  hi: {
    metaTitle: "यह कैसे काम करता है — ब्रीफ़ से रिलीज़ हुए माइलस्टोन तक | Talengineer",
    metaDesc: "दोनों पक्षों पर Talengineer का पूरा फ़्लो: नियोक्ता पोस्ट करते हैं, AI स्कोप को संरचित करता है, प्रमाणित इंजीनियर माइलस्टोन एस्क्रो के तहत GPS और फ़ोटो साक्ष्य ट्रेल के साथ डिलीवर करते हैं; इंजीनियर मुफ़्त आवेदन करते हैं, व्यावहारिक स्क्रीन पास करते हैं, प्रमाणन लेते हैं, और रिलीज़ पर Stripe Connect के ज़रिए भुगतान पाते हैं।",
    kicker: "यह कैसे काम करता है",
    heroTitle: "पोस्ट किए गए ब्रीफ़ से रिलीज़ हुए माइलस्टोन तक।",
    heroSub: "Talengineer सीमाओं के पार निर्माताओं को प्रमाणित औद्योगिक ऑटोमेशन इंजीनियरों से जोड़ता है। यहाँ मार्केटप्लेस के दोनों पक्षों की पूरी यात्रा है — क्या सत्यापित होता है, पैसा कब चलता है, और हर कदम पर हर पक्ष की सुरक्षा कैसे होती है।",
    ctaPost: "प्रोजेक्ट पोस्ट करें — निःशुल्क",
    ctaApply: "इंजीनियर के रूप में आवेदन करें",
    lead1: "सीमा-पार इंजीनियरिंग काम पूर्वानुमेय कारणों से विफल होता है: कौशल जिसे सत्यापित नहीं किया जा सकता, स्कोप जिसका मतलब हर पक्ष के लिए अलग होता है, और भुगतान शर्तें जो एक पक्ष को दूसरे पर पूरी तरह भरोसा करने पर मजबूर करती हैं। नीचे हर कदम इन विफलता के तरीकों में से एक को हटाने के लिए मौजूद है — कौशल का दावा नहीं, परीक्षण होता है; कोई भी पैसा हिलने से पहले स्कोप संरचित होता है; और भुगतान तब तक एस्क्रो में रहता है जब तक काम स्वीकृत न हो जाए।",
    lead2: "यही फ़्लो दोनों पक्षों की रक्षा करता है। नियोक्ता कभी ऐसे काम के लिए भुगतान नहीं करते जिसे उन्होंने स्वीकृत नहीं किया; इंजीनियर कभी ऐसा काम शुरू नहीं करते जो पहले से फ़ंडेड न हो।",
    empTag: "नियोक्ताओं के लिए",
    empTitle: "छह चरणों में हायरिंग",
    empLead: "जिस पल आप काम का विवरण देते हैं, उससे लेकर जिस पल राशि रिलीज़ होती है, हर चेकपॉइंट इस तरह डिज़ाइन किया गया है कि आप अपना पैसा केवल सत्यापित लोगों और जाँचे जा सकने वाले डिलीवरेबल्स पर ही लगाएँ।",
    empSteps: [
      {
        n: "1",
        title: "अपना प्रोजेक्ट पोस्ट करें — अपनी ही भाषा में",
        desc: "मशीन, कंट्रोल प्लेटफ़ॉर्म, साइट और डेडलाइन का वर्णन प्लेटफ़ॉर्म की समर्थित 9 भाषाओं में से जिसमें भी आप सहज हों, उसमें करें। पोस्ट करने का कोई शुल्क नहीं है, और आपको कुछ भी अनुवाद करने की ज़रूरत नहीं — यहाँ से आगे भाषा का काम प्लेटफ़ॉर्म संभालता है।",
      },
      {
        n: "2",
        title: "AI इसे स्कोप और माइलस्टोन में संरचित करता है",
        desc: "प्लेटफ़ॉर्म का AI आपके विवरण को पढ़ता है और इसे एक संरचित टेक्निकल स्कोप और माइलस्टोन योजना में बदल देता है — डिलीवरेबल दर डिलीवरेबल — ताकि दोनों पक्ष किसी अस्पष्ट ब्रीफ़ की बजाय एक ही दस्तावेज़ पर बातचीत करें। भुगतान चेकपॉइंट अंततः ठोस इंजीनियरिंग परिणामों से जुड़ते हैं, कैलेंडर तारीखों से नहीं।",
      },
      {
        n: "3",
        title: "प्रमाणित इंजीनियरों से मैच पाएँ — और चुनें",
        desc: "आपको ट्रैक, प्लेटफ़ॉर्म और क्षेत्र के अनुसार इंजीनियरों से मैच किया जाता है, जो सत्यापित स्क्रीनिंग स्कोर और रेटिंग के आधार पर रैंक किए जाते हैं — और केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही आपके प्रोजेक्ट पर आधिकारिक रूप से असाइन किए जा सकते हैं (यदि आप चाहें तो आपके बताए ट्रैक में)। आप मैचों की समीक्षा करते हैं और तय करते हैं कि किसके साथ काम करना है; जब तक आप चुनते नहीं, कुछ भी तय नहीं होता।",
      },
      {
        n: "4",
        title: "माइलस्टोन को एस्क्रो में फ़ंड करें",
        desc: "आप Stripe Checkout के ज़रिए हर माइलस्टोन को फ़ंड करते हैं। भुगतान वास्तव में क्लियर होने के बाद ही इसे फ़ंडेड चिह्नित किया जाता है, और जब तक आप डिलीवरेबल स्वीकृत नहीं करते, यह एस्क्रो में ही रहता है — इसलिए इंजीनियर यह जानते हुए शुरू करता है कि पैसा पहले से सुरक्षित है, और आप जानते हैं कि आपकी सहमति के बिना यह हिल नहीं सकता।",
      },
      {
        n: "5",
        title: "साक्ष्य ट्रेल के साथ डिलीवरी",
        desc: "ऑन-साइट काम के लिए, इंजीनियर सर्वर-साइड जियोफ़ेंस के विरुद्ध GPS से चेक-इन करता है — यह लोकेशन क्लाइंट-साइड से फ़र्ज़ी नहीं बनाई जा सकती — और QC पूर्णता फ़ोटो जमा करता है जो माइलस्टोन से जुड़ी होती हैं। रिमोट प्रगति प्रोजेक्ट वर्करूम में दर्ज होती है, जहाँ संदेश आपकी और इंजीनियर की भाषा के बीच अनुवादित होते हैं।",
      },
      {
        n: "6",
        title: "स्वीकृति और रिलीज़",
        desc: "राशि केवल आपकी स्वीकृति पर चलती है — कभी टाइमर पर नहीं। रिलीज़ पर, माइलस्टोन से प्लेटफ़ॉर्म शुल्क काटा जाता है: मानक 15%, या संस्थापक ग्राहकों के लिए पहले 5 ऑर्डर पर 5%। यही एकमात्र शुल्क है; इंजीनियर की दर पर कोई अलग मार्कअप नहीं है।",
      },
    ],
    engTag: "इंजीनियरों के लिए",
    engTitle: "पाँच चरणों में जुड़ें",
    engLead: "आवेदन से पहले पेआउट तक का रास्ता एक विचार पर बना है: अपना कौशल एक बार, ठीक से साबित करें, और यह सत्यापित रिकॉर्ड — मार्केटिंग नहीं — आपके लिए काम जिताए।",
    engSteps: [
      {
        n: "1",
        title: "आवेदन करें — यह मुफ़्त है",
        desc: "अपने ट्रैक, प्लेटफ़ॉर्म, क्षेत्र और दर के साथ अपनी इंजीनियर प्रोफ़ाइल बनाएँ। आवेदन करने का कोई शुल्क नहीं है, और उसके बाद कोई बिडिंग ट्रेडमिल नहीं: प्रोजेक्ट सत्यापित कौशल से मैच होते हैं, सबसे कम कोटेशन पर नीलाम नहीं होते।",
      },
      {
        n: "2",
        title: "व्यावहारिक AI स्क्रीन पास करें",
        desc: "ऑनबोर्डिंग के हिस्से के रूप में, आप अपने विषय में एक हैंड्स-ऑन AI टेक्निकल इंटरव्यू पूरा करते हैं। यह असली इंजीनियरिंग निर्णय को स्कोर करता है — वह तरह का निर्णय जो रिज़्यूमे कीवर्ड में नहीं दिखता — और वह स्कोर आपकी प्रोफ़ाइल पर सत्यापित स्कोर बन जाता है, जो ब्राउज़ और मैच में आपकी रैंकिंग तय करता है।",
      },
      {
        n: "3",
        title: "प्रमाणित बनें — L1 से L3 तक",
        desc: "प्रमाणन ही असाइनमेंट अनलॉक करता है। हर परीक्षा में 10 सवाल होते हैं — मल्टीपल-चॉइस, सिनेरियो और गहन विश्लेषण का मिश्रण — 40 मिनट की विंडो में, पास मार्क 70 के साथ। AI पेपर जाँचता है और कोई भी सर्टिफ़िकेट जारी होने से पहले एक ह्यूमन एडमिन हर पास हुए पेपर की समीक्षा करता है; फ़ेल हुए प्रयास पर दोबारा प्रयास से पहले 7 दिन का कूलडाउन लगता है। लेवल L1 से L3 तक चलते हैं, और हर लेवल के लिए उससे नीचे वाला लेवल होना ज़रूरी है।",
      },
      {
        n: "4",
        title: "मैच पाएँ",
        desc: "नियोक्ताओं के प्रोजेक्ट ट्रैक, प्लेटफ़ॉर्म और क्षेत्र के अनुसार प्रमाणित इंजीनियरों से मैच किए जाते हैं। जब आपका मैच होता है, तो आप पहले से संरचित स्कोप और माइलस्टोन योजना देखते हैं — और आपके शुरू करने से पहले ही माइलस्टोन एस्क्रो में फ़ंड हो चुका होता है, इसलिए आप कभी किसी वादे पर काम शुरू नहीं करते।",
      },
      {
        n: "5",
        title: "रिलीज़ पर Stripe Connect के ज़रिए भुगतान पाएँ",
        desc: "जब नियोक्ता किसी माइलस्टोन को स्वीकृत करता है, तो एस्क्रो प्लेटफ़ॉर्म शुल्क घटाकर आपके जुड़े हुए Stripe खाते में रिलीज़ होता है — न इनवॉइस के पीछे भागना, न 60-दिन की शर्तें। जिन देशों में Stripe पेआउट अभी उपलब्ध नहीं है, वहाँ प्लेटफ़ॉर्म इसके बजाय मैनुअल पेआउट प्रोसेस करता है।",
      },
    ],
    gatesTag: "क्वालिटी गेट्स",
    gatesTitle: "आवेदक और आपके प्रोजेक्ट के बीच तीन गेट",
    gatesLead: "मैचिंग उतनी ही अच्छी है जितनी उसके पीछे की जाँच। किसी के आवेदन करने और आपके प्रोजेक्ट पर असाइन होने के बीच तीन स्वतंत्र गेट खड़े हैं — हर एक प्लेटफ़ॉर्म द्वारा लागू किया जाता है, सेल्फ़-रिपोर्टेड नहीं, और हर एक का अपना पेज है जो ठीक-ठीक बताता है कि यह कैसे काम करता है।",
    gates: [
      {
        icon: "🧪",
        title: "व्यावहारिक स्क्रीन",
        desc: "हर इंजीनियर ऑनबोर्डिंग के दौरान एक हैंड्स-ऑन AI टेक्निकल इंटरव्यू देता है। यह वह निर्णय-क्षमता टेस्ट करता है जो रिज़्यूमे नहीं दिखा सकता — कि कोई व्यक्ति अपने विषय में एक कमीशनिंग समस्या पर वास्तव में कैसे सोचता है — और परिणाम उनकी प्रोफ़ाइल पर दिखने वाला सत्यापित स्कोर बन जाता है।",
        linkLabel: "इंजीनियर के रूप में आवेदन करें →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "प्रमाणन गेट",
        desc: "केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही किसी प्रोजेक्ट पर आधिकारिक रूप से असाइन किए जा सकते हैं — और जब आपका प्रोजेक्ट कोई ज़रूरी प्रमाणन ट्रैक तय करता है, तो सर्टिफ़िकेट उसी ट्रैक का होना चाहिए। सर्टिफ़िकेट की दोबारा जाँच ऑन-साइट चेक-इन पर होती है, इसलिए कोई रद्द किया गया बैज काम को दरवाज़े पर ही रोक देता है।",
        linkLabel: "प्रमाणन परीक्षाएँ →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "एक 0–100 का इकलौता क्वालिटी स्कोर जिसमें AI स्क्रीन का वेटेज 25, प्रमाणन का 25, नियोक्ता रेटिंग का 30 और डिलीवरी रिलायबिलिटी का 20 है। रेटिंग बायेसियन औसत का उपयोग करती हैं ताकि एक अकेला 5-स्टार रिव्यू रैंकिंग को न बिगाड़ सके, और ज़्यादा विवाद दर रिलायबिलिटी डायमेंशन को सीधे शून्य कर देती है।",
        linkLabel: "TalScore कैसे काम करता है →",
        href: "/talscore",
      },
    ],
    dispTag: "जब कुछ गलत हो जाए",
    dispTitle: "विवाद का रास्ता एस्क्रो में ही बना है",
    dispLead: "यदि किसी डिलीवरी पर आपत्ति होती है, तो बहस के दौरान पैसा नहीं हिलता। कोई भी पक्ष एक निश्चित साक्ष्य विंडो और अंत में इंसानी फ़ैसले वाली प्रक्रिया शुरू कर सकता है:",
    dispSteps: [
      {
        n: "1",
        title: "खोलें",
        desc: "कोई भी पक्ष किसी फ़ंडेड माइलस्टोन पर विवाद खोल सकता है। इसे तुरंत \"विवादित\" के रूप में फ़्रीज़ कर दिया जाता है — समीक्षा के दौरान कोई राशि नहीं हिल सकती।",
      },
      {
        n: "2",
        title: "साक्ष्य",
        desc: "दोनों पक्षों के पास साक्ष्य जमा करने के लिए 5 दिन की विंडो होती है। हर पक्ष की स्थिति प्रोजेक्ट में उनकी भूमिका के आधार पर सर्वर-साइड दर्ज होती है — इसे झूठा नहीं बनाया जा सकता।",
      },
      {
        n: "3",
        title: "एडमिन समीक्षा",
        desc: "कोई भी राशि हिलने से पहले एक प्लेटफ़ॉर्म एडमिन माइलस्टोन की स्पेसिफ़िकेशन और दोनों पक्षों के प्रस्तुत साक्ष्य की समीक्षा करता है — फ़ैसला इंसान लेता है, लिखित स्कोप के आधार पर।",
      },
      {
        n: "4",
        title: "समाधान",
        desc: "एडमिन इंजीनियर के पक्ष में, नियोक्ता के पक्ष में, या बँटवारे में फ़ैसला देता है। नियोक्ता के पक्ष में फ़ैसले पर पूरी एस्क्रो राशि मूल भुगतान माध्यम पर लौटाई जाती है; बँटवारे वाले फ़ैसले में जो हिस्सा इंजीनियर को नहीं दिया गया, वह लौटाया जाता है।",
      },
    ],
    dispNote: "एस्क्रो, विवाद, पहचान सत्यापन और ऑन-साइट साक्ष्य श्रृंखला की पूरी जानकारी ट्रस्ट सेंटर में है।",
    dispLink: "ट्रस्ट सेंटर पढ़ें →",
    faqTitle: "अक्सर पूछे जाने वाले सवाल",
    faqs: [
      {
        q: "क्या मैं इंजीनियर चुनता हूँ, या प्लेटफ़ॉर्म असाइन करता है?",
        a: "आप चुनते हैं। प्लेटफ़ॉर्म का काम दायरा संकुचित करना है: यह आपके प्रोजेक्ट को ट्रैक, प्लेटफ़ॉर्म और क्षेत्र के अनुसार इंजीनियरों से मैच करता है, सत्यापित स्क्रीनिंग स्कोर और रेटिंग के आधार पर रैंक करता है, और आप तय करते हैं कि किसके साथ काम करना है। केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही आधिकारिक रूप से असाइन किए जा सकते हैं — यदि आप चाहें तो आपके बताए ट्रैक में। जब तक आपने खुद इंजीनियर नहीं चुना और माइलस्टोन फ़ंड नहीं किया, कुछ भी तय नहीं होता।",
      },
      {
        q: "किसी मैच में दिखने से पहले इंजीनियरों की जाँच कैसे होती है?",
        a: "तीन तरीकों से, सभी सेल्फ़-रिपोर्टेड की बजाय प्लेटफ़ॉर्म द्वारा लागू: ऑनबोर्डिंग पर लिया गया एक व्यावहारिक AI टेक्निकल स्क्रीन जो उनकी प्रोफ़ाइल पर सत्यापित स्कोर सेट करता है, एक प्रमाणन परीक्षा गेट — केवल प्रमाणित इंजीनियर ही आधिकारिक रूप से असाइन किए जा सकते हैं, और यदि आप बताएँ तो आपके बताए ट्रैक में — और TalScore, स्क्रीन परिणामों, प्रमाणन, नियोक्ता रेटिंग और डिलीवरी रिलायबिलिटी से बना एक चालू क्वालिटी स्कोर, जो ब्राउज़ सॉर्टिंग और पूल शॉर्टलिस्ट को चलाता है।",
      },
      {
        q: "AI स्क्रीन और प्लेटफ़ॉर्म प्रमाणन में क्या फ़र्क है?",
        a: "स्क्रीन एक हैंड्स-ऑन टेक्निकल इंटरव्यू है जो इंजीनियर ऑनबोर्डिंग के दौरान देते हैं; यह उनकी प्रोफ़ाइल पर सत्यापित स्कोर और ब्राउज़ व मैच में उनकी रैंकिंग तय करता है। प्रमाणन एक अलग, गहरा परीक्षा ट्रैक है जिसमें ग्रेडेड लेवल होते हैं — AI हर पेपर स्कोर करता है और कोई भी सर्टिफ़िकेट जारी होने से पहले एक ह्यूमन एडमिन उसकी समीक्षा करता है। स्क्रीन तय करता है कि कोई इंजीनियर कितना दिखता और कितना ऊँचा रैंक करता है; प्रमाणन वह सख़्त गेट है जो उन्हें आपके प्रोजेक्ट पर आधिकारिक रूप से असाइन होने देता है।",
      },
      {
        q: "क्या काम ऑन-साइट के साथ-साथ रिमोट भी डिलीवर किया जा सकता है?",
        a: "हाँ। ऑन-साइट कमीशनिंग एक फ़र्स्ट-क्लास फ़्लो है: साइट पर चेक-इन के लिए इंजीनियर के पास वैध प्रमाणन होना चाहिए, चेक-इन लोकेशन सर्वर पर जियोफ़ेंस के विरुद्ध गणना की जाती है इसलिए इसे फ़र्ज़ी नहीं बनाया जा सकता, और पूर्णता फ़ोटो माइलस्टोन से उस रिकॉर्ड के रूप में जुड़ती हैं जिसके आधार पर आप स्वीकृति देते हैं।",
      },
      {
        q: "अगर मैं किसी डिलीवरी की समीक्षा करना भूल जाऊँ, तो क्या एस्क्रो अपने आप रिलीज़ हो जाएगा?",
        a: "नहीं। राशि केवल आपकी स्पष्ट स्वीकृति पर चलती है — प्लेटफ़ॉर्म कभी टाइमर पर अपने आप रिलीज़ नहीं करता। यदि आप और इंजीनियर किसी डिलीवरी पर असहमत हैं, तो कोई भी पक्ष विवाद खोल सकता है, जो माइलस्टोन को तब तक फ़्रीज़ कर देता है जब तक एडमिन दोनों पक्षों के साक्ष्य की समीक्षा न कर ले।",
      },
      {
        q: "मेरे प्रोजेक्ट के लिए माइलस्टोन कैसे तय होते हैं?",
        a: "जब आप पोस्ट करते हैं, तो प्लेटफ़ॉर्म का AI आपके विवरण को एक टेक्निकल स्कोप और माइलस्टोन योजना में संरचित करता है, ताकि भुगतान चेकपॉइंट ठोस डिलीवरेबल्स से जुड़ें — एक समीक्षित डिज़ाइन, एक कमीशन हुआ सेल — न कि कैलेंडर तारीखों से। इसके बाद हर माइलस्टोन अलग से फ़ंड और स्वीकृत होता है, जिससे हर भुगतान किसी ऐसी चीज़ से जुड़ा रहता है जिसे आप जाँच सकते हैं।",
      },
    ],
    finalTitle: "एक माइलस्टोन पर पूरा फ़्लो देखें",
    finalSub: "मुफ़्त में प्रोजेक्ट पोस्ट करें, एक ही माइलस्टोन फ़ंड करें, और अपनी स्वीकृति से पहले इस पेज का हर कदम काम करता देखें।",
  },

  fr: {
    metaTitle: "Comment ça marche — Du cahier des charges au jalon débloqué | Talengineer",
    metaDesc: "Le parcours complet Talengineer des deux côtés : les employeurs publient, l’IA structure le périmètre, les ingénieurs certifiés livrent sous séquestre par jalons avec une piste de preuves GPS et photo ; les ingénieurs postulent gratuitement, réussissent une évaluation pratique, obtiennent leur certification et sont payés via Stripe Connect au déblocage.",
    kicker: "Comment ça marche",
    heroTitle: "D’un cahier des charges publié à un jalon débloqué.",
    heroSub: "Talengineer met en relation les fabricants avec des ingénieurs en automatisation industrielle certifiés, par-delà les frontières. Voici le parcours complet des deux côtés de la place de marché — ce qui est vérifié, quand l’argent bouge, et ce qui protège chaque partie à chaque étape.",
    ctaPost: "Publier un projet — Gratuit",
    ctaApply: "Postuler comme ingénieur",
    lead1: "Le travail d’ingénierie transfrontalier échoue pour des raisons prévisibles : des compétences qui ne peuvent pas être vérifiées, un périmètre qui ne signifie pas la même chose pour chaque partie, et des conditions de paiement qui forcent l’une des parties à faire confiance à l’autre. Chaque étape ci-dessous existe pour éliminer l’un de ces modes d’échec — les compétences sont testées et non déclarées, le périmètre est structuré avant tout mouvement de fonds, et le paiement reste sous séquestre jusqu’à ce que le travail soit validé.",
    lead2: "Le même parcours protège les deux parties. Les employeurs ne paient jamais un travail qu’ils n’ont pas validé ; les ingénieurs ne commencent jamais un travail qui n’est pas déjà financé.",
    empTag: "Pour les employeurs",
    empTitle: "Recruter en six étapes",
    empLead: "Du moment où vous décrivez la mission au moment où les fonds sont débloqués, chaque point de contrôle est conçu pour que vous n’engagiez de l’argent qu’auprès de personnes vérifiées et sur des livrables contrôlables.",
    empSteps: [
      {
        n: "1",
        title: "Publiez votre projet — dans votre propre langue",
        desc: "Décrivez la machine, la plateforme de contrôle, le site et le délai dans l’une des 9 langues prises en charge par la plateforme, celle qui vous convient. La publication est gratuite et vous n’avez rien à traduire — à partir de là, la plateforme gère la langue.",
      },
      {
        n: "2",
        title: "L’IA le structure en périmètre et jalons",
        desc: "L’IA de la plateforme lit votre description et la transforme en un périmètre technique structuré assorti d’un plan de jalons — livrable par livrable — afin que les deux parties négocient sur le même document plutôt que sur un cahier des charges vague. Les points de paiement finissent ainsi liés à des résultats d’ingénierie concrets, et non à des dates de calendrier.",
      },
      {
        n: "3",
        title: "Soyez mis en relation avec des ingénieurs certifiés — et choisissez",
        desc: "Vous êtes mis en relation avec des ingénieurs par filière, plateforme et région, classés selon leurs scores d’évaluation vérifiés et leurs notes — et seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés à votre projet (dans la filière que vous précisez, si vous en exigez une). Vous examinez les propositions et décidez avec qui travailler ; rien n’est engagé avant votre choix.",
      },
      {
        n: "4",
        title: "Provisionnez le jalon sous séquestre",
        desc: "Vous provisionnez chaque jalon via Stripe Checkout. Il n’est marqué provisionné qu’une fois le paiement réellement encaissé, et il reste sous séquestre jusqu’à votre validation du livrable — ainsi l’ingénieur commence en sachant que l’argent est déjà sécurisé, et vous savez qu’il ne peut bouger sans votre accord.",
      },
      {
        n: "5",
        title: "Livraison avec une piste de preuves",
        desc: "Pour les interventions sur site, l’ingénieur pointe par GPS par rapport à une géo-clôture côté serveur — la localisation ne peut pas être falsifiée côté client — et soumet des photos de fin de travaux qui se rattachent au jalon. L’avancement à distance est consigné dans la salle de travail du projet, où les messages sont traduits entre votre langue et celle de l’ingénieur.",
      },
      {
        n: "6",
        title: "Valider et débloquer",
        desc: "Les fonds ne bougent que sur votre validation — jamais à l’expiration d’un délai. Au déblocage, les frais de plateforme sont déduits du jalon : 15% en standard, ou 5% pour les clients fondateurs sur leurs 5 premières commandes. Ces frais sont le seul prélèvement ; il n’y a aucune marge supplémentaire sur le tarif de l’ingénieur.",
      },
    ],
    engTag: "Pour les ingénieurs",
    engTitle: "Rejoindre en cinq étapes",
    engLead: "Le chemin entre la candidature et le premier versement repose sur une seule idée : prouvez votre compétence une fois, sérieusement, et laissez ce dossier vérifié — et non le marketing — vous décrocher les missions.",
    engSteps: [
      {
        n: "1",
        title: "Postulez — c’est gratuit",
        desc: "Créez votre profil d’ingénieur avec vos filières, vos plateformes, votre région et votre tarif. Postuler ne coûte rien, et il n’y a ensuite aucune course aux enchères permanente : les projets sont attribués selon la compétence vérifiée, pas mis aux enchères au moins-disant.",
      },
      {
        n: "2",
        title: "Réussissez l’évaluation pratique par IA",
        desc: "Dans le cadre de l’intégration, vous passez un entretien technique pratique par IA dans votre discipline. Il évalue le vrai jugement d’ingénierie — celui qui n’apparaît pas dans les mots-clés d’un CV — et ce score devient le score vérifié sur votre profil, qui alimente votre classement dans la recherche et les mises en relation.",
      },
      {
        n: "3",
        title: "Certifiez-vous — de L1 à L3",
        desc: "La certification est ce qui débloque les affectations. Chaque examen comporte 10 questions — un mélange de QCM, de mises en situation et d’analyses approfondies — sur une fenêtre de 40 minutes, avec une note de passage de 70. L’IA note la copie et un administrateur humain relit chaque réussite avant l’émission d’un certificat ; un échec entraîne un délai de carence de 7 jours avant de repasser l’examen. Les niveaux vont de L1 à L3, et chaque niveau exige de détenir le précédent.",
      },
      {
        n: "4",
        title: "Soyez mis en relation",
        desc: "Les projets des employeurs sont mis en relation avec des ingénieurs certifiés par filière, plateforme et région. Lorsque vous êtes mis en relation, vous voyez le périmètre structuré et le plan de jalons à l’avance — et le jalon est déjà provisionné sous séquestre avant que vous ne commenciez, si bien que vous ne travaillez jamais sur une simple promesse.",
      },
      {
        n: "5",
        title: "Soyez payé via Stripe Connect au déblocage",
        desc: "Lorsque l’employeur valide un jalon, le séquestre est débloqué vers votre compte Stripe connecté, déduction faite des frais de plateforme — pas de relance de facture, pas de délai de règlement à 60 jours. Là où les versements Stripe ne sont pas encore disponibles dans votre pays, la plateforme effectue à la place un versement manuel.",
      },
    ],
    gatesTag: "Contrôles qualité",
    gatesTitle: "Trois contrôles entre un candidat et votre projet",
    gatesLead: "La mise en relation vaut ce que vaut la sélection qui la précède. Trois contrôles indépendants séparent une candidature d’une affectation sur votre projet — chacun appliqué par la plateforme, jamais autodéclaré, et chacun expliqué en détail sur sa propre page.",
    gates: [
      {
        icon: "🧪",
        title: "Évaluation pratique",
        desc: "Chaque ingénieur passe un entretien technique pratique par IA lors de l’intégration. Il teste le jugement qu’un CV ne peut pas montrer — la façon dont une personne raisonne réellement face à un problème de mise en service dans sa discipline — et le résultat devient le score vérifié affiché sur son profil.",
        linkLabel: "Postuler comme ingénieur →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "Contrôle de certification",
        desc: "Seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés à un projet — et lorsque votre projet précise une filière de certification requise, le certificat doit correspondre à cette filière. Le certificat est revérifié au pointage sur site, si bien qu’un badge révoqué bloque l’intervention dès l’entrée du site.",
        linkLabel: "Examens de certification →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "Un score de qualité unique de 0 à 100 pondérant l’évaluation IA à 25, la certification à 25, les notes des employeurs à 30 et la fiabilité de livraison à 20. Les notes utilisent une moyenne bayésienne pour qu’un seul avis 5 étoiles ne puisse pas fausser le classement, et un taux de litiges élevé ramène purement et simplement la dimension fiabilité à zéro.",
        linkLabel: "Comment fonctionne TalScore →",
        href: "/talscore",
      },
    ],
    dispTag: "En cas de problème",
    dispTitle: "La procédure de litige est intégrée au séquestre",
    dispLead: "Si une livraison est contestée, l’argent ne bouge pas pendant le débat. Chaque partie peut déclencher une procédure avec une fenêtre de preuves fixe et une décision humaine à la clé :",
    dispSteps: [
      {
        n: "1",
        title: "Ouverture",
        desc: "L’une ou l’autre partie ouvre un litige sur un jalon provisionné. Il est immédiatement gelé au statut « en litige » — aucun fonds ne peut bouger pendant l’examen.",
      },
      {
        n: "2",
        title: "Preuves",
        desc: "Chaque partie dispose d’une fenêtre de 5 jours pour soumettre ses preuves. Le camp auquel appartient chaque partie est déterminé côté serveur d’après son rôle dans le projet — il ne peut pas être usurpé.",
      },
      {
        n: "3",
        title: "Examen par l’administrateur",
        desc: "Un administrateur de la plateforme examine la spécification du jalon et les preuves soumises par les deux parties avant tout mouvement de fonds — la décision est humaine, fondée sur le périmètre écrit.",
      },
      {
        n: "4",
        title: "Résolution",
        desc: "L’administrateur tranche en faveur de l’ingénieur, de l’employeur, ou partage la décision. Une décision en faveur de l’employeur rembourse le montant intégral sous séquestre sur le moyen de paiement d’origine ; une décision partagée rembourse le solde non attribué à l’ingénieur.",
      },
    ],
    dispNote: "Le détail complet sur le séquestre, les litiges, la vérification d’identité et la chaîne de preuves sur site se trouve dans le Centre de confiance.",
    dispLink: "Lire le Centre de confiance →",
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        q: "Est-ce moi qui choisis l’ingénieur, ou la plateforme l’affecte-t-elle ?",
        a: "C’est vous qui choisissez. Le rôle de la plateforme est de resserrer le champ : elle met votre projet en relation avec des ingénieurs par filière, plateforme et région, classés selon leur score d’évaluation vérifié et leurs notes, et vous décidez avec qui travailler. Seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés — dans la filière que vous précisez, si vous en exigez une. Rien n’est engagé avant que vous ayez choisi un ingénieur et provisionné vous-même un jalon.",
      },
      {
        q: "Comment les ingénieurs sont-ils évalués avant d’apparaître dans une mise en relation ?",
        a: "De trois façons, toutes appliquées par la plateforme plutôt qu’autodéclarées : une évaluation technique pratique par IA passée lors de l’intégration, qui établit un score vérifié sur leur profil ; un contrôle par examen de certification — seuls les ingénieurs certifiés peuvent être officiellement affectés, et dans la filière que vous exigez si vous la précisez ; et TalScore, un score de qualité continu construit à partir des résultats de l’évaluation, des certifications, des notes des employeurs et de la fiabilité de livraison, qui alimente le tri de la recherche et les présélections de viviers.",
      },
      {
        q: "Quelle est la différence entre l’évaluation par IA et la certification de plateforme ?",
        a: "L’évaluation est un entretien technique pratique que les ingénieurs passent lors de l’intégration ; elle alimente le score vérifié de leur profil et leur classement dans la recherche et les mises en relation. La certification est une filière d’examen distincte et plus approfondie, avec des niveaux notés — l’IA note chaque copie et un administrateur humain la relit avant l’émission d’un certificat. L’évaluation détermine la visibilité et le classement d’un ingénieur ; la certification est le contrôle strict qui lui permet d’être officiellement affecté à votre projet.",
      },
      {
        q: "Le travail peut-il être livré sur site aussi bien qu’à distance ?",
        a: "Oui. La mise en service sur site est un parcours à part entière : l’ingénieur doit détenir une certification valide pour pointer sur le site, la position de pointage est calculée côté serveur par rapport à une géo-clôture afin qu’elle ne puisse pas être falsifiée, et les photos de fin de travaux se rattachent au jalon comme la preuve sur laquelle vous fondez votre validation.",
      },
      {
        q: "Le séquestre se débloque-t-il automatiquement si j’oublie d’examiner une livraison ?",
        a: "Non. Les fonds ne bougent que sur votre validation explicite — la plateforme ne débloque jamais les fonds à la seule expiration d’un délai. Si vous et l’ingénieur êtes en désaccord sur une livraison, chaque partie peut ouvrir un litige, ce qui gèle le jalon jusqu’à ce qu’un administrateur ait examiné les preuves des deux parties.",
      },
      {
        q: "Comment les jalons de mon projet sont-ils définis ?",
        a: "Lorsque vous publiez, l’IA de la plateforme structure votre description en un périmètre technique et un plan de jalons, afin que les points de paiement correspondent à des livrables concrets — une conception relue, une cellule mise en service — plutôt qu’à des dates de calendrier. Chaque jalon est ensuite provisionné puis validé séparément, ce qui garde chaque paiement lié à quelque chose que vous pouvez contrôler.",
      },
    ],
    finalTitle: "Voyez tout le parcours sur un seul jalon",
    finalSub: "Publiez un projet gratuitement, provisionnez un seul jalon, et observez chaque étape de cette page fonctionner avant votre validation.",
  },

  de: {
    metaTitle: "So funktioniert es — Vom Briefing zum freigegebenen Meilenstein | Talengineer",
    metaDesc: "Der komplette Talengineer-Ablauf für beide Seiten: Auftraggeber schreiben aus, KI strukturiert den Leistungsumfang, zertifizierte Ingenieure liefern gegen Meilenstein-Treuhand mit GPS- und Foto-Nachweiskette; Ingenieure bewerben sich kostenlos, bestehen ein praxisnahes Assessment, lassen sich zertifizieren und werden bei Freigabe über Stripe Connect bezahlt.",
    kicker: "So funktioniert es",
    heroTitle: "Vom ausgeschriebenen Briefing zum freigegebenen Meilenstein.",
    heroSub: "Talengineer verbindet Hersteller mit zertifizierten Ingenieuren für industrielle Automatisierung über Ländergrenzen hinweg. Hier ist der vollständige Weg auf beiden Seiten des Marktplatzes — was verifiziert wird, wann Geld fließt und was jede Partei bei jedem Schritt schützt.",
    ctaPost: "Projekt ausschreiben — kostenlos",
    ctaApply: "Als Ingenieur bewerben",
    lead1: "Grenzüberschreitende Ingenieurarbeit scheitert aus vorhersehbaren Gründen: Fähigkeiten, die sich nicht überprüfen lassen, ein Leistungsumfang, der für jede Seite etwas anderes bedeutet, und Zahlungsbedingungen, die eine Partei zwingen, der anderen schlicht zu vertrauen. Jeder Schritt unten existiert, um genau eine dieser Fehlerquellen auszuschalten — Fähigkeiten werden geprüft statt behauptet, der Leistungsumfang wird strukturiert, bevor Geld fließt, und die Zahlung bleibt treuhänderisch, bis die Arbeit abgenommen ist.",
    lead2: "Derselbe Ablauf schützt beide Seiten. Auftraggeber zahlen nie für Arbeit, die sie nicht abgenommen haben; Ingenieure beginnen nie mit Arbeit, die nicht bereits finanziert ist.",
    empTag: "Für Auftraggeber",
    empTitle: "Einstellen in sechs Schritten",
    empLead: "Vom Moment, in dem Sie den Auftrag beschreiben, bis zum Moment der Freigabe ist jeder Kontrollpunkt so gestaltet, dass Sie Geld nur an verifizierte Personen und gegen prüfbare Liefergegenstände binden.",
    empSteps: [
      {
        n: "1",
        title: "Projekt ausschreiben — in Ihrer eigenen Sprache",
        desc: "Beschreiben Sie die Maschine, die Steuerungsplattform, den Standort und den Termin in einer der 9 von der Plattform unterstützten Sprachen — welche Sie bevorzugen. Das Ausschreiben ist kostenlos, und Sie müssen nichts übersetzen — ab hier übernimmt die Plattform die Sprache.",
      },
      {
        n: "2",
        title: "KI strukturiert es zu Leistungsumfang und Meilensteinen",
        desc: "Die KI der Plattform liest Ihre Beschreibung und wandelt sie in einen strukturierten technischen Leistungsumfang mit einem Meilensteinplan um — Liefergegenstand für Liefergegenstand —, sodass beide Seiten über dasselbe Dokument verhandeln statt über ein vages Briefing. Zahlungspunkte werden so an konkrete technische Ergebnisse geknüpft, nicht an Kalenderdaten.",
      },
      {
        n: "3",
        title: "Mit zertifizierten Ingenieuren gematcht werden — und auswählen",
        desc: "Sie werden mit Ingenieuren nach Fachrichtung, Plattform und Region gematcht, gerankt nach verifiziertem Assessment-Score und Bewertungen — und nur Ingenieure mit gültiger Plattform-Zertifizierung können offiziell für Ihr Projekt eingesetzt werden (in der von Ihnen festgelegten Fachrichtung, falls Sie eine verlangen). Sie prüfen die Vorschläge und entscheiden, mit wem Sie zusammenarbeiten; nichts ist verbindlich, bis Sie sich entschieden haben.",
      },
      {
        n: "4",
        title: "Meilenstein treuhänderisch finanzieren",
        desc: "Sie finanzieren jeden Meilenstein über Stripe Checkout. Er wird erst als finanziert markiert, nachdem die Zahlung tatsächlich eingegangen ist, und bleibt in Treuhand, bis Sie den Liefergegenstand abnehmen — so beginnt der Ingenieur in dem Wissen, dass das Geld gesichert ist, und Sie wissen, dass es sich ohne Ihre Zustimmung nicht bewegen kann.",
      },
      {
        n: "5",
        title: "Lieferung mit Nachweiskette",
        desc: "Bei Arbeiten vor Ort checkt der Ingenieur per GPS gegen einen serverseitigen Geofence ein — der Standort kann clientseitig nicht gefälscht werden — und reicht QC-Abschlussfotos ein, die dem Meilenstein zugeordnet werden. Der Fortschritt aus der Ferne wird im Projekt-Arbeitsraum protokolliert, wo Nachrichten zwischen Ihrer Sprache und der des Ingenieurs übersetzt werden.",
      },
      {
        n: "6",
        title: "Abnehmen und freigeben",
        desc: "Gelder bewegen sich nur mit Ihrer Freigabe — niemals per Timer. Bei der Freigabe wird die Plattformgebühr vom Meilenstein abgezogen: 15% Standard, oder 5% für Gründungskunden auf ihre ersten 5 Aufträge. Diese Gebühr ist die einzige Belastung; es gibt keinen zusätzlichen Aufschlag auf den Satz des Ingenieurs.",
      },
    ],
    engTag: "Für Ingenieure",
    engTitle: "Beitreten in fünf Schritten",
    engLead: "Der Weg von der Bewerbung bis zur ersten Auszahlung baut auf einer Idee auf: Beweisen Sie Ihre Fähigkeit einmal, gründlich, und lassen Sie diesen verifizierten Nachweis — nicht Marketing — Ihnen die Aufträge verschaffen.",
    engSteps: [
      {
        n: "1",
        title: "Bewerben — kostenlos",
        desc: "Erstellen Sie Ihr Ingenieurprofil mit Ihren Fachrichtungen, Plattformen, Ihrer Region und Ihrem Satz. Die Bewerbung kostet nichts, und danach gibt es kein endloses Bieterrad: Projekte werden nach verifizierter Fähigkeit vergeben, nicht an das niedrigste Angebot versteigert.",
      },
      {
        n: "2",
        title: "Das praxisnahe KI-Assessment bestehen",
        desc: "Als Teil des Onboardings absolvieren Sie ein praxisnahes technisches KI-Interview in Ihrer Fachrichtung. Es bewertet echtes technisches Urteilsvermögen — die Art, die in Lebenslauf-Schlagworten nicht sichtbar wird — und dieser Score wird zum verifizierten Score auf Ihrem Profil, der Ihr Ranking in der Suche und bei Matches beeinflusst.",
      },
      {
        n: "3",
        title: "Zertifizierung erwerben — L1 bis L3",
        desc: "Die Zertifizierung schaltet Einsätze frei. Jede Prüfung besteht aus 10 Fragen — eine Mischung aus Multiple-Choice-, Szenario- und Tiefenanalyse-Fragen — in einem 40-Minuten-Fenster, mit einer Bestehensgrenze von 70. Die KI bewertet die Prüfung, und ein menschlicher Admin prüft jedes Bestehen, bevor ein Zertifikat ausgestellt wird; ein nicht bestandener Versuch löst eine 7-tägige Sperrfrist bis zur Wiederholung aus. Die Level reichen von L1 bis L3, und jedes Level setzt das darunterliegende voraus.",
      },
      {
        n: "4",
        title: "Gematcht werden",
        desc: "Projekte von Auftraggebern werden nach Fachrichtung, Plattform und Region mit zertifizierten Ingenieuren gematcht. Sobald Sie gematcht sind, sehen Sie den strukturierten Leistungsumfang und den Meilensteinplan im Voraus — und der Meilenstein ist bereits treuhänderisch finanziert, bevor Sie beginnen, sodass Sie nie auf ein bloßes Versprechen hin arbeiten.",
      },
      {
        n: "5",
        title: "Bei Freigabe über Stripe Connect bezahlt werden",
        desc: "Wenn der Auftraggeber einen Meilenstein abnimmt, wird die Treuhandsumme abzüglich der Plattformgebühr auf Ihr verbundenes Stripe-Konto freigegeben — kein Rechnungen-Hinterherlaufen, keine 60-Tage-Zahlungsziele. Wo Stripe-Auszahlungen in Ihrem Land noch nicht verfügbar sind, wickelt die Plattform stattdessen eine manuelle Auszahlung ab.",
      },
    ],
    gatesTag: "Qualitäts-Gates",
    gatesTitle: "Drei Gates zwischen einem Bewerber und Ihrem Projekt",
    gatesLead: "Ein Match ist nur so gut wie die Prüfung dahinter. Drei unabhängige Gates stehen zwischen einer Bewerbung und einem Einsatz auf Ihrem Projekt — jedes von der Plattform durchgesetzt, nicht selbst gemeldet, und jedes mit einer eigenen Seite, die genau erklärt, wie es funktioniert.",
    gates: [
      {
        icon: "🧪",
        title: "Praxisnahes Assessment",
        desc: "Jeder Ingenieur absolviert beim Onboarding ein praxisnahes technisches KI-Interview. Es prüft das Urteilsvermögen, das ein Lebenslauf nicht zeigen kann — wie jemand tatsächlich ein Inbetriebnahmeproblem in seiner Fachrichtung durchdenkt — und das Ergebnis wird zum verifizierten Score, der auf dem Profil angezeigt wird.",
        linkLabel: "Als Ingenieur bewerben →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "Zertifizierungs-Gate",
        desc: "Nur Ingenieure mit gültiger Plattform-Zertifizierung können offiziell für ein Projekt eingesetzt werden — und wenn Ihr Projekt eine erforderliche Zertifizierungsrichtung vorgibt, muss das Zertifikat aus genau dieser Richtung stammen. Das Zertifikat wird beim Vor-Ort-Check-in erneut geprüft, sodass ein widerrufenes Zertifikat die Arbeit schon an der Tür stoppt.",
        linkLabel: "Zertifizierungsprüfungen →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "Ein einziger Qualitäts-Score von 0 bis 100, der das KI-Assessment mit 25, die Zertifizierung mit 25, Auftraggeber-Bewertungen mit 30 und Zuverlässigkeit bei der Lieferung mit 20 gewichtet. Bewertungen nutzen einen bayesschen Durchschnitt, damit eine einzelne Fünf-Sterne-Bewertung das Ranking nicht manipulieren kann, und eine hohe Streitfallquote setzt die Zuverlässigkeitsdimension direkt auf null.",
        linkLabel: "Wie TalScore funktioniert →",
        href: "/talscore",
      },
    ],
    dispTag: "Wenn etwas schiefgeht",
    dispTitle: "Der Streitfall-Weg ist in die Treuhand eingebaut",
    dispLead: "Wird eine Lieferung angefochten, bewegt sich das Geld nicht, während gestritten wird. Jede Partei kann ein Verfahren mit festem Beweisfenster und einer menschlichen Entscheidung am Ende auslösen:",
    dispSteps: [
      {
        n: "1",
        title: "Eröffnen",
        desc: "Jede Partei kann einen Streitfall zu einem finanzierten Meilenstein eröffnen. Er wird sofort auf „strittig“ eingefroren — während der Prüfung kann kein Geld bewegt werden.",
      },
      {
        n: "2",
        title: "Beweise",
        desc: "Beide Seiten haben ein 5-tägiges Fenster, um Beweise einzureichen. Die Zuordnung jeder Partei wird serverseitig anhand ihrer Rolle im Projekt erfasst — sie kann nicht gefälscht werden.",
      },
      {
        n: "3",
        title: "Admin-Prüfung",
        desc: "Ein Plattform-Admin prüft die Meilenstein-Spezifikation und die Beweise beider Seiten, bevor sich Geld bewegt — die Entscheidung trifft ein Mensch, gegen den schriftlich festgelegten Leistungsumfang.",
      },
      {
        n: "4",
        title: "Entscheidung",
        desc: "Der Admin entscheidet zugunsten des Ingenieurs, des Auftraggebers oder teilt auf. Eine Entscheidung zugunsten des Auftraggebers erstattet den vollen Treuhandbetrag auf das ursprüngliche Zahlungsmittel; eine geteilte Entscheidung erstattet den nicht zugesprochenen Restbetrag.",
      },
    ],
    dispNote: "Vollständige Details zu Treuhand, Streitfällen, Identitätsprüfung und der Vor-Ort-Nachweiskette finden Sie im Trust Center.",
    dispLink: "Trust Center lesen →",
    faqTitle: "Häufig gestellte Fragen",
    faqs: [
      {
        q: "Wähle ich den Ingenieur aus, oder weist die Plattform ihn zu?",
        a: "Sie wählen aus. Die Aufgabe der Plattform ist es, das Feld einzugrenzen: Sie matcht Ihr Projekt mit Ingenieuren nach Fachrichtung, Plattform und Region, gerankt nach verifiziertem Assessment-Score und Bewertungen, und Sie entscheiden, mit wem Sie zusammenarbeiten. Nur Ingenieure mit gültiger Plattform-Zertifizierung können offiziell eingesetzt werden — in der von Ihnen festgelegten Fachrichtung, falls Sie eine verlangen. Nichts ist verbindlich, bis Sie einen Ingenieur ausgewählt und selbst einen Meilenstein finanziert haben.",
      },
      {
        q: "Wie werden Ingenieure geprüft, bevor sie in einem Match erscheinen?",
        a: "Auf drei Arten, alle von der Plattform durchgesetzt statt selbst gemeldet: ein praxisnahes technisches KI-Assessment beim Onboarding, das einen verifizierten Score auf dem Profil festlegt; ein Zertifizierungsprüfungs-Gate — nur zertifizierte Ingenieure können offiziell eingesetzt werden, und in der von Ihnen geforderten Fachrichtung, falls Sie eine angeben; und TalScore, ein laufender Qualitäts-Score aus Assessment-Ergebnissen, Zertifizierungen, Auftraggeber-Bewertungen und Lieferzuverlässigkeit, der die Sortierung in der Suche und Kurzlisten im Talentpool steuert.",
      },
      {
        q: "Was ist der Unterschied zwischen dem KI-Assessment und der Plattform-Zertifizierung?",
        a: "Das Assessment ist ein praxisnahes technisches Interview, das Ingenieure beim Onboarding absolvieren; es fließt in den verifizierten Score auf ihrem Profil und ihr Ranking in Suche und Matches ein. Die Zertifizierung ist eine separate, tiefergehende Prüfungsreihe mit bewerteten Leveln — die KI bewertet jede Prüfung, und ein menschlicher Admin prüft sie, bevor ein Zertifikat ausgestellt wird. Das Assessment bestimmt, wie sichtbar und gut platziert ein Ingenieur ist; die Zertifizierung ist das harte Gate, das ihm einen offiziellen Einsatz auf Ihrem Projekt erlaubt.",
      },
      {
        q: "Kann die Arbeit sowohl vor Ort als auch remote geliefert werden?",
        a: "Ja. Die Inbetriebnahme vor Ort ist ein vollwertiger Ablauf: Der Ingenieur muss eine gültige Zertifizierung besitzen, um sich am Standort einzuchecken, der Check-in-Standort wird serverseitig gegen einen Geofence berechnet und kann daher nicht gefälscht werden, und Abschlussfotos werden dem Meilenstein als der Nachweis zugeordnet, gegen den Sie abnehmen.",
      },
      {
        q: "Wird die Treuhand automatisch freigegeben, wenn ich vergesse, eine Lieferung zu prüfen?",
        a: "Nein. Gelder bewegen sich nur mit Ihrer ausdrücklichen Freigabe — die Plattform gibt niemals automatisch per Timer frei. Sind Sie und der Ingenieur uneinig über eine Lieferung, kann jede Seite einen Streitfall eröffnen, der den Meilenstein einfriert, bis ein Admin die Beweise beider Parteien geprüft hat.",
      },
      {
        q: "Wie werden die Meilensteine für mein Projekt festgelegt?",
        a: "Wenn Sie ausschreiben, strukturiert die KI der Plattform Ihre Beschreibung zu einem technischen Leistungsumfang und einem Meilensteinplan, sodass Zahlungspunkte an konkrete Liefergegenstände geknüpft werden — ein geprüftes Design, eine in Betrieb genommene Zelle — statt an Kalenderdaten. Jeder Meilenstein wird anschließend separat finanziert und abgenommen, sodass jede Zahlung an etwas gebunden bleibt, das Sie prüfen können.",
      },
    ],
    finalTitle: "Sehen Sie den gesamten Ablauf an einem Meilenstein",
    finalSub: "Schreiben Sie ein Projekt kostenlos aus, finanzieren Sie einen einzelnen Meilenstein und beobachten Sie, wie jeder Schritt auf dieser Seite funktioniert, bevor Sie abnehmen.",
  },

  ja: {
    metaTitle: "仕組み — 依頼からマイルストーン解放まで | Talengineer",
    metaDesc: "Talengineerの双方向のフロー全体をご紹介します。雇用者が案件を投稿すると、AIがスコープを構造化し、認定エンジニアがGPSと写真の証跡付きでマイルストーンエスクローのもとに納品します。エンジニアは無料で応募し、実践的なスクリーニングに合格し、認定を取得し、解放時にStripe Connect経由で報酬を受け取ります。",
    kicker: "仕組み",
    heroTitle: "投稿された依頼から、解放されるマイルストーンまで。",
    heroSub: "Talengineerは、国境を越えて製造業と認定産業オートメーションエンジニアをつなぎます。ここでは、マーケットプレイスの両サイドにおける全行程——何が検証され、いつ資金が動き、各ステップで誰が何によって守られるのか——をご紹介します。",
    ctaPost: "プロジェクトを投稿 — 無料",
    ctaApply: "エンジニアとして応募",
    lead1: "国境を越えたエンジニアリング業務が失敗する理由は予測可能です——検証できないスキル、双方で意味が異なるスコープ、そして一方が相手を全面的に信頼せざるを得ない支払い条件。以下の各ステップは、これらの失敗要因を一つずつ取り除くために存在します。スキルは自己申告ではなくテストされ、資金が動く前にスコープが構造化され、支払いは作業が承認されるまでエスクローに留まります。",
    lead2: "同じフローが双方を守ります。雇用者は承認していない作業に対して支払うことはなく、エンジニアは資金化されていない作業を開始することはありません。",
    empTag: "雇用者向け",
    empTitle: "6ステップで採用",
    empLead: "案件を説明した瞬間から資金が解放される瞬間まで、各チェックポイントは、検証済みの人材と検査可能な成果物にのみ資金を投じられるよう設計されています。",
    empSteps: [
      {
        n: "1",
        title: "プロジェクトを投稿する — 自分の言語で",
        desc: "プラットフォームが対応する9言語のうち、使いやすい言語で機械、制御プラットフォーム、現場、納期を記述してください。投稿は無料で、翻訳の必要もありません——ここから先の言語処理はプラットフォームが引き受けます。",
      },
      {
        n: "2",
        title: "AIがスコープとマイルストーンに構造化する",
        desc: "プラットフォームのAIがあなたの記述を読み取り、成果物ごとのマイルストーン計画を伴う構造化された技術スコープに変換します。これにより双方は曖昧な依頼書ではなく、同じ文書をもとに交渉できます。支払いのチェックポイントは、カレンダー上の日付ではなく、具体的なエンジニアリング成果に紐づきます。",
      },
      {
        n: "3",
        title: "認定エンジニアとマッチングし、自分で選ぶ",
        desc: "専門分野、プラットフォーム、地域に基づいてエンジニアとマッチングされ、検証済みのスクリーニングスコアと評価によってランク付けされます。有効なプラットフォーム認定を保有するエンジニアのみが、あなたのプロジェクトに正式にアサインされます（あなたが特定の方向を指定した場合は、その方向の認定が必要です）。マッチング結果を確認し、誰と組むかはあなたが決めます——選ぶまで何も確定しません。",
      },
      {
        n: "4",
        title: "マイルストーンをエスクローに入金する",
        desc: "Stripe Checkout経由で各マイルストーンに入金します。実際に決済が完了して初めて「入金済み」とマークされ、成果物を承認するまでエスクローに留まります。これによりエンジニアは資金がすでに確保されていると知って作業を開始でき、あなたはあなたの承認なしにお金が動くことはないと分かります。",
      },
      {
        n: "5",
        title: "証跡付きの納品",
        desc: "現場作業の場合、エンジニアはサーバー側のジオフェンスに基づいてGPSでチェックインします——位置情報はクライアント側で偽装できません——そしてマイルストーンに紐づく品質確認完了写真を提出します。リモートの進捗はプロジェクトワークルームに記録され、そこではメッセージがあなたとエンジニアそれぞれの言語間で翻訳されます。",
      },
      {
        n: "6",
        title: "承認と解放",
        desc: "資金はあなたの承認によってのみ動きます——タイマーによる自動解放は決してありません。解放時、マイルストーンからプラットフォーム手数料が差し引かれます：標準15%、またはファウンディングクライアントの最初の5件の注文については5%です。この手数料が唯一の課金であり、エンジニアの料率に別途上乗せされることはありません。",
      },
    ],
    engTag: "エンジニア向け",
    engTitle: "5ステップで参加",
    engLead: "応募から初回の出金までの道のりは、一つの考え方に基づいて設計されています——スキルを一度、きちんと証明し、マーケティングではなくその検証済みの実績によって仕事を勝ち取ってもらう、という考え方です。",
    engSteps: [
      {
        n: "1",
        title: "応募する — 無料",
        desc: "専門分野、プラットフォーム、地域、料率を記載してエンジニアプロフィールを作成します。応募は無料で、その後は際限のない入札競争もありません——プロジェクトは検証済みのスキルに基づいてマッチングされ、最低価格の入札で競り落とされることはありません。",
      },
      {
        n: "2",
        title: "実践的なAIスクリーニングに合格する",
        desc: "オンボーディングの一環として、あなたの専門分野における実践的なAI技術面接を受けます。これは履歴書のキーワードには表れない、実際のエンジニアリング判断力を評価するもので、そのスコアはプロフィール上の検証済みスコアとなり、閲覧やマッチングにおけるランキングに反映されます。",
      },
      {
        n: "3",
        title: "認定を取得する — L1からL3まで",
        desc: "認定はアサインへの扉を開くものです。各試験は10問——選択式、シナリオ式、深い分析を要する問題を組み合わせたもの——で構成され、制限時間は40分、合格ラインは70点です。AIが採点し、証明書が発行される前にすべての合格答案を人間の管理者がレビューします。不合格の場合は再受験まで7日間のクールダウンが設けられます。レベルはL1からL3まであり、各レベルは一つ下のレベルを保有していることが前提です。",
      },
      {
        n: "4",
        title: "マッチングされる",
        desc: "雇用者のプロジェクトは、専門分野、プラットフォーム、地域に基づいて認定エンジニアとマッチングされます。マッチングされると、構造化されたスコープとマイルストーン計画を事前に確認できます——そしてマイルストーンは作業開始前にすでにエスクローに入金されているため、口約束だけで作業を始めることは決してありません。",
      },
      {
        n: "5",
        title: "解放時にStripe Connect経由で報酬を受け取る",
        desc: "雇用者がマイルストーンを承認すると、プラットフォーム手数料を差し引いたエスクロー資金が、接続済みのStripeアカウントに解放されます——請求書の督促も、60日払いの条件もありません。Stripeの出金がまだ利用できない国では、代わりにプラットフォームが手動で出金処理を行います。",
      },
    ],
    gatesTag: "品質ゲート",
    gatesTitle: "応募者とあなたのプロジェクトの間にある3つのゲート",
    gatesLead: "マッチングの質は、その裏にある審査の質次第です。応募からプロジェクトへのアサインまでの間には、3つの独立したゲートがあります——いずれも自己申告ではなくプラットフォームによって適用され、それぞれの仕組みを詳しく説明する専用ページがあります。",
    gates: [
      {
        icon: "🧪",
        title: "実践的なスクリーニング",
        desc: "すべてのエンジニアは、オンボーディング時に実践的なAI技術面接を受けます。これは履歴書では示せない判断力——自分の専門分野における試運転の問題を実際にどう論理立てて考えるか——を試すもので、その結果はプロフィールに表示される検証済みスコアとなります。",
        linkLabel: "エンジニアとして応募 →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "認定ゲート",
        desc: "有効なプラットフォーム認定を保有するエンジニアのみが、プロジェクトに正式にアサインされます——そしてプロジェクトが必須の認定方向を指定している場合、証明書はその方向のものでなければなりません。証明書は現場チェックイン時にも再確認されるため、失効したバッジは入口で作業を止めます。",
        linkLabel: "認定試験 →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "AIスクリーニングを25、認定を25、雇用者からの評価を30、納品の信頼性を20の重みで評価する、0–100の単一の品質スコアです。評価にはベイズ平均を用いるため、五つ星レビュー1件だけでランキングを操作することはできず、紛争率が高い場合は信頼性の項目がそのままゼロになります。",
        linkLabel: "TalScoreの仕組み →",
        href: "/talscore",
      },
    ],
    dispTag: "問題が起きたとき",
    dispTitle: "紛争処理はエスクローに組み込まれています",
    dispLead: "納品に異議が唱えられた場合、争っている間は資金は動きません。どちらの当事者も、固定の証拠提出期間と最終的な人間による判断を伴う手続きを開始できます。",
    dispSteps: [
      {
        n: "1",
        title: "開始",
        desc: "どちらの当事者も、入金済みのマイルストーンに対して紛争を開始できます。直ちに「紛争中」として凍結され、レビュー中はいかなる資金も動きません。",
      },
      {
        n: "2",
        title: "証拠",
        desc: "双方に証拠を提出するための5日間の証拠提出期間が与えられます。各当事者の立場はプロジェクト内での役割に基づいてサーバー側で記録され、なりすますことはできません。",
      },
      {
        n: "3",
        title: "管理者レビュー",
        desc: "資金が動く前に、プラットフォームの管理者がマイルストーンの仕様と双方の証拠提出内容をレビューします——判断は人間が行い、文書化されたスコープに照らして下されます。",
      },
      {
        n: "4",
        title: "解決",
        desc: "管理者はエンジニア有利、雇用者有利、または折半のいずれかで裁定します。雇用者有利の裁定では、エスクロー全額が元の支払い方法に返金され、折半の場合はエンジニアに認められなかった残額が返金されます。",
      },
    ],
    dispNote: "エスクロー、紛争、本人確認、現場証拠チェーンに関する詳細は、トラストセンターに掲載されています。",
    dispLink: "トラストセンターを読む →",
    faqTitle: "よくある質問",
    faqs: [
      {
        q: "エンジニアは自分で選べますか、それともプラットフォームが割り当てますか？",
        a: "ご自身で選びます。プラットフォームの役割は候補を絞り込むことです——専門分野、プラットフォーム、地域に基づいてプロジェクトをエンジニアとマッチングし、検証済みのスクリーニングスコアと評価でランク付けしますが、誰と組むかはあなたが決めます。有効なプラットフォーム認定を保有するエンジニアのみが正式にアサインされます——特定の方向を指定した場合はその方向で。あなた自身がエンジニアを選び、マイルストーンに入金するまで、何も確定しません。",
      },
      {
        q: "エンジニアはマッチングに表示される前にどのように審査されていますか？",
        a: "3つの方法があり、いずれも自己申告ではなくプラットフォームによって適用されます。オンボーディング時に実施される実践的なAI技術スクリーニング（プロフィール上の検証済みスコアを設定）、認定試験ゲート（認定を保有するエンジニアのみが正式にアサインされ、方向を指定した場合はその方向で）、そしてTalScore（スクリーニング結果、認定、雇用者評価、納品信頼性から構成される継続的な品質スコアで、閲覧の並び順や人材プールの候補選定を左右します）です。",
      },
      {
        q: "AIスクリーニングとプラットフォーム認定の違いは何ですか？",
        a: "スクリーニングはオンボーディング時にエンジニアが受ける実践的な技術面接で、プロフィール上の検証済みスコアと閲覧・マッチングにおけるランキングに反映されます。認定は、段階的なレベルを持つ別個のより深い試験トラックです——AIが各答案を採点し、証明書が発行される前に人間の管理者がレビューします。スクリーニングはエンジニアの表示のされ方やランキングを左右し、認定はプロジェクトへの正式なアサインを可能にする厳格なゲートです。",
      },
      {
        q: "作業は現場でもリモートでも納品できますか？",
        a: "はい。現場での試運転は一等の扱いを受けるフローです——現場でチェックインするには有効な認定が必要で、チェックイン位置はサーバー側でジオフェンスに照らして計算されるため偽装できません。完了写真はマイルストーンに紐づけられ、あなたが承認の際に照合する記録となります。",
      },
      {
        q: "納品のレビューを忘れた場合、エスクローは自動的に解放されますか？",
        a: "いいえ。資金はあなたの明示的な承認によってのみ動きます——プラットフォームがタイマーで自動解放することは決してありません。納品についてあなたとエンジニアの意見が食い違う場合、どちらの当事者も紛争を開始でき、管理者が双方の証拠をレビューするまでマイルストーンは凍結されます。",
      },
      {
        q: "プロジェクトのマイルストーンはどのように定義されますか？",
        a: "投稿すると、プラットフォームのAIがあなたの記述を技術スコープとマイルストーン計画に構造化し、支払いのチェックポイントがカレンダー上の日付ではなく、設計のレビュー完了やセルの試運転完了といった具体的な成果物に対応するようにします。各マイルストーンはその後個別に入金・承認され、すべての支払いがあなたが検査できるものに紐づいた状態を保ちます。",
      },
    ],
    finalTitle: "1つのマイルストーンでフロー全体を確認する",
    finalSub: "プロジェクトを無料で投稿し、1つのマイルストーンだけに入金して、承認する前にこのページのすべてのステップが実際に機能する様子を確認してください。",
  },

  ko: {
    metaTitle: "작동 방식 — 의뢰서부터 릴리즈된 마일스톤까지 | Talengineer",
    metaDesc: "양측 모두를 위한 Talengineer의 전체 흐름입니다. 고용주가 프로젝트를 등록하면 AI가 범위를 구조화하고, 인증 엔지니어는 GPS 및 사진 증거 기록과 함께 마일스톤 에스크로 아래에서 작업을 납품합니다. 엔지니어는 무료로 지원하고, 실무형 평가를 통과하고, 인증을 취득하며, 릴리즈 시 Stripe Connect를 통해 대금을 받습니다.",
    kicker: "작동 방식",
    heroTitle: "등록된 의뢰서부터 릴리즈된 마일스톤까지.",
    heroSub: "Talengineer는 국경을 넘어 제조업체와 인증 산업 자동화 엔지니어를 연결합니다. 여기서는 마켓플레이스 양측의 전체 여정 — 무엇이 검증되는지, 돈이 언제 움직이는지, 각 단계에서 각 당사자를 무엇이 보호하는지 — 를 소개합니다.",
    ctaPost: "프로젝트 등록 — 무료",
    ctaApply: "엔지니어로 지원",
    lead1: "국경을 넘는 엔지니어링 작업은 예측 가능한 이유로 실패합니다. 검증할 수 없는 역량, 양측이 서로 다르게 해석하는 범위, 그리고 한쪽이 다른 쪽을 그저 신뢰할 수밖에 없게 만드는 결제 조건입니다. 아래의 각 단계는 이러한 실패 요인 중 하나씩을 제거하기 위해 존재합니다 — 역량은 주장이 아니라 테스트로 확인되고, 범위는 돈이 움직이기 전에 구조화되며, 결제는 작업이 승인될 때까지 에스크로에 머뭅니다.",
    lead2: "동일한 흐름이 양측을 모두 보호합니다. 고용주는 승인하지 않은 작업에 대해 결코 대금을 지불하지 않으며, 엔지니어는 이미 자금이 조달되지 않은 작업을 결코 시작하지 않습니다.",
    empTag: "고용주용",
    empTitle: "6단계로 채용하기",
    empLead: "작업을 설명하는 순간부터 자금이 릴리즈되는 순간까지, 모든 체크포인트는 검증된 인력과 검사 가능한 결과물에만 자금을 투입하도록 설계되어 있습니다.",
    empSteps: [
      {
        n: "1",
        title: "프로젝트 등록 — 자신의 언어로",
        desc: "플랫폼이 지원하는 9개 언어 중 편한 언어로 기계, 제어 플랫폼, 현장, 마감일을 설명하세요. 등록은 무료이며 번역할 필요도 없습니다 — 이 시점부터 언어 처리는 플랫폼이 담당합니다.",
      },
      {
        n: "2",
        title: "AI가 범위와 마일스톤으로 구조화",
        desc: "플랫폼의 AI가 설명을 읽고 이를 산출물별 마일스톤 계획이 포함된 구조화된 기술 범위로 변환합니다. 이를 통해 양측은 모호한 의뢰서가 아니라 동일한 문서를 두고 협의합니다. 결제 체크포인트는 결국 달력상의 날짜가 아니라 구체적인 엔지니어링 성과에 연결됩니다.",
      },
      {
        n: "3",
        title: "인증 엔지니어와 매칭 — 그리고 직접 선택",
        desc: "분야, 플랫폼, 지역을 기준으로 엔지니어와 매칭되며, 검증된 평가 점수와 평점으로 순위가 매겨집니다. 유효한 플랫폼 인증을 보유한 엔지니어만 프로젝트에 공식적으로 배정될 수 있습니다(요구하신 경우 지정한 분야의 인증이어야 합니다). 매칭 결과를 검토하고 누구와 함께 일할지는 직접 결정합니다 — 선택하기 전까지는 아무것도 확정되지 않습니다.",
      },
      {
        n: "4",
        title: "마일스톤을 에스크로에 입금",
        desc: "Stripe Checkout을 통해 각 마일스톤에 입금합니다. 결제가 실제로 완료된 후에야 입금 완료로 표시되며, 결과물을 승인하기 전까지 에스크로에 머뭅니다 — 이를 통해 엔지니어는 자금이 이미 확보되었음을 알고 시작할 수 있고, 고용주는 자신의 승인 없이는 돈이 움직일 수 없음을 알 수 있습니다.",
      },
      {
        n: "5",
        title: "증거 기록과 함께 납품",
        desc: "현장 작업의 경우, 엔지니어는 서버 측 지오펜스를 기준으로 GPS 체크인을 하며 — 위치는 클라이언트 측에서 조작할 수 없습니다 — 마일스톤에 첨부되는 품질 확인 완료 사진을 제출합니다. 원격 진행 상황은 프로젝트 워크룸에 기록되며, 여기서 메시지는 고용주와 엔지니어 각자의 언어로 번역됩니다.",
      },
      {
        n: "6",
        title: "승인 및 릴리즈",
        desc: "자금은 오직 승인에 의해서만 움직입니다 — 타이머로 자동 처리되는 일은 결코 없습니다. 릴리즈 시 마일스톤에서 플랫폼 수수료가 공제됩니다. 표준 15%, 또는 파운딩 고객의 첫 5건 주문에 대해서는 5%입니다. 이 수수료가 유일한 청구 항목이며, 엔지니어 요율에 별도로 붙는 마크업은 없습니다.",
      },
    ],
    engTag: "엔지니어용",
    engTitle: "5단계로 합류하기",
    engLead: "지원부터 첫 출금까지의 여정은 하나의 아이디어를 중심으로 설계되어 있습니다 — 역량을 한 번, 제대로 증명하고, 마케팅이 아니라 그 검증된 기록이 일을 따내게 하는 것입니다.",
    engSteps: [
      {
        n: "1",
        title: "지원하기 — 무료입니다",
        desc: "분야, 플랫폼, 지역, 요율을 입력해 엔지니어 프로필을 작성합니다. 지원은 무료이며, 이후 끝없는 입찰 경쟁도 없습니다 — 프로젝트는 검증된 역량에 따라 매칭되며 최저가 견적에 경매로 낙찰되지 않습니다.",
      },
      {
        n: "2",
        title: "실무형 AI 평가 통과하기",
        desc: "온보딩 과정의 일부로, 자신의 전문 분야에서 실무형 AI 기술 인터뷰를 완료합니다. 이는 이력서 키워드에 드러나지 않는 진짜 엔지니어링 판단력을 평가하며, 이 점수는 프로필의 검증된 점수가 되어 검색 및 매칭 순위에 반영됩니다.",
      },
      {
        n: "3",
        title: "인증 취득하기 — L1부터 L3까지",
        desc: "인증은 배정을 여는 열쇠입니다. 각 시험은 객관식, 시나리오형, 심층 분석형 문항이 섞인 10문항으로 구성되며 제한 시간은 40분, 합격 기준은 70점입니다. AI가 채점하며, 인증서가 발급되기 전 통과한 모든 답안을 사람 관리자가 검토합니다. 불합격 시 재응시까지 7일의 대기 기간이 적용됩니다. 등급은 L1부터 L3까지이며, 각 등급은 그 아래 등급을 보유하고 있어야 합니다.",
      },
      {
        n: "4",
        title: "매칭 받기",
        desc: "고용주의 프로젝트는 분야, 플랫폼, 지역을 기준으로 인증 엔지니어와 매칭됩니다. 매칭되면 구조화된 범위와 마일스톤 계획을 미리 확인할 수 있으며 — 마일스톤은 시작 전에 이미 에스크로에 입금되어 있으므로 약속만 믿고 작업을 시작하는 일은 결코 없습니다.",
      },
      {
        n: "5",
        title: "릴리즈 시 Stripe Connect로 대금 받기",
        desc: "고용주가 마일스톤을 승인하면, 플랫폼 수수료를 제외한 에스크로 금액이 연결된 Stripe 계정으로 릴리즈됩니다 — 인보이스 독촉도, 60일 결제 조건도 없습니다. Stripe 출금이 아직 지원되지 않는 국가에서는 대신 플랫폼이 수동 출금을 처리합니다.",
      },
    ],
    gatesTag: "품질 게이트",
    gatesTitle: "지원자와 프로젝트 사이의 세 가지 게이트",
    gatesLead: "매칭의 질은 그 이면의 검증만큼만 좋습니다. 누군가 지원하는 순간부터 프로젝트에 배정되는 순간까지, 세 개의 독립적인 게이트가 있습니다 — 각각 자진 신고가 아니라 플랫폼이 강제하며, 정확히 어떻게 작동하는지 설명하는 전용 페이지가 각각 마련되어 있습니다.",
    gates: [
      {
        icon: "🧪",
        title: "실무형 평가",
        desc: "모든 엔지니어는 온보딩 과정에서 실무형 AI 기술 인터뷰를 치릅니다. 이는 이력서로는 드러나지 않는 판단력 — 자신의 전문 분야에서 시운전 문제를 실제로 어떻게 추론하는지 — 를 테스트하며, 그 결과는 프로필에 표시되는 검증된 점수가 됩니다.",
        linkLabel: "엔지니어로 지원하기 →",
        href: "/talent",
      },
      {
        icon: "🎓",
        title: "인증 게이트",
        desc: "유효한 플랫폼 인증을 보유한 엔지니어만 프로젝트에 공식적으로 배정될 수 있습니다 — 그리고 프로젝트가 필수 인증 분야를 지정한 경우 인증서는 반드시 그 분야여야 합니다. 인증서는 현장 체크인 시 다시 확인되므로, 취소된 배지는 현장 진입 단계에서 작업을 막습니다.",
        linkLabel: "인증 시험 →",
        href: "/certification",
      },
      {
        icon: "📊",
        title: "TalScore",
        desc: "AI 평가에 25, 인증에 25, 고용주 평점에 30, 납품 신뢰도에 20의 가중치를 부여하는 0~100점의 단일 품질 점수입니다. 평점은 베이지안 평균을 사용해 단 한 건의 별 다섯 개 리뷰로 순위를 조작할 수 없으며, 분쟁률이 높으면 신뢰도 항목이 그대로 0이 됩니다.",
        linkLabel: "TalScore 작동 방식 →",
        href: "/talscore",
      },
    ],
    dispTag: "문제가 생겼을 때",
    dispTitle: "분쟁 처리 절차는 에스크로에 내장되어 있습니다",
    dispLead: "납품에 이의가 제기되면, 다투는 동안 돈은 움직이지 않습니다. 어느 쪽이든 고정된 증거 제출 기간과 최종 사람의 판단이 포함된 절차를 시작할 수 있습니다.",
    dispSteps: [
      {
        n: "1",
        title: "개시",
        desc: "어느 쪽 당사자든 입금된 마일스톤에 대해 분쟁을 개시할 수 있습니다. 즉시 \"분쟁 중\"으로 동결되며, 검토가 진행되는 동안에는 어떤 자금도 움직일 수 없습니다.",
      },
      {
        n: "2",
        title: "증거",
        desc: "양측 모두 증거를 제출할 5일의 기간이 주어집니다. 각 당사자의 소속은 프로젝트 내 역할에 따라 서버 측에서 기록되므로 조작할 수 없습니다.",
      },
      {
        n: "3",
        title: "관리자 검토",
        desc: "자금이 움직이기 전에 플랫폼 관리자가 마일스톤 명세와 양측이 제출한 증거를 검토합니다 — 판단은 사람이 내리며, 문서화된 범위를 기준으로 이루어집니다.",
      },
      {
        n: "4",
        title: "해결",
        desc: "관리자는 엔지니어에게 유리하게, 고용주에게 유리하게, 또는 절반으로 나누어 판정합니다. 고용주에게 유리한 판정은 에스크로 전액을 원래 결제 수단으로 환불하며, 절반 판정은 엔지니어에게 인정되지 않은 잔액을 환불합니다.",
      },
    ],
    dispNote: "에스크로, 분쟁, 신원 확인, 현장 증거 체인에 대한 전체 세부 내용은 Trust Center에 있습니다.",
    dispLink: "Trust Center 읽기 →",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "엔지니어를 직접 선택하나요, 아니면 플랫폼이 배정하나요?",
        a: "직접 선택합니다. 플랫폼의 역할은 대상 범위를 좁히는 것입니다 — 분야, 플랫폼, 지역을 기준으로 프로젝트를 엔지니어와 매칭하고 검증된 평가 점수와 평점으로 순위를 매기지만, 누구와 함께 일할지는 직접 결정합니다. 유효한 플랫폼 인증을 보유한 엔지니어만 공식적으로 배정될 수 있습니다 — 요구하신 경우 지정한 분야로요. 직접 엔지니어를 선택하고 마일스톤에 입금하기 전까지는 아무것도 확정되지 않습니다.",
      },
      {
        q: "엔지니어는 매칭에 표시되기 전에 어떻게 검증되나요?",
        a: "세 가지 방식으로, 모두 자진 신고가 아니라 플랫폼이 강제합니다. 온보딩 시 치르는 실무형 AI 기술 평가는 프로필에 검증된 점수를 설정하고, 인증 시험 게이트는 인증받은 엔지니어만 공식적으로 배정될 수 있게 하며(지정한 경우 요구하신 분야로), TalScore는 평가 결과, 인증, 고용주 평점, 납품 신뢰도로 구성된 지속적인 품질 점수로 검색 정렬과 인재 풀 후보 목록에 영향을 미칩니다.",
      },
      {
        q: "AI 평가와 플랫폼 인증의 차이는 무엇인가요?",
        a: "평가는 엔지니어가 온보딩 중에 치르는 실무형 기술 인터뷰로, 프로필의 검증된 점수와 검색·매칭에서의 순위에 반영됩니다. 인증은 등급이 매겨진 별도의 더 심층적인 시험 트랙입니다 — AI가 각 답안을 채점하고, 인증서가 발급되기 전에 사람 관리자가 이를 검토합니다. 평가는 엔지니어가 얼마나 잘 노출되고 높은 순위에 오르는지를 좌우하고, 인증은 프로젝트에 공식적으로 배정될 수 있게 하는 엄격한 관문입니다.",
      },
      {
        q: "작업을 현장과 원격 모두로 납품할 수 있나요?",
        a: "네. 현장 시운전은 정식으로 지원되는 흐름입니다 — 엔지니어는 현장에서 체크인하려면 유효한 인증을 보유해야 하며, 체크인 위치는 서버에서 지오펜스를 기준으로 계산되므로 조작할 수 없습니다. 완료 사진은 마일스톤에 첨부되어 승인의 근거가 되는 기록이 됩니다.",
      },
      {
        q: "납품 검토를 잊으면 에스크로가 자동으로 릴리즈되나요?",
        a: "아니요. 자금은 명시적인 승인에 의해서만 움직입니다 — 플랫폼이 타이머로 자동 릴리즈하는 일은 결코 없습니다. 고용주와 엔지니어가 납품에 대해 의견이 다를 경우, 어느 쪽이든 분쟁을 개시할 수 있으며, 이 경우 관리자가 양측의 증거를 검토할 때까지 마일스톤이 동결됩니다.",
      },
      {
        q: "내 프로젝트의 마일스톤은 어떻게 정의되나요?",
        a: "등록하면 플랫폼의 AI가 설명을 기술 범위와 마일스톤 계획으로 구조화하여, 결제 체크포인트가 달력상의 날짜가 아니라 검토 완료된 설계, 시운전 완료된 셀 같은 구체적인 산출물에 대응하도록 합니다. 이후 각 마일스톤은 개별적으로 입금 및 승인되어, 모든 결제가 직접 검사할 수 있는 대상에 연결된 상태를 유지합니다.",
      },
    ],
    finalTitle: "마일스톤 하나로 전체 흐름을 확인하세요",
    finalSub: "프로젝트를 무료로 등록하고 마일스톤 하나에만 입금한 뒤, 승인하기 전에 이 페이지의 모든 단계가 실제로 작동하는 모습을 확인하세요.",
  },

};

module.exports = { DICT };
