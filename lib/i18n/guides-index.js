// ── /guides 索引页 九语 UI 字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/guides/index.jsx 内联 `const UI`（en/zh 逐字节原样搬移，2026-07-24；
// 页面侧以 `import { DICT as UI }` 别名引入，渲染逻辑不动）；es/vi/hi/fr/de/ja/ko 七语按
// lib/i18n/glossary.js 的 TERMS + STYLE 灌注（2026-07-24 九语铺开）。
// 导语只写结构性事实（产能迁移方向、人才池增速跟不上产线落地速度、本地+跨境的组合解法），
// 与 lib/regionGuides.js 的口径一致，不出现任何编造的统计数字。
// 注意：REGION_NAMES / LANG_BADGES / RELATED_ARTICLES 与页面逻辑绑定，仍留在页面内联
// （Phase 3 数据模块范围；REGION_NAMES / RELATED_ARTICLES 已在本轮随本文件同步补齐九语）。
const DICT = {
  en: {
    kicker: 'Country Guides',
    title: 'Country hiring guides for cross-border factory projects',
    sub: 'Where manufacturing capacity is moving, what the local automation talent pool actually looks like, and how to staff your line with a local core plus cross-border support.',
    heroPost: 'Post a Project — Free',
    heroBrowse: 'Browse engineers',
    blurbTitle: 'Why cross-border staffing is the hard part',
    blurb1:
      'Manufacturing capacity keeps relocating — nearshoring pulls investment into Mexico, and China-plus-one strategies push electronics and light manufacturing into Vietnam and Thailand. In every one of these destinations the same structural problem repeats: new lines are being stood up faster than the local pool of experienced PLC, robotics and machine-vision engineers can grow, and the engineers who do exist are usually already committed.',
    blurb2:
      'The usual fallback — flying engineers in from headquarters — is slow and expensive, and it meets language and time-zone friction on the floor. The durable answer is a local core supported across borders: local certified engineers for commissioning and day-to-day support, paired with remote or fly-in specialists when local depth runs out, coordinated in one project room and protected by milestone escrow. Each guide below breaks this down for one destination.',
    cardsTitle: 'Pick your destination',
    readGuide: 'Read the guide →',
    articlesTitle: 'From the Playbook',
    articlesIntro:
      'Deeper, article-length treatments of the same decisions — written for manufacturers planning a build or a line migration.',
    ctaHeading: 'Ready to staff your line?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers — local and cross-border. Milestone escrow protects both sides.',
  },
  zh: {
    kicker: '国别指南',
    title: '跨境建厂项目的分国用人指南',
    sub: '制造产能在往哪儿迁、当地自动化人才池的真实样貌，以及如何用"本地核心 + 跨境支持"为产线配人。',
    heroPost: '免费发布项目',
    heroBrowse: '浏览工程师',
    blurbTitle: '为什么跨境用人才是难点',
    blurb1:
      '制造产能仍在持续迁移——近岸外包(nearshoring)把投资涌向墨西哥，"中国+1"策略把电子与轻工制造推向越南与泰国。在每个目的地，同一个结构性问题都在重演：新产线落地的速度，快于当地有经验的 PLC、机器人、机器视觉工程师池的增长，而现有的人手大多已被占满。',
    blurb2:
      '常见的退路——从总部空运工程师过去——既慢又贵，到了现场还撞上语言与时区的摩擦。经得起时间考验的答案，是有跨境支持的本地核心：本地持证工程师负责调试与日常支持，本地深度不够时搭配远程或飞抵的专家，在同一个项目间协同，并由里程碑托管保障。下面每篇指南，把这套思路落到一个具体目的地。',
    cardsTitle: '选择目的地',
    readGuide: '阅读指南 →',
    articlesTitle: '来自 Playbook',
    articlesIntro: '同一批决策的文章级深度展开——写给正在规划建厂或产线迁移的制造企业。',
    ctaHeading: '准备好为产线配人了吗？',
    ctaBody: '发布项目，与经过预审、持证的本地与跨境工程师精准匹配。里程碑托管保障双方权益。',
  },
  es: {
    kicker: 'Guías por país',
    title: 'Guías de contratación por país para proyectos de fábricas transfronterizos',
    sub: 'Hacia dónde se está moviendo la capacidad de manufactura, cómo es en realidad el grupo local de talento en automatización, y cómo dotar de personal a su línea con un núcleo local más apoyo transfronterizo.',
    heroPost: 'Publicar un proyecto — Gratis',
    heroBrowse: 'Explorar ingenieros',
    blurbTitle: 'Por qué la contratación transfronteriza es la parte difícil',
    blurb1:
      'La capacidad de manufactura sigue reubicándose — el nearshoring atrae inversión hacia México, y las estrategias de "China más uno" empujan la electrónica y la manufactura ligera hacia Vietnam y Tailandia. En cada uno de estos destinos se repite el mismo problema estructural: las nuevas líneas se están montando más rápido de lo que puede crecer el grupo local de ingenieros con experiencia en PLC, robótica y visión artificial, y los ingenieros que sí existen ya suelen estar comprometidos.',
    blurb2:
      'La solución habitual — traer ingenieros por avión desde la sede central — es lenta y costosa, y en planta se topa con fricciones de idioma y zona horaria. La respuesta duradera es un núcleo local respaldado a través de fronteras: ingenieros locales certificados para la puesta en marcha y el soporte diario, combinados con especialistas remotos o que viajan cuando la profundidad local no alcanza, coordinados en una sola sala de proyecto y protegidos por el depósito en garantía por hitos. Cada guía a continuación desglosa esto para un destino.',
    cardsTitle: 'Elija su destino',
    readGuide: 'Leer la guía →',
    articlesTitle: 'Del Playbook',
    articlesIntro: 'Tratamientos más profundos, de extensión de artículo, sobre las mismas decisiones — escritos para fabricantes que planean una construcción o una migración de línea.',
    ctaHeading: '¿Listo para dotar de personal a su línea?',
    ctaBody: 'Publique su proyecto y conéctese con ingenieros certificados y preseleccionados — locales y transfronterizos. El depósito en garantía por hitos protege a ambas partes.',
  },
  vi: {
    kicker: 'Hướng dẫn theo quốc gia',
    title: 'Hướng dẫn tuyển dụng theo quốc gia cho các dự án nhà máy xuyên biên giới',
    sub: 'Năng lực sản xuất đang dịch chuyển đến đâu, nguồn nhân lực tự động hóa tại địa phương thực sự ra sao, và cách bố trí nhân sự cho dây chuyền của bạn bằng đội ngũ nòng cốt tại chỗ kết hợp hỗ trợ xuyên biên giới.',
    heroPost: 'Đăng dự án — Miễn phí',
    heroBrowse: 'Duyệt kỹ sư',
    blurbTitle: 'Vì sao bố trí nhân sự xuyên biên giới lại là phần khó nhất',
    blurb1:
      'Năng lực sản xuất vẫn tiếp tục dịch chuyển — nearshoring kéo dòng vốn đầu tư vào Mexico, còn chiến lược "Trung Quốc + 1" đẩy ngành điện tử và sản xuất nhẹ sang Việt Nam và Thái Lan. Ở mỗi điểm đến này, cùng một vấn đề cấu trúc lặp lại: các dây chuyền mới được dựng lên nhanh hơn tốc độ phát triển của nguồn kỹ sư PLC, robot và thị giác máy có kinh nghiệm tại địa phương, còn những kỹ sư hiện có thường đã kín lịch.',
    blurb2:
      'Giải pháp thường thấy — điều kỹ sư từ trụ sở chính bay sang — vừa chậm vừa tốn kém, và khi xuống hiện trường lại vấp phải rào cản ngôn ngữ và múi giờ. Câu trả lời bền vững là một đội ngũ nòng cốt tại chỗ được hỗ trợ xuyên biên giới: kỹ sư có chứng chỉ tại địa phương phụ trách chạy thử và hỗ trợ hằng ngày, kết hợp với chuyên gia làm từ xa hoặc bay đến khi chiều sâu tại chỗ không đủ, tất cả được điều phối trong một phòng dự án chung và được bảo vệ bởi ký quỹ theo cột mốc. Mỗi hướng dẫn bên dưới phân tích điều này cho một điểm đến cụ thể.',
    cardsTitle: 'Chọn điểm đến của bạn',
    readGuide: 'Đọc hướng dẫn →',
    articlesTitle: 'Từ Playbook',
    articlesIntro: 'Những bài phân tích sâu hơn, dài hơn về cùng những quyết định này — viết cho các nhà sản xuất đang lên kế hoạch xây dựng hoặc di dời dây chuyền.',
    ctaHeading: 'Sẵn sàng bố trí nhân sự cho dây chuyền của bạn?',
    ctaBody: 'Đăng dự án của bạn và ghép nối với các kỹ sư đã qua sàng lọc, có chứng chỉ — tại địa phương và xuyên biên giới. Ký quỹ theo cột mốc bảo vệ cả hai bên.',
  },
  hi: {
    kicker: 'देश गाइड',
    title: 'क्रॉस-बॉर्डर फ़ैक्ट्री प्रोजेक्ट्स के लिए देश-वार हायरिंग गाइड',
    sub: 'मैन्युफ़ैक्चरिंग क्षमता कहाँ शिफ़्ट हो रही है, लोकल ऑटोमेशन टैलेंट पूल वास्तव में कैसा दिखता है, और लोकल कोर + क्रॉस-बॉर्डर सपोर्ट के साथ अपनी लाइन में स्टाफ़िंग कैसे करें।',
    heroPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',
    heroBrowse: 'इंजीनियर ब्राउज़ करें',
    blurbTitle: 'क्रॉस-बॉर्डर स्टाफ़िंग सबसे मुश्किल हिस्सा क्यों है',
    blurb1:
      'मैन्युफ़ैक्चरिंग क्षमता लगातार शिफ़्ट हो रही है — नियरशोरिंग निवेश को मेक्सिको की ओर खींच रही है, और "चाइना+1" रणनीतियाँ इलेक्ट्रॉनिक्स व लाइट मैन्युफ़ैक्चरिंग को वियतनाम और थाईलैंड की ओर धकेल रही हैं। इन हर एक डेस्टिनेशन में एक जैसी संरचनात्मक समस्या दोहराती है: नई लाइनें, अनुभवी PLC, रोबोटिक्स और मशीन विज़न इंजीनियरों के लोकल पूल के बढ़ने की रफ़्तार से ज़्यादा तेज़ी से खड़ी हो रही हैं, और जो इंजीनियर मौजूद हैं वे अक्सर पहले से ही किसी और काम में बंधे हैं।',
    blurb2:
      'सामान्य विकल्प — हेडक्वार्टर से इंजीनियरों को उड़ाकर लाना — धीमा और महंगा है, और फ़्लोर पर भाषा व टाइम-ज़ोन की रुकावटों से टकराता है। टिकाऊ जवाब है क्रॉस-बॉर्डर सपोर्ट वाला एक लोकल कोर: कमीशनिंग और रोज़मर्रा के सपोर्ट के लिए लोकल प्रमाणित इंजीनियर, और लोकल गहराई कम पड़ने पर रिमोट या फ़्लाई-इन विशेषज्ञ — सब एक ही प्रोजेक्ट रूम में समन्वित और माइलस्टोन एस्क्रो से सुरक्षित। नीचे हर गाइड इसे एक डेस्टिनेशन के लिए विस्तार से बताती है।',
    cardsTitle: 'अपना डेस्टिनेशन चुनें',
    readGuide: 'गाइड पढ़ें →',
    articlesTitle: 'Playbook से',
    articlesIntro: 'इन्हीं फ़ैसलों पर गहरी, आर्टिकल-लंबाई की चर्चा — निर्माण या लाइन माइग्रेशन की योजना बना रहे मैन्युफ़ैक्चरर्स के लिए लिखी गई।',
    ctaHeading: 'अपनी लाइन में स्टाफ़िंग के लिए तैयार हैं?',
    ctaBody: 'अपना प्रोजेक्ट पोस्ट करें और पहले से जांचे-परखे, प्रमाणित इंजीनियरों से मैच पाएं — लोकल और क्रॉस-बॉर्डर दोनों। माइलस्टोन एस्क्रो दोनों पक्षों की सुरक्षा करता है।',
  },
  fr: {
    kicker: 'Guides par pays',
    title: 'Guides de recrutement par pays pour les projets d’usine transfrontaliers',
    sub: 'Où se déplace la capacité de fabrication, à quoi ressemble réellement le vivier local de talents en automatisation, et comment doter votre ligne d’un noyau local complété par un soutien transfrontalier.',
    heroPost: 'Publier un projet — Gratuit',
    heroBrowse: 'Parcourir les ingénieurs',
    blurbTitle: 'Pourquoi le recrutement transfrontalier est la partie difficile',
    blurb1:
      'La capacité de fabrication continue de se déplacer — le nearshoring attire les investissements vers le Mexique, et les stratégies « Chine+1 » poussent l’électronique et la fabrication légère vers le Vietnam et la Thaïlande. Dans chacune de ces destinations, le même problème structurel se répète : de nouvelles lignes sont mises en place plus vite que le vivier local d’ingénieurs expérimentés en PLC, robotique et vision industrielle ne peut croître, et les ingénieurs en place sont généralement déjà mobilisés.',
    blurb2:
      'La solution habituelle — faire venir des ingénieurs du siège par avion — est lente et coûteuse, et se heurte sur le terrain à des frictions de langue et de fuseau horaire. La réponse durable est un noyau local soutenu au-delà des frontières : des ingénieurs certifiés locaux pour la mise en service et le support quotidien, associés à des spécialistes à distance ou envoyés sur place lorsque la profondeur locale manque, coordonnés dans une seule salle de projet et protégés par le séquestre par jalons. Chaque guide ci-dessous détaille cette approche pour une destination.',
    cardsTitle: 'Choisissez votre destination',
    readGuide: 'Lire le guide →',
    articlesTitle: 'Extrait du Playbook',
    articlesIntro: 'Des analyses plus approfondies, au format article, sur ces mêmes décisions — rédigées pour les fabricants qui planifient une construction ou une migration de ligne.',
    ctaHeading: 'Prêt à doter votre ligne en personnel ?',
    ctaBody: 'Publiez votre projet et soyez mis en relation avec des ingénieurs présélectionnés et certifiés — locaux et transfrontaliers. Le séquestre par jalons protège les deux parties.',
  },
  de: {
    kicker: 'Länderleitfäden',
    title: 'Länderleitfäden zur Personalgewinnung für grenzüberschreitende Fabrikprojekte',
    sub: 'Wohin sich Fertigungskapazität verlagert, wie der lokale Talentpool für Automatisierung tatsächlich aussieht, und wie Sie Ihre Linie mit einem lokalen Kern plus grenzüberschreitender Unterstützung besetzen.',
    heroPost: 'Projekt ausschreiben — kostenlos',
    heroBrowse: 'Ingenieure durchsuchen',
    blurbTitle: 'Warum grenzüberschreitende Personalbesetzung der schwierige Teil ist',
    blurb1:
      'Fertigungskapazität verlagert sich weiterhin — Nearshoring zieht Investitionen nach Mexiko, und China-plus-eins-Strategien verlagern Elektronik und Leichtfertigung nach Vietnam und Thailand. In jedem dieser Zielländer wiederholt sich dasselbe strukturelle Problem: Neue Linien entstehen schneller, als der lokale Pool erfahrener PLC-, Robotik- und Bildverarbeitungsingenieure wachsen kann, und die vorhandenen Ingenieure sind meist schon gebunden.',
    blurb2:
      'Die übliche Ausweichlösung — Ingenieure von der Zentrale einfliegen zu lassen — ist langsam und teuer und stößt vor Ort auf Sprach- und Zeitzonenreibung. Die tragfähige Antwort ist ein lokaler Kern mit grenzüberschreitender Unterstützung: lokale zertifizierte Ingenieure für Inbetriebnahme und den täglichen Support, ergänzt durch Remote- oder einfliegende Spezialisten, wenn die lokale Tiefe nicht ausreicht — koordiniert in einem gemeinsamen Projektraum und durch Meilenstein-Treuhand geschützt. Jeder Leitfaden unten schlüsselt dies für ein Zielland auf.',
    cardsTitle: 'Wählen Sie Ihr Ziel',
    readGuide: 'Leitfaden lesen →',
    articlesTitle: 'Aus dem Playbook',
    articlesIntro: 'Tiefergehende Behandlungen derselben Entscheidungen in Artikellänge — geschrieben für Hersteller, die einen Aufbau oder eine Linienverlagerung planen.',
    ctaHeading: 'Bereit, Ihre Linie zu besetzen?',
    ctaBody: 'Veröffentlichen Sie Ihr Projekt und werden Sie mit vorab geprüften, zertifizierten Ingenieuren zusammengebracht — lokal und grenzüberschreitend. Die Meilenstein-Treuhand schützt beide Seiten.',
  },
  ja: {
    kicker: '国別ガイド',
    title: '国境を越えた工場プロジェクトのための国別採用ガイド',
    sub: '製造能力がどこへ移っているか、現地の自動化人材プールが実際どのような状況か、そして現地コア人材に国境を越えたサポートを組み合わせてラインの人員を配置する方法。',
    heroPost: 'プロジェクトを掲載 — 無料',
    heroBrowse: 'エンジニアを探す',
    blurbTitle: 'なぜ国境を越えた人員配置が難しいのか',
    blurb1:
      '製造能力は今も移動を続けています——ニアショアリングはメキシコへの投資を呼び込み、「チャイナ・プラス・ワン」戦略は電子機器と軽工業をベトナムやタイへと押し出しています。これらの目的地のいずれでも、同じ構造的な問題が繰り返されます:新しいラインは、経験豊富なPLC・ロボティクス・マシンビジョンエンジニアの現地プールが育つ速度よりも速く立ち上がり、実在するエンジニアはたいてい既に他の仕事に確保されています。',
    blurb2:
      'よくある回避策——本社からエンジニアを飛行機で送り込む——は遅く、コストがかかり、現場では言語や時差の摩擦に直面します。持続可能な答えは、国境を越えたサポートを伴う現地コアです:試運転と日常サポートを担う現地の認定エンジニアに、現地の深みが足りないときはリモートまたは出張の専門家を組み合わせ、ひとつのプロジェクトルームで連携し、マイルストーン・エスクローで保護します。以下の各ガイドでは、これを1つの目的地について詳しく説明しています。',
    cardsTitle: '行き先を選ぶ',
    readGuide: 'ガイドを読む →',
    articlesTitle: 'Playbookより',
    articlesIntro: '同じ意思決定について、より深く記事の形でまとめたもの——工場建設やライン移転を計画している製造業者向けに書かれています。',
    ctaHeading: 'ラインの人員配置を始める準備はできましたか？',
    ctaBody: 'プロジェクトを掲載し、事前審査済みの認定エンジニア——現地・国境を越えたどちらも——とマッチングしましょう。マイルストーン・エスクローが双方を保護します。',
  },
  ko: {
    kicker: '국가별 가이드',
    title: '국경을 넘는 공장 프로젝트를 위한 국가별 채용 가이드',
    sub: '제조 역량이 어디로 이동하고 있는지, 현지 자동화 인재 풀이 실제로 어떤 모습인지, 그리고 현지 핵심 인력에 국경을 넘는 지원을 결합해 라인에 인력을 배치하는 방법.',
    heroPost: '프로젝트 등록 — 무료',
    heroBrowse: '엔지니어 둘러보기',
    blurbTitle: '국경을 넘는 인력 배치가 어려운 이유',
    blurb1:
      '제조 역량은 계속 이동하고 있습니다 — 니어쇼어링은 투자를 멕시코로 끌어들이고, "차이나 플러스 원" 전략은 전자·경공업 제조를 베트남과 태국으로 밀어냅니다. 이 모든 목적지에서 동일한 구조적 문제가 반복됩니다: 새 라인은 숙련된 PLC, 로보틱스, 머신 비전 엔지니어의 현지 인력 풀이 성장하는 속도보다 더 빠르게 세워지고, 실제로 존재하는 엔지니어들은 대개 이미 다른 곳에 매여 있습니다.',
    blurb2:
      '흔한 대안 — 본사에서 엔지니어를 비행기로 데려오는 방식 — 은 느리고 비용이 많이 들며, 현장에서는 언어와 시차 문제에 부딪힙니다. 지속 가능한 해법은 국경을 넘는 지원을 받는 현지 핵심 인력입니다: 시운전과 일상 지원을 담당하는 현지 인증 엔지니어에, 현지 역량이 부족할 때 원격 또는 파견 전문가를 결합하고, 하나의 프로젝트 룸에서 조율하며, 마일스톤 에스크로로 보호받습니다. 아래 각 가이드는 이를 하나의 목적지에 대해 자세히 설명합니다.',
    cardsTitle: '목적지를 선택하세요',
    readGuide: '가이드 읽기 →',
    articlesTitle: 'Playbook에서',
    articlesIntro: '동일한 의사 결정을 더 깊이 다룬, 기사 분량의 콘텐츠 — 공장 건설이나 라인 이전을 계획하는 제조업체를 위해 작성되었습니다.',
    ctaHeading: '라인에 인력을 배치할 준비가 되셨나요?',
    ctaBody: '프로젝트를 등록하고 사전 심사를 거친 인증 엔지니어와 매칭하세요 — 현지 및 국경을 넘는 인력 모두. 마일스톤 에스크로가 양측을 모두 보호합니다.',
  },
};

module.exports = { DICT };
