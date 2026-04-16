import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import styles from './enterprise.module.css';

const LS_USER_KEY = 'tal_user';

export default function Enterprise() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [keys, setKeys] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null); // shown once after generation
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        loadKeys(user.token);
      } catch { localStorage.removeItem(LS_USER_KEY); }
    }
  }, []);

  async function loadKeys(token) {
    try {
      const res  = await fetch('/api/apikeys', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setKeys(data.data || []);
    } catch { setKeys([]); }
  }

  async function createKey(e) {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const res  = await fetch('/api/apikeys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to create key'); return; }
      setNewKey(data.key);
      setKeyName('');
      loadKeys(currentUser.token);
      toast.success('API key created. Save it now — it will not be shown again.');
    } catch { toast.error('Network error.'); }
    setCreating(false);
  }

  async function revokeKey(id) {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await fetch(`/api/apikeys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${currentUser.token}` } });
      toast.success('API key revoked.');
      loadKeys(currentUser.token);
    } catch { toast.error('Network error.'); }
  }

  function copyKey() {
    navigator.clipboard.writeText(newKey).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <>
      <Head>
        <title>Enterprise API | Talengineer</title>
        <meta name="description" content="Talengineer Enterprise API — bulk post projects, access rate benchmarks, and manage engineers programmatically." />
      </Head>

      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Enterprise</div>
          <h1>Talengineer API</h1>
          <p>Integrate industrial automation talent sourcing directly into your ERP or procurement system. Bulk post projects, query rate benchmarks, and manage engineers programmatically.</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.main}>
            {/* Key warning banner */}
            {newKey && (
              <div className={styles.keyAlert}>
                <div className={styles.keyAlertTitle}>⚠️ Save your API key — it will not be shown again</div>
                <div className={styles.keyCode}>{newKey}</div>
                <button className={styles.btnCopy} onClick={copyKey}>{copied ? '✓ Copied!' : 'Copy Key'}</button>
                <button className={styles.btnDismiss} onClick={() => setNewKey(null)}>I've saved it, dismiss</button>
              </div>
            )}

            {/* Key management */}
            {currentUser ? (
              <div className={styles.section}>
                <h2>API Keys</h2>
                <p className={styles.sectionDesc}>Keys allow your systems to authenticate to the Talengineer API. Maximum 5 active keys per account.</p>

                <form onSubmit={createKey} className={styles.createForm}>
                  <input
                    type="text"
                    placeholder="Key name (e.g. ERP Integration)"
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    className={styles.input}
                    maxLength={100}
                    required
                  />
                  <button type="submit" className={styles.btnCreate} disabled={creating}>
                    {creating ? 'Creating…' : '+ Create Key'}
                  </button>
                </form>

                {keys === null ? (
                  <div className={styles.keysSkeleton}>
                    {[0,1].map(i => <div key={i} className={styles.keySkeleton} />)}
                  </div>
                ) : keys.length === 0 ? (
                  <div className={styles.empty}>No API keys yet. Create one above.</div>
                ) : (
                  <div className={styles.keysList}>
                    {keys.map(k => (
                      <div key={k.id} className={`${styles.keyRow} ${!k.active ? styles.keyRevoked : ''}`}>
                        <div className={styles.keyInfo}>
                          <div className={styles.keyName}>{k.name}</div>
                          <div className={styles.keyMeta}>{k.key_prefix} · Created {new Date(k.created_at).toLocaleDateString()} {k.last_used ? `· Last used ${new Date(k.last_used).toLocaleDateString()}` : '· Never used'}</div>
                        </div>
                        <div className={styles.keyStatus}>
                          {k.active
                            ? <><span className={styles.badgeActive}>Active</span><button className={styles.btnRevoke} onClick={() => revokeKey(k.id)}>Revoke</button></>
                            : <span className={styles.badgeRevoked}>Revoked</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.signInPrompt}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                <h3>Sign in to manage API keys</h3>
                <p>You need an employer account to access the Enterprise API.</p>
                <Link href="/finance" className={styles.btnSignIn}>Sign In to Dashboard</Link>
              </div>
            )}

            {/* API Docs */}
            <div className={styles.section} style={{ marginTop: 40 }}>
              <h2>API Reference</h2>
              <p className={styles.sectionDesc}>Base URL: <code className={styles.code}>https://talengineer.us/api/enterprise</code></p>
              <p className={styles.sectionDesc}>Authentication: <code className={styles.code}>Authorization: Bearer TE_your_key_here</code></p>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>POST</div>
                <div className={styles.endpointPath}>/enterprise/demands/bulk</div>
                <div className={styles.endpointDesc}>Bulk create up to 50 project demands in one request. Each demand can include optional milestones.</div>
                <div className={styles.codeBlock}>{`// Request body
{
  "demands": [
    {
      "title": "PLC Programming - Siemens S7-1500",
      "description": "Configure and commission 3-line packaging system",
      "budget": "$12,000",
      "region": "Texas, USA",
      "skills": ["PLC", "Siemens TIA Portal", "HMI"],
      "milestones": [
        { "phase_name": "Kickoff & Review", "amount": 3000, "percentage": 0.25 },
        { "phase_name": "Programming", "amount": 6000, "percentage": 0.50 },
        { "phase_name": "Commissioning", "amount": 3000, "percentage": 0.25 }
      ]
    }
  ]
}`}</div>
              </div>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>GET</div>
                <div className={styles.endpointPath}>/enterprise/demands?page=0&limit=20</div>
                <div className={styles.endpointDesc}>List your posted demands with pagination. Returns <code className={styles.code}>total</code> count for paging.</div>
              </div>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>GET</div>
                <div className={styles.endpointPath}>/enterprise/benchmarks</div>
                <div className={styles.endpointDesc}>Rate benchmarks by region. Returns min/avg/median/max rates and engineer count per region.</div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h3>Plan Limits</h3>
              <ul className={styles.limitList}>
                <li><span className={styles.limitCheck}>✓</span> 5 active API keys</li>
                <li><span className={styles.limitCheck}>✓</span> 50 demands per bulk request</li>
                <li><span className={styles.limitCheck}>✓</span> 100 req/15 min rate limit</li>
                <li><span className={styles.limitCheck}>✓</span> Real-time rate benchmarks</li>
                <li><span className={styles.limitCheck}>✓</span> Milestone escrow via API</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>Use Cases</h3>
              <ul className={styles.useCaseList}>
                <li>ERP/SAP integration for field service orders</li>
                <li>Automated project creation from equipment orders</li>
                <li>Budget planning with live rate benchmarks</li>
                <li>Multi-site rollout coordination</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>Need help?</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Contact our enterprise team for custom integrations, volume pricing, or SLA agreements.</p>
              <a href="mailto:enterprise@talengineer.us" className={styles.btnContact}>Contact Enterprise Team</a>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> · <Link href="/rates">Rate Benchmarks</Link> · <Link href="/enterprise">Enterprise API</Link></p>
      </footer>
    </>
  );
}
