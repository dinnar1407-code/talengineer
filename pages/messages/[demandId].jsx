import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useToast } from '../../components/Toast';
import styles from './messages.module.css';

const LS_USER_KEY = 'tal_user';

export default function MessageThread() {
  const router = useRouter();
  const { demandId } = router.query;
  const toast = useToast();
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [demand, setDemand]           = useState(null);
  const [messages, setMessages]       = useState(null);
  const [content, setContent]         = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); }
      catch { router.push('/finance'); }
    } else {
      router.push('/finance');
    }
  }, []);

  useEffect(() => {
    if (!demandId || !currentUser) return;
    loadThread();
    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(loadThread, 5000);
    return () => clearInterval(pollRef.current);
  }, [demandId, currentUser]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadThread() {
    try {
      const res  = await fetch(`/api/messages/thread/${demandId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDemand(data.demand);
        setMessages(data.data || []);
        setLoading(false);
      } else {
        toast.error(data.error || 'Failed to load messages.');
        setLoading(false);
      }
    } catch { setLoading(false); }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!content.trim() || !currentUser?.token) return;
    setSending(true);
    const optimistic = {
      id: Date.now(),
      sender_email: currentUser.email,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      content: content.trim(),
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...(prev || []), optimistic]);
    setContent('');
    try {
      const res  = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: parseInt(demandId), content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic with real
        setMessages(prev => prev.map(m => m.id === optimistic.id ? data.data : m));
      } else {
        toast.error(data.error);
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      }
    } catch {
      toast.error('Failed to send. Check your connection.');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
    setSending(false);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      <Head>
        <title>{demand?.title ? `${demand.title} — Messages` : 'Messages'} | Talengineer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className={styles.layout}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/finance" className={styles.backBtn}>←</Link>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>{demand?.title || `Project #${demandId}`}</div>
            <div className={styles.headerSub}>Project Messages</div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.thread}>
          {loading ? (
            <div className={styles.loadingWrap}>
              {[0,1,2].map(i => <div key={i} className={styles.msgSkeleton} style={{ alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }} />)}
            </div>
          ) : messages?.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_email === currentUser?.email;
              const prevMsg = messages[i - 1];
              const showSender = !prevMsg || prevMsg.sender_email !== msg.sender_email;
              return (
                <div key={msg.id} className={`${styles.msgRow} ${isMine ? styles.msgMine : styles.msgTheirs}`}>
                  {showSender && !isMine && (
                    <div className={styles.senderName}>{msg.sender_name || msg.sender_email.split('@')[0]}</div>
                  )}
                  <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs} ${msg.optimistic ? styles.bubbleOptimistic : ''}`}>
                    {msg.content}
                  </div>
                  <div className={`${styles.timestamp} ${isMine ? styles.tsRight : ''}`}>{formatTime(msg.created_at)}</div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className={styles.inputBar} onSubmit={sendMessage}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a message…"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
            autoComplete="off"
            disabled={!currentUser}
          />
          <button type="submit" className={styles.btnSend} disabled={sending || !content.trim()}>
            {sending ? '…' : '↑'}
          </button>
        </form>
      </div>
    </>
  );
}
