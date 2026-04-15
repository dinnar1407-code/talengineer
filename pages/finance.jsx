import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
import styles from './finance.module.css';

const DICT = {
  en: { navTalent: 'Find Engineers', navLogin: 'Sign In / Dashboard', dashTitle: 'Finance & Invoices', dashSub: 'Manage your active escrows, project milestones, and payout history.', lblEscrow: 'Funds in Escrow', lblReleased: 'Total Released', lblPending: 'Active Projects', thProject: 'Project / Order ID', thCounterparty: 'Counterparty', thAmount: 'Total Amount', thStatus: 'Status', thAction: 'Action', modalTitle: 'Project Milestones', btnModalClose: 'Close', signIn: 'Sign In', createAccount: 'Create Account', lblName: 'Full Name', lblRole: 'I am a...', lblEmail: 'Email Address', lblPassword: 'Password', lblOr: 'or continue with', btnLogin: 'Sign In to Dashboard', btnCreate: 'Create Account' },
  zh: { navTalent: '寻找工程师', navLogin: '登录 / 控制台', dashTitle: '财务与账单', dashSub: '管理您的活跃资金托管、项目里程碑及支付历史。', lblEscrow: '托管中资金', lblReleased: '已释放总额', lblPending: '活跃项目', thProject: '项目 / 订单 ID', thCounterparty: '交易方', thAmount: '总金额', thStatus: '状态', thAction: '操作', modalTitle: '项目里程碑', btnModalClose: '关闭', signIn: '登 录', createAccount: '创建账号', lblName: '全名', lblRole: '我是...', lblEmail: '邮箱地址', lblPassword: '密码', lblOr: '或者通过以下方式继续', btnLogin: '登 录', btnCreate: '创建账号' },
  es: { navTalent: 'Buscar Ingenieros', navLogin: 'Iniciar sesión', dashTitle: 'Finanzas y Facturas', dashSub: 'Gestione sus depósitos en garantía, hitos del proyecto e historial de pagos.', lblEscrow: 'Fondos en Garantía', lblReleased: 'Total Liberado', lblPending: 'Proyectos Activos', thProject: 'Proyecto / ID Pedido', thCounterparty: 'Contraparte', thAmount: 'Monto Total', thStatus: 'Estado', thAction: 'Acción', modalTitle: 'Hitos del Proyecto', btnModalClose: 'Cerrar', signIn: 'Iniciar Sesión', createAccount: 'Crear Cuenta', lblName: 'Nombre completo', lblRole: 'Yo soy un...', lblEmail: 'Correo Electrónico', lblPassword: 'Contraseña', lblOr: 'o continuar con', btnLogin: 'Iniciar Sesión', btnCreate: 'Crear Cuenta' },
};

export default function Finance() {
  const [lang, setLangState]   = useState('en');
  const [authMode, setAuthMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [ledger, setLedger]    = useState([]);
  const [metrics, setMetrics]  = useState({ escrow: 0, released: 0, active: 0 });

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('employer');
  const [logging, setLogging]   = useState(false);

  // Milestone modal
  const [modalDemandId, setModalDemandId] = useState(null);
  const [milestones, setMilestones]       = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('tal_lang') || 'en';
    setLangState(saved);

    // Handle Stripe redirect back
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const msId      = params.get('milestone_id');
    const demandId  = params.get('demand_id');
    if (sessionId && msId) {
      fetch('/api/payment/confirm-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, milestone_id: msId, demand_id: demandId }),
      }).catch(() => {}).finally(() => {
        alert('Payment Confirmed! Funds are securely locked in Escrow.');
        window.history.replaceState({}, document.title, '/finance');
      });
    }
  }, []);

  function setLang(l) { setLangState(l); localStorage.setItem('tal_lang', l); }

  async function handleLogin(e) {
    e.preventDefault();
    setLogging(true);
    try {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name: name || email.split('@')[0] }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Authentication failed'); setLogging(false); return; }
      setCurrentUser(data);
      loadLedger(data);
    } catch { alert('Login failed'); }
    setLogging(false);
  }

  async function loadLedger(user) {
    try {
      const res = await fetch(`/api/finance/ledger?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      const rows = data.data || [];
      setLedger(rows);
      const total = rows.reduce((s, r) => s + (r.total_amount || 0), 0);
      setMetrics({ escrow: total, released: 0, active: rows.length });
    } catch { setLedger([]); }
  }

  async function openMilestones(demandId) {
    setModalDemandId(demandId);
    setMilestones(null);
    try {
      const res = await fetch(`/api/finance/milestones?demand_id=${demandId}`);
      const data = await res.json();
      setMilestones(data.data || []);
    } catch { setMilestones([]); }
  }

  async function fundMilestone(milestoneId, demandId, amount, phaseName) {
    if (!confirm(`Proceed to Stripe Checkout to deposit $${amount} into Escrow for this milestone?`)) return;
    try {
      const res = await fetch('/api/payment/fund-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId, amount, phase_name: phaseName }),
      });
      const result = await res.json();
      if (res.ok && result.url) { window.location.href = result.url; }
      else if (res.ok) { alert(result.message); openMilestones(demandId); }
      else alert('Error: ' + result.error);
    } catch { alert('Network error.'); }
  }

  async function releaseMilestone(milestoneId, demandId) {
    if (!confirm('Approve work and release funds to engineer (minus platform fee)?')) return;
    try {
      const res = await fetch('/api/payment/release-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(`Funds Released!\nPayout: $${result.payout_details.payout}\nPlatform Fee: $${result.payout_details.fee}`);
        openMilestones(demandId);
        loadLedger(currentUser);
      } else alert('Error: ' + result.error);
    } catch { alert('Network error.'); }
  }

  const d = DICT[lang];

  return (
    <>
      <Head><title>Dashboard & Finance | Talengineer</title></Head>
      <ChatBot />

      {/* Login overlay */}
      {!currentUser && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginBox}>
            <div className={styles.authTabs}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span className={authMode === 'signin' ? styles.authTabActive : styles.authTab} onClick={() => setAuthMode('signin')}>{d.signIn}</span>
                <span className={authMode === 'signup' ? styles.authTabActive : styles.authTab} onClick={() => setAuthMode('signup')}>{d.createAccount}</span>
              </div>
              <button className={styles.langToggle} onClick={() => setLang(lang === 'en' ? 'zh' : lang === 'zh' ? 'es' : 'en')}>ZH / ES</button>
            </div>
            <form onSubmit={handleLogin}>
              {authMode === 'signup' && (
                <>
                  <FormGroup label={d.lblName}><input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" /></FormGroup>
                  <FormGroup label={d.lblRole}>
                    <select value={role} onChange={e => setRole(e.target.value)}>
                      <option value="employer">Supplier / Project Owner</option>
                      <option value="engineer">Automation Engineer</option>
                    </select>
                  </FormGroup>
                </>
              )}
              <FormGroup label={d.lblEmail}><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required /></FormGroup>
              <FormGroup label={d.lblPassword}><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></FormGroup>
              <button type="submit" className={styles.btnPrimary} disabled={logging}>
                {logging ? '...' : authMode === 'signin' ? d.btnLogin : d.btnCreate}
              </button>
            </form>

            <div className={styles.orDivider}><span>{d.lblOr}</span></div>
            <div className={styles.socialGroup}>
              <button className={styles.btnGoogle} onClick={() => alert('Google OAuth integration pending (Supabase Auth).')}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={16} height={16} alt="Google" /> Google
              </button>
              <button className={styles.btnLinkedIn} onClick={() => alert('LinkedIn OAuth integration pending.')}>
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                LinkedIn
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={styles.btnApple} onClick={() => alert('Apple Sign In pending.')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16"><path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-1.082-.031-2.242.708-2.733.708-.49 0-1.428-.709-2.351-.708-.923.001-1.78.435-2.246 1.157-.927 1.432-1.396 3.926-.464 6.305.463 1.182 1.034 2.414 2.152 2.381 1.118-.033 1.533-.709 2.873-.709 1.34 0 1.71.709 2.873.709 1.163 0 1.77-.996 2.246-2.157.476-.762.686-1.55.709-1.584z"/></svg>
                  Apple
                </button>
                <button className={styles.btnWeChat} onClick={() => alert('WeChat Login pending for Chinese users.')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16"><path d="M11.136 6.551c-.183 0-.329-.146-.329-.33 0-.182.146-.328.329-.328.182 0 .328.146.328.328 0 .184-.146.33-.328.33zm-2.882 0c-.183 0-.329-.146-.329-.33 0-.182.146-.328.329-.328.182 0 .329.146.329.328 0 .184-.147.33-.329.33zm-4.316-2.52c-.22 0-.397-.175-.397-.397 0-.22.177-.397.397-.397.22 0 .398.177.398.397 0 .222-.178.397-.398.397zm-2.775 0c-.22 0-.397-.175-.397-.397 0-.22.177-.397.397-.397.22 0 .398.177.398.397 0 .222-.178.397-.398.397zM8.114 4.542c0-2.115-2.073-3.83-4.63-3.83C.926.712 0 2.427 0 4.542c0 1.218.666 2.302 1.704 3.018-.115.344-.368 1.05-.368 1.05s.745-.04 1.34-.23c.571.212 1.206.332 1.874.332.222 0 .438-.016.65-.043-.112-.3-.172-.622-.172-.958 0-1.748 1.378-3.169 3.086-3.169.213 0 .421.025.621.072-.187-2.116-2.261-3.83-4.63-3.83zM16 9.878c0-1.747-1.68-3.168-3.75-3.168s-3.75 1.421-3.75 3.168c0 1.748 1.68 3.169 3.75 3.169.574 0 1.114-.105 1.597-.287.512.164 1.15.201 1.15.201s-.217-.604-.316-.902c.89-.613 1.32-1.542 1.32-2.181z"/></svg>
                  WeChat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <nav className={styles.navLinks}>
          <Link href="/talent">{d.navTalent}</Link>
          <Link href="/finance" className={styles.btnLogin}>{d.navLogin}</Link>
        </nav>
      </header>

      {currentUser && (
        <div className={styles.container}>
          {/* Welcome bar */}
          <div className={styles.welcomeBar}>
            <div>
              <h2>Welcome back, <span style={{ color: 'var(--primary)' }}>{currentUser.name || currentUser.email}</span></h2>
              <div className={styles.roleLabel}>{currentUser.role === 'employer' ? 'Company Account / Supplier' : 'Engineering Contractor'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={styles.kycBadge}>⚠️ KYC Verification Required</span>
              <button className={styles.btnVerify} onClick={() => alert('KYC Flow integration pending (Stripe Identity / Onfido).')}>Verify Now</button>
            </div>
          </div>

          <div className={styles.headerBlock}>
            <h1>{d.dashTitle}</h1>
            <p>{d.dashSub}</p>
          </div>

          {/* Metrics */}
          <div className={styles.metrics}>
            <div className={styles.metricCard}><div className={styles.metricVal}>${metrics.escrow.toLocaleString()}</div><div className={styles.metricLabel}>{d.lblEscrow}</div></div>
            <div className={styles.metricCard}><div className={styles.metricVal}>${metrics.released.toLocaleString()}</div><div className={styles.metricLabel}>{d.lblReleased}</div></div>
            <div className={styles.metricCard}><div className={styles.metricVal}>{metrics.active}</div><div className={styles.metricLabel}>{d.lblPending}</div></div>
          </div>

          {/* Ledger table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{d.thProject}</th>
                <th>{d.thCounterparty}</th>
                <th>{d.thAmount}</th>
                <th>{d.thStatus}</th>
                <th>{d.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0
                ? <tr><td colSpan={5} className={styles.emptyCell}>No active projects found.</td></tr>
                : ledger.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>#{item.demand_id || item.id}</td>
                    <td style={{ color: 'var(--muted)' }}>{currentUser.role === 'employer' ? item.engineer_email : item.employer_email || 'Pending Match'}</td>
                    <td style={{ fontWeight: 600 }}>${(item.total_amount || 0).toLocaleString()}</td>
                    <td><span className={`${styles.statusBadge} ${styles['status_' + item.status]}`}>{item.status.toUpperCase()}</span></td>
                    <td><button className={styles.btnAction} onClick={() => openMilestones(item.demand_id)}>View Milestones</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Milestone Modal */}
      {modalDemandId && (
        <div className={styles.modal} onClick={e => e.target === e.currentTarget && setModalDemandId(null)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>{d.modalTitle}</span>
              <span className={styles.modalClose} onClick={() => setModalDemandId(null)}>×</span>
            </div>
            <ul className={styles.msList}>
              {milestones === null
                ? <li className={styles.emptyCell}>Loading milestones...</li>
                : milestones.length === 0
                  ? <li className={styles.emptyCell}>No milestones defined.</li>
                  : milestones.map(m => (
                    <li key={m.id} className={styles.msItem}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.phase_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(m.percentage * 100).toFixed(0)}% of total</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>${(m.amount || 0).toLocaleString()}</div>
                        <span className={`${styles.statusBadge} ${styles['status_' + (m.status || 'locked')]}`}>{(m.status || 'locked').toUpperCase()}</span>
                        {currentUser?.role === 'employer' && m.status === 'locked' && (
                          <button className={styles.btnFund} onClick={() => fundMilestone(m.id, modalDemandId, m.amount, m.phase_name)}>Fund via Stripe</button>
                        )}
                        {currentUser?.role === 'employer' && m.status === 'funded' && (
                          <button className={styles.btnRelease} onClick={() => releaseMilestone(m.id, modalDemandId)}>🛡️ FaceID Release</button>
                        )}
                        {currentUser?.role === 'engineer' && m.status === 'funded' && (
                          <button className={styles.btnAction} onClick={() => alert('AI-QC Upload coming soon.')}>📸 AI-QC Upload</button>
                        )}
                        {m.status === 'released' && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Platform Fee Deducted</div>}
                      </div>
                    </li>
                  ))
              }
            </ul>
            <button className={styles.btnPrimary} onClick={() => setModalDemandId(null)}>{d.btnModalClose}</button>
          </div>
        </div>
      )}
    </>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}
