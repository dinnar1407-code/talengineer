// ── /hire/[track] 方向页字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/hire/[track].jsx 内联 UI + TRACKS 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 九语全量（2026-07-24 三期灌注）：es/vi/hi/fr/de/ja/ko 按 lib/i18n/glossary.js 的
// TERMS + STYLE 灌注，语域按各语 STYLE 指南（es usted、vi 正式、hi 天城文+行业英文借词、
// fr vouvoiement、de Sie、ja です・ます调、ko 합니다体）。PLC 属 KEEP_ENGLISH，全语言保留
// 原样（德语不改写为 SPS）。
// DICT = 页面 UI 标签（原页面 const UI）；TRACKS = 四方向内容字典
// （顶层键是方向 slug，含 serviceType/skills 与九语文案，作为第二导出，
//   不参与 DICT 九语结构断言；getStaticPaths 用 Object.keys(TRACKS) 出路由）。
// 数字纪律：各地区费率区间（REGIONS）与 RATES_NOTE 单一来源在 lib/hireMatrix.js /
// 页面侧，字典搬家不碰数；本模块文案零统计数字。

// UI 标签（章节标题、按钮等），九语。
const DICT = {
  en: {
    heroApply: 'Apply as an Engineer',
    heroPost: 'Post a Project — Free',
    skillsTitle: 'Skills we screen for',
    verifyTitle: 'What platform certification verifies',
    verifyIntro:
      'Every engineer passes a practical AI technical screener before they can be matched. On top of that, they can earn certification in this track at three levels — and only certified engineers can be assigned to your project.',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    industriesTitle: 'Hire by industry',
    rolesTitle: 'Common role titles',
    guidesTitle: 'Setting up in a new country?',
    guidesBody:
      'Read our country hiring guides for local rate ranges, certification and on-the-ground commissioning before you build.',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    l1: 'L1 — Fundamentals',
    l2: 'L2 — Independent',
    l3: 'L3 — Expert',
  },
  zh: {
    heroApply: '以工程师身份申请',
    heroPost: '免费发布项目',
    skillsTitle: '我们筛选的技能',
    verifyTitle: '平台认证验证什么',
    verifyIntro:
      '每位工程师在被匹配前都要通过一套实操型 AI 技术筛选。在此之上，还可在该方向考取三个级别的认证——只有持证工程师才能被指派到你的项目。',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    industriesTitle: '按行业细分',
    rolesTitle: '常见职位名',
    guidesTitle: '要在新国家建厂？',
    guidesBody: '动工前，先读我们的分国用人指南：了解当地费率区间、认证与落地调试。',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    l1: 'L1 — 基础',
    l2: 'L2 — 独立',
    l3: 'L3 — 专家',
  },
  es: {
    heroApply: 'Postularse como ingeniero',
    heroPost: 'Publicar un proyecto — Gratis',
    skillsTitle: 'Habilidades que evaluamos',
    verifyTitle: 'Qué verifica la certificación de la plataforma',
    verifyIntro:
      'Todo ingeniero aprueba una evaluación técnica práctica de IA antes de poder ser emparejado. Además, puede obtener la certificación en esta especialidad en tres niveles — y solo los ingenieros certificados pueden ser asignados a su proyecto.',
    ratesTitle: 'Rangos de tarifas por región',
    regionCol: 'Región',
    rateCol: 'Por hora (USD)',
    industriesTitle: 'Contratar por industria',
    rolesTitle: 'Títulos de puesto habituales',
    guidesTitle: '¿Va a establecerse en un país nuevo?',
    guidesBody:
      'Antes de construir, lea nuestras guías de contratación por país para conocer los rangos de tarifas locales, la certificación y la puesta en marcha sobre el terreno.',
    ctaHeading: '¿Listo para contratar?',
    ctaBody: 'Publique su proyecto y conéctese con ingenieros certificados y preseleccionados. El depósito en garantía por hitos protege a ambas partes.',
    l1: 'L1 — Fundamentos',
    l2: 'L2 — Independiente',
    l3: 'L3 — Experto',
  },
  vi: {
    heroApply: 'Ứng tuyển làm kỹ sư',
    heroPost: 'Đăng dự án — Miễn phí',
    skillsTitle: 'Kỹ năng chúng tôi sàng lọc',
    verifyTitle: 'Chứng chỉ nền tảng xác minh điều gì',
    verifyIntro:
      'Mọi kỹ sư đều phải vượt qua bài sàng lọc kỹ thuật thực hành bằng AI trước khi được ghép nối. Ngoài ra, họ có thể đạt chứng chỉ trong chuyên môn này ở ba cấp độ — và chỉ kỹ sư có chứng chỉ mới được phân công vào dự án của bạn.',
    ratesTitle: 'Mức phí theo khu vực',
    regionCol: 'Khu vực',
    rateCol: 'Theo giờ (USD)',
    industriesTitle: 'Tuyển theo ngành',
    rolesTitle: 'Các chức danh phổ biến',
    guidesTitle: 'Đang chuẩn bị xây dựng ở một quốc gia mới?',
    guidesBody:
      'Trước khi xây dựng, hãy đọc các hướng dẫn tuyển dụng theo quốc gia của chúng tôi để biết mức phí địa phương, chứng chỉ và việc chạy thử tại hiện trường.',
    ctaHeading: 'Sẵn sàng tuyển dụng?',
    ctaBody: 'Đăng dự án của bạn và ghép nối với các kỹ sư có chứng chỉ, đã qua sàng lọc trước. Ký quỹ theo cột mốc bảo vệ cả hai bên.',
    l1: 'L1 — Cơ bản',
    l2: 'L2 — Độc lập',
    l3: 'L3 — Chuyên gia',
  },
  hi: {
    heroApply: 'इंजीनियर के रूप में आवेदन करें',
    heroPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',
    skillsTitle: 'हम जो स्किल्स स्क्रीन करते हैं',
    verifyTitle: 'प्लेटफ़ॉर्म प्रमाणन क्या सत्यापित करता है',
    verifyIntro:
      'हर इंजीनियर मैच होने से पहले एक व्यावहारिक AI टेक्निकल स्क्रीनर पास करता है। इसके ऊपर, वह इस ट्रैक में तीन स्तरों पर प्रमाणन अर्जित कर सकता है — और केवल प्रमाणित इंजीनियर ही आपके प्रोजेक्ट को असाइन किए जा सकते हैं।',
    ratesTitle: 'क्षेत्र के अनुसार दर सीमाएँ',
    regionCol: 'क्षेत्र',
    rateCol: 'प्रति घंटा (USD)',
    industriesTitle: 'इंडस्ट्री से हायर करें',
    rolesTitle: 'आम रोल टाइटल',
    guidesTitle: 'किसी नए देश में सेटअप कर रहे हैं?',
    guidesBody: 'बनाना शुरू करने से पहले, स्थानीय दर सीमाओं, प्रमाणन और ऑन-ग्राउंड कमीशनिंग के लिए हमारी कंट्री हायरिंग गाइड पढ़ें।',
    ctaHeading: 'नियुक्ति के लिए तैयार हैं?',
    ctaBody: 'अपना प्रोजेक्ट पोस्ट करें और पहले से जांचे-परखे, प्रमाणित इंजीनियरों से मैच करें। माइलस्टोन एस्क्रो दोनों पक्षों की सुरक्षा करता है।',
    l1: 'L1 — मूल बातें',
    l2: 'L2 — स्वतंत्र',
    l3: 'L3 — विशेषज्ञ',
  },
  fr: {
    heroApply: 'Postuler comme ingénieur',
    heroPost: 'Publier un projet — Gratuit',
    skillsTitle: 'Compétences que nous évaluons',
    verifyTitle: 'Ce que vérifie la certification de la plateforme',
    verifyIntro:
      'Chaque ingénieur réussit une évaluation technique pratique par IA avant de pouvoir être mis en relation. En complément, il peut obtenir la certification dans cette filière à trois niveaux — et seuls les ingénieurs certifiés peuvent être affectés à votre projet.',
    ratesTitle: 'Fourchettes de tarifs par région',
    regionCol: 'Région',
    rateCol: 'Tarif horaire (USD)',
    industriesTitle: 'Recruter par secteur',
    rolesTitle: 'Intitulés de poste courants',
    guidesTitle: 'Vous vous implantez dans un nouveau pays ?',
    guidesBody:
      'Avant de vous lancer, consultez nos guides de recrutement par pays : fourchettes de tarifs locales, certification et mise en service sur le terrain.',
    ctaHeading: 'Prêt à recruter ?',
    ctaBody: 'Publiez votre projet et soyez mis en relation avec des ingénieurs certifiés et présélectionnés. Le séquestre par jalons protège les deux parties.',
    l1: 'L1 — Fondamentaux',
    l2: 'L2 — Autonome',
    l3: 'L3 — Expert',
  },
  de: {
    heroApply: 'Als Ingenieur bewerben',
    heroPost: 'Projekt ausschreiben — kostenlos',
    skillsTitle: 'Fähigkeiten, die wir prüfen',
    verifyTitle: 'Was die Plattform-Zertifizierung verifiziert',
    verifyIntro:
      'Jeder Ingenieur besteht einen praxisnahen KI-Techniktest, bevor er zugeordnet werden kann. Darüber hinaus kann er in dieser Spezialisierung auf drei Stufen die Zertifizierung erwerben — und nur zertifizierte Ingenieure können Ihrem Projekt zugewiesen werden.',
    ratesTitle: 'Satzspannen nach Region',
    regionCol: 'Region',
    rateCol: 'Stundensatz (USD)',
    industriesTitle: 'Nach Branche einstellen',
    rolesTitle: 'Gängige Rollenbezeichnungen',
    guidesTitle: 'Bauen Sie in einem neuen Land auf?',
    guidesBody:
      'Lesen Sie vor dem Aufbau unsere länderspezifischen Einstellungsleitfäden für lokale Satzspannen, Zertifizierung und Inbetriebnahme vor Ort.',
    ctaHeading: 'Bereit einzustellen?',
    ctaBody: 'Schreiben Sie Ihr Projekt aus und werden Sie mit vorab geprüften, zertifizierten Ingenieuren zusammengebracht. Die Meilenstein-Treuhand schützt beide Seiten.',
    l1: 'L1 — Grundlagen',
    l2: 'L2 — Selbstständig',
    l3: 'L3 — Experte',
  },
  ja: {
    heroApply: 'エンジニアとして応募',
    heroPost: 'プロジェクトを掲載 — 無料',
    skillsTitle: '審査するスキル',
    verifyTitle: 'プラットフォーム認定が検証すること',
    verifyIntro:
      'すべてのエンジニアは、マッチング前に実践的なAI技術スクリーニングに合格します。さらに、このトラックで3段階の認定を取得でき——アサインされるのは認定エンジニアだけです。',
    ratesTitle: '地域別の料金レンジ',
    regionCol: '地域',
    rateCol: '時間料金（USD）',
    industriesTitle: '業界別に採用',
    rolesTitle: 'よくある職種名',
    guidesTitle: '新しい国での立ち上げをお考えですか？',
    guidesBody: '着手前に、現地の料金レンジ、認定、現地での試運転について国別採用ガイドをご覧ください。',
    ctaHeading: '採用の準備はできましたか？',
    ctaBody: 'プロジェクトを掲載して、事前審査済みの認定エンジニアとマッチングしましょう。マイルストーン・エスクローが双方を守ります。',
    l1: 'L1 — 基礎',
    l2: 'L2 — 独立',
    l3: 'L3 — エキスパート',
  },
  ko: {
    heroApply: '엔지니어로 지원하기',
    heroPost: '프로젝트 등록 — 무료',
    skillsTitle: '심사하는 스킬',
    verifyTitle: '플랫폼 인증이 검증하는 것',
    verifyIntro:
      '모든 엔지니어는 매칭되기 전에 실무형 AI 기술 심사를 통과합니다. 그 위에 이 트랙에서 3단계로 인증을 취득할 수 있으며 — 인증 엔지니어만 프로젝트에 배정될 수 있습니다.',
    ratesTitle: '지역별 요율 범위',
    regionCol: '지역',
    rateCol: '시간당(USD)',
    industriesTitle: '산업별 채용',
    rolesTitle: '자주 쓰이는 직무명',
    guidesTitle: '새로운 국가에 진출하시나요?',
    guidesBody: '착수하기 전에 현지 요율 범위, 인증, 현장 시운전에 관한 국가별 채용 가이드를 확인하세요.',
    ctaHeading: '채용할 준비가 되셨나요?',
    ctaBody: '프로젝트를 등록하고 사전 심사를 거친 인증 엔지니어와 매칭하세요. 마일스톤 에스크로가 양측을 보호합니다.',
    l1: 'L1 — 기초',
    l2: 'L2 — 독립 수행',
    l3: 'L3 — 전문가',
  },
};

// 四个方向的内容（plc / robotics / vision / electrical），九语各一套。
const TRACKS = {
  plc: {
    serviceType: 'PLC Programming Talent',
    skills: ['Siemens TIA Portal', 'Rockwell Studio 5000', 'Ladder / ST', 'Mitsubishi', 'Beckhoff TwinCAT', 'Safety PLC'],
    en: {
      kicker: 'PLC & Controls',
      title: 'Hire Certified PLC Programmers',
      sub: 'Pre-screened Siemens, Rockwell, Mitsubishi and Beckhoff programmers — verified by practical assessment and ready to deliver on milestone escrow.',
      lead1:
        'PLC programming is the core of almost every automation project. The hard part of hiring is not finding people who list a platform on a résumé — it is confirming they can write clean, maintainable logic and commission it under pressure on your exact controller.',
      lead2:
        'We match by platform, not just by keyword. Whether your installed base is Siemens S7-1500 or Rockwell ControlLogix, you can filter to engineers whose depth has been demonstrated under test conditions.',
      l1: 'Solid fundamentals — executes well-specified ladder/ST work under some guidance.',
      l2: 'Owns a scope end to end, makes sound design decisions, delivers with minimal oversight.',
      l3: 'Architects control systems, handles difficult commissioning and safety, leads technically.',
    },
    zh: {
      kicker: 'PLC 与控制',
      title: '雇佣持证 PLC 程序员',
      sub: '经过预审的 Siemens、Rockwell、Mitsubishi、Beckhoff 程序员——实操验证，可在里程碑托管下交付。',
      lead1:
        'PLC 编程是几乎每个自动化项目的核心。招人真正的难点，不是找到简历上写着某个平台的人，而是确认他能写出干净、可维护的逻辑，并在你这台具体控制器上顶着压力完成调试。',
      lead2:
        '我们按平台匹配，而不只是按关键词。无论你的设备是 Siemens S7-1500 还是 Rockwell ControlLogix，都能筛出在测试条件下被验证过深度的工程师。',
      l1: '基础扎实——在一定指导下完成范围明确的 ladder/ST 工作。',
      l2: '能端到端负责一个范围，做出合理设计决策，少量监督即可交付。',
      l3: '能架构控制系统，处理疑难调试与安全，技术上带队。',
    },
    es: {
      kicker: 'PLC y control',
      title: 'Contrate programadores PLC certificados',
      sub: 'Programadores de Siemens, Rockwell, Mitsubishi y Beckhoff preseleccionados — verificados mediante evaluación práctica y listos para entregar bajo depósito en garantía por hitos.',
      lead1:
        'La programación de PLC es el núcleo de casi todo proyecto de automatización. Lo difícil de contratar no es encontrar personas que enumeren una plataforma en su currículum, sino confirmar que pueden escribir lógica limpia y mantenible y ponerla en marcha bajo presión en su controlador exacto.',
      lead2:
        'Emparejamos por plataforma, no solo por palabra clave. Ya sea que su base instalada sea Siemens S7-1500 o Rockwell ControlLogix, puede filtrar a ingenieros cuya profundidad ha sido demostrada en condiciones de prueba.',
      l1: 'Fundamentos sólidos — ejecuta trabajo de ladder/ST bien definido con cierta orientación.',
      l2: 'Se hace cargo de un alcance de principio a fin, toma decisiones de diseño acertadas, entrega con supervisión mínima.',
      l3: 'Diseña la arquitectura de sistemas de control, maneja puestas en marcha y seguridad difíciles, lidera técnicamente.',
    },
    vi: {
      kicker: 'PLC & Điều khiển',
      title: 'Tuyển lập trình viên PLC có chứng chỉ',
      sub: 'Lập trình viên Siemens, Rockwell, Mitsubishi và Beckhoff đã qua sàng lọc — được xác minh bằng đánh giá thực hành và sẵn sàng bàn giao dưới hình thức ký quỹ theo cột mốc.',
      lead1:
        'Lập trình PLC là cốt lõi của gần như mọi dự án tự động hóa. Phần khó khi tuyển dụng không phải là tìm người liệt kê một nền tảng trên hồ sơ, mà là xác nhận họ có thể viết logic sạch, dễ bảo trì và chạy thử dưới áp lực trên đúng bộ điều khiển của bạn.',
      lead2:
        'Chúng tôi ghép nối theo nền tảng, không chỉ theo từ khóa. Dù hệ thống của bạn dùng Siemens S7-1500 hay Rockwell ControlLogix, bạn đều có thể lọc ra những kỹ sư có chuyên môn đã được chứng minh trong điều kiện kiểm tra thực tế.',
      l1: 'Nền tảng vững — thực hiện tốt công việc ladder/ST được xác định rõ dưới một số hướng dẫn.',
      l2: 'Làm chủ một phạm vi công việc từ đầu đến cuối, đưa ra quyết định thiết kế hợp lý, bàn giao với sự giám sát tối thiểu.',
      l3: 'Kiến trúc hệ thống điều khiển, xử lý các ca chạy thử và an toàn khó, dẫn dắt về mặt kỹ thuật.',
    },
    hi: {
      kicker: 'PLC व कंट्रोल',
      title: 'प्रमाणित PLC प्रोग्रामर हायर करें',
      sub: 'पहले से जांचे गए Siemens, Rockwell, Mitsubishi और Beckhoff प्रोग्रामर — व्यावहारिक मूल्यांकन से सत्यापित, माइलस्टोन एस्क्रो पर डिलीवर करने के लिए तैयार।',
      lead1:
        'PLC प्रोग्रामिंग लगभग हर ऑटोमेशन प्रोजेक्ट का मूल है। हायरिंग में असली मुश्किल यह नहीं कि रिज़्यूमे पर कोई प्लेटफ़ॉर्म लिखने वाले लोग मिल जाएँ — असली मुश्किल यह पुष्टि करना है कि वे साफ़, मेंटेन करने-योग्य लॉजिक लिख सकते हैं और आपके एग्ज़ैक्ट कंट्रोलर पर दबाव में कमीशन कर सकते हैं।',
      lead2:
        'हम केवल कीवर्ड से नहीं, प्लेटफ़ॉर्म के आधार पर मैच करते हैं। चाहे आपका इंस्टॉल्ड बेस Siemens S7-1500 हो या Rockwell ControlLogix, आप ऐसे इंजीनियरों पर फ़िल्टर कर सकते हैं जिनकी गहराई टेस्ट कंडीशन में साबित हो चुकी है।',
      l1: 'ठोस बुनियाद — कुछ मार्गदर्शन में अच्छी तरह परिभाषित ladder/ST काम को अंजाम देते हैं।',
      l2: 'शुरू से अंत तक एक स्कोप को खुद संभालते हैं, ठोस डिज़ाइन निर्णय लेते हैं, न्यूनतम निगरानी में डिलीवर करते हैं।',
      l3: 'कंट्रोल सिस्टम आर्किटेक्ट करते हैं, मुश्किल कमीशनिंग व सेफ़्टी संभालते हैं, तकनीकी रूप से नेतृत्व करते हैं।',
    },
    fr: {
      kicker: 'PLC et contrôle-commande',
      title: 'Recrutez des programmeurs PLC certifiés',
      sub: 'Programmeurs Siemens, Rockwell, Mitsubishi et Beckhoff présélectionnés — vérifiés par une évaluation pratique et prêts à livrer sous séquestre par jalons.',
      lead1:
        'La programmation PLC est le cœur de presque tous les projets d’automatisation. La difficulté du recrutement n’est pas de trouver des personnes qui mentionnent une plateforme sur leur CV — c’est de confirmer qu’elles peuvent écrire une logique propre et maintenable et la mettre en service sous pression sur le contrôleur précis que vous utilisez.',
      lead2:
        'Nous mettons en relation par plateforme, pas seulement par mot-clé. Que votre parc installé soit du Siemens S7-1500 ou du Rockwell ControlLogix, vous pouvez filtrer les ingénieurs dont la maîtrise a été démontrée en conditions de test.',
      l1: 'Bases solides — exécute un travail ladder/ST bien spécifié avec un certain encadrement.',
      l2: 'Prend en charge un périmètre de bout en bout, fait des choix de conception judicieux, livre avec une supervision minimale.',
      l3: 'Conçoit l’architecture des systèmes de contrôle-commande, gère les mises en service délicates et les questions de sécurité, dirige techniquement.',
    },
    de: {
      kicker: 'PLC & Steuerungstechnik',
      title: 'Zertifizierte PLC-Programmierer einstellen',
      sub: 'Vorab geprüfte Siemens-, Rockwell-, Mitsubishi- und Beckhoff-Programmierer — durch praxisnahes Assessment verifiziert und bereit zur Lieferung unter Meilenstein-Treuhand.',
      lead1:
        'PLC-Programmierung ist der Kern fast jedes Automatisierungsprojekts. Das Schwierige an der Einstellung ist nicht, Leute zu finden, die eine Plattform im Lebenslauf auflisten — sondern zu bestätigen, dass sie sauberen, wartbaren Code schreiben und ihn unter Druck an genau Ihrem Controller in Betrieb nehmen können.',
      lead2:
        'Wir ordnen nach Plattform zu, nicht nur nach Schlagwort. Ob Ihre installierte Basis Siemens S7-1500 oder Rockwell ControlLogix ist — Sie können nach Ingenieuren filtern, deren Tiefe unter Testbedingungen nachgewiesen wurde.',
      l1: 'Solide Grundlagen — führt gut spezifizierte Ladder-/ST-Arbeiten mit etwas Anleitung aus.',
      l2: 'Übernimmt einen Aufgabenbereich end-to-end, trifft solide Designentscheidungen, liefert mit minimaler Aufsicht.',
      l3: 'Entwirft Steuerungssysteme, meistert anspruchsvolle Inbetriebnahmen und Sicherheitsfragen, führt technisch.',
    },
    ja: {
      kicker: 'PLCと制御',
      title: '認定PLCプログラマーを採用',
      sub: '事前審査済みのSiemens、Rockwell、Mitsubishi、Beckhoffプログラマー——実践的なアセスメントで検証済みで、マイルストーン・エスクローでの納品にすぐ対応できます。',
      lead1:
        'PLCプログラミングは、ほぼすべてのオートメーションプロジェクトの中核です。採用の本当の難しさは、履歴書にプラットフォーム名を書ける人を見つけることではなく、その人がクリーンで保守しやすいロジックを書き、あなたの具体的なコントローラー上でプレッシャーの中、試運転までやり切れるかを確認することです。',
      lead2:
        '私たちはキーワードだけでなく、プラットフォームでマッチングします。導入済みの機器がSiemens S7-1500でもRockwell ControlLogixでも、テスト条件下で実力が証明されたエンジニアに絞り込めます。',
      l1: '基礎がしっかりしている——ある程度の指導のもとで、仕様が明確なladder/ST作業を遂行できます。',
      l2: 'スコープをエンドツーエンドで担当し、的確な設計判断を行い、最小限の監督で納品できます。',
      l3: '制御システムを設計し、難易度の高い試運転と安全対応を担い、技術面でリードします。',
    },
    ko: {
      kicker: 'PLC 및 제어',
      title: '인증 PLC 프로그래머 채용',
      sub: '사전 심사를 거친 Siemens, Rockwell, Mitsubishi, Beckhoff 프로그래머 — 실무형 평가로 검증되었으며 마일스톤 에스크로 하에 바로 납품할 수 있습니다.',
      lead1:
        'PLC 프로그래밍은 거의 모든 자동화 프로젝트의 핵심입니다. 채용의 진짜 어려움은 이력서에 플랫폼을 나열한 사람을 찾는 것이 아니라, 그 사람이 깔끔하고 유지보수 가능한 로직을 작성하고 당신의 정확한 컨트롤러에서 압박 속에서도 시운전까지 해낼 수 있는지 확인하는 것입니다.',
      lead2:
        '저희는 키워드가 아닌 플랫폼 기준으로 매칭합니다. 보유 설비가 Siemens S7-1500이든 Rockwell ControlLogix든, 테스트 조건에서 실력이 입증된 엔지니어로 필터링할 수 있습니다.',
      l1: '탄탄한 기초 — 어느 정도의 지도 하에 범위가 명확한 ladder/ST 작업을 수행합니다.',
      l2: '범위를 처음부터 끝까지 직접 책임지고, 합리적인 설계 결정을 내리며, 최소한의 감독으로 납품합니다.',
      l3: '제어 시스템을 설계하고, 어려운 시운전과 안전 문제를 처리하며, 기술적으로 리드합니다.',
    },
  },
  robotics: {
    serviceType: 'Industrial Robotics Talent',
    skills: ['Fanuc', 'KUKA', 'ABB', 'Yaskawa', 'Cell commissioning', 'Path optimization'],
    en: {
      kicker: 'Robotics',
      title: 'Hire Certified Robotics Engineers',
      sub: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, programming and on-site commissioning — verified and escrow-protected.',
      lead1:
        'Robot cell commissioning is hands-on, high-pressure and platform-specific. A mistake is expensive and public, so this is exactly the phase where verified skill matters most.',
      lead2:
        'Our robotics engineers are screened on real path, tooling and integration problems, and can be certified at three levels so you can match seniority to the risk of the job.',
      l1: 'Executes taught programs and well-defined cell work with guidance.',
      l2: 'Programs and commissions a cell independently, integrates PLC and peripherals.',
      l3: 'Designs complex cells, tunes cycle time, leads difficult multi-robot commissioning.',
    },
    zh: {
      kicker: '机器人',
      title: '雇佣持证机器人工程师',
      sub: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、编程与现场调试——经过验证，托管保障。',
      lead1:
        '机器人工作站调试是高压、动手、平台专属的活。一旦出错代价高且显眼，所以这恰恰是最需要验证过技能的环节。',
      lead2:
        '我们的机器人工程师会在真实的路径、工装与集成问题上被筛选，并可考取三个级别的认证，让你按任务风险匹配资历。',
      l1: '在指导下执行示教程序与范围明确的工作站工作。',
      l2: '独立完成工作站编程与调试，集成 PLC 与外围设备。',
      l3: '设计复杂工作站，优化节拍，带队完成疑难的多机联调。',
    },
    es: {
      kicker: 'Robótica',
      title: 'Contrate ingenieros de robótica certificados',
      sub: 'Especialistas en Fanuc, KUKA, ABB y Yaskawa para diseño de celdas, programación y puesta en marcha en sitio — verificados y protegidos por depósito en garantía.',
      lead1:
        'La puesta en marcha de celdas robóticas es práctica, de alta presión y específica de cada plataforma. Un error resulta costoso y visible, así que es precisamente en esta fase donde más importa una habilidad verificada.',
      lead2:
        'Nuestros ingenieros de robótica son evaluados con problemas reales de trayectoria, utillaje e integración, y pueden certificarse en tres niveles para que usted haga coincidir la experiencia con el riesgo del trabajo.',
      l1: 'Ejecuta programas ya enseñados y trabajo de celda bien definido con orientación.',
      l2: 'Programa y pone en marcha una celda de forma independiente, integra PLC y periféricos.',
      l3: 'Diseña celdas complejas, ajusta el tiempo de ciclo, lidera puestas en marcha difíciles con múltiples robots.',
    },
    vi: {
      kicker: 'Robot công nghiệp',
      title: 'Tuyển kỹ sư robot có chứng chỉ',
      sub: 'Chuyên gia Fanuc, KUKA, ABB và Yaskawa cho thiết kế tế bào, lập trình và chạy thử tại hiện trường — được xác minh và bảo vệ bằng ký quỹ.',
      lead1:
        'Chạy thử tế bào robot là công việc động tay, áp lực cao và đặc thù theo từng nền tảng. Một sai sót có thể tốn kém và dễ bị nhìn thấy, nên đây chính là giai đoạn mà kỹ năng đã được xác minh có ý nghĩa nhất.',
      lead2:
        'Kỹ sư robot của chúng tôi được sàng lọc qua các bài toán thực tế về quỹ đạo, đồ gá và tích hợp, và có thể đạt chứng chỉ ở ba cấp độ để bạn khớp mức độ kinh nghiệm với rủi ro của công việc.',
      l1: 'Thực hiện các chương trình đã được dạy sẵn và công việc tế bào được xác định rõ dưới sự hướng dẫn.',
      l2: 'Lập trình và chạy thử một tế bào độc lập, tích hợp PLC và các thiết bị ngoại vi.',
      l3: 'Thiết kế các tế bào phức tạp, tối ưu thời gian chu kỳ, dẫn dắt các ca chạy thử đa robot khó.',
    },
    hi: {
      kicker: 'रोबोटिक्स',
      title: 'प्रमाणित रोबोटिक्स इंजीनियर हायर करें',
      sub: 'सेल डिज़ाइन, प्रोग्रामिंग और ऑन-साइट कमीशनिंग के लिए Fanuc, KUKA, ABB और Yaskawa विशेषज्ञ — सत्यापित और एस्क्रो-सुरक्षित।',
      lead1:
        'रोबोट सेल कमीशनिंग हाथों-हाथ, हाई-प्रेशर और प्लेटफ़ॉर्म-स्पेसिफ़िक काम है। एक गलती महंगी और सार्वजनिक होती है, इसलिए यही वह चरण है जहाँ सत्यापित स्किल सबसे ज़्यादा मायने रखती है।',
      lead2:
        'हमारे रोबोटिक्स इंजीनियर वास्तविक पाथ, टूलिंग और इंटीग्रेशन समस्याओं पर स्क्रीन किए जाते हैं, और तीन स्तरों पर प्रमाणित हो सकते हैं ताकि आप वरिष्ठता को काम के जोखिम से मैच कर सकें।',
      l1: 'मार्गदर्शन में सिखाए गए प्रोग्राम व अच्छी तरह परिभाषित सेल कार्य को अंजाम देते हैं।',
      l2: 'स्वतंत्र रूप से सेल प्रोग्राम व कमीशन करते हैं, PLC व पेरिफेरल्स को इंटीग्रेट करते हैं।',
      l3: 'जटिल सेल डिज़ाइन करते हैं, साइकल टाइम ट्यून करते हैं, मुश्किल मल्टी-रोबोट कमीशनिंग का नेतृत्व करते हैं।',
    },
    fr: {
      kicker: 'Robotique',
      title: 'Recrutez des ingénieurs en robotique certifiés',
      sub: 'Spécialistes Fanuc, KUKA, ABB et Yaskawa pour la conception de cellules, la programmation et la mise en service sur site — vérifiés et protégés par séquestre.',
      lead1:
        'La mise en service de cellules robotisées est un travail concret, sous forte pression et spécifique à chaque plateforme. Une erreur coûte cher et se voit : c’est précisément à cette étape qu’une compétence vérifiée compte le plus.',
      lead2:
        'Nos ingénieurs en robotique sont évalués sur des problèmes réels de trajectoire, d’outillage et d’intégration, et peuvent être certifiés à trois niveaux afin que vous puissiez adapter le niveau d’expérience au risque de la mission.',
      l1: 'Exécute des programmes déjà appris et un travail de cellule bien défini, avec encadrement.',
      l2: 'Programme et met en service une cellule de façon autonome, intègre le PLC et les périphériques.',
      l3: 'Conçoit des cellules complexes, optimise le temps de cycle, dirige des mises en service multi-robots difficiles.',
    },
    de: {
      kicker: 'Robotik',
      title: 'Zertifizierte Robotik-Ingenieure einstellen',
      sub: 'Fanuc-, KUKA-, ABB- und Yaskawa-Spezialisten für Zellendesign, Programmierung und Inbetriebnahme vor Ort — verifiziert und treuhandgeschützt.',
      lead1:
        'Die Inbetriebnahme von Roboterzellen ist praktische, hochgradig belastende und plattformspezifische Arbeit. Ein Fehler ist teuer und sichtbar — genau in dieser Phase zählt verifiziertes Können am meisten.',
      lead2:
        'Unsere Robotik-Ingenieure werden an realen Bahn-, Werkzeug- und Integrationsproblemen geprüft und können auf drei Stufen zertifiziert werden, sodass Sie die Erfahrung dem Risiko des Auftrags anpassen können.',
      l1: 'Führt eingelernte Programme und gut definierte Zellenarbeiten mit Anleitung aus.',
      l2: 'Programmiert und nimmt eine Zelle eigenständig in Betrieb, integriert PLC und Peripherie.',
      l3: 'Entwirft komplexe Zellen, optimiert die Taktzeit, führt anspruchsvolle Mehr-Roboter-Inbetriebnahmen.',
    },
    ja: {
      kicker: 'ロボティクス',
      title: '認定ロボティクスエンジニアを採用',
      sub: 'セル設計、プログラミング、現地試運転を担うFanuc、KUKA、ABB、Yaskawaのスペシャリスト——検証済みでエスクロー保護付きです。',
      lead1:
        'ロボットセルの試運転は、実作業でプレッシャーが高く、プラットフォームごとに特有です。ミスは高くつき、目に見える形で表れるため、まさにこの段階で検証済みのスキルが最も重要になります。',
      lead2:
        '当社のロボティクスエンジニアは、実際の経路、治具、統合上の課題で審査され、3段階で認定を取得できるため、仕事のリスクに応じて経験レベルをマッチングできます。',
      l1: '指導のもとで、教示済みプログラムと仕様が明確なセル作業を遂行します。',
      l2: '独立してセルのプログラミングと試運転を行い、PLCと周辺機器を統合します。',
      l3: '複雑なセルを設計し、サイクルタイムを調整し、難易度の高い複数台ロボットの試運転をリードします。',
    },
    ko: {
      kicker: '로보틱스',
      title: '인증 로보틱스 엔지니어 채용',
      sub: '셀 설계, 프로그래밍, 현장 시운전을 담당하는 Fanuc, KUKA, ABB, Yaskawa 전문가 — 검증되었으며 에스크로로 보호됩니다.',
      lead1:
        '로봇 셀 시운전은 실무 중심에, 압박이 크고, 플랫폼마다 특성이 다른 작업입니다. 실수는 비용이 크고 눈에 띄기 때문에, 바로 이 단계에서 검증된 실력이 가장 중요합니다.',
      lead2:
        '저희 로보틱스 엔지니어는 실제 경로, 툴링, 통합 문제로 심사되며, 3단계로 인증받을 수 있어 업무의 위험도에 맞춰 경력 수준을 매칭할 수 있습니다.',
      l1: '지도 하에 이미 교시된 프로그램과 범위가 명확한 셀 작업을 수행합니다.',
      l2: '독립적으로 셀을 프로그래밍하고 시운전하며, PLC와 주변기기를 통합합니다.',
      l3: '복잡한 셀을 설계하고, 사이클 타임을 조정하며, 까다로운 다중 로봇 시운전을 리드합니다.',
    },
  },
  vision: {
    serviceType: 'Machine Vision Talent',
    skills: ['Cognex', 'Keyence', 'Halcon', 'Lighting & optics', 'Calibration', 'Inspection & guidance'],
    en: {
      kicker: 'Machine Vision',
      title: 'Hire Certified Machine Vision Engineers',
      sub: 'Inspection, guidance and measurement specialists across Cognex, Keyence and Halcon — verified where it counts: lighting, calibration and real-world variation.',
      lead1:
        'Machine vision is where "it worked in the lab" projects break on the floor. Lighting, optics, calibration and part-presentation variation decide whether a system is reliable — and none of that shows up on a résumé.',
      lead2:
        'We screen vision engineers on the practical judgment that separates a demo from a production-grade system, and certify them at three levels of depth.',
      l1: 'Configures well-defined inspections and sets up standard lighting.',
      l2: 'Designs robust inspection/guidance, handles calibration and variation independently.',
      l3: 'Architects demanding vision systems, solves difficult lighting and accuracy problems.',
    },
    zh: {
      kicker: '机器视觉',
      title: '雇佣持证机器视觉工程师',
      sub: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量专家——在真正关键处验证：打光、标定与现实变化。',
      lead1:
        '机器视觉正是"实验室里好好的、到现场就不对"的重灾区。打光、光学、标定与来料变化决定系统是否可靠——而这些简历上都看不出来。',
      lead2:
        '我们在"把 demo 和量产级系统区分开"的实操判断上筛选视觉工程师，并按三个深度级别发放认证。',
      l1: '配置范围明确的检测，搭建标准打光。',
      l2: '设计稳健的检测/引导，独立处理标定与变化。',
      l3: '架构高要求的视觉系统，解决疑难的打光与精度问题。',
    },
    es: {
      kicker: 'Visión artificial',
      title: 'Contrate ingenieros de visión artificial certificados',
      sub: 'Especialistas en inspección, guiado y medición en Cognex, Keyence y Halcon — verificados donde realmente importa: iluminación, calibración y variación del mundo real.',
      lead1:
        'La visión artificial es donde los proyectos que "funcionaban en el laboratorio" fallan en planta. La iluminación, la óptica, la calibración y la variación en la presentación de piezas determinan si un sistema es confiable — y nada de eso aparece en un currículum.',
      lead2:
        'Evaluamos a los ingenieros de visión con el criterio práctico que separa una demo de un sistema de nivel de producción, y los certificamos en tres niveles de profundidad.',
      l1: 'Configura inspecciones bien definidas y monta la iluminación estándar.',
      l2: 'Diseña inspección/guiado robustos, maneja la calibración y la variación de forma independiente.',
      l3: 'Diseña la arquitectura de sistemas de visión exigentes, resuelve problemas difíciles de iluminación y precisión.',
    },
    vi: {
      kicker: 'Thị giác máy',
      title: 'Tuyển kỹ sư thị giác máy có chứng chỉ',
      sub: 'Chuyên gia kiểm tra, dẫn hướng và đo lường trên Cognex, Keyence và Halcon — được xác minh ở đúng chỗ quan trọng: ánh sáng, hiệu chuẩn và sự biến thiên trong thực tế.',
      lead1:
        'Thị giác máy là nơi các dự án "chạy tốt trong phòng thí nghiệm" thất bại ngoài xưởng. Ánh sáng, quang học, hiệu chuẩn và sự biến thiên khi trình bày chi tiết quyết định một hệ thống có đáng tin cậy hay không — và không điều nào trong số đó xuất hiện trên hồ sơ.',
      lead2:
        'Chúng tôi sàng lọc kỹ sư thị giác bằng khả năng phán đoán thực tế — thứ phân biệt một bản demo với một hệ thống đạt chuẩn sản xuất, và cấp chứng chỉ theo ba cấp độ chuyên sâu.',
      l1: 'Cấu hình các phép kiểm tra được xác định rõ và thiết lập ánh sáng tiêu chuẩn.',
      l2: 'Thiết kế hệ thống kiểm tra/dẫn hướng bền vững, tự xử lý hiệu chuẩn và biến thiên.',
      l3: 'Kiến trúc các hệ thống thị giác đòi hỏi cao, giải quyết các bài toán khó về ánh sáng và độ chính xác.',
    },
    hi: {
      kicker: 'मशीन विज़न',
      title: 'प्रमाणित मशीन विज़न इंजीनियर हायर करें',
      sub: 'Cognex, Keyence और Halcon पर इंस्पेक्शन, गाइडेंस और मेज़रमेंट विशेषज्ञ — वहीं सत्यापित जहाँ असल में मायने रखता है: लाइटिंग, कैलिब्रेशन और रियल-वर्ल्ड वेरिएशन।',
      lead1:
        'मशीन विज़न वही जगह है जहाँ "लैब में तो चला" वाले प्रोजेक्ट फ़्लोर पर टूट जाते हैं। लाइटिंग, ऑप्टिक्स, कैलिब्रेशन और पार्ट-प्रेजेंटेशन वेरिएशन तय करते हैं कि सिस्टम भरोसेमंद है या नहीं — और इनमें से कुछ भी रिज़्यूमे पर नहीं दिखता।',
      lead2:
        'हम विज़न इंजीनियरों को उस व्यावहारिक निर्णय-क्षमता पर स्क्रीन करते हैं जो डेमो को प्रोडक्शन-ग्रेड सिस्टम से अलग करती है, और उन्हें तीन गहराई स्तरों पर प्रमाणित करते हैं।',
      l1: 'अच्छी तरह परिभाषित इंस्पेक्शन कॉन्फ़िगर करते हैं और स्टैंडर्ड लाइटिंग सेट करते हैं।',
      l2: 'रोबस्ट इंस्पेक्शन/गाइडेंस डिज़ाइन करते हैं, कैलिब्रेशन व वेरिएशन स्वतंत्र रूप से संभालते हैं।',
      l3: 'डिमांडिंग विज़न सिस्टम आर्किटेक्ट करते हैं, मुश्किल लाइटिंग व एक्यूरेसी समस्याएँ सुलझाते हैं।',
    },
    fr: {
      kicker: 'Vision industrielle',
      title: 'Recrutez des ingénieurs en vision industrielle certifiés',
      sub: 'Spécialistes en inspection, guidage et mesure sur Cognex, Keyence et Halcon — vérifiés là où cela compte vraiment : éclairage, étalonnage et variation en conditions réelles.',
      lead1:
        'La vision industrielle est le domaine où les projets qui « fonctionnaient en labo » échouent en production. L’éclairage, l’optique, l’étalonnage et la variation de présentation des pièces déterminent la fiabilité d’un système — et rien de tout cela n’apparaît sur un CV.',
      lead2:
        'Nous évaluons les ingénieurs vision sur le jugement pratique qui distingue une démo d’un système de niveau production, et les certifions sur trois niveaux de profondeur.',
      l1: 'Configure des inspections bien définies et met en place l’éclairage standard.',
      l2: 'Conçoit des systèmes d’inspection et de guidage robustes, gère l’étalonnage et la variation de façon autonome.',
      l3: 'Conçoit l’architecture de systèmes de vision exigeants, résout des problèmes difficiles d’éclairage et de précision.',
    },
    de: {
      kicker: 'Bildverarbeitung',
      title: 'Zertifizierte Bildverarbeitungs-Ingenieure einstellen',
      sub: 'Spezialisten für Inspektion, Guidance und Messtechnik auf Cognex, Keyence und Halcon — geprüft genau dort, wo es zählt: Beleuchtung, Kalibrierung und reale Bauteilvarianz.',
      lead1:
        'Bildverarbeitung ist der Bereich, in dem Projekte, die "im Labor funktionierten", in der Fertigung scheitern. Beleuchtung, Optik, Kalibrierung und Bauteilvarianz entscheiden, ob ein System zuverlässig ist — und nichts davon steht im Lebenslauf.',
      lead2:
        'Wir prüfen Bildverarbeitungs-Ingenieure anhand des praktischen Urteilsvermögens, das eine Demo von einem produktionsreifen System unterscheidet, und zertifizieren sie auf drei Tiefenstufen.',
      l1: 'Konfiguriert gut definierte Prüfungen und richtet die Standardbeleuchtung ein.',
      l2: 'Entwirft robuste Inspektion/Guidance, bewältigt Kalibrierung und Varianz eigenständig.',
      l3: 'Entwirft anspruchsvolle Bildverarbeitungssysteme, löst schwierige Beleuchtungs- und Genauigkeitsprobleme.',
    },
    ja: {
      kicker: 'マシンビジョン',
      title: '認定マシンビジョンエンジニアを採用',
      sub: 'Cognex、Keyence、Halconにまたがる検査・ガイダンス・計測スペシャリスト——本当に重要な部分（照明、キャリブレーション、実環境でのばらつき）で検証済みです。',
      lead1:
        'マシンビジョンは「ラボではうまくいった」プロジェクトが現場で崩れる領域です。照明、光学、キャリブレーション、部品提示のばらつきがシステムの信頼性を左右します——そのどれも履歴書には表れません。',
      lead2:
        '当社はデモと量産グレードのシステムを分ける実践的な判断力でビジョンエンジニアを審査し、3段階の深さで認定します。',
      l1: '仕様が明確な検査を構成し、標準的な照明をセットアップします。',
      l2: '堅牢な検査・ガイダンスを設計し、キャリブレーションとばらつきを独立して処理します。',
      l3: '要求水準の高いビジョンシステムを設計し、難しい照明と精度の問題を解決します。',
    },
    ko: {
      kicker: '머신 비전',
      title: '인증 머신 비전 엔지니어 채용',
      sub: 'Cognex, Keyence, Halcon 전반의 검사·가이던스·측정 전문가 — 정말 중요한 지점(조명, 캘리브레이션, 실제 환경의 편차)에서 검증됩니다.',
      lead1:
        '머신 비전은 "실험실에서는 잘 됐던" 프로젝트가 현장에서 무너지는 영역입니다. 조명, 광학, 캘리브레이션, 부품 제시 편차가 시스템의 신뢰성을 좌우합니다 — 그리고 이 중 어느 것도 이력서에는 나타나지 않습니다.',
      lead2:
        '저희는 데모와 양산급 시스템을 가르는 실무 판단력을 기준으로 비전 엔지니어를 심사하고, 3단계의 숙련도로 인증합니다.',
      l1: '범위가 명확한 검사를 구성하고 표준 조명을 설정합니다.',
      l2: '견고한 검사/가이던스를 설계하고, 캘리브레이션과 편차를 독립적으로 처리합니다.',
      l3: '까다로운 비전 시스템을 설계하고, 어려운 조명 및 정밀도 문제를 해결합니다.',
    },
  },
  electrical: {
    serviceType: 'Industrial Electrical Engineering Talent',
    skills: ['Panel design', 'EPLAN', 'VFD / drives', 'Schematic capture', 'UL / IEC', 'Power distribution'],
    en: {
      kicker: 'Electrical',
      title: 'Hire Certified Electrical Engineers',
      sub: 'Panel design, drives and power specialists — EPLAN, UL/IEC and safe, buildable schematics, verified and escrow-protected.',
      lead1:
        'The electrical design decides whether a machine is safe, buildable and maintainable. Poor panel design and sloppy schematics create problems that surface at the worst possible time — during commissioning.',
      lead2:
        'Our electrical engineers are screened on real panel, drive and code-compliance problems, and can be certified at three levels so you get the right seniority for the job.',
      l1: 'Produces standard panel layouts and schematics under guidance.',
      l2: 'Designs compliant panels and drive systems independently, owns the electrical scope.',
      l3: 'Architects power distribution and complex electrical systems, handles code and safety.',
    },
    zh: {
      kicker: '电气',
      title: '雇佣持证电气工程师',
      sub: '电柜设计、驱动与配电专家——EPLAN、UL/IEC，安全且可施工的图纸，经过验证、托管保障。',
      lead1:
        '电气设计决定一台机器是否安全、可施工、可维护。糟糕的电柜设计和潦草的图纸，会在最糟糕的时刻——调试期间——集中爆发。',
      lead2:
        '我们在真实的电柜、驱动与合规问题上筛选电气工程师，并可考取三个级别的认证，让你为任务配到合适的资历。',
      l1: '在指导下完成标准电柜布局与图纸。',
      l2: '独立设计合规的电柜与驱动系统，负责电气范围。',
      l3: '架构配电与复杂电气系统，处理规范与安全。',
    },
    es: {
      kicker: 'Eléctrica',
      title: 'Contrate ingenieros eléctricos certificados',
      sub: 'Especialistas en diseño de tableros, variadores y potencia — EPLAN, UL/IEC y esquemas seguros y construibles, verificados y protegidos por depósito en garantía.',
      lead1:
        'El diseño eléctrico determina si una máquina es segura, construible y mantenible. Un mal diseño de tablero y esquemas descuidados generan problemas que salen a la luz en el peor momento posible: durante la puesta en marcha.',
      lead2:
        'Nuestros ingenieros eléctricos son evaluados con problemas reales de tableros, variadores y cumplimiento normativo, y pueden certificarse en tres niveles para que usted obtenga la experiencia adecuada para el trabajo.',
      l1: 'Produce diseños de tableros y esquemas estándar bajo orientación.',
      l2: 'Diseña tableros y sistemas de variadores conformes de forma independiente, se hace cargo del alcance eléctrico.',
      l3: 'Diseña la arquitectura de distribución de potencia y sistemas eléctricos complejos, maneja normativa y seguridad.',
    },
    vi: {
      kicker: 'Điện',
      title: 'Tuyển kỹ sư điện có chứng chỉ',
      sub: 'Chuyên gia thiết kế tủ điện, biến tần và nguồn điện — EPLAN, UL/IEC và sơ đồ an toàn, thi công được, đã xác minh và bảo vệ bằng ký quỹ.',
      lead1:
        'Thiết kế điện quyết định một cỗ máy có an toàn, thi công được và bảo trì được hay không. Thiết kế tủ điện kém và sơ đồ cẩu thả tạo ra vấn đề lộ ra vào thời điểm tồi tệ nhất — trong giai đoạn chạy thử.',
      lead2:
        'Kỹ sư điện của chúng tôi được sàng lọc qua các bài toán thực tế về tủ điện, biến tần và tuân thủ quy chuẩn, và có thể đạt chứng chỉ ở ba cấp độ để bạn có đúng mức kinh nghiệm cho công việc.',
      l1: 'Tạo ra các bố trí tủ điện và sơ đồ tiêu chuẩn dưới sự hướng dẫn.',
      l2: 'Tự thiết kế tủ điện và hệ thống biến tần tuân thủ quy chuẩn, làm chủ phạm vi công việc điện.',
      l3: 'Kiến trúc hệ thống phân phối điện và hệ thống điện phức tạp, xử lý quy chuẩn và an toàn.',
    },
    hi: {
      kicker: 'इलेक्ट्रिकल',
      title: 'प्रमाणित इलेक्ट्रिकल इंजीनियर हायर करें',
      sub: 'पैनल डिज़ाइन, ड्राइव और पावर विशेषज्ञ — EPLAN, UL/IEC और सुरक्षित, बनाने-योग्य स्कीमैटिक, सत्यापित और एस्क्रो-सुरक्षित।',
      lead1:
        'इलेक्ट्रिकल डिज़ाइन तय करता है कि मशीन सुरक्षित, बनाने-योग्य और मेंटेन करने-योग्य है या नहीं। खराब पैनल डिज़ाइन और लापरवाह स्कीमैटिक ऐसी समस्याएँ पैदा करते हैं जो सबसे बुरे समय पर सामने आती हैं — कमीशनिंग के दौरान।',
      lead2:
        'हमारे इलेक्ट्रिकल इंजीनियर वास्तविक पैनल, ड्राइव और कोड-कम्प्लायंस समस्याओं पर स्क्रीन किए जाते हैं, और तीन स्तरों पर प्रमाणित हो सकते हैं ताकि आपको काम के लिए सही वरिष्ठता मिले।',
      l1: 'मार्गदर्शन में स्टैंडर्ड पैनल लेआउट व स्कीमैटिक बनाते हैं।',
      l2: 'स्वतंत्र रूप से कम्प्लायंट पैनल व ड्राइव सिस्टम डिज़ाइन करते हैं, इलेक्ट्रिकल स्कोप खुद संभालते हैं।',
      l3: 'पावर डिस्ट्रीब्यूशन व जटिल इलेक्ट्रिकल सिस्टम आर्किटेक्ट करते हैं, कोड व सेफ़्टी संभालते हैं।',
    },
    fr: {
      kicker: 'Électricité',
      title: 'Recrutez des ingénieurs électriciens certifiés',
      sub: 'Spécialistes en conception d’armoires électriques, variateurs et puissance — EPLAN, UL/IEC et schémas sûrs et réalisables, vérifiés et protégés par séquestre.',
      lead1:
        'La conception électrique détermine si une machine est sûre, réalisable et maintenable. Une mauvaise conception d’armoire et des schémas bâclés créent des problèmes qui se révèlent au pire moment possible — pendant la mise en service.',
      lead2:
        'Nos ingénieurs électriciens sont évalués sur des problèmes réels d’armoires, de variateurs et de conformité aux normes, et peuvent être certifiés à trois niveaux afin que vous disposiez du bon niveau d’expérience pour la mission.',
      l1: 'Réalise des implantations d’armoires et des schémas standard avec encadrement.',
      l2: 'Conçoit des armoires et des systèmes de variateurs conformes de façon autonome, prend en charge le périmètre électrique.',
      l3: 'Conçoit l’architecture de la distribution de puissance et des systèmes électriques complexes, gère la conformité aux normes et la sécurité.',
    },
    de: {
      kicker: 'Elektrotechnik',
      title: 'Zertifizierte Elektroingenieure einstellen',
      sub: 'Spezialisten für Schaltschrankdesign, Antriebe und Energieversorgung — EPLAN, UL/IEC sowie sichere, umsetzbare Schaltpläne, verifiziert und treuhandgeschützt.',
      lead1:
        'Die elektrische Auslegung entscheidet, ob eine Maschine sicher, baubar und wartbar ist. Schlechtes Schaltschrankdesign und schlampige Schaltpläne erzeugen Probleme, die zum ungünstigsten Zeitpunkt auftauchen — während der Inbetriebnahme.',
      lead2:
        'Unsere Elektroingenieure werden an realen Schaltschrank-, Antriebs- und Normkonformitätsproblemen geprüft und können auf drei Stufen zertifiziert werden, sodass Sie die passende Erfahrung für den Auftrag erhalten.',
      l1: 'Erstellt Standard-Schaltschranklayouts und Schaltpläne unter Anleitung.',
      l2: 'Entwirft normkonforme Schaltschränke und Antriebssysteme eigenständig, verantwortet den elektrischen Aufgabenbereich.',
      l3: 'Entwirft die Energieverteilung und komplexe elektrische Systeme, verantwortet Normen und Sicherheit.',
    },
    ja: {
      kicker: '電気',
      title: '認定電気エンジニアを採用',
      sub: '制御盤設計、ドライブ、電源のスペシャリスト——EPLAN、UL/IEC準拠で安全かつ施工可能な回路図、検証済みでエスクロー保護付きです。',
      lead1:
        '電気設計は、機械が安全で、施工可能で、保守しやすいかどうかを左右します。粗悪な制御盤設計とずさんな回路図は、最悪のタイミング——試運転中——で問題として表面化します。',
      lead2:
        '当社の電気エンジニアは、実際の制御盤、ドライブ、規格適合の課題で審査され、3段階で認定を取得できるため、仕事に見合った経験レベルを得られます。',
      l1: '指導のもとで標準的な制御盤レイアウトと回路図を作成します。',
      l2: '独立して規格適合の制御盤とドライブシステムを設計し、電気範囲を担当します。',
      l3: '配電と複雑な電気システムを設計し、規格と安全対応を担います。',
    },
    ko: {
      kicker: '전기',
      title: '인증 전기 엔지니어 채용',
      sub: '패널 설계, 드라이브, 전력 전문가 — EPLAN, UL/IEC를 따르는 안전하고 시공 가능한 도면, 검증되었으며 에스크로로 보호됩니다.',
      lead1:
        '전기 설계는 기계가 안전하고, 시공 가능하며, 유지보수 가능한지를 결정합니다. 부실한 패널 설계와 허술한 도면은 최악의 시점 — 시운전 중 — 에 문제로 드러납니다.',
      lead2:
        '저희 전기 엔지니어는 실제 패널, 드라이브, 규격 준수 문제로 심사되며, 3단계로 인증받을 수 있어 업무에 맞는 경력 수준을 확보할 수 있습니다.',
      l1: '지도 하에 표준 패널 레이아웃과 도면을 제작합니다.',
      l2: '독립적으로 규격 준수 패널과 드라이브 시스템을 설계하며, 전기 범위를 책임집니다.',
      l3: '배전과 복잡한 전기 시스템을 설계하고, 규격과 안전을 담당합니다.',
    },
  },
};

module.exports = { DICT, TRACKS };
