import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './warroom.module.css';

// socket.io-client must only run client-side (no SSR)
let io;
if (typeof window !== 'undefined') {
  io = require('socket.io-client');
}

export default function WarRoom() {
  const [joined, setJoined]         = useState(false);
  const [projectId, setProjectId]   = useState('DEMO-1082');
  const [role, setRole]             = useState('employer');
  const [myName, setMyName]         = useState('');
  const [messages, setMessages]     = useState([
    { type: 'system', text: 'Welcome to the Babel War Room. All messages are translated in real-time.' },
  ]);
  const [inputText, setInputText]   = useState('');
  const [sending, setSending]       = useState(false);

  const socketRef    = useRef(null);
  const messagesRef  = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup socket on unmount
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
      // Re-enable input after our own message comes back
      if (data.senderRole === role && data.senderName === myName) {
        setSending(false);
      }
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

    addMessage({ type: 'system', text: `You joined the channel as ${myName} (${role})` });
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

  function requestNudge() {
    socketRef.current?.emit('requestNudge', { projectId });
  }

  function requestReport() {
    socketRef.current?.emit('requestDailyReport', { projectId });
  }

  return (
    <>
      <Head>
        <title>Babel War Room | Talengineer</title>
      </Head>

      {/* Login overlay */}
      {!joined && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginBox}>
            <h2>Enter War Room</h2>
            <form onSubmit={joinRoom}>
              <div className={styles.formGroup}>
                <label>Project ID</label>
                <input value={projectId} onChange={(e) => setProjectId(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>I am the…</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="employer">Supplier (Speaks Chinese)</option>
                  <option value="engineer">Engineer (Speaks Spanish)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>My Name</label>
                <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="e.g. Terry or Juan" required />
              </div>
              <button type="submit" className={styles.btnPrimary}>Join Encrypted Channel</button>
            </form>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <div className={styles.headerSub}>Babel War Room™ — Real-time AI Translation</div>
      </header>

      <div className={styles.mainContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3>Active Project</h3>
          <div className={styles.projectInfo}>
            <div className={styles.infoLabel}>Project ID</div>
            <div className={styles.infoValue}>{projectId}</div>
            <div className={styles.infoLabel}>Counterparty</div>
            <div className={styles.infoValue}>
              {joined ? (role === 'employer' ? 'Local Engineer (MX)' : 'Project Manager (CN)') : 'Waiting...'}
              {joined && <span className={styles.onlineDot} />}
            </div>
          </div>

          {joined && role === 'employer' && (
            <div className={styles.aiPmControls}>
              <div className={styles.aiPmTitle}>🤖 AI-PM Tools (Employer Only)</div>
              <button onClick={requestNudge} className={styles.btnNudge}>🔔 AI 自动催办进展</button>
              <button onClick={requestReport} className={styles.btnReport}>📊 生成今日现场简报</button>
            </div>
          )}

          <div style={{ flex: 1 }} />
          <div className={styles.footer}>
            <p>🔒 End-to-End Encrypted</p>
            <p>⚡ Powered by Gemini 2.5 Flash Industrial Translation Engine</p>
          </div>
        </aside>

        {/* Chat area */}
        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <div>
              <h2>Engineering Collaboration Channel</h2>
              <span className={styles.liveTag}>● Live Translation Active</span>
            </div>
            <button onClick={() => window.location.href = '/finance'} className={styles.exitBtn}>
              Exit to Dashboard
            </button>
          </div>

          <div className={styles.chatMessages} ref={messagesRef}>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} myRole={role} myName={myName} />
            ))}
            {sending && <div className={styles.typingDot}>Translating…</div>}
          </div>

          <form className={styles.chatInput} onSubmit={sendMessage}>
            <label className={styles.btnCamera} title="Upload Proof of Work" onClick={() => fileInputRef.current?.click()}>
              📷
            </label>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={role === 'employer' ? '请输入中文...' : 'Escribe tu mensaje en español...'}
              autoComplete="off"
              required
            />
            <button type="submit" disabled={sending}>{sending ? 'Translating...' : 'Send'}</button>
          </form>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ msg, myRole, myName }) {
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
        <div className={styles.senderName}>Me</div>
        <div dangerouslySetInnerHTML={{ __html: msg.originalText }} />
        <div className={styles.translation}>Trans: {msg.translatedText}</div>
      </div>
    );
  }
  // received
  return (
    <div className={styles.msgReceived}>
      <div className={styles.senderName}>{msg.senderName}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{msg.originalText}</div>
      <div className={styles.translationReceived}>{msg.translatedText}</div>
    </div>
  );
}
