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
};

module.exports = { DICT, COMPARISONS, COMPARISON_META, SLUGS };
