// 职业页（/occupations/[role]）的内容数据层（数据驱动，照 lib/hireMatrix 的 getMatrixPage 模式）。
//
// 设计约定（诚实红线）：
// - 零编造统计：职责/市场描述只写"结构性事实 + 定性判断"（regionGuides 同一口径），
//   不写任何具体统计数字（时薪中位数、缺口人数、增长率一类一律不写）。
// - 费率区间不另立数字：页面直接复用 lib/hireMatrix 的 REGIONS（与 /hire/[track] 及 /rates 同一唯一来源）。
// - 认证机制描述与 src/config/training.js 同口径，但**不复写具体题数/分钟数/及格分**——
//   那些数字的展示位留给 /certification 与 /how-it-works（各页单一来源原则，防数字漂移）。
// - 只有 4 条认证方向（plc/robotics/vision/electrical，见 /hire/[track] 与 training 模块）：
//   scada-engineer 是职业页里唯一"职业 ≠ 方向"的角色，其内容必须诚实声明
//   SCADA 工作的筛选与认证归属 PLC & Controls 方向，绝不能暗示存在独立的 SCADA 证书。
// - 方向元数据（label/kicker/skills/levels）经 getTrackMeta 从 hireMatrix 取，不重抄文案。
//
// 每个职业条目的形状：
//   { track, name, roleSkills[], relatedPlaybookSlugs?, en: {kicker,title,sub,lead1,lead2,faq[4]}, zh: {…} }
// - track：认证方向 slug（决定费率表口径、认证路径、内链的归属）。
// - name：职业短名（兄弟职业内链、面包屑用——用 title 会把"Hire a …"整句塞进链接，太长）。
// - roleSkills：职业专属技能 chips（与方向技能 getTrackMeta().skills 互补，页面可两排并列）。
// - relatedPlaybookSlugs：手工策展的相关 Playbook 文章（slug 必须真实存在于 content/playbook/）。
// 注意：带 .js 扩展名——node --test 走原生 ESM 解析（不带扩展名会 ERR_MODULE_NOT_FOUND），
// Next.js 的打包器两种写法都认。
import { REGIONS, RATES_NOTE, getTrackMeta, getIndustriesForTrack } from './hireMatrix.js';

// ── 6 个职业（键 = role slug，即 /occupations/[role] 的路由段）───────────────
const OCCUPATIONS = {
  'plc-programmer': {
    track: 'plc',
    name: {
      en: 'PLC Programmer', zh: 'PLC 程序员', es: 'Programador de PLC', vi: 'Lập trình viên PLC',
      hi: 'PLC प्रोग्रामर', fr: 'Programmeur PLC', de: 'PLC-Programmierer', ja: 'PLCプログラマー', ko: 'PLC 프로그래머',
    },
    roleSkills: ['Ladder / ST / FBD', 'Siemens TIA Portal', 'Rockwell Studio 5000', 'HMI (WinCC / FactoryTalk View)', 'VFD & I/O commissioning', 'Fault diagnostics'],
    relatedPlaybookSlugs: ['plc-programmer-hourly-rates-2026', 'siemens-vs-allen-bradley-talent', 'platform-certification-explained'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a PLC Programmer',
      sub: 'Pre-screened programmers for ladder, structured text and HMI work on Siemens, Rockwell, Mitsubishi and Beckhoff — matched to your exact controller, protected by milestone escrow.',
      lead1:
        'A PLC programmer turns a machine specification into working control logic: ladder and structured text on the controller, HMI screens the operators actually use, drive and I/O configuration, and the commissioning that proves it all under real conditions. It is a hands-on role — the deliverable is not a document but a line that runs, and the quality of the code decides how maintainable that line stays for the next decade.',
      lead2:
        'The hiring problem is platform depth. "PLC experience" on a résumé says little about whether someone can move confidently in your exact installed base — a Siemens S7-1500 house and a Rockwell ControlLogix house are different worlds of instructions, tooling and habits. We match by platform and verify by practical assessment, so you filter to programmers whose depth has been demonstrated rather than claimed.',
      faq: [
        {
          q: 'What does a PLC programmer actually deliver?',
          a: 'Typical scopes include new machine and line logic, retrofits and controller migrations, HMI development, fault-recovery and diagnostics improvements, and on-site commissioning support. On TalEngineer every scope is broken into milestones before work starts, so the deliverable of each stage — code drop, simulated test, site acceptance — is explicit and tied to an escrow release.',
        },
        {
          q: 'PLC programmer vs controls engineer — which one do I need?',
          a: 'If the control architecture, panel design and network layout already exist and you need the logic written, tested and commissioned, a PLC programmer fits. If someone must own the design itself — functional specs, network architecture, safety concept, vendor coordination, FAT/SAT — you are looking for a controls engineer. Many projects need both, with the controls engineer setting the frame the programmer executes in.',
        },
        {
          q: 'How does TalEngineer verify a PLC programmer?',
          a: 'Every engineer takes a practical AI technical screener as part of onboarding, and the result becomes the verified score on their profile. Beyond that, they can sit certification exams in the PLC & Controls track at three levels (L1–L3); exams are AI-scored and then reviewed by a platform admin before any certificate is issued, and only engineers holding a valid platform certification can be officially assigned to your project — in the PLC & Controls track, if you require it.',
        },
        {
          q: 'Can PLC programming be done remotely?',
          a: 'Large parts of it can: logic development, HMI work and emulator or digital-twin testing travel well over a remote setup. Commissioning is the exception — someone has to stand at the machine when it first runs. The common pattern on our platform is hybrid: development remote, commissioning done by the same engineer on site or paired with a local engineer, coordinated in one project room.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣 PLC 程序员',
      sub: '经过预审的程序员，负责 Siemens、Rockwell、Mitsubishi、Beckhoff 上的梯形图、结构化文本与 HMI 工作——按你的具体控制器匹配，里程碑托管保障。',
      lead1:
        'PLC 程序员把一份设备规格书变成能跑的控制逻辑：控制器上的梯形图与结构化文本、操作工真正在用的 HMI 画面、驱动器与 I/O 配置，以及在真实工况下验证这一切的调试。这是个动手的职位——交付物不是一份文档，而是一条跑起来的产线；代码的质量，决定这条线未来十年好不好维护。',
      lead2:
        '招聘的难点在平台深度。简历上一句"有 PLC 经验"，说明不了他能不能在你的具体设备底座里游刃有余——一个 Siemens S7-1500 车间和一个 Rockwell ControlLogix 车间，是指令、工具链、习惯完全不同的两个世界。我们按平台匹配、用实操评估验证，让你筛出的是"被验证过深度"的程序员，而不是"自称有深度"的。',
      faq: [
        {
          q: 'PLC 程序员到底交付什么？',
          a: '典型范围包括：新设备/新产线逻辑、旧线改造与控制器迁移、HMI 开发、故障恢复与诊断优化、以及现场调试支持。在 TalEngineer 上，每个范围在开工前都会拆成里程碑，每个阶段的交付物——代码提交、仿真测试、现场验收——都是明确的，并与一次托管放款挂钩。',
        },
        {
          q: 'PLC 程序员和控制工程师，我该要哪个？',
          a: '如果控制架构、电柜设计、网络布局都已存在，你需要的是把逻辑写出来、测通、调完——那是 PLC 程序员。如果需要有人对设计本身负责——功能规格书、网络架构、安全概念、供应商协调、FAT/SAT——你要找的是控制工程师。很多项目两者都需要：控制工程师定框架，程序员在框架里执行。',
        },
        {
          q: 'TalEngineer 怎么验证一个 PLC 程序员？',
          a: '每位工程师在入驻时都要通过一套实操型 AI 技术筛选，结果成为其档案上的筛选分。在此之上，还可在 PLC 与控制方向考取三个级别（L1–L3）的认证；考试由 AI 评分、再经平台管理员复核后才发证，并且只有持有有效平台认证的工程师才能被正式指派到你的项目——如果你要求 PLC 与控制方向的证书，须持有该方向证书。',
        },
        {
          q: 'PLC 编程能远程做吗？',
          a: '很大一部分可以：逻辑开发、HMI 工作、仿真器或数字孪生上的测试，远程都做得好。例外是调试——设备第一次跑起来的时候，必须有人站在机器旁。平台上常见的模式是混合式：开发远程完成，调试由同一位工程师到现场、或搭配一位本地工程师完成，全程在同一个项目间协同。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · PLC y control',
      title: 'Contrate a un programador de PLC',
      sub: 'Programadores preseleccionados para trabajo de lógica de escalera, texto estructurado y HMI en Siemens, Rockwell, Mitsubishi y Beckhoff — asignados según su controlador exacto, protegidos por depósito en garantía por hitos.',
      lead1:
        'Un programador de PLC convierte una especificación de máquina en lógica de control que funciona: lógica de escalera y texto estructurado en el controlador, pantallas HMI que los operadores realmente usan, configuración de variadores y E/S, y la puesta en marcha que demuestra que todo funciona en condiciones reales. Es un puesto práctico: el entregable no es un documento, sino una línea que corre, y la calidad del código decide qué tan mantenible seguirá esa línea durante la próxima década.',
      lead2:
        'El problema al contratar es la profundidad en la plataforma. "Experiencia en PLC" en un currículum dice poco sobre si alguien puede moverse con confianza en su base instalada exacta — una planta con Siemens S7-1500 y una con Rockwell ControlLogix son mundos distintos de instrucciones, herramientas y hábitos. Nosotros asignamos por plataforma y verificamos mediante evaluación práctica, de modo que usted filtra a programadores cuya profundidad ha sido demostrada, no solo declarada.',
      faq: [
        {
          q: '¿Qué entrega realmente un programador de PLC?',
          a: 'Los alcances típicos incluyen lógica de máquinas y líneas nuevas, retrofits y migraciones de controlador, desarrollo de HMI, mejoras de recuperación de fallas y diagnóstico, y soporte de puesta en marcha en sitio. En TalEngineer cada alcance se divide en hitos antes de comenzar el trabajo, de modo que el entregable de cada etapa — entrega de código, prueba simulada, aceptación en sitio — es explícito y está vinculado a una liberación de depósito en garantía.',
        },
        {
          q: 'Programador de PLC frente a ingeniero de control — ¿cuál necesito?',
          a: 'Si la arquitectura de control, el diseño del tablero y la topología de red ya existen y usted necesita que la lógica se escriba, se pruebe y se ponga en marcha, un programador de PLC es la opción adecuada. Si alguien debe hacerse cargo del diseño en sí — especificaciones funcionales, arquitectura de red, concepto de seguridad, coordinación con proveedores, FAT/SAT — está buscando un ingeniero de control. Muchos proyectos necesitan ambos, con el ingeniero de control definiendo el marco en el que trabaja el programador.',
        },
        {
          q: '¿Cómo verifica TalEngineer a un programador de PLC?',
          a: 'Cada ingeniero realiza una evaluación técnica práctica con IA como parte de su incorporación, y el resultado se convierte en la puntuación verificada de su perfil. Además, puede presentar exámenes de certificación en la ruta de PLC y control en tres niveles (L1–L3); los exámenes son calificados por IA y luego revisados por un administrador de la plataforma antes de emitir cualquier certificado, y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente a su proyecto — en la ruta de PLC y control, si usted lo exige.',
        },
        {
          q: '¿La programación de PLC se puede hacer de forma remota?',
          a: 'Gran parte sí: el desarrollo de lógica, el trabajo de HMI y las pruebas con emulador o gemelo digital funcionan bien de forma remota. La puesta en marcha es la excepción — alguien tiene que estar frente a la máquina cuando arranca por primera vez. El patrón común en nuestra plataforma es híbrido: desarrollo remoto, puesta en marcha realizada por el mismo ingeniero en sitio o junto con un ingeniero local, coordinado en una sola sala de proyecto.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · PLC & Điều khiển',
      title: 'Thuê lập trình viên PLC',
      sub: 'Lập trình viên đã qua sàng lọc cho công việc ladder, structured text và HMI trên Siemens, Rockwell, Mitsubishi và Beckhoff — được ghép nối theo đúng bộ điều khiển của bạn, được bảo vệ bằng ký quỹ theo cột mốc.',
      lead1:
        'Lập trình viên PLC biến một bản đặc tả máy thành logic điều khiển hoạt động thực tế: ladder và structured text trên bộ điều khiển, màn hình HMI mà người vận hành thực sự sử dụng, cấu hình biến tần và I/O, và quá trình chạy thử chứng minh mọi thứ hoạt động trong điều kiện thực tế. Đây là công việc thực hành — sản phẩm bàn giao không phải là một tài liệu mà là một dòng sản xuất đang chạy, và chất lượng mã quyết định dòng sản xuất đó dễ bảo trì đến mức nào trong mười năm tới.',
      lead2:
        'Khó khăn khi tuyển dụng nằm ở chiều sâu nền tảng. Dòng "có kinh nghiệm PLC" trên hồ sơ nói rất ít về việc ai đó có thể làm việc tự tin trên đúng hệ thống đã lắp đặt của bạn hay không — một nhà máy dùng Siemens S7-1500 và một nhà máy dùng Rockwell ControlLogix là hai thế giới khác nhau về tập lệnh, công cụ và thói quen. Chúng tôi ghép nối theo nền tảng và xác minh bằng đánh giá thực hành, để bạn lọc ra những lập trình viên có chiều sâu đã được chứng minh, chứ không chỉ tự nhận.',
      faq: [
        {
          q: 'Lập trình viên PLC thực sự bàn giao những gì?',
          a: 'Phạm vi công việc điển hình gồm logic cho máy và dây chuyền mới, cải tạo và chuyển đổi bộ điều khiển, phát triển HMI, cải thiện khôi phục lỗi và chẩn đoán, cùng hỗ trợ chạy thử tại hiện trường. Trên TalEngineer, mỗi phạm vi công việc được chia thành các cột mốc trước khi bắt đầu, nên sản phẩm bàn giao của từng giai đoạn — bản mã giao, kiểm thử mô phỏng, nghiệm thu tại hiện trường — đều rõ ràng và gắn với một lần giải ngân ký quỹ.',
        },
        {
          q: 'Lập trình viên PLC và kỹ sư điều khiển — tôi cần ai?',
          a: 'Nếu kiến trúc điều khiển, thiết kế tủ điện và bố trí mạng đã có sẵn và bạn chỉ cần logic được viết, kiểm thử và chạy thử, lập trình viên PLC là lựa chọn phù hợp. Nếu cần ai đó chịu trách nhiệm về chính bản thiết kế — đặc tả chức năng, kiến trúc mạng, khái niệm an toàn, điều phối nhà cung cấp, FAT/SAT — bạn đang tìm một kỹ sư điều khiển. Nhiều dự án cần cả hai, với kỹ sư điều khiển đặt ra khung mà lập trình viên thực thi bên trong.',
        },
        {
          q: 'TalEngineer xác minh một lập trình viên PLC như thế nào?',
          a: 'Mỗi kỹ sư đều làm một bài sàng lọc kỹ thuật thực hành bằng AI như một phần của quá trình gia nhập, và kết quả trở thành điểm đã xác minh trên hồ sơ của họ. Ngoài ra, họ có thể dự thi chứng chỉ trong nhóm PLC & Điều khiển ở ba cấp độ (L1–L3); bài thi được AI chấm điểm rồi được quản trị viên nền tảng xem xét trước khi cấp bất kỳ chứng chỉ nào, và chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức vào dự án của bạn — trong nhóm PLC & Điều khiển, nếu bạn yêu cầu.',
        },
        {
          q: 'Lập trình PLC có thể làm từ xa không?',
          a: 'Phần lớn có thể: phát triển logic, công việc HMI và kiểm thử bằng bộ giả lập hoặc bản sao số đều làm từ xa tốt. Chạy thử là ngoại lệ — phải có người đứng tại máy khi nó chạy lần đầu. Mô hình phổ biến trên nền tảng của chúng tôi là kết hợp: phát triển từ xa, chạy thử do chính kỹ sư đó thực hiện tại hiện trường hoặc phối hợp với một kỹ sư địa phương, tất cả được điều phối trong cùng một phòng dự án.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · PLC व कंट्रोल',
      title: 'PLC प्रोग्रामर हायर करें',
      sub: 'Siemens, Rockwell, Mitsubishi और Beckhoff पर लैडर, स्ट्रक्चर्ड टेक्स्ट और HMI काम के लिए पहले से स्क्रीन किए गए प्रोग्रामर — आपके सटीक कंट्रोलर से मैच किए गए, माइलस्टोन एस्क्रो से सुरक्षित।',
      lead1:
        'एक PLC प्रोग्रामर मशीन स्पेसिफिकेशन को काम करने वाले कंट्रोल लॉजिक में बदलता है: कंट्रोलर पर लैडर और स्ट्रक्चर्ड टेक्स्ट, वे HMI स्क्रीन जिन्हें ऑपरेटर वाकई इस्तेमाल करते हैं, ड्राइव व I/O कॉन्फ़िगरेशन, और वह कमीशनिंग जो असली परिस्थितियों में यह सब साबित करती है। यह एक हैंड्स-ऑन भूमिका है — डिलिवरेबल कोई दस्तावेज़ नहीं बल्कि एक चलती हुई लाइन है, और कोड की क्वालिटी यह तय करती है कि वह लाइन अगले दशक तक कितनी आसानी से मेंटेन होती रहेगी।',
      lead2:
        'हायरिंग की दिक्कत प्लेटफ़ॉर्म डेप्थ की है। रिज़्यूमे पर "PLC एक्सपीरियंस" यह बहुत कम बताता है कि कोई आपके ठीक उसी इंस्टॉल्ड बेस में कॉन्फ़िडेंस से काम कर पाएगा या नहीं — एक Siemens S7-1500 वाला प्लांट और एक Rockwell ControlLogix वाला प्लांट, इंस्ट्रक्शन, टूलिंग और आदतों की दृष्टि से अलग-अलग दुनिया हैं। हम प्लेटफ़ॉर्म के हिसाब से मैच करते हैं और व्यावहारिक मूल्यांकन से वेरिफ़ाई करते हैं, ताकि आप उन प्रोग्रामर तक फ़िल्टर कर सकें जिनकी डेप्थ दिखाई गई है, सिर्फ़ दावा नहीं की गई।',
      faq: [
        {
          q: 'एक PLC प्रोग्रामर असल में क्या डिलिवर करता है?',
          a: 'सामान्य स्कोप में नई मशीन व लाइन लॉजिक, रेट्रोफिट और कंट्रोलर माइग्रेशन, HMI डेवलपमेंट, फ़ॉल्ट-रिकवरी व डायग्नोस्टिक्स सुधार, और ऑन-साइट कमीशनिंग सपोर्ट शामिल हैं। TalEngineer पर काम शुरू होने से पहले हर स्कोप को माइलस्टोन में बांटा जाता है, इसलिए हर चरण का डिलिवरेबल — कोड ड्रॉप, सिम्युलेटेड टेस्ट, साइट एक्सेप्टेंस — स्पष्ट होता है और एक एस्क्रो रिलीज़ से जुड़ा होता है।',
        },
        {
          q: 'PLC प्रोग्रामर बनाम कंट्रोल्स इंजीनियर — मुझे कौन चाहिए?',
          a: 'अगर कंट्रोल आर्किटेक्चर, पैनल डिज़ाइन और नेटवर्क लेआउट पहले से मौजूद हैं और आपको बस लॉजिक लिखवाना, टेस्ट कराना और कमीशन कराना है, तो PLC प्रोग्रामर सही फ़िट है। अगर किसी को डिज़ाइन खुद ओन करना है — फ़ंक्शनल स्पेक्स, नेटवर्क आर्किटेक्चर, सेफ़्टी कॉन्सेप्ट, वेंडर कोऑर्डिनेशन, FAT/SAT — तो आप कंट्रोल्स इंजीनियर ढूंढ रहे हैं। कई प्रोजेक्ट में दोनों चाहिए होते हैं, जहाँ कंट्रोल्स इंजीनियर वह फ़्रेम तय करता है जिसमें प्रोग्रामर काम करता है।',
        },
        {
          q: 'TalEngineer एक PLC प्रोग्रामर को कैसे वेरिफ़ाई करता है?',
          a: 'हर इंजीनियर ऑनबोर्डिंग के हिस्से के रूप में एक व्यावहारिक AI टेक्निकल स्क्रीनर देता है, और उसका परिणाम उसकी प्रोफ़ाइल पर सत्यापित स्कोर बनता है। इसके अलावा, वे PLC व कंट्रोल ट्रैक में तीन स्तरों (L1–L3) पर प्रमाणन एग्ज़ाम दे सकते हैं; एग्ज़ाम AI से स्कोर होते हैं और फिर किसी भी सर्टिफ़िकेट के जारी होने से पहले एक प्लेटफ़ॉर्म एडमिन इन्हें रिव्यू करता है, और केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही आपके प्रोजेक्ट पर आधिकारिक रूप से असाइन किए जा सकते हैं — PLC व कंट्रोल ट्रैक में, अगर आप इसकी मांग करते हैं।',
        },
        {
          q: 'क्या PLC प्रोग्रामिंग रिमोट तरीक़े से हो सकती है?',
          a: 'इसका बड़ा हिस्सा हो सकता है: लॉजिक डेवलपमेंट, HMI काम और एमुलेटर या डिजिटल-ट्विन टेस्टिंग रिमोट सेटअप में अच्छी तरह चलते हैं। कमीशनिंग अपवाद है — जब मशीन पहली बार चलती है, तब किसी को मशीन के पास खड़ा होना ही पड़ता है। हमारे प्लेटफ़ॉर्म पर आम पैटर्न हाइब्रिड है: डेवलपमेंट रिमोट, और कमीशनिंग वही इंजीनियर साइट पर जाकर करता है या किसी लोकल इंजीनियर के साथ मिलकर, सब कुछ एक ही प्रोजेक्ट रूम में कोऑर्डिनेटेड।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · PLC & Contrôle-commande',
      title: 'Recrutez un programmeur PLC',
      sub: 'Programmeurs présélectionnés pour le travail en ladder, texte structuré et HMI sur Siemens, Rockwell, Mitsubishi et Beckhoff — mis en relation selon votre automate exact, protégés par séquestre par jalons.',
      lead1:
        "Un programmeur PLC transforme un cahier des charges machine en logique de commande fonctionnelle : ladder et texte structuré sur l'automate, écrans HMI réellement utilisés par les opérateurs, configuration des variateurs et des E/S, et la mise en service qui prouve que tout fonctionne en conditions réelles. C'est un poste concret — le livrable n'est pas un document mais une ligne qui tourne, et la qualité du code détermine la facilité de maintenance de cette ligne pour la décennie à venir.",
      lead2:
        "La difficulté du recrutement tient à la profondeur sur la plateforme. Une mention « expérience PLC » sur un CV n'indique guère si la personne saura évoluer avec assurance sur votre parc installé exact — un site équipé en Siemens S7-1500 et un site équipé en Rockwell ControlLogix sont deux mondes différents en termes d'instructions, d'outils et d'habitudes. Nous mettons en relation par plateforme et vérifions par une évaluation pratique, afin que vous filtriez des programmeurs dont la maîtrise a été démontrée, et non simplement déclarée.",
      faq: [
        {
          q: 'Que livre concrètement un programmeur PLC ?',
          a: "Les périmètres habituels comprennent la logique de nouvelles machines et lignes, les rétrofits et migrations d'automates, le développement HMI, l'amélioration de la reprise sur défaut et du diagnostic, ainsi que le support de mise en service sur site. Sur TalEngineer, chaque périmètre est découpé en jalons avant le début des travaux, de sorte que le livrable de chaque étape — dépôt de code, test simulé, réception sur site — est explicite et lié à un déblocage de séquestre.",
        },
        {
          q: 'Programmeur PLC ou ingénieur automatisme — lequel me faut-il ?',
          a: "Si l'architecture de commande, la conception de l'armoire et la topologie réseau existent déjà et que vous avez besoin que la logique soit écrite, testée et mise en service, un programmeur PLC convient. Si quelqu'un doit porter la conception elle-même — spécifications fonctionnelles, architecture réseau, concept de sécurité, coordination des fournisseurs, FAT/SAT — vous cherchez un ingénieur automatisme. De nombreux projets ont besoin des deux, l'ingénieur automatisme définissant le cadre dans lequel le programmeur exécute.",
        },
        {
          q: 'Comment TalEngineer vérifie-t-il un programmeur PLC ?',
          a: "Chaque ingénieur passe une évaluation technique pratique par IA lors de son intégration, et le résultat devient le score vérifié sur son profil. Au-delà, il peut passer des examens de certification dans la filière PLC & Contrôle-commande à trois niveaux (L1–L3) ; les examens sont notés par IA puis vérifiés par un administrateur de la plateforme avant toute délivrance de certificat, et seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés à votre projet — dans la filière PLC & Contrôle-commande, si vous l'exigez.",
        },
        {
          q: 'La programmation PLC peut-elle se faire à distance ?',
          a: "Une large part, oui : le développement de la logique, le travail HMI et les tests sur émulateur ou jumeau numérique se prêtent bien au travail à distance. La mise en service fait exception — quelqu'un doit être présent devant la machine lors de son premier démarrage. Le schéma courant sur notre plateforme est hybride : développement à distance, mise en service réalisée par le même ingénieur sur site ou en binôme avec un ingénieur local, coordonnés dans une seule salle de projet.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · PLC & Steuerungstechnik',
      title: 'PLC-Programmierer engagieren',
      sub: 'Vorgeprüfte Programmierer für Ladder-Logik, strukturierten Text und HMI-Arbeit auf Siemens, Rockwell, Mitsubishi und Beckhoff — passend zu Ihrer genauen Steuerung, abgesichert durch Meilenstein-Treuhand.',
      lead1:
        'Ein PLC-Programmierer verwandelt eine Maschinenspezifikation in funktionierende Steuerungslogik: Ladder-Logik und strukturierten Text auf der Steuerung, HMI-Bildschirme, die die Bediener tatsächlich nutzen, Antriebs- und I/O-Konfiguration sowie die Inbetriebnahme, die all das unter realen Bedingungen beweist. Es ist eine praktische Tätigkeit — das Ergebnis ist kein Dokument, sondern eine laufende Anlage, und die Codequalität entscheidet, wie wartbar diese Anlage die nächsten zehn Jahre bleibt.',
      lead2:
        'Die Herausforderung bei der Einstellung liegt in der Plattformtiefe. „PLC-Erfahrung" im Lebenslauf sagt wenig darüber aus, ob jemand sich sicher in Ihrer genauen installierten Basis bewegen kann — ein Siemens-S7-1500-Werk und ein Rockwell-ControlLogix-Werk sind unterschiedliche Welten aus Befehlssätzen, Werkzeugen und Gewohnheiten. Wir vermitteln nach Plattform und verifizieren durch praxisnahes Assessment, sodass Sie nach Programmierern filtern, deren Tiefe nachgewiesen und nicht nur behauptet wurde.',
      faq: [
        {
          q: 'Was liefert ein PLC-Programmierer tatsächlich?',
          a: 'Typische Aufgaben umfassen neue Maschinen- und Linienlogik, Nachrüstungen und Steuerungsmigrationen, HMI-Entwicklung, Verbesserungen bei Fehlerbehebung und Diagnose sowie Unterstützung bei der Inbetriebnahme vor Ort. Bei TalEngineer wird jeder Aufgabenumfang vor Arbeitsbeginn in Meilensteine gegliedert, sodass das Ergebnis jeder Phase — Code-Übergabe, simulierter Test, Abnahme vor Ort — eindeutig ist und an eine Treuhand-Freigabe gekoppelt ist.',
        },
        {
          q: 'PLC-Programmierer oder Steuerungstechniker — wen brauche ich?',
          a: 'Wenn die Steuerungsarchitektur, das Schaltschrankdesign und die Netzwerktopologie bereits feststehen und Sie nur die Logik geschrieben, getestet und in Betrieb genommen brauchen, passt ein PLC-Programmierer. Wenn jemand die Konzeption selbst verantworten muss — Funktionsspezifikation, Netzwerkarchitektur, Sicherheitskonzept, Lieferantenkoordination, FAT/SAT —, suchen Sie einen Steuerungstechniker. Viele Projekte brauchen beide, wobei der Steuerungstechniker den Rahmen setzt, in dem der Programmierer arbeitet.',
        },
        {
          q: 'Wie verifiziert TalEngineer einen PLC-Programmierer?',
          a: 'Jeder Ingenieur absolviert im Rahmen des Onboardings einen praxisnahen KI-Techniktest, dessen Ergebnis zum verifizierten Score im Profil wird. Darüber hinaus kann er Zertifizierungsprüfungen im Bereich PLC & Steuerungstechnik auf drei Stufen (L1–L3) ablegen; die Prüfungen werden von KI bewertet und anschließend von einem Plattform-Administrator geprüft, bevor ein Zertifikat ausgestellt wird. Nur Ingenieure mit gültiger Plattformzertifizierung können offiziell Ihrem Projekt zugewiesen werden — im Bereich PLC & Steuerungstechnik, sofern Sie dies verlangen.',
        },
        {
          q: 'Kann PLC-Programmierung remote erfolgen?',
          a: 'Ein großer Teil ja: Logikentwicklung, HMI-Arbeit sowie Tests mit Emulator oder digitalem Zwilling funktionieren im Remote-Setup gut. Die Inbetriebnahme ist die Ausnahme — jemand muss an der Maschine stehen, wenn sie zum ersten Mal läuft. Das übliche Muster auf unserer Plattform ist hybrid: Entwicklung remote, Inbetriebnahme durch denselben Ingenieur vor Ort oder im Team mit einem lokalen Ingenieur, koordiniert in einem gemeinsamen Projektraum.',
        },
      ],
    },
    ja: {
      kicker: '職種 · PLC & 制御',
      title: 'PLCプログラマーを採用',
      sub: 'Siemens、Rockwell、Mitsubishi、Beckhoffでのラダー、ストラクチャードテキスト、HMI業務に対応する事前審査済みのプログラマー——お使いのコントローラーに正確にマッチし、マイルストーンエスクローで保護されます。',
      lead1:
        'PLCプログラマーは、機械仕様書を実際に動く制御ロジックへと変換します。コントローラー上のラダーとストラクチャードテキスト、オペレーターが実際に使うHMI画面、ドライブとI/Oの設定、そしてそのすべてを実条件下で証明する試運転です。これは実務的な職種であり、成果物は文書ではなく動いている一行のロジックです。コードの品質が、そのラインが今後10年間どれだけメンテナンスしやすいかを左右します。',
      lead2:
        '採用の難しさはプラットフォームの深さにあります。履歴書の「PLC経験」という一文は、あなたの現場の設備構成の中で自信を持って作業できるかどうかをほとんど語りません——Siemens S7-1500の現場とRockwell ControlLogixの現場では、命令体系もツールも習慣もまったく異なる世界です。当社はプラットフォームでマッチングし、実践的な評価で検証するため、お客様は「深さが証明された」プログラマーだけを絞り込むことができます。',
      faq: [
        {
          q: 'PLCプログラマーは実際に何を納品するのですか？',
          a: '典型的な作業範囲には、新規の機械・ライン用ロジック、レトロフィットやコントローラー移行、HMI開発、故障復旧・診断機能の改善、現場での試運転支援が含まれます。TalEngineerでは、作業開始前にすべての範囲をマイルストーンに分割するため、各段階の成果物——コードの提出、シミュレーションテスト、現場での受け入れ——が明確になり、エスクローの解放に紐づけられます。',
        },
        {
          q: 'PLCプログラマーと制御エンジニア、どちらが必要ですか？',
          a: '制御アーキテクチャ、制御盤設計、ネットワーク構成がすでに決まっており、ロジックの作成・テスト・試運転だけが必要な場合は、PLCプログラマーが適しています。機能仕様書、ネットワークアーキテクチャ、安全コンセプト、ベンダー調整、FAT/SATなど設計そのものを担う人が必要な場合は、制御エンジニアを探すべきです。多くのプロジェクトでは両方が必要で、制御エンジニアが枠組みを定め、その中でプログラマーが実行します。',
        },
        {
          q: 'TalEngineerはPLCプログラマーをどのように検証していますか？',
          a: 'すべてのエンジニアはオンボーディングの一環として実践的なAI技術スクリーニングを受け、その結果がプロフィール上の検証済みスコアになります。それに加えて、PLC & 制御分野の認定試験を3つのレベル（L1–L3）で受けることができます。試験はAIによって採点された後、プラットフォームの管理者が認定証発行前にレビューします。有効なプラットフォーム認定を保有するエンジニアだけが、お客様のプロジェクトに正式にアサインされます——PLC & 制御分野の認定が必要な場合は、その認定が必要です。',
        },
        {
          q: 'PLCプログラミングはリモートで行えますか？',
          a: '多くの部分はリモートで対応可能です。ロジック開発、HMI作業、エミュレーターやデジタルツインでのテストは、リモート環境でも問題なく進められます。例外は試運転で、機械が初めて動くときには誰かが現場に立つ必要があります。当社プラットフォームでよく見られるパターンはハイブリッド型です。開発はリモートで行い、試運転は同じエンジニアが現地に赴くか、現地エンジニアとペアを組んで行い、すべて同じプロジェクトルームで調整されます。',
        },
      ],
    },
    ko: {
      kicker: '직무 · PLC 및 제어',
      title: 'PLC 프로그래머 채용',
      sub: 'Siemens, Rockwell, Mitsubishi, Beckhoff 환경의 래더, 구조화 텍스트, HMI 작업을 위한 사전 심사된 프로그래머 — 귀사의 정확한 컨트롤러에 맞춰 매칭되며, 마일스톤 에스크로로 보호됩니다.',
      lead1:
        'PLC 프로그래머는 설비 사양서를 실제로 작동하는 제어 로직으로 전환합니다. 컨트롤러상의 래더 및 구조화 텍스트, 작업자가 실제로 사용하는 HMI 화면, 드라이브 및 I/O 구성, 그리고 이 모든 것이 실제 조건에서 작동함을 증명하는 시운전까지 포함합니다. 이는 실무 중심의 직무로, 산출물은 문서가 아니라 실제로 작동하는 한 줄의 로직이며, 코드의 품질이 향후 10년간 이 라인의 유지보수 용이성을 좌우합니다.',
      lead2:
        '채용의 어려움은 플랫폼 숙련도에 있습니다. 이력서상의 "PLC 경험"은 그 사람이 귀사의 정확한 설치 환경에서 자신 있게 작업할 수 있는지에 대해 거의 말해주지 않습니다 — Siemens S7-1500 현장과 Rockwell ControlLogix 현장은 명령어 체계, 툴, 습관 면에서 전혀 다른 세계입니다. 저희는 플랫폼 기준으로 매칭하고 실무형 평가로 검증하므로, 귀사는 주장이 아니라 입증된 숙련도를 가진 프로그래머만 걸러낼 수 있습니다.',
      faq: [
        {
          q: 'PLC 프로그래머는 실제로 무엇을 납품합니까?',
          a: '일반적인 작업 범위에는 신규 설비·라인 로직, 개조 및 컨트롤러 마이그레이션, HMI 개발, 고장 복구 및 진단 개선, 현장 시운전 지원이 포함됩니다. TalEngineer에서는 작업 시작 전에 모든 범위를 마일스톤으로 분해하므로, 각 단계의 산출물 — 코드 제출, 시뮬레이션 테스트, 현장 승인 — 이 명확하며 에스크로 해제와 연결됩니다.',
        },
        {
          q: 'PLC 프로그래머와 제어 엔지니어, 어느 쪽이 필요합니까?',
          a: '제어 아키텍처, 패널 설계, 네트워크 구성이 이미 존재하고 로직 작성·테스트·시운전만 필요하다면 PLC 프로그래머가 적합합니다. 기능 사양, 네트워크 아키텍처, 안전 개념, 공급업체 조율, FAT/SAT 등 설계 자체를 책임질 사람이 필요하다면 제어 엔지니어를 찾으셔야 합니다. 많은 프로젝트에서 둘 다 필요하며, 제어 엔지니어가 틀을 정하고 그 안에서 프로그래머가 실행합니다.',
        },
        {
          q: 'TalEngineer는 PLC 프로그래머를 어떻게 검증합니까?',
          a: '모든 엔지니어는 온보딩 과정의 일부로 실무형 AI 기술 스크리닝을 받으며, 그 결과가 프로필의 검증된 점수가 됩니다. 이에 더해 PLC 및 제어 분야에서 3단계(L1–L3) 인증 시험에 응시할 수 있습니다. 시험은 AI로 채점된 후 인증서 발급 전에 플랫폼 관리자가 검토하며, 유효한 플랫폼 인증을 보유한 엔지니어만 귀사의 프로젝트에 공식 배정될 수 있습니다 — PLC 및 제어 분야 인증을 요구하시는 경우에 한합니다.',
        },
        {
          q: 'PLC 프로그래밍은 원격으로 가능합니까?',
          a: '상당 부분은 가능합니다. 로직 개발, HMI 작업, 에뮬레이터 또는 디지털 트윈 테스트는 원격 환경에서도 잘 진행됩니다. 시운전은 예외로, 설비가 처음 가동될 때는 누군가 현장에 있어야 합니다. 저희 플랫폼에서 흔한 방식은 하이브리드형입니다. 개발은 원격으로 진행하고, 시운전은 동일한 엔지니어가 현장에서 직접 수행하거나 현지 엔지니어와 협업하며, 모든 과정은 하나의 프로젝트 룸에서 조율됩니다.',
        },
      ],
    },
  },

  'controls-engineer': {
    track: 'plc',
    name: {
      en: 'Controls Engineer', zh: '控制工程师', es: 'Ingeniero de control', vi: 'Kỹ sư điều khiển',
      hi: 'कंट्रोल्स इंजीनियर', fr: 'Ingénieur automatisme', de: 'Steuerungstechniker', ja: '制御エンジニア', ko: '제어 엔지니어',
    },
    roleSkills: ['Control system architecture', 'Functional specs (FDS)', 'Network design (Profinet / EtherNet-IP)', 'Safety concept (PLe / SIL)', 'FAT / SAT', 'Multi-vendor integration'],
    relatedPlaybookSlugs: ['how-to-hire-a-controls-engineer', 'scada-integrator-due-diligence-checklist', 'siemens-vs-allen-bradley-talent'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a Controls Engineer',
      sub: 'Engineers who own the control system end to end — architecture, specifications, network and safety design, vendor coordination and acceptance sign-off. Verified and escrow-protected.',
      lead1:
        'A controls engineer owns the control system as a system. Where a PLC programmer executes within a defined architecture, the controls engineer defines it: the functional specification, the controller and network architecture, the electrical and safety concept, the interfaces between machines and vendors, and the acceptance tests — FAT and SAT — that decide when the system is actually done. On a greenfield line or a multi-vendor integration, this is the role that keeps twenty moving pieces coherent.',
      lead2:
        'It is also the role where a bad hire costs the most, because the mistakes are architectural: an undersized network, a safety concept bolted on late, interfaces nobody owns until they fail during commissioning. We screen controls engineers on design and integration judgment — not just code — and certify them in the PLC & Controls track at three levels, so you can put verified seniority on the decisions that are hardest to undo.',
      faq: [
        {
          q: 'When do I need a controls engineer rather than a PLC programmer?',
          a: 'When the shape of the system is still open. If you are specifying a new line, coordinating several machine builders, choosing the network and safety architecture, or migrating a plant standard, someone has to own those decisions and their documentation — that is controls engineering. If the design exists and the work is writing and commissioning logic inside it, a PLC programmer is the better-priced fit.',
        },
        {
          q: 'What does a controls engineer typically own on a project?',
          a: 'The functional design specification, controller and network architecture, the safety concept and its required performance levels, I/O and interface definitions between vendors, the FAT/SAT test plans and their sign-off, and technical leadership through commissioning. On milestone-based projects those artifacts — spec approved, design review passed, FAT passed, SAT passed — map naturally onto escrow stages.',
        },
        {
          q: 'Can one controls engineer cover both Siemens and Rockwell environments?',
          a: 'At the architecture level the thinking transfers well — network segmentation, safety design and interface discipline are platform-independent. Implementation detail is not, so on our platform you still filter by the installed base the engineer has actually delivered on. For dual-platform plants, a common pattern is one architecture owner plus platform-specific programmers.',
        },
        {
          q: 'How is a controls engineer engagement structured on TalEngineer?',
          a: 'Like every engagement: scoped into milestones with funds held in escrow and released as each stage is accepted. Design-heavy scopes typically milestone on documents and reviews (spec, design review, FAT) before site work. Verification is the same as all tracks — a practical AI screening at onboarding that sets your verified score, plus PLC & Controls certification at three levels, reviewed by an admin before issue. Only engineers holding a valid platform certification can be officially assigned — in the PLC & Controls track, if the project requires it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣控制工程师',
      sub: '对控制系统端到端负责的工程师——架构、规格书、网络与安全设计、供应商协调、验收签字。经过验证，托管保障。',
      lead1:
        '控制工程师把控制系统当作一个"系统"来负责。PLC 程序员是在既定架构里执行，而控制工程师负责定义这个架构：功能规格书、控制器与网络架构、电气与安全概念、设备与供应商之间的接口，以及决定系统"到底算不算完成"的验收测试——FAT 与 SAT。在一条全新产线或一个多供应商集成项目上，正是这个角色让二十个同时在动的环节保持连贯。',
      lead2:
        '这也是招错人代价最大的职位，因为错误是架构级的：网络容量不够、安全概念事后补丁、没人认领的接口拖到调试时集中爆发。我们在设计与集成判断力上筛选控制工程师——而不只是看代码——并在 PLC 与控制方向按三个级别发放认证，让你把"被验证过的资历"放在那些最难回头的决策上。',
      faq: [
        {
          q: '什么时候该要控制工程师，而不是 PLC 程序员？',
          a: '当系统的形状还没定下来的时候。如果你在规划一条新线、协调多家设备商、选择网络与安全架构、或者迁移工厂标准，就必须有人对这些决策及其文档负责——这就是控制工程。如果设计已经存在，工作是往里写逻辑并调试，那 PLC 程序员是性价比更高的选择。',
        },
        {
          q: '控制工程师在项目上通常负责什么？',
          a: '功能设计规格书(FDS)、控制器与网络架构、安全概念及其所需性能等级、供应商之间的 I/O 与接口定义、FAT/SAT 测试计划及其签字确认、以及贯穿调试期的技术带队。在里程碑制项目上，这些产物——规格书批准、设计评审通过、FAT 通过、SAT 通过——天然对应一个个托管阶段。',
        },
        {
          q: '一位控制工程师能同时覆盖 Siemens 和 Rockwell 环境吗？',
          a: '在架构层面，思维是能迁移的——网络分区、安全设计、接口纪律都与平台无关。但实现细节不通用，所以在平台上你仍应按工程师真正交付过的设备底座来筛选。对双平台工厂，常见做法是一位架构负责人，搭配各平台的专属程序员。',
        },
        {
          q: '在 TalEngineer 上，控制工程师的合作怎么组织？',
          a: '和所有合作一样：拆成里程碑，资金托管，每个阶段验收后放款。设计为主的范围，通常先按文档与评审设里程碑（规格书、设计评审、FAT），再进现场。验证方式与所有方向一致——入驻时的实操型 AI 筛选，结果计入你的筛选分；加上 PLC 与控制方向的三级认证，发证前经管理员复核。只有持有有效平台认证的工程师才能被正式指派——如果项目要求 PLC 与控制方向的证书，须持有该方向证书。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · PLC y control',
      title: 'Contrate a un ingeniero de control',
      sub: 'Ingenieros que asumen el sistema de control de extremo a extremo — arquitectura, especificaciones, diseño de red y de seguridad, coordinación con proveedores y firma de aceptación. Verificados y protegidos por depósito en garantía.',
      lead1:
        'Un ingeniero de control asume el sistema de control como un sistema. Mientras que un programador de PLC ejecuta dentro de una arquitectura ya definida, el ingeniero de control la define: la especificación funcional, la arquitectura del controlador y de la red, el concepto eléctrico y de seguridad, las interfaces entre máquinas y proveedores, y las pruebas de aceptación — FAT y SAT — que determinan cuándo el sistema realmente está terminado. En una línea nueva o en una integración con varios proveedores, este es el puesto que mantiene coherentes veinte piezas en movimiento.',
      lead2:
        'También es el puesto donde una mala contratación cuesta más caro, porque los errores son de arquitectura: una red subdimensionada, un concepto de seguridad añadido a última hora, interfaces que nadie asume hasta que fallan durante la puesta en marcha. Evaluamos a los ingenieros de control por su criterio de diseño e integración — no solo por el código — y los certificamos en la ruta de PLC y control en tres niveles, para que usted pueda respaldar con antigüedad verificada las decisiones más difíciles de revertir.',
      faq: [
        {
          q: '¿Cuándo necesito un ingeniero de control en lugar de un programador de PLC?',
          a: 'Cuando la forma del sistema todavía está abierta. Si está especificando una línea nueva, coordinando a varios fabricantes de máquinas, eligiendo la arquitectura de red y seguridad, o migrando un estándar de planta, alguien tiene que asumir esas decisiones y su documentación — eso es ingeniería de control. Si el diseño ya existe y el trabajo consiste en escribir y poner en marcha la lógica dentro de él, un programador de PLC es la opción con mejor relación costo-beneficio.',
        },
        {
          q: '¿Qué asume normalmente un ingeniero de control en un proyecto?',
          a: 'La especificación de diseño funcional, la arquitectura del controlador y de la red, el concepto de seguridad y sus niveles de desempeño requeridos, las definiciones de E/S e interfaces entre proveedores, los planes de prueba FAT/SAT y su firma de aceptación, y el liderazgo técnico durante toda la puesta en marcha. En proyectos basados en hitos, esos entregables — especificación aprobada, revisión de diseño superada, FAT superado, SAT superado — se corresponden de forma natural con etapas de depósito en garantía.',
        },
        {
          q: '¿Un solo ingeniero de control puede cubrir entornos Siemens y Rockwell?',
          a: 'A nivel de arquitectura, el razonamiento se traslada bien — la segmentación de red, el diseño de seguridad y la disciplina de interfaces son independientes de la plataforma. El detalle de implementación no lo es, así que en nuestra plataforma usted igual filtra por la base instalada en la que el ingeniero realmente ha entregado trabajo. Para plantas con dos plataformas, un patrón común es un responsable único de arquitectura más programadores específicos de cada plataforma.',
        },
        {
          q: '¿Cómo se estructura la colaboración con un ingeniero de control en TalEngineer?',
          a: 'Como cualquier colaboración: delimitada en hitos, con los fondos retenidos en depósito en garantía y liberados a medida que se acepta cada etapa. Los alcances centrados en diseño suelen fijar hitos sobre documentos y revisiones (especificación, revisión de diseño, FAT) antes del trabajo en sitio. La verificación es la misma en todas las rutas — una evaluación práctica con IA en la incorporación que fija su puntuación verificada, más la certificación de PLC y control en tres niveles, revisada por un administrador antes de emitirse. Solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente — en la ruta de PLC y control, si el proyecto lo exige.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · PLC & Điều khiển',
      title: 'Thuê kỹ sư điều khiển',
      sub: 'Kỹ sư chịu trách nhiệm toàn bộ hệ thống điều khiển từ đầu đến cuối — kiến trúc, đặc tả, thiết kế mạng và an toàn, điều phối nhà cung cấp và ký nghiệm thu. Đã xác minh, được bảo vệ bằng ký quỹ.',
      lead1:
        'Kỹ sư điều khiển chịu trách nhiệm về hệ thống điều khiển như một hệ thống hoàn chỉnh. Trong khi lập trình viên PLC thực thi trong một kiến trúc đã được xác định, kỹ sư điều khiển là người định nghĩa ra kiến trúc đó: đặc tả chức năng, kiến trúc bộ điều khiển và mạng, khái niệm điện và an toàn, các giao diện giữa máy móc và nhà cung cấp, cùng các bài kiểm tra nghiệm thu — FAT và SAT — quyết định khi nào hệ thống thực sự hoàn thành. Trên một dây chuyền hoàn toàn mới hoặc một dự án tích hợp nhiều nhà cung cấp, đây là vai trò giữ cho hai mươi mảnh ghép đang chuyển động luôn nhất quán.',
      lead2:
        'Đây cũng là vai trò mà một quyết định tuyển dụng sai lầm phải trả giá đắt nhất, vì những sai sót ở đây mang tính kiến trúc: một mạng thiết kế thiếu công suất, một khái niệm an toàn được gắn thêm vào phút chót, những giao diện không ai nhận trách nhiệm cho đến khi chúng thất bại trong lúc chạy thử. Chúng tôi sàng lọc kỹ sư điều khiển dựa trên khả năng phán đoán thiết kế và tích hợp — chứ không chỉ mã nguồn — và cấp chứng chỉ cho họ trong nhóm PLC & Điều khiển ở ba cấp độ, để bạn có thể đặt niềm tin đã được kiểm chứng vào những quyết định khó đảo ngược nhất.',
      faq: [
        {
          q: 'Khi nào tôi cần kỹ sư điều khiển thay vì lập trình viên PLC?',
          a: 'Khi hình dạng của hệ thống vẫn còn để mở. Nếu bạn đang lập đặc tả cho một dây chuyền mới, điều phối nhiều nhà chế tạo máy, lựa chọn kiến trúc mạng và an toàn, hoặc chuyển đổi một tiêu chuẩn nhà máy, phải có người chịu trách nhiệm về các quyết định đó và tài liệu của chúng — đó là công việc kỹ thuật điều khiển. Nếu thiết kế đã có sẵn và công việc là viết cũng như chạy thử logic bên trong nó, lập trình viên PLC là lựa chọn có chi phí hợp lý hơn.',
        },
        {
          q: 'Kỹ sư điều khiển thường chịu trách nhiệm gì trong một dự án?',
          a: 'Đặc tả thiết kế chức năng, kiến trúc bộ điều khiển và mạng, khái niệm an toàn cùng các mức hiệu năng yêu cầu, định nghĩa I/O và giao diện giữa các nhà cung cấp, các kế hoạch kiểm tra FAT/SAT và việc ký nghiệm thu, cùng vai trò dẫn dắt kỹ thuật xuyên suốt quá trình chạy thử. Trên các dự án theo cột mốc, những sản phẩm đó — đặc tả được duyệt, đánh giá thiết kế đạt, FAT đạt, SAT đạt — tự nhiên ánh xạ thành các giai đoạn ký quỹ.',
        },
        {
          q: 'Một kỹ sư điều khiển có thể bao quát cả môi trường Siemens và Rockwell không?',
          a: 'Ở cấp độ kiến trúc, tư duy chuyển giao khá tốt — phân đoạn mạng, thiết kế an toàn và kỷ luật giao diện đều độc lập với nền tảng. Chi tiết triển khai thì không, vì vậy trên nền tảng của chúng tôi bạn vẫn nên lọc theo hệ thống đã lắp đặt mà kỹ sư thực sự từng bàn giao. Với các nhà máy dùng hai nền tảng, mô hình phổ biến là một người phụ trách kiến trúc chung cộng thêm các lập trình viên chuyên từng nền tảng.',
        },
        {
          q: 'Việc hợp tác với kỹ sư điều khiển trên TalEngineer được tổ chức như thế nào?',
          a: 'Giống như mọi hợp tác khác: được xác định phạm vi thành các cột mốc, tiền được giữ trong ký quỹ và giải ngân khi mỗi giai đoạn được chấp nhận. Các phạm vi nặng về thiết kế thường đặt cột mốc theo tài liệu và các buổi đánh giá (đặc tả, đánh giá thiết kế, FAT) trước khi làm việc tại hiện trường. Việc xác minh giống như mọi nhóm khác — một bài sàng lọc thực hành bằng AI khi gia nhập để xác định điểm đã xác minh của bạn, cộng với chứng chỉ PLC & Điều khiển ở ba cấp độ, được quản trị viên xem xét trước khi cấp. Chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức — trong nhóm PLC & Điều khiển, nếu dự án yêu cầu.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · PLC व कंट्रोल',
      title: 'कंट्रोल्स इंजीनियर हायर करें',
      sub: 'वे इंजीनियर जो कंट्रोल सिस्टम को शुरू से आख़िर तक ओन करते हैं — आर्किटेक्चर, स्पेसिफिकेशन, नेटवर्क व सेफ़्टी डिज़ाइन, वेंडर कोऑर्डिनेशन और एक्सेप्टेंस साइन-ऑफ़। वेरिफ़ाइड और एस्क्रो-प्रोटेक्टेड।',
      lead1:
        'एक कंट्रोल्स इंजीनियर कंट्रोल सिस्टम को एक पूरे सिस्टम के तौर पर ओन करता है। जहाँ एक PLC प्रोग्रामर एक पहले से तय आर्किटेक्चर के भीतर काम करता है, वहीं कंट्रोल्स इंजीनियर उस आर्किटेक्चर को डिफ़ाइन करता है: फ़ंक्शनल स्पेसिफिकेशन, कंट्रोलर व नेटवर्क आर्किटेक्चर, इलेक्ट्रिकल व सेफ़्टी कॉन्सेप्ट, मशीनों व वेंडरों के बीच के इंटरफ़ेस, और वे एक्सेप्टेंस टेस्ट — FAT और SAT — जो तय करते हैं कि सिस्टम असल में पूरा कब हुआ। किसी ग्रीनफ़ील्ड लाइन या मल्टी-वेंडर इंटीग्रेशन पर, यही वह भूमिका है जो बीस चलती-फिरती चीज़ों को एक साथ जोड़े रखती है।',
      lead2:
        'यह वह भूमिका भी है जहाँ ग़लत हायर सबसे ज़्यादा महंगा पड़ता है, क्योंकि गलतियाँ आर्किटेक्चरल होती हैं: एक कमज़ोर नेटवर्क, देर से जोड़ा गया सेफ़्टी कॉन्सेप्ट, ऐसे इंटरफ़ेस जिन्हें कोई ओन नहीं करता जब तक वे कमीशनिंग के दौरान फेल न हो जाएँ। हम कंट्रोल्स इंजीनियरों को डिज़ाइन व इंटीग्रेशन जजमेंट पर स्क्रीन करते हैं — सिर्फ़ कोड पर नहीं — और उन्हें PLC व कंट्रोल ट्रैक में तीन स्तरों पर प्रमाणित करते हैं, ताकि आप उन फ़ैसलों पर वेरिफ़ाइड सीनियोरिटी रख सकें जिन्हें पलटना सबसे मुश्किल होता है।',
      faq: [
        {
          q: 'मुझे PLC प्रोग्रामर की बजाय कंट्रोल्स इंजीनियर कब चाहिए?',
          a: 'जब सिस्टम का आकार अभी तय नहीं हुआ हो। अगर आप एक नई लाइन स्पेसिफ़ाई कर रहे हैं, कई मशीन बिल्डरों को कोऑर्डिनेट कर रहे हैं, नेटवर्क व सेफ़्टी आर्किटेक्चर चुन रहे हैं, या किसी प्लांट स्टैंडर्ड को माइग्रेट कर रहे हैं, तो किसी को इन फ़ैसलों और इनके दस्तावेज़ीकरण को ओन करना ही पड़ता है — यही कंट्रोल्स इंजीनियरिंग है। अगर डिज़ाइन पहले से मौजूद है और काम उसके भीतर लॉजिक लिखने व कमीशन करने का है, तो PLC प्रोग्रामर बेहतर कीमत वाला विकल्प है।',
        },
        {
          q: 'एक कंट्रोल्स इंजीनियर आमतौर पर किसी प्रोजेक्ट पर क्या ओन करता है?',
          a: 'फ़ंक्शनल डिज़ाइन स्पेसिफिकेशन, कंट्रोलर व नेटवर्क आर्किटेक्चर, सेफ़्टी कॉन्सेप्ट और उसके ज़रूरी परफ़ॉर्मेंस लेवल, वेंडरों के बीच I/O व इंटरफ़ेस डेफ़िनिशन, FAT/SAT टेस्ट प्लान और उनका साइन-ऑफ़, और कमीशनिंग तक का टेक्निकल लीडरशिप। माइलस्टोन-आधारित प्रोजेक्ट्स पर ये डिलिवरेबल्स — स्पेक अप्रूव्ड, डिज़ाइन रिव्यू पास, FAT पास, SAT पास — स्वाभाविक रूप से एस्क्रो के चरणों से मैप हो जाते हैं।',
        },
        {
          q: 'क्या एक ही कंट्रोल्स इंजीनियर Siemens और Rockwell दोनों माहौल कवर कर सकता है?',
          a: 'आर्किटेक्चर लेवल पर सोच काफ़ी हद तक ट्रांसफ़र होती है — नेटवर्क सेगमेंटेशन, सेफ़्टी डिज़ाइन और इंटरफ़ेस डिसिप्लिन प्लेटफ़ॉर्म-इंडिपेंडेंट होते हैं। इम्प्लीमेंटेशन डिटेल ऐसी नहीं होती, इसलिए हमारे प्लेटफ़ॉर्म पर भी आप उसी इंस्टॉल्ड बेस के हिसाब से फ़िल्टर करते हैं जिस पर इंजीनियर ने वाकई डिलिवर किया हो। डुअल-प्लेटफ़ॉर्म प्लांट्स के लिए, आम पैटर्न एक आर्किटेक्चर ओनर प्लस प्लेटफ़ॉर्म-स्पेसिफ़िक प्रोग्रामर होता है।',
        },
        {
          q: 'TalEngineer पर कंट्रोल्स इंजीनियर के साथ काम कैसे स्ट्रक्चर्ड होता है?',
          a: 'हर एंगेजमेंट की तरह ही: माइलस्टोन में स्कोप किया गया, फंड एस्क्रो में रखे गए और हर चरण एक्सेप्ट होते ही रिलीज़ किए गए। डिज़ाइन-हेवी स्कोप आमतौर पर साइट वर्क से पहले डॉक्यूमेंट्स व रिव्यू (स्पेक, डिज़ाइन रिव्यू, FAT) पर माइलस्टोन रखते हैं। वेरिफ़िकेशन बाक़ी सभी ट्रैक जैसा ही है — ऑनबोर्डिंग पर एक व्यावहारिक AI स्क्रीनिंग जो आपका सत्यापित स्कोर तय करती है, साथ ही तीन स्तरों पर PLC व कंट्रोल प्रमाणन, जिसे जारी करने से पहले एक एडमिन रिव्यू करता है। केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही आधिकारिक रूप से असाइन किए जा सकते हैं — PLC व कंट्रोल ट्रैक में, अगर प्रोजेक्ट को इसकी ज़रूरत हो।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · PLC & Contrôle-commande',
      title: 'Recrutez un ingénieur automatisme',
      sub: "Des ingénieurs qui prennent en charge le système de commande de bout en bout — architecture, spécifications, conception réseau et sécurité, coordination des fournisseurs et validation de réception. Vérifiés et protégés par séquestre.",
      lead1:
        "Un ingénieur automatisme prend en charge le système de commande en tant que système. Là où un programmeur PLC exécute au sein d'une architecture définie, l'ingénieur automatisme la définit : la spécification fonctionnelle, l'architecture du contrôleur et du réseau, le concept électrique et de sécurité, les interfaces entre machines et fournisseurs, et les tests de réception — FAT et SAT — qui déterminent quand le système est réellement terminé. Sur une ligne neuve ou une intégration multi-fournisseurs, c'est ce poste qui maintient vingt éléments mobiles cohérents entre eux.",
      lead2:
        "C'est aussi le poste où un mauvais recrutement coûte le plus cher, car les erreurs y sont architecturales : un réseau sous-dimensionné, un concept de sécurité rajouté tardivement, des interfaces que personne ne prend en charge jusqu'à ce qu'elles échouent en cours de mise en service. Nous évaluons les ingénieurs automatisme sur leur jugement en conception et en intégration — pas seulement sur le code — et les certifions dans la filière PLC & Contrôle-commande à trois niveaux, afin que vous puissiez confier à une expérience vérifiée les décisions les plus difficiles à défaire.",
      faq: [
        {
          q: "Quand ai-je besoin d'un ingénieur automatisme plutôt que d'un programmeur PLC ?",
          a: "Quand la forme du système est encore ouverte. Si vous spécifiez une ligne neuve, coordonnez plusieurs constructeurs de machines, choisissez l'architecture réseau et sécurité, ou migrez un standard d'usine, quelqu'un doit prendre en charge ces décisions et leur documentation — c'est l'ingénierie automatisme. Si la conception existe déjà et que le travail consiste à écrire et mettre en service la logique à l'intérieur, un programmeur PLC est l'option la mieux tarifée.",
        },
        {
          q: 'Que prend en charge typiquement un ingénieur automatisme sur un projet ?',
          a: "La spécification de conception fonctionnelle, l'architecture du contrôleur et du réseau, le concept de sécurité et ses niveaux de performance requis, les définitions d'E/S et d'interfaces entre fournisseurs, les plans de test FAT/SAT et leur validation, ainsi que la direction technique jusqu'à la mise en service. Sur les projets organisés par jalons, ces livrables — spécification approuvée, revue de conception validée, FAT réussi, SAT réussi — se traduisent naturellement en étapes de séquestre.",
        },
        {
          q: 'Un même ingénieur automatisme peut-il couvrir les environnements Siemens et Rockwell ?',
          a: "Au niveau de l'architecture, le raisonnement se transpose bien — la segmentation réseau, la conception de sécurité et la discipline des interfaces sont indépendantes de la plateforme. Le détail de mise en œuvre ne l'est pas, donc sur notre plateforme vous filtrez tout de même selon le parc installé sur lequel l'ingénieur a réellement livré. Pour les usines à double plateforme, un schéma courant est un responsable d'architecture unique associé à des programmeurs spécifiques à chaque plateforme.",
        },
        {
          q: "Comment est structurée une mission d'ingénieur automatisme sur TalEngineer ?",
          a: "Comme toute mission : découpée en jalons, avec les fonds détenus sous séquestre et libérés à mesure que chaque étape est acceptée. Les périmètres à forte composante de conception fixent généralement des jalons sur les documents et les revues (spécification, revue de conception, FAT) avant le travail sur site. La vérification est la même pour toutes les filières — une évaluation pratique par IA lors de l'intégration qui établit votre score vérifié, plus la certification PLC & Contrôle-commande à trois niveaux, vérifiée par un administrateur avant délivrance. Seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés — dans la filière PLC & Contrôle-commande, si le projet l'exige.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · PLC & Steuerungstechnik',
      title: 'Steuerungstechniker engagieren',
      sub: 'Ingenieure, die das Steuerungssystem end-to-end verantworten — Architektur, Spezifikationen, Netzwerk- und Sicherheitsdesign, Lieferantenkoordination und Abnahmefreigabe. Verifiziert und durch Treuhand abgesichert.',
      lead1:
        'Ein Steuerungstechniker verantwortet das Steuerungssystem als Ganzes. Während ein PLC-Programmierer innerhalb einer festgelegten Architektur arbeitet, definiert der Steuerungstechniker diese Architektur: die Funktionsspezifikation, die Steuerungs- und Netzwerkarchitektur, das elektrische und sicherheitstechnische Konzept, die Schnittstellen zwischen Maschinen und Lieferanten sowie die Abnahmetests — FAT und SAT —, die entscheiden, wann das System tatsächlich fertig ist. Bei einer Neuanlage oder einer Integration mit mehreren Lieferanten ist dies die Rolle, die zwanzig bewegliche Teile zusammenhält.',
      lead2:
        'Es ist auch die Rolle, bei der eine Fehlbesetzung am teuersten wird, weil die Fehler architektonisch sind: ein zu klein dimensioniertes Netzwerk, ein nachträglich angeflicktes Sicherheitskonzept, Schnittstellen, die niemand verantwortet, bis sie während der Inbetriebnahme versagen. Wir prüfen Steuerungstechniker anhand ihres Urteilsvermögens bei Design und Integration — nicht nur anhand von Code — und zertifizieren sie im Bereich PLC & Steuerungstechnik auf drei Stufen, sodass Sie verifizierte Erfahrung genau bei den Entscheidungen einsetzen können, die am schwersten rückgängig zu machen sind.',
      faq: [
        {
          q: 'Wann brauche ich einen Steuerungstechniker statt eines PLC-Programmierers?',
          a: 'Wenn die Form des Systems noch offen ist. Wenn Sie eine neue Linie spezifizieren, mehrere Maschinenbauer koordinieren, die Netzwerk- und Sicherheitsarchitektur wählen oder einen Anlagenstandard migrieren, muss jemand diese Entscheidungen und ihre Dokumentation verantworten — das ist Steuerungstechnik. Wenn das Design bereits existiert und die Arbeit darin besteht, die Logik zu schreiben und in Betrieb zu nehmen, ist ein PLC-Programmierer die preislich passendere Wahl.',
        },
        {
          q: 'Was verantwortet ein Steuerungstechniker typischerweise in einem Projekt?',
          a: 'Die funktionale Designspezifikation, die Steuerungs- und Netzwerkarchitektur, das Sicherheitskonzept mit den erforderlichen Performance Levels, die I/O- und Schnittstellendefinitionen zwischen Lieferanten, die FAT/SAT-Testpläne mit ihrer Freigabe sowie die technische Leitung bis zur Inbetriebnahme. Bei meilensteinbasierten Projekten lassen sich diese Ergebnisse — Spezifikation freigegeben, Design-Review bestanden, FAT bestanden, SAT bestanden — natürlich auf Treuhand-Etappen abbilden.',
        },
        {
          q: 'Kann ein einzelner Steuerungstechniker sowohl Siemens- als auch Rockwell-Umgebungen abdecken?',
          a: 'Auf Architekturebene lässt sich das Denken gut übertragen — Netzwerksegmentierung, Sicherheitsdesign und Schnittstellendisziplin sind plattformunabhängig. Die Implementierungsdetails sind es nicht, daher filtern Sie auch auf unserer Plattform weiterhin nach der installierten Basis, auf der der Ingenieur tatsächlich geliefert hat. Bei Anlagen mit zwei Plattformen ist ein gängiges Muster ein zentraler Architekturverantwortlicher plus plattformspezifische Programmierer.',
        },
        {
          q: 'Wie ist ein Auftrag für einen Steuerungstechniker bei TalEngineer strukturiert?',
          a: 'Wie jeder Auftrag: in Meilensteine gegliedert, mit Mitteln, die treuhänderisch gehalten und bei Abnahme jeder Etappe freigegeben werden. Designlastige Aufgabenbereiche setzen Meilensteine meist auf Dokumente und Reviews (Spezifikation, Design-Review, FAT), bevor die Arbeit vor Ort beginnt. Die Verifizierung ist wie bei allen Bereichen: ein praxisnahes KI-Assessment beim Onboarding, das Ihren verifizierten Score festlegt, plus PLC-&-Steuerungstechnik-Zertifizierung auf drei Stufen, die vor Ausstellung von einem Administrator geprüft wird. Nur Ingenieure mit gültiger Plattformzertifizierung können offiziell zugewiesen werden — im Bereich PLC & Steuerungstechnik, sofern das Projekt dies verlangt.',
        },
      ],
    },
    ja: {
      kicker: '職種 · PLC & 制御',
      title: '制御エンジニアを採用',
      sub: 'アーキテクチャ、仕様書、ネットワークと安全設計、ベンダー調整、受け入れサインオフまで、制御システムをエンドツーエンドで担うエンジニア。検証済みでエスクローによって保護されます。',
      lead1:
        '制御エンジニアは制御システムを一つのシステムとして担います。PLCプログラマーが定義済みのアーキテクチャの中で実行するのに対し、制御エンジニアはそのアーキテクチャそのものを定義します——機能仕様書、コントローラーとネットワークのアーキテクチャ、電気と安全のコンセプト、機械とベンダー間のインターフェース、そしてシステムが実際に完成したかどうかを決めるFATとSATという受け入れテストです。グリーンフィールドのラインや複数ベンダーによる統合案件では、この役割こそが二十もの動く部品を一貫させ続けます。',
      lead2:
        'また、採用を誤った場合に最もコストがかかる役割でもあります。なぜならミスはアーキテクチャレベルで起きるからです——容量不足のネットワーク、後から付け足された安全コンセプト、試運転中に失敗するまで誰も担当していないインターフェース。当社はコードだけでなく、設計と統合における判断力を基準に制御エンジニアを審査し、PLC & 制御分野で3つのレベルの認定を発行します。これにより、最も取り返しのつかない意思決定に検証済みの経験を裏付けとして活用できます。',
      faq: [
        {
          q: 'PLCプログラマーではなく制御エンジニアが必要なのはどんな時ですか？',
          a: 'システムの形がまだ固まっていない時です。新しいラインを仕様化している、複数の機械メーカーを調整している、ネットワークと安全のアーキテクチャを選定している、あるいは工場の標準を移行している場合、誰かがそれらの意思決定とその文書化を担う必要があります——それが制御エンジニアリングです。設計がすでに存在し、その中でロジックを書いて試運転するだけの作業であれば、PLCプログラマーの方が費用対効果に優れた選択肢です。',
        },
        {
          q: '制御エンジニアはプロジェクトで通常何を担当しますか？',
          a: '機能設計仕様書、コントローラーとネットワークのアーキテクチャ、安全コンセプトとその要求性能レベル、ベンダー間のI/Oとインターフェースの定義、FAT/SATのテスト計画とそのサインオフ、そして試運転までの技術的なリーダーシップです。マイルストーン制のプロジェクトでは、これらの成果物——仕様承認、設計レビュー合格、FAT合格、SAT合格——は自然にエスクローの各段階に対応します。',
        },
        {
          q: '一人の制御エンジニアがSiemensとRockwell両方の環境をカバーできますか？',
          a: 'アーキテクチャレベルでは考え方はよく通用します——ネットワークのセグメント化、安全設計、インターフェースの規律はプラットフォームに依存しません。実装の詳細はそうではないため、当社プラットフォームでも、エンジニアが実際に納品実績を持つ設備構成で絞り込むことになります。デュアルプラットフォームの工場では、アーキテクチャ責任者を1人置き、プラットフォームごとの専属プログラマーを組み合わせるのが一般的なパターンです。',
        },
        {
          q: 'TalEngineerでは制御エンジニアとの契約はどのように構成されますか？',
          a: '他のすべての契約と同様です——マイルストーンに範囲分けされ、資金はエスクローで保持され、各段階が承認されるたびに解放されます。設計中心の作業範囲は、現場作業の前に文書とレビュー（仕様書、設計レビュー、FAT）でマイルストーンを設定するのが一般的です。検証はすべての分野と同じです——オンボーディング時の実践的なAIスクリーニングで検証済みスコアが決まり、さらにPLC & 制御分野の3レベルの認定は発行前に管理者がレビューします。有効なプラットフォーム認定を保有するエンジニアのみが正式にアサインされます——プロジェクトがPLC & 制御分野の認定を要求する場合は、その認定が必要です。',
        },
      ],
    },
    ko: {
      kicker: '직무 · PLC 및 제어',
      title: '제어 엔지니어 채용',
      sub: '아키텍처, 사양, 네트워크 및 안전 설계, 공급업체 조율, 승인 서명까지 제어 시스템을 처음부터 끝까지 책임지는 엔지니어. 검증되었으며 에스크로로 보호됩니다.',
      lead1:
        '제어 엔지니어는 제어 시스템을 하나의 시스템으로서 책임집니다. PLC 프로그래머가 정해진 아키텍처 안에서 실행한다면, 제어 엔지니어는 그 아키텍처 자체를 정의합니다 — 기능 사양, 컨트롤러 및 네트워크 아키텍처, 전기 및 안전 개념, 설비와 공급업체 간의 인터페이스, 그리고 시스템이 실제로 완료되었는지를 결정하는 FAT와 SAT 승인 테스트입니다. 신규 라인이나 다중 공급업체 통합 프로젝트에서, 이 역할이 바로 스무 개의 움직이는 요소를 일관되게 유지하는 역할입니다.',
      lead2:
        '또한 잘못된 채용이 가장 큰 비용을 초래하는 역할이기도 합니다. 실수가 아키텍처 수준에서 발생하기 때문입니다 — 용량이 부족한 네트워크, 뒤늦게 덧붙여진 안전 개념, 시운전 중 실패할 때까지 아무도 책임지지 않는 인터페이스. 저희는 코드뿐 아니라 설계 및 통합 판단력을 기준으로 제어 엔지니어를 심사하며, PLC 및 제어 분야에서 3단계로 인증합니다. 이를 통해 가장 되돌리기 어려운 결정에 검증된 경력을 뒷받침할 수 있습니다.',
      faq: [
        {
          q: 'PLC 프로그래머 대신 제어 엔지니어가 필요한 경우는 언제입니까?',
          a: '시스템의 형태가 아직 정해지지 않았을 때입니다. 새로운 라인을 규정하거나, 여러 설비 제작업체를 조율하거나, 네트워크 및 안전 아키텍처를 선택하거나, 공장 표준을 마이그레이션하는 경우 누군가가 이러한 결정과 그 문서화를 책임져야 합니다 — 이것이 제어 엔지니어링입니다. 설계가 이미 존재하고 그 안에서 로직을 작성하고 시운전하는 작업이라면, PLC 프로그래머가 더 합리적인 비용의 선택입니다.',
        },
        {
          q: '제어 엔지니어는 프로젝트에서 일반적으로 무엇을 책임집니까?',
          a: '기능 설계 사양, 컨트롤러 및 네트워크 아키텍처, 안전 개념과 요구되는 성능 등급, 공급업체 간 I/O 및 인터페이스 정의, FAT/SAT 테스트 계획과 그 승인, 그리고 시운전까지의 기술 리더십입니다. 마일스톤 기반 프로젝트에서는 이러한 산출물 — 사양 승인, 설계 검토 통과, FAT 통과, SAT 통과 — 이 자연스럽게 에스크로 단계에 대응됩니다.',
        },
        {
          q: '한 명의 제어 엔지니어가 Siemens와 Rockwell 환경을 모두 다룰 수 있습니까?',
          a: '아키텍처 수준에서는 사고방식이 잘 전이됩니다 — 네트워크 세분화, 안전 설계, 인터페이스 규율은 플랫폼과 무관합니다. 구현 세부사항은 그렇지 않으므로, 저희 플랫폼에서도 엔지니어가 실제로 납품한 설치 환경을 기준으로 필터링하게 됩니다. 이중 플랫폼 공장의 경우, 아키텍처 담당자 한 명에 플랫폼별 전담 프로그래머를 두는 방식이 일반적입니다.',
        },
        {
          q: 'TalEngineer에서 제어 엔지니어와의 협업은 어떻게 구성됩니까?',
          a: '모든 협업과 마찬가지입니다 — 마일스톤으로 범위가 나뉘고, 자금은 에스크로에 보관되며 각 단계가 승인될 때마다 해제됩니다. 설계 비중이 큰 작업 범위는 대개 현장 작업 전에 문서와 검토(사양, 설계 검토, FAT)를 기준으로 마일스톤을 설정합니다. 검증 방식은 모든 분야와 동일합니다 — 온보딩 시 실무형 AI 스크리닝으로 검증된 점수가 정해지고, PLC 및 제어 3단계 인증은 발급 전에 관리자가 검토합니다. 유효한 플랫폼 인증을 보유한 엔지니어만 공식적으로 배정될 수 있습니다 — 프로젝트가 PLC 및 제어 분야 인증을 요구하는 경우에 한합니다.',
        },
      ],
    },
  },

  'robotics-engineer': {
    track: 'robotics',
    name: {
      en: 'Robotics Engineer', zh: '机器人工程师', es: 'Ingeniero de robótica', vi: 'Kỹ sư robot',
      hi: 'रोबोटिक्स इंजीनियर', fr: 'Ingénieur robotique', de: 'Robotik-Ingenieur', ja: 'ロボティクスエンジニア', ko: '로보틱스 엔지니어',
    },
    roleSkills: ['Fanuc / KUKA / ABB / Yaskawa', 'Offline programming & simulation', 'Cell layout & reach studies', 'EOAT & tooling integration', 'Robot–PLC integration', 'Cycle-time optimization'],
    relatedPlaybookSlugs: ['robot-cell-commissioning-guide', 'platform-certification-explained'],
    en: {
      kicker: 'Role · Robotics',
      title: 'Hire a Robotics Engineer',
      sub: 'Fanuc, KUKA, ABB and Yaskawa specialists for cell design, offline programming and on-site commissioning — verified on real cell problems, protected by milestone escrow.',
      lead1:
        'A robotics engineer carries a cell from concept to production: layout and reach studies, simulation and offline programming, end-of-arm tooling integration, the robot–PLC handshake, safety configuration, and the teach-and-tune work on site that turns a simulated cycle into a real one. The robot is the easy part — the job is everything around it: fixturing, part presentation, peripherals and the seconds hiding in the path.',
      lead2:
        'Hiring is complicated by the fact that robot brands are genuinely different platforms — Fanuc, KUKA, ABB and Yaskawa each have their own controllers, languages and habits, and commissioning is high-pressure, public work where mistakes are expensive. We screen robotics engineers on real path, tooling and integration problems, and certify them at three levels so you can match seniority to the risk of the job.',
      faq: [
        {
          q: 'What does a robotics engineer do beyond programming the robot?',
          a: 'Most of the value sits around the robot: cell layout and reach validation, EOAT selection and integration, gripping and part-presentation strategy, robot-to-PLC and safety integration, cycle-time analysis, and commissioning. A cell that merely moves is a demo; a cell that holds cycle time with the fixturing and peripherals it actually has is engineering.',
        },
        {
          q: 'Do I need a brand-specific engineer?',
          a: 'For programming and commissioning, usually yes — Fanuc TP/KAREL, KUKA KRL and ABB RAPID are different languages on different controllers, and fluency on your brand shows up directly in commissioning speed. For concept and layout work the thinking transfers better. On TalEngineer you filter by the brands an engineer has been screened on, not by a generic "robotics" checkbox.',
        },
        {
          q: 'Which parts of robot work can be done remotely?',
          a: 'Simulation, offline programming and cell-design reviews travel well — a large share of program structure can exist before anyone touches the real cell. Teach-in, collision-critical tuning and commissioning are on-site by nature. The common split on our platform: OLP and design remote, with the commissioning trip scoped as its own milestone.',
        },
        {
          q: 'How does TalEngineer verify a robotics engineer?',
          a: 'Every engineer takes a practical AI technical screener at onboarding, which sets the verified score on their profile, and can certify in the Robotics track at three levels (L1–L3) — from executing well-defined cell work to designing complex, multi-robot cells. Exams are AI-scored and admin-reviewed before a certificate is issued, and only engineers holding a valid platform certification can be officially assigned to projects — in the Robotics track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 机器人',
      title: '雇佣机器人工程师',
      sub: 'Fanuc、KUKA、ABB、Yaskawa 专家，负责工作站设计、离线编程与现场调试——在真实工作站问题上验证，里程碑托管保障。',
      lead1:
        '机器人工程师把一个工作站从概念带到量产：布局与可达性分析、仿真与离线编程、末端工具(EOAT)集成、机器人与 PLC 的握手、安全配置，以及现场的示教与调优——把仿真里的节拍变成真实的节拍。机器人本体是最简单的部分——这份工作的重头在它周围：工装、来料呈现、外围设备，以及藏在路径里的那几秒钟。',
      lead2:
        '招聘的复杂之处在于，机器人品牌是真正不同的平台——Fanuc、KUKA、ABB、Yaskawa 各有自己的控制器、语言和习惯；而调试又是高压、众目睽睽、出错代价高昂的活。我们在真实的路径、工装与集成问题上筛选机器人工程师，并按三个级别发放认证，让你按任务风险匹配资历。',
      faq: [
        {
          q: '除了给机器人编程，机器人工程师还做什么？',
          a: '大部分价值都在机器人之外：工作站布局与可达性验证、EOAT 选型与集成、抓取与来料呈现策略、机器人-PLC 与安全集成、节拍分析、以及调试。一个"能动"的工作站只是 demo；一个带着真实工装与外围设备还守得住节拍的工作站，才是工程。',
        },
        {
          q: '我需要按品牌找工程师吗？',
          a: '编程与调试环节，通常需要——Fanuc TP/KAREL、KUKA KRL、ABB RAPID 是跑在不同控制器上的不同语言，对你所用品牌的熟练度会直接体现在调试速度上。概念与布局阶段的思维则更通用。在 TalEngineer 上，你按工程师被筛选验证过的品牌来过滤，而不是按一个笼统的"会机器人"勾选框。',
        },
        {
          q: '机器人工作哪些部分能远程做？',
          a: '仿真、离线编程(OLP)与工作站设计评审远程做得很好——在任何人碰真实工作站之前，程序结构的很大一部分就能成型。示教、碰撞敏感的调优与调试则天然要在现场。平台上常见的分工：OLP 与设计远程完成，调试行程单独立项为一个里程碑。',
        },
        {
          q: 'TalEngineer 怎么验证机器人工程师？',
          a: '每位工程师在入驻时都要通过实操型 AI 技术筛选，结果成为档案上的筛选分，并可在机器人方向考取三个级别（L1–L3）的认证——从执行范围明确的工作站工作，到设计复杂的多机器人工作站。考试由 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派到项目——如要求机器人方向证书，须持有该方向证书。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · Robótica',
      title: 'Contrate a un ingeniero de robótica',
      sub: 'Especialistas en Fanuc, KUKA, ABB y Yaskawa para diseño de celdas, programación offline y puesta en marcha en sitio — verificados con problemas reales de celda, protegidos por depósito en garantía por hitos.',
      lead1:
        'Un ingeniero de robótica lleva una celda desde el concepto hasta la producción: estudios de layout y alcance, simulación y programación offline, integración de herramental de muñeca (EOAT), el enlace robot-PLC, configuración de seguridad, y el trabajo de teach-in y ajuste en sitio que convierte un ciclo simulado en uno real. El robot es la parte fácil — el trabajo está en todo lo que lo rodea: utillaje, presentación de piezas, periféricos y los segundos que se esconden en la trayectoria.',
      lead2:
        'La contratación se complica porque las marcas de robots son plataformas genuinamente distintas — Fanuc, KUKA, ABB y Yaskawa tienen cada una sus propios controladores, lenguajes y hábitos, y la puesta en marcha es un trabajo público y de alta presión donde los errores salen caros. Evaluamos a los ingenieros de robótica con problemas reales de trayectoria, herramental e integración, y los certificamos en tres niveles para que usted pueda ajustar la antigüedad al riesgo del trabajo.',
      faq: [
        {
          q: '¿Qué hace un ingeniero de robótica además de programar el robot?',
          a: 'La mayor parte del valor está alrededor del robot: layout de celda y validación de alcance, selección e integración de herramental de muñeca (EOAT), estrategia de sujeción y presentación de piezas, integración robot-PLC y de seguridad, análisis de tiempo de ciclo, y puesta en marcha. Una celda que simplemente se mueve es una demo; una celda que sostiene el tiempo de ciclo con el utillaje y los periféricos que realmente tiene es ingeniería.',
        },
        {
          q: '¿Necesito un ingeniero especializado en una marca específica?',
          a: 'Para programación y puesta en marcha, normalmente sí — Fanuc TP/KAREL, KUKA KRL y ABB RAPID son lenguajes distintos en controladores distintos, y el dominio de su marca se traduce directamente en velocidad de puesta en marcha. Para el trabajo conceptual y de layout, el razonamiento se traslada mejor. En TalEngineer usted filtra por las marcas en las que un ingeniero ha sido evaluado, no por una casilla genérica de "robótica".',
        },
        {
          q: '¿Qué partes del trabajo de robótica se pueden hacer de forma remota?',
          a: 'La simulación, la programación offline y las revisiones de diseño de celda funcionan bien de forma remota — gran parte de la estructura del programa puede existir antes de que alguien toque la celda real. El teach-in, el ajuste crítico ante colisiones y la puesta en marcha son inherentemente presenciales. La división común en nuestra plataforma: OLP y diseño remotos, con el viaje de puesta en marcha delimitado como su propio hito.',
        },
        {
          q: '¿Cómo verifica TalEngineer a un ingeniero de robótica?',
          a: 'Cada ingeniero realiza una evaluación técnica práctica con IA en su incorporación, que fija la puntuación verificada de su perfil, y puede certificarse en la ruta de Robótica en tres niveles (L1–L3) — desde ejecutar trabajo de celda bien definido hasta diseñar celdas complejas con múltiples robots. Los exámenes son calificados por IA y revisados por un administrador antes de emitir el certificado, y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente a proyectos — en la ruta de Robótica, si usted lo exige.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · Robot công nghiệp',
      title: 'Thuê kỹ sư robot',
      sub: 'Chuyên gia Fanuc, KUKA, ABB và Yaskawa cho thiết kế tế bào robot, lập trình offline và chạy thử tại hiện trường — đã được xác minh trên các bài toán tế bào robot thực tế, được bảo vệ bằng ký quỹ theo cột mốc.',
      lead1:
        'Một kỹ sư robot đưa một tế bào robot từ ý tưởng đến sản xuất: nghiên cứu bố trí và tầm với, mô phỏng và lập trình offline, tích hợp công cụ đầu cánh tay (EOAT), việc bắt tay giữa robot và PLC, cấu hình an toàn, và công việc dạy lệnh (teach-in) cùng tinh chỉnh tại hiện trường để biến một chu trình mô phỏng thành một chu trình thực tế. Robot là phần dễ nhất — công việc thực sự nằm ở mọi thứ xung quanh nó: đồ gá, cách trình bày chi tiết gia công, thiết bị ngoại vi và những giây bị giấu trong đường chạy.',
      lead2:
        'Việc tuyển dụng trở nên phức tạp vì các thương hiệu robot thực sự là những nền tảng khác nhau — Fanuc, KUKA, ABB và Yaskawa mỗi hãng đều có bộ điều khiển, ngôn ngữ và thói quen riêng, và chạy thử là công việc áp lực cao, công khai, nơi sai sót phải trả giá đắt. Chúng tôi sàng lọc kỹ sư robot dựa trên các bài toán thực tế về đường chạy, đồ gá và tích hợp, và cấp chứng chỉ cho họ ở ba cấp độ để bạn có thể khớp mức độ kinh nghiệm với rủi ro của công việc.',
      faq: [
        {
          q: 'Ngoài lập trình robot, kỹ sư robot còn làm gì?',
          a: 'Phần lớn giá trị nằm xung quanh robot: bố trí tế bào và xác nhận tầm với, lựa chọn và tích hợp công cụ đầu cánh tay (EOAT), chiến lược kẹp và trình bày chi tiết gia công, tích hợp robot-PLC và an toàn, phân tích thời gian chu trình, và chạy thử. Một tế bào chỉ đơn thuần chuyển động là một bản demo; một tế bào giữ được thời gian chu trình với đồ gá và thiết bị ngoại vi thực tế mới là kỹ thuật thực sự.',
        },
        {
          q: 'Tôi có cần một kỹ sư chuyên về một thương hiệu cụ thể không?',
          a: 'Đối với lập trình và chạy thử, thường là có — Fanuc TP/KAREL, KUKA KRL và ABB RAPID là những ngôn ngữ khác nhau trên những bộ điều khiển khác nhau, và sự thành thạo với thương hiệu của bạn thể hiện trực tiếp ở tốc độ chạy thử. Đối với công việc ý tưởng và bố trí, tư duy chuyển giao tốt hơn. Trên TalEngineer, bạn lọc theo các thương hiệu mà kỹ sư đã được sàng lọc, chứ không phải theo một ô chọn "robot" chung chung.',
        },
        {
          q: 'Những phần nào của công việc robot có thể làm từ xa?',
          a: 'Mô phỏng, lập trình offline và đánh giá thiết kế tế bào làm từ xa rất tốt — một phần lớn cấu trúc chương trình có thể tồn tại trước khi ai đó chạm vào tế bào thực tế. Dạy lệnh (teach-in), tinh chỉnh liên quan đến va chạm và chạy thử thì về bản chất phải làm tại hiện trường. Cách phân chia phổ biến trên nền tảng của chúng tôi: OLP và thiết kế làm từ xa, còn chuyến đi chạy thử được xác định phạm vi như một cột mốc riêng.',
        },
        {
          q: 'TalEngineer xác minh một kỹ sư robot như thế nào?',
          a: 'Mỗi kỹ sư đều làm một bài sàng lọc kỹ thuật thực hành bằng AI khi gia nhập, kết quả này xác định điểm đã xác minh trên hồ sơ của họ, và họ có thể lấy chứng chỉ trong nhóm Robot công nghiệp ở ba cấp độ (L1–L3) — từ thực hiện công việc tế bào đã được xác định rõ đến thiết kế các tế bào phức tạp có nhiều robot. Bài thi được AI chấm điểm và quản trị viên xem xét trước khi cấp chứng chỉ, và chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức vào dự án — trong nhóm Robot công nghiệp, nếu bạn yêu cầu.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · रोबोटिक्स',
      title: 'रोबोटिक्स इंजीनियर हायर करें',
      sub: 'सेल डिज़ाइन, ऑफ़लाइन प्रोग्रामिंग और ऑन-साइट कमीशनिंग के लिए Fanuc, KUKA, ABB और Yaskawa स्पेशलिस्ट — असली सेल समस्याओं पर वेरिफ़ाइड, माइलस्टोन एस्क्रो से सुरक्षित।',
      lead1:
        'एक रोबोटिक्स इंजीनियर एक सेल को कॉन्सेप्ट से लेकर प्रोडक्शन तक ले जाता है: लेआउट व रीच स्टडी, सिमुलेशन व ऑफ़लाइन प्रोग्रामिंग, एंड-ऑफ़-आर्म टूलिंग (EOAT) इंटीग्रेशन, रोबोट-PLC हैंडशेक, सेफ़्टी कॉन्फ़िगरेशन, और साइट पर वह टीच-एंड-ट्यून काम जो सिम्युलेटेड साइकल को एक असली साइकल में बदलता है। रोबोट सबसे आसान हिस्सा है — असली काम उसके इर्द-गिर्द की हर चीज़ में है: फ़िक्स्चरिंग, पार्ट प्रेजेंटेशन, पेरिफ़ेरल्स, और वे सेकंड जो पाथ में छिपे होते हैं।',
      lead2:
        'हायरिंग इसलिए जटिल हो जाती है क्योंकि रोबोट ब्रांड वाक़ई अलग-अलग प्लेटफ़ॉर्म हैं — Fanuc, KUKA, ABB और Yaskawa में से हर एक के अपने कंट्रोलर, भाषाएँ और आदतें हैं, और कमीशनिंग एक हाई-प्रेशर, पब्लिक काम है जहाँ गलतियाँ महंगी पड़ती हैं। हम रोबोटिक्स इंजीनियरों को असली पाथ, टूलिंग व इंटीग्रेशन समस्याओं पर स्क्रीन करते हैं, और उन्हें तीन स्तरों पर प्रमाणित करते हैं ताकि आप सीनियोरिटी को काम के जोखिम से मैच कर सकें।',
      faq: [
        {
          q: 'रोबोट को प्रोग्राम करने के अलावा एक रोबोटिक्स इंजीनियर और क्या करता है?',
          a: 'ज़्यादातर वैल्यू रोबोट के इर्द-गिर्द होती है: सेल लेआउट व रीच वेरिफ़िकेशन, EOAT सिलेक्शन व इंटीग्रेशन, ग्रिपिंग व पार्ट-प्रेजेंटेशन स्ट्रैटेजी, रोबोट-टू-PLC व सेफ़्टी इंटीग्रेशन, साइकल-टाइम एनालिसिस, और कमीशनिंग। एक सेल जो सिर्फ़ हिलती है, वह एक डेमो है; एक सेल जो अपने असली फ़िक्स्चरिंग व पेरिफ़ेरल्स के साथ साइकल टाइम बनाए रखती है, वह इंजीनियरिंग है।',
        },
        {
          q: 'क्या मुझे किसी ब्रांड-स्पेसिफिक इंजीनियर की ज़रूरत है?',
          a: 'प्रोग्रामिंग व कमीशनिंग के लिए, आमतौर पर हाँ — Fanuc TP/KAREL, KUKA KRL और ABB RAPID अलग-अलग कंट्रोलर पर अलग-अलग भाषाएँ हैं, और आपके ब्रांड पर फ़्लुएंसी सीधे कमीशनिंग स्पीड में दिखती है। कॉन्सेप्ट व लेआउट के काम के लिए, सोच ज़्यादा आसानी से ट्रांसफ़र होती है। TalEngineer पर आप उन ब्रांड्स के हिसाब से फ़िल्टर करते हैं जिन पर इंजीनियर स्क्रीन हुआ है, न कि किसी सामान्य "रोबोटिक्स" चेकबॉक्स के हिसाब से।',
        },
        {
          q: 'रोबोट के काम के कौन-से हिस्से रिमोट किए जा सकते हैं?',
          a: 'सिमुलेशन, ऑफ़लाइन प्रोग्रामिंग और सेल-डिज़ाइन रिव्यू रिमोट में अच्छी तरह चलते हैं — प्रोग्राम स्ट्रक्चर का एक बड़ा हिस्सा तब भी बन सकता है जब किसी ने असली सेल को छुआ तक न हो। टीच-इन, कोलिज़न-क्रिटिकल ट्यूनिंग और कमीशनिंग अपने स्वभाव से ऑन-साइट होते हैं। हमारे प्लेटफ़ॉर्म पर आम बंटवारा: OLP व डिज़ाइन रिमोट, और कमीशनिंग ट्रिप को अपने अलग माइलस्टोन के तौर पर स्कोप किया जाता है।',
        },
        {
          q: 'TalEngineer एक रोबोटिक्स इंजीनियर को कैसे वेरिफ़ाई करता है?',
          a: 'हर इंजीनियर ऑनबोर्डिंग पर एक व्यावहारिक AI टेक्निकल स्क्रीनर देता है, जो उनकी प्रोफ़ाइल पर सत्यापित स्कोर तय करता है, और वे रोबोटिक्स ट्रैक में तीन स्तरों (L1–L3) पर प्रमाणित हो सकते हैं — साफ़ तौर पर परिभाषित सेल वर्क करने से लेकर जटिल, मल्टी-रोबोट सेल डिज़ाइन करने तक। एग्ज़ाम AI से स्कोर होते हैं और सर्टिफ़िकेट जारी होने से पहले एडमिन रिव्यू करता है, और केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही प्रोजेक्ट्स पर आधिकारिक रूप से असाइन किए जा सकते हैं — रोबोटिक्स ट्रैक में, अगर आप इसकी मांग करते हैं।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · Robotique',
      title: 'Recrutez un ingénieur robotique',
      sub: 'Spécialistes Fanuc, KUKA, ABB et Yaskawa pour la conception de cellules, la programmation hors ligne et la mise en service sur site — vérifiés sur des problèmes réels de cellule, protégés par séquestre par jalons.',
      lead1:
        "Un ingénieur robotique porte une cellule du concept jusqu'à la production : études d'implantation et d'atteignabilité, simulation et programmation hors ligne, intégration de l'outillage en bout de bras (EOAT), l'échange robot-PLC, la configuration de sécurité, et le travail d'apprentissage et de réglage sur site qui transforme un cycle simulé en cycle réel. Le robot est la partie facile — le travail, c'est tout ce qui l'entoure : outillage, présentation des pièces, périphériques et les secondes qui se cachent dans la trajectoire.",
      lead2:
        "Le recrutement se complique du fait que les marques de robots sont réellement des plateformes différentes — Fanuc, KUKA, ABB et Yaskawa ont chacune leurs propres contrôleurs, langages et habitudes, et la mise en service est un travail sous forte pression, exposé, où les erreurs coûtent cher. Nous évaluons les ingénieurs robotique sur des problèmes réels de trajectoire, d'outillage et d'intégration, et les certifions à trois niveaux afin que vous puissiez adapter le niveau d'expérience au risque de la mission.",
      faq: [
        {
          q: 'Que fait un ingénieur robotique au-delà de la programmation du robot ?',
          a: "L'essentiel de la valeur se situe autour du robot : implantation de cellule et validation de l'atteignabilité, sélection et intégration de l'outillage en bout de bras (EOAT), stratégie de préhension et de présentation des pièces, intégration robot-PLC et sécurité, analyse du temps de cycle, et mise en service. Une cellule qui se contente de bouger est une démo ; une cellule qui tient le temps de cycle avec l'outillage et les périphériques qu'elle a réellement, c'est de l'ingénierie.",
        },
        {
          q: "Ai-je besoin d'un ingénieur spécialisé sur une marque en particulier ?",
          a: "Pour la programmation et la mise en service, généralement oui — Fanuc TP/KAREL, KUKA KRL et ABB RAPID sont des langages différents sur des contrôleurs différents, et la maîtrise de votre marque se traduit directement par la vitesse de mise en service. Pour le travail de concept et d'implantation, le raisonnement se transpose mieux. Sur TalEngineer, vous filtrez par les marques sur lesquelles un ingénieur a été évalué, pas par une case « robotique » générique.",
        },
        {
          q: 'Quelles parties du travail robotique peuvent être réalisées à distance ?',
          a: "La simulation, la programmation hors ligne et les revues de conception de cellule se prêtent bien au travail à distance — une grande partie de la structure du programme peut exister avant que quiconque ne touche la cellule réelle. L'apprentissage (teach-in), le réglage critique en matière de collision et la mise en service sont par nature sur site. La répartition courante sur notre plateforme : programmation hors ligne et conception à distance, avec le déplacement de mise en service délimité comme son propre jalon.",
        },
        {
          q: 'Comment TalEngineer vérifie-t-il un ingénieur robotique ?',
          a: "Chaque ingénieur passe une évaluation technique pratique par IA lors de son intégration, qui établit le score vérifié de son profil, et peut se certifier dans la filière Robotique à trois niveaux (L1–L3) — de l'exécution de travaux de cellule bien définis jusqu'à la conception de cellules complexes multi-robots. Les examens sont notés par IA et vérifiés par un administrateur avant délivrance du certificat, et seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés à des projets — dans la filière Robotique, si vous l'exigez.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · Robotik',
      title: 'Robotik-Ingenieur engagieren',
      sub: 'Fanuc-, KUKA-, ABB- und Yaskawa-Spezialisten für Zellendesign, Offline-Programmierung und Inbetriebnahme vor Ort — verifiziert an echten Zellenproblemen, abgesichert durch Meilenstein-Treuhand.',
      lead1:
        'Ein Robotik-Ingenieur bringt eine Zelle vom Konzept bis zur Produktion: Layout- und Reichweitenstudien, Simulation und Offline-Programmierung, Integration des Greifer-/Werkzeugsystems (EOAT), das Roboter-PLC-Handshake, Sicherheitskonfiguration und die Teach-in- und Feinabstimmungsarbeit vor Ort, die einen simulierten Zyklus in einen echten verwandelt. Der Roboter ist der einfache Teil — die eigentliche Arbeit liegt in allem, was ihn umgibt: Vorrichtungsbau, Teilezuführung, Peripherie und die Sekunden, die sich in der Bahn verstecken.',
      lead2:
        'Die Einstellung wird dadurch erschwert, dass Roboterhersteller tatsächlich unterschiedliche Plattformen sind — Fanuc, KUKA, ABB und Yaskawa haben jeweils eigene Steuerungen, Sprachen und Gewohnheiten, und die Inbetriebnahme ist eine öffentliche Arbeit unter hohem Druck, bei der Fehler teuer werden. Wir prüfen Robotik-Ingenieure anhand echter Bahn-, Werkzeug- und Integrationsprobleme und zertifizieren sie auf drei Stufen, sodass Sie die Erfahrung dem Risiko der Aufgabe anpassen können.',
      faq: [
        {
          q: 'Was macht ein Robotik-Ingenieur über das Programmieren des Roboters hinaus?',
          a: 'Der größte Teil des Werts liegt rund um den Roboter: Zellenlayout und Reichweitenvalidierung, Auswahl und Integration des Greifer-/Werkzeugsystems (EOAT), Greif- und Teilezuführungsstrategie, Roboter-PLC- und Sicherheitsintegration, Zykluszeitanalyse und Inbetriebnahme. Eine Zelle, die sich nur bewegt, ist eine Demo; eine Zelle, die mit dem tatsächlich vorhandenen Vorrichtungsbau und der Peripherie die Zykluszeit hält, ist Ingenieurskunst.',
        },
        {
          q: 'Brauche ich einen markenspezifischen Ingenieur?',
          a: 'Für Programmierung und Inbetriebnahme in der Regel ja — Fanuc TP/KAREL, KUKA KRL und ABB RAPID sind unterschiedliche Sprachen auf unterschiedlichen Steuerungen, und die Vertrautheit mit Ihrer Marke zeigt sich direkt in der Geschwindigkeit der Inbetriebnahme. Für Konzept- und Layoutarbeit lässt sich das Denken besser übertragen. Bei TalEngineer filtern Sie nach den Marken, auf denen ein Ingenieur geprüft wurde, nicht nach einem allgemeinen „Robotik"-Häkchen.',
        },
        {
          q: 'Welche Teile der Roboterarbeit können remote erledigt werden?',
          a: 'Simulation, Offline-Programmierung und Zellendesign-Reviews eignen sich gut für die Fernarbeit — ein großer Teil der Programmstruktur kann entstehen, bevor jemand die reale Zelle berührt. Teach-in, kollisionskritische Feinabstimmung und Inbetriebnahme sind naturgemäß vor Ort. Die übliche Aufteilung auf unserer Plattform: OLP und Design remote, mit der Inbetriebnahmereise als eigener Meilenstein abgegrenzt.',
        },
        {
          q: 'Wie verifiziert TalEngineer einen Robotik-Ingenieur?',
          a: 'Jeder Ingenieur absolviert beim Onboarding einen praxisnahen KI-Techniktest, der den verifizierten Score im Profil festlegt, und kann sich im Bereich Robotik auf drei Stufen (L1–L3) zertifizieren lassen — von der Ausführung klar definierter Zellenarbeit bis zur Konzeption komplexer Multi-Roboter-Zellen. Die Prüfungen werden von KI bewertet und vor Ausstellung eines Zertifikats von einem Administrator geprüft, und nur Ingenieure mit gültiger Plattformzertifizierung können offiziell Projekten zugewiesen werden — im Bereich Robotik, sofern Sie dies verlangen.',
        },
      ],
    },
    ja: {
      kicker: '職種 · ロボティクス',
      title: 'ロボティクスエンジニアを採用',
      sub: 'セル設計、オフラインプログラミング、現場での試運転に対応するFanuc、KUKA、ABB、Yaskawaのスペシャリスト——実際のセルの課題で検証済み、マイルストーンエスクローで保護されます。',
      lead1:
        'ロボティクスエンジニアは、セルを構想から量産まで導きます。レイアウトとリーチ（可動域）の検討、シミュレーションとオフラインプログラミング、エンドエフェクタ（EOAT）の統合、ロボットとPLCのハンドシェイク、安全設定、そしてシミュレーションのサイクルを実際のサイクルへと変える現場でのティーチングと微調整です。ロボット本体は簡単な部分です——本当の仕事はその周りのすべてにあります。治具、部品の提示方法、周辺機器、そして経路の中に隠れている数秒です。',
      lead2:
        'ロボットブランドが実質的に異なるプラットフォームであることが、採用を難しくしています。Fanuc、KUKA、ABB、Yaskawaはそれぞれ独自のコントローラー、言語、慣習を持っており、試運転はミスが高くつく、公開の場での高圧的な作業です。当社は経路、治具、統合に関する実際の課題でロボティクスエンジニアを審査し、3つのレベルで認定を行うため、お客様は業務のリスクに見合った経験レベルを選ぶことができます。',
      faq: [
        {
          q: 'ロボットのプログラミング以外に、ロボティクスエンジニアは何をしますか？',
          a: '価値の大部分はロボットの周辺にあります。セルのレイアウトとリーチの検証、EOATの選定と統合、把持と部品提示の戦略、ロボットとPLCおよび安全系の統合、サイクルタイム分析、そして試運転です。単に動くだけのセルはデモにすぎません。実際の治具と周辺機器でサイクルタイムを維持できるセルこそが、真のエンジニアリングです。',
        },
        {
          q: 'ブランド特化型のエンジニアが必要ですか？',
          a: 'プログラミングと試運転については、通常は必要です——Fanuc TP/KAREL、KUKA KRL、ABB RAPIDはそれぞれ異なるコントローラー上の異なる言語であり、対象ブランドへの習熟度は試運転の速度に直接現れます。コンセプトやレイアウトの作業については、考え方がより通用しやすくなります。TalEngineerでは、汎用的な「ロボティクス」というチェックボックスではなく、エンジニアが審査を受けたブランドで絞り込むことができます。',
        },
        {
          q: 'ロボット作業のどの部分をリモートで行えますか？',
          a: 'シミュレーション、オフラインプログラミング、セル設計のレビューはリモートに適しています。誰も実際のセルに触れる前に、プログラム構造の大部分を作り込むことができます。ティーチング、衝突に関わる重要な調整、試運転は本質的に現場作業です。当社プラットフォームでよく見られる分担は、OLPと設計をリモートで行い、試運転の出張は独立したマイルストーンとして範囲設定するというものです。',
        },
        {
          q: 'TalEngineerはロボティクスエンジニアをどのように検証していますか？',
          a: 'すべてのエンジニアはオンボーディング時に実践的なAI技術スクリーニングを受け、その結果がプロフィール上の検証済みスコアになります。さらに、ロボティクス分野で3つのレベル（L1–L3）の認定を取得できます——明確に定義されたセル作業の実行から、複数ロボットを含む複雑なセルの設計まで対応します。試験はAIによって採点された後、認定証発行前に管理者がレビューします。有効なプラットフォーム認定を保有するエンジニアのみがプロジェクトに正式にアサインされます——ロボティクス分野の認定が必要な場合は、その認定が必要です。',
        },
      ],
    },
    ko: {
      kicker: '직무 · 로보틱스',
      title: '로보틱스 엔지니어 채용',
      sub: '셀 설계, 오프라인 프로그래밍, 현장 시운전을 위한 Fanuc, KUKA, ABB, Yaskawa 전문가 — 실제 셀 문제로 검증되며, 마일스톤 에스크로로 보호됩니다.',
      lead1:
        '로보틱스 엔지니어는 셀을 컨셉 단계부터 양산까지 이끕니다. 레이아웃 및 도달 범위 연구, 시뮬레이션 및 오프라인 프로그래밍, 엔드 이펙터(EOAT) 통합, 로봇-PLC 핸드셰이크, 안전 구성, 그리고 시뮬레이션 사이클을 실제 사이클로 바꾸는 현장 티칭 및 튜닝 작업까지 포함합니다. 로봇 자체는 쉬운 부분입니다 — 진짜 작업은 그 주변의 모든 것에 있습니다. 지그, 부품 공급 방식, 주변 장치, 그리고 경로 속에 숨어 있는 몇 초입니다.',
      lead2:
        '로봇 브랜드가 실제로 서로 다른 플랫폼이라는 점이 채용을 복잡하게 만듭니다. Fanuc, KUKA, ABB, Yaskawa는 각각 고유한 컨트롤러, 언어, 관행을 가지고 있으며, 시운전은 실수가 값비싼 대가를 치르는 고압적이고 공개적인 작업입니다. 저희는 실제 경로, 툴링, 통합 문제를 기준으로 로보틱스 엔지니어를 심사하며, 3단계로 인증하여 귀사가 업무의 위험도에 맞는 경력 수준을 매칭할 수 있도록 합니다.',
      faq: [
        {
          q: '로봇 프로그래밍 외에 로보틱스 엔지니어는 무엇을 합니까?',
          a: '가치의 대부분은 로봇 주변에 있습니다. 셀 레이아웃 및 도달 범위 검증, EOAT 선정 및 통합, 그리핑 및 부품 공급 전략, 로봇-PLC 및 안전 통합, 사이클 타임 분석, 그리고 시운전입니다. 단순히 움직이기만 하는 셀은 데모에 불과합니다. 실제 지그와 주변 장치를 갖추고도 사이클 타임을 유지하는 셀이야말로 진짜 엔지니어링입니다.',
        },
        {
          q: '특정 브랜드 전문 엔지니어가 필요합니까?',
          a: '프로그래밍과 시운전의 경우 보통 그렇습니다 — Fanuc TP/KAREL, KUKA KRL, ABB RAPID는 서로 다른 컨트롤러에서 사용되는 서로 다른 언어이며, 해당 브랜드에 대한 숙련도는 시운전 속도에 직접적으로 드러납니다. 컨셉 및 레이아웃 작업의 경우 사고방식이 더 잘 전이됩니다. TalEngineer에서는 범용적인 "로보틱스" 체크박스가 아니라 엔지니어가 심사받은 브랜드를 기준으로 필터링합니다.',
        },
        {
          q: '로봇 작업 중 어느 부분을 원격으로 할 수 있습니까?',
          a: '시뮬레이션, 오프라인 프로그래밍, 셀 설계 검토는 원격으로 잘 진행됩니다 — 누군가 실제 셀을 다루기 전에 프로그램 구조의 상당 부분을 만들어 둘 수 있습니다. 티칭, 충돌 관련 정밀 튜닝, 시운전은 본질적으로 현장에서 이루어져야 합니다. 저희 플랫폼에서 흔한 분담 방식은 OLP와 설계는 원격으로 진행하고, 시운전 출장은 별도의 마일스톤으로 범위를 정하는 것입니다.',
        },
        {
          q: 'TalEngineer는 로보틱스 엔지니어를 어떻게 검증합니까?',
          a: '모든 엔지니어는 온보딩 시 실무형 AI 기술 스크리닝을 받으며, 그 결과가 프로필의 검증된 점수가 됩니다. 또한 로보틱스 분야에서 3단계(L1–L3) 인증을 받을 수 있습니다 — 명확히 정의된 셀 작업 수행부터 복잡한 다중 로봇 셀 설계까지 아우릅니다. 시험은 AI로 채점된 후 인증서 발급 전에 관리자가 검토하며, 유효한 플랫폼 인증을 보유한 엔지니어만 프로젝트에 공식 배정될 수 있습니다 — 로보틱스 분야 인증을 요구하시는 경우에 한합니다.',
        },
      ],
    },
  },

  'vision-engineer': {
    track: 'vision',
    name: {
      en: 'Machine Vision Engineer', zh: '机器视觉工程师', es: 'Ingeniero de visión artificial', vi: 'Kỹ sư thị giác máy',
      hi: 'मशीन विज़न इंजीनियर', fr: 'Ingénieur vision industrielle', de: 'Bildverarbeitungsingenieur', ja: 'マシンビジョンエンジニア', ko: '머신 비전 엔지니어',
    },
    roleSkills: ['Cognex / Keyence / Halcon', 'Lighting & optics selection', 'Camera calibration', '2D / 3D inspection & guidance', 'OCR / OCV', 'Gauge R&R'],
    relatedPlaybookSlugs: ['platform-certification-explained'],
    en: {
      kicker: 'Role · Machine Vision',
      title: 'Hire a Machine Vision Engineer',
      sub: 'Inspection, guidance and measurement specialists across Cognex, Keyence and Halcon — verified where systems actually fail: lighting, optics, calibration and real-world variation.',
      lead1:
        'A machine vision engineer designs the whole imaging chain, not just the software: feasibility and sample studies, lighting and optics selection, camera and lens choice, calibration, the inspection or guidance application itself, and the proof that it stays reliable against real production variation. The decisive work happens before any algorithm runs — a well-lit image makes the application easy, and a poorly lit one makes it impossible.',
      lead2:
        'This is also the specialty with the widest gap between a demo and a production system. Systems that worked on the bench fail on the floor because of ambient light, part variation, surface changes and drift — none of which show up on a résumé. We screen vision engineers on exactly that practical judgment, and certify them at three levels of depth in the Machine Vision track.',
      faq: [
        {
          q: 'What should a vision feasibility study cover before I commit to a system?',
          a: 'Real samples — including your worst parts, not just golden ones — a lighting and optics concept tested against them, a defined accuracy or detection target, and an honest statement of what the system will not catch. For measurement applications, expect a gauge study (repeatability against your tolerance) before the design is trusted to gate product.',
        },
        {
          q: 'Smart camera or PC-based system — how does an engineer choose?',
          a: 'By the problem, not by preference. Well-bounded inspections at moderate speed often fit a smart camera (Cognex or Keyence class) with less integration overhead; complex multi-camera work, demanding algorithms or tight cycle budgets push toward PC-based tools like Halcon. A good engineer can justify the choice in terms of your parts, rates and maintenance staff — and is not locked to one vendor.',
        },
        {
          q: 'Why do vision projects fail after a successful demo?',
          a: 'Because the floor is not the lab: ambient light leaks in, parts arrive dirty or slightly different, surfaces and lighting age, and presentation varies. Preventing that is design work — controlled lighting, robust fixturing or software tolerance to variation, and monitoring for drift. It is precisely the judgment we screen for, because it is invisible in a portfolio of successful screenshots.',
        },
        {
          q: 'How does TalEngineer verify a vision engineer?',
          a: 'A practical AI screening at onboarding sets the verified score on an engineer\'s profile, plus certification in the Machine Vision track at three levels (L1–L3) — from configuring well-defined inspections up to architecting demanding systems and solving difficult lighting and accuracy problems. Exams are AI-scored and admin-reviewed before issue, and only engineers holding a valid platform certification can be officially assigned — in the Machine Vision track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 机器视觉',
      title: '雇佣机器视觉工程师',
      sub: '横跨 Cognex、Keyence、Halcon 的检测、引导与测量专家——在系统真正会失败的地方验证：打光、光学、标定与现实变化。',
      lead1:
        '机器视觉工程师设计的是整条成像链，而不只是软件：可行性与样件研究、打光与光学选型、相机与镜头选择、标定、检测或引导应用本身，以及"面对真实生产变化仍然可靠"的证明。决定性的工作发生在任何算法运行之前——一张打光良好的图让应用变简单，一张打光糟糕的图让它变成不可能。',
      lead2:
        '这也是 demo 与量产系统之间落差最大的专业。台面上好好的系统到现场就失效：环境光、来料变化、表面变化、漂移——而这些在简历上一个都看不出来。我们恰恰就在这种实操判断上筛选视觉工程师，并在机器视觉方向按三个深度级别发放认证。',
      faq: [
        {
          q: '在决定上一套视觉系统之前，可行性研究应该覆盖什么？',
          a: '真实样件——包括你最差的件，而不只是"金样"——一套针对这些样件测试过的打光与光学方案、一个明确的精度或检出目标，以及一份诚实的"这套系统抓不住什么"的说明。测量类应用，还应在设计被信任去放行产品之前，先做量具分析（相对你的公差的可重复性）。',
        },
        {
          q: '智能相机还是 PC 式系统——工程师怎么选？',
          a: '按问题选，不按偏好选。边界清晰、速度适中的检测，往往一台智能相机（Cognex、Keyence 这一档）就够，集成开销更小；复杂的多相机应用、高要求算法或紧张的节拍预算，则会推向 Halcon 这类 PC 式工具。好的工程师能用你的工件、速度和维护团队来论证选择——并且不被某一家供应商锁死。',
        },
        {
          q: '为什么视觉项目在 demo 成功之后还会失败？',
          a: '因为现场不是实验室：环境光会漏进来，来料会脏、会有细微不同，表面与光源会老化，摆放会变化。防住这些靠的是设计——受控打光、可靠的工装或对变化足够鲁棒的软件、以及对漂移的监控。这正是我们要筛选的判断力，因为它在一叠"成功截图"的作品集里是看不见的。',
        },
        {
          q: 'TalEngineer 怎么验证视觉工程师？',
          a: '入驻时先过实操型 AI 筛选，结果成为档案筛选分；之上是机器视觉方向的三级认证（L1–L3）——从配置范围明确的检测，到架构高要求系统、解决疑难打光与精度问题。考试 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派——如要求机器视觉方向证书，须持有该方向证书。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · Visión artificial',
      title: 'Contrate a un ingeniero de visión artificial',
      sub: 'Especialistas en inspección, guiado y medición con Cognex, Keyence y Halcon — verificados justo donde los sistemas realmente fallan: iluminación, óptica, calibración y variación del mundo real.',
      lead1:
        'Un ingeniero de visión artificial diseña toda la cadena de imagen, no solo el software: estudios de viabilidad y muestras, selección de iluminación y óptica, elección de cámara y lente, calibración, la aplicación de inspección o guiado en sí, y la prueba de que se mantiene confiable frente a la variación real de producción. El trabajo decisivo ocurre antes de que corra cualquier algoritmo — una imagen bien iluminada hace fácil la aplicación, y una mal iluminada la hace imposible.',
      lead2:
        'Esta es también la especialidad con la mayor brecha entre una demo y un sistema de producción. Sistemas que funcionaron en el banco fallan en planta por luz ambiental, variación de piezas, cambios de superficie y desvíos — nada de lo cual aparece en un currículum. Evaluamos a los ingenieros de visión exactamente en ese criterio práctico, y los certificamos en tres niveles de profundidad en la ruta de Visión artificial.',
      faq: [
        {
          q: '¿Qué debe cubrir un estudio de viabilidad de visión antes de comprometerme con un sistema?',
          a: 'Muestras reales — incluyendo sus peores piezas, no solo las "doradas" — un concepto de iluminación y óptica probado contra ellas, un objetivo definido de precisión o detección, y una declaración honesta de lo que el sistema no detectará. Para aplicaciones de medición, espere un estudio de calibre (repetibilidad frente a su tolerancia) antes de confiar el diseño para filtrar producto.',
        },
        {
          q: 'Cámara inteligente o sistema basado en PC — ¿cómo elige un ingeniero?',
          a: 'Por el problema, no por preferencia. Las inspecciones bien acotadas a velocidad moderada suelen encajar con una cámara inteligente (categoría Cognex o Keyence) con menos carga de integración; el trabajo complejo multicámara, algoritmos exigentes o presupuestos de ciclo ajustados empujan hacia herramientas basadas en PC como Halcon. Un buen ingeniero puede justificar la elección en términos de sus piezas, ritmos y personal de mantenimiento — y no está atado a un solo proveedor.',
        },
        {
          q: '¿Por qué fallan los proyectos de visión después de una demo exitosa?',
          a: 'Porque la planta no es el laboratorio: se filtra luz ambiental, las piezas llegan sucias o ligeramente distintas, las superficies y la iluminación envejecen, y la presentación varía. Prevenir eso es trabajo de diseño — iluminación controlada, utillaje robusto o tolerancia del software a la variación, y monitoreo de desvíos. Es precisamente el criterio que evaluamos, porque es invisible en un portafolio de capturas de pantalla exitosas.',
        },
        {
          q: '¿Cómo verifica TalEngineer a un ingeniero de visión?',
          a: 'Una evaluación práctica con IA en la incorporación fija la puntuación verificada en el perfil de un ingeniero, más la certificación en la ruta de Visión artificial en tres niveles (L1–L3) — desde configurar inspecciones bien definidas hasta diseñar sistemas exigentes y resolver problemas difíciles de iluminación y precisión. Los exámenes son calificados por IA y revisados por un administrador antes de emitirse, y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente — en la ruta de Visión artificial, si usted lo exige.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · Thị giác máy',
      title: 'Thuê kỹ sư thị giác máy',
      sub: 'Chuyên gia kiểm tra, dẫn hướng và đo lường trên Cognex, Keyence và Halcon — được xác minh đúng ở nơi hệ thống thực sự dễ thất bại: ánh sáng, quang học, hiệu chuẩn và sự biến thiên trong thực tế.',
      lead1:
        'Một kỹ sư thị giác máy thiết kế toàn bộ chuỗi thu ảnh, không chỉ phần mềm: nghiên cứu tính khả thi và mẫu vật, lựa chọn ánh sáng và quang học, chọn camera và ống kính, hiệu chuẩn, chính ứng dụng kiểm tra hoặc dẫn hướng, và bằng chứng cho thấy hệ thống vẫn đáng tin cậy trước sự biến thiên thực tế của sản xuất. Công việc mang tính quyết định diễn ra trước khi bất kỳ thuật toán nào chạy — một hình ảnh được chiếu sáng tốt khiến ứng dụng trở nên dễ dàng, còn một hình ảnh chiếu sáng kém khiến nó trở nên bất khả thi.',
      lead2:
        'Đây cũng là chuyên môn có khoảng cách lớn nhất giữa một bản demo và một hệ thống sản xuất thực tế. Những hệ thống hoạt động tốt trên bàn thử nghiệm lại thất bại tại hiện trường vì ánh sáng môi trường, sự biến thiên của chi tiết, thay đổi bề mặt và hiện tượng trôi — không điều nào trong số đó xuất hiện trên một bản CV. Chúng tôi sàng lọc kỹ sư thị giác máy đúng dựa trên khả năng phán đoán thực tế đó, và cấp chứng chỉ cho họ ở ba cấp độ chuyên sâu trong nhóm Thị giác máy.',
      faq: [
        {
          q: 'Một nghiên cứu khả thi về thị giác nên bao gồm những gì trước khi tôi cam kết với một hệ thống?',
          a: 'Mẫu vật thực tế — bao gồm cả những chi tiết tệ nhất của bạn, không chỉ những mẫu "hoàn hảo" — một phương án ánh sáng và quang học đã được thử nghiệm trên các mẫu đó, một mục tiêu độ chính xác hoặc phát hiện được xác định rõ, và một tuyên bố trung thực về những gì hệ thống sẽ không phát hiện được. Đối với các ứng dụng đo lường, hãy kỳ vọng một nghiên cứu về dụng cụ đo (độ lặp lại so với dung sai của bạn) trước khi tin tưởng thiết kế để kiểm soát chất lượng sản phẩm.',
        },
        {
          q: 'Camera thông minh hay hệ thống dựa trên PC — kỹ sư chọn như thế nào?',
          a: 'Dựa trên bài toán, không dựa trên sở thích. Các bài kiểm tra có giới hạn rõ ràng ở tốc độ vừa phải thường phù hợp với camera thông minh (dòng Cognex hoặc Keyence) với chi phí tích hợp thấp hơn; công việc đa camera phức tạp, thuật toán khắt khe hoặc ngân sách chu trình eo hẹp thì hướng tới các công cụ dựa trên PC như Halcon. Một kỹ sư giỏi có thể lý giải lựa chọn dựa trên chi tiết gia công, nhịp độ sản xuất và đội ngũ bảo trì của bạn — và không bị trói buộc vào một nhà cung cấp duy nhất.',
        },
        {
          q: 'Tại sao các dự án thị giác thất bại sau một bản demo thành công?',
          a: 'Vì hiện trường không phải là phòng thí nghiệm: ánh sáng môi trường lọt vào, chi tiết đến nơi bị bẩn hoặc hơi khác biệt, bề mặt và ánh sáng xuống cấp theo thời gian, và cách trình bày thay đổi. Ngăn ngừa điều đó là công việc thiết kế — ánh sáng được kiểm soát, đồ gá chắc chắn hoặc phần mềm có khả năng chịu đựng sự biến thiên, và giám sát hiện tượng trôi. Đây chính xác là khả năng phán đoán mà chúng tôi sàng lọc, vì nó vô hình trong một portfolio toàn ảnh chụp màn hình thành công.',
        },
        {
          q: 'TalEngineer xác minh một kỹ sư thị giác máy như thế nào?',
          a: 'Một bài sàng lọc thực hành bằng AI khi gia nhập xác định điểm đã xác minh trên hồ sơ của kỹ sư, cộng với chứng chỉ trong nhóm Thị giác máy ở ba cấp độ (L1–L3) — từ cấu hình các bài kiểm tra được xác định rõ đến kiến trúc các hệ thống khắt khe và giải quyết các bài toán khó về ánh sáng và độ chính xác. Bài thi được AI chấm điểm và quản trị viên xem xét trước khi cấp, và chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức — trong nhóm Thị giác máy, nếu bạn yêu cầu.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · मशीन विज़न',
      title: 'मशीन विज़न इंजीनियर हायर करें',
      sub: 'Cognex, Keyence और Halcon पर इंस्पेक्शन, गाइडेंस व मेज़रमेंट स्पेशलिस्ट — ठीक वहीं वेरिफ़ाइड जहाँ सिस्टम असल में फेल होते हैं: लाइटिंग, ऑप्टिक्स, कैलिब्रेशन और रियल-वर्ल्ड वेरिएशन।',
      lead1:
        'एक मशीन विज़न इंजीनियर पूरी इमेजिंग चेन डिज़ाइन करता है, सिर्फ़ सॉफ़्टवेयर नहीं: फ़िज़िबिलिटी व सैंपल स्टडी, लाइटिंग व ऑप्टिक्स सिलेक्शन, कैमरा व लेंस चुनाव, कैलिब्रेशन, ख़ुद इंस्पेक्शन या गाइडेंस एप्लिकेशन, और यह सबूत कि यह असली प्रोडक्शन वेरिएशन के सामने भी भरोसेमंद बना रहता है। निर्णायक काम किसी भी एल्गोरिद्म के चलने से पहले होता है — एक अच्छी तरह लाइट की हुई इमेज एप्लिकेशन को आसान बना देती है, और ख़राब लाइटिंग वाली इमेज इसे नामुमकिन बना देती है।',
      lead2:
        'यह वह स्पेशलिटी भी है जहाँ डेमो और प्रोडक्शन सिस्टम के बीच सबसे बड़ा गैप होता है। जो सिस्टम बेंच पर काम करते थे, वे फ़्लोर पर एम्बिएंट लाइट, पार्ट वेरिएशन, सरफ़ेस चेंज और ड्रिफ़्ट की वजह से फेल हो जाते हैं — इनमें से कुछ भी रिज़्यूमे पर नहीं दिखता। हम विज़न इंजीनियरों को ठीक इसी व्यावहारिक जजमेंट पर स्क्रीन करते हैं, और उन्हें मशीन विज़न ट्रैक में डेप्थ के तीन स्तरों पर प्रमाणित करते हैं।',
      faq: [
        {
          q: 'किसी सिस्टम के लिए कमिट करने से पहले विज़न फ़िज़िबिलिटी स्टडी में क्या कवर होना चाहिए?',
          a: 'असली सैंपल — जिसमें आपके सबसे ख़राब पार्ट्स भी शामिल हों, सिर्फ़ बेहतरीन वाले नहीं — इन पर टेस्ट किया गया एक लाइटिंग व ऑप्टिक्स कॉन्सेप्ट, एक तय की गई एक्युरेसी या डिटेक्शन टारगेट, और यह ईमानदार बयान कि सिस्टम क्या नहीं पकड़ पाएगा। मेज़रमेंट एप्लिकेशंस के लिए, डिज़ाइन को प्रोडक्ट रोकने के लिए भरोसेमंद माने जाने से पहले एक गेज स्टडी (आपकी टॉलरेंस के मुक़ाबले रिपीटेबिलिटी) की उम्मीद रखें।',
        },
        {
          q: 'स्मार्ट कैमरा या PC-आधारित सिस्टम — इंजीनियर कैसे चुनता है?',
          a: 'समस्या के आधार पर, पसंद के आधार पर नहीं। मध्यम स्पीड पर अच्छी तरह बाउंड की गई इंस्पेक्शंस अक्सर एक स्मार्ट कैमरा (Cognex या Keyence क्लास) में फ़िट बैठती हैं, जिसमें इंटीग्रेशन ओवरहेड कम होता है; कॉम्प्लेक्स मल्टी-कैमरा काम, डिमांडिंग एल्गोरिद्म या टाइट साइकल बजट Halcon जैसे PC-आधारित टूल्स की ओर धकेलते हैं। एक अच्छा इंजीनियर आपके पार्ट्स, रेट और मेंटेनेंस स्टाफ़ के हिसाब से चुनाव को जस्टिफ़ाई कर सकता है — और किसी एक वेंडर से बंधा नहीं होता।',
        },
        {
          q: 'सफल डेमो के बाद विज़न प्रोजेक्ट्स क्यों फेल होते हैं?',
          a: 'क्योंकि फ़्लोर लैब नहीं है: एम्बिएंट लाइट अंदर आ जाती है, पार्ट्स गंदे या थोड़े अलग पहुँचते हैं, सरफ़ेस व लाइटिंग पुरानी होती जाती हैं, और प्रेजेंटेशन बदलता रहता है। इसे रोकना डिज़ाइन का काम है — कंट्रोल्ड लाइटिंग, मज़बूत फ़िक्स्चरिंग या वेरिएशन के लिए सॉफ़्टवेयर टॉलरेंस, और ड्रिफ़्ट के लिए मॉनिटरिंग। यही वह जजमेंट है जिसके लिए हम स्क्रीन करते हैं, क्योंकि यह सफल स्क्रीनशॉट्स के पोर्टफ़ोलियो में कहीं नज़र नहीं आता।',
        },
        {
          q: 'TalEngineer एक विज़न इंजीनियर को कैसे वेरिफ़ाई करता है?',
          a: 'ऑनबोर्डिंग पर एक व्यावहारिक AI स्क्रीनिंग किसी इंजीनियर की प्रोफ़ाइल पर सत्यापित स्कोर तय करती है, साथ ही मशीन विज़न ट्रैक में तीन स्तरों (L1–L3) पर प्रमाणन — साफ़ तौर पर परिभाषित इंस्पेक्शंस कॉन्फ़िगर करने से लेकर डिमांडिंग सिस्टम आर्किटेक्ट करने और मुश्किल लाइटिंग व एक्युरेसी समस्याएँ सुलझाने तक। एग्ज़ाम AI से स्कोर होते हैं और जारी होने से पहले एडमिन रिव्यू करता है, और केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही आधिकारिक रूप से असाइन किए जा सकते हैं — मशीन विज़न ट्रैक में, अगर आप इसकी मांग करते हैं।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · Vision industrielle',
      title: 'Recrutez un ingénieur vision industrielle',
      sub: "Spécialistes en inspection, guidage et mesure sur Cognex, Keyence et Halcon — vérifiés précisément là où les systèmes échouent réellement : éclairage, optique, calibrage et variation réelle de production.",
      lead1:
        "Un ingénieur vision industrielle conçoit toute la chaîne d'imagerie, pas seulement le logiciel : études de faisabilité et d'échantillons, choix de l'éclairage et de l'optique, sélection de la caméra et de l'objectif, calibrage, l'application d'inspection ou de guidage elle-même, et la preuve qu'elle reste fiable face à la variation réelle de production. Le travail décisif se joue avant qu'aucun algorithme ne tourne — une image bien éclairée rend l'application facile, une image mal éclairée la rend impossible.",
      lead2:
        "C'est aussi la spécialité où l'écart entre une démo et un système de production est le plus grand. Des systèmes qui fonctionnaient sur banc échouent en atelier à cause de la lumière ambiante, de la variation des pièces, des changements d'état de surface et de la dérive — rien de tout cela n'apparaît sur un CV. Nous évaluons les ingénieurs vision précisément sur ce jugement pratique, et les certifions à trois niveaux de profondeur dans la filière Vision industrielle.",
      faq: [
        {
          q: "Que doit couvrir une étude de faisabilité vision avant de m'engager sur un système ?",
          a: "Des échantillons réels — y compris vos pires pièces, pas seulement les pièces étalons — un concept d'éclairage et d'optique testé sur ces échantillons, un objectif de précision ou de détection défini, et une déclaration honnête de ce que le système ne détectera pas. Pour les applications de mesure, attendez-vous à une étude de moyen de contrôle (répétabilité par rapport à votre tolérance) avant que la conception ne soit jugée fiable pour filtrer la production.",
        },
        {
          q: 'Caméra intelligente ou système sur PC — comment un ingénieur choisit-il ?',
          a: "En fonction du problème, pas d'une préférence. Des inspections bien délimitées à vitesse modérée conviennent souvent à une caméra intelligente (catégorie Cognex ou Keyence) avec moins de surcharge d'intégration ; un travail multi-caméras complexe, des algorithmes exigeants ou des budgets de cycle serrés orientent vers des outils sur PC comme Halcon. Un bon ingénieur peut justifier son choix en fonction de vos pièces, de vos cadences et de votre personnel de maintenance — et n'est pas enfermé chez un seul fournisseur.",
        },
        {
          q: 'Pourquoi les projets vision échouent-ils après une démo réussie ?',
          a: "Parce que l'atelier n'est pas le laboratoire : la lumière ambiante s'infiltre, les pièces arrivent sales ou légèrement différentes, les surfaces et l'éclairage vieillissent, et la présentation varie. Prévenir cela relève du travail de conception — éclairage maîtrisé, outillage robuste ou tolérance logicielle à la variation, et surveillance de la dérive. C'est précisément le jugement que nous évaluons, car il est invisible dans un portfolio de captures d'écran réussies.",
        },
        {
          q: 'Comment TalEngineer vérifie-t-il un ingénieur vision ?',
          a: "Une évaluation pratique par IA lors de l'intégration établit le score vérifié sur le profil d'un ingénieur, avec en plus la certification dans la filière Vision industrielle à trois niveaux (L1–L3) — de la configuration d'inspections bien définies jusqu'à la conception de systèmes exigeants et à la résolution de problèmes difficiles d'éclairage et de précision. Les examens sont notés par IA et vérifiés par un administrateur avant délivrance, et seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés — dans la filière Vision industrielle, si vous l'exigez.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · Bildverarbeitung',
      title: 'Bildverarbeitungsingenieur engagieren',
      sub: 'Spezialisten für Inspektion, Führung und Messtechnik auf Cognex, Keyence und Halcon — verifiziert genau dort, wo Systeme tatsächlich versagen: Beleuchtung, Optik, Kalibrierung und reale Schwankungen.',
      lead1:
        'Ein Bildverarbeitungsingenieur entwirft die gesamte Bildkette, nicht nur die Software: Machbarkeits- und Musterstudien, Auswahl von Beleuchtung und Optik, Kamera- und Objektivwahl, Kalibrierung, die eigentliche Inspektions- oder Führungsanwendung sowie den Nachweis, dass sie unter realer Produktionsstreuung zuverlässig bleibt. Die entscheidende Arbeit geschieht, bevor überhaupt ein Algorithmus läuft — ein gut beleuchtetes Bild macht die Anwendung einfach, ein schlecht beleuchtetes macht sie unmöglich.',
      lead2:
        'Dies ist auch das Fachgebiet mit der größten Lücke zwischen Demo und Produktionssystem. Systeme, die auf dem Prüftisch funktionierten, versagen in der Halle wegen Umgebungslicht, Teilevariation, alternden Oberflächen und Drift — nichts davon zeigt sich im Lebenslauf. Wir prüfen Bildverarbeitungsingenieure genau anhand dieses praktischen Urteilsvermögens und zertifizieren sie in der Bildverarbeitung auf drei Tiefenstufen.',
      faq: [
        {
          q: 'Was sollte eine Machbarkeitsstudie zur Bildverarbeitung abdecken, bevor ich mich auf ein System festlege?',
          a: 'Echte Muster — einschließlich Ihrer schlechtesten Teile, nicht nur der Idealteile —, ein daran getestetes Beleuchtungs- und Optikkonzept, ein definiertes Genauigkeits- oder Erkennungsziel und eine ehrliche Aussage darüber, was das System nicht erfasst. Bei Messanwendungen erwarten Sie eine Prüfmittelstudie (Wiederholbarkeit gegenüber Ihrer Toleranz), bevor dem Design vertraut wird, um Produkte freizugeben oder zu sperren.',
        },
        {
          q: 'Smart-Kamera oder PC-basiertes System — wie entscheidet ein Ingenieur?',
          a: 'Nach dem Problem, nicht nach Vorliebe. Gut abgegrenzte Prüfungen bei moderater Geschwindigkeit passen oft zu einer Smart-Kamera (Cognex- oder Keyence-Klasse) mit geringerem Integrationsaufwand; komplexe Multi-Kamera-Aufgaben, anspruchsvolle Algorithmen oder knappe Zyklusbudgets drängen zu PC-basierten Werkzeugen wie Halcon. Ein guter Ingenieur kann die Wahl anhand Ihrer Teile, Taktraten und Ihres Wartungspersonals begründen — und ist nicht an einen Anbieter gebunden.',
        },
        {
          q: 'Warum scheitern Bildverarbeitungsprojekte nach einer erfolgreichen Demo?',
          a: 'Weil die Fertigungshalle kein Labor ist: Umgebungslicht dringt ein, Teile kommen verschmutzt oder leicht abweichend an, Oberflächen und Beleuchtung altern, und die Teilezuführung variiert. Das zu verhindern ist Konstruktionsarbeit — kontrollierte Beleuchtung, robuste Vorrichtungen oder Softwaretoleranz gegenüber Schwankungen sowie Drift-Überwachung. Genau dieses Urteilsvermögen prüfen wir, weil es in einem Portfolio erfolgreicher Screenshots unsichtbar bleibt.',
        },
        {
          q: 'Wie verifiziert TalEngineer einen Bildverarbeitungsingenieur?',
          a: 'Ein praxisnahes KI-Assessment beim Onboarding legt den verifizierten Score im Profil eines Ingenieurs fest, zusätzlich zur Zertifizierung im Bereich Bildverarbeitung auf drei Stufen (L1–L3) — von der Konfiguration klar definierter Prüfungen bis zur Architektur anspruchsvoller Systeme und der Lösung schwieriger Beleuchtungs- und Genauigkeitsprobleme. Prüfungen werden von KI bewertet und vor Ausstellung von einem Administrator geprüft, und nur Ingenieure mit gültiger Plattformzertifizierung können offiziell zugewiesen werden — im Bereich Bildverarbeitung, sofern Sie dies verlangen.',
        },
      ],
    },
    ja: {
      kicker: '職種 · マシンビジョン',
      title: 'マシンビジョンエンジニアを採用',
      sub: 'Cognex、Keyence、Halconにわたる検査、ガイダンス、計測のスペシャリスト——照明、光学、キャリブレーション、実運用でのばらつきなど、システムが実際に失敗する箇所で検証済みです。',
      lead1:
        'マシンビジョンエンジニアは、ソフトウェアだけでなく撮像チェーン全体を設計します。実現可能性とサンプルの検討、照明と光学系の選定、カメラとレンズの選択、キャリブレーション、検査またはガイダンスのアプリケーション自体、そして実際の生産ばらつきに対しても信頼性を保つことの証明です。決定的な作業はアルゴリズムが動く前に行われます——照明が良い画像はアプリケーションを容易にし、照明が悪い画像はそれを不可能にします。',
      lead2:
        'これはまた、デモと量産システムの間のギャップが最も大きい専門分野でもあります。ベンチ上で機能していたシステムが、環境光、部品のばらつき、表面の変化、ドリフトによって現場で失敗する——そのどれもが履歴書には表れません。当社はまさにその実践的な判断力でビジョンエンジニアを審査し、マシンビジョン分野で3段階の深さの認定を行います。',
      faq: [
        {
          q: 'システムを決める前に、ビジョンの実現可能性調査は何をカバーすべきですか？',
          a: '実サンプル——最良のサンプルだけでなく、最も条件の悪い部品も含めて——それに対してテストされた照明・光学コンセプト、明確に定義された精度または検出目標、そしてシステムが検出できないことを正直に示した説明です。計測アプリケーションでは、その設計が製品の合否判定を任されるに足ると信頼される前に、ゲージ・スタディ（公差に対する再現性）が求められます。',
        },
        {
          q: 'スマートカメラかPCベースのシステムか——エンジニアはどう選びますか？',
          a: '好みではなく、課題によって決まります。境界が明確な中速の検査は、統合の負担が少ないスマートカメラ（CognexやKeyence級）に適することが多いです。複雑なマルチカメラ作業、要求の厳しいアルゴリズム、タイトなサイクルタイム予算はHalconのようなPCベースのツールへと押し進めます。優れたエンジニアは、部品、生産速度、保守担当者の観点からその選択を根拠づけることができ、特定のベンダーに縛られません。',
        },
        {
          q: 'デモが成功した後、ビジョンプロジェクトが失敗するのはなぜですか？',
          a: '現場は実験室ではないからです。環境光が入り込み、部品が汚れていたり微妙に異なっていたりし、表面や照明は経年劣化し、提示のされ方も変化します。それを防ぐのは設計の仕事です——制御された照明、頑丈な治具またはばらつきに対するソフトウェアの許容度、そしてドリフトの監視です。これはまさに当社が審査する判断力であり、成功したスクリーンショットのポートフォリオには表れないものです。',
        },
        {
          q: 'TalEngineerはビジョンエンジニアをどのように検証していますか？',
          a: 'オンボーディング時の実践的なAIスクリーニングがエンジニアのプロフィール上の検証済みスコアを決定し、さらにマシンビジョン分野で3つのレベル（L1–L3）の認定を取得できます——明確に定義された検査の構成から、要求の厳しいシステムの設計、難しい照明・精度問題の解決までです。試験はAIによって採点され、発行前に管理者がレビューします。有効なプラットフォーム認定を保有するエンジニアのみが正式にアサインされます——マシンビジョン分野の認定が必要な場合は、その認定が必要です。',
        },
      ],
    },
    ko: {
      kicker: '직무 · 머신 비전',
      title: '머신 비전 엔지니어 채용',
      sub: 'Cognex, Keyence, Halcon 전반에 걸친 검사, 가이던스, 측정 전문가 — 조명, 광학, 캘리브레이션, 실제 편차 등 시스템이 실제로 실패하는 지점에서 검증됩니다.',
      lead1:
        '머신 비전 엔지니어는 소프트웨어뿐 아니라 전체 이미징 체인을 설계합니다. 타당성 및 샘플 연구, 조명 및 광학 선정, 카메라 및 렌즈 선택, 캘리브레이션, 검사 또는 가이던스 애플리케이션 자체, 그리고 실제 생산 편차에도 신뢰성을 유지한다는 증명까지 포함합니다. 결정적인 작업은 어떤 알고리즘이 실행되기 전에 이루어집니다 — 조명이 잘된 이미지는 애플리케이션을 쉽게 만들고, 조명이 나쁜 이미지는 이를 불가능하게 만듭니다.',
      lead2:
        '이는 또한 데모와 양산 시스템 사이의 격차가 가장 큰 전문 분야이기도 합니다. 벤치에서 작동했던 시스템이 주변광, 부품 편차, 표면 변화, 드리프트로 인해 현장에서 실패합니다 — 이 중 어느 것도 이력서에는 나타나지 않습니다. 저희는 정확히 이러한 실무적 판단력을 기준으로 비전 엔지니어를 심사하며, 머신 비전 분야에서 3단계의 깊이로 인증합니다.',
      faq: [
        {
          q: '시스템에 착수하기 전에 비전 타당성 조사는 무엇을 다루어야 합니까?',
          a: '실제 샘플 — 최상의 샘플뿐 아니라 가장 나쁜 부품까지 포함 — 그에 대해 테스트된 조명 및 광학 컨셉, 명확히 정의된 정확도 또는 검출 목표, 그리고 시스템이 잡아내지 못할 부분에 대한 솔직한 설명입니다. 측정 애플리케이션의 경우, 설계가 제품 합격 판정을 맡기에 충분히 신뢰받기 전에 게이지 스터디(공차 대비 반복성)를 기대하셔야 합니다.',
        },
        {
          q: '스마트 카메라 또는 PC 기반 시스템 — 엔지니어는 어떻게 선택합니까?',
          a: '선호가 아니라 문제에 따라 선택합니다. 경계가 명확하고 속도가 중간 정도인 검사는 통합 부담이 적은 스마트 카메라(Cognex 또는 Keyence급)에 적합한 경우가 많습니다. 복잡한 다중 카메라 작업, 까다로운 알고리즘, 빠듯한 사이클 예산은 Halcon과 같은 PC 기반 툴로 이어집니다. 좋은 엔지니어는 귀사의 부품, 생산 속도, 유지보수 인력을 기준으로 선택을 정당화할 수 있으며, 특정 공급업체에 종속되지 않습니다.',
        },
        {
          q: '성공적인 데모 이후 비전 프로젝트가 실패하는 이유는 무엇입니까?',
          a: '현장은 실험실이 아니기 때문입니다. 주변광이 유입되고, 부품이 오염되거나 미세하게 다르게 도착하며, 표면과 조명은 노후화되고, 공급 방식도 달라집니다. 이를 방지하는 것은 설계 작업입니다 — 통제된 조명, 견고한 지그 또는 편차에 대한 소프트웨어 허용치, 그리고 드리프트 모니터링입니다. 이것이 바로 저희가 심사하는 판단력이며, 성공적인 스크린샷 포트폴리오에서는 드러나지 않는 부분입니다.',
        },
        {
          q: 'TalEngineer는 비전 엔지니어를 어떻게 검증합니까?',
          a: '온보딩 시 실무형 AI 스크리닝이 엔지니어 프로필의 검증된 점수를 결정하며, 여기에 더해 머신 비전 분야에서 3단계(L1–L3) 인증을 받을 수 있습니다 — 명확히 정의된 검사를 구성하는 것부터 까다로운 시스템을 설계하고 어려운 조명 및 정확도 문제를 해결하는 것까지 아우릅니다. 시험은 AI로 채점된 후 발급 전에 관리자가 검토하며, 유효한 플랫폼 인증을 보유한 엔지니어만 공식적으로 배정될 수 있습니다 — 머신 비전 분야 인증을 요구하시는 경우에 한합니다.',
        },
      ],
    },
  },

  'electrical-engineer': {
    track: 'electrical',
    name: {
      en: 'Industrial Electrical Engineer', zh: '工业电气工程师', es: 'Ingeniero eléctrico industrial', vi: 'Kỹ sư điện công nghiệp',
      hi: 'इंडस्ट्रियल इलेक्ट्रिकल इंजीनियर', fr: 'Ingénieur électricien industriel', de: 'Industrieelektriker', ja: '工業電気エンジニア', ko: '산업 전기 엔지니어',
    },
    roleSkills: ['Panel design & layout', 'EPLAN / AutoCAD Electrical', 'VFD & motor circuits', 'UL 508A / IEC 60204', 'Power distribution', 'Field wiring & I/O design'],
    relatedPlaybookSlugs: ['platform-certification-explained'],
    en: {
      kicker: 'Role · Electrical',
      title: 'Hire an Industrial Electrical Engineer',
      sub: 'Panel design, drives and power distribution specialists — EPLAN schematics, UL 508A / IEC 60204 compliance and designs that are safe, buildable and maintainable.',
      lead1:
        'An industrial electrical engineer produces the design a machine is physically built from: the schematic package, panel layout with thermal and clearance planning, motor and VFD circuits, power distribution, protective device coordination, and the field wiring and I/O documentation the installers and the controls team both work against. When the drawings are right, the panel shop builds without questions and commissioning starts from a known-good baseline.',
      lead2:
        'When they are wrong, the cost surfaces at the worst time — during build and commissioning, as rework, delays and safety findings. Standards make the role unforgiving: a design intended for North America lives under UL 508A and NFPA 79, one for Europe under IEC 60204, and the differences reach down to components, ratings and markings. We screen electrical engineers on real panel, drive and compliance problems, and certify them at three levels.',
      faq: [
        {
          q: 'What does an industrial electrical engineer deliver?',
          a: 'A complete, buildable documentation package: schematics (typically EPLAN or AutoCAD Electrical), panel layout with thermal calculation, bill of materials, cable and wiring lists, protective-device sizing and coordination, and the compliance documentation for the target standard. On milestone projects the package usually gates a design-review milestone before any metal is cut.',
        },
        {
          q: 'UL or IEC — why does the target market change the design?',
          a: 'Because the standards differ in substance, not just paperwork. A UL 508A panel for the US market and an IEC 60204 machine for Europe differ in accepted components and their certifications, short-circuit ratings, conductor sizing rules, and markings. A design carried unmodified across markets is a classic source of failed inspections — so match the engineer to the standard your machine ships under.',
        },
        {
          q: 'How does the electrical engineer work with the controls side?',
          a: 'Through explicit interfaces: the I/O list, panel space and heat budget for controls hardware, network and cable segregation, and the safety-circuit design both sides must agree on. On multi-engineer projects our project room keeps that coordination in one thread — the electrical engineer, the PLC programmer and your team see the same milestones and the same documents.',
        },
        {
          q: 'How does TalEngineer verify an electrical engineer?',
          a: 'A practical AI screening at onboarding sets the verified score on an engineer\'s profile, plus certification in the Electrical track at three levels (L1–L3) — from standard panel layouts under guidance to architecting power distribution and complex electrical systems. Exams are AI-scored and reviewed by an admin before a certificate is issued, and only engineers holding a valid platform certification can be officially assigned to projects — in the Electrical track, if you require it.',
        },
      ],
    },
    zh: {
      kicker: '职位 · 电气',
      title: '雇佣工业电气工程师',
      sub: '电柜设计、驱动与配电专家——EPLAN 图纸、UL 508A / IEC 60204 合规，交出安全、可施工、可维护的设计。',
      lead1:
        '工业电气工程师产出的是机器实际据以建造的设计：图纸包、带散热与间距规划的电柜布局、电机与变频器回路、配电、保护器件的配合，以及安装队和控制团队共同依据的现场接线与 I/O 文档。图纸对了，钣金厂不带疑问地照图施工，调试从一个已知正确的基线开始。',
      lead2:
        '图纸错了，代价会在最糟糕的时刻浮出水面——制造与调试期间，以返工、延期和安全整改的形式出现。标准让这个职位容不得含糊：面向北美的设计活在 UL 508A 与 NFPA 79 之下，面向欧洲的活在 IEC 60204 之下，差异一路下探到元器件、额定值与标识。我们在真实的电柜、驱动与合规问题上筛选电气工程师，并按三个级别发放认证。',
      faq: [
        {
          q: '工业电气工程师交付什么？',
          a: '一套完整、可施工的文档包：图纸（通常是 EPLAN 或 AutoCAD Electrical）、带热计算的电柜布局、物料清单(BOM)、电缆与接线清单、保护器件的选型与配合、以及面向目标标准的合规文档。在里程碑制项目上，这个文档包通常构成"设计评审"里程碑的闸门——通过之后才开始动手加工。',
        },
        {
          q: 'UL 还是 IEC——为什么目标市场会改变设计？',
          a: '因为两套标准是实质差异，不只是文书差异。面向美国市场的 UL 508A 电柜和面向欧洲的 IEC 60204 机器，在可接受的元器件及其认证、短路额定值、导线选型规则、标识要求上都不同。把一套设计原封不动搬到另一个市场，是验收不通过的经典来源——所以要按你的机器出货所在的标准来匹配工程师。',
        },
        {
          q: '电气工程师怎么和控制侧协作？',
          a: '通过明确的接口：I/O 清单、控制硬件的柜内空间与热预算、网络与电缆的隔离走线、以及双方必须共同确认的安全回路设计。在多工程师项目上，我们的项目间把这种协调收在同一条线索里——电气工程师、PLC 程序员和你的团队看到的是同一组里程碑、同一批文档。',
        },
        {
          q: 'TalEngineer 怎么验证电气工程师？',
          a: '入驻时先过实操型 AI 筛选，结果成为档案筛选分；之上是电气方向的三级认证（L1–L3）——从在指导下完成标准电柜布局，到架构配电与复杂电气系统。考试由 AI 评分、管理员复核后发证，且只有持有有效平台认证的工程师才能被正式指派到项目——如要求电气方向证书，须持有该方向证书。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · Eléctrico',
      title: 'Contrate a un ingeniero eléctrico industrial',
      sub: 'Especialistas en diseño de tableros eléctricos, variadores y distribución de energía — planos EPLAN, cumplimiento UL 508A / IEC 60204 y diseños seguros, construibles y mantenibles.',
      lead1:
        'Un ingeniero eléctrico industrial produce el diseño a partir del cual se construye físicamente una máquina: el paquete de planos, el layout del tablero con planificación térmica y de espacios libres, los circuitos de motores y variadores, la distribución de energía, la coordinación de dispositivos de protección, y la documentación de cableado de campo y de E/S con la que trabajan tanto los instaladores como el equipo de control. Cuando los planos están bien hechos, el taller de tableros construye sin preguntas y la puesta en marcha arranca desde una base confiable.',
      lead2:
        'Cuando están mal hechos, el costo aparece en el peor momento — durante la construcción y la puesta en marcha, en forma de retrabajo, retrasos y observaciones de seguridad. Las normas hacen que este puesto no perdone errores: un diseño destinado a Norteamérica vive bajo UL 508A y NFPA 79, uno para Europa bajo IEC 60204, y las diferencias llegan hasta los componentes, las clasificaciones y el marcado. Evaluamos a los ingenieros eléctricos con problemas reales de tableros, variadores y cumplimiento normativo, y los certificamos en tres niveles.',
      faq: [
        {
          q: '¿Qué entrega un ingeniero eléctrico industrial?',
          a: 'Un paquete de documentación completo y construible: planos (típicamente en EPLAN o AutoCAD Electrical), layout del tablero con cálculo térmico, lista de materiales, listas de cables y cableado, dimensionamiento y coordinación de dispositivos de protección, y la documentación de cumplimiento para la norma objetivo. En proyectos por hitos, este paquete suele condicionar un hito de revisión de diseño antes de cortar cualquier metal.',
        },
        {
          q: 'UL o IEC — ¿por qué el mercado objetivo cambia el diseño?',
          a: 'Porque las normas difieren en el fondo, no solo en el papeleo. Un tablero UL 508A para el mercado de EE. UU. y una máquina IEC 60204 para Europa difieren en los componentes aceptados y sus certificaciones, las clasificaciones de cortocircuito, las reglas de dimensionamiento de conductores y el marcado. Un diseño trasladado sin modificar entre mercados es una fuente clásica de inspecciones fallidas — por eso hay que emparejar al ingeniero con la norma bajo la cual se envía su máquina.',
        },
        {
          q: '¿Cómo trabaja el ingeniero eléctrico con el lado de control?',
          a: 'A través de interfaces explícitas: la lista de E/S, el espacio del tablero y el presupuesto térmico para el hardware de control, la segregación de red y cableado, y el diseño del circuito de seguridad que ambas partes deben acordar. En proyectos con varios ingenieros, nuestra sala de proyecto mantiene esa coordinación en un solo hilo — el ingeniero eléctrico, el programador de PLC y su equipo ven los mismos hitos y los mismos documentos.',
        },
        {
          q: '¿Cómo verifica TalEngineer a un ingeniero eléctrico?',
          a: 'Una evaluación práctica con IA en la incorporación fija la puntuación verificada en el perfil de un ingeniero, más la certificación en la ruta Eléctrica en tres niveles (L1–L3) — desde layouts de tablero estándar bajo supervisión hasta diseñar distribución de energía y sistemas eléctricos complejos. Los exámenes son calificados por IA y revisados por un administrador antes de emitir el certificado, y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados oficialmente a proyectos — en la ruta Eléctrica, si usted lo exige.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · Điện',
      title: 'Thuê kỹ sư điện công nghiệp',
      sub: 'Chuyên gia thiết kế tủ điện, biến tần và phân phối điện — bản vẽ EPLAN, tuân thủ UL 508A / IEC 60204 và các thiết kế an toàn, thi công được và dễ bảo trì.',
      lead1:
        'Một kỹ sư điện công nghiệp tạo ra bản thiết kế mà từ đó máy móc được thi công thực tế: bộ bản vẽ, bố trí tủ điện có tính toán nhiệt và khoảng cách an toàn, mạch động cơ và biến tần, phân phối điện, phối hợp thiết bị bảo vệ, và tài liệu đấu dây hiện trường cùng I/O mà cả đội thi công lẫn đội điều khiển đều dựa vào để làm việc. Khi bản vẽ đúng, xưởng gia công tủ điện thi công mà không cần hỏi lại, và chạy thử bắt đầu từ một nền tảng đã biết là đúng.',
      lead2:
        'Khi bản vẽ sai, chi phí sẽ nổi lên vào thời điểm tồi tệ nhất — trong quá trình thi công và chạy thử, dưới dạng làm lại, chậm tiến độ và các phát hiện về an toàn. Các tiêu chuẩn khiến vai trò này không dung thứ sai sót: một thiết kế dành cho Bắc Mỹ chịu sự chi phối của UL 508A và NFPA 79, một thiết kế cho châu Âu chịu sự chi phối của IEC 60204, và sự khác biệt kéo dài xuống tận linh kiện, thông số định mức và ký hiệu. Chúng tôi sàng lọc kỹ sư điện dựa trên các bài toán thực tế về tủ điện, biến tần và tuân thủ tiêu chuẩn, và cấp chứng chỉ cho họ ở ba cấp độ.',
      faq: [
        {
          q: 'Kỹ sư điện công nghiệp bàn giao những gì?',
          a: 'Một bộ tài liệu hoàn chỉnh, có thể thi công được: bản vẽ (thường bằng EPLAN hoặc AutoCAD Electrical), bố trí tủ điện kèm tính toán nhiệt, bảng kê vật tư, danh sách cáp và đấu dây, tính toán kích thước và phối hợp thiết bị bảo vệ, cùng tài liệu tuân thủ cho tiêu chuẩn mục tiêu. Trên các dự án theo cột mốc, bộ tài liệu này thường là điều kiện của một cột mốc đánh giá thiết kế trước khi bất kỳ tấm kim loại nào được cắt.',
        },
        {
          q: 'UL hay IEC — tại sao thị trường mục tiêu lại thay đổi thiết kế?',
          a: 'Vì các tiêu chuẩn khác nhau về bản chất, chứ không chỉ về giấy tờ. Một tủ điện UL 508A cho thị trường Mỹ và một máy IEC 60204 cho châu Âu khác nhau về các linh kiện được chấp nhận và chứng nhận của chúng, định mức ngắn mạch, quy tắc chọn kích thước dây dẫn, và ký hiệu. Một thiết kế được mang nguyên vẹn từ thị trường này sang thị trường khác là nguồn gốc kinh điển của việc không qua được kiểm định — vì vậy hãy khớp kỹ sư với tiêu chuẩn mà máy của bạn xuất xưởng theo.',
        },
        {
          q: 'Kỹ sư điện làm việc với bên điều khiển như thế nào?',
          a: 'Thông qua các giao diện rõ ràng: danh sách I/O, không gian tủ điện và ngân sách nhiệt dành cho phần cứng điều khiển, việc phân tách mạng và cáp, và thiết kế mạch an toàn mà cả hai bên phải thống nhất. Trên các dự án nhiều kỹ sư, phòng dự án của chúng tôi giữ sự phối hợp đó trong một luồng duy nhất — kỹ sư điện, lập trình viên PLC và đội của bạn cùng thấy cùng một bộ cột mốc và cùng một bộ tài liệu.',
        },
        {
          q: 'TalEngineer xác minh một kỹ sư điện như thế nào?',
          a: 'Một bài sàng lọc thực hành bằng AI khi gia nhập xác định điểm đã xác minh trên hồ sơ của kỹ sư, cộng với chứng chỉ trong nhóm Điện ở ba cấp độ (L1–L3) — từ bố trí tủ điện tiêu chuẩn dưới sự hướng dẫn đến thiết kế kiến trúc phân phối điện và các hệ thống điện phức tạp. Bài thi được AI chấm điểm và quản trị viên xem xét trước khi cấp chứng chỉ, và chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công chính thức vào dự án — trong nhóm Điện, nếu bạn yêu cầu.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · इलेक्ट्रिकल',
      title: 'इंडस्ट्रियल इलेक्ट्रिकल इंजीनियर हायर करें',
      sub: 'पैनल डिज़ाइन, ड्राइव व पावर डिस्ट्रीब्यूशन स्पेशलिस्ट — EPLAN स्कीमैटिक्स, UL 508A / IEC 60204 कम्प्लायंस, और ऐसे डिज़ाइन जो सेफ़, बनाने लायक़ और मेंटेन करने लायक़ हों।',
      lead1:
        'एक इंडस्ट्रियल इलेक्ट्रिकल इंजीनियर वह डिज़ाइन तैयार करता है जिससे मशीन फ़िज़िकली बनती है: स्कीमैटिक पैकेज, थर्मल व क्लीयरेंस प्लानिंग के साथ पैनल लेआउट, मोटर व VFD सर्किट, पावर डिस्ट्रीब्यूशन, प्रोटेक्टिव डिवाइस कोऑर्डिनेशन, और फ़ील्ड वायरिंग व I/O डॉक्यूमेंटेशन जिस पर इंस्टॉलर व कंट्रोल्स टीम दोनों काम करते हैं। जब ड्रॉइंग्स सही होती हैं, तो पैनल शॉप बिना सवाल पूछे बना देती है और कमीशनिंग एक जानी-पहचानी अच्छी बेसलाइन से शुरू होती है।',
      lead2:
        'जब वे ग़लत होती हैं, तो लागत सबसे ख़राब वक़्त पर सामने आती है — बिल्ड व कमीशनिंग के दौरान, रीवर्क, देरी और सेफ़्टी फ़ाइंडिंग्स के रूप में। स्टैंडर्ड्स इस भूमिका को माफ़ी की गुंजाइश नहीं देते: उत्तरी अमेरिका के लिए बना डिज़ाइन UL 508A व NFPA 79 के तहत आता है, यूरोप के लिए वाला IEC 60204 के तहत, और अंतर कंपोनेंट्स, रेटिंग्स व मार्किंग्स तक जाता है। हम इलेक्ट्रिकल इंजीनियरों को असली पैनल, ड्राइव व कम्प्लायंस समस्याओं पर स्क्रीन करते हैं, और उन्हें तीन स्तरों पर प्रमाणित करते हैं।',
      faq: [
        {
          q: 'एक इंडस्ट्रियल इलेक्ट्रिकल इंजीनियर क्या डिलिवर करता है?',
          a: 'एक पूरा, बनाने लायक़ डॉक्यूमेंटेशन पैकेज: स्कीमैटिक्स (आमतौर पर EPLAN या AutoCAD Electrical), थर्मल कैलकुलेशन के साथ पैनल लेआउट, बिल ऑफ़ मटीरियल्स, केबल व वायरिंग लिस्ट, प्रोटेक्टिव-डिवाइस साइज़िंग व कोऑर्डिनेशन, और टारगेट स्टैंडर्ड के लिए कम्प्लायंस डॉक्यूमेंटेशन। माइलस्टोन प्रोजेक्ट्स पर यह पैकेज आमतौर पर किसी भी धातु को काटे जाने से पहले एक डिज़ाइन-रिव्यू माइलस्टोन का गेट होता है।',
        },
        {
          q: 'UL या IEC — टारगेट मार्केट डिज़ाइन को क्यों बदल देता है?',
          a: 'क्योंकि स्टैंडर्ड्स सिर्फ़ काग़ज़ी काम में नहीं, बल्कि सार में अलग होते हैं। US मार्केट के लिए UL 508A पैनल और यूरोप के लिए IEC 60204 मशीन, स्वीकृत कंपोनेंट्स व उनके प्रमाणन, शॉर्ट-सर्किट रेटिंग्स, कंडक्टर साइज़िंग रूल्स, और मार्किंग्स में अलग होते हैं। बिना बदले एक मार्केट से दूसरे मार्केट में ले जाया गया डिज़ाइन फ़ेल्ड इंस्पेक्शंस का एक क्लासिक कारण है — इसलिए इंजीनियर को उस स्टैंडर्ड से मैच करें जिसके तहत आपकी मशीन शिप होती है।',
        },
        {
          q: 'इलेक्ट्रिकल इंजीनियर कंट्रोल्स साइड के साथ कैसे काम करता है?',
          a: 'साफ़ इंटरफ़ेस के ज़रिए: I/O लिस्ट, कंट्रोल्स हार्डवेयर के लिए पैनल स्पेस व हीट बजट, नेटवर्क व केबल सेग्रिगेशन, और सेफ़्टी-सर्किट डिज़ाइन जिस पर दोनों पक्षों को सहमत होना ही पड़ता है। मल्टी-इंजीनियर प्रोजेक्ट्स पर हमारा प्रोजेक्ट रूम इस कोऑर्डिनेशन को एक ही थ्रेड में रखता है — इलेक्ट्रिकल इंजीनियर, PLC प्रोग्रामर और आपकी टीम एक जैसे माइलस्टोन और एक जैसे डॉक्यूमेंट्स देखते हैं।',
        },
        {
          q: 'TalEngineer एक इलेक्ट्रिकल इंजीनियर को कैसे वेरिफ़ाई करता है?',
          a: 'ऑनबोर्डिंग पर एक व्यावहारिक AI स्क्रीनिंग किसी इंजीनियर की प्रोफ़ाइल पर सत्यापित स्कोर तय करती है, साथ ही इलेक्ट्रिकल ट्रैक में तीन स्तरों (L1–L3) पर प्रमाणन — गाइडेंस में स्टैंडर्ड पैनल लेआउट करने से लेकर पावर डिस्ट्रीब्यूशन व कॉम्प्लेक्स इलेक्ट्रिकल सिस्टम आर्किटेक्ट करने तक। एग्ज़ाम AI से स्कोर होते हैं और सर्टिफ़िकेट जारी होने से पहले एडमिन रिव्यू करता है, और केवल वैध प्लेटफ़ॉर्म प्रमाणन रखने वाले इंजीनियर ही प्रोजेक्ट्स पर आधिकारिक रूप से असाइन किए जा सकते हैं — इलेक्ट्रिकल ट्रैक में, अगर आप इसकी मांग करते हैं।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · Électrique',
      title: 'Recrutez un ingénieur électricien industriel',
      sub: "Spécialistes en conception d'armoires électriques, variateurs et distribution électrique — schémas EPLAN, conformité UL 508A / IEC 60204 et conceptions sûres, réalisables et faciles à maintenir.",
      lead1:
        "Un ingénieur électricien industriel produit la conception à partir de laquelle une machine est physiquement construite : le dossier de schémas, l'implantation de l'armoire avec planification thermique et des dégagements, les circuits moteurs et variateurs, la distribution électrique, la coordination des dispositifs de protection, et la documentation de câblage de terrain et d'E/S sur laquelle travaillent à la fois les installateurs et l'équipe automatisme. Quand les plans sont justes, l'atelier de câblage construit sans poser de questions et la mise en service démarre sur une base fiable connue.",
      lead2:
        "Quand ils sont faux, le coût apparaît au pire moment — pendant la construction et la mise en service, sous forme de reprises, de retards et de constats de sécurité. Les normes rendent ce poste sans indulgence : une conception destinée à l'Amérique du Nord relève de l'UL 508A et de la NFPA 79, une conception pour l'Europe de l'IEC 60204, et les différences descendent jusqu'aux composants, aux calibres et aux marquages. Nous évaluons les ingénieurs électriciens sur des problèmes réels d'armoires, de variateurs et de conformité, et les certifions à trois niveaux.",
      faq: [
        {
          q: 'Que livre un ingénieur électricien industriel ?',
          a: "Un dossier de documentation complet et réalisable : schémas (généralement sous EPLAN ou AutoCAD Electrical), implantation de l'armoire avec calcul thermique, nomenclature, listes de câbles et de câblage, dimensionnement et coordination des dispositifs de protection, et la documentation de conformité pour la norme cible. Sur les projets par jalons, ce dossier conditionne généralement un jalon de revue de conception avant toute découpe de tôle.",
        },
        {
          q: 'UL ou IEC — pourquoi le marché cible change-t-il la conception ?',
          a: "Parce que les normes diffèrent sur le fond, pas seulement dans la paperasse. Une armoire UL 508A pour le marché américain et une machine IEC 60204 pour l'Europe diffèrent quant aux composants acceptés et à leurs certifications, à la tenue au court-circuit, aux règles de dimensionnement des conducteurs et aux marquages. Une conception transposée sans modification d'un marché à l'autre est une source classique d'échecs aux inspections — faites donc correspondre l'ingénieur à la norme sous laquelle votre machine est expédiée.",
        },
        {
          q: "Comment l'ingénieur électricien travaille-t-il avec le côté automatisme ?",
          a: "Par des interfaces explicites : la liste d'E/S, l'espace de l'armoire et le budget thermique pour le matériel d'automatisme, la ségrégation réseau et câblage, et la conception du circuit de sécurité sur laquelle les deux parties doivent s'accorder. Sur les projets multi-ingénieurs, notre salle de projet maintient cette coordination dans un seul fil — l'ingénieur électricien, le programmeur PLC et votre équipe voient les mêmes jalons et les mêmes documents.",
        },
        {
          q: 'Comment TalEngineer vérifie-t-il un ingénieur électricien ?',
          a: "Une évaluation pratique par IA lors de l'intégration établit le score vérifié sur le profil d'un ingénieur, avec en plus la certification dans la filière Électrique à trois niveaux (L1–L3) — de la réalisation d'implantations d'armoires standard sous encadrement jusqu'à la conception de la distribution électrique et de systèmes électriques complexes. Les examens sont notés par IA et vérifiés par un administrateur avant délivrance du certificat, et seuls les ingénieurs détenant une certification de plateforme valide peuvent être officiellement affectés à des projets — dans la filière Électrique, si vous l'exigez.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · Elektrotechnik',
      title: 'Industrieelektriker engagieren',
      sub: 'Spezialisten für Schaltschrankdesign, Antriebe und Energieverteilung — EPLAN-Schaltpläne, UL-508A-/IEC-60204-Konformität und Designs, die sicher, baubar und wartbar sind.',
      lead1:
        'Ein Industrieelektroingenieur erstellt die Konstruktion, aus der eine Maschine physisch gebaut wird: das Schaltplanpaket, das Schaltschranklayout mit Wärme- und Abstandsplanung, Motor- und Umrichterstromkreise, Energieverteilung, die Koordination der Schutzeinrichtungen sowie die Felddokumentation für Verdrahtung und I/O, mit der sowohl Installateure als auch das Steuerungsteam arbeiten. Wenn die Zeichnungen stimmen, baut der Schaltschrankbauer ohne Rückfragen, und die Inbetriebnahme startet von einer bekanntermaßen soliden Basis.',
      lead2:
        'Wenn sie falsch sind, zeigen sich die Kosten zum ungünstigsten Zeitpunkt — während Bau und Inbetriebnahme, in Form von Nacharbeit, Verzögerungen und sicherheitsrelevanten Beanstandungen. Normen machen diese Rolle unnachsichtig: Ein für Nordamerika bestimmtes Design unterliegt UL 508A und NFPA 79, eines für Europa der IEC 60204, und die Unterschiede reichen bis hinunter zu Komponenten, Bemessungswerten und Kennzeichnungen. Wir prüfen Elektroingenieure anhand realer Schaltschrank-, Antriebs- und Konformitätsprobleme und zertifizieren sie auf drei Stufen.',
      faq: [
        {
          q: 'Was liefert ein Industrieelektroingenieur?',
          a: 'Ein vollständiges, baubares Dokumentationspaket: Schaltpläne (typischerweise in EPLAN oder AutoCAD Electrical), Schaltschranklayout mit thermischer Berechnung, Stückliste, Kabel- und Verdrahtungslisten, Dimensionierung und Koordination der Schutzeinrichtungen sowie die Konformitätsdokumentation für die Zielnorm. Bei meilensteinbasierten Projekten gibt dieses Paket meist einen Design-Review-Meilenstein frei, bevor Blech geschnitten wird.',
        },
        {
          q: 'UL oder IEC — warum verändert der Zielmarkt das Design?',
          a: 'Weil sich die Normen inhaltlich unterscheiden, nicht nur auf dem Papier. Ein UL-508A-Schaltschrank für den US-Markt und eine IEC-60204-Maschine für Europa unterscheiden sich bei zulässigen Komponenten und deren Zertifizierungen, Kurzschlussbemessungswerten, Regeln zur Leiterdimensionierung und Kennzeichnungen. Ein unverändert von einem Markt in einen anderen übernommenes Design ist eine klassische Ursache für nicht bestandene Abnahmen — deshalb sollte der Ingenieur zu der Norm passen, unter der Ihre Maschine ausgeliefert wird.',
        },
        {
          q: 'Wie arbeitet der Elektroingenieur mit der Steuerungsseite zusammen?',
          a: 'Über klar definierte Schnittstellen: die I/O-Liste, Schaltschrankraum und Wärmebudget für die Steuerungshardware, Netzwerk- und Kabeltrennung sowie das Sicherheitsschaltkreis-Design, dem beide Seiten zustimmen müssen. Bei Projekten mit mehreren Ingenieuren hält unser Projektraum diese Abstimmung in einem einzigen Strang — der Elektroingenieur, der PLC-Programmierer und Ihr Team sehen dieselben Meilensteine und dieselben Dokumente.',
        },
        {
          q: 'Wie verifiziert TalEngineer einen Elektroingenieur?',
          a: 'Ein praxisnahes KI-Assessment beim Onboarding legt den verifizierten Score im Profil eines Ingenieurs fest, zusätzlich zur Zertifizierung im Bereich Elektrotechnik auf drei Stufen (L1–L3) — von angeleiteten Standard-Schaltschranklayouts bis zur Konzeption von Energieverteilung und komplexen elektrischen Systemen. Prüfungen werden von KI bewertet und vor Ausstellung eines Zertifikats von einem Administrator geprüft, und nur Ingenieure mit gültiger Plattformzertifizierung können offiziell Projekten zugewiesen werden — im Bereich Elektrotechnik, sofern Sie dies verlangen.',
        },
      ],
    },
    ja: {
      kicker: '職種 · 電気',
      title: '工業電気エンジニアを採用',
      sub: '制御盤設計、ドライブ、配電のスペシャリスト——EPLAN図面、UL 508A / IEC 60204準拠、そして安全で施工可能かつメンテナンスしやすい設計です。',
      lead1:
        '工業電気エンジニアは、機械が実際に組み立てられる元となる設計を作成します。図面一式、熱設計とクリアランス計画を含む制御盤レイアウト、モーターとVFDの回路、配電、保護機器の協調、そして設置業者と制御チームの双方が基準とするフィールド配線とI/Oドキュメントです。図面が正しければ、盤製作工場は疑問を持たずに製作でき、試運転は確実な基準から始められます。',
      lead2:
        '図面が間違っていれば、そのコストは最悪のタイミングで表面化します——製作と試運転の段階で、手直し、遅延、安全上の指摘という形で。規格がこの職種を容赦のないものにしています。北米向けの設計はUL 508AとNFPA 79の下にあり、欧州向けはIEC 60204の下にあり、その違いは部品、定格、表示にまで及びます。当社は実際の制御盤、ドライブ、コンプライアンスの課題で電気エンジニアを審査し、3つのレベルで認定します。',
      faq: [
        {
          q: '工業電気エンジニアは何を納品しますか？',
          a: '完全で施工可能なドキュメント一式です。図面（通常はEPLANまたはAutoCAD Electrical）、熱計算を含む制御盤レイアウト、部品表、ケーブルおよび配線リスト、保護機器の選定と協調、そして対象規格のコンプライアンス文書です。マイルストーン制のプロジェクトでは、金属を切断する前に、この一式が通常は設計レビューのマイルストーンのゲートとなります。',
        },
        {
          q: 'ULかIECか——なぜ対象市場が設計を変えるのですか？',
          a: '規格は書類上だけでなく、実質的に異なるためです。米国市場向けのUL 508A盤と、欧州向けのIEC 60204機械は、認められる部品とその認証、短絡定格、導体サイズの選定ルール、表示において異なります。市場をまたいで変更せずに流用した設計は、検査に落ちる典型的な原因です——そのため、機械が出荷される規格にエンジニアを合わせてください。',
        },
        {
          q: '電気エンジニアは制御側とどのように連携しますか？',
          a: '明確なインターフェースを通じてです。I/Oリスト、制御機器用の盤内スペースと熱予算、ネットワークとケーブルの分離、そして双方が合意しなければならない安全回路設計です。複数のエンジニアが関わるプロジェクトでは、当社のプロジェクトルームがこの連携を一つのスレッドにまとめます——電気エンジニア、PLCプログラマー、そしてお客様のチームが同じマイルストーンと同じドキュメントを見ることができます。',
        },
        {
          q: 'TalEngineerは電気エンジニアをどのように検証していますか？',
          a: 'オンボーディング時の実践的なAIスクリーニングがエンジニアのプロフィール上の検証済みスコアを決定し、さらに電気分野で3つのレベル（L1–L3）の認定を取得できます——指導のもとでの標準的な制御盤レイアウトから、配電や複雑な電気システムの設計までです。試験はAIによって採点され、認定証発行前に管理者がレビューします。有効なプラットフォーム認定を保有するエンジニアのみがプロジェクトに正式にアサインされます——電気分野の認定が必要な場合は、その認定が必要です。',
        },
      ],
    },
    ko: {
      kicker: '직무 · 전기',
      title: '산업 전기 엔지니어 채용',
      sub: '패널 설계, 드라이브, 배전 전문가 — EPLAN 도면, UL 508A / IEC 60204 준수, 그리고 안전하고 시공 가능하며 유지보수하기 쉬운 설계입니다.',
      lead1:
        '산업 전기 엔지니어는 설비가 실제로 제작되는 기반이 되는 설계를 만듭니다. 도면 세트, 열 및 이격 거리 계획을 포함한 패널 레이아웃, 모터 및 VFD 회로, 배전, 보호 기기 조정, 그리고 설치 업체와 제어 팀이 모두 기준으로 삼는 현장 배선 및 I/O 문서까지 포함합니다. 도면이 정확하면 패널 제작 업체는 별다른 문의 없이 제작할 수 있고, 시운전은 검증된 기준선에서 시작됩니다.',
      lead2:
        '도면이 잘못되면 비용은 최악의 시점에 드러납니다 — 제작 및 시운전 중에 재작업, 지연, 안전 지적 사항의 형태로 나타납니다. 규격은 이 직무를 실수에 관대하지 않게 만듭니다. 북미향 설계는 UL 508A와 NFPA 79의 적용을 받고, 유럽향 설계는 IEC 60204의 적용을 받으며, 그 차이는 부품, 정격, 표시까지 이어집니다. 저희는 실제 패널, 드라이브, 규격 준수 문제를 기준으로 전기 엔지니어를 심사하며, 3단계로 인증합니다.',
      faq: [
        {
          q: '산업 전기 엔지니어는 무엇을 납품합니까?',
          a: '완전하고 시공 가능한 문서 세트입니다. 도면(일반적으로 EPLAN 또는 AutoCAD Electrical), 열 계산이 포함된 패널 레이아웃, 자재 명세서, 케이블 및 배선 목록, 보호 기기 규격 산정 및 조정, 그리고 목표 규격에 대한 준수 문서입니다. 마일스톤 기반 프로젝트에서는 금속을 절단하기 전에 이 문서 세트가 대개 설계 검토 마일스톤의 통과 조건이 됩니다.',
        },
        {
          q: 'UL인가 IEC인가 — 왜 목표 시장이 설계를 바꿉니까?',
          a: '규격이 서류상뿐 아니라 실질적으로 다르기 때문입니다. 미국 시장용 UL 508A 패널과 유럽용 IEC 60204 설비는 허용되는 부품과 그 인증, 단락 정격, 도체 규격 산정 규칙, 표시에서 차이가 있습니다. 시장 간에 수정 없이 그대로 옮긴 설계는 검사 실패의 전형적인 원인입니다 — 그러므로 귀사의 설비가 출하되는 규격에 맞는 엔지니어를 매칭하십시오.',
        },
        {
          q: '전기 엔지니어는 제어 측과 어떻게 협업합니까?',
          a: '명확한 인터페이스를 통해서입니다. I/O 목록, 제어 하드웨어를 위한 패널 공간 및 열 예산, 네트워크 및 케이블 분리, 그리고 양측이 합의해야 하는 안전 회로 설계입니다. 다수의 엔지니어가 참여하는 프로젝트에서는 저희 프로젝트 룸이 이 조율을 하나의 스레드로 유지합니다 — 전기 엔지니어, PLC 프로그래머, 그리고 귀사의 팀이 동일한 마일스톤과 동일한 문서를 봅니다.',
        },
        {
          q: 'TalEngineer는 전기 엔지니어를 어떻게 검증합니까?',
          a: '온보딩 시 실무형 AI 스크리닝이 엔지니어 프로필의 검증된 점수를 결정하며, 여기에 더해 전기 분야에서 3단계(L1–L3) 인증을 받을 수 있습니다 — 지도하에 진행하는 표준 패널 레이아웃부터 배전 및 복잡한 전기 시스템 설계까지 아우릅니다. 시험은 AI로 채점된 후 인증서 발급 전에 관리자가 검토하며, 유효한 플랫폼 인증을 보유한 엔지니어만 프로젝트에 공식 배정될 수 있습니다 — 전기 분야 인증을 요구하시는 경우에 한합니다.',
        },
      ],
    },
  },

  'scada-engineer': {
    // 注意：track = 'plc' 不是笔误——平台只有 4 条认证方向（plc/robotics/vision/electrical），
    // SCADA 属于监控层，其筛选与认证诚实地归入 PLC & Controls 方向（见下方 lead2 与 FAQ 第 3 条）。
    track: 'plc',
    name: {
      en: 'SCADA Engineer', zh: 'SCADA 工程师', es: 'Ingeniero SCADA', vi: 'Kỹ sư SCADA',
      hi: 'SCADA इंजीनियर', fr: 'Ingénieur SCADA', de: 'SCADA-Ingenieur', ja: 'SCADAエンジニア', ko: 'SCADA 엔지니어',
    },
    roleSkills: ['Ignition', 'Siemens WinCC', 'FactoryTalk View SE', 'AVEVA (Wonderware)', 'Historians & reporting', 'OPC UA & drivers'],
    relatedPlaybookSlugs: ['scada-integrator-due-diligence-checklist', 'platform-certification-explained'],
    en: {
      kicker: 'Role · PLC & Controls',
      title: 'Hire a SCADA Engineer',
      sub: 'Ignition, WinCC, FactoryTalk View SE and AVEVA specialists for supervisory control, historians and OPC UA integration — verified and escrow-protected.',
      lead1:
        'A SCADA engineer builds the supervisory layer above the machines: the tag database and its naming discipline, operator screens at plant scale, alarm philosophy and rationalization, trending, historian and reporting infrastructure, and the OPC UA and driver connectivity that ties dozens of PLCs into one coherent picture. Done well, it is how a plant actually sees itself; done badly, it is a wall of nuisance alarms nobody trusts.',
      lead2:
        'One thing we state plainly: TalEngineer runs four certification tracks — PLC & Controls, Robotics, Machine Vision and Electrical — and SCADA work is scored and certified within the PLC & Controls track rather than as a separate certificate. That reflects how the work actually connects: supervisory systems stand on controls fundamentals. What you filter on in practice is the platform itself, because an Ignition house and a WinCC house are different toolchains.',
      faq: [
        {
          q: 'What does a SCADA engineer build?',
          a: 'The plant-level supervisory system: tag structure and naming standards, HMI/SCADA screens beyond single-machine scope, alarm management, historian configuration, trending and reports, user and security models, and connectivity — OPC UA, drivers and gateways — to the underlying PLCs and devices. Scopes range from greenfield SCADA builds to migrations between platforms and historian or alarm-rationalization projects.',
        },
        {
          q: 'Which SCADA platforms do engineers on TalEngineer cover?',
          a: 'The major industrial platforms: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE and AVEVA (Wonderware) System Platform / InTouch, plus historian products and OPC UA connectivity. Platform fluency matters as much as it does for PLC brands, so you filter by the specific platform your plant runs.',
        },
        {
          q: 'Is there a dedicated SCADA certification track?',
          a: 'No — and we would rather say so than imply one exists. The platform currently certifies four tracks (PLC & Controls, Robotics, Machine Vision, Electrical), and SCADA engineers are scored and certified under PLC & Controls, where supervisory work technically belongs. The practical AI screening and the project history on an engineer profile are where SCADA-specific depth shows.',
        },
        {
          q: 'How much SCADA work can be done remotely?',
          a: 'More than most automation work: screen development, tag and alarm engineering, historian configuration and reporting are naturally remote-friendly once secure access is in place. Site presence concentrates around connectivity to live equipment, cutovers and acceptance. A common structure is remote development milestones followed by an on-site cutover milestone, all escrow-protected.',
        },
      ],
    },
    zh: {
      kicker: '职位 · PLC 与控制',
      title: '雇佣 SCADA 工程师',
      sub: 'Ignition、WinCC、FactoryTalk View SE、AVEVA 专家，负责监控层、历史库与 OPC UA 集成——经过验证，托管保障。',
      lead1:
        'SCADA 工程师构建的是设备之上的监控层：位号(tag)数据库及其命名纪律、工厂级的操作画面、报警哲学与报警治理、趋势、历史库(historian)与报表基础设施，以及把几十台 PLC 连成一幅连贯图景的 OPC UA 与驱动连接。做得好，它是一座工厂"看见自己"的方式；做得差，它是一墙没人信的垃圾报警。',
      lead2:
        '有一点我们直说：TalEngineer 目前只有四条认证方向——PLC 与控制、机器人、机器视觉、电气——SCADA 工作的评分与认证归入 PLC 与控制方向，而不是一张独立的 SCADA 证书。这也符合工作本身的连接方式：监控系统立在控制基本功之上。实际筛选时你要过滤的是平台本身，因为一个 Ignition 车间和一个 WinCC 车间是两套不同的工具链。',
      faq: [
        {
          q: 'SCADA 工程师构建什么？',
          a: '工厂级监控系统：位号结构与命名标准、超出单机范围的 HMI/SCADA 画面、报警管理、历史库配置、趋势与报表、用户与安全模型，以及通往底层 PLC 与设备的连接——OPC UA、驱动与网关。范围从全新 SCADA 建设，到平台之间的迁移，再到历史库或报警治理专项。',
        },
        {
          q: 'TalEngineer 上的工程师覆盖哪些 SCADA 平台？',
          a: '主流工业平台：Inductive Automation 的 Ignition、Siemens WinCC、Rockwell FactoryTalk View SE、AVEVA(Wonderware) System Platform / InTouch，外加历史库产品与 OPC UA 连接。平台熟练度和 PLC 品牌一样关键，所以要按你工厂实际在跑的具体平台来筛选。',
        },
        {
          q: '有独立的 SCADA 认证方向吗？',
          a: '没有——我们宁可直说，也不暗示它存在。平台目前认证四条方向（PLC 与控制、机器人、机器视觉、电气），SCADA 工程师在 PLC 与控制方向下评分与认证，监控层工作在技术上也确实归属于此。SCADA 专属的深度，体现在实操型 AI 筛选与工程师档案里的项目履历上。',
        },
        {
          q: 'SCADA 工作有多少能远程做？',
          a: '比大多数自动化工作都多：画面开发、位号与报警工程、历史库配置与报表，在安全访问就位后天然适合远程。需要到场的部分集中在与真实设备的连接、切换上线(cutover)与验收。常见的结构是：远程开发里程碑在前，现场切换里程碑在后，全程托管保障。',
        },
      ],
    },
    es: {
      kicker: 'Puesto · PLC y control',
      title: 'Contrate a un ingeniero SCADA',
      sub: 'Especialistas en Ignition, WinCC, FactoryTalk View SE y AVEVA para control supervisorio, historiadores e integración OPC UA — verificados y protegidos por depósito en garantía.',
      lead1:
        'Un ingeniero SCADA construye la capa supervisoria por encima de las máquinas: la base de datos de tags y su disciplina de nomenclatura, pantallas de operador a escala de planta, filosofía y racionalización de alarmas, tendencias, infraestructura de historiador y reportes, y la conectividad OPC UA y de drivers que une decenas de PLC en una sola imagen coherente. Bien hecho, es la forma en que una planta realmente se ve a sí misma; mal hecho, es un muro de alarmas molestas en el que nadie confía.',
      lead2:
        'Una cosa la decimos con claridad: TalEngineer opera cuatro rutas de certificación — PLC y control, Robótica, Visión artificial y Eléctrica — y el trabajo de SCADA se evalúa y certifica dentro de la ruta de PLC y control, y no como un certificado aparte. Esto refleja cómo se conecta realmente el trabajo: los sistemas supervisorios se apoyan en los fundamentos de control. Lo que usted filtra en la práctica es la plataforma misma, porque una planta con Ignition y una con WinCC son cadenas de herramientas distintas.',
      faq: [
        {
          q: '¿Qué construye un ingeniero SCADA?',
          a: 'El sistema supervisorio a nivel de planta: estructura de tags y estándares de nomenclatura, pantallas HMI/SCADA más allá del alcance de una sola máquina, gestión de alarmas, configuración del historiador, tendencias y reportes, modelos de usuario y seguridad, y conectividad — OPC UA, drivers y gateways — hacia los PLC y dispositivos subyacentes. Los alcances van desde construcciones de SCADA desde cero hasta migraciones entre plataformas y proyectos de historiador o racionalización de alarmas.',
        },
        {
          q: '¿Qué plataformas SCADA cubren los ingenieros en TalEngineer?',
          a: 'Las principales plataformas industriales: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE y AVEVA (Wonderware) System Platform / InTouch, además de productos de historiador y conectividad OPC UA. El dominio de la plataforma importa tanto como con las marcas de PLC, así que usted filtra por la plataforma específica que corre en su planta.',
        },
        {
          q: '¿Existe una ruta de certificación dedicada a SCADA?',
          a: 'No — y preferimos decirlo así antes que dar a entender que existe una. La plataforma actualmente certifica cuatro rutas (PLC y control, Robótica, Visión artificial, Eléctrica), y los ingenieros de SCADA se evalúan y certifican bajo PLC y control, donde el trabajo supervisorio pertenece técnicamente. La evaluación práctica con IA y el historial de proyectos en el perfil de un ingeniero son donde se muestra la profundidad específica en SCADA.',
        },
        {
          q: '¿Cuánto trabajo de SCADA se puede hacer de forma remota?',
          a: 'Más que la mayoría del trabajo de automatización: el desarrollo de pantallas, la ingeniería de tags y alarmas, y la configuración del historiador y reportes son naturalmente aptos para el trabajo remoto una vez que hay acceso seguro implementado. La presencia en sitio se concentra en la conectividad con equipos en vivo, las conmutaciones (cutovers) y la aceptación. Una estructura común es hitos de desarrollo remoto seguidos de un hito de conmutación en sitio, todo protegido por depósito en garantía.',
        },
      ],
    },
    vi: {
      kicker: 'Vị trí · PLC & Điều khiển',
      title: 'Thuê kỹ sư SCADA',
      sub: 'Chuyên gia Ignition, WinCC, FactoryTalk View SE và AVEVA cho điều khiển giám sát, historian và tích hợp OPC UA — đã được xác minh, được bảo vệ bằng ký quỹ.',
      lead1:
        'Một kỹ sư SCADA xây dựng lớp giám sát phía trên các máy móc: cơ sở dữ liệu tag và kỷ luật đặt tên, màn hình vận hành ở quy mô toàn nhà máy, triết lý và hợp lý hóa cảnh báo, xu hướng, hạ tầng historian và báo cáo, cùng kết nối OPC UA và driver nối hàng chục PLC thành một bức tranh thống nhất. Làm tốt, đây là cách một nhà máy thực sự "nhìn thấy" chính mình; làm dở, đó là một bức tường cảnh báo phiền toái mà không ai tin tưởng.',
      lead2:
        'Có một điều chúng tôi nói thẳng: TalEngineer vận hành bốn nhóm chứng chỉ — PLC & Điều khiển, Robot công nghiệp, Thị giác máy và Điện — và công việc SCADA được chấm điểm và cấp chứng chỉ trong nhóm PLC & Điều khiển, chứ không phải một chứng chỉ riêng. Điều này phản ánh đúng cách công việc thực sự kết nối với nhau: hệ thống giám sát đứng trên nền tảng cơ bản của điều khiển. Điều bạn thực sự lọc theo trong thực tế là chính nền tảng phần mềm, vì một nhà máy dùng Ignition và một nhà máy dùng WinCC là hai chuỗi công cụ khác nhau.',
      faq: [
        {
          q: 'Kỹ sư SCADA xây dựng những gì?',
          a: 'Hệ thống giám sát ở cấp nhà máy: cấu trúc tag và tiêu chuẩn đặt tên, màn hình HMI/SCADA vượt ra ngoài phạm vi một máy đơn lẻ, quản lý cảnh báo, cấu hình historian, xu hướng và báo cáo, mô hình người dùng và bảo mật, cùng khả năng kết nối — OPC UA, driver và gateway — tới các PLC và thiết bị bên dưới. Phạm vi công việc trải dài từ xây dựng SCADA hoàn toàn mới đến chuyển đổi giữa các nền tảng và các dự án historian hoặc hợp lý hóa cảnh báo.',
        },
        {
          q: 'Các kỹ sư trên TalEngineer bao quát những nền tảng SCADA nào?',
          a: 'Các nền tảng công nghiệp chính: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE và AVEVA (Wonderware) System Platform / InTouch, cùng với các sản phẩm historian và kết nối OPC UA. Sự thành thạo nền tảng quan trọng không kém gì với các thương hiệu PLC, vì vậy bạn lọc theo nền tảng cụ thể mà nhà máy của bạn đang vận hành.',
        },
        {
          q: 'Có một nhóm chứng chỉ SCADA riêng biệt không?',
          a: 'Không — và chúng tôi thà nói thẳng điều đó còn hơn ngụ ý rằng nó tồn tại. Nền tảng hiện cấp chứng chỉ cho bốn nhóm (PLC & Điều khiển, Robot công nghiệp, Thị giác máy, Điện), và các kỹ sư SCADA được chấm điểm và cấp chứng chỉ trong nhóm PLC & Điều khiển, nơi công việc giám sát thực sự thuộc về mặt kỹ thuật. Bài sàng lọc thực hành bằng AI và lịch sử dự án trên hồ sơ của một kỹ sư là nơi thể hiện chiều sâu chuyên biệt về SCADA.',
        },
        {
          q: 'Có bao nhiêu phần công việc SCADA có thể làm từ xa?',
          a: 'Nhiều hơn hầu hết các công việc tự động hóa khác: phát triển màn hình, kỹ thuật tag và cảnh báo, cấu hình historian và báo cáo đều tự nhiên phù hợp với làm việc từ xa một khi có quyền truy cập an toàn được thiết lập. Sự hiện diện tại hiện trường tập trung vào việc kết nối với thiết bị đang vận hành thực tế, chuyển đổi hệ thống (cutover) và nghiệm thu. Một cấu trúc phổ biến là các cột mốc phát triển từ xa, tiếp theo là một cột mốc chuyển đổi tại hiện trường, tất cả đều được bảo vệ bằng ký quỹ.',
        },
      ],
    },
    hi: {
      kicker: 'भूमिका · PLC व कंट्रोल',
      title: 'SCADA इंजीनियर हायर करें',
      sub: 'सुपरवाइज़री कंट्रोल, हिस्टोरियन व OPC UA इंटीग्रेशन के लिए Ignition, WinCC, FactoryTalk View SE और AVEVA स्पेशलिस्ट — वेरिफ़ाइड और एस्क्रो-प्रोटेक्टेड।',
      lead1:
        'एक SCADA इंजीनियर मशीनों के ऊपर सुपरवाइज़री लेयर बनाता है: टैग डेटाबेस व उसकी नेमिंग डिसिप्लिन, प्लांट-स्केल ऑपरेटर स्क्रीन, अलार्म फ़िलॉसफ़ी व रैशनलाइज़ेशन, ट्रेंडिंग, हिस्टोरियन व रिपोर्टिंग इन्फ्रास्ट्रक्चर, और वह OPC UA व ड्राइवर कनेक्टिविटी जो दर्जनों PLC को एक कोहेरेंट तस्वीर में बांधती है। अच्छे से किया जाए, तो यही वह तरीक़ा है जिससे कोई प्लांट ख़ुद को असल में देखता है; ख़राब तरीक़े से किया जाए, तो यह न्यूइसेंस अलार्म्स की एक दीवार बन जाती है जिस पर कोई भरोसा नहीं करता।',
      lead2:
        'एक बात हम साफ़-साफ़ कहते हैं: TalEngineer चार प्रमाणन ट्रैक चलाता है — PLC व कंट्रोल, रोबोटिक्स, मशीन विज़न और इलेक्ट्रिकल — और SCADA काम को अलग सर्टिफ़िकेट के बजाय PLC व कंट्रोल ट्रैक के भीतर स्कोर व प्रमाणित किया जाता है। यह इस बात को दिखाता है कि काम असल में कैसे जुड़ा है: सुपरवाइज़री सिस्टम कंट्रोल के बुनियादी सिद्धांतों पर ही खड़े होते हैं। व्यवहार में आप जिस चीज़ पर फ़िल्टर करते हैं वह ख़ुद प्लेटफ़ॉर्म है, क्योंकि एक Ignition वाला प्लांट और एक WinCC वाला प्लांट दो अलग-अलग टूलचेन हैं।',
      faq: [
        {
          q: 'SCADA इंजीनियर क्या बनाता है?',
          a: 'प्लांट-लेवल सुपरवाइज़री सिस्टम: टैग स्ट्रक्चर व नेमिंग स्टैंडर्ड्स, सिंगल-मशीन स्कोप से आगे बढ़े हुए HMI/SCADA स्क्रीन, अलार्म मैनेजमेंट, हिस्टोरियन कॉन्फ़िगरेशन, ट्रेंडिंग व रिपोर्ट्स, यूज़र व सिक्योरिटी मॉडल, और अंडरलाइंग PLC व डिवाइसेस तक कनेक्टिविटी — OPC UA, ड्राइवर व गेटवे। स्कोप ग्रीनफ़ील्ड SCADA बिल्ड से लेकर प्लेटफ़ॉर्म्स के बीच माइग्रेशन और हिस्टोरियन या अलार्म-रैशनलाइज़ेशन प्रोजेक्ट्स तक फैले होते हैं।',
        },
        {
          q: 'TalEngineer पर इंजीनियर कौन-से SCADA प्लेटफ़ॉर्म कवर करते हैं?',
          a: 'प्रमुख इंडस्ट्रियल प्लेटफ़ॉर्म्स: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE और AVEVA (Wonderware) System Platform / InTouch, साथ ही हिस्टोरियन प्रोडक्ट्स व OPC UA कनेक्टिविटी। प्लेटफ़ॉर्म फ़्लुएंसी उतनी ही मायने रखती है जितनी PLC ब्रांड्स के लिए रखती है, इसलिए आप उस ख़ास प्लेटफ़ॉर्म के हिसाब से फ़िल्टर करते हैं जो आपके प्लांट में चलता है।',
        },
        {
          q: 'क्या कोई डेडिकेटेड SCADA प्रमाणन ट्रैक है?',
          a: 'नहीं — और हम यह साफ़ कहना पसंद करेंगे बजाय इसके कि ऐसा कुछ होने का आभास दें। प्लेटफ़ॉर्म फ़िलहाल चार ट्रैक प्रमाणित करता है (PLC व कंट्रोल, रोबोटिक्स, मशीन विज़न, इलेक्ट्रिकल), और SCADA इंजीनियर PLC व कंट्रोल के तहत स्कोर व प्रमाणित होते हैं, जहाँ सुपरवाइज़री काम तकनीकी रूप से आता है। व्यावहारिक AI स्क्रीनिंग और किसी इंजीनियर की प्रोफ़ाइल पर प्रोजेक्ट हिस्ट्री ही वह जगह है जहाँ SCADA-स्पेसिफिक डेप्थ दिखती है।',
        },
        {
          q: 'SCADA का कितना काम रिमोट किया जा सकता है?',
          a: 'ज़्यादातर ऑटोमेशन काम से ज़्यादा: स्क्रीन डेवलपमेंट, टैग व अलार्म इंजीनियरिंग, हिस्टोरियन कॉन्फ़िगरेशन व रिपोर्टिंग — एक बार सिक्योर एक्सेस सेट हो जाए, तो स्वाभाविक रूप से रिमोट-फ़्रेंडली होते हैं। साइट पर मौजूदगी लाइव इक्विपमेंट से कनेक्टिविटी, कटओवर व एक्सेप्टेंस के इर्द-गिर्द केंद्रित होती है। एक आम स्ट्रक्चर है: रिमोट डेवलपमेंट माइलस्टोन, उसके बाद एक ऑन-साइट कटओवर माइलस्टोन, सब कुछ एस्क्रो-प्रोटेक्टेड।',
        },
      ],
    },
    fr: {
      kicker: 'Poste · PLC & Contrôle-commande',
      title: 'Recrutez un ingénieur SCADA',
      sub: "Spécialistes Ignition, WinCC, FactoryTalk View SE et AVEVA pour la supervision, les historiques (historians) et l'intégration OPC UA — vérifiés et protégés par séquestre.",
      lead1:
        "Un ingénieur SCADA construit la couche de supervision au-dessus des machines : la base de données de tags et sa discipline de nommage, les écrans opérateur à l'échelle de l'usine, la philosophie et la rationalisation des alarmes, les courbes de tendance, l'infrastructure d'historisation et de reporting, ainsi que la connectivité OPC UA et les drivers qui réunissent des dizaines d'automates en une image cohérente. Bien fait, c'est la manière dont une usine se voit réellement elle-même ; mal fait, c'est un mur d'alarmes intempestives auquel plus personne ne fait confiance.",
      lead2:
        "Une chose que nous affirmons clairement : TalEngineer gère quatre filières de certification — PLC & Contrôle-commande, Robotique, Vision industrielle et Électrique — et le travail SCADA est évalué et certifié dans la filière PLC & Contrôle-commande plutôt que comme un certificat distinct. Cela reflète la manière dont le travail se connecte réellement : les systèmes de supervision reposent sur les fondamentaux du contrôle-commande. Ce que vous filtrez en pratique, c'est la plateforme elle-même, car un site sous Ignition et un site sous WinCC sont deux chaînes d'outils différentes.",
      faq: [
        {
          q: 'Que construit un ingénieur SCADA ?',
          a: "Le système de supervision au niveau de l'usine : structure des tags et normes de nommage, écrans HMI/SCADA au-delà du périmètre d'une seule machine, gestion des alarmes, configuration de l'historisation, courbes de tendance et rapports, modèles d'utilisateurs et de sécurité, et connectivité — OPC UA, drivers et passerelles — vers les automates et appareils sous-jacents. Les périmètres vont de la création d'un SCADA sur site neuf à des migrations entre plateformes et à des projets d'historisation ou de rationalisation des alarmes.",
        },
        {
          q: 'Quelles plateformes SCADA les ingénieurs de TalEngineer couvrent-ils ?',
          a: "Les principales plateformes industrielles : Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE et AVEVA (Wonderware) System Platform / InTouch, ainsi que des produits d'historisation et la connectivité OPC UA. La maîtrise de la plateforme compte autant que pour les marques d'automates, donc vous filtrez selon la plateforme spécifique utilisée dans votre usine.",
        },
        {
          q: 'Existe-t-il une filière de certification SCADA dédiée ?',
          a: "Non — et nous préférons le dire clairement plutôt que de laisser entendre qu'elle existe. La plateforme certifie actuellement quatre filières (PLC & Contrôle-commande, Robotique, Vision industrielle, Électrique), et les ingénieurs SCADA sont évalués et certifiés dans la filière PLC & Contrôle-commande, à laquelle le travail de supervision appartient techniquement. L'évaluation pratique par IA et l'historique de projets sur le profil d'un ingénieur sont l'endroit où se révèle la profondeur spécifique en SCADA.",
        },
        {
          q: 'Quelle part du travail SCADA peut être réalisée à distance ?',
          a: "Plus que la plupart des travaux d'automatisme : le développement d'écrans, l'ingénierie des tags et des alarmes, la configuration de l'historisation et le reporting se prêtent naturellement au travail à distance une fois un accès sécurisé en place. La présence sur site se concentre autour de la connectivité aux équipements en fonctionnement, des bascules (cutovers) et de la réception. Une structure courante consiste en des jalons de développement à distance suivis d'un jalon de bascule sur site, le tout protégé par séquestre.",
        },
      ],
    },
    de: {
      kicker: 'Rolle · PLC & Steuerungstechnik',
      title: 'SCADA-Ingenieur engagieren',
      sub: 'Spezialisten für Ignition, WinCC, FactoryTalk View SE und AVEVA für Leitsystemtechnik, Historians und OPC-UA-Integration — verifiziert und durch Treuhand abgesichert.',
      lead1:
        'Ein SCADA-Ingenieur baut die Leitebene oberhalb der Maschinen: die Tag-Datenbank mit ihrer Namensdisziplin, Bedienbildschirme im Anlagenmaßstab, Alarmphilosophie und -rationalisierung, Trending, Historian- und Reporting-Infrastruktur sowie die OPC-UA- und Treiberanbindung, die Dutzende von Steuerungen zu einem stimmigen Gesamtbild verbindet. Gut gemacht ist es, wie sich eine Anlage tatsächlich selbst sieht; schlecht gemacht ist es eine Wand aus Störalarmen, der niemand mehr vertraut.',
      lead2:
        'Eines sagen wir klar: TalEngineer betreibt vier Zertifizierungsbereiche — PLC & Steuerungstechnik, Robotik, Bildverarbeitung und Elektrotechnik — und SCADA-Arbeit wird innerhalb des Bereichs PLC & Steuerungstechnik bewertet und zertifiziert, statt als eigenes Zertifikat. Das spiegelt wider, wie die Arbeit tatsächlich zusammenhängt: Leitsysteme bauen auf den Grundlagen der Steuerungstechnik auf. Worauf Sie in der Praxis filtern, ist die Plattform selbst, denn ein Ignition-Betrieb und ein WinCC-Betrieb sind unterschiedliche Toolchains.',
      faq: [
        {
          q: 'Was baut ein SCADA-Ingenieur?',
          a: 'Das Leitsystem auf Anlagenebene: Tag-Struktur und Namenskonventionen, HMI-/SCADA-Bildschirme über den Umfang einer einzelnen Maschine hinaus, Alarmmanagement, Historian-Konfiguration, Trending und Berichte, Benutzer- und Sicherheitsmodelle sowie Konnektivität — OPC UA, Treiber und Gateways — zu den zugrunde liegenden Steuerungen und Geräten. Die Aufgabenbereiche reichen von SCADA-Neubauten bis zu Plattformmigrationen sowie Historian- oder Alarmrationalisierungsprojekten.',
        },
        {
          q: 'Welche SCADA-Plattformen decken die Ingenieure bei TalEngineer ab?',
          a: 'Die wichtigsten Industrieplattformen: Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE und AVEVA (Wonderware) System Platform / InTouch, dazu Historian-Produkte und OPC-UA-Konnektivität. Plattformkenntnis zählt ebenso wie bei PLC-Marken, daher filtern Sie nach der konkreten Plattform, die in Ihrer Anlage läuft.',
        },
        {
          q: 'Gibt es einen eigenen SCADA-Zertifizierungsbereich?',
          a: 'Nein — und wir sagen das lieber offen, als den Eindruck zu erwecken, es gäbe einen. Die Plattform zertifiziert derzeit vier Bereiche (PLC & Steuerungstechnik, Robotik, Bildverarbeitung, Elektrotechnik), und SCADA-Ingenieure werden im Bereich PLC & Steuerungstechnik bewertet und zertifiziert, wohin Leitsystemarbeit fachlich gehört. Das praxisnahe KI-Assessment und die Projekthistorie im Profil eines Ingenieurs sind die Stellen, an denen sich SCADA-spezifische Tiefe zeigt.',
        },
        {
          q: 'Wie viel SCADA-Arbeit kann remote erledigt werden?',
          a: 'Mehr als bei den meisten Automatisierungsarbeiten: Bildschirmentwicklung, Tag- und Alarmengineering sowie Historian-Konfiguration und Reporting eignen sich naturgemäß für die Fernarbeit, sobald ein sicherer Zugang eingerichtet ist. Die Präsenz vor Ort konzentriert sich auf die Anbindung an laufende Anlagen, Umschaltungen (Cutover) und die Abnahme. Eine übliche Struktur sind Remote-Entwicklungsmeilensteine, gefolgt von einem Vor-Ort-Umschaltmeilenstein, alles durch Treuhand abgesichert.',
        },
      ],
    },
    ja: {
      kicker: '職種 · PLC & 制御',
      title: 'SCADAエンジニアを採用',
      sub: '監視制御、ヒストリアン、OPC UA統合に対応するIgnition、WinCC、FactoryTalk View SE、AVEVAのスペシャリスト——検証済みでエスクローによって保護されます。',
      lead1:
        'SCADAエンジニアは、機械群の上に位置する監視レイヤーを構築します。タグデータベースとその命名規律、プラント全体規模のオペレーター画面、アラーム哲学とラショナライゼーション、トレンド、ヒストリアンとレポーティングのインフラ、そして数十台のPLCを一つの一貫した全体像に結びつけるOPC UAとドライバー接続です。うまく作られれば、それはプラントが実際に自分自身を見る方法になります。まずく作られれば、それは誰も信用しない迷惑アラームの壁になります。',
      lead2:
        '当社が明確に述べておきたいことが一つあります。TalEngineerはPLC & 制御、ロボティクス、マシンビジョン、電気という4つの認定分野を運営しており、SCADA業務は独立した認定としてではなく、PLC & 制御分野の中で採点・認定されます。これは実際に業務がどうつながっているかを反映したものです——監視システムは制御の基礎の上に成り立っています。実務上絞り込む対象はプラットフォームそのものです。IgnitionベースのプラントとWinCCベースのプラントでは、まったく異なるツールチェーンになるためです。',
      faq: [
        {
          q: 'SCADAエンジニアは何を構築しますか？',
          a: 'プラントレベルの監視システムです。タグ構造と命名規格、単一機械の範囲を超えたHMI/SCADA画面、アラーム管理、ヒストリアンの設定、トレンドとレポート、ユーザーおよびセキュリティのモデル、そして基盤となるPLCやデバイスへの接続——OPC UA、ドライバー、ゲートウェイです。作業範囲は、グリーンフィールドのSCADA構築から、プラットフォーム間の移行、ヒストリアンやアラームのラショナライゼーションのプロジェクトまで多岐にわたります。',
        },
        {
          q: 'TalEngineerのエンジニアはどのSCADAプラットフォームに対応していますか？',
          a: '主要な産業用プラットフォームです。Inductive Automation Ignition、Siemens WinCC、Rockwell FactoryTalk View SE、AVEVA（Wonderware）System Platform / InTouch、さらにヒストリアン製品とOPC UA接続です。プラットフォームへの習熟度はPLCブランドと同様に重要であるため、お客様のプラントで稼働している具体的なプラットフォームで絞り込んでいただきます。',
        },
        {
          q: '専用のSCADA認定分野はありますか？',
          a: 'ありません——存在するかのように示唆するより、はっきりとそう申し上げる方を選びます。当プラットフォームは現在4つの分野（PLC & 制御、ロボティクス、マシンビジョン、電気）を認定しており、SCADAエンジニアはPLC & 制御の下で採点・認定されます。監視業務は技術的にはそこに属するものです。SCADA固有の深さは、実践的なAIスクリーニングとエンジニアのプロフィール上のプロジェクト履歴に表れます。',
        },
        {
          q: 'SCADAの作業のうち、どの程度をリモートで行えますか？',
          a: 'ほとんどの自動化作業よりも多くの部分です。画面開発、タグとアラームのエンジニアリング、ヒストリアンの設定とレポーティングは、安全なアクセスさえ整えば、本質的にリモートに適しています。現場での立ち会いは、稼働中の実機との接続、切り替え（カットオーバー）、受け入れに集中します。よくある構成は、リモートでの開発マイルストーンの後に現場での切り替えマイルストーンを設け、すべてエスクローで保護するというものです。',
        },
      ],
    },
    ko: {
      kicker: '직무 · PLC 및 제어',
      title: 'SCADA 엔지니어 채용',
      sub: '감시 제어, 히스토리안, OPC UA 통합을 위한 Ignition, WinCC, FactoryTalk View SE, AVEVA 전문가 — 검증되었으며 에스크로로 보호됩니다.',
      lead1:
        'SCADA 엔지니어는 설비 위에 위치하는 감시 계층을 구축합니다. 태그 데이터베이스와 그 명명 규율, 공장 전체 규모의 운전원 화면, 알람 철학 및 합리화, 트렌드, 히스토리안 및 보고 인프라, 그리고 수십 대의 PLC를 하나의 일관된 그림으로 묶어주는 OPC UA 및 드라이버 연결까지 포함합니다. 잘 만들어지면 이는 공장이 스스로를 실제로 파악하는 방식이 됩니다. 잘못 만들어지면 아무도 신뢰하지 않는 성가신 알람의 벽이 됩니다.',
      lead2:
        '한 가지는 분명히 말씀드립니다. TalEngineer는 PLC 및 제어, 로보틱스, 머신 비전, 전기의 4개 인증 분야를 운영하며, SCADA 업무는 별도의 인증이 아니라 PLC 및 제어 분야 내에서 채점되고 인증됩니다. 이는 실제로 업무가 어떻게 연결되는지를 반영합니다 — 감시 시스템은 제어의 기본 위에 세워집니다. 실제로 귀사가 필터링하는 대상은 플랫폼 그 자체입니다. Ignition 기반 공장과 WinCC 기반 공장은 서로 다른 툴체인이기 때문입니다.',
      faq: [
        {
          q: 'SCADA 엔지니어는 무엇을 구축합니까?',
          a: '공장 수준의 감시 시스템입니다. 태그 구조 및 명명 표준, 단일 설비 범위를 넘어서는 HMI/SCADA 화면, 알람 관리, 히스토리안 구성, 트렌드 및 리포트, 사용자 및 보안 모델, 그리고 기저의 PLC와 장치에 대한 연결성 — OPC UA, 드라이버, 게이트웨이까지 포함합니다. 작업 범위는 신규 SCADA 구축부터 플랫폼 간 마이그레이션, 히스토리안 또는 알람 합리화 프로젝트까지 다양합니다.',
        },
        {
          q: 'TalEngineer의 엔지니어는 어떤 SCADA 플랫폼을 다룹니까?',
          a: '주요 산업용 플랫폼입니다. Inductive Automation Ignition, Siemens WinCC, Rockwell FactoryTalk View SE, AVEVA(Wonderware) System Platform / InTouch, 그리고 히스토리안 제품과 OPC UA 연결성입니다. 플랫폼 숙련도는 PLC 브랜드만큼이나 중요하므로, 귀사의 공장에서 실제로 운영 중인 플랫폼을 기준으로 필터링하시게 됩니다.',
        },
        {
          q: '전용 SCADA 인증 분야가 있습니까?',
          a: '없습니다 — 존재하는 것처럼 암시하기보다 명확히 말씀드리는 쪽을 택합니다. 플랫폼은 현재 4개 분야(PLC 및 제어, 로보틱스, 머신 비전, 전기)를 인증하며, SCADA 엔지니어는 감시 업무가 기술적으로 속하는 PLC 및 제어 분야에서 채점되고 인증됩니다. SCADA 고유의 전문성은 실무형 AI 스크리닝과 엔지니어 프로필상의 프로젝트 이력에서 드러납니다.',
        },
        {
          q: 'SCADA 작업 중 얼마나 원격으로 가능합니까?',
          a: '대부분의 자동화 작업보다 더 많은 부분이 가능합니다. 화면 개발, 태그 및 알람 엔지니어링, 히스토리안 구성 및 리포팅은 안전한 접근 권한만 마련되면 본질적으로 원격 작업에 적합합니다. 현장 참여는 실제 가동 중인 설비와의 연결, 전환(cutover), 승인에 집중됩니다. 흔한 구조는 원격 개발 마일스톤에 이어 현장 전환 마일스톤을 두는 것이며, 모두 에스크로로 보호됩니다.',
        },
      ],
    },
  },
};

const OCCUPATION_SLUGS = Object.keys(OCCUPATIONS);

// ── 对外辅助 ─────────────────────────────────────────────────────────────

// getStaticPaths 用：枚举全部 6 个职业页的 {role}。
export function getOccupationPaths() {
  return OCCUPATION_SLUGS.map((role) => ({ params: { role } }));
}

// 某认证方向下的职业清单（/hire/[track] 的「常见职位名」带 + 职业页的兄弟职业内链共用）。
// 返回 [{ role, name: {en,zh} }]；scada-engineer 因认证归属会出现在 plc 方向下——这是刻意的。
export function getRolesForTrack(track) {
  return OCCUPATION_SLUGS.filter((slug) => OCCUPATIONS[slug].track === track).map((slug) => ({
    role: slug,
    name: OCCUPATIONS[slug].name,
  }));
}

// 拼装职业页所需的全部数据：职业内容 + 方向元数据 + 费率表 + 内链。
// 未知 slug 返回 null（getStaticProps 里转 notFound，照 getMatrixPage 的约定）。
export function getOccupationPage(slug) {
  const entry = OCCUPATIONS[slug];
  if (!entry) return null;

  // 方向元数据（label/kicker/skills/levels）从 hireMatrix 单一来源取，避免文案重抄漂移。
  const trackMeta = getTrackMeta(entry.track);

  return {
    role: slug,
    track: entry.track,
    name: entry.name,
    roleSkills: entry.roleSkills,
    trackMeta,
    // 费率表：直接复用全站唯一来源 REGIONS（lib/hireMatrix），职业页不编"职业级费率差异"。
    regions: REGIONS,
    // 费率说明文案：单一来源 RATES_NOTE（lib/hireMatrix），职业页不重抄措辞（IA review #3/#14）。
    ratesNote: RATES_NOTE,
    content: {
      en: entry.en, zh: entry.zh, es: entry.es, vi: entry.vi, hi: entry.hi,
      fr: entry.fr, de: entry.de, ja: entry.ja, ko: entry.ko,
    },
    links: {
      // 所属方向母页
      trackPage: { href: `/hire/${entry.track}`, label: trackMeta.label },
      // 该方向下的行业垂直页（electrical 无组合时为空数组，页面按空态处理）
      industries: getIndustriesForTrack(entry.track).map((i) => ({
        href: `/hire/${entry.track}/${i.industry}`,
        label: i.label,
      })),
      // 兄弟职业（同方向的其他职业页）
      siblings: getRolesForTrack(entry.track)
        .filter((r) => r.role !== slug)
        .map((r) => ({ href: `/occupations/${r.role}`, label: r.name })),
      // 手工策展的相关 Playbook 文章（标题由页面层经 lib/playbook 解析，这里只给 slug/href）
      playbook: (entry.relatedPlaybookSlugs || []).map((s) => ({ href: `/playbook/${s}`, slug: s })),
    },
  };
}
