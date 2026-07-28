import { useState } from 'react';
import styles from './ChatBot.module.css';

// 消息里内联按钮式链接的统一样式（沿用旧版 financeReply/talentReply 的视觉）。
const LINK_BTN = 'display:inline-block;margin-top:8px;padding:6px 12px;background:var(--primary);color:#fff;border-radius:6px;';

const DICT = {
  en: {
    greeting: "Hi! I'm Maisui, your AI assistant. Tell me what you need in plain language — e.g. \"Find a Siemens engineer in Monterrey, budget $1500\".",
    loading:  '🌾 Processing your request…',
    netErr:    '<span style="color:#ef4444;">Network error. Please try again.</span>',
    placeholder: 'Type your request…',
    send: 'Send',
    header: 'Maisui AI',
    draftTitle: 'Demand Draft',
    dRole: 'Role', dRegion: 'Region', dBudget: 'Budget', dMilestones: 'Milestones',
    confirmPublish: 'Confirm & Publish', publishing: 'Publishing…', publishedBtn: 'Published ✓',
    published: (id) => `<b>✅ Published!</b><br/>Your demand is now live and visible to engineers.<br/><a href="/demand/${id}" style="${LINK_BTN}">View project</a>`,
    loginNeeded: `Please sign in as an employer to publish this draft.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">Sign In</a>`,
    publishFail: '<span style="color:#ef4444;">Publish failed. Please try again.</span>',
    confirmTitle: 'Confirm before I do this',
    confirmTool: { apply_to_demand: 'Apply to this project', publish_demand_draft: 'Publish this draft', assign_engineer: 'Assign this engineer', send_project_message: 'Send this message' },
    confirmNote: { assign_engineer: 'This starts the project and rejects every other pending applicant.', publish_demand_draft: 'Once published, every engineer on the platform can see it and apply.' },
    confirmArg: { engineer_id: 'Engineer ID', demand_id: 'Project ID', message: 'Your note', quoted_rate: 'Your rate', quoted_days: 'Estimated days', quote_amount: 'Total quote', content: 'Message' },
    confirmBtn: 'Confirm', confirming: 'Working…', confirmedBtn: 'Done ✓',
    confirmDone: '<b>✅ Done.</b>',
    confirmFail: '<span style="color:#ef4444;">Could not complete that. Please try again.</span>',
  },
  zh: {
    greeting: '长官，我是小麦穗！后台四大Agent已部署完毕，您可以直接用大白话发号施令（比如："帮我在蒙特雷招一个懂西门子的，预算1500美金"）。',
    loading:  '🌾 收到长官指令，正在调用后台 Agent…',
    netErr:    '<span style="color:#ef4444;">网络连接中断，请稍后再试。</span>',
    placeholder: '发号施令…',
    send: '发送',
    header: '小麦穗 AI',
    draftTitle: '需求草稿',
    dRole: '角色', dRegion: '区域', dBudget: '预算', dMilestones: '里程碑',
    confirmPublish: '确认发布', publishing: '发布中…', publishedBtn: '已发布 ✓',
    published: (id) => `<b>✅ 发布成功！</b><br/>需求已上线，工程师现在可以看到了。<br/><a href="/demand/${id}" style="${LINK_BTN}">查看项目</a>`,
    loginNeeded: `请先以雇主身份登录后再发布草稿。<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">去登录</a>`,
    publishFail: '<span style="color:#ef4444;">发布失败，请稍后再试。</span>',
    confirmTitle: '执行前请确认',
    confirmTool: { apply_to_demand: '投递这个项目', publish_demand_draft: '发布这份草稿', assign_engineer: '指派这位工程师', send_project_message: '发送这条消息' },
    confirmNote: { assign_engineer: '项目将开始执行，其余待处理的申请会被一并拒绝。', publish_demand_draft: '发布后全站工程师都能看到并投递。' },
    confirmArg: { engineer_id: '工程师编号', demand_id: '项目编号', message: '附言', quoted_rate: '报价费率', quoted_days: '预计工期（天）', quote_amount: '报价总额', content: '消息内容' },
    confirmBtn: '确认执行', confirming: '处理中…', confirmedBtn: '已完成 ✓',
    confirmDone: '<b>✅ 已完成。</b>',
    confirmFail: '<span style="color:#ef4444;">操作未能完成，请重试。</span>',
  },
  es: {
    greeting: '¡Hola! Soy Maisui, tu asistente IA. Dime lo que necesitas — ej. "Busca un ingeniero Siemens en Monterrey, presupuesto $1500".',
    loading:  '🌾 Procesando tu solicitud…',
    netErr:    '<span style="color:#ef4444;">Error de red. Intenta de nuevo.</span>',
    placeholder: 'Escribe tu solicitud…',
    send: 'Enviar',
    header: 'Maisui AI',
    draftTitle: 'Borrador de demanda',
    dRole: 'Rol', dRegion: 'Región', dBudget: 'Presupuesto', dMilestones: 'Hitos',
    confirmPublish: 'Confirmar y publicar', publishing: 'Publicando…', publishedBtn: 'Publicado ✓',
    published: (id) => `<b>✅ ¡Publicado!</b><br/>Tu demanda ya está activa y visible para los ingenieros.<br/><a href="/demand/${id}" style="${LINK_BTN}">Ver proyecto</a>`,
    loginNeeded: `Inicia sesión como empleador para publicar este borrador.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">Iniciar sesión</a>`,
    publishFail: '<span style="color:#ef4444;">Error al publicar. Intenta de nuevo.</span>',
    confirmTitle: 'Confirme antes de que lo haga',
    confirmTool: { apply_to_demand: 'Postularse a este proyecto', publish_demand_draft: 'Publicar este borrador', assign_engineer: 'Asignar a este ingeniero', send_project_message: 'Enviar este mensaje' },
    confirmNote: { assign_engineer: 'El proyecto inicia y se rechazan todas las demás postulaciones pendientes.', publish_demand_draft: 'Una vez publicado, todos los ingenieros podrán verlo y postularse.' },
    confirmArg: { engineer_id: 'ID del ingeniero', demand_id: 'ID del proyecto', message: 'Su nota', quoted_rate: 'Su tarifa', quoted_days: 'Días estimados', quote_amount: 'Monto cotizado', content: 'Mensaje' },
    confirmBtn: 'Confirmar', confirming: 'Procesando…', confirmedBtn: 'Listo ✓',
    confirmDone: '<b>✅ Listo.</b>',
    confirmFail: '<span style="color:#ef4444;">No se pudo completar. Intente de nuevo.</span>',
  },
  vi: {
    greeting: 'Xin chào! Tôi là Maisui, trợ lý AI của bạn. Hãy nói cho tôi biết bạn cần gì — ví dụ: "Tìm kỹ sư Siemens ở TP.HCM, ngân sách $1500".',
    loading:  '🌾 Đang xử lý yêu cầu của bạn…',
    netErr:    '<span style="color:#ef4444;">Lỗi mạng. Vui lòng thử lại.</span>',
    placeholder: 'Nhập yêu cầu của bạn…',
    send: 'Gửi',
    header: 'Maisui AI',
    draftTitle: 'Bản nháp yêu cầu',
    dRole: 'Vai trò', dRegion: 'Khu vực', dBudget: 'Ngân sách', dMilestones: 'Cột mốc',
    confirmPublish: 'Xác nhận & Đăng', publishing: 'Đang đăng…', publishedBtn: 'Đã đăng ✓',
    published: (id) => `<b>✅ Đã đăng!</b><br/>Yêu cầu của bạn đã hoạt động và hiển thị với kỹ sư.<br/><a href="/demand/${id}" style="${LINK_BTN}">Xem dự án</a>`,
    loginNeeded: `Vui lòng đăng nhập với tư cách nhà tuyển dụng để đăng bản nháp này.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">Đăng nhập</a>`,
    publishFail: '<span style="color:#ef4444;">Đăng thất bại. Vui lòng thử lại.</span>',
    confirmTitle: 'Xác nhận trước khi tôi thực hiện',
    confirmTool: { apply_to_demand: 'Ứng tuyển dự án này', publish_demand_draft: 'Đăng bản nháp này', assign_engineer: 'Chỉ định kỹ sư này', send_project_message: 'Gửi tin nhắn này' },
    confirmNote: { assign_engineer: 'Dự án sẽ bắt đầu và mọi hồ sơ ứng tuyển đang chờ khác sẽ bị từ chối.', publish_demand_draft: 'Sau khi đăng, mọi kỹ sư trên nền tảng đều thấy và có thể ứng tuyển.' },
    confirmArg: { engineer_id: 'Mã kỹ sư', demand_id: 'Mã dự án', message: 'Lời nhắn của bạn', quoted_rate: 'Đơn giá của bạn', quoted_days: 'Số ngày dự kiến', quote_amount: 'Tổng báo giá', content: 'Nội dung tin nhắn' },
    confirmBtn: 'Xác nhận', confirming: 'Đang xử lý…', confirmedBtn: 'Hoàn tất ✓',
    confirmDone: '<b>✅ Hoàn tất.</b>',
    confirmFail: '<span style="color:#ef4444;">Không thể hoàn tất. Vui lòng thử lại.</span>',
  },
  hi: {
    greeting: 'नमस्ते! मैं Maisui हूँ, आपका AI सहायक। मुझे बताएं आपको क्या चाहिए — जैसे: "मुंबई में Siemens इंजीनियर खोजें, बजट $1500"।',
    loading:  '🌾 आपका अनुरोध संसाधित हो रहा है…',
    netErr:    '<span style="color:#ef4444;">नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।</span>',
    placeholder: 'अपना अनुरोध लिखें…',
    send: 'भेजें',
    header: 'Maisui AI',
    draftTitle: 'डिमांड ड्राफ्ट',
    dRole: 'भूमिका', dRegion: 'क्षेत्र', dBudget: 'बजट', dMilestones: 'माइलस्टोन',
    confirmPublish: 'पुष्टि करें और प्रकाशित करें', publishing: 'प्रकाशित हो रहा है…', publishedBtn: 'प्रकाशित ✓',
    published: (id) => `<b>✅ प्रकाशित!</b><br/>आपकी डिमांड अब लाइव है और इंजीनियरों को दिख रही है।<br/><a href="/demand/${id}" style="${LINK_BTN}">प्रोजेक्ट देखें</a>`,
    loginNeeded: `इस ड्राफ्ट को प्रकाशित करने के लिए कृपया नियोक्ता के रूप में साइन इन करें।<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">साइन इन</a>`,
    publishFail: '<span style="color:#ef4444;">प्रकाशन विफल। कृपया पुनः प्रयास करें।</span>',
    confirmTitle: 'करने से पहले पुष्टि करें',
    confirmTool: { apply_to_demand: 'इस प्रोजेक्ट के लिए अप्लाई करें', publish_demand_draft: 'यह ड्राफ्ट प्रकाशित करें', assign_engineer: 'इस इंजीनियर को असाइन करें', send_project_message: 'यह संदेश भेजें' },
    confirmNote: { assign_engineer: 'प्रोजेक्ट शुरू हो जाएगा और बाकी सभी पेंडिंग एप्लिकेशन रिजेक्ट हो जाएंगी।', publish_demand_draft: 'प्रकाशित होने के बाद प्लेटफ़ॉर्म के सभी इंजीनियर इसे देख और अप्लाई कर सकेंगे।' },
    confirmArg: { engineer_id: 'इंजीनियर ID', demand_id: 'प्रोजेक्ट ID', message: 'आपका संदेश', quoted_rate: 'आपकी दर', quoted_days: 'अनुमानित दिन', quote_amount: 'कुल कोट', content: 'संदेश' },
    confirmBtn: 'पुष्टि करें', confirming: 'प्रोसेस हो रहा है…', confirmedBtn: 'हो गया ✓',
    confirmDone: '<b>✅ हो गया।</b>',
    confirmFail: '<span style="color:#ef4444;">पूरा नहीं हो सका। कृपया फिर कोशिश करें।</span>',
  },
  fr: {
    greeting: 'Bonjour ! Je suis Maisui, votre assistant IA. Dites-moi ce dont vous avez besoin — ex. "Trouvez un ingénieur Siemens à Lyon, budget 1500$".',
    loading:  '🌾 Traitement de votre demande…',
    netErr:    '<span style="color:#ef4444;">Erreur réseau. Veuillez réessayer.</span>',
    placeholder: 'Tapez votre demande…',
    send: 'Envoyer',
    header: 'Maisui AI',
    draftTitle: 'Brouillon de demande',
    dRole: 'Rôle', dRegion: 'Région', dBudget: 'Budget', dMilestones: 'Jalons',
    confirmPublish: 'Confirmer et publier', publishing: 'Publication…', publishedBtn: 'Publié ✓',
    published: (id) => `<b>✅ Publié !</b><br/>Votre demande est en ligne et visible par les ingénieurs.<br/><a href="/demand/${id}" style="${LINK_BTN}">Voir le projet</a>`,
    loginNeeded: `Connectez-vous en tant qu'employeur pour publier ce brouillon.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">Connexion</a>`,
    publishFail: '<span style="color:#ef4444;">Échec de la publication. Veuillez réessayer.</span>',
    confirmTitle: 'Confirmez avant que je le fasse',
    confirmTool: { apply_to_demand: 'Postuler à ce projet', publish_demand_draft: 'Publier ce brouillon', assign_engineer: 'Affecter cet ingénieur', send_project_message: 'Envoyer ce message' },
    confirmNote: { assign_engineer: 'Le projet démarre et toutes les autres candidatures en attente sont rejetées.', publish_demand_draft: 'Une fois publié, tous les ingénieurs de la plateforme peuvent le voir et postuler.' },
    confirmArg: { engineer_id: 'ID de l’ingénieur', demand_id: 'ID du projet', message: 'Votre message', quoted_rate: 'Votre taux', quoted_days: 'Jours estimés', quote_amount: 'Montant total', content: 'Message' },
    confirmBtn: 'Confirmer', confirming: 'Traitement…', confirmedBtn: 'Terminé ✓',
    confirmDone: '<b>✅ Terminé.</b>',
    confirmFail: '<span style="color:#ef4444;">Impossible de terminer. Veuillez réessayer.</span>',
  },
  de: {
    greeting: 'Hallo! Ich bin Maisui, Ihr KI-Assistent. Sagen Sie mir, was Sie brauchen — z.B. "Finde einen Siemens-Ingenieur in Hamburg, Budget 1500$".',
    loading:  '🌾 Ihre Anfrage wird verarbeitet…',
    netErr:    '<span style="color:#ef4444;">Netzwerkfehler. Bitte erneut versuchen.</span>',
    placeholder: 'Ihre Anfrage eingeben…',
    send: 'Senden',
    header: 'Maisui KI',
    draftTitle: 'Bedarfs-Entwurf',
    dRole: 'Rolle', dRegion: 'Region', dBudget: 'Budget', dMilestones: 'Meilensteine',
    confirmPublish: 'Bestätigen & Veröffentlichen', publishing: 'Wird veröffentlicht…', publishedBtn: 'Veröffentlicht ✓',
    published: (id) => `<b>✅ Veröffentlicht!</b><br/>Ihr Bedarf ist jetzt live und für Ingenieure sichtbar.<br/><a href="/demand/${id}" style="${LINK_BTN}">Projekt ansehen</a>`,
    loginNeeded: `Bitte melden Sie sich als Arbeitgeber an, um diesen Entwurf zu veröffentlichen.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">Anmelden</a>`,
    publishFail: '<span style="color:#ef4444;">Veröffentlichung fehlgeschlagen. Bitte erneut versuchen.</span>',
    confirmTitle: 'Bitte bestätigen Sie, bevor ich das ausführe',
    confirmTool: { apply_to_demand: 'Auf dieses Projekt bewerben', publish_demand_draft: 'Diesen Entwurf veröffentlichen', assign_engineer: 'Diesen Ingenieur beauftragen', send_project_message: 'Diese Nachricht senden' },
    confirmNote: { assign_engineer: 'Das Projekt startet und alle übrigen offenen Bewerbungen werden abgelehnt.', publish_demand_draft: 'Nach der Veröffentlichung können alle Ingenieure es sehen und sich bewerben.' },
    confirmArg: { engineer_id: 'Ingenieur-ID', demand_id: 'Projekt-ID', message: 'Ihre Nachricht', quoted_rate: 'Ihr Satz', quoted_days: 'Geschätzte Tage', quote_amount: 'Gesamtangebot', content: 'Nachricht' },
    confirmBtn: 'Bestätigen', confirming: 'Wird verarbeitet…', confirmedBtn: 'Erledigt ✓',
    confirmDone: '<b>✅ Erledigt.</b>',
    confirmFail: '<span style="color:#ef4444;">Konnte nicht abgeschlossen werden. Bitte erneut versuchen.</span>',
  },
  ja: {
    greeting: 'こんにちは！AIアシスタントのMaisuiです。お気軽にご要望をどうぞ — 例：「大阪でSiemensエンジニアを探して、予算$1500」。',
    loading:  '🌾 リクエストを処理中です…',
    netErr:    '<span style="color:#ef4444;">ネットワークエラー。もう一度お試しください。</span>',
    placeholder: 'リクエストを入力…',
    send: '送信',
    header: 'Maisui AI',
    draftTitle: '案件ドラフト',
    dRole: '役割', dRegion: '地域', dBudget: '予算', dMilestones: 'マイルストーン',
    confirmPublish: '確認して公開', publishing: '公開中…', publishedBtn: '公開済み ✓',
    published: (id) => `<b>✅ 公開しました！</b><br/>案件が公開され、エンジニアが閲覧できます。<br/><a href="/demand/${id}" style="${LINK_BTN}">プロジェクトを見る</a>`,
    loginNeeded: `このドラフトを公開するには、雇用主としてサインインしてください。<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">サインイン</a>`,
    publishFail: '<span style="color:#ef4444;">公開に失敗しました。もう一度お試しください。</span>',
    confirmTitle: '実行前にご確認ください',
    confirmTool: { apply_to_demand: 'この案件に応募する', publish_demand_draft: 'このドラフトを公開する', assign_engineer: 'このエンジニアをアサインする', send_project_message: 'このメッセージを送信する' },
    confirmNote: { assign_engineer: '案件が開始され、他の応募はすべて不採用になります。', publish_demand_draft: '公開すると、プラットフォーム上のすべてのエンジニアが閲覧・応募できます。' },
    confirmArg: { engineer_id: 'エンジニアID', demand_id: '案件ID', message: 'メッセージ', quoted_rate: '希望単価', quoted_days: '想定日数', quote_amount: '見積総額', content: 'メッセージ本文' },
    confirmBtn: '確認して実行', confirming: '処理中…', confirmedBtn: '完了 ✓',
    confirmDone: '<b>✅ 完了しました。</b>',
    confirmFail: '<span style="color:#ef4444;">実行できませんでした。もう一度お試しください。</span>',
  },
  ko: {
    greeting: '안녕하세요! AI 어시스턴트 Maisui입니다. 필요한 것을 말씀해 주세요 — 예: "서울에서 Siemens 엔지니어 찾아줘, 예산 $1500".',
    loading:  '🌾 요청을 처리 중입니다…',
    netErr:    '<span style="color:#ef4444;">네트워크 오류. 다시 시도해 주세요.</span>',
    placeholder: '요청을 입력하세요…',
    send: '전송',
    header: 'Maisui AI',
    draftTitle: '수요 초안',
    dRole: '역할', dRegion: '지역', dBudget: '예산', dMilestones: '마일스톤',
    confirmPublish: '확인 및 게시', publishing: '게시 중…', publishedBtn: '게시됨 ✓',
    published: (id) => `<b>✅ 게시 완료!</b><br/>수요가 게시되어 엔지니어에게 공개됩니다.<br/><a href="/demand/${id}" style="${LINK_BTN}">프로젝트 보기</a>`,
    loginNeeded: `이 초안을 게시하려면 고용주로 로그인하세요.<br/><a href="/login?next=%2Ffinance" style="${LINK_BTN}">로그인</a>`,
    publishFail: '<span style="color:#ef4444;">게시 실패. 다시 시도해 주세요.</span>',
    confirmTitle: '실행 전에 확인해 주세요',
    confirmTool: { apply_to_demand: '이 프로젝트에 지원하기', publish_demand_draft: '이 초안 게시하기', assign_engineer: '이 엔지니어 배정하기', send_project_message: '이 메시지 보내기' },
    confirmNote: { assign_engineer: '프로젝트가 시작되고 다른 대기 중인 지원은 모두 거절됩니다.', publish_demand_draft: '게시하면 플랫폼의 모든 엔지니어가 보고 지원할 수 있습니다.' },
    confirmArg: { engineer_id: '엔지니어 ID', demand_id: '프로젝트 ID', message: '메시지', quoted_rate: '희망 요율', quoted_days: '예상 일수', quote_amount: '견적 총액', content: '메시지 내용' },
    confirmBtn: '확인 후 실행', confirming: '처리 중…', confirmedBtn: '완료 ✓',
    confirmDone: '<b>✅ 완료되었습니다.</b>',
    confirmFail: '<span style="color:#ef4444;">완료하지 못했습니다. 다시 시도해 주세요.</span>',
  },
};

// JWT 的 exp 是否还没到期。**只用来在两枚令牌之间做选择，不是安全判断**——
// 这里不验签也验不了签，真正的校验在服务端 jwt.verify。解不开一律当过期（返回 false），
// 让调用方安全退回普通令牌。
function notExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch { return false; }
}

// 取本次请求要用的 token。
// 优先用 tal_admin_token（过了 TOTP 的 admin 令牌，带 adm2fa）：registry 里 admin 工具要求
// adm2fa=true（见 src/tools/registry.js 的角色门），而 tal_user 那枚普通登录令牌按设计永远
// 不带这个声明——不优先取它，admin 在聊天里就永远调不到 admin 工具。
// ⚠️ 过期检查不能删：过期令牌照发会让 jwt.verify 失败 → 后端 optionalUser 返回 null →
// 用户被静默降级成【匿名】，连他本来的普通工具都没了。退回 tal_user 才是对的。
// 未登录/隐私模式取不到时返回空串——聊天仍可用（后端降级为 public 只读工具）。
function getToken() {
  try {
    const adminToken = localStorage.getItem('tal_admin_token');
    if (adminToken && notExpired(adminToken)) return adminToken;
  } catch { /* 隐私模式等取不到 localStorage：照常退回下面的普通令牌 */ }
  try { return JSON.parse(localStorage.getItem('tal_user') || '{}').token || ''; } catch { return ''; }
}

// 转义 HTML：消息列表用 dangerouslySetInnerHTML 渲染，agent 回复与用户输入都是
// 不可信文本，进 innerHTML 前必须转义（防 XSS）；换行由调用方另行转成 <br/>。
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function ChatBot({ lang = 'en' }) {
  const d = DICT[lang] || DICT.en;

  const [open, setOpen]       = useState(false);
  const [badge, setBadge]     = useState(true);
  // messages = 渲染用消息流：{ role, html } 普通消息；{ role:'agent', draft, draftState } 草稿卡。
  const [messages, setMessages] = useState([
    { role: 'agent', html: d.greeting },
  ]);
  // history = 发给 /api/agent/chat 的多轮上下文（纯文本，不含草稿卡/问候语）。
  const [history, setHistory] = useState([]);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);

  // Reset greeting when language changes
  // (only if still showing the default greeting)
  const prevLang = useState(lang)[0];

  function toggle() {
    setOpen(v => !v);
    setBadge(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');

    const t = DICT[lang] || DICT.en;
    setMessages(prev => [...prev, { role: 'user', html: escapeHtml(text) }]);
    const loadId = Date.now();
    setMessages(prev => [...prev, { role: 'agent', html: t.loading, id: loadId }]);

    // 多轮上下文：把本条用户消息接到历史后整体发给后端（只送最近 20 条，防 payload 无限增长）。
    const nextHistory = [...history, { role: 'user', content: text }];

    try {
      // 登录了就带 Bearer（解锁 employer/engineer 工具）；未登录不带（public 只读工具，仍可聊）。
      const token = getToken();
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: nextHistory.slice(-20), lang }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || typeof result.reply !== 'string') throw new Error('agent chat failed');

      setHistory([...nextHistory, { role: 'assistant', content: result.reply }]);

      // 回复是纯文本：转义后再进 innerHTML（防 XSS），换行转 <br/> 保持排版。
      const newMsgs = [{ role: 'agent', html: escapeHtml(result.reply).replace(/\n/g, '<br/>') }];
      // draft = parse_demand / create_demand_draft 产出的可确认草稿 → 渲染草稿卡。
      if (result.draft && typeof result.draft === 'object' && result.draft.title) {
        newMsgs.push({ role: 'agent', draft: result.draft, draftState: 'idle' });
      }
      // pendingConfirmation = T2 工具的提案（agent 没有执行，也不会执行）→ 渲染确认卡。
      // 令牌原样存在消息里，点确认时连同参数一起回传，服务端重算哈希比对（见 confirmToken.js）。
      const pc = result.pendingConfirmation;
      if (pc && typeof pc === 'object' && pc.tool && pc.confirmToken) {
        newMsgs.push({ role: 'agent', confirm: pc, confirmState: 'idle' });
      }
      setMessages(prev => prev.filter(m => m.id !== loadId).concat(newMsgs));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: t.netErr }]));
    }
    setSending(false);
  }

  // 「确认执行」：T2 工具（tier='confirm'）的唯一执行入口。agent 只能提案，
  // 真正落地必须由人在这里点一下，走 POST /api/agent/confirm（requireAuth + 令牌校验）。
  async function runConfirm(index) {
    const t = DICT[lang] || DICT.en;
    const msg = messages[index];
    if (!msg?.confirm || msg.confirmState !== 'idle') return;

    const token = getToken();
    if (!token) {
      setMessages(prev => [...prev, { role: 'agent', html: t.loginNeeded }]);
      return;
    }

    setMessages(prev => prev.map((m, i) => (i === index ? { ...m, confirmState: 'working' } : m)));
    try {
      const res = await fetch('/api/agent/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          confirm_token: msg.confirm.confirmToken,
          tool: msg.confirm.tool,
          args: msg.confirm.args,   // 原样回传：服务端据此重算哈希，确保执行的就是卡片上这份
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMessages(prev => prev
          .map((m, i) => (i === index ? { ...m, confirmState: 'idle' } : m))
          .concat([{ role: 'agent', html: t.loginNeeded }]));
        return;
      }
      if (!res.ok || result.status !== 'ok') {
        // 服务端的拒绝理由（令牌过期、已投递过、项目已关闭…）直接转述，比一句"失败了"有用得多
        const why = typeof result.error === 'string' ? escapeHtml(result.error) : t.confirmFail;
        setMessages(prev => prev
          .map((m, i) => (i === index ? { ...m, confirmState: 'idle' } : m))
          .concat([{ role: 'agent', html: `<span style="color:#ef4444;">${why}</span>` }]));
        return;
      }
      setMessages(prev => prev
        .map((m, i) => (i === index ? { ...m, confirmState: 'done' } : m))
        .concat([{ role: 'agent', html: t.confirmDone }]));
    } catch {
      setMessages(prev => prev
        .map((m, i) => (i === index ? { ...m, confirmState: 'idle' } : m))
        .concat([{ role: 'agent', html: t.confirmFail }]));
    }
  }

  // 「确认发布」：G2 红线——发布只能由人类点击触发，走现有 POST /api/demand/submit
  // （requireAuth，employer_id 取自 JWT），前端绝不代替用户执行。
  async function publishDraft(index) {
    const t = DICT[lang] || DICT.en;
    const msg = messages[index];
    if (!msg?.draft || msg.draftState !== 'idle') return;

    const token = getToken();
    if (!token) {
      // 未登录发不了（/submit 要雇主 JWT）：引导去 /finance 登录（全站登录入口在那里）。
      setMessages(prev => [...prev, { role: 'agent', html: t.loginNeeded }]);
      return;
    }

    setMessages(prev => prev.map((m, i) => (i === index ? { ...m, draftState: 'publishing' } : m)));

    // 字段映射：parse_demand 草稿只保证 title/role_required/standardized_description/milestones
    // 四个键（region/budget 可能缺失，不得假设存在）；create_demand_draft 草稿则有
    // title/description/region/budget。两种形状在此归一为 /submit 的请求体。
    const dr = msg.draft;
    const body = {
      title: dr.title,
      description: dr.description || dr.standardized_description || '',
      role_required: dr.role_required,
      region: dr.region,
      budget: dr.budget != null ? String(dr.budget) : undefined,
      project_type: dr.project_type,
      location: dr.location,
      milestones: Array.isArray(dr.milestones) ? dr.milestones : undefined,
    };

    try {
      const res = await fetch('/api/demand/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        // token 过期/无效：还原按钮并引导重新登录。
        setMessages(prev => prev
          .map((m, i) => (i === index ? { ...m, draftState: 'idle' } : m))
          .concat([{ role: 'agent', html: t.loginNeeded }]));
        return;
      }
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.status !== 'ok') throw new Error('publish failed');
      setMessages(prev => prev
        .map((m, i) => (i === index ? { ...m, draftState: 'published' } : m))
        .concat([{ role: 'agent', html: t.published(Number(result.id)) }]));
    } catch {
      setMessages(prev => prev
        .map((m, i) => (i === index ? { ...m, draftState: 'idle' } : m))
        .concat([{ role: 'agent', html: t.publishFail }]));
    }
  }

  const t = DICT[lang] || DICT.en;

  return (
    <>
      <div className={styles.avatar} onClick={toggle}>
        <img src="/img/avatar.jpg" alt="AI" onError={e => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }} />
        {badge && <div className={styles.badge}>1</div>}
      </div>

      {open && (
        <div className={styles.chatbox}>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/img/avatar.jpg" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }} alt="" />
              {t.header}
            </div>
            <span className={styles.close} onClick={toggle}>×</span>
          </div>
          <div className={styles.body}>
            {messages.map((m, i) => m.confirm ? (
              // 确认卡：agent 提案、人来拍板。参数全部走 JSX 文本节点（不进 innerHTML），天然免 XSS。
              // 卡上显示的就是将要执行的那份参数——服务端会重算哈希比对，两者不可能不一致。
              <div key={i} className={styles.msgAgent} style={{ maxWidth: '95%', border: '1px solid var(--primary)', background: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ {t.confirmTitle}</div>
                <div style={{ fontWeight: 600 }}>{t.confirmTool[m.confirm.tool] || m.confirm.tool}</div>
                {/* 后果说明：有些动作的副作用从参数上完全看不出来（指派会拒掉其余申请者），
                    不显式写出来，用户点的就是一个他没被告知全部后果的确认。 */}
                {t.confirmNote[m.confirm.tool] && (
                  <div style={{ fontSize: 12, marginTop: 4, color: 'var(--primary)' }}>
                    {t.confirmNote[m.confirm.tool]}
                  </div>
                )}
                {/* 上限 2000 = 所有工具自由文本参数的 maxLength，也就是这里【永远不会截断】。
                    确认卡是 confirm 层唯一的防线：用户点确认前必须看到将要发出去的完整内容。
                    原来截到 200 字，send_project_message 的正文（≤2000 字）会被悄悄切掉一截，
                    用户确认的与实际发出的就不是同一份东西了。pre-wrap 保留换行，长正文照样可读。 */}
                {Object.entries(m.confirm.args || {}).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12, opacity: 0.85, marginTop: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {t.confirmArg[k] || k}: {String(v).slice(0, 2000)}
                  </div>
                ))}
                <button
                  onClick={() => runConfirm(i)}
                  disabled={m.confirmState !== 'idle'}
                  style={{
                    marginTop: 8, padding: '6px 12px', background: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: 6, fontWeight: 700,
                    cursor: m.confirmState === 'idle' ? 'pointer' : 'default',
                    opacity: m.confirmState === 'working' ? 0.7 : 1,
                  }}
                >
                  {m.confirmState === 'done' ? t.confirmedBtn : m.confirmState === 'working' ? t.confirming : t.confirmBtn}
                </button>
              </div>
            ) : m.draft ? (
              // 草稿卡：字段全部走 JSX 文本节点渲染（不进 innerHTML），天然免 XSS。
              <div key={i} className={styles.msgAgent} style={{ maxWidth: '95%', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 {t.draftTitle}</div>
                <div style={{ fontWeight: 600 }}>{m.draft.title}</div>
                {(m.draft.description || m.draft.standardized_description) && (
                  <div style={{ fontSize: 12, opacity: 0.85, margin: '4px 0' }}>
                    {String(m.draft.description || m.draft.standardized_description).slice(0, 200)}
                  </div>
                )}
                {m.draft.role_required && <div style={{ fontSize: 12 }}>{t.dRole}: {m.draft.role_required}</div>}
                {m.draft.region != null && <div style={{ fontSize: 12 }}>{t.dRegion}: {String(m.draft.region)}</div>}
                {m.draft.budget != null && <div style={{ fontSize: 12 }}>{t.dBudget}: {String(m.draft.budget)}</div>}
                {Array.isArray(m.draft.milestones) && m.draft.milestones.length > 0 && (
                  <div style={{ fontSize: 12 }}>{t.dMilestones}: {m.draft.milestones.map(ms => ms.phase_name).filter(Boolean).join(' → ')}</div>
                )}
                <button
                  onClick={() => publishDraft(i)}
                  disabled={m.draftState !== 'idle'}
                  style={{
                    marginTop: 8, padding: '6px 12px', background: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: 6, fontWeight: 700,
                    cursor: m.draftState === 'idle' ? 'pointer' : 'default',
                    opacity: m.draftState === 'publishing' ? 0.7 : 1,
                  }}
                >
                  {m.draftState === 'published' ? t.publishedBtn : m.draftState === 'publishing' ? t.publishing : t.confirmPublish}
                </button>
              </div>
            ) : (
              <div key={i} className={m.role === 'user' ? styles.msgUser : styles.msgAgent} dangerouslySetInnerHTML={{ __html: m.html }} />
            ))}
          </div>
          <div className={styles.inputRow}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.placeholder} onKeyPress={e => e.key === 'Enter' && send()} />
            <button onClick={send} disabled={sending}>{t.send}</button>
          </div>
        </div>
      )}
    </>
  );
}
