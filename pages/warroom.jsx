import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import OfflineBanner from '../components/OfflineBanner';
import { useOfflineData } from '../lib/offline/useOfflineData';
import { enqueue, listPending, markDone } from '../lib/offline/outbox';
import styles from './warroom.module.css';
import { useLang } from '../hooks/useLang';
import { DICT } from '../lib/i18n/warroom';

// socket.io-client must only run client-side (no SSR)
let io;
if (typeof window !== 'undefined') {
  io = require('socket.io-client');
}

export default function WarRoom() {
  const router = useRouter();
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

  // 深链接接收端：console.jsx / workorder/[id].jsx 的「进入 War Room」入口都跳到
  // /warroom?projectId=<demand_id>，把当前需求 id 带在 query 里。这里读回来预填「项目编号」，
  // 用户就不用手抄一串内部 id 了。为什么要等 router.isReady：pages-router 首屏 SSR 时 query 可能还是空，
  // isReady 变 true 才代表 query 已解析完整；依赖里带 router.query.projectId 保证只在其真正变化时同步，
  // 不会覆盖用户在输入框里的手动改动，也不会在已加入房间后被同一 query 反复触发。
  useEffect(() => {
    if (!router.isReady) return;
    const qp = router.query.projectId;
    if (qp && !joined) setProjectId(String(qp));
  }, [router.isReady, router.query.projectId, joined]);

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

  // ── 离线队列重发（文字走 chatMessage / QC 图走 uploadQualityImage）───────────────
  // 两类 pending 都靠 socket 重发（QC 分析与翻译管线都挂在 socket 事件上），成功即 markDone。
  // useRef 防重入：三个触发源（加入房间 / 回网 / socket 重连）可能同时触发，避免并发重复重发。
  const replayingRef = useRef(false);
  const replayPending = useCallback(async () => {
    if (replayingRef.current) return;
    const socket = socketRef.current;
    if (!joined || !socket) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    replayingRef.current = true;
    try {
      // 带 socket.io ack 回执重发：仅当服务端回执 ok:true（已落库）才 markDone。
      // 被拒（没进房/鉴权失败）或落库失败 → 无 ok → 保留 pending，下个触发器再试。8s 无 ack 视为未送达。
      // 这彻底关闭"拒收/落库失败后 markDone 静默丢队列"，也顺带兜住 join 竞态。
      const emitAck = (evt, payload) => new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 8000);
        socket.emit(evt, payload, (resp) => { clearTimeout(timer); resolve(!!resp?.ok); });
      });
      const pending = await listPending();
      for (const it of (pending || [])) {
        const url = it.request?.url || '';
        const body = it.request?.body || {};
        let acked = false;
        if (url === '/socket/chatMessage') {
          acked = await emitAck('chatMessage', body);
        } else if (it.type === 'qc-image' && body.imageData) {
          acked = await emitAck('uploadQualityImage', { projectId: body.projectId || projectId, imageData: body.imageData, context: 'Verify this equipment panel/wiring.' });
        } else {
          continue; // 未知 op：跳过（既不重发也不删）
        }
        if (acked) await markDone(it.id); // 未 ack 则保留，交给下个触发器重试
      }
    } catch { /* 重发失败下次再试 */ } finally {
      replayingRef.current = false;
    }
  }, [joined, projectId]);

  // 三个触发源都尝试重发：①加入房间 ②window 'online'（回网）③socket 'connect'（重连）
  useEffect(() => {
    if (!joined) return undefined;
    const socket = socketRef.current;

    // 重连处理器：掉线重连后是新服务端 socket，不在 project_X 房间，直接 emit 会被 inProjectRoom
    // 守卫拒收不落库，而紧跟的 markDone 会无条件清队列 → 静默丢数据。必须先重进房间再重发；
    // socket.io 每 socket 保序，joinRoom 先于重发被服务端处理（与首次 join 路径一致）。
    const onConnect = () => {
      if (socketRef.current) socketRef.current.emit('joinRoom', { projectId });
      replayPending();
    };
    // 回网处理器：online 可能早于 socket 重连触发。只有 socket 已连接（房间仍在）才直接重发，
    // 否则不动，交给随后的 connect 处理器兜底（它会先重进房间），避免打到尚未入房的新 socket。
    const onOnline = () => {
      if (socketRef.current?.connected) replayPending();
    };

    replayPending(); // ① 加入房间即刻尝试（首次 join 路径：joinRoom 已在 joinRoom() 里 emit）
    window.addEventListener('online', onOnline);
    if (socket) socket.on('connect', onConnect);
    return () => {
      window.removeEventListener('online', onOnline);
      if (socket) socket.off('connect', onConnect);
    };
  }, [joined, replayPending, projectId]);

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
    // 离线：以 socket 事件形态入队（url=/socket/chatMessage，非 HTTP）；warroom 回网后走 socket.emit('chatMessage')
    // 重发，与 QC 图同一条重发路径。offline-core 的 replayAll 会跳过 /socket/ 前缀的 op，不做 HTTP 重放。
    // 本地乐观插入消息行 + 「待同步」徽标。
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      enqueue({
        type: 'message',
        request: {
          url: '/socket/chatMessage',
          method: 'POST',
          headers: {},
          body: { projectId, senderRole: role, senderName: myName, text }, // 与 chatMessage 事件同格式 payload
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
    reader.onload = async (evt) => {
      const base64Data = evt.target.result;
      // 离线：先降采样再入队（限宽 1600 / JPEG 0.8，与服务端 sharp 参数对齐），
      // 避免多张全分辨率 base64 撑爆 IndexedDB；回网后由 warroom 走 socket 重发分析（QC 管线挂在 socket 上）。
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        const compact = await downscaleDataUrl(base64Data);
        enqueue({
          type: 'qc-image',
          request: {
            // 占位 url：qc-image 实际由 warroom 回网后走 socket 重发，非 HTTP 重放
            url: '/socket/uploadQualityImage',
            method: 'POST',
            headers: {},
            body: { imageData: compact, projectId },
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

      {/* 全站共享导航（菜单/语言/主题切换）；War Room 自带 header 保留品牌副标题，去掉重复 logo */}
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
        {/* 转义渲染而非 dangerouslySetInnerHTML：历史消息按角色也会走 sent 分支，
            若注入 HTML，他人存进 original_text 的 <img onerror> 等载荷会被执行（存储型 XSS）。
            QC 图已有独立 <img> 分支，普通文本一律当纯文本渲染。 */}
        <div>{msg.originalText}</div>
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

// 离线拍照降采样：限宽 1600、JPEG 0.8（与服务端 sharp 参数对齐），把全分辨率快拍压小再入队，
// 避免多张离线照片把 IndexedDB 撑爆。任何环节失败都回退原图（宁可大也不丢图）。
function downscaleDataUrl(dataUrl, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl); // 解码失败：回退原图
      img.src = dataUrl;
    } catch { resolve(dataUrl); }
  });
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
