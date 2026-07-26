import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ChatBot from '../components/ChatBot';
import Navbar from '../components/Navbar';
import ConsoleShell from '../components/ConsoleShell';
import OfflineBanner from '../components/OfflineBanner';
import { useOfflineData } from '../lib/offline/useOfflineData';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';
import { useLang } from '../hooks/useLang';
import { DICT } from '../lib/i18n/finance';
import { useTheme } from '../hooks/useTheme';
import { DEMO_LEDGER } from '../lib/demoData';
import styles from './finance.module.css';


const LS_USER_KEY = 'tal_user';

export default function Finance() {
  const toast = useToast();
  const [lang, setLang]             = useLang();
  const { theme, setTheme }         = useTheme(); // 深浅主题：登录态套 ConsoleShell 时用
  const [currentUser, setCurrentUser] = useState(null);
  const [ledger, setLedger]         = useState(null); // null = loading
  const [ledgerIsDemo, setLedgerIsDemo] = useState(false); // 真实台账加载完但零条 → 退回 DEMO_LEDGER
  const [myDemands, setMyDemands]   = useState(null); // employer's own projects
  const [metrics, setMetrics]       = useState({ escrow: 0, released: 0, active: 0 });

  // 登录态检查完成标记。localStorage 的恢复在 useEffect 里做，首帧 currentUser 恒为 null——
  // 没有这个标记，已登录用户会在首帧被误判成未登录、直接弹去 /login。
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Milestone modal
  const [modalDemandId, setModalDemandId] = useState(null);
  const [milestones, setMilestones]       = useState(null);

  // Stripe Connect (engineers)
  const [connectStatus, setConnectStatus] = useState(null); // null | 'not_connected' | 'pending' | 'active'
  const [connecting, setConnecting]       = useState(false);
  const [payoutBalance, setPayoutBalance] = useState(null); // { available, pending, instant_available }
  const [instantBusy, setInstantBusy]     = useState(false);

  // Applicants modal (employers)
  const [applicantsDemandId, setApplicantsDemandId] = useState(null);
  const [applicants, setApplicants]                 = useState(null);
  const [assigning, setAssigning]                   = useState(null);

  // Dispute
  const [openingDispute, setOpeningDispute] = useState(null); // milestoneId
  const [disputeReason, setDisputeReason]   = useState('');
  const [filingDispute, setFilingDispute]   = useState(false);

  // KYC
  const [kycInfo, setKycInfo]         = useState(null); // null=loading, {}=loaded
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycForm, setKycForm]         = useState({ company_name: '', company_website: '', company_phone: '' });
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Employer analytics
  const [analytics, setAnalytics] = useState(null);

  // ── 主数据（资金账本）离线镜像：先渲染 IndexedDB 镜像，后台刷新，回网自动重拉。
  //    fetcher 断网/非2xx 会 throw → offline=true 保镜像。本页为「只读镜像」，
  //    离线时资金操作按钮全部禁用（钱路径必须在线的铁律）。
  const ledgerFetch = useCallback(async () => {
    if (!currentUser?.token) return undefined; // 未登录：不拉取，保持 null 骨架屏
    const r = await fetch('/api/finance/ledger', { headers: { Authorization: `Bearer ${currentUser.token}` } });
    if (!r.ok) throw new Error('ledger');
    return (await r.json()).data || [];
  }, [currentUser]);
  const { data: ledgerData, offline: financeOffline, syncedAt: financeSyncedAt, refresh: refreshLedger } = useOfflineData('transactions-fin', ledgerFetch, [currentUser]);
  // 镜像/最新数据到手 → 落 ledger + 重算指标；离线且无镜像 → 空表（收起骨架屏）；
  // 真实台账加载完但零条（新账号/演示账号还没有真实托管记录）→ 退回 DEMO_LEDGER
  // （lib/demoData，与 Dashboard/Projects 页共用同一份 DEMO_PROJECTS 派生，三屏数字对得上），
  // 并打 ledgerIsDemo 供渲染层加「🧪 Demo」徽标、禁用演示行上的操作按钮。
  // DEMO_LEDGER 用 project_milestones 的状态词汇（funded/completed/released/locked），
  // 与真实台账的 pending/released 判据不同源，两段计算分开写，互不影响。
  useEffect(() => {
    if (ledgerData != null) {
      if (ledgerData.length === 0) {
        setLedger(DEMO_LEDGER);
        setLedgerIsDemo(true);
        const escrow   = DEMO_LEDGER.filter(r => ['funded', 'completed'].includes(r.status)).reduce((s, r) => s + (r.total_amount || 0), 0);
        const released = DEMO_LEDGER.filter(r => r.status === 'released').reduce((s, r) => s + (r.total_amount || 0), 0);
        setMetrics({ escrow, released, active: DEMO_LEDGER.length });
      } else {
        setLedger(ledgerData);
        setLedgerIsDemo(false);
        const escrow   = ledgerData.filter(r => r.status === 'pending').reduce((s, r) => s + (r.total_amount || 0), 0);
        const released = ledgerData.filter(r => r.status === 'released').reduce((s, r) => s + (r.total_amount || 0), 0);
        setMetrics({ escrow, released, active: ledgerData.length });
      }
    } else if (financeOffline) {
      setLedger([]);
      setLedgerIsDemo(false);
    }
  }, [ledgerData, financeOffline]);

  useEffect(() => {
    // ── Restore session from localStorage (email/password login) ─────────────
    const stored = localStorage.getItem(LS_USER_KEY);
    let restoredUser = null; // 保存恢复的登录态，供下方 Stripe 回跳确认托管时取 JWT token
    if (stored) {
      try {
        const user = JSON.parse(stored);
        restoredUser = user;
        setCurrentUser(user);
        // 账本由 useOfflineData('transactions-fin') 随 currentUser 变化自动拉取（含离线镜像）
        loadMyDemands(user);
        if (user.token) loadKyc(user.token);
        if (user.role === 'employer' && user.token) loadAnalytics(user.token);
        if (user.role === 'engineer' && user.token) loadConnectStatus(user.token);
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
      // 后端 confirm-funding 已要求雇主 JWT 鉴权，必须带上恢复登录态里的 token
      const token = restoredUser?.token;
      fetch('/api/payment/confirm-funding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id: sessionId, milestone_id: msId, demand_id: demandId }),
      }).then((res) => {
        // 只有后端确认成功才报成功，失败时如实提示待确认，避免谎报托管完成
        if (res.ok) {
          toast.success('Payment confirmed! Funds are securely locked in Escrow.');
        } else {
          toast.error('Payment received, but escrow confirmation is still pending. Please refresh later or contact support.');
        }
      }).catch(() => {
        toast.error('Payment received, but escrow confirmation is still pending. Please refresh later or contact support.');
      }).finally(() => {
        window.history.replaceState({}, document.title, '/finance');
      });
    }

    // OAuth 会话兑换已收敛到 /login（Wave A/A3）：本页只读 localStorage 里的登录态，
    // 不再自己监听 Supabase 会话——那套逻辑同时存在于多个页面正是这次要消掉的重复。
    setAuthChecked(true);
  }, []);

  // 未登录 → 统一登录页。带 next 参数，登录完原路返回本页。
  useEffect(() => {
    if (authChecked && !currentUser) router.replace('/login?next=%2Ffinance');
  }, [authChecked, currentUser, router]);

  function persistAndSet(userData) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
    setCurrentUser(userData);
    // 账本由 useOfflineData('transactions-fin') 随 currentUser 变化自动拉取（含离线镜像）
    loadMyDemands(userData);
    if (userData.role === 'engineer' && userData.token) loadConnectStatus(userData.token);
    if (userData.token) { loadKyc(userData.token); }
    if (userData.role === 'employer' && userData.token) loadAnalytics(userData.token);
  }

  async function loadKyc(token) {
    try {
      const res  = await fetch('/api/kyc/status', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setKycInfo(data.data || {});
    } catch { setKycInfo({}); }
  }

  async function submitKyc(e) {
    e.preventDefault();
    if (!kycForm.company_name.trim()) { toast.error('Company name is required.'); return; }
    setSubmittingKyc(true);
    try {
      const res  = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(kycForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Verification submitted! We\'ll review within 24 hours.');
        setKycInfo(prev => ({ ...prev, kyc_status: 'pending', ...kycForm }));
        setShowKycForm(false);
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setSubmittingKyc(false);
  }

  async function loadAnalytics(token) {
    try {
      const res  = await fetch('/api/demand/analytics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch {}
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
      // 账户已激活 → 顺带拉余额（提现卡用），失败静默（卡片显示占位）
      if (data.status === 'active') {
        fetch('/api/payment/connect/balance', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(b => { if (b.status === 'ok') setPayoutBalance(b); })
          .catch(() => {});
      }
    } catch { setConnectStatus('not_connected'); }
  }

  // 即时提现：Stripe 收 1% 手续费；资格不足后端返回降级文案（标准周期自动到账）
  async function doInstantPayout() {
    const amt = payoutBalance?.instant_available || 0;
    if (!amt || instantBusy) return;
    setInstantBusy(true);
    try {
      const res  = await fetch('/api/payment/connect/instant-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(`Instant payout of $${amt.toFixed(2)} initiated!`); loadConnectStatus(currentUser.token); }
      else toast.info(data.error || 'Instant payout unavailable.');
    } catch { toast.error('Network error.'); }
    setInstantBusy(false);
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

  async function loadMyDemands(user) {
    if (!user?.token || user.role !== 'employer') return;
    try {
      const res  = await fetch('/api/demand/my', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setMyDemands(data.data || []);
    } catch { setMyDemands([]); }
  }

  async function openMilestones(demandId) {
    setModalDemandId(demandId);
    setMilestones(null);
    if (!currentUser?.token) { setMilestones([]); return; }
    try {
      const res  = await fetch(`/api/finance/milestones?demand_id=${demandId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      setMilestones(data.data || []);
    } catch { setMilestones([]); toast.error('Failed to load milestones.'); }
  }

  async function fundMilestone(milestoneId, demandId, amount, phaseName) {
    if (!window.confirm(`Proceed to Stripe Checkout to deposit $${amount} into Escrow?`)) return;
    try {
      const res    = await fetch('/api/payment/fund-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser?.token}` },
        body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId, amount, phase_name: phaseName }),
      });
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
      const res    = await fetch('/api/payment/release-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser?.token}` },
        body: JSON.stringify({ milestone_id: milestoneId, demand_id: demandId }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Funds released! Payout: $${result.payout_details.engineer_payout} | Fee: $${result.payout_details.platform_fee}`);
        openMilestones(demandId);
        refreshLedger();
      } else toast.error(result.error);
    } catch { toast.error('Network error.'); }
  }

  const d = DICT[lang];

  // i18n 取词带英文兜底：新加的"推荐理由"徽章词条只补了 en/zh 两套，
  // 其它语言（es/vi/...）字典里没有这些 key，此时回退到英文，避免显示 undefined。
  const tr = (key) => (d && d[key] != null ? d[key] : DICT.en[key]);

  // 把工程师的接单状态（availability）映射成"圆点图标 + 文案"。
  // available=🟢 可接单 / busy=🟡 忙碌 / unavailable=⚪ 不可用；缺省按可接单处理。
  function availabilityBadge(availability) {
    const map = {
      available:   { dot: '🟢', label: tr('availAvailable') },
      busy:        { dot: '🟡', label: tr('availBusy') },
      unavailable: { dot: '⚪', label: tr('availUnavailable') },
    };
    return map[availability] || map.available;
  }

  // 里程碑弹窗的生效费率（Founding 让利）：只从雇主本人的项目里取——effective_fee_pct
  // 来自 /api/demand/my（属主接口），工程师/他人的 myDemands 为空 → modalFeePct 为 undefined，
  // 自然不显示费率/净额，不泄露他人商业条款。纯展示：net = 金额 × (1 − 费率)，绝不参与真实放款计算。
  const modalDemand = (myDemands || []).find((dm) => Number(dm.id) === Number(modalDemandId));
  const modalFeePct = modalDemand?.effective_fee_pct;

  return (
    <>
      <Head><title>Dashboard & Finance | Talengineer</title></Head>
      <ChatBot lang={lang} />
      {/* 页面级离线横幅（断网/有待同步时顶部条） */}
      <OfflineBanner />

      {/* 未登录时保留公共 Navbar；登录后由 ConsoleShell 提供统一顶栏，不再重复导航 */}
      {!currentUser && <Navbar lang={lang} onLangChange={setLang} />}

      {currentUser && (
        <ConsoleShell
          user={currentUser}
          active="finance"
          title={d.dashTitle}
          subtitle={d.dashSub}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
        >
        <div className={styles.container}>
          <div className={styles.welcomeBar}>
            <div>
              <h2>Welcome back, <span style={{ color: 'var(--primary)' }}>{currentUser.name || currentUser.email}</span></h2>
              <div className={styles.roleLabel}>{currentUser.role === 'employer' ? 'Company Account / Supplier' : 'Engineering Contractor'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {kycInfo === null ? null
                : kycInfo.kyc_status === 'verified'
                  ? <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}>✅ Verified</span>
                  : kycInfo.kyc_status === 'pending'
                    ? <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(244,196,48,0.1)', color: '#b45309', border: '1px solid rgba(244,196,48,0.4)' }}>⏳ Verification Pending</span>
                    : currentUser?.role === 'employer'
                      ? <>
                          <span className={styles.kycBadge}>⚠️ KYC Verification Required</span>
                          <button className={styles.btnVerify} onClick={() => setShowKycForm(true)}>Verify Now</button>
                        </>
                      : null
              }
            </div>
          </div>

          <div className={styles.headerBlock}>
            <h1>{d.dashTitle}</h1>
            <p>{d.dashSub}</p>
            {/* 离线时页头显著提示：数据来自镜像、截至某时刻，且资金操作已暂停 */}
            {financeOffline && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.4)', color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                📴 {tr('offlineBannerPrefix')} {financeSyncedAt ? new Date(financeSyncedAt).toLocaleString() : '—'} · {tr('offlineFundsPaused')}
              </div>
            )}
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
              <button onClick={startConnect} disabled={connecting || financeOffline} title={financeOffline ? tr('offlineNoFundsAction') : undefined} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: financeOffline ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {connecting ? 'Redirecting…' : connectStatus === 'pending' ? 'Complete Setup' : 'Connect Stripe'}
              </button>
            </div>
          )}

          {/* ── Payout card（工程师 · Connect 已激活）：余额 + 即时提现（1% 手续费，资格由 Stripe 判定）── */}
          {currentUser.role === 'engineer' && connectStatus === 'active' && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>💰 Payout Balance</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {payoutBalance
                    ? <>Available: <b style={{ color: 'var(--text)' }}>${(payoutBalance.available || 0).toFixed(2)}</b> · Pending: ${(payoutBalance.pending || 0).toFixed(2)} · Instant-eligible: ${(payoutBalance.instant_available || 0).toFixed(2)}</>
                    : 'Loading balance…'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={doInstantPayout} disabled={instantBusy || financeOffline || !(payoutBalance?.instant_available > 0)} title={financeOffline ? tr('offlineNoFundsAction') : undefined}
                  style={{ background: (payoutBalance?.instant_available > 0 && !financeOffline) ? 'var(--success)' : 'var(--surface-2)', color: (payoutBalance?.instant_available > 0 && !financeOffline) ? '#fff' : 'var(--muted)', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: (payoutBalance?.instant_available > 0 && !financeOffline) ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                  {instantBusy ? 'Processing…' : '⚡ Instant Payout'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>1% Stripe fee · otherwise standard 1–2 business days</div>
              </div>
            </div>
          )}

          {/* Metrics */}
          {ledgerIsDemo && <div style={{ marginBottom: 8 }}><span className={styles.demoBadge}>🧪 {d.demoData} · Demo</span></div>}
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

          {/* Employer Analytics */}
          {currentUser?.role === 'employer' && analytics && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>📊 Project Analytics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Total Projects', value: analytics.totals?.projects ?? 0 },
                  { label: 'Total Views', value: analytics.totals?.views ?? 0 },
                  { label: 'Total Applicants', value: analytics.totals?.applicants ?? 0 },
                  { label: 'Assigned / Active', value: analytics.totals?.assigned ?? 0 },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              {analytics.data?.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table} style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Project</th><th>Status</th><th>Views</th><th>Applicants</th><th>Pending</th><th>Accepted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.data.map(row => (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</td>
                          <td><span className={`${styles.statusBadge} ${styles['status_' + row.status]}`}>{row.status.replace('_', ' ').toUpperCase()}</span></td>
                          <td>{row.view_count}</td>
                          <td>{row.applicant_count}</td>
                          <td>{row.pending_count}</td>
                          <td>{row.accepted_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Post a Project CTA (employers with no projects yet) */}
          {currentUser?.role === 'employer' && myDemands !== null && myDemands.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 24, background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Post your first project</div>
              <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Describe what you need and our AI will find the best engineers for you.</div>
              <a href="/talent" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 28px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Post a Project</a>
            </div>
          )}

          {/* My Projects (employers only — projects without ledger entries) */}
          {currentUser?.role === 'employer' && myDemands !== null && myDemands.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>📋 My Projects</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {myDemands.map(d => {
                  const msTotal = (d.project_milestones || []).length;
                  const msFunded = (d.project_milestones || []).filter(m => m.status === 'funded' || m.status === 'released').length;
                  return (
                    <div key={d.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{d.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {d.region} · {d.budget}
                          {msTotal > 0 && ` · ${msFunded}/${msTotal} milestones funded`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: d.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(0,86,179,0.08)', color: d.status === 'open' ? '#059669' : 'var(--primary)' }}>
                          {d.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button className={styles.btnAction} onClick={() => openMilestones(d.id)}>Milestones</button>
                        <button className={styles.btnAction} style={{ background: '#6b7280' }} onClick={() => loadApplicants(d.id)}>Applicants</button>
                        <a href={`/messages/${d.id}`} className={styles.btnAction} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>💬</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                      <td style={{ fontWeight: 600 }}>{item.project_title || `#${item.demand_id || item.id}`}</td>
                      <td style={{ color: 'var(--muted)' }}>{currentUser.role === 'employer' ? item.engineer_email : item.employer_email || 'Pending Match'}</td>
                      <td style={{ fontWeight: 600 }}>${(item.total_amount || 0).toLocaleString()}</td>
                      <td><span className={`${styles.statusBadge} ${styles['status_' + item.status]}`}>{item.status.toUpperCase()}</span></td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        {/* 演示行（ledgerIsDemo）禁用操作按钮——demo-* 这类假 id 打到真实接口只会 404/报错，
                            不是安全问题，是体验问题；照抄 console.jsx 对 projectsDemo 的处理方式，
                            禁用态加 title 提示，而不是让按钮看起来能点却点了没反应。 */}
                        <button className={styles.btnAction} disabled={ledgerIsDemo} title={ledgerIsDemo ? d.demoReadonly : undefined} onClick={() => openMilestones(item.demand_id)}>Milestones</button>
                        {ledgerIsDemo
                          ? <span className={styles.btnAction} style={{ opacity: 0.5, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center' }} title={d.demoReadonly}>💬 Chat</span>
                          : <a href={`/messages/${item.demand_id}`} className={styles.btnAction} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>💬 Chat</a>}
                        {currentUser?.role === 'employer' && <button className={styles.btnAction} style={{ background: '#6b7280' }} disabled={ledgerIsDemo} title={ledgerIsDemo ? d.demoReadonly : undefined} onClick={() => loadApplicants(item.demand_id)}>Applicants</button>}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        </ConsoleShell>
      )}

      {/* KYC Form Modal */}
      {showKycForm && (
        <div className={styles.modal} onClick={e => e.target === e.currentTarget && setShowKycForm(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span>🏢 Company Verification</span>
              <span className={styles.modalClose} onClick={() => setShowKycForm(false)}>×</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>Submit your company details for verification. Our team will review within 24 hours.</p>
            {kycInfo?.kyc_note && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
                <strong>Previous rejection note:</strong> {kycInfo.kyc_note}
              </div>
            )}
            <form onSubmit={submitKyc}>
              <FormGroup label="Company Name *">
                <input value={kycForm.company_name} onChange={e => setKycForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Acme Industrial Ltd." required />
              </FormGroup>
              <FormGroup label="Company Website">
                <input value={kycForm.company_website} onChange={e => setKycForm(p => ({ ...p, company_website: e.target.value }))} placeholder="https://yourcompany.com" />
              </FormGroup>
              <FormGroup label="Business Phone">
                <input value={kycForm.company_phone} onChange={e => setKycForm(p => ({ ...p, company_phone: e.target.value }))} placeholder="+1 555 000 0000" />
              </FormGroup>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={submittingKyc} className={styles.btnPrimary} style={{ flex: 1 }}>{submittingKyc ? 'Submitting…' : 'Submit for Review'}</button>
                <button type="button" onClick={() => setShowKycForm(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', padding: '11px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              </div>
            </form>
          </div>
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

                      {/* 推荐理由徽章：把平台的"精选/筛选"质量信号显式展示给雇主——
                          为什么推荐这位工程师，一目了然。所有数据均来自后端白名单字段（非 PII）。 */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        {/* 🛡️ AI 技术筛选分（0-100）；0 或缺失时显示"未验证" */}
                        <span style={{ fontSize: 11, background: 'var(--surface)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 600 }}>
                          🛡️ {tr('recAiScore')} {(app.talents?.verified_score || 0) > 0 ? `${app.talents.verified_score}/100` : tr('recUnverified')}
                        </span>

                        {/* ⭐ 平均评分（1-5）+ 评价条数；无评价时显示"暂无评价" */}
                        <span style={{ fontSize: 11, background: 'var(--surface)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 600 }}>
                          {(app.talents?.review_count || 0) > 0
                            ? `⭐ ${Number(app.talents.avg_rating || 0).toFixed(1)} (${app.talents.review_count} ${tr('recReviews')})`
                            : `⭐ ${tr('recNoReviews')}`}
                        </span>

                        {/* 接单状态：🟢 可接单 / 🟡 忙碌 / ⚪ 不可用 */}
                        <span style={{ fontSize: 11, background: 'var(--surface)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 600 }}>
                          {availabilityBadge(app.talents?.availability).dot} {availabilityBadge(app.talents?.availability).label}
                        </span>

                        {/* 🎓 平台认证（方向×等级）：指派前的硬门槛——无证工程师无法被正式指派，
                            这里让雇主一眼看到谁持证/什么方向。数据来自 applications 接口的 platform_certs。 */}
                        {(app.platform_certs || []).map(c => (
                          <span key={c.track_key} style={{ fontSize: 11, background: 'rgba(6,95,70,0.12)', color: '#059669', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(5,150,105,0.35)', fontWeight: 700 }}>
                            🎓 {lang === 'zh' ? c.track_name_zh : c.track_name_en} L{c.level}
                          </span>
                        ))}
                        {(app.platform_certs || []).length === 0 && (
                          <span style={{ fontSize: 11, background: 'var(--surface)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(245,158,11,0.35)', fontWeight: 600 }}>
                            {lang === 'zh' ? '🎓 未认证（不可指派）' : '🎓 Not certified (cannot assign)'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: app.message ? 6 : 0 }}>
                        {app.talents?.region} · {app.talents?.rate}
                      </div>
                      {app.message && <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text)' }}>{app.message}</div>}
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
                <button type="submit" disabled={filingDispute || financeOffline} title={financeOffline ? tr('offlineNoFundsAction') : undefined} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '11px', borderRadius: 6, fontWeight: 700, cursor: financeOffline ? 'not-allowed' : 'pointer', fontSize: 14 }}>{filingDispute ? 'Filing…' : 'File Dispute'}</button>
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
                        {/* 生效费率与净额（仅雇主本人项目可见——modalFeePct 来自 /api/demand/my 的 effective_fee_pct）。
                            Founding 让利 = 费率 < 15% 时标绿徽章。纯展示估算，真实放款以服务端 feeFor 为准。 */}
                        {modalFeePct != null && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.6 }}>
                            <div>
                              {tr('msFee')}{' '}
                              {modalFeePct < 0.15 && <span style={{ color: '#059669', fontWeight: 700 }}>Founding </span>}
                              {Math.round(modalFeePct * 1000) / 10}% · ${((m.amount || 0) * modalFeePct).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                              {tr('msNet')} ${((m.amount || 0) * (1 - modalFeePct)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        )}
                        <span className={`${styles.statusBadge} ${styles['status_' + (m.status || 'locked')]}`}>{(m.status || 'locked').toUpperCase()}</span>
                        {currentUser?.role === 'employer' && m.status === 'locked' && <button className={styles.btnFund} disabled={financeOffline} title={financeOffline ? tr('offlineNoFundsAction') : undefined} onClick={() => fundMilestone(m.id, modalDemandId, m.amount, m.phase_name)}>Fund via Stripe</button>}
                        {currentUser?.role === 'employer' && m.status === 'funded' && <button className={styles.btnRelease} disabled={financeOffline} title={financeOffline ? tr('offlineNoFundsAction') : undefined} onClick={() => releaseMilestone(m.id, modalDemandId)}>🛡️ Release Funds</button>}
                        {currentUser?.role === 'engineer' && m.status === 'funded' && <a href={`/workorder/${m.id}`} className={styles.btnAction} style={{ display: 'block', marginTop: 8, textAlign: 'center', textDecoration: 'none', fontSize: 12 }}>📍 Work Order</a>}
                        {['funded', 'completed'].includes(m.status) && <button className={styles.btnAction} disabled={financeOffline} title={financeOffline ? tr('offlineNoFundsAction') : undefined} style={{ background: '#ef4444', marginTop: 6, fontSize: 11 }} onClick={() => setOpeningDispute(m.id)}>⚠️ Dispute</button>}
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
