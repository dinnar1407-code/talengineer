// 方向 × 行业 垂直页矩阵的内容数据（数据驱动，页面 pages/hire/[track]/[industry].jsx 消费）。
//
// 设计约定：
// - 费率区间 REGIONS 与 pages/hire/[track].jsx 的 REGIONS 及 /rates 同源同口径，改一处两处都要同步。
// - 每个方向（plc/robotics/vision）的技能标签与认证级别（L1-L3）与 /hire/[track] 保持一致，
//   仅在行业维度补充“行业专属技能”与“行业痛点段”，做到内容有行业真实性、不写空话。
// - 组合枚举自 MATRIX（12 个组合），getStaticPaths 从这里取。
// - electrical 方向只有 TRACKS 元数据（供 getTrackMeta 给职业页/索引页复用），不进 MATRIX：
//   电气方向的行业差异化最弱，写不出"行业真实"的组合内容就不硬凑（首个真正差异化的组合写出来再进）。

// ── 各地区费率区间（与 /hire/[track] REGIONS 及 /rates 同源）──────────────
export const REGIONS = [
  { region: { en: 'North America', zh: '北美' }, rate: '$75–140/hr' },
  { region: { en: 'Western Europe', zh: '西欧' }, rate: '$70–120/hr' },
  { region: { en: 'Eastern Europe', zh: '东欧' }, rate: '$40–75/hr' },
  { region: { en: 'Mexico & Latin America', zh: '墨西哥及拉美' }, rate: '$35–65/hr' },
  { region: { en: 'China', zh: '中国' }, rate: '$35–70/hr' },
  { region: { en: 'Southeast Asia', zh: '东南亚' }, rate: '$30–55/hr' },
  { region: { en: 'India & South Asia', zh: '印度及南亚' }, rate: '$25–50/hr' },
];

// ── 费率说明文案（单一来源，供 4 个消费页统一 import）──────────────────────
// 诚实修复（IA review #3/#14）：REGIONS 是手工维护的静态区间，不是"来自活跃工程师
// 档案、实时更新"的数据——原文案在 4 个页面共 8 处编造了这个溯源。改为诚实地锚定到
// 真正实时的 /rates 基准页，其余内容（中段/现场溢价/托管费率）保持不变。
export const RATES_NOTE = {
  en: 'Indicative blended hourly-rate ranges by region, aligned with our live /rates benchmarks. Development work sits toward the middle of each range; on-site commissioning carries a premium. Platform escrow fee is 15% (5% for founding customers).',
  zh: '各地区综合时薪参考区间，与 /rates 实时基准同口径。开发类工作位于各区间中段，现场调试有溢价。平台托管费为 15%（founding 客户 5%）。',
};

// ── 方向元数据：与 /hire/[track] 同口径（技能 + 认证级别描述）───────────────
// 注：这里刻意与 pages/hire/[track].jsx 的 TRACKS 保持同源同文，是母页与矩阵页的一致性来源。
const TRACKS = {
  plc: {
    label: { en: 'PLC', zh: 'PLC' },
    kicker: { en: 'PLC & Controls', zh: 'PLC 与控制' },
    serviceBase: 'PLC Programming Talent',
    skills: ['Siemens TIA Portal', 'Rockwell Studio 5000', 'Ladder / ST', 'Mitsubishi', 'Beckhoff TwinCAT', 'Safety PLC'],
    levels: {
      en: {
        l1: 'Solid fundamentals — executes well-specified ladder/ST work under some guidance.',
        l2: 'Owns a scope end to end, makes sound design decisions, delivers with minimal oversight.',
        l3: 'Architects control systems, handles difficult commissioning and safety, leads technically.',
      },
      zh: {
        l1: '基础扎实——在一定指导下完成范围明确的 ladder/ST 工作。',
        l2: '能端到端负责一个范围，做出合理设计决策，少量监督即可交付。',
        l3: '能架构控制系统，处理疑难调试与安全，技术上带队。',
      },
    },
  },
  robotics: {
    label: { en: 'Robotics', zh: '机器人' },
    kicker: { en: 'Robotics', zh: '机器人' },
    serviceBase: 'Industrial Robotics Talent',
    skills: ['Fanuc', 'KUKA', 'ABB', 'Yaskawa', 'Cell commissioning', 'Path optimization'],
    levels: {
      en: {
        l1: 'Executes taught programs and well-defined cell work with guidance.',
        l2: 'Programs and commissions a cell independently, integrates PLC and peripherals.',
        l3: 'Designs complex cells, tunes cycle time, leads difficult multi-robot commissioning.',
      },
      zh: {
        l1: '在指导下执行示教程序与范围明确的工作站工作。',
        l2: '独立完成工作站编程与调试，集成 PLC 与外围设备。',
        l3: '设计复杂工作站，优化节拍，带队完成疑难的多机联调。',
      },
    },
  },
  vision: {
    label: { en: 'Machine Vision', zh: '机器视觉' },
    kicker: { en: 'Machine Vision', zh: '机器视觉' },
    serviceBase: 'Machine Vision Talent',
    skills: ['Cognex', 'Keyence', 'Halcon', 'Lighting & optics', 'Calibration', 'Inspection & guidance'],
    levels: {
      en: {
        l1: 'Configures well-defined inspections and sets up standard lighting.',
        l2: 'Designs robust inspection/guidance, handles calibration and variation independently.',
        l3: 'Architects demanding vision systems, solves difficult lighting and accuracy problems.',
      },
      zh: {
        l1: '配置范围明确的检测，搭建标准打光。',
        l2: '设计稳健的检测/引导，独立处理标定与变化。',
        l3: '架构高要求的视觉系统，解决疑难的打光与精度问题。',
      },
    },
  },
  // electrical：只提供方向元数据（getTrackMeta 消费，职业页 /occupations/electrical-engineer 与
  // /hire 索引页复用），刻意不进 MATRIX——见文件头注释。文案与 pages/hire/[track].jsx 同源同文。
  electrical: {
    label: { en: 'Electrical', zh: '电气' },
    kicker: { en: 'Electrical', zh: '电气' },
    serviceBase: 'Industrial Electrical Engineering Talent',
    skills: ['Panel design', 'EPLAN', 'VFD / drives', 'Schematic capture', 'UL / IEC', 'Power distribution'],
    levels: {
      en: {
        l1: 'Produces standard panel layouts and schematics under guidance.',
        l2: 'Designs compliant panels and drive systems independently, owns the electrical scope.',
        l3: 'Architects power distribution and complex electrical systems, handles code and safety.',
      },
      zh: {
        l1: '在指导下完成标准电柜布局与图纸。',
        l2: '独立设计合规的电柜与驱动系统，负责电气范围。',
        l3: '架构配电与复杂电气系统，处理规范与安全。',
      },
    },
  },
};

// ── 行业显示名（内链标签、serviceType 拼装用）────────────────────────────
const INDUSTRIES = {
  automotive: { en: 'Automotive Manufacturing', zh: '汽车制造', short: { en: 'Automotive', zh: '汽车' } },
  semiconductor: { en: 'Semiconductor Fabs', zh: '半导体', short: { en: 'Semiconductor', zh: '半导体' } },
  'food-beverage': { en: 'Food & Beverage', zh: '食品饮料', short: { en: 'Food & Beverage', zh: '食品饮料' } },
  pharma: { en: 'Pharmaceutical Manufacturing', zh: '制药', short: { en: 'Pharma', zh: '制药' } },
  '3c-electronics': { en: '3C Electronics', zh: '3C 电子', short: { en: '3C Electronics', zh: '3C 电子' } },
  packaging: { en: 'Packaging', zh: '包装', short: { en: 'Packaging', zh: '包装' } },
};

// ── 12 个方向×行业组合（键 = `${track}/${industry}`）─────────────────────
// 每个组合的行业痛点段必须行业具体（GMP/节拍/洁净室这类真词），拒绝可互换到任意行业的空话。
const MATRIX = {
  'plc/automotive': {
    track: 'plc',
    industry: 'automotive',
    industrySkills: ['Takt-time logic', 'Safety PLC (PLe / SIL)', 'Line changeover', 'Profinet / EtherNet-IP', 'Andon & traceability'],
    en: {
      title: 'Hire Certified PLC Programmers for Automotive Manufacturing',
      sub: 'Takt-critical, safety-rated controls for body-in-white and powertrain lines — Siemens and Rockwell programmers verified on real automotive commissioning.',
      pain1:
        'Automotive lines live and die by takt time. A PLC program that merely runs but cannot hold cycle time, or that stalls on a changeover between models, quietly costs you units every shift. Hiring for this floor means finding programmers who write logic that holds the beat — and who treat a body-in-white or powertrain line as a safety system first.',
      pain2:
        'Safety PLC work here is not optional: light curtains, robot interlocks and E-stop zones must be designed to the required performance level (PLe / SIL) and documented so an auditor can follow them. We screen for programmers who have commissioned safety-rated logic on Siemens or Rockwell and can prove it, not just claim it.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 汽车制造',
      sub: '面向车身(BIW)与动力总成产线的节拍关键、安全等级控制——Siemens、Rockwell 程序员经真实汽车调试验证。',
      pain1:
        '汽车产线的成败系于节拍。一个只是"能跑"却守不住节拍、或在换型时卡壳的 PLC 程序，每个班次都在悄悄吃掉你的产量。为这条线招人，意味着要找到能写出"踩得住节拍"逻辑的程序员——并且把车身(BIW)或动力总成产线首先当作一套安全系统来对待。',
      pain2:
        '这里的安全 PLC 不是可选项：光幕、机器人互锁与急停区必须按所需性能等级(PLe / SIL)设计，并写成审核员能顺下来的文档。我们筛选的是在 Siemens 或 Rockwell 上真正调试过安全等级逻辑、并且能拿出证据的程序员，而不是只在简历上写写。',
    },
  },
  'plc/semiconductor': {
    track: 'plc',
    industry: 'semiconductor',
    industrySkills: ['Cleanroom discipline', 'SECS/GEM interface', 'Gas & chemical interlocks', 'Minimal-downtime commissioning', 'Tool uptime'],
    en: {
      title: 'Hire Certified PLC Programmers for Semiconductor Fabs',
      sub: 'Cleanroom-grade equipment controls with SECS/GEM and gas/chemical interlocks — programmers who work to fab change-control discipline.',
      pain1:
        'Controls work inside a fab is unforgiving. Equipment runs in a cleanroom where every intervention is gowned, scheduled and expensive, so the PLC logic has to be right before it ever touches the tool. Sub-micron process windows mean a sloppy sequence does not just slow throughput — it scraps wafers.',
      pain2:
        'Fab controls also carry integration weight most factories never see: SECS/GEM host communication, interlocks on gas and chemical delivery, and abatement handshakes that cannot fail silently. We match you with programmers who have worked to fab discipline — change control, minimal-downtime commissioning windows, and documentation a process engineer will actually trust.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 半导体',
      sub: '洁净室级设备控制，含 SECS/GEM 与气体/化学品互锁——按晶圆厂变更管理纪律做事的程序员。',
      pain1:
        '晶圆厂里的控制活容不得半点马虎。设备运行在洁净室里，每一次介入都要穿无尘服、要排期、代价高昂，所以 PLC 逻辑必须在碰到设备之前就是对的。亚微米的工艺窗口意味着一段草率的时序不只是拖慢产能——它会报废晶圆。',
      pain2:
        '晶圆厂控制还背着大多数工厂从未见过的集成重量：SECS/GEM 主机通讯、气体与化学品输送的互锁、以及不能静默失败的尾气处理握手。我们为你匹配按晶圆厂纪律做过事的程序员——变更管理、最小停机的调试窗口、以及工艺工程师真正信得过的文档。',
    },
  },
  'plc/food-beverage': {
    track: 'plc',
    industry: 'food-beverage',
    industrySkills: ['CIP / SIP sequencing', 'ISA-88 batch control', 'Recipe management', 'Allergen changeover', 'Lot traceability'],
    en: {
      title: 'Hire Certified PLC Programmers for Food & Beverage',
      sub: 'Sanitary, recipe-driven controls for high-speed lines — CIP/SIP, ISA-88 batch and lot traceability, verified programmers.',
      pain1:
        'Food and beverage lines mix high speed with hard hygiene rules. CIP/SIP cycles, washdown environments and allergen changeovers all live in the PLC, and a recipe or sequencing mistake becomes a food-safety event, not just a downtime event. The programmer has to think about the product on the line, not only the machine.',
      pain2:
        'Batch and recipe control here usually follows ISA-88 (S88) structure, with lot traceability that has to survive an audit. We screen for programmers who have built recipe-driven, sanitary sequences — and who understand that "it runs" is not the bar when the output is something people eat.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 食品饮料',
      sub: '面向高速产线的卫生级、配方驱动控制——CIP/SIP、ISA-88 批次与批号追溯，经验证的程序员。',
      pain1:
        '食品饮料产线把高速度和硬性卫生规则混在一起。CIP/SIP 清洗、冲洗(washdown)环境、过敏原换型全都写在 PLC 里，一个配方或时序错误会变成食品安全事件，而不只是停机事件。程序员必须惦记产线上流的产品，而不只是机器。',
      pain2:
        '这里的批次与配方控制通常遵循 ISA-88(S88)结构，批号追溯要经得起审计。我们筛选的是搭建过配方驱动、卫生级时序的程序员——他们明白当产出是给人吃的东西时，"能跑"远远不是及格线。',
    },
  },
  'plc/pharma': {
    track: 'plc',
    industry: 'pharma',
    industrySkills: ['GMP / GAMP 5', '21 CFR Part 11', 'IQ / OQ / PQ validation', 'Audit trail (ALCOA)', 'Change control'],
    en: {
      title: 'Hire Certified PLC Programmers for Pharmaceutical Manufacturing',
      sub: 'Validation-first controls under GMP and GAMP 5 — 21 CFR Part 11 audit trails and IQ/OQ/PQ documentation, from programmers who have done it.',
      pain1:
        'Pharmaceutical controls are validation-first. Under GMP and GAMP 5, a PLC change is not done when it works — it is done when it is documented, tested and validated through IQ/OQ/PQ with a paper trail an inspector can follow. Programmers who have never worked to that discipline tend to underestimate it by an order of magnitude.',
      pain2:
        'Data integrity is the other half: 21 CFR Part 11 audit trails, ALCOA principles and controlled electronic records shape how the logic and HMI are even allowed to be written. We match you with programmers who have delivered validated systems in a GMP environment and can produce the documentation to prove it.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 制药',
      sub: 'GMP 与 GAMP 5 下"验证优先"的控制——21 CFR Part 11 审计追踪与 IQ/OQ/PQ 文档，来自真正做过的程序员。',
      pain1:
        '制药控制是"验证优先"的。在 GMP 与 GAMP 5 之下，一个 PLC 变更不是"能用了"就算完成——而是要经过 IQ/OQ/PQ 记录、测试、验证，并留下检查员能顺下来的书面轨迹。从没按这套纪律做过事的程序员，往往把它的工作量低估一个数量级。',
      pain2:
        '数据完整性是另一半：21 CFR Part 11 审计追踪、ALCOA 原则、以及受控的电子记录，从根上决定了逻辑与 HMI 被"允许"怎么写。我们为你匹配在 GMP 环境里交付过验证系统、并能拿出文档证明的程序员。',
    },
  },
  'robotics/automotive': {
    track: 'robotics',
    industry: 'automotive',
    industrySkills: ['Spot welding / BIW', 'Multi-robot cells', 'Cycle-time tuning', 'Dress-out & tooling', 'Safety zones'],
    en: {
      title: 'Hire Certified Robotics Engineers for Automotive Manufacturing',
      sub: 'Body-in-white and powertrain robot cells at takt — Fanuc, KUKA and ABB specialists verified on real multi-robot commissioning.',
      pain1:
        'Automotive is where industrial robotics lives at its most demanding — body-in-white shops run dozens of robots spot welding, handling and sealing at a takt time that never relaxes. Cycle time is money measured per second, so path and dress-out decisions that look minor decide whether the line makes its number.',
      pain2:
        'These are also multi-robot cells with tight safety choreography: shared work zones, interlocks and E-stop logic that must be commissioned without surprises. We screen robotics engineers on real automotive cell problems — cycle-time tuning, collision-free pathing and safe multi-robot commissioning — and certify them so you can match seniority to the risk.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 汽车制造',
      sub: '踩着节拍的车身(BIW)与动力总成机器人工作站——Fanuc、KUKA、ABB 专家，经真实多机联调验证。',
      pain1:
        '汽车是工业机器人最吃功力的战场——车身车间里几十台机器人同时点焊、搬运、涂胶，节拍从不松劲。节拍是按秒计价的钱，所以那些看似不起眼的路径与线缆布置(dress-out)决策，直接决定这条线能不能做到产量。',
      pain2:
        '这些还是安全编排极紧的多机工作站：共享工作区、互锁、急停逻辑，都必须调试到"不出意外"。我们在真实的汽车工作站问题上筛选机器人工程师——节拍优化、无碰撞路径、安全的多机联调——并发放认证，让你按风险匹配资历。',
    },
  },
  'robotics/3c-electronics': {
    track: 'robotics',
    industry: '3c-electronics',
    industrySkills: ['Vision-guided pick & place', 'Precision assembly', 'SCARA / small 6-axis', 'Force control', 'Fast changeover'],
    en: {
      title: 'Hire Certified Robotics Engineers for 3C Electronics',
      sub: 'Precise, vision-guided assembly for high-mix electronics lines — SCARA and small 6-axis specialists built for fast model changeover.',
      pain1:
        '3C electronics — computers, communications and consumer devices — runs on precision and speed at tiny scale. Robots here place connectors, drive micro-screws and handle delicate parts where microns and grams matter, often with vision guidance closing the loop. The hard part is repeatability at that precision, not raw payload.',
      pain2:
        'The other reality is model churn: 3C lines change product constantly, so cells have to be built for fast, low-error changeover rather than a single fixed job. We match you with robotics engineers who have programmed precise, vision-guided assembly and force-controlled tasks — and who design cells that survive the next model change.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 3C 电子',
      sub: '面向高混线电子产线的精密视觉引导装配——SCARA 与小型六轴专家，为快速换型而生。',
      pain1:
        '3C 电子——计算机、通讯、消费电子——靠的是小尺度下的精度与速度。这里的机器人插连接器、拧微型螺丝、抓取脆弱零件，微米和克都要计较，往往还要靠视觉闭环。真正的难点是在那种精度下的可重复性，而不是负载大小。',
      pain2:
        '另一个现实是机型频繁更替：3C 产线不停换产品，所以工作站要为"快速、低错的换型"而建，而不是为一个固定工件。我们为你匹配编过精密视觉引导装配与力控任务的机器人工程师——他们设计的工作站，扛得住下一次机型切换。',
    },
  },
  'vision/semiconductor': {
    track: 'vision',
    industry: 'semiconductor',
    industrySkills: ['Wafer / die inspection', 'Sub-micron accuracy', 'Telecentric optics', 'Fiducial alignment', 'Gauge R&R'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Semiconductor',
      sub: 'Sub-micron wafer alignment and defect inspection — telecentric optics, calibration and gauge R&R, verified where accuracy is measured in pixels.',
      pain1:
        'Vision in a fab operates at the edge of what optics and lighting can resolve. Wafer alignment, die inspection and defect detection demand sub-micron repeatability, telecentric optics and lighting that holds stable across shifts — the difference between a real catch and a false reject is measured in pixels.',
      pain2:
        'At that accuracy, calibration and measurement discipline decide everything: fiducial alignment, gauge R&R and a system a process engineer will trust to gate real product. We screen vision engineers on the practical judgment behind high-magnification inspection, not just tool familiarity, and certify them at three depths.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 半导体',
      sub: '亚微米晶圆对位与缺陷检测——远心光学、标定与量具重复性(Gauge R&R)，在"精度以像素计"的地方验证。',
      pain1:
        '晶圆厂里的视觉，工作在光学与打光能分辨的极限边缘。晶圆对位、芯粒(die)检测与缺陷检出，要求亚微米级可重复性、远心光学、以及跨班次都稳的打光——一次"真检出"和一次"误剔除"之间的差距，是以像素来衡量的。',
      pain2:
        '在那种精度下，标定与测量纪律决定一切：基准点(fiducial)对位、量具重复性再现性(Gauge R&R)、以及一套工艺工程师敢用来放行真实产品的系统。我们在高倍检测背后的实操判断上筛选视觉工程师——不只是会用某个工具——并按三个深度发放认证。',
    },
  },
  'vision/packaging': {
    track: 'vision',
    industry: 'packaging',
    industrySkills: ['OCR / OCV verification', 'Barcode / DMC read rate', 'High-speed reject timing', 'Reflective-surface lighting', 'Print inspection'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Packaging',
      sub: 'Label, date/lot and seal verification at line speed — OCR/OCV and read-rate reliability on reflective, curved and moving surfaces.',
      pain1:
        'Packaging vision is a speed-and-variation problem. Lines run fast, products change constantly, and the system has to verify labels, print, date/lot codes and seals on reflective, curved or moving surfaces without slowing the line or throwing false rejects. Read rate and OCV reliability are the whole game.',
      pain2:
        'Getting there is mostly lighting, optics and reject timing — not the algorithm. Reading a date code on a shiny curved bottle at line speed, and firing the reject on the right part, is exactly the practical judgment that separates a demo from a production system. We screen and certify vision engineers on that real-world reliability.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 包装',
      sub: '产线速度下的标签、日期/批号与封口核验——在反光、曲面、运动表面上的 OCR/OCV 与读取率可靠性。',
      pain1:
        '包装视觉是一个"速度 + 变化"的问题。产线跑得快，产品不停换，系统要在反光、曲面、运动的表面上核验标签、印刷、日期/批号码与封口，既不能拖慢产线，也不能乱剔除。读取率和 OCV 可靠性就是全部的胜负手。',
      pain2:
        '做到这一点，靠的多是打光、光学与剔除时序——而不是算法。在产线速度下读出一个亮曲面瓶子上的生产日期，并在正确的那件产品上触发剔除，正是把 demo 和量产系统区分开的实操判断。我们就在这种现实世界的可靠性上筛选并认证视觉工程师。',
    },
  },
  // ── 2026-07 扩容的 4 个组合（robotics/packaging、vision/pharma、vision/automotive、
  //    robotics/food-beverage）：只补真正有行业差异化内容的组合，其余候选是可互换的填充物、不上。──
  'robotics/packaging': {
    track: 'robotics',
    industry: 'packaging',
    industrySkills: ['Palletizing & pattern generation', 'Case packing', 'EOAT selection & design', 'Rate matching & buffering', 'Conveyor & line tracking'],
    en: {
      title: 'Hire Certified Robotics Engineers for Packaging',
      sub: 'Palletizing, case packing and end-of-line cells that hold line rate — EOAT selection, pattern generation and rate matching from verified engineers.',
      pain1:
        'End-of-line robotics looks simple on a slide and gets hard on the floor. A palletizing cell has to build stable loads from whatever the line sends it — mixed cases, changing pack patterns, layer sheets and slip sheets — and the pattern-generation logic that decides where each case lands is as much the deliverable as the robot itself. The wrong EOAT choice — vacuum where a clamp was needed — shows up as dropped cases and crushed corners at full speed.',
      pain2:
        'The second trap is rate. A packaging robot never sees a steady stream: upstream fillers and cartoners surge and starve, and the cell has to absorb that with buffering, infeed tracking and conveyor handshakes or it becomes the bottleneck of the entire line. We screen robotics engineers on real end-of-line problems — pattern generation, EOAT selection and rate matching — and certify them at three depths so you can match seniority to the job.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 包装',
      sub: '守得住产线速度的码垛、装箱与线尾工作站——EOAT 选型、垛型生成与节拍匹配，来自经验证的工程师。',
      pain1:
        '线尾机器人在 PPT 上看着简单，到现场就难了。码垛工作站必须把产线送来的任何东西码成稳定的垛——混装箱、变化的垛型、隔层纸与滑托板——而决定每个箱子落在哪的垛型生成逻辑，和机器人本体一样都是交付物。EOAT 选错了——该用夹爪的地方用了真空吸盘——到了全速运行时就会变成掉箱和压塌的箱角。',
      pain2:
        '第二个坑是节拍。包装机器人从来见不到匀速的来料：上游灌装机与装盒机时涌时断，工作站必须靠缓存、来料跟踪与输送线握手把波动吸收掉，否则它自己就成了整条线的瓶颈。我们在真实的线尾问题上筛选机器人工程师——垛型生成、EOAT 选型、节拍匹配——并按三个深度发放认证，让你按任务匹配资历。',
    },
  },
  'vision/pharma': {
    track: 'vision',
    industry: 'pharma',
    industrySkills: ['Serialization (DSCSA / EU FMD)', 'Aggregation verification', 'OCV on cartons & labels', 'Code grading & print quality', 'GMP validation discipline'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Pharmaceutical Manufacturing',
      sub: 'Serialization and aggregation verification under DSCSA and EU FMD — OCV on cartons and labels, engineered and documented to GMP discipline.',
      pain1:
        'Pharma vision now carries a regulatory mandate, not just a quality one. Serialization under the US DSCSA and the EU Falsified Medicines Directive means every saleable unit gets a unique code that must be printed, verified and aggregated correctly up through bundle, case and pallet — and a camera that misreads, or a station that breaks the aggregation hierarchy, does not just create rework. It stops product from legally shipping.',
      pain2:
        'The other half is OCV under GMP: verifying that lot, expiry and label text on cartons, foils and curved bottles match the batch record — with the vision system itself validated like any GMP system, specified, challenged and documented so an inspector can follow it. We match you with vision engineers who have delivered serialization and OCV lines under that discipline, not just configured a reader on a bench.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 制药',
      sub: 'DSCSA 与欧盟 FMD 下的序列化与聚合校验——GMP 纪律下的纸盒与标签 OCV，工程与文档并重。',
      pain1:
        '制药视觉如今背负的是监管使命，而不只是质量使命。美国 DSCSA 与欧盟《反伪造药品指令》(FMD)下的序列化，意味着每个最小销售单元都带唯一码，必须正确打印、校验，并沿着中包、箱、托盘逐级正确聚合——相机误读一次、某个工位打断了聚合关系，带来的不只是返工，而是产品在法律上无法出货。',
      pain2:
        '另一半是 GMP 下的 OCV：核验纸盒、铝箔、曲面瓶身上的批号、效期与标签文字和批记录一致——而视觉系统本身也要像任何 GMP 系统一样被验证：有规格、有挑战测试、有检查员能顺下来的文档。我们为你匹配的是在这套纪律下交付过序列化与 OCV 产线的视觉工程师，而不是只在台面上配过读码器的人。',
    },
  },
  'vision/automotive': {
    track: 'vision',
    industry: 'automotive',
    industrySkills: ['Weld-seam inspection', 'Gap & flush measurement', '3D robot guidance', 'Bin picking', 'Camera-to-robot calibration'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Automotive Manufacturing',
      sub: 'Weld-seam inspection, gap-and-flush measurement and 3D robot guidance — vision that survives dark, shiny, oily sheet metal at takt.',
      pain1:
        'Automotive vision fights the worst surfaces in the business: dark e-coat, mirror-shiny stampings and oily panels that defeat naive lighting. On top of that it is asked to do real metrology — weld-seam integrity, sealer beads, gap and flush on closures — where the answer is a measurement in fractions of a millimetre delivered at takt, not a pass/fail on a clean lab part.',
      pain2:
        'The other frontier is guidance: 3D locating of panels in racks, bin picking of castings, and camera-to-robot calibration where an error does not produce a false reject — it drives tooling into a fixture. We screen vision engineers on the judgment this floor demands — lighting hostile surfaces, holding calibration across shifts, proving accuracy with gauge studies — and certify them at three depths.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 汽车制造',
      sub: '焊缝检测、间隙面差测量与 3D 机器人引导——在深色、反光、带油的钣金上、踩着节拍也扛得住的视觉。',
      pain1:
        '汽车视觉对付的是这个行业里最难缠的表面：深色电泳漆、镜面般的冲压件、带油的板件，天真的打光方案在这里全军覆没。在此之上它还被要求做真正的测量——焊缝完整性、涂胶胶条、闭合件的间隙与面差(gap & flush)——答案是踩着节拍交付的零点几毫米的测量值，而不是在实验室干净样件上的合格/不合格。',
      pain2:
        '另一个前沿是引导：料架里板件的 3D 定位、铸件的无序抓取(bin picking)、以及相机与机器人坐标系的标定——这里出错不是产生一次误剔除，而是让工装直接撞上夹具。我们按这个车间要求的判断力筛选视觉工程师——给难缠表面打光、跨班次守住标定、用量具分析证明精度——并按三个深度发放认证。',
    },
  },
  'robotics/food-beverage': {
    track: 'robotics',
    industry: 'food-beverage',
    industrySkills: ['Washdown / hygienic design', 'IP69K equipment', 'Soft-product handling EOAT', 'Vision-guided picking', 'Allergen & SKU changeover'],
    en: {
      title: 'Hire Certified Robotics Engineers for Food & Beverage',
      sub: 'Washdown-ready robot cells for primary and secondary packaging — hygienic design, IP69K equipment, soft-product handling and fast changeovers.',
      pain1:
        'Food robotics starts with a constraint most integrators never face: the cell gets hosed down. Daily washdown with caustic chemistry at pressure and temperature means IP69K-rated robots or protective covers, stainless and food-grade materials, hygienic design without harborage points, and food-safe lubricants. Get any of that wrong and the cell either corrodes or becomes a contamination risk the auditor will find.',
      pain2:
        'Then comes the product itself: baked goods, fresh produce and proteins are soft, variable and unforgiving, so EOAT and motion have to grip without bruising and place without smearing — usually with vision finding product that never sits in the same place twice. Add frequent SKU and allergen changeovers, and the engineers who win are the ones who design for cleaning and changeover from day one. That is exactly what we screen and certify for.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 食品饮料',
      sub: '面向一次与二次包装、经得起冲洗的机器人工作站——卫生设计、IP69K 设备、软性产品抓取与快速换型。',
      pain1:
        '食品机器人从一个大多数集成商从未面对的约束开始：整个工作站是要被水枪冲洗的。每天用带腐蚀性的清洗剂、在高压高温下冲洗(washdown)，意味着要用 IP69K 等级的机器人或防护罩、不锈钢与食品级材料、无藏污死角的卫生设计、食品级润滑剂。任何一处做错，工作站要么被腐蚀，要么变成审计员一定会揪出来的污染风险。',
      pain2:
        '然后是产品本身：烘焙品、生鲜与蛋白类产品柔软、多变、不容有失，EOAT 与运动控制必须做到抓而不伤、放而不蹭——通常还要靠视觉去找那些从不待在同一个位置的产品。再叠加频繁的 SKU 与过敏原换型，胜出的工程师是那些从第一天就为清洗和换型做设计的人。这正是我们筛选与认证的内容。',
    },
  },
};

const MATRIX_KEYS = Object.keys(MATRIX);

// ── 对外辅助 ─────────────────────────────────────────────────────────────

// 方向元数据访问器：label/kicker/skills/levels（数据本来就在 TRACKS 里，这里只是开放只读访问）。
// 消费方：/hire 索引页与 lib/occupations.js（职业页要按方向拼 hero/技能/认证级别，不重抄一份文案）。
// 未知方向返回 null，让调用方显式处理（而不是静默 undefined 解构炸掉）。
export function getTrackMeta(track) {
  const t = TRACKS[track];
  if (!t) return null;
  return { label: t.label, kicker: t.kicker, skills: t.skills, levels: t.levels };
}

// getStaticPaths 用：枚举所有 12 个组合的 {track, industry}。
export function getMatrixPaths() {
  return MATRIX_KEYS.map((key) => {
    const [track, industry] = key.split('/');
    return { params: { track, industry } };
  });
}

// 组合是否存在（getStaticProps 校验用）。
export function hasMatrixEntry(track, industry) {
  return Boolean(MATRIX[`${track}/${industry}`]);
}

// /hire/[track] 母页「按行业细分」入口链用：该方向下的行业子页清单（slug + 短标签）。
export function getIndustriesForTrack(track) {
  return MATRIX_KEYS.filter((k) => k.startsWith(`${track}/`)).map((k) => {
    const industry = k.split('/')[1];
    const meta = INDUSTRIES[industry];
    return { industry, label: meta.short || { en: meta.en, zh: meta.zh } };
  });
}

// 拼装页面所需的全部数据：方向元 + 行业元 + 组合内容 + 内链。
export function getMatrixPage(track, industry) {
  const entry = MATRIX[`${track}/${industry}`];
  if (!entry) return null;

  const trackMeta = TRACKS[track];
  const industryMeta = INDUSTRIES[industry];

  // serviceType 带行业，供 Service JSON-LD 用。
  const serviceType = `${trackMeta.serviceBase} — ${industryMeta.en}`;

  // 内链：同方向其他行业。
  const sameTrack = MATRIX_KEYS
    .filter((k) => k.startsWith(`${track}/`) && k !== `${track}/${industry}`)
    .map((k) => {
      const [t, ind] = k.split('/');
      return { track: t, industry: ind, name: INDUSTRIES[ind].short };
    });

  // 内链：其他方向同行业。
  const sameIndustry = MATRIX_KEYS
    .filter((k) => k.endsWith(`/${industry}`) && k !== `${track}/${industry}`)
    .map((k) => {
      const [t, ind] = k.split('/');
      return { track: t, industry: ind, name: TRACKS[t].label };
    });

  return {
    track,
    industry,
    serviceType,
    trackLabel: trackMeta.label,
    trackKicker: trackMeta.kicker,
    industryName: industryMeta,
    skills: [...trackMeta.skills, ...entry.industrySkills],
    levels: trackMeta.levels,
    content: { en: entry.en, zh: entry.zh },
    sameTrack,
    sameIndustry,
  };
}
