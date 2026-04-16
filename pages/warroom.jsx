import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from './warroom.module.css';
import { useLang } from '../hooks/useLang';

// socket.io-client must only run client-side (no SSR)
let io;
if (typeof window !== 'undefined') {
  io = require('socket.io-client');
}

const DICT = {
  en: {
    pageTitle:      'Babel War Room',
    headerSub:      'Babel War Room™ — Real-time AI Translation',
    enterTitle:     'Enter War Room',
    labelProjectId: 'Project ID',
    labelRole:      'I am the…',
    optEmployer:    'Supplier (Speaks Chinese)',
    optEngineer:    'Engineer (Speaks Spanish)',
    labelName:      'My Name',
    namePlaceholder:'e.g. Terry or Juan',
    btnJoin:        'Join Encrypted Channel',
    sidebarTitle:   'Active Project',
    lblProjectId:   'Project ID',
    lblCounterparty:'Counterparty',
    counterpartyEmployer: 'Local Engineer (MX)',
    counterpartyEngineer: 'Project Manager (CN)',
    waiting:        'Waiting…',
    aiPmTitle:      '🤖 AI-PM Tools (Employer Only)',
    btnNudge:       '🔔 Auto Follow-Up',
    btnReport:      '📊 Generate Daily Report',
    footerEncrypted:'🔒 End-to-End Encrypted',
    footerPowered:  '⚡ Powered by Gemini 2.5 Flash Industrial Translation Engine',
    chatTitle:      'Engineering Collaboration Channel',
    liveTag:        '● Live Translation Active',
    exitBtn:        'Exit to Dashboard',
    translating:    'Translating…',
    send:           'Send',
    uploadTitle:    'Upload Proof of Work',
    welcomeMsg:     'Welcome to the Babel War Room. All messages are translated in real-time.',
    joinedMsg:      (name, role) => `You joined the channel as ${name} (${role})`,
    placeholderEmployer: 'Type in Chinese…',
    placeholderEngineer: 'Escribe tu mensaje en español…',
    labelMe:        'Me',
    labelTrans:     'Trans',
  },
  zh: {
    pageTitle:      '巴别战情室',
    headerSub:      '巴别战情室™ — 实时 AI 翻译',
    enterTitle:     '进入战情室',
    labelProjectId: '项目编号',
    labelRole:      '我的身份…',
    optEmployer:    '甲方（中文沟通）',
    optEngineer:    '工程师（西班牙语沟通）',
    labelName:      '我的名字',
    namePlaceholder:'例：Terry 或 Juan',
    btnJoin:        '加入加密频道',
    sidebarTitle:   '当前项目',
    lblProjectId:   '项目编号',
    lblCounterparty:'对方',
    counterpartyEmployer: '本地工程师（MX）',
    counterpartyEngineer: '项目经理（CN）',
    waiting:        '等待中…',
    aiPmTitle:      '🤖 AI-PM 工具（仅甲方）',
    btnNudge:       '🔔 AI 自动催办进展',
    btnReport:      '📊 生成今日现场简报',
    footerEncrypted:'🔒 端对端加密',
    footerPowered:  '⚡ 由 Gemini 2.5 Flash 工业翻译引擎驱动',
    chatTitle:      '工程协作频道',
    liveTag:        '● 实时翻译中',
    exitBtn:        '返回控制台',
    translating:    '翻译中…',
    send:           '发送',
    uploadTitle:    '上传施工证明',
    welcomeMsg:     '欢迎进入巴别战情室。所有消息将被实时翻译。',
    joinedMsg:      (name, role) => `您已以 ${name}（${role}）身份加入频道`,
    placeholderEmployer: '请输入中文…',
    placeholderEngineer: 'Escribe tu mensaje en español…',
    labelMe:        '我',
    labelTrans:     '译文',
  },
  es: {
    pageTitle:      'Sala de Guerra Babel',
    headerSub:      'Sala de Guerra Babel™ — Traducción IA en tiempo real',
    enterTitle:     'Entrar a la Sala de Guerra',
    labelProjectId: 'ID de Proyecto',
    labelRole:      'Soy el…',
    optEmployer:    'Proveedor (Habla chino)',
    optEngineer:    'Ingeniero (Habla español)',
    labelName:      'Mi nombre',
    namePlaceholder:'ej. Terry o Juan',
    btnJoin:        'Unirse al canal cifrado',
    sidebarTitle:   'Proyecto activo',
    lblProjectId:   'ID de Proyecto',
    lblCounterparty:'Contraparte',
    counterpartyEmployer: 'Ingeniero local (MX)',
    counterpartyEngineer: 'Gerente de proyecto (CN)',
    waiting:        'Esperando…',
    aiPmTitle:      '🤖 Herramientas AI-PM (Solo empleador)',
    btnNudge:       '🔔 Seguimiento automático',
    btnReport:      '📊 Generar reporte diario',
    footerEncrypted:'🔒 Cifrado de extremo a extremo',
    footerPowered:  '⚡ Impulsado por Gemini 2.5 Flash',
    chatTitle:      'Canal de colaboración de ingeniería',
    liveTag:        '● Traducción en vivo',
    exitBtn:        'Salir al Panel',
    translating:    'Traduciendo…',
    send:           'Enviar',
    uploadTitle:    'Subir prueba de trabajo',
    welcomeMsg:     'Bienvenido a la Sala de Guerra Babel. Todos los mensajes se traducen en tiempo real.',
    joinedMsg:      (name, role) => `Te uniste al canal como ${name} (${role})`,
    placeholderEmployer: '请输入中文…',
    placeholderEngineer: 'Escribe tu mensaje en español…',
    labelMe:        'Yo',
    labelTrans:     'Trad.',
  },
  vi: {
    pageTitle:      'Phòng Chiến Babel',
    headerSub:      'Phòng Chiến Babel™ — Dịch thuật AI theo thời gian thực',
    enterTitle:     'Vào Phòng Chiến',
    labelProjectId: 'ID Dự án',
    labelRole:      'Tôi là…',
    optEmployer:    'Nhà cung cấp (nói tiếng Trung)',
    optEngineer:    'Kỹ sư (nói tiếng Tây Ban Nha)',
    labelName:      'Tên của tôi',
    namePlaceholder:'vd. Terry hoặc Juan',
    btnJoin:        'Tham gia kênh mã hóa',
    sidebarTitle:   'Dự án hiện tại',
    lblProjectId:   'ID Dự án',
    lblCounterparty:'Đối tác',
    counterpartyEmployer: 'Kỹ sư địa phương (MX)',
    counterpartyEngineer: 'Quản lý dự án (CN)',
    waiting:        'Đang chờ…',
    aiPmTitle:      '🤖 Công cụ AI-PM (Chỉ nhà tuyển dụng)',
    btnNudge:       '🔔 Tự động nhắc nhở',
    btnReport:      '📊 Tạo báo cáo hàng ngày',
    footerEncrypted:'🔒 Mã hóa đầu cuối',
    footerPowered:  '⚡ Được cung cấp bởi Gemini 2.5 Flash',
    chatTitle:      'Kênh cộng tác kỹ thuật',
    liveTag:        '● Dịch trực tiếp',
    exitBtn:        'Thoát về Bảng điều khiển',
    translating:    'Đang dịch…',
    send:           'Gửi',
    uploadTitle:    'Tải lên bằng chứng công việc',
    welcomeMsg:     'Chào mừng đến Phòng Chiến Babel. Tất cả tin nhắn được dịch theo thời gian thực.',
    joinedMsg:      (name, role) => `Bạn đã tham gia kênh với tên ${name} (${role})`,
    placeholderEmployer: '请输入中文…',
    placeholderEngineer: 'Escribe tu mensaje en español…',
    labelMe:        'Tôi',
    labelTrans:     'Dịch',
  },
  hi: { pageTitle: 'बैबेल वॉर रूम', headerSub: 'बैबेल वॉर रूम™ — रीयल-टाइम AI अनुवाद', enterTitle: 'वॉर रूम में प्रवेश करें', labelProjectId: 'प्रोजेक्ट ID', labelRole: 'मैं हूँ…', optEmployer: 'आपूर्तिकर्ता (चीनी बोलता है)', optEngineer: 'इंजीनियर (स्पेनिश बोलता है)', labelName: 'मेरा नाम', namePlaceholder: 'जैसे Terry या Juan', btnJoin: 'एन्क्रिप्टेड चैनल जॉइन करें', sidebarTitle: 'सक्रिय प्रोजेक्ट', lblProjectId: 'प्रोजेक्ट ID', lblCounterparty: 'प्रतिपक्ष', counterpartyEmployer: 'स्थानीय इंजीनियर (MX)', counterpartyEngineer: 'प्रोजेक्ट मैनेजर (CN)', waiting: 'प्रतीक्षा…', aiPmTitle: '🤖 AI-PM टूल (केवल नियोक्ता)', btnNudge: '🔔 ऑटो फॉलो-अप', btnReport: '📊 दैनिक रिपोर्ट', footerEncrypted: '🔒 एंड-टू-एंड एन्क्रिप्टेड', footerPowered: '⚡ Gemini 2.5 Flash द्वारा संचालित', chatTitle: 'इंजीनियरिंग सहयोग चैनल', liveTag: '● लाइव अनुवाद', exitBtn: 'डैशबोर्ड पर वापस', translating: 'अनुवाद हो रहा है…', send: 'भेजें', uploadTitle: 'कार्य प्रमाण अपलोड करें', welcomeMsg: 'बैबेल वॉर रूम में आपका स्वागत है। सभी संदेश रीयल-टाइम में अनुवादित होते हैं।', joinedMsg: (name, role) => `आप ${name} (${role}) के रूप में चैनल में शामिल हो गए`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'मैं', labelTrans: 'अनुवाद' },
  fr: { pageTitle: 'Salle de Guerre Babel', headerSub: 'Salle de Guerre Babel™ — Traduction IA en temps réel', enterTitle: 'Entrer dans la Salle de Guerre', labelProjectId: 'ID de Projet', labelRole: 'Je suis le…', optEmployer: 'Fournisseur (parle chinois)', optEngineer: 'Ingénieur (parle espagnol)', labelName: 'Mon nom', namePlaceholder: 'ex. Terry ou Juan', btnJoin: 'Rejoindre le canal chiffré', sidebarTitle: 'Projet actif', lblProjectId: 'ID de Projet', lblCounterparty: 'Contrepartie', counterpartyEmployer: 'Ingénieur local (MX)', counterpartyEngineer: 'Chef de projet (CN)', waiting: 'En attente…', aiPmTitle: '🤖 Outils AI-PM (Employeur uniquement)', btnNudge: '🔔 Relance automatique', btnReport: '📊 Rapport quotidien', footerEncrypted: '🔒 Chiffrement de bout en bout', footerPowered: '⚡ Propulsé par Gemini 2.5 Flash', chatTitle: 'Canal de collaboration technique', liveTag: '● Traduction en direct', exitBtn: 'Retour au tableau de bord', translating: 'Traduction…', send: 'Envoyer', uploadTitle: 'Télécharger preuve de travail', welcomeMsg: 'Bienvenue dans la Salle de Guerre Babel. Tous les messages sont traduits en temps réel.', joinedMsg: (name, role) => `Vous avez rejoint le canal en tant que ${name} (${role})`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'Moi', labelTrans: 'Trad.' },
  de: { pageTitle: 'Babel War Room', headerSub: 'Babel War Room™ — KI-Übersetzung in Echtzeit', enterTitle: 'War Room betreten', labelProjectId: 'Projekt-ID', labelRole: 'Ich bin der…', optEmployer: 'Lieferant (spricht Chinesisch)', optEngineer: 'Ingenieur (spricht Spanisch)', labelName: 'Mein Name', namePlaceholder: 'z.B. Terry oder Juan', btnJoin: 'Verschlüsseltem Kanal beitreten', sidebarTitle: 'Aktives Projekt', lblProjectId: 'Projekt-ID', lblCounterparty: 'Gegenpartei', counterpartyEmployer: 'Lokaler Ingenieur (MX)', counterpartyEngineer: 'Projektmanager (CN)', waiting: 'Warten…', aiPmTitle: '🤖 AI-PM-Tools (Nur Arbeitgeber)', btnNudge: '🔔 Auto-Follow-Up', btnReport: '📊 Tagesbericht erstellen', footerEncrypted: '🔒 Ende-zu-Ende-verschlüsselt', footerPowered: '⚡ Betrieben von Gemini 2.5 Flash', chatTitle: 'Technischer Kollaborationskanal', liveTag: '● Live-Übersetzung aktiv', exitBtn: 'Zum Dashboard', translating: 'Übersetze…', send: 'Senden', uploadTitle: 'Arbeitsnachweis hochladen', welcomeMsg: 'Willkommen im Babel War Room. Alle Nachrichten werden in Echtzeit übersetzt.', joinedMsg: (name, role) => `Sie sind dem Kanal als ${name} (${role}) beigetreten`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'Ich', labelTrans: 'Übers.' },
  ja: { pageTitle: 'バベル作戦室', headerSub: 'バベル作戦室™ — リアルタイムAI翻訳', enterTitle: '作戦室に入室', labelProjectId: 'プロジェクトID', labelRole: '私は…', optEmployer: 'サプライヤー（中国語話者）', optEngineer: 'エンジニア（スペイン語話者）', labelName: '私の名前', namePlaceholder: '例：TerryまたはJuan', btnJoin: '暗号化チャンネルに参加', sidebarTitle: 'アクティブプロジェクト', lblProjectId: 'プロジェクトID', lblCounterparty: '相手方', counterpartyEmployer: 'ローカルエンジニア (MX)', counterpartyEngineer: 'プロジェクトマネージャー (CN)', waiting: '待機中…', aiPmTitle: '🤖 AI-PMツール（雇用主専用）', btnNudge: '🔔 自動フォローアップ', btnReport: '📊 日次報告書生成', footerEncrypted: '🔒 エンドツーエンド暗号化', footerPowered: '⚡ Gemini 2.5 Flash搭載', chatTitle: 'エンジニアリング協業チャンネル', liveTag: '● ライブ翻訳中', exitBtn: 'ダッシュボードへ', translating: '翻訳中…', send: '送信', uploadTitle: '作業証明をアップロード', welcomeMsg: 'バベル作戦室へようこそ。すべてのメッセージはリアルタイムで翻訳されます。', joinedMsg: (name, role) => `${name}（${role}）としてチャンネルに参加しました`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: '私', labelTrans: '翻訳' },
  ko: { pageTitle: '바벨 워룸', headerSub: '바벨 워룸™ — 실시간 AI 번역', enterTitle: '워룸 입장', labelProjectId: '프로젝트 ID', labelRole: '저는…', optEmployer: '공급업체 (중국어 사용)', optEngineer: '엔지니어 (스페인어 사용)', labelName: '내 이름', namePlaceholder: '예: Terry 또는 Juan', btnJoin: '암호화 채널 참가', sidebarTitle: '활성 프로젝트', lblProjectId: '프로젝트 ID', lblCounterparty: '상대방', counterpartyEmployer: '현지 엔지니어 (MX)', counterpartyEngineer: '프로젝트 매니저 (CN)', waiting: '대기 중…', aiPmTitle: '🤖 AI-PM 도구 (고용주 전용)', btnNudge: '🔔 자동 팔로업', btnReport: '📊 일일 보고서 생성', footerEncrypted: '🔒 엔드투엔드 암호화', footerPowered: '⚡ Gemini 2.5 Flash 기반', chatTitle: '엔지니어링 협업 채널', liveTag: '● 실시간 번역 중', exitBtn: '대시보드로 나가기', translating: '번역 중…', send: '전송', uploadTitle: '작업 증거 업로드', welcomeMsg: '바벨 워룸에 오신 것을 환영합니다. 모든 메시지가 실시간으로 번역됩니다.', joinedMsg: (name, role) => `${name} (${role}) 로 채널에 참가했습니다`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: '나', labelTrans: '번역' },
};

export default function WarRoom() {
  const [lang, setLang] = useLang();
  const [joined, setJoined]         = useState(false);
  const [projectId, setProjectId]   = useState('DEMO-1082');
  const [role, setRole]             = useState('employer');
  const [myName, setMyName]         = useState('');
  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState('');
  const [sending, setSending]       = useState(false);

  const socketRef    = useRef(null);
  const messagesRef  = useRef(null);
  const fileInputRef = useRef(null);

  const d = DICT[lang] || DICT.en;

  // Set initial welcome message when lang changes (before joining)
  useEffect(() => {
    if (!joined) {
      setMessages([{ type: 'system', text: d.welcomeMsg, id: 'welcome' }]);
    }
  }, [lang, joined]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  function joinRoom(e) {
    e.preventDefault();
    const socket = io();
    socketRef.current = socket;

    socket.emit('joinRoom', { projectId, userRole: role });

    socket.on('message', (data) => {
      if (data.senderRole === role && data.senderName === myName) setSending(false);
      if (data.isAIPM) {
        addMessage({ type: 'aipm', senderName: data.senderName, originalText: data.originalText, translatedText: data.translatedText });
        return;
      }
      if (data.isIOT) {
        addMessage({ type: 'iot', senderName: data.senderName, originalText: data.originalText, translatedText: data.translatedText });
        return;
      }
      const isMine = (data.senderRole === role && data.senderName === myName);
      addMessage({ type: isMine ? 'sent' : 'received', senderName: data.senderName, originalText: data.originalText, translatedText: data.translatedText });
    });

    socket.on('messageError', (data) => {
      setSending(false);
      addMessage({ type: 'system', text: `Error: ${data.error}` });
    });

    addMessage({ type: 'system', text: d.joinedMsg(myName, role) });
    setJoined(true);
  }

  function addMessage(msg) {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }

  function sendMessage(e) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !socketRef.current) return;
    setSending(true);
    setInputText('');
    socketRef.current.emit('chatMessage', { projectId, senderRole: role, senderName: myName, text });
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Data = evt.target.result;
      addMessage({ type: 'sent', senderName: myName, originalText: `<img src="${base64Data}" style="max-width:100%;border-radius:8px;margin-bottom:8px;"/><div>[Image Uploaded for QC]</div>`, translatedText: '[Imagen subida para control de calidad]' });
      socketRef.current?.emit('uploadQualityImage', { projectId, imageData: base64Data, context: 'Verify this equipment panel/wiring.' });
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <Head>
        <title>{d.pageTitle} | Talengineer</title>
      </Head>

      {!joined && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginBox}>
            <h2>{d.enterTitle}</h2>
            <form onSubmit={joinRoom}>
              <div className={styles.formGroup}>
                <label>{d.labelProjectId}</label>
                <input value={projectId} onChange={(e) => setProjectId(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{d.labelRole}</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="employer">{d.optEmployer}</option>
                  <option value="engineer">{d.optEngineer}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{d.labelName}</label>
                <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder={d.namePlaceholder} required />
              </div>
              <button type="submit" className={styles.btnPrimary}>{d.btnJoin}</button>
            </form>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <div className={styles.headerSub}>{d.headerSub}</div>
      </header>

      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <h3>{d.sidebarTitle}</h3>
          <div className={styles.projectInfo}>
            <div className={styles.infoLabel}>{d.lblProjectId}</div>
            <div className={styles.infoValue}>{projectId}</div>
            <div className={styles.infoLabel}>{d.lblCounterparty}</div>
            <div className={styles.infoValue}>
              {joined ? (role === 'employer' ? d.counterpartyEmployer : d.counterpartyEngineer) : d.waiting}
              {joined && <span className={styles.onlineDot} />}
            </div>
          </div>

          {joined && role === 'employer' && (
            <div className={styles.aiPmControls}>
              <div className={styles.aiPmTitle}>{d.aiPmTitle}</div>
              <button onClick={() => socketRef.current?.emit('requestNudge', { projectId })} className={styles.btnNudge}>{d.btnNudge}</button>
              <button onClick={() => socketRef.current?.emit('requestDailyReport', { projectId })} className={styles.btnReport}>{d.btnReport}</button>
            </div>
          )}

          <div style={{ flex: 1 }} />
          <div className={styles.footer}>
            <p>{d.footerEncrypted}</p>
            <p>{d.footerPowered}</p>
          </div>
        </aside>

        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <div>
              <h2>{d.chatTitle}</h2>
              <span className={styles.liveTag}>{d.liveTag}</span>
            </div>
            <button onClick={() => window.location.href = '/finance'} className={styles.exitBtn}>
              {d.exitBtn}
            </button>
          </div>

          <div className={styles.chatMessages} ref={messagesRef}>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} myRole={role} myName={myName} labels={{ me: d.labelMe, trans: d.labelTrans }} />
            ))}
            {sending && <div className={styles.typingDot}>{d.translating}</div>}
          </div>

          <form className={styles.chatInput} onSubmit={sendMessage}>
            <label className={styles.btnCamera} title={d.uploadTitle} onClick={() => fileInputRef.current?.click()}>
              📷
            </label>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={role === 'employer' ? d.placeholderEmployer : d.placeholderEngineer}
              autoComplete="off"
              required
            />
            <button type="submit" disabled={sending}>{sending ? d.translating : d.send}</button>
          </form>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ msg, myRole, myName, labels }) {
  if (msg.type === 'system') {
    return <div className={styles.msgSystem}>{msg.text}</div>;
  }
  if (msg.type === 'aipm') {
    return (
      <div className={styles.msgAIPM}>
        <div className={styles.senderName} style={{ color: '#d97706' }}>{msg.senderName}</div>
        <div dangerouslySetInnerHTML={{ __html: myRole === 'employer' ? msg.originalText : msg.translatedText }} />
      </div>
    );
  }
  if (msg.type === 'iot') {
    return (
      <div className={styles.msgIOT}>
        <div className={styles.senderName} style={{ color: '#ef4444', fontSize: 14 }}>{msg.senderName}</div>
        <div style={{ fontFamily: 'monospace', marginTop: 8 }}
          dangerouslySetInnerHTML={{ __html: (myRole === 'employer' ? msg.originalText : msg.translatedText).replace(/\n/g, '<br/>') }} />
      </div>
    );
  }
  if (msg.type === 'sent') {
    return (
      <div className={styles.msgSent}>
        <div className={styles.senderName}>{labels.me}</div>
        <div dangerouslySetInnerHTML={{ __html: msg.originalText }} />
        <div className={styles.translation}>{labels.trans}: {msg.translatedText}</div>
      </div>
    );
  }
  return (
    <div className={styles.msgReceived}>
      <div className={styles.senderName}>{msg.senderName}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{msg.originalText}</div>
      <div className={styles.translationReceived}>{msg.translatedText}</div>
    </div>
  );
}
