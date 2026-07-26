// ── 统一登录页（/login，Wave A / A3）─────────────────────────────────────────
// 登录此前散在三处各写各的：pages/finance.jsx（雇主主入口，含 Google 按钮与忘记密码）、
// pages/talent.jsx（工程师注册）、pages/admin.jsx（管理员）。本页把前两处收敛成唯一入口。
//
// admin.jsx 刻意不收进来：管理员走独立的密码 + TOTP 双因子通道，是 OAuth 挂掉时的
// break-glass 入口。把平台最高权限的登录路径与普通用户合并，等于把它外包给 Google 的
// 账号安全——provider 账号被盗即平台被盗。这是设计决定，不是遗漏。
//
// 三种通道（2026-07-25 定稿）：Google / Microsoft(azure) / 邮箱密码。Apple 不做。
// 社交按钮在上、邮箱折叠在下：OAuth 转化更好且无密码泄漏风险；但邮箱是平权保留的正式通道。
//
// 认人逻辑全在服务端 /api/auth/oauth-token（按 provider+sub，见 migrations/025）。
// 本页只负责：拿 Supabase 会话 → 换自家 JWT → 落 localStorage → 回跳 next。
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Turnstile, { turnstileEnabled } from '../components/Turnstile';
import { useLang } from '../hooks/useLang';
import { DICT as UI } from '../lib/i18n/login';
import { supabase } from '../lib/supabaseClient';
import styles from './login.module.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';
const LS_USER_KEY = 'tal_user';   // 与 finance.jsx / console.jsx 等页共用同一把钥匙，勿改名
const DEFAULT_NEXT = '/console';

/**
 * 回跳地址消毒：只允许站内绝对路径。
 * 不做这层的话 /login?next=https://evil.com 就是一个开放重定向——攻击者拿它做钓鱼跳板，
 * 而且链接域名是我们自己的，用户看不出问题。'//evil.com' 会被浏览器当协议相对 URL，同样要挡。
 */
function safeNext(raw) {
  if (typeof raw !== 'string' || !raw) return DEFAULT_NEXT;
  if (!raw.startsWith('/') || raw.startsWith('//')) return DEFAULT_NEXT;
  return raw;
}

export default function LoginPage() {
  const [lang] = useLang();
  const u = UI[lang] || UI.en;
  const router = useRouter();

  const [mode, setMode] = useState('signin');       // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employer');
  const [referralCode, setReferralCode] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // OAuth 新用户缺角色时暂存会话，等用户在弹窗里选完再拿同一个 access_token 重试
  const [pendingSession, setPendingSession] = useState(null);
  const [oauthRole, setOauthRole] = useState('employer');

  // 防重复兑换：onAuthStateChange 与 getSession 可能对同一个会话各触发一次
  const exchangingRef = useRef(false);

  const nextPath = safeNext(router.query.next);

  // ── 已登录直接走人；?ref= 预填推荐码 ──────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.ref === 'string') setReferralCode(router.query.ref.slice(0, 32));
    try {
      const stored = localStorage.getItem(LS_USER_KEY);
      if (stored && JSON.parse(stored)?.token) router.replace(nextPath);
    } catch {
      localStorage.removeItem(LS_USER_KEY); // 存坏了就清掉，别把用户卡在登录页
    }
    // nextPath 由 query 派生，随 isReady 一起稳定，无需进依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // ── OAuth 回跳：拿 Supabase 会话换自家 JWT ────────────────────────────────
  useEffect(() => {
    let unsub = null;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) exchangeSession(data.session);
    }).catch(() => { /* 未配 Supabase 环境变量时静默——邮箱通道仍可用 */ });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) exchangeSession(session);
    });
    unsub = sub?.subscription;
    return () => { if (unsub) unsub.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exchangeSession(session, roleOverride) {
    if (exchangingRef.current) return;
    exchangingRef.current = true;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/oauth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          role: roleOverride || undefined, // 老用户不传：角色一律以库里为准
          referral_code: referralCode.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 全新用户还没选身份——弹角色卡，选完拿同一个会话重试
        if (data.code === 'ROLE_REQUIRED') {
          setPendingSession(session);
          exchangingRef.current = false;
          setBusy(false);
          return;
        }
        throw new Error(data.error || u.errOAuth);
      }
      finishLogin(data);
    } catch (err) {
      console.error('[Login] OAuth exchange failed:', err);
      setError(err.message || u.errOAuth);
      exchangingRef.current = false;
      setBusy(false);
    }
  }

  /**
   * @param {object} data 认证端点返回的 { token, email, role, name, is_new_user? }
   * @param {boolean} isSignup 邮箱注册路径没有 is_new_user 字段，由调用方直接告知
   */
  function finishLogin(data, isSignup = false) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify({
      email: data.email, name: data.name, role: data.role, token: data.token,
    }));
    localStorage.setItem(`tal_role_${data.email}`, data.role);
    // 新工程师必须先补档案：OAuth 建号不会创建 talents 行，没档案就进不了任何撮合。
    // （档案行在 /onboarding 保存时由 PUT /api/talent/profile 首次调用创建。）
    const isNewEngineer = (isSignup || data.is_new_user) && data.role === 'engineer';
    router.replace(isNewEngineer ? '/onboarding' : nextPath);
  }

  function startOAuth(provider) {
    setError('');
    // 回到 /login 本身完成兑换，再由 finishLogin 送去 next——OAuth 回跳落点必须是本页，
    // 否则每个目标页都得各写一遍会话兑换逻辑（那正是这次要收敛掉的东西）。
    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`;
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      .catch((err) => {
        console.error('[Login] signInWithOAuth failed:', err);
        setError(u.errOAuth);
      });
  }

  function confirmRole() {
    const session = pendingSession;
    setPendingSession(null);
    exchangeSession(session, oauthRole);
  }

  // ── 邮箱通道 ─────────────────────────────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault();
    // 注册要过人机验证；登录不要（默认弹验证会实打实伤转化，爆破由 authLimiter 挡）
    if (mode === 'signup' && turnstileEnabled && !turnstileToken) {
      setError(u.errVerify);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'signin'
        ? { email, password }
        : {
            email, password, role, name,
            referral_code: referralCode.trim() || undefined,
            turnstile_token: turnstileToken || undefined,
          };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || u.errGeneric);
      finishLogin(data, mode === 'signup');
    } catch (err) {
      setError(err.message || u.errGeneric);
      setTurnstileToken(''); // token 一次性，失败后必须重新验证
      setBusy(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (turnstileEnabled && !turnstileToken) {
      setError(u.errVerify);
      return;
    }
    setBusy(true);
    setError('');
    try {
      // 端点恒回 ok（防邮箱枚举），所以这里不看结果，直接进"已发送"态
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstile_token: turnstileToken || undefined }),
      });
      setForgotSent(true);
    } catch {
      setError(u.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  const canonical = `${SITE}/login`;

  return (
    <>
      <Head>
        {/* 单一子节点：next/head 的 <title> 混合子节点（{expr} + 文本）会渲染成空标签 */}
        <title>{`${u.metaTitle} | Talengineer`}</title>
        <meta name="description" content={u.metaDesc} />
        <link rel="canonical" href={canonical} />
        {/* 登录页无索引价值，且带 ?next= 参数会生成无数重复 URL */}
        <meta name="robots" content="noindex,follow" />
      </Head>

      <Navbar />

      <main className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{u.heading}</h1>
          <p className={styles.sub}>{u.sub}</p>

          {error && <div className={styles.error} role="alert">{error}</div>}

          {/* ── 社交通道（主推）── */}
          <div className={styles.social}>
            <button type="button" className={styles.btnOauth} onClick={() => startOAuth('google')} disabled={busy}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
              </svg>
              {u.btnGoogle}
            </button>
            <button type="button" className={styles.btnOauth} onClick={() => startOAuth('azure')} disabled={busy}>
              {/* Microsoft 四色方块。Supabase 里该 provider 的标识是 'azure'，不是 'microsoft' */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022" />
                <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00" />
                <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF" />
                <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900" />
              </svg>
              {u.btnMicrosoft}
            </button>
          </div>

          {/* ── 邮箱通道：默认展开。折叠会让人以为只能用社交登录，而邮箱是平权通道 ── */}
          <div className={styles.divider}><span>{u.orEmail}</span></div>

          {mode === 'forgot' ? (
            forgotSent ? (
              <div className={styles.sent}>
                <div className={styles.sentIcon}>📧</div>
                <h2 className={styles.sentTitle}>{u.forgotSentTitle}</h2>
                <p className={styles.sub}>{u.forgotSentBody}</p>
                <button type="button" className={styles.linkBtn} onClick={() => { setMode('signin'); setForgotSent(false); }}>
                  {u.backToSignIn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <p className={styles.lead}>{u.forgotLead}</p>
                <label className={styles.field}>
                  <span>{u.lblEmail}</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </label>
                <Turnstile onToken={setTurnstileToken} />
                <button type="submit" className={styles.btnPrimary} disabled={busy}>
                  {busy ? u.working : u.btnForgot}
                </button>
                <button type="button" className={styles.linkBtn} onClick={() => setMode('signin')}>{u.backToSignIn}</button>
              </form>
            )
          ) : (
            <>
              <div className={styles.tabs}>
                <button type="button" className={mode === 'signin' ? styles.tabActive : styles.tab} onClick={() => { setMode('signin'); setError(''); }}>
                  {u.tabSignIn}
                </button>
                <button type="button" className={mode === 'signup' ? styles.tabActive : styles.tab} onClick={() => { setMode('signup'); setError(''); }}>
                  {u.tabSignUp}
                </button>
              </div>

              <form onSubmit={handleEmailSubmit}>
                {mode === 'signup' && (
                  <>
                    <label className={styles.field}>
                      <span>{u.lblName}</span>
                      <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    </label>
                    <label className={styles.field}>
                      <span>{u.lblRole}</span>
                      <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="employer">{u.optEmployer}</option>
                        <option value="engineer">{u.optEngineer}</option>
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>{u.lblReferral}</span>
                      <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} maxLength={32} placeholder="ABCD2345" />
                    </label>
                  </>
                )}
                <label className={styles.field}>
                  <span>{u.lblEmail}</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </label>
                <label className={styles.field}>
                  <span>{u.lblPassword}</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </label>

                {/* 只有注册挂人机验证——登录默认弹会伤转化，且爆破已被限流挡住 */}
                {mode === 'signup' && <Turnstile onToken={setTurnstileToken} />}

                <button type="submit" className={styles.btnPrimary} disabled={busy}>
                  {busy ? u.working : (mode === 'signin' ? u.btnSignIn : u.btnSignUp)}
                </button>
                {mode === 'signin' && (
                  <button type="button" className={styles.linkBtn} onClick={() => { setMode('forgot'); setError(''); }}>
                    {u.forgotLink}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </main>

      {/* ── 角色选择（仅 OAuth 全新用户）── */}
      {pendingSession && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.heading}>{u.roleTitle}</h2>
            <p className={styles.sub}>{u.roleLead}</p>
            {[
              { val: 'employer', label: u.optEmployer, desc: u.roleEmployerDesc },
              { val: 'engineer', label: u.optEngineer, desc: u.roleEngineerDesc },
            ].map(({ val, label, desc }) => (
              <button
                type="button"
                key={val}
                className={oauthRole === val ? styles.roleCardActive : styles.roleCard}
                onClick={() => setOauthRole(val)}
              >
                <strong>{label}</strong>
                <span>{desc}</span>
              </button>
            ))}
            <button type="button" className={styles.btnPrimary} onClick={confirmRole} disabled={busy}>
              {busy ? u.working : u.btnRoleConfirm}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
