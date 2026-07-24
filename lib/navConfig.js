// 全站导航 + 页脚的单一配置源（Single Source of Truth）。
//
// 为什么要有这个文件：
// - 此前导航（components/Navbar.jsx）和页脚（首页内联 + 各页手写简版）各自维护链接，
//   label/href 会漂移（比如首页页脚 About/Contact/Privacy 曾是指向 '/' 的死链）。
// - 现在导航 MENU 和页脚 FOOTER_COLUMNS 都引用同一个 LINKS 注册表里的链接对象：
//   同一个链接在任何位置的文案与落点永远一致，分组（菜单结构/页脚列）各自独立。
// - 9 种语言的 label 全部集中在这里，翻译只改一个文件，完整性测试也只测一个文件。
//
// 为什么用 CommonJS（module.exports）而不是 ESM：
// - tests/ 目录用 node --test 直接 require 本文件做完整性断言（零死链、9 语齐全），
//   Node 原生 test runner 对 CJS 零配置；Next.js 的 webpack 对 CJS 也有互操作，
//   页面里 `import { MENU } from '../lib/navConfig'` 照常可用。
// - 因此本文件不允许 import React / next 任何东西——纯数据 + 纯函数。

// ── L9：九语 label 构造器 ────────────────────────────────────────────────
// 按站点固定语言顺序（en/zh/es/vi/hi/fr/de/ja/ko）收参数，返回 label 对象。
// 为什么用位置参数而不是对象字面量：强迫书写时九种语言一个都不能漏，
// 漏了参数就是 undefined，完整性测试会立刻抓出来。
function L9(en, zh, es, vi, hi, fr, de, ja, ko) {
  return { en, zh, es, vi, hi, fr, de, ja, ko };
}

// ── t：取某语言的 label 文案 ─────────────────────────────────────────────
// SSR 首帧规则：lang 未知/缺失时回退英文（与全站 `|| en` 约定一致）。
function t(labelObj, lang) {
  if (!labelObj) return '';
  return labelObj[lang] || labelObj.en || '';
}

// ── LINKS：全站链接注册表 ────────────────────────────────────────────────
// 每个链接 = { key, href, label }，key 全局唯一（完整性测试断言唯一性）。
// 菜单与页脚都从这里取对象引用——不允许在 MENU / FOOTER_COLUMNS 里手写 href。
// 九语翻译来源：pages/index.jsx 首页页脚 DICT（既有翻译原样移植）+
// 新页面链接（how-it-works/about/contact 等）按同一语气补齐。
const LINKS = {
  // —— 雇主侧 ——
  findEngineers: {
    key: 'findEngineers',
    href: '/talent',
    label: L9('Find Engineers', '寻找工程师', 'Buscar ingenieros', 'Tìm kỹ sư', 'इंजीनियर खोजें', 'Trouver des ingénieurs', 'Ingenieure finden', 'エンジニアを探す', '엔지니어 찾기'),
  },
  postProject: {
    key: 'postProject',
    href: '/talent',
    label: L9('Post a Project', '发布项目', 'Publicar un proyecto', 'Đăng dự án', 'प्रोजेक्ट पोस्ट करें', 'Publier un projet', 'Projekt ausschreiben', 'プロジェクトを投稿', '프로젝트 등록'),
  },
  howItWorks: {
    key: 'howItWorks',
    href: '/how-it-works',
    label: L9('How It Works', '运作方式', 'Cómo funciona', 'Cách hoạt động', 'यह कैसे काम करता है', 'Comment ça marche', 'So funktioniert es', '仕組み', '이용 방법'),
  },
  rateBenchmarks: {
    key: 'rateBenchmarks',
    href: '/rates',
    label: L9('Rate Benchmarks', '费率基准', 'Referencias de tarifas', 'Chuẩn mức phí', 'दर मानक', 'Références de tarifs', 'Tarif-Benchmarks', '料金ベンチマーク', '요율 벤치마크'),
  },
  costCalculator: {
    key: 'costCalculator',
    href: '/calculator',
    label: L9('Cost Calculator', '成本计算器', 'Calculadora de costos', 'Máy tính chi phí', 'लागत कैलकुलेटर', 'Calculateur de coûts', 'Kostenrechner', 'コスト計算ツール', '비용 계산기'),
  },
  coverageMap: {
    key: 'coverageMap',
    href: '/coverage',
    label: L9('Coverage Map', '覆盖地图', 'Mapa de cobertura', 'Bản đồ phủ sóng', 'कवरेज मैप', 'Carte de couverture', 'Abdeckungskarte', 'カバレッジマップ', '커버리지 맵'),
  },
  enterprise: {
    key: 'enterprise',
    href: '/enterprise',
    label: L9('Enterprise', '企业版', 'Empresas', 'Doanh nghiệp', 'एंटरप्राइज़', 'Entreprise', 'Enterprise', 'エンタープライズ', '엔터프라이즈'),
  },
  developerApi: {
    key: 'developerApi',
    href: '/developers',
    label: L9('Developer API', '开发者 API', 'API para desarrolladores', 'API nhà phát triển', 'डेवलपर API', 'API développeur', 'Entwickler-API', '開発者 API', '개발자 API'),
  },
  pricing: {
    key: 'pricing',
    href: '/pricing',
    label: L9('Pricing', '定价', 'Precios', 'Bảng giá', 'मूल्य निर्धारण', 'Tarifs', 'Preise', '料金プラン', '요금 안내'),
  },

  // —— 工程师侧 ——
  applyToJoin: {
    key: 'applyToJoin',
    href: '/talent',
    label: L9('Apply to Join', '申请加入', 'Postularse', 'Ứng tuyển gia nhập', 'जुड़ने के लिए आवेदन करें', 'Postuler', 'Jetzt bewerben', '参加を申し込む', '가입 신청'),
  },
  aiScreener: {
    key: 'aiScreener',
    href: '/talent',
    label: L9('AI Screener', 'AI 筛选', 'Evaluador de IA', 'Sàng lọc AI', 'AI स्क्रीनर', 'Évaluateur IA', 'KI-Test', 'AIスクリーナー', 'AI 스크리너'),
  },
  certificationExams: {
    key: 'certificationExams',
    href: '/certification',
    label: L9('Certification Exams', '认证考试', 'Exámenes de certificación', 'Thi chứng chỉ', 'प्रमाणन परीक्षाएँ', 'Examens de certification', 'Zertifizierungsprüfungen', '認定試験', '인증 시험'),
  },
  trainingCenter: {
    key: 'trainingCenter',
    href: '/training',
    label: L9('Training Center', '培训中心', 'Centro de formación', 'Trung tâm đào tạo', 'प्रशिक्षण केंद्र', 'Centre de formation', 'Trainingscenter', 'トレーニングセンター', '교육 센터'),
  },
  talscore: {
    key: 'talscore',
    href: '/talscore',
    // TalScore 是品牌名，各语言保留原文；中文沿用首页页脚既有的「TalScore 质量分」。
    label: L9('TalScore', 'TalScore 质量分', 'TalScore', 'TalScore', 'TalScore', 'TalScore', 'TalScore', 'TalScore', 'TalScore'),
  },
  // 注意：Payments & Escrow 落点从 /finance 改为 /trust（方案裁定）——
  // /finance 是登录/财务工具页，对「想了解托管机制」的访客，/trust 信任中心才是正确落点。
  paymentsEscrow: {
    key: 'paymentsEscrow',
    href: '/trust',
    label: L9('Payments & Escrow', '支付与托管', 'Pagos y depósito de garantía', 'Thanh toán & Ký quỹ', 'भुगतान और एस्क्रो', 'Paiements et séquestre', 'Zahlungen & Treuhand', '支払いとエスクロー', '결제 및 에스크로'),
  },
  referral: {
    key: 'referral',
    href: '/referral',
    label: L9('Referral Program', '推荐计划', 'Programa de referidos', 'Chương trình giới thiệu', 'रेफ़रल प्रोग्राम', 'Programme de parrainage', 'Empfehlungsprogramm', '紹介プログラム', '추천 프로그램'),
  },

  // —— 专业方向（Specialties）——
  plc: {
    key: 'plc',
    href: '/hire/plc',
    label: L9('PLC Programming', 'PLC 编程', 'Programación de PLC', 'Lập trình PLC', 'PLC प्रोग्रामिंग', 'Programmation PLC', 'PLC-Programmierung', 'PLCプログラミング', 'PLC 프로그래밍'),
  },
  robotics: {
    key: 'robotics',
    href: '/hire/robotics',
    label: L9('Robotics', '机器人', 'Robótica', 'Robot', 'रोबोटिक्स', 'Robotique', 'Robotik', 'ロボティクス', '로보틱스'),
  },
  vision: {
    key: 'vision',
    href: '/hire/vision',
    label: L9('Machine Vision', '机器视觉', 'Visión artificial', 'Thị giác máy', 'मशीन विज़न', 'Vision industrielle', 'Bildverarbeitung', 'マシンビジョン', '머신 비전'),
  },
  electrical: {
    key: 'electrical',
    href: '/hire/electrical',
    // 电气方向页覆盖电柜设计/驱动/配电，label 沿用页脚既有的「电柜设计」口径（Panel Design 系）。
    label: L9('Electrical & Panel Design', '电气与电柜设计', 'Eléctrica y tableros', 'Điện & tủ điện', 'इलेक्ट्रिकल और पैनल डिज़ाइन', 'Électricité et armoires', 'Elektrik & Schaltschrankbau', '電気・制御盤設計', '전기 및 패널 설계'),
  },
  browseByIndustry: {
    key: 'browseByIndustry',
    href: '/hire',
    label: L9('Browse by Industry', '按行业浏览', 'Explorar por industria', 'Duyệt theo ngành', 'उद्योग के अनुसार ब्राउज़ करें', 'Parcourir par industrie', 'Nach Branche durchsuchen', '業界から探す', '산업별 탐색'),
  },
  hireByRole: {
    key: 'hireByRole',
    href: '/occupations',
    label: L9('Hire by Role Title', '按职位招聘', 'Contratar por puesto', 'Tuyển theo chức danh', 'पद के अनुसार नियुक्ति', 'Recruter par intitulé de poste', 'Nach Jobtitel einstellen', '職種名から採用', '직무별 채용'),
  },
  // 页脚 Specialties 列末尾的「全部职位」入口——与 hireByRole 同落点、不同文案，
  // 因此各自独立注册（key 不同、label 不同、href 相同是允许的）。
  allRoles: {
    key: 'allRoles',
    href: '/occupations',
    label: L9('All Roles', '全部职位', 'Todos los puestos', 'Tất cả chức danh', 'सभी भूमिकाएँ', 'Tous les postes', 'Alle Rollen', 'すべての職種', '모든 직무'),
  },

  // —— 资源中心 ——
  allResources: {
    key: 'allResources',
    href: '/resources',
    label: L9('All Resources', '全部资源', 'Todos los recursos', 'Tất cả tài nguyên', 'सभी संसाधन', 'Toutes les ressources', 'Alle Ressourcen', 'すべてのリソース', '모든 리소스'),
  },
  playbook: {
    key: 'playbook',
    href: '/playbook',
    label: L9('Playbook', '实操手册', 'Playbook', 'Cẩm nang', 'प्लेबुक', 'Playbook', 'Playbook', 'プレイブック', '플레이북'),
  },
  caseStudies: {
    key: 'caseStudies',
    href: '/case-studies',
    label: L9('Case Studies', '客户案例', 'Casos de éxito', 'Nghiên cứu điển hình', 'केस स्टडी', 'Études de cas', 'Fallstudien', '導入事例', '사례 연구'),
  },
  guideMexico: {
    key: 'guideMexico',
    href: '/guides/mexico',
    label: L9('Mexico', '墨西哥', 'México', 'Mexico', 'मेक्सिको', 'Mexique', 'Mexiko', 'メキシコ', '멕시코'),
  },
  guideVietnam: {
    key: 'guideVietnam',
    href: '/guides/vietnam',
    label: L9('Vietnam', '越南', 'Vietnam', 'Việt Nam', 'वियतनाम', 'Vietnam', 'Vietnam', 'ベトナム', '베트남'),
  },
  guideThailand: {
    key: 'guideThailand',
    href: '/guides/thailand',
    label: L9('Thailand', '泰国', 'Tailandia', 'Thái Lan', 'थाईलैंड', 'Thaïlande', 'Thailand', 'タイ', '태국'),
  },

  // —— 公司 ——
  about: {
    key: 'about',
    href: '/about',
    label: L9('About', '关于我们', 'Acerca de', 'Giới thiệu', 'हमारे बारे में', 'À propos', 'Über uns', '会社概要', '회사 소개'),
  },
  trustCenter: {
    key: 'trustCenter',
    href: '/trust',
    label: L9('Trust Center', '信任中心', 'Centro de confianza', 'Trung tâm tin cậy', 'ट्रस्ट सेंटर', 'Centre de confiance', 'Trust Center', 'トラストセンター', '신뢰 센터'),
  },
  contact: {
    key: 'contact',
    href: '/contact',
    label: L9('Contact', '联系我们', 'Contacto', 'Liên hệ', 'संपर्क', 'Contact', 'Kontakt', 'お問い合わせ', '문의'),
  },
  // 隐私与条款：立即指向 /privacy 诚实草稿页（带「待法务审」横幅），好过死链（方案裁定）。
  privacyTerms: {
    key: 'privacyTerms',
    href: '/privacy',
    label: L9('Privacy & Terms', '隐私与条款', 'Privacidad y términos', 'Quyền riêng tư & Điều khoản', 'गोपनीयता और शर्तें', 'Confidentialité et conditions', 'Datenschutz & AGB', 'プライバシーと規約', '개인정보 및 약관'),
  },
};

// ── MENU：顶部导航结构（5 个下拉 + 1 个扁平链接）────────────────────────
// 结构约定：
// - 下拉项：{ key, label, items: [LINKS.x, ...] }
// - 扁平项：{ key, label, link: LINKS.x }（有 link 无 items 即为扁平）
// 分组与顺序照 Field Nation 式「买卖双边分流对称结构」（方案 §A1 定稿，逐项对应）。
const MENU = [
  {
    key: 'hire',
    label: L9('Hire Engineers', '招聘工程师', 'Contratar ingenieros', 'Tuyển kỹ sư', 'इंजीनियर नियुक्त करें', 'Recruter des ingénieurs', 'Ingenieure einstellen', 'エンジニアを採用', '엔지니어 채용'),
    items: [
      LINKS.findEngineers,
      LINKS.postProject,
      // 裁定：How It Works 直接指向新独立页 /how-it-works，不再用首页锚点。
      LINKS.howItWorks,
      LINKS.rateBenchmarks,
      LINKS.costCalculator,
      LINKS.coverageMap,
      LINKS.enterprise,
      LINKS.developerApi,
    ],
  },
  {
    key: 'engineers',
    label: L9('For Engineers', '工程师入驻', 'Para ingenieros', 'Dành cho kỹ sư', 'इंजीनियरों के लिए', 'Pour les ingénieurs', 'Für Ingenieure', 'エンジニアの方へ', '엔지니어용'),
    items: [
      LINKS.applyToJoin,
      LINKS.certificationExams,
      LINKS.trainingCenter,
      LINKS.talscore,
      LINKS.rateBenchmarks, // 与雇主侧共享同一链接对象——文案/落点永不漂移
      LINKS.referral,
    ],
  },
  {
    // 裁定：命名用 Specialties（专业方向），避免与 /occupations（职位）路由语义撞车。
    key: 'specialties',
    label: L9('Specialties', '专业方向', 'Especialidades', 'Chuyên môn', 'विशेषज्ञताएँ', 'Spécialités', 'Fachgebiete', '専門分野', '전문 분야'),
    items: [
      LINKS.plc,
      LINKS.robotics,
      LINKS.vision,
      LINKS.electrical,
      LINKS.browseByIndustry, // /hire 索引页：按行业浏览方向×行业矩阵
      LINKS.hireByRole,       // /occupations 索引页：按职位名招聘（与本批职业页同批上线）
    ],
  },
  {
    key: 'resources',
    label: L9('Resources', '资源中心', 'Recursos', 'Tài nguyên', 'संसाधन', 'Ressources', 'Ressourcen', 'リソース', '리소스'),
    items: [
      LINKS.allResources, // 方案规定：All Resources 必须是资源中心下拉的首项
      LINKS.playbook,
      LINKS.caseStudies,
      LINKS.guideMexico,
      LINKS.guideVietnam,
      LINKS.guideThailand,
    ],
  },
  {
    key: 'company',
    label: L9('Company', '公司', 'Empresa', 'Công ty', 'कंपनी', 'Entreprise', 'Unternehmen', '会社', '회사'),
    items: [
      LINKS.about,
      LINKS.trustCenter,
      LINKS.contact, // 裁定：独立 /contact 页，不用 /about#contact 锚点
    ],
  },
  {
    // Pricing 保持扁平链接（转化关键入口，不藏进下拉）。
    key: 'pricing',
    label: LINKS.pricing.label,
    link: LINKS.pricing,
  },
];

// ── FOOTER_COLUMNS：页脚 5 个链接列（品牌列在 Footer 组件里写死）────────
// 列数恰好 5（完整性测试断言 FOOTER_COLUMNS.length === 5）。
// 链接列长度按方案定稿：Hire 6 / Engineers 7 / Specialties 5 / Guides 3 / Company 8。
// 与首页原内联页脚的差异（有意为之，均为方案裁定）：
// - Enterprise、Developer API 从 Hire 列移入 Company 列（对齐 Actalent 式公司/合规层）；
// - Engineers 列去掉与 Apply/AI Screener 同落点 /talent 的第三个重复项「Browse Projects」，
//   换入新上线的 Training Center，并把 Referral 从 Company 列移来（工程师侧受众更对口）；
// - Payments & Escrow 落点 /finance → /trust；Privacy & Terms 死链 '/' → /privacy。
const FOOTER_COLUMNS = [
  {
    key: 'hire',
    title: L9('Hire', '招聘方', 'Contratar', 'Tuyển dụng', 'नियुक्ति', 'Recruter', 'Einstellen', '採用', '채용'),
    links: [
      LINKS.findEngineers,
      LINKS.postProject,
      LINKS.rateBenchmarks,
      LINKS.pricing,
      LINKS.costCalculator,
      LINKS.coverageMap,
    ],
  },
  {
    key: 'engineers',
    title: L9('Engineers', '工程师', 'Ingenieros', 'Kỹ sư', 'इंजीनियर', 'Ingénieurs', 'Ingenieure', 'エンジニア', '엔지니어'),
    links: [
      LINKS.applyToJoin,
      LINKS.aiScreener,
      LINKS.certificationExams,
      LINKS.trainingCenter,
      LINKS.talscore,
      LINKS.paymentsEscrow, // → /trust（信任中心讲托管机制）
      LINKS.referral,
    ],
  },
  {
    key: 'specialties',
    title: L9('Specialties', '专业领域', 'Especialidades', 'Chuyên môn', 'विशेषज्ञताएँ', 'Spécialités', 'Fachgebiete', '専門分野', '전문 분야'),
    links: [
      LINKS.plc,
      LINKS.vision,
      LINKS.robotics,
      LINKS.electrical,
      LINKS.allRoles, // 4 方向 + 全部职位入口（/occupations）
    ],
  },
  {
    key: 'guides',
    title: L9('Hiring Guides', '建厂用人指南', 'Guías de contratación', 'Cẩm nang tuyển dụng', 'नियुक्ति गाइड', 'Guides de recrutement', 'Einstellungsleitfäden', '採用ガイド', '채용 가이드'),
    links: [
      LINKS.guideMexico,
      LINKS.guideVietnam,
      LINKS.guideThailand,
    ],
  },
  {
    key: 'company',
    title: L9('Company', '公司', 'Empresa', 'Công ty', 'कंपनी', 'Entreprise', 'Unternehmen', '会社', '회사'),
    links: [
      LINKS.about,
      LINKS.playbook,
      LINKS.caseStudies,
      LINKS.trustCenter,
      LINKS.contact,
      LINKS.privacyTerms, // → /privacy 诚实草稿页（原首页页脚此处是指向 '/' 的死链）
      LINKS.enterprise,
      LINKS.developerApi,
    ],
  },
];

// ── FOOTER_META：页脚品牌列与底栏文案 ────────────────────────────────────
// tagline / copyright 九语原样移植自 pages/index.jsx 首页页脚 DICT（既有翻译，不重译）。
const FOOTER_META = {
  tagline: L9(
    'The global marketplace for AI-verified industrial automation talent.',
    'AI 认证工业自动化人才的全球市场。',
    'La marketplace global de talento en automatización industrial verificado por IA.',
    'Sàn nhân lực tự động hóa công nghiệp được AI xác minh trên toàn cầu.',
    'AI-सत्यापित औद्योगिक स्वचालन प्रतिभा का वैश्विक मंच।',
    'La marketplace mondiale des talents en automatisation industrielle vérifiés par IA.',
    'Der globale Marktplatz für KI-verifizierte Talente in der industriellen Automatisierung.',
    'AI検証済みの産業オートメーション人材の世界的マーケットプレイス。',
    'AI로 검증된 산업 자동화 인재의 글로벌 마켓플레이스.'
  ),
  // 语言横幅：本身就是「九语并列」的展示，各语言相同，无需翻译。
  langs: '🌐 EN · 中文 · ES · VI · HI · FR · DE · 日本語 · 한국어',
  copyright: L9(
    '© 2026 Talengineer.us — Global Industrial Automation Talent Marketplace',
    '© 2026 Talengineer.us — 全球工业自动化人才市场',
    '© 2026 Talengineer.us — Mercado global de talento en automatización industrial',
    '© 2026 Talengineer.us — Sàn nhân lực tự động hóa công nghiệp toàn cầu',
    '© 2026 Talengineer.us — वैश्विक औद्योगिक स्वचालन प्रतिभा मंच',
    '© 2026 Talengineer.us — Marketplace mondiale des talents en automatisation industrielle',
    '© 2026 Talengineer.us — Globaler Marktplatz für industrielle Automatisierungstalente',
    '© 2026 Talengineer.us — 世界の産業オートメーション人材マーケットプレイス',
    '© 2026 Talengineer.us — 글로벌 산업 자동화 인재 마켓플레이스'
  ),
};

// ── CTA_POST_PROJECT：Navbar 右侧「发布项目」CTA 的链接 ──────────────────
// 首页私有 header 的 Post a Project CTA 收编进共享 Navbar 时从这里取，
// 与菜单/页脚里的 postProject 是同一个对象（同源不漂移）。
const CTA_POST_PROJECT = LINKS.postProject;

module.exports = {
  L9,
  t,
  LINKS,
  MENU,
  FOOTER_COLUMNS,
  FOOTER_META,
  CTA_POST_PROJECT,
};
