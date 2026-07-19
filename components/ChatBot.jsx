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
    loginNeeded: `Please sign in as an employer to publish this draft.<br/><a href="/finance" style="${LINK_BTN}">Sign In</a>`,
    publishFail: '<span style="color:#ef4444;">Publish failed. Please try again.</span>',
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
    loginNeeded: `请先以雇主身份登录后再发布草稿。<br/><a href="/finance" style="${LINK_BTN}">去登录</a>`,
    publishFail: '<span style="color:#ef4444;">发布失败，请稍后再试。</span>',
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
    loginNeeded: `Inicia sesión como empleador para publicar este borrador.<br/><a href="/finance" style="${LINK_BTN}">Iniciar sesión</a>`,
    publishFail: '<span style="color:#ef4444;">Error al publicar. Intenta de nuevo.</span>',
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
    loginNeeded: `Vui lòng đăng nhập với tư cách nhà tuyển dụng để đăng bản nháp này.<br/><a href="/finance" style="${LINK_BTN}">Đăng nhập</a>`,
    publishFail: '<span style="color:#ef4444;">Đăng thất bại. Vui lòng thử lại.</span>',
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
    loginNeeded: `इस ड्राफ्ट को प्रकाशित करने के लिए कृपया नियोक्ता के रूप में साइन इन करें।<br/><a href="/finance" style="${LINK_BTN}">साइन इन</a>`,
    publishFail: '<span style="color:#ef4444;">प्रकाशन विफल। कृपया पुनः प्रयास करें।</span>',
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
    loginNeeded: `Connectez-vous en tant qu'employeur pour publier ce brouillon.<br/><a href="/finance" style="${LINK_BTN}">Connexion</a>`,
    publishFail: '<span style="color:#ef4444;">Échec de la publication. Veuillez réessayer.</span>',
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
    loginNeeded: `Bitte melden Sie sich als Arbeitgeber an, um diesen Entwurf zu veröffentlichen.<br/><a href="/finance" style="${LINK_BTN}">Anmelden</a>`,
    publishFail: '<span style="color:#ef4444;">Veröffentlichung fehlgeschlagen. Bitte erneut versuchen.</span>',
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
    loginNeeded: `このドラフトを公開するには、雇用主としてサインインしてください。<br/><a href="/finance" style="${LINK_BTN}">サインイン</a>`,
    publishFail: '<span style="color:#ef4444;">公開に失敗しました。もう一度お試しください。</span>',
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
    loginNeeded: `이 초안을 게시하려면 고용주로 로그인하세요.<br/><a href="/finance" style="${LINK_BTN}">로그인</a>`,
    publishFail: '<span style="color:#ef4444;">게시 실패. 다시 시도해 주세요.</span>',
  },
};

// 从 localStorage 的 tal_user 取登录 token（登录态与全站 REST 请求同源，见 pages/finance.jsx）。
// 未登录/隐私模式取不到时返回空串——聊天仍可用（后端降级为 public 只读工具）。
function getToken() {
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
      setMessages(prev => prev.filter(m => m.id !== loadId).concat(newMsgs));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: t.netErr }]));
    }
    setSending(false);
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
            {messages.map((m, i) => m.draft ? (
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
