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
});

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
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, password, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel } = parsed.data;
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
          verified_score: 0,
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
      return res.status(400).json({ error: parsed.error.errors[0].message });
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

    // Handle legacy accounts (plain SHA256 hash — migrate on first login)
    let passwordValid = false;
    const isBcrypt = user.password?.startsWith('$2');

    if (isBcrypt) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy SHA256 — verify then migrate to bcrypt
      const crypto = require('crypto');
      const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password === legacyHash || !user.password) {
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
