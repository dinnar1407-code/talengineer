import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';
import styles from './finance.module.css';

const DICT = {
  en: { navTalent: 'Find Engineers', navLogin: 'Sign In / Dashboard', dashTitle: 'Finance & Invoices', dashSub: 'Manage your active escrows, project milestones, and payout history.', lblEscrow: 'Funds in Escrow', lblReleased: 'Total Released', lblPending: 'Active Projects', thProject: 'Project / Order ID', thCounterparty: 'Counterparty', thAmount: 'Total Amount', thStatus: 'Status', thAction: 'Action', modalTitle: 'Project Milestones', btnModalClose: 'Close', signIn: 'Sign In', createAccount: 'Create Account', lblName: 'Full Name', lblRole: 'I am a...', lblEmail: 'Email Address', lblPassword: 'Password', lblOr: 'or continue with', btnLogin: 'Sign In to Dashboard', btnCreate: 'Create Account', logout: 'Sign Out' },
  zh: { navTalent: '寻找工程师', navLogin: '登录 / 控制台', dashTitle: '财务与账单', dashSub: '管理您的活跃资金托管、项目里程碑及支付历史。', lblEscrow: '托管中资金', lblReleased: '已释放总额', lblPending: '活跃项目', thProject: '项目 / 订单 ID', thCounterparty: '交易方', thAmount: '总金额', thStatus: '状态', thAction: '操作', modalTitle: '项目里程碑', btnModalClose: '关闭', signIn: '登 录', createAccount: '创建账号', lblName: '全名', lblRole: '我是...', lblEmail: '邮箱地址', lblPassword: '密码', lblOr: '或者通过以下方式继续', btnLogin: '登 录', btnCreate: '创建账号', logout: '退出登录' },
  es: { navTalent: 'Buscar Ingenieros', navLogin: 'Iniciar sesión', dashTitle: 'Finanzas y Facturas', dashSub: 'Gestione sus depósitos en garantía, hitos del proyecto e historial de pagos.', lblEscrow: 'Fondos en Garantía', lblReleased: 'Total Liberado', lblPending: 'Proyectos Activos', thProject: 'Proyecto / ID Pedido', thCounterparty: 'Contraparte', thAmount: 'Monto Total', thStatus: 'Estado', thAction: 'Acción', modalTitle: 'Hitos del Proyecto', btnModalClose: 'Cerrar', signIn: 'Iniciar Sesión', createAccount: 'Crear Cuenta', lblName: 'Nombre completo', lblRole: 'Yo soy un...', lblEmail: 'Correo Electrónico', lblPassword: 'Contraseña', lblOr: 'o continuar con', btnLogin: 'Iniciar Sesión', btnCreate: 'Crear Cuenta', logout: 'Cerrar sesión' },
};

const LS_USER_KEY = 'tal_user';

export default function Finance() {
  const toast = useToast();
  const [lang, setLangState]        = useState('en');
  const [authMode, setAuthMode]     = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [ledger, setLedger]         = useState(null); // null = loading
  const [metrics, setMetrics]       = useState({ escrow: 0, released: 0, active: 0 });

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('employer');
  const [logging, setLogging]   = useState(false);

  // Role selection modal (for Google OAuth users)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState(null);
  const [oauthRole, setOauthRole] = useState('employer');

  // Milestone modal
  const [modalDemandId, setModalDemandId] = useState(null);
  const [milestones, setMilestones]       = useState(null);

  // Stripe Connect (engineers)
  const [connectStatus, setConnectStatus] = useState(null); // null | 'not_connected' | 'pending' | 'active'
  const [connecting, setConnecting]       = useState(false);

  // Applicants modal (employers)
  const [applicantsDemandId, setApplicantsDemandId] = useState(null);
  const [applicants, setApplicants]                 = useState(null);
  const [assigning, setAssigning]                   = useState(null);

  // Dispute
  const [openingDispute, setOpeningDispute] = useState(null); // milestoneId
  const [disputeReason, setDisputeReason]   = useState('');
  const [filingDispute, setFilingDispute]   = useState(false);

  // Forgot password
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tal_lang') || 'en';
    setLangState(saved);

    // ── Restore session from localStorage (email/password login) ─────────────
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        loadLedger(user);
      } catch { localStorage.removeItem(LS_USER_KEY); }
    }

    // ── Handle Stripe Connect redirect back ──────────────────────────────────
    const connectParam = new URLSearchParams(window.location.search).get('connect');
    if (connectParam === 'success') {
      toast.success('Stripe Connect setup complete! You can now receive payouts.');
      window.history.replaceState({}, document.title, '/finance');
    } else if (connectParam === 'refresh') {
      toast.info('Stripe Connect setup interrupted. Please try again.');
      window.history.replaceState({}, document.title, '/finance');
    }

    // ── Handle Stripe redirect back ───────────────────────────────────────────
    const params    = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const msId      = params.get('milestone_id');
    const demandId  = params.get('demand_id');
    if (sessionId && msId) {
      fetch('/api/payment/confirm-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, milestone_id: msId, demand_id: demandId }),
      }).catch(() => {}).finally(() => {
        toast.success('Payment confirmed! Funds are securely locked in Escrow.');
        window.history.replaceState({}, document.title, '/finance');
      });
    }

    // ── Supabase OAuth session ────────────────────────────────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !stored) handleOAuthUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleOAuthUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleOAuthUser(user) {
    // Check if we already have a role stored for this OAuth user
    const storedRole = localStorage.getItem(`tal_role_${user.email}`);
    if (storedRole) {
      const userData = buildOAuthUser(user, storedRole);
      persistAndSet(userData);
    } else {
      // First time OAuth login → ask for role
      setPendingOAuthUser(user);
      setShowRoleModal(true);
    }
  }

  function confirmOAuthRole() {
    const userData = buildOAuthUser(pendingOAuthUser, oauthRole);
    localStorage.setItem(`tal_role_${pendingOAuthUser.email}`, oauthRole);
    persistAndSet(userData);
    setShowRoleModal(false);
    setPendingOAuthUser(null);
  }

  function buildOAuthUser(user, roleVal) {
    return { email: user.email, name: user.user_metadata?.full_name || user.email.split('@')[0], role: roleVal };
  }

  function persistAndSet(userData) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
    setCurrentUser(userData);
    loadLedger(userData);
    if (userData.role === 'engineer' && userData.token) loadConnectStatus(userData.token);
  }

  function setLang(l) { setLangState(l); localStorage.setItem('tal_lang', l); }

  async function handleLogin(e) {
    e.preventDefault();
    setLogging(true);
    try {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role, name: name || email.split('@')[0] }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Authentication failed'); setLogging(false); return; }
      persistAndSet(data);
      toast.success(`Welcome${authMode === 'signup' ? '' : ' back'}, ${data.name || data.email}!`);
      // New engineers → onboarding
      if (authMode === 'signup' && data.role === 'engineer') {
        setTimeout(() => { window.location.href = '/onboarding'; }, 800);
      }
    } catch { toast.error('Login failed. Please try again.'); }
    setLogging(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    setCurrentUser(null);
    setLedger(null);
    setMetrics({ escrow: 0, released: 0, active: 0 });
    toast.info('Signed out.');
  }

  async function loadConnectStatus(token) {
    try {
      const res  = await fetch('/api/payment/connect/status', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setConnectStatus(data.status || 'not_connected');
    } catch { setConnectStatus('not_connected'); }
  }

  async function startConnect() {
    if (!currentUser?.token) { toast.error('Please sign in first.'); return; }
    setConnecting(true);
    try {
      const res  = await fetch('/api/payment/connect/onboard', { method: 'POST', headers: { Authorization: `Bearer ${currentUser.token}` } });
      const data = await res.json();
      if (res.ok && data.url) { window.location.href = data.url; }
      else toast.error(data.error || 'Failed to start Stripe setup.');
    } catch { toast.error('Network error.'); }
    setConnecting(false);
  }

  async function loadApplicants(demandId) {
    setApplicantsDemandId(demandId);
    setApplicants(null);
    try {
      const res  = await fetch(`/api/demand/${demandId}/applications`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      const data = await res.json();
      setApplicants(data.data || []);
    } catch { setApplicants([]); toast.error('Failed to load applications.'); }
  }

  async function assignEngineer(demandId, engineerId) {
    setAssigning(engineerId);
    try {
      const res  = await fetch('/api/demand/assign', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` }, body: JSON.stringify({ demand_id: demandId, engineer_id: engineerId }) });
      const data = await res.json();
      if (res.ok) {
        toast.success('Engineer assigned! Email notification sent.');
        setApplicants(prev => prev.map(a => ({ ...a, status: a.talents?.id === engineerId ? 'accepted' : a.status === 'pending' ? 'rejected' : a.status })));
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setAssigning(null);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    try {
      await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail }) });
      setForgotSent(true);
    } catch { toast.error('Network error.'); }
  }

  async function loadLedger(user) {
    setLedger(null); // show skeleton
    try {
      const res  = await fetch(`/api/finance/ledger?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      const rows = data.data || [];
      setLedger(rows);
      const total = rows.reduce((s, r) => s + (r.total_amount || 0), 0);
      setMetrics({ escrow: total, released: 0, active: rows.length });
    } catch { setLedger([]); toast.error('Failed to load ledger.'); }
  }

  async function openMilestones(demandId) {
    setModalDemandId(demandId);
    setMilestones(null);
    try {
      const res  = await fetch(`/api/finance/milestones?demand_id=${demandId}`);
      const data = await res.json();
      setMilestones(data.data || []);
    } catch { setMilestones([]); toast.error('Failed to load milestones.'); }
  }

  async function fundMilestone(milestoneId, demandId, amount, phaseName) {
    if (!window.confirm(`Proceed to Stripe Checkout to deposit $${amount} into Escrow?`)) return;
    try {
      const res    = await fetch('/api/payment/fund-milestone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId, amount, phase_name: phaseName }) });
      const result = await res.json();
      if (res.ok && result.url) { window.location.href = result.url; }
      else if (res.ok) { toast.success(result.message); openMilestones(demandId); }
      else toast.error(result.error);
    } catch { toast.error('Network error.'); }
  }

  async function openDispute(e) {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setFilingDispute(true);
    try {
      const res  = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser?.token}` },
        body: JSON.stringify({ milestone_id: openingDispute, demand_id: modalDemandId, reason: disputeReason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Dispute filed. Our team will review within 48 hours.');
        setOpeningDispute(null);
        setDisputeReason('');
        openMilestones(modalDemandId);
      } else {
        toast.error(data.error || 'Failed to open dispute.');
      }
    } catch { toast.error('Network error.'); }
    setFilingDispute(false);
  }

  async function releaseMilestone(milestoneId, demandId) {
    if (!window.confirm('Approve work and release funds to engineer (minus platform fee)?')) return;
    try {
      const res    = await fetch('/api/payment/release-milestone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId }) });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Funds released! Payout: $${result.payout_details.engineer_payout} | Fee: $${result.payout_details.platform_fee}`);
        openMilestones(demandId);
        loadLedger(currentUser);
      } else toast.error(result.error);
    } catch { toast.error('Network error.'); }
  }

  const d = DICT[lang];

  return (
    <>
      <Head><title>Dashboard & Finance | Talengineer</title></Head>
      <ChatBot />

      {/* ── Role selection modal for first-time Google OAuth users ── */}
      {showRoleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.roleModal}>
            <h2>Welcome! I am a…</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Please select your role to continue.</p>
            <div className={styles.roleOptions}>
              {[['employer', '🏭', 'Supplier / Project Owner', 'I have equipment that needs installation or maintenance'], ['engineer', '🔧', 'Automation Engineer', 'I am a local engineer looking for projects']].map(([val, icon, title, desc]) => (
                <div key={val} className={`${styles.roleCard} ${oauthRole === val ? styles.roleCardActive : ''}`} onClick={() => setOauthRole(val)}>
                  <div style={{ fontSize: 32 }}>{icon}</div>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
            <button className={styles.btnPrimary} onClick={confirmOAuthRole}>Continue</button>
          </div>
        </div>
      )}

      {/* ── Login overlay ── */}
      {!currentUser && !showRoleModal && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginBox}>
            <div className={styles.authTabs}>
              <div style={{ display: 'flex', gap: 16 }}>
                <span className={authMode === 'signin' ? styles.authTabActive : styles.authTab} onClick={() => setAuthMode('signin')}>{d.signIn}</span>
                <span className={authMode === 'signup' ? styles.authTabActive : styles.authTab} onClick={() => setAuthMode('signup')}>{d.createAccount}</span>
              </div>
              <button className={styles.langToggle} onClick={() => setLang(lang === 'en' ? 'zh' : lang === 'zh' ? 'es' : 'en')}>ZH / ES</button>
            </div>
            {showForgotPw ? (
              forgotSent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
                  <p>Check your email for a reset link.</p>
                  <button className={styles.btnPrimary} onClick={() => { setShowForgotPw(false); setForgotSent(false); }}>Back to Sign In</button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>Enter your email and we'll send a reset link.</p>
                  <FormGroup label="Email Address">
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" required />
                  </FormGroup>
                  <button type="submit" className={styles.btnPrimary}>Send Reset Link</button>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', width: '100%', marginTop: 12, fontSize: 13 }} onClick={() => setShowForgotPw(false)}>← Back to Sign In</button>
                </form>
              )
            ) : (
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
                <button type="submit" className={styles.btnPrimary} disabled={logging}>{logging ? '...' : authMode === 'signin' ? d.btnLogin : d.btnCreate}</button>
                {authMode === 'signin' && (
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', width: '100%', marginTop: 10, fontSize: 13 }} onClick={() => setShowForgotPw(true)}>Forgot password?</button>
                )}
              </form>
            )}

            <div className={styles.orDivider}><span>{d.lblOr}</span></div>
            <div className={styles.socialGroup}>
              <button className={styles.btnGoogle} onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + '/finance' } })}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={16} height={16} alt="Google" /> Google
              </button>
              <button className={styles.btnLinkedIn} onClick={() => toast.info('LinkedIn OAuth integration pending.')}>
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                LinkedIn
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={styles.btnApple} onClick={() => toast.info('Apple Sign In pending.')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16"><path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-1.082-.031-2.242.708-2.733.708-.49 0-1.428-.709-2.351-.708-.923.001-1.78.435-2.246 1.157-.927 1.432-1.396 3.926-.464 6.305.463 1.182 1.034 2.414 2.152 2.381 1.118-.033 1.533-.709 2.873-.709 1.34 0 1.71.709 2.873.709 1.163 0 1.77-.996 2.246-2.157.476-.762.686-1.55.709-1.584z"/></svg>
                  Apple
                </button>
                <button className={styles.btnWeChat} onClick={() => toast.info('WeChat Login pending.')}>
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
          {currentUser
            ? <button className={styles.btnLogout} onClick={handleLogout}>{d.logout}</button>
            : <Link href="/finance" className={styles.btnLogin}>{d.navLogin}</Link>
          }
        </nav>
      </header>

      {currentUser && (
        <div className={styles.container}>
          <div className={styles.welcomeBar}>
            <div>
              <h2>Welcome back, <span style={{ color: 'var(--primary)' }}>{currentUser.name || currentUser.email}</span></h2>
              <div className={styles.roleLabel}>{currentUser.role === 'employer' ? 'Company Account / Supplier' : 'Engineering Contractor'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={styles.kycBadge}>⚠️ KYC Verification Required</span>
              <button className={styles.btnVerify} onClick={() => toast.info('KYC Flow integration pending (Stripe Identity / Onfido).')}>Verify Now</button>
            </div>
          </div>

          <div className={styles.headerBlock}>
            <h1>{d.dashTitle}</h1>
            <p>{d.dashSub}</p>
          </div>

          {/* ── Stripe Connect Banner (engineers only) ── */}
          {currentUser.role === 'engineer' && connectStatus && connectStatus !== 'active' && (
            <div style={{ background: connectStatus === 'pending' ? 'rgba(244,196,48,0.08)' : 'rgba(0,86,179,0.06)', border: `1px solid ${connectStatus === 'pending' ? 'rgba(244,196,48,0.3)' : 'rgba(0,86,179,0.2)'}`, borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {connectStatus === 'pending' ? '⏳ Stripe Payout Setup Incomplete' : '💳 Set Up Stripe Payout Account'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {connectStatus === 'pending' ? 'Please complete your Stripe account setup to receive milestone payments.' : 'Connect Stripe to receive escrow payouts when milestones are released.'}
                </div>
              </div>
              <button onClick={startConnect} disabled={connecting} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {connecting ? 'Redirecting…' : connectStatus === 'pending' ? 'Complete Setup' : 'Connect Stripe'}
              </button>
            </div>
          )}

          {/* Metrics */}
          <div className={styles.metrics}>
            {ledger === null
              ? [0, 1, 2].map(i => <div key={i} className={styles.metricCardSkeleton} />)
              : (
                <>
                  <div className={styles.metricCard}><div className={styles.metricVal}>${metrics.escrow.toLocaleString()}</div><div className={styles.metricLabel}>{d.lblEscrow}</div></div>
                  <div className={styles.metricCard}><div className={styles.metricVal}>${metrics.released.toLocaleString()}</div><div className={styles.metricLabel}>{d.lblReleased}</div></div>
                  <div className={styles.metricCard}><div className={styles.metricVal}>{metrics.active}</div><div className={styles.metricLabel}>{d.lblPending}</div></div>
                </>
              )
            }
          </div>

          {/* Ledger table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{d.thProject}</th><th>{d.thCounterparty}</th><th>{d.thAmount}</th><th>{d.thStatus}</th><th>{d.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {ledger === null
                ? [0, 1, 2].map(i => (
                  <tr key={i}>
                    {[0,1,2,3,4].map(j => <td key={j}><div className={styles.skeletonCell} /></td>)}
                  </tr>
                ))
                : ledger.length === 0
                  ? <tr><td colSpan={5} className={styles.emptyCell}>No active projects found.</td></tr>
                  : ledger.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>#{item.demand_id || item.id}</td>
                      <td style={{ color: 'var(--muted)' }}>{currentUser.role === 'employer' ? item.engineer_email : item.employer_email || 'Pending Match'}</td>
                      <td style={{ fontWeight: 600 }}>${(item.total_amount || 0).toLocaleString()}</td>
                      <td><span className={`${styles.statusBadge} ${styles['status_' + item.status]}`}>{item.status.toUpperCase()}</span></td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className={styles.btnAction} onClick={() => openMilestones(item.demand_id)}>Milestones</button>
                        <a href={`/messages/${item.demand_id}`} className={styles.btnAction} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>💬 Chat</a>
                        {currentUser?.role === 'employer' && <button className={styles.btnAction} style={{ background: '#6b7280' }} onClick={() => loadApplicants(item.demand_id)}>Applicants</button>}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Applicants Modal */}
      {applicantsDemandId && (
        <div className={styles.modal} onClick={e => e.target === e.currentTarget && setApplicantsDemandId(null)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>Applications for #{applicantsDemandId}</span>
              <span className={styles.modalClose} onClick={() => setApplicantsDemandId(null)}>×</span>
            </div>
            {applicants === null
              ? [0,1,2].map(i => <div key={i} className={styles.msItemSkeleton} />)
              : applicants.length === 0
                ? <p className={styles.emptyCell}>No applications yet.</p>
                : applicants.map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {app.talents?.name}
                        {(app.talents?.verified_score || 0) >= 80 && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>🛡️ Verified {app.talents.verified_score}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: app.message ? 6 : 0 }}>
                        {app.talents?.region} · {app.talents?.rate}
                      </div>
                      {app.message && <div style={{ fontSize: 13, fontStyle: 'italic', color: '#374151' }}>{app.message}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                      {app.status === 'accepted'
                        ? <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✅ Assigned</span>
                        : app.status === 'rejected'
                          ? <span style={{ fontSize: 12, color: 'var(--muted)' }}>Declined</span>
                          : <>
                            <a href={`/engineer/${app.talents?.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', border: '1px solid var(--primary)', padding: '4px 10px', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>Profile</a>
                            <button className={styles.btnRelease} disabled={assigning === app.talents?.id} onClick={() => assignEngineer(applicantsDemandId, app.talents?.id)} style={{ margin: 0, fontSize: 12 }}>
                              {assigning === app.talents?.id ? '…' : 'Assign'}
                            </button>
                          </>
                      }
                    </div>
                  </div>
                ))
            }
            <button className={styles.btnPrimary} style={{ marginTop: 16 }} onClick={() => setApplicantsDemandId(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {openingDispute && (
        <div className={styles.modal} onClick={e => e.target === e.currentTarget && setOpeningDispute(null)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>⚠️ Open a Dispute</span>
              <span className={styles.modalClose} onClick={() => setOpeningDispute(null)}>×</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>Funds will be frozen and our team will review within 48–72 hours. Both parties will be asked to submit evidence.</p>
            <form onSubmit={openDispute}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>Reason for Dispute</label>
              <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} required placeholder="Describe the issue clearly — e.g. work not completed, deliverables not met..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text)' }} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={filingDispute} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '11px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{filingDispute ? 'Filing…' : 'File Dispute'}</button>
                <button type="button" onClick={() => setOpeningDispute(null)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', padding: '11px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              </div>
            </form>
          </div>
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
                ? [0,1,2].map(i => <li key={i} className={styles.msItemSkeleton} />)
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
                        {currentUser?.role === 'employer' && m.status === 'locked' && <button className={styles.btnFund} onClick={() => fundMilestone(m.id, modalDemandId, m.amount, m.phase_name)}>Fund via Stripe</button>}
                        {currentUser?.role === 'employer' && m.status === 'funded' && <button className={styles.btnRelease} onClick={() => releaseMilestone(m.id, modalDemandId)}>🛡️ Release Funds</button>}
                        {currentUser?.role === 'engineer' && m.status === 'funded' && <a href={`/workorder/${m.id}`} className={styles.btnAction} style={{ display: 'block', marginTop: 8, textAlign: 'center', textDecoration: 'none', fontSize: 12 }}>📍 Work Order</a>}
                        {['funded', 'completed'].includes(m.status) && <button className={styles.btnAction} style={{ background: '#ef4444', marginTop: 6, fontSize: 11 }} onClick={() => setOpeningDispute(m.id)}>⚠️ Dispute</button>}
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
