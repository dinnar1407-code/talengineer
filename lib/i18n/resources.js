// ── /resources 页语言字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）────
//
// 来源：pages/resources.jsx 内联 DICT（en/zh 逐字节原样搬移，2026-07-24）。
// 纯机械搬移：文案、诚实红线注释零改动；渲染逻辑（DICT[lang] || DICT.en）留在页面。
// ⚠️ 诚实红线说明（本页设计约束，改动前必读）：
// 1. 本页刻意不出现任何平台数字（费率、佣金比例、题量等）——所有数字都留在
//    各自拥有"单一来源"的页面上（/pricing←fees.js、/rates←实时档案数据、
//    /certification←training.js、/talscore←talScore.js）。资源枢纽只做导航与
//    结构性描述，避免成为数字漂移面。
// 2. 不做"500+ 资源"式的体量包装——站点内容还在早期积累阶段，页面按
//    "策展分区 + 一个自动 feed"组织，诚实于实际体量。
// 3. 案例卡使用 llms.txt 同款 founding 诚实口径（案例随每单完成逐篇发布），
//    白皮书卡仅在 content/whitepaper 的 draft 翻 false 后才渲染（构建期判定）。

// ── 语言字典（en/zh 两套全量文案；其余语言按全站约定 || en 回退）──────────
const DICT = {
  en: {
    kicker: 'Resource Hub',
    title: 'Guides, market data and platform mechanics — in one place',
    sub: 'Everything we have published so far, organized by what you are trying to do: benchmark rates, hire for a specific role, plan a cross-border build, or understand exactly how the platform works. New material is added as we write it — no filler.',

    // 板块一：Playbook 最新文章（构建期自动 top 6）
    playbookTitle: 'Latest from the Playbook',
    playbookIntro:
      'Practical, no-fluff guides on rates, hiring, certification and cross-border delivery for industrial automation projects. The six most recent articles are below.',
    playbookViewAll: 'View all Playbook articles →',
    read: 'Read →',
    typeLabels: { guide: 'Guide', 'market-data': 'Market Data', certification: 'Certification', case: 'Case Study' },

    // 板块二：市场数据（三张手工卡 + 自动过滤出的 market-data 类文章）
    marketTitle: 'Market data',
    marketIntro:
      'Live numbers aggregated from active engineer profiles on the platform — plus the articles we write when the data says something worth reading.',
    marketCards: [
      {
        href: '/rates',
        name: 'Rate Benchmarks',
        desc: 'Real-time hourly rate ranges for industrial automation talent by region and skill, sourced from active engineer profiles on Talengineer.',
      },
      {
        href: '/calculator',
        name: 'Cost Calculator',
        desc: 'Estimate what a verified, escrow-protected automation engineer costs on Talengineer versus hiring a local full-time engineer. Free, no signup required.',
      },
      {
        href: '/coverage',
        name: 'Coverage Map',
        desc: 'Where our engineers are — by region, TalScore tier and specialty. Aggregated in real time from active engineer profiles.',
      },
    ],
    marketArticlesTitle: 'Market-data articles',

    // 板块三：招聘指南（方向/行业矩阵 + 职业页带 + 国别指南）
    hiringTitle: 'Hiring guides',
    hireCard: {
      href: '/hire',
      name: 'Browse by specialty & industry',
      desc: 'Four certification tracks — PLC, robotics, machine vision and electrical — each with regional rate context and industry-specific pages underneath.',
    },
    rolesLabel: 'Hire by role title',
    rolesAll: 'All roles →',
    guidesCard: {
      href: '/guides',
      name: 'Country hiring guides',
      desc: 'Setting up production in Mexico, Vietnam or Thailand? Local rate context, certification and on-the-ground commissioning — read before you build.',
    },
    guideNames: { mexico: 'Mexico', vietnam: 'Vietnam', thailand: 'Thailand' },

    // 板块四：平台机制页（数字单一来源的解释页群）
    platformTitle: 'How the platform works',
    platformIntro:
      'The mechanics pages. Every number on them is written once, from a single source in the codebase — so what you read is what the platform actually does.',
    platformCards: [
      {
        href: '/how-it-works',
        name: 'How It Works',
        desc: 'The full walkthrough: how a project runs from posting to escrow release, for employers and for engineers — plus how quality is enforced and what happens in a dispute.',
      },
      {
        href: '/pricing',
        name: 'Pricing',
        desc: 'The complete fee schedule, published. What employers pay, what engineers keep, and the guarantee terms — with nothing hidden in a sales call.',
      },
      {
        href: '/trust',
        name: 'Trust Center',
        desc: 'How milestone escrow, identity verification, dispute handling and the other platform safeguards actually work.',
      },
      {
        href: '/talscore',
        name: 'TalScore',
        desc: 'How engineer reputation scores are computed — the inputs, the weights and the red lines. The formula is public.',
      },
      {
        href: '/certification',
        name: 'Certification Exams',
        desc: 'How platform certification works: tracks, levels and exam mechanics — and why only certified engineers can be assigned to projects.',
      },
    ],

    // 板块五：案例（founding 诚实口径，与 llms.txt 一致）
    caseTitle: 'Case studies',
    caseDesc:
      'Real, de-identified delivery stories from Talengineer projects. We are delivering the founding cohort now — each completed project is published here as it wraps. No composite or invented cases.',
    caseCta: 'Visit case studies →',

    // 板块六：白皮书（仅非草稿时渲染；文案来自 whitepaper frontmatter）
    wpKicker: 'Whitepaper',
    wpCta: 'Read the whitepaper →',
  },
  zh: {
    kicker: '资源中心',
    title: '指南、市场数据与平台机制，一站集齐',
    sub: '我们迄今发布的全部内容，按你的目的组织：对标费率、按职位招人、规划跨境建厂，或搞清平台到底如何运转。新内容随写随加——不注水。',

    playbookTitle: '实战指南·最新文章',
    playbookIntro:
      '关于费率、招聘、认证与跨境交付的实操型指南，专为工业自动化项目而写。下面是最新的六篇。',
    playbookViewAll: '查看全部实战指南 →',
    read: '阅读 →',
    typeLabels: { guide: '指南', 'market-data': '市场数据', certification: '认证解读', case: '案例' },

    marketTitle: '市场数据',
    marketIntro: '来自平台活跃工程师档案的实时聚合数据——以及当数据里有值得写的东西时，我们写下的文章。',
    marketCards: [
      {
        href: '/rates',
        name: '费率基准',
        desc: '按地区与技能实时展示工业自动化人才的时薪区间，数据来源于 Talengineer 平台的活跃工程师档案。',
      },
      {
        href: '/calculator',
        name: '成本计算器',
        desc: '估算在 Talengineer 上使用经过验证、托管保障的自动化工程师，与本地全职招聘相比的成本。免费，无需注册。',
      },
      {
        href: '/coverage',
        name: '工程师覆盖地图',
        desc: '我们的工程师分布在哪里——按地区、TalScore 等级与专业方向，基于活跃档案实时聚合。',
      },
    ],
    marketArticlesTitle: '市场数据类文章',

    hiringTitle: '招聘指南',
    hireCard: {
      href: '/hire',
      name: '按专业方向与行业浏览',
      desc: '四个认证方向——PLC、机器人、机器视觉、电气——每个方向下附地区费率背景与细分行业页面。',
    },
    rolesLabel: '按职位名招聘',
    rolesAll: '全部职位 →',
    guidesCard: {
      href: '/guides',
      name: '分国用人指南',
      desc: '要在墨西哥、越南或泰国建产线？当地费率背景、认证与落地调试——动工之前先读。',
    },
    guideNames: { mexico: '墨西哥', vietnam: '越南', thailand: '泰国' },

    platformTitle: '平台机制',
    platformIntro: '机制解释页群。上面的每个数字都只写一次、来自代码库的单一来源——你读到的就是平台实际的运转方式。',
    platformCards: [
      {
        href: '/how-it-works',
        name: '平台如何运转',
        desc: '全流程走读：一个项目从发布到托管放款如何推进——雇主视角与工程师视角，以及质量如何被把关、发生纠纷时会怎样。',
      },
      {
        href: '/pricing',
        name: '定价',
        desc: '完整费率表，全部公开。雇主付什么、工程师拿什么、保障条款是什么——没有任何藏在销售电话里的内容。',
      },
      {
        href: '/trust',
        name: '信任中心',
        desc: '里程碑托管、身份核验、纠纷处理及其他平台保障机制的实际运作方式。',
      },
      {
        href: '/talscore',
        name: 'TalScore 信誉分',
        desc: '工程师信誉分如何计算——输入项、权重与红线。公式全部公开。',
      },
      {
        href: '/certification',
        name: '认证考试',
        desc: '平台认证如何运作：方向、级别与考试机制——以及为什么只有持证工程师才能被指派到项目。',
      },
    ],

    caseTitle: '案例研究',
    caseDesc:
      '来自 Talengineer 真实项目、经过脱敏的交付故事。我们正在交付 founding 客户群——每完成一单就发布一篇。不做拼凑案例，不编造案例。',
    caseCta: '查看案例 →',

    wpKicker: '白皮书',
    wpCta: '阅读白皮书 →',
  },

  es: {
    kicker: "Centro de Recursos",
    title: "Guías, datos de mercado y mecánica de la plataforma — en un solo lugar",
    sub: "Todo lo que hemos publicado hasta ahora, organizado según lo que usted busca hacer: comparar tarifas, contratar para un puesto específico, planear una construcción transfronteriza, o entender exactamente cómo funciona la plataforma. Se añade material nuevo a medida que lo escribimos — sin relleno.",
    playbookTitle: "Lo más reciente del Playbook",
    playbookIntro: "Guías prácticas y sin adornos sobre tarifas, contratación, certificación y entrega transfronteriza para proyectos de automatización industrial. Los seis artículos más recientes están a continuación.",
    playbookViewAll: "Ver todos los artículos del Playbook →",
    read: "Leer →",
    typeLabels: {
      guide: "Guía",
      "market-data": "Datos de mercado",
      certification: "Certificación",
      case: "Caso de estudio",
    },
    marketTitle: "Datos de mercado",
    marketIntro: "Cifras en vivo agregadas a partir de perfiles de ingenieros activos en la plataforma — además de los artículos que escribimos cuando los datos dicen algo que vale la pena leer.",
    marketCards: [
      {
        href: "/rates",
        name: "Comparativo de Tarifas",
        desc: "Rangos de tarifas por hora en tiempo real para talento de automatización industrial por región y habilidad, obtenidos de perfiles de ingenieros activos en Talengineer.",
      },
      {
        href: "/calculator",
        name: "Calculadora de Costos",
        desc: "Estime cuánto cuesta un ingeniero de automatización verificado y protegido por depósito en garantía en Talengineer frente a contratar a un ingeniero local de tiempo completo. Gratis, sin necesidad de registrarse.",
      },
      {
        href: "/coverage",
        name: "Mapa de Cobertura",
        desc: "Dónde están nuestros ingenieros — por región, nivel de TalScore y especialidad. Agregado en tiempo real a partir de perfiles de ingenieros activos.",
      },
    ],
    marketArticlesTitle: "Artículos de datos de mercado",
    hiringTitle: "Guías de contratación",
    hireCard: {
      href: "/hire",
      name: "Explorar por especialidad e industria",
      desc: "Cuatro especialidades de certificación — PLC, robótica, visión artificial y eléctrica — cada una con contexto de tarifas regionales y páginas específicas por industria.",
    },
    rolesLabel: "Contratar por puesto",
    rolesAll: "Todos los puestos →",
    guidesCard: {
      href: "/guides",
      name: "Guías de contratación por país",
      desc: "¿Está montando producción en México, Vietnam o Tailandia? Contexto de tarifas locales, certificación y puesta en marcha en el terreno — léalo antes de construir.",
    },
    guideNames: {
      mexico: "México",
      vietnam: "Vietnam",
      thailand: "Tailandia",
    },
    platformTitle: "Cómo funciona la plataforma",
    platformIntro: "Las páginas de mecánica. Cada número en ellas se escribe una sola vez, desde una única fuente en el código — así que lo que usted lee es exactamente lo que hace la plataforma.",
    platformCards: [
      {
        href: "/how-it-works",
        name: "Cómo Funciona",
        desc: "El recorrido completo: cómo se desarrolla un proyecto desde la publicación hasta la liberación del depósito en garantía, para empleadores y para ingenieros — además de cómo se hace cumplir la calidad y qué ocurre en una disputa.",
      },
      {
        href: "/pricing",
        name: "Precios",
        desc: "El calendario de comisiones completo, publicado. Lo que pagan los empleadores, lo que conservan los ingenieros y los términos de la garantía — sin nada oculto en una llamada de ventas.",
      },
      {
        href: "/trust",
        name: "Centro de Confianza",
        desc: "Cómo funcionan realmente el depósito en garantía por hitos, la verificación de identidad, el manejo de disputas y las demás salvaguardas de la plataforma.",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "Cómo se calculan las puntuaciones de reputación de los ingenieros — las entradas, las ponderaciones y las líneas rojas. La fórmula es pública.",
      },
      {
        href: "/certification",
        name: "Exámenes de Certificación",
        desc: "Cómo funciona la certificación de la plataforma: especialidades, niveles y mecánica del examen — y por qué solo los ingenieros certificados pueden ser asignados a proyectos.",
      },
    ],
    caseTitle: "Casos de estudio",
    caseDesc: "Historias de entrega reales y desidentificadas de proyectos de Talengineer. Estamos entregando el grupo fundador ahora — cada proyecto completado se publica aquí a medida que concluye. Ningún caso compuesto o inventado.",
    caseCta: "Visitar casos de estudio →",
    wpKicker: "Libro Blanco",
    wpCta: "Leer el libro blanco →",
  },

  vi: {
    kicker: "Trung tâm Tài nguyên",
    title: "Hướng dẫn, dữ liệu thị trường và cơ chế nền tảng — trong một nơi",
    sub: "Mọi thứ chúng tôi đã xuất bản cho đến nay, được sắp xếp theo những gì bạn đang muốn làm: đối chuẩn mức phí, tuyển dụng cho một vị trí cụ thể, lên kế hoạch xây dựng xuyên biên giới, hoặc hiểu chính xác cách nền tảng vận hành. Tài liệu mới được thêm vào khi chúng tôi viết — không có nội dung nhồi nhét.",
    playbookTitle: "Mới nhất từ Playbook",
    playbookIntro: "Các hướng dẫn thực tế, không rườm rà về mức phí, tuyển dụng, chứng chỉ và giao hàng xuyên biên giới cho các dự án tự động hóa công nghiệp. Sáu bài viết gần đây nhất ở bên dưới.",
    playbookViewAll: "Xem tất cả bài viết Playbook →",
    read: "Đọc →",
    typeLabels: {
      guide: "Hướng dẫn",
      "market-data": "Dữ liệu thị trường",
      certification: "Chứng chỉ",
      case: "Nghiên cứu điển hình",
    },
    marketTitle: "Dữ liệu thị trường",
    marketIntro: "Số liệu trực tiếp được tổng hợp từ các hồ sơ kỹ sư đang hoạt động trên nền tảng — cùng với các bài viết chúng tôi soạn khi dữ liệu cho thấy điều gì đó đáng đọc.",
    marketCards: [
      {
        href: "/rates",
        name: "Đối chuẩn Mức phí",
        desc: "Khoảng mức phí theo giờ theo thời gian thực cho nhân lực tự động hóa công nghiệp theo khu vực và kỹ năng, lấy từ các hồ sơ kỹ sư đang hoạt động trên Talengineer.",
      },
      {
        href: "/calculator",
        name: "Máy tính Chi phí",
        desc: "Ước tính chi phí thuê một kỹ sư tự động hóa đã được xác minh và bảo vệ bằng ký quỹ trên Talengineer so với thuê một kỹ sư toàn thời gian tại địa phương. Miễn phí, không cần đăng ký.",
      },
      {
        href: "/coverage",
        name: "Bản đồ Phạm vi",
        desc: "Các kỹ sư của chúng tôi ở đâu — theo khu vực, cấp độ TalScore và chuyên môn. Được tổng hợp theo thời gian thực từ các hồ sơ kỹ sư đang hoạt động.",
      },
    ],
    marketArticlesTitle: "Bài viết dữ liệu thị trường",
    hiringTitle: "Hướng dẫn tuyển dụng",
    hireCard: {
      href: "/hire",
      name: "Duyệt theo chuyên môn & ngành",
      desc: "Bốn lĩnh vực chứng chỉ — PLC, robot, thị giác máy và điện — mỗi lĩnh vực có bối cảnh mức phí theo khu vực và các trang riêng theo ngành.",
    },
    rolesLabel: "Tuyển dụng theo chức danh",
    rolesAll: "Tất cả chức danh →",
    guidesCard: {
      href: "/guides",
      name: "Hướng dẫn tuyển dụng theo quốc gia",
      desc: "Đang thiết lập sản xuất tại Mexico, Việt Nam hoặc Thái Lan? Bối cảnh mức phí địa phương, chứng chỉ và chạy thử tại hiện trường — hãy đọc trước khi xây dựng.",
    },
    guideNames: {
      mexico: "Mexico",
      vietnam: "Việt Nam",
      thailand: "Thái Lan",
    },
    platformTitle: "Nền tảng hoạt động như thế nào",
    platformIntro: "Các trang cơ chế. Mọi con số trên đó chỉ được viết một lần, từ một nguồn duy nhất trong mã nguồn — vì vậy những gì bạn đọc chính là những gì nền tảng thực sự làm.",
    platformCards: [
      {
        href: "/how-it-works",
        name: "Cách thức hoạt động",
        desc: "Hướng dẫn đầy đủ: một dự án vận hành như thế nào từ khi đăng đến khi giải ngân ký quỹ, cho nhà tuyển dụng và cho kỹ sư — cùng với cách chất lượng được thực thi và điều gì xảy ra khi có tranh chấp.",
      },
      {
        href: "/pricing",
        name: "Bảng giá",
        desc: "Toàn bộ biểu phí, được công bố. Nhà tuyển dụng trả gì, kỹ sư giữ lại gì, và các điều khoản bảo đảm — không có gì ẩn giấu trong một cuộc gọi bán hàng.",
      },
      {
        href: "/trust",
        name: "Trung tâm Tin cậy",
        desc: "Ký quỹ theo cột mốc, xác minh danh tính, xử lý tranh chấp và các biện pháp bảo vệ khác của nền tảng thực sự hoạt động như thế nào.",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "Điểm uy tín của kỹ sư được tính như thế nào — các yếu tố đầu vào, trọng số và các ranh giới đỏ. Công thức được công khai.",
      },
      {
        href: "/certification",
        name: "Kỳ thi Chứng chỉ",
        desc: "Chứng chỉ nền tảng hoạt động như thế nào: lĩnh vực, cấp độ và cơ chế thi — và tại sao chỉ kỹ sư có chứng chỉ mới có thể được phân công vào dự án.",
      },
    ],
    caseTitle: "Nghiên cứu điển hình",
    caseDesc: "Những câu chuyện bàn giao thực tế, đã được ẩn danh từ các dự án Talengineer. Chúng tôi đang bàn giao nhóm khách hàng sáng lập ngay bây giờ — mỗi dự án hoàn thành được công bố tại đây khi kết thúc. Không có trường hợp ghép nối hay bịa đặt.",
    caseCta: "Xem nghiên cứu điển hình →",
    wpKicker: "Sách trắng",
    wpCta: "Đọc sách trắng →",
  },

  hi: {
    kicker: "रिसोर्स हब",
    title: "गाइड, मार्केट डेटा और प्लेटफ़ॉर्म मैकेनिक्स — एक ही जगह",
    sub: "अब तक हमने जो कुछ प्रकाशित किया है, वह इस हिसाब से व्यवस्थित है कि आप क्या करना चाहते हैं: दरों को बेंचमार्क करना, किसी खास भूमिका के लिए हायर करना, सीमा-पार निर्माण की योजना बनाना, या यह ठीक-ठीक समझना कि प्लेटफ़ॉर्म कैसे काम करता है। जैसे-जैसे हम लिखते हैं, नई सामग्री जुड़ती जाती है — कोई भराव नहीं।",
    playbookTitle: "Playbook की नवीनतम पोस्ट",
    playbookIntro: "औद्योगिक ऑटोमेशन प्रोजेक्ट्स के लिए दरों, हायरिंग, प्रमाणन और सीमा-पार डिलीवरी पर व्यावहारिक, बिना बकवास वाली गाइड। सबसे हालिया छह लेख नीचे हैं।",
    playbookViewAll: "सभी Playbook लेख देखें →",
    read: "पढ़ें →",
    typeLabels: {
      guide: "गाइड",
      "market-data": "मार्केट डेटा",
      certification: "प्रमाणन",
      case: "केस स्टडी",
    },
    marketTitle: "मार्केट डेटा",
    marketIntro: "प्लेटफ़ॉर्म पर सक्रिय इंजीनियर प्रोफ़ाइलों से एकत्रित लाइव आँकड़े — साथ ही वे लेख जो हम तब लिखते हैं जब डेटा में पढ़ने लायक कुछ हो।",
    marketCards: [
      {
        href: "/rates",
        name: "रेट बेंचमार्क",
        desc: "क्षेत्र और कौशल के अनुसार औद्योगिक ऑटोमेशन टैलेंट के लिए रीयल-टाइम प्रति घंटा दर रेंज, Talengineer पर सक्रिय इंजीनियर प्रोफ़ाइलों से प्राप्त।",
      },
      {
        href: "/calculator",
        name: "कॉस्ट कैलकुलेटर",
        desc: "Talengineer पर सत्यापित, एस्क्रो-सुरक्षित ऑटोमेशन इंजीनियर की लागत का अनुमान लगाएँ, स्थानीय फ़ुल-टाइम इंजीनियर हायर करने की तुलना में। निःशुल्क, साइन-अप की ज़रूरत नहीं।",
      },
      {
        href: "/coverage",
        name: "कवरेज मैप",
        desc: "हमारे इंजीनियर कहाँ हैं — क्षेत्र, TalScore स्तर और विशेषज्ञता के अनुसार। सक्रिय इंजीनियर प्रोफ़ाइलों से रीयल-टाइम में एकत्रित।",
      },
    ],
    marketArticlesTitle: "मार्केट-डेटा लेख",
    hiringTitle: "हायरिंग गाइड",
    hireCard: {
      href: "/hire",
      name: "विशेषज्ञता व उद्योग के अनुसार ब्राउज़ करें",
      desc: "चार प्रमाणन ट्रैक — PLC, रोबोटिक्स, मशीन विज़न और इलेक्ट्रिकल — हर एक के साथ क्षेत्रीय दर संदर्भ और उद्योग-विशिष्ट पेज।",
    },
    rolesLabel: "पद के नाम से हायर करें",
    rolesAll: "सभी पद →",
    guidesCard: {
      href: "/guides",
      name: "देश के अनुसार हायरिंग गाइड",
      desc: "मेक्सिको, वियतनाम या थाईलैंड में उत्पादन शुरू कर रहे हैं? स्थानीय दर संदर्भ, प्रमाणन और ज़मीनी स्तर पर कमीशनिंग — बनाना शुरू करने से पहले पढ़ें।",
    },
    guideNames: {
      mexico: "मेक्सिको",
      vietnam: "वियतनाम",
      thailand: "थाईलैंड",
    },
    platformTitle: "प्लेटफ़ॉर्म कैसे काम करता है",
    platformIntro: "मैकेनिक्स पेज। इन पर हर नंबर एक बार, कोडबेस के एक ही स्रोत से लिखा जाता है — इसलिए आप जो पढ़ते हैं वही प्लेटफ़ॉर्म असल में करता है।",
    platformCards: [
      {
        href: "/how-it-works",
        name: "यह कैसे काम करता है",
        desc: "पूरा वॉकथ्रू: पोस्टिंग से लेकर एस्क्रो रिलीज़ तक एक प्रोजेक्ट कैसे चलता है, नियोक्ताओं और इंजीनियरों दोनों के लिए — साथ ही क्वालिटी कैसे लागू होती है और विवाद में क्या होता है।",
      },
      {
        href: "/pricing",
        name: "प्राइसिंग",
        desc: "पूरी फ़ीस शेड्यूल, प्रकाशित। नियोक्ता क्या देते हैं, इंजीनियर क्या रखते हैं, और गारंटी की शर्तें — सेल्स कॉल में कुछ भी छिपा नहीं।",
      },
      {
        href: "/trust",
        name: "ट्रस्ट सेंटर",
        desc: "माइलस्टोन एस्क्रो, पहचान सत्यापन, विवाद प्रबंधन और अन्य प्लेटफ़ॉर्म सुरक्षा उपाय वास्तव में कैसे काम करते हैं।",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "इंजीनियर की प्रतिष्ठा स्कोर की गणना कैसे होती है — इनपुट, वेटेज और रेड लाइन। फ़ॉर्मूला सार्वजनिक है।",
      },
      {
        href: "/certification",
        name: "प्रमाणन परीक्षाएँ",
        desc: "प्लेटफ़ॉर्म प्रमाणन कैसे काम करता है: ट्रैक, स्तर और परीक्षा तंत्र — और क्यों केवल प्रमाणित इंजीनियर ही प्रोजेक्ट्स पर असाइन किए जा सकते हैं।",
      },
    ],
    caseTitle: "केस स्टडीज़",
    caseDesc: "Talengineer प्रोजेक्ट्स से असली, पहचान-रहित डिलीवरी कहानियाँ। हम अभी founding समूह को डिलीवर कर रहे हैं — हर पूरा हुआ प्रोजेक्ट पूरा होते ही यहाँ प्रकाशित होता है। कोई मिश्रित या गढ़ा हुआ केस नहीं।",
    caseCta: "केस स्टडीज़ देखें →",
    wpKicker: "व्हाइटपेपर",
    wpCta: "व्हाइटपेपर पढ़ें →",
  },

  fr: {
    kicker: "Centre de ressources",
    title: "Guides, données de marché et fonctionnement de la plateforme — au même endroit",
    sub: "Tout ce que nous avons publié jusqu’à présent, organisé selon ce que vous cherchez à faire : comparer les tarifs, recruter pour un poste précis, planifier une implantation transfrontalière, ou comprendre exactement comment fonctionne la plateforme. Du nouveau contenu est ajouté au fur et à mesure que nous l’écrivons — sans contenu de remplissage.",
    playbookTitle: "Derniers articles du Playbook",
    playbookIntro: "Des guides pratiques et sans fioritures sur les tarifs, le recrutement, la certification et la livraison transfrontalière pour les projets d’automatisation industrielle. Les six articles les plus récents sont ci-dessous.",
    playbookViewAll: "Voir tous les articles du Playbook →",
    read: "Lire →",
    typeLabels: {
      guide: "Guide",
      "market-data": "Données de marché",
      certification: "Certification",
      case: "Étude de cas",
    },
    marketTitle: "Données de marché",
    marketIntro: "Des chiffres en temps réel, agrégés à partir des profils d’ingénieurs actifs sur la plateforme — ainsi que les articles que nous écrivons lorsque les données révèlent quelque chose qui mérite d’être lu.",
    marketCards: [
      {
        href: "/rates",
        name: "Repères tarifaires",
        desc: "Fourchettes de tarif horaire en temps réel pour les talents en automatisation industrielle par région et compétence, issues des profils d’ingénieurs actifs sur Talengineer.",
      },
      {
        href: "/calculator",
        name: "Calculateur de coûts",
        desc: "Estimez le coût d’un ingénieur en automatisation vérifié et protégé par séquestre sur Talengineer par rapport à l’embauche d’un ingénieur local à temps plein. Gratuit, sans inscription.",
      },
      {
        href: "/coverage",
        name: "Carte de couverture",
        desc: "Où se trouvent nos ingénieurs — par région, palier TalScore et filière. Agrégée en temps réel à partir des profils d’ingénieurs actifs.",
      },
    ],
    marketArticlesTitle: "Articles sur les données de marché",
    hiringTitle: "Guides de recrutement",
    hireCard: {
      href: "/hire",
      name: "Parcourir par filière et secteur",
      desc: "Quatre filières de certification — PLC, robotique, vision industrielle et électricité — chacune avec un contexte tarifaire régional et des pages spécifiques par secteur.",
    },
    rolesLabel: "Recruter par intitulé de poste",
    rolesAll: "Tous les postes →",
    guidesCard: {
      href: "/guides",
      name: "Guides de recrutement par pays",
      desc: "Vous implantez une production au Mexique, au Vietnam ou en Thaïlande ? Contexte tarifaire local, certification et mise en service sur le terrain — à lire avant de construire.",
    },
    guideNames: {
      mexico: "Mexique",
      vietnam: "Vietnam",
      thailand: "Thaïlande",
    },
    platformTitle: "Comment fonctionne la plateforme",
    platformIntro: "Les pages qui expliquent le fonctionnement. Chaque chiffre qui y figure est écrit une seule fois, depuis une source unique dans le code — ainsi, ce que vous lisez correspond exactement à ce que fait la plateforme.",
    platformCards: [
      {
        href: "/how-it-works",
        name: "Comment ça marche",
        desc: "Le parcours complet : comment un projet se déroule de la publication au déblocage du séquestre, pour les employeurs et pour les ingénieurs — ainsi que la manière dont la qualité est assurée et ce qui se passe en cas de litige.",
      },
      {
        href: "/pricing",
        name: "Tarifs",
        desc: "Le barème de frais complet, publié. Ce que paient les employeurs, ce que conservent les ingénieurs, et les conditions de la garantie — rien de dissimulé dans un appel commercial.",
      },
      {
        href: "/trust",
        name: "Centre de confiance",
        desc: "Comment fonctionnent réellement le séquestre par jalons, la vérification d’identité, la gestion des litiges et les autres garde-fous de la plateforme.",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "Comment sont calculés les scores de réputation des ingénieurs — les données d’entrée, les pondérations et les lignes rouges. La formule est publique.",
      },
      {
        href: "/certification",
        name: "Examens de certification",
        desc: "Comment fonctionne la certification de la plateforme : filières, niveaux et modalités d’examen — et pourquoi seuls les ingénieurs certifiés peuvent être affectés à des projets.",
      },
    ],
    caseTitle: "Études de cas",
    caseDesc: "Des retours d’expérience réels et anonymisés issus de projets Talengineer. Nous livrons actuellement la cohorte fondatrice — chaque projet achevé est publié ici à mesure qu’il se termine. Aucun cas composite ou inventé.",
    caseCta: "Voir les études de cas →",
    wpKicker: "Livre blanc",
    wpCta: "Lire le livre blanc →",
  },

  de: {
    kicker: "Ressourcen-Hub",
    title: "Leitfäden, Marktdaten und Plattformmechanik — an einem Ort",
    sub: "Alles, was wir bisher veröffentlicht haben, organisiert danach, was Sie erreichen möchten: Sätze vergleichen, für eine bestimmte Rolle einstellen, einen grenzüberschreitenden Aufbau planen, oder genau verstehen, wie die Plattform funktioniert. Neues Material kommt hinzu, sobald wir es schreiben — kein Füllmaterial.",
    playbookTitle: "Neuestes aus dem Playbook",
    playbookIntro: "Praktische, unaufgeblasene Leitfäden zu Sätzen, Einstellung, Zertifizierung und grenzüberschreitender Lieferung für Projekte der industriellen Automatisierung. Die sechs neuesten Artikel unten.",
    playbookViewAll: "Alle Playbook-Artikel ansehen →",
    read: "Lesen →",
    typeLabels: {
      guide: "Leitfaden",
      "market-data": "Marktdaten",
      certification: "Zertifizierung",
      case: "Fallstudie",
    },
    marketTitle: "Marktdaten",
    marketIntro: "Live-Zahlen, aggregiert aus aktiven Ingenieurprofilen auf der Plattform — sowie die Artikel, die wir schreiben, wenn die Daten etwas Lesenswertes zeigen.",
    marketCards: [
      {
        href: "/rates",
        name: "Satz-Benchmarks",
        desc: "Echtzeit-Stundensatzspannen für Talente der industriellen Automatisierung nach Region und Fachrichtung, aus aktiven Ingenieurprofilen auf Talengineer.",
      },
      {
        href: "/calculator",
        name: "Kostenrechner",
        desc: "Schätzen Sie, was ein verifizierter, treuhandgeschützter Automatisierungsingenieur auf Talengineer im Vergleich zur Einstellung eines lokalen Vollzeitingenieurs kostet. Kostenlos, keine Anmeldung erforderlich.",
      },
      {
        href: "/coverage",
        name: "Abdeckungskarte",
        desc: "Wo unsere Ingenieure sind — nach Region, TalScore-Stufe und Fachrichtung. In Echtzeit aus aktiven Ingenieurprofilen aggregiert.",
      },
    ],
    marketArticlesTitle: "Marktdaten-Artikel",
    hiringTitle: "Einstellungsleitfäden",
    hireCard: {
      href: "/hire",
      name: "Nach Fachrichtung & Branche durchsuchen",
      desc: "Vier Zertifizierungsrichtungen — PLC, Robotik, Bildverarbeitung und Elektrotechnik — jede mit regionalem Satzkontext und branchenspezifischen Unterseiten.",
    },
    rolesLabel: "Nach Rollenbezeichnung einstellen",
    rolesAll: "Alle Rollen →",
    guidesCard: {
      href: "/guides",
      name: "Länder-Einstellungsleitfäden",
      desc: "Bauen Sie eine Produktion in Mexiko, Vietnam oder Thailand auf? Lokaler Satzkontext, Zertifizierung und Inbetriebnahme vor Ort — lesen Sie es, bevor Sie bauen.",
    },
    guideNames: {
      mexico: "Mexiko",
      vietnam: "Vietnam",
      thailand: "Thailand",
    },
    platformTitle: "Wie die Plattform funktioniert",
    platformIntro: "Die Mechanik-Seiten. Jede Zahl darauf wird einmal geschrieben, aus einer einzigen Quelle im Code — sodass das, was Sie lesen, genau dem entspricht, was die Plattform tatsächlich tut.",
    platformCards: [
      {
        href: "/how-it-works",
        name: "So funktioniert es",
        desc: "Der vollständige Durchlauf: wie ein Projekt vom Ausschreiben bis zur Treuhandfreigabe abläuft, für Auftraggeber und für Ingenieure — sowie wie Qualität durchgesetzt wird und was bei einem Streitfall passiert.",
      },
      {
        href: "/pricing",
        name: "Preise",
        desc: "Der vollständige, veröffentlichte Gebührenplan. Was Auftraggeber zahlen, was Ingenieure behalten, und die Garantiebedingungen — nichts versteckt in einem Verkaufsgespräch.",
      },
      {
        href: "/trust",
        name: "Trust Center",
        desc: "Wie Meilenstein-Treuhand, Identitätsprüfung, Streitfallbearbeitung und die anderen Plattform-Sicherungen tatsächlich funktionieren.",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "Wie Ingenieur-Reputationswerte berechnet werden — die Eingaben, die Gewichtungen und die roten Linien. Die Formel ist öffentlich.",
      },
      {
        href: "/certification",
        name: "Zertifizierungsprüfungen",
        desc: "Wie die Plattform-Zertifizierung funktioniert: Fachrichtungen, Level und Prüfungsmechanik — und warum nur zertifizierte Ingenieure Projekten zugewiesen werden können.",
      },
    ],
    caseTitle: "Fallstudien",
    caseDesc: "Echte, anonymisierte Liefergeschichten aus Talengineer-Projekten. Wir liefern derzeit die Gründungskohorte — jedes abgeschlossene Projekt wird hier veröffentlicht, sobald es abgeschlossen ist. Keine zusammengesetzten oder erfundenen Fälle.",
    caseCta: "Fallstudien ansehen →",
    wpKicker: "Whitepaper",
    wpCta: "Whitepaper lesen →",
  },

  ja: {
    kicker: "リソースハブ",
    title: "ガイド、市場データ、プラットフォームの仕組み——すべてここに",
    sub: "これまでに公開したすべてのコンテンツを、あなたがやりたいことに合わせて整理しています——料率のベンチマーク、特定の職種での採用、国境を越えた工場建設の計画、あるいはプラットフォームの仕組みを正確に理解すること。新しい資料は執筆され次第追加されます——水増しはありません。",
    playbookTitle: "Playbookの最新記事",
    playbookIntro: "産業オートメーションプロジェクトのための、料率・採用・認定・国境を越えた納品に関する、実践的で無駄のないガイド。以下は直近6本の記事です。",
    playbookViewAll: "Playbookの全記事を見る →",
    read: "読む →",
    typeLabels: {
      guide: "ガイド",
      "market-data": "市場データ",
      certification: "認定",
      case: "ケーススタディ",
    },
    marketTitle: "市場データ",
    marketIntro: "プラットフォーム上のアクティブなエンジニアプロフィールから集計されたライブ数値——加えて、データが読む価値のある何かを示したときに私たちが書く記事。",
    marketCards: [
      {
        href: "/rates",
        name: "料率ベンチマーク",
        desc: "Talengineer上のアクティブなエンジニアプロフィールを基にした、地域とスキル別の産業オートメーション人材のリアルタイム時間料金レンジ。",
      },
      {
        href: "/calculator",
        name: "コスト計算機",
        desc: "Talengineer上で検証済み・エスクロー保護された自動化エンジニアを利用する場合のコストを、現地のフルタイムエンジニアを雇う場合と比較して見積もります。無料、登録不要。",
      },
      {
        href: "/coverage",
        name: "カバレッジマップ",
        desc: "当社のエンジニアがどこにいるか——地域、TalScore階層、専門分野別。アクティブなエンジニアプロフィールからリアルタイムで集計。",
      },
    ],
    marketArticlesTitle: "市場データ記事",
    hiringTitle: "採用ガイド",
    hireCard: {
      href: "/hire",
      name: "専門分野・業界別に探す",
      desc: "4つの認定トラック——PLC、ロボティクス、マシンビジョン、電気——それぞれに地域別の料率情報と業界別のページがあります。",
    },
    rolesLabel: "職種名で採用する",
    rolesAll: "すべての職種 →",
    guidesCard: {
      href: "/guides",
      name: "国別採用ガイド",
      desc: "メキシコ、ベトナム、タイでの生産立ち上げをお考えですか？現地の料率情報、認定、そして現場での試運転——建設前にお読みください。",
    },
    guideNames: {
      mexico: "メキシコ",
      vietnam: "ベトナム",
      thailand: "タイ",
    },
    platformTitle: "プラットフォームの仕組み",
    platformIntro: "仕組みを解説するページ群です。掲載されているすべての数値は、コード内の単一のソースから一度だけ書かれています——つまり、あなたが読む内容は、プラットフォームが実際に行っていることそのものです。",
    platformCards: [
      {
        href: "/how-it-works",
        name: "仕組み",
        desc: "全体の流れ：投稿からエスクロー解放まで、プロジェクトが雇用者側とエンジニア側でどう進行するか——さらに、品質がどう担保され、紛争時に何が起こるか。",
      },
      {
        href: "/pricing",
        name: "料金",
        desc: "公開されている完全な手数料表。雇用者が支払うもの、エンジニアが受け取るもの、そして保証条件——営業電話に隠された内容は一切ありません。",
      },
      {
        href: "/trust",
        name: "トラストセンター",
        desc: "マイルストーンエスクロー、本人確認、紛争処理、その他のプラットフォームの保護機能が実際にどう機能するか。",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "エンジニアの評判スコアがどう計算されるか——入力項目、重み付け、レッドライン。計算式は公開されています。",
      },
      {
        href: "/certification",
        name: "認定試験",
        desc: "プラットフォーム認定の仕組み：トラック、レベル、試験の仕組み——そしてなぜ認定エンジニアのみがプロジェクトにアサインされるのか。",
      },
    ],
    caseTitle: "ケーススタディ",
    caseDesc: "Talengineerのプロジェクトから得られた、実在かつ匿名化された納品事例です。私たちは現在ファウンディング層への納品を進めており、完了した各プロジェクトはその都度ここに公開されます。合成事例や架空の事例は一切ありません。",
    caseCta: "ケーススタディを見る →",
    wpKicker: "ホワイトペーパー",
    wpCta: "ホワイトペーパーを読む →",
  },

  ko: {
    kicker: "리소스 허브",
    title: "가이드, 시장 데이터, 플랫폼 메커니즘 — 한곳에서",
    sub: "지금까지 공개한 모든 콘텐츠를 여러분이 하고자 하는 일에 맞게 정리했습니다 — 요율 비교, 특정 직무 채용, 국경을 넘는 공장 건설 계획, 또는 플랫폼이 정확히 어떻게 작동하는지 이해하는 것까지. 새로운 자료는 작성되는 대로 추가됩니다 — 불필요한 내용은 없습니다.",
    playbookTitle: "Playbook 최신 글",
    playbookIntro: "산업 자동화 프로젝트를 위한 요율, 채용, 인증, 국경 간 납품에 관한 실용적이고 군더더기 없는 가이드입니다. 아래는 가장 최근 6편입니다.",
    playbookViewAll: "모든 Playbook 글 보기 →",
    read: "읽기 →",
    typeLabels: {
      guide: "가이드",
      "market-data": "시장 데이터",
      certification: "인증",
      case: "사례 연구",
    },
    marketTitle: "시장 데이터",
    marketIntro: "플랫폼의 활성 엔지니어 프로필에서 집계된 실시간 수치 — 그리고 데이터가 읽을 가치가 있는 내용을 보여줄 때 저희가 작성하는 글입니다.",
    marketCards: [
      {
        href: "/rates",
        name: "요율 벤치마크",
        desc: "지역과 역량별 산업 자동화 인재의 실시간 시간당 요율 범위로, Talengineer의 활성 엔지니어 프로필에서 산출됩니다.",
      },
      {
        href: "/calculator",
        name: "비용 계산기",
        desc: "Talengineer에서 검증되고 에스크로로 보호된 자동화 엔지니어를 이용할 때의 비용을 현지 정규직 엔지니어 채용과 비교하여 추정합니다. 무료이며 가입이 필요 없습니다.",
      },
      {
        href: "/coverage",
        name: "커버리지 맵",
        desc: "저희 엔지니어가 어디에 있는지 — 지역, TalScore 등급, 전문 분야별로. 활성 엔지니어 프로필에서 실시간으로 집계됩니다.",
      },
    ],
    marketArticlesTitle: "시장 데이터 글",
    hiringTitle: "채용 가이드",
    hireCard: {
      href: "/hire",
      name: "전문 분야 및 산업별로 둘러보기",
      desc: "네 개의 인증 트랙 — PLC, 로보틱스, 머신 비전, 전기 — 각각 지역별 요율 정보와 산업별 하위 페이지가 있습니다.",
    },
    rolesLabel: "직무명으로 채용하기",
    rolesAll: "모든 직무 →",
    guidesCard: {
      href: "/guides",
      name: "국가별 채용 가이드",
      desc: "멕시코, 베트남, 태국에서 생산 시설을 구축하시나요? 현지 요율 정보, 인증, 현장 시운전 — 건설을 시작하기 전에 읽어보세요.",
    },
    guideNames: {
      mexico: "멕시코",
      vietnam: "베트남",
      thailand: "태국",
    },
    platformTitle: "플랫폼 작동 방식",
    platformIntro: "메커니즘을 다루는 페이지들입니다. 여기 실린 모든 수치는 코드 내 단일 소스에서 한 번만 작성되므로, 여러분이 읽는 내용이 곧 플랫폼이 실제로 하는 일입니다.",
    platformCards: [
      {
        href: "/how-it-works",
        name: "작동 방식",
        desc: "전체 과정 안내: 등록부터 에스크로 릴리즈까지 프로젝트가 고용주와 엔지니어 양측에서 어떻게 진행되는지 — 그리고 품질이 어떻게 강제되고 분쟁 시 무슨 일이 일어나는지.",
      },
      {
        href: "/pricing",
        name: "가격",
        desc: "공개된 전체 수수료 체계. 고용주가 지불하는 것, 엔지니어가 받는 것, 그리고 보장 조건 — 영업 통화에 숨겨진 내용은 없습니다.",
      },
      {
        href: "/trust",
        name: "Trust Center",
        desc: "마일스톤 에스크로, 신원 확인, 분쟁 처리 및 기타 플랫폼 보호 장치가 실제로 어떻게 작동하는지.",
      },
      {
        href: "/talscore",
        name: "TalScore",
        desc: "엔지니어 평판 점수가 어떻게 계산되는지 — 입력 요소, 가중치, 레드라인. 공식은 공개되어 있습니다.",
      },
      {
        href: "/certification",
        name: "인증 시험",
        desc: "플랫폼 인증이 어떻게 작동하는지: 트랙, 등급, 시험 메커니즘 — 그리고 왜 인증받은 엔지니어만 프로젝트에 배정될 수 있는지.",
      },
    ],
    caseTitle: "사례 연구",
    caseDesc: "Talengineer 프로젝트에서 나온 실제이며 익명화된 납품 사례입니다. 저희는 현재 창립 코호트를 납품하고 있으며, 완료된 각 프로젝트는 종료되는 대로 이곳에 공개됩니다. 합성되거나 지어낸 사례는 없습니다.",
    caseCta: "사례 연구 보기 →",
    wpKicker: "백서",
    wpCta: "백서 읽기 →",
  },

};

module.exports = { DICT };
