const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { getClient } = require('../config/db');
const { emailPasswordReset, emailVerifyEmail } = require('../services/email');
const { requireAuth } = require('../middleware/auth');
const { authenticator } = require('otplib'); // admin 账号化第二因子（TOTP）
const { maskEmail } = require('../services/referralService'); // 日志脱敏：邮箱是 PII，落日志前打码

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';
const BCRYPT_ROUNDS = 10;

// ── Input validation schemas ─────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['employer', 'engineer'], { errorMap: () => ({ message: 'Role must be employer or engineer' }) }),
  name: z.string().optional(),
  // Engineer-specific fields (optional)
  engName: z.string().optional(),
  engSkills: z.string().optional(),
  engRate: z.string().optional(),
  engBio: z.string().optional(),
  engRegion: z.string().optional(),
  engLevel: z.string().optional(),
  engPricingModel: z.enum(['hourly', 'milestone']).optional(),
  // AI 技术筛选分数凭证（落地第二步硬化，替代此前的 verified_score 自报字段）。
  // screen_verify 打分后由服务端签名下发 score_token（30 分钟有效），注册时原样转交；
  // 分数从 token 里解出并校验签名，前端改不了——堵住"自报 100 分刷撮合排名"的洞。
  // token 缺失/无效/过期都不阻断注册，只是分数按 0 落库（可稍后重新筛选提分）。
  // 兼容说明：旧客户端若仍传 verified_score，zod 会静默丢弃未知字段，注册不受影响。
  score_token: z.string().optional(),
  // 推荐码（W2-4 推荐计划）：可选。zod 会静默剥掉未声明字段，所以必须在 schema 里显式声明，
  // 否则前端传了也会被丢弃。归因在注册成功后 fire-and-forget 执行（fail-open）：
  // 码非法/不存在/自荐/重复归因都不阻断注册——与 score_token 同一"永不卡死注册"纪律。
  referral_code: z.string().max(32).optional(),
});

/**
 * 从签名的 score_token 中解出 AI 筛选分。
 * 校验：签名有效（同 JWT_SECRET）+ purpose 必须是 'screen_score'（防拿登录 JWT 冒充）。
 * 任何异常（缺失/伪造/过期/载荷不对）都返回 0——注册永不因分数凭证问题被卡死。
 */
function scoreFromToken(scoreToken) {
  if (!scoreToken) return 0;
  try {
    const decoded = jwt.verify(scoreToken, JWT_SECRET);
    if (decoded.purpose !== 'screen_score') return 0;
    const score = Number(decoded.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) return 0;
    return score;
  } catch {
    return 0;
  }
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Register ─────────────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, password, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel, score_token, referral_code } = parsed.data;
    const supabase = getClient();

    // Hash password with bcrypt (salted)
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert user（email_verified 默认 false，点击验证邮件里的链接后置 true）
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{ email, password: passwordHash, role, name: engName || name || '', email_verified: false }])
      .select()
      .single();

    if (userErr) {
      if (userErr.code === '23505') {
        return res.status(400).json({ error: 'Email already registered. Please sign in instead.' });
      }
      throw userErr;
    }

    // If engineer, create talent profile
    if (role === 'engineer' && engName) {
      const { error: talentErr } = await supabase
        .from('talents')
        .insert([{
          user_id: user.id,
          name: engName,
          skills: engSkills || 'Automation Engineer',
          region: engRegion || 'US/CA/MX',
          rate: engRate || 'Open',
          pricing_model: engPricingModel || 'hourly',
          level: engLevel || 'Mid',
          // 持久化注册时的 AI 筛选得分：从服务端签名的 score_token 解出（防自报刷分），
          // 凭证缺失/无效按 0 落库（之前硬编码为 0 导致筛选白做，后改为信任自报，现硬化为签名凭证）
          verified_score: scoreFromToken(score_token),
          bio: engBio || '',
          contact: email,
        }]);
      if (talentErr) throw talentErr;
      console.log(`[Auth] Registered new engineer: ${maskEmail(email)}`);
    }

    // 发送邮箱验证邮件（fire-and-forget：发信失败不阻断注册，可稍后经 /resend-verification 重发）
    sendVerificationEmail(user.email);

    // 推荐归因（fire-and-forget，fail-open）：码无效/自荐/已被推荐都不阻断注册。
    // 懒 require：即便 referralService 加载出错也不影响注册主路径（与副作用同纪律）。
    if (referral_code) {
      try {
        const { attributeReferral } = require('../services/referralService');
        attributeReferral(supabase, { newUserId: user.id, newUserEmail: user.email, referralCode: referral_code })
          .catch((e) => console.error('[Auth] Referral attribution error:', e));
      } catch (e) {
        console.error('[Auth] Referral attribution error:', e);
      }
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ status: 'ok', token, email: user.email, role: user.role, name: user.name });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * 签发 48h 有效的 purpose 型验证令牌并发送验证邮件。
 * 与 reset token 同模式：type 字段防止拿登录 JWT / reset token 冒充验证令牌。
 */
function sendVerificationEmail(email) {
  const verifyToken = jwt.sign({ email, type: 'verify_email' }, JWT_SECRET, { expiresIn: '48h' });
  const domain = process.env.DOMAIN || 'https://talengineer.us';
  const verifyUrl = `${domain}/verify-email?token=${verifyToken}`;
  emailVerifyEmail({ userEmail: email, verifyUrl }).catch(console.error);
}

// ── Verify Email ──────────────────────────────────────────────────────────────
// 点击邮件里的链接后由 pages/verify-email.jsx 调用。幂等：重复验证直接返回 ok。

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Verification link has expired or is invalid. Please request a new one.' });
    }
    if (decoded.type !== 'verify_email') return res.status(400).json({ error: 'Invalid verification token' });

    const supabase = getClient();
    const { error } = await supabase.from('users').update({ email_verified: true }).eq('email', decoded.email);
    if (error) throw error;

    console.log(`[Auth] Email verified for ${maskEmail(decoded.email)}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Auth] Verify email error:', err);
    res.status(500).json({ error: 'Failed to verify email. Please try again.' });
  }
});

// ── Resend Verification ───────────────────────────────────────────────────────
// 需登录（要重发到的地址就是登录账号的邮箱）；已验证则幂等返回。
// 频控由 app.js 上 /api/auth 的限流器（10 次/15 分钟）兜底。

router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: user } = await supabase.from('users').select('email, email_verified').eq('id', req.user.userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.json({ status: 'ok', already_verified: true });

    sendVerificationEmail(user.email);
    res.json({ status: 'ok', message: 'Verification email sent.' });
  } catch (err) {
    console.error('[Auth] Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email. Please try again.' });
  }
});

// ── Login ────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;
    const supabase = getClient();

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchErr || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 空密码账户是 OAuth 注册用户（见 /oauth-token 写入 password: ''），禁止密码登录，防止任意密码绕过鉴权。
    // 文案不点名具体 provider：账号可能绑了 Google 或 Microsoft，说错反而误导（要查 auth_identities
    // 才知道绑的是哪个，为一句提示多打一次库不值当）。
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google or Microsoft sign-in. Please use that button to log in.' });
    }

    // Handle legacy accounts (plain SHA256 hash — migrate on first login)
    let passwordValid = false;
    const isBcrypt = user.password?.startsWith('$2');

    if (isBcrypt) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy SHA256 — verify then migrate to bcrypt
      const crypto = require('crypto');
      const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password === legacyHash) {
        passwordValid = true;
        // Migrate to bcrypt silently
        const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await supabase.from('users').update({ password: newHash }).eq('id', user.id);
        console.log(`[Auth] Migrated legacy password for ${maskEmail(email)}`);
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ status: 'ok', token, email: user.email, role: user.role, name: user.name });

  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── OAuth Token Exchange ─────────────────────────────────────────────────────
// Supabase OAuth 会话 → 自家 JWT。Wave A/A1 起按 (provider, provider_sub) 认人，
// 不再按 email 认人——理由见 migrations/025_auth_identities.sql 头注释（换邮箱/多通道会分裂账号）。
//
// 认人三段式（顺序即优先级）：
//   1. auth_identities 命中 (provider, sub) → 老用户回访，直接发 JWT。用户在 provider 侧
//      改了邮箱也照样认得出——这正是不按 email 认人的价值。
//   2. 未命中但 email 命中 users → 首次用该通道登录一个已存在的账号（密码老用户第一次点
//      Google，或 Google 老用户第一次点 Microsoft）→ 补写 identity 行完成关联。
//      ⚠️ 仅在 provider 已验证邮箱时允许，见下方 email_confirmed_at 检查。
//   3. 都没命中 → 建新用户 + identity 行 + 推荐归因。
//
// role 只在【建新用户】时使用；老用户的角色一律以库里为准（前端传什么都不改它）。
// 新用户没带 role 时回 400 + code:'ROLE_REQUIRED'，供 /login 页弹角色选择后重试。
const ALLOWED_OAUTH_PROVIDERS = new Set(['google', 'azure']); // azure = Microsoft；Apple 明确不做（要付费开发者账号）

/**
 * 从 Supabase user 对象解出 (provider, sub)。
 * provider 取本次会话实际使用的通道（app_metadata.provider）——绝不取 body，
 * 那是调用方自报，等于让人挑自己的身份空间。
 * sub 优先取该 provider 的 identity.id（即 OIDC sub，provider 侧永久稳定主键），
 * 兜底用 Supabase 自己的 user.id（对该 Supabase 用户同样稳定，够用）。
 */
function extractOAuthIdentity(user) {
  const provider = user?.app_metadata?.provider || null;
  const identity = Array.isArray(user?.identities)
    ? user.identities.find((i) => i.provider === provider)
    : null;
  return { provider, sub: identity?.id ? String(identity.id) : (user?.id ? String(user.id) : null) };
}

router.post('/oauth-token', async (req, res) => {
  try {
    // referral_code（可选）：OAuth 注册绕过 /register，若只在 /register 挂归因会漏掉 OAuth 新用户。
    const { access_token, role, referral_code } = req.body || {};
    if (!access_token) return res.status(400).json({ error: 'Missing access_token' });
    // role 此处不强制——老用户回访不需要它。只有走到「建新用户」分支才要求，见下。
    if (role != null && !['employer', 'engineer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const supabase = getClient();

    // 验证 Supabase 会话（唯一可信的身份来源）
    const { data: { user }, error: authErr } = await supabase.auth.getUser(access_token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid or expired session' });

    const { provider, sub } = extractOAuthIdentity(user);
    if (!provider || !ALLOWED_OAUTH_PROVIDERS.has(provider)) {
      // 白名单之外的通道一律拒绝：Supabase 后台若被误开第三个 provider，这里是最后一道闸。
      console.warn(`[Auth] OAuth rejected: provider "${provider}" not in allow-list`);
      return res.status(400).json({ error: 'This sign-in method is not supported.' });
    }
    if (!sub) {
      console.error('[Auth] OAuth identity missing sub', { provider });
      return res.status(400).json({ error: 'Authentication failed. Please try again.' });
    }

    let dbUser = null;

    // 迁移 025 若还没在生产执行，auth_identities 不存在。部署顺序（迁移先上生产再 push）
    // 是纪律，但不该由用户的登录来兜底——这里精确识别"表不存在"（42P01）后降级回旧的
    // 按 email 认人，并把错误吼进日志。只认这一个错误码，其余照常抛，不做兜底式吞异常。
    let identityTableReady = true;

    // ── 第 1 段：按 (provider, sub) 认人 ────────────────────────────────────
    const { data: identityRow, error: idErr } = await supabase
      .from('auth_identities')
      .select('user_id')
      .eq('provider', provider)
      .eq('provider_sub', sub)
      .maybeSingle();
    if (idErr) {
      if (idErr.code === '42P01') {
        identityTableReady = false;
        console.error('[Auth] auth_identities missing — migration 025 not applied on this environment. Falling back to email matching.');
      } else {
        throw idErr;
      }
    }

    if (identityRow) {
      const { data: found, error: uErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', identityRow.user_id)
        .maybeSingle();
      if (uErr) throw uErr;
      // 身份行指向一个已不存在的用户（账号被删）——当作未关联处理，往下走建号分支。
      if (found) dbUser = found;
      else console.warn(`[Auth] auth_identities row points to missing user ${identityRow.user_id}`);
    }

    // ── 第 2 段：按 email 关联已有账号（仅首次）────────────────────────────
    if (!dbUser && user.email) {
      const { data: byEmail, error: eErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      if (eErr) throw eErr;

      if (byEmail) {
        // 账号接管防线：只有 provider 确实验证过这个邮箱，才允许拿它认领一个已存在的账号。
        // Google/Microsoft 都会验证，正常路径恒为真；此处防的是 Supabase 后台误配了
        // 不验证邮箱的 IdP——那种情况下攻击者注册受害者邮箱即可登入受害者账号。
        if (!user.email_confirmed_at) {
          console.warn(`[Auth] OAuth link refused: unverified email from provider "${provider}"`);
          return res.status(403).json({ error: 'Your email is not verified by the sign-in provider.' });
        }
        dbUser = byEmail;
      }
    }

    // ── 第 3 段：建新用户 ──────────────────────────────────────────────────
    let isNewUser = false;
    if (!dbUser) {
      if (!role) {
        // 前端据 code 弹「我是雇主 / 我是工程师」再带 role 重试同一个 access_token。
        return res.status(400).json({ error: 'Please choose an account type.', code: 'ROLE_REQUIRED' });
      }
      const name = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User');
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert([{ email: user.email, role, name, password: '' }]) // password:'' = OAuth 账户，登录路由据此禁密码登录
        .select()
        .single();
      if (insertErr) throw insertErr;
      dbUser = newUser;
      isNewUser = true;
    }

    // ── 补写身份行（第 2、3 段都需要；第 1 段命中时跳过）────────────────────
    if (identityTableReady && !identityRow) {
      const { error: linkErr } = await supabase
        .from('auth_identities')
        .insert([{ user_id: dbUser.id, provider, provider_sub: sub, email_at_link: user.email || null }]);
      if (linkErr) {
        // 23505 = 唯一键冲突：两个请求同时首登，另一个已抢先写入。身份已存在即达成目的，
        // 继续发 JWT 即可（不重查——(provider,sub) 唯一，冲突方指向的必是同一个 user）。
        if (linkErr.code !== '23505') throw linkErr;
        console.warn('[Auth] auth_identities concurrent insert, continuing:', linkErr.message);
      }
    }

    // 推荐归因（仅限【新建】用户；老用户 OAuth 登录不归因，防止"拿别人的码归因存量账号"）。
    // 与 /register 同一 fire-and-forget + fail-open 纪律：任何失败不阻断登录。
    if (isNewUser && referral_code && typeof referral_code === 'string') {
      try {
        const { attributeReferral } = require('../services/referralService');
        attributeReferral(supabase, { newUserId: dbUser.id, newUserEmail: dbUser.email, referralCode: referral_code })
          .catch((e) => console.error('[Auth] OAuth referral attribution error:', e));
      } catch (e) {
        console.error('[Auth] OAuth referral attribution error:', e);
      }
    }

    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // is_new_user 供前端分流：OAuth 建号的工程师没有 talents 档案行（密码注册那条路径是
    // 在 /register 里顺手建的），必须被送去 /onboarding 补档案，否则他不会出现在任何撮合里。
    // 档案行本身由 PUT /api/talent/profile 首次调用时创建，见 src/routes/talent.js。
    res.json({ status: 'ok', token, email: dbUser.email, role: dbUser.role, name: dbUser.name, is_new_user: isNewUser });
  } catch (err) {
    console.error('[Auth] OAuth token exchange error:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// ── Forgot Password ──────────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  // Always respond OK to avoid email enumeration
  res.json({ status: 'ok', message: 'If that email is registered, you will receive a reset link shortly.' });

  try {
    const { email } = req.body;
    if (!email) return;

    const supabase = getClient();
    const { data: user } = await supabase.from('users').select('id, email').eq('email', email).single();
    if (!user) return;

    const resetToken = jwt.sign({ email: user.email, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    const domain = process.env.DOMAIN || 'https://talengineer.us';
    const resetUrl = `${domain}/reset-password?token=${resetToken}`;

    emailPasswordReset({ userEmail: user.email, resetUrl }).catch(console.error);
  } catch (err) {
    console.error('[Auth] Forgot password error:', err);
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Reset link has expired or is invalid. Please request a new one.' });
    }

    if (decoded.type !== 'reset') return res.status(400).json({ error: 'Invalid reset token' });

    const supabase = getClient();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { error } = await supabase.from('users').update({ password: passwordHash }).eq('email', decoded.email);
    if (error) throw error;

    console.log(`[Auth] Password reset for ${maskEmail(decoded.email)}`);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Auth] Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// ── Admin 2FA（TOTP）────────────────────────────────────────────────────────
// 账号化 admin 登录的第二因子：先 setup 生成密钥并让管理员录入认证器（Google Authenticator / 1Password），
// 再用一次性码换取带 adm2fa 声明的短期 admin JWT（12h）——该 JWT 即 adminAuth 中间件的主通道凭证。

// POST /api/auth/admin-2fa-setup（需登录）：为 admin 账号生成 TOTP 密钥。
// 非 admin 403；已启用则 400（防他人拿到会话后重置密钥顶替）；返回 secret 与 otpauth URL 供录入认证器。
router.post('/admin-2fa-setup', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, totp_enabled')
      .eq('id', req.user.userId)
      .single();
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    // 已启用则不允许重新生成密钥：否则拿到有效会话即可把 2FA 换成自己的
    if (user.totp_enabled) return res.status(400).json({ error: '2FA already enabled' });

    const secret = authenticator.generateSecret();
    const { error: upErr } = await supabase.from('users').update({ totp_secret: secret }).eq('id', user.id);
    if (upErr) throw upErr;

    const otpauthUrl = authenticator.keyuri(user.email, 'TalEngineer Admin', secret);
    res.json({ secret, otpauthUrl });
  } catch (err) {
    console.error('[Auth] admin-2fa-setup error:', err);
    res.status(500).json({ error: 'Failed to start 2FA setup. Please try again.' });
  }
});

// POST /api/auth/admin-2fa（需登录，body {code}）：校验一次性码，签发带 adm2fa 的 admin JWT。
// 非 admin 403；未 setup 400；校验失败 401；首次成功即把 totp_enabled 置真（完成绑定）。
router.post('/admin-2fa', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { code } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, totp_secret, totp_enabled')
      .eq('id', req.user.userId)
      .single();
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    if (!user.totp_secret) return res.status(400).json({ error: 'Set up 2FA first' });

    // token 强制转字符串：前端可能传数字，otplib 只接受字符串
    const valid = authenticator.verify({ token: String(code || ''), secret: user.totp_secret });
    if (!valid) return res.status(401).json({ error: 'Invalid verification code' });

    // 首次校验成功即完成绑定
    if (!user.totp_enabled) {
      await supabase.from('users').update({ totp_enabled: true }).eq('id', user.id);
    }

    // 带 adm2fa 声明的短期 admin 令牌：adminAuth 中间件的主通道凭证。
    // userId 必须带上：registry 的写路径硬性要求 ctx.user.userId（它是 agent_actions 的审计身份），
    // 缺了它，过了 2FA 的 admin 反而一个写工具都跑不了。加这一项是补齐，不放宽任何权限——
    // 它只是让这枚令牌也能被 requireAuth 当普通用户令牌用，而那正是同一个人本来就有的权限。
    const token = jwt.sign({ userId: user.id, email: user.email, role: 'admin', adm2fa: true }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('[Auth] admin-2fa error:', err);
    res.status(500).json({ error: 'Failed to verify code. Please try again.' });
  }
});

module.exports = router;

// ── 测试可达性导出（最小改动）────────────────────────────────────────────────
// router 本身是函数对象，给它挂属性不会影响 `app.use('/api/auth', require('./auth'))` 的现有用法。
// 这样单元测试可直接拿到 Zod schema 做校验测试，无需启动整个 Express/数据库。
module.exports.registerSchema = registerSchema;
module.exports.loginSchema = loginSchema;
module.exports.scoreFromToken = scoreFromToken;
