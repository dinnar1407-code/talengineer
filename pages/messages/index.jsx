import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Toast';
import { useLang } from '../../hooks/useLang';
import { DICT } from '../../lib/i18n/messages-index';

const LS_USER_KEY = 'tal_user';

export default function MessagesInbox() {
  const router = useRouter();
  const toast  = useToast();
  const [lang, setLang] = useLang();

  const [currentUser, setCurrentUser] = useState(null);
  const [threads, setThreads]         = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        loadInbox(user);
      } catch { router.push('/finance'); }
    } else {
      router.push('/finance');
    }
  }, []);

  async function loadInbox(user) {
    try {
      const res  = await fetch('/api/messages/inbox', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok) setThreads(data.data || []);
      else { toast.error(data.error || 'Failed to load messages.'); setThreads([]); }
    } catch { toast.error('Network error.'); setThreads([]); }
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d   = new Date(ts);
    const now = new Date();
    const diffMs  = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)  return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7)  return `${diffDay}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  const d = DICT[lang] || DICT.en;

  return (
    <>
      <Head>
        <title>{`${d.title} | Talengineer`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{d.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{d.sub}</p>
        </div>

        {/* Thread list */}
        {threads === null ? (
          // Skeleton
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '50%', marginBottom: 8 }} />
                  <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>{d.empty}</div>
            <p style={{ fontSize: 14, marginBottom: 24 }}>{d.emptySub}</p>
            <Link href="/talent" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
              Browse Projects
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {threads.map(thread => (
              <Link
                key={thread.demand_id}
                href={`/messages/${thread.demand_id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'var(--surface)',
                  border: `1px solid ${thread.unread_count > 0 ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'box-shadow .15s',
                }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: thread.unread_count > 0 ? 'rgba(0,86,179,0.1)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    💬
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: thread.unread_count > 0 ? 700 : 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {thread.title || `Project #${thread.demand_id}`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                        {formatTime(thread.last_message_time)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {thread.last_message
                          ? `${thread.last_sender === currentUser?.name ? d.you : thread.last_sender}: ${thread.last_message}`
                          : d.lastMsg}
                      </span>
                      {thread.unread_count > 0 && (
                        <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 12, flexShrink: 0 }}>
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
