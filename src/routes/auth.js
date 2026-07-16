const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { getClient } = require('../config/db');
const { emailPasswordReset } = require('../services/email');

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

    // Insert user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{ email, password: passwordHash, role, name: engName || name || '' }])
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

module.exports = router;

// ── 测试可达性导出（最小改动）────────────────────────────────────────────────
// router 本身是函数对象，给它挂属性不会影响 `app.use('/api/auth', require('./auth'))` 的现有用法。
// 这样单元测试可直接拿到 Zod schema 做校验测试，无需启动整个 Express/数据库。
module.exports.registerSchema = registerSchema;
module.exports.loginSchema = loginSchema;
module.exports.scoreFromToken = scoreFromToken;
