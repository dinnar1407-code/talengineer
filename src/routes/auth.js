const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { getClient } = require('../config/db');
const { emailPasswordReset, emailVerifyEmail } = require('../services/email');
const { requireAuth } = require('../middleware/auth');
const { authenticator } = require('otplib'); // admin 账号化第二因子（TOTP）

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

    const { email, password, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel, score_token } = parsed.data;
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
      console.log(`[Auth] Registered new engineer: ${engName}`);
    }

    // 发送邮箱验证邮件（fire-and-forget：发信失败不阻断注册，可稍后经 /resend-verification 重发）
    sendVerificationEmail(user.email);

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
  const domain = process.env.DOMAIN || 'http://localhost:4000';
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

    console.log(`[Auth] Email verified for ${decoded.email}`);
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

    // 空密码账户是 OAuth 注册用户（见 /oauth-token 写入 password: ''），禁止密码登录，防止任意密码绕过鉴权
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please log in with Google.' });
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
        console.log(`[Auth] Migrated legacy password for ${email}`);
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
// Called after Supabase OAuth to exchange a Supabase session for our own JWT

router.post('/oauth-token', async (req, res) => {
  try {
    const { access_token, role } = req.body;
    if (!access_token || !role) return res.status(400).json({ error: 'Missing access_token or role' });
    if (!['employer', 'engineer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const supabase = getClient();

    // Verify Supabase session
    const { data: { user }, error: authErr } = await supabase.auth.getUser(access_token);
    if (authErr || !user) return res.status(401).json({ error: 'Invalid or expired session' });

    // Find or create user in our users table
    let { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!dbUser) {
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert([{ email: user.email, role, name, password: '' }])
        .select()
        .single();
      if (insertErr) throw insertErr;
      dbUser = newUser;
    }

    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ status: 'ok', token, email: dbUser.email, role: dbUser.role, name: dbUser.name });
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
    const domain = process.env.DOMAIN || 'http://localhost:4000';
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

    console.log(`[Auth] Password reset for ${decoded.email}`);
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

    // 带 adm2fa 声明的短期 admin 令牌：adminAuth 中间件的主通道凭证
    const token = jwt.sign({ email: user.email, role: 'admin', adm2fa: true }, JWT_SECRET, { expiresIn: '12h' });
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
