// ── /hire 索引页 UI 字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/hire/index.jsx 内联 UI + TRACK_BLURBS 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 九语全量（2026-07-24 三期灌注）：es/vi/hi/fr/de/ja/ko 按 lib/i18n/glossary.js 的
// TERMS + STYLE 灌注，语域按各语 STYLE 指南（es usted、vi 正式、hi 天城文+行业英文借词、
// fr vouvoiement、de Sie、ja です・ます调、ko 합니다体）。
// DICT = 页面 UI 标签（原页面 const UI）；TRACK_BLURBS = 四方向卡一句话简介
// （顶层键是方向 slug 而非语言码，故作为第二导出，不参与 DICT 九语结构断言）。
// 数字纪律：本页文案零统计数字，费率/方向数据单一来源在 lib/hireMatrix.js /
// lib/occupations.js，页面构建期取用，字典搬家不碰数。

// 方向卡的一句话简介：索引页专属文案（结构性陈述，零统计数字）。
// 方向页的完整文案在 pages/hire/[track].jsx，这里只做"进入前的一口简介"，不重复母页正文。
const TRACK_BLURBS = {
  plc: {
    en: 'Siemens, Rockwell, Mitsubishi and Beckhoff programmers for logic design, migration and commissioning — matched by platform, not just by keyword.',
    zh: 'Siemens、Rockwell、Mitsubishi、Beckhoff 程序员，覆盖逻辑设计、迁移与调试——按平台匹配，而不只是按关键词。',
    es: 'Programadores de Siemens, Rockwell, Mitsubishi y Beckhoff para diseño de lógica, migración y puesta en marcha — emparejados por plataforma, no solo por palabras clave.',
    vi: 'Lập trình viên Siemens, Rockwell, Mitsubishi và Beckhoff cho thiết kế logic, chuyển đổi hệ thống và chạy thử — ghép nối theo nền tảng, không chỉ theo từ khóa.',
    hi: 'लॉजिक डिज़ाइन, माइग्रेशन और कमीशनिंग के लिए Siemens, Rockwell, Mitsubishi और Beckhoff प्रोग्रामर — केवल कीवर्ड से नहीं, प्लेटफ़ॉर्म के आधार पर मैच किए गए।',
    fr: 'Programmeurs Siemens, Rockwell, Mitsubishi et Beckhoff pour la conception de la logique, la migration et la mise en service — mis en relation par plateforme, pas seulement par mot-clé.',
    de: 'Siemens-, Rockwell-, Mitsubishi- und Beckhoff-Programmierer für Logikentwurf, Migration und Inbetriebnahme — nach Plattform zugeordnet, nicht nur nach Schlagwort.',
    ja: 'ロジック設計、移行、試運転を担うSiemens、Rockwell、Mitsubishi、Beckhoffのプログラマー——キーワードだけでなく、プラットフォームでマッチングします。',
    ko: '로직 설계, 마이그레이션, 시운전을 담당하는 Siemens, Rockwell, Mitsubishi, Beckhoff 프로그래머 — 키워드가 아닌 플랫폼 기준으로 매칭합니다.',
  },
  robotics: {
    en: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, programming and on-site commissioning, screened on real path and integration problems.',
    zh: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、编程与现场调试，在真实的路径与集成问题上完成筛选。',
    es: 'Especialistas en Fanuc, KUKA, ABB y Yaskawa para diseño de celdas, programación y puesta en marcha en sitio, evaluados con problemas reales de trayectoria e integración.',
    vi: 'Chuyên gia Fanuc, KUKA, ABB và Yaskawa cho thiết kế tế bào (cell), lập trình và chạy thử tại hiện trường, được sàng lọc qua các bài toán thực tế về quỹ đạo và tích hợp.',
    hi: 'सेल डिज़ाइन, प्रोग्रामिंग और ऑन-साइट कमीशनिंग के लिए Fanuc, KUKA, ABB और Yaskawa विशेषज्ञ — वास्तविक पाथ और इंटीग्रेशन समस्याओं पर स्क्रीन किए गए।',
    fr: 'Spécialistes Fanuc, KUKA, ABB et Yaskawa pour la conception de cellules, la programmation et la mise en service sur site, évalués sur des problèmes réels de trajectoire et d’intégration.',
    de: 'Fanuc-, KUKA-, ABB- und Yaskawa-Spezialisten für Zellendesign, Programmierung und Inbetriebnahme vor Ort, geprüft an realen Bahn- und Integrationsproblemen.',
    ja: 'セル設計、プログラミング、現地試運転を担うFanuc、KUKA、ABB、Yaskawaのスペシャリスト。実際の経路・統合上の課題でスクリーニングしています。',
    ko: '셀 설계, 프로그래밍, 현장 시운전을 담당하는 Fanuc, KUKA, ABB, Yaskawa 전문가 — 실제 경로 및 통합 문제로 평가합니다.',
  },
  vision: {
    en: 'Inspection, guidance and measurement engineers across Cognex, Keyence and Halcon — verified where vision projects actually fail: lighting, calibration, variation.',
    zh: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量工程师——在视觉项目真正翻车的地方验证：打光、标定、来料变化。',
    es: 'Ingenieros de inspección, guiado y medición en Cognex, Keyence y Halcon — verificados donde los proyectos de visión realmente fallan: iluminación, calibración, variación.',
    vi: 'Kỹ sư kiểm tra, dẫn hướng và đo lường trên Cognex, Keyence và Halcon — được xác minh ở đúng chỗ các dự án thị giác máy thường thất bại: ánh sáng, hiệu chuẩn, sự biến thiên của phôi.',
    hi: 'Cognex, Keyence और Halcon पर इंस्पेक्शन, गाइडेंस और मेज़रमेंट इंजीनियर — वहीं सत्यापित जहाँ विज़न प्रोजेक्ट असल में फेल होते हैं: लाइटिंग, कैलिब्रेशन, वेरिएशन।',
    fr: 'Ingénieurs en inspection, guidage et mesure sur Cognex, Keyence et Halcon — vérifiés là où les projets de vision échouent réellement : éclairage, étalonnage, variation des pièces.',
    de: 'Ingenieure für Inspektion, Guidance und Messtechnik auf Cognex, Keyence und Halcon — geprüft genau dort, wo Bildverarbeitungsprojekte tatsächlich scheitern: Beleuchtung, Kalibrierung, Bauteilvarianz.',
    ja: 'Cognex、Keyence、Halconにまたがる検査・ガイダンス・計測エンジニア——マシンビジョン案件が実際に失敗するポイント（照明、キャリブレーション、ばらつき）で検証済みです。',
    ko: 'Cognex, Keyence, Halcon 전반의 검사·가이던스·측정 엔지니어 — 머신 비전 프로젝트가 실제로 실패하는 지점(조명, 캘리브레이션, 편차)에서 검증합니다.',
  },
  electrical: {
    en: 'Panel design, drives and power specialists — EPLAN, UL/IEC and safe, buildable schematics that survive commissioning.',
    zh: '电柜设计、驱动与配电专家——EPLAN、UL/IEC，画得出经得起调试的安全可施工图纸。',
    es: 'Especialistas en diseño de tableros eléctricos, variadores y potencia — EPLAN, UL/IEC y esquemas seguros y construibles que resisten la puesta en marcha.',
    vi: 'Chuyên gia thiết kế tủ điện, biến tần và nguồn điện — EPLAN, UL/IEC và sơ đồ an toàn, thi công được, trụ vững qua giai đoạn chạy thử.',
    hi: 'पैनल डिज़ाइन, ड्राइव और पावर विशेषज्ञ — EPLAN, UL/IEC और सुरक्षित, बनाने-योग्य स्कीमैटिक जो कमीशनिंग में टिके रहें।',
    fr: 'Spécialistes en conception d’armoires électriques, variateurs et puissance — EPLAN, UL/IEC et schémas sûrs et réalisables qui résistent à l’épreuve de la mise en service.',
    de: 'Spezialisten für Schaltschrankdesign, Antriebe und Energieversorgung — EPLAN, UL/IEC sowie sichere, umsetzbare Schaltpläne, die die Inbetriebnahme überstehen.',
    ja: '制御盤設計、ドライブ、電源のスペシャリスト——EPLAN、UL/IEC準拠で、試運転を乗り越えられる安全かつ施工可能な回路図を描きます。',
    ko: '패널 설계, 드라이브, 전력 전문가 — EPLAN, UL/IEC 기준을 따르며 시운전을 견디는 안전하고 시공 가능한 도면을 제작합니다.',
  },
};

// 页面文案（九语，与 index.jsx 等九语页面同一 `|| en` 兜底约定，SSR 首帧英文）。
const DICT = {
  en: {
    kicker: 'Hire Engineers',
    title: 'Hire Certified Industrial Automation Engineers',
    sub: 'PLC, robotics, machine vision and electrical specialists — pre-screened by a practical AI assessment, certified at three levels, and delivering under milestone escrow.',
    heroPost: 'Post a Project — Free',
    heroApply: 'Apply as an Engineer',
    lead1:
      'Hiring automation talent across borders usually fails in one of two places: you cannot verify that a résumé keyword means real depth on your exact controller, robot or camera; or the money side of a cross-border engagement is too risky for either party to commit. This page is the map of how we solve both — pick a specialty, an industry or a role title, and every path leads to the same verified pool.',
    lead2:
      'Every engineer on the platform passes a practical AI technical screener before they can be matched, and can earn platform certification in their track at three levels — only certified engineers can be assigned to your project. Payment runs through milestone escrow: funds are held and released stage by stage as work is accepted, protecting both sides of the border.',
    tracksTitle: 'Browse by specialty',
    tracksIntro:
      'Four certification tracks. Each specialty page covers what we screen for, what the three certification levels mean, and regional rate ranges.',
    viewTrack: 'View specialty →',
    industriesLabel: 'By industry:',
    rolesTitle: 'Hire by role title',
    rolesIntro:
      'If you think in job titles rather than certification tracks, start from the role — each role page maps the title to the right track, skills and certification path.',
    ratesTitle: 'Rate ranges by region',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    guidesTitle: 'Setting up in a new country?',
    guidesBody:
      'Read our country hiring guides for local rate ranges, certification and on-the-ground commissioning before you build.',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
  },
  zh: {
    kicker: '招聘工程师',
    title: '雇佣持证工业自动化工程师',
    sub: 'PLC、机器人、机器视觉与电气专家——通过实操型 AI 筛选、三级认证，在里程碑托管下交付。',
    heroPost: '免费发布项目',
    heroApply: '以工程师身份申请',
    lead1:
      '跨境招募自动化人才，通常卡在两个地方：一是没法验证简历上的关键词，在你这台具体的控制器、机器人或相机上到底有没有真功夫；二是跨境合作的资金风险，让双方都不敢先迈一步。这一页就是我们解决这两件事的地图——无论从方向、行业还是职位名进入，每条路都通向同一个经过验证的工程师池。',
    lead2:
      '平台上每位工程师在被匹配前，都要先通过一套实操型 AI 技术筛选，并可在所属方向考取三个级别的平台认证——只有持证工程师才能被指派到你的项目。付款走里程碑托管：资金先托管，随每阶段验收逐步释放，跨境双方都有保障。',
    tracksTitle: '按方向浏览',
    tracksIntro: '四条认证方向。每个方向页涵盖：我们筛选什么、三级认证分别意味着什么、各地区费率区间。',
    viewTrack: '进入方向页 →',
    industriesLabel: '按行业：',
    rolesTitle: '按职位名招募',
    rolesIntro: '如果你习惯用职位名而不是认证方向思考，就从职位入手——每个职位页会把职位名映射到对应的方向、技能与认证路径。',
    ratesTitle: '各地区费率区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    guidesTitle: '要在新国家建厂？',
    guidesBody: '动工前，先读我们的分国用人指南：了解当地费率区间、认证与落地调试。',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
  },
  es: {
    kicker: 'Contratar ingenieros',
    title: 'Contrate ingenieros de automatización industrial certificados',
    sub: 'Especialistas en PLC, robótica, visión artificial e ingeniería eléctrica — preseleccionados con una evaluación práctica de IA, certificados en tres niveles y con entregas bajo depósito en garantía por hitos.',
    heroPost: 'Publicar un proyecto — Gratis',
    heroApply: 'Postularse como ingeniero',
    lead1:
      'Contratar talento de automatización a través de fronteras suele fallar en uno de dos puntos: usted no puede verificar que una palabra clave en un currículum signifique dominio real de su controlador, robot o cámara exactos; o el aspecto financiero de una colaboración transfronteriza resulta demasiado riesgoso para que cualquiera de las partes se comprometa. Esta página es el mapa de cómo resolvemos ambos problemas: elija una especialidad, una industria o un título de puesto, y cada camino lleva al mismo grupo verificado.',
    lead2:
      'Todo ingeniero de la plataforma aprueba una evaluación técnica práctica de IA antes de poder ser emparejado, y puede obtener la certificación de la plataforma en su especialidad en tres niveles — solo los ingenieros certificados pueden ser asignados a su proyecto. El pago se procesa mediante depósito en garantía por hitos: los fondos se retienen y se liberan por etapas a medida que se acepta el trabajo, protegiendo a ambas partes de la relación transfronteriza.',
    tracksTitle: 'Explorar por especialidad',
    tracksIntro:
      'Cuatro especialidades de certificación. Cada página de especialidad detalla qué evaluamos, qué significan los tres niveles de certificación y los rangos de tarifas regionales.',
    viewTrack: 'Ver especialidad →',
    industriesLabel: 'Por industria:',
    rolesTitle: 'Contratar por título de puesto',
    rolesIntro:
      'Si usted piensa en términos de puestos de trabajo más que de especialidades de certificación, comience por el puesto — cada página de puesto vincula el título con la especialidad, las habilidades y la ruta de certificación correctas.',
    ratesTitle: 'Rangos de tarifas por región',
    regionCol: 'Región',
    rateCol: 'Por hora (USD)',
    guidesTitle: '¿Va a establecerse en un país nuevo?',
    guidesBody:
      'Antes de construir, lea nuestras guías de contratación por país para conocer los rangos de tarifas locales, la certificación y la puesta en marcha sobre el terreno.',
    ctaHeading: '¿Listo para contratar?',
    ctaBody: 'Publique su proyecto y conéctese con ingenieros certificados y preseleccionados. El depósito en garantía por hitos protege a ambas partes.',
  },
  vi: {
    kicker: 'Tuyển kỹ sư',
    title: 'Tuyển kỹ sư tự động hóa công nghiệp có chứng chỉ',
    sub: 'Chuyên gia PLC, robot, thị giác máy và điện — được sàng lọc trước bằng bài đánh giá thực hành AI, có chứng chỉ ba cấp độ, và bàn giao dưới hình thức ký quỹ theo cột mốc.',
    heroPost: 'Đăng dự án — Miễn phí',
    heroApply: 'Ứng tuyển làm kỹ sư',
    lead1:
      'Tuyển nhân tài tự động hóa xuyên biên giới thường thất bại ở một trong hai điểm: bạn không thể xác minh rằng một từ khóa trên hồ sơ có nghĩa là chuyên môn thực sự trên đúng bộ điều khiển, robot hay camera của bạn; hoặc khía cạnh tiền bạc của một hợp tác xuyên biên giới quá rủi ro để bất kỳ bên nào cam kết. Trang này là bản đồ cho cách chúng tôi giải quyết cả hai — chọn một chuyên môn, một ngành hoặc một chức danh, mọi lối đi đều dẫn đến cùng một nguồn kỹ sư đã được xác minh.',
    lead2:
      'Mọi kỹ sư trên nền tảng đều phải vượt qua bài sàng lọc kỹ thuật thực hành bằng AI trước khi được ghép nối, và có thể đạt chứng chỉ nền tảng trong chuyên môn của mình ở ba cấp độ — chỉ kỹ sư có chứng chỉ mới được phân công vào dự án của bạn. Thanh toán được thực hiện qua ký quỹ theo cột mốc: tiền được giữ lại và giải ngân theo từng giai đoạn khi công việc được nghiệm thu, bảo vệ cả hai phía của quan hệ hợp tác xuyên biên giới.',
    tracksTitle: 'Duyệt theo chuyên môn',
    tracksIntro:
      'Bốn hướng chứng chỉ. Mỗi trang chuyên môn nêu rõ chúng tôi sàng lọc điều gì, ba cấp độ chứng chỉ có ý nghĩa gì, và mức phí theo khu vực.',
    viewTrack: 'Xem chuyên môn →',
    industriesLabel: 'Theo ngành:',
    rolesTitle: 'Tuyển theo chức danh',
    rolesIntro:
      'Nếu bạn nghĩ theo chức danh công việc thay vì hướng chứng chỉ, hãy bắt đầu từ chức danh — mỗi trang chức danh ánh xạ tên gọi đó tới đúng hướng, kỹ năng và lộ trình chứng chỉ.',
    ratesTitle: 'Mức phí theo khu vực',
    regionCol: 'Khu vực',
    rateCol: 'Theo giờ (USD)',
    guidesTitle: 'Đang chuẩn bị xây dựng ở một quốc gia mới?',
    guidesBody:
      'Trước khi xây dựng, hãy đọc các hướng dẫn tuyển dụng theo quốc gia của chúng tôi để biết mức phí địa phương, chứng chỉ và việc chạy thử tại hiện trường.',
    ctaHeading: 'Sẵn sàng tuyển dụng?',
    ctaBody: 'Đăng dự án của bạn và ghép nối với các kỹ sư có chứng chỉ, đã qua sàng lọc trước. Ký quỹ theo cột mốc bảo vệ cả hai bên.',
  },
  hi: {
    kicker: 'इंजीनियर हायर करें',
    title: 'प्रमाणित औद्योगिक ऑटोमेशन इंजीनियर हायर करें',
    sub: 'PLC, रोबोटिक्स, मशीन विज़न और इलेक्ट्रिकल विशेषज्ञ — व्यावहारिक AI मूल्यांकन से पहले से जांचे गए, तीन स्तरों पर प्रमाणित, और माइलस्टोन एस्क्रो के तहत डिलीवर करते हैं।',
    heroPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',
    heroApply: 'इंजीनियर के रूप में आवेदन करें',
    lead1:
      'सीमा-पार ऑटोमेशन टैलेंट हायर करना आमतौर पर दो जगहों में से किसी एक पर अटक जाता है: या तो आप यह सत्यापित नहीं कर सकते कि रिज़्यूमे का कोई कीवर्ड आपके एग्ज़ैक्ट कंट्रोलर, रोबोट या कैमरे पर वाकई गहरी समझ दर्शाता है; या फिर सीमा-पार जुड़ाव का पैसे वाला पक्ष किसी भी पक्ष के लिए प्रतिबद्ध होने के लिए बहुत जोखिमभरा है। यह पेज दिखाता है कि हम दोनों समस्याओं को कैसे हल करते हैं — कोई स्पेशलिटी, इंडस्ट्री या रोल टाइटल चुनें, हर रास्ता एक ही सत्यापित पूल तक पहुँचता है।',
    lead2:
      'प्लेटफ़ॉर्म पर हर इंजीनियर मैच होने से पहले एक व्यावहारिक AI टेक्निकल स्क्रीनर पास करता है, और अपने ट्रैक में तीन स्तरों पर प्लेटफ़ॉर्म प्रमाणन अर्जित कर सकता है — केवल प्रमाणित इंजीनियर ही आपके प्रोजेक्ट को असाइन किए जा सकते हैं। भुगतान माइलस्टोन एस्क्रो से होकर चलता है: राशि रोकी जाती है और काम स्वीकृत होते ही चरण-दर-चरण रिलीज़ होती है, जिससे सीमा-पार रिश्ते के दोनों पक्षों को सुरक्षा मिलती है।',
    tracksTitle: 'स्पेशलिटी के अनुसार ब्राउज़ करें',
    tracksIntro:
      'चार प्रमाणन ट्रैक। हर स्पेशलिटी पेज बताता है कि हम क्या स्क्रीन करते हैं, तीन प्रमाणन स्तरों का क्या मतलब है, और क्षेत्रीय दर सीमाएँ क्या हैं।',
    viewTrack: 'स्पेशलिटी देखें →',
    industriesLabel: 'इंडस्ट्री के अनुसार:',
    rolesTitle: 'रोल टाइटल से हायर करें',
    rolesIntro:
      'अगर आप प्रमाणन ट्रैक के बजाय जॉब टाइटल में सोचते हैं, तो रोल से शुरू करें — हर रोल पेज उस टाइटल को सही ट्रैक, स्किल्स और प्रमाणन पथ से जोड़ता है।',
    ratesTitle: 'क्षेत्र के अनुसार दर सीमाएँ',
    regionCol: 'क्षेत्र',
    rateCol: 'प्रति घंटा (USD)',
    guidesTitle: 'किसी नए देश में सेटअप कर रहे हैं?',
    guidesBody: 'बनाना शुरू करने से पहले, स्थानीय दर सीमाओं, प्रमाणन और ऑन-ग्राउंड कमीशनिंग के लिए हमारी कंट्री हायरिंग गाइड पढ़ें।',
    ctaHeading: 'नियुक्ति के लिए तैयार हैं?',
    ctaBody: 'अपना प्रोजेक्ट पोस्ट करें और पहले से जांचे-परखे, प्रमाणित इंजीनियरों से मैच करें। माइलस्टोन एस्क्रो दोनों पक्षों की सुरक्षा करता है।',
  },
  fr: {
    kicker: 'Recruter des ingénieurs',
    title: 'Recrutez des ingénieurs certifiés en automatisation industrielle',
    sub: 'Spécialistes PLC, robotique, vision industrielle et électricité — présélectionnés par une évaluation pratique par IA, certifiés à trois niveaux, et livrant sous séquestre par jalons.',
    heroPost: 'Publier un projet — Gratuit',
    heroApply: 'Postuler comme ingénieur',
    lead1:
      'Le recrutement de talents en automatisation à l’international échoue généralement sur l’un de ces deux points : vous ne pouvez pas vérifier qu’un mot-clé du CV correspond à une maîtrise réelle du contrôleur, du robot ou de la caméra précis que vous utilisez ; ou le volet financier d’une collaboration transfrontalière est trop risqué pour que l’une ou l’autre des parties s’engage. Cette page est la carte de nos réponses à ces deux problèmes — choisissez une filière, un secteur ou un intitulé de poste, et chaque chemin mène au même vivier vérifié.',
    lead2:
      'Chaque ingénieur de la plateforme réussit une évaluation technique pratique par IA avant de pouvoir être mis en relation, et peut obtenir la certification de la plateforme dans sa filière à trois niveaux — seuls les ingénieurs certifiés peuvent être affectés à votre projet. Le paiement s’effectue sous séquestre par jalons : les fonds sont retenus puis débloqués étape par étape à mesure que le travail est accepté, protégeant ainsi les deux parties, de part et d’autre de la frontière.',
    tracksTitle: 'Parcourir par filière',
    tracksIntro:
      'Quatre filières de certification. Chaque page de filière détaille ce que nous évaluons, ce que signifient les trois niveaux de certification et les fourchettes de tarifs par région.',
    viewTrack: 'Voir la filière →',
    industriesLabel: 'Par secteur :',
    rolesTitle: 'Recruter par intitulé de poste',
    rolesIntro:
      'Si vous raisonnez en intitulés de poste plutôt qu’en filières de certification, partez du poste — chaque page de poste relie l’intitulé à la bonne filière, aux compétences et au parcours de certification.',
    ratesTitle: 'Fourchettes de tarifs par région',
    regionCol: 'Région',
    rateCol: 'Tarif horaire (USD)',
    guidesTitle: 'Vous vous implantez dans un nouveau pays ?',
    guidesBody:
      'Avant de vous lancer, consultez nos guides de recrutement par pays : fourchettes de tarifs locales, certification et mise en service sur le terrain.',
    ctaHeading: 'Prêt à recruter ?',
    ctaBody: 'Publiez votre projet et soyez mis en relation avec des ingénieurs certifiés et présélectionnés. Le séquestre par jalons protège les deux parties.',
  },
  de: {
    kicker: 'Ingenieure einstellen',
    title: 'Zertifizierte Industrieautomatisierungs-Ingenieure einstellen',
    sub: 'Spezialisten für PLC, Robotik, Bildverarbeitung und Elektrotechnik — vorab geprüft durch ein praxisnahes KI-Assessment, auf drei Stufen zertifiziert und liefernd unter Meilenstein-Treuhand.',
    heroPost: 'Projekt ausschreiben — kostenlos',
    heroApply: 'Als Ingenieur bewerben',
    lead1:
      'Die grenzüberschreitende Einstellung von Automatisierungstalenten scheitert meist an einem von zwei Punkten: Sie können nicht verifizieren, ob ein Stichwort im Lebenslauf tatsächliche Tiefe an genau Ihrem Controller, Roboter oder Ihrer Kamera bedeutet; oder die finanzielle Seite eines grenzüberschreitenden Engagements ist für beide Parteien zu riskant, um sich darauf einzulassen. Diese Seite zeigt, wie wir beides lösen — wählen Sie eine Spezialisierung, eine Branche oder eine Rollenbezeichnung, und jeder Weg führt zum selben verifizierten Pool.',
    lead2:
      'Jeder Ingenieur auf der Plattform besteht einen praxisnahen KI-Techniktest, bevor er zugeordnet werden kann, und kann in seiner Spezialisierung auf drei Stufen die Plattform-Zertifizierung erwerben — nur zertifizierte Ingenieure können Ihrem Projekt zugewiesen werden. Die Zahlung läuft über eine Meilenstein-Treuhand: Gelder werden gehalten und stufenweise freigegeben, sobald die Arbeit abgenommen ist — das schützt beide Seiten der grenzüberschreitenden Zusammenarbeit.',
    tracksTitle: 'Nach Spezialisierung durchsuchen',
    tracksIntro:
      'Vier Zertifizierungsrichtungen. Jede Spezialisierungsseite zeigt, worauf wir prüfen, was die drei Zertifizierungsstufen bedeuten, und die regionalen Satzspannen.',
    viewTrack: 'Spezialisierung ansehen →',
    industriesLabel: 'Nach Branche:',
    rolesTitle: 'Nach Rollenbezeichnung einstellen',
    rolesIntro:
      'Wenn Sie eher in Jobtiteln als in Zertifizierungsrichtungen denken, starten Sie bei der Rolle — jede Rollenseite ordnet den Titel der passenden Spezialisierung, den Fähigkeiten und dem Zertifizierungsweg zu.',
    ratesTitle: 'Satzspannen nach Region',
    regionCol: 'Region',
    rateCol: 'Stundensatz (USD)',
    guidesTitle: 'Bauen Sie in einem neuen Land auf?',
    guidesBody:
      'Lesen Sie vor dem Aufbau unsere länderspezifischen Einstellungsleitfäden für lokale Satzspannen, Zertifizierung und Inbetriebnahme vor Ort.',
    ctaHeading: 'Bereit einzustellen?',
    ctaBody: 'Schreiben Sie Ihr Projekt aus und werden Sie mit vorab geprüften, zertifizierten Ingenieuren zusammengebracht. Die Meilenstein-Treuhand schützt beide Seiten.',
  },
  ja: {
    kicker: 'エンジニアを採用',
    title: '認定産業オートメーションエンジニアを採用',
    sub: 'PLC、ロボティクス、マシンビジョン、電気の各スペシャリスト——実践的なAIアセスメントで事前審査済み、3段階で認定され、マイルストーン・エスクローのもとで納品します。',
    heroPost: 'プロジェクトを掲載 — 無料',
    heroApply: 'エンジニアとして応募',
    lead1:
      '国境をまたぐオートメーション人材の採用は、たいてい2つのどちらかでつまずきます。1つは、履歴書のキーワードがあなたの具体的なコントローラー、ロボット、カメラでの実力を意味するかを確認できないこと。もう1つは、国境をまたぐ取引のお金の部分が、どちらの当事者にとってもコミットするにはリスクが大きすぎることです。このページは、その両方を私たちがどう解決しているかを示す地図です——専門分野、業界、または職種のいずれから入っても、すべての道が同じ検証済みの人材プールにつながります。',
    lead2:
      'プラットフォーム上のすべてのエンジニアは、マッチング前に実践的なAI技術スクリーニングに合格し、自分のトラックで3段階のプラットフォーム認定を取得できます——アサインされるのは認定エンジニアだけです。支払いはマイルストーン・エスクローを通じて行われます。資金は保持され、作業が承認されるたびに段階的に送金され、国境をまたぐ双方を守ります。',
    tracksTitle: '専門分野で探す',
    tracksIntro:
      '4つの認定トラック。各専門分野ページでは、何を審査するか、3段階の認定の意味、地域別の料金レンジを解説しています。',
    viewTrack: '専門分野を見る →',
    industriesLabel: '業界別：',
    rolesTitle: '職種で採用',
    rolesIntro:
      '認定トラックよりも職種で考える場合は、職種から始めてください——各職種ページは、その肩書きを適切なトラック、スキル、認定パスに対応させています。',
    ratesTitle: '地域別の料金レンジ',
    regionCol: '地域',
    rateCol: '時間料金（USD）',
    guidesTitle: '新しい国での立ち上げをお考えですか？',
    guidesBody: '着手前に、現地の料金レンジ、認定、現地での試運転について国別採用ガイドをご覧ください。',
    ctaHeading: '採用の準備はできましたか？',
    ctaBody: 'プロジェクトを掲載して、事前審査済みの認定エンジニアとマッチングしましょう。マイルストーン・エスクローが双方を守ります。',
  },
  ko: {
    kicker: '엔지니어 채용',
    title: '인증 산업 자동화 엔지니어 채용',
    sub: 'PLC, 로보틱스, 머신 비전, 전기 전문가 — 실무형 AI 평가로 사전 심사되고, 3단계로 인증되며, 마일스톤 에스크로 하에서 납품합니다.',
    heroPost: '프로젝트 등록 — 무료',
    heroApply: '엔지니어로 지원하기',
    lead1:
      '국경을 넘나드는 자동화 인재 채용은 대개 두 지점 중 하나에서 막힙니다. 하나는 이력서의 키워드가 정확히 당신의 컨트롤러, 로봇, 카메라에서의 실제 전문성을 의미하는지 확인할 수 없다는 것이고, 다른 하나는 국경 간 계약의 자금 문제가 양측 어느 쪽도 선뜻 나서기에는 너무 위험하다는 것입니다. 이 페이지는 저희가 이 두 가지를 어떻게 해결하는지 보여주는 지도입니다 — 전문 분야, 산업, 직무명 중 무엇으로 시작하든 모든 경로가 동일한 검증된 인재 풀로 이어집니다.',
    lead2:
      '플랫폼의 모든 엔지니어는 매칭되기 전에 실무형 AI 기술 심사를 통과하며, 자신의 트랙에서 3단계로 플랫폼 인증을 취득할 수 있습니다 — 인증 엔지니어만 프로젝트에 배정될 수 있습니다. 결제는 마일스톤 에스크로를 통해 진행됩니다. 자금은 보관되었다가 작업이 승인될 때마다 단계별로 지급되어 국경 간 거래의 양측을 모두 보호합니다.',
    tracksTitle: '전문 분야별로 둘러보기',
    tracksIntro:
      '4개의 인증 트랙. 각 전문 분야 페이지에서 심사 기준, 3단계 인증의 의미, 지역별 요율 범위를 확인할 수 있습니다.',
    viewTrack: '전문 분야 보기 →',
    industriesLabel: '산업별:',
    rolesTitle: '직무명으로 채용하기',
    rolesIntro:
      '인증 트랙보다 직무명으로 생각하신다면 직무에서 시작하세요 — 각 직무 페이지는 해당 명칭을 알맞은 트랙, 스킬, 인증 경로에 연결해 줍니다.',
    ratesTitle: '지역별 요율 범위',
    regionCol: '지역',
    rateCol: '시간당(USD)',
    guidesTitle: '새로운 국가에 진출하시나요?',
    guidesBody: '착수하기 전에 현지 요율 범위, 인증, 현장 시운전에 관한 국가별 채용 가이드를 확인하세요.',
    ctaHeading: '채용할 준비가 되셨나요?',
    ctaBody: '프로젝트를 등록하고 사전 심사를 거친 인증 엔지니어와 매칭하세요. 마일스톤 에스크로가 양측을 보호합니다.',
  },
};

module.exports = { DICT, TRACK_BLURBS };
