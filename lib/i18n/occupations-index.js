// ── /occupations 索引页 UI 字典（lib/i18n 架构 B，风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/occupations/index.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 九语全量（2026-07-24 三期灌注）：es/vi/hi/fr/de/ja/ko 按 lib/i18n/glossary.js 的
// TERMS + STYLE 灌注，SCADA/PLC 属 KEEP_ENGLISH，全语言保留原样。
// 职业清单/分组数据单一来源在 lib/occupations.js + lib/hireMatrix.js（构建期取用），
// 本模块只承载导览文案，字典搬家不碰数。

// 索引页文案（九语）。
// 诚实红线：本页只做导览（职业按方向分组 + 一句话说明），不写任何统计数字。
const DICT = {
  en: {
    kicker: 'Occupations',
    title: 'Hire by Role Title',
    sub: 'Browse the industrial automation roles you can hire on TalEngineer — grouped by certification track, each with a dedicated page covering duties, skills, regional rates and the certification path behind the title.',
    lead:
      'Job titles and certification tracks are not the same thing. A title like "SCADA engineer" tells you what someone does day to day; a track tells you how the platform screens and certifies them. These pages map the common titles onto our four tracks — PLC & Controls, Robotics, Machine Vision and Electrical — so you can start from the role you are actually hiring for.',
    viewRole: 'View role',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    ctaBtn: 'Post a Project — Free',
  },
  zh: {
    kicker: '职业目录',
    title: '按职位名招聘',
    sub: '浏览可以在 TalEngineer 上招到的工业自动化职位——按认证方向分组，每个职位都有专页，覆盖职责、技能、地区费率与这个头衔背后的认证路径。',
    lead:
      '职位名和认证方向不是一回事。"SCADA 工程师"这样的头衔说的是一个人每天做什么；认证方向说的是平台如何筛选并认证他。这些页面把常见职位名映射到我们的四条方向——PLC 与控制、机器人、机器视觉、电气——让你从真正要招的那个职位出发。',
    viewRole: '查看职位',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    ctaBtn: '免费发布项目',
  },
  es: {
    kicker: 'Ocupaciones',
    title: 'Contrate por título de puesto',
    sub: 'Explore los puestos de automatización industrial que puede contratar en TalEngineer — agrupados por especialidad de certificación, cada uno con una página dedicada que cubre las funciones, las habilidades, las tarifas regionales y la ruta de certificación detrás del título.',
    lead:
      'Los títulos de puesto y las especialidades de certificación no son lo mismo. Un título como "ingeniero de SCADA" le dice qué hace alguien día a día; una especialidad le dice cómo lo evalúa y certifica la plataforma. Estas páginas vinculan los títulos habituales con nuestras cuatro especialidades — PLC y control, Robótica, Visión artificial y Eléctrica — para que pueda empezar por el puesto que realmente está contratando.',
    viewRole: 'Ver puesto',
    ctaHeading: '¿Listo para contratar?',
    ctaBody: 'Publique su proyecto y conéctese con ingenieros certificados y preseleccionados. El depósito en garantía por hitos protege a ambas partes.',
    ctaBtn: 'Publicar un proyecto — Gratis',
  },
  vi: {
    kicker: 'Danh mục nghề nghiệp',
    title: 'Tuyển dụng theo chức danh',
    sub: 'Duyệt qua các vị trí tự động hóa công nghiệp bạn có thể tuyển trên TalEngineer — được nhóm theo hướng chứng chỉ, mỗi vị trí có một trang riêng nêu rõ nhiệm vụ, kỹ năng, mức phí theo khu vực và lộ trình chứng chỉ đằng sau chức danh đó.',
    lead:
      'Chức danh công việc và hướng chứng chỉ không phải là một. Một chức danh như "kỹ sư SCADA" cho bạn biết người đó làm gì hằng ngày; hướng chứng chỉ cho bạn biết nền tảng sàng lọc và cấp chứng chỉ cho họ ra sao. Các trang này ánh xạ những chức danh phổ biến vào bốn hướng của chúng tôi — PLC & Điều khiển, Robot công nghiệp, Thị giác máy và Điện — để bạn có thể bắt đầu từ đúng vị trí mình đang cần tuyển.',
    viewRole: 'Xem vị trí',
    ctaHeading: 'Sẵn sàng tuyển dụng?',
    ctaBody: 'Đăng dự án của bạn và ghép nối với các kỹ sư có chứng chỉ, đã qua sàng lọc trước. Ký quỹ theo cột mốc bảo vệ cả hai bên.',
    ctaBtn: 'Đăng dự án — Miễn phí',
  },
  hi: {
    kicker: 'व्यवसाय सूची',
    title: 'रोल टाइटल से हायर करें',
    sub: 'TalEngineer पर आप जो औद्योगिक ऑटोमेशन रोल हायर कर सकते हैं उन्हें ब्राउज़ करें — प्रमाणन ट्रैक के अनुसार समूहित, हर एक का अपना पेज है जो ज़िम्मेदारियाँ, स्किल्स, क्षेत्रीय दरें और उस टाइटल के पीछे की प्रमाणन राह बताता है।',
    lead:
      'जॉब टाइटल और प्रमाणन ट्रैक एक चीज़ नहीं हैं। "SCADA इंजीनियर" जैसा टाइटल बताता है कि कोई रोज़ क्या करता है; ट्रैक बताता है कि प्लेटफ़ॉर्म उसे कैसे स्क्रीन व प्रमाणित करता है। ये पेज आम टाइटल्स को हमारे चार ट्रैक — PLC व नियंत्रण, रोबोटिक्स, मशीन विज़न और इलेक्ट्रिकल — पर मैप करते हैं, ताकि आप उसी रोल से शुरुआत कर सकें जिसे आप असल में हायर कर रहे हैं।',
    viewRole: 'रोल देखें',
    ctaHeading: 'नियुक्ति के लिए तैयार हैं?',
    ctaBody: 'अपना प्रोजेक्ट पोस्ट करें और पहले से जांचे-परखे, प्रमाणित इंजीनियरों से मैच करें। माइलस्टोन एस्क्रो दोनों पक्षों की सुरक्षा करता है।',
    ctaBtn: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',
  },
  fr: {
    kicker: 'Métiers',
    title: 'Recruter par intitulé de poste',
    sub: 'Parcourez les postes d’automatisation industrielle que vous pouvez pourvoir sur TalEngineer — regroupés par spécialité de certification, chacun avec une page dédiée couvrant les missions, les compétences, les tarifs régionaux et le parcours de certification associé à l’intitulé.',
    lead:
      'Un intitulé de poste et une spécialité de certification ne sont pas la même chose. Un intitulé comme « ingénieur SCADA » indique ce que fait une personne au quotidien ; une spécialité indique comment la plateforme l’évalue et la certifie. Ces pages relient les intitulés courants à nos quatre spécialités — PLC et contrôle-commande, Robotique, Vision industrielle et Électricité — afin que vous puissiez partir du poste que vous recrutez réellement.',
    viewRole: 'Voir le poste',
    ctaHeading: 'Prêt à recruter ?',
    ctaBody: 'Publiez votre projet et soyez mis en relation avec des ingénieurs certifiés et présélectionnés. Le séquestre par jalons protège les deux parties.',
    ctaBtn: 'Publier un projet — Gratuit',
  },
  de: {
    kicker: 'Berufe',
    title: 'Nach Rollenbezeichnung einstellen',
    sub: 'Durchsuchen Sie die Industrieautomatisierungs-Rollen, die Sie auf TalEngineer einstellen können — gruppiert nach Zertifizierungsrichtung, jede mit einer eigenen Seite zu Aufgaben, Fähigkeiten, regionalen Sätzen und dem Zertifizierungsweg hinter dem Titel.',
    lead:
      'Jobtitel und Zertifizierungsrichtungen sind nicht dasselbe. Ein Titel wie "SCADA-Ingenieur" sagt Ihnen, was jemand im Alltag tut; eine Richtung sagt Ihnen, wie die Plattform diese Person prüft und zertifiziert. Diese Seiten ordnen gängige Titel unseren vier Richtungen zu — PLC & Steuerungstechnik, Robotik, Bildverarbeitung und Elektrotechnik —, damit Sie bei der Rolle beginnen können, die Sie tatsächlich besetzen wollen.',
    viewRole: 'Rolle ansehen',
    ctaHeading: 'Bereit einzustellen?',
    ctaBody: 'Schreiben Sie Ihr Projekt aus und werden Sie mit vorab geprüften, zertifizierten Ingenieuren zusammengebracht. Die Meilenstein-Treuhand schützt beide Seiten.',
    ctaBtn: 'Projekt ausschreiben — kostenlos',
  },
  ja: {
    kicker: '職業',
    title: '職種で採用',
    sub: 'TalEngineerで採用できる産業オートメーションの職種を閲覧できます——認定トラックごとにグループ化され、それぞれ専用ページで職務内容、スキル、地域別料金、その肩書きの背後にある認定パスを解説しています。',
    lead:
      '職種の肩書きと認定トラックは同じものではありません。「SCADAエンジニア」のような肩書きは、その人が日々何をするかを示します。トラックは、プラットフォームがその人をどう審査し認定するかを示します。これらのページは、よくある肩書きを4つのトラック——PLCと制御、ロボティクス、マシンビジョン、電気——に対応させ、実際に採用したい職種から始められるようにしています。',
    viewRole: '職種を見る',
    ctaHeading: '採用の準備はできましたか？',
    ctaBody: 'プロジェクトを掲載して、事前審査済みの認定エンジニアとマッチングしましょう。マイルストーン・エスクローが双方を守ります。',
    ctaBtn: 'プロジェクトを掲載 — 無料',
  },
  ko: {
    kicker: '직업 목록',
    title: '직무명으로 채용하기',
    sub: 'TalEngineer에서 채용할 수 있는 산업 자동화 직무를 둘러보세요 — 인증 트랙별로 그룹화되어 있으며, 각 직무는 담당 업무, 스킬, 지역별 요율, 그 직함 뒤에 있는 인증 경로를 다루는 전용 페이지를 갖추고 있습니다.',
    lead:
      '직무명과 인증 트랙은 같은 것이 아닙니다. "SCADA 엔지니어" 같은 직함은 그 사람이 매일 무엇을 하는지 알려주고, 트랙은 플랫폼이 그 사람을 어떻게 심사하고 인증하는지 알려줍니다. 이 페이지들은 흔히 쓰이는 직함을 저희의 4개 트랙 — PLC 및 제어, 로보틱스, 머신 비전, 전기 — 에 연결해, 실제로 채용하려는 직무에서 바로 시작할 수 있게 해줍니다.',
    viewRole: '직무 보기',
    ctaHeading: '채용할 준비가 되셨나요?',
    ctaBody: '프로젝트를 등록하고 사전 심사를 거친 인증 엔지니어와 매칭하세요. 마일스톤 에스크로가 양측을 보호합니다.',
    ctaBtn: '프로젝트 등록 — 무료',
  },
};

module.exports = { DICT };
