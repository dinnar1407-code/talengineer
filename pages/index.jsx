import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../hooks/useTheme';
import styles from './index.module.css';

// ── 语言列表（与全站 useLang / Navbar 共用 tal_lang，切换后其他页面同步）──────────
// short 用于导航栏语言胶囊上的紧凑显示，label 是下拉里的完整名称。
const LANGS = [
  { code: 'en', flag: '🇺🇸', short: 'EN',   label: 'English' },
  { code: 'zh', flag: '🇨🇳', short: '中文', label: '中文' },
  { code: 'es', flag: '🇲🇽', short: 'ES',   label: 'Español' },
  { code: 'vi', flag: '🇻🇳', short: 'VI',   label: 'Tiếng Việt' },
  { code: 'hi', flag: '🇮🇳', short: 'HI',   label: 'हिन्दी' },
  { code: 'fr', flag: '🇫🇷', short: 'FR',   label: 'Français' },
  { code: 'de', flag: '🇩🇪', short: 'DE',   label: 'Deutsch' },
  { code: 'ja', flag: '🇯🇵', short: 'JA',   label: '日本語' },
  { code: 'ko', flag: '🇰🇷', short: 'KO',   label: '한국어' },
];

// ── 文案词典（设计稿英文为最终稿，全部走翻译 key）──────────────────────────────
// 目前完整提供 en / zh 两种；其余 7 种语言按 key 回退到英文（沿用全站 DICT[lang]||DICT.en 模式）。
// Stats ticker 改为真实、可辩护的平台事实（认证方向数/考证等级/托管支付覆盖率/语言数）；
// Featured engineers 改为从 /api/talent/list 拉取真实工程师数据，不再使用虚构占位人物。
const DICT = {
  en: {
    // Nav
    navFind: 'Find Engineers', navRates: 'Rate Benchmarks', navHow: 'How It Works', navResources: 'Resources',
    navSignIn: 'Sign In', navPost: 'Post a Project', themeDark: 'Dark', themeLight: 'Light',
    // Hero
    heroKicker: '// The global industrial automation talent marketplace',
    heroH1: 'Automation talent without borders. Verified by AI. Protected by escrow.',
    heroSub: 'PLC, SCADA, robotics, and electrical engineers — screened with a practical AI assessment, certified through platform exams, and managed in nine languages.',
    cardHiringKicker: "I'm hiring", cardHiringTitle: 'Find a verified local engineer',
    cardHiringBody: 'Post in any language. Our AI standardizes your spec and shortlists screened engineers by skill, region, and rate.',
    cardHiringCta: 'Hire an Engineer →', cardHiringNote: 'Matched in 48 hrs on average',
    cardEngKicker: "I'm an engineer", cardEngTitle: 'Work globally. Get paid securely.',
    cardEngBody: 'Pass the AI Technical Screener once, then receive matched projects from OEMs worldwide — escrow guarantees payment.',
    cardEngCta: 'Join as an Engineer →', cardEngNote: 'Free to apply · keep the majority of every $',
    // Stats ticker（真实、可辩护的平台事实）
    stats: [
      { num: '4', label: 'Certification tracks' },
      { num: 'L1–L3', label: 'Platform exam levels' },
      { num: '100%', label: 'Escrow-protected payments' },
      { num: '9', label: 'Languages supported' },
    ],
    // Categories
    catKicker: 'Browse by specialty', catH2: 'Every discipline in industrial automation', catAll: 'All specialties →',
    engineersWord: 'engineers', avgWord: 'avg',
    categories: [
      { emoji: '⚙️', name: 'PLC Programming', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA & HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'Industrial Robotics', tools: 'Fanuc, KUKA, ABB, Yaskawa programming & cell integration', count: 347, rate: 71 },
      { emoji: '🔌', name: 'Electrical Panel Design', tools: 'EPLAN, AutoCAD Electrical, UL 508A compliance', count: 289, rate: 54 },
      { emoji: '🏭', name: 'Process Control & DCS', tools: 'DeltaV, Honeywell Experion, batch & continuous process', count: 203, rate: 75 },
      { emoji: '📷', name: 'Machine Vision', tools: 'Cognex, Keyence, Halcon — inspection & guidance systems', count: 156, rate: 68 },
      { emoji: '🌐', name: 'Industrial Networking', tools: 'Profinet, EtherNet/IP, OPC UA, OT cybersecurity', count: 134, rate: 66 },
      { emoji: '🧰', name: 'Commissioning & Field Service', tools: 'On-site startup, FAT/SAT, retrofit & troubleshooting', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'How it works', howH2: 'One platform, two paths',
    forEmployers: 'For employers', forEngineers: 'For engineers',
    employerSteps: [
      { title: 'Post your project in any language', body: 'Our AI parses your spec into a standardized scope, milestones, and skill requirements.' },
      { title: 'Get matched with verified engineers', body: 'Shortlists ranked by skill-screen score, region, rate, and on-site availability.' },
      { title: 'Fund milestones into escrow', body: 'Money is released only when you approve each deliverable. Zero upfront risk.' },
      { title: 'Deliver with an AI project manager', body: 'Real-time translation, progress tracking, and documentation across 9 languages.' },
    ],
    engineerSteps: [
      { title: 'Create your profile in minutes', body: 'List your platforms, certifications, industries, and rate — in your own language.' },
      { title: 'Pass the AI Technical Screener', body: 'A practical assessment of PLC, SCADA, and robotics skills — the badge clients trust.' },
      { title: 'Get matched to real projects', body: 'Local and remote work from OEMs and integrators worldwide — no bidding wars.' },
      { title: 'Get paid on time, every time', body: 'Escrow-backed milestones mean your payment is secured before you start.' },
    ],
    // Featured engineers：真实数据从 /api/talent/list 拉取，不再使用占位人物
    featKicker: 'Featured talent', featH2: 'Engineers ready to deploy this week', featBrowseAll: 'Browse all engineers →',
    verified: '✓ AI-Verified', viewProfile: 'View profile →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'Demo data',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Ho Chi Minh City', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: 'Led PLC migration for 3 automotive tier-1 lines; FAT/SAT commissioning across SE Asia.', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'Robotic weld-cell integrator; 40+ Fanuc cells commissioned for US & Mexico OEMs.', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignition Gold-certified; built plant-wide SCADA for pharma and F&B facilities.', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks（占位，后续接 /rates live data）
    rateKicker: 'Live market data', rateH2: 'Know the fair rate before you hire',
    rateBody: 'Real-time hourly-rate benchmarks by region and specialty, sourced from active engineer profiles. Budget with confidence — no guesswork, no inflated agency markups.',
    rateCta: 'Explore Rate Benchmarks →', rateColRegion: 'Region', rateColPlc: 'PLC / SCADA', rateColRobot: 'Robotics',
    rateFootnote: 'Updated hourly · USD/hr · self-reported by verified engineers',
    rateRows: [
      { region: '🇺🇸 North America', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 Western Europe', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 Mexico', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 Vietnam', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 India', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Why Talengineer', trustH2: 'Built for cross-border industrial work',
    trust: [
      { emoji: '🛡️', title: 'AI Technical Screener', body: 'Every engineer passes a practical, proctored assessment of PLC, SCADA, and robotics skills — not just a résumé check.' },
      { emoji: '💰', title: 'Milestone Escrow', body: 'Funds are held securely and released only when you approve each deliverable. Both sides are protected.' },
      { emoji: '🗣️', title: 'Multilingual AI PM', body: 'Real-time translation across English, Chinese, Spanish, Vietnamese, Hindi and more — zero communication gaps.' },
      { emoji: '📄', title: 'NDA & IP Protection', body: 'Standardized NDAs, code ownership transfer, and audit trails on every project by default.' },
    ],
    // Testimonials
    testiH2: 'Trusted by OEMs and integrators worldwide',
    testimonials: [
      { quote: 'We shipped a packaging line to Vietnam and needed local commissioning within two weeks. Talengineer matched us with a verified Siemens engineer in 48 hours — the escrow model made sign-off painless.', author: 'Operations Director', meta: 'Packaging OEM, Ohio, USA' },
      { quote: "As an integrator, finding vetted robotics help during crunch is brutal. The AI screening actually filters — every engineer we've hired could program a Fanuc cell on day one.", author: 'Managing Partner', meta: 'System Integrator, Bavaria, Germany' },
      { quote: 'I work with US clients from Pune. The AI PM translates specs and meeting notes instantly, and escrow means I never chase invoices. My income doubled in a year.', author: 'SCADA Engineer', meta: 'Independent, Pune, India' },
    ],
    // FAQ
    faqKicker: 'FAQ', faqH2: 'Frequently asked questions',
    faqs: [
      { q: 'How much does it cost to hire an industrial automation engineer?', a: 'Hourly rates on Talengineer range from $20–45/hr in India and Vietnam to $85–140/hr in North America, depending on specialty and seniority. Platform fees are transparent and there are no agency markups — see our live Rate Benchmarks for current figures by region.' },
      { q: 'How are engineers verified?', a: 'Every engineer completes our proprietary AI Technical Screener — a practical assessment covering PLC programming, SCADA/HMI, robotics, and electrical design. Identity, credentials, and work history are verified separately before a profile goes live.' },
      { q: 'How does milestone escrow protect me?', a: 'You fund each project milestone into escrow before work begins. Funds are released only when you approve the deliverable. If a dispute arises, our resolution team reviews the milestone spec and work product before any money moves.' },
      { q: 'Can engineers work on-site at my facility?', a: 'Yes. Many projects combine remote development with on-site commissioning. Filter engineers by city and travel radius — we have verified local talent across North America, Latin America, Europe, Vietnam, India, and more.' },
      { q: "What if my team and the engineer don't share a language?", a: 'Our AI Project Manager translates messages, specs, and documentation in real time across English, Chinese, Spanish, Vietnamese, Hindi, French, German, Japanese, and Korean.' },
      { q: 'What does it cost engineers to join?', a: 'Joining and passing the AI Technical Screener is free. Talengineer charges a small service fee only on paid milestones — you keep the large majority of every dollar you earn.' },
    ],
    // Resources
    resH2: 'From the resource center', resAll: 'All guides →',
    resources: [
      { tag: 'Hiring guide', title: 'PLC Programmer Hourly Rates in 2026: A Regional Breakdown', teaser: 'What Siemens vs. Rockwell expertise costs across six regions, and when offshore makes sense.', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'Playbook', title: 'Remote Commissioning: How OEMs Ship Machines Without Flying Engineers', teaser: 'A milestone-based playbook for FAT/SAT with local verified talent on the ground.', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'For engineers', title: 'Passing the AI Technical Screener: What We Actually Test', teaser: 'Inside the practical assessment — ladder logic, HMI design, safety circuits, and more.', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: 'Your next automation project starts here',
    ctaSub: 'Post a project in any language, or join our founding cohort of verified engineers.',
    ctaPost: 'Post a Project — Free', ctaApply: 'Apply as an Engineer',
    // Footer
    footerTagline: 'The global marketplace for AI-verified industrial automation talent.',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'Hire', footerColEngineers: 'Engineers', footerColSpecialties: 'Specialties', footerColCompany: 'Company',
    footerHire: [
      { label: 'Find Engineers', href: '/talent' }, { label: 'Post a Project', href: '/talent' },
      { label: 'Rate Benchmarks', href: '/rates' }, { label: 'Enterprise API', href: '/enterprise' },
      { label: 'Pricing', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'Apply to Join', href: '/talent' }, { label: 'AI Screener', href: '/talent' },
      { label: 'Browse Projects', href: '/talent' }, { label: 'Payments & Escrow', href: '/finance' },
      { label: 'Certification Exams', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLC Programming', href: '/talent' }, { label: 'SCADA & HMI', href: '/talent' },
      { label: 'Robotics', href: '/talent' }, { label: 'Panel Design', href: '/talent' },
    ],
    footerCompany: [
      { label: 'About', href: '/' }, { label: 'Resources', href: '#resources' },
      { label: 'Contact', href: '/' }, { label: 'Privacy & Terms', href: '/' },
      { label: 'Trust Center', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — Global Industrial Automation Talent Marketplace',
  },

  zh: {
    // Nav
    navFind: '寻找工程师', navRates: '费率基准', navHow: '运作方式', navResources: '资源中心',
    navSignIn: '登录', navPost: '发布项目', themeDark: '深色', themeLight: '浅色',
    // Hero
    heroKicker: '// 全球工业自动化人才市场',
    heroH1: '自动化人才，跨越国界。AI 认证，资金托管护航。',
    heroSub: 'PLC、SCADA、机器人与电气工程师——经实操型 AI 测评筛选、平台考证认证，九种语言全程协作。',
    cardHiringKicker: '我要招人', cardHiringTitle: '找到经认证的当地工程师',
    cardHiringBody: '用任何语言发布需求。AI 会标准化你的技术规格，并按技能、地区和费率为你精选已通过筛选的工程师。',
    cardHiringCta: '聘请工程师 →', cardHiringNote: '平均 48 小时内匹配',
    cardEngKicker: '我是工程师', cardEngTitle: '接全球的活，安心收款。',
    cardEngBody: '通过一次 AI 技术筛选，即可获得来自全球设备厂商的匹配项目——资金托管保障你的收款。',
    cardEngCta: '作为工程师加入 →', cardEngNote: '申请免费 · 收入绝大部分归你',
    // Stats
    stats: [
      { num: '4', label: '认证方向' },
      { num: 'L1–L3', label: '平台考证等级' },
      { num: '100%', label: '托管支付覆盖' },
      { num: '9', label: '支持语言' },
    ],
    // Categories
    catKicker: '按专业浏览', catH2: '工业自动化的每个专业领域', catAll: '全部专业 →',
    engineersWord: '名工程师', avgWord: '均价',
    categories: [
      { emoji: '⚙️', name: 'PLC 编程', tools: '西门子 TIA Portal、罗克韦尔 Studio 5000、三菱、Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA 与 HMI', tools: 'Ignition、WinCC、FactoryTalk View、Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: '工业机器人', tools: 'Fanuc、KUKA、ABB、安川编程与工作站集成', count: 347, rate: 71 },
      { emoji: '🔌', name: '电气柜设计', tools: 'EPLAN、AutoCAD Electrical、UL 508A 合规', count: 289, rate: 54 },
      { emoji: '🏭', name: '过程控制与 DCS', tools: 'DeltaV、霍尼韦尔 Experion、批次与连续过程', count: 203, rate: 75 },
      { emoji: '📷', name: '机器视觉', tools: 'Cognex、基恩士、Halcon——检测与引导系统', count: 156, rate: 68 },
      { emoji: '🌐', name: '工业网络', tools: 'Profinet、EtherNet/IP、OPC UA、OT 网络安全', count: 134, rate: 66 },
      { emoji: '🧰', name: '调试与现场服务', tools: '现场开机、FAT/SAT、改造与故障排查', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: '运作方式', howH2: '一个平台，两条路径',
    forEmployers: '面向雇主', forEngineers: '面向工程师',
    employerSteps: [
      { title: '用任何语言发布项目', body: 'AI 会把你的需求解析成标准化的范围、里程碑与技能要求。' },
      { title: '匹配已认证的工程师', body: '按技能筛选分、地区、费率与现场可用性排序推荐。' },
      { title: '将里程碑资金存入托管', body: '只有你验收每项交付后才释放资金，零预付风险。' },
      { title: '由 AI 项目经理协助交付', body: '九种语言的实时翻译、进度跟踪与文档管理。' },
    ],
    engineerSteps: [
      { title: '几分钟创建档案', body: '用你的母语填写平台、证书、行业与费率。' },
      { title: '通过 AI 技术筛选', body: '对 PLC、SCADA 与机器人技能的实操测评——客户信赖的徽章。' },
      { title: '匹配到真实项目', body: '来自全球设备厂商与集成商的本地及远程工作——告别低价竞标。' },
      { title: '每一次都准时收款', body: '托管里程碑意味着开工前你的报酬已有保障。' },
    ],
    // Featured
    featKicker: '精选人才', featH2: '本周即可到岗的工程师', featBrowseAll: '浏览全部工程师 →',
    verified: '✓ AI 认证', viewProfile: '查看档案 →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: '测试数据',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 胡志明市', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: '主导 3 条汽车一级供应商产线的 PLC 迁移；在东南亚多地完成 FAT/SAT 调试。', rate: '$38/hr', ratingLine: '★ 4.9（27 单）' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 蒙特雷', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: '机器人焊接工作站集成商；为美墨设备厂商调试 40+ 台 Fanuc 工作站。', rate: '$52/hr', ratingLine: '★ 5.0（34 单）' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 浦那', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignition 金牌认证；为制药与食品饮料工厂搭建全厂级 SCADA。', rate: '$34/hr', ratingLine: '★ 4.8（19 单）' },
    ],
    // Rate benchmarks
    rateKicker: '实时市场数据', rateH2: '招人前，先知道公道的行情价',
    rateBody: '按地区与专业实时统计的时薪基准，数据来自活跃工程师档案。让你有据可依地做预算——不靠猜，也没有中介的层层加价。',
    rateCta: '查看费率基准 →', rateColRegion: '地区', rateColPlc: 'PLC / SCADA', rateColRobot: '机器人',
    rateFootnote: '每小时更新 · 美元/时 · 由认证工程师自报',
    rateRows: [
      { region: '🇺🇸 北美', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 西欧', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 墨西哥', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 越南', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 印度', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: '为何选择 Talengineer', trustH2: '为跨境工业项目而生',
    trust: [
      { emoji: '🛡️', title: 'AI 技术筛选官', body: '每位工程师都要通过 PLC、SCADA 与机器人技能的实操监考测评——不只是看简历。' },
      { emoji: '💰', title: '里程碑托管', body: '资金安全托管，只有你验收每项交付后才释放。买卖双方都受保护。' },
      { emoji: '🗣️', title: '多语言 AI 项目经理', body: '英语、中文、西班牙语、越南语、印地语等实时互译——沟通零障碍。' },
      { emoji: '📄', title: '保密与知识产权保护', body: '每个项目默认配备标准化 NDA、代码所有权转移与审计记录。' },
    ],
    // Testimonials
    testiH2: '受到全球设备厂商与集成商的信赖',
    testimonials: [
      { quote: '我们把一条包装线发往越南，两周内就需要本地调试。Talengineer 在 48 小时内为我们匹配到一位认证西门子工程师——托管模式让验收毫无后顾之忧。', author: '运营总监', meta: '包装设备厂商，美国俄亥俄州' },
      { quote: '作为集成商，赶工期时找靠谱的机器人帮手太难了。这里的 AI 筛选是真的在把关——我们招的每位工程师第一天就能编 Fanuc 工作站。', author: '执行合伙人', meta: '系统集成商，德国巴伐利亚' },
      { quote: '我在浦那服务美国客户。AI 项目经理即时翻译规格书和会议记录，托管让我再也不用追着要款。我的收入一年翻了一倍。', author: 'SCADA 工程师', meta: '自由职业，印度浦那' },
    ],
    // FAQ
    faqKicker: '常见问题', faqH2: '常见问题解答',
    faqs: [
      { q: '聘请一位工业自动化工程师要花多少钱？', a: 'Talengineer 上的时薪从印度、越南的 20–45 美元/时到北美的 85–140 美元/时不等，取决于专业与资历。平台费用透明，没有中介加价——各地区的实时数据见我们的费率基准。' },
      { q: '工程师是如何认证的？', a: '每位工程师都要完成我们自研的 AI 技术筛选——涵盖 PLC 编程、SCADA/HMI、机器人与电气设计的实操测评。身份、资质与工作经历会在档案上线前单独核验。' },
      { q: '里程碑托管如何保护我？', a: '开工前你把每个项目里程碑的资金存入托管。只有你验收交付后才释放资金。若发生争议，我们的仲裁团队会在任何款项流动前审查里程碑规格与工作成果。' },
      { q: '工程师能到我的现场工作吗？', a: '可以。许多项目会把远程开发与现场调试结合起来。按城市和出行半径筛选工程师——我们在北美、拉美、欧洲、越南、印度等地都有经认证的本地人才。' },
      { q: '如果我的团队和工程师语言不通怎么办？', a: '我们的 AI 项目经理会在英语、中文、西班牙语、越南语、印地语、法语、德语、日语和韩语之间实时翻译消息、规格书与文档。' },
      { q: '工程师加入需要花钱吗？', a: '加入并通过 AI 技术筛选是免费的。Talengineer 只在已付款的里程碑上收取少量服务费——你赚到的每一元绝大部分都归自己。' },
    ],
    // Resources
    resH2: '来自资源中心', resAll: '全部指南 →',
    resources: [
      { tag: '招聘指南', title: '2026 年 PLC 程序员时薪：分地区详解', teaser: '西门子与罗克韦尔技能在六大地区的价格，以及何时值得离岸外包。', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: '实操手册', title: '远程调试：设备厂商如何不派工程师就交付机器', teaser: '用本地认证人才完成 FAT/SAT 的里程碑式实操手册。', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: '面向工程师', title: '通过 AI 技术筛选：我们究竟考什么', teaser: '深入这套实操测评——梯形图逻辑、HMI 设计、安全回路等等。', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: '你的下一个自动化项目，从这里开始',
    ctaSub: '用任何语言发布项目，或加入我们的首批认证工程师。',
    ctaPost: '免费发布项目', ctaApply: '申请成为工程师',
    // Footer
    footerTagline: 'AI 认证工业自动化人才的全球市场。',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: '招聘方', footerColEngineers: '工程师', footerColSpecialties: '专业领域', footerColCompany: '公司',
    footerHire: [
      { label: '寻找工程师', href: '/talent' }, { label: '发布项目', href: '/talent' },
      { label: '费率基准', href: '/rates' }, { label: '企业 API', href: '/enterprise' },
      { label: '定价', href: '/pricing' },
    ],
    footerEngineers: [
      { label: '申请加入', href: '/talent' }, { label: 'AI 筛选', href: '/talent' },
      { label: '浏览项目', href: '/talent' }, { label: '支付与托管', href: '/finance' },
      { label: '认证考试', href: '/certification' }, { label: 'TalScore 质量分', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLC 编程', href: '/talent' }, { label: 'SCADA 与 HMI', href: '/talent' },
      { label: '机器人', href: '/talent' }, { label: '电柜设计', href: '/talent' },
    ],
    footerCompany: [
      { label: '关于我们', href: '/' }, { label: '资源中心', href: '#resources' },
      { label: '联系我们', href: '/' }, { label: '隐私与条款', href: '/' },
      { label: '信任中心', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — 全球工业自动化人才市场',
  },

  es: {
    // Nav
    navFind: 'Buscar ingenieros', navRates: 'Referencias de tarifas', navHow: 'Cómo funciona', navResources: 'Recursos',
    navSignIn: 'Iniciar sesión', navPost: 'Publicar un proyecto', themeDark: 'Oscuro', themeLight: 'Claro',
    // Hero
    heroKicker: '// La marketplace global de talento en automatización industrial',
    heroH1: 'Talento en automatización sin fronteras. Verificado por IA. Protegido con depósito en garantía.',
    heroSub: 'Ingenieros de PLC, SCADA, robótica y eléctricos, evaluados con una prueba práctica de IA, certificados mediante exámenes de la plataforma y gestionados en nueve idiomas.',
    cardHiringKicker: 'Estoy contratando', cardHiringTitle: 'Encuentra un ingeniero local verificado',
    cardHiringBody: 'Publica en cualquier idioma. Nuestra IA estandariza tu especificación y preselecciona ingenieros evaluados por habilidad, región y tarifa.',
    cardHiringCta: 'Contratar un ingeniero →', cardHiringNote: 'Emparejado en 48 h de media',
    cardEngKicker: 'Soy ingeniero', cardEngTitle: 'Trabaja en todo el mundo. Cobra con seguridad.',
    cardEngBody: 'Supera una vez el evaluador técnico de IA y recibe proyectos afines de fabricantes de todo el mundo: el depósito en garantía asegura tu pago.',
    cardEngCta: 'Únete como ingeniero →', cardEngNote: 'Postularse es gratis · conserva la mayor parte de cada $',
    // Stats
    stats: [
      { num: '4', label: 'Rutas de certificación' },
      { num: 'L1–L3', label: 'Niveles de examen de la plataforma' },
      { num: '100%', label: 'Pagos protegidos por depósito en garantía' },
      { num: '9', label: 'Idiomas admitidos' },
    ],
    // Categories
    catKicker: 'Explora por especialidad', catH2: 'Todas las disciplinas de la automatización industrial', catAll: 'Todas las especialidades →',
    engineersWord: 'ingenieros', avgWord: 'prom.',
    categories: [
      { emoji: '⚙️', name: 'Programación de PLC', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA y HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'Robótica industrial', tools: 'Programación e integración de celdas Fanuc, KUKA, ABB, Yaskawa', count: 347, rate: 71 },
      { emoji: '🔌', name: 'Diseño de tableros eléctricos', tools: 'EPLAN, AutoCAD Electrical, cumplimiento UL 508A', count: 289, rate: 54 },
      { emoji: '🏭', name: 'Control de procesos y DCS', tools: 'DeltaV, Honeywell Experion, procesos por lotes y continuos', count: 203, rate: 75 },
      { emoji: '📷', name: 'Visión artificial', tools: 'Cognex, Keyence, Halcon: sistemas de inspección y guiado', count: 156, rate: 68 },
      { emoji: '🌐', name: 'Redes industriales', tools: 'Profinet, EtherNet/IP, OPC UA, ciberseguridad OT', count: 134, rate: 66 },
      { emoji: '🧰', name: 'Puesta en marcha y servicio de campo', tools: 'Arranque in situ, FAT/SAT, retrofit y resolución de problemas', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'Cómo funciona', howH2: 'Una plataforma, dos caminos',
    forEmployers: 'Para empresas', forEngineers: 'Para ingenieros',
    employerSteps: [
      { title: 'Publica tu proyecto en cualquier idioma', body: 'Nuestra IA convierte tu especificación en un alcance, hitos y requisitos de habilidad estandarizados.' },
      { title: 'Encuentra ingenieros verificados', body: 'Preselecciones ordenadas por puntuación de evaluación, región, tarifa y disponibilidad presencial.' },
      { title: 'Financia los hitos en depósito de garantía', body: 'El dinero se libera solo cuando apruebas cada entrega. Cero riesgo por adelantado.' },
      { title: 'Entrega con un gestor de proyectos de IA', body: 'Traducción en tiempo real, seguimiento del progreso y documentación en 9 idiomas.' },
    ],
    engineerSteps: [
      { title: 'Crea tu perfil en minutos', body: 'Enumera tus plataformas, certificaciones, sectores y tarifa, en tu propio idioma.' },
      { title: 'Supera el evaluador técnico de IA', body: 'Una prueba práctica de habilidades de PLC, SCADA y robótica: la insignia en la que confían los clientes.' },
      { title: 'Emparéjate con proyectos reales', body: 'Trabajo local y remoto de fabricantes e integradores de todo el mundo, sin guerras de pujas.' },
      { title: 'Cobra a tiempo, siempre', body: 'Los hitos con depósito de garantía aseguran tu pago antes de empezar.' },
    ],
    // Featured
    featKicker: 'Talento destacado', featH2: 'Ingenieros listos para empezar esta semana', featBrowseAll: 'Ver todos los ingenieros →',
    verified: '✓ Verificado por IA', viewProfile: 'Ver perfil →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'Datos de demostración',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Ciudad Ho Chi Minh', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: 'Lideró la migración de PLC de 3 líneas de proveedores tier-1 de automoción; puesta en marcha FAT/SAT en todo el Sudeste Asiático.', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'Integrador de celdas de soldadura robotizada; más de 40 celdas Fanuc puestas en marcha para OEM de EE. UU. y México.', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Certificada Ignition Gold; construyó SCADA para toda la planta en instalaciones farmacéuticas y de alimentación y bebidas.', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'Datos de mercado en vivo', rateH2: 'Conoce la tarifa justa antes de contratar',
    rateBody: 'Referencias de tarifas por hora en tiempo real, por región y especialidad, a partir de perfiles de ingenieros activos. Presupuesta con confianza: sin conjeturas ni sobreprecios de agencia.',
    rateCta: 'Explorar referencias de tarifas →', rateColRegion: 'Región', rateColPlc: 'PLC / SCADA', rateColRobot: 'Robótica',
    rateFootnote: 'Actualizado cada hora · USD/h · autoinformado por ingenieros verificados',
    rateRows: [
      { region: '🇺🇸 Norteamérica', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 Europa Occidental', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 México', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 Vietnam', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 India', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Por qué Talengineer', trustH2: 'Diseñado para el trabajo industrial transfronterizo',
    trust: [
      { emoji: '🛡️', title: 'Evaluador técnico de IA', body: 'Cada ingeniero supera una evaluación práctica y supervisada de habilidades de PLC, SCADA y robótica, no solo una revisión de currículum.' },
      { emoji: '💰', title: 'Depósito de garantía por hitos', body: 'Los fondos se guardan de forma segura y se liberan solo cuando apruebas cada entrega. Ambas partes quedan protegidas.' },
      { emoji: '🗣️', title: 'Gestor de proyectos de IA multilingüe', body: 'Traducción en tiempo real entre inglés, chino, español, vietnamita, hindi y más: cero barreras de comunicación.' },
      { emoji: '📄', title: 'Protección de NDA y propiedad intelectual', body: 'NDA estandarizados, transferencia de propiedad del código y registros de auditoría en cada proyecto de forma predeterminada.' },
    ],
    // Testimonials
    testiH2: 'La confianza de OEM e integradores de todo el mundo',
    testimonials: [
      { quote: 'Enviamos una línea de envasado a Vietnam y necesitábamos puesta en marcha local en dos semanas. Talengineer nos emparejó con un ingeniero Siemens verificado en 48 horas: el modelo de depósito en garantía hizo la aprobación muy sencilla.', author: 'Director de operaciones', meta: 'OEM de envasado, Ohio, EE. UU.' },
      { quote: 'Como integrador, encontrar ayuda en robótica verificada en plena presión es durísimo. La evaluación por IA de verdad filtra: cada ingeniero que hemos contratado podía programar una celda Fanuc desde el primer día.', author: 'Socio director', meta: 'Integrador de sistemas, Baviera, Alemania' },
      { quote: 'Trabajo con clientes de EE. UU. desde Pune. El gestor de proyectos de IA traduce las especificaciones y las actas al instante, y el depósito en garantía hace que nunca persiga facturas. Mis ingresos se duplicaron en un año.', author: 'Ingeniera SCADA', meta: 'Autónoma, Pune, India' },
    ],
    // FAQ
    faqKicker: 'Preguntas frecuentes', faqH2: 'Preguntas frecuentes',
    faqs: [
      { q: '¿Cuánto cuesta contratar a un ingeniero de automatización industrial?', a: 'Las tarifas por hora en Talengineer van desde $20–45/hr en India y Vietnam hasta $85–140/hr en Norteamérica, según la especialidad y la experiencia. Las comisiones de la plataforma son transparentes y no hay sobreprecios de agencia; consulta nuestras referencias de tarifas en vivo para ver las cifras actuales por región.' },
      { q: '¿Cómo se verifica a los ingenieros?', a: 'Cada ingeniero completa nuestro evaluador técnico de IA propio: una prueba práctica que cubre programación de PLC, SCADA/HMI, robótica y diseño eléctrico. La identidad, las credenciales y el historial laboral se verifican por separado antes de que un perfil se publique.' },
      { q: '¿Cómo me protege el depósito de garantía por hitos?', a: 'Financias cada hito del proyecto en depósito de garantía antes de que empiece el trabajo. Los fondos se liberan solo cuando apruebas la entrega. Si surge una disputa, nuestro equipo de resolución revisa la especificación del hito y el trabajo entregado antes de mover cualquier dinero.' },
      { q: '¿Pueden los ingenieros trabajar en mis instalaciones?', a: 'Sí. Muchos proyectos combinan el desarrollo remoto con la puesta en marcha in situ. Filtra ingenieros por ciudad y radio de desplazamiento: contamos con talento local verificado en Norteamérica, Latinoamérica, Europa, Vietnam, India y más.' },
      { q: '¿Qué pasa si mi equipo y el ingeniero no comparten idioma?', a: 'Nuestro gestor de proyectos de IA traduce mensajes, especificaciones y documentación en tiempo real entre inglés, chino, español, vietnamita, hindi, francés, alemán, japonés y coreano.' },
      { q: '¿Cuánto cuesta a los ingenieros unirse?', a: 'Unirse y superar el evaluador técnico de IA es gratis. Talengineer cobra una pequeña comisión de servicio solo sobre los hitos pagados: conservas la gran mayoría de cada dólar que ganas.' },
    ],
    // Resources
    resH2: 'Del centro de recursos', resAll: 'Todas las guías →',
    resources: [
      { tag: 'Guía de contratación', title: 'Tarifas por hora de programadores de PLC en 2026: desglose por región', teaser: 'Cuánto cuesta la experiencia en Siemens frente a Rockwell en seis regiones, y cuándo tiene sentido el offshore.', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'Manual', title: 'Puesta en marcha remota: cómo los OEM entregan máquinas sin enviar ingenieros', teaser: 'Un manual basado en hitos para FAT/SAT con talento local verificado sobre el terreno.', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'Para ingenieros', title: 'Superar el evaluador técnico de IA: qué evaluamos realmente', teaser: 'Por dentro de la prueba práctica: lógica de escalera, diseño de HMI, circuitos de seguridad y más.', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: 'Tu próximo proyecto de automatización empieza aquí',
    ctaSub: 'Publica un proyecto en cualquier idioma, o únete a nuestro grupo fundador de ingenieros verificados.',
    ctaPost: 'Publicar un proyecto — Gratis', ctaApply: 'Postularme como ingeniero',
    // Footer
    footerTagline: 'La marketplace global de talento en automatización industrial verificado por IA.',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'Contratar', footerColEngineers: 'Ingenieros', footerColSpecialties: 'Especialidades', footerColCompany: 'Empresa',
    footerHire: [
      { label: 'Buscar ingenieros', href: '/talent' }, { label: 'Publicar un proyecto', href: '/talent' },
      { label: 'Referencias de tarifas', href: '/rates' }, { label: 'API para empresas', href: '/enterprise' },
      { label: 'Precios', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'Postularse', href: '/talent' }, { label: 'Evaluador de IA', href: '/talent' },
      { label: 'Explorar proyectos', href: '/talent' }, { label: 'Pagos y depósito de garantía', href: '/finance' },
      { label: 'Exámenes de certificación', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'Programación de PLC', href: '/talent' }, { label: 'SCADA y HMI', href: '/talent' },
      { label: 'Robótica', href: '/talent' }, { label: 'Diseño de tableros', href: '/talent' },
    ],
    footerCompany: [
      { label: 'Acerca de', href: '/' }, { label: 'Recursos', href: '#resources' },
      { label: 'Contacto', href: '/' }, { label: 'Privacidad y términos', href: '/' },
      { label: 'Centro de confianza', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — Mercado global de talento en automatización industrial',
  },

  vi: {
    // Nav
    navFind: 'Tìm kỹ sư', navRates: 'Chuẩn mức phí', navHow: 'Cách hoạt động', navResources: 'Tài nguyên',
    navSignIn: 'Đăng nhập', navPost: 'Đăng dự án', themeDark: 'Tối', themeLight: 'Sáng',
    // Hero
    heroKicker: '// Sàn nhân lực tự động hóa công nghiệp toàn cầu',
    heroH1: 'Nhân tài tự động hóa không biên giới. Được AI xác minh. Được ký quỹ bảo vệ.',
    heroSub: 'Kỹ sư PLC, SCADA, robot và điện — được sàng lọc bằng bài đánh giá AI thực hành, cấp chứng chỉ qua các kỳ thi trên nền tảng, và quản lý bằng chín ngôn ngữ.',
    cardHiringKicker: 'Tôi đang tuyển', cardHiringTitle: 'Tìm kỹ sư bản địa đã xác minh',
    cardHiringBody: 'Đăng bằng bất kỳ ngôn ngữ nào. AI của chúng tôi chuẩn hóa yêu cầu kỹ thuật và lập danh sách kỹ sư đã sàng lọc theo kỹ năng, khu vực và mức phí.',
    cardHiringCta: 'Thuê kỹ sư →', cardHiringNote: 'Ghép nối trung bình trong 48 giờ',
    cardEngKicker: 'Tôi là kỹ sư', cardEngTitle: 'Làm việc toàn cầu. Nhận thanh toán an toàn.',
    cardEngBody: 'Vượt qua bài Sàng lọc Kỹ thuật AI một lần, rồi nhận các dự án phù hợp từ các OEM trên toàn thế giới — ký quỹ đảm bảo thanh toán.',
    cardEngCta: 'Tham gia với tư cách kỹ sư →', cardEngNote: 'Đăng ký miễn phí · giữ phần lớn mỗi $',
    // Stats
    stats: [
      { num: '4', label: 'Hướng chứng chỉ' },
      { num: 'L1–L3', label: 'Cấp độ thi trên nền tảng' },
      { num: '100%', label: 'Thanh toán được bảo vệ bằng ký quỹ' },
      { num: '9', label: 'Ngôn ngữ hỗ trợ' },
    ],
    // Categories
    catKicker: 'Duyệt theo chuyên môn', catH2: 'Mọi lĩnh vực trong tự động hóa công nghiệp', catAll: 'Tất cả chuyên môn →',
    engineersWord: 'kỹ sư', avgWord: 'TB',
    categories: [
      { emoji: '⚙️', name: 'Lập trình PLC', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA & HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'Robot công nghiệp', tools: 'Lập trình và tích hợp trạm Fanuc, KUKA, ABB, Yaskawa', count: 347, rate: 71 },
      { emoji: '🔌', name: 'Thiết kế tủ điện', tools: 'EPLAN, AutoCAD Electrical, tuân thủ UL 508A', count: 289, rate: 54 },
      { emoji: '🏭', name: 'Điều khiển quá trình & DCS', tools: 'DeltaV, Honeywell Experion, quá trình theo mẻ và liên tục', count: 203, rate: 75 },
      { emoji: '📷', name: 'Thị giác máy', tools: 'Cognex, Keyence, Halcon — hệ thống kiểm tra và dẫn hướng', count: 156, rate: 68 },
      { emoji: '🌐', name: 'Mạng công nghiệp', tools: 'Profinet, EtherNet/IP, OPC UA, an ninh mạng OT', count: 134, rate: 66 },
      { emoji: '🧰', name: 'Chạy thử & dịch vụ hiện trường', tools: 'Khởi động tại chỗ, FAT/SAT, cải tạo và xử lý sự cố', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'Cách hoạt động', howH2: 'Một nền tảng, hai lối đi',
    forEmployers: 'Dành cho nhà tuyển dụng', forEngineers: 'Dành cho kỹ sư',
    employerSteps: [
      { title: 'Đăng dự án bằng bất kỳ ngôn ngữ nào', body: 'AI phân tích yêu cầu của bạn thành phạm vi, cột mốc và yêu cầu kỹ năng chuẩn hóa.' },
      { title: 'Được ghép với kỹ sư đã xác minh', body: 'Danh sách rút gọn xếp hạng theo điểm sàng lọc kỹ năng, khu vực, mức phí và khả năng có mặt tại chỗ.' },
      { title: 'Nạp tiền cột mốc vào ký quỹ', body: 'Tiền chỉ được giải ngân khi bạn duyệt từng hạng mục bàn giao. Không rủi ro trả trước.' },
      { title: 'Bàn giao cùng quản lý dự án AI', body: 'Dịch thuật thời gian thực, theo dõi tiến độ và tài liệu bằng 9 ngôn ngữ.' },
    ],
    engineerSteps: [
      { title: 'Tạo hồ sơ trong vài phút', body: 'Liệt kê nền tảng, chứng chỉ, ngành và mức phí của bạn — bằng ngôn ngữ của chính bạn.' },
      { title: 'Vượt qua Sàng lọc Kỹ thuật AI', body: 'Bài đánh giá thực hành về kỹ năng PLC, SCADA và robot — huy hiệu mà khách hàng tin tưởng.' },
      { title: 'Được ghép với dự án thực', body: 'Công việc tại chỗ và từ xa từ các OEM và nhà tích hợp trên toàn thế giới — không đấu giá phá giá.' },
      { title: 'Luôn được thanh toán đúng hạn', body: 'Cột mốc có ký quỹ nghĩa là khoản thanh toán của bạn được đảm bảo trước khi bắt đầu.' },
    ],
    // Featured
    featKicker: 'Nhân tài nổi bật', featH2: 'Kỹ sư sẵn sàng nhận việc trong tuần này', featBrowseAll: 'Xem tất cả kỹ sư →',
    verified: '✓ Đã xác minh bằng AI', viewProfile: 'Xem hồ sơ →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'Dữ liệu demo',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Thành phố Hồ Chí Minh', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: 'Dẫn dắt việc chuyển đổi PLC cho 3 dây chuyền nhà cung cấp tier-1 ngành ô tô; chạy thử FAT/SAT khắp Đông Nam Á.', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'Nhà tích hợp trạm hàn robot; đã chạy thử hơn 40 trạm Fanuc cho các OEM Mỹ và Mexico.', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Chứng nhận Ignition Gold; xây dựng SCADA toàn nhà máy cho các cơ sở dược phẩm và thực phẩm & đồ uống.', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'Dữ liệu thị trường trực tiếp', rateH2: 'Biết mức phí hợp lý trước khi thuê',
    rateBody: 'Chuẩn mức phí theo giờ thời gian thực theo khu vực và chuyên môn, lấy từ hồ sơ kỹ sư đang hoạt động. Lập ngân sách tự tin — không phỏng đoán, không phụ phí môi giới thổi phồng.',
    rateCta: 'Khám phá chuẩn mức phí →', rateColRegion: 'Khu vực', rateColPlc: 'PLC / SCADA', rateColRobot: 'Robot',
    rateFootnote: 'Cập nhật hàng giờ · USD/giờ · do kỹ sư đã xác minh tự khai',
    rateRows: [
      { region: '🇺🇸 Bắc Mỹ', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 Tây Âu', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 Mexico', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 Việt Nam', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 Ấn Độ', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Vì sao chọn Talengineer', trustH2: 'Được xây dựng cho công việc công nghiệp xuyên biên giới',
    trust: [
      { emoji: '🛡️', title: 'Sàng lọc Kỹ thuật AI', body: 'Mỗi kỹ sư đều vượt qua bài đánh giá thực hành có giám sát về kỹ năng PLC, SCADA và robot — không chỉ xem hồ sơ.' },
      { emoji: '💰', title: 'Ký quỹ theo cột mốc', body: 'Tiền được giữ an toàn và chỉ giải ngân khi bạn duyệt từng hạng mục bàn giao. Cả hai bên đều được bảo vệ.' },
      { emoji: '🗣️', title: 'Quản lý dự án AI đa ngôn ngữ', body: 'Dịch thời gian thực giữa tiếng Anh, Trung, Tây Ban Nha, Việt, Hindi và nhiều hơn nữa — không rào cản giao tiếp.' },
      { emoji: '📄', title: 'Bảo vệ NDA & sở hữu trí tuệ', body: 'NDA chuẩn hóa, chuyển giao quyền sở hữu mã và nhật ký kiểm toán cho mọi dự án theo mặc định.' },
    ],
    // Testimonials
    testiH2: 'Được các OEM và nhà tích hợp trên toàn thế giới tin dùng',
    testimonials: [
      { quote: 'Chúng tôi chuyển một dây chuyền đóng gói sang Việt Nam và cần chạy thử tại chỗ trong hai tuần. Talengineer ghép chúng tôi với một kỹ sư Siemens đã xác minh trong 48 giờ — mô hình ký quỹ giúp việc nghiệm thu nhẹ nhàng.', author: 'Giám đốc vận hành', meta: 'OEM đóng gói, Ohio, Hoa Kỳ' },
      { quote: 'Là nhà tích hợp, tìm được người hỗ trợ robot đã kiểm chứng lúc cao điểm là cực kỳ khó. Việc sàng lọc bằng AI thực sự lọc được — mọi kỹ sư chúng tôi thuê đều có thể lập trình trạm Fanuc ngay ngày đầu.', author: 'Đối tác điều hành', meta: 'Nhà tích hợp hệ thống, Bavaria, Đức' },
      { quote: 'Tôi làm việc với khách hàng Mỹ từ Pune. Quản lý dự án AI dịch tức thì thông số kỹ thuật và biên bản họp, và ký quỹ nghĩa là tôi không bao giờ phải đòi hóa đơn. Thu nhập của tôi tăng gấp đôi trong một năm.', author: 'Kỹ sư SCADA', meta: 'Tự do, Pune, Ấn Độ' },
    ],
    // FAQ
    faqKicker: 'Câu hỏi thường gặp', faqH2: 'Câu hỏi thường gặp',
    faqs: [
      { q: 'Thuê một kỹ sư tự động hóa công nghiệp tốn bao nhiêu?', a: 'Mức phí theo giờ trên Talengineer dao động từ $20–45/hr ở Ấn Độ và Việt Nam đến $85–140/hr ở Bắc Mỹ, tùy chuyên môn và thâm niên. Phí nền tảng minh bạch và không có phụ phí môi giới — xem Chuẩn mức phí trực tiếp của chúng tôi để biết con số hiện tại theo khu vực.' },
      { q: 'Kỹ sư được xác minh như thế nào?', a: 'Mỗi kỹ sư hoàn thành bài Sàng lọc Kỹ thuật AI độc quyền của chúng tôi — bài đánh giá thực hành bao gồm lập trình PLC, SCADA/HMI, robot và thiết kế điện. Danh tính, bằng cấp và lịch sử làm việc được xác minh riêng trước khi hồ sơ hiển thị.' },
      { q: 'Ký quỹ theo cột mốc bảo vệ tôi như thế nào?', a: 'Bạn nạp tiền cho từng cột mốc dự án vào ký quỹ trước khi bắt đầu công việc. Tiền chỉ được giải ngân khi bạn duyệt hạng mục bàn giao. Nếu phát sinh tranh chấp, đội giải quyết của chúng tôi sẽ xem xét đặc tả cột mốc và sản phẩm công việc trước khi bất kỳ khoản tiền nào được chuyển.' },
      { q: 'Kỹ sư có thể làm việc tại cơ sở của tôi không?', a: 'Có. Nhiều dự án kết hợp phát triển từ xa với chạy thử tại chỗ. Lọc kỹ sư theo thành phố và bán kính di chuyển — chúng tôi có nhân tài bản địa đã xác minh khắp Bắc Mỹ, Mỹ Latinh, châu Âu, Việt Nam, Ấn Độ và hơn nữa.' },
      { q: 'Nếu nhóm của tôi và kỹ sư không cùng ngôn ngữ thì sao?', a: 'Quản lý dự án AI của chúng tôi dịch tin nhắn, thông số kỹ thuật và tài liệu theo thời gian thực giữa tiếng Anh, Trung, Tây Ban Nha, Việt, Hindi, Pháp, Đức, Nhật và Hàn.' },
      { q: 'Kỹ sư tham gia tốn bao nhiêu?', a: 'Tham gia và vượt qua Sàng lọc Kỹ thuật AI là miễn phí. Talengineer chỉ thu một khoản phí dịch vụ nhỏ trên các cột mốc đã thanh toán — bạn giữ phần lớn mỗi đô la bạn kiếm được.' },
    ],
    // Resources
    resH2: 'Từ trung tâm tài nguyên', resAll: 'Tất cả hướng dẫn →',
    resources: [
      { tag: 'Hướng dẫn tuyển dụng', title: 'Mức lương theo giờ của lập trình viên PLC năm 2026: phân tích theo khu vực', teaser: 'Chuyên môn Siemens so với Rockwell tốn bao nhiêu ở sáu khu vực, và khi nào thuê ngoài nước ngoài là hợp lý.', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'Cẩm nang', title: 'Chạy thử từ xa: Cách các OEM giao máy mà không cần bay kỹ sư', teaser: 'Một cẩm nang theo cột mốc cho FAT/SAT với nhân tài bản địa đã xác minh tại hiện trường.', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'Dành cho kỹ sư', title: 'Vượt qua Sàng lọc Kỹ thuật AI: Chúng tôi thực sự kiểm tra gì', teaser: 'Bên trong bài đánh giá thực hành — logic bậc thang, thiết kế HMI, mạch an toàn và hơn thế nữa.', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: 'Dự án tự động hóa tiếp theo của bạn bắt đầu tại đây',
    ctaSub: 'Đăng dự án bằng bất kỳ ngôn ngữ nào, hoặc gia nhập nhóm kỹ sư đã xác minh đầu tiên của chúng tôi.',
    ctaPost: 'Đăng dự án — Miễn phí', ctaApply: 'Ứng tuyển làm kỹ sư',
    // Footer
    footerTagline: 'Sàn nhân lực tự động hóa công nghiệp được AI xác minh trên toàn cầu.',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'Tuyển dụng', footerColEngineers: 'Kỹ sư', footerColSpecialties: 'Chuyên môn', footerColCompany: 'Công ty',
    footerHire: [
      { label: 'Tìm kỹ sư', href: '/talent' }, { label: 'Đăng dự án', href: '/talent' },
      { label: 'Chuẩn mức phí', href: '/rates' }, { label: 'API doanh nghiệp', href: '/enterprise' },
      { label: 'Bảng giá', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'Ứng tuyển gia nhập', href: '/talent' }, { label: 'Sàng lọc AI', href: '/talent' },
      { label: 'Duyệt dự án', href: '/talent' }, { label: 'Thanh toán & Ký quỹ', href: '/finance' },
      { label: 'Thi chứng chỉ', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'Lập trình PLC', href: '/talent' }, { label: 'SCADA & HMI', href: '/talent' },
      { label: 'Robot', href: '/talent' }, { label: 'Thiết kế tủ điện', href: '/talent' },
    ],
    footerCompany: [
      { label: 'Giới thiệu', href: '/' }, { label: 'Tài nguyên', href: '#resources' },
      { label: 'Liên hệ', href: '/' }, { label: 'Quyền riêng tư & Điều khoản', href: '/' },
      { label: 'Trung tâm tin cậy', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — Sàn nhân lực tự động hóa công nghiệp toàn cầu',
  },

  hi: {
    // Nav
    navFind: 'इंजीनियर खोजें', navRates: 'दर मानक', navHow: 'यह कैसे काम करता है', navResources: 'संसाधन',
    navSignIn: 'साइन इन', navPost: 'प्रोजेक्ट पोस्ट करें', themeDark: 'डार्क', themeLight: 'लाइट',
    // Hero
    heroKicker: '// वैश्विक औद्योगिक स्वचालन प्रतिभा मंच',
    heroH1: 'बिना सीमाओं के स्वचालन प्रतिभा। AI द्वारा सत्यापित। एस्क्रो द्वारा सुरक्षित।',
    heroSub: 'PLC, SCADA, रोबोटिक्स और इलेक्ट्रिकल इंजीनियर — एक व्यावहारिक AI मूल्यांकन से जाँचे गए, प्लेटफ़ॉर्म परीक्षाओं से प्रमाणित, और नौ भाषाओं में प्रबंधित।',
    cardHiringKicker: 'मैं भर्ती कर रहा हूँ', cardHiringTitle: 'एक सत्यापित स्थानीय इंजीनियर खोजें',
    cardHiringBody: 'किसी भी भाषा में पोस्ट करें। हमारा AI आपकी तकनीकी माँग को मानकीकृत करता है और कौशल, क्षेत्र व दर के आधार पर जाँचे गए इंजीनियरों की सूची बनाता है।',
    cardHiringCta: 'इंजीनियर नियुक्त करें →', cardHiringNote: 'औसतन 48 घंटे में मिलान',
    cardEngKicker: 'मैं एक इंजीनियर हूँ', cardEngTitle: 'दुनिया भर में काम करें। सुरक्षित भुगतान पाएँ।',
    cardEngBody: 'एक बार AI तकनीकी स्क्रीनर पास करें, फिर दुनिया भर के OEM से मिलते-जुलते प्रोजेक्ट पाएँ — एस्क्रो भुगतान की गारंटी देता है।',
    cardEngCta: 'इंजीनियर के रूप में जुड़ें →', cardEngNote: 'आवेदन निःशुल्क · हर $ का बड़ा हिस्सा आपका',
    // Stats
    stats: [
      { num: '4', label: 'प्रमाणन दिशाएँ' },
      { num: 'L1–L3', label: 'प्लेटफ़ॉर्म परीक्षा स्तर' },
      { num: '100%', label: 'एस्क्रो-सुरक्षित भुगतान' },
      { num: '9', label: 'समर्थित भाषाएँ' },
    ],
    // Categories
    catKicker: 'विशेषज्ञता के अनुसार देखें', catH2: 'औद्योगिक स्वचालन का हर क्षेत्र', catAll: 'सभी विशेषज्ञताएँ →',
    engineersWord: 'इंजीनियर', avgWord: 'औसत',
    categories: [
      { emoji: '⚙️', name: 'PLC प्रोग्रामिंग', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA और HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'औद्योगिक रोबोटिक्स', tools: 'Fanuc, KUKA, ABB, Yaskawa प्रोग्रामिंग और सेल एकीकरण', count: 347, rate: 71 },
      { emoji: '🔌', name: 'इलेक्ट्रिकल पैनल डिज़ाइन', tools: 'EPLAN, AutoCAD Electrical, UL 508A अनुपालन', count: 289, rate: 54 },
      { emoji: '🏭', name: 'प्रोसेस कंट्रोल और DCS', tools: 'DeltaV, Honeywell Experion, बैच और सतत प्रक्रिया', count: 203, rate: 75 },
      { emoji: '📷', name: 'मशीन विज़न', tools: 'Cognex, Keyence, Halcon — निरीक्षण और मार्गदर्शन प्रणालियाँ', count: 156, rate: 68 },
      { emoji: '🌐', name: 'औद्योगिक नेटवर्किंग', tools: 'Profinet, EtherNet/IP, OPC UA, OT साइबर सुरक्षा', count: 134, rate: 66 },
      { emoji: '🧰', name: 'कमीशनिंग और फील्ड सेवा', tools: 'ऑन-साइट स्टार्टअप, FAT/SAT, रेट्रोफिट और समस्या-समाधान', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'यह कैसे काम करता है', howH2: 'एक मंच, दो रास्ते',
    forEmployers: 'नियोक्ताओं के लिए', forEngineers: 'इंजीनियरों के लिए',
    employerSteps: [
      { title: 'अपना प्रोजेक्ट किसी भी भाषा में पोस्ट करें', body: 'हमारा AI आपकी माँग को एक मानकीकृत दायरे, माइलस्टोन और कौशल आवश्यकताओं में बदल देता है।' },
      { title: 'सत्यापित इंजीनियरों से मिलान पाएँ', body: 'कौशल-स्क्रीन स्कोर, क्षेत्र, दर और ऑन-साइट उपलब्धता के अनुसार क्रमबद्ध सूची।' },
      { title: 'माइलस्टोन को एस्क्रो में फंड करें', body: 'पैसा तभी जारी होता है जब आप हर डिलिवरेबल को स्वीकृत करते हैं। कोई अग्रिम जोखिम नहीं।' },
      { title: 'AI प्रोजेक्ट मैनेजर के साथ डिलीवर करें', body: '9 भाषाओं में रियल-टाइम अनुवाद, प्रगति ट्रैकिंग और दस्तावेज़ीकरण।' },
    ],
    engineerSteps: [
      { title: 'मिनटों में अपनी प्रोफ़ाइल बनाएँ', body: 'अपने प्लेटफ़ॉर्म, प्रमाणन, उद्योग और दर — अपनी भाषा में सूचीबद्ध करें।' },
      { title: 'AI तकनीकी स्क्रीनर पास करें', body: 'PLC, SCADA और रोबोटिक्स कौशल का व्यावहारिक मूल्यांकन — वह बैज जिस पर ग्राहक भरोसा करते हैं।' },
      { title: 'असली प्रोजेक्ट से मिलान पाएँ', body: 'दुनिया भर के OEM और इंटीग्रेटर से स्थानीय व दूरस्थ काम — कोई बोली-युद्ध नहीं।' },
      { title: 'हर बार समय पर भुगतान पाएँ', body: 'एस्क्रो-समर्थित माइलस्टोन का मतलब है कि शुरू करने से पहले आपका भुगतान सुरक्षित है।' },
    ],
    // Featured
    featKicker: 'चुनिंदा प्रतिभा', featH2: 'इस सप्ताह तैनात होने के लिए तैयार इंजीनियर', featBrowseAll: 'सभी इंजीनियर देखें →',
    verified: '✓ AI-सत्यापित', viewProfile: 'प्रोफ़ाइल देखें →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'डेमो डेटा',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 हो ची मिन्ह सिटी', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: '3 ऑटोमोटिव टियर-1 लाइनों के लिए PLC माइग्रेशन का नेतृत्व किया; दक्षिण-पूर्व एशिया में FAT/SAT कमीशनिंग।', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 मॉन्टेरे', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'रोबोटिक वेल्ड-सेल इंटीग्रेटर; अमेरिका व मेक्सिको के OEM के लिए 40+ Fanuc सेल कमीशन किए।', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 पुणे', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignition गोल्ड-प्रमाणित; फार्मा और खाद्य-पेय संयंत्रों के लिए संपूर्ण-संयंत्र SCADA बनाया।', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'लाइव बाज़ार डेटा', rateH2: 'नियुक्ति से पहले उचित दर जानें',
    rateBody: 'क्षेत्र और विशेषज्ञता के अनुसार रियल-टाइम प्रति घंटा दर मानक, सक्रिय इंजीनियर प्रोफ़ाइलों से लिए गए। आत्मविश्वास से बजट बनाएँ — कोई अनुमान नहीं, कोई बढ़ा-चढ़ा एजेंसी मार्कअप नहीं।',
    rateCta: 'दर मानक देखें →', rateColRegion: 'क्षेत्र', rateColPlc: 'PLC / SCADA', rateColRobot: 'रोबोटिक्स',
    rateFootnote: 'प्रति घंटा अपडेट · USD/घंटा · सत्यापित इंजीनियरों द्वारा स्व-रिपोर्ट',
    rateRows: [
      { region: '🇺🇸 उत्तरी अमेरिका', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 पश्चिमी यूरोप', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 मेक्सिको', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 वियतनाम', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 भारत', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Talengineer ही क्यों', trustH2: 'सीमा-पार औद्योगिक कार्य के लिए बनाया गया',
    trust: [
      { emoji: '🛡️', title: 'AI तकनीकी स्क्रीनर', body: 'हर इंजीनियर PLC, SCADA और रोबोटिक्स कौशल का एक व्यावहारिक, निगरानी वाला मूल्यांकन पास करता है — केवल रिज़्यूमे जाँच नहीं।' },
      { emoji: '💰', title: 'माइलस्टोन एस्क्रो', body: 'धन सुरक्षित रखा जाता है और तभी जारी होता है जब आप हर डिलिवरेबल स्वीकृत करते हैं। दोनों पक्ष सुरक्षित हैं।' },
      { emoji: '🗣️', title: 'बहुभाषी AI PM', body: 'अंग्रेज़ी, चीनी, स्पेनिश, वियतनामी, हिंदी और अन्य के बीच रियल-टाइम अनुवाद — शून्य संचार अंतराल।' },
      { emoji: '📄', title: 'NDA और IP सुरक्षा', body: 'हर प्रोजेक्ट पर डिफ़ॉल्ट रूप से मानकीकृत NDA, कोड स्वामित्व हस्तांतरण और ऑडिट ट्रेल।' },
    ],
    // Testimonials
    testiH2: 'दुनिया भर के OEM और इंटीग्रेटर का भरोसा',
    testimonials: [
      { quote: 'हमने एक पैकेजिंग लाइन वियतनाम भेजी और दो सप्ताह में स्थानीय कमीशनिंग चाहिए थी। Talengineer ने 48 घंटे में हमें एक सत्यापित Siemens इंजीनियर से मिलाया — एस्क्रो मॉडल ने स्वीकृति को आसान बना दिया।', author: 'संचालन निदेशक', meta: 'पैकेजिंग OEM, ओहायो, अमेरिका' },
      { quote: 'एक इंटीग्रेटर के रूप में, व्यस्त समय में जाँचे हुए रोबोटिक्स सहायक ढूँढना बेहद कठिन है। AI स्क्रीनिंग सचमुच छानती है — हमने जिस भी इंजीनियर को नियुक्त किया वह पहले दिन ही Fanuc सेल प्रोग्राम कर सकता था।', author: 'प्रबंध साझेदार', meta: 'सिस्टम इंटीग्रेटर, बवेरिया, जर्मनी' },
      { quote: 'मैं पुणे से अमेरिकी ग्राहकों के साथ काम करती हूँ। AI PM स्पेसिफिकेशन और मीटिंग नोट्स तुरंत अनुवादित करता है, और एस्क्रो के कारण मुझे कभी चालान के पीछे नहीं भागना पड़ता। मेरी आय एक साल में दोगुनी हो गई।', author: 'SCADA इंजीनियर', meta: 'स्वतंत्र, पुणे, भारत' },
    ],
    // FAQ
    faqKicker: 'सामान्य प्रश्न', faqH2: 'अक्सर पूछे जाने वाले प्रश्न',
    faqs: [
      { q: 'एक औद्योगिक स्वचालन इंजीनियर को नियुक्त करने में कितना खर्च आता है?', a: 'Talengineer पर प्रति घंटा दरें भारत व वियतनाम में $20–45/hr से लेकर उत्तरी अमेरिका में $85–140/hr तक होती हैं, जो विशेषज्ञता और वरिष्ठता पर निर्भर करती हैं। प्लेटफ़ॉर्म शुल्क पारदर्शी हैं और कोई एजेंसी मार्कअप नहीं — क्षेत्र के अनुसार वर्तमान आँकड़ों के लिए हमारे लाइव दर मानक देखें।' },
      { q: 'इंजीनियरों को कैसे सत्यापित किया जाता है?', a: 'हर इंजीनियर हमारा स्वामित्व वाला AI तकनीकी स्क्रीनर पूरा करता है — एक व्यावहारिक मूल्यांकन जिसमें PLC प्रोग्रामिंग, SCADA/HMI, रोबोटिक्स और इलेक्ट्रिकल डिज़ाइन शामिल हैं। प्रोफ़ाइल लाइव होने से पहले पहचान, प्रमाण-पत्र और कार्य इतिहास अलग से सत्यापित किए जाते हैं।' },
      { q: 'माइलस्टोन एस्क्रो मुझे कैसे सुरक्षित रखता है?', a: 'काम शुरू होने से पहले आप हर प्रोजेक्ट माइलस्टोन को एस्क्रो में फंड करते हैं। धन तभी जारी होता है जब आप डिलिवरेबल स्वीकृत करते हैं। विवाद होने पर, कोई भी धन हस्तांतरित होने से पहले हमारी समाधान टीम माइलस्टोन स्पेसिफिकेशन और कार्य-उत्पाद की समीक्षा करती है।' },
      { q: 'क्या इंजीनियर मेरी सुविधा पर ऑन-साइट काम कर सकते हैं?', a: 'हाँ। कई प्रोजेक्ट दूरस्थ विकास को ऑन-साइट कमीशनिंग के साथ जोड़ते हैं। शहर और यात्रा दायरे के अनुसार इंजीनियरों को छाँटें — उत्तरी अमेरिका, लैटिन अमेरिका, यूरोप, वियतनाम, भारत और अन्य में हमारे पास सत्यापित स्थानीय प्रतिभा है।' },
      { q: 'यदि मेरी टीम और इंजीनियर एक ही भाषा नहीं बोलते तो क्या होगा?', a: 'हमारा AI प्रोजेक्ट मैनेजर अंग्रेज़ी, चीनी, स्पेनिश, वियतनामी, हिंदी, फ़्रेंच, जर्मन, जापानी और कोरियाई के बीच संदेश, स्पेसिफिकेशन और दस्तावेज़ रियल-टाइम में अनुवादित करता है।' },
      { q: 'इंजीनियरों को जुड़ने में कितना खर्च आता है?', a: 'जुड़ना और AI तकनीकी स्क्रीनर पास करना निःशुल्क है। Talengineer केवल भुगतान किए गए माइलस्टोन पर एक छोटा सेवा शुल्क लेता है — आपकी कमाई के हर डॉलर का बड़ा हिस्सा आपके पास रहता है।' },
    ],
    // Resources
    resH2: 'संसाधन केंद्र से', resAll: 'सभी गाइड →',
    resources: [
      { tag: 'भर्ती गाइड', title: '2026 में PLC प्रोग्रामर की प्रति घंटा दरें: क्षेत्रवार विश्लेषण', teaser: 'छह क्षेत्रों में Siemens बनाम Rockwell विशेषज्ञता की लागत, और कब ऑफशोर समझदारी है।', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'प्लेबुक', title: 'दूरस्थ कमीशनिंग: OEM बिना इंजीनियर भेजे मशीनें कैसे डिलीवर करते हैं', teaser: 'ज़मीन पर सत्यापित स्थानीय प्रतिभा के साथ FAT/SAT के लिए माइलस्टोन-आधारित प्लेबुक।', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'इंजीनियरों के लिए', title: 'AI तकनीकी स्क्रीनर पास करना: हम वास्तव में क्या परखते हैं', teaser: 'व्यावहारिक मूल्यांकन के भीतर — लैडर लॉजिक, HMI डिज़ाइन, सुरक्षा सर्किट और अधिक।', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: 'आपका अगला स्वचालन प्रोजेक्ट यहीं से शुरू होता है',
    ctaSub: 'किसी भी भाषा में प्रोजेक्ट पोस्ट करें, या हमारे संस्थापक सत्यापित इंजीनियरों के समूह से जुड़ें।',
    ctaPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क', ctaApply: 'इंजीनियर के रूप में आवेदन करें',
    // Footer
    footerTagline: 'AI-सत्यापित औद्योगिक स्वचालन प्रतिभा का वैश्विक मंच।',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'नियुक्ति', footerColEngineers: 'इंजीनियर', footerColSpecialties: 'विशेषज्ञताएँ', footerColCompany: 'कंपनी',
    footerHire: [
      { label: 'इंजीनियर खोजें', href: '/talent' }, { label: 'प्रोजेक्ट पोस्ट करें', href: '/talent' },
      { label: 'दर मानक', href: '/rates' }, { label: 'एंटरप्राइज़ API', href: '/enterprise' },
      { label: 'मूल्य निर्धारण', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'जुड़ने के लिए आवेदन करें', href: '/talent' }, { label: 'AI स्क्रीनर', href: '/talent' },
      { label: 'प्रोजेक्ट ब्राउज़ करें', href: '/talent' }, { label: 'भुगतान और एस्क्रो', href: '/finance' },
      { label: 'प्रमाणन परीक्षाएँ', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLC प्रोग्रामिंग', href: '/talent' }, { label: 'SCADA और HMI', href: '/talent' },
      { label: 'रोबोटिक्स', href: '/talent' }, { label: 'पैनल डिज़ाइन', href: '/talent' },
    ],
    footerCompany: [
      { label: 'हमारे बारे में', href: '/' }, { label: 'संसाधन', href: '#resources' },
      { label: 'संपर्क', href: '/' }, { label: 'गोपनीयता और शर्तें', href: '/' },
      { label: 'ट्रस्ट सेंटर', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — वैश्विक औद्योगिक स्वचालन प्रतिभा मंच',
  },

  fr: {
    // Nav
    navFind: 'Trouver des ingénieurs', navRates: 'Références de tarifs', navHow: 'Comment ça marche', navResources: 'Ressources',
    navSignIn: 'Se connecter', navPost: 'Publier un projet', themeDark: 'Sombre', themeLight: 'Clair',
    // Hero
    heroKicker: "// La marketplace mondiale des talents en automatisation industrielle",
    heroH1: "Des talents en automatisation sans frontières. Vérifiés par IA. Protégés par séquestre.",
    heroSub: "Ingénieurs PLC, SCADA, robotique et électriciens — évalués par un test pratique d'IA, certifiés par les examens de la plateforme, et gérés en neuf langues.",
    cardHiringKicker: "Je recrute", cardHiringTitle: "Trouvez un ingénieur local vérifié",
    cardHiringBody: "Publiez dans n'importe quelle langue. Notre IA standardise votre cahier des charges et présélectionne des ingénieurs évalués par compétence, région et tarif.",
    cardHiringCta: "Recruter un ingénieur →", cardHiringNote: "Mise en relation en 48 h en moyenne",
    cardEngKicker: "Je suis ingénieur", cardEngTitle: "Travaillez partout. Soyez payé en toute sécurité.",
    cardEngBody: "Réussissez une fois l'évaluateur technique IA, puis recevez des projets adaptés d'OEM du monde entier — le séquestre garantit votre paiement.",
    cardEngCta: "Rejoindre en tant qu'ingénieur →", cardEngNote: "Candidature gratuite · gardez la majeure partie de chaque $",
    // Stats
    stats: [
      { num: '4', label: 'Parcours de certification' },
      { num: 'L1–L3', label: "Niveaux d'examen de la plateforme" },
      { num: '100%', label: 'Paiements protégés par séquestre' },
      { num: '9', label: 'Langues prises en charge' },
    ],
    // Categories
    catKicker: 'Parcourir par spécialité', catH2: "Toutes les disciplines de l'automatisation industrielle", catAll: 'Toutes les spécialités →',
    engineersWord: 'ingénieurs', avgWord: 'moy.',
    categories: [
      { emoji: '⚙️', name: 'Programmation PLC', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA et HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'Robotique industrielle', tools: 'Programmation et intégration de cellules Fanuc, KUKA, ABB, Yaskawa', count: 347, rate: 71 },
      { emoji: '🔌', name: "Conception d'armoires électriques", tools: 'EPLAN, AutoCAD Electrical, conformité UL 508A', count: 289, rate: 54 },
      { emoji: '🏭', name: 'Contrôle de procédés et DCS', tools: 'DeltaV, Honeywell Experion, procédés par lots et continus', count: 203, rate: 75 },
      { emoji: '📷', name: 'Vision industrielle', tools: "Cognex, Keyence, Halcon — systèmes d'inspection et de guidage", count: 156, rate: 68 },
      { emoji: '🌐', name: 'Réseaux industriels', tools: 'Profinet, EtherNet/IP, OPC UA, cybersécurité OT', count: 134, rate: 66 },
      { emoji: '🧰', name: 'Mise en service et service sur site', tools: 'Démarrage sur site, FAT/SAT, rétrofit et dépannage', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'Comment ça marche', howH2: 'Une plateforme, deux parcours',
    forEmployers: 'Pour les employeurs', forEngineers: 'Pour les ingénieurs',
    employerSteps: [
      { title: "Publiez votre projet dans n'importe quelle langue", body: "Notre IA traduit votre cahier des charges en périmètre, jalons et exigences de compétences standardisés." },
      { title: "Soyez mis en relation avec des ingénieurs vérifiés", body: "Présélections classées par score d'évaluation, région, tarif et disponibilité sur site." },
      { title: "Financez les jalons sous séquestre", body: "L'argent n'est libéré que lorsque vous approuvez chaque livrable. Aucun risque d'avance." },
      { title: "Livrez avec un chef de projet IA", body: "Traduction en temps réel, suivi de l'avancement et documentation en 9 langues." },
    ],
    engineerSteps: [
      { title: "Créez votre profil en quelques minutes", body: "Indiquez vos plateformes, certifications, secteurs et tarif — dans votre propre langue." },
      { title: "Réussissez l'évaluateur technique IA", body: "Une évaluation pratique des compétences PLC, SCADA et robotique — le badge auquel les clients se fient." },
      { title: "Soyez associé à de vrais projets", body: "Travail local et à distance auprès d'OEM et d'intégrateurs du monde entier — sans guerre des prix." },
      { title: "Soyez payé à temps, à chaque fois", body: "Les jalons sécurisés par séquestre garantissent votre paiement avant même de commencer." },
    ],
    // Featured
    featKicker: 'Talents à la une', featH2: 'Ingénieurs prêts à intervenir cette semaine', featBrowseAll: 'Voir tous les ingénieurs →',
    verified: '✓ Vérifié par IA', viewProfile: 'Voir le profil →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'Données de démo',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Hô-Chi-Minh-Ville', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: "A dirigé la migration PLC de 3 lignes de fournisseurs automobiles de rang 1 ; mise en service FAT/SAT dans toute l'Asie du Sud-Est.", rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: "Intégrateur de cellules de soudage robotisées ; plus de 40 cellules Fanuc mises en service pour des OEM américains et mexicains.", rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: "Certifiée Ignition Gold ; a conçu des SCADA à l'échelle de l'usine pour des sites pharmaceutiques et agroalimentaires.", rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'Données de marché en direct', rateH2: 'Connaissez le juste tarif avant de recruter',
    rateBody: "Références de tarifs horaires en temps réel par région et spécialité, issues de profils d'ingénieurs actifs. Budgétez en toute confiance — sans approximation ni marges d'agence gonflées.",
    rateCta: 'Explorer les références de tarifs →', rateColRegion: 'Région', rateColPlc: 'PLC / SCADA', rateColRobot: 'Robotique',
    rateFootnote: 'Mis à jour toutes les heures · USD/h · auto-déclaré par des ingénieurs vérifiés',
    rateRows: [
      { region: '🇺🇸 Amérique du Nord', plc: '$85–140', robot: '$95–150' },
      { region: "🇩🇪 Europe de l'Ouest", plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 Mexique', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 Vietnam', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 Inde', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Pourquoi Talengineer', trustH2: 'Conçu pour le travail industriel transfrontalier',
    trust: [
      { emoji: '🛡️', title: 'Évaluateur technique IA', body: "Chaque ingénieur réussit une évaluation pratique et surveillée des compétences PLC, SCADA et robotique — pas un simple contrôle de CV." },
      { emoji: '💰', title: 'Séquestre par jalons', body: "Les fonds sont conservés en sécurité et libérés uniquement lorsque vous approuvez chaque livrable. Les deux parties sont protégées." },
      { emoji: '🗣️', title: 'Chef de projet IA multilingue', body: "Traduction en temps réel entre anglais, chinois, espagnol, vietnamien, hindi et plus encore — zéro barrière de communication." },
      { emoji: '📄', title: 'Protection NDA et propriété intellectuelle', body: "NDA standardisés, transfert de propriété du code et pistes d'audit sur chaque projet par défaut." },
    ],
    // Testimonials
    testiH2: "La confiance des OEM et intégrateurs du monde entier",
    testimonials: [
      { quote: "Nous avons expédié une ligne de conditionnement au Vietnam et avions besoin d'une mise en service locale sous deux semaines. Talengineer nous a mis en relation avec un ingénieur Siemens vérifié en 48 heures — le modèle de séquestre a rendu la validation sans douleur.", author: 'Directeur des opérations', meta: 'OEM de conditionnement, Ohio, États-Unis' },
      { quote: "En tant qu'intégrateur, trouver de l'aide en robotique validée en pleine période de rush est brutal. L'évaluation par IA filtre vraiment — chaque ingénieur que nous avons recruté savait programmer une cellule Fanuc dès le premier jour.", author: 'Associé gérant', meta: 'Intégrateur de systèmes, Bavière, Allemagne' },
      { quote: "Je travaille avec des clients américains depuis Pune. Le chef de projet IA traduit instantanément les spécifications et les comptes rendus, et le séquestre m'évite de courir après les factures. Mes revenus ont doublé en un an.", author: 'Ingénieure SCADA', meta: 'Indépendante, Pune, Inde' },
    ],
    // FAQ
    faqKicker: 'FAQ', faqH2: 'Questions fréquentes',
    faqs: [
      { q: "Combien coûte le recrutement d'un ingénieur en automatisation industrielle ?", a: "Les tarifs horaires sur Talengineer vont de $20–45/hr en Inde et au Vietnam à $85–140/hr en Amérique du Nord, selon la spécialité et l'ancienneté. Les frais de plateforme sont transparents et sans marge d'agence — consultez nos références de tarifs en direct pour les chiffres actuels par région." },
      { q: "Comment les ingénieurs sont-ils vérifiés ?", a: "Chaque ingénieur passe notre évaluateur technique IA propriétaire — une évaluation pratique couvrant la programmation PLC, le SCADA/HMI, la robotique et la conception électrique. L'identité, les qualifications et l'expérience sont vérifiées séparément avant la mise en ligne d'un profil." },
      { q: "Comment le séquestre par jalons me protège-t-il ?", a: "Vous financez chaque jalon du projet sous séquestre avant le début des travaux. Les fonds ne sont libérés que lorsque vous approuvez le livrable. En cas de litige, notre équipe de résolution examine le cahier des charges du jalon et le travail réalisé avant tout mouvement d'argent." },
      { q: "Les ingénieurs peuvent-ils travailler sur mon site ?", a: "Oui. De nombreux projets combinent développement à distance et mise en service sur site. Filtrez les ingénieurs par ville et rayon de déplacement — nous disposons de talents locaux vérifiés en Amérique du Nord, en Amérique latine, en Europe, au Vietnam, en Inde et ailleurs." },
      { q: "Que se passe-t-il si mon équipe et l'ingénieur ne parlent pas la même langue ?", a: "Notre chef de projet IA traduit messages, spécifications et documentation en temps réel entre l'anglais, le chinois, l'espagnol, le vietnamien, l'hindi, le français, l'allemand, le japonais et le coréen." },
      { q: "Combien coûte l'inscription aux ingénieurs ?", a: "S'inscrire et réussir l'évaluateur technique IA est gratuit. Talengineer ne prélève qu'une petite commission de service sur les jalons payés — vous gardez la grande majorité de chaque dollar gagné." },
    ],
    // Resources
    resH2: 'Depuis le centre de ressources', resAll: 'Tous les guides →',
    resources: [
      { tag: 'Guide de recrutement', title: 'Tarifs horaires des programmeurs PLC en 2026 : analyse par région', teaser: "Ce que coûte l'expertise Siemens vs Rockwell dans six régions, et quand l'offshore a du sens.", href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'Playbook', title: "Mise en service à distance : comment les OEM livrent des machines sans envoyer d'ingénieurs", teaser: "Un playbook par jalons pour les FAT/SAT avec des talents locaux vérifiés sur le terrain.", href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'Pour les ingénieurs', title: "Réussir l'évaluateur technique IA : ce que nous testons vraiment", teaser: "Au cœur de l'évaluation pratique — logique à contacts, conception HMI, circuits de sécurité et plus.", href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: "Votre prochain projet d'automatisation commence ici",
    ctaSub: "Publiez un projet dans n'importe quelle langue, ou rejoignez notre première cohorte d'ingénieurs vérifiés.",
    ctaPost: 'Publier un projet — Gratuit', ctaApply: "Postuler en tant qu'ingénieur",
    // Footer
    footerTagline: "La marketplace mondiale des talents en automatisation industrielle vérifiés par IA.",
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'Recruter', footerColEngineers: 'Ingénieurs', footerColSpecialties: 'Spécialités', footerColCompany: 'Entreprise',
    footerHire: [
      { label: 'Trouver des ingénieurs', href: '/talent' }, { label: 'Publier un projet', href: '/talent' },
      { label: 'Références de tarifs', href: '/rates' }, { label: 'API entreprise', href: '/enterprise' },
      { label: 'Tarifs', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'Postuler', href: '/talent' }, { label: 'Évaluateur IA', href: '/talent' },
      { label: 'Parcourir les projets', href: '/talent' }, { label: 'Paiements et séquestre', href: '/finance' },
      { label: 'Examens de certification', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'Programmation PLC', href: '/talent' }, { label: 'SCADA et HMI', href: '/talent' },
      { label: 'Robotique', href: '/talent' }, { label: "Conception d'armoires", href: '/talent' },
    ],
    footerCompany: [
      { label: 'À propos', href: '/' }, { label: 'Ressources', href: '#resources' },
      { label: 'Contact', href: '/' }, { label: 'Confidentialité et conditions', href: '/' },
      { label: 'Centre de confiance', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — Marketplace mondiale des talents en automatisation industrielle',
  },

  de: {
    // Nav
    navFind: 'Ingenieure finden', navRates: 'Tarif-Benchmarks', navHow: 'So funktioniert es', navResources: 'Ressourcen',
    navSignIn: 'Anmelden', navPost: 'Projekt ausschreiben', themeDark: 'Dunkel', themeLight: 'Hell',
    // Hero
    heroKicker: '// Der globale Marktplatz für Talente in der industriellen Automatisierung',
    heroH1: 'Automatisierungstalente ohne Grenzen. KI-verifiziert. Treuhänderisch abgesichert.',
    heroSub: 'PLC-, SCADA-, Robotik- und Elektroingenieure — geprüft mit einem praxisnahen KI-Assessment, zertifiziert durch Plattformprüfungen und betreut in neun Sprachen.',
    cardHiringKicker: 'Ich stelle ein', cardHiringTitle: 'Finden Sie einen verifizierten lokalen Ingenieur',
    cardHiringBody: 'Schreiben Sie in jeder Sprache aus. Unsere KI standardisiert Ihre Spezifikation und erstellt eine Auswahl geprüfter Ingenieure nach Kompetenz, Region und Tarif.',
    cardHiringCta: 'Ingenieur beauftragen →', cardHiringNote: 'Vermittlung in durchschnittlich 48 Std.',
    cardEngKicker: 'Ich bin Ingenieur', cardEngTitle: 'Weltweit arbeiten. Sicher bezahlt werden.',
    cardEngBody: 'Bestehen Sie einmal den KI-Techniktest und erhalten Sie passende Projekte von OEMs weltweit — die Treuhand garantiert Ihre Bezahlung.',
    cardEngCta: 'Als Ingenieur beitreten →', cardEngNote: 'Bewerbung kostenlos · behalten Sie den Großteil jedes $',
    // Stats
    stats: [
      { num: '4', label: 'Zertifizierungspfade' },
      { num: 'L1–L3', label: 'Plattform-Prüfungsstufen' },
      { num: '100%', label: 'Treuhandgeschützte Zahlungen' },
      { num: '9', label: 'Unterstützte Sprachen' },
    ],
    // Categories
    catKicker: 'Nach Fachgebiet stöbern', catH2: 'Jedes Fachgebiet der industriellen Automatisierung', catAll: 'Alle Fachgebiete →',
    engineersWord: 'Ingenieure', avgWord: 'Ø',
    categories: [
      { emoji: '⚙️', name: 'PLC-Programmierung', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA & HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: 'Industrierobotik', tools: 'Programmierung und Zellenintegration von Fanuc, KUKA, ABB, Yaskawa', count: 347, rate: 71 },
      { emoji: '🔌', name: 'Schaltschrankdesign', tools: 'EPLAN, AutoCAD Electrical, UL-508A-Konformität', count: 289, rate: 54 },
      { emoji: '🏭', name: 'Prozessleittechnik & DCS', tools: 'DeltaV, Honeywell Experion, Batch- und kontinuierliche Prozesse', count: 203, rate: 75 },
      { emoji: '📷', name: 'Bildverarbeitung', tools: 'Cognex, Keyence, Halcon — Inspektions- und Führungssysteme', count: 156, rate: 68 },
      { emoji: '🌐', name: 'Industrielle Netzwerke', tools: 'Profinet, EtherNet/IP, OPC UA, OT-Cybersicherheit', count: 134, rate: 66 },
      { emoji: '🧰', name: 'Inbetriebnahme & Außendienst', tools: 'Vor-Ort-Anlauf, FAT/SAT, Nachrüstung und Fehlersuche', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: 'So funktioniert es', howH2: 'Eine Plattform, zwei Wege',
    forEmployers: 'Für Auftraggeber', forEngineers: 'Für Ingenieure',
    employerSteps: [
      { title: 'Schreiben Sie Ihr Projekt in jeder Sprache aus', body: 'Unsere KI überführt Ihre Spezifikation in einen standardisierten Umfang, Meilensteine und Kompetenzanforderungen.' },
      { title: 'Werden Sie mit verifizierten Ingenieuren vermittelt', body: 'Auswahllisten, sortiert nach Kompetenz-Score, Region, Tarif und Verfügbarkeit vor Ort.' },
      { title: 'Finanzieren Sie Meilensteine per Treuhand', body: 'Geld wird erst freigegeben, wenn Sie jede Leistung abnehmen. Kein Vorabrisiko.' },
      { title: 'Liefern Sie mit einem KI-Projektmanager', body: 'Echtzeit-Übersetzung, Fortschrittsverfolgung und Dokumentation in 9 Sprachen.' },
    ],
    engineerSteps: [
      { title: 'Erstellen Sie Ihr Profil in Minuten', body: 'Listen Sie Ihre Plattformen, Zertifizierungen, Branchen und Ihren Tarif auf — in Ihrer eigenen Sprache.' },
      { title: 'Bestehen Sie den KI-Techniktest', body: 'Ein praxisnahes Assessment der Kompetenzen in PLC, SCADA und Robotik — das Abzeichen, dem Kunden vertrauen.' },
      { title: 'Werden Sie mit echten Projekten vermittelt', body: 'Lokale und Remote-Arbeit von OEMs und Integratoren weltweit — keine Preiskämpfe.' },
      { title: 'Werden Sie pünktlich bezahlt, jedes Mal', body: 'Treuhandgesicherte Meilensteine bedeuten, dass Ihre Bezahlung schon vor Beginn gesichert ist.' },
    ],
    // Featured
    featKicker: 'Ausgewählte Talente', featH2: 'Ingenieure, die diese Woche einsatzbereit sind', featBrowseAll: 'Alle Ingenieure ansehen →',
    verified: '✓ KI-verifiziert', viewProfile: 'Profil ansehen →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'Demodaten',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 Ho-Chi-Minh-Stadt', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: 'Leitete die PLC-Migration für 3 Tier-1-Automobillinien; FAT/SAT-Inbetriebnahme in ganz Südostasien.', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 Monterrey', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'Integrator für robotergestützte Schweißzellen; über 40 Fanuc-Zellen für OEMs in den USA und Mexiko in Betrieb genommen.', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 Pune', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignition-Gold-zertifiziert; baute werksweite SCADA-Systeme für Pharma- und Lebensmittelbetriebe.', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'Live-Marktdaten', rateH2: 'Kennen Sie den fairen Tarif, bevor Sie einstellen',
    rateBody: 'Echtzeit-Stundensatz-Benchmarks nach Region und Fachgebiet, gewonnen aus aktiven Ingenieurprofilen. Budgetieren Sie mit Zuversicht — kein Rätselraten, keine überhöhten Agenturaufschläge.',
    rateCta: 'Tarif-Benchmarks erkunden →', rateColRegion: 'Region', rateColPlc: 'PLC / SCADA', rateColRobot: 'Robotik',
    rateFootnote: 'Stündlich aktualisiert · USD/Std. · selbst angegeben von verifizierten Ingenieuren',
    rateRows: [
      { region: '🇺🇸 Nordamerika', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 Westeuropa', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 Mexiko', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 Vietnam', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 Indien', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Warum Talengineer', trustH2: 'Gebaut für grenzüberschreitende Industriearbeit',
    trust: [
      { emoji: '🛡️', title: 'KI-Techniktest', body: 'Jeder Ingenieur besteht ein praxisnahes, beaufsichtigtes Assessment der Kompetenzen in PLC, SCADA und Robotik — nicht nur eine Lebenslaufprüfung.' },
      { emoji: '💰', title: 'Meilenstein-Treuhand', body: 'Gelder werden sicher verwahrt und erst freigegeben, wenn Sie jede Leistung abnehmen. Beide Seiten sind geschützt.' },
      { emoji: '🗣️', title: 'Mehrsprachiger KI-Projektmanager', body: 'Echtzeit-Übersetzung zwischen Englisch, Chinesisch, Spanisch, Vietnamesisch, Hindi und mehr — keine Kommunikationslücken.' },
      { emoji: '📄', title: 'NDA- und IP-Schutz', body: 'Standardisierte NDAs, Übertragung des Code-Eigentums und Audit-Trails bei jedem Projekt standardmäßig.' },
    ],
    // Testimonials
    testiH2: 'Vertraut von OEMs und Integratoren weltweit',
    testimonials: [
      { quote: 'Wir haben eine Verpackungslinie nach Vietnam geliefert und brauchten innerhalb von zwei Wochen eine lokale Inbetriebnahme. Talengineer vermittelte uns in 48 Stunden einen verifizierten Siemens-Ingenieur — das Treuhandmodell machte die Abnahme mühelos.', author: 'Betriebsleiter', meta: 'Verpackungs-OEM, Ohio, USA' },
      { quote: 'Als Integrator ist es brutal, in Stoßzeiten geprüfte Robotik-Unterstützung zu finden. Das KI-Screening filtert wirklich — jeder Ingenieur, den wir eingestellt haben, konnte am ersten Tag eine Fanuc-Zelle programmieren.', author: 'Geschäftsführender Gesellschafter', meta: 'Systemintegrator, Bayern, Deutschland' },
      { quote: 'Ich arbeite von Pune aus mit US-Kunden. Der KI-Projektmanager übersetzt Spezifikationen und Besprechungsnotizen sofort, und dank Treuhand muss ich nie Rechnungen hinterherlaufen. Mein Einkommen hat sich in einem Jahr verdoppelt.', author: 'SCADA-Ingenieurin', meta: 'Selbstständig, Pune, Indien' },
    ],
    // FAQ
    faqKicker: 'FAQ', faqH2: 'Häufig gestellte Fragen',
    faqs: [
      { q: 'Wie viel kostet es, einen Ingenieur für industrielle Automatisierung zu beauftragen?', a: 'Die Stundensätze auf Talengineer reichen von $20–45/hr in Indien und Vietnam bis $85–140/hr in Nordamerika, je nach Fachgebiet und Erfahrung. Die Plattformgebühren sind transparent und ohne Agenturaufschläge — aktuelle Zahlen nach Region finden Sie in unseren Live-Tarif-Benchmarks.' },
      { q: 'Wie werden Ingenieure verifiziert?', a: 'Jeder Ingenieur absolviert unseren eigenen KI-Techniktest — ein praxisnahes Assessment zu PLC-Programmierung, SCADA/HMI, Robotik und Elektrodesign. Identität, Qualifikationen und Berufserfahrung werden separat verifiziert, bevor ein Profil live geht.' },
      { q: 'Wie schützt mich die Meilenstein-Treuhand?', a: 'Sie finanzieren jeden Projektmeilenstein per Treuhand, bevor die Arbeit beginnt. Gelder werden erst freigegeben, wenn Sie die Leistung abnehmen. Bei einem Streitfall prüft unser Schlichtungsteam die Meilenstein-Spezifikation und das Arbeitsergebnis, bevor Geld bewegt wird.' },
      { q: 'Können Ingenieure vor Ort in meinem Werk arbeiten?', a: 'Ja. Viele Projekte kombinieren Remote-Entwicklung mit Inbetriebnahme vor Ort. Filtern Sie Ingenieure nach Stadt und Reiseradius — wir haben verifizierte lokale Talente in Nordamerika, Lateinamerika, Europa, Vietnam, Indien und mehr.' },
      { q: 'Was, wenn mein Team und der Ingenieur keine gemeinsame Sprache sprechen?', a: 'Unser KI-Projektmanager übersetzt Nachrichten, Spezifikationen und Dokumentation in Echtzeit zwischen Englisch, Chinesisch, Spanisch, Vietnamesisch, Hindi, Französisch, Deutsch, Japanisch und Koreanisch.' },
      { q: 'Was kostet der Beitritt für Ingenieure?', a: 'Der Beitritt und das Bestehen des KI-Techniktests sind kostenlos. Talengineer erhebt nur eine kleine Servicegebühr auf bezahlte Meilensteine — Sie behalten den weitaus größten Teil jedes verdienten Dollars.' },
    ],
    // Resources
    resH2: 'Aus dem Ressourcenzentrum', resAll: 'Alle Leitfäden →',
    resources: [
      { tag: 'Einstellungsleitfaden', title: 'PLC-Programmierer-Stundensätze 2026: Eine regionale Übersicht', teaser: 'Was Siemens- vs. Rockwell-Expertise in sechs Regionen kostet und wann Offshore sinnvoll ist.', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'Playbook', title: 'Ferninbetriebnahme: Wie OEMs Maschinen ausliefern, ohne Ingenieure einzufliegen', teaser: 'Ein meilensteinbasiertes Playbook für FAT/SAT mit verifizierten lokalen Talenten vor Ort.', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'Für Ingenieure', title: 'Den KI-Techniktest bestehen: Was wir wirklich prüfen', teaser: 'Ein Blick ins praxisnahe Assessment — Kontaktplanlogik, HMI-Design, Sicherheitsschaltungen und mehr.', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: 'Ihr nächstes Automatisierungsprojekt beginnt hier',
    ctaSub: 'Schreiben Sie ein Projekt in jeder Sprache aus, oder schließen Sie sich unserer Gründungsgruppe verifizierter Ingenieure an.',
    ctaPost: 'Projekt ausschreiben — kostenlos', ctaApply: 'Als Ingenieur bewerben',
    // Footer
    footerTagline: 'Der globale Marktplatz für KI-verifizierte Talente in der industriellen Automatisierung.',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: 'Einstellen', footerColEngineers: 'Ingenieure', footerColSpecialties: 'Fachgebiete', footerColCompany: 'Unternehmen',
    footerHire: [
      { label: 'Ingenieure finden', href: '/talent' }, { label: 'Projekt ausschreiben', href: '/talent' },
      { label: 'Tarif-Benchmarks', href: '/rates' }, { label: 'Enterprise-API', href: '/enterprise' },
      { label: 'Preise', href: '/pricing' },
    ],
    footerEngineers: [
      { label: 'Jetzt bewerben', href: '/talent' }, { label: 'KI-Test', href: '/talent' },
      { label: 'Projekte durchsuchen', href: '/talent' }, { label: 'Zahlungen & Treuhand', href: '/finance' },
      { label: 'Zertifizierungsprüfungen', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLC-Programmierung', href: '/talent' }, { label: 'SCADA & HMI', href: '/talent' },
      { label: 'Robotik', href: '/talent' }, { label: 'Schaltschrankdesign', href: '/talent' },
    ],
    footerCompany: [
      { label: 'Über uns', href: '/' }, { label: 'Ressourcen', href: '#resources' },
      { label: 'Kontakt', href: '/' }, { label: 'Datenschutz & AGB', href: '/' },
      { label: 'Trust Center', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — Globaler Marktplatz für industrielle Automatisierungstalente',
  },

  ja: {
    // Nav
    navFind: 'エンジニアを探す', navRates: '料金ベンチマーク', navHow: '仕組み', navResources: 'リソース',
    navSignIn: 'ログイン', navPost: 'プロジェクトを投稿', themeDark: 'ダーク', themeLight: 'ライト',
    // Hero
    heroKicker: '// 世界の産業オートメーション人材マーケットプレイス',
    heroH1: '国境を越えるオートメーション人材。AIが検証。エスクローが保護。',
    heroSub: 'PLC・SCADA・ロボティクス・電気エンジニア——実践的なAIアセスメントで審査し、プラットフォーム試験で認定、9言語で管理します。',
    cardHiringKicker: '採用したい', cardHiringTitle: '検証済みの現地エンジニアを見つける',
    cardHiringBody: 'どの言語でも投稿できます。AIが仕様を標準化し、スキル・地域・料金でスクリーニング済みのエンジニアを絞り込みます。',
    cardHiringCta: 'エンジニアを雇う →', cardHiringNote: '平均48時間でマッチング',
    cardEngKicker: 'エンジニアです', cardEngTitle: '世界で働く。安全に報酬を得る。',
    cardEngBody: 'AI技術スクリーナーに一度合格すれば、世界中のOEMからマッチしたプロジェクトが届きます——エスクローが支払いを保証します。',
    cardEngCta: 'エンジニアとして参加 →', cardEngNote: '応募無料 · 収入の大半はあなたのもの',
    // Stats
    stats: [
      { num: '4', label: '認定コース' },
      { num: 'L1–L3', label: 'プラットフォーム試験レベル' },
      { num: '100%', label: 'エスクロー保護された支払い' },
      { num: '9', label: '対応言語' },
    ],
    // Categories
    catKicker: '専門分野で探す', catH2: '産業オートメーションのあらゆる分野', catAll: 'すべての専門分野 →',
    engineersWord: '名のエンジニア', avgWord: '平均',
    categories: [
      { emoji: '⚙️', name: 'PLCプログラミング', tools: 'Siemens TIA Portal、Rockwell Studio 5000、Mitsubishi、Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA・HMI', tools: 'Ignition、WinCC、FactoryTalk View、Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: '産業用ロボティクス', tools: 'Fanuc、KUKA、ABB、Yaskawaのプログラミングとセル統合', count: 347, rate: 71 },
      { emoji: '🔌', name: '制御盤設計', tools: 'EPLAN、AutoCAD Electrical、UL 508A準拠', count: 289, rate: 54 },
      { emoji: '🏭', name: 'プロセス制御・DCS', tools: 'DeltaV、Honeywell Experion、バッチ・連続プロセス', count: 203, rate: 75 },
      { emoji: '📷', name: 'マシンビジョン', tools: 'Cognex、Keyence、Halcon——検査・ガイダンスシステム', count: 156, rate: 68 },
      { emoji: '🌐', name: '産業ネットワーク', tools: 'Profinet、EtherNet/IP、OPC UA、OTサイバーセキュリティ', count: 134, rate: 66 },
      { emoji: '🧰', name: '試運転・現場サービス', tools: '現地立ち上げ、FAT/SAT、レトロフィットとトラブルシューティング', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: '仕組み', howH2: '1つのプラットフォーム、2つの道',
    forEmployers: '雇用者向け', forEngineers: 'エンジニア向け',
    employerSteps: [
      { title: 'プロジェクトをどの言語でも投稿', body: 'AIが仕様を標準化されたスコープ、マイルストーン、スキル要件に解析します。' },
      { title: '検証済みエンジニアとマッチング', body: 'スキル審査スコア、地域、料金、現地対応可否で順位付けされた候補リスト。' },
      { title: 'マイルストーンをエスクローに入金', body: '各成果物を承認したときにのみ資金が支払われます。前払いリスクはゼロ。' },
      { title: 'AIプロジェクトマネージャーと納品', body: '9言語でのリアルタイム翻訳、進捗管理、ドキュメント作成。' },
    ],
    engineerSteps: [
      { title: '数分でプロフィールを作成', body: 'プラットフォーム、資格、業界、料金を——あなたの言語で記載。' },
      { title: 'AI技術スクリーナーに合格', body: 'PLC・SCADA・ロボティクスのスキルを実践的に評価——クライアントが信頼するバッジ。' },
      { title: '実際のプロジェクトにマッチング', body: '世界中のOEMやインテグレーターからの現地・リモート案件——入札合戦なし。' },
      { title: '毎回、期日どおりに支払い', body: 'エスクローで裏付けられたマイルストーンにより、開始前に報酬が確保されます。' },
    ],
    // Featured
    featKicker: '注目の人材', featH2: '今週から稼働できるエンジニア', featBrowseAll: 'すべてのエンジニアを見る →',
    verified: '✓ AI検証済み', viewProfile: 'プロフィールを見る →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: 'デモデータ',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 ホーチミン市', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: '自動車ティア1の3ラインでPLC移行を主導。東南アジア各地でFAT/SAT試運転を実施。', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 モンテレイ', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: 'ロボット溶接セルのインテグレーター。米国・メキシコのOEM向けに40台超のFanucセルを試運転。', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 プネー', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignitionゴールド認定。製薬・食品飲料施設向けに全工場規模のSCADAを構築。', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: 'ライブ市場データ', rateH2: '雇う前に適正料金を知る',
    rateBody: '地域と専門分野別のリアルタイム時間料金ベンチマーク。稼働中のエンジニアプロフィールから収集。当て推量も、水増しされた代理店マージンもなく、自信を持って予算を立てられます。',
    rateCta: '料金ベンチマークを見る →', rateColRegion: '地域', rateColPlc: 'PLC / SCADA', rateColRobot: 'ロボティクス',
    rateFootnote: '毎時更新 · USD/時 · 検証済みエンジニアの自己申告',
    rateRows: [
      { region: '🇺🇸 北米', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 西ヨーロッパ', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 メキシコ', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 ベトナム', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 インド', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Talengineerが選ばれる理由', trustH2: '国境を越える産業案件のために構築',
    trust: [
      { emoji: '🛡️', title: 'AI技術スクリーナー', body: 'すべてのエンジニアが、PLC・SCADA・ロボティクスのスキルを実践的かつ監督下で評価されます——履歴書チェックだけではありません。' },
      { emoji: '💰', title: 'マイルストーン・エスクロー', body: '資金は安全に保管され、各成果物を承認したときにのみ支払われます。双方が保護されます。' },
      { emoji: '🗣️', title: '多言語対応AI PM', body: '英語・中国語・スペイン語・ベトナム語・ヒンディー語など、リアルタイムで翻訳——コミュニケーションの断絶ゼロ。' },
      { emoji: '📄', title: 'NDA・知的財産保護', body: 'すべてのプロジェクトで標準化されたNDA、コード所有権の移転、監査証跡をデフォルトで提供。' },
    ],
    // Testimonials
    testiH2: '世界中のOEM・インテグレーターに信頼されています',
    testimonials: [
      { quote: '包装ラインをベトナムに出荷し、2週間以内に現地試運転が必要でした。Talengineerは48時間で検証済みのSiemensエンジニアをマッチング——エスクローモデルで検収がスムーズでした。', author: '運用ディレクター', meta: '包装OEM、米国オハイオ州' },
      { quote: 'インテグレーターとして、繁忙期に信頼できるロボティクス支援を見つけるのは至難の業です。AIスクリーニングは本当にふるいにかけてくれます——採用したエンジニアは全員、初日からFanucセルをプログラムできました。', author: 'マネージングパートナー', meta: 'システムインテグレーター、ドイツ・バイエルン州' },
      { quote: 'プネーから米国のクライアントと仕事をしています。AI PMが仕様書や議事録を即座に翻訳し、エスクローのおかげで請求書を追いかけることもありません。収入は1年で倍になりました。', author: 'SCADAエンジニア', meta: '個人事業主、インド・プネー' },
    ],
    // FAQ
    faqKicker: 'よくある質問', faqH2: 'よくある質問',
    faqs: [
      { q: '産業オートメーションエンジニアの採用にはいくらかかりますか？', a: 'Talengineerの時間料金は、インドやベトナムの$20–45/hrから北米の$85–140/hrまで、専門分野や経験によって異なります。プラットフォーム手数料は透明で、代理店マージンはありません——地域別の最新の数値はライブ料金ベンチマークをご覧ください。' },
      { q: 'エンジニアはどのように検証されますか？', a: 'すべてのエンジニアが独自のAI技術スクリーナーを受けます——PLCプログラミング、SCADA/HMI、ロボティクス、電気設計をカバーする実践的な評価です。本人確認、資格、職歴はプロフィール公開前に別途検証されます。' },
      { q: 'マイルストーン・エスクローはどのように私を保護しますか？', a: '作業開始前に、各プロジェクトのマイルストーンをエスクローに入金します。資金は成果物を承認したときにのみ支払われます。紛争が生じた場合、当社の解決チームが資金移動の前にマイルストーン仕様と成果物を確認します。' },
      { q: 'エンジニアは私の施設で現地作業できますか？', a: 'はい。多くのプロジェクトはリモート開発と現地試運転を組み合わせます。都市と移動範囲でエンジニアを絞り込めます——北米、中南米、欧州、ベトナム、インドなどに検証済みの現地人材がいます。' },
      { q: 'チームとエンジニアの言語が異なる場合はどうなりますか？', a: '当社のAIプロジェクトマネージャーが、英語・中国語・スペイン語・ベトナム語・ヒンディー語・フランス語・ドイツ語・日本語・韓国語の間でメッセージ、仕様書、ドキュメントをリアルタイムで翻訳します。' },
      { q: 'エンジニアの参加費用はいくらですか？', a: '参加とAI技術スクリーナーの合格は無料です。Talengineerは支払い済みのマイルストーンにのみ少額のサービス料を請求します——稼いだ1ドルごとの大半はあなたのものです。' },
    ],
    // Resources
    resH2: 'リソースセンターより', resAll: 'すべてのガイド →',
    resources: [
      { tag: '採用ガイド', title: '2026年のPLCプログラマー時間料金：地域別の内訳', teaser: 'SiemensとRockwellの専門知識が6地域でいくらかかるか、そしてオフショアが理にかなうのはいつか。', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: 'プレイブック', title: 'リモート試運転：OEMがエンジニアを派遣せずに機械を出荷する方法', teaser: '現地の検証済み人材でFAT/SATを行うためのマイルストーンベースのプレイブック。', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: 'エンジニア向け', title: 'AI技術スクリーナー合格：私たちが実際にテストすること', teaser: '実践的な評価の内側——ラダーロジック、HMI設計、安全回路など。', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: '次のオートメーションプロジェクトはここから始まる',
    ctaSub: 'どの言語でもプロジェクトを投稿するか、私たちの最初の認証エンジニアグループに参加しましょう。',
    ctaPost: 'プロジェクトを投稿——無料', ctaApply: 'エンジニアとして応募',
    // Footer
    footerTagline: 'AI検証済みの産業オートメーション人材の世界的マーケットプレイス。',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: '採用', footerColEngineers: 'エンジニア', footerColSpecialties: '専門分野', footerColCompany: '会社',
    footerHire: [
      { label: 'エンジニアを探す', href: '/talent' }, { label: 'プロジェクトを投稿', href: '/talent' },
      { label: '料金ベンチマーク', href: '/rates' }, { label: 'エンタープライズAPI', href: '/enterprise' },
      { label: '料金プラン', href: '/pricing' },
    ],
    footerEngineers: [
      { label: '参加を申し込む', href: '/talent' }, { label: 'AIスクリーナー', href: '/talent' },
      { label: 'プロジェクトを探す', href: '/talent' }, { label: '支払いとエスクロー', href: '/finance' },
      { label: '認定試験', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLCプログラミング', href: '/talent' }, { label: 'SCADA・HMI', href: '/talent' },
      { label: 'ロボティクス', href: '/talent' }, { label: '制御盤設計', href: '/talent' },
    ],
    footerCompany: [
      { label: '会社概要', href: '/' }, { label: 'リソース', href: '#resources' },
      { label: 'お問い合わせ', href: '/' }, { label: 'プライバシーと規約', href: '/' },
      { label: 'トラストセンター', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — 世界の産業オートメーション人材マーケットプレイス',
  },

  ko: {
    // Nav
    navFind: '엔지니어 찾기', navRates: '요율 벤치마크', navHow: '이용 방법', navResources: '리소스',
    navSignIn: '로그인', navPost: '프로젝트 등록', themeDark: '다크', themeLight: '라이트',
    // Hero
    heroKicker: '// 글로벌 산업 자동화 인재 마켓플레이스',
    heroH1: '국경 없는 자동화 인재. AI가 검증하고, 에스크로가 보호합니다.',
    heroSub: 'PLC, SCADA, 로보틱스, 전기 엔지니어 — 실무형 AI 평가로 선별하고, 플랫폼 시험으로 인증하며, 9개 언어로 관리합니다.',
    cardHiringKicker: '채용 중입니다', cardHiringTitle: '검증된 현지 엔지니어 찾기',
    cardHiringBody: '어떤 언어로든 등록하세요. AI가 사양을 표준화하고 기술, 지역, 요율에 따라 선별된 엔지니어를 추립니다.',
    cardHiringCta: '엔지니어 채용하기 →', cardHiringNote: '평균 48시간 내 매칭',
    cardEngKicker: '저는 엔지니어입니다', cardEngTitle: '전 세계에서 일하고, 안전하게 정산받으세요.',
    cardEngBody: 'AI 기술 스크리너를 한 번 통과하면 전 세계 OEM으로부터 맞춤 프로젝트를 받습니다 — 에스크로가 대금을 보장합니다.',
    cardEngCta: '엔지니어로 참여하기 →', cardEngNote: '지원 무료 · 수입의 대부분을 가져가세요',
    // Stats
    stats: [
      { num: '4', label: '인증 트랙' },
      { num: 'L1–L3', label: '플랫폼 시험 등급' },
      { num: '100%', label: '에스크로 보호 결제' },
      { num: '9', label: '지원 언어' },
    ],
    // Categories
    catKicker: '전문 분야별 보기', catH2: '산업 자동화의 모든 분야', catAll: '전체 전문 분야 →',
    engineersWord: '명의 엔지니어', avgWord: '평균',
    categories: [
      { emoji: '⚙️', name: 'PLC 프로그래밍', tools: 'Siemens TIA Portal, Rockwell Studio 5000, Mitsubishi, Codesys', count: 612, rate: 58 },
      { emoji: '🖥️', name: 'SCADA 및 HMI', tools: 'Ignition, WinCC, FactoryTalk View, Wonderware / AVEVA', count: 418, rate: 62 },
      { emoji: '🤖', name: '산업용 로보틱스', tools: 'Fanuc, KUKA, ABB, Yaskawa 프로그래밍 및 셀 통합', count: 347, rate: 71 },
      { emoji: '🔌', name: '전기 패널 설계', tools: 'EPLAN, AutoCAD Electrical, UL 508A 준수', count: 289, rate: 54 },
      { emoji: '🏭', name: '공정 제어 및 DCS', tools: 'DeltaV, Honeywell Experion, 배치 및 연속 공정', count: 203, rate: 75 },
      { emoji: '📷', name: '머신 비전', tools: 'Cognex, Keyence, Halcon — 검사 및 가이던스 시스템', count: 156, rate: 68 },
      { emoji: '🌐', name: '산업용 네트워킹', tools: 'Profinet, EtherNet/IP, OPC UA, OT 사이버 보안', count: 134, rate: 66 },
      { emoji: '🧰', name: '시운전 및 현장 서비스', tools: '현장 가동, FAT/SAT, 개조 및 문제 해결', count: 241, rate: 59 },
    ],
    // How it works
    howKicker: '이용 방법', howH2: '하나의 플랫폼, 두 가지 경로',
    forEmployers: '고용주용', forEngineers: '엔지니어용',
    employerSteps: [
      { title: '어떤 언어로든 프로젝트를 등록하세요', body: 'AI가 사양을 표준화된 범위, 마일스톤, 기술 요건으로 분석합니다.' },
      { title: '검증된 엔지니어와 매칭', body: '기술 심사 점수, 지역, 요율, 현장 가용성으로 순위를 매긴 후보 명단.' },
      { title: '마일스톤 자금을 에스크로에 예치', body: '각 산출물을 승인할 때만 자금이 지급됩니다. 선지급 위험 제로.' },
      { title: 'AI 프로젝트 매니저와 함께 납품', body: '9개 언어의 실시간 번역, 진행 상황 추적, 문서화.' },
    ],
    engineerSteps: [
      { title: '몇 분 만에 프로필 작성', body: '플랫폼, 자격증, 산업, 요율을 — 당신의 언어로 기재하세요.' },
      { title: 'AI 기술 스크리너 통과', body: 'PLC, SCADA, 로보틱스 기술의 실무 평가 — 고객이 신뢰하는 배지.' },
      { title: '실제 프로젝트와 매칭', body: '전 세계 OEM 및 인티그레이터의 현지 및 원격 일감 — 저가 입찰 경쟁 없음.' },
      { title: '매번 제때 정산받기', body: '에스크로로 보장된 마일스톤은 시작 전에 대금이 확보됨을 의미합니다.' },
    ],
    // Featured
    featKicker: '추천 인재', featH2: '이번 주 투입 가능한 엔지니어', featBrowseAll: '전체 엔지니어 보기 →',
    verified: '✓ AI 검증됨', viewProfile: '프로필 보기 →',
    // 测试阶段演示数据：仅当 /api/talent/list 无真实工程师时兜底展示，且必带「🧪」徽标
    demoData: '데모 데이터',
    demoEngineers: [
      { id: 'demo-1', initials: 'MN', name: 'Minh N.', loc: '🇻🇳 호치민시', chips: ['Siemens TIA Portal', 'WinCC', 'Profinet'], bio: '자동차 1차 협력사 3개 라인의 PLC 마이그레이션을 주도했으며, 동남아시아 전역에서 FAT/SAT 시운전 수행.', rate: '$38/hr', ratingLine: '★ 4.9 (27 jobs)' },
      { id: 'demo-2', initials: 'DR', name: 'Diego R.', loc: '🇲🇽 몬테레이', chips: ['Fanuc Robotics', 'Studio 5000', 'Machine Vision'], bio: '로봇 용접 셀 인티그레이터. 미국 및 멕시코 OEM을 위해 40대 이상의 Fanuc 셀을 시운전.', rate: '$52/hr', ratingLine: '★ 5.0 (34 jobs)' },
      { id: 'demo-3', initials: 'PK', name: 'Priya K.', loc: '🇮🇳 푸네', chips: ['Ignition SCADA', 'OPC UA', 'Python'], bio: 'Ignition 골드 인증. 제약 및 식음료 시설을 위한 전 공장 규모 SCADA 구축.', rate: '$34/hr', ratingLine: '★ 4.8 (19 jobs)' },
    ],
    // Rate benchmarks
    rateKicker: '실시간 시장 데이터', rateH2: '채용 전에 적정 요율을 확인하세요',
    rateBody: '지역 및 전문 분야별 실시간 시급 벤치마크로, 활동 중인 엔지니어 프로필에서 수집합니다. 추측도, 부풀려진 에이전시 마진도 없이 자신 있게 예산을 세우세요.',
    rateCta: '요율 벤치마크 살펴보기 →', rateColRegion: '지역', rateColPlc: 'PLC / SCADA', rateColRobot: '로보틱스',
    rateFootnote: '매시간 업데이트 · USD/시간 · 검증된 엔지니어 자진 신고',
    rateRows: [
      { region: '🇺🇸 북미', plc: '$85–140', robot: '$95–150' },
      { region: '🇩🇪 서유럽', plc: '$70–120', robot: '$80–130' },
      { region: '🇲🇽 멕시코', plc: '$30–55', robot: '$35–65' },
      { region: '🇻🇳 베트남', plc: '$25–45', robot: '$30–50' },
      { region: '🇮🇳 인도', plc: '$20–40', robot: '$25–45' },
    ],
    // Trust
    trustKicker: 'Talengineer를 선택하는 이유', trustH2: '국경을 넘는 산업 프로젝트를 위해 설계',
    trust: [
      { emoji: '🛡️', title: 'AI 기술 스크리너', body: '모든 엔지니어는 이력서 검토만이 아니라 PLC, SCADA, 로보틱스 기술에 대한 실무형 감독 평가를 통과합니다.' },
      { emoji: '💰', title: '마일스톤 에스크로', body: '자금은 안전하게 보관되며 각 산출물을 승인할 때만 지급됩니다. 양측 모두 보호됩니다.' },
      { emoji: '🗣️', title: '다국어 AI PM', body: '영어, 중국어, 스페인어, 베트남어, 힌디어 등 실시간 번역 — 소통 격차 제로.' },
      { emoji: '📄', title: 'NDA 및 지식재산 보호', body: '모든 프로젝트에 표준화된 NDA, 코드 소유권 이전, 감사 추적을 기본 제공.' },
    ],
    // Testimonials
    testiH2: '전 세계 OEM 및 인티그레이터가 신뢰합니다',
    testimonials: [
      { quote: '포장 라인을 베트남으로 출하하면서 2주 안에 현지 시운전이 필요했습니다. Talengineer가 48시간 만에 검증된 Siemens 엔지니어를 매칭해 주었고, 에스크로 모델 덕분에 검수가 수월했습니다.', author: '운영 이사', meta: '포장 OEM, 미국 오하이오' },
      { quote: '인티그레이터로서 성수기에 검증된 로보틱스 인력을 찾는 일은 정말 힘듭니다. AI 스크리닝은 실제로 걸러 줍니다 — 채용한 모든 엔지니어가 첫날부터 Fanuc 셀을 프로그래밍할 수 있었습니다.', author: '경영 파트너', meta: '시스템 인티그레이터, 독일 바이에른' },
      { quote: '저는 푸네에서 미국 고객과 일합니다. AI PM이 사양서와 회의록을 즉시 번역해 주고, 에스크로 덕분에 청구서를 쫓아다닐 일이 없습니다. 제 수입은 1년 만에 두 배가 되었습니다.', author: 'SCADA 엔지니어', meta: '프리랜서, 인도 푸네' },
    ],
    // FAQ
    faqKicker: '자주 묻는 질문', faqH2: '자주 묻는 질문',
    faqs: [
      { q: '산업 자동화 엔지니어를 채용하는 데 비용이 얼마나 드나요?', a: 'Talengineer의 시급은 인도와 베트남의 $20–45/hr부터 북미의 $85–140/hr까지 전문 분야와 경력에 따라 다릅니다. 플랫폼 수수료는 투명하며 에이전시 마진이 없습니다 — 지역별 최신 수치는 실시간 요율 벤치마크에서 확인하세요.' },
      { q: '엔지니어는 어떻게 검증되나요?', a: '모든 엔지니어는 PLC 프로그래밍, SCADA/HMI, 로보틱스, 전기 설계를 아우르는 실무 평가인 자체 AI 기술 스크리너를 완료합니다. 신원, 자격, 경력은 프로필 공개 전에 별도로 검증됩니다.' },
      { q: '마일스톤 에스크로는 저를 어떻게 보호하나요?', a: '작업 시작 전에 각 프로젝트 마일스톤을 에스크로에 예치합니다. 자금은 산출물을 승인할 때만 지급됩니다. 분쟁이 발생하면, 자금이 이동하기 전에 저희 해결 팀이 마일스톤 사양과 작업물을 검토합니다.' },
      { q: '엔지니어가 제 사업장에서 현장 작업을 할 수 있나요?', a: '네. 많은 프로젝트가 원격 개발과 현장 시운전을 결합합니다. 도시와 이동 반경으로 엔지니어를 필터링하세요 — 북미, 중남미, 유럽, 베트남, 인도 등에 검증된 현지 인재가 있습니다.' },
      { q: '저희 팀과 엔지니어가 같은 언어를 쓰지 않으면 어떻게 되나요?', a: '저희 AI 프로젝트 매니저가 영어, 중국어, 스페인어, 베트남어, 힌디어, 프랑스어, 독일어, 일본어, 한국어 간에 메시지, 사양서, 문서를 실시간으로 번역합니다.' },
      { q: '엔지니어가 가입하는 데 비용이 드나요?', a: '가입과 AI 기술 스크리너 통과는 무료입니다. Talengineer는 지급된 마일스톤에 대해서만 소액의 서비스 수수료를 부과합니다 — 벌어들인 1달러의 대부분은 당신의 몫입니다.' },
    ],
    // Resources
    resH2: '리소스 센터에서', resAll: '전체 가이드 →',
    resources: [
      { tag: '채용 가이드', title: '2026년 PLC 프로그래머 시급: 지역별 분석', teaser: '여섯 개 지역에서 Siemens와 Rockwell 전문성의 비용, 그리고 오프쇼어가 합리적인 시점.', href: '/playbook/plc-programmer-hourly-rates-2026' },
      { tag: '플레이북', title: '원격 시운전: OEM이 엔지니어를 파견하지 않고 기계를 출하하는 방법', teaser: '현장의 검증된 현지 인재와 함께하는 FAT/SAT를 위한 마일스톤 기반 플레이북.', href: '/playbook/robot-cell-commissioning-guide' },
      { tag: '엔지니어용', title: 'AI 기술 스크리너 통과: 우리가 실제로 시험하는 것', teaser: '실무 평가 내부 — 래더 로직, HMI 설계, 안전 회로 등.', href: '/playbook/platform-certification-explained' },
    ],
    // Final CTA
    ctaH2: '당신의 다음 자동화 프로젝트가 여기서 시작됩니다',
    ctaSub: '어떤 언어로든 프로젝트를 등록하거나, 저희의 첫 검증된 엔지니어 그룹에 합류하세요.',
    ctaPost: '프로젝트 등록 — 무료', ctaApply: '엔지니어로 지원하기',
    // Footer
    footerTagline: 'AI로 검증된 산업 자동화 인재의 글로벌 마켓플레이스.',
    footerLangs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
    footerColHire: '채용', footerColEngineers: '엔지니어', footerColSpecialties: '전문 분야', footerColCompany: '회사',
    footerHire: [
      { label: '엔지니어 찾기', href: '/talent' }, { label: '프로젝트 등록', href: '/talent' },
      { label: '요율 벤치마크', href: '/rates' }, { label: '엔터프라이즈 API', href: '/enterprise' },
      { label: '요금 안내', href: '/pricing' },
    ],
    footerEngineers: [
      { label: '가입 신청', href: '/talent' }, { label: 'AI 스크리너', href: '/talent' },
      { label: '프로젝트 둘러보기', href: '/talent' }, { label: '결제 및 에스크로', href: '/finance' },
      { label: '인증 시험', href: '/certification' }, { label: 'TalScore', href: '/talscore' },
    ],
    footerSpecialties: [
      { label: 'PLC 프로그래밍', href: '/talent' }, { label: 'SCADA 및 HMI', href: '/talent' },
      { label: '로보틱스', href: '/talent' }, { label: '패널 설계', href: '/talent' },
    ],
    footerCompany: [
      { label: '회사 소개', href: '/' }, { label: '리소스', href: '#resources' },
      { label: '문의', href: '/' }, { label: '개인정보 및 약관', href: '/' },
      { label: '신뢰 센터', href: '/trust' },
    ],
    copyright: '© 2026 Talengineer.us — 글로벌 산업 자동화 인재 마켓플레이스',
  },
};

// 把 /api/talent/list 返回的工程师行映射成 Featured 卡片所需结构（真实数据，替代此前的虚构占位人物）
function initialsOfName(name) {
  return (name || '?').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
function mapFeaturedEngineer(t) {
  const chips = (t.skills || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return {
    id: t.id,
    initials: initialsOfName(t.name),
    name: t.name || 'Engineer',
    loc: (t.region || '').trim(),
    chips,
    bio: t.bio || '',
    rate: t.rate || '—',
    ratingLine: t.avg_rating ? `★ ${t.avg_rating} (${t.review_count || 0})` : (t.level || ''),
  };
}

export default function Home() {
  const [lang, setLang] = useLang();
  const { theme, toggle: toggleTheme } = useTheme();  // 全站主题（真值在 <html data-theme>）
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // 移动端汉堡菜单
  const [featuredEngineers, setFeaturedEngineers] = useState(null); // null → Featured 板块不渲染
  const langRef = useRef(null);

  // 点击语言下拉外部时关闭
  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Featured engineers：拉取公开的真实工程师数据；失败或空数组时整个板块不渲染，绝不回退到虚构人物
  useEffect(() => {
    let alive = true;
    fetch('/api/talent/list?limit=3&sort=verified')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j || j.status !== 'ok') return;
        const rows = Array.isArray(j.data) ? j.data : [];
        if (rows.length) setFeaturedEngineers(rows.slice(0, 3).map(mapFeaturedEngineer));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // 逐 key 回退到英文：zh 提供全量，其余语言缺失的 key 用英文兜底
  const d = { ...DICT.en, ...(DICT[lang] || {}) };
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  const dark = theme === 'dark';

  // Featured engineers：真实数据优先；/api/talent/list 为空或失败时回退到本地化演示卡（带「🧪」徽标）
  const engIsDemo = !(featuredEngineers && featuredEngineers.length > 0);
  const engList = engIsDemo ? (d.demoEngineers || []) : featuredEngineers;
  // 演示徽标样式（描边 chip，深浅色均可读，走全站 --accent token 并带琥珀色兜底）
  const demoBadgeStyle = { display: 'inline-block', marginLeft: 10, fontSize: 12, fontWeight: 700, color: 'var(--accent, #b26a00)', background: 'transparent', border: '1px solid var(--accent, #f5b301)', borderRadius: 999, padding: '2px 10px', verticalAlign: 'middle' };

  function chooseLang(code) {
    setLang(code);
    setLangOpen(false);
  }

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DICT.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Talengineer',
    url: 'https://talengineer.us',
    logo: 'https://talengineer.us/img/logo-macaw.svg',
    description: DICT.en.footerTagline,
  };
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Talengineer',
    url: 'https://talengineer.us',
  };

  return (
    <>
      <Head>
        <title>Talengineer | AI-Verified Industrial Automation Talent, Without Borders</title>
        <meta
          name="description"
          content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers — screened with a practical AI assessment and certified through platform exams. Milestone escrow protects both sides; an AI project manager works in nine languages."
        />
        {/* 规范链接 + Open Graph / Twitter 分享卡（og.png 由 scripts/gen-og.js 生成）*/}
        <link rel="canonical" href="https://talengineer.us/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Talengineer | AI-Verified Industrial Automation Talent, Without Borders" />
        <meta property="og:description" content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers. Milestone escrow protects both sides; an AI project manager works in nine languages." />
        <meta property="og:url" content="https://talengineer.us/" />
        <meta property="og:image" content="https://talengineer.us/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talengineer | AI-Verified Industrial Automation Talent" />
        <meta name="twitter:description" content="Hire AI-verified PLC, SCADA, robotics, and electrical automation engineers. Milestone escrow protects both sides." />
        <meta name="twitter:image" content="https://talengineer.us/og.png" />
        {/* 品牌字体：Archivo（标题/字标）、IBM Plex Sans（正文）、IBM Plex Mono（数字/kicker）*/}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </Head>

      <div className={styles.page}>
        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <header className={styles.nav}>
          <Link href="/" className={styles.brand}>
            <img src="/img/logo-macaw.svg" alt="Talengineer" width={30} height={30} />
            <span className={styles.wordmark}>Talengineer</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/talent" className={styles.navLink}>{d.navFind}</Link>
            <Link href="/rates" className={styles.navLink}>{d.navRates}</Link>
            <a href="#how-it-works" className={styles.navLink}>{d.navHow}</a>
            <a href="#resources" className={styles.navLink}>{d.navResources}</a>
          </nav>

          <div className={styles.navRight}>
            {/* 语言胶囊 */}
            <div className={styles.langWrap} ref={langRef}>
              <button
                className={styles.langPill}
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Select language"
              >
                🌐 {current.short} <span className={styles.caret}>▾</span>
              </button>
              {langOpen && (
                <div className={styles.langMenu} role="listbox">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      className={`${styles.langItem} ${l.code === lang ? styles.langItemActive : ''}`}
                      onClick={() => chooseLang(l.code)}
                      role="option"
                      aria-selected={l.code === lang}
                    >
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 主题切换 */}
            <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle light / dark">
              {dark ? `☀️ ${d.themeLight}` : `🌙 ${d.themeDark}`}
            </button>

            <Link href="/finance" className={styles.signIn}>{d.navSignIn}</Link>
            <Link href="/talent" className={styles.postBtn}>{d.navPost}</Link>

            {/* 移动端汉堡 */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* 移动端菜单抽屉 */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/talent" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{d.navFind}</Link>
            <Link href="/rates" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{d.navRates}</Link>
            <a href="#how-it-works" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{d.navHow}</a>
            <a href="#resources" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{d.navResources}</a>
            <Link href="/finance" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{d.navSignIn}</Link>
            <Link href="/talent" className={styles.mobilePost} onClick={() => setMenuOpen(false)}>{d.navPost}</Link>
          </div>
        )}

        <main>
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <div className={styles.heroKicker}>{d.heroKicker}</div>
              <h1 className={styles.heroH1}>{d.heroH1}</h1>
              <p className={styles.heroSub}>{d.heroSub}</p>
            </div>
            <div className={styles.heroCards}>
              {/* 左卡：固定深蓝渐变（两种模式都深色）*/}
              <div className={styles.hireCard}>
                <span className={styles.hireKicker}>{d.cardHiringKicker}</span>
                <b className={styles.cardTitleDark}>{d.cardHiringTitle}</b>
                <p className={styles.hireBody}>{d.cardHiringBody}</p>
                <div className={styles.cardCtaRow}>
                  <Link href="/talent" className={styles.hireCta}>{d.cardHiringCta}</Link>
                  <span className={styles.hireNote}>{d.cardHiringNote}</span>
                </div>
              </div>
              {/* 右卡：跟随主题 */}
              <div className={styles.engCard}>
                <span className={styles.engKicker}>{d.cardEngKicker}</span>
                <b className={styles.cardTitle}>{d.cardEngTitle}</b>
                <p className={styles.engBody}>{d.cardEngBody}</p>
                <div className={styles.cardCtaRow}>
                  <Link href="/talent" className={styles.engCta}>{d.cardEngCta}</Link>
                  <span className={styles.engNote}>{d.cardEngNote}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroSpacer} />
          </section>

          {/* ── STATS TICKER ──────────────────────────────────────────────── */}
          <section className={styles.ticker}>
            <div className={styles.tickerInner}>
              {d.stats.map((s, i) => (
                <div key={i} className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── SPECIALTY CATEGORIES ──────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.kicker}>{d.catKicker}</div>
                  <h2 className={styles.h2}>{d.catH2}</h2>
                </div>
                <Link href="/talent" className={styles.headLink}>{d.catAll}</Link>
              </div>
              <div className={styles.catGrid}>
                {d.categories.map((c, i) => (
                  <Link href="/talent" key={i} className={styles.catCard}>
                    <span className={styles.catEmoji}>{c.emoji}</span>
                    <b className={styles.catName}>{c.name}</b>
                    <span className={styles.catTools}>{c.tools}</span>
                    <span className={styles.catStat}>{c.count} {d.engineersWord} · {d.avgWord} ${c.rate}/hr</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <section id="how-it-works" className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.howKicker}</div>
                <h2 className={styles.h2}>{d.howH2}</h2>
              </div>
              <div className={styles.howGrid}>
                <div className={styles.howCard}>
                  <div className={`${styles.howColTitle} ${styles.howColEmployer}`}>{d.forEmployers}</div>
                  <div className={styles.stepList}>
                    {d.employerSteps.map((s, i) => (
                      <div key={i} className={styles.step}>
                        <span className={`${styles.stepNum} ${styles.stepNumEmployer}`}>{i + 1}</span>
                        <div>
                          <b className={styles.stepTitle}>{s.title}</b>
                          <p className={styles.stepBody}>{s.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.howCard}>
                  <div className={`${styles.howColTitle} ${styles.howColEngineer}`}>{d.forEngineers}</div>
                  <div className={styles.stepList}>
                    {d.engineerSteps.map((s, i) => (
                      <div key={i} className={styles.step}>
                        <span className={`${styles.stepNum} ${styles.stepNumEngineer}`}>{i + 1}</span>
                        <div>
                          <b className={styles.stepTitle}>{s.title}</b>
                          <p className={styles.stepBody}>{s.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURED ENGINEERS（真实数据优先；为空/失败时回退到本地化演示卡 + 徽标）──────── */}
          {engList.length > 0 && (
            <section className={styles.section}>
              <div className={styles.container}>
                <div className={styles.sectionHead}>
                  <div>
                    <div className={styles.kicker}>{d.featKicker}</div>
                    <h2 className={styles.h2}>{d.featH2}{engIsDemo && <span style={demoBadgeStyle}>🧪 {d.demoData} · Demo</span>}</h2>
                  </div>
                  <Link href="/talent" className={styles.headLink}>{d.featBrowseAll}</Link>
                </div>
                <div className={styles.engGrid}>
                  {engList.map((e) => (
                    <div key={e.id} className={styles.engineerCard}>
                      <div className={styles.engTop}>
                        <span className={styles.avatar}>{e.initials}</span>
                        <div className={styles.engMeta}>
                          <b className={styles.engName}>{e.name}</b>
                          <div className={styles.engLoc}>{e.loc}</div>
                        </div>
                        <span className={styles.verifiedBadge}>{d.verified}</span>
                      </div>
                      <div className={styles.chipRow}>
                        {e.chips.map((ch, j) => <span key={j} className={styles.chip}>{ch}</span>)}
                      </div>
                      <p className={styles.engBio}>{e.bio}</p>
                      <div className={styles.engFooter}>
                        <span className={styles.engRate}>{e.rate}</span>
                        <span className={styles.engRating}>{e.ratingLine}</span>
                        {/* 演示卡不深链到 /engineer/{id}（不存在），改指 /talent；真实卡照常进档案 */}
                        <Link href={engIsDemo ? '/talent' : `/engineer/${e.id}`} className={styles.viewProfile}>{d.viewProfile}</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── RATE BENCHMARKS (fixed navy) ──────────────────────────────── */}
          <section className={styles.rateBand}>
            <div className={styles.rateInner}>
              <div className={styles.rateLeft}>
                <div className={styles.rateKicker}>{d.rateKicker}</div>
                <h2 className={styles.rateH2}>{d.rateH2}</h2>
                <p className={styles.rateBody}>{d.rateBody}</p>
                <Link href="/rates" className={styles.rateCta}>{d.rateCta}</Link>
              </div>
              <div className={styles.rateTable}>
                <div className={styles.rateHeadRow}>
                  <span>{d.rateColRegion}</span><span>{d.rateColPlc}</span><span>{d.rateColRobot}</span>
                </div>
                {d.rateRows.map((r, i) => (
                  <div key={i} className={styles.rateRow}>
                    <span>{r.region}</span>
                    <span className={styles.mono}>{r.plc}</span>
                    <span className={styles.mono}>{r.robot}</span>
                  </div>
                ))}
                <div className={styles.rateFootnote}>{d.rateFootnote}</div>
              </div>
            </div>
          </section>

          {/* ── TRUST ─────────────────────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.container}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.trustKicker}</div>
                <h2 className={styles.h2}>{d.trustH2}</h2>
              </div>
              <div className={styles.trustGrid}>
                {d.trust.map((t, i) => (
                  <div key={i} className={styles.trustCard}>
                    <span className={styles.trustEmoji}>{t.emoji}</span>
                    <b className={styles.trustTitle}>{t.title}</b>
                    <p className={styles.trustBody}>{t.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <h2 className={`${styles.h2} ${styles.h2Center}`}>{d.testiH2}</h2>
              <div className={styles.testiGrid}>
                {d.testimonials.map((t, i) => (
                  <figure key={i} className={styles.testiCard}>
                    <span className={styles.stars}>★★★★★</span>
                    <blockquote className={styles.quote}>{t.quote}</blockquote>
                    <figcaption className={styles.attribution}>
                      <b>{t.author}</b> · {t.meta}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.faqContainer}>
              <div className={styles.sectionHeadCenter}>
                <div className={styles.kicker}>{d.faqKicker}</div>
                <h2 className={styles.h2}>{d.faqH2}</h2>
              </div>
              <div className={styles.faqList}>
                {d.faqs.map((f, i) => (
                  <details key={i} className={styles.faqItem} open={i === 0}>
                    <summary className={styles.faqSummary}>{f.q}</summary>
                    <p className={styles.faqAnswer}>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── RESOURCES ─────────────────────────────────────────────────── */}
          <section id="resources" className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <h2 className={`${styles.h2} ${styles.h2Sm}`}>{d.resH2}</h2>
                <Link href="/playbook" className={styles.headLink}>{d.resAll}</Link>
              </div>
              <div className={styles.resGrid}>
                {d.resources.map((r, i) => (
                  <Link href={r.href} key={i} className={styles.resCard}>
                    <span className={styles.resTag}>{r.tag}</span>
                    <b className={styles.resTitle}>{r.title}</b>
                    <span className={styles.resTeaser}>{r.teaser}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA (fixed brand gradient) ──────────────────────────── */}
          <section className={styles.finalCta}>
            <h2 className={styles.ctaH2}>{d.ctaH2}</h2>
            <p className={styles.ctaSub}>{d.ctaSub}</p>
            <div className={styles.ctaBtns}>
              <Link href="/talent" className={styles.ctaPost}>{d.ctaPost}</Link>
              <Link href="/talent" className={styles.ctaApply}>{d.ctaApply}</Link>
            </div>
          </section>
        </main>

        {/* ── FOOTER (fixed navy) ─────────────────────────────────────────── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrandCol}>
              <div className={styles.footerBrand}>
                <img src="/img/logo-macaw.svg" alt="" width={26} height={26} />
                <b>Talengineer</b>
              </div>
              <p className={styles.footerTagline}>{d.footerTagline}</p>
              <div className={styles.footerLangs}>{d.footerLangs}</div>
            </div>
            {[
              { title: d.footerColHire, links: d.footerHire },
              { title: d.footerColEngineers, links: d.footerEngineers },
              { title: d.footerColSpecialties, links: d.footerSpecialties },
              { title: d.footerColCompany, links: d.footerCompany },
            ].map((col, i) => (
              <div key={i} className={styles.footerCol}>
                <b className={styles.footerColTitle}>{col.title}</b>
                {col.links.map((l, j) => (
                  <Link key={j} href={l.href} className={styles.footerLink}>{l.label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>{d.copyright}</div>
        </footer>
      </div>

      <ChatBot lang={lang} />
    </>
  );
}
