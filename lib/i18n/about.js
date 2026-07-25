// ── /about 页语言字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）────────
//
// 来源：pages/about.jsx 内联 DICT（en/zh 逐字节原样搬移，2026-07-24）。
// 纯机械搬移：文案、数字、来源注释零改动；渲染逻辑（DICT[lang] || DICT.en）留在页面。
// ── 数字纪律（诚实红线）────────────────────────────────────────────────────────
// 本页出现的所有平台数字，每个只写一次，且各有单一来源：
//   · 15% / 85% / founding 5% / 前 5 单  ← src/config/fees.js（措辞照 pages/pricing.jsx 先例）
//   · 10 题 / 40 分钟 / 70 分及格 / 7 天冷却 / 每池 20 套题  ← src/config/training.js
//   · TalScore 权重 25/25/30/20、贝叶斯平均、纠纷率 >10% 归零  ← src/services/talScore.js
// 除此之外零统计数字：不写团队规模、办公室、融资、GMV、用户数——没有的事不编。
// 需求/市场类表述一律只做结构性陈述（照 lib/regionGuides.js 的口径）。

// 文案字典：en/zh 两套全量，其余语言回退英文（全站 `|| en` 约定，SSR 首帧英文）。
const DICT = {
  en: {
    kicker: 'About Talengineer',
    title: 'Verified engineers for the factory floor',
    sub: 'Talengineer is a global marketplace for certified industrial automation engineers — PLC, robotics, machine vision and electrical. Our mission is to make proven automation skill hireable anywhere: verified before you commit, protected until the work is done.',

    // ── 我们在建什么（口径对齐 public/llms.txt 的定位段）────────────────────
    missionTitle: 'What we are building',
    mission1:
      'Hiring an industrial automation engineer is hard for a reason that has nothing to do with supply: a résumé cannot prove commissioning skill. Anyone can list "Siemens TIA Portal" or "Fanuc" on a profile. Whether they can actually write maintainable logic, debug a cell under time pressure, or make a vision system survive real-world lighting only shows up on the plant floor — usually at the most expensive possible moment. We are building the marketplace that closes that gap.',
    mission2:
      'On Talengineer, an employer describes what they need in natural language — in any of the 9 languages the platform speaks — and AI standardizes it into specs, a scope of work and a milestone plan, then recommends pre-screened, platform-certified engineers. Payment runs through milestone escrow: funds release only after the employer approves each milestone. On-site work is verified with GPS-geofenced check-ins and photo QC, and project chat is live-translated so both sides work in their own language.',
    mission3:
      'We serve two parallel lines of demand. Domestically in the US: manufacturers hiring certified automation engineers for on-site commissioning, retrofits and remote controls work. Cross-border: overseas manufacturers — for example, companies building plants in Mexico, Vietnam or Thailand — hiring local and cross-border engineers with bilingual collaboration built in from the first message.',

    // ── 方法论三卡（三道质量闸）─────────────────────────────────────────────
    methodTitle: 'How we verify skill',
    methodIntro:
      'Three quality gates stand between "claims a skill" and "can be assigned to your project". Each one is published, not proprietary hand-waving.',
    card1Title: 'Hands-on AI screening',
    card1Body:
      'Every engineer takes a practical AI technical screener in their claimed specialty — scenario questions that probe real judgment, not a keyword scan of a résumé. The score is server-signed and becomes the capability baseline that follows them through the platform: it drives default ranking in browse, unlocks the Verified badge, and unscreened profiles start at zero and can be filtered out by employers.',
    card2Title: 'Certification as an assignment gate',
    // 认证数字全部来自 src/config/training.js（10 题/40 分钟/70 分/7 天/20 套），只在这里出现一次。
    card2Body:
      'Four tracks — PLC, robotics, machine vision, electrical — at levels L1 to L3. Each exam is 10 questions in 40 minutes, mixing multiple-choice, scenario and deep-analysis questions; it is AI-graded and then human-reviewed before any certificate is issued. The pass mark is 70, a failed attempt triggers a 7-day cooldown, and papers draw from a bank of up to 20 exam sets per track, level and language, so the exam cannot be memorized. Only certified engineers can be assigned to projects: certification here is a gate, not a badge.',
    card2Link: 'Explore certification →',
    card3Title: 'A public quality score',
    // TalScore 权重与红线来自 src/services/talScore.js（25/25/30/20、贝叶斯、>10% 归零），只在这里出现一次。
    card3Body:
      'TalScore (0–100) weighs AI screening 25, platform certification 25, client ratings 30 and reliability 20. Ratings are Bayesian-averaged so a single five-star review cannot vault a newcomer to the top, and a dispute rate above 10% zeroes the reliability dimension outright. The full algorithm is public — you can read exactly how the number is computed.',
    card3Link: 'Read the TalScore algorithm →',

    // ── founding 阶段的诚实叙事（不编团队规模/办公室/融资）───────────────────
    stageTitle: 'Where we are today',
    stage1:
      'Talengineer is a founding-stage platform, and we would rather say that plainly than dress it up. The mechanisms this site describes — milestone escrow, certification exams, TalScore, the evidence-based dispute process — are live in production today. What we do not yet have is scale, and we will not pretend otherwise: you will find no invented user counts, no growth statistics and no fabricated logos here. Case studies are published one at a time, as real founding orders complete.',
    // founding 费率措辞照 pages/pricing.jsx 先例，数字单一来源 src/config/fees.js，只在这里出现一次。
    stage2:
      'Founding terms reflect that stage. The standard escrow fee is 15% — engineers keep 85% of every released milestone — and founding employers pay just 5% on their first 5 orders. The rate is read from a single backend configuration, so the fee you see is exactly the fee charged.',
    stage3:
      'That same discipline runs through the whole site: every platform number you read here traces back to one configuration source in the codebase, and market statements are kept structural — we describe how things work, not statistics we cannot stand behind.',
    stageLink: 'See full pricing →',

    // ── 联系块 ─────────────────────────────────────────────────────────────
    contactTitle: 'Get in touch',
    contactBody:
      'Questions, partnerships or press — write to us and a human will read it. If your question is about a specific project, the fastest route is to post it and let the AI structure the scope for you.',
    contactEmailLabel: 'Email',
    contactPageLink: 'All contact options →',

    // ── 底部 CTA ───────────────────────────────────────────────────────────
    ctaHeading: 'Work with us',
    ctaBody: 'Post a project for free, or apply to join as an engineer — applying and being listed is free.',
    ctaPost: 'Post a Project — Free',
    ctaApply: 'Apply as an Engineer',
  },

  zh: {
    kicker: '关于 Talengineer',
    title: '为工厂现场而生的持证工程师平台',
    sub: 'Talengineer 是面向持证工业自动化工程师的全球市场——PLC、机器人、机器视觉与电气。我们的使命：让被验证过的自动化技能在任何地方都能被雇到——签约之前先验证，交付完成才放款。',

    missionTitle: '我们在建什么',
    mission1:
      '雇一名工业自动化工程师之所以难，根源与供给无关：简历证明不了调试能力。谁都可以在档案里写上"Siemens TIA Portal"或"Fanuc"，但他能否写出可维护的逻辑、能否顶着时间压力排查一个工作站、能否让视觉系统扛住现实打光——这些只有到了车间现场才见分晓，而且往往在代价最高的时刻暴露。我们要建的，就是把这条鸿沟合上的市场。',
    mission2:
      '在 Talengineer 上，雇主用自然语言描述需求——平台支持的 9 种语言任选其一——AI 将其标准化为规格书、工作范围和里程碑计划，再推荐经过预筛、持平台认证的工程师。付款走里程碑托管：每个里程碑经雇主批准后资金才会释放。现场工作以 GPS 围栏签到和照片质检留证，项目聊天实时互译，双方各用各的母语协作。',
    mission3:
      '我们同时服务两条平行的需求线。美国本土：制造企业为现场调试、产线改造与远程控制工作雇佣持证自动化工程师。跨境：出海制造企业——例如在墨西哥、越南、泰国建厂的公司——雇佣当地及跨境工程师，双语协作从第一条消息起就是内建的。',

    methodTitle: '我们如何验证技能',
    methodIntro:
      '从"声称会"到"可以被指派到你的项目"，中间隔着三道质量闸。每一道都是公开的，不搞黑箱话术。',
    card1Title: '实操型 AI 筛选',
    card1Body:
      '每位工程师都会参加其所报方向的实操型 AI 技术筛选——用场景题考察真实判断力，而不是对简历做关键词扫描。筛选分由服务端签名落库，成为伴随其整个平台生涯的能力基线：决定浏览页默认排序、解锁 Verified 徽章；未筛选的档案从 0 分起步，雇主可一键过滤。',
    card2Title: '认证即指派门槛',
    // 认证数字全部来自 src/config/training.js（10 题/40 分钟/70 分/7 天/20 套），只在这里出现一次。
    card2Body:
      '四个方向——PLC、机器人、机器视觉、电气——各设 L1 至 L3 三个等级。每场考试 40 分钟 10 道题，混合选择题、场景题与深度分析题；先由 AI 评分，再经人工复核，才会发放任何证书。及格线 70 分，挂科后有 7 天冷却期，试卷从每个"方向×等级×语言"最多 20 套的题库中随机抽取，背题刷不穿。只有持证工程师才能被指派到项目：在这里，认证是门槛，不是徽章。',
    card2Link: '了解认证体系 →',
    card3Title: '公开的质量分',
    // TalScore 权重与红线来自 src/services/talScore.js（25/25/30/20、贝叶斯、>10% 归零），只在这里出现一次。
    card3Body:
      'TalScore（0–100 分）的权重构成：AI 筛选 25、平台认证 25、雇主评分 30、可靠性 20。评分采用贝叶斯平均——一条五星好评刷不动排名；纠纷率超过 10%，可靠性维度直接归零。完整算法全文公开——这个数字怎么算出来的，你可以逐条读到。',
    card3Link: '阅读 TalScore 算法 →',

    stageTitle: '我们现在走到哪了',
    stage1:
      'Talengineer 是一个 founding 阶段的平台——我们宁可把这句话说得明明白白，也不粉饰。本站描述的机制——里程碑托管、认证考试、TalScore、基于证据的纠纷流程——今天都真实运行在生产环境。我们还没有的，是规模；对此我们不装：这里没有编造的用户数、没有增长统计、没有虚构的客户 logo。案例研究一单一单发布，只在真实的 founding 订单完成之后。',
    // founding 费率措辞照 pages/pricing.jsx 先例，数字单一来源 src/config/fees.js，只在这里出现一次。
    stage2:
      'founding 阶段的条款也如实反映这一点：标准托管费 15%——工程师保留每笔已放款里程碑的 85%——founding 雇主前 5 单仅收 5%。费率取自单一的后端配置，你看到的费率就是实际收取的费率。',
    stage3:
      '同样的纪律贯穿全站：你在这里读到的每一个平台数字，都能追溯到代码库中唯一的配置来源；市场类表述一律保持结构性——我们描述事情如何运转，不写我们无法背书的统计数字。',
    stageLink: '查看完整定价 →',

    contactTitle: '联系我们',
    contactBody:
      '咨询、合作或媒体垂询——写信给我们，会有真人阅读。如果你的问题关乎一个具体项目，最快的路径是直接发布它，让 AI 帮你把范围结构化。',
    contactEmailLabel: '邮箱',
    contactPageLink: '全部联系方式 →',

    ctaHeading: '与我们同行',
    ctaBody: '免费发布项目，或以工程师身份申请入驻——申请与上架均不收费。',
    ctaPost: '免费发布项目',
    ctaApply: '以工程师身份申请',
  },

  es: {
    kicker: "Acerca de Talengineer",
    title: "Ingenieros verificados para la planta de producción",
    sub: "Talengineer es un mercado global de ingenieros de automatización industrial certificados: PLC, robótica, visión artificial y eléctrica. Nuestra misión es hacer que la habilidad de automatización comprobada sea contratable en cualquier lugar: verificada antes de que usted se comprometa, protegida hasta que el trabajo esté terminado.",
    missionTitle: "Qué estamos construyendo",
    mission1: "Contratar a un ingeniero de automatización industrial es difícil por una razón que no tiene nada que ver con la oferta: un currículum no puede demostrar la habilidad de puesta en marcha. Cualquiera puede poner \"Siemens TIA Portal\" o \"Fanuc\" en un perfil. Si realmente puede escribir lógica mantenible, depurar una celda bajo presión de tiempo o hacer que un sistema de visión sobreviva a la iluminación del mundo real solo se ve en la planta de producción, y usualmente en el momento más costoso posible. Estamos construyendo el mercado que cierra esa brecha.",
    mission2: "En Talengineer, un empleador describe lo que necesita en lenguaje natural, en cualquiera de los 9 idiomas que habla la plataforma, y la IA lo estandariza en especificaciones, un alcance de trabajo y un plan de hitos, y luego recomienda ingenieros preseleccionados y certificados por la plataforma. El pago se realiza mediante depósito en garantía por hitos: los fondos se liberan solo después de que el empleador aprueba cada hito. El trabajo en sitio se verifica con registros de entrada geolocalizados por GPS y control de calidad fotográfico, y el chat del proyecto se traduce en vivo para que ambas partes trabajen en su propio idioma.",
    mission3: "Atendemos dos líneas de demanda paralelas. A nivel nacional en EE. UU.: fabricantes que contratan ingenieros de automatización certificados para puesta en marcha en sitio, modernizaciones de líneas y trabajo remoto de controles. A nivel transfronterizo: fabricantes en el extranjero — por ejemplo, empresas que construyen plantas en México, Vietnam o Tailandia — que contratan ingenieros locales y transfronterizos con colaboración bilingüe integrada desde el primer mensaje.",
    methodTitle: "Cómo verificamos la habilidad",
    methodIntro: "Tres filtros de calidad se interponen entre \"afirma tener una habilidad\" y \"puede ser asignado a su proyecto\". Cada uno es público, no palabrería propietaria.",
    card1Title: "Evaluación práctica con IA",
    card1Body: "Cada ingeniero realiza una evaluación técnica práctica con IA en su especialidad declarada — preguntas de escenario que examinan el juicio real, no un escaneo de palabras clave de un currículum. La puntuación está firmada por el servidor y se convierte en la línea base de capacidad que lo acompaña por toda la plataforma: impulsa la clasificación predeterminada al explorar, desbloquea la insignia Verificado, y los perfiles sin evaluar comienzan en cero y pueden ser filtrados por los empleadores.",
    card2Title: "La certificación como filtro de asignación",
    card2Body: "Cuatro especialidades — PLC, robótica, visión artificial, eléctrica — en niveles L1 a L3. Cada examen consta de 10 preguntas en 40 minutos, combinando opción múltiple, escenarios y preguntas de análisis profundo; se califica con IA y luego se revisa humanamente antes de emitir cualquier certificado. La calificación mínima de aprobación es 70, un intento fallido activa un enfriamiento de 7 días, y los exámenes se extraen de un banco de hasta 20 conjuntos por especialidad, nivel e idioma, de modo que el examen no se puede memorizar. Solo los ingenieros certificados pueden ser asignados a proyectos: la certificación aquí es un filtro, no una insignia.",
    card2Link: "Explorar la certificación →",
    card3Title: "Una puntuación de calidad pública",
    card3Body: "TalScore (0–100) pondera la evaluación con IA en 25, la certificación de la plataforma en 25, las calificaciones de los clientes en 30 y la confiabilidad en 20. Las calificaciones se promedian de forma bayesiana para que una sola reseña de cinco estrellas no pueda catapultar a un recién llegado a la cima, y una tasa de disputas superior al 10% anula por completo la dimensión de confiabilidad. El algoritmo completo es público: puede leer exactamente cómo se calcula el número.",
    card3Link: "Leer el algoritmo de TalScore →",
    stageTitle: "Dónde estamos hoy",
    stage1: "Talengineer es una plataforma en etapa fundadora, y preferimos decirlo con claridad antes que disfrazarlo. Los mecanismos que describe este sitio — depósito en garantía por hitos, exámenes de certificación, TalScore, el proceso de disputas basado en evidencia — están en producción hoy. Lo que aún no tenemos es escala, y no fingiremos lo contrario: aquí no encontrará cifras de usuarios inventadas, ni estadísticas de crecimiento, ni logotipos fabricados. Los casos de estudio se publican de uno en uno, a medida que se completan pedidos fundadores reales.",
    stage2: "Las condiciones fundadoras reflejan esa etapa. La comisión estándar de depósito en garantía es del 15% — los ingenieros conservan el 85% de cada hito liberado — y los empleadores fundadores pagan solo el 5% en sus primeras 5 órdenes. La tarifa se lee de una única configuración del backend, así que la comisión que usted ve es exactamente la que se cobra.",
    stage3: "Esa misma disciplina recorre todo el sitio: cada número de la plataforma que lee aquí se remonta a una única fuente de configuración en el código, y las afirmaciones sobre el mercado se mantienen estructurales — describimos cómo funcionan las cosas, no estadísticas que no podamos respaldar.",
    stageLink: "Ver precios completos →",
    contactTitle: "Póngase en contacto",
    contactBody: "Preguntas, asociaciones o prensa — escríbanos y una persona lo leerá. Si su pregunta es sobre un proyecto específico, la vía más rápida es publicarlo y dejar que la IA estructure el alcance por usted.",
    contactEmailLabel: "Correo electrónico",
    contactPageLink: "Todas las opciones de contacto →",
    ctaHeading: "Trabaje con nosotros",
    ctaBody: "Publique un proyecto gratis, o postúlese para unirse como ingeniero — postularse y aparecer en el listado es gratuito.",
    ctaPost: "Publicar un proyecto — Gratis",
    ctaApply: "Postularse como ingeniero",
  },

  vi: {
    kicker: "Về Talengineer",
    title: "Kỹ sư đã được xác minh cho nhà xưởng sản xuất",
    sub: "Talengineer là thị trường toàn cầu dành cho các kỹ sư tự động hóa công nghiệp có chứng chỉ — PLC, robot, thị giác máy và điện. Sứ mệnh của chúng tôi là giúp kỹ năng tự động hóa đã được chứng minh có thể tuyển dụng được ở bất cứ đâu — được xác minh trước khi bạn cam kết, được bảo vệ cho đến khi công việc hoàn thành.",
    missionTitle: "Chúng tôi đang xây dựng điều gì",
    mission1: "Thuê một kỹ sư tự động hóa công nghiệp khó không phải vì lý do nguồn cung: một bản CV không thể chứng minh kỹ năng chạy thử. Ai cũng có thể ghi \"Siemens TIA Portal\" hay \"Fanuc\" trong hồ sơ. Việc họ có thực sự viết được logic dễ bảo trì, gỡ lỗi một cụm máy dưới áp lực thời gian, hay khiến hệ thống thị giác chịu được ánh sáng thực tế hay không chỉ lộ ra tại nhà xưởng — và thường vào thời điểm tốn kém nhất có thể. Chúng tôi đang xây dựng thị trường để thu hẹp khoảng cách đó.",
    mission2: "Trên Talengineer, nhà tuyển dụng mô tả nhu cầu bằng ngôn ngữ tự nhiên — bằng bất kỳ ngôn ngữ nào trong 9 ngôn ngữ mà nền tảng hỗ trợ — và AI chuẩn hóa nó thành đặc tả kỹ thuật, phạm vi công việc và kế hoạch cột mốc, sau đó đề xuất các kỹ sư đã được sàng lọc trước và có chứng chỉ nền tảng. Thanh toán được thực hiện qua ký quỹ theo cột mốc: tiền chỉ được giải ngân sau khi nhà tuyển dụng nghiệm thu từng cột mốc. Công việc tại hiện trường được xác minh bằng check-in định vị GPS theo hàng rào địa lý và ảnh kiểm tra chất lượng, còn trò chuyện dự án được dịch trực tiếp để cả hai bên làm việc bằng ngôn ngữ của mình.",
    mission3: "Chúng tôi phục vụ hai tuyến nhu cầu song song. Trong nước tại Mỹ: các nhà sản xuất thuê kỹ sư tự động hóa có chứng chỉ cho công việc chạy thử tại hiện trường, cải tạo dây chuyền và điều khiển từ xa. Xuyên biên giới: các nhà sản xuất nước ngoài — ví dụ như các công ty đang xây nhà máy tại Mexico, Việt Nam hoặc Thái Lan — thuê kỹ sư địa phương và kỹ sư xuyên biên giới với khả năng hợp tác song ngữ được tích hợp sẵn ngay từ tin nhắn đầu tiên.",
    methodTitle: "Cách chúng tôi xác minh kỹ năng",
    methodIntro: "Ba vòng kiểm soát chất lượng đứng giữa \"tự nhận có kỹ năng\" và \"có thể được phân công vào dự án của bạn\". Mỗi vòng đều được công bố công khai, không phải lời hoa mỹ độc quyền.",
    card1Title: "Sàng lọc thực hành bằng AI",
    card1Body: "Mỗi kỹ sư đều thực hiện một bài sàng lọc kỹ thuật AI thực hành trong chuyên môn mà họ khai báo — các câu hỏi tình huống kiểm tra khả năng phán đoán thực sự, không phải quét từ khóa trong CV. Điểm số được ký xác nhận phía máy chủ và trở thành nền tảng năng lực đi theo họ trên toàn nền tảng: nó chi phối thứ hạng mặc định khi duyệt, mở khóa huy hiệu Đã xác minh, còn hồ sơ chưa sàng lọc bắt đầu từ 0 điểm và có thể bị nhà tuyển dụng lọc bỏ.",
    card2Title: "Chứng chỉ là vòng kiểm soát phân công",
    card2Body: "Bốn lĩnh vực — PLC, robot, thị giác máy, điện — ở các cấp độ L1 đến L3. Mỗi kỳ thi gồm 10 câu hỏi trong 40 phút, kết hợp trắc nghiệm, tình huống và câu hỏi phân tích chuyên sâu; được AI chấm điểm rồi được con người xem xét trước khi cấp bất kỳ chứng chỉ nào. Điểm đạt là 70, một lần thi trượt sẽ kích hoạt thời gian chờ 7 ngày, và đề thi được rút ra từ ngân hàng tối đa 20 bộ đề cho mỗi lĩnh vực, cấp độ và ngôn ngữ, để không thể học thuộc đề. Chỉ kỹ sư có chứng chỉ mới có thể được phân công vào dự án — ở đây chứng chỉ là một vòng kiểm soát, không phải huy hiệu trang trí.",
    card2Link: "Khám phá chứng chỉ →",
    card3Title: "Điểm chất lượng công khai",
    card3Body: "TalScore (0–100) đặt trọng số sàng lọc AI ở 25, chứng chỉ nền tảng ở 25, đánh giá của khách hàng ở 30 và độ tin cậy ở 20. Đánh giá được tính trung bình theo Bayes để một đánh giá 5 sao đơn lẻ không thể đưa người mới lên vị trí hàng đầu, và tỷ lệ tranh chấp trên 10% sẽ triệt tiêu hoàn toàn thành phần độ tin cậy. Toàn bộ thuật toán được công khai — bạn có thể đọc chính xác cách con số này được tính ra.",
    card3Link: "Đọc thuật toán TalScore →",
    stageTitle: "Chúng tôi đang ở đâu hôm nay",
    stage1: "Talengineer là một nền tảng ở giai đoạn sáng lập, và chúng tôi thà nói thẳng điều đó hơn là tô vẽ. Các cơ chế mà trang này mô tả — ký quỹ theo cột mốc, kỳ thi chứng chỉ, TalScore, quy trình tranh chấp dựa trên bằng chứng — đều đang vận hành thực tế ngay hôm nay. Điều chúng tôi chưa có là quy mô, và chúng tôi sẽ không giả vờ ngược lại: bạn sẽ không tìm thấy số liệu người dùng bịa đặt, không có thống kê tăng trưởng, không có logo hư cấu ở đây. Các nghiên cứu điển hình được công bố từng cái một, khi các đơn hàng sáng lập thực sự hoàn thành.",
    stage2: "Các điều khoản dành cho khách hàng sáng lập phản ánh đúng giai đoạn đó. Phí ký quỹ tiêu chuẩn là 15% — kỹ sư giữ 85% mỗi cột mốc đã giải ngân — và nhà tuyển dụng sáng lập chỉ trả 5% cho 5 đơn hàng đầu tiên. Mức phí được đọc từ một cấu hình backend duy nhất, nên mức phí bạn thấy chính là mức phí được thu.",
    stage3: "Cùng một kỷ luật đó xuyên suốt toàn bộ trang web: mọi con số nền tảng bạn đọc ở đây đều có thể truy về một nguồn cấu hình duy nhất trong mã nguồn, và các phát biểu về thị trường luôn giữ tính cấu trúc — chúng tôi mô tả cách mọi thứ vận hành, không phải những thống kê mà chúng tôi không thể bảo chứng.",
    stageLink: "Xem toàn bộ bảng giá →",
    contactTitle: "Liên hệ với chúng tôi",
    contactBody: "Câu hỏi, hợp tác hay báo chí — hãy viết cho chúng tôi và sẽ có người thật đọc nó. Nếu câu hỏi của bạn liên quan đến một dự án cụ thể, cách nhanh nhất là đăng dự án đó và để AI cấu trúc hóa phạm vi giúp bạn.",
    contactEmailLabel: "Email",
    contactPageLink: "Tất cả các cách liên hệ →",
    ctaHeading: "Làm việc cùng chúng tôi",
    ctaBody: "Đăng dự án miễn phí, hoặc ứng tuyển để tham gia với tư cách kỹ sư — ứng tuyển và được liệt kê đều miễn phí.",
    ctaPost: "Đăng dự án — Miễn phí",
    ctaApply: "Ứng tuyển làm kỹ sư",
  },

  hi: {
    kicker: "Talengineer के बारे में",
    title: "फ़ैक्ट्री फ़्लोर के लिए सत्यापित इंजीनियर",
    sub: "Talengineer प्रमाणित औद्योगिक ऑटोमेशन इंजीनियरों — PLC, रोबोटिक्स, मशीन विज़न और इलेक्ट्रिकल — का एक ग्लोबल मार्केटप्लेस है। हमारा मिशन है साबित हो चुके ऑटोमेशन कौशल को कहीं भी हायर करने लायक बनाना — आपके प्रतिबद्ध होने से पहले सत्यापित, और काम पूरा होने तक सुरक्षित।",
    missionTitle: "हम क्या बना रहे हैं",
    mission1: "एक औद्योगिक ऑटोमेशन इंजीनियर को हायर करना एक ऐसी वजह से मुश्किल है जिसका सप्लाई से कोई लेना-देना नहीं: एक रिज़्यूमे कमीशनिंग कौशल साबित नहीं कर सकता। कोई भी प्रोफ़ाइल में \"Siemens TIA Portal\" या \"Fanuc\" लिख सकता है। क्या वे वाकई मेंटेनेबल लॉजिक लिख सकते हैं, समय के दबाव में किसी सेल को डीबग कर सकते हैं, या किसी विज़न सिस्टम को असली दुनिया की लाइटिंग में टिकाए रख सकते हैं — यह सिर्फ़ प्लांट फ़्लोर पर ही पता चलता है, और अक्सर सबसे महंगे संभावित पल पर। हम वह मार्केटप्लेस बना रहे हैं जो इस खाई को पाटता है।",
    mission2: "Talengineer पर, एक नियोक्ता प्राकृतिक भाषा में — प्लेटफ़ॉर्म की बोली जाने वाली 9 भाषाओं में से किसी में भी — अपनी ज़रूरत बताता है, और AI इसे स्पेसिफ़िकेशन, वर्क का स्कोप और माइलस्टोन योजना में मानकीकृत करता है, फिर पहले से जाँचे गए, प्लेटफ़ॉर्म-प्रमाणित इंजीनियरों की सिफ़ारिश करता है। भुगतान माइलस्टोन एस्क्रो के ज़रिए चलता है: राशि तभी रिलीज़ होती है जब नियोक्ता हर माइलस्टोन को स्वीकृत करता है। ऑन-साइट काम GPS-जियोफ़ेंस्ड चेक-इन और फ़ोटो QC से सत्यापित होता है, और प्रोजेक्ट चैट लाइव अनुवादित होती है ताकि दोनों पक्ष अपनी-अपनी भाषा में काम कर सकें।",
    mission3: "हम दो समानांतर डिमांड लाइनों की सेवा करते हैं। अमेरिका में घरेलू: निर्माता ऑन-साइट कमीशनिंग, रेट्रोफ़िट और रिमोट कंट्रोल्स काम के लिए प्रमाणित ऑटोमेशन इंजीनियर हायर करते हैं। सीमा-पार: विदेशी निर्माता — जैसे मेक्सिको, वियतनाम या थाईलैंड में प्लांट बना रही कंपनियाँ — स्थानीय और सीमा-पार इंजीनियरों को हायर करते हैं, जिनमें द्विभाषी सहयोग पहले संदेश से ही अंतर्निहित होता है।",
    methodTitle: "हम कौशल कैसे सत्यापित करते हैं",
    methodIntro: "\"कौशल का दावा करने\" और \"आपके प्रोजेक्ट पर असाइन किए जा सकने\" के बीच तीन क्वालिटी गेट खड़े हैं। हर एक सार्वजनिक है, कोई प्रोप्राइटरी बातें नहीं।",
    card1Title: "हैंड्स-ऑन AI स्क्रीनिंग",
    card1Body: "हर इंजीनियर अपनी दावा की गई विशेषज्ञता में एक व्यावहारिक AI टेक्निकल स्क्रीनर लेता है — सिनेरियो प्रश्न जो असली निर्णय-क्षमता जाँचते हैं, न कि रिज़्यूमे की कीवर्ड स्कैनिंग। स्कोर सर्वर-साइन्ड होता है और उनके पूरे प्लेटफ़ॉर्म सफ़र में साथ चलने वाली क्षमता बेसलाइन बन जाता है: यह ब्राउज़ में डिफ़ॉल्ट रैंकिंग तय करता है, Verified बैज अनलॉक करता है, और बिना-स्क्रीन प्रोफ़ाइल शून्य से शुरू होती हैं और नियोक्ताओं द्वारा फ़िल्टर की जा सकती हैं।",
    card2Title: "असाइनमेंट गेट के रूप में प्रमाणन",
    card2Body: "चार ट्रैक — PLC, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल — L1 से L3 तक के स्तरों पर। हर परीक्षा 40 मिनट में 10 सवाल है, जिसमें मल्टीपल-चॉइस, सिनेरियो और गहन विश्लेषण वाले सवाल मिले होते हैं; इसे AI जाँचता है और फिर कोई भी सर्टिफ़िकेट जारी होने से पहले इंसानी समीक्षा होती है। पास मार्क 70 है, फ़ेल हुए प्रयास पर 7 दिन का कूलडाउन लगता है, और पेपर हर ट्रैक, स्तर और भाषा के लिए 20 तक के सेट वाले बैंक से आते हैं, ताकि परीक्षा रटी न जा सके। केवल प्रमाणित इंजीनियर ही प्रोजेक्ट्स पर असाइन किए जा सकते हैं: यहाँ प्रमाणन एक गेट है, बैज नहीं।",
    card2Link: "प्रमाणन देखें →",
    card3Title: "एक सार्वजनिक क्वालिटी स्कोर",
    card3Body: "TalScore (0–100) में AI स्क्रीनिंग का वेटेज 25, प्लेटफ़ॉर्म प्रमाणन का 25, क्लाइंट रेटिंग का 30 और रिलायबिलिटी का 20 है। रेटिंग बायेसियन औसत से निकलती है ताकि एक अकेला 5-स्टार रिव्यू किसी नए व्यक्ति को टॉप पर न पहुँचा दे, और 10% से ऊपर की विवाद दर रिलायबिलिटी डायमेंशन को सीधे शून्य कर देती है। पूरा एल्गोरिद्म सार्वजनिक है — आप ठीक-ठीक पढ़ सकते हैं कि यह नंबर कैसे निकाला जाता है।",
    card3Link: "TalScore एल्गोरिद्म पढ़ें →",
    stageTitle: "आज हम कहाँ हैं",
    stage1: "Talengineer एक founding-stage प्लेटफ़ॉर्म है, और हम इसे सजाने के बजाय साफ़-साफ़ कहना पसंद करते हैं। यह साइट जिन तंत्रों का वर्णन करती है — माइलस्टोन एस्क्रो, प्रमाणन परीक्षाएँ, TalScore, साक्ष्य-आधारित विवाद प्रक्रिया — वे आज प्रोडक्शन में लाइव हैं। जो हमारे पास अभी नहीं है वह है पैमाना, और हम इसे झुठलाएँगे नहीं: यहाँ आपको कोई गढ़ी हुई यूज़र संख्या, कोई ग्रोथ स्टैटिस्टिक्स, कोई मनगढ़ंत लोगो नहीं मिलेगा। केस स्टडी एक-एक करके प्रकाशित होती हैं, जैसे-जैसे असली founding ऑर्डर पूरे होते हैं।",
    stage2: "founding शर्तें उसी चरण को दर्शाती हैं। मानक एस्क्रो शुल्क 15% है — इंजीनियर हर रिलीज़ हुए माइलस्टोन का 85% रखते हैं — और founding नियोक्ता अपने पहले 5 ऑर्डर पर केवल 5% देते हैं। दर एक ही backend कॉन्फ़िगरेशन से पढ़ी जाती है, इसलिए जो शुल्क आप देखते हैं वही असल में लिया जाता है।",
    stage3: "वही अनुशासन पूरी साइट पर चलता है: यहाँ आप जो भी प्लेटफ़ॉर्म नंबर पढ़ते हैं, वह कोडबेस में एक ही कॉन्फ़िगरेशन स्रोत तक जाता है, और मार्केट संबंधी बयान हमेशा संरचनात्मक रखे जाते हैं — हम बताते हैं कि चीज़ें कैसे काम करती हैं, ऐसे आँकड़े नहीं जिनका हम समर्थन नहीं कर सकते।",
    stageLink: "पूरी प्राइसिंग देखें →",
    contactTitle: "संपर्क करें",
    contactBody: "सवाल, पार्टनरशिप या प्रेस — हमें लिखें और एक इंसान इसे पढ़ेगा। यदि आपका सवाल किसी खास प्रोजेक्ट के बारे में है, तो सबसे तेज़ रास्ता है उसे पोस्ट करना और AI को आपके लिए स्कोप संरचित करने देना।",
    contactEmailLabel: "ईमेल",
    contactPageLink: "सभी संपर्क विकल्प →",
    ctaHeading: "हमारे साथ काम करें",
    ctaBody: "मुफ़्त में प्रोजेक्ट पोस्ट करें, या इंजीनियर के रूप में जुड़ने के लिए आवेदन करें — आवेदन करना और लिस्टेड होना दोनों मुफ़्त हैं।",
    ctaPost: "प्रोजेक्ट पोस्ट करें — निःशुल्क",
    ctaApply: "इंजीनियर के रूप में आवेदन करें",
  },

  fr: {
    kicker: "À propos de Talengineer",
    title: "Des ingénieurs vérifiés pour l’atelier de production",
    sub: "Talengineer est une place de marché mondiale dédiée aux ingénieurs en automatisation industrielle certifiés — PLC, robotique, vision industrielle et électricité. Notre mission est de permettre de recruter partout des compétences en automatisation éprouvées : vérifiées avant votre engagement, protégées jusqu’à l’achèvement du travail.",
    missionTitle: "Ce que nous construisons",
    mission1: "Recruter un ingénieur en automatisation industrielle est difficile pour une raison qui n’a rien à voir avec l’offre : un CV ne peut pas prouver une compétence de mise en service. N’importe qui peut inscrire « Siemens TIA Portal » ou « Fanuc » sur un profil. Sa capacité à écrire une logique réellement maintenable, à déboguer une cellule dans l’urgence ou à faire tenir un système de vision face à un éclairage réel ne se vérifie qu’à l’atelier — et généralement au moment le plus coûteux possible. Nous construisons la place de marché qui comble ce fossé.",
    mission2: "Sur Talengineer, un employeur décrit son besoin en langage naturel — dans l’une des 9 langues parlées par la plateforme — et l’IA le normalise en spécifications, cahier des charges et plan de jalons, puis recommande des ingénieurs présélectionnés et certifiés par la plateforme. Le paiement passe par un séquestre par jalons : les fonds ne sont libérés qu’après validation de chaque jalon par l’employeur. Le travail sur site est vérifié par des pointages géolocalisés par GPS et un contrôle qualité photographique, et le chat du projet est traduit en direct pour que chaque partie travaille dans sa propre langue.",
    mission3: "Nous servons deux lignes de demande parallèles. Sur le marché américain : des fabricants qui recrutent des ingénieurs en automatisation certifiés pour la mise en service sur site, le rétrofit de lignes et le travail de contrôle-commande à distance. À l’international : des fabricants à l’étranger — par exemple des entreprises qui construisent des usines au Mexique, au Vietnam ou en Thaïlande — qui recrutent des ingénieurs locaux et transfrontaliers avec une collaboration bilingue intégrée dès le premier message.",
    methodTitle: "Comment nous vérifions la compétence",
    methodIntro: "Trois contrôles qualité se dressent entre « prétend avoir une compétence » et « peut être affecté à votre projet ». Chacun est publié, et non un discours propriétaire vague.",
    card1Title: "Évaluation pratique par IA",
    card1Body: "Chaque ingénieur passe une évaluation technique pratique par IA dans sa filière déclarée — des questions de mise en situation qui évaluent le jugement réel, et non un balayage de mots-clés dans un CV. Le score est signé côté serveur et devient le socle de compétence qui le suit sur toute la plateforme : il détermine le classement par défaut lors de la recherche, débloque le badge Vérifié, et les profils non évalués démarrent à zéro et peuvent être filtrés par les employeurs.",
    card2Title: "La certification comme contrôle d’affectation",
    card2Body: "Quatre filières — PLC, robotique, vision industrielle, électricité — avec des niveaux de L1 à L3. Chaque examen comporte 10 questions en 40 minutes, mélangeant QCM, mises en situation et questions d’analyse approfondie ; il est noté par IA puis relu par un humain avant l’émission de tout certificat. Le seuil de réussite est fixé à 70, un échec déclenche un délai d’attente de 7 jours, et les sujets sont tirés d’une banque pouvant compter jusqu’à 20 séries par filière, niveau et langue, afin que l’examen ne puisse pas être appris par cœur. Seuls les ingénieurs certifiés peuvent être affectés à des projets : ici, la certification est un contrôle, pas un badge.",
    card2Link: "Découvrir la certification →",
    card3Title: "Un score de qualité public",
    card3Body: "TalScore (0–100) pondère l’évaluation par IA à 25, la certification de plateforme à 25, les notes des clients à 30 et la fiabilité à 20. Les notes sont moyennées de façon bayésienne pour qu’un seul avis cinq étoiles ne puisse pas propulser un nouveau venu en tête, et un taux de litiges supérieur à 10% ramène purement et simplement la dimension fiabilité à zéro. L’algorithme complet est public — vous pouvez lire exactement comment ce chiffre est calculé.",
    card3Link: "Lire l’algorithme TalScore →",
    stageTitle: "Où nous en sommes aujourd’hui",
    stage1: "Talengineer est une plateforme en phase fondatrice, et nous préférons le dire clairement plutôt que l’enjoliver. Les mécanismes décrits sur ce site — séquestre par jalons, examens de certification, TalScore, le processus de litige fondé sur des preuves — sont en production aujourd’hui. Ce que nous n’avons pas encore, c’est l’échelle, et nous ne prétendrons pas le contraire : vous ne trouverez ici aucun nombre d’utilisateurs inventé, aucune statistique de croissance, aucun logo fabriqué. Les études de cas sont publiées une par une, à mesure que de véritables commandes fondatrices sont livrées.",
    stage2: "Les conditions fondatrices reflètent cette étape. Les frais de séquestre standard s’élèvent à 15% — les ingénieurs conservent 85% de chaque jalon débloqué — et les employeurs fondateurs ne paient que 5% sur leurs 5 premières commandes. Le taux est lu depuis une configuration backend unique, si bien que les frais que vous voyez sont exactement ceux facturés.",
    stage3: "Cette même rigueur traverse tout le site : chaque chiffre de plateforme que vous lisez ici remonte à une source de configuration unique dans le code, et les affirmations de marché restent structurelles — nous décrivons le fonctionnement des choses, pas des statistiques que nous ne pourrions pas défendre.",
    stageLink: "Voir les tarifs complets →",
    contactTitle: "Nous contacter",
    contactBody: "Questions, partenariats ou presse — écrivez-nous, une vraie personne vous lira. Si votre question concerne un projet précis, la voie la plus rapide est de le publier et de laisser l’IA en structurer le périmètre pour vous.",
    contactEmailLabel: "E-mail",
    contactPageLink: "Toutes les options de contact →",
    ctaHeading: "Travaillez avec nous",
    ctaBody: "Publiez un projet gratuitement, ou postulez pour nous rejoindre en tant qu’ingénieur — postuler et figurer dans l’annuaire est gratuit.",
    ctaPost: "Publier un projet — Gratuit",
    ctaApply: "Postuler comme ingénieur",
  },

  de: {
    kicker: "Über Talengineer",
    title: "Verifizierte Ingenieure für die Fabrikhalle",
    sub: "Talengineer ist ein globaler Marktplatz für zertifizierte Ingenieure der industriellen Automatisierung — PLC, Robotik, Bildverarbeitung und Elektrotechnik. Unsere Mission ist es, nachgewiesene Automatisierungskompetenz überall einstellbar zu machen — verifiziert, bevor Sie sich binden, geschützt, bis die Arbeit erledigt ist.",
    missionTitle: "Was wir aufbauen",
    mission1: "Einen Ingenieur für industrielle Automatisierung einzustellen ist aus einem Grund schwierig, der nichts mit dem Angebot zu tun hat: Ein Lebenslauf kann Inbetriebnahme-Kompetenz nicht belegen. Jeder kann „Siemens TIA Portal“ oder „Fanuc“ in ein Profil schreiben. Ob jemand tatsächlich wartbare Logik schreiben, eine Zelle unter Zeitdruck debuggen oder ein Bildverarbeitungssystem unter realem Licht zum Laufen bringen kann, zeigt sich erst in der Fabrikhalle — meist im teuersten möglichen Moment. Wir bauen den Marktplatz, der diese Lücke schließt.",
    mission2: "Auf Talengineer beschreibt ein Auftraggeber seinen Bedarf in natürlicher Sprache — in einer der 9 von der Plattform unterstützten Sprachen —, und die KI standardisiert dies zu Spezifikationen, einem Leistungsumfang und einem Meilensteinplan und empfiehlt dann vorab geprüfte, plattformzertifizierte Ingenieure. Die Zahlung läuft über Meilenstein-Treuhand: Gelder werden erst freigegeben, nachdem der Auftraggeber jeden Meilenstein abgenommen hat. Arbeit vor Ort wird durch GPS-Check-ins mit Geofence und Foto-QC verifiziert, und der Projekt-Chat wird live übersetzt, sodass beide Seiten in ihrer eigenen Sprache arbeiten.",
    mission3: "Wir bedienen zwei parallele Nachfragelinien. National in den USA: Hersteller stellen zertifizierte Automatisierungsingenieure für Inbetriebnahmen vor Ort, Nachrüstungen und Fernsteuerungsarbeiten ein. Grenzüberschreitend: ausländische Hersteller — zum Beispiel Unternehmen, die Werke in Mexiko, Vietnam oder Thailand bauen — stellen lokale und grenzüberschreitende Ingenieure ein, mit zweisprachiger Zusammenarbeit, die von der ersten Nachricht an eingebaut ist.",
    methodTitle: "Wie wir Kompetenz verifizieren",
    methodIntro: "Drei Qualitäts-Gates stehen zwischen „behauptet eine Fähigkeit“ und „kann Ihrem Projekt zugewiesen werden“. Jedes davon ist veröffentlicht, keine proprietäre Behauptung.",
    card1Title: "Praxisnahes KI-Screening",
    card1Body: "Jeder Ingenieur absolviert ein praxisnahes technisches KI-Screening in seiner angegebenen Fachrichtung — Szenariofragen, die echtes Urteilsvermögen prüfen, kein Keyword-Scan eines Lebenslaufs. Der Score ist serverseitig signiert und wird zur Kompetenz-Basislinie, die den Ingenieur durch die gesamte Plattform begleitet: Sie bestimmt das Standard-Ranking beim Durchsuchen, schaltet das Verifiziert-Abzeichen frei, und ungeprüfte Profile starten bei null und können von Auftraggebern herausgefiltert werden.",
    card2Title: "Zertifizierung als Einsatz-Gate",
    card2Body: "Vier Fachrichtungen — PLC, Robotik, Bildverarbeitung, Elektrotechnik — auf den Leveln L1 bis L3. Jede Prüfung besteht aus 10 Fragen in 40 Minuten, eine Mischung aus Multiple-Choice-, Szenario- und Tiefenanalyse-Fragen; sie wird KI-bewertet und anschließend von einem Menschen geprüft, bevor ein Zertifikat ausgestellt wird. Die Bestehensgrenze liegt bei 70, ein nicht bestandener Versuch löst eine 7-tägige Sperrfrist aus, und die Prüfungen stammen aus einem Pool von bis zu 20 Sätzen pro Fachrichtung, Level und Sprache, sodass die Prüfung nicht auswendig gelernt werden kann. Nur zertifizierte Ingenieure können Projekten zugewiesen werden: Zertifizierung ist hier ein Gate, kein Abzeichen.",
    card2Link: "Zertifizierung erkunden →",
    card3Title: "Ein öffentlicher Qualitäts-Score",
    card3Body: "TalScore (0–100) gewichtet das KI-Screening mit 25, die Plattform-Zertifizierung mit 25, Kundenbewertungen mit 30 und Zuverlässigkeit mit 20. Bewertungen werden bayessch gemittelt, damit eine einzelne Fünf-Sterne-Bewertung einen Neuling nicht an die Spitze katapultieren kann, und eine Streitfallquote über 10% setzt die Zuverlässigkeitsdimension direkt auf null. Der vollständige Algorithmus ist öffentlich — Sie können genau nachlesen, wie die Zahl berechnet wird.",
    card3Link: "TalScore-Algorithmus lesen →",
    stageTitle: "Wo wir heute stehen",
    stage1: "Talengineer ist eine Plattform in der Gründungsphase, und wir sagen das lieber offen, als es zu beschönigen. Die auf dieser Seite beschriebenen Mechanismen — Meilenstein-Treuhand, Zertifizierungsprüfungen, TalScore, das evidenzbasierte Streitfallverfahren — laufen bereits heute produktiv. Was wir noch nicht haben, ist Größenordnung, und das werden wir nicht vortäuschen: Sie finden hier keine erfundenen Nutzerzahlen, keine Wachstumsstatistiken, keine fingierten Logos. Fallstudien werden einzeln veröffentlicht, sobald echte Gründungsaufträge abgeschlossen sind.",
    stage2: "Die Gründungskonditionen spiegeln diese Phase wider. Die Standard-Treuhandgebühr beträgt 15% — Ingenieure behalten 85% jedes freigegebenen Meilensteins — und Gründungskunden zahlen auf ihre ersten 5 Aufträge nur 5%. Der Satz wird aus einer einzigen Backend-Konfiguration gelesen, sodass die angezeigte Gebühr genau der berechneten entspricht.",
    stage3: "Dieselbe Disziplin zieht sich durch die gesamte Seite: Jede Plattformzahl, die Sie hier lesen, lässt sich auf eine einzige Konfigurationsquelle im Code zurückführen, und Marktaussagen bleiben strukturell — wir beschreiben, wie die Dinge funktionieren, nicht Statistiken, die wir nicht belegen könnten.",
    stageLink: "Vollständige Preise ansehen →",
    contactTitle: "Kontakt aufnehmen",
    contactBody: "Fragen, Partnerschaften oder Presse — schreiben Sie uns, ein Mensch wird es lesen. Wenn Ihre Frage ein bestimmtes Projekt betrifft, ist der schnellste Weg, es auszuschreiben und die KI den Leistungsumfang für Sie strukturieren zu lassen.",
    contactEmailLabel: "E-Mail",
    contactPageLink: "Alle Kontaktmöglichkeiten →",
    ctaHeading: "Arbeiten Sie mit uns",
    ctaBody: "Schreiben Sie ein Projekt kostenlos aus, oder bewerben Sie sich als Ingenieur — Bewerbung und Eintrag sind kostenlos.",
    ctaPost: "Projekt ausschreiben — kostenlos",
    ctaApply: "Als Ingenieur bewerben",
  },

  ja: {
    kicker: "Talengineerについて",
    title: "工場現場のための検証済みエンジニア",
    sub: "Talengineerは、認定産業オートメーションエンジニア——PLC、ロボティクス、マシンビジョン、電気——のためのグローバルマーケットプレイスです。私たちの使命は、実証された自動化スキルをどこでも採用可能にすることです——契約する前に検証し、作業が完了するまで保護します。",
    missionTitle: "私たちが構築しているもの",
    mission1: "産業オートメーションエンジニアの採用が難しいのは、供給とは関係のない理由からです——履歴書は試運転のスキルを証明できません。誰でもプロフィールに「Siemens TIA Portal」や「Fanuc」と書くことはできます。実際に保守しやすいロジックを書けるか、時間的プレッシャーの中でセルをデバッグできるか、実環境の照明下でもビジョンシステムを機能させられるかは、現場でしか分かりません——それも多くの場合、最もコストの高いタイミングで判明します。私たちは、そのギャップを埋めるマーケットプレイスを構築しています。",
    mission2: "Talengineerでは、雇用者が自然言語で——プラットフォームが対応する9言語のいずれかで——ニーズを記述すると、AIがそれを仕様、作業範囲、マイルストーン計画に標準化し、事前審査済みでプラットフォーム認定を受けたエンジニアを推薦します。支払いはマイルストーンエスクローを通じて行われます——資金は雇用者が各マイルストーンを承認した後にのみ解放されます。現場作業はGPSジオフェンス付きチェックインと写真によるQCで検証され、プロジェクトチャットはライブ翻訳されるため、双方が自分の言語で作業できます。",
    mission3: "私たちは2つの並行した需要ラインに対応しています。米国国内：現場での試運転、ライン改修、リモート制御作業のために認定オートメーションエンジニアを採用する製造業者。国境を越えて：例えばメキシコ、ベトナム、タイに工場を建設している企業など、海外の製造業者が、最初のメッセージから組み込まれたバイリンガルの協働体制のもとで、現地および国境を越えたエンジニアを採用しています。",
    methodTitle: "スキルの検証方法",
    methodIntro: "「スキルがあると主張すること」と「プロジェクトにアサインできること」の間には、3つの品質ゲートがあります。それぞれが公開されており、独自の曖昧な主張ではありません。",
    card1Title: "実践的なAIスクリーニング",
    card1Body: "すべてのエンジニアは、自己申告した専門分野で実践的なAI技術スクリーニングを受けます——履歴書のキーワードスキャンではなく、実際の判断力を試すシナリオ問題です。スコアはサーバー側で署名され、プラットフォーム全体を通じて付いて回る能力ベースラインとなります。閲覧時のデフォルトランキングを左右し、検証済みバッジをアンロックします。未スクリーニングのプロフィールはゼロから始まり、雇用者によってフィルターされる可能性があります。",
    card2Title: "アサインゲートとしての認定",
    card2Body: "4つのトラック——PLC、ロボティクス、マシンビジョン、電気——にL1からL3までのレベルがあります。各試験は40分間で10問——選択式、シナリオ式、深い分析を要する問題を組み合わせたもの——で構成され、AIが採点した後、証明書が発行される前に人間がレビューします。合格ラインは70点で、不合格の場合は再受験まで7日間のクールダウンがあり、問題はトラック・レベル・言語ごとに最大20セットのバンクから出題されるため、暗記では対応できません。認定エンジニアのみがプロジェクトにアサインされます——ここでの認定はバッジではなくゲートです。",
    card2Link: "認定を見る →",
    card3Title: "公開された品質スコア",
    card3Body: "TalScore（0–100）は、AIスクリーニングに25、プラットフォーム認定に25、クライアント評価に30、信頼性に20の重みを付けます。評価にはベイズ平均を用いるため、五つ星レビュー1件だけで新規参入者がトップに躍り出ることはなく、紛争率が10%を超えると信頼性の項目がそのままゼロになります。アルゴリズム全体が公開されており、この数字がどう計算されるかを正確に読むことができます。",
    card3Link: "TalScoreのアルゴリズムを読む →",
    stageTitle: "私たちの現在地",
    stage1: "Talengineerは創業段階のプラットフォームであり、それを飾るよりも率直に伝えることを選びます。このサイトが説明する仕組み——マイルストーンエスクロー、認定試験、TalScore、証拠に基づく紛争処理プロセス——は今日、本番環境で稼働しています。まだ持っていないのは規模であり、それを偽ることはしません——ここには捏造されたユーザー数も、成長統計も、架空のロゴもありません。ケーススタディは、実際のファウンディング案件が完了するたびに、1件ずつ公開されます。",
    stage2: "ファウンディング条件はこの段階を反映しています。標準のエスクロー手数料は15%——エンジニアは解放された各マイルストーンの85%を受け取ります——そしてファウンディング雇用者は最初の5件の注文についてのみ5%を支払います。料率は単一のバックエンド設定から読み込まれるため、表示される手数料が実際に請求される手数料と正確に一致します。",
    stage3: "同じ規律がサイト全体に貫かれています——ここで読むすべてのプラットフォーム数値は、コード内の単一の設定ソースにさかのぼることができ、市場に関する記述は常に構造的なものにとどめています——私たちは物事がどう機能するかを説明するのであって、裏付けのない統計を語ることはありません。",
    stageLink: "料金の全体を見る →",
    contactTitle: "お問い合わせ",
    contactBody: "ご質問、パートナーシップ、プレス関連——ぜひご連絡ください。人間が目を通します。特定のプロジェクトに関するご質問であれば、最も早い方法はそれを投稿し、AIにスコープを構造化させることです。",
    contactEmailLabel: "メール",
    contactPageLink: "すべての連絡方法 →",
    ctaHeading: "私たちと一緒に働く",
    ctaBody: "プロジェクトを無料で投稿するか、エンジニアとして参加を申し込んでください——応募と掲載はどちらも無料です。",
    ctaPost: "プロジェクトを投稿 — 無料",
    ctaApply: "エンジニアとして応募",
  },

  ko: {
    kicker: "Talengineer 소개",
    title: "공장 현장을 위한 검증된 엔지니어",
    sub: "Talengineer는 인증 산업 자동화 엔지니어 — PLC, 로보틱스, 머신 비전, 전기 — 를 위한 글로벌 마켓플레이스입니다. 저희의 사명은 입증된 자동화 역량을 어디서든 채용 가능하게 만드는 것입니다 — 계약 전에 검증하고, 작업이 끝날 때까지 보호합니다.",
    missionTitle: "저희가 만들고 있는 것",
    mission1: "산업 자동화 엔지니어를 채용하기 어려운 이유는 공급과 무관합니다. 이력서는 시운전 역량을 증명할 수 없습니다. 누구나 프로필에 \"Siemens TIA Portal\"이나 \"Fanuc\"이라고 쓸 수 있습니다. 실제로 유지보수 가능한 로직을 작성할 수 있는지, 시간 압박 속에서 셀을 디버깅할 수 있는지, 실제 조명 환경에서도 비전 시스템을 제대로 작동시킬 수 있는지는 현장에서만 드러납니다 — 그것도 대개 가장 비용이 큰 순간에요. 저희는 그 간극을 메우는 마켓플레이스를 만들고 있습니다.",
    mission2: "Talengineer에서 고용주는 자연어로 — 플랫폼이 지원하는 9개 언어 중 어느 것으로든 — 필요를 설명하고, AI가 이를 사양, 작업 범위, 마일스톤 계획으로 표준화한 뒤 사전 심사를 거친 플랫폼 인증 엔지니어를 추천합니다. 결제는 마일스톤 에스크로를 통해 이루어집니다 — 자금은 고용주가 각 마일스톤을 승인한 후에만 릴리즈됩니다. 현장 작업은 GPS 지오펜스 체크인과 사진 QC로 검증되며, 프로젝트 채팅은 실시간으로 번역되어 양측이 각자의 언어로 작업할 수 있습니다.",
    mission3: "저희는 두 가지 병렬 수요 라인을 지원합니다. 미국 내: 제조업체가 현장 시운전, 라인 개조, 원격 제어 작업을 위해 인증 자동화 엔지니어를 채용합니다. 국경을 넘어: 해외 제조업체 — 예를 들어 멕시코, 베트남, 태국에 공장을 짓는 기업 — 가 현지 및 국경을 넘는 엔지니어를 채용하며, 첫 메시지부터 이중 언어 협업이 내장되어 있습니다.",
    methodTitle: "역량을 검증하는 방법",
    methodIntro: "\"역량이 있다고 주장하는 것\"과 \"프로젝트에 배정될 수 있는 것\" 사이에는 세 가지 품질 게이트가 있습니다. 각각 공개되어 있으며, 모호한 자체 주장이 아닙니다.",
    card1Title: "실무형 AI 스크리닝",
    card1Body: "모든 엔지니어는 자신이 신고한 전문 분야에서 실무형 AI 기술 스크리닝을 치릅니다 — 이력서 키워드 스캔이 아니라 실제 판단력을 시험하는 시나리오 문제입니다. 점수는 서버 측에서 서명되며, 플랫폼 전체에서 따라다니는 역량 기준선이 됩니다. 이는 검색 시 기본 순위를 좌우하고 인증 배지를 여는 열쇠가 되며, 스크리닝을 거치지 않은 프로필은 0점에서 시작해 고용주에 의해 필터링될 수 있습니다.",
    card2Title: "배정 게이트로서의 인증",
    card2Body: "네 개 트랙 — PLC, 로보틱스, 머신 비전, 전기 — 에 L1부터 L3까지의 등급이 있습니다. 각 시험은 40분 동안 10문항으로, 객관식·시나리오형·심층 분석형 문항이 섞여 있습니다. AI가 채점한 뒤 인증서가 발급되기 전에 사람이 검토합니다. 합격 기준은 70점이며, 불합격 시 재응시까지 7일의 대기 기간이 적용되고, 문제는 트랙·등급·언어별로 최대 20세트의 문제은행에서 출제되어 암기로는 통과할 수 없습니다. 인증받은 엔지니어만 프로젝트에 배정될 수 있습니다 — 여기서 인증은 배지가 아니라 게이트입니다.",
    card2Link: "인증 살펴보기 →",
    card3Title: "공개된 품질 점수",
    card3Body: "TalScore(0~100)는 AI 스크리닝에 25, 플랫폼 인증에 25, 고객 평점에 30, 신뢰도에 20의 가중치를 둡니다. 평점은 베이지안 평균을 사용해 단 한 건의 별 다섯 개 리뷰만으로 신규 진입자가 상위권으로 도약할 수 없으며, 분쟁률이 10%를 넘으면 신뢰도 항목이 그대로 0이 됩니다. 알고리즘 전체가 공개되어 있어 이 숫자가 어떻게 계산되는지 정확히 확인할 수 있습니다.",
    card3Link: "TalScore 알고리즘 읽기 →",
    stageTitle: "저희의 현재 위치",
    stage1: "Talengineer는 창립 단계의 플랫폼이며, 저희는 이를 포장하기보다 있는 그대로 말씀드리고자 합니다. 이 사이트가 설명하는 메커니즘 — 마일스톤 에스크로, 인증 시험, TalScore, 증거 기반 분쟁 처리 절차 — 는 오늘 실제 프로덕션에서 운영되고 있습니다. 아직 저희에게 없는 것은 규모이며, 이를 감추지 않습니다 — 이곳에는 조작된 사용자 수치도, 성장 통계도, 가짜 로고도 없습니다. 사례 연구는 실제 창립 주문이 완료될 때마다 하나씩 공개됩니다.",
    stage2: "파운딩 고객 조건은 이러한 단계를 반영합니다. 표준 에스크로 수수료는 15%입니다 — 엔지니어는 릴리즈된 마일스톤마다 85%를 받습니다 — 그리고 파운딩 고용주는 첫 5건의 주문에 대해서만 5%를 지불합니다. 요율은 단일 백엔드 설정에서 읽어오므로, 표시되는 수수료가 실제로 청구되는 수수료와 정확히 일치합니다.",
    stage3: "동일한 원칙이 사이트 전체에 적용됩니다 — 여기서 읽는 모든 플랫폼 수치는 코드 내 단일 설정 소스로 거슬러 올라갈 수 있으며, 시장 관련 서술은 항상 구조적으로 유지됩니다 — 저희는 뒷받침할 수 없는 통계가 아니라 사물이 실제로 작동하는 방식을 설명합니다.",
    stageLink: "전체 가격 보기 →",
    contactTitle: "문의하기",
    contactBody: "질문, 파트너십, 언론 관련 문의 — 저희에게 메일을 보내주시면 사람이 직접 읽습니다. 특정 프로젝트에 관한 질문이라면 가장 빠른 방법은 프로젝트를 등록하고 AI가 범위를 구조화하도록 하는 것입니다.",
    contactEmailLabel: "이메일",
    contactPageLink: "모든 연락 방법 →",
    ctaHeading: "저희와 함께 일하세요",
    ctaBody: "프로젝트를 무료로 등록하거나 엔지니어로 합류를 지원하세요 — 지원과 등재 모두 무료입니다.",
    ctaPost: "프로젝트 등록 — 무료",
    ctaApply: "엔지니어로 지원",
  },

};

module.exports = { DICT };
