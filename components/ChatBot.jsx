import { useState } from 'react';
import styles from './ChatBot.module.css';

const DICT = {
  en: {
    greeting: "Hi! I'm Maisui, your AI assistant. Tell me what you need in plain language — e.g. \"Find a Siemens engineer in Monterrey, budget $1500\".",
    loading:  '🌾 Processing your request…',
    financeReply: (amt) => `<b>💳 AI-CFO Report:</b><br/>You have $${amt || '1,500'} in locked escrow.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Go to Finance Dashboard</a>`,
    talentReply:  '<b>🛡️ Ghost HR Report:</b><br/>3 senior PLC engineers are ready to view.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">View Engineers</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM activated:</b><br/>Requirement posted: <i>${title}</i><br/>Split into ${count} milestones. Searching for engineers in ${region}!`,
    parseFail: '<span style="color:#ef4444;">Could not parse your request. Please describe again.</span>',
    netErr:    '<span style="color:#ef4444;">Network error. Please try again.</span>',
    placeholder: 'Type your request…',
    send: 'Send',
    header: 'Maisui AI',
  },
  zh: {
    greeting: '长官，我是小麦穗！后台四大Agent已部署完毕，您可以直接用大白话发号施令（比如："帮我在蒙特雷招一个懂西门子的，预算1500美金"）。',
    loading:  '🌾 收到长官指令，正在调用后台 Agent…',
    financeReply: () => '<b>💳 AI-CFO 资金报告：</b><br/>长官，托管账户中有 $1,500 处于锁定状态。<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">进入财务大盘</a>',
    talentReply: '<b>🛡️ Ghost HR 汇报：</b><br/>3 名高级 PLC 专家正待您查看。<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">查看最新工程师</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM 已接管：</b><br/>需求已生成标书：<i>${title}</i><br/>资金切分为 ${count} 个里程碑，正在寻访 ${region} 工程师！`,
    parseFail: '<span style="color:#ef4444;">解析失败，请重新描述需求。</span>',
    netErr:    '<span style="color:#ef4444;">网络连接中断，请稍后再试。</span>',
    placeholder: '发号施令…',
    send: '发送',
    header: '小麦穗 AI',
  },
  es: {
    greeting: '¡Hola! Soy Maisui, tu asistente IA. Dime lo que necesitas — ej. "Busca un ingeniero Siemens en Monterrey, presupuesto $1500".',
    loading:  '🌾 Procesando tu solicitud…',
    financeReply: () => '<b>💳 Informe AI-CFO:</b><br/>Tienes $1,500 bloqueados en garantía.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Ir al Panel Financiero</a>',
    talentReply: '<b>🛡️ Informe Ghost HR:</b><br/>3 ingenieros PLC senior listos para revisar.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Ver Ingenieros</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM activado:</b><br/>Publicado: <i>${title}</i><br/>Dividido en ${count} hitos. ¡Buscando ingenieros en ${region}!`,
    parseFail: '<span style="color:#ef4444;">No se pudo analizar. Por favor, descríbelo de nuevo.</span>',
    netErr:    '<span style="color:#ef4444;">Error de red. Intenta de nuevo.</span>',
    placeholder: 'Escribe tu solicitud…',
    send: 'Enviar',
    header: 'Maisui AI',
  },
  vi: {
    greeting: 'Xin chào! Tôi là Maisui, trợ lý AI của bạn. Hãy nói cho tôi biết bạn cần gì — ví dụ: "Tìm kỹ sư Siemens ở TP.HCM, ngân sách $1500".',
    loading:  '🌾 Đang xử lý yêu cầu của bạn…',
    financeReply: () => '<b>💳 Báo cáo AI-CFO:</b><br/>Bạn có $1,500 đang bị khóa trong ký quỹ.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Xem Bảng Tài Chính</a>',
    talentReply: '<b>🛡️ Báo cáo Ghost HR:</b><br/>3 kỹ sư PLC cấp cao sẵn sàng để xem.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Xem Kỹ Sư</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM đã tiếp quản:</b><br/>Đã đăng: <i>${title}</i><br/>Chia thành ${count} cột mốc. Đang tìm kỹ sư tại ${region}!`,
    parseFail: '<span style="color:#ef4444;">Không thể phân tích. Vui lòng mô tả lại.</span>',
    netErr:    '<span style="color:#ef4444;">Lỗi mạng. Vui lòng thử lại.</span>',
    placeholder: 'Nhập yêu cầu của bạn…',
    send: 'Gửi',
    header: 'Maisui AI',
  },
  hi: {
    greeting: 'नमस्ते! मैं Maisui हूँ, आपका AI सहायक। मुझे बताएं आपको क्या चाहिए — जैसे: "मुंबई में Siemens इंजीनियर खोजें, बजट $1500"।',
    loading:  '🌾 आपका अनुरोध संसाधित हो रहा है…',
    financeReply: () => '<b>💳 AI-CFO रिपोर्ट:</b><br/>आपके एस्क्रो में $1,500 लॉक है।<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">वित्त डैशबोर्ड देखें</a>',
    talentReply: '<b>🛡️ Ghost HR रिपोर्ट:</b><br/>3 वरिष्ठ PLC इंजीनियर देखने के लिए तैयार हैं।<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">इंजीनियर देखें</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM सक्रिय:</b><br/>पोस्ट किया: <i>${title}</i><br/>${count} माइलस्टोन में विभाजित। ${region} में इंजीनियर खोज रहे हैं!`,
    parseFail: '<span style="color:#ef4444;">अनुरोध समझ नहीं आया। कृपया फिर से बताएं।</span>',
    netErr:    '<span style="color:#ef4444;">नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।</span>',
    placeholder: 'अपना अनुरोध लिखें…',
    send: 'भेजें',
    header: 'Maisui AI',
  },
  fr: {
    greeting: 'Bonjour ! Je suis Maisui, votre assistant IA. Dites-moi ce dont vous avez besoin — ex. "Trouvez un ingénieur Siemens à Lyon, budget 1500$".',
    loading:  '🌾 Traitement de votre demande…',
    financeReply: () => '<b>💳 Rapport AI-CFO :</b><br/>Vous avez 1 500 $ bloqués en séquestre.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Tableau de bord financier</a>',
    talentReply: '<b>🛡️ Rapport Ghost HR :</b><br/>3 ingénieurs PLC seniors prêts à consulter.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Voir les ingénieurs</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM activé :</b><br/>Publié : <i>${title}</i><br/>Divisé en ${count} jalons. Recherche d'ingénieurs à ${region} !`,
    parseFail: '<span style="color:#ef4444;">Impossible d\'analyser. Veuillez décrire à nouveau.</span>',
    netErr:    '<span style="color:#ef4444;">Erreur réseau. Veuillez réessayer.</span>',
    placeholder: 'Tapez votre demande…',
    send: 'Envoyer',
    header: 'Maisui AI',
  },
  de: {
    greeting: 'Hallo! Ich bin Maisui, Ihr KI-Assistent. Sagen Sie mir, was Sie brauchen — z.B. "Finde einen Siemens-Ingenieur in Hamburg, Budget 1500$".',
    loading:  '🌾 Ihre Anfrage wird verarbeitet…',
    financeReply: () => '<b>💳 KI-CFO Bericht:</b><br/>Sie haben 1.500 $ im Treuhandkonto gesperrt.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Zum Finanz-Dashboard</a>',
    talentReply: '<b>🛡️ Ghost HR Bericht:</b><br/>3 erfahrene SPS-Ingenieure bereit zur Ansicht.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">Ingenieure ansehen</a>',
    parseOk:  (title, count, region) => `<b>✅ KI-PM aktiviert:</b><br/>Veröffentlicht: <i>${title}</i><br/>In ${count} Meilensteine aufgeteilt. Suche nach Ingenieuren in ${region}!`,
    parseFail: '<span style="color:#ef4444;">Analyse fehlgeschlagen. Bitte erneut beschreiben.</span>',
    netErr:    '<span style="color:#ef4444;">Netzwerkfehler. Bitte erneut versuchen.</span>',
    placeholder: 'Ihre Anfrage eingeben…',
    send: 'Senden',
    header: 'Maisui KI',
  },
  ja: {
    greeting: 'こんにちは！AIアシスタントのMaisuiです。お気軽にご要望をどうぞ — 例：「大阪でSiemensエンジニアを探して、予算$1500」。',
    loading:  '🌾 リクエストを処理中です…',
    financeReply: () => '<b>💳 AI-CFOレポート：</b><br/>エスクローに $1,500 がロック中です。<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">財務ダッシュボードへ</a>',
    talentReply: '<b>🛡️ Ghost HRレポート：</b><br/>上級PLCエンジニア3名が確認待ちです。<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">エンジニアを見る</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM起動：</b><br/>投稿完了: <i>${title}</i><br/>${count}つのマイルストーンに分割。${region}のエンジニアを検索中！`,
    parseFail: '<span style="color:#ef4444;">解析に失敗しました。もう一度説明してください。</span>',
    netErr:    '<span style="color:#ef4444;">ネットワークエラー。もう一度お試しください。</span>',
    placeholder: 'リクエストを入力…',
    send: '送信',
    header: 'Maisui AI',
  },
  ko: {
    greeting: '안녕하세요! AI 어시스턴트 Maisui입니다. 필요한 것을 말씀해 주세요 — 예: "서울에서 Siemens 엔지니어 찾아줘, 예산 $1500".',
    loading:  '🌾 요청을 처리 중입니다…',
    financeReply: () => '<b>💳 AI-CFO 보고서:</b><br/>에스크로에 $1,500이 잠겨 있습니다.<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">재무 대시보드로 이동</a>',
    talentReply: '<b>🛡️ Ghost HR 보고서:</b><br/>시니어 PLC 엔지니어 3명이 확인 대기 중입니다.<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">엔지니어 보기</a>',
    parseOk:  (title, count, region) => `<b>✅ AI-PM 활성화:</b><br/>게시됨: <i>${title}</i><br/>${count}개 마일스톤으로 분할. ${region}에서 엔지니어 검색 중!`,
    parseFail: '<span style="color:#ef4444;">분석 실패. 다시 설명해 주세요.</span>',
    netErr:    '<span style="color:#ef4444;">네트워크 오류. 다시 시도해 주세요.</span>',
    placeholder: '요청을 입력하세요…',
    send: '전송',
    header: 'Maisui AI',
  },
};

// Finance keywords across all languages
const FINANCE_KW = ['钱','财务','放款','escrow','pay','money','invoice','finanza','tiền','tài chính','पैसा','argent','geld','お金','돈','자금','결제'];
// Engineer/talent keywords across all languages
const TALENT_KW  = ['工程师','人','talent','engineer','ingeniero','kỹ sư','kỹ thuật','इंजीनियर','ingénieur','ingenieur','エンジニア','엔지니어','招','寻找'];

export default function ChatBot({ lang = 'en' }) {
  const d = DICT[lang] || DICT.en;

  const [open, setOpen]       = useState(false);
  const [badge, setBadge]     = useState(true);
  const [messages, setMessages] = useState([
    { role: 'agent', html: d.greeting },
  ]);
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
    setMessages(prev => [...prev, { role: 'user', html: text }]);
    const loadId = Date.now();
    setMessages(prev => [...prev, { role: 'agent', html: t.loading, id: loadId }]);

    const lower = text.toLowerCase();

    if (FINANCE_KW.some(kw => lower.includes(kw))) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: t.financeReply() }]));
        setSending(false);
      }, 800);
      return;
    }
    if (TALENT_KW.some(kw => lower.includes(kw))) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: t.talentReply }]));
        setSending(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch('/api/demand/quick_launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text, employer_email: (() => { try { return JSON.parse(localStorage.getItem('tal_user') || '{}').email || ''; } catch { return ''; } })() }),
      });
      const result = await res.json();
      const reply = res.ok && result.parsed_summary
        ? t.parseOk(result.parsed_summary.title, result.parsed_summary.milestones.length, result.parsed_summary.region)
        : t.parseFail;
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: reply }]));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: t.netErr }]));
    }
    setSending(false);
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
            {messages.map((m, i) => (
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
