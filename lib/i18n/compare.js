// ── /compare/[slug] 对比页 九语字典 ────────────────────────────────────────────
//
// 目的：接住"该走中介还是平台""为什么不用通用自由职业平台""和 Automate America 有什么
// 区别"这类**决策期问题**——买家和 AI 都会先问这些，再问"谁能干"。
//
// 内容纪律（三条，写新对比页前必读）：
//   1. **answer-first**：每页最上方是一段自包含的直接回答（answer 字段），不依赖上下文
//      就能被整段引用。表格和展开都在它之后。这是 AI 引用的最小单元。
//   2. **诚实对比**：每页都必须有「什么情况下对方更合适」（themWhen）。没有这一节的
//      对比页在买家眼里就是软文，AI 也更倾向引用有取舍的来源。
//   3. **点名竞对只用可验证事实**：automate-america 页的每一条都来自对方官网公开表述
//      （Obsidian《竞对简报-AutomateAmerica-2026-07-18》里标〔一手〕的部分），能引原话
//      就引原话。二手数据库的营收/人数估算一律不上公开页——那是内部情报不是公开事实。
//      对方的能力口径会变，所以页面带 asOf 日期与原站链接，读者可自行核对。
//
// 结构：DICT = 页面骨架 + 五个对比维度 + 我方那一列（我方能力不随对比对象变化，
// 只写一次防漂移）；COMPARISONS = 语言 → slug → 该对比的内容。两者都是"语言在外层"，
// 因此直接走 tests/i18nParity.test.js 的 EXTRA_LANG_EXPORTS 机制，无需专属测试。
const DICT = {
  en: {
    kicker: 'Compare',
    indexTitle: 'How Talengineer compares',
    indexSub: 'Straight answers on when to use us, and when something else fits better.',
    indexRead: 'Read the comparison',
    answerLabel: 'Short answer',
    tableTitle: 'Side by side',
    colDim: 'Aspect',
    colUs: 'Talengineer',
    whenThemTitle: 'When the other option is the better choice',
    whenUsTitle: 'When Talengineer is the better choice',
    faqTitle: 'Common questions',
    ctaTitle: 'Still deciding?',
    ctaBody: 'Post the project in plain language — the AI turns it into a scope with milestones, and you see matched engineers before committing to anything.',
    ctaBtn: 'Post a project',
    asOfLabel: 'Competitor details verified',
    sourceNote: 'Statements about the other platform are taken from its own public pages on the date shown. Its offering may have changed since — please verify at the source.',
    dims: [
      'Who you can reach',
      'How capability is verified',
      'Payment and risk model',
      'On-site verification',
      'Fee transparency',
    ],
    us: [
      'Certified engineers across the US, Mexico, Vietnam, Thailand and China, working in 9 languages',
      'Hands-on AI technical screen at signup, then L1–L3 platform certification (AI-graded, human-reviewed). Certification is required before anyone can be assigned',
      'Milestone escrow: you fund a milestone, funds release only after you approve it. First milestone is money-back',
      'GPS-geofenced check-ins and photo QC build an evidence chain for on-site work',
      'Published 15% platform fee (5% for founding clients on their first 5 orders), shown before you commit',
    ],
  },
  zh: {
    kicker: '对比',
    indexTitle: 'Talengineer 和其他方式怎么比',
    indexSub: '直接说清楚什么时候该用我们，什么时候别的方式更合适。',
    indexRead: '查看对比',
    answerLabel: '一句话回答',
    tableTitle: '逐项对比',
    colDim: '对比项',
    colUs: 'Talengineer',
    whenThemTitle: '什么情况下对方更合适',
    whenUsTitle: '什么情况下 Talengineer 更合适',
    faqTitle: '常见问题',
    ctaTitle: '还在权衡？',
    ctaBody: '用大白话把需求写下来，AI 会把它整理成带里程碑的工作范围，并在您做任何承诺之前先给出匹配的工程师。',
    ctaBtn: '发布项目',
    asOfLabel: '竞对信息核实于',
    sourceNote: '关于对方平台的表述均取自其官网公开页面，日期见上。其产品口径可能已有变化，建议以对方原站为准。',
    dims: [
      '能触达什么人',
      '能力如何被验证',
      '付款与风险模型',
      '现场核验',
      '费率透明度',
    ],
    us: [
      '覆盖美国、墨西哥、越南、泰国、中国的持证工程师，以 9 种语言协作',
      '注册即过实操型 AI 技术筛选，再考 L1–L3 平台认证（AI 评分 + 人工复核）。未持证不可被指派',
      '里程碑托管：您先注资，验收通过后资金才放行。首个里程碑不满意可全额退款',
      'GPS 围栏签到 + 照片质检，为现场工作留下完整证据链',
      '公开 15% 平台费（创始客户前 5 单 5%），下单前就看得到',
    ],
  },
  es: {
    kicker: 'Comparativa',
    indexTitle: 'Cómo se compara Talengineer',
    indexSub: 'Respuestas directas sobre cuándo usarnos y cuándo otra opción encaja mejor.',
    indexRead: 'Ver la comparativa',
    answerLabel: 'Respuesta breve',
    tableTitle: 'Punto por punto',
    colDim: 'Aspecto',
    colUs: 'Talengineer',
    whenThemTitle: 'Cuándo conviene más la otra opción',
    whenUsTitle: 'Cuándo conviene más Talengineer',
    faqTitle: 'Preguntas frecuentes',
    ctaTitle: '¿Aún lo está evaluando?',
    ctaBody: 'Describa el proyecto con sus palabras: la IA lo convierte en un alcance con hitos y usted ve ingenieros compatibles antes de comprometerse a nada.',
    ctaBtn: 'Publicar un proyecto',
    asOfLabel: 'Datos del competidor verificados el',
    sourceNote: 'Las afirmaciones sobre la otra plataforma provienen de sus propias páginas públicas en la fecha indicada. Su oferta puede haber cambiado; verifique en la fuente.',
    dims: [
      'A quién puede llegar',
      'Cómo se verifica la capacidad',
      'Modelo de pago y riesgo',
      'Verificación en sitio',
      'Transparencia de tarifas',
    ],
    us: [
      'Ingenieros certificados en Estados Unidos, México, Vietnam, Tailandia y China, trabajando en 9 idiomas',
      'Evaluación técnica práctica con IA al registrarse y luego certificación de plataforma L1–L3 (calificada por IA, revisada por humanos). Sin certificación no se puede asignar a nadie',
      'Depósito en garantía por hitos: usted financia un hito y los fondos se liberan solo tras su aprobación. El primer hito tiene devolución de dinero',
      'Registros de entrada con geocerca GPS y control de calidad fotográfico que forman una cadena de evidencia del trabajo en sitio',
      'Comisión publicada del 15% (5% para clientes fundadores en sus primeros 5 proyectos), visible antes de comprometerse',
    ],
  },
  vi: {
    kicker: 'So sánh',
    indexTitle: 'Talengineer so với các lựa chọn khác',
    indexSub: 'Trả lời thẳng: khi nào nên dùng chúng tôi và khi nào lựa chọn khác phù hợp hơn.',
    indexRead: 'Xem so sánh',
    answerLabel: 'Trả lời ngắn gọn',
    tableTitle: 'So sánh từng mục',
    colDim: 'Hạng mục',
    colUs: 'Talengineer',
    whenThemTitle: 'Khi nào lựa chọn kia phù hợp hơn',
    whenUsTitle: 'Khi nào Talengineer phù hợp hơn',
    faqTitle: 'Câu hỏi thường gặp',
    ctaTitle: 'Vẫn đang cân nhắc?',
    ctaBody: 'Mô tả dự án bằng ngôn ngữ thường ngày — AI sẽ chuyển thành phạm vi công việc có cột mốc, và bạn thấy kỹ sư phù hợp trước khi cam kết bất cứ điều gì.',
    ctaBtn: 'Đăng dự án',
    asOfLabel: 'Thông tin đối thủ được kiểm chứng ngày',
    sourceNote: 'Các thông tin về nền tảng kia được lấy từ trang công khai của chính họ vào ngày nêu trên. Sản phẩm của họ có thể đã thay đổi — vui lòng kiểm chứng tại nguồn.',
    dims: [
      'Bạn tiếp cận được ai',
      'Năng lực được kiểm chứng thế nào',
      'Mô hình thanh toán và rủi ro',
      'Kiểm chứng tại hiện trường',
      'Minh bạch phí',
    ],
    us: [
      'Kỹ sư có chứng chỉ tại Mỹ, Mexico, Việt Nam, Thái Lan và Trung Quốc, làm việc bằng 9 ngôn ngữ',
      'Sàng lọc thực hành bằng AI ngay khi đăng ký, sau đó là chứng chỉ nền tảng L1–L3 (AI chấm, người duyệt). Chưa có chứng chỉ thì không thể được chỉ định',
      'Ký quỹ theo cột mốc: bạn nạp tiền cho một cột mốc, tiền chỉ được giải ngân sau khi bạn duyệt. Cột mốc đầu tiên được hoàn tiền',
      'Check-in theo hàng rào GPS và kiểm tra chất lượng bằng ảnh, tạo chuỗi bằng chứng cho công việc tại hiện trường',
      'Phí nền tảng công khai 15% (5% cho khách hàng sáng lập trong 5 đơn đầu), thấy được trước khi cam kết',
    ],
  },
  hi: {
    kicker: 'तुलना',
    indexTitle: 'Talengineer की तुलना कैसी बैठती है',
    indexSub: 'सीधा जवाब — हमें कब चुनें, और कब कोई दूसरा विकल्प बेहतर है।',
    indexRead: 'तुलना देखें',
    answerLabel: 'संक्षिप्त उत्तर',
    tableTitle: 'बिंदुवार तुलना',
    colDim: 'पहलू',
    colUs: 'Talengineer',
    whenThemTitle: 'दूसरा विकल्प कब बेहतर है',
    whenUsTitle: 'Talengineer कब बेहतर है',
    faqTitle: 'सामान्य प्रश्न',
    ctaTitle: 'अभी तय नहीं कर पाए?',
    ctaBody: 'प्रोजेक्ट अपनी भाषा में लिखें — AI उसे माइलस्टोन सहित स्कोप में बदल देगा, और किसी भी प्रतिबद्धता से पहले आपको मैच किए इंजीनियर दिखेंगे।',
    ctaBtn: 'प्रोजेक्ट पोस्ट करें',
    asOfLabel: 'प्रतिस्पर्धी जानकारी सत्यापित',
    sourceNote: 'दूसरे प्लेटफ़ॉर्म के बारे में कथन उसी की सार्वजनिक पेजों से, ऊपर दी तारीख पर लिए गए हैं। उनकी पेशकश बदल सकती है — कृपया स्रोत पर जाँच लें।',
    dims: [
      'आप किन तक पहुँच सकते हैं',
      'क्षमता कैसे सत्यापित होती है',
      'भुगतान और जोखिम मॉडल',
      'साइट पर सत्यापन',
      'फ़ीस की पारदर्शिता',
    ],
    us: [
      'अमेरिका, मैक्सिको, वियतनाम, थाईलैंड और चीन के प्रमाणित इंजीनियर, 9 भाषाओं में काम करते हुए',
      'साइनअप पर व्यावहारिक AI तकनीकी मूल्यांकन, फिर L1–L3 प्लेटफ़ॉर्म प्रमाणन (AI जाँच + मानव समीक्षा)। बिना प्रमाणन किसी को असाइन नहीं किया जा सकता',
      'माइलस्टोन एस्क्रो: आप माइलस्टोन फंड करते हैं, आपकी मंज़ूरी के बाद ही पैसा रिलीज़ होता है। पहला माइलस्टोन मनी-बैक है',
      'GPS जियोफ़ेंस चेक-इन और फ़ोटो QC साइट वर्क के लिए साक्ष्य शृंखला बनाते हैं',
      'घोषित 15% प्लेटफ़ॉर्म फ़ीस (फ़ाउंडिंग क्लाइंट के पहले 5 ऑर्डर पर 5%), प्रतिबद्धता से पहले ही दिखती है',
    ],
  },
  fr: {
    kicker: 'Comparatif',
    indexTitle: 'Talengineer face aux autres options',
    indexSub: 'Des réponses directes : quand nous choisir, et quand une autre solution convient mieux.',
    indexRead: 'Voir le comparatif',
    answerLabel: 'Réponse courte',
    tableTitle: 'Point par point',
    colDim: 'Critère',
    colUs: 'Talengineer',
    whenThemTitle: 'Quand l’autre option est préférable',
    whenUsTitle: 'Quand Talengineer est préférable',
    faqTitle: 'Questions fréquentes',
    ctaTitle: 'Encore en réflexion ?',
    ctaBody: 'Décrivez le projet avec vos mots : l’IA le transforme en cahier des charges avec jalons, et vous voyez des ingénieurs correspondants avant tout engagement.',
    ctaBtn: 'Publier un projet',
    asOfLabel: 'Informations concurrent vérifiées le',
    sourceNote: 'Les éléments concernant l’autre plateforme proviennent de ses propres pages publiques à la date indiquée. Son offre a pu évoluer — veuillez vérifier à la source.',
    dims: [
      'Qui vous pouvez atteindre',
      'Comment la compétence est vérifiée',
      'Modèle de paiement et de risque',
      'Vérification sur site',
      'Transparence des frais',
    ],
    us: [
      'Ingénieurs certifiés aux États-Unis, au Mexique, au Vietnam, en Thaïlande et en Chine, travaillant en 9 langues',
      'Évaluation technique pratique par IA à l’inscription, puis certification plateforme L1–L3 (notée par IA, revue par un humain). Sans certification, aucune affectation possible',
      'Séquestre par jalon : vous financez un jalon, les fonds ne sont libérés qu’après votre validation. Le premier jalon est remboursable',
      'Pointages géolocalisés (géorepérage GPS) et contrôle qualité photo constituant une chaîne de preuves pour le travail sur site',
      'Commission publiée de 15% (5% pour les clients fondateurs sur leurs 5 premières missions), visible avant tout engagement',
    ],
  },
  de: {
    kicker: 'Vergleich',
    indexTitle: 'Talengineer im Vergleich',
    indexSub: 'Klare Antworten: wann wir passen und wann eine andere Lösung besser ist.',
    indexRead: 'Vergleich ansehen',
    answerLabel: 'Kurze Antwort',
    tableTitle: 'Punkt für Punkt',
    colDim: 'Aspekt',
    colUs: 'Talengineer',
    whenThemTitle: 'Wann die andere Option besser passt',
    whenUsTitle: 'Wann Talengineer besser passt',
    faqTitle: 'Häufige Fragen',
    ctaTitle: 'Noch unentschieden?',
    ctaBody: 'Beschreiben Sie das Projekt in eigenen Worten — die KI macht daraus einen Leistungsumfang mit Meilensteinen, und Sie sehen passende Ingenieure, bevor Sie sich zu irgendetwas verpflichten.',
    ctaBtn: 'Projekt ausschreiben',
    asOfLabel: 'Wettbewerberangaben geprüft am',
    sourceNote: 'Aussagen über die andere Plattform stammen von deren eigenen öffentlichen Seiten zum angegebenen Datum. Das Angebot kann sich geändert haben — bitte an der Quelle prüfen.',
    dims: [
      'Wen Sie erreichen',
      'Wie Kompetenz geprüft wird',
      'Zahlungs- und Risikomodell',
      'Verifizierung vor Ort',
      'Transparenz der Gebühren',
    ],
    us: [
      'Zertifizierte Ingenieure in den USA, Mexiko, Vietnam, Thailand und China, in 9 Sprachen arbeitsfähig',
      'Praxisnaher KI-Techniktest bei der Anmeldung, danach Plattform-Zertifizierung L1–L3 (KI-bewertet, menschlich geprüft). Ohne Zertifizierung ist keine Beauftragung möglich',
      'Meilenstein-Treuhand: Sie finanzieren einen Meilenstein, die Freigabe erfolgt erst nach Ihrer Abnahme. Der erste Meilenstein ist geld-zurück-garantiert',
      'GPS-Geofencing-Check-ins und Foto-Qualitätskontrolle bilden eine Nachweiskette für Arbeiten vor Ort',
      'Veröffentlichte Plattformgebühr von 15% (5% für Gründungskunden bei den ersten 5 Aufträgen), sichtbar vor jeder Zusage',
    ],
  },
  ja: {
    kicker: '比較',
    indexTitle: 'Talengineer と他の選択肢の比較',
    indexSub: 'どんなときに当社が向き、どんなときに他の選択肢が向くかを率直にお伝えします。',
    indexRead: '比較を見る',
    answerLabel: '結論',
    tableTitle: '項目別の比較',
    colDim: '比較項目',
    colUs: 'Talengineer',
    whenThemTitle: '他の選択肢が向いている場合',
    whenUsTitle: 'Talengineer が向いている場合',
    faqTitle: 'よくあるご質問',
    ctaTitle: 'まだ検討中ですか',
    ctaBody: '案件を普段の言葉で書いてください。AI がマイルストーン付きの作業範囲に整え、何かを確約する前にマッチしたエンジニアをご覧いただけます。',
    ctaBtn: '案件を掲載する',
    asOfLabel: '競合情報の確認日',
    sourceNote: '他社プラットフォームに関する記述は、記載の日付時点における同社の公開ページに基づきます。内容は変更されている可能性がありますので、原典でご確認ください。',
    dims: [
      'どの人材に届くか',
      '能力の検証方法',
      '支払いとリスクの仕組み',
      '現場での検証',
      '手数料の透明性',
    ],
    us: [
      '米国・メキシコ・ベトナム・タイ・中国の認定エンジニア。9 言語で対応',
      '登録時に実技型の AI 技術スクリーニング、その後 L1–L3 の認定試験（AI 採点＋人による確認）。認定がなければアサインできません',
      'マイルストーン・エスクロー：入金後、承認して初めて資金が支払われます。初回マイルストーンは返金対応',
      'GPS ジオフェンスによるチェックインと写真による品質確認で、現場作業の証跡を残します',
      '公開された手数料 15%（創業期のお客様は最初の 5 件が 5%）。ご契約前に確認できます',
    ],
  },
  ko: {
    kicker: '비교',
    indexTitle: 'Talengineer와 다른 방식의 비교',
    indexSub: '언제 저희가 맞고 언제 다른 방식이 더 나은지 솔직하게 정리했습니다.',
    indexRead: '비교 보기',
    answerLabel: '짧은 답',
    tableTitle: '항목별 비교',
    colDim: '비교 항목',
    colUs: 'Talengineer',
    whenThemTitle: '다른 선택지가 더 나은 경우',
    whenUsTitle: 'Talengineer가 더 나은 경우',
    faqTitle: '자주 묻는 질문',
    ctaTitle: '아직 고민 중이신가요?',
    ctaBody: '프로젝트를 편한 말로 적어 주세요. AI가 마일스톤이 포함된 작업 범위로 정리하고, 무엇도 확정하기 전에 매칭된 엔지니어를 먼저 보여 드립니다.',
    ctaBtn: '프로젝트 등록',
    asOfLabel: '경쟁사 정보 확인일',
    sourceNote: '다른 플랫폼에 관한 내용은 표기된 날짜 기준으로 해당 사의 공개 페이지에서 가져온 것입니다. 이후 변경되었을 수 있으니 원문에서 확인해 주세요.',
    dims: [
      '누구에게 닿을 수 있는가',
      '역량을 어떻게 검증하는가',
      '결제와 리스크 구조',
      '현장 검증',
      '수수료 투명성',
    ],
    us: [
      '미국·멕시코·베트남·태국·중국의 인증 엔지니어, 9개 언어로 협업',
      '가입 시 실무형 AI 기술 스크리닝, 이후 L1–L3 플랫폼 인증(AI 채점 + 사람 검토). 인증이 없으면 배정될 수 없습니다',
      '마일스톤 에스크로: 입금 후 승인해야 대금이 지급됩니다. 첫 마일스톤은 환불 보장',
      'GPS 지오펜스 체크인과 사진 품질 확인으로 현장 작업의 증거 사슬을 남깁니다',
      '공개된 15% 플랫폼 수수료(창업 고객은 첫 5건 5%). 확정 전에 확인할 수 있습니다',
    ],
  },
};

// ── 语言无关的对比对象元数据 ──────────────────────────────────────────────────
// order 决定 /compare 索引页与 sitemap 的排列；external/asOf 只有点名竞对的页面才有，
// 用于在页面上标出"信息取自对方官网、核实日期、可自行核对"。
const COMPARISON_META = {
  'staffing-agency': { order: 1 },
  'freelance-marketplace': { order: 2 },
  'direct-hire': { order: 3 },
  'automate-america': { order: 4, external: 'https://www.automateamerica.com', asOf: '2026-07-18' },
  'field-nation': { order: 5, external: 'https://fieldnation.com', asOf: '2026-07-27' },
  'workmarket': { order: 6, external: 'https://www.workmarket.com', asOf: '2026-07-27' },
  'upwork': { order: 7, external: 'https://www.upwork.com', asOf: '2026-07-27' },
  'toptal': { order: 8, external: 'https://www.toptal.com', asOf: '2026-07-27' },
};

const SLUGS = Object.keys(COMPARISON_META).sort(
  (a, b) => COMPARISON_META[a].order - COMPARISON_META[b].order,
);

// ── 各对比页内容：语言 → slug → 内容 ─────────────────────────────────────────
// them 数组与 DICT.dims 一一对应（5 项，顺序不能错位）。
const COMPARISONS = {
  en: {
    'staffing-agency': {
      label: 'vs staffing agency',
      metaTitle: 'Staffing agency or platform for automation engineers?',
      metaDesc: 'When a staffing agency is the right call for industrial automation work, and when milestone-based platform hiring fits better.',
      question: 'Should I use a staffing agency or a platform to hire automation engineers?',
      answer: 'Use a staffing agency when you need someone on site next week in a city where the agency already has people on the bench, and you are comfortable paying a markup that is usually not published. Use Talengineer when the work has a defined scope, crosses a border or a language, or when you need proof the engineer can actually do the job before they are assigned. The real difference is where risk sits: an agency bills you for hours and you carry the delivery risk; Talengineer holds your money in milestone escrow and releases it only after you approve the work.',
      them: [
        'Whoever the agency has on its local bench, usually in one language',
        'Résumé screening plus a recruiter’s judgement',
        'Time-and-materials billing — you pay for hours whether or not the milestone lands',
        'Timesheets; presence on site is not independently verified',
        'The markup on top of the engineer’s rate is usually not disclosed',
      ],
      themWhen: [
        'You need a warm body on site in days, in a city where the agency is already staffed',
        'The work is open-ended maintenance rather than a project with a finish line',
        'You already have a rate agreement and a working relationship with that agency',
      ],
      usWhen: [
        'The project has a defined scope you can break into milestones',
        'The work crosses a border or a language — the engineer, the plant and the buyer are not all in one country',
        'You want capability verified before assignment, and payment tied to accepted work',
      ],
      faqs: [
        {
          q: 'Is a platform cheaper than a staffing agency?',
          a: 'Usually yes, because the fee is published rather than embedded in a bill rate: Talengineer charges 15% of each released milestone (5% for founding clients on their first 5 orders). But the honest comparison is not fee versus fee — an agency bills hours, we bill accepted milestones, so what you are buying differs.',
        },
        {
          q: 'Who handles compliance and insurance?',
          a: 'Engineers complete KYC, and W-9 and certificate-of-insurance documents are collected and verified on the platform before on-site work. An agency typically employs the contractor directly and carries that burden for you — if you specifically want an employer of record, an agency is the simpler route.',
        },
        {
          q: 'What if the engineer does not perform?',
          a: 'Do not approve the milestone. Funds stay in escrow, and you can open a dispute with a 5-day evidence window reviewed by an admin. The first milestone on your first project is money-back.',
        },
      ],
    },
    'freelance-marketplace': {
      label: 'vs general freelance marketplace',
      metaTitle: 'Why not hire automation engineers on a general freelance marketplace?',
      metaDesc: 'General marketplaces are broad and cheap. For industrial automation the gap is verification — certification before assignment and on-site evidence.',
      question: 'Why not just hire an automation engineer on a general freelance marketplace?',
      answer: 'A general marketplace is a reasonable way to find someone for remote, low-stakes work, and it will be cheaper to search. What it cannot tell you is whether a PLC engineer can actually commission your line — capability there is self-reported and confirmed only after the fact by client reviews. Talengineer is narrower on purpose: every engineer passes a hands-on technical screen at signup, must hold an L1–L3 platform certification before being assigned, and on-site work is backed by GPS check-ins and photo QC. When a bad commissioning costs you days of line downtime, that verification is the product.',
      them: [
        'Very large and mostly remote or software-oriented; industrial automation is a thin slice of it',
        'Self-reported skills and badges, confirmed after the fact by client reviews',
        'Hourly or fixed-price escrow; scope disputes handled case by case',
        'Built for remote work — there is no on-site verification layer',
        'The platform fee is published, but engineer quality varies widely',
      ],
      themWhen: [
        'The work is fully remote — a small HMI screen, a report, a one-off script',
        'The budget is small enough that a mis-hire costs you hours, not days of downtime',
        'You have the in-house expertise to judge the engineer yourself',
      ],
      usWhen: [
        'Someone has to physically be at the plant, and you need evidence they were',
        'You cannot personally assess whether the engineer knows Siemens or Rockwell well enough',
        'A failed commissioning means production downtime, not just a wasted invoice',
      ],
      faqs: [
        {
          q: 'Do general marketplaces not have escrow too?',
          a: 'Yes — fixed-price escrow is common there, so escrow itself is not the difference. The difference is what has to be true before an engineer can be assigned: on Talengineer they must hold a platform certification, and on-site work carries GPS and photo evidence.',
        },
        {
          q: 'Is your engineer pool smaller?',
          a: 'Much smaller, and deliberately so. Every listed engineer passed a hands-on AI technical screen, and only certified engineers can be assigned to a project. We would rather return five engineers who can do the job than five hundred profiles you have to sort through.',
        },
        {
          q: 'Can I still hire someone for a small remote task?',
          a: 'You can, but you may be overpaying for verification you do not need. For a quick remote task a general marketplace is the more practical choice — we are built for work where being wrong is expensive.',
        },
      ],
    },
    'direct-hire': {
      label: 'vs hiring full-time',
      metaTitle: 'Hire a full-time automation engineer or contract through a platform?',
      metaDesc: 'Full-time makes sense for continuous controls work. For project-shaped work, time-to-start and idle capacity are what decide it.',
      question: 'Should I hire a full-time automation engineer or contract through a platform?',
      answer: 'Hire full-time when the work is continuous — a plant with controls work all year round, where an in-house engineer builds up knowledge of your machines. Contract through a platform when the work is project-shaped: a retrofit, a commissioning window, a line move. The deciding constraint is usually time and idle capacity: filling a controls role in the US takes roughly two months of recruiting before anyone starts, and once hired you carry salary, benefits and the gaps between projects. A platform engagement starts in days and you pay only for the milestones you fund.',
      them: [
        'Whoever applies in your local labour market, within commuting distance',
        'Interviews and references — and you own the cost of getting it wrong',
        'Salary, benefits and payroll taxes, paid whether or not there is a project running',
        'They work for you directly, so verification is not a separate problem',
        'Fully transparent — it is your own payroll',
      ],
      themWhen: [
        'There is controls work all year, not a project with an end date',
        'The knowledge is worth accumulating in-house — your machines, your history, your quirks',
        'You need someone who can respond to a line stoppage at any hour',
      ],
      usWhen: [
        'The work is a project with a finish line: a retrofit, a commissioning, a line move',
        'You need a specialty you would never keep on staff full-time — machine vision, a specific robot brand',
        'The site is in another country and hiring locally means opening an entity first',
      ],
      faqs: [
        {
          q: 'How fast can an engineer actually start?',
          a: 'Matching runs within about 48 hours of posting; the start date depends on the engineer’s availability and any site access or visa requirements. Compare that with roughly two months of recruiting to fill a controls role in the US.',
        },
        {
          q: 'Can a contract engineer become a full-time employee?',
          a: 'Yes. There is no placement fee for converting — the platform fee applies to escrowed milestones, not to your hiring decisions.',
        },
        {
          q: 'What about knowledge staying in-house?',
          a: 'That is a real advantage of hiring full-time and we will not argue otherwise. Project documentation, check-in photos and QC records stay in your account after the project closes, but they are not a substitute for someone who has run your plant for three years.',
        },
      ],
    },
    'automate-america': {
      label: 'vs Automate America',
      metaTitle: 'Talengineer vs Automate America — which fits your project?',
      metaDesc: 'Automate America is built for US-local hourly automation staffing. Talengineer is built for cross-border, certification-gated, milestone-escrow project delivery.',
      question: 'Talengineer vs Automate America: which one fits your project?',
      answer: 'Automate America is a good fit if you need US-based automation contractors billed by the hour, with digital timesheets and fast payouts — that is what it is built for, and it is well established there. Talengineer is built for a different shape of work: cross-border projects run in nine languages, engineers who must pass a platform certification before they can be assigned to anything, and milestone escrow where your money is released only after you approve the work. If your job is US-local time-and-materials staffing, they are the better fit. If it is a defined-scope project — especially one that crosses a border — verification and the payment model are where we differ.',
      them: [
        'North America, in English',
        'Verified profiles, documented work history and reviews from prior customers, in its own words; no platform-run certification exam is published',
        'Hourly time-and-materials. In its own description, the platform takes a percentage of the hourly rate before the contract is shown to the marketplace; the percentage is not published',
        'Digital timesheets with a customer approval workflow; no location verification is published',
        'Free to join for all sides, with no subscription; the rate percentage taken is not published',
      ],
      themWhen: [
        'You need a US-based contractor billed hourly, starting as soon as possible',
        'You want the platform to run invoicing, payroll, benefits and compliance for you (their managed service)',
        'You intend to convert the contractor into a full-time employee later',
      ],
      usWhen: [
        'The project crosses a border or a language — a plant in Mexico, Vietnam or Thailand with a buyer elsewhere',
        'You want capability proven before assignment, through a certification exam rather than after-the-fact reviews',
        'You want funds held in escrow and released per accepted milestone, with a money-back first milestone',
      ],
      faqs: [
        {
          q: 'Is Automate America a competitor?',
          a: 'In one part of the market, yes — US-local automation contracting. In cross-border project delivery, nine-language coordination, certification-gated assignment and milestone escrow, we are solving a different problem.',
        },
        {
          q: 'Which one is cheaper?',
          a: 'The two cannot be compared rate to rate, because the fee models differ. Talengineer publishes 15% of each released milestone (5% for founding clients on their first 5 orders). Automate America describes taking a percentage of the hourly rate before the contract reaches the marketplace, and does not publish that percentage.',
        },
        {
          q: 'Can I use both?',
          a: 'Yes, and for many manufacturers that is the sensible answer — a US-local hourly contractor for ongoing support, and a defined-scope escrowed project for a plant build or retrofit abroad.',
        },
      ],
    },
    'field-nation': {
      "label": "vs Field Nation",
      "metaTitle": "Talengineer vs Field Nation — which fits your project?",
      "metaDesc": "Field Nation is a US-focused marketplace for on-site IT field service technicians billed per work order. Talengineer is built for cross-border, certification-gated industrial automation projects with milestone escrow.",
      "question": "Talengineer vs Field Nation: which one fits your project?",
      "answer": "Field Nation is a good fit if you need US-focused, on-site IT field service technicians — networking, cabling, point-of-sale, digital signage, security installs — dispatched fast from a huge existing pool (over a million work orders a year across 600K+ sites), with a simple published 10% fee taken from the technician's side. Talengineer is built for a different shape of work: certified industrial automation engineers — PLC, robotics, machine vision, electrical — across the US, Mexico, Vietnam, Thailand and China, working in nine languages, where a platform certification exam is required before anyone can be assigned, not just a profile, reviews and an optional background check, and your money sits in milestone escrow released only after you approve the work rather than disbursed to the technician on a weekly payment-terms cycle. If your job is US-local IT field service billed per work order, they're the better fit. If it's a defined-scope automation project — especially one crossing a border, or one where you want capability proven before assignment rather than after — verification and the payment model are where we differ.",
      "them": [
        "US-focused — its own pages describe coverage by US state and ZIP code, with occasional North America/Canada mentions ('across the US and Canada'); no international or global coverage is claimed. Technicians cover IT/on-site specialties — networking, cabling, point-of-sale, digital signage, computers & printers, security — not industrial automation.",
        "Self-reported profiles (skills, certifications, work history), buyer ratings/reviews, and a proprietary 'Provider Match' ranking algorithm plus a 'Success Score.' Background checks and drug tests (run through a third-party partner) are required only on work orders that call for them — 76% of them, by its own count — not on every job, and no platform-run certification exam is described on its own site.",
        "Not milestone escrow. Buyers either prefund a Field Nation account — held as a single custodial account commingled with other buyers' funds, per its own buyer terms — or use net 7/14/21/28-day payment terms; technicians are paid on a weekly cycle only once the buyer's payment processes, so on payment-terms work the technician carries the buyer's non-payment risk until then. California buyers have been barred from prefunding since March 2021 and must pay after approving the work instead.",
        "A check-in/check-out step, in-app photo documentation linked to the specific work order, and electronic signature capture at the job site. GPS is described as used for job discovery and mileage tracking; whether check-in itself is GPS-verified is not described on its own public pages — not published.",
        "The technician-side fee is published and simple: a flat 10% of the work order's final payment total, or 13.9% on its optional Pro tier (10% base plus a 3.9% add-on), plus optional insurance add-ons (1.95% for platform general-liability coverage, 1% or 0.5% for occupational accident insurance). What it charges buyers/companies is not published — plans are described as subscription-based, with pricing available only by contacting sales."
      ],
      "themWhen": [
        "You need US or North America-local IT field service — networking, cabling, POS, digital signage, security camera installs — not industrial automation.",
        "You want access to an already-massive technician pool (1M+ work orders a year, 600K+ sites) and speed matters more than proving capability through a certification exam before assignment.",
        "As the buyer, you want to pay the work order's face value with no separate platform-fee line item — Field Nation's cut is deducted from the technician's payout, not charged to you."
      ],
      "usWhen": [
        "The project crosses a border or a language — a plant in Mexico, Vietnam or Thailand with a buyer elsewhere — outside Field Nation's US/North America-focused network.",
        "You want capability proven through a certification exam before assignment, not a self-reported profile plus reviews and an optional, job-dependent background check.",
        "You want your funds held in milestone escrow and released only after you approve the work, rather than a weekly payment-terms cycle where the technician carries the risk of your non-payment until funds clear."
      ],
      "faqs": [
        {
          "q": "Is Field Nation a competitor?",
          "a": "In IT field service dispatch — networking, cabling, POS, security installs, billed by the work order — yes. In certification-gated industrial automation projects with milestone escrow and cross-border, multilingual delivery, we're solving a different problem."
        },
        {
          "q": "Which one is cheaper?",
          "a": "They can't be compared rate to rate — the fee is charged to a different party. Field Nation deducts a flat 10% from the technician's payout (13.9% on its optional Pro tier), and doesn't publish what, if anything, it charges buyers beyond the work order's face value; buyer plans are subscription-based and quoted by sales. Talengineer publishes its fee to the buyer directly: 15% of each released milestone (5% for founding clients on their first 5 orders), shown before you commit."
        },
        {
          "q": "Can I use both?",
          "a": "Yes — for many companies that's the practical split: Field Nation for US-local IT/on-site technician dispatch, and Talengineer for a certified, escrow-protected automation project, especially one crossing a border."
        }
      ]
    },
    'workmarket': {
      "label": "vs WorkMarket",
      "metaTitle": "Talengineer vs WorkMarket — which fits your project?",
      "metaDesc": "WorkMarket (by ADP) is a US-only platform for managing large pools of 1099 contractors. Talengineer is built for cross-border, certification-gated, milestone-escrow automation projects.",
      "question": "Talengineer vs WorkMarket: which one fits your project?",
      "answer": "WorkMarket, owned by ADP, is built for US companies running a large existing pool of 1099 contractors — bulk onboarding, background checks and skills tests configured per job category, automated 1099-NEC tax filing, and fast payouts across categories like IT field service, courier and security work. Its own Terms of Service state the platform 'is not intended to be used by Clients located outside of the United States,' and the only fee number it publishes is a 2.5% optional early-payment charge to the worker — the standard client-side platform fee is set per assignment and not disclosed. Talengineer is built for a different shape of work: a defined-scope industrial automation project, often crossing a border, where the engineer must hold a platform certification before being assigned to anything, and your money sits in milestone escrow released only after you approve it. If you're administering a domestic contingent workforce at scale, WorkMarket's tooling is more mature for that. If your job is a PLC, robotics or machine-vision project that needs pre-verified capability and payment protection, that's what we built for.",
      "them": [
        "US clients only. Its Terms of Service state the platform 'is not intended to be used by Clients located outside of the United States,' and a WorkMarket business page notes it 'currently only supports businesses with a US entity.' Contractor payouts are described as reaching 'almost anywhere in the world,' but who can buy on the platform is US-only.",
        "Background checks and drug tests run through a third-party consumer reporting agency (triggered by the worker's own written authorization), plus license/certification checks, tax ID/bank verification, and 'customizable tests to assess worker skills' that the client sets up per job category through its own 'Labor Clouds.' No platform-administered certification exam is published as a requirement before a worker can be assigned.",
        "Time-and-materials per assignment: the client posts an Assignment Value, and per its Terms, the client 'is obligated to pay the Independent Worker for an Assignment when such Assignment becomes an Approved Assignment' — i.e., when the client marks it complete. No escrow arrangement is described anywhere in its Terms, and once a charge is made, 'such charge or debit is non-refundable, except to the extent prohibited by applicable law.'",
        "A worker mobile app with check-in/check-out, geofencing (named specifically on its IT field-services page), photo and document upload as deliverables, and e-signature collection.",
        "The standard client-side 'Platform Fee' is set per assignment, and its Terms state 'WorkMarket reserves the right to change the Platform Fee at any time' — the percentage itself is not published. The only fee number disclosed in its Terms is a 2.5% charge to the worker for optional early access to funds (FastFunds); standard pricing otherwise requires contacting sales for a quote."
      ],
      "themWhen": [
        "You're a US company managing a large existing pool of 1099 contractors across many job categories — IT field techs, couriers, drivers, security, interpreters — and need bulk onboarding plus automated 1099-NEC tax filing.",
        "You want to define your own vetting rules per job category — background checks, drug tests, custom skills tests — rather than require a pre-issued platform certification before assignment.",
        "You want fast, flexible worker payouts (ACH, pay card, PayPal, optional early access to funds) across a high volume of short time-and-materials work orders."
      ],
      "usWhen": [
        "The project crosses a border — WorkMarket's own Terms restrict the platform to US-based clients; our engineers work across the US, Mexico, Vietnam, Thailand and China in nine languages.",
        "You want capability proven by a mandatory certification exam before assignment, not background checks and client-configured tests applied after a worker is already in the pool.",
        "You want funds held in escrow and released only after you approve each milestone, with the first milestone money-back — not a pay-on-approval model where charges are non-refundable once made."
      ],
      "faqs": [
        {
          "q": "Is WorkMarket a competitor?",
          "a": "In one part of the market, yes — large-scale US domestic contingent workforce management. In cross-border project delivery, certification-gated assignment and milestone escrow, we're solving a different problem."
        },
        {
          "q": "Which one is cheaper?",
          "a": "They aren't directly comparable, because WorkMarket doesn't publish its standard platform fee — its Terms only disclose an optional 2.5% charge to workers for early payment access (FastFunds). Talengineer publishes its fee up front: 15% of each released milestone, 5% for founding clients on their first 5 orders."
        },
        {
          "q": "Can I use both?",
          "a": "Yes. Many manufacturers run a platform like WorkMarket for their large US-based field-service or IT contractor pool, and use Talengineer separately for a defined-scope automation project — especially one that crosses a border and needs certified capability with escrowed milestones."
        }
      ]
    },
    'upwork': {
      "label": "vs Upwork",
      "metaTitle": "Talengineer vs Upwork — which fits your project?",
      "metaDesc": "Upwork is a general-purpose global freelance marketplace spanning thousands of skills. Talengineer is built for certification-gated, milestone-escrow industrial automation projects with on-site verification.",
      "question": "Talengineer vs Upwork: which one fits your project?",
      "answer": "Upwork is a good fit if you need to hire for almost any kind of remote work, not just automation engineering: it is a general-purpose marketplace of over 18 million freelancers across 180+ countries and thousands of skill categories, with flat published fee tiers and its own escrow system for fixed-price milestones — that scale and maturity are real. Talengineer is built narrower and deeper: certified industrial automation engineers only — PLC, robotics, machine vision, electrical — who must pass a platform certification before they can be assigned to anything, working across nine languages, with GPS-geofenced check-ins and photo QC for on-site work. If your hire is general-purpose remote work, Upwork's breadth is hard to match. If it's a defined industrial automation project — especially one with physical, on-site deliverables that need verifying — capability-gating before assignment and on-site evidence are where we differ.",
      "them": [
        "A general-purpose global marketplace, not specific to industrial automation: in its own words, 18+ million freelancers across 180+ countries and thousands of skill categories",
        "Every freelancer's identity and location is verified before a client can connect with them, and profiles show verified reviews and work history. Deeper skill vetting — the 'Expert-Vetted' badge, earned through a screening interview, skills tests and a portfolio or coding review — is optional, limited to certain categories, and by Upwork's own description visible only to Business Plus and Enterprise clients; most freelancers are never required to pass any exam before taking on work",
        "Fixed-price work is protected by 'project funds' (Upwork's current name for escrow): the client funds a milestone before work starts, and it releases when the client approves it or a 14-day review window closes automatically. Hourly work is protected separately, through the Work Diary time-tracking app rather than escrow. Beyond that, refunds are requested case by case within 180 days and granted at the freelancer's discretion; no first-milestone money-back guarantee is published",
        "Not published. Upwork's own trust-and-safety pages describe account and data security — two-factor authentication, encryption, malware scanning — with no mention of GPS check-ins, geofencing, or photo verification for in-person or on-site work",
        "Published and tiered on the client side: a 5% Marketplace fee on the Basic plan (3% for eligible U.S. clients paying by bank transfer) or 10% on Business Plus (8% eligible), plus a one-time Contract Initiation Fee of $0.99–$14.99 per contract. The freelancer-side fee ranges 0%–15% per contract, set by internal criteria Upwork doesn't publish, and is shown to the freelancer before they accept rather than fixed as one public rate"
      ],
      "themWhen": [
        "You need work outside industrial automation — writing, design, marketing, general software, admin — categories Talengineer doesn't offer at all",
        "You want the largest possible talent pool immediately, with an established base of reviews and ratings history, rather than a narrower certified roster",
        "Your engagement is open-ended hourly work rather than a defined-scope project — Upwork's Work Diary and hourly billing are built for continuous, ongoing engagement"
      ],
      "usWhen": [
        "You need capability proven and gated before assignment — a required platform certification specific to industrial automation — rather than an optional badge that's visible only to enterprise-tier clients and that most freelancers never take",
        "Your deliverable is physical and on-site — a plant floor, a retrofit, a commissioning visit — and you want GPS-geofenced check-ins and photo QC as evidence, which Upwork's own trust-and-safety pages don't describe",
        "You want the fee published as one flat, quotable percentage before you commit, and a money-back guarantee on the first milestone, instead of a 0%-15% freelancer-side rate set by unpublished criteria and no platform-wide refund guarantee"
      ],
      "faqs": [
        {
          "q": "Is Upwork a competitor?",
          "a": "In general-purpose freelance hiring, yes — it is one of the largest marketplaces in the world. In certification-gated industrial automation project delivery with on-site verification, we are solving a narrower, different problem that isn't specifically what it's built for."
        },
        {
          "q": "Which one is cheaper?",
          "a": "The fee structures aren't directly comparable. Talengineer publishes 15% of each released milestone (5% for founding clients on their first 5 orders). Upwork's client fee is 5% on its Basic plan or 10% on Business Plus (3%/8% for eligible U.S. clients paying by bank), plus a one-time contract initiation fee; the freelancer separately pays 0%-15% of their own earnings, set by criteria Upwork doesn't publish."
        },
        {
          "q": "Can I use both?",
          "a": "Yes. Many buyers use Upwork for general remote work — admin, marketing, software — and Talengineer specifically for certification-gated automation engineering, especially projects with physical, on-site deliverables."
        }
      ]
    },
    'toptal': {
      "label": "vs Toptal",
      "metaTitle": "Talengineer vs Toptal — which fits your project?",
      "metaDesc": "Toptal is a vetted network for hourly-billed remote knowledge work — developers, designers, finance, PM. Talengineer is built for certification-gated, milestone-escrowed industrial automation projects.",
      "question": "Talengineer vs Toptal: which one fits your project?",
      "answer": "Toptal is a good fit if you need a single vetted specialist — a developer, designer, product manager or finance analyst — billed hourly, with a no-risk trial before you commit. That is what it is built for: a five-stage screening funnel at network entry (its own published numbers put overall acceptance under 3% of monthly applicants), and a remote-first network spanning 100+ countries. Talengineer is built for a different shape of work: industrial automation projects — PLC, robotics, machine vision, electrical — where every engineer must clear a platform certification (L1-L3, AI-graded and human-reviewed) before being assigned to anything, work is funded and released per approved milestone rather than billed hourly, and on-site work carries GPS-geofenced check-ins and photo QC as evidence. If your job is remote, hourly-billed knowledge work, Toptal's trial-and-hire model is the better fit. If it's a defined-scope automation project — especially one that happens on a factory floor — certification gating and milestone escrow are where we differ.",
      "them": [
        "Experts in over 100 countries — most based in the Americas and Europe — serving clients in 140+ countries, in its own words, spanning software development, design, finance, and product/project management; no dedicated industrial automation, PLC, robotics or machine-vision category is listed, and no language-coverage figure is published beyond English-language screening during vetting",
        "A one-time network-entry screening in five stages, per Toptal's own published funnel: language and communication (26.4% pass), in-depth skills review (7.4%), a live technical interview (3.6%), then a 1-3 week test project (3.2%), with fewer than 3% of monthly applicants accepted overall; screening happens once at admission to the network, not per client or per skill, and no separate platform certification exam is published",
        "Hourly, blended-rate billing invoiced twice a month on Net 10 terms, plus a flat $79/month subscription once you proceed to talent matching; risk is covered by a no-risk trial of up to two weeks (with up to three candidates per role) where you are not billed if unsatisfied — its own FAQ does not use the words \"escrow\" or \"milestone\"",
        "Remote-first by design — \"the vast majority work remotely from their home office or a co-working space,\" in its own words — with on-site engagements described as a rare, special-case exception; no location verification, geofencing or photo QC system is published",
        "The $79/month subscription fee is published; hourly rates are described as \"blended\" to include Toptal's margin, but the specific percentage or markup it keeps from that rate is not published"
      ],
      "themWhen": [
        "You need a single remote knowledge-work specialist — developer, designer, PM, finance analyst — not an industrial automation engineer, and want to try up to three candidates risk-free before committing",
        "You want an ongoing hourly engagement, with a path to full-time conversion, rather than a defined-scope milestone project",
        "You want a network with an established multi-year track record across 100+ countries, vetted once through a published five-stage funnel rather than a per-assignment certification"
      ],
      "usWhen": [
        "Your project is industrial automation work — PLC, robotics, machine vision, electrical — a category Toptal's own site does not list as a specialty",
        "The work happens on a factory floor or job site and you want GPS-geofenced check-ins and photo QC as evidence, not a remote-first default",
        "You want funds released per milestone you approve, with a money-back first milestone, rather than hourly invoices on Net 10 terms"
      ],
      "faqs": [
        {
          "q": "Is Toptal a competitor?",
          "a": "In one part of the market, yes — vetted, remote, hourly-billed knowledge work. In industrial automation specifically — PLC, robotics, machine vision, electrical, with certification gating and on-site verification — we are solving a problem Toptal's own site does not target."
        },
        {
          "q": "Which one is cheaper?",
          "a": "The two cannot be compared rate to rate. Talengineer publishes 15% of each released milestone (5% for founding clients on their first 5 orders). Toptal publishes a flat $79/month subscription plus a blended hourly rate that includes its margin, but does not publish what percentage of that rate it keeps."
        },
        {
          "q": "Can I use both?",
          "a": "Yes. For many manufacturing teams that could mean a Toptal specialist for adjacent software or PM work, and a certified Talengineer engineer for the on-site automation project itself."
        }
      ]
    },
  },
};

COMPARISONS.zh = {
  'staffing-agency': {
    label: '对比人力中介',
    metaTitle: '找自动化工程师，该走人力中介还是平台？',
    metaDesc: '什么情况下人力中介更合适，什么情况下里程碑托管的平台模式更划算——直接说清楚。',
    question: '找自动化工程师，该走人力中介还是用平台？',
    answer: '如果您下周就要有人到现场、而且那个城市中介手上正好有闲置人手，同时您能接受一笔通常不公开的加价，那就走中介。如果这活儿有明确范围、要跨国跨语言，或者您需要在人被派过来之前就确认他真的会做，那就用 Talengineer。真正的区别在于风险落在谁身上：中介按工时收费，交付风险您自己扛；Talengineer 把钱锁在里程碑托管里，您验收通过之后才放款。',
    them: [
      '中介本地手上有谁就是谁，通常只有一种语言',
      '看简历加招聘顾问的判断',
      '按工时计费——不管里程碑有没有达成，工时照付',
      '有工时表，但没人独立核验他是否真的在现场',
      '加在工程师费率之上的那部分通常不披露',
    ],
    themWhen: [
      '几天内就要有人到现场，而中介在那个城市本来就有人',
      '活儿是没有终点的日常维护，不是有验收线的项目',
      '您和这家中介已经谈好费率、合作顺手',
    ],
    usWhen: [
      '项目范围明确，能拆成里程碑',
      '要跨国或跨语言——工程师、工厂、买方不在同一个国家',
      '希望能力在派人之前就被验证，付款与验收挂钩',
    ],
    faqs: [
      {
        q: '平台比人力中介便宜吗？',
        a: '通常便宜，因为费率是公开的、而不是埋在工时单价里：Talengineer 按每个放款里程碑收 15%（创始客户前 5 单 5%）。但诚实地说，这不是费率对费率的比较——中介卖的是工时，我们卖的是验收通过的里程碑，买的东西本身就不一样。',
      },
      {
        q: '合规和保险谁来管？',
        a: '工程师要过 KYC，W-9 与保险凭证（COI）在上现场之前由平台收取并核验。中介通常直接雇佣承包人、替您承担这部分负担——如果您明确需要一个名义雇主（employer of record），中介是更省事的路径。',
      },
      {
        q: '工程师干得不好怎么办？',
        a: '不要验收。资金留在托管里，您可以发起纠纷，有 5 天举证期并由管理员复核。首个项目的第一个里程碑不满意可全额退款。',
      },
    ],
  },
  'freelance-marketplace': {
    label: '对比通用自由职业平台',
    metaTitle: '为什么不在通用自由职业平台上找自动化工程师？',
    metaDesc: '通用平台又大又便宜。工业自动化缺的是验证——派人之前的持证门槛，和现场的证据链。',
    question: '为什么不直接在通用自由职业平台上找自动化工程师？',
    answer: '找一个做远程、低风险活儿的人，通用平台是合理选择，检索成本也更低。但它没法告诉您一个 PLC 工程师到底能不能把您的产线调起来——那边的能力靠自报，只能等干完了看客户评价。Talengineer 是刻意做窄的：每位工程师注册时都要过实操型技术筛选，被指派前必须持有 L1–L3 平台认证，现场工作还有 GPS 签到与照片质检兜底。当一次调试失败的代价是几天停产时，这套验证本身就是产品。',
    them: [
      '池子非常大，但以远程和软件类为主，工业自动化只占很薄一层',
      '技能靠自报和徽章，事后由客户评价确认',
      '按小时或固定价托管，范围争议逐案处理',
      '为远程工作而生——没有现场核验这一层',
      '平台费率公开，但工程师质量参差很大',
    ],
    themWhen: [
      '活儿完全远程——改一个 HMI 画面、出一份报告、写一段脚本',
      '预算小到即使找错人，损失也是几小时而不是几天停产',
      '您自己有足够的技术判断力去面这个人',
    ],
    usWhen: [
      '必须有人真的到工厂，而且您需要他到过现场的证据',
      '您没法亲自判断这个人对西门子或罗克韦尔到底熟不熟',
      '调试失败意味着停产，而不只是一张白花的发票',
    ],
    faqs: [
      {
        q: '通用平台不也有托管吗？',
        a: '有——固定价托管在那边很常见，所以托管本身不是区别。区别在于"一个工程师被指派之前必须先成立什么"：在 Talengineer 上他必须持有平台认证，现场工作还带 GPS 与照片证据。',
      },
      {
        q: '你们的工程师池是不是小很多？',
        a: '小很多，而且是故意的。每位在列工程师都过了实操型 AI 技术筛选，且只有持证工程师才能被指派到项目上。我们宁可给您 5 个真能干的人，也不给 500 份要您自己筛的简历。',
      },
      {
        q: '我还能找人做一个小的远程任务吗？',
        a: '可以，但您可能在为用不上的验证多付钱。临时的远程小活儿，通用平台更实际——我们是为"做错了代价很高"的工作准备的。',
      },
    ],
  },
  'direct-hire': {
    label: '对比直接雇全职',
    metaTitle: '自动化工程师该招全职还是通过平台按项目找？',
    metaDesc: '持续性的控制工作适合招全职。项目型的活儿，决定因素通常是到岗时间和闲置成本。',
    question: '自动化工程师该招一个全职，还是通过平台按项目找？',
    answer: '如果工作是持续性的——工厂全年都有控制方面的活儿，需要一个人把您机器的脾气摸熟——那就招全职。如果活儿是项目形状的：一次改造、一个调试窗口、一次产线搬迁，那就用平台。决定因素通常是时间和闲置成本：在美国填一个控制工程师岗位，从开始招到有人上岗大约要两个月，招进来之后工资、福利以及项目之间的空档都得您养着。平台合作几天内就能开始，而且只为您注资的里程碑付钱。',
    them: [
      '只能招到本地劳动力市场上、通勤范围内愿意来的人',
      '靠面试和背景调查——招错了成本您自己承担',
      '工资、福利、雇主税，不管有没有项目在跑都要付',
      '人直接向您汇报，所以核验不是一个单独的问题',
      '完全透明——那就是您自己的工资单',
    ],
    themWhen: [
      '全年都有控制方面的活儿，而不是一个有结束日期的项目',
      '经验值得沉淀在内部——您的机器、您的历史、您的那些怪毛病',
      '需要有人在任何时间点都能响应停线',
    ],
    usWhen: [
      '活儿是有终点的项目：改造、调试、产线搬迁',
      '需要的是您绝不会长期养着的专长——机器视觉、某个特定机器人品牌',
      '现场在另一个国家，本地招人得先注册实体',
    ],
    faqs: [
      {
        q: '工程师实际多久能开始？',
        a: '发布后大约 48 小时内完成匹配；具体开始日期取决于工程师的档期以及现场准入或签证要求。对比之下，在美国填一个控制岗位光招聘就要约两个月。',
      },
      {
        q: '合作过的工程师能转成全职员工吗？',
        a: '可以，转正不收任何中介费——平台费只针对托管的里程碑，不针对您的用人决定。',
      },
      {
        q: '经验沉淀在内部这一点怎么办？',
        a: '这确实是招全职的真实优势，我们不会硬辩。项目文档、签到照片与质检记录在项目结束后仍留在您的账户里，但它们替代不了一个在您厂里干了三年的人。',
      },
    ],
  },
  'automate-america': {
    label: '对比 Automate America',
    metaTitle: 'Talengineer 与 Automate America：哪个更适合您的项目？',
    metaDesc: 'Automate America 面向美国本土按工时的自动化用工。Talengineer 面向跨境、持证门槛、里程碑托管的项目交付。',
    question: 'Talengineer 与 Automate America：哪个更适合您的项目？',
    answer: '如果您需要的是按小时计费的美国本土自动化承包人，配上数字工时表和快速打款，那 Automate America 很合适——它就是为这个造的，在那一格也做得成熟。Talengineer 面向的是另一种形状的工作：以 9 种语言运行的跨境项目、工程师必须先通过平台认证才能被指派到任何活儿上、以及里程碑托管——您验收之后钱才放行。如果您的活儿是美国本地的按工时补人，他们更合适。如果是范围明确的项目、尤其还跨境，那么验证方式和付款模型就是我们的分野所在。',
    them: [
      '北美，英语',
      '按其官网表述：经核实的档案、有记录的工作经历、既往客户评价；未见公开的平台化分级考试',
      '按工时计费。按其自身描述，平台会在合同进入市场之前先从小时费率中抽取一部分；具体比例未公开',
      '数字工时表 + 客户审批流程；未见公开的位置核验机制',
      '各方免费加入、无订阅；但所抽取的费率比例未公开',
    ],
    themWhen: [
      '您需要一位美国本土、按小时计费、尽快到岗的承包人',
      '希望平台替您处理开票、薪酬、福利与合规（其托管服务）',
      '打算之后把这位承包人转成全职员工',
    ],
    usWhen: [
      '项目跨国或跨语言——工厂在墨西哥、越南或泰国，而买方在别处',
      '希望能力在派人之前就被考证验证，而不是事后看评价',
      '希望资金托管、按验收通过的里程碑放款，且首个里程碑可退款',
    ],
    faqs: [
      {
        q: 'Automate America 算竞争对手吗？',
        a: '在美国本土自动化用工这一格算。但在跨境项目交付、九语协同、持证才可指派与里程碑托管这几件事上，我们解决的是另一个问题。',
      },
      {
        q: '哪家更便宜？',
        a: '两者无法逐费率比较，因为收费模型不同。Talengineer 公开按每个放款里程碑收 15%（创始客户前 5 单 5%）。Automate America 自述会在合同进入市场之前从小时费率中抽取一部分，且未公开该比例。',
      },
      {
        q: '两家能同时用吗？',
        a: '能，而且对很多制造企业来说这才是合理答案——日常支持用美国本地按工时的承包人，海外建厂或改造这种范围明确的项目走托管。',
      },
    ],
  },
  'field-nation': {
    "label": "对比 Field Nation",
    "metaTitle": "Talengineer 对比 Field Nation — 哪个更适合你的项目？",
    "metaDesc": "Field Nation 是一个专注美国本土的现场 IT 外勤技术人员市场，按工单计费。Talengineer 专为跨境、需通过认证方可上岗的工业自动化项目打造，采用里程碑托管付款。",
    "question": "Talengineer 对比 Field Nation：哪一个更适合你的项目？",
    "answer": "如果你需要的是美国本土的现场 IT 外勤技术人员——网络布线、综合布线、POS 收银、数字标牌、安防安装——并希望从一个庞大的现有人才库中快速调度（每年超过 100 万份工单，覆盖 60 万+个站点），且平台费用公开透明、按技术人员一方扣取固定 10%，那么 Field Nation 是不错的选择。Talengineer 面向的是另一类工作：经过认证的工业自动化工程师——PLC、机器人、机器视觉、电气——服务范围覆盖美国、墨西哥、越南、泰国和中国，可用九种语言沟通；在这里，任何人被指派任务前都必须通过平台认证考试，而不仅仅依靠个人资料、评价和可选的背景调查；你的资金会存放在里程碑托管账户中，只有在你确认验收工作成果后才会释放，而不是按每周付款周期直接支付给技术人员。如果你的工作是按工单计费的美国本地 IT 外勤服务，Field Nation 更适合你。如果这是一个范围明确的自动化项目——尤其是跨境项目，或者你希望在指派任务前就验证能力而非事后才验证——那么在资质核验与付款模式上，我们与 Field Nation 存在本质差异。",
    "them": [
      "专注美国本土——其官网页面按美国州和邮编划分覆盖范围，偶尔提及北美/加拿大（\"覆盖美国和加拿大\"），未宣称任何国际或全球覆盖。技术人员的专长集中在 IT / 现场服务领域——网络布线、综合布线、POS 收银、数字标牌、电脑与打印机、安防——而非工业自动化。",
      "个人自主填写的资料（技能、认证、工作经历）、买家评分/评价，以及一套专有的\"Provider Match\"匹配排名算法和\"Success Score\"评分。背景调查和药检（通过第三方合作机构执行）仅在工单要求时才进行——按其自己的统计，占比 76%——并非每单必查，其官网也未描述任何由平台自行组织的认证考试。",
      "不是里程碑托管。买家要么预先为 Field Nation 账户充值——按其自身买家条款，这是一个与其他买家资金混合存放的单一托管账户——要么使用 net 7/14/21/28 天的账期付款；技术人员按每周周期结算，但前提是买家的付款已经完成处理，因此在账期付款模式下，技术人员在此之前一直承担买家不付款的风险。自 2021 年 3 月起，加州买家已被禁止预充值，只能在确认验收工作后再付款。",
      "签到/签退流程、与具体工单关联的应用内照片记录，以及现场电子签名采集。GPS 被描述为用于工单发现和里程追踪；签到本身是否经过 GPS 校验，其公开页面上并未说明——未公开。",
      "技术人员一方的费用公开且简单：按工单最终付款总额固定收取 10%，或在其可选的 Pro 套餐下收取 13.9%（10% 基础费加 3.9% 附加费），另有可选保险附加费（平台一般责任险 1.95%，职业意外险 1% 或 0.5%）。至于向买家/企业方收取的费用则未公开——其方案描述为订阅制，需联系销售才能获得报价。"
    ],
    "themWhen": [
      "你需要美国或北美本地的 IT 现场服务——网络布线、综合布线、POS、数字标牌、安防摄像头安装——而非工业自动化。",
      "你希望接触一个规模已经很庞大的技术人员库（每年 100 万+工单，覆盖 60 万+站点），并且速度比在指派前通过认证考试验证能力更重要。",
      "作为买家，你希望按工单的面值付款，账单上没有单独的平台费用项——Field Nation 的抽成是从技术人员的收入中扣除，而不是向你另行收取。"
    ],
    "usWhen": [
      "项目跨越国境或语言——比如买家在其他地方，而工厂在墨西哥、越南或泰国——超出了 Field Nation 以美国/北美为核心的服务网络范围。",
      "你希望在指派任务前，通过认证考试验证能力，而不是依靠自主填写的资料加评价，外加一项可选的、视工单而定的背景调查。",
      "你希望资金存放在里程碑托管账户中，只有在你确认验收工作后才释放，而不是采用每周账期付款周期，让技术人员在资金到账前一直承担你可能不付款的风险。"
    ],
    "faqs": [
      {
        "q": "Field Nation 算是竞争对手吗？",
        "a": "在按工单计费的 IT 现场服务调度领域——网络布线、综合布线、POS、安防安装——是的。但在需要通过平台认证、采用里程碑托管、支持跨境多语言交付的工业自动化项目领域，我们解决的是不同的问题。"
      },
      {
        "q": "哪个更便宜？",
        "a": "两者无法直接按费率比较——费用是向不同的一方收取的。Field Nation 从技术人员的收入中固定扣取 10%（可选 Pro 套餐为 13.9%），并未公开是否会、以及会向买家收取多少超出工单面值的费用；买家方案是订阅制，需联系销售报价。Talengineer 则直接向买家公开费用：每笔已释放里程碑的 15%（创始客户前 5 笔订单为 5%），在你下单前就已展示清楚。"
      },
      {
        "q": "可以两个都用吗？",
        "a": "可以——对很多公司来说，这正是实际的分工方式：Field Nation 用于美国本地 IT / 现场技术人员调度，Talengineer 用于有认证保障、资金受托管保护的自动化项目，尤其是跨境项目。"
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer 对比 WorkMarket——哪个更适合你的项目？",
    "metaDesc": "WorkMarket（ADP 旗下）是一个仅限美国使用的平台，用于管理大批量 1099 独立承包商。Talengineer 专为跨境、认证门槛、里程碑托管自动化项目而打造。",
    "question": "Talengineer 对比 WorkMarket：哪个更适合你的项目？",
    "answer": "WorkMarket 归属 ADP，专为管理现有大批量 1099 独立承包商的美国企业打造——按职位类别配置的批量入职、背景调查和技能测试，自动化的 1099-NEC 报税，以及覆盖 IT 现场服务、快递和安保等类别的快速付款。其服务条款明确写明该平台“不供美国境外的客户使用”，而它公开的唯一费用数字是向工人收取的 2.5% 可选提前放款手续费——标准的客户端平台费用按每项任务单独设定，并不公开。Talengineer 面向的是另一种工作形态：范围明确的工业自动化项目，常常跨境进行，工程师必须先取得平台认证才能被指派任何任务，你的资金则存放在里程碑托管账户中，只有在你审核通过后才会放款。如果你要大规模管理国内的临时用工团队，WorkMarket 的工具更成熟。如果你的项目是需要事先验证能力、并需要付款保障的 PLC、机器人或机器视觉项目，这正是我们打造 Talengineer 的初衷。",
    "them": [
      "仅限美国客户。其服务条款明确写明该平台“不供美国境外的客户使用”，WorkMarket 的一个企业页面也提到它“目前仅支持拥有美国实体的企业”。承包商的付款据称可以到达“世界上几乎任何地方”，但谁能在平台上采购服务，则仅限美国。",
      "背景调查和药物检测通过第三方消费者报告机构进行（由工人本人的书面授权触发），此外还有执照/资质核验、税号/银行信息核验，以及客户通过自己的“Labor Clouds”按职位类别设置的“可定制技能测试”。平台并未公开要求工人在被指派前必须通过任何由平台统一管理的认证考试。",
      "按任务计时计料收费：客户发布一个“任务价值”（Assignment Value），根据其服务条款，客户“有义务在该任务成为已批准任务（Approved Assignment）时向独立工人支付款项”——也就是客户将其标记为完成之时。其服务条款中没有提到任何托管安排，而一旦扣款完成，“该笔扣款不可退还，除非适用法律另有规定”。",
      "一款工人移动应用，支持签到/签退、地理围栏（在其 IT 现场服务页面中特别提及）、以照片和文档上传作为交付物，以及电子签名收集。",
      "标准的客户端“平台费用”按每项任务单独设定，其服务条款写明“WorkMarket 保留随时更改平台费用的权利”——具体百分比并未公开。其服务条款中公开的唯一费用数字，是向工人收取的 2.5% 可选提前放款（FastFunds）费用；其余标准定价需联系销售获取报价。"
    ],
    "themWhen": [
      "你是一家美国企业，需要管理跨多个职位类别（IT 现场技术员、快递员、司机、安保人员、口译员等）的大批量现有 1099 独立承包商，并需要批量入职和自动化 1099-NEC 报税。",
      "你希望按职位类别自行定义审核规则——背景调查、药物检测、自定义技能测试——而不是要求工人在被指派前先取得平台颁发的认证。",
      "你希望在大量短期计时计料工单中获得快速、灵活的工人付款方式（ACH、工资卡、PayPal，以及可选的提前放款）。"
    ],
    "usWhen": [
      "项目涉及跨境——WorkMarket 自己的服务条款将平台限定为美国客户使用；我们的工程师以九种语言在美国、墨西哥、越南、泰国和中国等地开展工作。",
      "你希望能力在被指派前，经由强制性认证考试得到证明，而不是被指派进入人才池之后才叠加背景调查和客户自定义测试。",
      "你希望资金存放在托管账户中，仅在你审核通过每个里程碑后才放款，且第一个里程碑可退款——而不是一种一经批准即扣款、且扣款一旦发生便不可退还的模式。"
    ],
    "faqs": [
      {
        "q": "WorkMarket 是竞争对手吗？",
        "a": "在市场的某一部分是的——即大规模的美国国内临时用工管理。但在跨境项目交付、认证门槛式指派和里程碑托管方面，我们解决的是不同的问题。"
      },
      {
        "q": "哪个更便宜？",
        "a": "两者并不能直接比较，因为 WorkMarket 并未公开其标准平台费用——其服务条款只披露了向工人收取的 2.5% 可选提前放款（FastFunds）手续费。Talengineer 则提前公开收费标准：每个已放款里程碑收取 15%，创始客户在前 5 笔订单中收取 5%。"
      },
      {
        "q": "可以两者都用吗？",
        "a": "可以。许多制造商会用 WorkMarket 这类平台管理其大规模的美国现场服务或 IT 承包商团队，同时单独使用 Talengineer 处理范围明确的自动化项目——尤其是那些跨境、且需要持证能力和里程碑托管的项目。"
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork——哪个更适合你的项目？",
    "metaDesc": "Upwork 是一个覆盖数千种技能的通用型全球自由职业市场。Talengineer 专为需要平台认证、里程碑托管的工业自动化项目打造，并提供现场核验。",
    "question": "Talengineer vs Upwork：哪个更适合你的项目？",
    "answer": "如果你要招聘的不仅限于自动化工程，而是几乎任何类型的远程工作，Upwork 是不错的选择：它是一个通用型市场，覆盖180多个国家的1800多万名自由职业者和数千个技能类别，收费按公开的固定档位收取，并为固定价格的里程碑配备自己的托管系统——这种规模和成熟度是真实的。Talengineer 走的是更窄、更深的路线：只有持证的工业自动化工程师——PLC、机器人、机器视觉、电气——在被分配任何任务之前都必须通过平台认证，服务覆盖九种语言，现场工作配备GPS地理围栏签到和照片质检。如果你要招的是通用型远程工作，Upwork 的广度很难被超越。如果这是一个明确界定的工业自动化项目——尤其是有需要核验的实体现场交付物——那么分配前的能力门槛和现场证据，就是我们与它的区别所在。",
    "them": [
      "一个通用型的全球市场，并非专注于工业自动化：按其官方说法，覆盖180多个国家、1800多万名自由职业者和数千个技能类别",
      "在客户能够联系到自由职业者之前，其身份和所在地都会经过核实，个人资料上会显示经过验证的评价和工作履历。更深入的技能审核——即通过筛选面试、技能测试和作品集或代码评审获得的'Expert-Vetted'认证徽章——是可选的，仅限于部分类别，且据 Upwork 自述，仅对 Business Plus 和 Enterprise 客户可见；大多数自由职业者在接单前都无需通过任何考核",
      "固定价格的工作由'project funds'（Upwork 目前对托管的称呼）提供保障：客户在工作开始前为里程碑注资，待客户批准后放款，或在14天的审核期自动结束后放款。按小时计费的工作则通过 Work Diary 工时记录应用而非托管来单独保障。除此之外，退款按个案在180天内申请，是否批准由自由职业者自行决定；官方并未公布首个里程碑的退款保证",
      "未公开。Upwork 自己的信任与安全页面描述的是账户和数据安全——双重身份验证、加密、恶意软件扫描——并未提及针对线下或现场工作的GPS签到、地理围栏或照片验证",
      "在客户端公开且分档收费：Basic 计划收取5%的市场服务费（符合条件、以银行转账付款的美国客户为3%），Business Plus 计划为10%（符合条件为8%），此外每份合同还有一笔$0.99–$14.99的一次性合同启动费。自由职业者一侧的费用按每份合同0%–15%浮动，具体由 Upwork 未公开的内部标准决定，在自由职业者接单前才会显示给其本人，而非一个固定公开的费率"
    ],
    "themWhen": [
      "你需要工业自动化以外的工作——写作、设计、营销、通用软件开发、行政事务——这些类别 Talengineer 完全不提供",
      "你想要立即获得尽可能大的人才库，拥有成熟的评价和评分历史基础，而不是范围更窄的持证名录",
      "你的用工是不限期限的按小时工作，而非范围明确的项目——Upwork 的 Work Diary 和按小时计费机制正是为持续、长期的用工关系而设计的"
    ],
    "usWhen": [
      "你需要在分配任务之前就验证并把关能力——一项专为工业自动化设立的强制性平台认证——而不是一个仅对企业级客户可见、且大多数自由职业者从未参加过的可选徽章",
      "你的交付物是实体且在现场完成的——工厂车间、设备改造、调试现场——你需要GPS地理围栏签到和照片质检作为证据，而这些是 Upwork 自己的信任与安全页面并未描述的",
      "你希望在承诺之前就能看到一个公开、可直接报价的固定费率百分比，并且首个里程碑享有退款保证，而不是一个由未公开标准决定的0%–15%自由职业者端费率，也没有平台级的退款保证"
    ],
    "faqs": [
      {
        "q": "Upwork 算是竞争对手吗？",
        "a": "在通用型自由职业招聘领域，是的——它是全球最大的市场之一。但在需要平台认证、并进行现场核验的工业自动化项目交付方面，我们解决的是一个更窄、不同的问题，而这并不是 Upwork 专为之打造的场景。"
      },
      {
        "q": "哪个更便宜？",
        "a": "两者的费用结构并不能直接比较。Talengineer 公开收取每笔已放款里程碑金额的15%（创始客户的前5笔订单为5%）。Upwork 的客户端费用为 Basic 计划5%或 Business Plus 计划10%（符合条件、以银行转账付款的美国客户分别为3%/8%），另加一次性合同启动费；自由职业者则另需从自己的收入中支付0%–15%，具体比例由 Upwork 未公开的标准决定。"
      },
      {
        "q": "可以两者都用吗？",
        "a": "可以。许多买家会用 Upwork 处理通用型远程工作——行政、营销、软件开发——而专门用 Talengineer 承接需要平台认证的自动化工程项目，尤其是有实体现场交付物的项目。"
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer 对比 Toptal——哪个更适合你的项目？",
    "metaDesc": "Toptal 是一个经过审核的按小时计费远程知识工作网络——开发者、设计师、财务、项目经理。Talengineer 专为持证准入、里程碑托管的工业自动化项目而生。",
    "question": "Talengineer 对比 Toptal：哪个更适合你的项目？",
    "answer": "如果你需要的是一位经过审核的独立专家——开发者、设计师、产品经理或财务分析师——按小时计费，并且希望在正式签约前有无风险试用期，那么 Toptal 是不错的选择。这正是它的定位：入网时设有五阶段筛选漏斗（据其官方公布的数据，每月申请者的总体通过率不足3%），并拥有一个覆盖100多个国家、以远程为主的网络。Talengineer 面向的是另一类工作：工业自动化项目——PLC、机器人、机器视觉、电气——在这里，每位工程师在被指派任何任务前都必须通过平台认证（L1-L3，AI 评分并经人工复核），项目资金按已批准的里程碑分批拨付，而非按小时计费，现场工作还配有 GPS 电子围栏打卡和照片质检作为凭证。如果你的工作是远程的、按小时计费的知识型工作，Toptal 的试用后聘用模式更适合你。如果这是一个范围明确的自动化项目——尤其是发生在工厂车间的项目——认证准入和里程碑托管就是我们的差异所在。",
    "them": [
      "专家遍布100多个国家——大多数位于美洲和欧洲——按其官方说法，为140多个国家的客户提供服务，覆盖软件开发、设计、财务和产品/项目管理；未单独列出工业自动化、PLC、机器人或机器视觉类别，除审核期间的英语筛选外，也未公布具体的语言覆盖数据",
      "一次性的入网筛选分五个阶段，据 Toptal 官方公布的漏斗数据：语言与沟通能力（通过率26.4%）、深入技能评审（7.4%）、现场技术面试（3.6%）、再到为期1-3周的测试项目（3.2%），每月申请者总体通过率不足3%；筛选只在入网时进行一次，而非按客户或按技能逐项进行，也未公布单独的平台认证考试",
      "按小时计费的混合费率，每月开票两次，账期为Net 10；一旦进入人才匹配阶段，还需支付每月$79的固定订阅费；风险由最长两周的无风险试用（每个职位最多可试用三位候选人）覆盖，若不满意则不计费——其官方常见问题解答中并未使用“托管”（escrow）或“里程碑”（milestone）这两个词",
      "按设计以远程为主——用其官方原话：“绝大多数人在自己的家庭办公室或联合办公空间远程工作”——现场合作被描述为罕见的特殊情况；未公布任何地点验证、电子围栏或照片质检系统",
      "官方公布了每月$79的订阅费；小时费率被描述为“混合费率”，其中包含 Toptal 的利润，但具体从中抽取的比例或加价幅度未公布"
    ],
    "themWhen": [
      "你需要的是一位远程知识型工作的独立专家——开发者、设计师、项目经理或财务分析师——而非工业自动化工程师，并希望在签约前免费试用最多三位候选人",
      "你想要的是一种可持续的按小时合作关系，并有机会转为全职，而不是一个范围明确的里程碑制项目",
      "你想要一个拥有多年、覆盖100多个国家成熟履历的网络，只需通过公开的五阶段漏斗一次性审核，而不是按项目逐一认证"
    ],
    "usWhen": [
      "你的项目是工业自动化工作——PLC、机器人、机器视觉、电气——这是 Toptal 官网并未列为专长的类别",
      "工作发生在工厂车间或施工现场，你需要 GPS 电子围栏打卡和照片质检作为凭证，而不是默认的远程优先模式",
      "你希望资金按你批准的每个里程碑分批拨付，首个里程碑不满意可退款，而不是按 Net 10 账期开具小时账单"
    ],
    "faqs": [
      {
        "q": "Toptal 是竞争对手吗？",
        "a": "在市场的一部分领域，是的——经过审核的、远程的、按小时计费的知识型工作。但具体到工业自动化领域——PLC、机器人、机器视觉、电气，配合认证准入和现场核验——我们解决的是 Toptal 官网并未涉及的问题。"
      },
      {
        "q": "哪个更便宜？",
        "a": "两者的费率无法直接比较。Talengineer 公开收取每笔已放款里程碑金额的15%（创始客户前5笔订单为5%）。Toptal 公开的是每月$79的固定订阅费，加上包含其利润的混合小时费率，但未公布其中抽取的具体比例。"
      },
      {
        "q": "可以同时使用两者吗？",
        "a": "可以。对许多制造业团队来说，这可能意味着：相关的软件或项目管理工作交给 Toptal 专家，而现场自动化项目本身交给经过认证的 Talengineer 工程师。"
      }
    ]
  },
};

COMPARISONS.es = {
  'staffing-agency': {
    label: 'frente a una agencia de personal',
    metaTitle: '¿Agencia de personal o plataforma para ingenieros de automatización?',
    metaDesc: 'Cuándo conviene una agencia de personal para trabajo de automatización industrial y cuándo encaja mejor la contratación por hitos.',
    question: '¿Debo usar una agencia de personal o una plataforma para contratar ingenieros de automatización?',
    answer: 'Use una agencia cuando necesite a alguien en sitio la próxima semana en una ciudad donde la agencia ya tenga personal disponible y no le incomode pagar un margen que normalmente no se publica. Use Talengineer cuando el trabajo tenga un alcance definido, cruce una frontera o un idioma, o cuando necesite comprobar que el ingeniero realmente sabe hacerlo antes de asignarlo. La diferencia real está en dónde queda el riesgo: la agencia le factura horas y usted carga con el riesgo de entrega; Talengineer retiene su dinero en depósito en garantía por hitos y lo libera solo después de que usted apruebe el trabajo.',
    them: [
      'Quien la agencia tenga disponible localmente, normalmente en un solo idioma',
      'Revisión de currículos más el criterio de un reclutador',
      'Facturación por tiempo y materiales: usted paga las horas se cumpla el hito o no',
      'Hojas de horas; la presencia en sitio no se verifica de forma independiente',
      'El margen sobre la tarifa del ingeniero normalmente no se revela',
    ],
    themWhen: [
      'Necesita a alguien en sitio en días, en una ciudad donde la agencia ya tiene personal',
      'El trabajo es mantenimiento continuo y no un proyecto con fecha de cierre',
      'Ya tiene un acuerdo de tarifas y una relación establecida con esa agencia',
    ],
    usWhen: [
      'El proyecto tiene un alcance definido que puede dividirse en hitos',
      'El trabajo cruza una frontera o un idioma: el ingeniero, la planta y el comprador no están en el mismo país',
      'Quiere la capacidad verificada antes de la asignación y el pago ligado al trabajo aceptado',
    ],
    faqs: [
      {
        q: '¿Una plataforma es más barata que una agencia?',
        a: 'Normalmente sí, porque la comisión se publica en lugar de ir incrustada en la tarifa facturada: Talengineer cobra el 15% de cada hito liberado (5% para clientes fundadores en sus primeros 5 proyectos). Pero la comparación honesta no es comisión contra comisión: la agencia factura horas y nosotros hitos aceptados, así que lo que usted compra es distinto.',
      },
      {
        q: '¿Quién se ocupa del cumplimiento y los seguros?',
        a: 'Los ingenieros completan KYC, y los documentos W-9 y el certificado de seguro (COI) se recogen y verifican en la plataforma antes del trabajo en sitio. Una agencia suele emplear directamente al contratista y asumir esa carga por usted; si lo que quiere específicamente es un empleador de registro, la agencia es la vía más sencilla.',
      },
      {
        q: '¿Y si el ingeniero no cumple?',
        a: 'No apruebe el hito. Los fondos permanecen en depósito en garantía y usted puede abrir una disputa con una ventana de 5 días para presentar evidencia, revisada por un administrador. El primer hito de su primer proyecto tiene devolución de dinero.',
      },
    ],
  },
  'freelance-marketplace': {
    label: 'frente a un marketplace freelance general',
    metaTitle: '¿Por qué no contratar ingenieros de automatización en un marketplace freelance general?',
    metaDesc: 'Los marketplaces generales son amplios y baratos. En automatización industrial lo que falta es verificación: certificación antes de asignar y evidencia en sitio.',
    question: '¿Por qué no contratar a un ingeniero de automatización en un marketplace freelance general?',
    answer: 'Un marketplace general es una forma razonable de encontrar a alguien para trabajo remoto de bajo riesgo, y buscar allí sale más barato. Lo que no puede decirle es si un ingeniero de PLC realmente puede poner en marcha su línea: allí la capacidad es autodeclarada y solo se confirma después, con reseñas de clientes. Talengineer es más estrecho a propósito: cada ingeniero pasa una evaluación técnica práctica al registrarse, debe tener una certificación de plataforma L1–L3 antes de ser asignado, y el trabajo en sitio se respalda con registros GPS y control de calidad fotográfico. Cuando una puesta en marcha fallida le cuesta días de línea parada, esa verificación es el producto.',
    them: [
      'Muy grande y mayormente remoto o de software; la automatización industrial es una porción muy delgada',
      'Habilidades autodeclaradas e insignias, confirmadas después por reseñas de clientes',
      'Depósito por horas o precio fijo; las disputas de alcance se resuelven caso por caso',
      'Diseñado para trabajo remoto: no existe una capa de verificación en sitio',
      'La comisión de la plataforma se publica, pero la calidad de los ingenieros varía mucho',
    ],
    themWhen: [
      'El trabajo es totalmente remoto: una pantalla HMI pequeña, un informe, un script puntual',
      'El presupuesto es tan bajo que equivocarse le cuesta horas, no días de línea parada',
      'Usted tiene la experiencia interna para evaluar al ingeniero por su cuenta',
    ],
    usWhen: [
      'Alguien tiene que estar físicamente en la planta y usted necesita evidencia de que estuvo',
      'Usted no puede valorar personalmente si el ingeniero domina Siemens o Rockwell',
      'Una puesta en marcha fallida significa producción detenida, no solo una factura perdida',
    ],
    faqs: [
      {
        q: '¿Los marketplaces generales no tienen también depósito en garantía?',
        a: 'Sí, el depósito a precio fijo es común allí, así que el depósito en sí no es la diferencia. La diferencia es qué debe cumplirse antes de que un ingeniero pueda ser asignado: en Talengineer debe tener una certificación de plataforma, y el trabajo en sitio lleva evidencia GPS y fotográfica.',
      },
      {
        q: '¿Su grupo de ingenieros es más pequeño?',
        a: 'Mucho más pequeño, y a propósito. Todo ingeniero listado pasó una evaluación técnica práctica con IA, y solo los certificados pueden ser asignados a un proyecto. Preferimos devolverle cinco ingenieros que pueden hacer el trabajo antes que quinientos perfiles que usted tenga que filtrar.',
      },
      {
        q: '¿Puedo contratar igual a alguien para una tarea remota pequeña?',
        a: 'Puede, pero quizá esté pagando de más por una verificación que no necesita. Para una tarea remota rápida, un marketplace general es la opción más práctica: nosotros estamos hechos para trabajo donde equivocarse sale caro.',
      },
    ],
  },
  'direct-hire': {
    label: 'frente a contratar de planta',
    metaTitle: '¿Contratar un ingeniero de automatización de planta o por proyecto en una plataforma?',
    metaDesc: 'La contratación de planta tiene sentido para trabajo de control continuo. Para trabajo por proyecto, deciden el tiempo de arranque y la capacidad ociosa.',
    question: '¿Contrato a un ingeniero de automatización de planta o por proyecto a través de una plataforma?',
    answer: 'Contrate de planta cuando el trabajo sea continuo: una planta con trabajo de control todo el año, donde un ingeniero interno acumula conocimiento de sus máquinas. Contrate por proyecto cuando el trabajo tenga forma de proyecto: un retrofit, una ventana de puesta en marcha, el traslado de una línea. Lo que suele decidir es el tiempo y la capacidad ociosa: en Estados Unidos cubrir una vacante de control lleva alrededor de dos meses de reclutamiento antes de que alguien empiece, y una vez contratado usted carga con sueldo, prestaciones y los huecos entre proyectos. Una contratación por plataforma empieza en días y solo paga los hitos que financia.',
    them: [
      'Quien se postule en su mercado laboral local, a distancia razonable de la planta',
      'Entrevistas y referencias, y usted asume el costo de equivocarse',
      'Sueldo, prestaciones e impuestos de nómina, se pagan haya o no un proyecto en curso',
      'Trabaja directamente para usted, así que la verificación no es un problema aparte',
      'Totalmente transparente: es su propia nómina',
    ],
    themWhen: [
      'Hay trabajo de control todo el año, no un proyecto con fecha de término',
      'Vale la pena acumular el conocimiento en casa: sus máquinas, su historial, sus particularidades',
      'Necesita a alguien que pueda responder a un paro de línea a cualquier hora',
    ],
    usWhen: [
      'El trabajo es un proyecto con final: un retrofit, una puesta en marcha, un traslado de línea',
      'Necesita una especialidad que nunca mantendría de planta: visión artificial, una marca concreta de robot',
      'El sitio está en otro país y contratar localmente implica abrir primero una entidad',
    ],
    faqs: [
      {
        q: '¿Qué tan rápido puede empezar un ingeniero?',
        a: 'El emparejamiento ocurre en unas 48 horas desde la publicación; la fecha de inicio depende de la disponibilidad del ingeniero y de los requisitos de acceso al sitio o de visa. Compárelo con unos dos meses de reclutamiento para cubrir una vacante de control en Estados Unidos.',
      },
      {
        q: '¿Un ingeniero por proyecto puede pasar a ser empleado de planta?',
        a: 'Sí, y no hay comisión por la conversión: la comisión de plataforma aplica a los hitos en depósito, no a sus decisiones de contratación.',
      },
      {
        q: '¿Y que el conocimiento se quede en casa?',
        a: 'Esa es una ventaja real de contratar de planta y no vamos a discutirlo. La documentación del proyecto, las fotos de los registros de entrada y los controles de calidad quedan en su cuenta al cerrar el proyecto, pero no sustituyen a alguien que lleva tres años operando su planta.',
      },
    ],
  },
  'automate-america': {
    label: 'frente a Automate America',
    metaTitle: 'Talengineer frente a Automate America: ¿cuál encaja con su proyecto?',
    metaDesc: 'Automate America está hecho para dotación de personal de automatización por hora en Estados Unidos. Talengineer, para entrega de proyectos transfronterizos con certificación y depósito por hitos.',
    question: 'Talengineer frente a Automate America: ¿cuál encaja con su proyecto?',
    answer: 'Automate America encaja bien si necesita contratistas de automatización con base en Estados Unidos facturados por hora, con hojas de horas digitales y pagos rápidos: para eso está construido y está bien establecido ahí. Talengineer está hecho para otra forma de trabajo: proyectos transfronterizos operados en nueve idiomas, ingenieros que deben aprobar una certificación de plataforma antes de poder ser asignados a nada, y depósito en garantía por hitos donde su dinero se libera solo después de que usted apruebe el trabajo. Si su necesidad es dotación local por horas en Estados Unidos, ellos encajan mejor. Si es un proyecto de alcance definido, sobre todo si cruza una frontera, la verificación y el modelo de pago son lo que nos diferencia.',
    them: [
      'Norteamérica, en inglés',
      'En sus propias palabras: perfiles verificados, historial de trabajo documentado y reseñas de clientes anteriores; no publica un examen de certificación propio de la plataforma',
      'Por hora, tiempo y materiales. Según su propia descripción, la plataforma toma un porcentaje de la tarifa por hora antes de mostrar el contrato al mercado; el porcentaje no se publica',
      'Hojas de horas digitales con flujo de aprobación del cliente; no publica verificación de ubicación',
      'Registro gratuito para todas las partes, sin suscripción; el porcentaje que se toma no se publica',
    ],
    themWhen: [
      'Necesita un contratista con base en Estados Unidos facturado por hora, empezando cuanto antes',
      'Quiere que la plataforma gestione facturación, nómina, prestaciones y cumplimiento (su servicio gestionado)',
      'Piensa convertir después al contratista en empleado de planta',
    ],
    usWhen: [
      'El proyecto cruza una frontera o un idioma: una planta en México, Vietnam o Tailandia con el comprador en otro lugar',
      'Quiere capacidad probada antes de la asignación, mediante un examen de certificación y no mediante reseñas posteriores',
      'Quiere fondos en depósito liberados por hito aceptado, con devolución de dinero en el primer hito',
    ],
    faqs: [
      {
        q: '¿Automate America es un competidor?',
        a: 'En una parte del mercado sí: contratación de automatización local en Estados Unidos. En entrega de proyectos transfronterizos, coordinación en nueve idiomas, asignación condicionada a certificación y depósito por hitos, resolvemos un problema distinto.',
      },
      {
        q: '¿Cuál sale más barato?',
        a: 'No pueden compararse tarifa contra tarifa porque los modelos de cobro difieren. Talengineer publica el 15% de cada hito liberado (5% para clientes fundadores en sus primeros 5 proyectos). Automate America describe que toma un porcentaje de la tarifa por hora antes de que el contrato llegue al mercado, y no publica ese porcentaje.',
      },
      {
        q: '¿Puedo usar ambos?',
        a: 'Sí, y para muchos fabricantes esa es la respuesta sensata: un contratista local por horas en Estados Unidos para soporte continuo, y un proyecto de alcance definido con depósito en garantía para construir o modernizar una planta en el extranjero.',
      },
    ],
  },
  'field-nation': {
    "label": "vs Field Nation",
    "metaTitle": "Talengineer vs Field Nation: ¿cuál se adapta mejor a tu proyecto?",
    "metaDesc": "Field Nation es un mercado centrado en EE. UU. para técnicos de servicio de campo de TI in situ, facturados por orden de trabajo. Talengineer está diseñado para proyectos de automatización industrial transfronterizos que exigen certificación, con depósito en garantía por hitos.",
    "question": "Talengineer vs Field Nation: ¿cuál se adapta mejor a tu proyecto?",
    "answer": "Field Nation es una buena opción si necesitas técnicos de servicio de campo de TI in situ centrados en EE. UU. —redes, cableado, punto de venta, señalización digital, instalaciones de seguridad— despachados rápidamente desde un enorme grupo ya existente (más de un millón de órdenes de trabajo al año en más de 600.000 sitios), con una comisión publicada simple del 10% que se descuenta del lado del técnico. Talengineer está construido para un tipo de trabajo distinto: ingenieros certificados en automatización industrial —PLC, robótica, visión artificial, electricidad— en EE. UU., México, Vietnam, Tailandia y China, que trabajan en nueve idiomas, donde se exige un examen de certificación de la plataforma antes de que alguien pueda ser asignado, no solo un perfil, reseñas y una verificación de antecedentes opcional, y tu dinero permanece en un depósito en garantía por hitos que se libera solo después de que apruebes el trabajo, en lugar de desembolsarse al técnico en un ciclo semanal de condiciones de pago. Si tu trabajo es un servicio de campo de TI local en EE. UU. facturado por orden de trabajo, Field Nation es la mejor opción. Si se trata de un proyecto de automatización con alcance definido —especialmente uno que cruza una frontera, o uno en el que quieres que la capacidad se demuestre antes de la asignación y no después—, la verificación y el modelo de pago son donde nos diferenciamos.",
    "them": [
      "Centrado en EE. UU.: sus propias páginas describen la cobertura por estado y código postal de EE. UU., con menciones ocasionales a Norteamérica/Canadá ('en EE. UU. y Canadá'); no reivindica cobertura internacional ni global. Los técnicos cubren especialidades de TI/in situ —redes, cableado, punto de venta, señalización digital, computadoras e impresoras, seguridad— no automatización industrial.",
      "Perfiles autodeclarados (habilidades, certificaciones, historial laboral), calificaciones/reseñas de compradores, y un algoritmo de clasificación propietario 'Provider Match' junto con un 'Success Score'. Las verificaciones de antecedentes y las pruebas de drogas (gestionadas por un socio externo) solo se exigen en las órdenes de trabajo que las requieren —el 76% de ellas, según sus propios datos— no en cada trabajo, y su propio sitio no describe ningún examen de certificación gestionado por la plataforma.",
      "No es depósito en garantía por hitos. Los compradores prefinancian una cuenta de Field Nation —mantenida como una única cuenta fiduciaria mezclada con los fondos de otros compradores, según sus propias condiciones para compradores— o utilizan condiciones de pago a 7/14/21/28 días netos; a los técnicos se les paga en un ciclo semanal solo una vez que se procesa el pago del comprador, por lo que en los trabajos con condiciones de pago el técnico asume el riesgo de impago del comprador hasta ese momento. A los compradores de California se les prohíbe prefinanciar desde marzo de 2021 y deben pagar después de aprobar el trabajo.",
      "Un paso de registro de entrada/salida, documentación fotográfica en la app vinculada a la orden de trabajo específica, y captura de firma electrónica en el lugar de trabajo. El GPS se describe como usado para la búsqueda de trabajos y el seguimiento del kilometraje; si el registro de entrada en sí está verificado por GPS no se describe en sus páginas públicas, no está publicado.",
      "La comisión del lado del técnico es pública y simple: un 10% fijo del total final de pago de la orden de trabajo, o un 13.9% en su nivel opcional Pro (10% base más un 3.9% adicional), más complementos de seguro opcionales (1.95% para la cobertura de responsabilidad civil general de la plataforma, 1% o 0.5% para el seguro de accidentes laborales). Lo que cobra a los compradores/empresas no está publicado: los planes se describen como basados en suscripción, con precios disponibles solo contactando a ventas."
    ],
    "themWhen": [
      "Necesitas servicio de campo de TI local en EE. UU. o Norteamérica —redes, cableado, POS, señalización digital, instalación de cámaras de seguridad— no automatización industrial.",
      "Quieres acceso a un grupo de técnicos ya enorme (más de 1 millón de órdenes de trabajo al año, más de 600.000 sitios) y la velocidad importa más que demostrar la capacidad mediante un examen de certificación antes de la asignación.",
      "Como comprador, quieres pagar el valor nominal de la orden de trabajo sin una línea de comisión de plataforma separada: la parte de Field Nation se deduce del pago del técnico, no se te cobra a ti."
    ],
    "usWhen": [
      "El proyecto cruza una frontera o un idioma —una planta en México, Vietnam o Tailandia con un comprador en otro lugar— fuera de la red de Field Nation, centrada en EE. UU./Norteamérica.",
      "Quieres que la capacidad se demuestre mediante un examen de certificación antes de la asignación, no un perfil autodeclarado más reseñas y una verificación de antecedentes opcional que depende del trabajo.",
      "Quieres que tus fondos se mantengan en un depósito en garantía por hitos y se liberen solo después de que apruebes el trabajo, en lugar de un ciclo semanal de condiciones de pago en el que el técnico asume el riesgo de tu impago hasta que los fondos se liquiden."
    ],
    "faqs": [
      {
        "q": "¿Es Field Nation un competidor?",
        "a": "En despacho de servicio de campo de TI —redes, cableado, POS, instalaciones de seguridad, facturado por orden de trabajo— sí. En proyectos de automatización industrial con certificación obligatoria, depósito en garantía por hitos y entrega transfronteriza y multilingüe, resolvemos un problema distinto."
      },
      {
        "q": "¿Cuál es más barato?",
        "a": "No se pueden comparar tarifa contra tarifa: la comisión se cobra a una parte distinta. Field Nation deduce un 10% fijo del pago del técnico (13.9% en su nivel opcional Pro) y no publica qué cobra, si acaso, a los compradores más allá del valor nominal de la orden de trabajo; los planes de comprador son por suscripción y se cotizan mediante ventas. Talengineer publica su comisión directamente al comprador: 15% de cada hito liberado (5% para clientes fundadores en sus primeras 5 órdenes), mostrado antes de que te comprometas."
      },
      {
        "q": "¿Puedo usar ambos?",
        "a": "Sí: para muchas empresas esa es la división práctica: Field Nation para el despacho de técnicos de TI/in situ local en EE. UU., y Talengineer para un proyecto de automatización certificado y protegido por depósito en garantía, especialmente uno que cruza una frontera."
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer vs WorkMarket: ¿cuál se ajusta a tu proyecto?",
    "metaDesc": "WorkMarket (de ADP) es una plataforma exclusiva para EE. UU. dedicada a gestionar grandes grupos de contratistas 1099. Talengineer está diseñada para proyectos de automatización transfronterizos, con certificación obligatoria y custodia de fondos por hitos (milestone escrow).",
    "question": "Talengineer vs WorkMarket: ¿cuál se ajusta a tu proyecto?",
    "answer": "WorkMarket, propiedad de ADP, está diseñada para empresas estadounidenses que gestionan un gran grupo existente de contratistas 1099: incorporación masiva, verificaciones de antecedentes y pruebas de habilidades configuradas por categoría de trabajo, presentación automatizada de impuestos 1099-NEC y pagos rápidos en categorías como servicio técnico de campo en TI, mensajería y seguridad. Sus propios Términos de Servicio establecen que la plataforma 'no está destinada a ser utilizada por clientes ubicados fuera de Estados Unidos', y la única cifra de tarifa que publica es un cargo opcional del 2.5% al trabajador por pago anticipado; la tarifa estándar de plataforma del lado del cliente se fija por asignación y no se divulga. Talengineer está diseñada para otro tipo de trabajo: un proyecto de automatización industrial de alcance definido, a menudo transfronterizo, en el que el ingeniero debe contar con una certificación de la plataforma (platform certification) antes de que se le asigne cualquier tarea, y donde tu dinero permanece en custodia por hitos (milestone escrow), liberándose solo después de que apruebas cada hito. Si administras una fuerza laboral eventual nacional a gran escala, las herramientas de WorkMarket son más maduras para ese fin. Si tu trabajo es un proyecto de PLC, robótica o visión artificial que requiere capacidad verificada previamente y protección de pago, para eso construimos Talengineer.",
    "them": [
      "Solo clientes de EE. UU. Sus Términos de Servicio establecen que la plataforma 'no está destinada a ser utilizada por clientes ubicados fuera de Estados Unidos', y una página empresarial de WorkMarket señala que 'actualmente solo admite empresas con una entidad en EE. UU.'. Se describe que los pagos a contratistas llegan a 'casi cualquier parte del mundo', pero quién puede comprar en la plataforma está limitado a EE. UU.",
      "Las verificaciones de antecedentes y las pruebas de drogas se realizan a través de una agencia externa de informes al consumidor (activadas mediante la autorización escrita del propio trabajador), además de verificación de licencias/certificaciones, verificación de identificación fiscal/cuenta bancaria, y 'pruebas personalizables para evaluar las habilidades del trabajador' que el cliente configura por categoría de trabajo a través de sus propias 'Labor Clouds'. No se publica ningún examen de certificación administrado por la plataforma como requisito antes de que se pueda asignar un trabajador.",
      "Tiempo y materiales por asignación: el cliente publica un Valor de Asignación (Assignment Value), y según sus Términos, el cliente 'está obligado a pagar al Trabajador Independiente por una Asignación cuando dicha Asignación se convierte en una Asignación Aprobada' —es decir, cuando el cliente la marca como completada—. No se describe ningún acuerdo de custodia (escrow) en ninguna parte de sus Términos, y una vez realizado un cargo, 'dicho cargo o débito no es reembolsable, salvo en la medida en que lo prohíba la ley aplicable'.",
      "Una aplicación móvil para trabajadores con registro de entrada/salida, geovallado (mencionado específicamente en su página de servicios de campo de TI), carga de fotos y documentos como entregables, y recolección de firmas electrónicas.",
      "La 'Tarifa de Plataforma' estándar del lado del cliente se fija por asignación, y sus Términos establecen que 'WorkMarket se reserva el derecho de cambiar la Tarifa de Plataforma en cualquier momento' —el porcentaje en sí no se publica—. La única cifra de tarifa divulgada en sus Términos es un cargo del 2.5% al trabajador por acceso anticipado opcional a los fondos (FastFunds); fuera de eso, el precio estándar requiere contactar a ventas para obtener una cotización."
    ],
    "themWhen": [
      "Eres una empresa estadounidense que gestiona un gran grupo existente de contratistas 1099 en muchas categorías de trabajo —técnicos de campo en TI, mensajeros, conductores, seguridad, intérpretes— y necesitas incorporación masiva más presentación automatizada de impuestos 1099-NEC.",
      "Quieres definir tus propias reglas de verificación por categoría de trabajo —antecedentes, pruebas de drogas, pruebas de habilidades personalizadas— en lugar de exigir una certificación de plataforma emitida previamente antes de la asignación.",
      "Quieres pagos a trabajadores rápidos y flexibles (ACH, tarjeta de pago, PayPal, acceso anticipado opcional a fondos) para un alto volumen de órdenes de trabajo cortas por tiempo y materiales."
    ],
    "usWhen": [
      "El proyecto cruza una frontera: los propios Términos de WorkMarket restringen la plataforma a clientes ubicados en EE. UU.; nuestros ingenieros trabajan en EE. UU., México, Vietnam, Tailandia y China, en nueve idiomas.",
      "Quieres que la capacidad quede demostrada mediante un examen de certificación obligatorio antes de la asignación, no verificaciones de antecedentes y pruebas configuradas por el cliente aplicadas después de que el trabajador ya está en el grupo.",
      "Quieres que los fondos se mantengan en custodia (escrow) y se liberen solo después de que apruebes cada hito, con la devolución garantizada del primer hito, no un modelo de pago al aprobar en el que los cargos no son reembolsables una vez realizados."
    ],
    "faqs": [
      {
        "q": "¿Es WorkMarket un competidor?",
        "a": "En una parte del mercado, sí: la gestión de fuerza laboral eventual doméstica en EE. UU. a gran escala. En la entrega de proyectos transfronterizos, la asignación condicionada a certificación y la custodia de fondos por hitos, estamos resolviendo un problema diferente."
      },
      {
        "q": "¿Cuál es más barato?",
        "a": "No son directamente comparables, porque WorkMarket no publica su tarifa estándar de plataforma; sus Términos solo divulgan un cargo opcional del 2.5% a los trabajadores por acceso anticipado al pago (FastFunds). Talengineer publica su tarifa de forma transparente: 15% de cada hito liberado, 5% para clientes fundadores en sus primeros 5 pedidos."
      },
      {
        "q": "¿Puedo usar ambos?",
        "a": "Sí. Muchos fabricantes utilizan una plataforma como WorkMarket para su gran grupo de contratistas de servicio de campo o TI con base en EE. UU., y usan Talengineer por separado para un proyecto de automatización de alcance definido, especialmente uno que cruza una frontera y necesita capacidad certificada con hitos en custodia."
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork: ¿cuál se ajusta mejor a tu proyecto?",
    "metaDesc": "Upwork es un mercado de trabajo freelance global y generalista que abarca miles de habilidades. Talengineer está diseñado para proyectos de automatización industrial con certificación obligatoria, depósito en garantía por hitos y verificación in situ.",
    "question": "Talengineer vs Upwork: ¿cuál se ajusta mejor a tu proyecto?",
    "answer": "Upwork es una buena opción si necesitas contratar casi cualquier tipo de trabajo remoto, no solo ingeniería de automatización: es un mercado generalista con más de 18 millones de freelancers en más de 180 países y miles de categorías de habilidades, con niveles de tarifas publicados y fijos, y su propio sistema de depósito en garantía para hitos de precio fijo; esa escala y madurez son reales. Talengineer está construido de forma más estrecha y profunda: solo ingenieros de automatización industrial certificados —PLC, robótica, visión artificial, electricidad— que deben aprobar una certificación de la plataforma antes de poder ser asignados a cualquier tarea, con servicio en nueve idiomas, y con fichajes con geovalla GPS y control de calidad fotográfico para el trabajo in situ. Si tu contratación es trabajo remoto de propósito general, la amplitud de Upwork es difícil de igualar. Si se trata de un proyecto de automatización industrial bien definido —especialmente uno con entregables físicos e in situ que necesitan verificación— el filtro de capacidad antes de la asignación y la evidencia in situ son donde nos diferenciamos.",
    "them": [
      "Un mercado global generalista, no específico de la automatización industrial: según sus propias palabras, más de 18 millones de freelancers en más de 180 países y miles de categorías de habilidades",
      "La identidad y la ubicación de cada freelancer se verifican antes de que un cliente pueda contactarlo, y los perfiles muestran reseñas verificadas e historial laboral. Una evaluación de habilidades más profunda —la insignia 'Expert-Vetted', obtenida mediante una entrevista de selección, pruebas de habilidades y una revisión de portafolio o de código— es opcional, se limita a determinadas categorías y, según la propia descripción de Upwork, solo es visible para clientes de los planes Business Plus y Enterprise; a la mayoría de los freelancers nunca se les exige aprobar ningún examen antes de aceptar trabajo",
      "El trabajo de precio fijo está protegido por los 'project funds' (el nombre actual que da Upwork al depósito en garantía): el cliente financia un hito antes de que comience el trabajo, y los fondos se liberan cuando el cliente lo aprueba o cuando se cierra automáticamente una ventana de revisión de 14 días. El trabajo por horas se protege de forma independiente, mediante la aplicación de registro de horas Work Diary en lugar de un depósito en garantía. Más allá de eso, los reembolsos se solicitan caso por caso dentro de un plazo de 180 días y se conceden a discreción del freelancer; no se publica ninguna garantía de devolución de dinero para el primer hito",
      "No publicado. Las propias páginas de confianza y seguridad de Upwork describen la seguridad de la cuenta y los datos —autenticación de dos factores, cifrado, análisis de malware— sin mencionar fichajes GPS, geovallas ni verificación fotográfica para el trabajo presencial o in situ",
      "Publicado y escalonado del lado del cliente: una comisión de marketplace del 5% en el plan Basic (3% para clientes elegibles de EE. UU. que pagan por transferencia bancaria) o del 10% en Business Plus (8% para elegibles), más una tarifa única de inicio de contrato de $0.99–$14.99 por contrato. La tarifa del lado del freelancer va del 0% al 15% por contrato, fijada según criterios internos que Upwork no publica, y se muestra al freelancer antes de que acepte, en lugar de ser una tarifa pública fija"
    ],
    "themWhen": [
      "Necesitas trabajo fuera de la automatización industrial: redacción, diseño, marketing, desarrollo de software en general, tareas administrativas, categorías que Talengineer no ofrece en absoluto",
      "Quieres acceder de inmediato al mayor grupo de talento posible, con una base establecida de reseñas e historial de calificaciones, en lugar de un listado más reducido de profesionales certificados",
      "Tu contratación es trabajo por horas de duración abierta y no un proyecto de alcance definido: el Work Diary y la facturación por horas de Upwork están pensados para una colaboración continua y a largo plazo"
    ],
    "usWhen": [
      "Necesitas que la capacidad se demuestre y se filtre antes de la asignación —una certificación de la plataforma obligatoria y específica para la automatización industrial— en lugar de una insignia opcional que solo ven los clientes de nivel empresarial y que la mayoría de los freelancers nunca obtiene",
      "Tu entregable es físico y presencial —una planta de producción, una modernización de equipos, una visita de puesta en marcha— y quieres fichajes con geovalla GPS y control de calidad fotográfico como evidencia, algo que las propias páginas de confianza y seguridad de Upwork no describen",
      "Quieres que la comisión se publique como un único porcentaje fijo y cotizable antes de comprometerte, junto con una garantía de devolución de dinero en el primer hito, en lugar de una tarifa del 0%-15% del lado del freelancer fijada por criterios no publicados y sin garantía de reembolso a nivel de plataforma"
    ],
    "faqs": [
      {
        "q": "¿Es Upwork un competidor?",
        "a": "En la contratación freelance de propósito general, sí: es uno de los mercados más grandes del mundo. En la entrega de proyectos de automatización industrial con certificación obligatoria y verificación in situ, resolvemos un problema más específico y distinto, que no es exactamente para lo que Upwork está diseñado."
      },
      {
        "q": "¿Cuál es más barato?",
        "a": "Las estructuras de tarifas no son directamente comparables. Talengineer publica un 15% de cada hito liberado (5% para clientes fundadores en sus primeros 5 pedidos). La tarifa de cliente de Upwork es del 5% en su plan Basic o del 10% en Business Plus (3%/8% para clientes elegibles de EE. UU. que pagan por transferencia bancaria), más una tarifa única de inicio de contrato; el freelancer paga por separado entre un 0% y un 15% de sus propios ingresos, según criterios que Upwork no publica."
      },
      {
        "q": "¿Puedo usar ambos?",
        "a": "Sí. Muchos compradores usan Upwork para trabajo remoto general —administración, marketing, software— y Talengineer específicamente para ingeniería de automatización con certificación obligatoria, sobre todo en proyectos con entregables físicos e in situ."
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer vs Toptal: ¿cuál se ajusta a tu proyecto?",
    "metaDesc": "Toptal es una red verificada para trabajo de conocimiento remoto facturado por hora: desarrolladores, diseñadores, finanzas, PM. Talengineer está diseñado para proyectos de automatización industrial con certificación obligatoria y custodia por hitos.",
    "question": "Talengineer vs Toptal: ¿cuál se ajusta a tu proyecto?",
    "answer": "Toptal es una buena opción si necesitas un único especialista verificado —desarrollador, diseñador, product manager o analista financiero— facturado por hora, con una prueba sin riesgo antes de comprometerte. Para eso está diseñado: un embudo de selección de cinco etapas al ingresar a la red (sus propias cifras publicadas sitúan la aceptación general en menos del 3% de los solicitantes mensuales) y una red remota por diseño que abarca más de 100 países. Talengineer está construido para un tipo de trabajo distinto: proyectos de automatización industrial —PLC, robótica, visión artificial, eléctrica— donde cada ingeniero debe aprobar una certificación de la plataforma (L1-L3, evaluada por IA y revisada por humanos) antes de que se le asigne cualquier tarea; el trabajo se financia y libera por hito aprobado en lugar de facturarse por hora, y el trabajo en sitio incluye registros de entrada con geovalla GPS y control de calidad fotográfico como evidencia. Si tu trabajo es remoto y se factura por hora, el modelo de prueba y contratación de Toptal es la mejor opción. Si se trata de un proyecto de automatización de alcance definido —especialmente uno que ocurre en la planta de una fábrica—, ahí es donde nos diferenciamos: certificación obligatoria y custodia por hitos.",
    "them": [
      "Expertos en más de 100 países —la mayoría radicados en América y Europa— que atienden a clientes en más de 140 países, según sus propias palabras, abarcando desarrollo de software, diseño, finanzas y gestión de producto/proyectos; no figura ninguna categoría dedicada a automatización industrial, PLC, robótica o visión artificial, y no se publica ninguna cifra de cobertura de idiomas más allá del filtro de inglés durante la verificación",
      "Una verificación única de entrada a la red en cinco etapas, según el propio embudo publicado por Toptal: idioma y comunicación (26.4% de aprobación), revisión exhaustiva de habilidades (7.4%), una entrevista técnica en vivo (3.6%) y luego un proyecto de prueba de 1-3 semanas (3.2%), con una aceptación general de menos del 3% de los solicitantes mensuales; la verificación ocurre una sola vez al ingresar a la red, no por cliente ni por habilidad, y no se publica ningún examen de certificación de plataforma independiente",
      "Facturación por hora a tarifa combinada, emitida dos veces al mes con condiciones Net 10, más una suscripción fija de $79/mes una vez que avanzas a la asignación de talento; el riesgo se cubre con una prueba sin riesgo de hasta dos semanas (con hasta tres candidatos por rol) en la que no se te factura si no quedas satisfecho; sus propias preguntas frecuentes no usan las palabras \"custodia\" (escrow) ni \"hito\" (milestone)",
      "Remoto por diseño —\"la gran mayoría trabaja de forma remota desde su oficina en casa o un espacio de coworking\", en sus propias palabras— y el trabajo presencial se describe como una excepción rara y especial; no se publica ningún sistema de verificación de ubicación, geovalla o control de calidad fotográfico",
      "Se publica la cuota de suscripción de $79/mes; las tarifas por hora se describen como \"combinadas\" para incluir el margen de Toptal, pero no se publica el porcentaje específico o el recargo que retiene de esa tarifa"
    ],
    "themWhen": [
      "Necesitas un único especialista remoto en trabajo de conocimiento —desarrollador, diseñador, PM, analista financiero— y no un ingeniero de automatización industrial, y quieres probar hasta tres candidatos sin riesgo antes de comprometerte",
      "Quieres una colaboración continua por hora, con posibilidad de conversión a tiempo completo, en lugar de un proyecto de alcance definido por hitos",
      "Quieres una red con una trayectoria establecida de varios años en más de 100 países, verificada una sola vez mediante un embudo público de cinco etapas en lugar de una certificación por cada asignación"
    ],
    "usWhen": [
      "Tu proyecto es trabajo de automatización industrial —PLC, robótica, visión artificial, eléctrica— una categoría que el propio sitio de Toptal no incluye como especialidad",
      "El trabajo ocurre en la planta de una fábrica o en una obra y quieres registros de entrada con geovalla GPS y control de calidad fotográfico como evidencia, en lugar de un modelo remoto por defecto",
      "Quieres que los fondos se liberen por cada hito que apruebes, con devolución garantizada en el primer hito, en lugar de facturas por hora con condiciones Net 10"
    ],
    "faqs": [
      {
        "q": "¿Es Toptal un competidor?",
        "a": "En una parte del mercado, sí: trabajo de conocimiento verificado, remoto y facturado por hora. Pero específicamente en automatización industrial —PLC, robótica, visión artificial, eléctrica, con certificación obligatoria y verificación en sitio— resolvemos un problema que el propio sitio de Toptal no aborda."
      },
      {
        "q": "¿Cuál es más económico?",
        "a": "Las dos tarifas no se pueden comparar directamente. Talengineer publica un 15% de cada hito liberado (5% para clientes fundadores en sus primeros 5 pedidos). Toptal publica una suscripción fija de $79/mes más una tarifa por hora combinada que incluye su margen, pero no publica qué porcentaje de esa tarifa retiene."
      },
      {
        "q": "¿Puedo usar ambos?",
        "a": "Sí. Para muchos equipos de manufactura, eso podría significar un especialista de Toptal para trabajo de software o gestión de proyectos adyacente, y un ingeniero certificado de Talengineer para el proyecto de automatización en sitio propiamente dicho."
      }
    ]
  },
};

COMPARISONS.vi = {
  'staffing-agency': {
    label: 'so với công ty cung ứng nhân lực',
    metaTitle: 'Nên dùng công ty cung ứng nhân lực hay nền tảng để thuê kỹ sư tự động hóa?',
    metaDesc: 'Khi nào công ty cung ứng nhân lực là lựa chọn đúng, và khi nào thuê theo cột mốc trên nền tảng phù hợp hơn.',
    question: 'Nên dùng công ty cung ứng nhân lực hay nền tảng để thuê kỹ sư tự động hóa?',
    answer: 'Hãy dùng công ty cung ứng nhân lực khi bạn cần người có mặt tại hiện trường ngay tuần sau, ở thành phố mà họ đang có sẵn người, và bạn chấp nhận trả một khoản chênh lệch thường không được công bố. Hãy dùng Talengineer khi công việc có phạm vi rõ ràng, phải qua biên giới hoặc qua ngôn ngữ, hoặc khi bạn cần bằng chứng rằng kỹ sư thực sự làm được trước khi họ được chỉ định. Khác biệt thật nằm ở chỗ rủi ro thuộc về ai: bên cung ứng tính tiền theo giờ và bạn gánh rủi ro bàn giao; Talengineer giữ tiền trong ký quỹ theo cột mốc và chỉ giải ngân sau khi bạn duyệt.',
    them: [
      'Ai đang rảnh trong đội ngũ địa phương của họ, thường chỉ một ngôn ngữ',
      'Sàng lọc hồ sơ cộng với đánh giá của người tuyển dụng',
      'Tính theo thời gian và vật tư — bạn trả tiền giờ dù cột mốc có đạt hay không',
      'Có bảng chấm công, nhưng việc có mặt tại hiện trường không được kiểm chứng độc lập',
      'Phần cộng thêm trên đơn giá của kỹ sư thường không được tiết lộ',
    ],
    themWhen: [
      'Bạn cần người tới hiện trường trong vài ngày, tại thành phố họ đã có sẵn nhân sự',
      'Công việc là bảo trì liên tục chứ không phải dự án có ngày kết thúc',
      'Bạn đã có thỏa thuận đơn giá và quan hệ làm việc với công ty đó',
    ],
    usWhen: [
      'Dự án có phạm vi rõ ràng, chia được thành các cột mốc',
      'Công việc qua biên giới hoặc qua ngôn ngữ — kỹ sư, nhà máy và bên mua không cùng một nước',
      'Bạn muốn năng lực được kiểm chứng trước khi chỉ định, và thanh toán gắn với phần việc đã nghiệm thu',
    ],
    faqs: [
      {
        q: 'Nền tảng có rẻ hơn công ty cung ứng nhân lực không?',
        a: 'Thường là rẻ hơn, vì mức phí được công bố thay vì gói vào đơn giá: Talengineer thu 15% mỗi cột mốc được giải ngân (5% cho khách hàng sáng lập trong 5 đơn đầu). Nhưng so sánh trung thực không phải là phí đối phí — bên cung ứng bán giờ công, chúng tôi bán cột mốc đã nghiệm thu, thứ bạn mua vốn đã khác nhau.',
      },
      {
        q: 'Ai lo tuân thủ và bảo hiểm?',
        a: 'Kỹ sư hoàn tất KYC; hồ sơ W-9 và chứng nhận bảo hiểm (COI) được thu thập và kiểm chứng trên nền tảng trước khi làm việc tại hiện trường. Công ty cung ứng thường trực tiếp thuê nhà thầu và gánh phần này thay bạn — nếu bạn cần một đơn vị đứng tên sử dụng lao động, đó là con đường đơn giản hơn.',
      },
      {
        q: 'Nếu kỹ sư không làm được việc thì sao?',
        a: 'Đừng duyệt cột mốc. Tiền vẫn nằm trong ký quỹ, và bạn có thể mở tranh chấp với 5 ngày nộp bằng chứng, do quản trị viên xem xét. Cột mốc đầu tiên của dự án đầu tiên được hoàn tiền.',
      },
    ],
  },
  'freelance-marketplace': {
    label: 'so với sàn freelance phổ thông',
    metaTitle: 'Vì sao không thuê kỹ sư tự động hóa trên sàn freelance phổ thông?',
    metaDesc: 'Sàn phổ thông thì rộng và rẻ. Với tự động hóa công nghiệp, thứ còn thiếu là kiểm chứng: chứng chỉ trước khi chỉ định và bằng chứng tại hiện trường.',
    question: 'Vì sao không thuê luôn kỹ sư tự động hóa trên một sàn freelance phổ thông?',
    answer: 'Sàn phổ thông là cách hợp lý để tìm người làm việc từ xa, rủi ro thấp, và tìm kiếm ở đó rẻ hơn. Điều nó không thể cho bạn biết là một kỹ sư PLC có thực sự chạy thử được dây chuyền của bạn hay không — ở đó năng lực do người ta tự khai, và chỉ được xác nhận sau khi xong việc qua đánh giá của khách. Talengineer hẹp hơn một cách có chủ đích: mọi kỹ sư phải qua sàng lọc kỹ thuật thực hành khi đăng ký, phải có chứng chỉ nền tảng L1–L3 trước khi được chỉ định, và công việc hiện trường được bảo chứng bằng check-in GPS và kiểm tra chất lượng bằng ảnh. Khi một lần chạy thử hỏng khiến bạn mất vài ngày dừng chuyền, chính phần kiểm chứng đó mới là sản phẩm.',
    them: [
      'Rất lớn và chủ yếu là làm từ xa hoặc phần mềm; tự động hóa công nghiệp chỉ là một lát rất mỏng',
      'Kỹ năng tự khai và huy hiệu, được xác nhận sau đó bằng đánh giá của khách',
      'Ký quỹ theo giờ hoặc giá cố định; tranh chấp phạm vi xử lý theo từng vụ',
      'Được thiết kế cho làm việc từ xa — không có lớp kiểm chứng tại hiện trường',
      'Phí nền tảng được công bố, nhưng chất lượng kỹ sư chênh lệch rất lớn',
    ],
    themWhen: [
      'Công việc hoàn toàn từ xa — một màn hình HMI nhỏ, một báo cáo, một đoạn script',
      'Ngân sách đủ nhỏ để chọn nhầm người chỉ mất vài giờ, không phải vài ngày dừng chuyền',
      'Bạn có đủ chuyên môn nội bộ để tự đánh giá kỹ sư',
    ],
    usWhen: [
      'Phải có người thực sự đến nhà máy, và bạn cần bằng chứng là họ đã đến',
      'Bạn không tự đánh giá được kỹ sư có thạo Siemens hay Rockwell hay không',
      'Chạy thử thất bại đồng nghĩa với dừng sản xuất, không chỉ là một hóa đơn lãng phí',
    ],
    faqs: [
      {
        q: 'Sàn phổ thông cũng có ký quỹ mà?',
        a: 'Đúng — ký quỹ giá cố định khá phổ biến ở đó, nên bản thân ký quỹ không phải là khác biệt. Khác biệt là điều kiện phải có trước khi một kỹ sư được chỉ định: trên Talengineer họ phải có chứng chỉ nền tảng, và công việc hiện trường đi kèm bằng chứng GPS và ảnh.',
      },
      {
        q: 'Nguồn kỹ sư của các bạn có ít hơn không?',
        a: 'Ít hơn nhiều, và đó là chủ đích. Mọi kỹ sư được đăng đều đã qua sàng lọc kỹ thuật thực hành bằng AI, và chỉ kỹ sư có chứng chỉ mới được chỉ định vào dự án. Chúng tôi thà trả về năm kỹ sư làm được việc còn hơn năm trăm hồ sơ để bạn tự lọc.',
      },
      {
        q: 'Tôi vẫn có thể thuê ai đó cho một việc từ xa nhỏ chứ?',
        a: 'Được, nhưng bạn có thể đang trả thừa cho phần kiểm chứng mà bạn không cần. Với một việc từ xa nhanh gọn, sàn phổ thông thực tế hơn — chúng tôi sinh ra cho những công việc mà sai lầm rất đắt.',
      },
    ],
  },
  'direct-hire': {
    label: 'so với tuyển toàn thời gian',
    metaTitle: 'Tuyển kỹ sư tự động hóa toàn thời gian hay thuê theo dự án qua nền tảng?',
    metaDesc: 'Toàn thời gian hợp lý khi công việc điều khiển diễn ra liên tục. Với công việc dạng dự án, yếu tố quyết định là thời gian bắt đầu và công suất nhàn rỗi.',
    question: 'Nên tuyển kỹ sư tự động hóa toàn thời gian hay thuê theo dự án qua nền tảng?',
    answer: 'Hãy tuyển toàn thời gian khi công việc diễn ra liên tục — nhà máy có việc điều khiển quanh năm, nơi một kỹ sư nội bộ tích lũy hiểu biết về máy móc của bạn. Hãy thuê qua nền tảng khi công việc có dạng dự án: một lần nâng cấp, một đợt chạy thử, một lần dời dây chuyền. Yếu tố quyết định thường là thời gian và công suất nhàn rỗi: ở Mỹ, lấp một vị trí kỹ sư điều khiển mất khoảng hai tháng tuyển dụng trước khi có người bắt đầu, và khi đã tuyển thì bạn gánh lương, phúc lợi và khoảng trống giữa các dự án. Hợp tác qua nền tảng bắt đầu trong vài ngày và bạn chỉ trả cho những cột mốc mình nạp tiền.',
    them: [
      'Ai ứng tuyển trong thị trường lao động địa phương, trong phạm vi đi lại được',
      'Phỏng vấn và tham chiếu — và bạn chịu chi phí nếu chọn sai',
      'Lương, phúc lợi và thuế, phải trả dù có dự án đang chạy hay không',
      'Họ làm việc trực tiếp cho bạn, nên kiểm chứng không còn là vấn đề riêng',
      'Hoàn toàn minh bạch — đó là bảng lương của chính bạn',
    ],
    themWhen: [
      'Có việc điều khiển quanh năm, không phải một dự án có ngày kết thúc',
      'Kiến thức đáng được tích lũy nội bộ — máy của bạn, lịch sử của bạn, những đặc thù riêng',
      'Bạn cần người có thể xử lý sự cố dừng chuyền vào bất kỳ giờ nào',
    ],
    usWhen: [
      'Công việc là một dự án có điểm kết thúc: nâng cấp, chạy thử, dời dây chuyền',
      'Bạn cần một chuyên môn mà bạn sẽ không bao giờ nuôi toàn thời gian — machine vision, một hãng robot cụ thể',
      'Hiện trường ở nước khác và tuyển tại chỗ đồng nghĩa phải lập pháp nhân trước',
    ],
    faqs: [
      {
        q: 'Kỹ sư thực tế bao lâu có thể bắt đầu?',
        a: 'Việc ghép cặp diễn ra trong khoảng 48 giờ sau khi đăng; ngày bắt đầu phụ thuộc vào lịch của kỹ sư và các yêu cầu ra vào hiện trường hay thị thực. So với khoảng hai tháng tuyển dụng để lấp một vị trí điều khiển ở Mỹ.',
      },
      {
        q: 'Kỹ sư hợp đồng có thể chuyển thành nhân viên chính thức không?',
        a: 'Có. Không có phí giới thiệu khi chuyển đổi — phí nền tảng chỉ áp cho các cột mốc ký quỹ, không áp cho quyết định tuyển dụng của bạn.',
      },
      {
        q: 'Còn việc giữ kiến thức trong nội bộ thì sao?',
        a: 'Đó là lợi thế thật của việc tuyển toàn thời gian và chúng tôi không phản bác. Tài liệu dự án, ảnh check-in và hồ sơ kiểm tra chất lượng vẫn nằm trong tài khoản của bạn sau khi dự án khép lại, nhưng chúng không thay thế được một người đã vận hành nhà máy của bạn suốt ba năm.',
      },
    ],
  },
  'automate-america': {
    label: 'so với Automate America',
    metaTitle: 'Talengineer với Automate America — bên nào hợp với dự án của bạn?',
    metaDesc: 'Automate America được xây cho cung ứng nhân lực tự động hóa theo giờ tại Mỹ. Talengineer được xây cho giao dự án xuyên biên giới, có chứng chỉ bắt buộc và ký quỹ theo cột mốc.',
    question: 'Talengineer với Automate America: bên nào hợp với dự án của bạn?',
    answer: 'Automate America phù hợp nếu bạn cần nhà thầu tự động hóa đặt tại Mỹ, tính tiền theo giờ, có bảng chấm công điện tử và thanh toán nhanh — họ được xây cho đúng việc đó và đã có chỗ đứng. Talengineer được xây cho một dạng công việc khác: dự án xuyên biên giới vận hành bằng chín ngôn ngữ, kỹ sư bắt buộc phải qua chứng chỉ nền tảng trước khi được chỉ định vào bất cứ việc gì, và ký quỹ theo cột mốc — tiền của bạn chỉ được giải ngân sau khi bạn duyệt. Nếu việc của bạn là cung ứng nhân lực theo giờ tại Mỹ, họ hợp hơn. Nếu là dự án có phạm vi rõ ràng — nhất là khi qua biên giới — thì kiểm chứng và mô hình thanh toán là chỗ chúng tôi khác biệt.',
    them: [
      'Bắc Mỹ, bằng tiếng Anh',
      'Theo cách họ diễn đạt: hồ sơ đã xác minh, lịch sử công việc có ghi nhận và đánh giá từ khách hàng trước; không thấy công bố kỳ thi chứng chỉ do nền tảng tổ chức',
      'Theo giờ, thời gian và vật tư. Theo mô tả của chính họ, nền tảng lấy một phần trăm của đơn giá giờ trước khi hợp đồng được đưa lên sàn; tỷ lệ này không được công bố',
      'Bảng chấm công điện tử với luồng duyệt của khách hàng; không thấy công bố cơ chế kiểm chứng vị trí',
      'Miễn phí tham gia cho mọi bên, không thuê bao; nhưng tỷ lệ được lấy thì không công bố',
    ],
    themWhen: [
      'Bạn cần nhà thầu đặt tại Mỹ, tính theo giờ, bắt đầu càng sớm càng tốt',
      'Bạn muốn nền tảng lo hóa đơn, bảng lương, phúc lợi và tuân thủ (dịch vụ quản lý của họ)',
      'Bạn dự định sau này chuyển nhà thầu thành nhân viên chính thức',
    ],
    usWhen: [
      'Dự án qua biên giới hoặc qua ngôn ngữ — nhà máy ở Mexico, Việt Nam hay Thái Lan còn bên mua ở nơi khác',
      'Bạn muốn năng lực được chứng minh trước khi chỉ định, bằng kỳ thi chứng chỉ chứ không phải đánh giá sau khi xong',
      'Bạn muốn tiền nằm trong ký quỹ và giải ngân theo cột mốc đã nghiệm thu, với cột mốc đầu được hoàn tiền',
    ],
    faqs: [
      {
        q: 'Automate America có phải đối thủ không?',
        a: 'Ở một phần thị trường thì có — nhận thầu tự động hóa nội địa Mỹ. Còn ở giao dự án xuyên biên giới, phối hợp chín ngôn ngữ, chỉ định có điều kiện chứng chỉ và ký quỹ theo cột mốc, chúng tôi đang giải một bài toán khác.',
      },
      {
        q: 'Bên nào rẻ hơn?',
        a: 'Không thể so trực tiếp vì mô hình thu phí khác nhau. Talengineer công bố 15% mỗi cột mốc được giải ngân (5% cho khách hàng sáng lập trong 5 đơn đầu). Automate America mô tả rằng họ lấy một phần trăm của đơn giá giờ trước khi hợp đồng lên sàn, và không công bố tỷ lệ đó.',
      },
      {
        q: 'Tôi dùng cả hai được không?',
        a: 'Được, và với nhiều nhà sản xuất đó mới là câu trả lời hợp lý — nhà thầu nội địa Mỹ tính theo giờ cho hỗ trợ thường xuyên, và một dự án ký quỹ có phạm vi rõ ràng cho việc xây hay nâng cấp nhà máy ở nước ngoài.',
      },
    ],
  },
  'field-nation': {
    "label": "So với Field Nation",
    "metaTitle": "Talengineer so với Field Nation — đâu là lựa chọn phù hợp cho dự án của bạn?",
    "metaDesc": "Field Nation là một sàn giao dịch tập trung vào thị trường Mỹ dành cho kỹ thuật viên dịch vụ hiện trường IT, tính phí theo từng đơn công việc. Talengineer được xây dựng cho các dự án tự động hóa công nghiệp xuyên biên giới, yêu cầu chứng nhận, với hình thức ký quỹ theo mốc.",
    "question": "Talengineer so với Field Nation: đâu là lựa chọn phù hợp cho dự án của bạn?",
    "answer": "Field Nation phù hợp nếu bạn cần kỹ thuật viên dịch vụ hiện trường IT tập trung tại Mỹ — mạng, đi dây cáp, điểm bán hàng (POS), biển hiệu số, lắp đặt an ninh — được điều phối nhanh từ một nguồn nhân lực khổng lồ sẵn có (hơn một triệu đơn công việc mỗi năm tại hơn 600.000 địa điểm), với mức phí công khai đơn giản là 10% khấu trừ từ phía kỹ thuật viên. Talengineer được xây dựng cho một dạng công việc khác: kỹ sư tự động hóa công nghiệp đã được chứng nhận — PLC, robot, thị giác máy, điện — hoạt động tại Mỹ, Mexico, Việt Nam, Thái Lan và Trung Quốc, làm việc bằng chín ngôn ngữ, nơi bắt buộc phải qua kỳ thi chứng nhận của nền tảng trước khi bất kỳ ai được phân công — chứ không chỉ dựa vào hồ sơ, đánh giá và một bước kiểm tra lý lịch tùy chọn — và tiền của bạn được giữ trong tài khoản ký quỹ theo mốc, chỉ được giải ngân sau khi bạn phê duyệt công việc, thay vì chi trả cho kỹ thuật viên theo chu kỳ thanh toán hằng tuần. Nếu công việc của bạn là dịch vụ hiện trường IT tại địa phương ở Mỹ, tính phí theo đơn công việc, thì Field Nation là lựa chọn phù hợp hơn. Nếu đó là một dự án tự động hóa có phạm vi rõ ràng — đặc biệt là dự án xuyên biên giới, hoặc dự án mà bạn muốn năng lực được chứng minh trước khi phân công thay vì sau đó — thì cách xác minh và mô hình thanh toán chính là điểm khác biệt giữa chúng tôi.",
    "them": [
      "Tập trung vào thị trường Mỹ — các trang của họ mô tả phạm vi phủ sóng theo bang và mã ZIP của Mỹ, thỉnh thoảng nhắc đến Bắc Mỹ/Canada ('trên khắp nước Mỹ và Canada'); không tuyên bố phạm vi phủ sóng quốc tế hay toàn cầu. Kỹ thuật viên phụ trách các chuyên môn IT/tại chỗ — mạng, đi dây cáp, điểm bán hàng, biển hiệu số, máy tính và máy in, an ninh — chứ không phải tự động hóa công nghiệp.",
      "Hồ sơ tự khai báo (kỹ năng, chứng chỉ, lịch sử làm việc), đánh giá/xếp hạng từ người mua, cùng một thuật toán xếp hạng độc quyền 'Provider Match' và 'Success Score'. Kiểm tra lý lịch và xét nghiệm ma túy (thực hiện qua đối tác bên thứ ba) chỉ bắt buộc với những đơn công việc yêu cầu — theo số liệu của chính họ là 76% — không phải mọi công việc, và trang web của họ không mô tả bất kỳ kỳ thi chứng nhận nào do nền tảng tổ chức.",
      "Không phải ký quỹ theo mốc. Người mua hoặc là nạp tiền trước vào tài khoản Field Nation — theo điều khoản dành cho người mua của chính họ, đây là một tài khoản ủy thác duy nhất, gộp chung với tiền của những người mua khác — hoặc sử dụng điều khoản thanh toán net 7/14/21/28 ngày; kỹ thuật viên chỉ được trả lương theo chu kỳ hằng tuần sau khi khoản thanh toán của người mua được xử lý, vì vậy với công việc theo điều khoản thanh toán, kỹ thuật viên phải gánh rủi ro người mua không trả tiền cho đến thời điểm đó. Người mua ở California đã bị cấm nạp tiền trước từ tháng 3 năm 2021 và phải thanh toán sau khi phê duyệt công việc.",
      "Một bước check-in/check-out, tài liệu ảnh chụp trong ứng dụng gắn với đơn công việc cụ thể, và thu thập chữ ký điện tử tại hiện trường. GPS được mô tả là dùng để tìm việc và theo dõi quãng đường di chuyển; liệu bản thân bước check-in có được xác minh bằng GPS hay không thì không được mô tả trên các trang công khai của họ — không công bố.",
      "Phí phía kỹ thuật viên được công khai và đơn giản: 10% cố định trên tổng số tiền thanh toán cuối cùng của đơn công việc, hoặc 13.9% ở gói Pro tùy chọn (10% cơ bản cộng thêm 3.9%), cộng với các gói bảo hiểm tùy chọn (1.95% cho bảo hiểm trách nhiệm chung của nền tảng, 1% hoặc 0.5% cho bảo hiểm tai nạn nghề nghiệp). Mức phí họ thu từ người mua/doanh nghiệp thì không được công bố — các gói được mô tả là dạng đăng ký thuê bao, chỉ có giá khi liên hệ bộ phận bán hàng."
    ],
    "themWhen": [
      "Bạn cần dịch vụ hiện trường IT tại Mỹ hoặc Bắc Mỹ — mạng, đi dây cáp, POS, biển hiệu số, lắp đặt camera an ninh — chứ không phải tự động hóa công nghiệp.",
      "Bạn muốn tiếp cận một nguồn kỹ thuật viên đã rất lớn (hơn 1 triệu đơn công việc mỗi năm, hơn 600.000 địa điểm) và tốc độ quan trọng hơn việc chứng minh năng lực qua kỳ thi chứng nhận trước khi phân công.",
      "Với tư cách người mua, bạn muốn trả đúng giá trị đơn công việc mà không có mục phí nền tảng riêng — phần chiết khấu của Field Nation được trừ từ khoản thanh toán cho kỹ thuật viên, không tính phí bạn."
    ],
    "usWhen": [
      "Dự án vượt biên giới hoặc ngôn ngữ — một nhà máy ở Mexico, Việt Nam hoặc Thái Lan với người mua ở nơi khác — nằm ngoài mạng lưới tập trung vào Mỹ/Bắc Mỹ của Field Nation.",
      "Bạn muốn năng lực được chứng minh qua kỳ thi chứng nhận trước khi phân công, thay vì chỉ dựa vào hồ sơ tự khai báo cùng đánh giá và một bước kiểm tra lý lịch tùy chọn tùy theo công việc.",
      "Bạn muốn tiền của mình được giữ trong tài khoản ký quỹ theo mốc và chỉ giải ngân sau khi bạn phê duyệt công việc, thay vì chu kỳ thanh toán hằng tuần theo điều khoản, nơi kỹ thuật viên phải gánh rủi ro bạn không trả tiền cho đến khi tiền được xử lý xong."
    ],
    "faqs": [
      {
        "q": "Field Nation có phải là đối thủ cạnh tranh không?",
        "a": "Trong lĩnh vực điều phối dịch vụ hiện trường IT — mạng, đi dây cáp, POS, lắp đặt an ninh, tính phí theo đơn công việc — thì đúng vậy. Nhưng trong các dự án tự động hóa công nghiệp yêu cầu chứng nhận, có ký quỹ theo mốc và triển khai xuyên biên giới, đa ngôn ngữ, chúng tôi đang giải quyết một bài toán khác."
      },
      {
        "q": "Bên nào rẻ hơn?",
        "a": "Không thể so sánh mức phí ngang hàng — vì phí được thu từ hai phía khác nhau. Field Nation khấu trừ cố định 10% từ khoản thanh toán cho kỹ thuật viên (13.9% ở gói Pro tùy chọn), và không công bố họ có thu phí gì từ người mua ngoài giá trị đơn công việc hay không; các gói cho người mua là dạng thuê bao và được báo giá qua bộ phận bán hàng. Talengineer công khai phí trực tiếp cho người mua: 15% trên mỗi mốc đã giải ngân (5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên), hiển thị rõ trước khi bạn xác nhận."
      },
      {
        "q": "Tôi có thể dùng cả hai không?",
        "a": "Có — với nhiều công ty, đó là cách chia thực tế: dùng Field Nation cho việc điều phối kỹ thuật viên IT/tại chỗ ở Mỹ, và dùng Talengineer cho một dự án tự động hóa được chứng nhận, có bảo vệ bằng ký quỹ, đặc biệt là dự án xuyên biên giới."
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer so với WorkMarket — nền tảng nào phù hợp với dự án của bạn?",
    "metaDesc": "WorkMarket (thuộc ADP) là nền tảng chỉ dành cho Hoa Kỳ, dùng để quản lý số lượng lớn nhà thầu 1099. Talengineer được xây dựng cho các dự án tự động hóa xuyên biên giới, yêu cầu chứng nhận và ký quỹ theo mốc (milestone escrow).",
    "question": "Talengineer so với WorkMarket: nền tảng nào phù hợp với dự án của bạn?",
    "answer": "WorkMarket, thuộc sở hữu của ADP, được xây dựng cho các công ty Hoa Kỳ đang vận hành một nhóm lớn các nhà thầu 1099 sẵn có — với quy trình onboarding hàng loạt, kiểm tra lý lịch và bài test kỹ năng được cấu hình theo từng danh mục công việc, khai thuế 1099-NEC tự động, và thanh toán nhanh cho các danh mục như dịch vụ hiện trường IT, giao nhận và an ninh. Điều khoản Dịch vụ của chính họ nêu rõ nền tảng này 'không dành cho khách hàng ở ngoài lãnh thổ Hoa Kỳ sử dụng', và con số phí duy nhất họ công bố là khoản phí tùy chọn 2.5% tính cho người lao động khi rút tiền sớm — mức phí nền tảng tiêu chuẩn phía khách hàng được ấn định theo từng công việc và không được công khai. Talengineer được xây dựng cho một dạng công việc khác: một dự án tự động hóa công nghiệp có phạm vi xác định rõ, thường xuyên xuyên biên giới, nơi kỹ sư phải có chứng nhận nền tảng (platform certification) trước khi được giao bất kỳ việc gì, và tiền của bạn được giữ trong tài khoản ký quỹ theo mốc (milestone escrow), chỉ được giải ngân sau khi bạn phê duyệt. Nếu bạn đang quản lý lực lượng lao động tạm thời trong nước ở quy mô lớn, công cụ của WorkMarket trưởng thành hơn cho việc đó. Nếu công việc của bạn là một dự án PLC, robot hoặc thị giác máy (machine vision) cần năng lực đã được xác minh trước và có bảo vệ thanh toán, thì đó chính là điều chúng tôi xây dựng Talengineer để giải quyết.",
    "them": [
      "Chỉ dành cho khách hàng Hoa Kỳ. Điều khoản Dịch vụ của họ nêu rõ nền tảng 'không dành cho khách hàng ở ngoài lãnh thổ Hoa Kỳ sử dụng', và một trang doanh nghiệp của WorkMarket ghi chú rằng nền tảng 'hiện chỉ hỗ trợ các doanh nghiệp có pháp nhân tại Hoa Kỳ'. Khoản thanh toán cho nhà thầu được mô tả là có thể đến 'gần như bất kỳ đâu trên thế giới', nhưng ai được phép mua dịch vụ trên nền tảng thì chỉ giới hạn ở Hoa Kỳ.",
      "Kiểm tra lý lịch và xét nghiệm ma túy được thực hiện thông qua một cơ quan báo cáo người tiêu dùng bên thứ ba (được kích hoạt bằng sự ủy quyền bằng văn bản của chính người lao động), cùng với kiểm tra giấy phép/chứng chỉ, xác minh mã số thuế/tài khoản ngân hàng, và các 'bài kiểm tra có thể tùy chỉnh để đánh giá kỹ năng người lao động' mà khách hàng tự thiết lập theo từng danh mục công việc thông qua 'Labor Clouds' riêng của họ. Không có kỳ thi chứng nhận nào do nền tảng quản lý được công bố là yêu cầu bắt buộc trước khi một người lao động có thể được giao việc.",
      "Tính phí theo thời gian và vật tư (time-and-materials) cho từng công việc: khách hàng đăng một Giá trị Công việc (Assignment Value), và theo Điều khoản của họ, khách hàng 'có nghĩa vụ thanh toán cho Người lao động Độc lập cho một Công việc khi Công việc đó trở thành Công việc Đã được Duyệt' — tức là khi khách hàng đánh dấu công việc đã hoàn thành. Không có bất kỳ thỏa thuận ký quỹ nào được mô tả ở bất cứ đâu trong Điều khoản của họ, và một khi khoản phí đã được thu, 'khoản phí hoặc khoản ghi nợ đó không được hoàn lại, trừ khi luật hiện hành có quy định khác'.",
      "Một ứng dụng di động cho người lao động với chức năng check-in/check-out, geofencing (được nêu rõ trên trang dịch vụ hiện trường IT của họ), tải lên ảnh và tài liệu như là sản phẩm bàn giao, và thu thập chữ ký điện tử.",
      "'Phí Nền tảng' (Platform Fee) tiêu chuẩn phía khách hàng được ấn định theo từng công việc, và Điều khoản của họ nêu rõ 'WorkMarket có quyền thay đổi Phí Nền tảng bất kỳ lúc nào' — bản thân tỷ lệ phần trăm này không được công bố. Con số phí duy nhất được tiết lộ trong Điều khoản của họ là khoản phí 2.5% tính cho người lao động khi muốn tiếp cận sớm với tiền (FastFunds) một cách tùy chọn; ngoài ra, mức giá tiêu chuẩn đòi hỏi phải liên hệ bộ phận kinh doanh để nhận báo giá."
    ],
    "themWhen": [
      "Bạn là một công ty Hoa Kỳ đang quản lý một nhóm lớn nhà thầu 1099 sẵn có trên nhiều danh mục công việc — kỹ thuật viên hiện trường IT, người giao hàng, tài xế, an ninh, phiên dịch viên — và cần onboarding hàng loạt cùng khai thuế 1099-NEC tự động.",
      "Bạn muốn tự định nghĩa quy tắc thẩm định riêng theo từng danh mục công việc — kiểm tra lý lịch, xét nghiệm ma túy, bài test kỹ năng tùy chỉnh — thay vì yêu cầu chứng nhận nền tảng được cấp trước khi giao việc.",
      "Bạn muốn thanh toán cho người lao động nhanh chóng, linh hoạt (ACH, thẻ trả lương, PayPal, tùy chọn rút tiền sớm) cho khối lượng lớn các đơn công việc ngắn hạn tính theo thời gian và vật tư."
    ],
    "usWhen": [
      "Dự án xuyên biên giới — chính Điều khoản của WorkMarket giới hạn nền tảng chỉ dành cho khách hàng có trụ sở tại Hoa Kỳ; kỹ sư của chúng tôi làm việc xuyên suốt Hoa Kỳ, Mexico, Việt Nam, Thái Lan và Trung Quốc bằng chín ngôn ngữ.",
      "Bạn muốn năng lực được chứng minh bằng một kỳ thi chứng nhận bắt buộc trước khi giao việc, chứ không phải kiểm tra lý lịch và bài test do khách hàng tự cấu hình áp dụng sau khi người lao động đã ở trong nhóm.",
      "Bạn muốn tiền được giữ trong tài khoản ký quỹ (escrow) và chỉ được giải ngân sau khi bạn phê duyệt từng mốc, với cam kết hoàn tiền cho mốc đầu tiên — chứ không phải mô hình thanh toán ngay khi phê duyệt, nơi khoản phí không thể hoàn lại một khi đã thu."
    ],
    "faqs": [
      {
        "q": "WorkMarket có phải là đối thủ cạnh tranh không?",
        "a": "Ở một phần của thị trường thì đúng — đó là quản lý lực lượng lao động tạm thời trong nước Hoa Kỳ ở quy mô lớn. Còn ở mảng triển khai dự án xuyên biên giới, giao việc có điều kiện chứng nhận và ký quỹ theo mốc, chúng tôi đang giải quyết một bài toán khác."
      },
      {
        "q": "Cái nào rẻ hơn?",
        "a": "Hai bên không thể so sánh trực tiếp, vì WorkMarket không công bố mức phí nền tảng tiêu chuẩn của họ — Điều khoản của họ chỉ tiết lộ một khoản phí tùy chọn 2.5% tính cho người lao động khi rút tiền sớm (FastFunds). Talengineer công bố phí ngay từ đầu: 15% trên mỗi mốc đã giải ngân, 5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên."
      },
      {
        "q": "Tôi có thể dùng cả hai không?",
        "a": "Có. Nhiều nhà sản xuất vận hành một nền tảng như WorkMarket cho nhóm lớn nhà thầu dịch vụ hiện trường hoặc IT tại Hoa Kỳ, và dùng Talengineer riêng cho một dự án tự động hóa có phạm vi xác định — đặc biệt là dự án xuyên biên giới cần năng lực đã được chứng nhận cùng ký quỹ theo mốc."
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer so với Upwork — nền tảng nào phù hợp với dự án của bạn?",
    "metaDesc": "Upwork là một sàn freelance toàn cầu đa lĩnh vực, bao phủ hàng nghìn kỹ năng khác nhau. Talengineer được xây dựng riêng cho các dự án tự động hóa công nghiệp yêu cầu chứng nhận, ký quỹ theo mốc và xác minh tại hiện trường.",
    "question": "Talengineer so với Upwork: nền tảng nào phù hợp với dự án của bạn?",
    "answer": "Upwork là lựa chọn phù hợp nếu bạn cần thuê ngoài cho hầu như bất kỳ loại công việc từ xa nào, chứ không riêng kỹ thuật tự động hóa: đây là một sàn đa lĩnh vực với hơn 18 triệu freelancer tại hơn 180 quốc gia và hàng nghìn hạng mục kỹ năng, với các mức phí công khai cố định và hệ thống ký quỹ riêng cho các mốc giá cố định — quy mô và độ trưởng thành đó là có thật. Talengineer được xây dựng hẹp hơn nhưng sâu hơn: chỉ gồm các kỹ sư tự động hóa công nghiệp đã được chứng nhận — PLC, robot, thị giác máy, điện — những người phải vượt qua chứng nhận nền tảng trước khi được phân công bất kỳ công việc nào, hoạt động trên chín ngôn ngữ, với check-in bằng hàng rào địa lý GPS và kiểm tra chất lượng bằng hình ảnh cho công việc tại hiện trường. Nếu bạn cần thuê cho công việc từ xa đa lĩnh vực, độ rộng của Upwork rất khó sánh được. Nếu đó là một dự án tự động hóa công nghiệp có phạm vi rõ ràng — đặc biệt là dự án có sản phẩm bàn giao vật lý, tại hiện trường cần được xác minh — thì việc sàng lọc năng lực trước khi phân công và bằng chứng tại hiện trường chính là điểm khác biệt của chúng tôi.",
    "them": [
      "Một sàn toàn cầu đa lĩnh vực, không chuyên về tự động hóa công nghiệp: theo chính lời họ, có hơn 18 triệu freelancer tại hơn 180 quốc gia và hàng nghìn hạng mục kỹ năng",
      "Danh tính và vị trí của mỗi freelancer đều được xác minh trước khi khách hàng có thể kết nối với họ, và hồ sơ hiển thị các đánh giá đã xác minh cùng lịch sử làm việc. Việc sàng lọc kỹ năng sâu hơn — huy hiệu 'Expert-Vetted', đạt được thông qua phỏng vấn sàng lọc, bài kiểm tra kỹ năng và đánh giá portfolio hoặc code — là tùy chọn, chỉ giới hạn ở một số hạng mục nhất định, và theo chính mô tả của Upwork, chỉ hiển thị với khách hàng gói Business Plus và Enterprise; hầu hết freelancer không bao giờ phải vượt qua bài kiểm tra nào trước khi nhận việc",
      "Công việc giá cố định được bảo vệ bởi 'project funds' (tên hiện tại mà Upwork dùng cho ký quỹ): khách hàng cấp vốn cho một mốc trước khi công việc bắt đầu, và số tiền được giải ngân khi khách hàng phê duyệt hoặc khi khoảng thời gian xem xét 14 ngày tự động kết thúc. Công việc tính theo giờ được bảo vệ riêng, thông qua ứng dụng theo dõi thời gian Work Diary chứ không phải ký quỹ. Ngoài ra, việc hoàn tiền được yêu cầu theo từng trường hợp trong vòng 180 ngày và do freelancer tự quyết định có chấp thuận hay không; không có cam kết hoàn tiền cho mốc đầu tiên được công bố",
      "Không được công bố. Các trang tin cậy và an toàn của chính Upwork mô tả về bảo mật tài khoản và dữ liệu — xác thực hai yếu tố, mã hóa, quét phần mềm độc hại — không hề đề cập đến check-in GPS, hàng rào địa lý hay xác minh bằng hình ảnh cho công việc trực tiếp hoặc tại hiện trường",
      "Được công bố và phân theo bậc ở phía khách hàng: phí sàn 5% ở gói Basic (3% cho khách hàng Mỹ đủ điều kiện thanh toán qua chuyển khoản ngân hàng) hoặc 10% ở gói Business Plus (8% nếu đủ điều kiện), cộng thêm phí khởi tạo hợp đồng một lần từ $0.99–$14.99 mỗi hợp đồng. Phí phía freelancer dao động từ 0%–15% mỗi hợp đồng, được ấn định theo tiêu chí nội bộ mà Upwork không công bố, và chỉ hiển thị cho freelancer trước khi họ chấp nhận, chứ không phải một mức phí công khai cố định"
    ],
    "themWhen": [
      "Bạn cần công việc ngoài lĩnh vực tự động hóa công nghiệp — viết lách, thiết kế, marketing, phần mềm nói chung, hành chính — những hạng mục mà Talengineer hoàn toàn không cung cấp",
      "Bạn muốn tiếp cận ngay nguồn nhân lực lớn nhất có thể, với nền tảng đánh giá và lịch sử xếp hạng đã được thiết lập, thay vì một danh sách hẹp hơn gồm những người đã được chứng nhận",
      "Công việc của bạn là công việc tính theo giờ không giới hạn thời gian chứ không phải một dự án có phạm vi xác định — Work Diary và hình thức tính phí theo giờ của Upwork được xây dựng cho sự hợp tác liên tục, lâu dài"
    ],
    "usWhen": [
      "Bạn cần năng lực được chứng minh và sàng lọc trước khi phân công — một chứng nhận nền tảng bắt buộc dành riêng cho tự động hóa công nghiệp — thay vì một huy hiệu tùy chọn chỉ hiển thị với khách hàng cấp doanh nghiệp và mà hầu hết freelancer không bao giờ đạt được",
      "Sản phẩm bàn giao của bạn mang tính vật lý và tại hiện trường — sàn nhà máy, một dự án cải tạo, một chuyến chạy thử nghiệm — và bạn muốn có check-in bằng hàng rào địa lý GPS và kiểm tra chất lượng bằng hình ảnh làm bằng chứng, điều mà chính các trang tin cậy và an toàn của Upwork không hề mô tả",
      "Bạn muốn mức phí được công bố là một tỷ lệ phần trăm cố định, rõ ràng ngay trước khi cam kết, cùng với cam kết hoàn tiền cho mốc đầu tiên, thay vì mức phí phía freelancer dao động 0%-15% được ấn định theo tiêu chí không công bố và không có cam kết hoàn tiền trên toàn nền tảng"
    ],
    "faqs": [
      {
        "q": "Upwork có phải là đối thủ cạnh tranh không?",
        "a": "Trong lĩnh vực tuyển dụng freelance đa lĩnh vực, đúng vậy — đây là một trong những sàn lớn nhất thế giới. Còn trong việc triển khai dự án tự động hóa công nghiệp yêu cầu chứng nhận và xác minh tại hiện trường, chúng tôi đang giải quyết một bài toán hẹp hơn, khác biệt, không phải là điều Upwork được xây dựng chuyên biệt để phục vụ."
      },
      {
        "q": "Nền tảng nào rẻ hơn?",
        "a": "Cơ cấu phí giữa hai bên không thể so sánh trực tiếp. Talengineer công bố mức phí 15% trên mỗi mốc đã giải ngân (5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên). Phí khách hàng của Upwork là 5% ở gói Basic hoặc 10% ở gói Business Plus (3%/8% cho khách hàng Mỹ đủ điều kiện thanh toán qua ngân hàng), cộng thêm phí khởi tạo hợp đồng một lần; freelancer trả riêng từ 0%-15% thu nhập của chính họ, theo tiêu chí mà Upwork không công bố."
      },
      {
        "q": "Tôi có thể dùng cả hai không?",
        "a": "Có. Nhiều người mua sử dụng Upwork cho công việc từ xa nói chung — hành chính, marketing, phần mềm — và dùng Talengineer riêng cho kỹ thuật tự động hóa yêu cầu chứng nhận, đặc biệt là các dự án có sản phẩm bàn giao vật lý, tại hiện trường."
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer so với Toptal — đâu là lựa chọn phù hợp cho dự án của bạn?",
    "metaDesc": "Toptal là mạng lưới đã qua sàng lọc dành cho công việc tri thức từ xa tính phí theo giờ — lập trình viên, nhà thiết kế, tài chính, quản lý dự án. Talengineer được xây dựng cho các dự án tự động hóa công nghiệp yêu cầu chứng chỉ và ký quỹ theo mốc.",
    "question": "Talengineer so với Toptal: đâu là lựa chọn phù hợp cho dự án của bạn?",
    "answer": "Toptal là lựa chọn phù hợp nếu bạn cần một chuyên gia đã qua sàng lọc duy nhất — lập trình viên, nhà thiết kế, product manager hoặc chuyên viên phân tích tài chính — tính phí theo giờ, với giai đoạn dùng thử không rủi ro trước khi bạn cam kết. Đó chính là mục đích thiết kế của họ: một phễu sàng lọc gồm năm giai đoạn khi gia nhập mạng lưới (theo số liệu chính họ công bố, tỷ lệ chấp nhận tổng thể dưới 3% số người nộp đơn hàng tháng), cùng một mạng lưới ưu tiên làm việc từ xa trải rộng hơn 100 quốc gia. Talengineer được xây dựng cho một dạng công việc khác: các dự án tự động hóa công nghiệp — PLC, robot, thị giác máy, điện — nơi mọi kỹ sư đều phải vượt qua kỳ chứng chỉ nền tảng (L1-L3, chấm điểm bằng AI và được con người thẩm định) trước khi được giao bất kỳ việc gì, công việc được cấp vốn và giải ngân theo từng mốc đã duyệt thay vì tính phí theo giờ, và công việc tại hiện trường có check-in bằng hàng rào địa lý GPS cùng kiểm tra chất lượng bằng ảnh làm bằng chứng. Nếu công việc của bạn là công việc tri thức từ xa, tính phí theo giờ, mô hình dùng thử rồi thuê của Toptal là lựa chọn tốt hơn. Nếu đó là một dự án tự động hóa có phạm vi rõ ràng — đặc biệt là dự án diễn ra ngay tại nhà máy — thì việc yêu cầu chứng chỉ và ký quỹ theo mốc chính là điểm khác biệt của chúng tôi.",
    "them": [
      "Chuyên gia tại hơn 100 quốc gia — phần lớn ở châu Mỹ và châu Âu — phục vụ khách hàng tại hơn 140 quốc gia, theo lời họ, trải rộng khắp phát triển phần mềm, thiết kế, tài chính và quản lý sản phẩm/dự án; không có danh mục riêng cho tự động hóa công nghiệp, PLC, robot hay thị giác máy, và không công bố số liệu về phạm vi ngôn ngữ ngoài việc sàng lọc tiếng Anh trong quá trình thẩm định",
      "Một lần sàng lọc gia nhập mạng lưới gồm năm giai đoạn, theo đúng phễu mà Toptal công bố: ngôn ngữ và giao tiếp (tỷ lệ đạt 26.4%), đánh giá kỹ năng chuyên sâu (7.4%), phỏng vấn kỹ thuật trực tiếp (3.6%), rồi đến dự án thử nghiệm kéo dài 1-3 tuần (3.2%), với tỷ lệ chấp nhận tổng thể dưới 3% số người nộp đơn hàng tháng; việc sàng lọc chỉ diễn ra một lần khi gia nhập mạng lưới, không theo từng khách hàng hay từng kỹ năng, và không công bố kỳ thi chứng chỉ nền tảng riêng biệt",
      "Tính phí theo giờ với mức giá hỗn hợp, xuất hóa đơn hai lần mỗi tháng theo điều khoản Net 10, cộng thêm phí thuê bao cố định $79/tháng khi bạn tiến vào giai đoạn ghép nối nhân sự; rủi ro được bao phủ bởi giai đoạn dùng thử không rủi ro tối đa hai tuần (với tối đa ba ứng viên cho mỗi vị trí) mà bạn không bị tính phí nếu không hài lòng — trang FAQ chính thức của họ không hề dùng từ \"ký quỹ\" (escrow) hay \"mốc\" (milestone)",
      "Ưu tiên làm việc từ xa theo thiết kế — theo lời họ, \"phần lớn làm việc từ xa tại văn phòng ở nhà hoặc không gian làm việc chung\" — còn công việc tại hiện trường được mô tả là trường hợp ngoại lệ hiếm gặp; không công bố hệ thống xác minh vị trí, hàng rào địa lý hay kiểm tra chất lượng bằng ảnh",
      "Phí thuê bao $79/tháng được công bố công khai; mức phí theo giờ được mô tả là \"hỗn hợp\" để bao gồm phần biên lợi nhuận của Toptal, nhưng tỷ lệ phần trăm cụ thể hoặc mức chênh lệch mà họ giữ lại từ mức phí đó thì không được công bố"
    ],
    "themWhen": [
      "Bạn cần một chuyên gia làm việc tri thức từ xa duy nhất — lập trình viên, nhà thiết kế, PM, chuyên viên phân tích tài chính — chứ không phải kỹ sư tự động hóa công nghiệp, và muốn thử tối đa ba ứng viên miễn phí rủi ro trước khi cam kết",
      "Bạn muốn một hợp tác tính phí theo giờ liên tục, có lộ trình chuyển đổi sang toàn thời gian, thay vì một dự án theo mốc có phạm vi xác định",
      "Bạn muốn một mạng lưới có bề dày hoạt động nhiều năm trên hơn 100 quốc gia, được thẩm định một lần qua phễu sàng lọc năm giai đoạn công khai thay vì chứng chỉ theo từng công việc"
    ],
    "usWhen": [
      "Dự án của bạn là công việc tự động hóa công nghiệp — PLC, robot, thị giác máy, điện — một danh mục mà chính trang web của Toptal không liệt kê là thế mạnh",
      "Công việc diễn ra tại nhà máy hoặc công trường và bạn muốn có check-in bằng hàng rào địa lý GPS cùng kiểm tra chất lượng bằng ảnh làm bằng chứng, thay vì mặc định ưu tiên làm việc từ xa",
      "Bạn muốn tiền được giải ngân theo từng mốc mà bạn phê duyệt, với hoàn tiền cho mốc đầu tiên, thay vì hóa đơn theo giờ theo điều khoản Net 10"
    ],
    "faqs": [
      {
        "q": "Toptal có phải là đối thủ cạnh tranh không?",
        "a": "Ở một phần của thị trường thì đúng vậy — công việc tri thức đã qua sàng lọc, từ xa, tính phí theo giờ. Nhưng riêng trong lĩnh vực tự động hóa công nghiệp — PLC, robot, thị giác máy, điện, với yêu cầu chứng chỉ và xác minh tại hiện trường — chúng tôi đang giải quyết một vấn đề mà chính trang web của Toptal không nhắm tới."
      },
      {
        "q": "Bên nào rẻ hơn?",
        "a": "Hai mức giá này không thể so sánh trực tiếp. Talengineer công bố mức phí 15% trên mỗi mốc đã giải ngân (5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên). Toptal công bố phí thuê bao cố định $79/tháng cộng mức phí theo giờ hỗn hợp đã bao gồm biên lợi nhuận của họ, nhưng không công bố tỷ lệ phần trăm họ giữ lại từ mức phí đó."
      },
      {
        "q": "Tôi có thể dùng cả hai không?",
        "a": "Có. Với nhiều đội ngũ sản xuất, điều đó có thể có nghĩa là dùng một chuyên gia Toptal cho công việc phần mềm hoặc quản lý dự án liên quan, và một kỹ sư Talengineer đã có chứng chỉ cho chính dự án tự động hóa tại hiện trường."
      }
    ]
  },
};

COMPARISONS.hi = {
  'staffing-agency': {
    label: 'स्टाफ़िंग एजेंसी के मुक़ाबले',
    metaTitle: 'ऑटोमेशन इंजीनियर के लिए स्टाफ़िंग एजेंसी चुनें या प्लेटफ़ॉर्म?',
    metaDesc: 'औद्योगिक ऑटोमेशन के काम में स्टाफ़िंग एजेंसी कब सही है, और माइलस्टोन आधारित प्लेटफ़ॉर्म हायरिंग कब बेहतर बैठती है।',
    question: 'ऑटोमेशन इंजीनियर हायर करने के लिए स्टाफ़िंग एजेंसी लें या प्लेटफ़ॉर्म?',
    answer: 'एजेंसी तब चुनें जब अगले हफ़्ते ही साइट पर कोई चाहिए, उस शहर में एजेंसी के पास पहले से लोग खाली हैं, और आपको ऐसा मार्कअप देने में दिक़्क़त नहीं जो आमतौर पर बताया नहीं जाता। Talengineer तब चुनें जब काम का स्कोप तय हो, वह किसी सीमा या भाषा को पार करता हो, या जब आपको असाइनमेंट से पहले यह प्रमाण चाहिए कि इंजीनियर वाक़ई यह कर सकता है। असली फ़र्क़ यह है कि जोखिम किसके पास रहता है: एजेंसी घंटों का बिल भेजती है और डिलीवरी का जोखिम आप उठाते हैं; Talengineer आपका पैसा माइलस्टोन एस्क्रो में रखता है और आपकी मंज़ूरी के बाद ही रिलीज़ करता है।',
    them: [
      'एजेंसी के पास स्थानीय स्तर पर जो उपलब्ध है, आमतौर पर एक ही भाषा में',
      'रिज़्यूमे स्क्रीनिंग और रिक्रूटर का अनुमान',
      'टाइम-एंड-मैटीरियल बिलिंग — माइलस्टोन पूरा हो या न हो, घंटों का भुगतान होता है',
      'टाइमशीट तो है, पर साइट पर मौजूदगी की स्वतंत्र जाँच नहीं',
      'इंजीनियर की दर के ऊपर लगा मार्कअप आमतौर पर नहीं बताया जाता',
    ],
    themWhen: [
      'कुछ ही दिनों में साइट पर कोई चाहिए, और उस शहर में एजेंसी के पास पहले से स्टाफ़ है',
      'काम लगातार चलने वाला मेंटेनेंस है, कोई अंत-तिथि वाला प्रोजेक्ट नहीं',
      'उस एजेंसी के साथ आपकी दर तय है और काम का रिश्ता बना हुआ है',
    ],
    usWhen: [
      'प्रोजेक्ट का स्कोप तय है और उसे माइलस्टोन में बाँटा जा सकता है',
      'काम सीमा या भाषा पार करता है — इंजीनियर, प्लांट और ख़रीदार एक ही देश में नहीं',
      'आप चाहते हैं कि क्षमता असाइनमेंट से पहले सत्यापित हो और भुगतान स्वीकृत काम से जुड़ा हो',
    ],
    faqs: [
      {
        q: 'क्या प्लेटफ़ॉर्म स्टाफ़िंग एजेंसी से सस्ता है?',
        a: 'आमतौर पर हाँ, क्योंकि फ़ीस बिल रेट में छिपी नहीं बल्कि घोषित होती है: Talengineer हर रिलीज़ हुए माइलस्टोन पर 15% लेता है (फ़ाउंडिंग क्लाइंट के पहले 5 ऑर्डर पर 5%)। पर ईमानदार तुलना फ़ीस बनाम फ़ीस की नहीं है — एजेंसी घंटे बेचती है, हम स्वीकृत माइलस्टोन बेचते हैं; आप जो ख़रीद रहे हैं वही अलग है।',
      },
      {
        q: 'कंप्लायंस और बीमा कौन देखता है?',
        a: 'इंजीनियर KYC पूरा करते हैं, और साइट वर्क से पहले W-9 तथा बीमा प्रमाणपत्र (COI) प्लेटफ़ॉर्म पर लिए और जाँचे जाते हैं। एजेंसी आमतौर पर कॉन्ट्रैक्टर को सीधे नियुक्त करती है और यह बोझ आपके लिए उठाती है — अगर आपको विशेष रूप से एम्प्लॉयर ऑफ़ रिकॉर्ड चाहिए, तो एजेंसी आसान रास्ता है।',
      },
      {
        q: 'अगर इंजीनियर सही काम न करे तो?',
        a: 'माइलस्टोन मंज़ूर मत कीजिए। पैसा एस्क्रो में रहता है, और आप 5 दिन की साक्ष्य अवधि वाला विवाद खोल सकते हैं जिसकी समीक्षा एडमिन करता है। आपके पहले प्रोजेक्ट का पहला माइलस्टोन मनी-बैक है।',
      },
    ],
  },
  'freelance-marketplace': {
    label: 'सामान्य फ्रीलांस मार्केटप्लेस के मुक़ाबले',
    metaTitle: 'सामान्य फ्रीलांस मार्केटप्लेस पर ऑटोमेशन इंजीनियर क्यों न लें?',
    metaDesc: 'सामान्य मार्केटप्लेस बड़े और सस्ते हैं। औद्योगिक ऑटोमेशन में जो कमी है वह है सत्यापन — असाइनमेंट से पहले प्रमाणन और साइट पर साक्ष्य।',
    question: 'सामान्य फ्रीलांस मार्केटप्लेस पर ही ऑटोमेशन इंजीनियर क्यों न हायर करें?',
    answer: 'रिमोट, कम जोखिम वाले काम के लिए किसी को ढूँढ़ने का सामान्य मार्केटप्लेस एक वाजिब तरीक़ा है, और वहाँ खोजना सस्ता भी पड़ता है। जो वह नहीं बता सकता वह यह है कि कोई PLC इंजीनियर वाक़ई आपकी लाइन कमीशन कर पाएगा या नहीं — वहाँ क्षमता स्व-घोषित होती है और सिर्फ़ बाद में क्लाइंट रिव्यू से पता चलती है। Talengineer जानबूझकर संकरा है: हर इंजीनियर साइनअप पर व्यावहारिक तकनीकी मूल्यांकन पास करता है, असाइन होने से पहले L1–L3 प्लेटफ़ॉर्म प्रमाणन ज़रूरी है, और साइट वर्क के पीछे GPS चेक-इन तथा फ़ोटो QC होता है। जब एक ख़राब कमीशनिंग आपको कई दिन की लाइन डाउनटाइम में डाल दे, तब यही सत्यापन असली उत्पाद है।',
    them: [
      'बहुत बड़ा और ज़्यादातर रिमोट या सॉफ़्टवेयर वाला; औद्योगिक ऑटोमेशन उसमें बहुत पतली परत है',
      'स्व-घोषित स्किल और बैज, बाद में क्लाइंट रिव्यू से पुष्टि',
      'घंटे या फ़िक्स्ड-प्राइस एस्क्रो; स्कोप विवाद मामले-दर-मामले निपटते हैं',
      'रिमोट काम के लिए बना है — साइट सत्यापन की कोई परत नहीं',
      'प्लेटफ़ॉर्म फ़ीस घोषित है, पर इंजीनियर की गुणवत्ता में भारी अंतर रहता है',
    ],
    themWhen: [
      'काम पूरी तरह रिमोट है — एक छोटी HMI स्क्रीन, एक रिपोर्ट, एक बार का स्क्रिप्ट',
      'बजट इतना छोटा है कि ग़लत आदमी चुनने पर घंटे बर्बाद हों, दिनों की डाउनटाइम नहीं',
      'आपके पास ख़ुद इंजीनियर को परखने की तकनीकी क्षमता है',
    ],
    usWhen: [
      'किसी को वाक़ई प्लांट पर होना है, और आपको प्रमाण चाहिए कि वह था',
      'आप ख़ुद यह नहीं आँक सकते कि इंजीनियर Siemens या Rockwell कितना जानता है',
      'कमीशनिंग फेल होने का मतलब उत्पादन ठप, सिर्फ़ एक बेकार इनवॉइस नहीं',
    ],
    faqs: [
      {
        q: 'क्या सामान्य मार्केटप्लेस में एस्क्रो नहीं होता?',
        a: 'होता है — फ़िक्स्ड-प्राइस एस्क्रो वहाँ आम है, इसलिए एस्क्रो अपने आप में फ़र्क़ नहीं। फ़र्क़ यह है कि इंजीनियर के असाइन होने से पहले क्या सच होना ज़रूरी है: Talengineer पर उसके पास प्लेटफ़ॉर्म प्रमाणन होना चाहिए, और साइट वर्क में GPS तथा फ़ोटो साक्ष्य जुड़ता है।',
      },
      {
        q: 'क्या आपका इंजीनियर पूल छोटा है?',
        a: 'काफ़ी छोटा है, और जानबूझकर। हर लिस्टेड इंजीनियर ने व्यावहारिक AI तकनीकी मूल्यांकन पास किया है, और सिर्फ़ प्रमाणित इंजीनियर ही प्रोजेक्ट पर असाइन हो सकते हैं। हम पाँच सौ प्रोफ़ाइल छाँटने को देने के बजाय पाँच ऐसे इंजीनियर देना पसंद करेंगे जो काम कर सकें।',
      },
      {
        q: 'क्या मैं फिर भी किसी छोटे रिमोट काम के लिए हायर कर सकता हूँ?',
        a: 'कर सकते हैं, पर शायद आप उस सत्यापन के लिए ज़्यादा दे रहे हैं जिसकी ज़रूरत नहीं। छोटे-तेज़ रिमोट काम के लिए सामान्य मार्केटप्लेस ज़्यादा व्यावहारिक है — हम उन कामों के लिए बने हैं जहाँ ग़लती महँगी पड़ती है।',
      },
    ],
  },
  'direct-hire': {
    label: 'फ़ुल-टाइम हायरिंग के मुक़ाबले',
    metaTitle: 'ऑटोमेशन इंजीनियर फ़ुल-टाइम रखें या प्लेटफ़ॉर्म से प्रोजेक्ट पर लें?',
    metaDesc: 'लगातार चलने वाले कंट्रोल्स काम के लिए फ़ुल-टाइम ठीक है। प्रोजेक्ट वाले काम में शुरू होने का समय और ख़ाली क्षमता निर्णायक होती है।',
    question: 'ऑटोमेशन इंजीनियर फ़ुल-टाइम रखूँ या प्लेटफ़ॉर्म के ज़रिए प्रोजेक्ट पर लूँ?',
    answer: 'फ़ुल-टाइम तब रखिए जब काम लगातार चले — पूरे साल कंट्रोल्स का काम रहने वाला प्लांट, जहाँ इन-हाउस इंजीनियर आपकी मशीनों की समझ जमा करता जाए। प्लेटफ़ॉर्म से तब लीजिए जब काम प्रोजेक्ट के आकार का हो: एक रेट्रोफ़िट, एक कमीशनिंग विंडो, एक लाइन शिफ़्ट। निर्णायक बात आमतौर पर समय और ख़ाली क्षमता होती है: अमेरिका में कंट्रोल्स की एक पोज़िशन भरने में किसी के जॉइन करने से पहले लगभग दो महीने की भर्ती लगती है, और रखने के बाद सैलरी, बेनिफ़िट और प्रोजेक्टों के बीच का ख़ालीपन आपके ऊपर रहता है। प्लेटफ़ॉर्म पर काम कुछ दिनों में शुरू होता है और आप सिर्फ़ उन्हीं माइलस्टोन का भुगतान करते हैं जिन्हें आप फंड करते हैं।',
    them: [
      'आपके स्थानीय श्रम बाज़ार में जो आवेदन करे, आने-जाने की दूरी के भीतर',
      'इंटरव्यू और रेफ़रेंस — और ग़लत चुनाव की क़ीमत आपकी',
      'सैलरी, बेनिफ़िट और पेरोल टैक्स, प्रोजेक्ट चले या न चले, देना ही है',
      'वे सीधे आपके लिए काम करते हैं, इसलिए सत्यापन अलग समस्या नहीं',
      'पूरी तरह पारदर्शी — यह आपकी अपनी पेरोल है',
    ],
    themWhen: [
      'साल भर कंट्रोल्स का काम है, कोई अंत-तिथि वाला प्रोजेक्ट नहीं',
      'ज्ञान इन-हाउस जमा करने लायक़ है — आपकी मशीनें, आपका इतिहास, आपकी ख़ास आदतें',
      'आपको ऐसा व्यक्ति चाहिए जो किसी भी समय लाइन रुकने पर आ सके',
    ],
    usWhen: [
      'काम अंत वाला प्रोजेक्ट है: रेट्रोफ़िट, कमीशनिंग, लाइन शिफ़्ट',
      'ऐसी विशेषज्ञता चाहिए जिसे आप कभी फ़ुल-टाइम नहीं रखेंगे — मशीन विज़न, कोई ख़ास रोबोट ब्रांड',
      'साइट दूसरे देश में है और वहाँ हायर करने के लिए पहले एंटिटी खोलनी पड़ेगी',
    ],
    faqs: [
      {
        q: 'इंजीनियर असल में कितनी जल्दी शुरू कर सकता है?',
        a: 'पोस्ट करने के लगभग 48 घंटे में मैचिंग हो जाती है; शुरू होने की तारीख़ इंजीनियर की उपलब्धता और साइट एक्सेस या वीज़ा शर्तों पर निर्भर करती है। इसकी तुलना अमेरिका में कंट्रोल्स की पोज़िशन भरने की लगभग दो महीने की भर्ती से कीजिए।',
      },
      {
        q: 'क्या कॉन्ट्रैक्ट इंजीनियर फ़ुल-टाइम कर्मचारी बन सकता है?',
        a: 'हाँ। कन्वर्ज़न पर कोई प्लेसमेंट फ़ीस नहीं — प्लेटफ़ॉर्म फ़ीस एस्क्रो किए गए माइलस्टोन पर लगती है, आपके हायरिंग फ़ैसलों पर नहीं।',
      },
      {
        q: 'ज्ञान इन-हाउस रहने का क्या?',
        a: 'यह फ़ुल-टाइम रखने का असली फ़ायदा है और हम इससे इनकार नहीं करेंगे। प्रोजेक्ट डॉक्युमेंटेशन, चेक-इन फ़ोटो और QC रिकॉर्ड प्रोजेक्ट बंद होने के बाद भी आपके अकाउंट में रहते हैं, पर वे उस व्यक्ति की जगह नहीं ले सकते जिसने तीन साल आपका प्लांट चलाया हो।',
      },
    ],
  },
  'automate-america': {
    label: 'Automate America के मुक़ाबले',
    metaTitle: 'Talengineer बनाम Automate America — आपके प्रोजेक्ट के लिए कौन सही?',
    metaDesc: 'Automate America अमेरिका में घंटे के आधार पर ऑटोमेशन स्टाफ़िंग के लिए बना है। Talengineer सीमा-पार, प्रमाणन-आधारित, माइलस्टोन एस्क्रो प्रोजेक्ट डिलीवरी के लिए।',
    question: 'Talengineer बनाम Automate America: आपके प्रोजेक्ट के लिए कौन सही है?',
    answer: 'अगर आपको अमेरिका-आधारित ऑटोमेशन कॉन्ट्रैक्टर चाहिए जिनका बिल घंटे के हिसाब से बने, डिजिटल टाइमशीट और तेज़ भुगतान के साथ, तो Automate America सही बैठता है — वह इसी के लिए बना है और वहाँ जमा हुआ है। Talengineer एक अलग आकार के काम के लिए बना है: नौ भाषाओं में चलने वाले सीमा-पार प्रोजेक्ट, ऐसे इंजीनियर जिन्हें किसी भी काम पर असाइन होने से पहले प्लेटफ़ॉर्म प्रमाणन पास करना होता है, और माइलस्टोन एस्क्रो जहाँ आपका पैसा आपकी मंज़ूरी के बाद ही रिलीज़ होता है। अगर आपका काम अमेरिका-स्थानीय, घंटे-आधारित स्टाफ़िंग है, तो वे बेहतर हैं। अगर तय स्कोप वाला प्रोजेक्ट है — ख़ासकर सीमा पार — तो सत्यापन और भुगतान मॉडल ही हमारा फ़र्क़ है।',
    them: [
      'उत्तरी अमेरिका, अंग्रेज़ी में',
      'उनके अपने शब्दों में: सत्यापित प्रोफ़ाइल, दर्ज कार्य-इतिहास और पिछले ग्राहकों के रिव्यू; प्लेटफ़ॉर्म द्वारा संचालित कोई प्रमाणन परीक्षा प्रकाशित नहीं मिली',
      'घंटे के हिसाब से टाइम-एंड-मैटीरियल। उनके अपने विवरण के अनुसार, कॉन्ट्रैक्ट मार्केटप्लेस पर दिखाने से पहले प्लेटफ़ॉर्म घंटे की दर का एक प्रतिशत ले लेता है; वह प्रतिशत प्रकाशित नहीं है',
      'ग्राहक अनुमोदन वर्कफ़्लो के साथ डिजिटल टाइमशीट; लोकेशन सत्यापन प्रकाशित नहीं मिला',
      'सभी पक्षों के लिए जुड़ना मुफ़्त, कोई सब्सक्रिप्शन नहीं; पर जो प्रतिशत लिया जाता है वह प्रकाशित नहीं',
    ],
    themWhen: [
      'आपको अमेरिका-आधारित कॉन्ट्रैक्टर चाहिए, घंटे के बिल पर, जितनी जल्दी हो सके',
      'आप चाहते हैं कि प्लेटफ़ॉर्म इनवॉइसिंग, पेरोल, बेनिफ़िट और कंप्लायंस सँभाले (उनकी मैनेज्ड सर्विस)',
      'आप बाद में कॉन्ट्रैक्टर को फ़ुल-टाइम कर्मचारी बनाना चाहते हैं',
    ],
    usWhen: [
      'प्रोजेक्ट सीमा या भाषा पार करता है — मैक्सिको, वियतनाम या थाईलैंड का प्लांट और ख़रीदार कहीं और',
      'आप चाहते हैं कि क्षमता असाइनमेंट से पहले प्रमाणन परीक्षा से सिद्ध हो, बाद के रिव्यू से नहीं',
      'आप चाहते हैं कि पैसा एस्क्रो में रहे और स्वीकृत माइलस्टोन पर रिलीज़ हो, पहला माइलस्टोन मनी-बैक के साथ',
    ],
    faqs: [
      {
        q: 'क्या Automate America प्रतिस्पर्धी है?',
        a: 'बाज़ार के एक हिस्से में हाँ — अमेरिका-स्थानीय ऑटोमेशन कॉन्ट्रैक्टिंग में। सीमा-पार प्रोजेक्ट डिलीवरी, नौ-भाषा समन्वय, प्रमाणन-आधारित असाइनमेंट और माइलस्टोन एस्क्रो में हम एक अलग समस्या हल कर रहे हैं।',
      },
      {
        q: 'कौन सस्ता है?',
        a: 'दोनों की दर-दर-दर तुलना नहीं हो सकती, क्योंकि फ़ीस मॉडल अलग हैं। Talengineer हर रिलीज़ माइलस्टोन पर 15% घोषित करता है (फ़ाउंडिंग क्लाइंट के पहले 5 ऑर्डर पर 5%)। Automate America बताता है कि कॉन्ट्रैक्ट मार्केटप्लेस पहुँचने से पहले वह घंटे की दर का एक प्रतिशत लेता है, और वह प्रतिशत प्रकाशित नहीं करता।',
      },
      {
        q: 'क्या मैं दोनों इस्तेमाल कर सकता हूँ?',
        a: 'हाँ, और कई निर्माताओं के लिए यही समझदारी है — लगातार सपोर्ट के लिए अमेरिका-स्थानीय घंटे-आधारित कॉन्ट्रैक्टर, और विदेश में प्लांट बनाने या रेट्रोफ़िट के लिए तय स्कोप वाला एस्क्रो प्रोजेक्ट।',
      },
    ],
  },
  'field-nation': {
    "label": "बनाम Field Nation",
    "metaTitle": "Talengineer बनाम Field Nation — आपके प्रोजेक्ट के लिए कौन सही है?",
    "metaDesc": "Field Nation अमेरिका-केंद्रित मार्केटप्लेस है, जो ऑन-साइट IT फील्ड सर्विस तकनीशियनों को हर वर्क ऑर्डर के हिसाब से बिल करता है। Talengineer क्रॉस-बॉर्डर, सर्टिफिकेशन-आधारित इंडस्ट्रियल ऑटोमेशन प्रोजेक्ट्स के लिए बनाया गया है, जिसमें माइलस्टोन एस्क्रो होता है।",
    "question": "Talengineer बनाम Field Nation: आपके प्रोजेक्ट के लिए कौन सही है?",
    "answer": "अगर आपको अमेरिका-केंद्रित, ऑन-साइट IT फील्ड सर्विस तकनीशियन चाहिए — नेटवर्किंग, केबलिंग, पॉइंट-ऑफ़-सेल, डिजिटल साइनेज, सिक्योरिटी इंस्टॉल — जो एक बहुत बड़े मौजूदा पूल से तेज़ी से भेजे जा सकें (हर साल 10 लाख से ज़्यादा वर्क ऑर्डर, 6 लाख+ साइट्स पर), और जहाँ एक सरल, सार्वजनिक रूप से बताई गई 10% फ़ीस तकनीशियन के हिस्से से ली जाती हो, तो Field Nation अच्छा विकल्प है। Talengineer एक अलग तरह के काम के लिए बनाया गया है: प्रमाणित इंडस्ट्रियल ऑटोमेशन इंजीनियर — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल — जो अमेरिका, मेक्सिको, वियतनाम, थाईलैंड और चीन में, नौ भाषाओं में काम करते हैं, जहाँ किसी को असाइन किए जाने से पहले प्लेटफ़ॉर्म सर्टिफिकेशन परीक्षा पास करना ज़रूरी है — सिर्फ़ प्रोफ़ाइल, रिव्यू और एक वैकल्पिक बैकग्राउंड चेक नहीं — और आपका पैसा माइलस्टोन एस्क्रो में रहता है, जो सिर्फ़ आपके काम को अप्रूव करने के बाद रिलीज़ होता है, न कि साप्ताहिक पेमेंट-टर्म्स साइकल में तकनीशियन को दिया जाता है। अगर आपका काम वर्क ऑर्डर के हिसाब से बिल होने वाली अमेरिका-लोकल IT फील्ड सर्विस है, तो Field Nation बेहतर विकल्प है। अगर यह एक तय-दायरे वाला ऑटोमेशन प्रोजेक्ट है — खासकर कोई ऐसा जो किसी सीमा को पार करता हो, या जिसमें आप असाइनमेंट से पहले क्षमता साबित होते देखना चाहते हों, न कि बाद में — तो वेरिफ़िकेशन और पेमेंट मॉडल में हम अलग हैं।",
    "them": [
      "अमेरिका-केंद्रित — इसके अपने पेज अमेरिका के राज्य और ZIP कोड के हिसाब से कवरेज बताते हैं, कभी-कभार उत्तरी अमेरिका/कनाडा का ज़िक्र होता है ('अमेरिका और कनाडा में'); कोई अंतरराष्ट्रीय या ग्लोबल कवरेज होने का दावा नहीं किया गया है। तकनीशियन IT/ऑन-साइट स्पेशलिटी में काम करते हैं — नेटवर्किंग, केबलिंग, पॉइंट-ऑफ़-सेल, डिजिटल साइनेज, कंप्यूटर और प्रिंटर, सिक्योरिटी — न कि इंडस्ट्रियल ऑटोमेशन में।",
      "खुद बताई गई प्रोफ़ाइलें (स्किल्स, सर्टिफिकेशन, वर्क हिस्ट्री), बायर रेटिंग/रिव्यू, और एक प्रोप्राइटरी 'Provider Match' रैंकिंग एल्गोरिद्म के साथ एक 'Success Score'। बैकग्राउंड चेक और ड्रग टेस्ट (एक थर्ड-पार्टी पार्टनर के ज़रिए किए जाते हैं) सिर्फ़ उन वर्क ऑर्डर्स पर ज़रूरी होते हैं जहाँ इनकी माँग हो — इनके अपने आँकड़ों के मुताबिक़ 76% ऑर्डर्स पर — हर काम पर नहीं, और इसकी अपनी साइट पर प्लेटफ़ॉर्म द्वारा चलाई जाने वाली किसी सर्टिफिकेशन परीक्षा का ज़िक्र नहीं है।",
      "माइलस्टोन एस्क्रो नहीं है। खरीदार या तो Field Nation अकाउंट को प्रीफ़ंड करते हैं — जो, इसके अपने बायर टर्म्स के अनुसार, अन्य खरीदारों के फंड के साथ मिली-जुली एक ही कस्टोडियल अकाउंट में रखा जाता है — या net 7/14/21/28-दिन के पेमेंट टर्म्स इस्तेमाल करते हैं; तकनीशियनों को साप्ताहिक साइकल में तभी भुगतान मिलता है जब खरीदार का पेमेंट प्रोसेस हो जाए, इसलिए पेमेंट-टर्म्स वाले काम में तकनीशियन तब तक खरीदार के न भुगतान करने का जोखिम उठाता है। कैलिफ़ोर्निया के खरीदारों को मार्च 2021 से प्रीफ़ंडिंग करने से रोक दिया गया है और उन्हें काम अप्रूव करने के बाद ही भुगतान करना होता है।",
      "एक चेक-इन/चेक-आउट स्टेप, ऐप के अंदर उस खास वर्क ऑर्डर से जुड़ी फ़ोटो डॉक्यूमेंटेशन, और जॉब साइट पर इलेक्ट्रॉनिक सिग्नेचर कैप्चर। GPS को जॉब खोजने और माइलेज ट्रैकिंग के लिए इस्तेमाल होने वाला बताया गया है; चेक-इन खुद GPS से वेरिफ़ाई होता है या नहीं, यह इसके पब्लिक पेजों पर नहीं बताया गया है — प्रकाशित नहीं है।",
      "तकनीशियन-साइड की फ़ीस पब्लिश की गई और सरल है: वर्क ऑर्डर की अंतिम पेमेंट राशि का फ़्लैट 10%, या इसके वैकल्पिक Pro टियर पर 13.9% (10% बेस प्लस 3.9% ऐड-ऑन), साथ ही वैकल्पिक इंश्योरेंस ऐड-ऑन (प्लेटफ़ॉर्म जनरल-लायबिलिटी कवरेज के लिए 1.95%, ऑक्युपेशनल एक्सीडेंट इंश्योरेंस के लिए 1% या 0.5%)। यह खरीदारों/कंपनियों से क्या चार्ज करता है, यह पब्लिश नहीं किया गया है — प्लान्स को सब्सक्रिप्शन-बेस्ड बताया गया है, जिनकी कीमत सिर्फ़ सेल्स से संपर्क करने पर मिलती है।"
    ],
    "themWhen": [
      "आपको अमेरिका या उत्तरी अमेरिका-लोकल IT फील्ड सर्विस चाहिए — नेटवर्किंग, केबलिंग, POS, डिजिटल साइनेज, सिक्योरिटी कैमरा इंस्टॉल — न कि इंडस्ट्रियल ऑटोमेशन।",
      "आप पहले से मौजूद एक बहुत बड़े तकनीशियन पूल (हर साल 10 लाख+ वर्क ऑर्डर, 6 लाख+ साइट्स) तक पहुँच चाहते हैं, और असाइनमेंट से पहले सर्टिफिकेशन परीक्षा से क्षमता साबित करने से ज़्यादा आपके लिए स्पीड मायने रखती है।",
      "खरीदार के तौर पर, आप वर्क ऑर्डर की फ़ेस वैल्यू चुकाना चाहते हैं, बिना किसी अलग प्लेटफ़ॉर्म-फ़ीस लाइन आइटम के — Field Nation का हिस्सा तकनीशियन के पेआउट से काटा जाता है, आपसे चार्ज नहीं किया जाता।"
    ],
    "usWhen": [
      "प्रोजेक्ट किसी सीमा या भाषा को पार करता है — जैसे मेक्सिको, वियतनाम या थाईलैंड में कोई प्लांट हो और खरीदार कहीं और हो — जो Field Nation के अमेरिका/उत्तरी अमेरिका-केंद्रित नेटवर्क के दायरे से बाहर है।",
      "आप चाहते हैं कि असाइनमेंट से पहले सर्टिफिकेशन परीक्षा के ज़रिए क्षमता साबित हो, न कि सिर्फ़ खुद बताई गई प्रोफ़ाइल, रिव्यू और एक वैकल्पिक, काम पर निर्भर बैकग्राउंड चेक के ज़रिए।",
      "आप चाहते हैं कि आपका पैसा माइलस्टोन एस्क्रो में रखा जाए और सिर्फ़ आपके काम को अप्रूव करने के बाद रिलीज़ हो, न कि साप्ताहिक पेमेंट-टर्म्स साइकल में, जहाँ फंड क्लियर होने तक तकनीशियन को आपके न भुगतान करने का जोखिम उठाना पड़े।"
    ],
    "faqs": [
      {
        "q": "क्या Field Nation एक प्रतिस्पर्धी है?",
        "a": "IT फील्ड सर्विस डिस्पैच में — नेटवर्किंग, केबलिंग, POS, सिक्योरिटी इंस्टॉल, वर्क ऑर्डर के हिसाब से बिल किया गया — हाँ। लेकिन सर्टिफिकेशन-आधारित इंडस्ट्रियल ऑटोमेशन प्रोजेक्ट्स में, जिनमें माइलस्टोन एस्क्रो और क्रॉस-बॉर्डर, बहुभाषी डिलीवरी हो, वहाँ हम एक अलग समस्या हल कर रहे हैं।"
      },
      {
        "q": "कौन सस्ता है?",
        "a": "इन्हें रेट-टू-रेट कंपेयर नहीं किया जा सकता — फ़ीस अलग-अलग पक्षों से ली जाती है। Field Nation तकनीशियन के पेआउट से फ़्लैट 10% काटता है (इसके वैकल्पिक Pro टियर पर 13.9%), और यह पब्लिश नहीं करता कि वह खरीदारों से वर्क ऑर्डर की फ़ेस वैल्यू के अलावा कुछ चार्ज करता है या नहीं; बायर प्लान्स सब्सक्रिप्शन-बेस्ड हैं और सेल्स के ज़रिए कोट किए जाते हैं। Talengineer अपनी फ़ीस सीधे खरीदार को पब्लिश करता है: हर रिलीज़ हुए माइलस्टोन का 15% (फ़ाउंडिंग क्लाइंट्स के लिए उनके पहले 5 ऑर्डर्स पर 5%), जो कमिट करने से पहले ही दिखा दिया जाता है।"
      },
      {
        "q": "क्या मैं दोनों इस्तेमाल कर सकता हूँ?",
        "a": "हाँ — कई कंपनियों के लिए यही व्यावहारिक बँटवारा है: अमेरिका-लोकल IT/ऑन-साइट तकनीशियन डिस्पैच के लिए Field Nation, और एक प्रमाणित, एस्क्रो-प्रोटेक्टेड ऑटोमेशन प्रोजेक्ट के लिए Talengineer, खासकर जब वह किसी सीमा को पार करता हो।"
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer बनाम WorkMarket — आपके प्रोजेक्ट के लिए कौन सही है?",
    "metaDesc": "WorkMarket (ADP द्वारा संचालित) एक केवल-अमेरिका प्लेटफ़ॉर्म है जो बड़ी संख्या में 1099 कॉन्ट्रैक्टरों को मैनेज करने के लिए बना है। Talengineer क्रॉस-बॉर्डर, सर्टिफिकेशन-गेटेड, माइलस्टोन-एस्क्रो ऑटोमेशन प्रोजेक्ट्स के लिए बनाया गया है।",
    "question": "Talengineer बनाम WorkMarket: आपके प्रोजेक्ट के लिए कौन सही है?",
    "answer": "ADP के स्वामित्व वाला WorkMarket उन अमेरिकी कंपनियों के लिए बनाया गया है जो 1099 कॉन्ट्रैक्टरों का एक बड़ा मौजूदा पूल चलाती हैं — बल्क ऑनबोर्डिंग, हर जॉब कैटेगरी के हिसाब से सेट की गई बैकग्राउंड चेक और स्किल टेस्ट, ऑटोमेटेड 1099-NEC टैक्स फाइलिंग, और IT फील्ड सर्विस, कूरियर व सिक्योरिटी जैसी कैटेगरी में तेज़ पेआउट। इसकी अपनी सेवा शर्तें (Terms of Service) स्पष्ट कहती हैं कि यह प्लेटफ़ॉर्म 'अमेरिका से बाहर स्थित क्लाइंट्स के उपयोग के लिए नहीं है', और इसका प्रकाशित एकमात्र फ़ीस आँकड़ा वर्कर के लिए एक वैकल्पिक 2.5% अर्ली-पेमेंट चार्ज है — क्लाइंट-साइड की मानक प्लेटफ़ॉर्म फ़ीस हर असाइनमेंट के हिसाब से तय होती है और सार्वजनिक नहीं की जाती। Talengineer एक अलग तरह के काम के लिए बना है: एक स्पष्ट रूप से परिभाषित दायरे वाला औद्योगिक ऑटोमेशन प्रोजेक्ट, जो अक्सर सीमा पार होता है, जहाँ इंजीनियर को किसी भी काम पर लगाए जाने से पहले प्लेटफ़ॉर्म सर्टिफिकेशन (platform certification) हासिल करना ज़रूरी है, और आपका पैसा माइलस्टोन एस्क्रो (milestone escrow) में रहता है, जो आपकी मंज़ूरी के बाद ही रिलीज़ होता है। अगर आप बड़े पैमाने पर घरेलू कॉन्टिन्जेंट वर्कफ़ोर्स को मैनेज कर रहे हैं, तो उसके लिए WorkMarket के टूल्स ज़्यादा परिपक्व हैं। अगर आपका काम PLC, रोबोटिक्स या मशीन-विज़न प्रोजेक्ट है जिसे पहले से सत्यापित क्षमता और पेमेंट सुरक्षा चाहिए, तो हमने Talengineer इसी के लिए बनाया है।",
    "them": [
      "सिर्फ़ अमेरिकी क्लाइंट्स। इसकी सेवा शर्तें कहती हैं कि प्लेटफ़ॉर्म 'अमेरिका से बाहर स्थित क्लाइंट्स के उपयोग के लिए नहीं है', और WorkMarket के एक बिज़नेस पेज पर लिखा है कि यह 'फ़िलहाल सिर्फ़ उन बिज़नेस को सपोर्ट करता है जिनकी अमेरिका में कोई एंटिटी हो'। कॉन्ट्रैक्टर पेआउट के बारे में कहा गया है कि वे 'दुनिया में लगभग कहीं भी' पहुँच सकते हैं, लेकिन प्लेटफ़ॉर्म पर कौन खरीद सकता है, यह सिर्फ़ अमेरिका तक सीमित है।",
      "बैकग्राउंड चेक और ड्रग टेस्ट एक थर्ड-पार्टी कंज़्यूमर रिपोर्टिंग एजेंसी के ज़रिए होते हैं (जो वर्कर की अपनी लिखित सहमति से शुरू होते हैं), इसके साथ लाइसेंस/सर्टिफिकेशन चेक, टैक्स ID/बैंक वेरिफिकेशन, और 'वर्कर स्किल्स आँकने के लिए कस्टमाइज़ेबल टेस्ट' भी होते हैं जिन्हें क्लाइंट अपने खुद के 'Labor Clouds' के ज़रिए हर जॉब कैटेगरी के लिए सेट करता है। किसी वर्कर को असाइन किए जाने से पहले प्लेटफ़ॉर्म द्वारा संचालित किसी सर्टिफिकेशन एग्ज़ाम को अनिवार्य शर्त के रूप में प्रकाशित नहीं किया गया है।",
      "हर असाइनमेंट पर टाइम-एंड-मटीरियल्स आधारित भुगतान: क्लाइंट एक असाइनमेंट वैल्यू (Assignment Value) पोस्ट करता है, और इसकी शर्तों के अनुसार, क्लाइंट 'इंडिपेंडेंट वर्कर को किसी असाइनमेंट के लिए तब भुगतान करने के लिए बाध्य है जब वह असाइनमेंट एक अप्रूव्ड असाइनमेंट (Approved Assignment) बन जाता है' — यानी जब क्लाइंट उसे पूरा हुआ मार्क कर देता है। इसकी शर्तों में कहीं भी किसी एस्क्रो व्यवस्था का ज़िक्र नहीं है, और एक बार चार्ज हो जाने के बाद, 'वह चार्ज या डेबिट नॉन-रिफंडेबल है, सिवाय उस हद तक जहाँ लागू कानून इसे प्रतिबंधित करता हो'।",
      "एक वर्कर मोबाइल ऐप जिसमें चेक-इन/चेक-आउट, जियोफ़ेंसिंग (जिसका ज़िक्र इसके IT फील्ड-सर्विसेज़ पेज पर खासतौर से किया गया है), डिलिवरेबल्स के रूप में फ़ोटो और डॉक्यूमेंट अपलोड, और ई-सिग्नेचर कलेक्शन शामिल है।",
      "मानक क्लाइंट-साइड 'प्लेटफ़ॉर्म फ़ीस' हर असाइनमेंट के हिसाब से तय होती है, और इसकी शर्तें कहती हैं कि 'WorkMarket को किसी भी समय प्लेटफ़ॉर्म फ़ीस बदलने का अधिकार है' — खुद प्रतिशत आँकड़ा प्रकाशित नहीं किया जाता। इसकी शर्तों में बताया गया एकमात्र फ़ीस आँकड़ा वर्कर के लिए फंड्स तक वैकल्पिक अर्ली एक्सेस (FastFunds) पर लगने वाला 2.5% चार्ज है; बाकी मानक प्राइसिंग के लिए सेल्स टीम से कोटेशन माँगना पड़ता है।"
    ],
    "themWhen": [
      "आप एक अमेरिकी कंपनी हैं जो कई जॉब कैटेगरी में — IT फील्ड टेक, कूरियर, ड्राइवर, सिक्योरिटी, इंटरप्रेटर — 1099 कॉन्ट्रैक्टरों का एक बड़ा मौजूदा पूल मैनेज करती है, और जिसे बल्क ऑनबोर्डिंग के साथ-साथ ऑटोमेटेड 1099-NEC टैक्स फाइलिंग चाहिए।",
      "आप हर जॉब कैटेगरी के लिए खुद की वेटिंग रूल्स तय करना चाहते हैं — बैकग्राउंड चेक, ड्रग टेस्ट, कस्टम स्किल टेस्ट — न कि असाइनमेंट से पहले पहले से जारी किए गए प्लेटफ़ॉर्म सर्टिफिकेशन की माँग करना।",
      "आपको बड़ी संख्या में छोटे टाइम-एंड-मटीरियल्स वर्क ऑर्डर्स पर तेज़, लचीला वर्कर पेआउट (ACH, पे कार्ड, PayPal, वैकल्पिक अर्ली फंड एक्सेस) चाहिए।"
    ],
    "usWhen": [
      "प्रोजेक्ट सीमा पार करता है — WorkMarket की अपनी शर्तें प्लेटफ़ॉर्म को सिर्फ़ अमेरिका-आधारित क्लाइंट्स तक सीमित करती हैं; हमारे इंजीनियर अमेरिका, मेक्सिको, वियतनाम, थाईलैंड और चीन में नौ भाषाओं में काम करते हैं।",
      "आप चाहते हैं कि क्षमता को असाइनमेंट से पहले एक अनिवार्य सर्टिफिकेशन एग्ज़ाम से साबित किया जाए, न कि वर्कर के पहले से पूल में होने के बाद लगाए गए बैकग्राउंड चेक और क्लाइंट-कॉन्फ़िगर्ड टेस्ट से।",
      "आप चाहते हैं कि फंड्स एस्क्रो में रखे जाएँ और हर माइलस्टोन को आपकी मंज़ूरी मिलने के बाद ही रिलीज़ हों, जिसमें पहला माइलस्टोन मनी-बैक हो — न कि पे-ऑन-अप्रूवल मॉडल जहाँ चार्ज एक बार लगने के बाद नॉन-रिफंडेबल हो जाता है।"
    ],
    "faqs": [
      {
        "q": "क्या WorkMarket एक प्रतिस्पर्धी है?",
        "a": "मार्केट के एक हिस्से में, हाँ — बड़े पैमाने पर अमेरिकी घरेलू कॉन्टिन्जेंट वर्कफ़ोर्स मैनेजमेंट में। लेकिन क्रॉस-बॉर्डर प्रोजेक्ट डिलीवरी, सर्टिफिकेशन-गेटेड असाइनमेंट और माइलस्टोन एस्क्रो में, हम एक अलग समस्या हल कर रहे हैं।"
      },
      {
        "q": "कौन सस्ता है?",
        "a": "इन दोनों की सीधी तुलना नहीं की जा सकती, क्योंकि WorkMarket अपनी मानक प्लेटफ़ॉर्म फ़ीस प्रकाशित नहीं करता — इसकी शर्तों में सिर्फ़ वर्कर के लिए अर्ली पेमेंट एक्सेस (FastFunds) पर लगने वाला एक वैकल्पिक 2.5% चार्ज बताया गया है। Talengineer अपनी फ़ीस पहले से साफ़ बताता है: हर रिलीज़ हुए माइलस्टोन पर 15%, और फाउंडिंग क्लाइंट्स के लिए पहले 5 ऑर्डर पर 5%।"
      },
      {
        "q": "क्या मैं दोनों इस्तेमाल कर सकता हूँ?",
        "a": "हाँ। कई मैन्युफ़ैक्चरर अपने बड़े अमेरिका-आधारित फील्ड-सर्विस या IT कॉन्ट्रैक्टर पूल के लिए WorkMarket जैसा प्लेटफ़ॉर्म चलाते हैं, और अलग से Talengineer का इस्तेमाल किसी स्पष्ट रूप से परिभाषित दायरे वाले ऑटोमेशन प्रोजेक्ट के लिए करते हैं — खासकर ऐसे प्रोजेक्ट के लिए जो सीमा पार करता हो और जिसे एस्क्रो किए गए माइलस्टोन के साथ सर्टिफाइड क्षमता चाहिए।"
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer बनाम Upwork — आपके प्रोजेक्ट के लिए कौन सही है?",
    "metaDesc": "Upwork एक जनरल-पर्पस ग्लोबल फ्रीलांस मार्केटप्लेस है जो हज़ारों स्किल्स को कवर करता है। Talengineer सर्टिफिकेशन-गेटेड, माइलस्टोन एस्क्रो वाले इंडस्ट्रियल ऑटोमेशन प्रोजेक्ट्स के लिए बनाया गया है, जिसमें ऑन-साइट वेरिफिकेशन शामिल है।",
    "question": "Talengineer बनाम Upwork: आपके प्रोजेक्ट के लिए कौन सही है?",
    "answer": "अगर आपको लगभग किसी भी तरह के रिमोट वर्क के लिए हायर करना है, सिर्फ़ ऑटोमेशन इंजीनियरिंग के लिए नहीं, तो Upwork एक अच्छा विकल्प है: यह 180+ देशों में 1.8 करोड़ से ज़्यादा फ्रीलांसरों और हज़ारों स्किल कैटेगरी वाला एक जनरल-पर्पस मार्केटप्लेस है, जिसमें पब्लिश की गई फ्लैट फ़ीस टियर हैं और फ़िक्स्ड-प्राइस माइलस्टोन के लिए अपना खुद का एस्क्रो सिस्टम है — यह स्केल और मैच्योरिटी असली है। Talengineer को ज़्यादा संकरा लेकिन गहरा बनाया गया है: सिर्फ़ सर्टिफाइड इंडस्ट्रियल ऑटोमेशन इंजीनियर — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल — जिन्हें किसी भी काम पर लगाए जाने से पहले प्लेटफ़ॉर्म सर्टिफिकेशन पास करना ज़रूरी है, नौ भाषाओं में काम करते हुए, और ऑन-साइट काम के लिए GPS-जियोफ़ेंस्ड चेक-इन और फ़ोटो क्वालिटी चेक के साथ। अगर आपकी हायरिंग जनरल-पर्पस रिमोट वर्क के लिए है, तो Upwork की व्यापकता से मुक़ाबला करना मुश्किल है। अगर यह एक तय दायरे वाला इंडस्ट्रियल ऑटोमेशन प्रोजेक्ट है — ख़ासकर ऐसा जिसमें फ़िज़िकल, ऑन-साइट डिलिवरेबल्स हों जिन्हें वेरिफ़ाई करने की ज़रूरत हो — तो असाइनमेंट से पहले कैपेबिलिटी-गेटिंग और ऑन-साइट एविडेंस ही वह जगह है जहाँ हम अलग हैं।",
    "them": [
      "एक जनरल-पर्पस ग्लोबल मार्केटप्लेस, जो इंडस्ट्रियल ऑटोमेशन के लिए ख़ास नहीं है: अपने ही शब्दों में, 180+ देशों में 1.8 करोड़+ फ्रीलांसर और हज़ारों स्किल कैटेगरी",
      "क्लाइंट के किसी फ्रीलांसर से जुड़ने से पहले हर फ्रीलांसर की पहचान और लोकेशन वेरिफ़ाई की जाती है, और प्रोफ़ाइल पर वेरिफ़ाइड रिव्यू और वर्क हिस्ट्री दिखती है। गहरी स्किल वेटिंग — यानी 'Expert-Vetted' बैज, जो स्क्रीनिंग इंटरव्यू, स्किल टेस्ट और पोर्टफ़ोलियो या कोडिंग रिव्यू से मिलता है — ऑप्शनल है, सिर्फ़ कुछ कैटेगरी तक सीमित है, और Upwork के अपने विवरण के मुताबिक़ सिर्फ़ Business Plus और Enterprise क्लाइंट्स को दिखती है; ज़्यादातर फ्रीलांसरों को काम लेने से पहले कभी कोई एग्ज़ाम पास करने की ज़रूरत ही नहीं पड़ती",
      "फ़िक्स्ड-प्राइस वाले काम को 'project funds' (एस्क्रो के लिए Upwork का मौजूदा नाम) से सुरक्षा मिलती है: क्लाइंट काम शुरू होने से पहले किसी माइलस्टोन को फ़ंड करता है, और यह पैसा तब रिलीज़ होता है जब क्लाइंट उसे अप्रूव करता है या 14 दिन की रिव्यू विंडो अपने आप बंद हो जाती है। घंटे के हिसाब से होने वाला काम एस्क्रो के बजाय Work Diary टाइम-ट्रैकिंग ऐप के ज़रिए अलग से सुरक्षित होता है। इसके अलावा, रिफ़ंड 180 दिनों के भीतर केस-दर-केस माँगे जाते हैं और यह फ्रीलांसर की मर्ज़ी पर तय होता है कि दिया जाए या नहीं; पहले माइलस्टोन के लिए मनी-बैक गारंटी की कोई घोषणा नहीं की गई है",
      "पब्लिश नहीं किया गया। Upwork के अपने ट्रस्ट-एंड-सेफ्टी पेज अकाउंट और डेटा सिक्योरिटी के बारे में बताते हैं — टू-फ़ैक्टर ऑथेंटिकेशन, एन्क्रिप्शन, मालवेयर स्कैनिंग — लेकिन इन-पर्सन या ऑन-साइट काम के लिए GPS चेक-इन, जियोफ़ेंसिंग या फ़ोटो वेरिफ़िकेशन का कहीं ज़िक्र नहीं है",
      "क्लाइंट साइड पर पब्लिश और टियर्ड: Basic प्लान पर 5% मार्केटप्लेस फ़ीस (बैंक ट्रांसफ़र से पेमेंट करने वाले एलिजिबल US क्लाइंट्स के लिए 3%) या Business Plus पर 10% (एलिजिबल होने पर 8%), साथ ही हर कॉन्ट्रैक्ट पर $0.99–$14.99 की एक बार वाली कॉन्ट्रैक्ट इनिशिएशन फ़ीस। फ्रीलांसर साइड की फ़ीस हर कॉन्ट्रैक्ट पर 0%–15% के बीच होती है, जो Upwork के अपने अनपब्लिश्ड इंटरनल क्राइटेरिया से तय होती है, और फ्रीलांसर को उसके एक्सेप्ट करने से पहले दिखाई जाती है, न कि एक फ़िक्स्ड पब्लिक रेट के तौर पर"
    ],
    "themWhen": [
      "आपको इंडस्ट्रियल ऑटोमेशन से बाहर के काम की ज़रूरत है — राइटिंग, डिज़ाइन, मार्केटिंग, जनरल सॉफ़्टवेयर, एडमिन — ऐसी कैटेगरी जो Talengineer बिल्कुल भी ऑफ़र नहीं करता",
      "आप एक संकरे, सर्टिफाइड रोस्टर के बजाय तुरंत सबसे बड़ा मुमकिन टैलेंट पूल चाहते हैं, जिसके पास रिव्यू और रेटिंग हिस्ट्री का एक स्थापित आधार हो",
      "आपकी एंगेजमेंट एक तय दायरे वाले प्रोजेक्ट के बजाय ओपन-एंडेड आवरली वर्क है — Upwork की Work Diary और आवरली बिलिंग लगातार, लंबे समय तक चलने वाली एंगेजमेंट के लिए बनाई गई हैं"
    ],
    "usWhen": [
      "आपको असाइनमेंट से पहले साबित और गेटेड कैपेबिलिटी चाहिए — इंडस्ट्रियल ऑटोमेशन के लिए ख़ास एक ज़रूरी प्लेटफ़ॉर्म सर्टिफिकेशन — न कि एक ऑप्शनल बैज जो सिर्फ़ एंटरप्राइज़-टियर क्लाइंट्स को दिखता है और जिसे ज़्यादातर फ्रीलांसर कभी लेते ही नहीं",
      "आपका डिलिवरेबल फ़िज़िकल और ऑन-साइट है — कोई प्लांट फ़्लोर, कोई रेट्रोफ़िट, कोई कमीशनिंग विज़िट — और आपको सबूत के तौर पर GPS-जियोफ़ेंस्ड चेक-इन और फ़ोटो क्वालिटी चेक चाहिए, जिनका ज़िक्र Upwork के अपने ट्रस्ट-एंड-सेफ्टी पेजों में नहीं है",
      "आप कमिट करने से पहले फ़ीस को एक फ़्लैट, कोट करने लायक़ पर्सेंटेज के तौर पर पब्लिश देखना चाहते हैं, साथ ही पहले माइलस्टोन पर मनी-बैक गारंटी चाहते हैं — न कि अनपब्लिश्ड क्राइटेरिया से तय 0%-15% फ्रीलांसर-साइड रेट, जिसके साथ कोई प्लेटफ़ॉर्म-वाइड रिफ़ंड गारंटी भी नहीं है"
    ],
    "faqs": [
      {
        "q": "क्या Upwork एक कॉम्पिटिटर है?",
        "a": "जनरल-पर्पस फ्रीलांस हायरिंग में, हाँ — यह दुनिया के सबसे बड़े मार्केटप्लेस में से एक है। सर्टिफिकेशन-गेटेड इंडस्ट्रियल ऑटोमेशन प्रोजेक्ट डिलीवरी में, जिसमें ऑन-साइट वेरिफ़िकेशन शामिल है, हम एक संकरी, अलग समस्या सुलझा रहे हैं जो ख़ास तौर पर उसके लिए नहीं बनाया गया है।"
      },
      {
        "q": "कौन-सा सस्ता है?",
        "a": "फ़ीस स्ट्रक्चर सीधे तुलना करने लायक़ नहीं हैं। Talengineer हर रिलीज़ हुए माइलस्टोन का 15% पब्लिश करता है (फ़ाउंडिंग क्लाइंट्स के लिए उनके पहले 5 ऑर्डर पर 5%)। Upwork की क्लाइंट फ़ीस Basic प्लान पर 5% या Business Plus पर 10% है (बैंक से पेमेंट करने वाले एलिजिबल US क्लाइंट्स के लिए 3%/8%), साथ ही एक बार वाली कॉन्ट्रैक्ट इनिशिएशन फ़ीस; फ्रीलांसर अलग से अपनी कमाई का 0%-15% देता है, जो Upwork के अनपब्लिश्ड क्राइटेरिया से तय होता है।"
      },
      {
        "q": "क्या मैं दोनों इस्तेमाल कर सकता हूँ?",
        "a": "हाँ। कई बायर्स जनरल रिमोट वर्क — एडमिन, मार्केटिंग, सॉफ़्टवेयर — के लिए Upwork इस्तेमाल करते हैं, और ख़ासतौर पर सर्टिफिकेशन-गेटेड ऑटोमेशन इंजीनियरिंग के लिए Talengineer, ख़ासकर फ़िज़िकल, ऑन-साइट डिलिवरेबल्स वाले प्रोजेक्ट्स के लिए।"
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer बनाम Toptal — आपकी परियोजना के लिए कौन बेहतर है?",
    "metaDesc": "Toptal घंटे के हिसाब से बिल किए जाने वाले रिमोट नॉलेज वर्क के लिए एक सत्यापित नेटवर्क है — डेवलपर, डिज़ाइनर, फाइनेंस, PM। Talengineer प्रमाणन-आधारित, माइलस्टोन-एस्क्रो वाली औद्योगिक ऑटोमेशन परियोजनाओं के लिए बनाया गया है।",
    "question": "Talengineer बनाम Toptal: आपकी परियोजना के लिए कौन बेहतर है?",
    "answer": "अगर आपको एक ही सत्यापित विशेषज्ञ चाहिए — डेवलपर, डिज़ाइनर, प्रोडक्ट मैनेजर या फाइनेंस एनालिस्ट — जो घंटे के हिसाब से बिल हो, और प्रतिबद्ध होने से पहले बिना जोखिम वाला ट्रायल चाहिए, तो Toptal एक अच्छा विकल्प है। यही इसके लिए बनाया गया है: नेटवर्क में शामिल होने पर पाँच-चरणीय स्क्रीनिंग फ़नल (उनके अपने प्रकाशित आँकड़ों के अनुसार, मासिक आवेदकों में कुल स्वीकृति दर 3% से कम है), और 100 से अधिक देशों में फैला एक रिमोट-फर्स्ट नेटवर्क। Talengineer एक अलग तरह के काम के लिए बनाया गया है: औद्योगिक ऑटोमेशन परियोजनाएँ — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल — जहाँ हर इंजीनियर को किसी भी काम पर लगाए जाने से पहले प्लेटफ़ॉर्म प्रमाणन (L1-L3, AI द्वारा मूल्यांकित और मानव-समीक्षित) पास करना ज़रूरी है, काम घंटे के हिसाब से बिल नहीं होता बल्कि हर स्वीकृत माइलस्टोन के अनुसार वित्तपोषित और जारी किया जाता है, और ऑन-साइट काम में सबूत के रूप में GPS-जियोफेंस्ड चेक-इन और फोटो QC शामिल होते हैं। अगर आपका काम रिमोट, घंटे के हिसाब से बिल होने वाला नॉलेज वर्क है, तो Toptal का ट्रायल-एंड-हायर मॉडल बेहतर विकल्प है। अगर यह एक तय दायरे वाली ऑटोमेशन परियोजना है — खासकर जो फैक्ट्री फ्लोर पर होती है — तो प्रमाणन-आधारित पात्रता और माइलस्टोन एस्क्रो ही वह जगह है जहाँ हम अलग हैं।",
    "them": [
      "100 से अधिक देशों में विशेषज्ञ — ज़्यादातर अमेरिका और यूरोप में स्थित — जो अपने शब्दों में, 140 से अधिक देशों के ग्राहकों की सेवा करते हैं, जिसमें सॉफ्टवेयर डेवलपमेंट, डिज़ाइन, फाइनेंस और प्रोडक्ट/प्रोजेक्ट मैनेजमेंट शामिल हैं; कोई अलग औद्योगिक ऑटोमेशन, PLC, रोबोटिक्स या मशीन विज़न श्रेणी सूचीबद्ध नहीं है, और सत्यापन के दौरान अंग्रेज़ी-भाषा स्क्रीनिंग के अलावा कोई भाषा-कवरेज आँकड़ा प्रकाशित नहीं किया गया है",
      "Toptal के अपने प्रकाशित फ़नल के अनुसार, नेटवर्क में एक बार होने वाली पाँच-चरणीय स्क्रीनिंग: भाषा और संचार (26.4% पास), गहन कौशल समीक्षा (7.4%), एक लाइव तकनीकी साक्षात्कार (3.6%), फिर 1-3 सप्ताह की टेस्ट परियोजना (3.2%), जिसमें कुल मिलाकर मासिक आवेदकों में से 3% से कम स्वीकार किए जाते हैं; स्क्रीनिंग नेटवर्क में प्रवेश के समय एक बार होती है, न कि प्रति क्लाइंट या प्रति कौशल, और कोई अलग प्लेटफ़ॉर्म प्रमाणन परीक्षा प्रकाशित नहीं की गई है",
      "प्रति घंटा, मिश्रित-दर बिलिंग जो Net 10 शर्तों पर महीने में दो बार इनवॉइस की जाती है, साथ ही टैलेंट मैचिंग तक पहुँचने पर $79/माह की फ्लैट सब्सक्रिप्शन; जोखिम को दो सप्ताह तक के बिना-जोखिम ट्रायल (प्रति भूमिका तीन उम्मीदवारों तक) से कवर किया जाता है, जिसमें असंतुष्ट होने पर बिल नहीं किया जाता — उनके अपने FAQ में \"एस्क्रो\" या \"माइलस्टोन\" शब्दों का इस्तेमाल नहीं किया गया है",
      "डिज़ाइन से ही रिमोट-फर्स्ट — उनके अपने शब्दों में, \"अधिकांश लोग अपने होम ऑफिस या को-वर्किंग स्पेस से रिमोट काम करते हैं\" — ऑन-साइट काम को एक दुर्लभ, विशेष-मामले वाले अपवाद के रूप में बताया गया है; कोई लोकेशन सत्यापन, जियोफेंसिंग या फोटो QC सिस्टम प्रकाशित नहीं किया गया है",
      "$79/माह की सब्सक्रिप्शन फीस प्रकाशित है; प्रति घंटा दरों को Toptal के मार्जिन को शामिल करने के लिए \"मिश्रित\" बताया गया है, लेकिन उस दर से वे कितना प्रतिशत या मार्कअप रखते हैं, यह प्रकाशित नहीं किया गया है"
    ],
    "themWhen": [
      "आपको एक ही रिमोट नॉलेज-वर्क विशेषज्ञ चाहिए — डेवलपर, डिज़ाइनर, PM, फाइनेंस एनालिस्ट — न कि कोई औद्योगिक ऑटोमेशन इंजीनियर, और आप प्रतिबद्ध होने से पहले बिना जोखिम के तीन उम्मीदवारों तक आज़माना चाहते हैं",
      "आप एक चालू घंटे के हिसाब से जुड़ाव चाहते हैं, जिसमें फुल-टाइम में बदलने का रास्ता हो, न कि तय दायरे वाली माइलस्टोन परियोजना",
      "आप एक ऐसा नेटवर्क चाहते हैं जिसका 100 से अधिक देशों में स्थापित, बहु-वर्षीय ट्रैक रिकॉर्ड हो, जो प्रति-असाइनमेंट प्रमाणन के बजाय एक प्रकाशित पाँच-चरणीय फ़नल से एक बार सत्यापित हो"
    ],
    "usWhen": [
      "आपकी परियोजना औद्योगिक ऑटोमेशन का काम है — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल — एक ऐसी श्रेणी जिसे Toptal की अपनी वेबसाइट विशेषज्ञता के रूप में सूचीबद्ध नहीं करती",
      "काम फैक्ट्री फ्लोर या जॉब साइट पर होता है और आप सबूत के तौर पर GPS-जियोफेंस्ड चेक-इन और फोटो QC चाहते हैं, न कि डिफ़ॉल्ट रूप से रिमोट-फर्स्ट मॉडल",
      "आप चाहते हैं कि फंड आपके द्वारा स्वीकृत हर माइलस्टोन के अनुसार जारी हो, जिसमें पहले माइलस्टोन पर मनी-बैक की गारंटी हो, न कि Net 10 शर्तों पर प्रति घंटा इनवॉइस"
    ],
    "faqs": [
      {
        "q": "क्या Toptal एक प्रतिस्पर्धी है?",
        "a": "बाज़ार के एक हिस्से में, हाँ — सत्यापित, रिमोट, घंटे के हिसाब से बिल होने वाला नॉलेज वर्क। लेकिन खासतौर पर औद्योगिक ऑटोमेशन में — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल, प्रमाणन-आधारित पात्रता और ऑन-साइट सत्यापन के साथ — हम एक ऐसी समस्या हल कर रहे हैं जिसे Toptal की अपनी वेबसाइट टारगेट नहीं करती।"
      },
      {
        "q": "कौन-सा सस्ता है?",
        "a": "दोनों की दरों की सीधी तुलना नहीं की जा सकती। Talengineer हर जारी किए गए माइलस्टोन का 15% प्रकाशित करता है (फाउंडिंग क्लाइंट्स के लिए उनके पहले 5 ऑर्डर पर 5%)। Toptal $79/माह की फ्लैट सब्सक्रिप्शन के साथ एक मिश्रित प्रति-घंटा दर प्रकाशित करता है जिसमें उसका मार्जिन शामिल है, लेकिन यह प्रकाशित नहीं करता कि वह उस दर का कितना प्रतिशत रखता है।"
      },
      {
        "q": "क्या मैं दोनों का इस्तेमाल कर सकता हूँ?",
        "a": "हाँ। कई मैन्युफैक्चरिंग टीमों के लिए इसका मतलब हो सकता है: संबंधित सॉफ्टवेयर या PM काम के लिए एक Toptal विशेषज्ञ, और ऑन-साइट ऑटोमेशन परियोजना के लिए खुद एक प्रमाणित Talengineer इंजीनियर।"
      }
    ]
  },
};

COMPARISONS.fr = {
  'staffing-agency': {
    label: 'face à une agence d’intérim',
    metaTitle: 'Agence d’intérim ou plateforme pour recruter des ingénieurs en automatisation ?',
    metaDesc: 'Quand une agence d’intérim est le bon choix pour de l’automatisation industrielle, et quand le recrutement par jalons sur plateforme convient mieux.',
    question: 'Faut-il passer par une agence d’intérim ou par une plateforme pour recruter des ingénieurs en automatisation ?',
    answer: 'Passez par une agence lorsque vous avez besoin de quelqu’un sur site la semaine prochaine, dans une ville où l’agence dispose déjà de personnel en attente, et que vous acceptez de payer une marge qui n’est généralement pas publiée. Passez par Talengineer lorsque la mission a un périmètre défini, qu’elle traverse une frontière ou une langue, ou que vous avez besoin de la preuve que l’ingénieur sait réellement faire le travail avant qu’il soit affecté. La vraie différence tient à l’endroit où se situe le risque : une agence vous facture des heures et vous portez le risque de livraison ; Talengineer conserve votre argent en séquestre par jalon et ne le libère qu’après votre validation.',
    them: [
      'Les personnes disponibles dans le vivier local de l’agence, généralement dans une seule langue',
      'Tri de CV et jugement d’un recruteur',
      'Facturation en régie : vous payez les heures, que le jalon soit atteint ou non',
      'Feuilles de temps ; la présence sur site n’est pas vérifiée de façon indépendante',
      'La marge appliquée au-dessus du taux de l’ingénieur n’est généralement pas communiquée',
    ],
    themWhen: [
      'Il vous faut quelqu’un sur site en quelques jours, dans une ville où l’agence est déjà implantée',
      'La mission relève de la maintenance continue et non d’un projet avec une fin',
      'Vous avez déjà un accord tarifaire et une relation de travail avec cette agence',
    ],
    usWhen: [
      'Le projet a un périmètre défini que vous pouvez découper en jalons',
      'La mission traverse une frontière ou une langue : l’ingénieur, l’usine et l’acheteur ne sont pas dans le même pays',
      'Vous voulez une compétence vérifiée avant l’affectation et un paiement lié au travail accepté',
    ],
    faqs: [
      {
        q: 'Une plateforme revient-elle moins cher qu’une agence ?',
        a: 'En général oui, car la commission est publiée au lieu d’être intégrée à un taux facturé : Talengineer prélève 15% de chaque jalon libéré (5% pour les clients fondateurs sur leurs 5 premières missions). Mais la comparaison honnête n’oppose pas commission à commission : l’agence vend des heures, nous vendons des jalons acceptés — ce que vous achetez diffère.',
      },
      {
        q: 'Qui gère la conformité et les assurances ?',
        a: 'Les ingénieurs passent le KYC, et les documents W-9 ainsi que l’attestation d’assurance (COI) sont collectés et vérifiés sur la plateforme avant toute intervention sur site. Une agence emploie généralement le prestataire en direct et porte cette charge à votre place : si vous cherchez précisément un employeur de référence, l’agence est la voie la plus simple.',
      },
      {
        q: 'Et si l’ingénieur ne donne pas satisfaction ?',
        a: 'Ne validez pas le jalon. Les fonds restent en séquestre et vous pouvez ouvrir un litige avec une fenêtre de 5 jours pour produire des éléments, examinée par un administrateur. Le premier jalon de votre premier projet est remboursable.',
      },
    ],
  },
  'freelance-marketplace': {
    label: 'face à une plateforme freelance généraliste',
    metaTitle: 'Pourquoi ne pas recruter un ingénieur en automatisation sur une plateforme freelance généraliste ?',
    metaDesc: 'Les plateformes généralistes sont vastes et peu chères. En automatisation industrielle, ce qui manque c’est la vérification : certification avant affectation et preuves sur site.',
    question: 'Pourquoi ne pas simplement recruter un ingénieur en automatisation sur une plateforme freelance généraliste ?',
    answer: 'Une plateforme généraliste est une façon raisonnable de trouver quelqu’un pour du travail à distance à faible enjeu, et la recherche y coûte moins cher. Ce qu’elle ne peut pas vous dire, c’est si un ingénieur automaticien saura réellement mettre en service votre ligne : la compétence y est déclarative et ne se confirme qu’après coup, par les avis clients. Talengineer est volontairement plus étroit : chaque ingénieur passe une évaluation technique pratique à l’inscription, doit détenir une certification plateforme L1–L3 avant toute affectation, et le travail sur site est adossé à des pointages GPS et à un contrôle qualité photo. Quand une mise en service ratée vous coûte plusieurs jours de ligne à l’arrêt, cette vérification est le produit.',
    them: [
      'Très vaste et majoritairement à distance ou orientée logiciel ; l’automatisation industrielle n’en est qu’une fine tranche',
      'Compétences déclarées et badges, confirmés après coup par les avis clients',
      'Séquestre à l’heure ou au forfait ; les litiges de périmètre se traitent au cas par cas',
      'Conçue pour le travail à distance : aucune couche de vérification sur site',
      'La commission de la plateforme est publiée, mais la qualité des ingénieurs varie fortement',
    ],
    themWhen: [
      'La mission est entièrement à distance : un petit écran IHM, un rapport, un script ponctuel',
      'Le budget est assez faible pour qu’une erreur coûte des heures, pas des jours d’arrêt de ligne',
      'Vous avez en interne l’expertise pour juger l’ingénieur vous-même',
    ],
    usWhen: [
      'Quelqu’un doit physiquement être à l’usine et vous avez besoin de la preuve qu’il y était',
      'Vous ne pouvez pas évaluer personnellement si l’ingénieur maîtrise Siemens ou Rockwell',
      'Une mise en service ratée signifie un arrêt de production, pas seulement une facture perdue',
    ],
    faqs: [
      {
        q: 'Les plateformes généralistes n’ont-elles pas aussi un séquestre ?',
        a: 'Si — le séquestre au forfait y est courant, donc le séquestre en soi n’est pas la différence. La différence porte sur ce qui doit être vrai avant qu’un ingénieur puisse être affecté : sur Talengineer il doit détenir une certification plateforme, et le travail sur site s’accompagne de preuves GPS et photo.',
      },
      {
        q: 'Votre vivier d’ingénieurs est-il plus restreint ?',
        a: 'Beaucoup plus restreint, et c’est délibéré. Chaque ingénieur référencé a passé une évaluation technique pratique par IA, et seuls les ingénieurs certifiés peuvent être affectés à un projet. Nous préférons vous rendre cinq ingénieurs capables de faire le travail que cinq cents profils à trier.',
      },
      {
        q: 'Puis-je quand même recruter pour une petite mission à distance ?',
        a: 'Oui, mais vous payez peut-être une vérification dont vous n’avez pas besoin. Pour une mission courte à distance, une plateforme généraliste est plus pratique : nous sommes conçus pour les travaux où l’erreur coûte cher.',
      },
    ],
  },
  'direct-hire': {
    label: 'face à une embauche en CDI',
    metaTitle: 'Embaucher un ingénieur en automatisation ou passer par une plateforme au projet ?',
    metaDesc: 'L’embauche se justifie pour un travail d’automatisme continu. Pour un travail par projet, le délai de démarrage et la capacité inoccupée décident.',
    question: 'Faut-il embaucher un ingénieur en automatisation ou contractualiser au projet via une plateforme ?',
    answer: 'Embauchez lorsque le travail est continu : une usine avec de l’automatisme toute l’année, où un ingénieur interne accumule la connaissance de vos machines. Contractualisez via une plateforme lorsque le travail a la forme d’un projet : une rénovation, une fenêtre de mise en service, un déplacement de ligne. Ce qui tranche, c’est généralement le temps et la capacité inoccupée : aux États-Unis, pourvoir un poste d’automaticien demande environ deux mois de recrutement avant que quiconque commence, et une fois embauché vous portez le salaire, les charges et les creux entre projets. Une mission sur plateforme démarre en quelques jours et vous ne payez que les jalons que vous financez.',
    them: [
      'Ceux qui postulent sur votre marché du travail local, à distance raisonnable du site',
      'Entretiens et références — et l’erreur de recrutement est à votre charge',
      'Salaire, charges et cotisations, versés qu’un projet soit en cours ou non',
      'La personne travaille directement pour vous, la vérification n’est donc pas un sujet distinct',
      'Totalement transparent : c’est votre propre masse salariale',
    ],
    themWhen: [
      'Il y a de l’automatisme toute l’année, et non un projet avec une date de fin',
      'La connaissance mérite d’être accumulée en interne : vos machines, votre historique, vos particularités',
      'Vous avez besoin de quelqu’un capable de répondre à un arrêt de ligne à toute heure',
    ],
    usWhen: [
      'Le travail est un projet avec une fin : rénovation, mise en service, déplacement de ligne',
      'Vous avez besoin d’une spécialité que vous ne garderiez jamais en interne : vision industrielle, une marque de robot précise',
      'Le site est dans un autre pays et recruter localement suppose d’abord d’y créer une entité',
    ],
    faqs: [
      {
        q: 'En combien de temps un ingénieur peut-il réellement démarrer ?',
        a: 'L’appariement intervient dans les 48 heures environ après publication ; la date de démarrage dépend des disponibilités de l’ingénieur et des exigences d’accès au site ou de visa. À comparer aux quelque deux mois de recrutement nécessaires pour pourvoir un poste d’automaticien aux États-Unis.',
      },
      {
        q: 'Un ingénieur en mission peut-il devenir salarié ?',
        a: 'Oui, sans frais de placement : la commission de plateforme s’applique aux jalons sous séquestre, pas à vos décisions de recrutement.',
      },
      {
        q: 'Et la connaissance qui reste en interne ?',
        a: 'C’est un avantage réel de l’embauche et nous ne le contesterons pas. La documentation du projet, les photos de pointage et les relevés qualité restent dans votre compte après la clôture, mais ils ne remplacent pas quelqu’un qui fait tourner votre usine depuis trois ans.',
      },
    ],
  },
  'automate-america': {
    label: 'face à Automate America',
    metaTitle: 'Talengineer face à Automate America : lequel correspond à votre projet ?',
    metaDesc: 'Automate America est conçu pour le placement horaire d’automaticiens aux États-Unis. Talengineer est conçu pour la livraison de projets transfrontaliers, sous certification et séquestre par jalon.',
    question: 'Talengineer face à Automate America : lequel correspond à votre projet ?',
    answer: 'Automate America convient bien si vous cherchez des prestataires en automatisation basés aux États-Unis, facturés à l’heure, avec feuilles de temps numériques et paiements rapides : c’est ce pour quoi la plateforme est conçue et elle y est bien établie. Talengineer est conçu pour une autre forme de travail : des projets transfrontaliers menés en neuf langues, des ingénieurs qui doivent réussir une certification plateforme avant de pouvoir être affectés à quoi que ce soit, et un séquestre par jalon où votre argent n’est libéré qu’après votre validation. Si votre besoin est du placement horaire local aux États-Unis, ils conviennent mieux. S’il s’agit d’un projet à périmètre défini — surtout s’il traverse une frontière — la vérification et le modèle de paiement font la différence.',
    them: [
      'Amérique du Nord, en anglais',
      'Selon leurs propres termes : profils vérifiés, historique de travail documenté et avis de clients précédents ; aucun examen de certification propre à la plateforme n’est publié',
      'À l’heure, en régie. Selon leur propre description, la plateforme prélève un pourcentage du taux horaire avant que le contrat soit présenté au marché ; ce pourcentage n’est pas publié',
      'Feuilles de temps numériques avec circuit de validation client ; aucune vérification de localisation n’est publiée',
      'Inscription gratuite pour toutes les parties, sans abonnement ; le pourcentage prélevé n’est pas publié',
    ],
    themWhen: [
      'Vous avez besoin d’un prestataire basé aux États-Unis, facturé à l’heure, démarrant au plus vite',
      'Vous souhaitez que la plateforme gère la facturation, la paie, les avantages et la conformité (leur service géré)',
      'Vous envisagez de transformer ensuite le prestataire en salarié',
    ],
    usWhen: [
      'Le projet traverse une frontière ou une langue : une usine au Mexique, au Vietnam ou en Thaïlande, avec l’acheteur ailleurs',
      'Vous voulez une compétence prouvée avant l’affectation, par un examen de certification et non par des avis a posteriori',
      'Vous voulez des fonds sous séquestre libérés par jalon accepté, avec un premier jalon remboursable',
    ],
    faqs: [
      {
        q: 'Automate America est-il un concurrent ?',
        a: 'Sur une partie du marché, oui : la prestation d’automatisation locale aux États-Unis. Sur la livraison de projets transfrontaliers, la coordination en neuf langues, l’affectation conditionnée à une certification et le séquestre par jalon, nous résolvons un autre problème.',
      },
      {
        q: 'Lequel est le moins cher ?',
        a: 'Les deux ne se comparent pas taux pour taux, car les modèles de facturation diffèrent. Talengineer publie 15% de chaque jalon libéré (5% pour les clients fondateurs sur leurs 5 premières missions). Automate America indique prélever un pourcentage du taux horaire avant que le contrat n’atteigne le marché, et ne publie pas ce pourcentage.',
      },
      {
        q: 'Puis-je utiliser les deux ?',
        a: 'Oui, et pour beaucoup d’industriels c’est la réponse sensée : un prestataire local facturé à l’heure aux États-Unis pour le support courant, et un projet à périmètre défini sous séquestre pour une construction ou une rénovation d’usine à l’étranger.',
      },
    ],
  },
  'field-nation': {
    "label": "vs Field Nation",
    "metaTitle": "Talengineer vs Field Nation : lequel convient à votre projet ?",
    "metaDesc": "Field Nation est une place de marché centrée sur les États-Unis pour les techniciens de service sur site en informatique, facturés par ordre de travail. Talengineer est conçu pour les projets d'automatisation industrielle transfrontaliers et soumis à certification, avec séquestre par jalons.",
    "question": "Talengineer vs Field Nation : lequel convient à votre projet ?",
    "answer": "Field Nation est un bon choix si vous avez besoin de techniciens de service informatique sur site centrés sur les États-Unis — réseau, câblage, points de vente, affichage numérique, installations de sécurité — dépêchés rapidement depuis un vivier existant considérable (plus d'un million d'ordres de travail par an sur plus de 600 000 sites), avec des frais publiés simples de 10% prélevés du côté du technicien. Talengineer est conçu pour un tout autre type de travail : des ingénieurs certifiés en automatisation industrielle — automates (PLC), robotique, vision industrielle, électricité — présents aux États-Unis, au Mexique, au Vietnam, en Thaïlande et en Chine, travaillant en neuf langues, où un examen de certification de la plateforme est exigé avant toute affectation, et pas seulement un profil, des avis et une vérification d'antécédents facultative, et où vos fonds restent en séquestre par jalons, libérés uniquement après votre validation du travail, plutôt que versés au technicien selon un cycle hebdomadaire de conditions de paiement. Si votre mission est un service informatique sur site local aux États-Unis facturé par ordre de travail, Field Nation est le meilleur choix. S'il s'agit d'un projet d'automatisation à périmètre défini — surtout s'il traverse une frontière, ou si vous voulez que la compétence soit prouvée avant l'affectation plutôt qu'après — c'est là que la vérification et le modèle de paiement nous différencient.",
    "them": [
      "Centré sur les États-Unis — ses propres pages décrivent une couverture par État américain et code postal, avec des mentions occasionnelles de l'Amérique du Nord/Canada (« aux États-Unis et au Canada ») ; aucune couverture internationale ou mondiale n'est revendiquée. Les techniciens couvrent des spécialités informatiques/sur site — réseau, câblage, points de vente, affichage numérique, ordinateurs et imprimantes, sécurité — pas l'automatisation industrielle.",
      "Des profils autodéclarés (compétences, certifications, historique professionnel), des évaluations/avis d'acheteurs, ainsi qu'un algorithme de classement propriétaire « Provider Match » et un « Success Score ». Les vérifications d'antécédents et les tests de dépistage de drogues (gérés via un partenaire tiers) ne sont exigés que sur les ordres de travail qui le requièrent — 76% d'entre eux, selon leurs propres chiffres — pas sur chaque mission, et aucun examen de certification géré par la plateforme n'est décrit sur son propre site.",
      "Ce n'est pas un séquestre par jalons. Les acheteurs préfinancent un compte Field Nation — détenu comme un compte fiduciaire unique mélangé avec les fonds d'autres acheteurs, selon ses propres conditions acheteurs — ou utilisent des conditions de paiement net 7/14/21/28 jours ; les techniciens sont payés selon un cycle hebdomadaire uniquement une fois le paiement de l'acheteur traité, de sorte que sur les missions à conditions de paiement, le technicien assume le risque de non-paiement de l'acheteur jusqu'à ce moment-là. Les acheteurs californiens ne peuvent plus préfinancer depuis mars 2021 et doivent payer après avoir approuvé le travail.",
      "Une étape de pointage à l'arrivée/au départ, une documentation photo dans l'application liée à l'ordre de travail spécifique, et la capture de signature électronique sur le site. Le GPS est décrit comme utilisé pour la découverte de missions et le suivi du kilométrage ; la question de savoir si le pointage lui-même est vérifié par GPS n'est pas décrite sur ses pages publiques — non publié.",
      "Les frais côté technicien sont publiés et simples : 10% fixes du montant total final de paiement de l'ordre de travail, ou 13.9% sur son niveau Pro optionnel (10% de base plus 3.9% de supplément), plus des options d'assurance facultatives (1.95% pour la couverture de responsabilité civile générale de la plateforme, 1% ou 0.5% pour l'assurance accident du travail). Ce qu'elle facture aux acheteurs/entreprises n'est pas publié — les formules sont décrites comme basées sur un abonnement, avec des tarifs disponibles uniquement en contactant les ventes."
    ],
    "themWhen": [
      "Vous avez besoin d'un service informatique sur site local aux États-Unis ou en Amérique du Nord — réseau, câblage, points de vente, affichage numérique, installation de caméras de sécurité — pas d'automatisation industrielle.",
      "Vous voulez accéder à un vivier de techniciens déjà considérable (plus d'1 million d'ordres de travail par an, plus de 600 000 sites), et la rapidité compte plus que la preuve de compétence par un examen de certification avant l'affectation.",
      "En tant qu'acheteur, vous voulez payer la valeur nominale de l'ordre de travail sans ligne de frais de plateforme distincte — la part de Field Nation est déduite du versement du technicien, elle ne vous est pas facturée."
    ],
    "usWhen": [
      "Le projet traverse une frontière ou une langue — une usine au Mexique, au Vietnam ou en Thaïlande avec un acheteur ailleurs — hors du réseau de Field Nation centré sur les États-Unis/l'Amérique du Nord.",
      "Vous voulez que la compétence soit prouvée par un examen de certification avant l'affectation, plutôt qu'un profil autodéclaré accompagné d'avis et d'une vérification d'antécédents facultative et dépendante de la mission.",
      "Vous voulez que vos fonds soient conservés en séquestre par jalons et libérés uniquement après votre validation du travail, plutôt que selon un cycle hebdomadaire de conditions de paiement où le technicien assume le risque de votre non-paiement jusqu'à l'encaissement des fonds."
    ],
    "faqs": [
      {
        "q": "Field Nation est-il un concurrent ?",
        "a": "Dans la distribution de services informatiques sur site — réseau, câblage, points de vente, installations de sécurité, facturés par ordre de travail — oui. Dans les projets d'automatisation industrielle soumis à certification, avec séquestre par jalons et livraison transfrontalière et multilingue, nous résolvons un problème différent."
      },
      {
        "q": "Lequel est le moins cher ?",
        "a": "Ils ne peuvent pas être comparés tarif contre tarif : les frais sont facturés à une partie différente. Field Nation déduit 10% fixes du versement du technicien (13.9% sur son niveau Pro optionnel), et ne publie pas ce qu'elle facture, le cas échéant, aux acheteurs au-delà de la valeur nominale de l'ordre de travail ; les formules acheteurs sont basées sur un abonnement et cotées par les ventes. Talengineer publie ses frais directement à l'acheteur : 15% de chaque jalon libéré (5% pour les clients fondateurs sur leurs 5 premières commandes), affichés avant tout engagement."
      },
      {
        "q": "Puis-je utiliser les deux ?",
        "a": "Oui — pour de nombreuses entreprises, c'est la répartition la plus pratique : Field Nation pour la distribution de techniciens informatiques/sur site locaux aux États-Unis, et Talengineer pour un projet d'automatisation certifié et protégé par séquestre, en particulier s'il traverse une frontière."
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer vs WorkMarket : lequel convient à votre projet ?",
    "metaDesc": "WorkMarket (groupe ADP) est une plateforme réservée aux États-Unis pour gérer de grands viviers de sous-traitants 1099. Talengineer est conçu pour les projets d'automatisation transfrontaliers, avec certification obligatoire et séquestre par jalon (milestone escrow).",
    "question": "Talengineer vs WorkMarket : lequel convient à votre projet ?",
    "answer": "WorkMarket, propriété d'ADP, est conçu pour les entreprises américaines qui gèrent un large vivier existant de sous-traitants 1099 : intégration en masse, vérifications d'antécédents et tests de compétences configurés par catégorie de poste, déclaration fiscale automatisée 1099-NEC, et paiements rapides dans des catégories comme le service technique de terrain en informatique, la messagerie et la sécurité. Ses propres Conditions d'utilisation précisent que la plateforme 'n'est pas destinée à être utilisée par des clients situés en dehors des États-Unis', et le seul montant de frais qu'elle publie est des frais optionnels de 2.5% facturés au travailleur pour un paiement anticipé — les frais de plateforme standard côté client sont fixés par mission et ne sont pas divulgués. Talengineer est conçu pour un tout autre type de travail : un projet d'automatisation industrielle à périmètre défini, souvent transfrontalier, où l'ingénieur doit détenir une certification de la plateforme (platform certification) avant de se voir confier une quelconque mission, et où votre argent reste en séquestre par jalon (milestone escrow), libéré uniquement après votre approbation. Si vous administrez une main-d'œuvre contingente nationale à grande échelle, les outils de WorkMarket sont plus matures pour cela. Si votre projet porte sur un automate (PLC), la robotique ou la vision industrielle et nécessite une capacité pré-vérifiée ainsi qu'une protection des paiements, c'est exactement ce pour quoi nous avons conçu Talengineer.",
    "them": [
      "Clients américains uniquement. Ses Conditions d'utilisation précisent que la plateforme 'n'est pas destinée à être utilisée par des clients situés en dehors des États-Unis', et une page entreprise de WorkMarket indique qu'elle 'ne prend actuellement en charge que les entreprises disposant d'une entité aux États-Unis'. Les paiements aux sous-traitants sont décrits comme pouvant atteindre 'presque n'importe où dans le monde', mais qui peut acheter sur la plateforme reste limité aux États-Unis.",
      "Les vérifications d'antécédents et les tests de dépistage de drogue passent par une agence tierce de reporting consommateur (déclenchés par l'autorisation écrite du travailleur lui-même), en plus des vérifications de licence/certification, de la vérification du numéro fiscal et du compte bancaire, et de 'tests personnalisables pour évaluer les compétences du travailleur' que le client configure par catégorie de poste via ses propres 'Labor Clouds'. Aucun examen de certification administré par la plateforme n'est publié comme condition préalable à l'affectation d'un travailleur.",
      "Facturation en régie (temps et matériel) par mission : le client publie une Valeur de Mission (Assignment Value), et selon ses Conditions, le client 'est tenu de payer le Travailleur Indépendant pour une Mission lorsque cette Mission devient une Mission Approuvée' — c'est-à-dire lorsque le client la marque comme terminée. Aucun dispositif de séquestre n'est décrit nulle part dans ses Conditions, et une fois un prélèvement effectué, 'ce prélèvement ou débit est non remboursable, sauf dans la mesure où la loi applicable l'interdit'.",
      "Une application mobile pour les travailleurs avec pointage d'entrée/sortie, géorepérage (mentionné spécifiquement sur sa page dédiée aux services de terrain informatiques), téléversement de photos et de documents en guise de livrables, et collecte de signatures électroniques.",
      "Les 'frais de plateforme' standard côté client sont fixés par mission, et ses Conditions précisent que 'WorkMarket se réserve le droit de modifier les frais de plateforme à tout moment' — le pourcentage lui-même n'est pas publié. Le seul montant de frais divulgué dans ses Conditions est des frais de 2.5% facturés au travailleur pour un accès anticipé optionnel aux fonds (FastFunds) ; en dehors de cela, la tarification standard nécessite de contacter le service commercial pour obtenir un devis."
    ],
    "themWhen": [
      "Vous êtes une entreprise américaine qui gère un large vivier existant de sous-traitants 1099 dans de nombreuses catégories de postes — techniciens de terrain informatiques, coursiers, chauffeurs, agents de sécurité, interprètes — et vous avez besoin d'une intégration en masse ainsi que d'une déclaration fiscale 1099-NEC automatisée.",
      "Vous voulez définir vos propres règles de vérification par catégorie de poste — antécédents, tests de dépistage de drogue, tests de compétences personnalisés — plutôt que d'exiger une certification de plateforme préalablement délivrée avant l'affectation.",
      "Vous voulez des paiements rapides et flexibles aux travailleurs (virement ACH, carte de paiement, PayPal, accès anticipé optionnel aux fonds) pour un volume élevé de commandes courtes en régie."
    ],
    "usWhen": [
      "Le projet est transfrontalier — les propres Conditions de WorkMarket restreignent la plateforme aux clients basés aux États-Unis ; nos ingénieurs travaillent aux États-Unis, au Mexique, au Vietnam, en Thaïlande et en Chine, dans neuf langues.",
      "Vous voulez que la capacité soit prouvée par un examen de certification obligatoire avant l'affectation, et non par des vérifications d'antécédents et des tests configurés par le client appliqués une fois le travailleur déjà dans le vivier.",
      "Vous voulez que les fonds soient conservés en séquestre et libérés uniquement après votre approbation de chaque jalon, avec un remboursement garanti sur le premier jalon — pas un modèle de paiement à l'approbation où les prélèvements sont non remboursables une fois effectués."
    ],
    "faqs": [
      {
        "q": "WorkMarket est-il un concurrent ?",
        "a": "Sur une partie du marché, oui — la gestion à grande échelle de main-d'œuvre contingente domestique aux États-Unis. Sur la livraison de projets transfrontaliers, l'affectation conditionnée par certification et le séquestre par jalon, nous résolvons un problème différent."
      },
      {
        "q": "Lequel est le moins cher ?",
        "a": "Ils ne sont pas directement comparables, car WorkMarket ne publie pas ses frais de plateforme standard — ses Conditions ne divulguent qu'un frais optionnel de 2.5% facturé aux travailleurs pour un accès anticipé au paiement (FastFunds). Talengineer publie ses frais dès le départ : 15% de chaque jalon libéré, 5% pour les clients fondateurs sur leurs 5 premières commandes."
      },
      {
        "q": "Puis-je utiliser les deux ?",
        "a": "Oui. De nombreux fabricants utilisent une plateforme comme WorkMarket pour leur large vivier de sous-traitants de service de terrain ou informatiques basés aux États-Unis, et utilisent Talengineer séparément pour un projet d'automatisation à périmètre défini — en particulier un projet transfrontalier nécessitant une capacité certifiée avec des jalons séquestrés."
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork : lequel convient à votre projet ?",
    "metaDesc": "Upwork est une place de marché freelance mondiale généraliste couvrant des milliers de compétences. Talengineer est conçu pour les projets d'automatisation industrielle avec certification obligatoire, séquestre par jalons et vérification sur site.",
    "question": "Talengineer vs Upwork : lequel convient à votre projet ?",
    "answer": "Upwork est un bon choix si vous devez recruter pour presque n'importe quel type de travail à distance, pas seulement l'ingénierie d'automatisation : c'est une place de marché généraliste de plus de 18 millions de freelances dans plus de 180 pays et des milliers de catégories de compétences, avec des paliers de frais publiés et fixes, et son propre système de séquestre pour les jalons à prix fixe — cette échelle et cette maturité sont bien réelles. Talengineer est conçu de façon plus étroite mais plus approfondie : uniquement des ingénieurs en automatisation industrielle certifiés — automates (PLC), robotique, vision industrielle, électricité — qui doivent réussir une certification de la plateforme avant de pouvoir se voir attribuer une quelconque mission, avec un service disponible en neuf langues, et des pointages avec géorepérage GPS ainsi qu'un contrôle qualité photo pour le travail sur site. Si votre recrutement porte sur du travail à distance généraliste, l'étendue d'Upwork est difficile à égaler. S'il s'agit d'un projet d'automatisation industrielle bien défini — en particulier avec des livrables physiques, sur site, qui nécessitent une vérification — le filtrage des compétences avant l'attribution et les preuves sur site sont ce qui nous distingue.",
    "them": [
      "Une place de marché mondiale généraliste, non spécifique à l'automatisation industrielle : selon ses propres termes, plus de 18 millions de freelances dans plus de 180 pays et des milliers de catégories de compétences",
      "L'identité et la localisation de chaque freelance sont vérifiées avant qu'un client puisse le contacter, et les profils affichent des avis vérifiés et un historique de travail. Une évaluation des compétences plus poussée — le badge « Expert-Vetted », obtenu via un entretien de sélection, des tests de compétences et une revue de portfolio ou de code — est optionnelle, limitée à certaines catégories, et selon la propre description d'Upwork, visible uniquement par les clients des offres Business Plus et Enterprise ; la plupart des freelances ne sont jamais tenus de réussir un quelconque examen avant d'accepter une mission",
      "Le travail à prix fixe est protégé par les « project funds » (le nom actuel donné par Upwork au séquestre) : le client finance un jalon avant le début du travail, et les fonds sont libérés lorsque le client l'approuve ou lorsqu'une fenêtre de revue de 14 jours se referme automatiquement. Le travail facturé à l'heure est protégé séparément, via l'application de suivi du temps Work Diary plutôt que par un séquestre. Au-delà de cela, les remboursements sont demandés au cas par cas dans un délai de 180 jours et accordés à la discrétion du freelance ; aucune garantie de remboursement n'est publiée pour le premier jalon",
      "Non publié. Les pages de confiance et de sécurité d'Upwork décrivent la sécurité du compte et des données — authentification à deux facteurs, chiffrement, analyse antimalware — sans mentionner de pointages GPS, de géorepérage ni de vérification photo pour le travail en présentiel ou sur site",
      "Publié et échelonné côté client : une commission de marketplace de 5% sur le plan Basic (3% pour les clients américains éligibles payant par virement bancaire) ou de 10% sur Business Plus (8% pour les éligibles), plus des frais uniques de démarrage de contrat de $0.99–$14.99 par contrat. Les frais côté freelance vont de 0% à 15% par contrat, fixés selon des critères internes qu'Upwork ne publie pas, et affichés au freelance avant qu'il n'accepte, plutôt que d'être un taux public fixe"
    ],
    "themWhen": [
      "Vous avez besoin de travail en dehors de l'automatisation industrielle — rédaction, design, marketing, développement logiciel généraliste, administratif — des catégories que Talengineer ne propose pas du tout",
      "Vous voulez accéder immédiatement au plus grand vivier de talents possible, avec une base établie d'avis et d'historique de notation, plutôt qu'un vivier plus restreint de professionnels certifiés",
      "Votre mission est un travail à l'heure sans durée définie plutôt qu'un projet au périmètre défini — le Work Diary et la facturation horaire d'Upwork sont conçus pour un engagement continu et de longue durée"
    ],
    "usWhen": [
      "Vous avez besoin que la compétence soit prouvée et filtrée avant l'attribution — une certification de plateforme obligatoire, spécifique à l'automatisation industrielle — plutôt qu'un badge optionnel visible uniquement par les clients de niveau entreprise et que la plupart des freelances n'obtiennent jamais",
      "Votre livrable est physique et sur site — un atelier de production, une modernisation d'équipement, une visite de mise en service — et vous voulez des pointages avec géorepérage GPS et un contrôle qualité photo comme preuves, ce que les propres pages de confiance et de sécurité d'Upwork ne décrivent pas",
      "Vous voulez que la commission soit publiée sous la forme d'un pourcentage fixe et unique, annoncé avant tout engagement, avec une garantie de remboursement sur le premier jalon, plutôt qu'un taux côté freelance de 0%-15% fixé selon des critères non publiés et sans garantie de remboursement à l'échelle de la plateforme"
    ],
    "faqs": [
      {
        "q": "Upwork est-il un concurrent ?",
        "a": "Dans le recrutement freelance généraliste, oui — c'est l'une des plus grandes places de marché au monde. Dans la livraison de projets d'automatisation industrielle avec certification obligatoire et vérification sur site, nous résolvons un problème plus étroit et différent, qui n'est pas spécifiquement ce pour quoi Upwork est conçu."
      },
      {
        "q": "Lequel est le moins cher ?",
        "a": "Les structures de frais ne sont pas directement comparables. Talengineer publie 15% de chaque jalon libéré (5% pour les clients fondateurs sur leurs 5 premières commandes). Les frais client d'Upwork sont de 5% sur son plan Basic ou de 10% sur Business Plus (3%/8% pour les clients américains éligibles payant par virement bancaire), plus des frais uniques de démarrage de contrat ; le freelance paie séparément entre 0% et 15% de ses propres revenus, selon des critères qu'Upwork ne publie pas."
      },
      {
        "q": "Puis-je utiliser les deux ?",
        "a": "Oui. De nombreux acheteurs utilisent Upwork pour du travail à distance généraliste — administratif, marketing, logiciel — et Talengineer spécifiquement pour l'ingénierie d'automatisation avec certification obligatoire, en particulier pour les projets avec des livrables physiques, sur site."
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer vs Toptal : lequel convient à votre projet ?",
    "metaDesc": "Toptal est un réseau vérifié pour le travail intellectuel à distance facturé à l'heure — développeurs, designers, finance, chefs de projet. Talengineer est conçu pour les projets d'automatisation industrielle soumis à certification et à séquestre par jalon.",
    "question": "Talengineer vs Toptal : lequel convient à votre projet ?",
    "answer": "Toptal est un bon choix si vous avez besoin d'un seul spécialiste vérifié — développeur, designer, chef de produit ou analyste financier — facturé à l'heure, avec un essai sans risque avant de vous engager. C'est exactement ce pour quoi la plateforme est conçue : un entonnoir de sélection en cinq étapes à l'entrée du réseau (ses propres chiffres publiés situent le taux d'acceptation global à moins de 3% des candidats mensuels), et un réseau conçu d'abord pour le travail à distance, présent dans plus de 100 pays. Talengineer est conçu pour un tout autre type de travail : les projets d'automatisation industrielle — automates programmables (PLC), robotique, vision industrielle, électricité — où chaque ingénieur doit obtenir une certification de la plateforme (L1-L3, évaluée par IA et revue par des humains) avant d'être affecté à quoi que ce soit ; le travail est financé et débloqué par jalon approuvé plutôt que facturé à l'heure, et le travail sur site s'accompagne de pointages géolocalisés par GPS et d'un contrôle qualité photo comme preuve. Si votre besoin est un travail intellectuel à distance, facturé à l'heure, le modèle d'essai puis d'embauche de Toptal est le mieux adapté. S'il s'agit d'un projet d'automatisation à périmètre défini — surtout un projet qui se déroule sur le site d'une usine — c'est là que nous nous distinguons : certification obligatoire et séquestre par jalon.",
    "them": [
      "Des experts dans plus de 100 pays — la plupart basés en Amérique et en Europe — au service de clients dans plus de 140 pays, selon ses propres termes, couvrant le développement logiciel, le design, la finance et la gestion de produit/projet ; aucune catégorie dédiée à l'automatisation industrielle, aux automates programmables, à la robotique ou à la vision industrielle n'est répertoriée, et aucun chiffre de couverture linguistique n'est publié au-delà de la sélection en langue anglaise lors de la vérification",
      "Une sélection unique à l'entrée du réseau en cinq étapes, selon l'entonnoir publié par Toptal lui-même : langue et communication (26.4% de réussite), examen approfondi des compétences (7.4%), un entretien technique en direct (3.6%), puis un projet test de 1 à 3 semaines (3.2%), avec un taux d'acceptation global inférieur à 3% des candidats mensuels ; la sélection a lieu une seule fois, à l'admission dans le réseau, et non par client ou par compétence, et aucun examen de certification de plateforme distinct n'est publié",
      "Facturation horaire à taux mixte, émise deux fois par mois selon des conditions Net 10, plus un abonnement forfaitaire de $79/mois une fois que vous passez à la mise en relation avec un talent ; le risque est couvert par un essai sans risque allant jusqu'à deux semaines (avec jusqu'à trois candidats par poste) durant lequel vous n'êtes pas facturé en cas d'insatisfaction — sa propre FAQ n'emploie ni le mot « séquestre » (escrow) ni le mot « jalon » (milestone)",
      "Pensé d'abord pour le travail à distance — « la grande majorité travaille à distance depuis son bureau à domicile ou un espace de coworking », selon ses propres termes — le travail sur site étant décrit comme une exception rare et particulière ; aucun système de vérification de localisation, de géorepérage ou de contrôle qualité photo n'est publié",
      "Les frais d'abonnement de $79/mois sont publiés ; les taux horaires sont décrits comme « mixtes » pour inclure la marge de Toptal, mais le pourcentage précis ou la majoration retenue sur ce taux n'est pas publié"
    ],
    "themWhen": [
      "Vous avez besoin d'un seul spécialiste du travail intellectuel à distance — développeur, designer, chef de projet, analyste financier — et non d'un ingénieur en automatisation industrielle, et vous voulez tester jusqu'à trois candidats sans risque avant de vous engager",
      "Vous voulez un engagement continu facturé à l'heure, avec une possibilité de conversion en poste à temps plein, plutôt qu'un projet à périmètre défini facturé par jalon",
      "Vous voulez un réseau avec un historique établi de plusieurs années dans plus de 100 pays, vérifié une seule fois via un entonnoir public en cinq étapes plutôt qu'une certification par mission"
    ],
    "usWhen": [
      "Votre projet relève de l'automatisation industrielle — automates programmables, robotique, vision industrielle, électricité — une catégorie que le site de Toptal lui-même ne répertorie pas comme spécialité",
      "Le travail se déroule sur le site d'une usine ou sur un chantier et vous voulez des pointages géolocalisés par GPS et un contrôle qualité photo comme preuve, plutôt qu'un modèle par défaut pensé d'abord pour le distanciel",
      "Vous voulez que les fonds soient débloqués à chaque jalon que vous approuvez, avec un remboursement garanti sur le premier jalon, plutôt que des factures horaires à conditions Net 10"
    ],
    "faqs": [
      {
        "q": "Toptal est-il un concurrent ?",
        "a": "Sur une partie du marché, oui — le travail intellectuel vérifié, à distance, facturé à l'heure. Mais spécifiquement dans l'automatisation industrielle — automates programmables, robotique, vision industrielle, électricité, avec certification obligatoire et vérification sur site — nous répondons à un problème que le site de Toptal lui-même ne cible pas."
      },
      {
        "q": "Lequel est le moins cher ?",
        "a": "Les deux tarifs ne peuvent pas être comparés terme à terme. Talengineer publie 15% de chaque jalon débloqué (5% pour les clients fondateurs sur leurs 5 premières commandes). Toptal publie un abonnement forfaitaire de $79/mois plus un taux horaire mixte incluant sa marge, mais ne publie pas le pourcentage qu'il retient sur ce taux."
      },
      {
        "q": "Puis-je utiliser les deux ?",
        "a": "Oui. Pour de nombreuses équipes industrielles, cela peut signifier un spécialiste Toptal pour le travail logiciel ou de gestion de projet connexe, et un ingénieur Talengineer certifié pour le projet d'automatisation sur site lui-même."
      }
    ]
  },
};

COMPARISONS.de = {
  'staffing-agency': {
    label: 'im Vergleich zur Personaldienstleistung',
    metaTitle: 'Personaldienstleister oder Plattform für Automatisierungsingenieure?',
    metaDesc: 'Wann ein Personaldienstleister für Industrieautomatisierung die richtige Wahl ist und wann meilensteinbasierte Vermittlung besser passt.',
    question: 'Sollte ich Automatisierungsingenieure über einen Personaldienstleister oder eine Plattform beauftragen?',
    answer: 'Nehmen Sie einen Personaldienstleister, wenn Sie nächste Woche jemanden vor Ort brauchen, in einer Stadt, in der der Dienstleister bereits Leute frei hat, und wenn Sie einen üblicherweise nicht veröffentlichten Aufschlag akzeptieren. Nehmen Sie Talengineer, wenn die Arbeit einen definierten Umfang hat, eine Grenze oder eine Sprache überschreitet, oder wenn Sie vor der Beauftragung den Nachweis brauchen, dass der Ingenieur die Aufgabe tatsächlich beherrscht. Der eigentliche Unterschied liegt darin, wo das Risiko sitzt: Der Dienstleister rechnet Stunden ab und Sie tragen das Lieferrisiko; Talengineer hält Ihr Geld in Meilenstein-Treuhand und gibt es erst nach Ihrer Abnahme frei.',
    them: [
      'Wer im lokalen Pool des Dienstleisters gerade verfügbar ist, in der Regel in einer Sprache',
      'Lebenslauf-Sichtung plus die Einschätzung eines Recruiters',
      'Abrechnung nach Aufwand — Sie zahlen Stunden, ob der Meilenstein erreicht wird oder nicht',
      'Stundenzettel; die Anwesenheit vor Ort wird nicht unabhängig überprüft',
      'Der Aufschlag auf den Satz des Ingenieurs wird meist nicht offengelegt',
    ],
    themWhen: [
      'Sie brauchen innerhalb von Tagen jemanden vor Ort, in einer Stadt, in der der Dienstleister bereits präsent ist',
      'Die Arbeit ist laufende Instandhaltung und kein Projekt mit Endtermin',
      'Sie haben mit diesem Dienstleister bereits eine Preisvereinbarung und eine eingespielte Zusammenarbeit',
    ],
    usWhen: [
      'Das Projekt hat einen definierten Umfang, den Sie in Meilensteine schneiden können',
      'Die Arbeit überschreitet eine Grenze oder eine Sprache — Ingenieur, Werk und Auftraggeber sind nicht im selben Land',
      'Sie wollen die Kompetenz vor der Beauftragung geprüft haben und die Zahlung an abgenommene Arbeit koppeln',
    ],
    faqs: [
      {
        q: 'Ist eine Plattform günstiger als ein Personaldienstleister?',
        a: 'In der Regel ja, weil die Gebühr veröffentlicht und nicht in einem Verrechnungssatz versteckt ist: Talengineer berechnet 15% je freigegebenem Meilenstein (5% für Gründungskunden bei den ersten 5 Aufträgen). Ehrlich verglichen steht aber nicht Gebühr gegen Gebühr — der Dienstleister verkauft Stunden, wir verkaufen abgenommene Meilensteine; Sie kaufen also etwas anderes.',
      },
      {
        q: 'Wer kümmert sich um Compliance und Versicherung?',
        a: 'Ingenieure durchlaufen KYC; W-9-Unterlagen und der Versicherungsnachweis (COI) werden vor dem Einsatz vor Ort auf der Plattform erhoben und geprüft. Ein Dienstleister beschäftigt den Auftragnehmer meist direkt und nimmt Ihnen diese Last ab — wenn Sie ausdrücklich einen Employer of Record wollen, ist das der einfachere Weg.',
      },
      {
        q: 'Was, wenn der Ingenieur nicht liefert?',
        a: 'Geben Sie den Meilenstein nicht frei. Die Mittel bleiben in der Treuhand, und Sie können einen Streitfall mit 5-tägiger Nachweisfrist eröffnen, der von einem Administrator geprüft wird. Der erste Meilenstein Ihres ersten Projekts ist geld-zurück-garantiert.',
      },
    ],
  },
  'freelance-marketplace': {
    label: 'im Vergleich zu allgemeinen Freelancer-Plattformen',
    metaTitle: 'Warum nicht Automatisierungsingenieure über eine allgemeine Freelancer-Plattform beauftragen?',
    metaDesc: 'Allgemeine Plattformen sind breit und günstig. In der Industrieautomatisierung fehlt die Prüfung: Zertifizierung vor der Beauftragung und Nachweise vor Ort.',
    question: 'Warum nicht einfach einen Automatisierungsingenieur über eine allgemeine Freelancer-Plattform beauftragen?',
    answer: 'Eine allgemeine Plattform ist ein vernünftiger Weg, jemanden für remote erledigbare Arbeit mit geringem Risiko zu finden, und die Suche dort ist günstiger. Was sie Ihnen nicht sagen kann: ob ein SPS-Ingenieur Ihre Linie tatsächlich in Betrieb nehmen kann — Kompetenz ist dort selbst angegeben und bestätigt sich erst hinterher über Kundenbewertungen. Talengineer ist bewusst schmaler: Jeder Ingenieur durchläuft bei der Anmeldung einen praxisnahen Techniktest, muss vor jeder Beauftragung eine Plattform-Zertifizierung L1–L3 halten, und Arbeiten vor Ort werden durch GPS-Check-ins und Foto-Qualitätskontrolle abgesichert. Wenn eine misslungene Inbetriebnahme Sie Tage Stillstand kostet, ist genau diese Prüfung das Produkt.',
    them: [
      'Sehr groß und überwiegend remote oder softwarelastig; Industrieautomatisierung ist nur eine dünne Schicht davon',
      'Selbst angegebene Fähigkeiten und Abzeichen, im Nachhinein durch Kundenbewertungen bestätigt',
      'Treuhand nach Stunden oder Festpreis; Umfangsstreitigkeiten werden im Einzelfall geklärt',
      'Für Remote-Arbeit gebaut — es gibt keine Prüfebene vor Ort',
      'Die Plattformgebühr ist veröffentlicht, die Qualität der Ingenieure schwankt jedoch stark',
    ],
    themWhen: [
      'Die Arbeit ist vollständig remote — ein kleines HMI-Bild, ein Bericht, ein einmaliges Skript',
      'Das Budget ist so klein, dass eine Fehlbesetzung Stunden kostet, nicht Tage Stillstand',
      'Sie haben intern die Fachkenntnis, den Ingenieur selbst zu beurteilen',
    ],
    usWhen: [
      'Jemand muss tatsächlich im Werk sein, und Sie brauchen den Nachweis dafür',
      'Sie können selbst nicht beurteilen, ob der Ingenieur Siemens oder Rockwell ausreichend beherrscht',
      'Eine gescheiterte Inbetriebnahme bedeutet Produktionsstillstand, nicht nur eine vergeudete Rechnung',
    ],
    faqs: [
      {
        q: 'Haben allgemeine Plattformen nicht auch Treuhand?',
        a: 'Doch — Festpreis-Treuhand ist dort üblich, Treuhand allein ist also nicht der Unterschied. Der Unterschied ist, was gelten muss, bevor ein Ingenieur überhaupt beauftragt werden kann: Bei Talengineer muss er eine Plattform-Zertifizierung halten, und Arbeiten vor Ort tragen GPS- und Fotonachweise.',
      },
      {
        q: 'Ist Ihr Ingenieurpool kleiner?',
        a: 'Deutlich kleiner, und zwar absichtlich. Jeder gelistete Ingenieur hat einen praxisnahen KI-Techniktest bestanden, und nur zertifizierte Ingenieure können einem Projekt zugewiesen werden. Wir geben Ihnen lieber fünf Ingenieure, die die Aufgabe können, als fünfhundert Profile zum Durchsortieren.',
      },
      {
        q: 'Kann ich trotzdem jemanden für eine kleine Remote-Aufgabe beauftragen?',
        a: 'Sie können, zahlen aber womöglich für eine Prüfung, die Sie nicht brauchen. Für eine schnelle Remote-Aufgabe ist eine allgemeine Plattform die praktischere Wahl — wir sind für Arbeiten gebaut, bei denen ein Fehler teuer ist.',
      },
    ],
  },
  'direct-hire': {
    label: 'im Vergleich zur Festanstellung',
    metaTitle: 'Automatisierungsingenieur fest anstellen oder über eine Plattform beauftragen?',
    metaDesc: 'Festanstellung lohnt sich bei durchgehender Automatisierungsarbeit. Bei projektförmiger Arbeit entscheiden Startzeit und Leerlauf.',
    question: 'Sollte ich einen Automatisierungsingenieur fest anstellen oder über eine Plattform beauftragen?',
    answer: 'Stellen Sie fest an, wenn die Arbeit durchgehend anfällt — ein Werk mit Automatisierungsaufgaben das ganze Jahr über, wo ein interner Ingenieur Wissen über Ihre Maschinen aufbaut. Beauftragen Sie über eine Plattform, wenn die Arbeit projektförmig ist: eine Modernisierung, ein Inbetriebnahmefenster, eine Linienverlagerung. Ausschlaggebend sind meist Zeit und Leerlauf: In den USA dauert die Besetzung einer Automatisierungsstelle rund zwei Monate Recruiting, bevor überhaupt jemand anfängt, und danach tragen Sie Gehalt, Nebenkosten und die Lücken zwischen Projekten. Eine Plattform-Beauftragung startet in Tagen, und Sie zahlen nur die Meilensteine, die Sie finanzieren.',
    them: [
      'Wer sich auf Ihrem lokalen Arbeitsmarkt bewirbt, in erreichbarer Entfernung',
      'Gespräche und Referenzen — und die Kosten einer Fehlbesetzung tragen Sie',
      'Gehalt, Nebenleistungen und Lohnnebenkosten, unabhängig davon, ob gerade ein Projekt läuft',
      'Die Person arbeitet direkt für Sie, Verifizierung ist damit kein separates Thema',
      'Vollständig transparent — es ist Ihre eigene Lohnabrechnung',
    ],
    themWhen: [
      'Es fällt ganzjährig Automatisierungsarbeit an, kein Projekt mit Endtermin',
      'Das Wissen lohnt sich intern aufzubauen — Ihre Maschinen, Ihre Historie, Ihre Eigenheiten',
      'Sie brauchen jemanden, der zu jeder Stunde auf einen Linienstillstand reagieren kann',
    ],
    usWhen: [
      'Die Arbeit ist ein Projekt mit Ende: Modernisierung, Inbetriebnahme, Linienverlagerung',
      'Sie brauchen eine Spezialisierung, die Sie nie fest vorhalten würden — Machine Vision, eine bestimmte Robotermarke',
      'Der Standort liegt in einem anderen Land, und lokal einzustellen hieße, dort zuerst eine Gesellschaft zu gründen',
    ],
    faqs: [
      {
        q: 'Wie schnell kann ein Ingenieur tatsächlich anfangen?',
        a: 'Das Matching läuft innerhalb von etwa 48 Stunden nach Ausschreibung; der Starttermin hängt von der Verfügbarkeit des Ingenieurs sowie von Zutritts- oder Visumsanforderungen ab. Zum Vergleich: rund zwei Monate Recruiting, um eine Automatisierungsstelle in den USA zu besetzen.',
      },
      {
        q: 'Kann ein beauftragter Ingenieur fest übernommen werden?',
        a: 'Ja, ohne Vermittlungsgebühr — die Plattformgebühr gilt für treuhänderisch hinterlegte Meilensteine, nicht für Ihre Personalentscheidungen.',
      },
      {
        q: 'Und das Wissen, das im Haus bleiben soll?',
        a: 'Das ist ein echter Vorteil der Festanstellung, und wir werden das nicht bestreiten. Projektdokumentation, Check-in-Fotos und Qualitätsnachweise bleiben nach Projektabschluss in Ihrem Konto, ersetzen aber niemanden, der Ihr Werk seit drei Jahren fährt.',
      },
    ],
  },
  'automate-america': {
    label: 'im Vergleich zu Automate America',
    metaTitle: 'Talengineer und Automate America im Vergleich — was passt zu Ihrem Projekt?',
    metaDesc: 'Automate America ist für stundenbasierte Automatisierungsvermittlung in den USA gebaut. Talengineer für grenzüberschreitende Projektabwicklung mit Zertifizierungspflicht und Meilenstein-Treuhand.',
    question: 'Talengineer und Automate America: was passt zu Ihrem Projekt?',
    answer: 'Automate America passt gut, wenn Sie in den USA ansässige Automatisierungs-Auftragnehmer auf Stundenbasis benötigen, mit digitalen Stundenzetteln und schnellen Auszahlungen — dafür ist die Plattform gebaut und dort etabliert. Talengineer ist für eine andere Art von Arbeit gebaut: grenzüberschreitende Projekte in neun Sprachen, Ingenieure, die vor jeder Beauftragung eine Plattform-Zertifizierung bestehen müssen, und Meilenstein-Treuhand, bei der Ihr Geld erst nach Ihrer Abnahme freigegeben wird. Wenn Ihre Aufgabe US-lokale Vermittlung nach Aufwand ist, passen sie besser. Handelt es sich um ein Projekt mit definiertem Umfang — besonders über eine Grenze hinweg — liegt der Unterschied in Prüfung und Zahlungsmodell.',
    them: [
      'Nordamerika, auf Englisch',
      'Nach eigener Darstellung: verifizierte Profile, dokumentierte Arbeitshistorie und Bewertungen früherer Kunden; eine plattformeigene Zertifizierungsprüfung wird nicht veröffentlicht',
      'Stundenbasiert nach Aufwand. Nach eigener Beschreibung nimmt die Plattform einen Prozentsatz des Stundensatzes, bevor der Auftrag im Marktplatz gezeigt wird; der Prozentsatz wird nicht veröffentlicht',
      'Digitale Stundenzettel mit Freigabeprozess des Kunden; eine Standortverifizierung wird nicht veröffentlicht',
      'Kostenloser Beitritt für alle Seiten, kein Abonnement; der einbehaltene Prozentsatz wird nicht veröffentlicht',
    ],
    themWhen: [
      'Sie brauchen einen in den USA ansässigen Auftragnehmer auf Stundenbasis, mit schnellstmöglichem Start',
      'Sie möchten, dass die Plattform Rechnungsstellung, Lohnabrechnung, Nebenleistungen und Compliance übernimmt (deren Managed Service)',
      'Sie wollen den Auftragnehmer später fest übernehmen',
    ],
    usWhen: [
      'Das Projekt überschreitet eine Grenze oder eine Sprache — ein Werk in Mexiko, Vietnam oder Thailand, der Auftraggeber anderswo',
      'Sie wollen Kompetenz vor der Beauftragung nachgewiesen sehen, durch eine Zertifizierungsprüfung statt durch nachträgliche Bewertungen',
      'Sie wollen Mittel in Treuhand, freigegeben je abgenommenem Meilenstein, mit geld-zurück-garantiertem ersten Meilenstein',
    ],
    faqs: [
      {
        q: 'Ist Automate America ein Wettbewerber?',
        a: 'In einem Teil des Marktes ja — bei US-lokaler Automatisierungsvermittlung. Bei grenzüberschreitender Projektabwicklung, Koordination in neun Sprachen, zertifizierungsgebundener Beauftragung und Meilenstein-Treuhand lösen wir ein anderes Problem.',
      },
      {
        q: 'Was ist günstiger?',
        a: 'Beides lässt sich nicht Satz gegen Satz vergleichen, weil die Gebührenmodelle unterschiedlich sind. Talengineer veröffentlicht 15% je freigegebenem Meilenstein (5% für Gründungskunden bei den ersten 5 Aufträgen). Automate America beschreibt, einen Prozentsatz des Stundensatzes einzubehalten, bevor der Auftrag den Marktplatz erreicht, und veröffentlicht diesen Prozentsatz nicht.',
      },
      {
        q: 'Kann ich beide nutzen?',
        a: 'Ja, und für viele Hersteller ist genau das die sinnvolle Antwort — ein US-lokaler Auftragnehmer auf Stundenbasis für die laufende Unterstützung, und ein umfangsdefiniertes Treuhandprojekt für Werksaufbau oder Modernisierung im Ausland.',
      },
    ],
  },
  'field-nation': {
    "label": "vs. Field Nation",
    "metaTitle": "Talengineer vs. Field Nation – was passt besser zu Ihrem Projekt?",
    "metaDesc": "Field Nation ist ein auf die USA fokussierter Marktplatz für IT-Vor-Ort-Techniker, die pro Arbeitsauftrag abgerechnet werden. Talengineer ist für grenzüberschreitende, zertifizierungspflichtige Projekte der industriellen Automatisierung mit Meilenstein-Treuhandkonto konzipiert.",
    "question": "Talengineer vs. Field Nation: Was passt besser zu Ihrem Projekt?",
    "answer": "Field Nation eignet sich gut, wenn Sie auf die USA fokussierte IT-Vor-Ort-Techniker benötigen – Netzwerktechnik, Verkabelung, Kassensysteme, digitale Beschilderung, Sicherheitsinstallationen –, die schnell aus einem riesigen bestehenden Pool vermittelt werden (über eine Million Arbeitsaufträge pro Jahr an über 600.000 Standorten), mit einer einfachen, veröffentlichten Gebühr von 10%, die auf Seiten des Technikers abgezogen wird. Talengineer ist für eine andere Art von Arbeit gebaut: zertifizierte Ingenieure für industrielle Automatisierung – SPS, Robotik, Machine Vision, Elektrotechnik – in den USA, Mexiko, Vietnam, Thailand und China, die in neun Sprachen arbeiten, wo eine Plattformzertifizierungsprüfung erforderlich ist, bevor jemand eingesetzt werden kann – nicht nur ein Profil, Bewertungen und eine optionale Hintergrundprüfung –, und Ihr Geld liegt in einem Meilenstein-Treuhandkonto, das erst freigegeben wird, nachdem Sie die Arbeit abgenommen haben, statt dem Techniker in einem wöchentlichen Zahlungsziel-Zyklus ausgezahlt zu werden. Wenn Ihr Auftrag ein lokaler US-IT-Vor-Ort-Service ist, der pro Arbeitsauftrag abgerechnet wird, ist Field Nation die bessere Wahl. Wenn es sich um ein klar abgegrenztes Automatisierungsprojekt handelt – insbesondere eines, das eine Grenze überschreitet, oder eines, bei dem Sie die Kompetenz vor der Zuweisung nachgewiesen haben wollen statt danach –, unterscheiden wir uns bei der Verifizierung und beim Zahlungsmodell.",
    "them": [
      "Auf die USA fokussiert – die eigenen Seiten beschreiben die Abdeckung nach US-Bundesstaat und Postleitzahl, mit gelegentlichen Erwähnungen von Nordamerika/Kanada („in den USA und Kanada“); es wird keine internationale oder globale Abdeckung beansprucht. Die Techniker decken IT-/Vor-Ort-Spezialgebiete ab – Netzwerktechnik, Verkabelung, Kassensysteme, digitale Beschilderung, Computer und Drucker, Sicherheit – nicht industrielle Automatisierung.",
      "Selbst angegebene Profile (Fähigkeiten, Zertifizierungen, Berufserfahrung), Käuferbewertungen/Rezensionen sowie ein proprietärer „Provider Match“-Ranking-Algorithmus plus ein „Success Score“. Hintergrundprüfungen und Drogentests (über einen Drittanbieter-Partner abgewickelt) sind nur bei Arbeitsaufträgen erforderlich, die dies verlangen – nach eigenen Angaben 76% davon –, nicht bei jedem Auftrag, und auf der eigenen Website wird keine von der Plattform selbst durchgeführte Zertifizierungsprüfung beschrieben.",
      "Kein Meilenstein-Treuhandkonto. Käufer zahlen entweder ein Field-Nation-Konto im Voraus ein – laut eigenen Käuferbedingungen als ein einziges Treuhandkonto geführt, das mit den Geldern anderer Käufer vermischt wird – oder nutzen Zahlungsziele von netto 7/14/21/28 Tagen; Techniker werden erst in einem wöchentlichen Zyklus bezahlt, sobald die Zahlung des Käufers verarbeitet wurde. Bei Aufträgen mit Zahlungsziel trägt der Techniker bis dahin also das Ausfallrisiko des Käufers. Käufern aus Kalifornien ist die Vorabfinanzierung seit März 2021 untersagt; sie müssen stattdessen nach Abnahme der Arbeit zahlen.",
      "Ein Check-in-/Check-out-Schritt, eine mit dem jeweiligen Arbeitsauftrag verknüpfte Fotodokumentation in der App sowie die Erfassung einer elektronischen Unterschrift vor Ort. GPS wird als Mittel zur Auftragssuche und Kilometererfassung beschrieben; ob das Check-in selbst per GPS verifiziert wird, wird auf den öffentlichen Seiten nicht beschrieben – nicht veröffentlicht.",
      "Die Gebühr auf Seiten des Technikers ist veröffentlicht und einfach: pauschal 10% des finalen Zahlungsbetrags des Arbeitsauftrags, oder 13.9% bei der optionalen Pro-Stufe (10% Basis plus 3.9% Aufschlag), zuzüglich optionaler Versicherungszusätze (1.95% für die allgemeine Haftpflichtdeckung der Plattform, 1% oder 0.5% für eine Berufsunfallversicherung). Was Käufern/Unternehmen berechnet wird, ist nicht veröffentlicht – die Tarife werden als abonnementbasiert beschrieben, mit Preisen nur auf Anfrage beim Vertrieb."
    ],
    "themWhen": [
      "Sie benötigen lokalen IT-Vor-Ort-Service in den USA oder Nordamerika – Netzwerktechnik, Verkabelung, Kassensysteme, digitale Beschilderung, Installation von Sicherheitskameras – keine industrielle Automatisierung.",
      "Sie möchten Zugang zu einem bereits riesigen Techniker-Pool (über 1 Mio. Arbeitsaufträge pro Jahr, über 600.000 Standorte), und Geschwindigkeit ist Ihnen wichtiger als der Nachweis der Kompetenz durch eine Zertifizierungsprüfung vor der Zuweisung.",
      "Als Käufer möchten Sie den Nennwert des Arbeitsauftrags ohne separaten Plattformgebühren-Posten zahlen – der Anteil von Field Nation wird von der Auszahlung des Technikers abgezogen, nicht Ihnen berechnet."
    ],
    "usWhen": [
      "Das Projekt überschreitet eine Grenze oder eine Sprache – etwa ein Werk in Mexiko, Vietnam oder Thailand mit einem Käufer anderswo – außerhalb des auf USA/Nordamerika fokussierten Netzwerks von Field Nation.",
      "Sie möchten, dass Kompetenz durch eine Zertifizierungsprüfung vor der Zuweisung nachgewiesen wird, statt durch ein selbst angegebenes Profil plus Bewertungen und eine optionale, auftragsabhängige Hintergrundprüfung.",
      "Sie möchten, dass Ihre Mittel in einem Meilenstein-Treuhandkonto gehalten und erst nach Ihrer Abnahme der Arbeit freigegeben werden, statt in einem wöchentlichen Zahlungsziel-Zyklus, in dem der Techniker bis zum Geldeingang Ihr Ausfallrisiko trägt."
    ],
    "faqs": [
      {
        "q": "Ist Field Nation ein Konkurrent?",
        "a": "Bei der IT-Vor-Ort-Servicevermittlung – Netzwerktechnik, Verkabelung, Kassensysteme, Sicherheitsinstallationen, abgerechnet pro Arbeitsauftrag – ja. Bei zertifizierungspflichtigen Projekten der industriellen Automatisierung mit Meilenstein-Treuhandkonto und grenzüberschreitender, mehrsprachiger Umsetzung lösen wir ein anderes Problem."
      },
      {
        "q": "Welches ist günstiger?",
        "a": "Man kann die Tarife nicht direkt vergleichen – die Gebühr wird jeweils bei einer anderen Partei erhoben. Field Nation zieht pauschal 10% von der Auszahlung des Technikers ab (13.9% bei der optionalen Pro-Stufe) und veröffentlicht nicht, was – wenn überhaupt – Käufern über den Nennwert des Arbeitsauftrags hinaus berechnet wird; Käufertarife sind abonnementbasiert und werden vom Vertrieb angeboten. Talengineer veröffentlicht seine Gebühr direkt gegenüber dem Käufer: 15% jedes freigegebenen Meilensteins (5% für Gründungskunden bei ihren ersten 5 Aufträgen), sichtbar, bevor Sie sich verpflichten."
      },
      {
        "q": "Kann ich beide nutzen?",
        "a": "Ja – für viele Unternehmen ist genau das die praktische Aufteilung: Field Nation für die lokale IT-/Vor-Ort-Techniker-Vermittlung in den USA und Talengineer für ein zertifiziertes, durch Treuhand geschütztes Automatisierungsprojekt, insbesondere wenn es eine Grenze überschreitet."
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer vs WorkMarket – was passt besser zu Ihrem Projekt?",
    "metaDesc": "WorkMarket (im Besitz von ADP) ist eine reine US-Plattform zur Verwaltung großer Pools von 1099-Auftragnehmern. Talengineer ist für grenzüberschreitende Automatisierungsprojekte mit Zertifizierungspflicht und Meilenstein-Treuhand (milestone escrow) konzipiert.",
    "question": "Talengineer vs WorkMarket: Was passt besser zu Ihrem Projekt?",
    "answer": "WorkMarket, im Besitz von ADP, ist für US-Unternehmen konzipiert, die einen großen bestehenden Pool von 1099-Auftragnehmern betreiben – mit Massen-Onboarding, Background-Checks und Kompetenztests, die pro Jobkategorie konfiguriert werden, automatisierter 1099-NEC-Steuererklärung und schnellen Auszahlungen in Kategorien wie IT-Vor-Ort-Service, Kurierdienste und Sicherheitsdienste. Die eigenen Nutzungsbedingungen besagen, dass die Plattform 'nicht für die Nutzung durch Kunden außerhalb der Vereinigten Staaten vorgesehen ist', und die einzige veröffentlichte Gebührenzahl ist eine optionale Gebühr von 2.5%, die dem Arbeitnehmer für vorzeitige Auszahlung berechnet wird – die reguläre kundenseitige Plattformgebühr wird pro Auftrag festgelegt und nicht offengelegt. Talengineer ist für eine andere Art von Arbeit konzipiert: ein industrielles Automatisierungsprojekt mit klar definiertem Umfang, oft grenzüberschreitend, bei dem der Ingenieur eine Plattformzertifizierung (platform certification) besitzen muss, bevor ihm überhaupt etwas zugewiesen wird, und bei dem Ihr Geld in einer Meilenstein-Treuhand (milestone escrow) liegt, die erst nach Ihrer Freigabe ausgezahlt wird. Wenn Sie eine inländische Contingent Workforce im großen Maßstab verwalten, sind die Tools von WorkMarket dafür ausgereifter. Wenn Ihr Projekt ein SPS-, Robotik- oder Machine-Vision-Projekt ist, das vorab verifizierte Fähigkeiten und Zahlungsschutz benötigt, dann ist genau dafür Talengineer gebaut.",
    "them": [
      "Nur US-Kunden. Die Nutzungsbedingungen besagen, dass die Plattform 'nicht für die Nutzung durch Kunden außerhalb der Vereinigten Staaten vorgesehen ist', und eine Unternehmensseite von WorkMarket vermerkt, dass sie 'derzeit nur Unternehmen mit einer US-Rechtseinheit unterstützt'. Auszahlungen an Auftragnehmer werden als Erreichen 'fast jedes Ortes der Welt' beschrieben, aber wer auf der Plattform einkaufen kann, ist auf die USA beschränkt.",
      "Background-Checks und Drogentests laufen über eine externe Auskunftei (ausgelöst durch die schriftliche Zustimmung des Arbeitnehmers selbst), zusätzlich zu Lizenz-/Zertifizierungsprüfungen, Steuer-ID-/Bankverifizierung und 'anpassbaren Tests zur Bewertung der Arbeitnehmerfähigkeiten', die der Kunde über seine eigenen 'Labor Clouds' pro Jobkategorie einrichtet. Es wird keine von der Plattform verwaltete Zertifizierungsprüfung als Voraussetzung für die Zuweisung eines Arbeitnehmers veröffentlicht.",
      "Abrechnung nach Zeit und Material pro Auftrag: Der Kunde stellt einen Auftragswert (Assignment Value) ein, und laut den Nutzungsbedingungen ist der Kunde 'verpflichtet, den unabhängigen Arbeitnehmer für einen Auftrag zu bezahlen, sobald dieser Auftrag zu einem genehmigten Auftrag (Approved Assignment) wird' – also wenn der Kunde ihn als abgeschlossen markiert. Nirgendwo in den Nutzungsbedingungen wird eine Treuhandregelung beschrieben, und sobald eine Belastung erfolgt ist, 'ist diese Belastung oder Abbuchung nicht erstattungsfähig, außer soweit geltendes Recht dies untersagt'.",
      "Eine mobile App für Arbeitnehmer mit Check-in/Check-out, Geofencing (auf der IT-Vor-Ort-Service-Seite ausdrücklich genannt), Foto- und Dokumenten-Upload als Liefergegenstände sowie Erfassung elektronischer Unterschriften.",
      "Die reguläre kundenseitige 'Plattformgebühr' wird pro Auftrag festgelegt, und die Nutzungsbedingungen besagen: 'WorkMarket behält sich das Recht vor, die Plattformgebühr jederzeit zu ändern' – der Prozentsatz selbst wird nicht veröffentlicht. Die einzige in den Nutzungsbedingungen offengelegte Gebührenzahl ist eine Gebühr von 2.5%, die dem Arbeitnehmer für den optionalen vorzeitigen Zugriff auf Gelder (FastFunds) berechnet wird; für die reguläre Preisgestaltung muss ansonsten der Vertrieb für ein Angebot kontaktiert werden."
    ],
    "themWhen": [
      "Sie sind ein US-Unternehmen, das einen großen bestehenden Pool von 1099-Auftragnehmern über viele Jobkategorien hinweg verwaltet – IT-Vor-Ort-Techniker, Kurierfahrer, Fahrer, Sicherheitspersonal, Dolmetscher – und Massen-Onboarding plus automatisierte 1099-NEC-Steuererklärung benötigen.",
      "Sie möchten Ihre eigenen Prüfregeln pro Jobkategorie festlegen – Background-Checks, Drogentests, individuelle Kompetenztests – statt vor der Zuweisung eine vorab ausgestellte Plattformzertifizierung zu verlangen.",
      "Sie möchten schnelle, flexible Auszahlungen an Arbeitnehmer (ACH, Pay Card, PayPal, optionaler vorzeitiger Zugriff auf Gelder) für ein hohes Volumen kurzer Zeit-und-Material-Aufträge."
    ],
    "usWhen": [
      "Das Projekt überschreitet eine Landesgrenze – die eigenen Nutzungsbedingungen von WorkMarket beschränken die Plattform auf in den USA ansässige Kunden; unsere Ingenieure arbeiten in neun Sprachen über die USA, Mexiko, Vietnam, Thailand und China hinweg.",
      "Sie möchten, dass Fähigkeiten durch eine verpflichtende Zertifizierungsprüfung vor der Zuweisung nachgewiesen werden – nicht durch Background-Checks und vom Kunden konfigurierte Tests, die erst angewendet werden, nachdem ein Arbeitnehmer bereits im Pool ist.",
      "Sie möchten, dass Gelder treuhänderisch verwahrt und erst nach Ihrer Freigabe jedes Meilensteins ausgezahlt werden, mit Geld-zurück-Garantie beim ersten Meilenstein – nicht ein Zahlung-bei-Freigabe-Modell, bei dem Belastungen nach der Ausführung nicht erstattungsfähig sind."
    ],
    "faqs": [
      {
        "q": "Ist WorkMarket ein Wettbewerber?",
        "a": "In einem Teil des Marktes ja – bei der großflächigen Verwaltung einer inländischen US-Contingent-Workforce. Bei grenzüberschreitender Projektabwicklung, zertifizierungsgebundener Zuweisung und Meilenstein-Treuhand lösen wir ein anderes Problem."
      },
      {
        "q": "Welches ist günstiger?",
        "a": "Beide sind nicht direkt vergleichbar, weil WorkMarket seine reguläre Plattformgebühr nicht veröffentlicht – die Nutzungsbedingungen legen nur eine optionale Gebühr von 2.5% offen, die Arbeitnehmern für vorzeitigen Zugriff auf Zahlungen (FastFunds) berechnet wird. Talengineer veröffentlicht seine Gebühr von vornherein: 15% jedes freigegebenen Meilensteins, 5% für Gründungskunden bei ihren ersten 5 Aufträgen."
      },
      {
        "q": "Kann ich beide nutzen?",
        "a": "Ja. Viele Hersteller betreiben eine Plattform wie WorkMarket für ihren großen US-basierten Pool an Vor-Ort-Service- oder IT-Auftragnehmern und nutzen Talengineer separat für ein Automatisierungsprojekt mit klar definiertem Umfang – besonders eines, das eine Grenze überschreitet und zertifizierte Fähigkeiten mit treuhänderisch verwahrten Meilensteinen benötigt."
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork – was passt besser zu Ihrem Projekt?",
    "metaDesc": "Upwork ist ein universeller, globaler Freelance-Marktplatz für Tausende Fähigkeiten. Talengineer ist für Industrieautomatisierungsprojekte mit Pflichtzertifizierung, Meilenstein-Treuhand und Vor-Ort-Verifizierung gebaut.",
    "question": "Talengineer vs Upwork: Was passt besser zu Ihrem Projekt?",
    "answer": "Upwork eignet sich gut, wenn Sie für nahezu jede Art von Remote-Arbeit Personal suchen, nicht nur für Automatisierungstechnik: Es ist ein universeller Marktplatz mit über 18 Millionen Freelancern in mehr als 180 Ländern und Tausenden Skill-Kategorien, mit veröffentlichten, festen Gebührenstufen und einem eigenen Treuhandsystem für Festpreis-Meilensteine – diese Größenordnung und Reife sind real. Talengineer ist enger, aber tiefer aufgestellt: ausschließlich zertifizierte Industrieautomatisierungs-Ingenieure – SPS, Robotik, Machine Vision, Elektrotechnik – die eine Plattformzertifizierung bestehen müssen, bevor sie überhaupt eingesetzt werden können, mit Service in neun Sprachen sowie GPS-Geofencing-Check-ins und Foto-Qualitätskontrolle für Arbeiten vor Ort. Wenn Sie universelle Remote-Arbeit suchen, ist die Breite von Upwork kaum zu erreichen. Wenn es sich um ein klar abgegrenztes Industrieautomatisierungsprojekt handelt – besonders eines mit physischen, vor Ort zu erbringenden und zu verifizierenden Ergebnissen – liegt der Unterschied bei uns in der Kompetenzprüfung vor der Zuweisung und im Vor-Ort-Nachweis.",
    "them": [
      "Ein universeller globaler Marktplatz, nicht spezifisch für Industrieautomatisierung: nach eigenen Angaben über 18 Millionen Freelancer in mehr als 180 Ländern und Tausende Skill-Kategorien",
      "Identität und Standort jedes Freelancers werden verifiziert, bevor ein Kunde Kontakt aufnehmen kann, und Profile zeigen verifizierte Bewertungen und Arbeitshistorie. Eine tiefergehende Kompetenzprüfung – das „Expert-Vetted“-Abzeichen, das durch ein Auswahlgespräch, Skill-Tests und eine Portfolio- oder Code-Bewertung erworben wird – ist optional, auf bestimmte Kategorien beschränkt und laut Upworks eigener Beschreibung nur für Business-Plus- und Enterprise-Kunden sichtbar; die meisten Freelancer müssen nie eine Prüfung bestehen, bevor sie Aufträge annehmen",
      "Festpreisarbeit ist durch „project funds“ abgesichert (Upworks aktuelle Bezeichnung für Treuhand): Der Kunde finanziert einen Meilenstein, bevor die Arbeit beginnt, und das Geld wird freigegeben, sobald der Kunde ihn genehmigt oder ein 14-tägiges Prüffenster automatisch endet. Arbeit nach Stunden wird separat abgesichert, über die Zeiterfassungs-App Work Diary statt über Treuhand. Darüber hinaus werden Rückerstattungen im Einzelfall innerhalb von 180 Tagen beantragt und liegen im Ermessen des Freelancers; eine Geld-zurück-Garantie für den ersten Meilenstein wird nicht veröffentlicht",
      "Nicht veröffentlicht. Upworks eigene Vertrauens- und Sicherheitsseiten beschreiben Konto- und Datensicherheit – Zwei-Faktor-Authentifizierung, Verschlüsselung, Malware-Scans – ohne GPS-Check-ins, Geofencing oder Fotoverifizierung für persönliche oder Vor-Ort-Arbeit zu erwähnen",
      "Auf Kundenseite veröffentlicht und gestaffelt: 5% Marketplace-Gebühr im Basic-Plan (3% für berechtigte US-Kunden, die per Banküberweisung zahlen) oder 10% im Business-Plus-Plan (8% bei Berechtigung), zuzüglich einer einmaligen Vertragsstartgebühr von $0.99–$14.99 pro Vertrag. Die Gebühr auf Freelancer-Seite liegt zwischen 0% und 15% pro Vertrag, festgelegt nach internen, von Upwork nicht veröffentlichten Kriterien, und wird dem Freelancer erst vor der Annahme angezeigt statt als ein fester, öffentlicher Satz"
    ],
    "themWhen": [
      "Sie brauchen Arbeit außerhalb der Industrieautomatisierung – Texten, Design, Marketing, allgemeine Softwareentwicklung, Verwaltung – Kategorien, die Talengineer überhaupt nicht anbietet",
      "Sie wollen sofort den größtmöglichen Talentpool mit einer etablierten Basis an Bewertungen und Ratinghistorie, statt eines engeren, zertifizierten Pools",
      "Ihr Engagement ist zeitlich offene Stundenarbeit statt eines Projekts mit definiertem Umfang – Upworks Work Diary und Stundenabrechnung sind für fortlaufende, dauerhafte Zusammenarbeit gebaut"
    ],
    "usWhen": [
      "Sie brauchen nachgewiesene und vor der Zuweisung geprüfte Kompetenz – eine verpflichtende, speziell auf Industrieautomatisierung zugeschnittene Plattformzertifizierung – statt eines optionalen Abzeichens, das nur für Kunden auf Enterprise-Ebene sichtbar ist und das die meisten Freelancer nie ablegen",
      "Ihr Liefergegenstand ist physisch und vor Ort – eine Werkshalle, eine Nachrüstung, ein Inbetriebnahmetermin – und Sie wollen GPS-Geofencing-Check-ins und Foto-Qualitätskontrolle als Nachweis, was Upworks eigene Vertrauens- und Sicherheitsseiten nicht beschreiben",
      "Sie wollen die Gebühr vor Ihrer Zusage als einen einzigen, klar nennbaren Festprozentsatz veröffentlicht sehen, dazu eine Geld-zurück-Garantie auf den ersten Meilenstein – statt eines Freelancer-seitigen Satzes von 0%-15%, der nach nicht veröffentlichten Kriterien festgelegt wird, und ohne plattformweite Rückerstattungsgarantie"
    ],
    "faqs": [
      {
        "q": "Ist Upwork ein Wettbewerber?",
        "a": "Bei universeller Freelance-Vermittlung, ja – es ist einer der größten Marktplätze der Welt. Bei der Abwicklung zertifizierungspflichtiger Industrieautomatisierungsprojekte mit Vor-Ort-Verifizierung lösen wir ein engeres, anderes Problem, für das Upwork nicht speziell gebaut ist."
      },
      {
        "q": "Welches ist günstiger?",
        "a": "Die Gebührenstrukturen sind nicht direkt vergleichbar. Talengineer veröffentlicht 15% jedes freigegebenen Meilensteins (5% für Gründungskunden bei ihren ersten 5 Aufträgen). Upworks Kundengebühr beträgt 5% im Basic-Plan oder 10% im Business-Plus-Plan (3%/8% für berechtigte US-Kunden mit Banküberweisung), zuzüglich einer einmaligen Vertragsstartgebühr; der Freelancer zahlt separat 0%-15% seines eigenen Verdienstes, festgelegt nach Kriterien, die Upwork nicht veröffentlicht."
      },
      {
        "q": "Kann ich beide nutzen?",
        "a": "Ja. Viele Auftraggeber nutzen Upwork für allgemeine Remote-Arbeit – Verwaltung, Marketing, Software – und Talengineer gezielt für zertifizierungspflichtige Automatisierungstechnik, besonders bei Projekten mit physischen, vor Ort zu erbringenden Ergebnissen."
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer vs Toptal — was passt besser zu Ihrem Projekt?",
    "metaDesc": "Toptal ist ein geprüftes Netzwerk für stundenweise abgerechnete Remote-Wissensarbeit — Entwickler, Designer, Finance, PM. Talengineer ist für zertifizierungspflichtige, meilenstein-treuhänderisch abgesicherte Industrieautomatisierungsprojekte konzipiert.",
    "question": "Talengineer vs Toptal: Was passt besser zu Ihrem Projekt?",
    "answer": "Toptal ist die richtige Wahl, wenn Sie eine einzelne geprüfte Fachkraft brauchen — Entwickler, Designer, Product Manager oder Finanzanalyst —, stundenweise abgerechnet, mit einer risikofreien Testphase, bevor Sie sich festlegen. Genau dafür ist die Plattform gebaut: ein fünfstufiger Auswahltrichter beim Netzwerkeintritt (die eigenen veröffentlichten Zahlen beziffern die Gesamtannahmequote auf unter 3% der monatlichen Bewerber) sowie ein von Grund auf remote-orientiertes Netzwerk in mehr als 100 Ländern. Talengineer ist für eine andere Art von Arbeit gebaut: Industrieautomatisierungsprojekte — SPS, Robotik, Machine Vision, Elektrik —, bei denen jeder Ingenieur eine Plattformzertifizierung (L1-L3, KI-bewertet und von Menschen geprüft) bestehen muss, bevor er irgendetwas zugewiesen bekommt; die Arbeit wird pro genehmigtem Meilenstein finanziert und freigegeben statt stundenweise abgerechnet, und Arbeiten vor Ort werden durch GPS-Geofencing-Check-ins und Foto-Qualitätskontrolle als Nachweis abgesichert. Wenn Ihre Arbeit remote und stundenweise abgerechnete Wissensarbeit ist, ist Toptals Modell aus Testphase und Einstellung die bessere Wahl. Wenn es sich um ein Automatisierungsprojekt mit klar definiertem Umfang handelt — insbesondere eines, das in einer Fabrikhalle stattfindet —, liegt genau dort unser Unterschied: Zertifizierungspflicht und Meilenstein-Treuhand.",
    "them": [
      "Experten in über 100 Ländern — die meisten mit Sitz in Amerika und Europa — die nach eigenen Angaben Kunden in mehr als 140 Ländern bedienen und Softwareentwicklung, Design, Finanzen sowie Produkt-/Projektmanagement abdecken; eine eigene Kategorie für Industrieautomatisierung, SPS, Robotik oder Machine Vision wird nicht aufgeführt, und außer der Englisch-Sprachprüfung während des Auswahlprozesses wird keine Zahl zur Sprachabdeckung veröffentlicht",
      "Eine einmalige, fünfstufige Prüfung beim Netzwerkeintritt, gemäß dem von Toptal selbst veröffentlichten Trichter: Sprache und Kommunikation (26.4% Bestehensquote), eingehende Kompetenzprüfung (7.4%), ein Live-Fachgespräch (3.6%), danach ein 1-3-wöchiges Testprojekt (3.2%) — insgesamt werden weniger als 3% der monatlichen Bewerber angenommen; die Prüfung findet einmalig bei der Aufnahme ins Netzwerk statt, nicht pro Kunde oder pro Fähigkeit, und es wird keine separate Plattformzertifizierungsprüfung veröffentlicht",
      "Stundenweise Abrechnung zu einem Mischsatz, zweimal monatlich mit Net-10-Zahlungsziel in Rechnung gestellt, plus eine pauschale Abonnementgebühr von $79/Monat, sobald Sie zum Talent-Matching übergehen; das Risiko wird durch eine risikofreie Testphase von bis zu zwei Wochen abgedeckt (mit bis zu drei Kandidaten pro Rolle), bei der Ihnen bei Unzufriedenheit nichts berechnet wird — die eigenen FAQ verwenden weder das Wort „Treuhand“ (escrow) noch „Meilenstein“ (milestone)",
      "Von Grund auf remote-orientiert — nach eigenen Worten arbeitet „die überwiegende Mehrheit remote aus dem Homeoffice oder einem Coworking-Space“ —, Arbeit vor Ort wird als seltene Ausnahme im Einzelfall beschrieben; es wird kein System zur Standortverifizierung, Geofencing oder Foto-Qualitätskontrolle veröffentlicht",
      "Die Abonnementgebühr von $79/Monat ist veröffentlicht; die Stundensätze werden als „gemischt“ beschrieben, um die Marge von Toptal einzurechnen, aber der genaue Prozentsatz oder Aufschlag, den die Plattform von diesem Satz einbehält, wird nicht veröffentlicht"
    ],
    "themWhen": [
      "Sie brauchen eine einzelne Remote-Fachkraft für Wissensarbeit — Entwickler, Designer, PM, Finanzanalyst — keinen Industrieautomatisierungsingenieur, und möchten vor einer Festlegung bis zu drei Kandidaten risikofrei testen",
      "Sie wollen eine fortlaufende, stundenweise abgerechnete Zusammenarbeit mit der Option auf eine Festanstellung, statt ein Projekt mit definiertem Umfang und Meilensteinen",
      "Sie wollen ein Netzwerk mit mehrjähriger, etablierter Erfolgsbilanz in über 100 Ländern, das einmalig über einen veröffentlichten fünfstufigen Trichter geprüft wird, statt eine Zertifizierung pro Auftrag"
    ],
    "usWhen": [
      "Ihr Projekt ist Industrieautomatisierung — SPS, Robotik, Machine Vision, Elektrik — eine Kategorie, die Toptal auf der eigenen Website nicht als Spezialgebiet führt",
      "Die Arbeit findet in einer Fabrikhalle oder auf einer Baustelle statt, und Sie wollen GPS-Geofencing-Check-ins und Foto-Qualitätskontrolle als Nachweis, statt eines standardmäßig remote-orientierten Modells",
      "Sie wollen, dass Mittel pro von Ihnen genehmigtem Meilenstein freigegeben werden, mit Geld-zurück-Garantie beim ersten Meilenstein, statt Stundenrechnungen mit Net-10-Zahlungsziel"
    ],
    "faqs": [
      {
        "q": "Ist Toptal ein Wettbewerber?",
        "a": "In einem Teil des Marktes ja — geprüfte, remote, stundenweise abgerechnete Wissensarbeit. Aber speziell bei Industrieautomatisierung — SPS, Robotik, Machine Vision, Elektrik, mit Zertifizierungspflicht und Vor-Ort-Verifizierung — lösen wir ein Problem, auf das die eigene Website von Toptal nicht abzielt."
      },
      {
        "q": "Was ist günstiger?",
        "a": "Die beiden Preismodelle lassen sich nicht Satz für Satz vergleichen. Talengineer veröffentlicht 15% jedes freigegebenen Meilensteins (5% für Gründungskunden bei ihren ersten 5 Aufträgen). Toptal veröffentlicht eine pauschale Abonnementgebühr von $79/Monat plus einen gemischten Stundensatz, der die eigene Marge enthält, veröffentlicht aber nicht, welchen Prozentsatz davon die Plattform einbehält."
      },
      {
        "q": "Kann ich beide nutzen?",
        "a": "Ja. Für viele Fertigungsteams könnte das bedeuten: ein Toptal-Spezialist für angrenzende Software- oder PM-Arbeit und ein zertifizierter Talengineer-Ingenieur für das eigentliche Automatisierungsprojekt vor Ort."
      }
    ]
  },
};

COMPARISONS.ja = {
  'staffing-agency': {
    label: '人材派遣会社との比較',
    metaTitle: '自動化エンジニアは人材派遣会社とプラットフォームのどちらで確保すべきか',
    metaDesc: '産業オートメーションの仕事で人材派遣が適する場面と、マイルストーン型のプラットフォーム調達が適する場面を率直に整理します。',
    question: '自動化エンジニアは人材派遣会社とプラットフォームのどちらで確保すべきですか',
    answer: '来週には現場に人が必要で、その都市に派遣会社の手空き要員がいて、通常は公開されない上乗せ分を支払うことに抵抗がないのであれば、人材派遣会社が適しています。作業範囲が明確な場合、国や言語をまたぐ場合、あるいはアサイン前に「本当にできる人か」の裏付けが必要な場合は Talengineer が適しています。本質的な違いはリスクの所在です。派遣会社は工数を請求し、納品リスクは御社が負います。Talengineer は資金をマイルストーン・エスクローで預かり、御社が承認して初めて支払います。',
    them: [
      '派遣会社が現地で確保できている人材。多くの場合は一言語のみ',
      '書類選考とリクルーターの判断',
      '実費・工数精算。マイルストーンの達成有無にかかわらず工数分は発生します',
      '作業時間表はありますが、現場にいたかどうかの独立した検証はありません',
      'エンジニア単価に上乗せされる分は通常開示されません',
    ],
    themWhen: [
      '数日以内に現場要員が必要で、その都市に派遣会社の体制がある',
      '終わりのある案件ではなく、継続的な保全業務である',
      'その派遣会社と単価も取り決め済みで、すでに関係ができている',
    ],
    usWhen: [
      '案件の範囲が明確で、マイルストーンに分解できる',
      '国や言語をまたぐ——エンジニア・工場・発注者が同じ国にいない',
      'アサイン前に能力を確認し、支払いを検収済みの成果に紐づけたい',
    ],
    faqs: [
      {
        q: 'プラットフォームは人材派遣より安いですか',
        a: '多くの場合は安くなります。手数料が請求単価に埋め込まれず公開されているためです。Talengineer は支払い済みマイルストーンごとに 15%（創業期のお客様は最初の 5 件が 5%）。ただし公平に言えば手数料同士の比較にはなりません。派遣会社は工数を、当社は検収済みマイルストーンを提供しており、買っているものが異なります。',
      },
      {
        q: 'コンプライアンスと保険はどちらが担いますか',
        a: 'エンジニアは KYC を完了し、W-9 と保険証明（COI）は現場作業の前にプラットフォーム側で取得・確認します。派遣会社は通常、契約者を直接雇用してその負担を引き受けます。名義上の雇用主が明確に必要であれば、派遣会社のほうが簡単です。',
      },
      {
        q: 'エンジニアの成果が不十分だった場合は',
        a: 'マイルストーンを承認しないでください。資金はエスクローに留まり、5 日間の証拠提出期間を伴う異議申立てを開始でき、管理者が確認します。初回案件の最初のマイルストーンは返金対応です。',
      },
    ],
  },
  'freelance-marketplace': {
    label: '一般的なフリーランス市場との比較',
    metaTitle: '一般的なフリーランス市場で自動化エンジニアを探さない理由',
    metaDesc: '一般市場は広く安価です。産業オートメーションで足りないのは検証——アサイン前の認定と、現場の証跡です。',
    question: '一般的なフリーランス市場で自動化エンジニアを探せばよいのでは',
    answer: 'リモートで完結する低リスクの作業なら、一般市場は妥当な選択で、探すコストも安く済みます。ただしその市場は「この PLC エンジニアが本当に御社のラインを立ち上げられるか」を教えてくれません。能力は自己申告であり、確認できるのは終わったあとのクライアント評価だけです。Talengineer は意図的に対象を絞っています。登録時に実技型の技術スクリーニングを通過し、アサインの前に L1–L3 の認定を保有していることが必須で、現場作業は GPS チェックインと写真による品質確認で裏づけます。試運転の失敗が数日のライン停止につながる場面では、この検証そのものが商品です。',
    them: [
      '規模は非常に大きいものの大半がリモートやソフトウェア領域で、産業オートメーションはごく薄い層です',
      '自己申告のスキルとバッジ。事後にクライアント評価で確認されます',
      '時間単価または固定価格のエスクロー。範囲に関する争いは個別対応です',
      'リモート作業を前提とした設計で、現場検証の仕組みはありません',
      '手数料は公開されていますが、エンジニアの品質のばらつきは大きいです',
    ],
    themWhen: [
      '作業が完全にリモートで完結する——小さな HMI 画面、レポート、単発のスクリプト',
      '人選を誤っても損失が数時間で済み、数日のライン停止にはならない予算規模',
      'エンジニアを自社で見極められる技術力が社内にある',
    ],
    usWhen: [
      '誰かが実際に工場にいる必要があり、その証跡が必要',
      'Siemens や Rockwell の習熟度をご自身で判断できない',
      '試運転の失敗が生産停止を意味し、単に請求書が無駄になるだけでは済まない',
    ],
    faqs: [
      {
        q: '一般市場にもエスクローはあるのでは',
        a: 'あります。固定価格のエスクローは一般的なので、エスクロー自体は違いではありません。違いは「エンジニアがアサインされる前に何が成立していなければならないか」です。Talengineer では認定の保有が必須で、現場作業には GPS と写真の証跡が伴います。',
      },
      {
        q: 'エンジニアの母集団は小さいのでは',
        a: 'かなり小さく、それは意図的です。掲載されている全員が実技型の AI 技術スクリーニングを通過しており、案件にアサインできるのは認定エンジニアだけです。選別が必要な 500 件のプロフィールより、確実にできる 5 名をお返しします。',
      },
      {
        q: '小さなリモート作業を依頼することもできますか',
        a: '可能ですが、必要のない検証に費用を払っている可能性があります。短時間のリモート作業であれば一般市場のほうが現実的です。当社は「間違いのコストが高い仕事」のために設計されています。',
      },
    ],
  },
  'direct-hire': {
    label: '正社員採用との比較',
    metaTitle: '自動化エンジニアは正社員採用とプラットフォーム活用のどちらが適切か',
    metaDesc: '継続的な制御業務があるなら正社員が合理的です。案件型の仕事では、着手までの時間と稼働の空きが判断を分けます。',
    question: '自動化エンジニアは正社員として採用すべきか、プラットフォームで案件ごとに依頼すべきか',
    answer: '仕事が継続的であれば正社員採用が適しています。年間を通じて制御の業務がある工場では、社内のエンジニアが自社設備の知見を蓄積していきます。一方、改造、試運転の期間、ラインの移設といった案件型の仕事であれば、プラットフォームでの依頼が適しています。判断を分けるのは通常、時間と稼働の空きです。米国で制御エンジニアの職を埋めるには、着任までに採用活動でおよそ 2 か月かかり、採用後は給与・福利厚生に加えて案件と案件の間の空白も負担することになります。プラットフォームでの依頼は数日で開始でき、支払うのは入金したマイルストーンの分だけです。',
    them: [
      '通勤可能な範囲の、地元労働市場で応募してくる方々',
      '面接とリファレンス。採用を誤った場合のコストは御社の負担です',
      '案件の有無にかかわらず発生する給与・福利厚生・社会保険料',
      '直接の指揮命令下にあるため、検証は別問題になりません',
      '完全に透明——御社自身の給与です',
    ],
    themWhen: [
      '終了日のある案件ではなく、年間を通じて制御業務がある',
      '知見を社内に蓄積する価値がある——自社の設備、履歴、固有の癖',
      'ライン停止に時間帯を問わず対応できる人が必要',
    ],
    usWhen: [
      '仕事に終わりがある——改造、試運転、ライン移設',
      '常時抱えることはない専門性が必要——マシンビジョン、特定ロボットメーカー',
      '現場が国外にあり、現地採用には先に法人設立が必要になる',
    ],
    faqs: [
      {
        q: '実際どれくらいで着手できますか',
        a: '掲載から約 48 時間でマッチングが行われます。着手日はエンジニアの空き状況と、現場入場やビザの要件によります。米国で制御職を埋めるための採用活動に約 2 か月かかることと比べてご検討ください。',
      },
      {
        q: '契約エンジニアを正社員にできますか',
        a: 'できます。転換にあたって紹介料はいただきません。手数料はエスクローされたマイルストーンに対するものであり、御社の採用判断に対するものではありません。',
      },
      {
        q: '知見が社内に残る点はどうなりますか',
        a: 'それは正社員採用の本当の利点であり、否定はしません。案件終了後も、案件資料、チェックイン写真、品質記録はアカウントに残りますが、3 年間工場を回してきた人の代わりにはなりません。',
      },
    ],
  },
  'automate-america': {
    label: 'Automate America との比較',
    metaTitle: 'Talengineer と Automate America — 御社の案件にはどちらが適するか',
    metaDesc: 'Automate America は米国内の時間単価型オートメーション人材調達向けです。Talengineer は国境をまたぐ、認定必須・マイルストーン・エスクローの案件遂行向けです。',
    question: 'Talengineer と Automate America：御社の案件にはどちらが適しますか',
    answer: '米国拠点のオートメーション契約者を時間単価で、デジタル作業時間表と迅速な支払いとともに必要とされるのであれば、Automate America が適しています。同社はまさにそのために作られており、その領域で定着しています。Talengineer は異なる形の仕事のために作られています。9 言語で進める国境をまたぐ案件、何かにアサインされる前に認定試験の通過が必須であるエンジニア、そして御社が承認して初めて資金が支払われるマイルストーン・エスクローです。米国内の時間単価型の人材確保であれば同社が適しています。範囲が明確な案件、とりわけ国境をまたぐ案件であれば、検証と支払いの仕組みが当社との違いです。',
    them: [
      '北米、英語',
      '同社の表現によれば、検証済みプロフィール、記録された職歴、過去顧客のレビュー。プラットフォーム独自の認定試験は公開されていません',
      '時間単価の実費精算。同社自身の説明によれば、契約がマーケットプレイスに表示される前に、プラットフォームが時間単価の一定割合を取得します。その割合は公開されていません',
      '顧客承認フローを備えたデジタル作業時間表。位置情報の検証は公開されていません',
      'いずれの立場も参加は無料でサブスクリプションなし。ただし取得される割合は公開されていません',
    ],
    themWhen: [
      '米国拠点の契約者を時間単価で、できるだけ早く着手させたい',
      '請求、給与、福利厚生、コンプライアンスをプラットフォームに任せたい（同社のマネージドサービス）',
      'のちに契約者を正社員として迎え入れる想定がある',
    ],
    usWhen: [
      '案件が国や言語をまたぐ——工場はメキシコ・ベトナム・タイにあり、発注者は別の場所',
      '事後のレビューではなく、認定試験によってアサイン前に能力を確認したい',
      '資金をエスクローで預け、検収済みマイルストーンごとに支払い、初回は返金対応としたい',
    ],
    faqs: [
      {
        q: 'Automate America は競合ですか',
        a: '市場の一部、すなわち米国内のオートメーション業務委託においては競合です。国境をまたぐ案件遂行、9 言語での連携、認定を条件とするアサイン、マイルストーン・エスクローという点では、解いている課題が異なります。',
      },
      {
        q: 'どちらが安いですか',
        a: '料率同士の比較はできません。課金モデルが異なるためです。Talengineer は支払い済みマイルストーンごとに 15%（創業期のお客様は最初の 5 件が 5%）と公開しています。Automate America は、契約がマーケットプレイスに届く前に時間単価の一定割合を取得すると説明していますが、その割合は公開していません。',
      },
      {
        q: '両方を併用できますか',
        a: 'できます。多くの製造業にとってはそれが現実的な答えです。日常の支援は米国内の時間単価の契約者に、海外での工場立ち上げや改造は範囲を定めたエスクロー案件に、という使い分けです。',
      },
    ],
  },
  'field-nation': {
    "label": "Field Nation との比較",
    "metaTitle": "Talengineer vs Field Nation — あなたのプロジェクトに合うのはどちら？",
    "metaDesc": "Field Nationは、作業指示（ワークオーダー）ごとに課金される、米国中心のオンサイトITフィールドサービス技術者向けマーケットプレイスです。Talengineerは、マイルストーンエスクローを備えた、国境を越える・認定制の産業オートメーションプロジェクト向けに構築されています。",
    "question": "Talengineer vs Field Nation：あなたのプロジェクトに合うのはどちら？",
    "answer": "米国中心のオンサイトITフィールドサービス技術者——ネットワーク、配線、POS、デジタルサイネージ、セキュリティ設置——が必要で、既存の巨大な人材プール（年間100万件を超える作業指示、60万以上の拠点）から迅速に手配してほしく、料金体系がシンプルで公開されている（技術者側から一律10%を差し引く）なら、Field Nationは良い選択肢です。Talengineerはそれとは異なる種類の仕事のために構築されています——PLC、ロボティクス、マシンビジョン、電気系統を扱う認定産業オートメーションエンジニアが、米国、メキシコ、ベトナム、タイ、中国にまたがり、9言語で対応します。ここでは、誰かがアサインされる前にプラットフォーム認定試験の合格が必須であり、プロフィールやレビュー、任意の身元調査だけでは足りません。また、資金はマイルストーンエスクローに保管され、あなたが作業を承認して初めて解放されます——週次の支払い条件サイクルで技術者に支払われるのとは異なります。あなたの案件が作業指示ごとに課金される米国ローカルのITフィールドサービスであれば、Field Nationの方が適しています。範囲が明確な自動化プロジェクト——特に国境をまたぐもの、あるいはアサイン前に能力が証明されていることを求めるもの——であれば、検証方法と支払いモデルの点で私たちは異なります。",
    "them": [
      "米国中心——公式ページでは米国の州とZIPコードによるカバー範囲が説明されており、北米/カナダへの言及も時折見られます（「米国とカナダ全域」）が、国際的・グローバルなカバー範囲は謳われていません。技術者が対応するのはIT・オンサイト分野の専門領域——ネットワーク、配線、POS、デジタルサイネージ、コンピューター・プリンター、セキュリティ——であり、産業オートメーションではありません。",
      "自己申告のプロフィール（スキル、認定資格、職務経歴）、購入者による評価・レビュー、そして独自の「Provider Match」ランキングアルゴリズムと「Success Score」。身元調査と薬物検査（第三者パートナーを通じて実施）は、それを要求する作業指示に対してのみ必須です——自社発表によればその割合は76%——すべての案件で必須ではなく、プラットフォーム自身が運営する認定試験については自社サイト上で説明されていません。",
      "マイルストーンエスクローではありません。購入者はField Nationのアカウントに事前入金するか——自社の購入者規約によれば、これは他の購入者の資金と混在した単一の管理口座に保管されます——または7/14/21/28日のネット支払い条件を利用します。技術者は購入者の支払いが処理されて初めて週次サイクルで支払いを受け取るため、支払い条件付きの案件では、技術者はそれまでの間、購入者の未払いリスクを負うことになります。カリフォルニア州の購入者は2021年3月以降、事前入金が禁止されており、作業を承認した後に支払う必要があります。",
      "チェックイン/チェックアウトのステップ、特定の作業指示に紐づいたアプリ内での写真記録、および現場での電子署名の取得。GPSは案件の発見と走行距離の追跡に使用されると説明されていますが、チェックイン自体がGPSで検証されているかどうかは公開ページ上で説明されていません——非公開です。",
      "技術者側の手数料は公開されており、シンプルです：作業指示の最終支払総額の一律10%、または任意のProティアでは13.9%（基本10%に3.9%の追加）、さらに任意の保険オプション（プラットフォームの一般賠償責任保険が1.95%、労災傷害保険が1%または0.5%）。購入者・企業側に何を請求するかは公開されていません——プランはサブスクリプション制と説明されており、価格は営業に問い合わせて初めてわかります。"
    ],
    "themWhen": [
      "必要なのが米国または北米ローカルのITフィールドサービス——ネットワーク、配線、POS、デジタルサイネージ、セキュリティカメラの設置——であり、産業オートメーションではない場合。",
      "すでに巨大な技術者プール（年間100万件超の作業指示、60万以上の拠点）へのアクセスを望み、アサイン前に認定試験で能力を証明することよりもスピードを重視する場合。",
      "購入者として、作業指示の額面通りの金額を支払いたく、別建てのプラットフォーム手数料の項目を望まない場合——Field Nationの取り分は技術者への支払いから差し引かれ、あなたに請求されることはありません。"
    ],
    "usWhen": [
      "プロジェクトが国境や言語をまたぐ場合——メキシコ、ベトナム、タイにある工場に対し購入者が別の場所にいるなど——Field Nationの米国・北米中心のネットワークの範囲外である場合。",
      "アサイン前に認定試験によって能力が証明されていることを望み、自己申告のプロフィールとレビュー、そして案件次第の任意の身元調査だけでは物足りない場合。",
      "資金がマイルストーンエスクローに保管され、あなたが作業を承認した後にのみ解放されることを望み、資金が決済されるまで技術者があなたの未払いリスクを負う週次の支払い条件サイクルを望まない場合。"
    ],
    "faqs": [
      {
        "q": "Field Nationは競合ですか？",
        "a": "作業指示ごとに課金されるITフィールドサービスの手配——ネットワーク、配線、POS、セキュリティ設置——という点では、はい、競合です。しかし、認定制でマイルストーンエスクローを備え、国境を越えた多言語での提供を行う産業オートメーションプロジェクトという点では、私たちは異なる課題を解決しています。"
      },
      {
        "q": "どちらが安いですか？",
        "a": "料率同士を単純比較することはできません——手数料が課される相手が異なるためです。Field Nationは技術者への支払いから一律10%を差し引きます（任意のProティアでは13.9%）。作業指示の額面を超えて購入者に何か課金しているかどうかは公開されておらず、購入者向けプランはサブスクリプション制で営業から見積もりを取る形です。Talengineerは購入者に対して手数料を直接公開しています：解放された各マイルストーンの15%（創業期クライアントは最初の5件の注文について5%）で、コミットする前に表示されます。"
      },
      {
        "q": "両方使うことはできますか？",
        "a": "できます——多くの企業にとって、それが実用的な使い分けです。米国ローカルのIT・オンサイト技術者の手配にはField Nationを、認定済みでエスクローによって保護された自動化プロジェクト——特に国境をまたぐもの——にはTalengineerを使う、という組み合わせです。"
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer と WorkMarket の比較 — あなたのプロジェクトに合うのはどちら？",
    "metaDesc": "WorkMarket（ADP傘下）は米国限定で、大規模な1099契約社員プールを管理するためのプラットフォームです。Talengineerは国境をまたぐ、認証必須、マイルストーンエスクロー型の自動化プロジェクトのために構築されています。",
    "question": "Talengineer と WorkMarket：あなたのプロジェクトに合うのはどちら？",
    "answer": "ADP傘下のWorkMarketは、既存の大規模な1099契約社員プールを運用する米国企業向けに構築されています——一括オンボーディング、職種カテゴリごとに設定される身元調査とスキルテスト、自動化された1099-NEC税務申告、そしてITフィールドサービス、宅配、警備などのカテゴリにわたる迅速な支払いです。同社の利用規約は、このプラットフォームが「米国外に所在するクライアントによる利用を意図していない」と明記しており、公開されている唯一の手数料は、ワーカー向けのオプションの早期支払い手数料2.5%のみです——クライアント側の標準プラットフォーム手数料は案件ごとに設定され、公開されていません。Talengineerはまったく異なる種類の仕事のために構築されています。範囲が明確に定義され、しばしば国境をまたぐ産業オートメーションプロジェクトで、エンジニアは何かを任される前にプラットフォーム認証（platform certification）を取得している必要があり、あなたの資金はマイルストーンエスクロー（milestone escrow）に置かれ、承認した後にのみ放出されます。国内の大規模な非正規労働力を管理しているなら、その用途にはWorkMarketのツールの方が成熟しています。もしあなたの案件がPLC、ロボティクス、マシンビジョンのプロジェクトで、事前検証された能力と支払い保護が必要なら、それこそがTalengineerを構築した目的です。",
    "them": [
      "米国クライアント限定。同社の利用規約は、このプラットフォームが「米国外に所在するクライアントによる利用を意図していない」と明記しており、WorkMarketのビジネスページでも「現在、米国法人を持つ企業のみをサポートしている」と記されています。契約社員への支払いは「世界のほぼどこにでも」届くと説明されていますが、プラットフォーム上で誰が購入できるかは米国限定です。",
      "身元調査と薬物検査は、第三者の消費者信用調査機関を通じて行われ（ワーカー本人の書面による同意によって開始）、これに加えてライセンス/資格の確認、税務ID/銀行口座の確認、そしてクライアントが独自の「Labor Clouds」を通じて職種カテゴリごとに設定する「ワーカーのスキルを評価するためのカスタマイズ可能なテスト」があります。ワーカーが案件に割り当てられる前に必須となる、プラットフォームが管理する認定試験は公開されていません。",
      "案件ごとのタイム&マテリアル方式：クライアントが案件価値（Assignment Value）を投稿し、利用規約によれば、クライアントは「その案件が承認済み案件（Approved Assignment）になった時点で、独立ワーカーに対価を支払う義務を負う」——つまりクライアントがそれを完了とマークした時点です。エスクロー（預託金）の取り決めについては利用規約のどこにも記載がなく、いったん請求が行われると「適用法で禁止されている範囲を除き、その請求または引き落としは返金不可」とされています。",
      "チェックイン/チェックアウト機能、ジオフェンシング（IT フィールドサービスのページで特に明記）、成果物としての写真・書類のアップロード、電子署名の収集を備えたワーカー向けモバイルアプリ。",
      "クライアント側の標準「プラットフォーム手数料」は案件ごとに設定され、利用規約には「WorkMarketはいつでもプラットフォーム手数料を変更する権利を留保する」と記載されています——パーセンテージ自体は公開されていません。利用規約で開示されている唯一の手数料は、資金への任意の早期アクセス（FastFunds）に対してワーカーに課される2.5%の手数料であり、それ以外の標準料金は営業担当への問い合わせによる見積もりが必要です。"
    ],
    "themWhen": [
      "あなたが米国企業で、ITフィールド技術者、配達員、ドライバー、警備員、通訳者など多数の職種カテゴリにわたる大規模な既存の1099契約社員プールを管理しており、一括オンボーディングと自動化された1099-NEC税務申告を必要としている場合。",
      "案件への割り当て前に事前発行されたプラットフォーム認証を要求するのではなく、身元調査・薬物検査・カスタムスキルテストといった審査ルールを職種カテゴリごとに自分で定義したい場合。",
      "大量の短期タイム&マテリアル型作業指示に対して、迅速で柔軟なワーカーへの支払い（ACH、ペイカード、PayPal、任意の早期資金アクセス）を求めている場合。"
    ],
    "usWhen": [
      "プロジェクトが国境をまたぐ場合——WorkMarket自身の利用規約はプラットフォームを米国拠点のクライアントに限定しています。私たちのエンジニアは9言語で米国、メキシコ、ベトナム、タイ、中国にまたがって業務を行います。",
      "割り当て後に適用される身元調査やクライアント設定のテストではなく、割り当て前の必須認定試験によって能力が証明されることを求める場合。",
      "各マイルストーンを承認した後にのみ資金が放出されるエスクロー方式を求め、かつ最初のマイルストーンには返金保証があること——いったん請求されると返金不可となる承認時払いモデルではないこと——を求める場合。"
    ],
    "faqs": [
      {
        "q": "WorkMarketは競合ですか？",
        "a": "市場の一部分では、そうです——大規模な米国国内の非正規労働力管理という点で。しかし国境をまたぐプロジェクト遂行、認証必須の割り当て、マイルストーンエスクローという点では、私たちは異なる課題を解決しています。"
      },
      {
        "q": "どちらが安いですか？",
        "a": "直接比較はできません。WorkMarketは標準プラットフォーム手数料を公開しておらず、利用規約が開示しているのは、早期支払いアクセス（FastFunds）に対するワーカー向けの任意の2.5%手数料のみだからです。Talengineerは手数料を最初から公開しています：放出された各マイルストーンの15%、創業期クライアントは最初の5件の注文について5%です。"
      },
      {
        "q": "両方使えますか？",
        "a": "はい。多くの製造業者は、米国拠点の大規模なフィールドサービスまたはITの契約社員プールにはWorkMarketのようなプラットフォームを使い、範囲が明確に定義された自動化プロジェクト——特に国境をまたぎ、エスクローされたマイルストーンを伴う認証済みの能力が必要な案件——には別途Talengineerを使っています。"
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork — あなたのプロジェクトに合うのはどちら？",
    "metaDesc": "Upworkは数千のスキルをカバーする汎用型のグローバル・フリーランス市場です。Talengineerは認定制・マイルストーン・エスクロー方式の産業オートメーションプロジェクト向けに構築されており、現地検証を伴います。",
    "question": "Talengineer vs Upwork：あなたのプロジェクトに合うのはどちら？",
    "answer": "オートメーションエンジニアリングに限らず、ほぼあらゆる種類のリモートワークで人材を採用したいなら、Upworkは良い選択肢です。180カ国以上にまたがる1,800万人以上のフリーランサーと数千のスキルカテゴリーを擁する汎用型市場であり、公開された定額の手数料体系と、固定価格マイルストーン向けの独自エスクローシステムを備えています——この規模と成熟度は本物です。Talengineerはより狭く、より深く作られています。認定を受けた産業オートメーションエンジニアのみ——PLC、ロボティクス、マシンビジョン、電気系統——が対象で、案件にアサインされる前にプラットフォーム認定に合格する必要があり、9言語で対応し、現場作業にはGPSジオフェンシングによるチェックインと写真による品質確認が伴います。あなたが求めているのが汎用的なリモートワークであれば、Upworkの幅広さに匹敵するのは困難です。物理的で現場での検証が必要な成果物を伴う、範囲が明確な産業オートメーションプロジェクトであれば——アサイン前の能力ゲーティングと現場でのエビデンスこそが、私たちとの違いです。",
    "them": [
      "産業オートメーションに特化していない、汎用型のグローバル市場：Upwork自身の説明によれば、180カ国以上にまたがる1,800万人以上のフリーランサーと数千のスキルカテゴリーを擁する",
      "クライアントが連絡を取る前に、すべてのフリーランサーの本人確認と所在地確認が行われ、プロフィールには検証済みのレビューと職歴が表示される。より踏み込んだスキル審査——選考面接、スキルテスト、ポートフォリオまたはコードレビューを経て取得する「Expert-Vetted」バッジ——は任意であり、対象は一部のカテゴリーに限られ、Upwork自身の説明によればBusiness PlusおよびEnterpriseプランのクライアントにしか表示されない。ほとんどのフリーランサーは、案件を引き受ける前に何らかの試験に合格する必要は一切ない",
      "固定価格の案件は「project funds」（Upworkがエスクローに現在用いている呼称）によって保護される：クライアントは作業開始前にマイルストーンに資金を投入し、クライアントが承認するか、14日間のレビュー期間が自動的に終了すると資金が解放される。時給制の案件はエスクローではなく、Work Diaryという勤務時間記録アプリによって別途保護される。それ以外については、返金は180日以内に個別に申請され、認めるかどうかはフリーランサーの裁量に委ねられる。最初のマイルストーンに対する返金保証は公表されていない",
      "公表されていない。Upwork自身の信頼・安全性に関するページでは、二要素認証、暗号化、マルウェアスキャンなど、アカウントとデータのセキュリティについて説明されているが、対面または現場作業に対するGPSチェックイン、ジオフェンシング、写真による検証には一切言及がない",
      "クライアント側は公開・段階制：Basicプランではマーケットプレイス手数料5%（銀行振込で支払う対象の米国クライアントは3%）、Business Plusでは10%（対象クライアントは8%）、さらに契約ごとに$0.99–$14.99の一度限りの契約開始手数料がかかる。フリーランサー側の手数料は契約ごとに0%〜15%で、Upworkが公表していない内部基準によって決まり、フリーランサーが承諾する前に本人にのみ表示される、固定の公開料率ではない"
    ],
    "themWhen": [
      "産業オートメーション以外の仕事——ライティング、デザイン、マーケティング、一般的なソフトウェア開発、事務作業——が必要な場合。これらのカテゴリーはTalengineerには一切用意されていない",
      "範囲の狭い認定制の人材リストではなく、レビューと評価履歴が確立された、できるだけ大きな人材プールにすぐアクセスしたい場合",
      "依頼が範囲の定まったプロジェクトではなく、期限のない時給制の仕事である場合——UpworkのWork Diaryと時給制の請求は、継続的で長期にわたる関係のために作られている"
    ],
    "usWhen": [
      "アサイン前に能力が証明され、ゲーティングされていることが必要な場合——エンタープライズ向けクライアントにしか表示されず、ほとんどのフリーランサーが取得しない任意のバッジではなく、産業オートメーションに特化した必須のプラットフォーム認定が求められる場合",
      "成果物が物理的で現場にあるもの——工場フロア、改修、試運転の立ち会いなど——であり、証拠としてGPSジオフェンシングによるチェックインと写真による品質確認を求める場合。これはUpwork自身の信頼・安全性ページには一切記載がない",
      "契約前に、明快で見積もり可能な単一の定額手数料率が公開されていることを求め、最初のマイルストーンに対する返金保証を求める場合——非公開の基準で決まる0%〜15%のフリーランサー側料率や、プラットフォーム全体の返金保証がない状態ではなく"
    ],
    "faqs": [
      {
        "q": "Upworkは競合ですか？",
        "a": "汎用的なフリーランス採用という点では、その通りです——世界最大級の市場の一つです。認定制で現地検証を伴う産業オートメーションプロジェクトの遂行という点では、私たちはより狭く異なる課題を解決しており、それはUpworkが特に想定して作られたものではありません。"
      },
      {
        "q": "どちらが安いですか？",
        "a": "手数料体系は単純には比較できません。Talengineerは解放された各マイルストーンの15%を公開しています（創業初期のクライアントは最初の5件の注文について5%）。Upworkのクライアント手数料はBasicプランで5%、Business Plusで10%（銀行振込で支払う対象の米国クライアントはそれぞれ3%/8%）で、これに一度限りの契約開始手数料が加わります。フリーランサーは別途、自身の収入の0%〜15%を支払い、その割合はUpworkが公表していない基準によって決まります。"
      },
      {
        "q": "両方使うことはできますか？",
        "a": "はい。多くのバイヤーは、事務、マーケティング、ソフトウェアなど一般的なリモートワークにはUpworkを、認定制のオートメーションエンジニアリング——特に物理的で現場での成果物を伴うプロジェクト——にはTalengineerを使い分けています。"
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer と Toptal — あなたのプロジェクトに合うのはどちら？",
    "metaDesc": "Toptal は時給制のリモート知識労働（開発者、デザイナー、財務、PM）向けに審査されたネットワークです。Talengineer は認証制・マイルストーンエスクロー型の産業オートメーションプロジェクト向けに構築されています。",
    "question": "Talengineer と Toptal：あなたのプロジェクトに合うのはどちら？",
    "answer": "契約前にリスクなしでお試しできる、時給制の単独の審査済み専門家——開発者、デザイナー、プロダクトマネージャー、財務アナリストなど——が必要なら、Toptal は良い選択肢です。まさにそのために作られています。ネットワーク加入時の5段階の審査ファネル（Toptal 自身が公表する数字では、月間応募者全体の採用率は3%未満）と、100か国以上に広がるリモートファーストのネットワークです。Talengineer はまったく異なる種類の仕事のために作られています——PLC、ロボティクス、マシンビジョン、電気工事などの産業オートメーションプロジェクトです。ここでは、どのエンジニアも何らかの案件にアサインされる前に必ずプラットフォーム認証（L1-L3、AI採点かつ人間によるレビュー）を突破しなければならず、作業は時給制ではなく承認されたマイルストーンごとに資金が確保・支払われ、現場作業には証拠として GPS ジオフェンスによるチェックインと写真による品質確認が伴います。あなたの仕事がリモートで時給制の知識労働であれば、Toptal のトライアル後採用モデルの方が適しています。工場の現場で行われるような、範囲の定まったオートメーションプロジェクトであれば——認証によるゲート管理とマイルストーンエスクローこそ、私たちの違いが表れるところです。",
    "them": [
      "100か国以上に専門家を擁し——その多くは南北アメリカとヨーロッパを拠点とする——自社の言葉によれば140か国以上の顧客にサービスを提供し、ソフトウェア開発、デザイン、財務、プロダクト/プロジェクトマネジメントを網羅する。産業オートメーション、PLC、ロボティクス、マシンビジョン専門のカテゴリーは掲載されておらず、審査時の英語スクリーニング以外の言語カバー率は公表されていない",
      "Toptal 自身が公表するファネルによれば、ネットワーク加入時の一度きりの5段階審査：言語・コミュニケーション（通過率26.4%）、詳細なスキル審査（7.4%）、ライブの技術面接（3.6%）、その後1〜3週間のテストプロジェクト（3.2%）と続き、月間応募者全体の採用率は3%未満。審査はクライアントごとやスキルごとではなく、ネットワーク加入時に一度だけ行われ、独立したプラットフォーム認証試験は公表されていない",
      "Net 10 条件で月2回請求される、時給制のブレンドレート課金。人材マッチングに進むと月額$79の定額サブスクリプションが加わる。リスクは最大2週間のリスクなしトライアル（役職ごとに最大3名の候補者）でカバーされ、不満な場合は課金されない——公式 FAQ には「エスクロー」や「マイルストーン」という言葉は使われていない",
      "設計思想としてリモートファースト——自社の言葉で「大多数は自宅オフィスやコワーキングスペースからリモートで働く」とされ、現場勤務は稀な特例として説明されている。位置情報の確認、ジオフェンシング、写真による品質確認のシステムは公表されていない",
      "月額$79のサブスクリプション料金は公表されている。時給レートは Toptal のマージンを含む「ブレンド」レートと説明されているが、そのレートから同社が保持する具体的な割合やマークアップは公表されていない"
    ],
    "themWhen": [
      "産業オートメーションエンジニアではなく、開発者・デザイナー・PM・財務アナリストなど単独のリモート知識労働の専門家が必要で、契約前に最大3名の候補者をリスクなしで試したい場合",
      "範囲の定まったマイルストーン型プロジェクトではなく、正社員転換の道もある継続的な時給制の契約を望む場合",
      "案件ごとの認証ではなく、公表された5段階のファネルによって一度だけ審査された、100か国以上にわたる確立された長年の実績を持つネットワークを望む場合"
    ],
    "usWhen": [
      "プロジェクトが PLC、ロボティクス、マシンビジョン、電気工事などの産業オートメーション業務であり——それは Toptal 自身のサイトが専門分野として掲載していないカテゴリーである場合",
      "作業が工場の現場や作業現場で行われ、デフォルトのリモートファーストではなく、証拠として GPS ジオフェンスによるチェックインと写真による品質確認を求める場合",
      "Net 10 条件の時給請求ではなく、承認した各マイルストーンごとに資金が支払われ、最初のマイルストーンには返金保証がある形を望む場合"
    ],
    "faqs": [
      {
        "q": "Toptal は競合ですか？",
        "a": "市場の一部では、そうです——審査済みでリモート・時給制の知識労働という点で。しかし特に産業オートメーション——PLC、ロボティクス、マシンビジョン、電気工事、認証によるゲート管理と現場での検証を伴う分野——では、Toptal 自身のサイトが対象としていない課題を私たちは解決しています。"
      },
      {
        "q": "どちらが安いですか？",
        "a": "両者のレートを単純に比較することはできません。Talengineer は、支払われた各マイルストーンの15%（創業初期クライアントは最初の5件の注文で5%）を公表しています。Toptal は月額$79の定額サブスクリプションに加え、自社マージンを含むブレンド時給レートを公表していますが、そのレートのうち何パーセントを自社が保持するかは公表していません。"
      },
      {
        "q": "両方を併用できますか？",
        "a": "はい。多くの製造業チームにとっては、関連するソフトウェアや PM 業務には Toptal の専門家を、現場のオートメーションプロジェクト自体には認証を受けた Talengineer のエンジニアを使う、という形になり得ます。"
      }
    ]
  },
};

COMPARISONS.ko = {
  'staffing-agency': {
    label: '인력 파견업체와 비교',
    metaTitle: '자동화 엔지니어, 인력 파견업체와 플랫폼 중 무엇을 선택할까',
    metaDesc: '산업 자동화 업무에서 인력 파견이 맞는 경우와 마일스톤 기반 플랫폼 조달이 더 맞는 경우를 솔직하게 정리했습니다.',
    question: '자동화 엔지니어는 인력 파견업체와 플랫폼 중 무엇으로 확보해야 합니까?',
    answer: '다음 주에 현장에 사람이 필요하고, 그 도시에 파견업체의 대기 인력이 이미 있으며, 보통 공개되지 않는 마진을 지불하는 데 부담이 없다면 인력 파견업체가 맞습니다. 업무 범위가 명확하거나 국경 또는 언어를 넘나들거나, 배정 전에 그 엔지니어가 실제로 해낼 수 있다는 근거가 필요하다면 Talengineer가 맞습니다. 진짜 차이는 리스크가 어디에 남는지입니다. 파견업체는 시간을 청구하고 납품 리스크는 발주자가 집니다. Talengineer는 대금을 마일스톤 에스크로에 보관하고, 승인하신 뒤에야 지급합니다.',
    them: [
      '파견업체가 현지에 확보해 둔 인력으로, 보통 한 가지 언어만 가능합니다',
      '이력서 검토와 리크루터의 판단',
      '시간·자재 정산 — 마일스톤 달성 여부와 무관하게 시간에 대한 비용이 발생합니다',
      '작업시간표는 있으나 현장 체류 여부에 대한 독립적 검증은 없습니다',
      '엔지니어 단가 위에 붙는 마진은 보통 공개되지 않습니다',
    ],
    themWhen: [
      '며칠 안에 현장 인력이 필요하고, 그 도시에 파견업체 인력이 이미 있습니다',
      '종료 시점이 있는 프로젝트가 아니라 상시 유지보수 업무입니다',
      '해당 업체와 단가 합의가 되어 있고 협업 관계가 자리 잡혀 있습니다',
    ],
    usWhen: [
      '프로젝트 범위가 명확해 마일스톤으로 나눌 수 있습니다',
      '국경이나 언어를 넘습니다 — 엔지니어, 공장, 구매자가 같은 나라에 있지 않습니다',
      '배정 전에 역량을 검증하고, 대금을 검수된 작업에 연동하고자 합니다',
    ],
    faqs: [
      {
        q: '플랫폼이 인력 파견업체보다 저렴합니까?',
        a: '대체로 그렇습니다. 수수료가 청구 단가에 묻히지 않고 공개되기 때문입니다. Talengineer는 지급되는 마일스톤마다 15%(창업 고객은 첫 5건 5%)를 받습니다. 다만 정직하게 말하면 수수료 대 수수료의 비교는 아닙니다. 파견업체는 시간을, 저희는 검수된 마일스톤을 제공하므로 구매하시는 대상 자체가 다릅니다.',
      },
      {
        q: '규정 준수와 보험은 누가 담당합니까?',
        a: '엔지니어는 KYC를 완료하며, W-9와 보험증명(COI)은 현장 작업 전에 플랫폼에서 수집·확인합니다. 파견업체는 보통 계약자를 직접 고용해 그 부담을 대신 집니다. 명의상 고용주가 반드시 필요하다면 파견업체가 더 간단한 경로입니다.',
      },
      {
        q: '엔지니어가 제대로 하지 못하면 어떻게 됩니까?',
        a: '마일스톤을 승인하지 마십시오. 대금은 에스크로에 남고, 5일간의 증빙 제출 기간이 있는 분쟁을 제기하실 수 있으며 관리자가 검토합니다. 첫 프로젝트의 첫 마일스톤은 환불이 보장됩니다.',
      },
    ],
  },
  'freelance-marketplace': {
    label: '일반 프리랜스 마켓플레이스와 비교',
    metaTitle: '일반 프리랜스 마켓플레이스에서 자동화 엔지니어를 구하지 않는 이유',
    metaDesc: '일반 마켓플레이스는 넓고 저렴합니다. 산업 자동화에서 부족한 것은 검증 — 배정 전 인증과 현장 증거입니다.',
    question: '일반 프리랜스 마켓플레이스에서 자동화 엔지니어를 구하면 되지 않습니까?',
    answer: '원격으로 처리되는 위험도가 낮은 작업이라면 일반 마켓플레이스는 합리적인 방법이고 탐색 비용도 저렴합니다. 다만 그곳은 PLC 엔지니어가 실제로 귀사의 라인을 시운전할 수 있는지 알려주지 못합니다. 역량은 본인 신고이며, 확인은 끝난 뒤 고객 후기로만 가능합니다. Talengineer는 의도적으로 범위를 좁혔습니다. 모든 엔지니어는 가입 시 실무형 기술 스크리닝을 통과하고, 배정 전에 L1–L3 플랫폼 인증을 보유해야 하며, 현장 작업은 GPS 체크인과 사진 품질 확인으로 뒷받침됩니다. 시운전 실패가 며칠간의 라인 정지로 이어지는 상황에서는 그 검증 자체가 제품입니다.',
    them: [
      '규모는 매우 크지만 대부분 원격 또는 소프트웨어 영역이며, 산업 자동화는 아주 얇은 층입니다',
      '본인이 신고한 역량과 배지, 사후 고객 후기로 확인',
      '시간제 또는 고정가 에스크로. 범위 분쟁은 건별로 처리됩니다',
      '원격 작업을 전제로 설계되어 현장 검증 계층이 없습니다',
      '플랫폼 수수료는 공개되지만 엔지니어 품질 편차가 큽니다',
    ],
    themWhen: [
      '작업이 완전히 원격입니다 — 작은 HMI 화면, 보고서, 일회성 스크립트',
      '사람을 잘못 골라도 손실이 몇 시간이지 며칠간의 라인 정지는 아닌 예산 규모입니다',
      '엔지니어를 직접 판단할 수 있는 사내 전문성이 있습니다',
    ],
    usWhen: [
      '누군가 실제로 공장에 있어야 하고, 그 증거가 필요합니다',
      'Siemens나 Rockwell 숙련도를 직접 판단하기 어렵습니다',
      '시운전 실패가 단순한 비용 낭비가 아니라 생산 중단을 뜻합니다',
    ],
    faqs: [
      {
        q: '일반 마켓플레이스에도 에스크로가 있지 않습니까?',
        a: '있습니다. 고정가 에스크로는 그곳에서도 일반적이므로 에스크로 자체가 차이는 아닙니다. 차이는 엔지니어가 배정되기 전에 무엇이 성립해야 하는가입니다. Talengineer에서는 플랫폼 인증 보유가 필수이고, 현장 작업에는 GPS와 사진 증거가 따릅니다.',
      },
      {
        q: '엔지니어 풀이 더 작지 않습니까?',
        a: '훨씬 작고, 의도한 결과입니다. 등록된 모든 엔지니어는 실무형 AI 기술 스크리닝을 통과했고, 인증된 엔지니어만 프로젝트에 배정될 수 있습니다. 직접 걸러내야 할 500개의 프로필보다, 실제로 해낼 수 있는 5명을 드리는 편이 낫다고 봅니다.',
      },
      {
        q: '작은 원격 작업도 의뢰할 수 있습니까?',
        a: '가능하지만 필요 없는 검증에 비용을 더 내실 수 있습니다. 짧은 원격 작업이라면 일반 마켓플레이스가 더 실용적입니다. 저희는 틀렸을 때 비용이 큰 작업을 위해 만들어졌습니다.',
      },
    ],
  },
  'direct-hire': {
    label: '정규직 채용과 비교',
    metaTitle: '자동화 엔지니어를 정규직으로 채용할까, 플랫폼으로 프로젝트마다 맡길까',
    metaDesc: '상시 제어 업무가 있다면 정규직이 합리적입니다. 프로젝트형 업무에서는 착수 시점과 유휴 인력이 판단을 가릅니다.',
    question: '자동화 엔지니어를 정규직으로 채용해야 합니까, 플랫폼을 통해 프로젝트 단위로 맡겨야 합니까?',
    answer: '업무가 상시적이라면 정규직 채용이 맞습니다. 연중 제어 업무가 있는 공장이라면 사내 엔지니어가 설비에 대한 지식을 축적해 갑니다. 개조, 시운전 기간, 라인 이설처럼 프로젝트 형태의 업무라면 플랫폼을 통한 계약이 맞습니다. 판단을 가르는 것은 대개 시간과 유휴 인력입니다. 미국에서 제어 직무를 채우려면 누군가 출근하기까지 채용에 약 두 달이 걸리고, 채용 후에는 급여와 복리후생, 프로젝트 사이의 공백까지 부담하게 됩니다. 플랫폼 계약은 며칠 안에 시작되며, 입금한 마일스톤에 대해서만 비용을 지불합니다.',
    them: [
      '통근 가능한 범위의 지역 노동시장에서 지원하는 사람',
      '면접과 평판 조회 — 잘못 뽑았을 때의 비용은 회사가 부담합니다',
      '진행 중인 프로젝트 유무와 무관하게 나가는 급여, 복리후생, 사회보험료',
      '직접 지휘를 받으므로 검증이 별도 문제로 남지 않습니다',
      '완전히 투명합니다 — 회사 자체의 급여입니다',
    ],
    themWhen: [
      '종료일이 있는 프로젝트가 아니라 연중 제어 업무가 있습니다',
      '지식을 사내에 축적할 가치가 있습니다 — 우리 설비, 우리 이력, 우리만의 특성',
      '시간을 가리지 않고 라인 정지에 대응할 사람이 필요합니다',
    ],
    usWhen: [
      '업무가 끝이 있는 프로젝트입니다 — 개조, 시운전, 라인 이설',
      '정규직으로는 결코 두지 않을 전문성이 필요합니다 — 머신 비전, 특정 로봇 브랜드',
      '현장이 다른 나라에 있고, 현지 채용을 하려면 법인부터 세워야 합니다',
    ],
    faqs: [
      {
        q: '엔지니어가 실제로 얼마나 빨리 시작할 수 있습니까?',
        a: '등록 후 약 48시간 안에 매칭이 이루어집니다. 착수일은 엔지니어의 일정과 현장 출입 또는 비자 요건에 따라 달라집니다. 미국에서 제어 직무를 채우는 데 걸리는 약 두 달의 채용 기간과 비교해 보십시오.',
      },
      {
        q: '계약 엔지니어를 정규직으로 전환할 수 있습니까?',
        a: '가능하며 전환 수수료는 없습니다. 플랫폼 수수료는 에스크로된 마일스톤에 적용되며 채용 결정에는 적용되지 않습니다.',
      },
      {
        q: '지식이 사내에 남는 점은 어떻습니까?',
        a: '정규직 채용의 실제 장점이며 부인하지 않겠습니다. 프로젝트 문서, 체크인 사진, 품질 기록은 프로젝트 종료 후에도 계정에 남지만, 3년간 공장을 운영해 온 사람을 대신하지는 못합니다.',
      },
    ],
  },
  'automate-america': {
    label: 'Automate America와 비교',
    metaTitle: 'Talengineer와 Automate America — 어느 쪽이 프로젝트에 맞습니까',
    metaDesc: 'Automate America는 미국 내 시간제 자동화 인력 조달을 위해 만들어졌습니다. Talengineer는 국경을 넘는, 인증이 필수인 마일스톤 에스크로 프로젝트 수행을 위해 만들어졌습니다.',
    question: 'Talengineer와 Automate America: 어느 쪽이 프로젝트에 맞습니까?',
    answer: '미국에 기반을 둔 자동화 계약자를 시간 단위로, 디지털 작업시간표와 빠른 지급과 함께 필요로 하신다면 Automate America가 잘 맞습니다. 바로 그 목적으로 만들어졌고 그 영역에서 자리를 잡았습니다. Talengineer는 다른 형태의 일을 위해 만들어졌습니다. 9개 언어로 진행되는 국경을 넘는 프로젝트, 어떤 일에든 배정되기 전에 플랫폼 인증을 통과해야 하는 엔지니어, 그리고 승인하신 뒤에야 대금이 지급되는 마일스톤 에스크로입니다. 미국 현지의 시간제 인력 조달이라면 그쪽이 더 맞습니다. 범위가 정해진 프로젝트, 특히 국경을 넘는 프로젝트라면 검증과 결제 구조가 저희의 차이점입니다.',
    them: [
      '북미, 영어',
      '자사 표현에 따르면 검증된 프로필, 기록된 업무 이력, 이전 고객 후기. 플랫폼이 운영하는 인증 시험은 공개되어 있지 않습니다',
      '시간제 실비 정산. 자사 설명에 따르면 계약이 마켓플레이스에 표시되기 전에 플랫폼이 시간 단가의 일정 비율을 가져가며, 그 비율은 공개되어 있지 않습니다',
      '고객 승인 절차가 있는 디지털 작업시간표. 위치 검증은 공개되어 있지 않습니다',
      '모든 참여자에게 무료이며 구독료도 없습니다. 다만 가져가는 비율은 공개되어 있지 않습니다',
    ],
    themWhen: [
      '미국에 기반을 둔 계약자를 시간 단위로, 가능한 한 빨리 투입하고자 합니다',
      '청구, 급여, 복리후생, 규정 준수를 플랫폼이 대신 처리하기를 원합니다(해당 사의 관리형 서비스)',
      '이후 계약자를 정규직으로 전환할 계획이 있습니다',
    ],
    usWhen: [
      '프로젝트가 국경이나 언어를 넘습니다 — 공장은 멕시코·베트남·태국에, 구매자는 다른 곳에',
      '사후 후기가 아니라 인증 시험으로 배정 전에 역량이 입증되기를 원합니다',
      '대금을 에스크로에 두고 검수된 마일스톤마다 지급하며, 첫 마일스톤은 환불 보장을 원합니다',
    ],
    faqs: [
      {
        q: 'Automate America는 경쟁사입니까?',
        a: '시장의 한 부분, 즉 미국 현지 자동화 도급에서는 그렇습니다. 국경을 넘는 프로젝트 수행, 9개 언어 협업, 인증을 조건으로 하는 배정, 마일스톤 에스크로에서는 서로 다른 문제를 풀고 있습니다.',
      },
      {
        q: '어느 쪽이 더 저렴합니까?',
        a: '요율 대 요율로는 비교할 수 없습니다. 과금 모델이 다르기 때문입니다. Talengineer는 지급되는 마일스톤마다 15%(창업 고객은 첫 5건 5%)로 공개하고 있습니다. Automate America는 계약이 마켓플레이스에 도달하기 전에 시간 단가의 일정 비율을 가져간다고 설명하며, 그 비율은 공개하지 않습니다.',
      },
      {
        q: '둘 다 사용할 수 있습니까?',
        a: '가능하며, 많은 제조사에는 그것이 합리적인 답입니다. 상시 지원은 미국 현지의 시간제 계약자에게, 해외 공장 건설이나 개조는 범위가 정해진 에스크로 프로젝트로 나누어 쓰는 방식입니다.',
      },
    ],
  },
  'field-nation': {
    "label": "Field Nation 비교",
    "metaTitle": "Talengineer vs Field Nation — 어떤 프로젝트에 더 적합할까요?",
    "metaDesc": "Field Nation은 미국 중심의 온사이트 IT 현장 서비스 기술자 마켓플레이스로, 작업지시서(워크오더) 단위로 청구합니다. Talengineer는 마일스톤 에스크로를 갖춘 국경 간, 인증 기반 산업 자동화 프로젝트를 위해 만들어졌습니다.",
    "question": "Talengineer vs Field Nation: 어떤 프로젝트에 더 적합할까요?",
    "answer": "미국 중심의 온사이트 IT 현장 서비스 기술자——네트워킹, 케이블링, POS, 디지털 사이니지, 보안 설치——가 필요하고, 이미 방대한 인력 풀(연간 100만 건 이상의 작업지시서, 60만 개 이상의 현장)에서 빠르게 배치받고 싶으며, 기술자 측에서 일률적으로 10%를 공제하는 단순하고 공개된 수수료 구조를 원한다면 Field Nation이 좋은 선택입니다. Talengineer는 전혀 다른 성격의 작업을 위해 만들어졌습니다: PLC, 로보틱스, 머신 비전, 전기 분야의 인증 산업 자동화 엔지니어가 미국, 멕시코, 베트남, 태국, 중국에 걸쳐 9개 언어로 작업하며, 배정을 받기 전에는 프로필, 리뷰, 선택적 신원조회만으로는 부족하고 반드시 플랫폼 인증 시험을 통과해야 합니다. 또한 자금은 마일스톤 에스크로에 보관되어 있다가 귀하가 작업을 승인한 후에만 지급되며, 주간 결제 조건 주기로 기술자에게 곧바로 지급되지 않습니다. 귀하의 작업이 작업지시서 단위로 청구되는 미국 현지 IT 현장 서비스라면 Field Nation이 더 적합합니다. 범위가 명확히 정의된 자동화 프로젝트——특히 국경을 넘나드는 프로젝트, 또는 배정 이후가 아니라 이전에 역량이 입증되기를 원하는 프로젝트——라면, 검증 방식과 결제 모델에서 저희가 다릅니다.",
    "them": [
      "미국 중심——자체 페이지에서 미국 주(state)와 ZIP 코드 기준으로 커버리지를 설명하며, 간혹 북미/캐나다를 언급하기도 하지만('미국과 캐나다 전역'), 국제적이거나 글로벌한 커버리지는 주장하지 않습니다. 기술자들은 IT·현장 전문 분야——네트워킹, 케이블링, POS, 디지털 사이니지, 컴퓨터 및 프린터, 보안——를 다루며, 산업 자동화는 다루지 않습니다.",
      "자체 신고 프로필(기술, 인증, 경력), 구매자 평점/리뷰, 그리고 자체 개발한 'Provider Match' 순위 알고리즘과 'Success Score'가 전부입니다. 신원조회와 약물검사(제3자 파트너를 통해 진행)는 이를 요구하는 작업지시서에 대해서만 필수이며——자체 집계로는 그 비율이 76%——모든 작업에 적용되지는 않고, 플랫폼이 직접 운영하는 인증 시험은 자사 사이트 어디에도 설명되어 있지 않습니다.",
      "마일스톤 에스크로가 아닙니다. 구매자는 Field Nation 계정에 선입금을 하거나——자체 구매자 약관에 따르면 이는 다른 구매자들의 자금과 혼합되어 보관되는 단일 수탁 계정입니다——net 7/14/21/28일 결제 조건을 사용합니다. 기술자는 구매자의 결제가 처리된 이후에야 주간 주기로 지급받기 때문에, 결제 조건이 적용되는 작업에서는 그때까지 기술자가 구매자의 미지급 위험을 떠안게 됩니다. 캘리포니아 구매자는 2021년 3월부터 선입금이 금지되어, 작업을 승인한 후에 결제해야 합니다.",
      "체크인/체크아웃 단계, 특정 작업지시서와 연결된 앱 내 사진 기록, 그리고 현장에서의 전자서명 수집. GPS는 작업 검색과 주행거리 추적에 사용된다고 설명되어 있지만, 체크인 자체가 GPS로 검증되는지는 공개 페이지에 설명되어 있지 않습니다——비공개입니다.",
      "기술자 측 수수료는 공개되어 있고 단순합니다: 작업지시서 최종 결제 총액의 일률 10%, 또는 선택 가능한 Pro 등급에서는 13.9%(기본 10%에 3.9% 추가), 여기에 선택적 보험 옵션(플랫폼 일반배상책임보험 1.95%, 업무상 상해보험 1% 또는 0.5%)이 더해집니다. 구매자·기업 측에 얼마를 청구하는지는 공개되어 있지 않으며——요금제는 구독 기반으로 설명되어 있고, 가격은 영업팀에 문의해야만 알 수 있습니다."
    ],
    "themWhen": [
      "필요한 것이 미국 또는 북미 현지 IT 현장 서비스——네트워킹, 케이블링, POS, 디지털 사이니지, 보안 카메라 설치——이지 산업 자동화가 아닌 경우.",
      "이미 방대한 기술자 풀(연간 100만 건 이상의 작업지시서, 60만 개 이상의 현장)에 접근하고 싶고, 배정 전 인증 시험으로 역량을 입증하는 것보다 속도가 더 중요한 경우.",
      "구매자로서 별도의 플랫폼 수수료 항목 없이 작업지시서의 액면가만 지불하고 싶은 경우——Field Nation의 수수료는 기술자의 지급액에서 공제되며, 귀하에게 별도로 청구되지 않습니다."
    ],
    "usWhen": [
      "프로젝트가 국경이나 언어를 넘나드는 경우——예를 들어 멕시코, 베트남, 태국의 공장에 다른 지역의 구매자가 있는 경우——Field Nation의 미국/북미 중심 네트워크 범위 밖에 있는 경우.",
      "배정 전에 인증 시험으로 역량이 입증되기를 원하며, 자체 신고 프로필과 리뷰, 그리고 작업에 따라 선택적으로 이루어지는 신원조회만으로는 부족하다고 느끼는 경우.",
      "자금이 마일스톤 에스크로에 보관되었다가 귀하가 작업을 승인한 후에만 지급되기를 원하며, 자금이 정산될 때까지 기술자가 귀하의 미지급 위험을 떠안는 주간 결제 조건 주기를 원하지 않는 경우."
    ],
    "faqs": [
      {
        "q": "Field Nation은 경쟁사인가요?",
        "a": "작업지시서 단위로 청구되는 IT 현장 서비스 파견——네트워킹, 케이블링, POS, 보안 설치——영역에서는 그렇습니다. 하지만 인증 기반이고 마일스톤 에스크로를 갖춘, 국경을 넘나드는 다국어 산업 자동화 프로젝트 영역에서는 저희가 전혀 다른 문제를 해결하고 있습니다."
      },
      {
        "q": "어느 쪽이 더 저렴한가요?",
        "a": "수수료율끼리 직접 비교할 수는 없습니다——수수료를 부과받는 대상 자체가 다르기 때문입니다. Field Nation은 기술자의 지급액에서 일률적으로 10%를 공제하며(선택 가능한 Pro 등급에서는 13.9%), 작업지시서 액면가 이외에 구매자에게 무언가를 청구하는지는 공개하지 않습니다. 구매자 요금제는 구독 기반이며 영업팀을 통해서만 견적을 받을 수 있습니다. Talengineer는 수수료를 구매자에게 직접 공개합니다: 지급이 승인된 각 마일스톤의 15%(창립 고객은 첫 5건의 주문에 한해 5%)이며, 계약을 확정하기 전에 미리 표시됩니다."
      },
      {
        "q": "둘 다 사용할 수 있나요?",
        "a": "네——많은 기업들에게 그것이 실질적인 역할 분담입니다: 미국 현지 IT·현장 기술자 파견에는 Field Nation을, 인증되고 에스크로로 보호되는 자동화 프로젝트——특히 국경을 넘나드는 프로젝트——에는 Talengineer를 사용하는 방식입니다."
      }
    ]
  },
  'workmarket': {
    "label": "vs WorkMarket",
    "metaTitle": "Talengineer 대 WorkMarket — 어느 쪽이 당신의 프로젝트에 맞을까?",
    "metaDesc": "WorkMarket(ADP 소유)은 대규모 1099 계약직 인력 풀을 관리하기 위한 미국 전용 플랫폼입니다. Talengineer는 국경을 넘나들고 인증이 필수이며 마일스톤 에스크로(milestone escrow) 방식의 자동화 프로젝트를 위해 설계되었습니다.",
    "question": "Talengineer 대 WorkMarket: 어느 쪽이 당신의 프로젝트에 맞을까?",
    "answer": "ADP가 소유한 WorkMarket은 기존의 대규모 1099 계약직 인력 풀을 운영하는 미국 기업을 위해 설계되었습니다 — 대량 온보딩, 직무 카테고리별로 구성되는 신원조회 및 스킬 테스트, 자동화된 1099-NEC 세금 신고, 그리고 IT 현장 서비스, 택배, 보안 같은 카테고리 전반의 신속한 대금 지급 등입니다. 자체 서비스 약관에는 이 플랫폼이 '미국 외에 위치한 클라이언트가 사용하도록 의도되지 않았다'고 명시되어 있으며, 공개된 유일한 수수료는 근로자에게 부과되는 선지급 옵션 수수료 2.5%뿐입니다 — 클라이언트 측 표준 플랫폼 수수료는 건당으로 정해지며 공개되지 않습니다. Talengineer는 전혀 다른 형태의 작업을 위해 설계되었습니다: 범위가 명확히 정의된, 흔히 국경을 넘나드는 산업 자동화 프로젝트로, 엔지니어는 어떤 작업이든 배정받기 전에 반드시 플랫폼 인증(platform certification)을 보유해야 하고, 당신의 자금은 마일스톤 에스크로(milestone escrow)에 예치되어 당신이 승인한 후에만 지급됩니다. 국내 임시 인력을 대규모로 관리하고 있다면, 그 용도에는 WorkMarket의 도구가 더 성숙되어 있습니다. 사전에 검증된 역량과 대금 보호가 필요한 PLC, 로보틱스, 머신 비전 프로젝트가 당신의 일이라면, 그것이 바로 우리가 Talengineer를 만든 이유입니다.",
    "them": [
      "미국 클라이언트만 가능. 서비스 약관에는 이 플랫폼이 '미국 외에 위치한 클라이언트가 사용하도록 의도되지 않았다'고 명시되어 있으며, WorkMarket의 한 비즈니스 페이지에는 '현재 미국 법인을 보유한 기업만 지원한다'고 나와 있습니다. 계약직 근로자에 대한 대금 지급은 '세계 거의 모든 곳'에 도달한다고 설명되어 있지만, 플랫폼에서 구매할 수 있는 주체는 미국으로 한정됩니다.",
      "신원조회와 약물 검사는 제3자 소비자 신용조사기관을 통해 진행되며(근로자 본인의 서면 동의로 개시), 여기에 더해 면허/자격 확인, 세금 ID/은행 정보 확인, 그리고 클라이언트가 자체 'Labor Clouds'를 통해 직무 카테고리별로 설정하는 '근로자 스킬 평가용 맞춤형 테스트'가 있습니다. 근로자가 배정되기 전에 반드시 거쳐야 하는, 플랫폼이 관리하는 인증 시험은 공개된 요건으로 명시되어 있지 않습니다.",
      "건별 시간·자재(time-and-materials) 방식 청구: 클라이언트가 작업 가치(Assignment Value)를 게시하며, 약관에 따르면 클라이언트는 '해당 작업이 승인된 작업(Approved Assignment)이 되었을 때 독립 근로자에게 대금을 지급할 의무가 있다' — 즉 클라이언트가 완료로 표시하는 시점입니다. 약관 어디에도 에스크로 방식은 설명되어 있지 않으며, 일단 청구가 이루어지면 '해당 청구 또는 차감액은 적용 법률이 금지하는 범위를 제외하고는 환불되지 않는다'고 되어 있습니다.",
      "체크인/체크아웃, 지오펜싱(IT 현장 서비스 페이지에 구체적으로 명시됨), 결과물로서의 사진·문서 업로드, 전자서명 수집 기능을 갖춘 근로자용 모바일 앱.",
      "클라이언트 측 표준 '플랫폼 수수료'는 건별로 정해지며, 약관에는 'WorkMarket은 언제든 플랫폼 수수료를 변경할 권리를 보유한다'고 명시되어 있습니다 — 비율 자체는 공개되지 않습니다. 약관에서 공개하는 유일한 수수료는 자금에 대한 선택적 조기 접근(FastFunds)에 부과되는 근로자 대상 2.5% 수수료이며, 그 외 표준 요금은 영업팀에 문의해 견적을 받아야 합니다."
    ],
    "themWhen": [
      "당신이 미국 기업이며, IT 현장 기술자, 택배기사, 운전기사, 보안요원, 통역사 등 여러 직무 카테고리에 걸쳐 대규모 기존 1099 계약직 인력 풀을 관리하고 있고, 대량 온보딩과 자동화된 1099-NEC 세금 신고가 필요한 경우.",
      "배정 전에 사전 발급된 플랫폼 인증을 요구하기보다, 신원조회·약물 검사·맞춤형 스킬 테스트 등 직무 카테고리별 심사 규칙을 직접 정의하고 싶은 경우.",
      "대량의 단기 시간·자재 방식 작업 지시서에 대해 빠르고 유연한 근로자 대금 지급(ACH, 페이카드, PayPal, 선택적 조기 자금 접근)을 원하는 경우."
    ],
    "usWhen": [
      "프로젝트가 국경을 넘나드는 경우 — WorkMarket 자체 약관은 플랫폼을 미국 기반 클라이언트로 제한합니다. 우리 엔지니어들은 9개 언어로 미국, 멕시코, 베트남, 태국, 중국을 넘나들며 작업합니다.",
      "근로자가 이미 인력 풀에 들어온 뒤 적용되는 신원조회나 클라이언트 설정 테스트가 아니라, 배정 전 필수 인증 시험으로 역량이 입증되기를 원하는 경우.",
      "자금이 에스크로에 예치되어 각 마일스톤을 승인한 후에만 지급되고, 첫 마일스톤은 환불 보장이 되기를 원하는 경우 — 일단 청구되면 환불되지 않는 승인 후 지급 모델이 아니라."
    ],
    "faqs": [
      {
        "q": "WorkMarket은 경쟁사인가요?",
        "a": "시장의 한 부분에서는 그렇습니다 — 대규모 미국 국내 임시 인력 관리 분야에서요. 하지만 국경을 넘나드는 프로젝트 수행, 인증 기반 배정, 마일스톤 에스크로 분야에서는 우리가 다른 문제를 해결하고 있습니다."
      },
      {
        "q": "어느 쪽이 더 저렴한가요?",
        "a": "직접 비교는 불가능합니다. WorkMarket은 표준 플랫폼 수수료를 공개하지 않으며, 약관에서는 근로자의 선지급 접근(FastFunds)에 대한 선택적 2.5% 수수료만 공개하고 있기 때문입니다. Talengineer는 수수료를 처음부터 공개합니다: 지급된 각 마일스톤의 15%, 창립 클라이언트는 첫 5건의 주문에 대해 5%입니다."
      },
      {
        "q": "둘 다 사용할 수 있나요?",
        "a": "네. 많은 제조업체가 미국 기반의 대규모 현장 서비스 또는 IT 계약직 인력 풀에는 WorkMarket 같은 플랫폼을 운영하고, 범위가 명확히 정의된 자동화 프로젝트 — 특히 국경을 넘나들고 에스크로 마일스톤과 함께 인증된 역량이 필요한 프로젝트 — 에는 별도로 Talengineer를 사용합니다."
      }
    ]
  },
  'upwork': {
    "label": "vs Upwork",
    "metaTitle": "Talengineer vs Upwork — 어느 쪽이 당신의 프로젝트에 맞을까?",
    "metaDesc": "Upwork는 수천 개의 스킬을 아우르는 범용 글로벌 프리랜서 마켓플레이스입니다. Talengineer는 인증이 필수인 마일스톤 에스크로 방식의 산업 자동화 프로젝트를 위해 설계되었으며 현장 검증을 제공합니다.",
    "question": "Talengineer vs Upwork: 어느 쪽이 당신의 프로젝트에 맞을까?",
    "answer": "자동화 엔지니어링뿐 아니라 거의 모든 종류의 원격 업무를 위해 인력을 채용해야 한다면 Upwork가 적합하다. 180개 이상의 국가에 걸쳐 1,800만 명이 넘는 프리랜서와 수천 개의 스킬 카테고리를 아우르는 범용 마켓플레이스로, 공개된 정률 수수료 체계와 고정가 마일스톤을 위한 자체 에스크로 시스템을 갖추고 있다. 이러한 규모와 성숙도는 실질적이다. Talengineer는 더 좁지만 더 깊게 설계되었다. PLC, 로보틱스, 머신비전, 전기 분야의 인증 엔지니어만을 대상으로 하며, 이들은 어떤 업무에도 배정되기 전에 플랫폼 인증을 통과해야 하고, 9개 언어로 서비스되며, 현장 작업에는 GPS 지오펜싱 체크인과 사진 품질 검수가 적용된다. 채용하려는 업무가 범용 원격 업무라면 Upwork의 폭넓음을 따라가기 어렵다. 반면 범위가 명확히 정의된 산업 자동화 프로젝트라면 — 특히 검증이 필요한 물리적이고 현장 기반의 산출물이 있는 경우 — 배정 전 역량 게이팅과 현장 증거야말로 우리가 다른 지점이다.",
    "them": [
      "산업 자동화에 특화되지 않은 범용 글로벌 마켓플레이스: 자체 설명에 따르면 180개 이상 국가에 걸친 1,800만 명 이상의 프리랜서와 수천 개의 스킬 카테고리를 보유",
      "고객이 연락하기 전에 모든 프리랜서의 신원과 소재지가 검증되며, 프로필에는 검증된 리뷰와 근무 이력이 표시된다. 더 심층적인 스킬 심사 — 선별 인터뷰, 스킬 테스트, 포트폴리오 또는 코드 리뷰를 통해 획득하는 'Expert-Vetted' 배지 — 는 선택 사항이며 일부 카테고리에만 한정되고, Upwork 자체 설명에 따르면 Business Plus 및 Enterprise 고객에게만 표시된다. 대다수 프리랜서는 업무를 수락하기 전에 어떤 시험도 통과할 필요가 없다",
      "고정가 업무는 'project funds'(Upwork가 현재 에스크로에 사용하는 명칭)로 보호된다. 고객은 작업이 시작되기 전에 마일스톤에 자금을 예치하며, 고객이 승인하거나 14일간의 검토 기간이 자동으로 종료되면 자금이 지급된다. 시간제 업무는 에스크로가 아니라 Work Diary라는 시간 추적 앱을 통해 별도로 보호된다. 그 외에는 환불이 180일 이내에 건별로 요청되며, 승인 여부는 프리랜서의 재량에 달려 있다. 첫 마일스톤에 대한 환불 보장은 공개되어 있지 않다",
      "공개되어 있지 않다. Upwork 자체의 신뢰 및 안전 페이지에는 이중 인증, 암호화, 악성코드 스캔 등 계정 및 데이터 보안에 대한 설명만 있을 뿐, 대면 또는 현장 업무에 대한 GPS 체크인, 지오펜싱, 사진 검증에 대한 언급은 전혀 없다",
      "고객 측 수수료는 공개되어 있으며 등급별로 나뉜다. Basic 플랜은 마켓플레이스 수수료 5%(은행 송금으로 결제하는 자격 요건을 갖춘 미국 고객은 3%), Business Plus는 10%(자격 요건 충족 시 8%)이며, 여기에 계약당 $0.99–$14.99의 일회성 계약 개시 수수료가 추가된다. 프리랜서 측 수수료는 계약당 0%~15% 범위이며, Upwork가 공개하지 않은 내부 기준에 따라 정해지고, 고정된 공개 요율이 아니라 프리랜서가 수락하기 전에만 개별적으로 표시된다"
    ],
    "themWhen": [
      "산업 자동화 이외의 업무 — 글쓰기, 디자인, 마케팅, 일반 소프트웨어, 행정 업무 — 가 필요한 경우. 이러한 카테고리는 Talengineer에서 전혀 제공하지 않는다",
      "범위가 좁은 인증 인력 명단보다, 리뷰와 평점 이력이 이미 축적된 가능한 한 가장 큰 인재풀에 즉시 접근하고 싶은 경우",
      "범위가 정해진 프로젝트가 아니라 기한이 없는 시간제 업무를 의뢰하는 경우 — Upwork의 Work Diary와 시간제 청구 방식은 지속적이고 장기적인 협업을 위해 설계되어 있다"
    ],
    "usWhen": [
      "배정 전에 역량이 입증되고 걸러져야 하는 경우 — 엔터프라이즈급 고객에게만 보이고 대다수 프리랜서가 취득하지 않는 선택적 배지가 아니라, 산업 자동화에 특화된 필수 플랫폼 인증이 필요한 경우",
      "산출물이 물리적이고 현장 기반인 경우 — 공장 현장, 설비 개조, 커미셔닝 방문 등 — 이며, 증거로 GPS 지오펜싱 체크인과 사진 품질 검수를 원하는 경우. 이는 Upwork 자체의 신뢰 및 안전 페이지에서 설명하지 않는 부분이다",
      "계약 전에 명확하고 견적 가능한 단일 고정 비율로 수수료가 공개되기를 원하고, 첫 마일스톤에 대한 환불 보장을 원하는 경우 — 비공개 기준으로 정해지는 0%-15%의 프리랜서 측 요율과 플랫폼 차원의 환불 보장 부재 대신"
    ],
    "faqs": [
      {
        "q": "Upwork는 경쟁사인가?",
        "a": "범용 프리랜서 채용 분야에서는 그렇다 — 세계 최대 규모의 마켓플레이스 중 하나다. 인증이 필수이며 현장 검증을 수반하는 산업 자동화 프로젝트 수행 분야에서는, 우리는 더 좁고 다른 문제를 해결하고 있으며, 이는 Upwork가 특별히 설계된 영역이 아니다."
      },
      {
        "q": "어느 쪽이 더 저렴한가?",
        "a": "수수료 구조는 직접 비교하기 어렵다. Talengineer는 지급된 각 마일스톤 금액의 15%를 공개한다(창립 고객은 첫 5건의 주문에 한해 5%). Upwork의 고객 수수료는 Basic 플랜에서 5%, Business Plus에서 10%(은행 송금으로 결제하는 자격 요건을 갖춘 미국 고객은 각각 3%/8%)이며, 여기에 일회성 계약 개시 수수료가 추가된다. 프리랜서는 별도로 자신의 수입 중 0%~15%를 지불하며, 그 비율은 Upwork가 공개하지 않는 기준에 따라 정해진다."
      },
      {
        "q": "둘 다 사용할 수 있나?",
        "a": "그렇다. 많은 구매자가 행정, 마케팅, 소프트웨어 등 일반 원격 업무에는 Upwork를, 인증이 필수인 자동화 엔지니어링 — 특히 물리적이고 현장 기반의 산출물이 있는 프로젝트 — 에는 Talengineer를 각각 활용한다."
      }
    ]
  },
  'toptal': {
    "label": "vs Toptal",
    "metaTitle": "Talengineer 대 Toptal — 당신의 프로젝트에 맞는 곳은 어디일까요?",
    "metaDesc": "Toptal은 시간당 청구되는 원격 지식 노동(개발자, 디자이너, 재무, PM)을 위한 검증된 네트워크입니다. Talengineer는 인증이 필수이고 마일스톤 에스크로로 운영되는 산업 자동화 프로젝트를 위해 만들어졌습니다.",
    "question": "Talengineer 대 Toptal: 당신의 프로젝트에 맞는 곳은 어디일까요?",
    "answer": "계약 전에 위험 없이 체험해볼 수 있는, 시간당 청구되는 단일 검증된 전문가——개발자, 디자이너, 프로덕트 매니저 또는 재무 분석가——가 필요하다면 Toptal이 좋은 선택입니다. 바로 그것을 위해 만들어졌기 때문입니다. 네트워크 가입 시 5단계 심사 퍼널(자체 공개 수치에 따르면 월간 지원자 중 전체 합격률은 3% 미만)과 100개국 이상에 걸친 원격 우선 네트워크가 그것입니다. Talengineer는 전혀 다른 유형의 작업을 위해 만들어졌습니다. PLC, 로보틱스, 머신 비전, 전기 등 산업 자동화 프로젝트로, 모든 엔지니어는 어떤 업무든 배정받기 전에 반드시 플랫폼 인증(L1-L3, AI 채점 및 사람 검토)을 통과해야 하며, 작업은 시간당 청구가 아니라 승인된 마일스톤별로 자금이 조달되고 지급되며, 현장 작업에는 증빙으로 GPS 지오펜싱 체크인과 사진 품질 검증이 수반됩니다. 당신의 업무가 원격이고 시간당 청구되는 지식 노동이라면 Toptal의 체험 후 채용 모델이 더 적합합니다. 범위가 명확히 정해진 자동화 프로젝트——특히 공장 현장에서 이루어지는 프로젝트——라면, 인증 게이팅과 마일스톤 에스크로가 바로 우리가 다른 지점입니다.",
    "them": [
      "100개국 이상에 전문가를 보유하고 있으며——대부분 아메리카와 유럽에 기반——자체 표현에 따르면 140개국 이상의 고객에게 서비스를 제공하고, 소프트웨어 개발, 디자인, 재무, 제품/프로젝트 관리를 아우른다. 산업 자동화, PLC, 로보틱스, 머신 비전을 위한 별도 카테고리는 나열되어 있지 않으며, 심사 중 영어 스크리닝 외에 공개된 언어 커버리지 수치는 없다",
      "Toptal 자체가 공개한 퍼널에 따르면, 네트워크 가입 시 1회성 5단계 심사: 언어 및 커뮤니케이션(통과율 26.4%), 심층 역량 심사(7.4%), 실시간 기술 인터뷰(3.6%), 이후 1~3주간의 테스트 프로젝트(3.2%)로 이어지며, 월간 지원자 전체 합격률은 3% 미만이다. 심사는 클라이언트별이나 역량별이 아니라 네트워크 가입 시 한 번만 이루어지며, 별도의 플랫폼 인증 시험은 공개되어 있지 않다",
      "Net 10 조건으로 월 2회 청구되는 시간당 혼합 요율제, 그리고 인재 매칭 단계로 진행하면 월 $79의 정액 구독료가 추가된다. 리스크는 최대 2주간의 무위험 체험(역할당 최대 3명의 후보자)으로 커버되며, 만족하지 못하면 요금이 청구되지 않는다——자체 FAQ에는 '에스크로'나 '마일스톤'이라는 단어가 사용되지 않는다",
      "설계상 원격 우선——자체 표현으로 '대다수는 자택 사무실이나 코워킹 스페이스에서 원격으로 근무한다'고 하며, 현장 근무는 드문 특수 예외로 설명된다. 위치 확인, 지오펜싱, 사진 품질 검증 시스템은 공개되어 있지 않다",
      "월 $79의 구독료는 공개되어 있다. 시간당 요율은 Toptal의 마진을 포함한 '혼합' 요율로 설명되지만, 그 요율에서 회사가 가져가는 구체적인 비율이나 마크업은 공개되어 있지 않다"
    ],
    "themWhen": [
      "산업 자동화 엔지니어가 아니라 개발자, 디자이너, PM, 재무 분석가 같은 단일 원격 지식 노동 전문가가 필요하고, 계약 전에 최대 3명의 후보자를 위험 없이 체험해보고 싶은 경우",
      "범위가 정해진 마일스톤 프로젝트가 아니라 정규직 전환 가능성이 있는 지속적인 시간당 계약을 원하는 경우",
      "건별 인증이 아니라 공개된 5단계 퍼널을 통해 한 번 검증된, 100개국 이상에 걸친 수년간의 확립된 실적을 가진 네트워크를 원하는 경우"
    ],
    "usWhen": [
      "프로젝트가 PLC, 로보틱스, 머신 비전, 전기 등 산업 자동화 작업이며——이는 Toptal 자체 사이트에서 전문 분야로 나열하지 않는 카테고리인 경우",
      "작업이 공장 현장이나 작업 현장에서 이루어지며, 기본값인 원격 우선 방식이 아니라 증빙으로 GPS 지오펜싱 체크인과 사진 품질 검증을 원하는 경우",
      "Net 10 조건의 시간당 청구서가 아니라, 승인한 마일스톤마다 자금이 지급되고 첫 마일스톤에는 환불 보장이 있는 방식을 원하는 경우"
    ],
    "faqs": [
      {
        "q": "Toptal은 경쟁사인가요?",
        "a": "시장의 한 부분에서는 그렇습니다——검증된, 원격, 시간당 청구 지식 노동이라는 점에서요. 하지만 특히 산업 자동화——PLC, 로보틱스, 머신 비전, 전기, 인증 게이팅과 현장 검증을 수반하는——분야에서는 Toptal 자체 사이트가 대상으로 삼지 않는 문제를 저희가 해결하고 있습니다."
      },
      {
        "q": "어느 쪽이 더 저렴한가요?",
        "a": "두 요율은 직접 비교할 수 없습니다. Talengineer는 지급된 각 마일스톤의 15%(창립 초기 고객은 첫 5건의 주문에 한해 5%)를 공개합니다. Toptal은 월 $79의 정액 구독료에 더해 자사 마진이 포함된 혼합 시간당 요율을 공개하지만, 그 요율에서 회사가 얼마의 비율을 가져가는지는 공개하지 않습니다."
      },
      {
        "q": "둘 다 사용할 수 있나요?",
        "a": "네. 많은 제조 팀에게는 인접한 소프트웨어나 PM 업무에는 Toptal 전문가를, 현장 자동화 프로젝트 자체에는 인증받은 Talengineer 엔지니어를 활용하는 방식이 될 수 있습니다."
      }
    ]
  },
};

module.exports = { DICT, COMPARISONS, COMPARISON_META, SLUGS };
