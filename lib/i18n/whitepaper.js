// ── /whitepaper 页外壳文案字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
//
// 来源：pages/whitepaper.jsx 内联 UI 字典（en/zh 逐字节原样搬移，2026-07-24）。
// 页面外壳文案（en/zh）。白皮书正文本身来自 content/whitepaper/{en,zh}.md，
// 这里只放门控卡、目录、草稿横幅等 UI 文案。
//
// ⚠️ 诚实软门（critic 裁定的红线）：全文本来就在静态 HTML 源码里，
// 邮箱门只是 lead capture、不是访问控制——文案绝不暗示更强的保护，
// 也绝不谎称"已发邮件"（本站目前不发任何 newsletter 邮件）。
const DICT = {
  en: {
    kicker: 'Whitepaper',
    draftBanner: 'Draft — AI-drafted, pending final review. Not for external distribution.',
    tocTitle: 'What is inside',
    gateTitle: 'Read the full whitepaper',
    gateBody:
      'Enter your email to unlock the full text right here on this page, and to hear from us when we publish new guides. No spam, unsubscribe anytime.',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'Unlock full text',
    gateBtnSending: 'Unlocking…',
    gateOk: 'Thanks — the full text is unlocked below.',
    gateAlready: 'Welcome back — the full text is unlocked below.',
    gateErr: 'Something went wrong. Please check the email and try again.',
    gateInvalid: 'Please enter a valid email address.',
    ctaTitle: 'Ready to solve your overseas staffing?',
    ctaBody: 'Post a project and match with pre-screened, certified engineers under milestone escrow.',
    ctaBtn: 'Browse Engineers →',
  },
  zh: {
    kicker: '白皮书',
    draftBanner: '草稿 — AI 起草，待终审。请勿对外分发。',
    tocTitle: '本文目录',
    gateTitle: '阅读白皮书全文',
    gateBody:
      '输入邮箱即可在本页解锁全文，并在我们发布新指南时收到消息。不发垃圾邮件，随时可退订。',
    gatePlaceholder: 'you@company.com',
    gateBtn: '解锁全文',
    gateBtnSending: '解锁中…',
    gateOk: '谢谢——全文已在下方解锁。',
    gateAlready: '欢迎回来——全文已在下方解锁。',
    gateErr: '出了点问题，请检查邮箱后重试。',
    gateInvalid: '请输入有效的邮箱地址。',
    ctaTitle: '准备好解决海外用人问题了吗？',
    ctaBody: '发布项目，在里程碑托管下与经过预审、持证的工程师匹配。',
    ctaBtn: '浏览工程师 →',
  },

  es: {
    kicker: 'Libro blanco',
    draftBanner: 'Borrador — redactado por IA, pendiente de revisión final. No distribuir externamente.',
    tocTitle: 'Contenido',
    gateTitle: 'Lea el libro blanco completo',
    gateBody:
      'Ingrese su correo electrónico para desbloquear el texto completo aquí mismo en esta página, y para recibir noticias nuestras cuando publiquemos nuevas guías. Sin spam, puede darse de baja cuando quiera.',
    gatePlaceholder: 'usted@empresa.com',
    gateBtn: 'Desbloquear texto completo',
    gateBtnSending: 'Desbloqueando…',
    gateOk: 'Gracias — el texto completo está desbloqueado más abajo.',
    gateAlready: 'Bienvenido de nuevo — el texto completo está desbloqueado más abajo.',
    gateErr: 'Algo salió mal. Verifique el correo electrónico e inténtelo de nuevo.',
    gateInvalid: 'Ingrese una dirección de correo electrónico válida.',
    ctaTitle: '¿Listo para resolver su contratación en el extranjero?',
    ctaBody: 'Publique un proyecto y sea emparejado con ingenieros certificados y preseleccionados bajo depósito en garantía por hitos.',
    ctaBtn: 'Explorar ingenieros →',
  },

  vi: {
    kicker: 'Sách trắng',
    draftBanner: 'Bản nháp — do AI soạn thảo, đang chờ rà soát cuối cùng. Không dùng để phân phối ra bên ngoài.',
    tocTitle: 'Nội dung bên trong',
    gateTitle: 'Đọc toàn văn sách trắng',
    gateBody:
      'Nhập email của bạn để mở khóa toàn văn ngay tại trang này, và để nhận tin từ chúng tôi khi có hướng dẫn mới. Không spam, có thể hủy đăng ký bất cứ lúc nào.',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'Mở khóa toàn văn',
    gateBtnSending: 'Đang mở khóa…',
    gateOk: 'Cảm ơn bạn — toàn văn đã được mở khóa bên dưới.',
    gateAlready: 'Chào mừng trở lại — toàn văn đã được mở khóa bên dưới.',
    gateErr: 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại email và thử lại.',
    gateInvalid: 'Vui lòng nhập một địa chỉ email hợp lệ.',
    ctaTitle: 'Sẵn sàng giải quyết bài toán nhân sự ở nước ngoài của bạn?',
    ctaBody: 'Đăng một dự án và được ghép nối với các kỹ sư có chứng chỉ, đã qua sàng lọc, theo hình thức ký quỹ theo cột mốc.',
    ctaBtn: 'Xem danh sách kỹ sư →',
  },

  hi: {
    kicker: 'व्हाइटपेपर',
    draftBanner: 'ड्राफ़्ट — AI द्वारा तैयार, अंतिम समीक्षा लंबित। बाहरी वितरण के लिए नहीं।',
    tocTitle: 'इसमें क्या है',
    gateTitle: 'पूरा व्हाइटपेपर पढ़ें',
    gateBody:
      'इसी पेज पर पूरा टेक्स्ट अनलॉक करने के लिए अपना ईमेल दर्ज करें, और जब हम नई गाइड प्रकाशित करें तो हमसे अपडेट पाएँ। कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें।',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'पूरा टेक्स्ट अनलॉक करें',
    gateBtnSending: 'अनलॉक हो रहा है…',
    gateOk: 'धन्यवाद — पूरा टेक्स्ट नीचे अनलॉक हो गया है।',
    gateAlready: 'वापसी पर स्वागत है — पूरा टेक्स्ट नीचे अनलॉक हो गया है।',
    gateErr: 'कुछ गड़बड़ हो गई। कृपया ईमेल जाँचें और फिर से कोशिश करें।',
    gateInvalid: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
    ctaTitle: 'क्या आप अपनी विदेशी स्टाफ़िंग समस्या हल करने के लिए तैयार हैं?',
    ctaBody: 'एक प्रोजेक्ट पोस्ट करें और माइलस्टोन एस्क्रो के तहत पहले से जाँचे गए, प्रमाणित इंजीनियरों से मैच करें।',
    ctaBtn: 'इंजीनियर ब्राउज़ करें →',
  },

  fr: {
    kicker: 'Livre blanc',
    draftBanner: 'Brouillon — rédigé par IA, en attente de relecture finale. Ne pas diffuser en externe.',
    tocTitle: 'Contenu',
    gateTitle: 'Lire le livre blanc complet',
    gateBody:
      'Saisissez votre e-mail pour débloquer le texte intégral directement sur cette page, et pour être informé lors de la publication de nouveaux guides. Pas de spam, désabonnement à tout moment.',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'Débloquer le texte complet',
    gateBtnSending: 'Déblocage…',
    gateOk: 'Merci — le texte complet est débloqué ci-dessous.',
    gateAlready: 'Bon retour — le texte complet est débloqué ci-dessous.',
    gateErr: 'Une erreur est survenue. Vérifiez l’e-mail et réessayez.',
    gateInvalid: 'Veuillez saisir une adresse e-mail valide.',
    ctaTitle: 'Prêt à résoudre votre problème de personnel à l’étranger ?',
    ctaBody: 'Publiez un projet et soyez mis en relation avec des ingénieurs certifiés et présélectionnés, sous séquestre par jalons.',
    ctaBtn: 'Parcourir les ingénieurs →',
  },

  de: {
    kicker: 'Whitepaper',
    draftBanner: 'Entwurf — von KI erstellt, ausstehende Endprüfung. Nicht für die externe Weitergabe.',
    tocTitle: 'Inhalt',
    gateTitle: 'Das vollständige Whitepaper lesen',
    gateBody:
      'Geben Sie Ihre E-Mail-Adresse ein, um den vollständigen Text direkt auf dieser Seite freizuschalten, und um von uns zu hören, wenn wir neue Guides veröffentlichen. Kein Spam, jederzeit abbestellbar.',
    gatePlaceholder: 'you@company.com',
    gateBtn: 'Vollständigen Text freischalten',
    gateBtnSending: 'Wird freigeschaltet…',
    gateOk: 'Danke — der vollständige Text ist unten freigeschaltet.',
    gateAlready: 'Willkommen zurück — der vollständige Text ist unten freigeschaltet.',
    gateErr: 'Etwas ist schiefgelaufen. Bitte prüfen Sie die E-Mail-Adresse und versuchen Sie es erneut.',
    gateInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    ctaTitle: 'Bereit, Ihre Personalfrage im Ausland zu lösen?',
    ctaBody: 'Schreiben Sie ein Projekt aus und werden Sie mit vorgeprüften, zertifizierten Ingenieuren unter Meilenstein-Treuhand zusammengebracht.',
    ctaBtn: 'Ingenieure durchsuchen →',
  },

  ja: {
    kicker: 'ホワイトペーパー',
    draftBanner: '草稿 — AIが作成、最終レビュー待ちです。社外への配布はご遠慮ください。',
    tocTitle: '目次',
    gateTitle: 'ホワイトペーパー全文を読む',
    gateBody:
      'メールアドレスをご入力いただくと、このページ上で全文をすぐに閲覧いただけます。新しいガイドを公開した際にもお知らせします。迷惑メールは送信せず、いつでも配信停止できます。',
    gatePlaceholder: 'you@company.com',
    gateBtn: '全文を閲覧する',
    gateBtnSending: '解除中…',
    gateOk: 'ありがとうございます——全文は下に表示されています。',
    gateAlready: 'おかえりなさい——全文は下に表示されています。',
    gateErr: 'エラーが発生しました。メールアドレスをご確認のうえ、もう一度お試しください。',
    gateInvalid: '有効なメールアドレスを入力してください。',
    ctaTitle: '海外人材の課題を解決する準備はできましたか。',
    ctaBody: 'プロジェクトを掲載し、マイルストーン・エスクローのもとで事前審査済みの認定エンジニアとマッチングしましょう。',
    ctaBtn: 'エンジニアを見る →',
  },

  ko: {
    kicker: '백서',
    draftBanner: '초안 — AI가 작성했으며 최종 검토 대기 중입니다. 외부 배포용이 아닙니다.',
    tocTitle: '수록 내용',
    gateTitle: '백서 전문 읽기',
    gateBody:
      '이메일을 입력하시면 이 페이지에서 바로 전문을 볼 수 있으며, 새 가이드를 발행할 때 소식도 받아보실 수 있습니다. 스팸 없이 언제든 구독을 취소할 수 있습니다.',
    gatePlaceholder: 'you@company.com',
    gateBtn: '전문 보기',
    gateBtnSending: '여는 중…',
    gateOk: '감사합니다 — 전문이 아래에서 열렸습니다.',
    gateAlready: '다시 오신 것을 환영합니다 — 전문이 아래에서 열렸습니다.',
    gateErr: '문제가 발생했습니다. 이메일을 확인한 뒤 다시 시도해 주세요.',
    gateInvalid: '유효한 이메일 주소를 입력해 주세요.',
    ctaTitle: '해외 인력 문제를 해결할 준비가 되셨나요?',
    ctaBody: '프로젝트를 등록하고, 마일스톤 에스크로 방식으로 사전 검증된 인증 엔지니어와 매칭받아 보세요.',
    ctaBtn: '엔지니어 둘러보기 →',
  },
};

module.exports = { DICT };
