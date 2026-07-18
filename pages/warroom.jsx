import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import OfflineBanner from '../components/OfflineBanner';
import { useOfflineData } from '../lib/offline/useOfflineData';
import { enqueue, listPending, markDone } from '../lib/offline/outbox';
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
    offlinePhotoQueued: "You're offline — the photo will upload when you reconnect.",
    pendingSync:    'Pending sync',
    imageUnavailable: 'Image unavailable',
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
    offlinePhotoQueued: '离线状态，图片将在回网后上传。',
    pendingSync:    '待同步',
    imageUnavailable: '图片暂不可用',
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
    offlinePhotoQueued: 'Sin conexión — la foto se subirá al reconectar.',
    pendingSync:    'Pendiente de sincronizar',
    imageUnavailable: 'Imagen no disponible',
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
    offlinePhotoQueued: 'Ngoại tuyến — ảnh sẽ tải lên khi có mạng lại.',
    pendingSync:    'Chờ đồng bộ',
    imageUnavailable: 'Ảnh không khả dụng',
  },
  hi: { pageTitle: 'बैबेल वॉर रूम', headerSub: 'बैबेल वॉर रूम™ — रीयल-टाइम AI अनुवाद', enterTitle: 'वॉर रूम में प्रवेश करें', labelProjectId: 'प्रोजेक्ट ID', labelRole: 'मैं हूँ…', optEmployer: 'आपूर्तिकर्ता (चीनी बोलता है)', optEngineer: 'इंजीनियर (स्पेनिश बोलता है)', labelName: 'मेरा नाम', namePlaceholder: 'जैसे Terry या Juan', btnJoin: 'एन्क्रिप्टेड चैनल जॉइन करें', sidebarTitle: 'सक्रिय प्रोजेक्ट', lblProjectId: 'प्रोजेक्ट ID', lblCounterparty: 'प्रतिपक्ष', counterpartyEmployer: 'स्थानीय इंजीनियर (MX)', counterpartyEngineer: 'प्रोजेक्ट मैनेजर (CN)', waiting: 'प्रतीक्षा…', aiPmTitle: '🤖 AI-PM टूल (केवल नियोक्ता)', btnNudge: '🔔 ऑटो फॉलो-अप', btnReport: '📊 दैनिक रिपोर्ट', footerEncrypted: '🔒 एंड-टू-एंड एन्क्रिप्टेड', footerPowered: '⚡ Gemini 2.5 Flash द्वारा संचालित', chatTitle: 'इंजीनियरिंग सहयोग चैनल', liveTag: '● लाइव अनुवाद', exitBtn: 'डैशबोर्ड पर वापस', translating: 'अनुवाद हो रहा है…', send: 'भेजें', uploadTitle: 'कार्य प्रमाण अपलोड करें', welcomeMsg: 'बैबेल वॉर रूम में आपका स्वागत है। सभी संदेश रीयल-टाइम में अनुवादित होते हैं।', joinedMsg: (name, role) => `आप ${name} (${role}) के रूप में चैनल में शामिल हो गए`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'मैं', labelTrans: 'अनुवाद', offlinePhotoQueued: 'आप ऑफ़लाइन हैं — दोबारा कनेक्ट होने पर फ़ोटो अपलोड होगी।', pendingSync: 'सिंक लंबित', imageUnavailable: 'छवि उपलब्ध नहीं' },
  fr: { pageTitle: 'Salle de Guerre Babel', headerSub: 'Salle de Guerre Babel™ — Traduction IA en temps réel', enterTitle: 'Entrer dans la Salle de Guerre', labelProjectId: 'ID de Projet', labelRole: 'Je suis le…', optEmployer: 'Fournisseur (parle chinois)', optEngineer: 'Ingénieur (parle espagnol)', labelName: 'Mon nom', namePlaceholder: 'ex. Terry ou Juan', btnJoin: 'Rejoindre le canal chiffré', sidebarTitle: 'Projet actif', lblProjectId: 'ID de Projet', lblCounterparty: 'Contrepartie', counterpartyEmployer: 'Ingénieur local (MX)', counterpartyEngineer: 'Chef de projet (CN)', waiting: 'En attente…', aiPmTitle: '🤖 Outils AI-PM (Employeur uniquement)', btnNudge: '🔔 Relance automatique', btnReport: '📊 Rapport quotidien', footerEncrypted: '🔒 Chiffrement de bout en bout', footerPowered: '⚡ Propulsé par Gemini 2.5 Flash', chatTitle: 'Canal de collaboration technique', liveTag: '● Traduction en direct', exitBtn: 'Retour au tableau de bord', translating: 'Traduction…', send: 'Envoyer', uploadTitle: 'Télécharger preuve de travail', welcomeMsg: 'Bienvenue dans la Salle de Guerre Babel. Tous les messages sont traduits en temps réel.', joinedMsg: (name, role) => `Vous avez rejoint le canal en tant que ${name} (${role})`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'Moi', labelTrans: 'Trad.', offlinePhotoQueued: 'Hors ligne — la photo sera envoyée à la reconnexion.', pendingSync: 'En attente de synchro', imageUnavailable: 'Image indisponible' },
  de: { pageTitle: 'Babel War Room', headerSub: 'Babel War Room™ — KI-Übersetzung in Echtzeit', enterTitle: 'War Room betreten', labelProjectId: 'Projekt-ID', labelRole: 'Ich bin der…', optEmployer: 'Lieferant (spricht Chinesisch)', optEngineer: 'Ingenieur (spricht Spanisch)', labelName: 'Mein Name', namePlaceholder: 'z.B. Terry oder Juan', btnJoin: 'Verschlüsseltem Kanal beitreten', sidebarTitle: 'Aktives Projekt', lblProjectId: 'Projekt-ID', lblCounterparty: 'Gegenpartei', counterpartyEmployer: 'Lokaler Ingenieur (MX)', counterpartyEngineer: 'Projektmanager (CN)', waiting: 'Warten…', aiPmTitle: '🤖 AI-PM-Tools (Nur Arbeitgeber)', btnNudge: '🔔 Auto-Follow-Up', btnReport: '📊 Tagesbericht erstellen', footerEncrypted: '🔒 Ende-zu-Ende-verschlüsselt', footerPowered: '⚡ Betrieben von Gemini 2.5 Flash', chatTitle: 'Technischer Kollaborationskanal', liveTag: '● Live-Übersetzung aktiv', exitBtn: 'Zum Dashboard', translating: 'Übersetze…', send: 'Senden', uploadTitle: 'Arbeitsnachweis hochladen', welcomeMsg: 'Willkommen im Babel War Room. Alle Nachrichten werden in Echtzeit übersetzt.', joinedMsg: (name, role) => `Sie sind dem Kanal als ${name} (${role}) beigetreten`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: 'Ich', labelTrans: 'Übers.', offlinePhotoQueued: 'Offline — das Foto wird beim Wiederverbinden hochgeladen.', pendingSync: 'Sync ausstehend', imageUnavailable: 'Bild nicht verfügbar' },
  ja: { pageTitle: 'バベル作戦室', headerSub: 'バベル作戦室™ — リアルタイムAI翻訳', enterTitle: '作戦室に入室', labelProjectId: 'プロジェクトID', labelRole: '私は…', optEmployer: 'サプライヤー（中国語話者）', optEngineer: 'エンジニア（スペイン語話者）', labelName: '私の名前', namePlaceholder: '例：TerryまたはJuan', btnJoin: '暗号化チャンネルに参加', sidebarTitle: 'アクティブプロジェクト', lblProjectId: 'プロジェクトID', lblCounterparty: '相手方', counterpartyEmployer: 'ローカルエンジニア (MX)', counterpartyEngineer: 'プロジェクトマネージャー (CN)', waiting: '待機中…', aiPmTitle: '🤖 AI-PMツール（雇用主専用）', btnNudge: '🔔 自動フォローアップ', btnReport: '📊 日次報告書生成', footerEncrypted: '🔒 エンドツーエンド暗号化', footerPowered: '⚡ Gemini 2.5 Flash搭載', chatTitle: 'エンジニアリング協業チャンネル', liveTag: '● ライブ翻訳中', exitBtn: 'ダッシュボードへ', translating: '翻訳中…', send: '送信', uploadTitle: '作業証明をアップロード', welcomeMsg: 'バベル作戦室へようこそ。すべてのメッセージはリアルタイムで翻訳されます。', joinedMsg: (name, role) => `${name}（${role}）としてチャンネルに参加しました`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: '私', labelTrans: '翻訳', offlinePhotoQueued: 'オフライン — 写真は再接続時にアップロードされます。', pendingSync: '同期待ち', imageUnavailable: '画像を表示できません' },
  ko: { pageTitle: '바벨 워룸', headerSub: '바벨 워룸™ — 실시간 AI 번역', enterTitle: '워룸 입장', labelProjectId: '프로젝트 ID', labelRole: '저는…', optEmployer: '공급업체 (중국어 사용)', optEngineer: '엔지니어 (스페인어 사용)', labelName: '내 이름', namePlaceholder: '예: Terry 또는 Juan', btnJoin: '암호화 채널 참가', sidebarTitle: '활성 프로젝트', lblProjectId: '프로젝트 ID', lblCounterparty: '상대방', counterpartyEmployer: '현지 엔지니어 (MX)', counterpartyEngineer: '프로젝트 매니저 (CN)', waiting: '대기 중…', aiPmTitle: '🤖 AI-PM 도구 (고용주 전용)', btnNudge: '🔔 자동 팔로업', btnReport: '📊 일일 보고서 생성', footerEncrypted: '🔒 엔드투엔드 암호화', footerPowered: '⚡ Gemini 2.5 Flash 기반', chatTitle: '엔지니어링 협업 채널', liveTag: '● 실시간 번역 중', exitBtn: '대시보드로 나가기', translating: '번역 중…', send: '전송', uploadTitle: '작업 증거 업로드', welcomeMsg: '바벨 워룸에 오신 것을 환영합니다. 모든 메시지가 실시간으로 번역됩니다.', joinedMsg: (name, role) => `${name} (${role}) 로 채널에 참가했습니다`, placeholderEmployer: '请输入中文…', placeholderEngineer: 'Escribe tu mensaje en español…', labelMe: '나', labelTrans: '번역', offlinePhotoQueued: '오프라인 — 사진은 다시 연결되면 업로드됩니다.', pendingSync: '동기화 대기 중', imageUnavailable: '이미지를 사용할 수 없음' },
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

  // ── 历史消息读缓存（含 QC 图回看）───────────────────────────────────────────
  // 加入房间后经 useOfflineData 拉一次历史：在线时向 socket 发 loadHistory 并等 'history' 回包，
  // 结果由离线引擎镜像到 IndexedDB，断网重开时回放缓存历史。fetcher 用一次性 Promise 包住 socket 往返。
  const { data: history } = useOfflineData(
    'warroom-' + projectId,
    () => new Promise((resolve) => {
      const socket = socketRef.current;
      if (!joined || !socket) return resolve(undefined); // 未加入时返回 undefined，不覆盖缓存
      let settled = false;
      const done = (rows) => { if (!settled) { settled = true; resolve(rows || []); } };
      socket.once('history', done);
      socket.emit('loadHistory', { projectId });
      setTimeout(() => done([]), 5000); // 超时兜底，避免 hook 永挂
    }),
    [joined, projectId]
  );

  // 历史到手后映射成气泡并并入列表：替换旧历史条目，保留系统消息与实时消息
  useEffect(() => {
    if (!Array.isArray(history)) return;
    setMessages((prev) => {
      const nonHistorical = prev.filter((m) => !m.historical);
      const bubbles = history.map((row) => historyRowToBubble(row, role));
      return [...bubbles, ...nonHistorical];
    });
  }, [history, role]);

  // 回网后重发离线拍的 QC 图：图走 socket（QC 分析管线挂在 socket 事件上），重发成功即 markDone
  useEffect(() => {
    if (!joined) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    (async () => {
      try {
        const pending = await listPending();
        for (const it of (pending || []).filter((x) => x.type === 'qc-image')) {
          const body = it.request?.body || {};
          if (socketRef.current && body.imageData) {
            socketRef.current.emit('uploadQualityImage', { projectId: body.projectId || projectId, imageData: body.imageData, context: 'Verify this equipment panel/wiring.' });
            await markDone(it.id);
          }
        }
      } catch { /* 重发失败下次再试 */ }
    })();
  }, [joined]); // eslint-disable-line react-hooks/exhaustive-deps

  function joinRoom(e) {
    e.preventDefault();
    // 服务端 socket 已加握手 JWT 鉴权（防任意人进项目聊天室），连接必须带上登录 token。
    // token 与 REST 请求同源：localStorage 的 tal_user（登录时写入）。
    let token = null;
    try {
      const stored = JSON.parse(localStorage.getItem('tal_user') || 'null');
      token = stored?.token || null;
    } catch { /* 解析失败按未登录处理 */ }
    if (!token) {
      addMessage({ type: 'system', text: 'Please sign in first — the War Room is only available to project participants. / 请先登录，作战室仅项目当事方可用。' });
      return;
    }
    const socket = io({ auth: { token } });
    socketRef.current = socket;

    // 鉴权失败（token 过期/无效）会触发 connect_error，给出明确提示而不是静默无响应
    socket.on('connect_error', () => {
      addMessage({ type: 'system', text: 'Connection rejected — please sign in again. / 连接被拒绝，请重新登录。' });
      setJoined(false);
    });

    socket.emit('joinRoom', { projectId });

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
    if (!text || sending) return;
    // 离线：入队 POST /api/messages（outbox 回网后重放并自动注入 client_msg_id 去重），本地乐观显示带「待同步」
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      let token = null;
      try { token = JSON.parse(localStorage.getItem('tal_user') || 'null')?.token || null; } catch { /* 未登录 */ }
      enqueue({
        type: 'message',
        request: {
          url: '/api/messages',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: { demand_id: projectId, content: text },
        },
      });
      addMessage({ type: 'sent', senderName: myName, originalText: text, translatedText: '', pending: true });
      setInputText('');
      return;
    }
    if (!socketRef.current) return;
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
      // 离线：把 base64 以 qc-image 入队，回网后由 warroom 走 socket 重发分析；本地提示"离线，回网后上传"
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        enqueue({
          type: 'qc-image',
          request: {
            // 占位 url：qc-image 实际由 warroom 回网后走 socket 重发（QC 分析管线挂在 socket 事件上），非 HTTP 重放
            url: '/socket/uploadQualityImage',
            method: 'POST',
            headers: {},
            body: { imageData: base64Data, projectId },
          },
        });
        addMessage({ type: 'system', text: d.offlinePhotoQueued });
        return;
      }
      // 在线：本地乐观显示图片（真正的 <img>，替代原 base64 内联 HTML 注入），并经 socket 送 QC 分析
      addMessage({ type: 'sent', senderName: myName, qc: true, imageUrl: base64Data });
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

      {/* 全站共享导航（菜单/语言/主题切换）；战情室自带 header 保留品牌副标题，去掉重复 logo */}
      <Navbar />

      {/* 离线状态横幅：断网中 + N 条待同步（在线且队列空时组件自渲染为 null） */}
      <OfflineBanner />

      <header className={styles.header}>
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
              <MessageBubble key={m.id} msg={m} myRole={role} myName={myName} labels={{ me: d.labelMe, trans: d.labelTrans, pending: d.pendingSync, imageUnavailable: d.imageUnavailable }} />
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
  // QC 图消息：用真正的 <img> 渲染签名 URL / 本地 base64（替代原 base64 内联 HTML 注入）。
  // image_url 缺失（如签名失败）时显示占位文案。左右对齐同普通消息（type 决定）。
  if (msg.qc) {
    const mine = msg.type === 'sent';
    return (
      <div className={mine ? styles.msgSent : styles.msgReceived}>
        <div className={styles.senderName}>{mine ? labels.me : msg.senderName}</div>
        {msg.imageUrl
          ? <img src={msg.imageUrl} alt="QC" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 4, display: 'block' }} />
          : <div style={{ fontSize: 12, color: 'var(--muted)' }}>{labels.imageUnavailable}</div>}
      </div>
    );
  }
  if (msg.type === 'sent') {
    return (
      <div className={styles.msgSent}>
        <div className={styles.senderName}>
          {labels.me}
          {/* 离线乐观消息：显示「待同步」徽标，回网后 outbox 重放到服务端 */}
          {msg.pending && <span style={{ marginLeft: 8, fontSize: 11, color: '#d97706', background: 'rgba(217,119,6,.12)', padding: '1px 8px', borderRadius: 10 }}>⏳ {labels.pending}</span>}
        </div>
        <div dangerouslySetInnerHTML={{ __html: msg.originalText }} />
        {msg.translatedText ? <div className={styles.translation}>{labels.trans}: {msg.translatedText}</div> : null}
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

// 把一行历史消息（project_messages）映射成聊天气泡。
// QC 图标记行渲染为图片气泡（imageUrl 为签名 URL，缺失则占位）；其余为普通文字气泡。
// 历史无法精确判定"是我"，按 sender_role 与当前角色比对做左右对齐即可。
function historyRowToBubble(row, myRole) {
  const isMine = row.sender_role === myRole;
  const isQc = /^\[qc-image:/.test(row.original_text || '');
  if (isQc) {
    return { type: isMine ? 'sent' : 'received', id: 'h-' + row.id, historical: true, qc: true, imageUrl: row.image_url || null, senderName: row.sender_name };
  }
  return { type: isMine ? 'sent' : 'received', id: 'h-' + row.id, historical: true, senderName: row.sender_name, originalText: row.original_text, translatedText: row.translated_text };
}
