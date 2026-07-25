// ── /pricing 页九语 UI 字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/pricing.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24），
// es/vi/hi/fr/de/ja/ko 七语按 lib/i18n/glossary.js 的 TERMS + STYLE 灌注：
//   escrow / milestone / platform fee / founding client / dispute / evidence window
//   等核心词全部取术语表锁定译法，语域按各语 STYLE 指南（es 用 usted、fr 用 vous、
//   de 用 Sie、ja です・ます调、ko 합니다体）。
//
// 数字纪律：15% / 5% / 前 5 单 / 举证 5 天，全部单一来源自 src/config/fees.js、
// docs/pmf/pricing-onepager.md 与 src/routes/disputes.js，页面里不手编任何新数字。
// 九语译文中上述数字（含 85% / 9 语言 / $0）逐字节一致，翻译只动词不动数。
//
// FAQ JSON-LD 始终用 DICT.en.faqs（页面侧既有先例），不随语言切换。
const DICT = {
  en: {
    metaTitle: 'Pricing — Transparent Escrow Fees | Talengineer',
    metaDesc:
      'One escrow fee, published up front. Engineers keep 85% of every released milestone; founding employers pay just 5% on their first 5 orders. No agency markup, no gated rates.',
    kicker: 'Pricing',
    heroTitle: 'Transparent pricing. Published up front.',
    heroSub:
      'No login wall to see our fees, no agency markup buried in the rate. One escrow fee on paid milestones — engineers keep the majority of every dollar, employers pay nothing until they approve.',
    ctaPost: 'Post a Project — Free',
    ctaApply: 'Apply as an Engineer',

    // ── 工程师侧（透明轨）──────────────────────────────────────────────
    engTag: 'For engineers',
    engTitle: 'You keep 85% of every milestone',
    engFee: '15%',
    engFeeLabel: 'platform fee, charged only on released milestones',
    engKeepLabel: 'Engineers keep 85% — the fee comes out of the release, never an upfront charge.',
    engWhyTitle: 'Why the 15% earns its keep',
    engWhy: [
      {
        icon: '🎯',
        title: 'Clients come to you',
        desc: 'Matched projects from OEMs and integrators worldwide — no bidding wars, no cold outreach, no lead-gen spend of your own.',
      },
      {
        icon: '🔒',
        title: 'Payment is guaranteed',
        desc: 'The employer funds each milestone into escrow before you start. Your money is already held before you write a line of logic.',
      },
      {
        icon: '⚖️',
        title: 'Disputes are protected',
        desc: 'If a milestone is contested, an admin reviews both sides’ evidence over a 5-day window before any funds move — you are never simply left unpaid.',
      },
      {
        icon: '🏅',
        title: 'Certification opens doors',
        desc: 'Your platform certification is the badge clients hire on. Only certified engineers can be dispatched, so the screen you passed is what wins you the work.',
      },
      {
        icon: '🧰',
        title: 'On-site tooling included',
        desc: 'GPS check-in, QC photo delivery, and a multilingual AI project manager across 9 languages — the field tools come with the platform, not as add-ons.',
      },
    ],

    // ── 雇主侧（founding 轨）──────────────────────────────────────────
    empTag: 'For employers',
    empTitle: '5% for founding clients',
    empFounding: '5%',
    empFoundingLabel: 'escrow fee for founding clients — first 5 orders',
    empStandard: '15%',
    empStandardLabel: 'standard escrow fee',
    empUpfront: '$0 to post & match — you fund a milestone only once you have chosen an engineer.',
    empFoundingNote:
      'The 5% founding rate is a limited PMF-launch offer for the first 5 employers to sign. It is applied per demand, so it holds for each of your first 5 orders.',

    escrowTitle: 'How milestone escrow works',
    escrowSteps: [
      { n: '1', title: 'Fund', desc: 'You fund a milestone into escrow through Stripe Checkout. It is marked funded only after the payment clears.' },
      { n: '2', title: 'Deliver', desc: 'The engineer delivers the milestone — on-site check-ins and completion photos are logged against it.' },
      { n: '3', title: 'Approve', desc: 'You review the deliverable. Funds move only on your approval — nothing releases automatically.' },
      { n: '4', title: 'Release', desc: 'On approval, escrow releases to the engineer minus the platform fee. That fee is the only charge.' },
    ],

    // ── 风险逆转承诺 ─────────────────────────────────────────────────
    riskTitle: 'First milestone not right? Full refund.',
    riskSub:
      'The escrow model exists so your first order carries zero upfront risk. The refund path is built into the product — not a promise in a footer.',
    riskPoints: [
      { title: 'Funds stay in escrow', desc: 'Money you fund is held securely and is never paid to the engineer until you approve the deliverable.' },
      { title: 'Nothing releases while disputed', desc: 'Opening a dispute freezes the milestone. No funds can move while it is under review.' },
      { title: 'Refunded to your original card', desc: 'If the milestone is resolved in your favor, the full escrowed amount is refunded to your original payment method — no store credit, no clawback.' },
    ],

    faqTitle: 'Pricing FAQ',
    faqs: [
      {
        q: 'How is the platform fee calculated?',
        a: 'It is a flat percentage of each released milestone: 15% standard, or 5% for founding clients on their first 5 orders. The rate is read from a single backend configuration, so the fee you see is exactly the fee charged — there is no separate markup.',
      },
      {
        q: 'Who pays the fee — the employer or the engineer?',
        a: 'The employer funds the full milestone amount into escrow. When you approve a release, the platform fee is deducted from that amount and the engineer receives the remainder. On a standard order the engineer keeps 85%; the employer pays no fee beyond funding the milestone.',
      },
      {
        q: 'How do I qualify for the 5% founding rate?',
        a: 'The 5% rate is reserved for the first 5 employers to sign on during our PMF launch, and it applies to each of your first 5 orders. It is set per project, so once you are a founding client the reduced fee travels with your orders.',
      },
      {
        q: 'What is the refund process?',
        a: 'Open a dispute on the milestone. Both sides have a 5-day window to submit evidence, then an admin reviews it. If the dispute is resolved in the employer’s favor, the full escrowed amount is refunded to the original payment method; a split decision refunds the balance not awarded to the engineer.',
      },
      {
        q: 'How do cross-border payments work?',
        a: 'Payments run through Stripe and Stripe Connect. Employers pay by card at checkout; engineers are paid out to their connected Stripe account. Where Stripe payouts are not yet available in an engineer’s country, the platform processes an offline manual payout instead.',
      },
      {
        q: 'Do I get a receipt or invoice?',
        a: 'Yes. Each funding payment runs through Stripe Checkout, which emails a card receipt, and every funded and released milestone is recorded in your Finance dashboard ledger so you have a running record of what was funded, released, and charged.',
      },
    ],

    finalTitle: 'Start with one milestone',
    finalSub: 'Post a project for free and fund only when you have chosen your engineer. Founding-client 5% applies to your first 5 orders.',
  },

  zh: {
    metaTitle: '定价 — 透明托管费率 | Talengineer',
    metaDesc:
      '一笔托管费，明码标价。工程师保留每笔已放款里程碑的 85%；founding 雇主前 5 单仅收 5%。没有中介加价，没有门控费率。',
    kicker: '定价',
    heroTitle: '透明定价，明码标在前面。',
    heroSub:
      '看费率不用登录，费率里也不藏中介加价。只在已付款的里程碑上收一笔托管费——工程师保留每一元的绝大部分，雇主在验收前不付一分钱。',
    ctaPost: '免费发布项目',
    ctaApply: '以工程师身份申请',

    engTag: '面向工程师',
    engTitle: '每笔里程碑你保留 85%',
    engFee: '15%',
    engFeeLabel: '平台费，仅在里程碑放款时收取',
    engKeepLabel: '工程师到手 85%——费用从放款中扣，绝不预收。',
    engWhyTitle: '这 15% 值在哪里',
    engWhy: [
      {
        icon: '🎯',
        title: '客户主动找上门',
        desc: '来自全球设备厂商与集成商的匹配项目——不用低价竞标、不用冷启动获客，也不用自己花钱买线索。',
      },
      {
        icon: '🔒',
        title: '收款有保障',
        desc: '雇主在你开工前就把每个里程碑的资金存入托管。你还没写第一行逻辑，钱已经被锁在托管里。',
      },
      {
        icon: '⚖️',
        title: '纠纷有保护',
        desc: '里程碑一旦有异议，admin 会在 5 天举证窗口内审阅双方证据，之后资金才会流动——绝不会让你白干没钱拿。',
      },
      {
        icon: '🏅',
        title: '认证带来机会',
        desc: '平台认证是客户用人的凭据。只有持证工程师才能被指派，所以你通过的那场筛选，正是帮你拿到活的东西。',
      },
      {
        icon: '🧰',
        title: '现场工具全包',
        desc: 'GPS 签到、质检照片交付、9 语言实时 AI 项目经理——现场工具随平台附带，不是额外收费项。',
      },
    ],

    empTag: '面向雇主',
    empTitle: 'Founding 客户 5%',
    empFounding: '5%',
    empFoundingLabel: 'founding 客户托管费——前 5 单',
    empStandard: '15%',
    empStandardLabel: '标准托管费',
    empUpfront: '发布与匹配 $0——选定工程师后才为里程碑注资。',
    empFoundingNote:
      '5% 的 founding 费率是 PMF 启动期的限量优惠，面向前 5 家签约雇主。它按单需求生效，因此对你前 5 单每一单都成立。',

    escrowTitle: '里程碑托管如何运作',
    escrowSteps: [
      { n: '1', title: '注资', desc: '你通过 Stripe Checkout 把里程碑资金存入托管。付款到账后才标记为已托管。' },
      { n: '2', title: '交付', desc: '工程师交付里程碑——现场签到与完工照片会一并记录在该里程碑上。' },
      { n: '3', title: '验收', desc: '你审阅交付物。资金只在你批准时流动——不会自动放款。' },
      { n: '4', title: '放款', desc: '验收通过后，托管扣除平台费放款给工程师。这笔费用是唯一的收费。' },
    ],

    riskTitle: '首个里程碑不满意？全额退款。',
    riskSub:
      '托管模式的存在，就是为了让你的第一单零预付风险。退款路径写在产品里——不是页脚里的一句承诺。',
    riskPoints: [
      { title: '资金留在托管中', desc: '你注资的钱被安全托管，在你验收交付前绝不会付给工程师。' },
      { title: '争议期间不放款', desc: '开纠纷会冻结该里程碑。复核期间没有任何资金能流动。' },
      { title: '原路退回你的卡', desc: '若里程碑裁决判给你，托管的全额原路退回你的原支付方式——不是储值、不是事后追扣。' },
    ],

    faqTitle: '定价常见问题',
    faqs: [
      {
        q: '平台费怎么算？',
        a: '按每笔已放款里程碑的固定比例收取：标准 15%，founding 客户前 5 单为 5%。费率取自单一的后端配置，所以你看到的费率就是实际收取的费率——没有另外的加价。',
      },
      {
        q: '费用是雇主付还是工程师付？',
        a: '雇主把整笔里程碑金额存入托管。你批准放款时，平台费从这笔金额中扣除，工程师拿到余下部分。标准单里工程师到手 85%；雇主除了为里程碑注资，不再另付费用。',
      },
      {
        q: '怎么才能享受 5% 的 founding 费率？',
        a: '5% 费率留给 PMF 启动期前 5 家签约的雇主，且对你的前 5 单每一单都适用。它按项目设置，所以一旦成为 founding 客户，这个优惠费率会跟着你的订单走。',
      },
      {
        q: '退款流程是怎样的？',
        a: '在里程碑上开纠纷。双方有 5 天窗口提交证据，随后由 admin 复核。若纠纷判给雇主，托管全额原路退回原支付方式；分账裁决则退回未判给工程师的那部分。',
      },
      {
        q: '跨境付款怎么走？',
        a: '付款通过 Stripe 与 Stripe Connect 完成。雇主在结账时刷卡；工程师的款项打到其绑定的 Stripe 账户。若工程师所在国家暂不支持 Stripe 放款，平台会改用线下人工打款处理。',
      },
      {
        q: '有收据或发票吗？',
        a: '有。每笔注资都走 Stripe Checkout，会发送刷卡收据；每一笔已托管与已放款的里程碑都记录在你的资金台账里，让你随时看到注资、放款与收费的完整流水。',
      },
    ],

    finalTitle: '从一个里程碑开始',
    finalSub: '免费发布项目，选定工程师后再注资。Founding 客户 5% 适用于你的前 5 单。',
  },

  es: {
    metaTitle: 'Precios — Tarifas de depósito en garantía transparentes | Talengineer',
    metaDesc:
      'Una sola comisión de depósito en garantía, publicada por adelantado. Los ingenieros conservan el 85% de cada hito liberado; los empleadores fundadores pagan solo el 5% en sus primeras 5 órdenes. Sin sobreprecio de agencia, sin tarifas ocultas.',
    kicker: 'Precios',
    heroTitle: 'Precios transparentes. Publicados por adelantado.',
    heroSub:
      'No necesita iniciar sesión para ver nuestras tarifas, ni hay sobreprecio de agencia escondido en la tarifa. Una sola comisión de depósito en garantía sobre los hitos pagados: el ingeniero conserva la mayor parte de cada dólar y usted no paga nada hasta aprobar.',
    ctaPost: 'Publicar un proyecto — Gratis',
    ctaApply: 'Postularse como ingeniero',

    engTag: 'Para ingenieros',
    engTitle: 'Usted conserva el 85% de cada hito',
    engFee: '15%',
    engFeeLabel: 'comisión de la plataforma, cobrada solo sobre hitos liberados',
    engKeepLabel: 'Los ingenieros conservan el 85%: la comisión se descuenta de la liberación, nunca es un cobro por adelantado.',
    engWhyTitle: 'Por qué el 15% vale la pena',
    engWhy: [
      {
        icon: '🎯',
        title: 'Los clientes llegan a usted',
        desc: 'Proyectos asignados de OEM e integradores de todo el mundo: sin guerras de ofertas, sin contacto en frío y sin gastar en generación de leads por su cuenta.',
      },
      {
        icon: '🔒',
        title: 'El pago está garantizado',
        desc: 'El empleador deposita cada hito en garantía antes de que usted comience. Su dinero ya está retenido antes de que escriba una sola línea de lógica.',
      },
      {
        icon: '⚖️',
        title: 'Las disputas están protegidas',
        desc: 'Si un hito se impugna, un administrador revisa la evidencia de ambas partes durante una ventana de 5 días antes de que se mueva cualquier fondo: usted nunca se queda simplemente sin cobrar.',
      },
      {
        icon: '🏅',
        title: 'La certificación abre puertas',
        desc: 'Su certificación de la plataforma es la credencial por la que contratan los clientes. Solo los ingenieros certificados pueden ser asignados, así que la evaluación que usted aprobó es lo que le consigue el trabajo.',
      },
      {
        icon: '🧰',
        title: 'Herramientas de campo incluidas',
        desc: 'Check-in por GPS, entrega de fotos de control de calidad y un gestor de proyectos con IA multilingüe en 9 idiomas: las herramientas de campo vienen con la plataforma, no como extras.',
      },
    ],

    empTag: 'Para empresas',
    empTitle: '5% para clientes fundadores',
    empFounding: '5%',
    empFoundingLabel: 'comisión de depósito en garantía para clientes fundadores — primeras 5 órdenes',
    empStandard: '15%',
    empStandardLabel: 'comisión estándar de depósito en garantía',
    empUpfront: '$0 por publicar y recibir candidatos: usted deposita un hito solo cuando ya eligió a un ingeniero.',
    empFoundingNote:
      'La tarifa fundadora del 5% es una oferta limitada del lanzamiento PMF para los primeros 5 empleadores en firmar. Se aplica por demanda, de modo que se mantiene en cada una de sus primeras 5 órdenes.',

    escrowTitle: 'Cómo funciona el depósito en garantía por hitos',
    escrowSteps: [
      { n: '1', title: 'Depositar', desc: 'Usted deposita un hito en garantía a través de Stripe Checkout. Se marca como depositado solo cuando el pago se acredita.' },
      { n: '2', title: 'Entregar', desc: 'El ingeniero entrega el hito: los check-ins en sitio y las fotos de finalización quedan registrados en él.' },
      { n: '3', title: 'Aprobar', desc: 'Usted revisa el entregable. Los fondos se mueven solo con su aprobación: nada se libera automáticamente.' },
      { n: '4', title: 'Liberar', desc: 'Con su aprobación, el depósito se libera al ingeniero menos la comisión de la plataforma. Esa comisión es el único cobro.' },
    ],

    riskTitle: '¿El primer hito no quedó bien? Reembolso total.',
    riskSub:
      'El modelo de depósito en garantía existe para que su primera orden no tenga ningún riesgo por adelantado. La ruta de reembolso está integrada en el producto, no es una promesa en el pie de página.',
    riskPoints: [
      { title: 'Los fondos permanecen en garantía', desc: 'El dinero que usted deposita se retiene de forma segura y nunca se paga al ingeniero hasta que usted apruebe el entregable.' },
      { title: 'Nada se libera durante una disputa', desc: 'Abrir una disputa congela el hito. Ningún fondo puede moverse mientras está en revisión.' },
      { title: 'Reembolso a su tarjeta original', desc: 'Si el hito se resuelve a su favor, el monto total en garantía se reembolsa a su método de pago original: sin crédito de tienda, sin recuperaciones posteriores.' },
    ],

    faqTitle: 'Preguntas frecuentes sobre precios',
    faqs: [
      {
        q: '¿Cómo se calcula la comisión de la plataforma?',
        a: 'Es un porcentaje fijo de cada hito liberado: 15% estándar, o 5% para clientes fundadores en sus primeras 5 órdenes. La tarifa se lee de una única configuración del backend, así que la comisión que usted ve es exactamente la que se cobra: no hay ningún sobreprecio aparte.',
      },
      {
        q: '¿Quién paga la comisión: el empleador o el ingeniero?',
        a: 'El empleador deposita el monto completo del hito en garantía. Cuando usted aprueba una liberación, la comisión de la plataforma se descuenta de ese monto y el ingeniero recibe el resto. En una orden estándar el ingeniero conserva el 85%; el empleador no paga ninguna comisión adicional más allá de depositar el hito.',
      },
      {
        q: '¿Cómo califico para la tarifa fundadora del 5%?',
        a: 'La tarifa del 5% está reservada para los primeros 5 empleadores que firmen durante nuestro lanzamiento PMF, y se aplica a cada una de sus primeras 5 órdenes. Se configura por proyecto, así que una vez que usted es cliente fundador, la tarifa reducida acompaña sus órdenes.',
      },
      {
        q: '¿Cuál es el proceso de reembolso?',
        a: 'Abra una disputa sobre el hito. Ambas partes tienen una ventana de 5 días para presentar evidencia, y luego un administrador la revisa. Si la disputa se resuelve a favor del empleador, el monto total en garantía se reembolsa al método de pago original; una decisión dividida reembolsa el saldo no adjudicado al ingeniero.',
      },
      {
        q: '¿Cómo funcionan los pagos transfronterizos?',
        a: 'Los pagos se procesan a través de Stripe y Stripe Connect. Los empleadores pagan con tarjeta al finalizar la compra; a los ingenieros se les paga en su cuenta de Stripe conectada. Donde los retiros de fondos de Stripe aún no están disponibles en el país del ingeniero, la plataforma procesa en su lugar un pago manual fuera de línea.',
      },
      {
        q: '¿Recibo un comprobante o una factura?',
        a: 'Sí. Cada pago de depósito pasa por Stripe Checkout, que envía por correo un comprobante de tarjeta, y cada hito depositado y liberado queda registrado en el libro mayor de su panel de Finanzas, de modo que usted tiene un registro continuo de lo depositado, liberado y cobrado.',
      },
    ],

    finalTitle: 'Comience con un solo hito',
    finalSub: 'Publique un proyecto gratis y deposite solo cuando haya elegido a su ingeniero. El 5% de cliente fundador aplica a sus primeras 5 órdenes.',
  },

  vi: {
    metaTitle: 'Bảng giá — Phí ký quỹ minh bạch | Talengineer',
    metaDesc:
      'Một khoản phí ký quỹ duy nhất, công bố ngay từ đầu. Kỹ sư giữ 85% mỗi cột mốc đã giải ngân; nhà tuyển dụng sáng lập chỉ trả 5% cho 5 đơn hàng đầu tiên. Không phí trung gian, không giấu biểu phí.',
    kicker: 'Bảng giá',
    heroTitle: 'Giá minh bạch. Công bố ngay từ đầu.',
    heroSub:
      'Không cần đăng nhập để xem biểu phí, cũng không có phí trung gian ẩn trong đơn giá. Chỉ một khoản phí ký quỹ trên các cột mốc đã thanh toán — kỹ sư giữ phần lớn từng đồng, còn bạn không trả gì cho đến khi nghiệm thu.',
    ctaPost: 'Đăng dự án — Miễn phí',
    ctaApply: 'Ứng tuyển làm kỹ sư',

    engTag: 'Dành cho kỹ sư',
    engTitle: 'Bạn giữ 85% mỗi cột mốc',
    engFee: '15%',
    engFeeLabel: 'phí nền tảng, chỉ thu khi cột mốc được giải ngân',
    engKeepLabel: 'Kỹ sư nhận 85% — khoản phí được trừ từ tiền giải ngân, không bao giờ thu trước.',
    engWhyTitle: 'Vì sao 15% là xứng đáng',
    engWhy: [
      {
        icon: '🎯',
        title: 'Khách hàng tự tìm đến bạn',
        desc: 'Các dự án được ghép nối từ OEM và nhà tích hợp trên toàn cầu — không đấu giá cạnh tranh, không chào hàng lạnh, không phải tự bỏ tiền tìm khách.',
      },
      {
        icon: '🔒',
        title: 'Thanh toán được bảo đảm',
        desc: 'Nhà tuyển dụng nạp tiền từng cột mốc vào ký quỹ trước khi bạn bắt đầu. Tiền của bạn đã được giữ trước khi bạn viết dòng logic đầu tiên.',
      },
      {
        icon: '⚖️',
        title: 'Tranh chấp được bảo vệ',
        desc: 'Nếu một cột mốc bị khiếu nại, quản trị viên sẽ xem xét bằng chứng của cả hai bên trong thời hạn 5 ngày trước khi bất kỳ khoản tiền nào được chuyển — bạn không bao giờ bị bỏ mặc làm không công.',
      },
      {
        icon: '🏅',
        title: 'Chứng chỉ mở ra cơ hội',
        desc: 'Chứng chỉ nền tảng của bạn là căn cứ để khách hàng thuê người. Chỉ kỹ sư có chứng chỉ mới được phân công, nên vòng sàng lọc bạn đã vượt qua chính là thứ mang việc về cho bạn.',
      },
      {
        icon: '🧰',
        title: 'Công cụ hiện trường có sẵn',
        desc: 'Check-in bằng GPS, giao nộp ảnh kiểm tra chất lượng và trợ lý quản lý dự án AI đa ngôn ngữ với 9 ngôn ngữ — công cụ hiện trường đi kèm nền tảng, không phải khoản thu thêm.',
      },
    ],

    empTag: 'Dành cho nhà tuyển dụng',
    empTitle: '5% cho khách hàng sáng lập',
    empFounding: '5%',
    empFoundingLabel: 'phí ký quỹ cho khách hàng sáng lập — 5 đơn hàng đầu tiên',
    empStandard: '15%',
    empStandardLabel: 'phí ký quỹ tiêu chuẩn',
    empUpfront: '$0 để đăng dự án và ghép nối — bạn chỉ nạp tiền cột mốc sau khi đã chọn được kỹ sư.',
    empFoundingNote:
      'Mức phí sáng lập 5% là ưu đãi giới hạn trong giai đoạn ra mắt PMF, dành cho 5 nhà tuyển dụng ký kết đầu tiên. Ưu đãi áp dụng theo từng nhu cầu, nên có hiệu lực với từng đơn trong 5 đơn hàng đầu tiên của bạn.',

    escrowTitle: 'Ký quỹ theo cột mốc hoạt động như thế nào',
    escrowSteps: [
      { n: '1', title: 'Nạp tiền', desc: 'Bạn nạp tiền cột mốc vào ký quỹ qua Stripe Checkout. Cột mốc chỉ được đánh dấu đã nạp sau khi thanh toán được xác nhận.' },
      { n: '2', title: 'Bàn giao', desc: 'Kỹ sư bàn giao cột mốc — các lượt check-in tại hiện trường và ảnh hoàn công được ghi nhận kèm theo.' },
      { n: '3', title: 'Nghiệm thu', desc: 'Bạn xem xét sản phẩm bàn giao. Tiền chỉ được chuyển khi bạn phê duyệt — không có gì tự động giải ngân.' },
      { n: '4', title: 'Giải ngân', desc: 'Khi được phê duyệt, tiền ký quỹ được giải ngân cho kỹ sư sau khi trừ phí nền tảng. Khoản phí đó là khoản thu duy nhất.' },
    ],

    riskTitle: 'Cột mốc đầu tiên chưa đạt? Hoàn tiền toàn bộ.',
    riskSub:
      'Mô hình ký quỹ tồn tại để đơn hàng đầu tiên của bạn không có rủi ro trả trước. Quy trình hoàn tiền được tích hợp trong sản phẩm — không phải một lời hứa ở chân trang.',
    riskPoints: [
      { title: 'Tiền vẫn nằm trong ký quỹ', desc: 'Số tiền bạn nạp được giữ an toàn và không bao giờ trả cho kỹ sư cho đến khi bạn nghiệm thu sản phẩm bàn giao.' },
      { title: 'Không giải ngân khi có tranh chấp', desc: 'Mở tranh chấp sẽ đóng băng cột mốc. Không khoản tiền nào có thể được chuyển trong thời gian xem xét.' },
      { title: 'Hoàn về thẻ ban đầu của bạn', desc: 'Nếu cột mốc được phân xử có lợi cho bạn, toàn bộ số tiền ký quỹ được hoàn về phương thức thanh toán ban đầu — không quy đổi thành tín dụng, không truy thu về sau.' },
    ],

    faqTitle: 'Câu hỏi thường gặp về giá',
    faqs: [
      {
        q: 'Phí nền tảng được tính như thế nào?',
        a: 'Đây là tỷ lệ phần trăm cố định trên mỗi cột mốc đã giải ngân: 15% tiêu chuẩn, hoặc 5% cho khách hàng sáng lập trong 5 đơn hàng đầu tiên. Mức phí được đọc từ một cấu hình backend duy nhất, nên mức phí bạn thấy chính xác là mức phí được thu — không có khoản cộng thêm nào khác.',
      },
      {
        q: 'Ai trả phí — nhà tuyển dụng hay kỹ sư?',
        a: 'Nhà tuyển dụng nạp toàn bộ số tiền cột mốc vào ký quỹ. Khi bạn phê duyệt giải ngân, phí nền tảng được trừ từ số tiền đó và kỹ sư nhận phần còn lại. Với đơn hàng tiêu chuẩn, kỹ sư giữ 85%; nhà tuyển dụng không trả thêm phí nào ngoài việc nạp tiền cột mốc.',
      },
      {
        q: 'Làm sao để được hưởng mức phí sáng lập 5%?',
        a: 'Mức 5% dành riêng cho 5 nhà tuyển dụng đầu tiên ký kết trong giai đoạn ra mắt PMF, và áp dụng cho từng đơn trong 5 đơn hàng đầu tiên của bạn. Mức phí được thiết lập theo từng dự án, nên một khi đã là khách hàng sáng lập, mức phí ưu đãi sẽ đi theo các đơn hàng của bạn.',
      },
      {
        q: 'Quy trình hoàn tiền diễn ra thế nào?',
        a: 'Mở tranh chấp trên cột mốc. Hai bên có thời hạn 5 ngày để nộp bằng chứng, sau đó quản trị viên xem xét. Nếu tranh chấp được phân xử có lợi cho nhà tuyển dụng, toàn bộ số tiền ký quỹ được hoàn về phương thức thanh toán ban đầu; nếu phán quyết chia phần, phần không trao cho kỹ sư sẽ được hoàn lại.',
      },
      {
        q: 'Thanh toán xuyên biên giới hoạt động ra sao?',
        a: 'Thanh toán chạy qua Stripe và Stripe Connect. Nhà tuyển dụng trả bằng thẻ khi thanh toán; kỹ sư nhận tiền vào tài khoản Stripe đã liên kết. Ở những quốc gia Stripe chưa hỗ trợ rút tiền cho kỹ sư, nền tảng sẽ xử lý chi trả thủ công ngoại tuyến thay thế.',
      },
      {
        q: 'Tôi có nhận được biên lai hay hóa đơn không?',
        a: 'Có. Mỗi lần nạp tiền đều qua Stripe Checkout và biên lai thẻ được gửi qua email; mọi cột mốc đã nạp và đã giải ngân đều được ghi vào sổ cái trong bảng điều khiển Tài chính của bạn, để bạn luôn có nhật ký đầy đủ về những gì đã nạp, đã giải ngân và đã thu phí.',
      },
    ],

    finalTitle: 'Bắt đầu từ một cột mốc',
    finalSub: 'Đăng dự án miễn phí và chỉ nạp tiền khi đã chọn được kỹ sư. Mức 5% cho khách hàng sáng lập áp dụng cho 5 đơn hàng đầu tiên của bạn.',
  },

  hi: {
    metaTitle: 'मूल्य निर्धारण — पारदर्शी एस्क्रो शुल्क | Talengineer',
    metaDesc:
      'एक ही एस्क्रो शुल्क, पहले से प्रकाशित। इंजीनियर हर रिलीज़ हुए माइलस्टोन का 85% रखते हैं; संस्थापक नियोक्ता अपने पहले 5 ऑर्डर पर केवल 5% देते हैं। कोई एजेंसी मार्कअप नहीं, कोई छिपी दरें नहीं।',
    kicker: 'मूल्य निर्धारण',
    heroTitle: 'पारदर्शी मूल्य। पहले से प्रकाशित।',
    heroSub:
      'हमारे शुल्क देखने के लिए लॉगिन की ज़रूरत नहीं, और दर में कोई एजेंसी मार्कअप छिपा नहीं है। भुगतान किए गए माइलस्टोन पर बस एक एस्क्रो शुल्क — इंजीनियर हर डॉलर का बड़ा हिस्सा रखते हैं, और आप स्वीकृति देने तक कुछ नहीं चुकाते।',
    ctaPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',
    ctaApply: 'इंजीनियर के रूप में आवेदन करें',

    engTag: 'इंजीनियरों के लिए',
    engTitle: 'हर माइलस्टोन का 85% आपका',
    engFee: '15%',
    engFeeLabel: 'प्लेटफ़ॉर्म शुल्क, केवल रिलीज़ हुए माइलस्टोन पर लिया जाता है',
    engKeepLabel: 'इंजीनियर 85% रखते हैं — शुल्क रिलीज़ से कटता है, कभी अग्रिम नहीं लिया जाता।',
    engWhyTitle: 'यह 15% किस काम का है',
    engWhy: [
      {
        icon: '🎯',
        title: 'क्लाइंट खुद आपके पास आते हैं',
        desc: 'दुनिया भर के OEM और इंटीग्रेटर्स से मैच किए गए प्रोजेक्ट — न बोली की होड़, न कोल्ड आउटरीच, न अपनी जेब से लीड-जनरेशन का खर्च।',
      },
      {
        icon: '🔒',
        title: 'भुगतान की गारंटी है',
        desc: 'आपके शुरू करने से पहले नियोक्ता हर माइलस्टोन की राशि एस्क्रो में जमा करता है। लॉजिक की पहली लाइन लिखने से पहले ही आपका पैसा सुरक्षित रखा जा चुका होता है।',
      },
      {
        icon: '⚖️',
        title: 'विवादों में सुरक्षा है',
        desc: 'यदि किसी माइलस्टोन पर आपत्ति उठती है, तो कोई भी राशि हिलने से पहले एडमिन 5 दिन की साक्ष्य विंडो में दोनों पक्षों के प्रमाण देखता है — आपको यूँ ही बिना भुगतान नहीं छोड़ा जाता।',
      },
      {
        icon: '🏅',
        title: 'प्रमाणन दरवाज़े खोलता है',
        desc: 'आपका प्लेटफ़ॉर्म प्रमाणन ही वह बैज है जिस पर क्लाइंट हायर करते हैं। केवल प्रमाणित इंजीनियर ही असाइन किए जा सकते हैं, इसलिए जो स्क्रीनिंग आपने पास की है, वही आपको काम दिलाती है।',
      },
      {
        icon: '🧰',
        title: 'ऑन-साइट टूल शामिल',
        desc: 'GPS चेक-इन, QC फ़ोटो डिलीवरी और 9 भाषाओं वाला बहुभाषी AI प्रोजेक्ट मैनेजर — फ़ील्ड टूल प्लेटफ़ॉर्म के साथ आते हैं, अलग शुल्क पर नहीं।',
      },
    ],

    empTag: 'नियोक्ताओं के लिए',
    empTitle: 'संस्थापक ग्राहकों के लिए 5%',
    empFounding: '5%',
    empFoundingLabel: 'संस्थापक ग्राहकों के लिए एस्क्रो शुल्क — पहले 5 ऑर्डर',
    empStandard: '15%',
    empStandardLabel: 'मानक एस्क्रो शुल्क',
    empUpfront: 'पोस्ट करने और मैच पाने के लिए $0 — इंजीनियर चुनने के बाद ही आप माइलस्टोन में राशि जमा करते हैं।',
    empFoundingNote:
      '5% की संस्थापक दर PMF लॉन्च की सीमित पेशकश है, जो साइन करने वाले पहले 5 नियोक्ताओं के लिए है। यह प्रति डिमांड लागू होती है, इसलिए आपके पहले 5 ऑर्डर में से हर एक पर मान्य रहती है।',

    escrowTitle: 'माइलस्टोन एस्क्रो कैसे काम करता है',
    escrowSteps: [
      { n: '1', title: 'जमा करें', desc: 'आप Stripe Checkout के ज़रिए माइलस्टोन की राशि एस्क्रो में जमा करते हैं। भुगतान क्लियर होने के बाद ही उसे जमा चिह्नित किया जाता है।' },
      { n: '2', title: 'डिलीवर करें', desc: 'इंजीनियर माइलस्टोन डिलीवर करता है — ऑन-साइट चेक-इन और कार्य पूर्णता की फ़ोटो उसी के साथ दर्ज होती हैं।' },
      { n: '3', title: 'स्वीकृति दें', desc: 'आप डिलीवरेबल की समीक्षा करते हैं। राशि केवल आपकी स्वीकृति पर ही आगे बढ़ती है — कुछ भी अपने आप रिलीज़ नहीं होता।' },
      { n: '4', title: 'रिलीज़ करें', desc: 'स्वीकृति मिलते ही एस्क्रो से प्लेटफ़ॉर्म शुल्क काटकर राशि इंजीनियर को रिलीज़ हो जाती है। यही एकमात्र शुल्क है।' },
    ],

    riskTitle: 'पहला माइलस्टोन ठीक नहीं रहा? पूरा रिफ़ंड।',
    riskSub:
      'एस्क्रो मॉडल इसीलिए है ताकि आपके पहले ऑर्डर में कोई अग्रिम जोखिम न हो। रिफ़ंड का रास्ता प्रोडक्ट में ही बना हुआ है — फ़ुटर में लिखा कोई वादा नहीं।',
    riskPoints: [
      { title: 'राशि एस्क्रो में ही रहती है', desc: 'आपकी जमा की गई राशि सुरक्षित रखी जाती है और जब तक आप डिलीवरेबल स्वीकृत नहीं करते, इंजीनियर को कभी नहीं दी जाती।' },
      { title: 'विवाद के दौरान कुछ रिलीज़ नहीं होता', desc: 'विवाद खोलते ही माइलस्टोन फ़्रीज़ हो जाता है। समीक्षा के दौरान कोई राशि नहीं हिल सकती।' },
      { title: 'आपके मूल कार्ड पर रिफ़ंड', desc: 'यदि माइलस्टोन का फ़ैसला आपके पक्ष में होता है, तो एस्क्रो की पूरी राशि आपके मूल भुगतान माध्यम पर लौटा दी जाती है — न स्टोर क्रेडिट, न बाद में कोई वसूली।' },
    ],

    faqTitle: 'मूल्य निर्धारण FAQ',
    faqs: [
      {
        q: 'प्लेटफ़ॉर्म शुल्क की गणना कैसे होती है?',
        a: 'यह हर रिलीज़ हुए माइलस्टोन का एक निश्चित प्रतिशत है: मानक 15%, या संस्थापक ग्राहकों के पहले 5 ऑर्डर पर 5%। दर एक ही backend कॉन्फ़िगरेशन से पढ़ी जाती है, इसलिए जो दर आप देखते हैं, ठीक वही ली जाती है — अलग से कोई मार्कअप नहीं है।',
      },
      {
        q: 'शुल्क कौन देता है — नियोक्ता या इंजीनियर?',
        a: 'नियोक्ता माइलस्टोन की पूरी राशि एस्क्रो में जमा करता है। जब आप रिलीज़ स्वीकृत करते हैं, तो उसी राशि से प्लेटफ़ॉर्म शुल्क कटता है और शेष इंजीनियर को मिलता है। मानक ऑर्डर में इंजीनियर 85% रखता है; नियोक्ता माइलस्टोन जमा करने के अलावा कोई शुल्क नहीं देता।',
      },
      {
        q: '5% की संस्थापक दर कैसे मिलती है?',
        a: '5% दर हमारे PMF लॉन्च में साइन करने वाले पहले 5 नियोक्ताओं के लिए आरक्षित है, और यह आपके पहले 5 ऑर्डर में से हर एक पर लागू होती है। यह प्रति प्रोजेक्ट सेट होती है, इसलिए एक बार संस्थापक ग्राहक बनने पर घटी हुई दर आपके ऑर्डरों के साथ चलती है।',
      },
      {
        q: 'रिफ़ंड की प्रक्रिया क्या है?',
        a: 'माइलस्टोन पर विवाद खोलें। दोनों पक्षों के पास साक्ष्य जमा करने के लिए 5 दिन की विंडो होती है, फिर एडमिन उसकी समीक्षा करता है। यदि विवाद नियोक्ता के पक्ष में सुलझता है, तो एस्क्रो की पूरी राशि मूल भुगतान माध्यम पर लौटाई जाती है; बँटवारे के फ़ैसले में वह हिस्सा लौटाया जाता है जो इंजीनियर को नहीं दिया गया।',
      },
      {
        q: 'सीमा-पार भुगतान कैसे होते हैं?',
        a: 'भुगतान Stripe और Stripe Connect के ज़रिए चलते हैं। नियोक्ता चेकआउट पर कार्ड से भुगतान करते हैं; इंजीनियरों को उनके जुड़े हुए Stripe खाते में पेआउट मिलता है। जिन देशों में इंजीनियर के लिए Stripe पेआउट अभी उपलब्ध नहीं है, वहाँ प्लेटफ़ॉर्म ऑफ़लाइन मैनुअल पेआउट करता है।',
      },
      {
        q: 'क्या मुझे रसीद या इनवॉइस मिलेगा?',
        a: 'हाँ। हर जमा भुगतान Stripe Checkout से गुज़रता है, जो ईमेल पर कार्ड रसीद भेजता है, और हर जमा व रिलीज़ हुआ माइलस्टोन आपके Finance डैशबोर्ड के लेजर में दर्ज होता है, ताकि क्या जमा हुआ, क्या रिलीज़ हुआ और क्या शुल्क लगा — इसका पूरा रिकॉर्ड आपके पास रहे।',
      },
    ],

    finalTitle: 'एक माइलस्टोन से शुरुआत करें',
    finalSub: 'निःशुल्क प्रोजेक्ट पोस्ट करें और इंजीनियर चुनने के बाद ही राशि जमा करें। संस्थापक ग्राहक का 5% आपके पहले 5 ऑर्डर पर लागू होता है।',
  },

  fr: {
    metaTitle: 'Tarifs — Frais de séquestre transparents | Talengineer',
    metaDesc:
      'Des frais de séquestre uniques, publiés d’avance. Les ingénieurs conservent 85% de chaque jalon débloqué ; les employeurs fondateurs ne paient que 5% sur leurs 5 premières commandes. Pas de marge d’agence, pas de tarifs cachés.',
    kicker: 'Tarifs',
    heroTitle: 'Des tarifs transparents, publiés d’avance.',
    heroSub:
      'Aucune connexion requise pour consulter nos frais, aucune marge d’agence dissimulée dans le tarif. Des frais de séquestre uniques sur les jalons payés — l’ingénieur conserve l’essentiel de chaque dollar, et vous ne payez rien avant validation.',
    ctaPost: 'Publier un projet — Gratuit',
    ctaApply: 'Postuler comme ingénieur',

    engTag: 'Pour les ingénieurs',
    engTitle: 'Vous conservez 85% de chaque jalon',
    engFee: '15%',
    engFeeLabel: 'frais de plateforme, prélevés uniquement sur les jalons débloqués',
    engKeepLabel: 'Les ingénieurs conservent 85% — les frais sont prélevés au déblocage, jamais facturés d’avance.',
    engWhyTitle: 'Pourquoi ces 15% se justifient',
    engWhy: [
      {
        icon: '🎯',
        title: 'Les clients viennent à vous',
        desc: 'Des projets ciblés, proposés par des OEM et des intégrateurs du monde entier — pas d’enchères au rabais, pas de prospection à froid, pas de budget d’acquisition à votre charge.',
      },
      {
        icon: '🔒',
        title: 'Le paiement est garanti',
        desc: 'L’employeur provisionne chaque jalon sous séquestre avant que vous ne commenciez. Votre argent est déjà bloqué avant la première ligne de logique.',
      },
      {
        icon: '⚖️',
        title: 'Les litiges sont encadrés',
        desc: 'Si un jalon est contesté, un administrateur examine les preuves des deux parties pendant une fenêtre de 5 jours avant tout mouvement de fonds — vous n’êtes jamais laissé sans paiement.',
      },
      {
        icon: '🏅',
        title: 'La certification ouvre des portes',
        desc: 'Votre certification de plateforme est le gage sur lequel les clients recrutent. Seuls les ingénieurs certifiés peuvent être affectés — c’est l’évaluation que vous avez réussie qui vous décroche les missions.',
      },
      {
        icon: '🧰',
        title: 'Outils terrain inclus',
        desc: 'Pointage GPS, livraison de photos de contrôle qualité et chef de projet IA multilingue en 9 langues — les outils terrain sont fournis avec la plateforme, sans supplément.',
      },
    ],

    empTag: 'Pour les employeurs',
    empTitle: '5% pour les clients fondateurs',
    empFounding: '5%',
    empFoundingLabel: 'frais de séquestre pour les clients fondateurs — 5 premières commandes',
    empStandard: '15%',
    empStandardLabel: 'frais de séquestre standard',
    empUpfront: '$0 pour publier et être mis en relation — vous ne provisionnez un jalon qu’une fois votre ingénieur choisi.',
    empFoundingNote:
      'Le tarif fondateur de 5% est une offre limitée du lancement PMF, réservée aux 5 premiers employeurs signataires. Il s’applique par demande et vaut donc pour chacune de vos 5 premières commandes.',

    escrowTitle: 'Comment fonctionne le séquestre par jalons',
    escrowSteps: [
      { n: '1', title: 'Provisionner', desc: 'Vous provisionnez un jalon sous séquestre via Stripe Checkout. Il n’est marqué provisionné qu’une fois le paiement encaissé.' },
      { n: '2', title: 'Livrer', desc: 'L’ingénieur livre le jalon — les pointages sur site et les photos de fin de travaux y sont consignés.' },
      { n: '3', title: 'Valider', desc: 'Vous examinez le livrable. Les fonds ne bougent que sur votre validation — rien n’est débloqué automatiquement.' },
      { n: '4', title: 'Débloquer', desc: 'À la validation, le séquestre est débloqué vers l’ingénieur, déduction faite des frais de plateforme. Ces frais sont le seul prélèvement.' },
    ],

    riskTitle: 'Premier jalon non conforme ? Remboursement intégral.',
    riskSub:
      'Le modèle de séquestre existe pour que votre première commande ne comporte aucun risque initial. Le parcours de remboursement est intégré au produit — ce n’est pas une promesse en bas de page.',
    riskPoints: [
      { title: 'Les fonds restent sous séquestre', desc: 'L’argent que vous provisionnez est conservé en sécurité et n’est jamais versé à l’ingénieur avant que vous ne validiez le livrable.' },
      { title: 'Rien n’est débloqué pendant un litige', desc: 'Ouvrir un litige gèle le jalon. Aucun fonds ne peut bouger pendant l’examen.' },
      { title: 'Remboursement sur votre carte d’origine', desc: 'Si le jalon est tranché en votre faveur, le montant intégral sous séquestre est remboursé sur votre moyen de paiement d’origine — pas d’avoir, pas de reprise ultérieure.' },
    ],

    faqTitle: 'FAQ tarifs',
    faqs: [
      {
        q: 'Comment les frais de plateforme sont-ils calculés ?',
        a: 'C’est un pourcentage fixe de chaque jalon débloqué : 15% en standard, ou 5% pour les clients fondateurs sur leurs 5 premières commandes. Le taux est lu depuis une configuration backend unique : les frais affichés sont exactement les frais prélevés — aucune marge séparée.',
      },
      {
        q: 'Qui paie les frais — l’employeur ou l’ingénieur ?',
        a: 'L’employeur provisionne le montant intégral du jalon sous séquestre. Lorsque vous validez un déblocage, les frais de plateforme sont déduits de ce montant et l’ingénieur reçoit le reste. Sur une commande standard, l’ingénieur conserve 85% ; l’employeur ne paie aucun frais au-delà du provisionnement du jalon.',
      },
      {
        q: 'Comment bénéficier du tarif fondateur de 5% ?',
        a: 'Le taux de 5% est réservé aux 5 premiers employeurs signataires pendant notre lancement PMF, et il s’applique à chacune de vos 5 premières commandes. Il est défini par projet : une fois client fondateur, le tarif réduit suit vos commandes.',
      },
      {
        q: 'Quelle est la procédure de remboursement ?',
        a: 'Ouvrez un litige sur le jalon. Chaque partie dispose d’une fenêtre de 5 jours pour soumettre ses preuves, puis un administrateur les examine. Si le litige est tranché en faveur de l’employeur, le montant intégral sous séquestre est remboursé sur le moyen de paiement d’origine ; une décision partagée rembourse le solde non attribué à l’ingénieur.',
      },
      {
        q: 'Comment fonctionnent les paiements transfrontaliers ?',
        a: 'Les paiements passent par Stripe et Stripe Connect. Les employeurs paient par carte au moment du règlement ; les ingénieurs sont payés sur leur compte Stripe connecté. Lorsque les versements Stripe ne sont pas encore disponibles dans le pays d’un ingénieur, la plateforme effectue à la place un versement manuel hors ligne.',
      },
      {
        q: 'Est-ce que je reçois un reçu ou une facture ?',
        a: 'Oui. Chaque provisionnement passe par Stripe Checkout, qui envoie un reçu de carte par e-mail, et chaque jalon provisionné puis débloqué est consigné dans le registre de votre tableau de bord Finance : vous disposez ainsi d’un historique complet de ce qui a été provisionné, débloqué et prélevé.',
      },
    ],

    finalTitle: 'Commencez par un seul jalon',
    finalSub: 'Publiez un projet gratuitement et ne provisionnez qu’une fois votre ingénieur choisi. Le tarif fondateur de 5% s’applique à vos 5 premières commandes.',
  },

  de: {
    metaTitle: 'Preise — Transparente Treuhandgebühren | Talengineer',
    metaDesc:
      'Eine Treuhandgebühr, vorab veröffentlicht. Ingenieure behalten 85% jedes freigegebenen Meilensteins; Gründungskunden zahlen auf ihre ersten 5 Aufträge nur 5%. Kein Agenturaufschlag, keine versteckten Sätze.',
    kicker: 'Preise',
    heroTitle: 'Transparente Preise. Vorab veröffentlicht.',
    heroSub:
      'Kein Login nötig, um unsere Gebühren zu sehen, kein Agenturaufschlag im Satz versteckt. Eine einzige Treuhandgebühr auf bezahlte Meilensteine — Ingenieure behalten den Großteil jedes Dollars, Auftraggeber zahlen nichts, bevor sie abnehmen.',
    ctaPost: 'Projekt ausschreiben — kostenlos',
    ctaApply: 'Als Ingenieur bewerben',

    engTag: 'Für Ingenieure',
    engTitle: 'Sie behalten 85% jedes Meilensteins',
    engFee: '15%',
    engFeeLabel: 'Plattformgebühr, nur auf freigegebene Meilensteine erhoben',
    engKeepLabel: 'Ingenieure behalten 85% — die Gebühr wird bei der Freigabe abgezogen, niemals vorab berechnet.',
    engWhyTitle: 'Warum sich die 15% lohnen',
    engWhy: [
      {
        icon: '🎯',
        title: 'Kunden kommen zu Ihnen',
        desc: 'Passende Projekte von OEMs und Integratoren weltweit — kein Bieterwettkampf, keine Kaltakquise, keine eigenen Ausgaben für Leadgenerierung.',
      },
      {
        icon: '🔒',
        title: 'Die Zahlung ist gesichert',
        desc: 'Der Auftraggeber hinterlegt jeden Meilenstein in der Treuhand, bevor Sie beginnen. Ihr Geld ist bereits gesichert, bevor Sie die erste Zeile Logik schreiben.',
      },
      {
        icon: '⚖️',
        title: 'Streitfälle sind abgesichert',
        desc: 'Wird ein Meilenstein beanstandet, prüft ein Admin innerhalb einer Beweisfrist von 5 Tagen die Nachweise beider Seiten, bevor Gelder fließen — Sie bleiben nie einfach unbezahlt.',
      },
      {
        icon: '🏅',
        title: 'Zertifizierung öffnet Türen',
        desc: 'Ihre Plattform-Zertifizierung ist das Gütesiegel, nach dem Kunden einstellen. Nur zertifizierte Ingenieure können eingesetzt werden — das bestandene Assessment ist es, was Ihnen die Aufträge verschafft.',
      },
      {
        icon: '🧰',
        title: 'Vor-Ort-Werkzeuge inklusive',
        desc: 'GPS-Check-in, QC-Fotoübergabe und ein mehrsprachiger KI-Projektmanager in 9 Sprachen — die Feldwerkzeuge gehören zur Plattform und kosten nichts extra.',
      },
    ],

    empTag: 'Für Auftraggeber',
    empTitle: '5% für Gründungskunden',
    empFounding: '5%',
    empFoundingLabel: 'Treuhandgebühr für Gründungskunden — erste 5 Aufträge',
    empStandard: '15%',
    empStandardLabel: 'Standard-Treuhandgebühr',
    empUpfront: '$0 für Ausschreibung und Matching — Sie hinterlegen einen Meilenstein erst, wenn Sie einen Ingenieur gewählt haben.',
    empFoundingNote:
      'Der Gründungssatz von 5% ist ein limitiertes Angebot zum PMF-Start für die ersten 5 Auftraggeber, die unterzeichnen. Er gilt pro Bedarf und damit für jeden Ihrer ersten 5 Aufträge.',

    escrowTitle: 'So funktioniert die Meilenstein-Treuhand',
    escrowSteps: [
      { n: '1', title: 'Hinterlegen', desc: 'Sie hinterlegen einen Meilenstein über Stripe Checkout in der Treuhand. Er gilt erst als hinterlegt, wenn die Zahlung eingegangen ist.' },
      { n: '2', title: 'Liefern', desc: 'Der Ingenieur liefert den Meilenstein — Vor-Ort-Check-ins und Abschlussfotos werden dabei protokolliert.' },
      { n: '3', title: 'Abnehmen', desc: 'Sie prüfen die Lieferung. Gelder fließen nur mit Ihrer Abnahme — nichts wird automatisch freigegeben.' },
      { n: '4', title: 'Freigeben', desc: 'Mit der Abnahme wird die Treuhand abzüglich der Plattformgebühr an den Ingenieur freigegeben. Diese Gebühr ist die einzige Belastung.' },
    ],

    riskTitle: 'Erster Meilenstein nicht in Ordnung? Volle Erstattung.',
    riskSub:
      'Das Treuhandmodell existiert, damit Ihr erster Auftrag ohne Vorabrisiko bleibt. Der Erstattungsweg ist ins Produkt eingebaut — kein Versprechen in der Fußzeile.',
    riskPoints: [
      { title: 'Gelder bleiben in der Treuhand', desc: 'Hinterlegtes Geld wird sicher verwahrt und erst an den Ingenieur ausgezahlt, wenn Sie die Lieferung abgenommen haben.' },
      { title: 'Im Streitfall wird nichts freigegeben', desc: 'Das Eröffnen eines Streitfalls friert den Meilenstein ein. Während der Prüfung kann kein Geld fließen.' },
      { title: 'Erstattung auf Ihre ursprüngliche Karte', desc: 'Wird der Meilenstein zu Ihren Gunsten entschieden, wird der volle Treuhandbetrag auf Ihr ursprüngliches Zahlungsmittel erstattet — kein Guthaben, keine spätere Rückbelastung.' },
    ],

    faqTitle: 'Preis-FAQ',
    faqs: [
      {
        q: 'Wie wird die Plattformgebühr berechnet?',
        a: 'Sie ist ein fester Prozentsatz jedes freigegebenen Meilensteins: 15% im Standard, oder 5% für Gründungskunden auf ihre ersten 5 Aufträge. Der Satz wird aus einer einzigen Backend-Konfiguration gelesen — die angezeigte Gebühr ist exakt die erhobene, ohne separaten Aufschlag.',
      },
      {
        q: 'Wer zahlt die Gebühr — Auftraggeber oder Ingenieur?',
        a: 'Der Auftraggeber hinterlegt den vollen Meilensteinbetrag in der Treuhand. Wenn Sie eine Freigabe abnehmen, wird die Plattformgebühr von diesem Betrag abgezogen, den Rest erhält der Ingenieur. Bei einem Standardauftrag behält der Ingenieur 85%; der Auftraggeber zahlt über die Hinterlegung hinaus keine Gebühr.',
      },
      {
        q: 'Wie qualifiziere ich mich für den Gründungssatz von 5%?',
        a: 'Der Satz von 5% ist den ersten 5 Auftraggebern vorbehalten, die während unseres PMF-Starts unterzeichnen, und gilt für jeden Ihrer ersten 5 Aufträge. Er wird pro Projekt gesetzt — sind Sie einmal Gründungskunde, wandert der reduzierte Satz mit Ihren Aufträgen mit.',
      },
      {
        q: 'Wie läuft die Erstattung ab?',
        a: 'Eröffnen Sie einen Streitfall zum Meilenstein. Beide Seiten haben eine Frist von 5 Tagen, um Nachweise einzureichen, danach prüft ein Admin. Wird der Streitfall zugunsten des Auftraggebers entschieden, wird der volle Treuhandbetrag auf das ursprüngliche Zahlungsmittel erstattet; bei einer geteilten Entscheidung wird der nicht dem Ingenieur zugesprochene Rest erstattet.',
      },
      {
        q: 'Wie funktionieren grenzüberschreitende Zahlungen?',
        a: 'Zahlungen laufen über Stripe und Stripe Connect. Auftraggeber zahlen im Checkout per Karte; Ingenieure erhalten ihre Auszahlung auf ihr verbundenes Stripe-Konto. Wo Stripe-Auszahlungen im Land eines Ingenieurs noch nicht verfügbar sind, wickelt die Plattform stattdessen eine manuelle Offline-Auszahlung ab.',
      },
      {
        q: 'Erhalte ich eine Quittung oder Rechnung?',
        a: 'Ja. Jede Hinterlegung läuft über Stripe Checkout, das eine Kartenquittung per E-Mail versendet, und jeder hinterlegte und freigegebene Meilenstein wird im Kontenbuch Ihres Finanz-Dashboards erfasst — Sie haben damit eine laufende Übersicht, was hinterlegt, freigegeben und berechnet wurde.',
      },
    ],

    finalTitle: 'Starten Sie mit einem Meilenstein',
    finalSub: 'Schreiben Sie ein Projekt kostenlos aus und hinterlegen Sie erst, wenn Sie Ihren Ingenieur gewählt haben. Die 5% für Gründungskunden gelten für Ihre ersten 5 Aufträge.',
  },

  ja: {
    metaTitle: '料金 — 透明なエスクロー手数料 | Talengineer',
    metaDesc:
      'エスクロー手数料は一本のみ、事前に公開しています。エンジニアは送金された各マイルストーンの85%を手にし、ファウンディングクライアントの雇用者は最初の5件の注文で5%のみ。仲介マージンも非公開の料金表もありません。',
    kicker: '料金',
    heroTitle: '透明な料金体系。事前にすべて公開。',
    heroSub:
      '手数料の確認にログインは不要、料金に仲介マージンも潜んでいません。支払い済みマイルストーンにかかるのはエスクロー手数料一本のみ——エンジニアが報酬の大半を受け取り、雇用者は承認するまで一切支払いません。',
    ctaPost: 'プロジェクトを掲載 — 無料',
    ctaApply: 'エンジニアとして応募',

    engTag: 'エンジニアの方へ',
    engTitle: '各マイルストーンの85%があなたのものに',
    engFee: '15%',
    engFeeLabel: 'プラットフォーム手数料。送金されたマイルストーンにのみ発生します',
    engKeepLabel: 'エンジニアの取り分は85%——手数料は送金時に差し引かれ、前払いで請求されることはありません。',
    engWhyTitle: 'この15%が果たす役割',
    engWhy: [
      {
        icon: '🎯',
        title: 'クライアントの方から来る',
        desc: '世界中のOEMやインテグレーターからマッチングされた案件が届きます——入札競争も飛び込み営業も、自前のリード獲得費用も不要です。',
      },
      {
        icon: '🔒',
        title: '支払いが保証される',
        desc: '雇用者は着手前に各マイルストーンの資金をエスクローに入金します。ロジックを1行書く前に、報酬はすでに確保されています。',
      },
      {
        icon: '⚖️',
        title: '紛争から守られる',
        desc: 'マイルストーンに異議が出た場合、資金が動く前に管理者が5日間の証拠提出期間で双方の証拠を審査します——働き損のまま放置されることはありません。',
      },
      {
        icon: '🏅',
        title: '認定が仕事の扉を開く',
        desc: 'プラットフォームの認定は、クライアントが採用の決め手にする証明です。アサインされるのは認定エンジニアだけ——あなたが合格したスクリーニングこそが、仕事を勝ち取る力になります。',
      },
      {
        icon: '🧰',
        title: '現場ツールも込み',
        desc: 'GPSチェックイン、QC写真の納品、9言語対応の多言語AIプロジェクトマネージャー——現場ツールはプラットフォームに標準装備で、追加料金ではありません。',
      },
    ],

    empTag: '雇用者の方へ',
    empTitle: 'ファウンディングクライアントは5%',
    empFounding: '5%',
    empFoundingLabel: 'ファウンディングクライアント向けエスクロー手数料——最初の5件の注文',
    empStandard: '15%',
    empStandardLabel: '標準エスクロー手数料',
    empUpfront: '掲載とマッチングは$0——エンジニアを選定してから、はじめてマイルストーンに入金します。',
    empFoundingNote:
      '5%のファウンディング料率は、PMFローンチ期の先着5社限定オファーです。案件（需要）ごとに適用されるため、最初の5件の注文それぞれで有効です。',

    escrowTitle: 'マイルストーン・エスクローの仕組み',
    escrowSteps: [
      { n: '1', title: '入金', desc: 'Stripe Checkoutでマイルストーンの資金をエスクローに入金します。決済の完了後にはじめて入金済みとして記録されます。' },
      { n: '2', title: '納品', desc: 'エンジニアがマイルストーンを納品します——現場チェックインと完了写真がマイルストーンに紐づけて記録されます。' },
      { n: '3', title: '承認', desc: '納品物を確認します。資金が動くのはあなたの承認時のみ——自動で送金されることはありません。' },
      { n: '4', title: '送金', desc: '承認されると、エスクローからプラットフォーム手数料を差し引いた金額がエンジニアに送金されます。この手数料が唯一の請求です。' },
    ],

    riskTitle: '最初のマイルストーンにご不満なら、全額返金。',
    riskSub:
      'エスクローモデルは、最初の注文を前払いリスクゼロにするための仕組みです。返金の経路は製品そのものに組み込まれています——フッターの一文の約束ではありません。',
    riskPoints: [
      { title: '資金はエスクローに留まる', desc: '入金された資金は安全に保管され、納品物を承認するまでエンジニアに支払われることはありません。' },
      { title: '紛争中は一切送金されない', desc: '紛争を申し立てるとマイルストーンは凍結されます。審査中はいかなる資金も動きません。' },
      { title: '元のカードへ返金', desc: 'マイルストーンがあなたに有利に裁定された場合、エスクロー全額が元の支払い方法に返金されます——ストアクレジットでも後日の相殺でもありません。' },
    ],

    faqTitle: '料金に関するFAQ',
    faqs: [
      {
        q: 'プラットフォーム手数料はどう計算されますか。',
        a: '送金された各マイルストーンに対する固定の割合です。標準は15%、ファウンディングクライアントは最初の5件の注文で5%です。料率は単一のバックエンド設定から読み込まれるため、表示されている手数料がそのまま請求される手数料であり、別途の上乗せはありません。',
      },
      {
        q: '手数料は雇用者とエンジニア、どちらが負担しますか。',
        a: '雇用者はマイルストーンの全額をエスクローに入金します。送金を承認すると、その金額からプラットフォーム手数料が差し引かれ、残りをエンジニアが受け取ります。標準の注文ではエンジニアの取り分は85%。雇用者はマイルストーンへの入金以外に手数料を負担しません。',
      },
      {
        q: '5%のファウンディング料率はどうすれば受けられますか。',
        a: '5%の料率は、PMFローンチ期に契約した先着5社の雇用者のためのもので、最初の5件の注文それぞれに適用されます。案件ごとに設定されるため、一度ファウンディングクライアントになれば、優遇料率は注文とともに引き継がれます。',
      },
      {
        q: '返金の流れを教えてください。',
        a: 'マイルストーンに対して紛争を申し立てます。双方が5日間の期間内に証拠を提出し、その後管理者が審査します。紛争が雇用者に有利に裁定された場合、エスクロー全額が元の支払い方法に返金されます。分割裁定の場合は、エンジニアに支払われなかった残額が返金されます。',
      },
      {
        q: '国際送金はどのように行われますか。',
        a: '決済はStripeとStripe Connectを通じて行われます。雇用者はチェックアウト時にカードで支払い、エンジニアは連携済みのStripeアカウントで受け取ります。エンジニアの国でStripeの出金がまだ利用できない場合は、プラットフォームが代わりにオフラインでの手動出金を行います。',
      },
      {
        q: '領収書や請求書は受け取れますか。',
        a: 'はい。入金はすべてStripe Checkoutを経由し、カード決済の領収書がメールで届きます。また、入金・送金された各マイルストーンはFinanceダッシュボードの台帳に記録されるため、何を入金し、送金し、いくら手数料がかかったかを常に確認できます。',
      },
    ],

    finalTitle: 'まずはマイルストーンひとつから',
    finalSub: 'プロジェクトの掲載は無料。エンジニアを選定してから入金してください。ファウンディングクライアントの5%は最初の5件の注文に適用されます。',
  },

  ko: {
    metaTitle: '요금 안내 — 투명한 에스크로 수수료 | Talengineer',
    metaDesc:
      '에스크로 수수료 단 하나, 처음부터 공개합니다. 엔지니어는 지급 완료된 마일스톤마다 85%를 가져가고, 파운딩 고용주는 첫 5건의 주문에 5%만 냅니다. 에이전시 마진도, 숨겨진 요율도 없습니다.',
    kicker: '요금 안내',
    heroTitle: '투명한 요금. 처음부터 공개합니다.',
    heroSub:
      '수수료를 보려고 로그인할 필요도 없고, 요율에 에이전시 마진이 숨어 있지도 않습니다. 결제된 마일스톤에 붙는 에스크로 수수료 단 하나 — 엔지니어가 한 푼 한 푼의 대부분을 가져가고, 고용주는 승인 전까지 아무것도 내지 않습니다.',
    ctaPost: '프로젝트 등록 — 무료',
    ctaApply: '엔지니어로 지원하기',

    engTag: '엔지니어를 위한 안내',
    engTitle: '마일스톤마다 85%를 가져갑니다',
    engFee: '15%',
    engFeeLabel: '플랫폼 수수료, 지급 완료된 마일스톤에만 부과',
    engKeepLabel: '엔지니어의 몫은 85% — 수수료는 지급 시점에 공제되며, 선불로 청구되는 일은 없습니다.',
    engWhyTitle: '이 15%가 하는 일',
    engWhy: [
      {
        icon: '🎯',
        title: '고객이 먼저 찾아옵니다',
        desc: '전 세계 OEM과 시스템 통합업체에서 매칭된 프로젝트가 도착합니다 — 입찰 경쟁도, 콜드 아웃리치도, 자비로 쓰는 리드 확보 비용도 없습니다.',
      },
      {
        icon: '🔒',
        title: '대금 지급이 보장됩니다',
        desc: '고용주는 작업 시작 전에 각 마일스톤 대금을 에스크로에 예치합니다. 로직 한 줄을 쓰기 전에 이미 대금이 확보되어 있습니다.',
      },
      {
        icon: '⚖️',
        title: '분쟁에서 보호받습니다',
        desc: '마일스톤에 이의가 제기되면, 자금이 움직이기 전에 관리자가 5일의 증거 제출 기간 동안 양측의 증거를 검토합니다 — 일하고도 못 받는 상황에 방치되지 않습니다.',
      },
      {
        icon: '🏅',
        title: '인증이 기회를 엽니다',
        desc: '플랫폼 인증은 고객이 채용을 결정하는 근거입니다. 인증 엔지니어만 배정될 수 있으므로, 당신이 통과한 그 평가가 곧 일감을 가져다줍니다.',
      },
      {
        icon: '🧰',
        title: '현장 도구 기본 제공',
        desc: 'GPS 체크인, QC 사진 납품, 9개 언어를 지원하는 다국어 AI 프로젝트 매니저 — 현장 도구는 플랫폼에 기본 포함이며 추가 요금 항목이 아닙니다.',
      },
    ],

    empTag: '고용주를 위한 안내',
    empTitle: '파운딩 고객은 5%',
    empFounding: '5%',
    empFoundingLabel: '파운딩 고객 에스크로 수수료 — 첫 5건의 주문',
    empStandard: '15%',
    empStandardLabel: '표준 에스크로 수수료',
    empUpfront: '등록과 매칭은 $0 — 엔지니어를 선정한 뒤에야 마일스톤에 대금을 예치합니다.',
    empFoundingNote:
      '5% 파운딩 요율은 PMF 론칭 기간 한정 혜택으로, 처음 계약하는 5개 고용주 기업에 제공됩니다. 수요 건별로 적용되므로 첫 5건의 주문 각각에 유효합니다.',

    escrowTitle: '마일스톤 에스크로는 이렇게 작동합니다',
    escrowSteps: [
      { n: '1', title: '예치', desc: 'Stripe Checkout으로 마일스톤 대금을 에스크로에 예치합니다. 결제가 확인된 후에야 예치 완료로 표시됩니다.' },
      { n: '2', title: '납품', desc: '엔지니어가 마일스톤을 납품합니다 — 현장 체크인과 완료 사진이 해당 마일스톤에 함께 기록됩니다.' },
      { n: '3', title: '승인', desc: '납품물을 검토합니다. 자금은 승인할 때에만 움직입니다 — 자동으로 지급되는 일은 없습니다.' },
      { n: '4', title: '지급', desc: '승인되면 에스크로에서 플랫폼 수수료를 공제한 금액이 엔지니어에게 지급됩니다. 이 수수료가 유일한 청구 항목입니다.' },
    ],

    riskTitle: '첫 마일스톤이 만족스럽지 않다면? 전액 환불.',
    riskSub:
      '에스크로 모델은 첫 주문에 선지급 리스크가 없도록 만들어졌습니다. 환불 절차는 제품 안에 내장되어 있습니다 — 페이지 하단의 문구 한 줄이 아닙니다.',
    riskPoints: [
      { title: '자금은 에스크로에 머뭅니다', desc: '예치한 돈은 안전하게 보관되며, 납품물을 승인하기 전에는 엔지니어에게 지급되지 않습니다.' },
      { title: '분쟁 중에는 아무것도 지급되지 않습니다', desc: '분쟁을 제기하면 해당 마일스톤이 동결됩니다. 검토 중에는 어떤 자금도 움직일 수 없습니다.' },
      { title: '원래 결제 카드로 환불', desc: '마일스톤이 고객에게 유리하게 판정되면, 에스크로 전액이 원래 결제 수단으로 환불됩니다 — 적립금 지급도, 사후 회수도 없습니다.' },
    ],

    faqTitle: '요금 관련 자주 묻는 질문',
    faqs: [
      {
        q: '플랫폼 수수료는 어떻게 계산되나요?',
        a: '지급 완료된 각 마일스톤에 대한 고정 비율입니다. 표준은 15%, 파운딩 고객은 첫 5건의 주문에 5%가 적용됩니다. 요율은 단일 백엔드 설정에서 읽어오므로, 화면에 보이는 수수료가 실제 부과되는 수수료 그대로이며 별도의 마진은 없습니다.',
      },
      {
        q: '수수료는 고용주와 엔지니어 중 누가 내나요?',
        a: '고용주가 마일스톤 전액을 에스크로에 예치합니다. 지급을 승인하면 그 금액에서 플랫폼 수수료가 공제되고 나머지를 엔지니어가 받습니다. 표준 주문에서 엔지니어의 몫은 85%이며, 고용주는 마일스톤 예치 외에 별도의 수수료를 내지 않습니다.',
      },
      {
        q: '5% 파운딩 요율은 어떻게 받을 수 있나요?',
        a: '5% 요율은 PMF 론칭 기간에 처음 계약하는 5개 고용주 기업에 한정되며, 첫 5건의 주문 각각에 적용됩니다. 프로젝트 단위로 설정되므로, 한 번 파운딩 고객이 되면 우대 요율이 주문을 따라갑니다.',
      },
      {
        q: '환불 절차는 어떻게 되나요?',
        a: '해당 마일스톤에 분쟁을 제기하세요. 양측은 5일 동안 증거를 제출할 수 있고, 이후 관리자가 검토합니다. 분쟁이 고용주에게 유리하게 판정되면 에스크로 전액이 원래 결제 수단으로 환불되고, 분할 판정이면 엔지니어에게 지급되지 않은 잔액이 환불됩니다.',
      },
      {
        q: '국경 간 결제는 어떻게 처리되나요?',
        a: '결제는 Stripe와 Stripe Connect를 통해 이루어집니다. 고용주는 체크아웃에서 카드로 결제하고, 엔지니어는 연결된 Stripe 계정으로 대금을 받습니다. 엔지니어의 국가에서 Stripe 출금이 아직 지원되지 않는 경우, 플랫폼이 오프라인 수동 지급으로 대신 처리합니다.',
      },
      {
        q: '영수증이나 인보이스를 받을 수 있나요?',
        a: '네. 모든 예치 결제는 Stripe Checkout을 거치며 카드 영수증이 이메일로 발송됩니다. 또한 예치·지급된 모든 마일스톤이 Finance 대시보드의 원장에 기록되어, 무엇이 예치되고 지급되었으며 얼마가 부과되었는지 전 과정을 확인할 수 있습니다.',
      },
    ],

    finalTitle: '마일스톤 하나로 시작하세요',
    finalSub: '프로젝트는 무료로 등록하고, 엔지니어를 선정한 뒤에만 예치하세요. 파운딩 고객 5%는 첫 5건의 주문에 적용됩니다.',
  },
};

module.exports = { DICT };
