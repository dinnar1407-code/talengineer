// 职业页（/occupations/[role]）的内容数据层（数据驱动，照 lib/hireMatrix 的 getMatrixPage 模式）。
//
// 设计约定（诚实红线）：
// - 零编造统计：职责/市场描述只写"结构性事实 + 定性判断"（regionGuides 同一口径），
//   不写任何具体统计数字（时薪中位数、缺口人数、增长率一类一律不写）。
// - 费率区间不另立数字：页面直接复用 lib/hireMatrix 的 REGIONS（与 /hire/[track] 及 /rates 同一唯一来源）。
// - 认证机制描述与 src/config/training.js 同口径，但**不复写具体题数/分钟数/及格分**——
//   那些数字的展示位留给 /certification 与 /how-it-works（各页单一来源原则，防数字漂移）。
// - 只有 4 条认证方向（plc/robotics/vision/electrical，见 /hire/[track] 与 training 模块）：
//   scada-engineer 是职业页里唯一"职业 ≠ 方向"的角色，其内容必须诚实声明
//   SCADA 工作的筛选与认证归属 PLC & Controls 方向，绝不能暗示存在独立的 SCADA 证书。
// - 方向元数据（label/kicker/skills/levels）经 getTrackMeta 从 hireMatrix 取，不重抄文案。
//
// 每个职业条目的形状：
//   { track, name, roleSkills[], relatedPlaybookSlugs?, en: {kicker,title,sub,lead1,lead2,faq[4]}, zh: {…} }
// - track：认证方向 slug（决定费率表口径、认证路径、内链的归属）。
// - name：职业短名（兄弟职业内链、面包屑用——用 title 会把"Hire a …"整句塞进链接，太长）。
// - roleSkills：职业专属技能 chips（与方向技能 getTrackMeta().skills 互补，页面可两排并列）。
// - relatedPlaybookSlugs：手工策展的相关 Playbook 文章（slug 必须真实存在于 content/playbook/）。
// 注意：带 .js 扩展名——node --test 走原生 ESM 解析（不带扩展名会 ERR_MODULE_NOT_FOUND），
// Next.js 的打包器两种写法都认。
import { REGIONS, RATES_NOTE, getTrackMeta, getIndustriesForTrack } from './hireMatrix.js';

// ── 6 个职业（键 = role slug，即 /occupations/[role] 的路由段）───────────────
const OCCUPATIONS = {
  'plc-programmer': {
    track: 'plc',
    name: { en: 'PLC Programmer', zh: 'PLC 程序员' },
    roleSkills: ['Ladder / ST / FBD', 'Siemens TIA Portal', 'Rockwell Studio 5000', 'HMI (WinCC / FactoryTalk View)', 'VFD & I/O commissioning', 'Fault diagnostics'],
    relatedPlaybookSlugs: ['plc-programmer-hourly-rates-2026', 'siemens-vs-allen-bradley-talent', 'platform-certification-explained'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a PLC Programmer',
      sub: 'Pre-screened programmers for ladder, structured text and HMI work on Siemens, Rockwell, Mitsubishi and Beckhoff — matched to your exact controller, protected by milestone escrow.',
      lead1:
        'A PLC programmer turns a machine specification into working control logic: ladder and structured text on the controller, HMI screens the operators actually use, drive and I/O configuration, and the commissioning that proves it all under real conditions. It is a hands-on role — the deliverable is not a document but a line that runs, and the quality of the code decides how maintainable that line stays for the next decade.',
      lead2:
        'The hiring problem is platform depth. "PLC experience" on a résumé says little about whether someone can move confidently in your exact installed base — a Siemens S7-1500 house and a Rockwell ControlLogix house are different worlds of instructions, tooling and habits. We match by platform and verify by practical assessment, so you filter to programmers whose depth has been demonstrated rather than claimed.',
      faq: [
        {
          q: 'What does a PLC programmer actually deliver?',
          a: 'Typical scopes include new machine and line logic, retrofits and controller migrations, HMI development, fault-recovery and diagnostics improvements, and on-site commissioning support. On TalEngineer every scope is broken into milestones before work starts, so the deliverable of each stage — code drop, simulated test, site acceptance — is explicit and tied to an escrow release.',
        },
        {
          q: 'PLC programmer vs controls engineer — which one do I need?',
          a: 'If the control architecture, panel design and network layout already exist and you need the logic written, tested and commissioned, a PLC programmer fits. If someone must own the design itself — functional specs, network architecture, safety concept, vendor coordination, FAT/SAT — you are looking for a controls engineer. Many projects need both, with the controls engineer setting the frame the programmer executes in.',
        },
        {
          q: 'How does TalEngineer verify a PLC programmer?',
          a: 'Every engineer takes a practical AI technical screener as part of onboarding, and the result becomes the verified score on their profile. Beyond that, they can sit certification exams in the PLC & Controls track at three levels (L1–L3); exams are AI-scored and then reviewed by a platform admin before any certificate is issued, and only engineers holding a valid platform certification can be officially assigned to your project — in the PLC & Controls track, if you require it.',
        },
        {
          q: 'Can PLC programming be done remotely?',
          a: 'Large parts of it can: logic development, HMI work and emulator or digital-twin testing travel well over a remote setup. Commissioning is the exception — someone has to stand at the machine when it first runs. The common pattern on our platform is hybrid: development remote, commissioning done by the same engineer on site or paired with a local engineer, coordinated in one project room.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣 PLC 程序员',
      sub: '经过预审的程序员，负责 Siemens、Rockwell、Mitsubishi、Beckhoff 上的梯形图、结构化文本与 HMI 工作——按你的具体控制器匹配，里程碑托管保障。',
      lead1:
        'PLC 程序员把一份设备规格书变成能跑的控制逻辑：控制器上的梯形图与结构化文本、操作工真正在用的 HMI 画面、驱动器与 I/O 配置，以及在真实工况下验证这一切的调试。这是个动手的职位——交付物不是一份文档，而是一条跑起来的产线；代码的质量，决定这条线未来十年好不好维护。',
      lead2:
        '招聘的难点在平台深度。简历上一句"有 PLC 经验"，说明不了他能不能在你的具体设备底座里游刃有余——一个 Siemens S7-1500 车间和一个 Rockwell ControlLogix 车间，是指令、工具链、习惯完全不同的两个世界。我们按平台匹配、用实操评估验证，让你筛出的是"被验证过深度"的程序员，而不是"自称有深度"的。',
      faq: [
        {
          q: 'PLC 程序员到底交付什么？',
          a: '典型范围包括：新设备/新产线逻辑、旧线改造与控制器迁移、HMI 开发、故障恢复与诊断优化、以及现场调试支持。在 TalEngineer 上，每个范围在开工前都会拆成里程碑，每个阶段的交付物——代码提交、仿真测试、现场验收——都是明确的，并与一次托管放款挂钩。',
        },
        {
          q: 'PLC 程序员和控制工程师，我该要哪个？',
          a: '如果控制架构、电柜设计、网络布局都已存在，你需要的是把逻辑写出来、测通、调完——那是 PLC 程序员。如果需要有人对设计本身负责——功能规格书、网络架构、安全概念、供应商协调、FAT/SAT——你要找的是控制工程师。很多项目两者都需要：控制工程师定框架，程序员在框架里执行。',
        },
        {
          q: 'TalEngineer 怎么验证一个 PLC 程序员？',
          a: '每位工程师在入驻时都要通过一套实操型 AI 技术筛选，结果成为其档案上的筛选分。在此之上，还可在 PLC 与控制方向考取三个级别（L1–L3）的认证；考试由 AI 评分、再经平台管理员复核后才发证，并且只有持有有效平台认证的工程师才能被正式指派到你的项目——如果你要求 PLC 与控制方向的证书，须持有该方向证书。',
        },
        {
          q: 'PLC 编程能远程做吗？',
          a: '很大一部分可以：逻辑开发、HMI 工作、仿真器或数字孪生上的测试，远程都做得好。例外是调试——设备第一次跑起来的时候，必须有人站在机器旁。平台上常见的模式是混合式：开发远程完成，调试由同一位工程师到现场、或搭配一位本地工程师完成，全程在同一个项目间协同。',
        },
      ],
    },
  },

  'controls-engineer': {
    track: 'plc',
    name: { en: 'Controls Engineer', zh: '控制工程师' },
    roleSkills: ['Control system architecture', 'Functional specs (FDS)', 'Network design (Profinet / EtherNet-IP)', 'Safety concept (PLe / SIL)', 'FAT / SAT', 'Multi-vendor integration'],
    relatedPlaybookSlugs: ['how-to-hire-a-controls-engineer', 'scada-integrator-due-diligence-checklist', 'siemens-vs-allen-bradley-talent'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a Controls Engineer',
      sub: 'Engineers who own the control system end to end — architecture, specifications, network and safety design, vendor coordination and acceptance sign-off. Verified and escrow-protected.',
      lead1:
        'A controls engineer owns the control system as a system. Where a PLC programmer executes within a defined architecture, the controls engineer defines it: the functional specification, the controller and network architecture, the electrical and safety concept, the interfaces between machines and vendors, and the acceptance tests — FAT and SAT — that decide when the system is actually done. On a greenfield line or a multi-vendor integration, this is the role that keeps twenty moving pieces coherent.',
      lead2:
        'It is also the role where a bad hire costs the most, because the mistakes are architectural: an undersized network, a safety concept bolted on late, interfaces nobody owns until they fail during commissioning. We screen controls engineers on design and integration judgment — not just code — and certify them in the PLC & Controls track at three levels, so you can put verified seniority on the decisions that are hardest to undo.',
      faq: [
        {
          q: 'When do I need a controls engineer rather than a PLC programmer?',
          a: 'When the shape of the system is still open. If you are specifying a new line, coordinating several machine builders, choosing the network and safety architecture, or migrating a plant standard, someone has to own those decisions and their documentation — that is controls engineering. If the design exists and the work is writing and commissioning logic inside it, a PLC programmer is the better-priced fit.',
        },
        {
          q: 'What does a controls engineer typically own on a project?',
          a: 'The functional design specification, controller and network architecture, the safety concept and its required performance levels, I/O and interface definitions between vendors, the FAT/SAT test plans and their sign-off, and technical leadership through commissioning. On milestone-based projects those artifacts — spec approved, design review passed, FAT passed, SAT passed — map naturally onto escrow stages.',
        },
        {
          q: 'Can one controls engineer cover both Siemens and Rockwell environments?',
          a: 'At the architecture level the thinking transfers well — network segmentation, safety design and interface discipline are platform-independent. Implementation detail is not, so on our platform you still filter by the installed base the engineer has actually delivered on. For dual-platform plants, a common pattern is one architecture owner plus platform-specific programmers.',
        },
        {
          q: 'How is a controls engineer engagement structured on TalEngineer?',
          a: 'Like every engagement: scoped into milestones with funds held in escrow and released as each stage is accepted. Design-heavy scopes typically milestone on documents and reviews (spec, design review, FAT) before site work. Verification is the same as all tracks — a practical AI screening at onboarding that sets your verified score, plus PLC & Controls certification at three levels, reviewed by an admin before issue. Only engineers holding a valid platform certification can be officially assigned — in the PLC & Controls track, if the project requires it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣控制工程师',
      sub: '对控制系统端到端负责的工程师——架构、规格书、网络与安全设计、供应商协调、验收签字。经过验证，托管保障。',
      lead1:
        '控制工程师把控制系统当作一个"系统"来负责。PLC 程序员是在既定架构里执行，而控制工程师负责定义这个架构：功能规格书、控制器与网络架构、电气与安全概念、设备与供应商之间的接口，以及决定系统"到底算不算完成"的验收测试——FAT 与 SAT。在一条全新产线或一个多供应商集成项目上，正是这个角色让二十个同时在动的环节保持连贯。',
      lead2:
        '这也是招错人代价最大的职位，因为错误是架构级的：网络容量不够、安全概念事后补丁、没人认领的接口拖到调试时集中爆发。我们在设计与集成判断力上筛选控制工程师——而不只是看代码——并在 PLC 与控制方向按三个级别发放认证，让你把"被验证过的资历"放在那些最难回头的决策上。',
      faq: [
        {
          q: '什么时候该要控制工程师，而不是 PLC 程序员？',
          a: '当系统的形状还没定下来的时候。如果你在规划一条新线、协调多家设备商、选择网络与安全架构、或者迁移工厂标准，就必须有人对这些决策及其文档负责——这就是控制工程。如果设计已经存在，工作是往里写逻辑并调试，那 PLC 程序员是性价比更高的选择。',
        },
        {
          q: '控制工程师在项目上通常负责什么？',
          a: '功能设计规格书(FDS)、控制器与网络架构、安全概念及其所需性能等级、供应商之间的 I/O 与接口定义、FAT/SAT 测试计划及其签字确认、以及贯穿调试期的技术带队。在里程碑制项目上，这些产物——规格书批准、设计评审通过、FAT 通过、SAT 通过——天然对应一个个托管阶段。',
        },
        {
          q: '一位控制工程师能同时覆盖 Siemens 和 Rockwell 环境吗？',
          a: '在架构层面，思维是能迁移的——网络分区、安全设计、接口纪律都与平台无关。但实现细节不通用，所以在平台上你仍应按工程师真正交付过的设备底座来筛选。对双平台工厂，常见做法是一位架构负责人，搭配各平台的专属程序员。',
        },
        {
          q: '在 TalEngineer 上，控制工程师的合作怎么组织？',
          a: '和所有合作一样：拆成里程碑，资金托管，每个阶段验收后放款。设计为主的范围，通常先按文档与评审设里程碑（规格书、设计评审、FAT），再进现场。验证方式与所有方向一致——入驻时的实操型 AI 筛选，结果计入你的筛选分；加上 PLC 与控制方向的三级认证，发证前经管理员复核。只有持有有效平台认证的工程师才能被正式指派——如果项目要求 PLC 与控制方向的证书，须持有该方向证书。',
        },
      ],
    },
  },

  'robotics-engineer': {
    track: 'robotics',
    name: { en: 'Robotics Engineer', zh: '机器人工程师' },
    roleSkills: ['Fanuc / KUKA / ABB / Yaskawa', 'Offline programming & simulation', 'Cell layout & reach studies', 'EOAT & tooling integration', 'Robot–PLC integration', 'Cycle-time optimization'],
    relatedPlaybookSlugs: ['robot-cell-commissioning-guide', 'platform-certification-explained'],
    en: {
      kicker: 'Role · Robotics',
      title: 'Hire a Robotics Engineer',
      sub: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, offline programming and on-site commissioning — verified on real cell problems, protected by milestone escrow.',
      lead1:
        'A robotics engineer carries a cell from concept to production: layout and reach studies, simulation and offline programming, end-of-arm tooling integration, the robot–PLC handshake, safety configuration, and the teach-and-tune work on site that turns a simulated cycle into a real one. The robot is the easy part — the job is everything around it: fixturing, part presentation, peripherals and the seconds hiding in the path.',
      lead2:
        'Hiring is complicated by the fact that robot brands are genuinely different platforms — Fanuc, KUKA, ABB and Yaskawa each have their own controllers, languages and habits, and commissioning is high-pressure, public work where mistakes are expensive. We screen robotics engineers on real path, tooling and integration problems, and certify them at three levels so you can match seniority to the risk of the job.',
      faq: [
        {
          q: 'What does a robotics engineer do beyond programming the robot?',
          a: 'Most of the value sits around the robot: cell layout and reach validation, EOAT selection and integration, gripping and part-presentation strategy, robot-to-PLC and safety integration, cycle-time analysis, and commissioning. A cell that merely moves is a demo; a cell that holds cycle time with the fixturing and peripherals it actually has is engineering.',
        },
        {
          q: 'Do I need a brand-specific engineer?',
          a: 'For programming and commissioning, usually yes — Fanuc TP/KAREL, KUKA KRL and ABB RAPID are different languages on different controllers, and fluency on your brand shows up directly in commissioning speed. For concept and layout work the thinking transfers better. On TalEngineer you filter by the brands an engineer has been screened on, not by a generic "robotics" checkbox.',
        },
        {
          q: 'Which parts of robot work can be done remotely?',
          a: 'Simulation, offline programming and cell-design reviews travel well — a large share of program structure can exist before anyone touches the real cell. Teach-in, collision-critical tuning and commissioning are on-site by nature. The common split on our platform: OLP and design remote, with the commissioning trip scoped as its own milestone.',
        },
        {
          q: 'How does TalEngineer verify a robotics engineer?',
          a: 'Every engineer takes a practical AI technical screener at onboarding, which sets the verified score on their profile, and can certify in the Robotics track at three levels (L1–L3) — from executing well-defined cell work to designing complex, multi-robot cells. Exams are AI-scored and admin-reviewed before a certificate is issued, and only engineers holding a valid platform certification can be officially assigned to projects — in the Robotics track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 机器人',
      title: '雇佣机器人工程师',
      sub: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、离线编程与现场调试——在真实工作站问题上验证，里程碑托管保障。',
      lead1:
        '机器人工程师把一个工作站从概念带到量产：布局与可达性分析、仿真与离线编程、末端工具(EOAT)集成、机器人与 PLC 的握手、安全配置，以及现场的示教与调优——把仿真里的节拍变成真实的节拍。机器人本体是最简单的部分——这份工作的重头在它周围：工装、来料呈现、外围设备，以及藏在路径里的那几秒钟。',
      lead2:
        '招聘的复杂之处在于，机器人品牌是真正不同的平台——Fanuc、KUKA、ABB、Yaskawa 各有自己的控制器、语言和习惯；而调试又是高压、众目睽睽、出错代价高昂的活。我们在真实的路径、工装与集成问题上筛选机器人工程师，并按三个级别发放认证，让你按任务风险匹配资历。',
      faq: [
        {
          q: '除了给机器人编程，机器人工程师还做什么？',
          a: '大部分价值都在机器人之外：工作站布局与可达性验证、EOAT 选型与集成、抓取与来料呈现策略、机器人-PLC 与安全集成、节拍分析、以及调试。一个"能动"的工作站只是 demo；一个带着真实工装与外围设备还守得住节拍的工作站，才是工程。',
        },
        {
          q: '我需要按品牌找工程师吗？',
          a: '编程与调试环节，通常需要——Fanuc TP/KAREL、KUKA KRL、ABB RAPID 是跑在不同控制器上的不同语言，对你所用品牌的熟练度会直接体现在调试速度上。概念与布局阶段的思维则更通用。在 TalEngineer 上，你按工程师被筛选验证过的品牌来过滤，而不是按一个笼统的"会机器人"勾选框。',
        },
        {
          q: '机器人工作哪些部分能远程做？',
          a: '仿真、离线编程(OLP)与工作站设计评审远程做得很好——在任何人碰真实工作站之前，程序结构的很大一部分就能成型。示教、碰撞敏感的调优与调试则天然要在现场。平台上常见的分工：OLP 与设计远程完成，调试行程单独立项为一个里程碑。',
        },
        {
          q: 'TalEngineer 怎么验证机器人工程师？',
          a: '每位工程师在入驻时都要通过实操型 AI 技术筛选，结果成为档案上的筛选分，并可在机器人方向考取三个级别（L1–L3）的认证——从执行范围明确的工作站工作，到设计复杂的多机器人工作站。考试由 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派到项目——如要求机器人方向证书，须持有该方向证书。',
        },
      ],
    },
  },

  'vision-engineer': {
    track: 'vision',
    name: { en: 'Machine Vision Engineer', zh: '机器视觉工程师' },
    roleSkills: ['Cognex / Keyence / Halcon', 'Lighting & optics selection', 'Camera calibration', '2D / 3D inspection & guidance', 'OCR / OCV', 'Gauge R&R'],
    relatedPlaybookSlugs: ['platform-certification-explained'],
    en: {
      kicker: 'Role · Machine Vision',
      title: 'Hire a Machine Vision Engineer',
      sub: 'Inspection, guidance and measurement specialists across Cognex, Keyence and Halcon — verified where systems actually fail: lighting, optics, calibration and real-world variation.',
      lead1:
        'A machine vision engineer designs the whole imaging chain, not just the software: feasibility and sample studies, lighting and optics selection, camera and lens choice, calibration, the inspection or guidance application itself, and the proof that it stays reliable against real production variation. The decisive work happens before any algorithm runs — a well-lit image makes the application easy, and a poorly lit one makes it impossible.',
      lead2:
        'This is also the specialty with the widest gap between a demo and a production system. Systems that worked on the bench fail on the floor because of ambient light, part variation, surface changes and drift — none of which show up on a résumé. We screen vision engineers on exactly that practical judgment, and certify them at three levels of depth in the Machine Vision track.',
      faq: [
        {
          q: 'What should a vision feasibility study cover before I commit to a system?',
          a: 'Real samples — including your worst parts, not just golden ones — a lighting and optics concept tested against them, a defined accuracy or detection target, and an honest statement of what the system will not catch. For measurement applications, expect a gauge study (repeatability against your tolerance) before the design is trusted to gate product.',
        },
        {
          q: 'Smart camera or PC-based system — how does an engineer choose?',
          a: 'By the problem, not by preference. Well-bounded inspections at moderate speed often fit a smart camera (Cognex or Keyence class) with less integration overhead; complex multi-camera work, demanding algorithms or tight cycle budgets push toward PC-based tools like Halcon. A good engineer can justify the choice in terms of your parts, rates and maintenance staff — and is not locked to one vendor.',
        },
        {
          q: 'Why do vision projects fail after a successful demo?',
          a: 'Because the floor is not the lab: ambient light leaks in, parts arrive dirty or slightly different, surfaces and lighting age, and presentation varies. Preventing that is design work — controlled lighting, robust fixturing or software tolerance to variation, and monitoring for drift. It is precisely the judgment we screen for, because it is invisible in a portfolio of successful screenshots.',
        },
        {
          q: 'How does TalEngineer verify a vision engineer?',
          a: 'A practical AI screening at onboarding sets the verified score on an engineer\'s profile, plus certification in the Machine Vision track at three levels (L1–L3) — from configuring well-defined inspections up to architecting demanding systems and solving difficult lighting and accuracy problems. Exams are AI-scored and admin-reviewed before issue, and only engineers holding a valid platform certification can be officially assigned — in the Machine Vision track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 机器视觉',
      title: '雇佣机器视觉工程师',
      sub: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量专家——在系统真正会失败的地方验证：打光、光学、标定与现实变化。',
      lead1:
        '机器视觉工程师设计的是整条成像链，而不只是软件：可行性与样件研究、打光与光学选型、相机与镜头选择、标定、检测或引导应用本身，以及"面对真实生产变化仍然可靠"的证明。决定性的工作发生在任何算法运行之前——一张打光良好的图让应用变简单，一张打光糟糕的图让它变成不可能。',
      lead2:
        '这也是 demo 与量产系统之间落差最大的专业。台面上好好的系统到现场就失效：环境光、来料变化、表面变化、漂移——而这些在简历上一个都看不出来。我们恰恰就在这种实操判断上筛选视觉工程师，并在机器视觉方向按三个深度级别发放认证。',
      faq: [
        {
          q: '在决定上一套视觉系统之前，可行性研究应该覆盖什么？',
          a: '真实样件——包括你最差的件，而不只是"金样"——一套针对这些样件测试过的打光与光学方案、一个明确的精度或检出目标，以及一份诚实的"这套系统抓不住什么"的说明。测量类应用，还应在设计被信任去放行产品之前，先做量具分析（相对你的公差的可重复性）。',
        },
        {
          q: '智能相机还是 PC 式系统——工程师怎么选？',
          a: '按问题选，不按偏好选。边界清晰、速度适中的检测，往往一台智能相机（Cognex、Keyence 这一档）就够，集成开销更小；复杂的多相机应用、高要求算法或紧张的节拍预算，则会推向 Halcon 这类 PC 式工具。好的工程师能用你的工件、速度和维护团队来论证选择——并且不被某一家供应商锁死。',
        },
        {
          q: '为什么视觉项目在 demo 成功之后还会失败？',
          a: '因为现场不是实验室：环境光会漏进来，来料会脏、会有细微不同，表面与光源会老化，摆放会变化。防住这些靠的是设计——受控打光、可靠的工装或对变化足够鲁棒的软件、以及对漂移的监控。这正是我们要筛选的判断力，因为它在一叠"成功截图"的作品集里是看不见的。',
        },
        {
          q: 'TalEngineer 怎么验证视觉工程师？',
          a: '入驻时先过实操型 AI 筛选，结果成为档案筛选分；之上是机器视觉方向的三级认证（L1–L3）——从配置范围明确的检测，到架构高要求系统、解决疑难打光与精度问题。考试 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派——如要求机器视觉方向证书，须持有该方向证书。',
        },
      ],
    },
  },

  'electrical-engineer': {
    track: 'electrical',
    name: { en: 'Industrial Electrical Engineer', zh: '工业电气工程师' },
    roleSkills: ['Panel design & layout', 'EPLAN / AutoCAD Electrical', 'VFD & motor circuits', 'UL 508A / IEC 60204', 'Power distribution', 'Field wiring & I/O design'],
    relatedPlaybookSlugs: ['platform-certification-explained'],
    en: {
      kicker: 'Role · Electrical',
      title: 'Hire an Industrial Electrical Engineer',
      sub: 'Panel design, drives and power distribution specialists — EPLAN schematics, UL 508A / IEC 60204 compliance and designs that are safe, buildable and maintainable.',
      lead1:
        'An industrial electrical engineer produces the design a machine is physically built from: the schematic package, panel layout with thermal and clearance planning, motor and VFD circuits, power distribution, protective device coordination, and the field wiring and I/O documentation the installers and the controls team both work against. When the drawings are right, the panel shop builds without questions and commissioning starts from a known-good baseline.',
      lead2:
        'When they are wrong, the cost surfaces at the worst time — during build and commissioning, as rework, delays and safety findings. Standards make the role unforgiving: a design intended for North America lives under UL 508A and NFPA 79, one for Europe under IEC 60204, and the differences reach down to components, ratings and markings. We screen electrical engineers on real panel, drive and compliance problems, and certify them at three levels.',
      faq: [
        {
          q: 'What does an industrial electrical engineer deliver?',
          a: 'A complete, buildable documentation package: schematics (typically EPLAN or AutoCAD Electrical), panel layout with thermal calculation, bill of materials, cable and wiring lists, protective-device sizing and coordination, and the compliance documentation for the target standard. On milestone projects the package usually gates a design-review milestone before any metal is cut.',
        },
        {
          q: 'UL or IEC — why does the target market change the design?',
          a: 'Because the standards differ in substance, not just paperwork. A UL 508A panel for the US market and an IEC 60204 machine for Europe differ in accepted components and their certifications, short-circuit ratings, conductor sizing rules, and markings. A design carried unmodified across markets is a classic source of failed inspections — so match the engineer to the standard your machine ships under.',
        },
        {
          q: 'How does the electrical engineer work with the controls side?',
          a: 'Through explicit interfaces: the I/O list, panel space and heat budget for controls hardware, network and cable segregation, and the safety-circuit design both sides must agree on. On multi-engineer projects our project room keeps that coordination in one thread — the electrical engineer, the PLC programmer and your team see the same milestones and the same documents.',
        },
        {
          q: 'How does TalEngineer verify an electrical engineer?',
          a: 'A practical AI screening at onboarding sets the verified score on an engineer\'s profile, plus certification in the Electrical track at three levels (L1–L3) — from standard panel layouts under guidance to architecting power distribution and complex electrical systems. Exams are AI-scored and reviewed by an admin before a certificate is issued, and only engineers holding a valid platform certification can be officially assigned to projects — in the Electrical track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 电气',
      title: '雇佣工业电气工程师',
      sub: '电柜设计、驱动与配电专家——EPLAN 图纸、UL 508A / IEC 60204 合规，交出安全、可施工、可维护的设计。',
      lead1:
        '工业电气工程师产出的是机器实际据以建造的设计：图纸包、带散热与间距规划的电柜布局、电机与变频器回路、配电、保护器件的配合，以及安装队和控制团队共同依据的现场接线与 I/O 文档。图纸对了，钣金厂不带疑问地照图施工，调试从一个已知正确的基线开始。',
      lead2:
        '图纸错了，代价会在最糟糕的时刻浮出水面——制造与调试期间，以返工、延期和安全整改的形式出现。标准让这个职位容不得含糊：面向北美的设计活在 UL 508A 与 NFPA 79 之下，面向欧洲的活在 IEC 60204 之下，差异一路下探到元器件、额定值与标识。我们在真实的电柜、驱动与合规问题上筛选电气工程师，并按三个级别发放认证。',
      faq: [
        {
          q: '工业电气工程师交付什么？',
          a: '一套完整、可施工的文档包：图纸（通常是 EPLAN 或 AutoCAD Electrical）、带热计算的电柜布局、物料清单(BOM)、电缆与接线清单、保护器件的选型与配合、以及面向目标标准的合规文档。在里程碑制项目上，这个文档包通常构成"设计评审"里程碑的闸门——通过之后才开始动手加工。',
        },
        {
          q: 'UL 还是 IEC——为什么目标市场会改变设计？',
          a: '因为两套标准是实质差异，不只是文书差异。面向美国市场的 UL 508A 电柜和面向欧洲的 IEC 60204 机器，在可接受的元器件及其认证、短路额定值、导线选型规则、标识要求上都不同。把一套设计原封不动搬到另一个市场，是验收不通过的经典来源——所以要按你的机器出货所在的标准来匹配工程师。',
        },
        {
          q: '电气工程师怎么和控制侧协作？',
          a: '通过明确的接口：I/O 清单、控制硬件的柜内空间与热预算、网络与电缆的隔离走线、以及双方必须共同确认的安全回路设计。在多工程师项目上，我们的项目间把这种协调收在同一条线索里——电气工程师、PLC 程序员和你的团队看到的是同一组里程碑、同一批文档。',
        },
        {
          q: 'TalEngineer 怎么验证电气工程师？',
          a: '入驻时先过实操型 AI 筛选，结果成为档案筛选分；之上是电气方向的三级认证（L1–L3）——从在指导下完成标准电柜布局，到架构配电与复杂电气系统。考试由 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派到项目——如要求电气方向证书，须持有该方向证书。',
        },
      ],
    },
  },

  'scada-engineer': {
    // 注意：track = 'plc' 不是笔误——平台只有 4 条认证方向（plc/robotics/vision/electrical），
    // SCADA 属于监控层，其筛选与认证诚实地归入 PLC & Controls 方向（见下方 lead2 与 FAQ 第 3 条）。
    track: 'plc',
    name: { en: 'SCADA Engineer', zh: 'SCADA 工程师' },
    roleSkills: ['Ignition', 'Siemens WinCC', 'FactoryTalk View SE', 'AVEVA (Wonderware)', 'Historians & reporting', 'OPC UA & drivers'],
    relatedPlaybookSlugs: ['scada-integrator-due-diligence-checklist', 'platform-certification-explained'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a SCADA Engineer',
      sub: 'Ignition, WinCC, FactoryTalk View SE and AVEVA specialists for supervisory control, historians and OPC UA integration — verified and escrow-protected.',
      lead1:
        'A SCADA engineer builds the supervisory layer above the machines: the tag database and its naming discipline, operator screens at plant scale, alarm philosophy and rationalization, trending, historian and reporting infrastructure, and the OPC UA and driver connectivity that ties dozens of PLCs into one coherent picture. Done well, it is how a plant actually sees itself; done badly, it is a wall of nuisance alarms nobody trusts.',
      lead2:
        'One thing we state plainly: TalEngineer runs four certification tracks — PLC & Controls, Robotics, Machine Vision and Electrical — and SCADA work is scored and certified within the PLC & Controls track rather than as a separate certificate. That reflects how the work actually connects: supervisory systems stand on controls fundamentals. What you filter on in practice is the platform itself, because an Ignition house and a WinCC house are different toolchains.',
      faq: [
        {
          q: 'What does a SCADA engineer build?',
          a: 'The plant-level supervisory system: tag structure and naming standards, HMI/SCADA screens beyond single-machine scope, alarm management, historian configuration, trending and reports, user and security models, and connectivity — OPC UA, drivers and gateways — to the underlying PLCs and devices. Scopes range from greenfield SCADA builds to migrations between platforms and historian or alarm-rationalization projects.',
        },
        {
          q: 'Which SCADA platforms do engineers on TalEngineer cover?',
          a: 'The major industrial platforms: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE and AVEVA (Wonderware) System Platform / InTouch, plus historian products and OPC UA connectivity. Platform fluency matters as much as it does for PLC brands, so you filter by the specific platform your plant runs.',
        },
        {
          q: 'Is there a dedicated SCADA certification track?',
          a: 'No — and we would rather say so than imply one exists. The platform currently certifies four tracks (PLC & Controls, Robotics, Machine Vision, Electrical), and SCADA engineers are scored and certified under PLC & Controls, where supervisory work technically belongs. The practical AI screening and the project history on an engineer profile are where SCADA-specific depth shows.',
        },
        {
          q: 'How much SCADA work can be done remotely?',
          a: 'More than most automation work: screen development, tag and alarm engineering, historian configuration and reporting are naturally remote-friendly once secure access is in place. Site presence concentrates around connectivity to live equipment, cutovers and acceptance. A common structure is remote development milestones followed by an on-site cutover milestone, all escrow-protected.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣 SCADA 工程师',
      sub: 'Ignition、WinCC、FactoryTalk View SE、AVEVA 专家，负责监控层、历史库与 OPC UA 集成——经过验证，托管保障。',
      lead1:
        'SCADA 工程师构建的是设备之上的监控层：位号(tag)数据库及其命名纪律、工厂级的操作画面、报警哲学与报警治理、趋势、历史库(historian)与报表基础设施，以及把几十台 PLC 连成一幅连贯图景的 OPC UA 与驱动连接。做得好，它是一座工厂"看见自己"的方式；做得差，它是一墙没人信的垃圾报警。',
      lead2:
        '有一点我们直说：TalEngineer 目前只有四条认证方向——PLC 与控制、机器人、机器视觉、电气——SCADA 工作的评分与认证归入 PLC 与控制方向，而不是一张独立的 SCADA 证书。这也符合工作本身的连接方式：监控系统立在控制基本功之上。实际筛选时你要过滤的是平台本身，因为一个 Ignition 车间和一个 WinCC 车间是两套不同的工具链。',
      faq: [
        {
          q: 'SCADA 工程师构建什么？',
          a: '工厂级监控系统：位号结构与命名标准、超出单机范围的 HMI/SCADA 画面、报警管理、历史库配置、趋势与报表、用户与安全模型，以及通往底层 PLC 与设备的连接——OPC UA、驱动与网关。范围从全新 SCADA 建设，到平台之间的迁移，再到历史库或报警治理专项。',
        },
        {
          q: 'TalEngineer 上的工程师覆盖哪些 SCADA 平台？',
          a: '主流工业平台：Inductive Automation 的 Ignition、Siemens WinCC、Rockwell FactoryTalk View SE、AVEVA(Wonderware) System Platform / InTouch，外加历史库产品与 OPC UA 连接。平台熟练度和 PLC 品牌一样关键，所以要按你工厂实际在跑的具体平台来筛选。',
        },
        {
          q: '有独立的 SCADA 认证方向吗？',
          a: '没有——我们宁可直说，也不暗示它存在。平台目前认证四条方向（PLC 与控制、机器人、机器视觉、电气），SCADA 工程师在 PLC 与控制方向下评分与认证，监控层工作在技术上也确实归属于此。SCADA 专属的深度，体现在实操型 AI 筛选与工程师档案里的项目履历上。',
        },
        {
          q: 'SCADA 工作有多少能远程做？',
          a: '比大多数自动化工作都多：画面开发、位号与报警工程、历史库配置与报表，在安全访问就位后天然适合远程。需要到场的部分集中在与真实设备的连接、切换上线(cutover)与验收。常见的结构是：远程开发里程碑在前，现场切换里程碑在后，全程托管保障。',
        },
      ],
    },
  },
};

const OCCUPATION_SLUGS = Object.keys(OCCUPATIONS);

// ── 对外辅助 ─────────────────────────────────────────────────────────────

// getStaticPaths 用：枚举全部 6 个职业页的 {role}。
export function getOccupationPaths() {
  return OCCUPATION_SLUGS.map((role) => ({ params: { role } }));
}

// 某认证方向下的职业清单（/hire/[track] 的「常见职位名」带 + 职业页的兄弟职业内链共用）。
// 返回 [{ role, name: {en,zh} }]；scada-engineer 因认证归属会出现在 plc 方向下——这是刻意的。
export function getRolesForTrack(track) {
  return OCCUPATION_SLUGS.filter((slug) => OCCUPATIONS[slug].track === track).map((slug) => ({
    role: slug,
    name: OCCUPATIONS[slug].name,
  }));
}

// 拼装职业页所需的全部数据：职业内容 + 方向元数据 + 费率表 + 内链。
// 未知 slug 返回 null（getStaticProps 里转 notFound，照 getMatrixPage 的约定）。
export function getOccupationPage(slug) {
  const entry = OCCUPATIONS[slug];
  if (!entry) return null;

  // 方向元数据（label/kicker/skills/levels）从 hireMatrix 单一来源取，避免文案重抄漂移。
  const trackMeta = getTrackMeta(entry.track);

  return {
    role: slug,
    track: entry.track,
    name: entry.name,
    roleSkills: entry.roleSkills,
    trackMeta,
    // 费率表：直接复用全站唯一来源 REGIONS（lib/hireMatrix），职业页不编"职业级费率差异"。
    regions: REGIONS,
    // 费率说明文案：单一来源 RATES_NOTE（lib/hireMatrix），职业页不重抄措辞（IA review #3/#14）。
    ratesNote: RATES_NOTE,
    content: { en: entry.en, zh: entry.zh },
    links: {
      // 所属方向母页
      trackPage: { href: `/hire/${entry.track}`, label: trackMeta.label },
      // 该方向下的行业垂直页（electrical 无组合时为空数组，页面按空态处理）
      industries: getIndustriesForTrack(entry.track).map((i) => ({
        href: `/hire/${entry.track}/${i.industry}`,
        label: i.label,
      })),
      // 兄弟职业（同方向的其他职业页）
      siblings: getRolesForTrack(entry.track)
        .filter((r) => r.role !== slug)
        .map((r) => ({ href: `/occupations/${r.role}`, label: r.name })),
      // 手工策展的相关 Playbook 文章（标题由页面层经 lib/playbook 解析，这里只给 slug/href）
      playbook: (entry.relatedPlaybookSlugs || []).map((s) => ({ href: `/playbook/${s}`, slug: s })),
    },
  };
}
