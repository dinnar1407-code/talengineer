// ── /contact 页语言字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──────
//
// 来源：pages/contact.jsx 内联 DICT（en/zh 逐字节原样搬移，2026-07-24）。
// 纯机械搬移：文案零改动；渲染逻辑（DICT[lang] || DICT.en）留在页面。
// ── 诚实红线 ──────────────────────────────────────────────────────────────────
// 本页零平台数字、零编造承诺：不写"24 小时内回复"之类我们尚无数据支撑的 SLA，
// 预期文案只如实说明 founding 阶段"真人阅读、尽快回复"。联系路径只列真实存在的
// 三条：邮箱 hello@talengineer.us、发单 /talent、工程师入驻 /talent。

// 文案字典：en/zh 两套全量，其余语言回退英文（全站 `|| en` 约定，SSR 首帧英文）。
const DICT = {
  en: {
    kicker: 'Contact',
    title: 'Talk to Talengineer',
    sub: 'Whether you are hiring, applying as an engineer, or just have a question — pick the route below that fits, and it will land in front of the right process.',

    // ── 三张联系卡 ─────────────────────────────────────────────────────────
    card1Title: 'Email us',
    card1Body:
      'General questions, partnerships, press, billing or account issues — one address covers them all. Write in whichever of our 9 languages you prefer.',
    card1Cta: 'hello@talengineer.us',
    card2Title: 'Hiring? Post a project',
    card2Body:
      'The fastest way to get an answer about your project is to post it: describe the need in natural language, AI structures it into a scope of work with milestones, and matched certified engineers come back to you. Posting is free — you fund escrow only after choosing an engineer.',
    card2Cta: 'Post a Project — Free →',
    card3Title: 'Engineer? Apply to join',
    card3Body:
      'Applying and being listed is free. You will go through a hands-on AI technical screening in your specialty, and can then take platform certification exams — certification is what makes you assignable to projects.',
    card3Cta: 'Apply as an Engineer →',

    // ── 诚实预期（不编 SLA）───────────────────────────────────────────────
    expectTitle: 'What to expect',
    expectBody:
      'We are a founding-stage platform, and every message to hello@talengineer.us is read by a human. We reply as quickly as we can — but we would rather tell you that honestly than promise a response-time guarantee we cannot yet stand behind. If you are already on an active project, the fastest channel is your project chat (it is live-translated), and the work-order dispute flow if something has gone wrong.',
  },

  zh: {
    kicker: '联系我们',
    title: '与 Talengineer 对话',
    sub: '无论你是要招人、要以工程师身份入驻，还是只有一个问题——选择下面合适的入口，它会直达对应的流程。',

    card1Title: '写邮件给我们',
    card1Body:
      '一般咨询、合作、媒体、账单或账号问题——一个地址全覆盖。用平台支持的 9 种语言中你顺手的那种写就行。',
    card1Cta: 'hello@talengineer.us',
    card2Title: '要招人？直接发布项目',
    card2Body:
      '关于你项目的问题，最快的解答方式就是把它发出来：用自然语言描述需求，AI 会将其结构化为带里程碑的工作范围，匹配到的持证工程师会来响应你。发布免费——选定工程师之后才需要注资托管。',
    card2Cta: '免费发布项目 →',
    card3Title: '工程师？申请入驻',
    card3Body:
      '申请与上架均不收费。你会先经过所报方向的实操型 AI 技术筛选，之后可参加平台认证考试——持有认证，才能被指派到项目。',
    card3Cta: '以工程师身份申请 →',

    expectTitle: '你可以期待什么',
    expectBody:
      '我们是一个 founding 阶段的平台，发到 hello@talengineer.us 的每封邮件都由真人阅读。我们会尽快回复——但我们宁可诚实地这样说，也不承诺一个目前还无法兑现的响应时限。如果你已在进行中的项目里，最快的通道是项目聊天（实时互译）；出了问题，则走工单的纠纷流程。',
  },

  es: {
    kicker: "Contacto",
    title: "Hable con Talengineer",
    sub: "Ya sea que esté contratando, postulándose como ingeniero, o simplemente tenga una pregunta, elija a continuación la vía que mejor se ajuste y llegará directamente al proceso correspondiente.",
    card1Title: "Escríbanos",
    card1Body: "Preguntas generales, asociaciones, prensa, facturación o problemas de cuenta — una sola dirección cubre todo. Escriba en cualquiera de nuestros 9 idiomas.",
    card1Cta: "hello@talengineer.us",
    card2Title: "¿Va a contratar? Publique un proyecto",
    card2Body: "La forma más rápida de obtener una respuesta sobre su proyecto es publicarlo: describa la necesidad en lenguaje natural, la IA la estructura en un alcance de trabajo con hitos, y los ingenieros certificados que coincidan le responderán. Publicar es gratis — usted financia el depósito en garantía solo después de elegir a un ingeniero.",
    card2Cta: "Publicar un proyecto — Gratis →",
    card3Title: "¿Es ingeniero? Postúlese para unirse",
    card3Body: "Postularse y aparecer en el listado es gratuito. Pasará por una evaluación técnica práctica con IA en su especialidad, y luego podrá presentar los exámenes de certificación de la plataforma — la certificación es lo que le permite ser asignado a proyectos.",
    card3Cta: "Postularse como ingeniero →",
    expectTitle: "Qué esperar",
    expectBody: "Somos una plataforma en etapa fundadora, y cada mensaje a hello@talengineer.us lo lee una persona. Respondemos lo más rápido que podemos, pero preferimos decírselo con honestidad antes que prometer una garantía de tiempo de respuesta que aún no podemos respaldar. Si ya está en un proyecto activo, el canal más rápido es el chat de su proyecto (traducido en vivo), y el flujo de disputas de la orden de trabajo si algo ha salido mal.",
  },

  vi: {
    kicker: "Liên hệ",
    title: "Trò chuyện với Talengineer",
    sub: "Dù bạn đang tuyển dụng, ứng tuyển làm kỹ sư, hay chỉ có một câu hỏi — hãy chọn lối vào phù hợp bên dưới, nó sẽ đưa bạn thẳng đến đúng quy trình.",
    card1Title: "Gửi email cho chúng tôi",
    card1Body: "Câu hỏi chung, hợp tác, báo chí, thanh toán hoặc vấn đề tài khoản — một địa chỉ duy nhất bao quát tất cả. Hãy viết bằng bất kỳ ngôn ngữ nào trong 9 ngôn ngữ mà chúng tôi hỗ trợ.",
    card1Cta: "hello@talengineer.us",
    card2Title: "Đang tuyển dụng? Đăng dự án",
    card2Body: "Cách nhanh nhất để có câu trả lời về dự án của bạn là đăng nó lên: mô tả nhu cầu bằng ngôn ngữ tự nhiên, AI sẽ cấu trúc hóa thành phạm vi công việc kèm cột mốc, và các kỹ sư có chứng chỉ phù hợp sẽ phản hồi bạn. Đăng dự án miễn phí — bạn chỉ nạp tiền ký quỹ sau khi đã chọn được kỹ sư.",
    card2Cta: "Đăng dự án — Miễn phí →",
    card3Title: "Là kỹ sư? Ứng tuyển tham gia",
    card3Body: "Ứng tuyển và được liệt kê đều miễn phí. Bạn sẽ trải qua một bài sàng lọc kỹ thuật AI thực hành trong chuyên môn của mình, sau đó có thể tham gia các kỳ thi chứng chỉ của nền tảng — chứng chỉ chính là điều giúp bạn có thể được phân công vào dự án.",
    card3Cta: "Ứng tuyển làm kỹ sư →",
    expectTitle: "Bạn có thể mong đợi điều gì",
    expectBody: "Chúng tôi là một nền tảng ở giai đoạn sáng lập, và mỗi tin nhắn gửi đến hello@talengineer.us đều được một người thật đọc. Chúng tôi trả lời nhanh nhất có thể — nhưng chúng tôi thà nói thẳng điều đó hơn là hứa hẹn một cam kết thời gian phản hồi mà chúng tôi chưa thể đảm bảo. Nếu bạn đã có dự án đang hoạt động, kênh nhanh nhất là trò chuyện dự án của bạn (được dịch trực tiếp), và quy trình tranh chấp của lệnh công việc nếu có sự cố xảy ra.",
  },

  hi: {
    kicker: "संपर्क करें",
    title: "Talengineer से बात करें",
    sub: "चाहे आप हायर कर रहे हों, इंजीनियर के रूप में आवेदन कर रहे हों, या बस एक सवाल हो — नीचे वह रास्ता चुनें जो फ़िट बैठे, और यह सीधे सही प्रक्रिया तक पहुँचेगा।",
    card1Title: "हमें ईमेल करें",
    card1Body: "सामान्य सवाल, पार्टनरशिप, प्रेस, बिलिंग या अकाउंट संबंधी मुद्दे — एक ही पता सब कुछ कवर करता है। हमारी 9 भाषाओं में से जो भी आपको पसंद हो, उसमें लिखें।",
    card1Cta: "hello@talengineer.us",
    card2Title: "हायर कर रहे हैं? प्रोजेक्ट पोस्ट करें",
    card2Body: "अपने प्रोजेक्ट के बारे में जवाब पाने का सबसे तेज़ तरीका है उसे पोस्ट करना: प्राकृतिक भाषा में ज़रूरत बताएँ, AI इसे माइलस्टोन के साथ वर्क के स्कोप में संरचित करता है, और मैच किए गए प्रमाणित इंजीनियर आपसे संपर्क करेंगे। पोस्ट करना मुफ़्त है — इंजीनियर चुनने के बाद ही आप एस्क्रो में राशि जमा करते हैं।",
    card2Cta: "प्रोजेक्ट पोस्ट करें — निःशुल्क →",
    card3Title: "इंजीनियर हैं? जुड़ने के लिए आवेदन करें",
    card3Body: "आवेदन करना और लिस्टेड होना दोनों मुफ़्त हैं। आप अपने विषय में एक हैंड्स-ऑन AI टेक्निकल स्क्रीनिंग से गुज़रेंगे, और फिर प्लेटफ़ॉर्म के प्रमाणन परीक्षा दे सकते हैं — प्रमाणन ही वह चीज़ है जो आपको प्रोजेक्ट्स के लिए असाइन किए जाने लायक बनाती है।",
    card3Cta: "इंजीनियर के रूप में आवेदन करें →",
    expectTitle: "क्या उम्मीद करें",
    expectBody: "हम एक founding-stage प्लेटफ़ॉर्म हैं, और hello@talengineer.us पर आया हर संदेश एक इंसान पढ़ता है। हम जितनी जल्दी हो सके जवाब देते हैं — लेकिन हम एक ऐसी रिस्पॉन्स-टाइम गारंटी का वादा करने के बजाय, जिसे हम अभी निभा नहीं सकते, यह ईमानदारी से बताना पसंद करते हैं। अगर आप पहले से किसी सक्रिय प्रोजेक्ट पर हैं, तो सबसे तेज़ चैनल है आपकी प्रोजेक्ट चैट (जो लाइव अनुवादित होती है), और अगर कुछ गलत हुआ हो तो वर्क ऑर्डर का विवाद फ़्लो।",
  },

  fr: {
    kicker: "Contact",
    title: "Parlez à Talengineer",
    sub: "Que vous recrutiez, postuliez comme ingénieur, ou ayez simplement une question — choisissez ci-dessous la voie qui vous convient, elle vous mènera directement au bon processus.",
    card1Title: "Écrivez-nous",
    card1Body: "Questions générales, partenariats, presse, facturation ou problèmes de compte — une seule adresse couvre tout. Écrivez dans l’une de nos 9 langues, celle que vous préférez.",
    card1Cta: "hello@talengineer.us",
    card2Title: "Vous recrutez ? Publiez un projet",
    card2Body: "La façon la plus rapide d’obtenir une réponse sur votre projet est de le publier : décrivez le besoin en langage naturel, l’IA le structure en un cahier des charges avec jalons, et des ingénieurs certifiés correspondants vous répondent. La publication est gratuite — vous ne provisionnez le séquestre qu’une fois un ingénieur choisi.",
    card2Cta: "Publier un projet — Gratuit →",
    card3Title: "Vous êtes ingénieur ? Postulez pour nous rejoindre",
    card3Body: "Postuler et figurer dans l’annuaire est gratuit. Vous passerez une évaluation technique pratique par IA dans votre spécialité, puis pourrez passer les examens de certification de la plateforme — c’est la certification qui vous rend affectable à des projets.",
    card3Cta: "Postuler comme ingénieur →",
    expectTitle: "À quoi vous attendre",
    expectBody: "Nous sommes une plateforme en phase fondatrice, et chaque message envoyé à hello@talengineer.us est lu par une personne. Nous répondons aussi vite que possible — mais nous préférons vous le dire honnêtement plutôt que de promettre une garantie de délai de réponse que nous ne pouvons pas encore tenir. Si vous êtes déjà sur un projet actif, le canal le plus rapide est le chat de votre projet (traduit en direct), et le processus de litige de l’ordre de travail si quelque chose s’est mal passé.",
  },

  de: {
    kicker: "Kontakt",
    title: "Sprechen Sie mit Talengineer",
    sub: "Ob Sie einstellen, sich als Ingenieur bewerben oder einfach eine Frage haben — wählen Sie unten den passenden Weg, er führt Sie direkt zum richtigen Prozess.",
    card1Title: "Schreiben Sie uns",
    card1Body: "Allgemeine Fragen, Partnerschaften, Presse, Abrechnung oder Kontoprobleme — eine Adresse deckt alles ab. Schreiben Sie in einer unserer 9 Sprachen, welche Sie bevorzugen.",
    card1Cta: "hello@talengineer.us",
    card2Title: "Sie stellen ein? Projekt ausschreiben",
    card2Body: "Der schnellste Weg zu einer Antwort auf Ihr Projekt ist, es auszuschreiben: Beschreiben Sie den Bedarf in natürlicher Sprache, die KI strukturiert ihn zu einem Leistungsumfang mit Meilensteinen, und passende zertifizierte Ingenieure melden sich bei Ihnen. Das Ausschreiben ist kostenlos — Sie finanzieren die Treuhand erst, nachdem Sie einen Ingenieur ausgewählt haben.",
    card2Cta: "Projekt ausschreiben — kostenlos →",
    card3Title: "Sie sind Ingenieur? Bewerben Sie sich",
    card3Body: "Bewerbung und Eintrag sind kostenlos. Sie durchlaufen ein praxisnahes technisches KI-Screening in Ihrer Fachrichtung und können anschließend die Zertifizierungsprüfungen der Plattform ablegen — die Zertifizierung ist es, die Sie für Projekte einsetzbar macht.",
    card3Cta: "Als Ingenieur bewerben →",
    expectTitle: "Was Sie erwartet",
    expectBody: "Wir sind eine Plattform in der Gründungsphase, und jede Nachricht an hello@talengineer.us wird von einem Menschen gelesen. Wir antworten so schnell wie möglich — aber wir sagen das lieber ehrlich, als eine Antwortzeit-Garantie zu versprechen, die wir noch nicht einhalten können. Wenn Sie bereits an einem laufenden Projekt beteiligt sind, ist der schnellste Kanal Ihr Projekt-Chat (live übersetzt) und, falls etwas schiefgelaufen ist, der Streitfall-Ablauf des Arbeitsauftrags.",
  },

  ja: {
    kicker: "お問い合わせ",
    title: "Talengineerに相談する",
    sub: "採用中でも、エンジニアとして応募中でも、単に質問があるだけでも——下から自分に合った入り口を選んでください。それが正しいプロセスに直接つながります。",
    card1Title: "メールでお問い合わせ",
    card1Body: "一般的な質問、パートナーシップ、プレス、請求、アカウントの問題——すべて一つのアドレスでカバーします。当社が対応する9言語のうち、お好きな言語でご記入ください。",
    card1Cta: "hello@talengineer.us",
    card2Title: "採用予定ですか？プロジェクトを投稿",
    card2Body: "プロジェクトについて最も早く回答を得る方法は、それを投稿することです。自然言語でニーズを記述すると、AIがマイルストーン付きの作業範囲に構造化し、マッチした認定エンジニアから連絡が来ます。投稿は無料です——エンジニアを選んだ後にのみエスクローに入金します。",
    card2Cta: "プロジェクトを投稿 — 無料 →",
    card3Title: "エンジニアですか？参加を申し込む",
    card3Body: "応募と掲載はどちらも無料です。専門分野で実践的なAI技術スクリーニングを受けた後、プラットフォームの認定試験を受験できます——プロジェクトにアサインされるために必要なのが、この認定です。",
    card3Cta: "エンジニアとして応募 →",
    expectTitle: "何を期待できるか",
    expectBody: "私たちは創業段階のプラットフォームであり、hello@talengineer.us宛のすべてのメッセージは人間が読みます。できる限り早くお返事しますが、まだ守れない返信時間の保証を約束するよりも、それを正直にお伝えすることを選びます。すでに進行中のプロジェクトがある場合、最も早いチャネルはプロジェクトチャット（ライブ翻訳付き）であり、何か問題が起きた場合は作業指示書の紛争処理フローです。",
  },

  ko: {
    kicker: "문의하기",
    title: "Talengineer에 문의하세요",
    sub: "채용 중이든, 엔지니어로 지원 중이든, 아니면 그저 질문이 있든 — 아래에서 상황에 맞는 경로를 선택하세요. 곧바로 올바른 절차로 연결됩니다.",
    card1Title: "이메일 보내기",
    card1Body: "일반 문의, 파트너십, 언론, 청구 또는 계정 관련 문제 — 하나의 주소로 모두 처리됩니다. 저희가 지원하는 9개 언어 중 편한 언어로 작성해 주세요.",
    card1Cta: "hello@talengineer.us",
    card2Title: "채용 예정이신가요? 프로젝트를 등록하세요",
    card2Body: "프로젝트에 대한 답변을 가장 빨리 받는 방법은 직접 등록하는 것입니다. 자연어로 필요를 설명하면 AI가 이를 마일스톤이 포함된 작업 범위로 구조화하고, 매칭된 인증 엔지니어가 연락을 드립니다. 등록은 무료이며, 엔지니어를 선택한 후에만 에스크로에 입금합니다.",
    card2Cta: "프로젝트 등록 — 무료 →",
    card3Title: "엔지니어이신가요? 합류를 지원하세요",
    card3Body: "지원과 등재 모두 무료입니다. 전문 분야에서 실무형 AI 기술 스크리닝을 거친 뒤 플랫폼의 인증 시험에 응시할 수 있습니다 — 프로젝트에 배정될 수 있게 해주는 것이 바로 이 인증입니다.",
    card3Cta: "엔지니어로 지원하기 →",
    expectTitle: "무엇을 기대할 수 있나요",
    expectBody: "저희는 창립 단계의 플랫폼이며, hello@talengineer.us로 오는 모든 메시지는 사람이 직접 읽습니다. 최대한 빨리 답변드리지만, 아직 지킬 수 없는 응답 시간 보장을 약속하기보다는 이를 솔직하게 말씀드리고자 합니다. 이미 진행 중인 프로젝트가 있다면 가장 빠른 채널은 프로젝트 채팅(실시간 번역 지원)이며, 문제가 발생했다면 작업 지시서의 분쟁 처리 절차를 이용하세요.",
  },

};

module.exports = { DICT };
