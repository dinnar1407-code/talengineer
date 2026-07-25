// ── /trust 页语言字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/trust.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 页面侧原 const 名为 UI，导入时 `import { DICT as UI }` 对齐。
//
// 页内文案词典：Wave 0 只做 en / zh 两套（其余 7 语后续跟进）。
// 诚实纪律：每条信任声明都对应真实代码实体，不夸大、不编造成交统计。
// 数字来源：举证 5 天 (src/routes/disputes.js)、KYC 24h (src/routes/kyc.js)、
// 税表签名 URL 5 分钟 (src/routes/tax.js)、围栏默认 500m (src/utils/geo.js)。
const DICT = {
  en: {
    metaTitle: 'Trust Center — Escrow, Disputes & Verification | Talengineer',
    metaDesc:
      'How Talengineer protects both sides: milestone escrow that releases only on approval, a 5-day evidence dispute process with refunds to your original card, KYC and tax verification, and a GPS + QC-photo evidence chain for on-site work.',
    kicker: 'Trust Center',
    heroTitle: 'Trust is infrastructure, not a slogan.',
    heroSub:
      'Every claim on this page maps to something the platform actually does — escrow that holds your money until you approve, a dispute process with a fixed evidence window, verified identities, and an evidence trail for on-site delivery. Here is exactly how each works.',
    ctaPost: 'Post a Project — Free',

    // ── 托管资金流四步 ──────────────────────────────────────────────
    escrowTag: 'Escrow',
    escrowTitle: 'How your money is held',
    escrowLead:
      'Funds are held securely and released only when you approve each deliverable — a milestone is marked funded only after the payment actually clears, and it releases only on your approval.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Fund', desc: 'You fund a milestone through Stripe Checkout. It is marked funded only after Stripe confirms the payment — nothing is ever “held” on trust.' },
      { icon: '🔧', n: '2', title: 'Deliver', desc: 'The engineer works the milestone. On-site check-ins and completion photos are logged against it as it progresses.' },
      { icon: '✅', n: '3', title: 'Approve', desc: 'You review the deliverable. Funds move only when you approve — the platform never auto-releases on a timer.' },
      { icon: '🔓', n: '4', title: 'Release', desc: 'On approval, escrow releases to the engineer minus the platform fee, with a duplicate-transfer guard so a release can never fire twice.' },
    ],

    // ── 纠纷与退款流程 ──────────────────────────────────────────────
    disputeTag: 'Disputes & refunds',
    disputeTitle: 'What happens if something goes wrong',
    disputeLead:
      'If you are not satisfied, opening a dispute freezes the milestone before any money moves. Both sides submit evidence within a fixed window, an admin reviews it, and the outcome determines where the escrowed funds go — including a full refund to your original card.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Open', desc: 'Either party to the project can open a dispute on a funded milestone. Doing so immediately freezes it to “disputed” — no funds can move.' },
      { icon: '📎', n: '2', title: 'Evidence', desc: 'Both sides have a 5-day window to submit evidence. Each party’s side is recorded server-side from their role — it cannot be spoofed.' },
      { icon: '👤', n: '3', title: 'Admin review', desc: 'A platform admin reviews the milestone spec and both evidence submissions before any funds move.' },
      { icon: '↩️', n: '4', title: 'Resolution', desc: 'The admin rules for the engineer, for the employer, or a split. Rule for the employer and the full escrowed amount is refunded to the original card; a split refunds the balance not awarded.' },
    ],
    disputeNote:
      'Only one open dispute can exist per milestone, and a resolution is protected by an atomic guard so it can never double-pay or double-refund.',

    // ── 身份与合规核验 ─────────────────────────────────────────────
    verifyTag: 'Identity & compliance',
    verifyTitle: 'Who you are actually working with',
    verifyLead:
      'Payment protection only matters if the people on the other side are real and accountable. Identity, tax, and insurance documents are verified before they count — and sensitive files never sit behind a public URL.',
    verifyCards: [
      { icon: '🪪', title: 'Business KYC', meta: 'Reviewed within 24h', desc: 'Employers submit company details for verification. Status moves from pending to verified after our team reviews the submission — typically within 24 hours.' },
      { icon: '📄', title: 'W-9 tax documents', meta: '5-min signed access', desc: 'Tax forms are stored in a private bucket that denies all public access. Even an admin can only view a file through a signed link that expires after 5 minutes.' },
      { icon: '🛡️', title: 'Insurance & credentials', meta: 'Expiry tracked · admin-reviewed', desc: 'Certificates of insurance and platform credentials are uploaded with issue and expiry dates, then verified or rejected by an admin — self-reported claims do not count on their own.' },
    ],

    // ── 现场交付证据链 ─────────────────────────────────────────────
    fieldTag: 'On-site evidence chain',
    fieldTitle: 'Proof the work actually happened',
    fieldLead:
      'For on-site commissioning, the platform builds an evidence trail so a remote employer can trust a job done a continent away — location and delivery photos are captured against the milestone itself.',
    fieldCards: [
      { icon: '📍', title: 'GPS check-in', meta: 'Server-side geofence', desc: 'At check-in, the platform computes the distance from the job site on the server (clients cannot fake it) and records it against the milestone. Check-ins outside the geofence still succeed but are flagged for the employer to see.' },
      { icon: '🎓', title: 'Certified before check-in', meta: 'Gated at the door', desc: 'A valid platform certification is required before an engineer can check in on-site — a second gate on top of assignment, so a revoked badge stops work at the door.' },
      { icon: '📷', title: 'QC delivery photos', meta: 'Logged to the milestone', desc: 'On completion, the engineer submits photos and notes that attach to the milestone, giving the employer a visual record to approve against before any funds release.' },
    ],

    finalTitle: 'Protection you can see, on your first order',
    finalSub: 'Post a project for free. Fund one milestone into escrow and watch every safeguard on this page work before you approve.',

    // 诚实空态说明：我们尚无真实成交统计，因此用 founding cohort 叙事而非编造数字。
    cohortNote:
      'Talengineer is in its founding phase. We do not publish “companies served” counts we cannot yet stand behind — the protections above are what an early customer relies on, and they are live in the product today.',
  },

  zh: {
    metaTitle: '信任中心 — 托管、纠纷与核验 | Talengineer',
    metaDesc:
      'Talengineer 如何保护买卖双方：验收才放款的里程碑托管、5 天举证的纠纷流程（可原路退回你的卡）、KYC 与税务核验，以及现场作业的 GPS + 质检照片证据链。',
    kicker: '信任中心',
    heroTitle: '信任是基建，不是口号。',
    heroSub:
      '本页每一条声明都对应平台真实在做的事——验收前托管你的钱、有固定举证窗口的纠纷流程、经核验的身份，以及现场交付的证据链。下面逐条说明它们怎么运作。',
    ctaPost: '免费发布项目',

    escrowTag: '资金托管',
    escrowTitle: '你的钱是怎么被托管的',
    escrowLead:
      '资金被安全托管，只有你验收每项交付后才释放——里程碑只有在付款真正到账后才标记为已托管，且只在你批准时放款。',
    escrowSteps: [
      { icon: '💳', n: '1', title: '注资', desc: '你通过 Stripe Checkout 为里程碑注资。只有 Stripe 确认付款后才标记为已托管——绝不凭信任"假装"托管。' },
      { icon: '🔧', n: '2', title: '交付', desc: '工程师推进里程碑。现场签到与完工照片会随进度一并记录在该里程碑上。' },
      { icon: '✅', n: '3', title: '验收', desc: '你审阅交付物。资金只在你批准时流动——平台绝不按倒计时自动放款。' },
      { icon: '🔓', n: '4', title: '放款', desc: '验收通过后，托管扣除平台费放款给工程师，并有重复转账守卫，放款绝不会触发两次。' },
    ],

    disputeTag: '纠纷与退款',
    disputeTitle: '万一出问题会怎样',
    disputeLead:
      '若你不满意，开纠纷会在任何资金流动前先冻结里程碑。双方在固定窗口内提交证据，admin 复核，结果决定托管资金的去向——包括原路退回你的卡。',
    disputeSteps: [
      { icon: '🚩', n: '1', title: '开纠纷', desc: '项目任一当事方都可对已托管里程碑开纠纷。开纠纷会立即把它冻结为"争议中"——没有任何资金能流动。' },
      { icon: '📎', n: '2', title: '举证', desc: '双方有 5 天窗口提交证据。每一方属于哪一侧由服务端按其身份判定——无法伪造。' },
      { icon: '👤', n: '3', title: 'admin 复核', desc: '在任何资金流动前，平台 admin 会审阅里程碑规格与双方的证据。' },
      { icon: '↩️', n: '4', title: '裁决', desc: 'admin 判给工程师、判给雇主，或分账。判给雇主则托管全额原路退回原卡；分账则退回未判给对方的那部分。' },
    ],
    disputeNote:
      '每个里程碑同一时间只能有一个未决纠纷，且裁决由原子守卫保护，绝不会重复打款或重复退款。',

    verifyTag: '身份与合规',
    verifyTitle: '你到底在和谁合作',
    verifyLead:
      '只有当对面的人真实且可追责，付款保护才有意义。身份、税务与保险文件在生效前都会被核验——敏感文件也绝不裸挂在公开 URL 后面。',
    verifyCards: [
      { icon: '🪪', title: '企业 KYC', meta: '24 小时内复核', desc: '雇主提交公司信息核验。经我们团队复核后，状态由待审转为已验证——通常在 24 小时内。' },
      { icon: '📄', title: 'W-9 税务文件', meta: '5 分钟短时访问', desc: '税表存放在拒绝一切公开访问的私有桶里。即便是 admin，也只能通过 5 分钟即过期的签名链接查看文件。' },
      { icon: '🛡️', title: '保险与资质', meta: '追踪有效期 · admin 复核', desc: '保险凭证（COI）与平台资质带签发/到期日上传，再由 admin 核验通过或退回——自述声明本身不作数。' },
    ],

    fieldTag: '现场交付证据链',
    fieldTitle: '证明活儿真的干了',
    fieldLead:
      '对现场调试，平台会构建一条证据链，让隔着一个大洲的远程雇主也能信任现场完成的活——位置与交付照片都记录在里程碑本身上。',
    fieldCards: [
      { icon: '📍', title: 'GPS 签到', meta: '服务端地理围栏', desc: '签到时，平台在服务端计算距工地的距离（客户端无法造假）并记录在里程碑上。越出围栏的签到照常成功，但会被标记供雇主查看。' },
      { icon: '🎓', title: '签到前须持证', meta: '门口把关', desc: '工程师到场签到前必须持有效平台认证——这是指派之外的第二道门，证被吊销就当场拦在门口。' },
      { icon: '📷', title: '质检交付照片', meta: '记录到里程碑', desc: '完工时工程师提交照片与说明，附在里程碑上，让雇主在放款前有可视记录可据以验收。' },
    ],

    finalTitle: '第一单就能看得见的保护',
    finalSub: '免费发布项目。为一个里程碑注资入托管，在你验收前亲眼看本页每一道防护如何生效。',

    cohortNote:
      'Talengineer 处于 founding 起步阶段。我们不发布尚无法背书的"已服务 N 家企业"数字——上述保护才是早期客户真正依赖的东西，且它们今天已在产品里生效。',
  },

  es: {
    metaTitle: 'Centro de confianza — Depósito en garantía, disputas y verificación | Talengineer',
    metaDesc:
      'Cómo Talengineer protege a ambas partes: depósito en garantía por hitos que se libera solo con aprobación, un proceso de disputas con ventana de evidencias de 5 días y reembolsos a su tarjeta original, verificación de KYC e impuestos, y una cadena de evidencias con GPS y fotos de control de calidad para el trabajo en sitio.',
    kicker: 'Centro de confianza',
    heroTitle: 'La confianza es infraestructura, no un eslogan.',
    heroSub:
      'Cada afirmación de esta página corresponde a algo que la plataforma realmente hace — depósito en garantía que retiene su dinero hasta que usted aprueba, un proceso de disputas con una ventana de evidencias fija, identidades verificadas y un rastro de evidencias para la entrega en sitio. Aquí se explica exactamente cómo funciona cada cosa.',
    ctaPost: 'Publicar un proyecto — Gratis',

    escrowTag: 'Depósito en garantía',
    escrowTitle: 'Cómo se retiene su dinero',
    escrowLead:
      'Los fondos se retienen de forma segura y se liberan solo cuando usted aprueba cada entregable — un hito se marca como depositado solo después de que el pago se acredita realmente, y se libera solo con su aprobación.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Depositar', desc: 'Usted deposita un hito a través de Stripe Checkout. Se marca como depositado solo después de que Stripe confirma el pago — nunca se "retiene" por confianza.' },
      { icon: '🔧', n: '2', title: 'Entregar', desc: 'El ingeniero trabaja en el hito. Los check-ins en sitio y las fotos de finalización se registran contra él a medida que avanza.' },
      { icon: '✅', n: '3', title: 'Aprobar', desc: 'Usted revisa el entregable. Los fondos se mueven solo cuando usted aprueba — la plataforma nunca libera automáticamente por un temporizador.' },
      { icon: '🔓', n: '4', title: 'Liberar', desc: 'Con la aprobación, el depósito se libera al ingeniero menos la comisión de la plataforma, con una protección contra transferencias duplicadas para que una liberación nunca pueda dispararse dos veces.' },
    ],

    disputeTag: 'Disputas y reembolsos',
    disputeTitle: 'Qué pasa si algo sale mal',
    disputeLead:
      'Si no está satisfecho, abrir una disputa congela el hito antes de que se mueva cualquier dinero. Ambas partes presentan evidencias dentro de una ventana fija, un administrador la revisa, y el resultado determina hacia dónde van los fondos en garantía — incluido un reembolso total a su tarjeta original.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Abrir', desc: 'Cualquiera de las partes del proyecto puede abrir una disputa sobre un hito financiado. Hacerlo lo congela de inmediato como "en disputa" — ningún fondo puede moverse.' },
      { icon: '📎', n: '2', title: 'Evidencia', desc: 'Ambas partes tienen una ventana de 5 días para presentar evidencias. El lado de cada parte se registra en el servidor según su rol — no puede falsificarse.' },
      { icon: '👤', n: '3', title: 'Revisión del administrador', desc: 'Un administrador de la plataforma revisa la especificación del hito y las evidencias de ambas partes antes de que se mueva cualquier fondo.' },
      { icon: '↩️', n: '4', title: 'Resolución', desc: 'El administrador falla a favor del ingeniero, del empleador, o divide el monto. Si falla a favor del empleador, el monto total en garantía se reembolsa a la tarjeta original; una división reembolsa el saldo no adjudicado.' },
    ],
    disputeNote:
      'Solo puede existir una disputa abierta por hito, y una resolución está protegida por un guardián atómico para que nunca pueda pagar ni reembolsar dos veces.',

    verifyTag: 'Identidad y cumplimiento',
    verifyTitle: 'Con quién está trabajando realmente',
    verifyLead:
      'La protección del pago solo importa si las personas del otro lado son reales y responsables. Los documentos de identidad, impuestos y seguro se verifican antes de contar — y los archivos sensibles nunca se dejan tras una URL pública.',
    verifyCards: [
      { icon: '🪪', title: 'KYC de empresa', meta: 'Revisado en 24h', desc: 'Los empleadores envían los datos de la empresa para verificación. El estado pasa de pendiente a verificado después de que nuestro equipo revisa la solicitud — normalmente en 24 horas.' },
      { icon: '📄', title: 'Documentos fiscales W-9', meta: 'Acceso firmado de 5 min', desc: 'Los formularios fiscales se almacenan en un bucket privado que niega todo acceso público. Incluso un administrador solo puede ver un archivo mediante un enlace firmado que expira a los 5 minutos.' },
      { icon: '🛡️', title: 'Seguro y credenciales', meta: 'Vencimiento monitoreado · revisado por admin', desc: 'Los certificados de seguro y las credenciales de la plataforma se cargan con fechas de emisión y vencimiento, y luego un administrador los verifica o los rechaza — las declaraciones autodeclaradas no cuentan por sí solas.' },
    ],

    fieldTag: 'Cadena de evidencias en sitio',
    fieldTitle: 'Prueba de que el trabajo realmente ocurrió',
    fieldLead:
      'Para la puesta en marcha en sitio, la plataforma construye un rastro de evidencias para que un empleador remoto pueda confiar en un trabajo hecho a un continente de distancia — la ubicación y las fotos de entrega se capturan contra el propio hito.',
    fieldCards: [
      { icon: '📍', title: 'Check-in por GPS', meta: 'Geocerca del lado del servidor', desc: 'Al hacer check-in, la plataforma calcula la distancia al sitio de trabajo en el servidor (los clientes no pueden falsearla) y la registra contra el hito. Los check-ins fuera de la geocerca aún tienen éxito, pero se marcan para que el empleador los vea.' },
      { icon: '🎓', title: 'Certificado antes del check-in', meta: 'Con control en la puerta', desc: 'Se requiere una certificación de plataforma válida antes de que un ingeniero pueda hacer check-in en sitio — una segunda barrera además de la asignación, así que una credencial revocada detiene el trabajo en la puerta.' },
      { icon: '📷', title: 'Fotos de entrega de control de calidad', meta: 'Registradas al hito', desc: 'Al completar, el ingeniero envía fotos y notas que se adjuntan al hito, dándole al empleador un registro visual para aprobar antes de que se liberen los fondos.' },
    ],

    finalTitle: 'Protección que puede ver, desde su primer pedido',
    finalSub: 'Publique un proyecto de forma gratuita. Deposite un hito en garantía y observe cada salvaguarda de esta página funcionar antes de que usted apruebe.',

    cohortNote:
      'Talengineer está en su fase fundadora. No publicamos cifras de "empresas atendidas" que aún no podemos respaldar — las protecciones anteriores son en las que confía un cliente temprano, y están activas en el producto hoy mismo.',
  },

  vi: {
    metaTitle: 'Trung tâm tin cậy — Ký quỹ, tranh chấp và xác minh | Talengineer',
    metaDesc:
      'Cách Talengineer bảo vệ cả hai bên: ký quỹ theo cột mốc chỉ giải ngân khi được nghiệm thu, quy trình tranh chấp với thời hạn nộp bằng chứng 5 ngày và hoàn tiền về thẻ gốc của bạn, xác minh KYC và thuế, cùng chuỗi bằng chứng GPS + ảnh kiểm tra chất lượng cho công việc hiện trường.',
    kicker: 'Trung tâm tin cậy',
    heroTitle: 'Sự tin cậy là hạ tầng, không phải khẩu hiệu.',
    heroSub:
      'Mỗi tuyên bố trên trang này tương ứng với điều mà nền tảng thực sự làm — ký quỹ giữ tiền của bạn cho đến khi bạn nghiệm thu, quy trình tranh chấp với thời hạn nộp bằng chứng cố định, danh tính đã xác minh, và dấu vết bằng chứng cho việc bàn giao tại hiện trường. Đây là cách chính xác mỗi phần hoạt động.',
    ctaPost: 'Đăng dự án — Miễn phí',

    escrowTag: 'Ký quỹ',
    escrowTitle: 'Tiền của bạn được giữ như thế nào',
    escrowLead:
      'Tiền được giữ an toàn và chỉ giải ngân khi bạn nghiệm thu từng sản phẩm bàn giao — một cột mốc chỉ được đánh dấu đã nạp sau khi thanh toán thực sự được xác nhận, và chỉ giải ngân khi bạn phê duyệt.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Nạp tiền', desc: 'Bạn nạp tiền cột mốc qua Stripe Checkout. Nó chỉ được đánh dấu đã nạp sau khi Stripe xác nhận thanh toán — không bao giờ được "giữ" dựa trên niềm tin.' },
      { icon: '🔧', n: '2', title: 'Bàn giao', desc: 'Kỹ sư thực hiện cột mốc. Các lượt check-in tại hiện trường và ảnh hoàn công được ghi nhận vào cột mốc khi tiến độ diễn ra.' },
      { icon: '✅', n: '3', title: 'Nghiệm thu', desc: 'Bạn xem xét sản phẩm bàn giao. Tiền chỉ được chuyển khi bạn phê duyệt — nền tảng không bao giờ tự động giải ngân theo bộ đếm thời gian.' },
      { icon: '🔓', n: '4', title: 'Giải ngân', desc: 'Khi được phê duyệt, tiền ký quỹ được giải ngân cho kỹ sư sau khi trừ phí nền tảng, với cơ chế chống chuyển tiền trùng lặp để việc giải ngân không bao giờ có thể kích hoạt hai lần.' },
    ],

    disputeTag: 'Tranh chấp & hoàn tiền',
    disputeTitle: 'Điều gì xảy ra nếu có sự cố',
    disputeLead:
      'Nếu bạn không hài lòng, mở tranh chấp sẽ đóng băng cột mốc trước khi bất kỳ khoản tiền nào di chuyển. Hai bên nộp bằng chứng trong một thời hạn cố định, quản trị viên xem xét, và kết quả quyết định số tiền ký quỹ sẽ đi đâu — bao gồm cả việc hoàn tiền toàn bộ về thẻ gốc của bạn.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Mở tranh chấp', desc: 'Bất kỳ bên nào của dự án đều có thể mở tranh chấp trên một cột mốc đã nạp tiền. Việc này ngay lập tức đóng băng nó thành "đang tranh chấp" — không khoản tiền nào có thể di chuyển.' },
      { icon: '📎', n: '2', title: 'Bằng chứng', desc: 'Cả hai bên có thời hạn 5 ngày để nộp bằng chứng. Bên của mỗi bên được ghi nhận phía máy chủ dựa trên vai trò của họ — không thể giả mạo.' },
      { icon: '👤', n: '3', title: 'Quản trị viên xem xét', desc: 'Một quản trị viên nền tảng xem xét thông số kỹ thuật của cột mốc và bằng chứng của cả hai bên trước khi bất kỳ khoản tiền nào di chuyển.' },
      { icon: '↩️', n: '4', title: 'Phán quyết', desc: 'Quản trị viên phán quyết cho kỹ sư, cho nhà tuyển dụng, hoặc chia đôi. Phán quyết cho nhà tuyển dụng thì toàn bộ số tiền ký quỹ được hoàn về thẻ gốc; phán quyết chia thì hoàn lại phần không trao cho kỹ sư.' },
    ],
    disputeNote:
      'Mỗi cột mốc chỉ có thể tồn tại một tranh chấp đang mở, và một phán quyết được bảo vệ bởi cơ chế nguyên tử để không bao giờ có thể trả tiền hai lần hoặc hoàn tiền hai lần.',

    verifyTag: 'Danh tính & tuân thủ',
    verifyTitle: 'Bạn thực sự đang làm việc với ai',
    verifyLead:
      'Bảo vệ thanh toán chỉ có ý nghĩa khi người ở phía bên kia là có thật và có trách nhiệm giải trình. Giấy tờ danh tính, thuế và bảo hiểm được xác minh trước khi được tính — và các tệp nhạy cảm không bao giờ nằm sau một URL công khai.',
    verifyCards: [
      { icon: '🪪', title: 'KYC doanh nghiệp', meta: 'Xem xét trong 24 giờ', desc: 'Nhà tuyển dụng gửi thông tin công ty để xác minh. Trạng thái chuyển từ chờ xử lý sang đã xác minh sau khi đội ngũ của chúng tôi xem xét — thường trong vòng 24 giờ.' },
      { icon: '📄', title: 'Tài liệu thuế W-9', meta: 'Truy cập có chữ ký trong 5 phút', desc: 'Biểu mẫu thuế được lưu trữ trong một bucket riêng tư từ chối mọi truy cập công khai. Ngay cả quản trị viên cũng chỉ có thể xem tệp qua một liên kết có chữ ký hết hạn sau 5 phút.' },
      { icon: '🛡️', title: 'Bảo hiểm & chứng chỉ', meta: 'Theo dõi hạn dùng · quản trị viên xem xét', desc: 'Giấy chứng nhận bảo hiểm và chứng chỉ nền tảng được tải lên kèm ngày cấp và ngày hết hạn, sau đó được quản trị viên xác minh hoặc từ chối — tự khai báo không tự nó được tính.' },
    ],

    fieldTag: 'Chuỗi bằng chứng tại hiện trường',
    fieldTitle: 'Bằng chứng công việc thực sự đã diễn ra',
    fieldLead:
      'Đối với việc chạy thử tại hiện trường, nền tảng xây dựng một dấu vết bằng chứng để nhà tuyển dụng từ xa có thể tin tưởng công việc được thực hiện cách xa cả một lục địa — vị trí và ảnh bàn giao được ghi lại gắn với chính cột mốc đó.',
    fieldCards: [
      { icon: '📍', title: 'Check-in bằng GPS', meta: 'Hàng rào địa lý phía máy chủ', desc: 'Khi check-in, nền tảng tính khoảng cách đến địa điểm làm việc trên máy chủ (khách hàng không thể giả mạo) và ghi nhận vào cột mốc. Các lượt check-in ngoài hàng rào địa lý vẫn thành công nhưng được gắn cờ để nhà tuyển dụng xem.' },
      { icon: '🎓', title: 'Có chứng chỉ trước khi check-in', meta: 'Kiểm soát tại cửa', desc: 'Cần có chứng chỉ nền tảng còn hiệu lực trước khi kỹ sư có thể check-in tại hiện trường — một lớp kiểm soát thứ hai bên cạnh việc phân công, nên một huy hiệu bị thu hồi sẽ chặn công việc ngay tại cửa.' },
      { icon: '📷', title: 'Ảnh bàn giao kiểm tra chất lượng', meta: 'Ghi vào cột mốc', desc: 'Khi hoàn thành, kỹ sư gửi ảnh và ghi chú đính kèm vào cột mốc, cho nhà tuyển dụng một bản ghi trực quan để nghiệm thu trước khi giải ngân bất kỳ khoản tiền nào.' },
    ],

    finalTitle: 'Sự bảo vệ bạn có thể nhìn thấy, ngay từ đơn hàng đầu tiên',
    finalSub: 'Đăng dự án miễn phí. Nạp tiền một cột mốc vào ký quỹ và xem từng biện pháp bảo vệ trên trang này hoạt động trước khi bạn nghiệm thu.',

    cohortNote:
      'Talengineer đang ở giai đoạn sáng lập. Chúng tôi không công bố số liệu "đã phục vụ N công ty" mà chúng tôi chưa thể đảm bảo — những biện pháp bảo vệ ở trên là những gì một khách hàng sớm dựa vào, và chúng đang hoạt động thực tế trong sản phẩm ngay hôm nay.',
  },

  hi: {
    metaTitle: 'ट्रस्ट सेंटर — एस्क्रो, विवाद और सत्यापन | Talengineer',
    metaDesc:
      'Talengineer दोनों पक्षों की सुरक्षा कैसे करता है: माइलस्टोन एस्क्रो जो केवल स्वीकृति पर रिलीज़ होता है, 5 दिन की साक्ष्य विंडो वाली विवाद प्रक्रिया जिसमें आपके मूल कार्ड पर रिफ़ंड मिलता है, KYC और टैक्स सत्यापन, और ऑन-साइट काम के लिए GPS + QC-फ़ोटो साक्ष्य श्रृंखला।',
    kicker: 'ट्रस्ट सेंटर',
    heroTitle: 'भरोसा एक इन्फ्रास्ट्रक्चर है, नारा नहीं।',
    heroSub:
      'इस पेज पर हर दावा उस चीज़ से जुड़ा है जो प्लेटफ़ॉर्म वास्तव में करता है — एस्क्रो जो आपके पैसे को तब तक रोके रखता है जब तक आप स्वीकृति न दें, तय साक्ष्य विंडो वाली विवाद प्रक्रिया, सत्यापित पहचान, और ऑन-साइट डिलीवरी के लिए साक्ष्य ट्रेल। यहाँ बताया गया है कि हर एक चीज़ कैसे काम करती है।',
    ctaPost: 'प्रोजेक्ट पोस्ट करें — निःशुल्क',

    escrowTag: 'एस्क्रो',
    escrowTitle: 'आपका पैसा कैसे रखा जाता है',
    escrowLead:
      'राशि सुरक्षित रूप से रखी जाती है और तभी रिलीज़ होती है जब आप हर डिलीवरेबल को स्वीकृत करते हैं — कोई माइलस्टोन तभी जमा चिह्नित होता है जब भुगतान वास्तव में क्लियर हो जाता है, और यह तभी रिलीज़ होता है जब आप स्वीकृति देते हैं।',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'जमा करें', desc: 'आप Stripe Checkout के ज़रिए माइलस्टोन में राशि जमा करते हैं। यह तभी जमा चिह्नित होता है जब Stripe भुगतान की पुष्टि करता है — भरोसे के आधार पर कभी "रखा" नहीं जाता।' },
      { icon: '🔧', n: '2', title: 'डिलीवर करें', desc: 'इंजीनियर माइलस्टोन पर काम करता है। ऑन-साइट चेक-इन और कार्य पूर्णता की फ़ोटो प्रगति के साथ उसी के खिलाफ दर्ज होती हैं।' },
      { icon: '✅', n: '3', title: 'स्वीकृति दें', desc: 'आप डिलीवरेबल की समीक्षा करते हैं। राशि तभी आगे बढ़ती है जब आप स्वीकृति देते हैं — प्लेटफ़ॉर्म कभी टाइमर पर खुद-ब-खुद रिलीज़ नहीं करता।' },
      { icon: '🔓', n: '4', title: 'रिलीज़ करें', desc: 'स्वीकृति मिलने पर, एस्क्रो प्लेटफ़ॉर्म शुल्क घटाकर इंजीनियर को रिलीज़ होता है, साथ ही एक डुप्लिकेट-ट्रांसफ़र गार्ड होता है ताकि रिलीज़ कभी दो बार न हो सके।' },
    ],

    disputeTag: 'विवाद व रिफ़ंड',
    disputeTitle: 'कुछ गड़बड़ होने पर क्या होता है',
    disputeLead:
      'अगर आप संतुष्ट नहीं हैं, तो विवाद खोलना किसी भी राशि के हिलने से पहले माइलस्टोन को फ़्रीज़ कर देता है। दोनों पक्ष एक तय विंडो के भीतर साक्ष्य जमा करते हैं, एक admin उसकी समीक्षा करता है, और परिणाम तय करता है कि एस्क्रो में रखी राशि कहाँ जाएगी — जिसमें आपके मूल कार्ड पर पूरा रिफ़ंड भी शामिल है।',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'विवाद खोलें', desc: 'प्रोजेक्ट का कोई भी पक्ष किसी जमा किए गए माइलस्टोन पर विवाद खोल सकता है। ऐसा करते ही वह तुरंत "विवादित" में फ़्रीज़ हो जाता है — कोई राशि हिल नहीं सकती।' },
      { icon: '📎', n: '2', title: 'साक्ष्य', desc: 'दोनों पक्षों के पास साक्ष्य जमा करने के लिए 5 दिन की विंडो होती है। हर पक्ष का साइड सर्वर पर उनकी भूमिका के आधार पर दर्ज होता है — इसे जाली नहीं बनाया जा सकता।' },
      { icon: '👤', n: '3', title: 'Admin समीक्षा', desc: 'कोई भी राशि हिलने से पहले, प्लेटफ़ॉर्म का एक admin माइलस्टोन की स्पेक और दोनों पक्षों के साक्ष्य की समीक्षा करता है।' },
      { icon: '↩️', n: '4', title: 'समाधान', desc: 'Admin इंजीनियर के पक्ष में, नियोक्ता के पक्ष में, या बँटवारे में फ़ैसला देता है। नियोक्ता के पक्ष में फ़ैसला होने पर एस्क्रो की पूरी राशि मूल कार्ड पर लौटाई जाती है; बँटवारे में वह हिस्सा लौटाया जाता है जो इंजीनियर को नहीं दिया गया।' },
    ],
    disputeNote:
      'हर माइलस्टोन पर एक समय में केवल एक ही खुला विवाद हो सकता है, और समाधान एक एटॉमिक गार्ड से सुरक्षित रहता है ताकि कभी दोहरा भुगतान या दोहरा रिफ़ंड न हो।',

    verifyTag: 'पहचान व अनुपालन',
    verifyTitle: 'आप असल में किसके साथ काम कर रहे हैं',
    verifyLead:
      'भुगतान सुरक्षा तभी मायने रखती है जब दूसरी तरफ़ के लोग असली और जवाबदेह हों। पहचान, टैक्स और बीमा दस्तावेज़ गिनती में आने से पहले सत्यापित किए जाते हैं — और संवेदनशील फ़ाइलें कभी किसी सार्वजनिक URL के पीछे नहीं रहतीं।',
    verifyCards: [
      { icon: '🪪', title: 'बिज़नेस KYC', meta: '24 घंटे में समीक्षा', desc: 'नियोक्ता सत्यापन के लिए कंपनी की जानकारी जमा करते हैं। हमारी टीम द्वारा सबमिशन की समीक्षा करने के बाद स्थिति pending से verified में बदलती है — आमतौर पर 24 घंटे के भीतर।' },
      { icon: '📄', title: 'W-9 टैक्स दस्तावेज़', meta: '5-मिनट का साइन्ड एक्सेस', desc: 'टैक्स फ़ॉर्म एक प्राइवेट बकेट में रखे जाते हैं जो हर सार्वजनिक एक्सेस को अस्वीकार करता है। यहाँ तक कि एक admin भी किसी फ़ाइल को केवल एक साइन्ड लिंक के ज़रिए देख सकता है जो 5 मिनट बाद एक्सपायर हो जाता है।' },
      { icon: '🛡️', title: 'बीमा व क्रेडेंशियल', meta: 'एक्सपायरी ट्रैक की जाती है · admin-समीक्षित', desc: 'बीमा प्रमाणपत्र और प्लेटफ़ॉर्म क्रेडेंशियल जारी होने व एक्सपायरी तारीखों के साथ अपलोड होते हैं, फिर एक admin द्वारा सत्यापित या अस्वीकार किए जाते हैं — खुद बताए गए दावे अकेले कुछ नहीं गिनते।' },
    ],

    fieldTag: 'ऑन-साइट साक्ष्य श्रृंखला',
    fieldTitle: 'सबूत कि काम असल में हुआ',
    fieldLead:
      'ऑन-साइट कमीशनिंग के लिए, प्लेटफ़ॉर्म एक साक्ष्य ट्रेल बनाता है ताकि एक दूर बैठा नियोक्ता एक महाद्वीप दूर हुए काम पर भरोसा कर सके — लोकेशन और डिलीवरी फ़ोटो खुद माइलस्टोन के खिलाफ़ कैप्चर होते हैं।',
    fieldCards: [
      { icon: '📍', title: 'GPS चेक-इन', meta: 'सर्वर-साइड जियोफ़ेंस', desc: 'चेक-इन के समय, प्लेटफ़ॉर्म सर्वर पर जॉब साइट से दूरी की गणना करता है (क्लाइंट इसे फ़र्ज़ी नहीं बना सकते) और उसे माइलस्टोन पर दर्ज करता है। जियोफ़ेंस के बाहर के चेक-इन तब भी सफल होते हैं लेकिन नियोक्ता को दिखाने के लिए फ़्लैग किए जाते हैं।' },
      { icon: '🎓', title: 'चेक-इन से पहले प्रमाणित', meta: 'दरवाज़े पर गेट किया गया', desc: 'ऑन-साइट चेक-इन करने से पहले इंजीनियर के पास एक वैध प्लेटफ़ॉर्म प्रमाणन होना ज़रूरी है — असाइनमेंट के ऊपर एक दूसरा गेट, इसलिए एक रद्द किया गया बैज दरवाज़े पर ही काम रोक देता है।' },
      { icon: '📷', title: 'QC डिलीवरी फ़ोटो', meta: 'माइलस्टोन में लॉग की गई', desc: 'पूरा होने पर, इंजीनियर फ़ोटो व नोट्स सबमिट करता है जो माइलस्टोन से जुड़ जाते हैं, जिससे नियोक्ता को किसी भी राशि के रिलीज़ होने से पहले स्वीकृति देने के लिए एक विज़ुअल रिकॉर्ड मिलता है।' },
    ],

    finalTitle: 'ऐसी सुरक्षा जो आप अपने पहले ऑर्डर पर देख सकते हैं',
    finalSub: 'प्रोजेक्ट मुफ़्त में पोस्ट करें। किसी माइलस्टोन में राशि एस्क्रो में जमा करें और स्वीकृति देने से पहले इस पेज की हर सुरक्षा को काम करते देखें।',

    cohortNote:
      'Talengineer अपने founding चरण में है। हम "N कंपनियों को सेवा दी" जैसे आँकड़े प्रकाशित नहीं करते जिनके पीछे हम अभी खड़े नहीं हो सकते — ऊपर बताई गई सुरक्षाएँ वही हैं जिन पर एक शुरुआती ग्राहक भरोसा करता है, और वे आज प्रोडक्ट में लाइव हैं।',
  },

  fr: {
    metaTitle: 'Centre de confiance — Séquestre, litiges et vérification | Talengineer',
    metaDesc:
      'Comment Talengineer protège les deux parties : un séquestre par jalons qui ne se libère qu’après approbation, un processus de litige avec une fenêtre de preuves de 5 jours et des remboursements sur votre carte d’origine, une vérification KYC et fiscale, et une chaîne de preuves GPS + photos de contrôle qualité pour le travail sur site.',
    kicker: 'Centre de confiance',
    heroTitle: 'La confiance est une infrastructure, pas un slogan.',
    heroSub:
      'Chaque affirmation de cette page correspond à quelque chose que la plateforme fait réellement — un séquestre qui retient votre argent jusqu’à votre validation, un processus de litige avec une fenêtre de preuves fixe, des identités vérifiées et une piste de preuves pour la livraison sur site. Voici exactement comment chacun de ces éléments fonctionne.',
    ctaPost: 'Publier un projet — Gratuit',

    escrowTag: 'Séquestre',
    escrowTitle: 'Comment votre argent est retenu',
    escrowLead:
      'Les fonds sont conservés en toute sécurité et ne sont libérés que lorsque vous validez chaque livrable — un jalon n’est marqué comme provisionné qu’une fois le paiement réellement encaissé, et il n’est débloqué que sur votre validation.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Provisionner', desc: 'Vous provisionnez un jalon via Stripe Checkout. Il n’est marqué comme provisionné qu’une fois le paiement confirmé par Stripe — jamais « retenu » sur la base de la confiance.' },
      { icon: '🔧', n: '2', title: 'Livrer', desc: 'L’ingénieur travaille sur le jalon. Les pointages sur site et les photos de fin de travaux y sont consignés au fil de l’avancement.' },
      { icon: '✅', n: '3', title: 'Valider', desc: 'Vous examinez le livrable. Les fonds ne bougent que lorsque vous validez — la plateforme ne débloque jamais les fonds automatiquement au bout d’un délai.' },
      { icon: '🔓', n: '4', title: 'Débloquer', desc: 'À la validation, le séquestre est débloqué au profit de l’ingénieur, déduction faite des frais de plateforme, avec une protection contre les transferts en double afin qu’un déblocage ne puisse jamais se déclencher deux fois.' },
    ],

    disputeTag: 'Litiges et remboursements',
    disputeTitle: 'Ce qui se passe en cas de problème',
    disputeLead:
      'Si vous n’êtes pas satisfait, l’ouverture d’un litige gèle le jalon avant tout mouvement de fonds. Les deux parties soumettent leurs preuves dans une fenêtre fixe, un administrateur les examine, et l’issue détermine où vont les fonds sous séquestre — y compris un remboursement intégral sur votre carte d’origine.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Ouvrir', desc: 'Chaque partie au projet peut ouvrir un litige sur un jalon provisionné. Cela le gèle immédiatement en statut « en litige » — aucun fonds ne peut bouger.' },
      { icon: '📎', n: '2', title: 'Preuves', desc: 'Les deux parties disposent d’une fenêtre de 5 jours pour soumettre leurs preuves. Le camp de chaque partie est enregistré côté serveur d’après son rôle — il ne peut pas être falsifié.' },
      { icon: '👤', n: '3', title: 'Examen par l’administrateur', desc: 'Un administrateur de la plateforme examine les spécifications du jalon et les preuves des deux parties avant tout mouvement de fonds.' },
      { icon: '↩️', n: '4', title: 'Résolution', desc: 'L’administrateur tranche en faveur de l’ingénieur, en faveur de l’employeur, ou décide d’un partage. S’il tranche en faveur de l’employeur, le montant intégral sous séquestre est remboursé sur la carte d’origine ; en cas de partage, le solde non attribué est remboursé.' },
    ],
    disputeNote:
      'Un seul litige ouvert peut exister par jalon, et une résolution est protégée par un verrou atomique afin qu’elle ne puisse jamais donner lieu à un double paiement ou à un double remboursement.',

    verifyTag: 'Identité et conformité',
    verifyTitle: 'Avec qui vous travaillez réellement',
    verifyLead:
      'La protection des paiements n’a de sens que si les personnes en face sont réelles et responsables. Les documents d’identité, fiscaux et d’assurance sont vérifiés avant d’être pris en compte — et les fichiers sensibles ne se trouvent jamais derrière une URL publique.',
    verifyCards: [
      { icon: '🪪', title: 'KYC entreprise', meta: 'Examiné sous 24h', desc: 'Les employeurs soumettent les informations de leur entreprise pour vérification. Le statut passe de « en attente » à « vérifié » une fois que notre équipe a examiné la soumission — généralement sous 24 heures.' },
      { icon: '📄', title: 'Documents fiscaux W-9', meta: 'Accès signé de 5 min', desc: 'Les formulaires fiscaux sont stockés dans un espace privé qui refuse tout accès public. Même un administrateur ne peut consulter un fichier que via un lien signé qui expire au bout de 5 minutes.' },
      { icon: '🛡️', title: 'Assurance et qualifications', meta: 'Échéance suivie · examiné par un admin', desc: 'Les attestations d’assurance et les qualifications de plateforme sont téléversées avec dates d’émission et d’expiration, puis vérifiées ou rejetées par un administrateur — les déclarations sur l’honneur ne comptent pas à elles seules.' },
    ],

    fieldTag: 'Chaîne de preuves sur site',
    fieldTitle: 'La preuve que le travail a réellement eu lieu',
    fieldLead:
      'Pour la mise en service sur site, la plateforme construit une piste de preuves afin qu’un employeur à distance puisse faire confiance à un travail réalisé sur un autre continent — la localisation et les photos de livraison sont rattachées directement au jalon.',
    fieldCards: [
      { icon: '📍', title: 'Pointage GPS', meta: 'Géorepérage côté serveur', desc: 'Au pointage, la plateforme calcule la distance au site de travail côté serveur (les clients ne peuvent pas la falsifier) et l’enregistre sur le jalon. Les pointages hors géorepérage réussissent quand même mais sont signalés pour que l’employeur les voie.' },
      { icon: '🎓', title: 'Certifié avant le pointage', meta: 'Contrôlé à la porte', desc: 'Une certification de plateforme valide est requise avant qu’un ingénieur puisse pointer sur site — une seconde barrière en plus de l’affectation, de sorte qu’un badge révoqué arrête le travail à la porte.' },
      { icon: '📷', title: 'Photos de contrôle qualité à la livraison', meta: 'Consignées au jalon', desc: 'À l’achèvement, l’ingénieur soumet des photos et des notes qui sont rattachées au jalon, ce qui donne à l’employeur une trace visuelle sur laquelle fonder sa validation avant tout déblocage de fonds.' },
    ],

    finalTitle: 'Une protection visible dès votre première commande',
    finalSub: 'Publiez un projet gratuitement. Provisionnez un jalon sous séquestre et observez chaque garantie de cette page fonctionner avant votre validation.',

    cohortNote:
      'Talengineer est dans sa phase de démarrage. Nous ne publions pas de chiffres d’« entreprises servies » que nous ne pouvons pas encore garantir — les protections ci-dessus sont ce sur quoi un client de la première heure s’appuie, et elles sont opérationnelles dans le produit dès aujourd’hui.',
  },

  de: {
    metaTitle: 'Vertrauenszentrum — Treuhand, Streitfälle & Verifizierung | Talengineer',
    metaDesc:
      'Wie Talengineer beide Seiten schützt: Meilenstein-Treuhand, die erst bei Freigabe freigegeben wird, ein Streitfallverfahren mit 5-tägiger Beweisfrist und Rückerstattung auf Ihre ursprüngliche Karte, KYC- und Steuerverifizierung sowie eine GPS- und QC-Foto-Beweiskette für Vor-Ort-Arbeiten.',
    kicker: 'Vertrauenszentrum',
    heroTitle: 'Vertrauen ist Infrastruktur, kein Slogan.',
    heroSub:
      'Jede Aussage auf dieser Seite entspricht etwas, das die Plattform tatsächlich tut — Treuhand, die Ihr Geld hält, bis Sie freigeben, ein Streitfallverfahren mit fester Beweisfrist, verifizierte Identitäten und eine Beweiskette für die Vor-Ort-Lieferung. Hier erfahren Sie genau, wie jedes davon funktioniert.',
    ctaPost: 'Projekt ausschreiben — kostenlos',

    escrowTag: 'Treuhand',
    escrowTitle: 'Wie Ihr Geld gehalten wird',
    escrowLead:
      'Gelder werden sicher gehalten und erst freigegeben, wenn Sie jede Leistung abnehmen — ein Meilenstein wird erst als finanziert markiert, nachdem die Zahlung tatsächlich eingegangen ist, und wird erst mit Ihrer Freigabe ausgezahlt.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Finanzieren', desc: 'Sie finanzieren einen Meilenstein über Stripe Checkout. Er wird erst als finanziert markiert, nachdem Stripe die Zahlung bestätigt hat — nie einfach auf Vertrauensbasis „gehalten“.' },
      { icon: '🔧', n: '2', title: 'Liefern', desc: 'Der Ingenieur arbeitet den Meilenstein ab. Vor-Ort-Check-ins und Fertigstellungsfotos werden im Verlauf gegen ihn erfasst.' },
      { icon: '✅', n: '3', title: 'Abnehmen', desc: 'Sie prüfen die Leistung. Gelder bewegen sich nur, wenn Sie freigeben — die Plattform gibt niemals automatisch nach einem Timer frei.' },
      { icon: '🔓', n: '4', title: 'Freigeben', desc: 'Nach der Freigabe wird die Treuhand abzüglich der Plattformgebühr an den Ingenieur ausgezahlt, mit einer Schutzfunktion gegen doppelte Überweisungen, sodass eine Freigabe nie zweimal auslösen kann.' },
    ],

    disputeTag: 'Streitfälle & Rückerstattungen',
    disputeTitle: 'Was passiert, wenn etwas schiefgeht',
    disputeLead:
      'Wenn Sie nicht zufrieden sind, friert das Eröffnen eines Streitfalls den Meilenstein ein, bevor sich Geld bewegt. Beide Seiten reichen innerhalb einer festen Frist Nachweise ein, ein Administrator prüft diese, und das Ergebnis entscheidet, wohin die Treuhandmittel gehen — einschließlich einer vollständigen Rückerstattung auf Ihre ursprüngliche Karte.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Eröffnen', desc: 'Jede Projektpartei kann einen Streitfall zu einem finanzierten Meilenstein eröffnen. Dies friert ihn sofort auf „im Streitfall“ ein — es kann kein Geld bewegt werden.' },
      { icon: '📎', n: '2', title: 'Beweise', desc: 'Beide Seiten haben ein 5-tägiges Zeitfenster, um Nachweise einzureichen. Die Zugehörigkeit jeder Partei wird serverseitig anhand ihrer Rolle erfasst — sie kann nicht gefälscht werden.' },
      { icon: '👤', n: '3', title: 'Admin-Prüfung', desc: 'Ein Plattform-Administrator prüft die Meilenstein-Spezifikation und die Nachweise beider Seiten, bevor sich irgendwelche Gelder bewegen.' },
      { icon: '↩️', n: '4', title: 'Entscheidung', desc: 'Der Administrator entscheidet für den Ingenieur, für den Auftraggeber oder teilt auf. Bei einer Entscheidung für den Auftraggeber wird der volle Treuhandbetrag auf die ursprüngliche Karte zurückerstattet; eine Teilung erstattet den nicht zugesprochenen Restbetrag.' },
    ],
    disputeNote:
      'Pro Meilenstein kann nur ein offener Streitfall existieren, und eine Entscheidung ist durch eine atomare Schutzfunktion abgesichert, sodass sie nie doppelt auszahlen oder doppelt erstatten kann.',

    verifyTag: 'Identität & Compliance',
    verifyTitle: 'Mit wem Sie tatsächlich zusammenarbeiten',
    verifyLead:
      'Zahlungsschutz ist nur relevant, wenn die Personen auf der anderen Seite real und rechenschaftspflichtig sind. Identitäts-, Steuer- und Versicherungsdokumente werden verifiziert, bevor sie zählen — und sensible Dateien liegen nie hinter einer öffentlichen URL.',
    verifyCards: [
      { icon: '🪪', title: 'Unternehmens-KYC', meta: 'Prüfung innerhalb von 24h', desc: 'Auftraggeber reichen Unternehmensdaten zur Verifizierung ein. Der Status wechselt von ausstehend zu verifiziert, nachdem unser Team die Einreichung geprüft hat — in der Regel innerhalb von 24 Stunden.' },
      { icon: '📄', title: 'W-9-Steuerdokumente', meta: '5-Minuten-signierter Zugriff', desc: 'Steuerformulare werden in einem privaten Bucket gespeichert, der jeglichen öffentlichen Zugriff verweigert. Selbst ein Administrator kann eine Datei nur über einen signierten Link ansehen, der nach 5 Minuten abläuft.' },
      { icon: '🛡️', title: 'Versicherung & Nachweise', meta: 'Ablauf verfolgt · admin-geprüft', desc: 'Versicherungsnachweise und Plattform-Qualifikationen werden mit Ausstellungs- und Ablaufdatum hochgeladen, dann von einem Administrator verifiziert oder abgelehnt — selbst gemeldete Angaben zählen für sich allein nicht.' },
    ],

    fieldTag: 'Vor-Ort-Beweiskette',
    fieldTitle: 'Nachweis, dass die Arbeit tatsächlich stattgefunden hat',
    fieldLead:
      'Für die Inbetriebnahme vor Ort baut die Plattform eine Beweiskette auf, damit ein entfernter Auftraggeber einer Arbeit vertrauen kann, die einen Kontinent entfernt erledigt wurde — Standort und Lieferfotos werden direkt gegen den Meilenstein erfasst.',
    fieldCards: [
      { icon: '📍', title: 'GPS-Check-in', meta: 'Serverseitiger Geofence', desc: 'Beim Check-in berechnet die Plattform serverseitig die Entfernung zum Einsatzort (Clients können dies nicht fälschen) und erfasst sie am Meilenstein. Check-ins außerhalb des Geofence gelingen trotzdem, werden aber für den Auftraggeber markiert.' },
      { icon: '🎓', title: 'Zertifiziert vor dem Check-in', meta: 'An der Tür kontrolliert', desc: 'Eine gültige Plattform-Zertifizierung ist erforderlich, bevor ein Ingenieur vor Ort einchecken kann — eine zweite Kontrolle zusätzlich zur Zuweisung, sodass ein widerrufenes Abzeichen die Arbeit direkt an der Tür stoppt.' },
      { icon: '📷', title: 'QC-Lieferfotos', meta: 'Am Meilenstein erfasst', desc: 'Bei Fertigstellung reicht der Ingenieur Fotos und Notizen ein, die am Meilenstein hängen und dem Auftraggeber einen visuellen Nachweis geben, bevor Gelder freigegeben werden.' },
    ],

    finalTitle: 'Schutz, den Sie schon bei Ihrem ersten Auftrag sehen',
    finalSub: 'Schreiben Sie ein Projekt kostenlos aus. Finanzieren Sie einen Meilenstein in die Treuhand und beobachten Sie, wie jede Schutzmaßnahme auf dieser Seite funktioniert, bevor Sie freigeben.',

    cohortNote:
      'Talengineer befindet sich in der Gründungsphase. Wir veröffentlichen keine Zahlen zu „bedienten Unternehmen“, hinter denen wir noch nicht stehen können — die oben genannten Schutzmaßnahmen sind das, worauf sich ein früher Kunde verlässt, und sie sind heute im Produkt live.',
  },

  ja: {
    metaTitle: 'トラストセンター — エスクロー、紛争、検証 | Talengineer',
    metaDesc:
      'Talengineerが双方をどう保護するか：承認時にのみ解放されるマイルストーンエスクロー、5日間の証拠提出期間を持つ紛争プロセス（元のカードへの返金）、KYCと税務検証、そして現場作業のためのGPS＋QC写真の証拠チェーン。',
    kicker: 'トラストセンター',
    heroTitle: '信頼はスローガンではなく、インフラです。',
    heroSub:
      'このページのすべての主張は、プラットフォームが実際に行っていることに対応しています——承認するまであなたのお金を保持するエスクロー、固定された証拠提出期間を持つ紛争プロセス、検証済みの本人確認、そして現場納品のための証拠の記録。ここではそれぞれが正確にどう機能するかを説明します。',
    ctaPost: 'プロジェクトを投稿 — 無料',

    escrowTag: 'エスクロー',
    escrowTitle: 'あなたのお金はどう保管されるか',
    escrowLead:
      '資金は安全に保管され、あなたが各成果物を承認したときにのみ解放されます——マイルストーンは実際に支払いが確定した後にのみ入金済みとしてマークされ、あなたの承認後にのみ解放されます。',
    escrowSteps: [
      { icon: '💳', n: '1', title: '入金', desc: 'Stripe Checkoutを通じてマイルストーンに入金します。Stripeが支払いを確認した後にのみ入金済みとしてマークされます——信頼だけで「保管」されることは決してありません。' },
      { icon: '🔧', n: '2', title: '納品', desc: 'エンジニアがマイルストーンに取り組みます。進行に応じて現場チェックインと完了写真がそのマイルストーンに記録されます。' },
      { icon: '✅', n: '3', title: '承認', desc: 'あなたは成果物を確認します。あなたが承認したときにのみ資金が動きます——プラットフォームがタイマーで自動的に解放することはありません。' },
      { icon: '🔓', n: '4', title: '解放', desc: '承認されると、プラットフォーム手数料を差し引いたエスクローがエンジニアに解放されます。重複送金防止機構があるため、解放が二重に発生することは決してありません。' },
    ],

    disputeTag: '紛争と返金',
    disputeTitle: '問題が起きた場合どうなるか',
    disputeLead:
      'ご満足いただけない場合、紛争を開くことでお金が動く前にマイルストーンが凍結されます。双方が定められた期間内に証拠を提出し、管理者がそれを審査し、その結果がエスクロー資金の行き先を決定します——元のカードへの全額返金も含まれます。',
    disputeSteps: [
      { icon: '🚩', n: '1', title: '紛争を開く', desc: 'プロジェクトのどちらの当事者も、入金済みのマイルストーンに対して紛争を開くことができます。これを行うと即座に「紛争中」として凍結されます——資金は一切動けなくなります。' },
      { icon: '📎', n: '2', title: '証拠', desc: '双方に証拠を提出するための5日間の期間があります。各当事者の立場はその役割に基づきサーバー側で記録され、偽装することはできません。' },
      { icon: '👤', n: '3', title: '管理者による審査', desc: '資金が動く前に、プラットフォームの管理者がマイルストーンの仕様と双方の証拠提出内容を審査します。' },
      { icon: '↩️', n: '4', title: '解決', desc: '管理者はエンジニア側、雇用者側、または折半で裁定します。雇用者側に裁定された場合、エスクローの全額が元のカードに返金されます。折半の場合はエンジニアに支払われなかった残額が返金されます。' },
    ],
    disputeNote:
      '1つのマイルストーンにつき、未解決の紛争は同時に1件のみ存在できます。また、解決はアトミックな保護機構で守られているため、二重支払いや二重返金は決して発生しません。',

    verifyTag: '本人確認とコンプライアンス',
    verifyTitle: 'あなたが実際に取引している相手',
    verifyLead:
      '支払い保護は、相手方が実在し責任を負える存在である場合にのみ意味を持ちます。本人確認、税務、保険の書類はカウントされる前に検証され、機密ファイルが公開URLの背後に置かれることは決してありません。',
    verifyCards: [
      { icon: '🪪', title: '企業KYC', meta: '24時間以内に審査', desc: '雇用者は検証のため会社情報を提出します。当社チームが提出内容を審査した後、ステータスは保留中から検証済みに変わります——通常24時間以内です。' },
      { icon: '📄', title: 'W-9税務書類', meta: '5分間の署名付きアクセス', desc: '税務フォームは、すべての公開アクセスを拒否するプライベートバケットに保存されます。管理者であっても、5分後に期限切れになる署名付きリンクを通じてのみファイルを閲覧できます。' },
      { icon: '🛡️', title: '保険と資格情報', meta: '有効期限を追跡・管理者が審査', desc: '保険証明書とプラットフォーム資格情報は発行日と有効期限とともにアップロードされ、その後管理者が検証または却下します——自己申告の主張だけではカウントされません。' },
    ],

    fieldTag: '現場証拠チェーン',
    fieldTitle: '仕事が実際に行われた証拠',
    fieldLead:
      '現場での試運転において、プラットフォームは証拠の記録を構築し、遠隔の雇用者が大陸を越えて行われた仕事を信頼できるようにします——位置情報と納品写真はマイルストーン自体に対して取得されます。',
    fieldCards: [
      { icon: '📍', title: 'GPSチェックイン', meta: 'サーバー側のジオフェンス', desc: 'チェックイン時、プラットフォームはサーバー上で現場からの距離を計算し（クライアントは偽装できません）、それをマイルストーンに記録します。ジオフェンスの外でのチェックインも成功しますが、雇用者が確認できるようフラグが立てられます。' },
      { icon: '🎓', title: 'チェックイン前に認定が必要', meta: '入口で審査', desc: 'エンジニアが現場でチェックインする前に、有効なプラットフォーム認定が必要です——アサインメントに加えた第二の関門であり、失効したバッジは入口で作業を止めます。' },
      { icon: '📷', title: 'QC納品写真', meta: 'マイルストーンに記録', desc: '完了時、エンジニアは写真とメモを提出し、それがマイルストーンに添付されます。これにより、雇用者は資金が解放される前に確認できる視覚的な記録を得られます。' },
    ],

    finalTitle: '最初の注文から見える保護',
    finalSub: '無料でプロジェクトを投稿してください。マイルストーンをエスクローに入金し、承認する前にこのページのすべての保護策が機能する様子をご覧ください。',

    cohortNote:
      'Talengineerは創業フェーズにあります。まだ裏付けのできない「対応企業数」のような数字は公開しません——上記の保護こそが初期のお客様が実際に頼りにしているものであり、それらは今日すでに製品内で稼働しています。',
  },

  ko: {
    metaTitle: '신뢰 센터 — 에스크로, 분쟁 및 검증 | Talengineer',
    metaDesc:
      'Talengineer가 양측을 보호하는 방법: 승인 시에만 해제되는 마일스톤 에스크로, 원래 카드로 환불되는 5일 증거 제출 기간을 갖춘 분쟁 절차, KYC 및 세금 검증, 그리고 현장 작업을 위한 GPS + QC 사진 증거 체인.',
    kicker: '신뢰 센터',
    heroTitle: '신뢰는 슬로건이 아니라 인프라입니다.',
    heroSub:
      '이 페이지의 모든 주장은 플랫폼이 실제로 수행하는 일에 대응합니다 — 승인할 때까지 자금을 보관하는 에스크로, 고정된 증거 제출 기간을 갖춘 분쟁 절차, 검증된 신원, 현장 납품을 위한 증거 기록. 각 항목이 정확히 어떻게 작동하는지 여기서 설명합니다.',
    ctaPost: '프로젝트 등록 — 무료',

    escrowTag: '에스크로',
    escrowTitle: '귀하의 자금이 보관되는 방식',
    escrowLead:
      '자금은 안전하게 보관되며 귀하가 각 산출물을 승인할 때만 해제됩니다 — 마일스톤은 결제가 실제로 완료된 후에만 예치 완료로 표시되며, 귀하의 승인이 있어야만 해제됩니다.',
    escrowSteps: [
      { icon: '💳', n: '1', title: '예치', desc: 'Stripe Checkout을 통해 마일스톤 대금을 에스크로에 예치합니다. Stripe가 결제를 확인한 후에만 예치 완료로 표시됩니다 — 신뢰만으로 "보관"되는 일은 절대 없습니다.' },
      { icon: '🔧', n: '2', title: '납품', desc: '엔지니어가 마일스톤을 진행합니다. 진행되는 동안 현장 체크인과 완료 사진이 해당 마일스톤에 기록됩니다.' },
      { icon: '✅', n: '3', title: '승인', desc: '귀하가 산출물을 검토합니다. 귀하가 승인할 때만 자금이 이동합니다 — 플랫폼은 타이머로 자동 해제하는 일이 없습니다.' },
      { icon: '🔓', n: '4', title: '해제', desc: '승인되면 플랫폼 수수료를 제외한 에스크로가 엔지니어에게 해제됩니다. 중복 송금 방지 장치가 있어 해제가 두 번 발생하는 일은 절대 없습니다.' },
    ],

    disputeTag: '분쟁 및 환불',
    disputeTitle: '문제가 생기면 어떻게 되는가',
    disputeLead:
      '만족스럽지 않으면, 분쟁을 열면 자금이 이동하기 전에 마일스톤이 동결됩니다. 양측은 고정된 기간 내에 증거를 제출하고, 관리자가 이를 검토하며, 그 결과에 따라 에스크로 자금이 어디로 갈지 결정됩니다 — 원래 카드로의 전액 환불도 포함됩니다.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: '분쟁 열기', desc: '프로젝트의 어느 당사자든 대금이 예치된 마일스톤에 대해 분쟁을 열 수 있습니다. 이렇게 하면 즉시 "분쟁 중"으로 동결되어 어떤 자금도 이동할 수 없습니다.' },
      { icon: '📎', n: '2', title: '증거', desc: '양측 모두 증거를 제출할 5일의 기간이 있습니다. 각 당사자의 입장은 서버 측에서 역할에 따라 기록되며 위조할 수 없습니다.' },
      { icon: '👤', n: '3', title: '관리자 검토', desc: '자금이 이동하기 전에 플랫폼 관리자가 마일스톤 사양과 양측의 증거 제출 내용을 검토합니다.' },
      { icon: '↩️', n: '4', title: '해결', desc: '관리자는 엔지니어에게, 고용주에게, 또는 분할로 판결합니다. 고용주에게 판결되면 에스크로 전액이 원래 카드로 환불됩니다. 분할 판결이면 엔지니어에게 지급되지 않은 잔액이 환불됩니다.' },
    ],
    disputeNote:
      '마일스톤당 한 번에 하나의 미해결 분쟁만 존재할 수 있으며, 해결은 원자적 보호 장치로 보호되어 이중 지급이나 이중 환불이 절대 발생하지 않습니다.',

    verifyTag: '신원 및 컴플라이언스',
    verifyTitle: '귀하가 실제로 함께 일하는 대상',
    verifyLead:
      '결제 보호는 상대방이 실재하고 책임질 수 있을 때만 의미가 있습니다. 신원, 세금, 보험 문서는 인정되기 전에 검증되며, 민감한 파일이 공개 URL 뒤에 놓이는 일은 절대 없습니다.',
    verifyCards: [
      { icon: '🪪', title: '비즈니스 KYC', meta: '24시간 내 검토', desc: '고용주는 검증을 위해 회사 정보를 제출합니다. 저희 팀이 제출 내용을 검토한 후 상태가 대기 중에서 검증됨으로 바뀝니다 — 일반적으로 24시간 이내입니다.' },
      { icon: '📄', title: 'W-9 세금 문서', meta: '5분 서명 접근', desc: '세금 양식은 모든 공개 접근을 거부하는 비공개 버킷에 저장됩니다. 관리자조차도 5분 후 만료되는 서명된 링크를 통해서만 파일을 볼 수 있습니다.' },
      { icon: '🛡️', title: '보험 및 자격증명', meta: '만료 추적 · 관리자 검토', desc: '보험 증서와 플랫폼 자격증명은 발급일 및 만료일과 함께 업로드된 후 관리자가 검증하거나 반려합니다 — 자체 신고만으로는 인정되지 않습니다.' },
    ],

    fieldTag: '현장 증거 체인',
    fieldTitle: '작업이 실제로 이루어졌다는 증거',
    fieldLead:
      '현장 시운전의 경우, 플랫폼은 원격 고용주가 대륙 건너에서 이루어진 작업을 신뢰할 수 있도록 증거 기록을 구축합니다 — 위치와 납품 사진이 마일스톤 자체에 대해 캡처됩니다.',
    fieldCards: [
      { icon: '📍', title: 'GPS 체크인', meta: '서버 측 지오펜스', desc: '체크인 시 플랫폼은 서버에서 작업 현장까지의 거리를 계산하고(클라이언트는 이를 조작할 수 없음) 마일스톤에 기록합니다. 지오펜스 밖의 체크인도 성공하지만 고용주가 볼 수 있도록 표시됩니다.' },
      { icon: '🎓', title: '체크인 전 인증 필수', meta: '입구에서 관문 통제', desc: '엔지니어가 현장에서 체크인하기 전에 유효한 플랫폼 인증이 필요합니다 — 배정 외에 추가된 두 번째 관문으로, 취소된 배지는 입구에서 작업을 막습니다.' },
      { icon: '📷', title: 'QC 납품 사진', meta: '마일스톤에 기록됨', desc: '완료 시 엔지니어는 사진과 메모를 제출하며 이는 마일스톤에 첨부되어, 자금이 해제되기 전에 고용주가 승인할 수 있는 시각적 기록을 제공합니다.' },
    ],

    finalTitle: '첫 주문부터 눈으로 확인할 수 있는 보호',
    finalSub: '프로젝트를 무료로 등록하세요. 마일스톤 하나를 에스크로에 예치하고, 승인하기 전에 이 페이지의 모든 보호 장치가 작동하는 것을 지켜보세요.',

    cohortNote:
      'Talengineer는 창립 단계에 있습니다. 아직 뒷받침할 수 없는 "서비스 제공 기업 수" 같은 수치는 공개하지 않습니다 — 위의 보호 장치들이 바로 초기 고객이 실제로 의지하는 것이며, 오늘 제품에서 실제로 작동하고 있습니다.',
  },
};

module.exports = { DICT };
