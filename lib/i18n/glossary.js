// ── 九语术语表（glossary）——全站翻译的唯一锁定来源 ─────────────────────────
//
// 这是 2026-07-24 九语全站铺开工程的「术语基座」：所有翻译 agent 在翻任何页面前
// 必须先引用本文件，防止"同词多译"与"机翻腔"。三个出口：
//   1. KEEP_ENGLISH — 任何语言里都保持英文原样、永不翻译的词（判断标准：一位母语
//      工业自动化工程师读到该语言的页面时，会期待这个词就是英文）。
//   2. TERMS       — 必须翻译、且每种语言只允许一个标准译法的平台/行业核心词。
//      译法优先取自站内已上线的九语页面（index.jsx / talent.jsx / navConfig.js 等
//      2026-07-17 首页重写批），与既有语气保持一致；站内没有先例的，取该语言
//      工业界母语从业者的标准叫法，备选写在 note 里。
//   3. STYLE       — 每种语言一段语域（register）指南，翻译 agent 的行文基调。
//
// 诚实红线（与执行细则同口径）：数字、链接、来源注释在任何 dict 搬移/翻译中
// 必须逐字节原样带过——15% / 5% / 前 5 单 / 举证 5 天等数字的单一来源是
// src/config/fees.js 与 src/routes/disputes.js，术语表只锁「词」，不碰「数」。
//
// CJS 纯数据模块（无任何依赖），node --test 可直接 require，页面侧也可 import。

// ── 1. 全语言保留英文的词 ────────────────────────────────────────────────
// 判断标准："would a professional industrial-automation engineer reading {lang}
// expect this word in English?" —— 是则入列。
//
// 例外说明（翻译 agent 必读）：
// · zh：叙述性正文里允许沿用已固化的中文品牌名（西门子 / 罗克韦尔 / 三菱 / 安川 /
//   基恩士 / 霍尼韦尔）——这是 index.jsx zh 段的既有写法；但工具 chips / 技能标签 /
//   软件产品名（TIA Portal、Studio 5000 等）一律保持英文原样。
// · ja / ko / hi：本站既有惯例是品牌与软件名保持拉丁字母原样（见 index.jsx 各语
//   categories），即使日常日语里存在 シーメンス、ファナック 等片假名写法，也不要改写
//   成音译——站内一致性优先。
// · escrow 不在此列——它是要翻译的词（见 TERMS.escrow），别当成缩写保留。
const KEEP_ENGLISH = [
  // 行业通用缩写（全球工程师口语即英文）
  'PLC', 'SCADA', 'HMI', 'DCS', 'OPC UA', 'OT', 'OEM', 'FAT', 'SAT', 'NDA',
  // 合规 / 财税专有名词（美国语境的表格与流程名，译了反而错）
  'KYC', 'COI', 'W-9', '1099',
  // 平台产品名（自有品牌，永不译）
  'TalScore', 'WarRoom', 'Talengineer',
  // 第三方服务品牌
  'Stripe',
  // 工业软件 / 平台名
  'TIA Portal', 'Studio 5000', 'FactoryTalk', 'Ignition', 'WinCC', 'Codesys',
  'DeltaV', 'EPLAN', 'AutoCAD Electrical', 'Experion',
  // 工业协议与标准
  'Profinet', 'EtherNet/IP', 'Modbus', 'UL 508A',
  // 硬件品牌（zh 叙述正文可用固化中文名，见上方例外说明）
  'Allen-Bradley', 'Rockwell', 'Siemens', 'Mitsubishi', 'FANUC', 'KUKA', 'ABB',
  'Yaskawa', 'Cognex', 'Keyence', 'Halcon', 'Honeywell', 'AVEVA', 'Wonderware',
];

// ── 2. 核心术语锁定表 ────────────────────────────────────────────────────
// 结构：{ termKey: { note, en, zh, es, vi, hi, fr, de, ja, ko } }
// 每个译法 = 该语言工业界母语从业者的标准叫法；有既有站内先例的以先例为准。
const TERMS = {
  // 资金托管——金融术语，各语用本国托管/担保制度的标准词，不许直译"第三方保管"
  escrow: {
    note: '里程碑资金托管。zh 固定「托管」（index.jsx 先例）；es 用 depósito en garantía（LatAm 金融标准词）；fr séquestre；de Treuhand；hi 音译 एस्क्रो 已是行业通用写法。',
    en: 'escrow', zh: '托管', es: 'depósito en garantía', vi: 'ký quỹ',
    hi: 'एस्क्रो', fr: 'séquestre', de: 'Treuhand', ja: 'エスクロー', ko: '에스크로',
  },
  // 阶段付款节点
  milestone: {
    note: '项目阶段付款节点（与 escrow 搭配：milestone escrow = 里程碑托管）。全部沿用 index.jsx 九语先例。',
    en: 'milestone', zh: '里程碑', es: 'hito', vi: 'cột mốc',
    hi: 'माइलस्टोन', fr: 'jalon', de: 'Meilenstein', ja: 'マイルストーン', ko: '마일스톤',
  },
  // 平台认证（考证体系 L1–L3）
  certification: {
    note: '平台考证体系（4 方向 × L1–L3）。指平台颁发的认证，非政府执照。',
    en: 'certification', zh: '认证', es: 'certificación', vi: 'chứng chỉ',
    hi: 'प्रमाणन', fr: 'certification', de: 'Zertifizierung', ja: '認定', ko: '인증',
  },
  // 持证工程师（撮合路线图：持证才可被指派）
  certifiedEngineer: {
    note: '通过平台考证的工程师（持证才可被指派）。zh 用「持证工程师」与撮合路线图口径一致。',
    en: 'certified engineer', zh: '持证工程师', es: 'ingeniero certificado', vi: 'kỹ sư có chứng chỉ',
    hi: 'प्रमाणित इंजीनियर', fr: 'ingénieur certifié', de: 'zertifizierter Ingenieur',
    ja: '認定エンジニア', ko: '인증 엔지니어',
  },
  // 实操筛选——不是"面试"，是动手测评
  practicalScreening: {
    note: '实操型技术筛选（非"面试"）。产品名固定为 AI Technical Screener（各语见 index.jsx：zh AI 技术筛选 / ja AI技術スクリーナー / ko AI 기술 스크리너），此处锁的是泛指叫法。',
    en: 'practical screening', zh: '实操筛选', es: 'evaluación práctica', vi: 'sàng lọc thực hành',
    hi: 'व्यावहारिक मूल्यांकन', fr: 'évaluation pratique', de: 'praxisnahes Assessment',
    ja: '実践的なスクリーニング', ko: '실무형 평가',
  },
  // 已验证分数（工程师档案上展示的筛选分）
  verifiedScore: {
    note: '工程师档案上展示的已验证筛选分。产品化的分数名是 TalScore（KEEP_ENGLISH），此处锁泛指叫法。',
    en: 'verified score', zh: '已验证分数', es: 'puntuación verificada', vi: 'điểm đã xác minh',
    hi: 'सत्यापित स्कोर', fr: 'score vérifié', de: 'verifizierter Score',
    ja: '検証済みスコア', ko: '검증된 점수',
  },
  // 机器视觉（4 认证方向之一）
  machineVision: {
    note: '认证方向之一。es 行业标准词是 visión artificial（不要用 visión de máquina）；fr 是 vision industrielle（index.jsx 先例）；de 行业惯称 Bildverarbeitung（工业语境，index.jsx 先例）。',
    en: 'machine vision', zh: '机器视觉', es: 'visión artificial', vi: 'thị giác máy',
    hi: 'मशीन विज़न', fr: 'vision industrielle', de: 'Bildverarbeitung',
    ja: 'マシンビジョン', ko: '머신 비전',
  },
  // 机器人（4 认证方向之一）
  robotics: {
    note: '认证方向之一（工业机器人）。zh 方向名固定「机器人」；vi 用 robot công nghiệp（index.jsx 分类先例）。',
    en: 'robotics', zh: '机器人', es: 'robótica', vi: 'robot công nghiệp',
    hi: 'रोबोटिक्स', fr: 'robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스',
  },
  // 控制（4 认证方向之一：PLC/过程控制方向的统称）
  controls: {
    note: '认证方向之一（controls = PLC/过程控制方向统称）。fr 行业标准词是 contrôle-commande；de 是 Steuerungstechnik。',
    en: 'controls', zh: '控制', es: 'control', vi: 'điều khiển',
    hi: 'कंट्रोल', fr: 'contrôle-commande', de: 'Steuerungstechnik', ja: '制御', ko: '제어',
  },
  // 电气/柜体设计（4 认证方向之一）
  electricalPanelDesign: {
    note: '认证方向之一。zh 固定「电气柜设计」；de Schaltschrankdesign、ja 制御盤設計 为行业标准词（index.jsx 分类先例）。',
    en: 'electrical / panel design', zh: '电气柜设计', es: 'diseño de tableros eléctricos',
    vi: 'thiết kế tủ điện', hi: 'इलेक्ट्रिकल पैनल डिज़ाइन', fr: "conception d'armoires électriques",
    de: 'Schaltschrankdesign', ja: '制御盤設計', ko: '전기 패널 설계',
  },
  // 平台费——数字纪律：15% / founding 5% 单一来源 src/config/fees.js，译文不许出现新数字
  platformFee: {
    note: '平台服务费。数字纪律：15% / founding 5% / 前 5 单的单一来源是 src/config/fees.js，翻译只搬词，数字与来源注释逐字节原样带过。',
    en: 'platform fee', zh: '平台费', es: 'comisión de la plataforma', vi: 'phí nền tảng',
    hi: 'प्लेटफ़ॉर्म शुल्क', fr: 'frais de plateforme', de: 'Plattformgebühr',
    ja: 'プラットフォーム手数料', ko: '플랫폼 수수료',
  },
  // founding 客户（前 5 单 5% 优惠）
  foundingClient: {
    note: '前 5 单享 5% 平台费的创始客户。zh 既有站内写法保留英文「founding 客户」（case-studies.jsx / about.jsx 先例），不要译成「创始客户」；ja 片假名音译；ko 备选 창립 고객。',
    en: 'founding client', zh: 'founding 客户', es: 'cliente fundador', vi: 'khách hàng sáng lập',
    hi: 'संस्थापक ग्राहक', fr: 'client fondateur', de: 'Gründungskunde',
    ja: 'ファウンディングクライアント', ko: '파운딩 고객',
  },
  // 到手金额（工程师侧：报价 × (1 - 抽佣)）
  takeHome: {
    note: '工程师侧到手金额（talent.jsx：到手 = 报价 × (1 - 抽佣比例)）。ja 手取り額、ko 실수령액 为薪酬语境标准词；hi 用 टेक-होम（印度职场通用英语借词）。',
    en: 'take-home', zh: '到手金额', es: 'monto neto', vi: 'số tiền thực nhận',
    hi: 'टेक-होम राशि', fr: 'montant net perçu', de: 'Nettobetrag', ja: '手取り額', ko: '실수령액',
  },
  // 纠纷
  dispute: {
    note: '交付争议流程。fr 法律语境标准词 litige（非 dispute）；de Streitfall。',
    en: 'dispute', zh: '纠纷', es: 'disputa', vi: 'tranh chấp',
    hi: 'विवाद', fr: 'litige', de: 'Streitfall', ja: '紛争', ko: '분쟁',
  },
  // 举证窗口——数字纪律：「5 天」单一来源 src/routes/disputes.js
  evidenceWindow: {
    note: '纠纷流程的固定举证期。数字纪律：「5 天举证窗口」的 5 天单一来源是 src/routes/disputes.js（措辞对齐 pages/trust.jsx），译文不许改数。es 备选 plazo de presentación de pruebas。',
    en: 'evidence window', zh: '举证窗口', es: 'ventana de evidencias', vi: 'thời hạn nộp bằng chứng',
    hi: 'साक्ष्य विंडो', fr: 'fenêtre de preuves', de: 'Beweisfrist',
    ja: '証拠提出期間', ko: '증거 제출 기간',
  },
  // 工单（/workorder/[id] 现场执行单元）
  workOrder: {
    note: '现场执行工单（/workorder/[id]）。es orden de trabajo、fr ordre de travail、de Arbeitsauftrag、ja 作業指示書 均为现场服务行业标准词；hi 用借词 वर्क ऑर्डर。',
    en: 'work order', zh: '工单', es: 'orden de trabajo', vi: 'lệnh công việc',
    hi: 'वर्क ऑर्डर', fr: 'ordre de travail', de: 'Arbeitsauftrag', ja: '作業指示書', ko: '작업 지시서',
  },
  // GPS 签到（工单现场打卡）
  checkIn: {
    note: '工单现场 GPS 签到。fr 用 pointage（考勤打卡标准词）；es/vi 从业者日常直接说 check-in，按借词保留；zh 用「签到」。',
    en: 'check-in', zh: '签到', es: 'check-in', vi: 'check-in',
    hi: 'चेक-इन', fr: 'pointage', de: 'Check-in', ja: 'チェックイン', ko: '체크인',
  },
  // 调试——关键行业词：现场开机调试，绝不能译成"委托/佣金"
  commissioning: {
    note: '关键行业词：设备现场开机调试（绝不能按字面译成"委托/佣金"）。zh 行业口语固定「调试」；es puesta en marcha、fr mise en service、de Inbetriebnahme、ja 試運転、ko 시운전 均为行业标准词（index.jsx 分类先例）；hi 用借词 कमीशनिंग。',
    en: 'commissioning', zh: '调试', es: 'puesta en marcha', vi: 'chạy thử',
    hi: 'कमीशनिंग', fr: 'mise en service', de: 'Inbetriebnahme', ja: '試運転', ko: '시운전',
  },
  // 改造（旧设备升级改造）
  retrofit: {
    note: '旧产线/旧设备升级改造。es/hi/ja 从业者直接用借词 retrofit；de 标准词 Nachrüstung；ko 개조（index.jsx 先例）。',
    en: 'retrofit', zh: '改造', es: 'retrofit', vi: 'cải tạo',
    hi: 'रेट्रोफिट', fr: 'rétrofit', de: 'Nachrüstung', ja: 'レトロフィット', ko: '개조',
  },
  // 时薪
  hourlyRate: {
    note: '工程师小时费率。ko 요율（navConfig「요율 벤치마크」先例）；de Stundensatz。金额区间（如 $20–45/hr）数字原样带过。',
    en: 'hourly rate', zh: '时薪', es: 'tarifa por hora', vi: 'mức phí theo giờ',
    hi: 'प्रति घंटा दर', fr: 'tarif horaire', de: 'Stundensatz', ja: '時間料金', ko: '시간당 요율',
  },
  // 人才库（/pools 雇主侧功能）
  talentPool: {
    note: '雇主侧人才库（/pools）。es 从业 HR 语境通用 pool de talento（备选 cartera de talento）；fr vivier de talents。',
    en: 'talent pool', zh: '人才库', es: 'pool de talento', vi: 'nguồn nhân tài',
    hi: 'टैलेंट पूल', fr: 'vivier de talents', de: 'Talentpool', ja: '人材プール', ko: '인재 풀',
  },
  // 推荐（推荐码 / 推荐返利）
  referral: {
    note: '推荐机制（推荐码 referral code）。fr 用 parrainage（营销推荐标准词）；es 用 referido（LatAm 通用）。',
    en: 'referral', zh: '推荐', es: 'referido', vi: 'giới thiệu',
    hi: 'रेफ़रल', fr: 'parrainage', de: 'Empfehlung', ja: '紹介', ko: '추천',
  },
  // 雇主（平台两种角色之一）
  employer: {
    note: '平台角色之一（发布需求、付款的企业方）。es 角色词用 empleador（页面栏目标题可沿用 index.jsx 的 Para empresas）；de 用 Auftraggeber（项目委托方语境，比 Arbeitgeber 更贴合平台按单合作）；ja 雇用者、ko 고용주（index.jsx 先例）。',
    en: 'employer', zh: '雇主', es: 'empleador', vi: 'nhà tuyển dụng',
    hi: 'नियोक्ता', fr: 'employeur', de: 'Auftraggeber', ja: '雇用者', ko: '고용주',
  },
  // 工程师（平台两种角色之一）
  engineer: {
    note: '平台角色之一（接单方）。各语均为最普通的"工程师"标准词，全站已高频使用，不要换词。',
    en: 'engineer', zh: '工程师', es: 'ingeniero', vi: 'kỹ sư',
    hi: 'इंजीनियर', fr: 'ingénieur', de: 'Ingenieur', ja: 'エンジニア', ko: '엔지니어',
  },
  // 指派（撮合：把持证工程师指派到项目）
  assignment: {
    note: '把持证工程师指派到项目（人工撮合语境）。fr affectation、de Einsatz（外派任务语境）；ja 从业口语用外来语 アサイン。',
    en: 'assignment', zh: '指派', es: 'asignación', vi: 'phân công',
    hi: 'असाइनमेंट', fr: 'affectation', de: 'Einsatz', ja: 'アサイン', ko: '배정',
  },
  // 提现（Stripe payout：工程师把余额转出到银行）
  payout: {
    note: 'Stripe payout：工程师把平台余额转出到银行账户。zh「提现」；de Auszahlung、ja 出金、ko 출금 为金融标准词；hi 用借词 पेआउट。',
    en: 'payout', zh: '提现', es: 'retiro de fondos', vi: 'rút tiền',
    hi: 'पेआउट', fr: 'versement', de: 'Auszahlung', ja: '出金', ko: '출금',
  },
};

// ── 3. 各语言语域（register）指南 ────────────────────────────────────────
// 翻译 agent 的行文基调：一段话说清称谓、语体、外来词处理。
const STYLE = {
  en: 'Professional B2B marketplace voice: direct, concrete, confident, no filler. Short sentences, active voice, second person ("you"). Industry acronyms (PLC, SCADA, FAT/SAT) used without explanation — the reader is an automation professional. Numbers, links, and source comments are never altered.',
  zh: '简体中文，沿用站内既有语气（index.jsx zh 段为基准）：干脆、务实、面向企业决策者的书面语，不堆敬语也不口语化；技术缩写保持英文（PLC、SCADA），已固化的中文品牌名（西门子、罗克韦尔）可在叙述正文使用；标点用全角，中英文之间留一个空格。',
  es: 'Español para el mercado de México/LatAm: trato de usted en todo el sitio, vocabulario latinoamericano (tablero eléctrico, no cuadro eléctrico; monto, no importe), registro profesional B2B sin regionalismos coloquiales. Términos del sector en su forma estándar (puesta en marcha, depósito en garantía); siglas técnicas en inglés tal cual (PLC, SCADA, FAT/SAT).',
  vi: 'Tiếng Việt trang trọng dùng cho khách hàng doanh nghiệp: xưng hô "bạn/chúng tôi", câu gọn, rõ ràng, không suồng sã. Giữ nguyên các từ mượn kỹ thuật đã thông dụng trong ngành (PLC, SCADA, check-in, robot, OEM); thuật ngữ nghề dùng đúng từ chuẩn hiện trường (chạy thử, ký quỹ, tủ điện). Không phiên âm tên hãng.',
  hi: 'देवनागरी में औपचारिक व्यावसायिक हिंदी, लेकिन भारतीय इंजीनियरिंग व्यवहार की तरह सामान्य अंग्रेज़ी तकनीकी शब्द मिलाकर (PLC, SCADA, वर्क ऑर्डर, टेक-होम, कमीशनिंग जैसे उधार शब्द देवनागरी या लैटिन में जस के तस)। पूरा अनुवाद करने की ज़बरदस्ती न करें — जो शब्द भारतीय इंजीनियर अंग्रेज़ी में बोलते हैं, उन्हें वैसे ही रखें। "आप" सम्मानसूचक संबोधन।',
  fr: 'Français professionnel, vouvoiement systématique. Terminologie industrielle française standard (mise en service, armoire électrique, séquestre, cahier des charges) ; sigles techniques conservés en anglais (PLC, SCADA, FAT/SAT). Ton B2B sobre et précis, sans anglicismes inutiles hors termes métier consacrés ; typographie française (espace insécable avant « : » et « ? »).',
  de: 'Professionelles Deutsch, durchgehend Sie-Form. Branchenübliche Komposita statt wörtlicher Übersetzungen (Inbetriebnahme, Schaltschrankdesign, Stundensatz); technische Abkürzungen bleiben englisch (PLC, SCADA, FAT/SAT). Sachlicher, präziser B2B-Ton ohne Werbefloskeln; zusammengesetzte Substantive korrekt durchkoppeln (KI-Techniktest, Meilenstein-Treuhand).',
  ja: 'です・ます調のビジネス日本語。読者は製造業の意思決定者と現役エンジニア。業界で定着した外来語はカタカナで（エスクロー、マイルストーン、マシンビジョン、レトロフィット）、現場用語は和語・漢語の標準語で（試運転、制御盤設計、作業指示書、手取り額）。ブランド名・ソフト名はラテン文字のまま（Siemens、TIA Portal——サイト既存の表記慣例）。長音記号・中黒の表記は既存ページに合わせる。',
  ko: '합니다체의 격식 있는 비즈니스 한국어. 독자는 제조업 의사결정자와 현직 엔지니어. 업계에 정착한 외래어는 그대로 (에스크로, 마일스톤, 머신 비전), 현장 용어는 표준 한자어로 (시운전, 작업 지시서, 실수령액, 시간당 요율). 브랜드명·소프트웨어명은 라틴 문자 그대로 유지 (Siemens, TIA Portal — 사이트 기존 표기 관례). 조사와 띄어쓰기는 기존 페이지 표기를 따릅니다.',
};

// ── 4. 产品展示名（display name）─────────────────────────────────────────
// 为什么单列一节：KEEP_ENGLISH 锁的是**词形**（代码、文档、正文里提到这个产品时
// 写 `WarRoom`，一个词），但界面上真正呈现给用户的是**带空格的展示名**
// （`War Room`）——两者不是一回事。此前术语表没写清这层区别，结果同一个站点里
// 长出了两套写法：/warroom 页与 /console 入口在 zh/vi/fr/ko 四语各自造了本地名
// （战情室 / Phòng Chiến / Salle de Guerre / 워룸），而 lib/regionGuides.js 的
// 九语正文里又原样写着 WarRoom。
//
// Terry 2026-07-25 拍板：**展示名九种语言统一保留英文**。理由：①它带 ™，是商标，
// 逐语言另造一个名字既稀释品牌又无从注册；②站内新批内容（regionGuides）本就
// 九语原样保留，统一后全站只剩一套写法；③配回归卫（tests/glossary.test.js）
// 之后不会再飘。
//
// 字段：code = 代码标识符/品牌代号（一个词，用于变量名、路由、文档）；
//       display = 界面展示名（带空格，九语一致）；
//       brand = 带产品前缀的完整品牌名（/warroom 页 title 与 header 副标题用）；
//       retired = 统一之前各语言用过的本地化译名，测试拿它防回潮——
//                 任何语言字典里再出现这些词就是回潮，直接红灯。
const DISPLAY_NAMES = {
  warRoom: {
    note: '项目级实时翻译沟通间。展示名九语一律 "War Room"，完整品牌名 "Babel War Room"（带 ™ 时写 "Babel War Room™"）。',
    code: 'WarRoom',
    display: 'War Room',
    brand: 'Babel War Room',
    retired: ['战情室', 'Phòng Chiến', 'Salle de Guerre', '워룸', 'Sala de Guerra', 'Kriegsraum', '作戦室'],
  },
};

module.exports = { KEEP_ENGLISH, TERMS, STYLE, DISPLAY_NAMES };
