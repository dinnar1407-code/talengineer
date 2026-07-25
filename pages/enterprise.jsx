import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';
import { useLang } from '../hooks/useLang';
// 九语 UI 字典已抽到 lib/i18n/enterprise.js（2026-07-24 原样搬移），页面只管合并兜底与渲染
import { DICT } from '../lib/i18n/enterprise';
import styles from './enterprise.module.css';

const LS_USER_KEY = 'tal_user';

export default function Enterprise() {
  const toast = useToast();
  const [lang, setLang] = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  const [keys, setKeys] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null); // shown once after generation
  const [copied, setCopied] = useState(false);
  const [webhookInputs, setWebhookInputs] = useState({}); // { [keyId]: url草稿 }
  const [webhookBusyId, setWebhookBusyId] = useState(null); // 正在保存的 key id
  const [webhookSecret, setWebhookSecret] = useState(null); // 生成后仅展示一次的签名密钥
  const [secretCopied, setSecretCopied] = useState(false);

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

  // 为某个 key 配置 webhook：PUT /api/apikeys/:id/webhook，成功后拿到明文签名密钥（仅一次）。
  async function saveWebhook(id) {
    const url = (webhookInputs[id] || '').trim();
    if (!url) return;
    setWebhookBusyId(id);
    try {
      const res  = await fetch(`/api/apikeys/${id}/webhook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ webhook_url: url }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save webhook'); return; }
      setWebhookSecret(data.webhook_secret); // 明文密钥仅本次返回，弹横幅让用户立即保存
      setWebhookInputs(prev => ({ ...prev, [id]: '' }));
      loadKeys(currentUser.token);
      toast.success('Webhook saved. Copy the signing secret now — it will not be shown again.');
    } catch { toast.error('Network error.'); }
    setWebhookBusyId(null);
  }

  function copySecret() {
    navigator.clipboard.writeText(webhookSecret).then(() => { setSecretCopied(true); setTimeout(() => setSecretCopied(false), 2000); });
  }

  // 以英文为兜底底座合并当前语言：新加的 webhook 文案只补了 en/zh，
  // 其它语言缺失的键会自动回退英文，避免界面出现 undefined。
  const d = { ...DICT.en, ...(DICT[lang] || {}) };

  return (
    <>
      <Head>
        <title>Enterprise API | Talengineer</title>
        <meta name="description" content="Talengineer Enterprise API — bulk post projects, access rate benchmarks, and manage engineers programmatically." />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.main}>
            {/* Key warning banner */}
            {newKey && (
              <div className={styles.keyAlert}>
                <div className={styles.keyAlertTitle}>{d.alertTitle}</div>
                <div className={styles.keyCode}>{newKey}</div>
                <button className={styles.btnCopy} onClick={copyKey}>{copied ? d.copied : d.copyBtn}</button>
                <button className={styles.btnDismiss} onClick={() => setNewKey(null)}>{d.dismissBtn}</button>
              </div>
            )}

            {/* Webhook signing-secret banner —— 明文仅一次，语义同 API key 生成 */}
            {webhookSecret && (
              <div className={styles.keyAlert}>
                <div className={styles.keyAlertTitle}>{d.webhookSecretTitle}</div>
                <div className={styles.keyCode}>{webhookSecret}</div>
                <button className={styles.btnCopy} onClick={copySecret}>{secretCopied ? d.copied : d.copyBtn}</button>
                <button className={styles.btnDismiss} onClick={() => setWebhookSecret(null)}>{d.dismissBtn}</button>
              </div>
            )}

            {/* Key management — 仅企业/雇主(employer)与 admin 可见；普通工程师走下方"需雇主账户"提示 */}
            {currentUser && (currentUser.role === 'employer' || currentUser.role === 'admin') ? (
              <div className={styles.section}>
                <h2>{d.keysTitle}</h2>
                <p className={styles.sectionDesc}>{d.keysDesc}</p>

                <form onSubmit={createKey} className={styles.createForm}>
                  <input
                    type="text"
                    placeholder={d.keyNamePlaceholder}
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    className={styles.input}
                    maxLength={100}
                    required
                  />
                  <button type="submit" className={styles.btnCreate} disabled={creating}>
                    {creating ? d.creating : d.createBtn}
                  </button>
                </form>

                {keys === null ? (
                  <div className={styles.keysSkeleton}>
                    {[0,1].map(i => <div key={i} className={styles.keySkeleton} />)}
                  </div>
                ) : keys.length === 0 ? (
                  <div className={styles.empty}>{d.noKeys}</div>
                ) : (
                  <div className={styles.keysList}>
                    {keys.map(k => (
                      <div key={k.id}>
                        <div className={`${styles.keyRow} ${!k.active ? styles.keyRevoked : ''}`}>
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

                        {/* Webhook 配置（仅有效 key）：显示当前地址 + 设置/更新入口 */}
                        {k.active && (
                          <div style={{ padding: '8px 14px 14px', marginTop: -6, marginBottom: 10, fontSize: 13, color: 'var(--muted)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                              <span>
                                <strong style={{ color: 'var(--text)' }}>{d.webhookLabel}</strong>{' · '}
                                {k.webhook_url
                                  ? <span style={{ color: 'var(--text)' }}>{d.webhookConfigured}: <code style={{ wordBreak: 'break-all' }}>{k.webhook_url}</code></span>
                                  : d.webhookNone}
                              </span>
                              <Link href="/developers" style={{ color: 'var(--primary)', fontSize: 12 }}>{d.webhookDocs}</Link>
                            </div>
                            <div style={{ marginBottom: 6 }}>{d.webhookDesc}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <input
                                type="url"
                                placeholder={d.webhookPlaceholder}
                                value={webhookInputs[k.id] || ''}
                                onChange={e => setWebhookInputs(prev => ({ ...prev, [k.id]: e.target.value }))}
                                className={styles.input}
                                style={{ flex: 1, minWidth: 220 }}
                              />
                              <button
                                type="button"
                                className={styles.btnCreate}
                                disabled={webhookBusyId === k.id || !(webhookInputs[k.id] || '').trim()}
                                onClick={() => saveWebhook(k.id)}
                              >
                                {webhookBusyId === k.id ? d.webhookSaving : d.webhookSetBtn}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.signInPrompt}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                <h3>{d.signInTitle}</h3>
                <p>{d.signInDesc}</p>
                <Link href="/finance" className={styles.btnSignIn}>{d.signInBtn}</Link>
              </div>
            )}

            {/* API Docs */}
            <div className={styles.section} style={{ marginTop: 40 }}>
              <h2>{d.apiRefTitle}</h2>
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
              <h3>{d.planTitle}</h3>
              <ul className={styles.limitList}>
                <li><span className={styles.limitCheck}>✓</span> 5 active API keys</li>
                <li><span className={styles.limitCheck}>✓</span> 50 demands per bulk request</li>
                <li><span className={styles.limitCheck}>✓</span> 100 req/15 min rate limit</li>
                <li><span className={styles.limitCheck}>✓</span> Real-time rate benchmarks</li>
                <li><span className={styles.limitCheck}>✓</span> Milestone escrow via API</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>{d.useCaseTitle}</h3>
              <ul className={styles.useCaseList}>
                <li>ERP/SAP integration for field service orders</li>
                <li>Automated project creation from equipment orders</li>
                <li>Budget planning with live rate benchmarks</li>
                <li>Multi-site rollout coordination</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>{d.helpTitle}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{d.helpDesc}</p>
              <a href="mailto:enterprise@talengineer.us" className={styles.btnContact}>{d.contactBtn}</a>
            </div>
          </div>
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </>
  );
}
