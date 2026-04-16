const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Middleware: verify API key (for enterprise endpoints) ─────────────────────
async function requireApiKey(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer TE_')) return res.status(401).json({ error: 'Missing or invalid API key. Keys must start with TE_' });

  const rawKey = auth.slice(7);
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const supabase = getClient();

  const { data: apiKey } = await supabase.from('api_keys').select('id, user_id, active').eq('key_hash', keyHash).single();
  if (!apiKey || !apiKey.active) return res.status(401).json({ error: 'Invalid or revoked API key.' });

  await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('id', apiKey.id);
  req.apiKeyUserId = apiKey.user_id;
  next();
}

module.exports.requireApiKey = requireApiKey;

// ── Generate API key ──────────────────────────────────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing key name' });

    // Limit: 5 active keys per user
    const { count } = await supabase.from('api_keys').select('id', { count: 'exact' }).eq('user_id', req.user.userId).eq('active', true);
    if (count >= 5) return res.status(400).json({ error: 'Maximum 5 active API keys per account.' });

    const rawKey  = 'TE_' + crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 16) + '…';

    const { data, error } = await supabase.from('api_keys').insert({
      user_id: req.user.userId, name, key_hash: keyHash, key_prefix: keyPrefix,
    }).select().single();

    if (error) throw error;

    // Return raw key ONCE — never stored in plaintext
    res.json({ status: 'ok', key: rawKey, key_prefix: keyPrefix, id: data.id, name, message: 'Save this key now — it will not be shown again.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List API keys (masked) ────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, last_used, active, created_at')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Revoke API key ────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    await supabase.from('api_keys').update({ active: false }).eq('id', req.params.id).eq('user_id', req.user.userId);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.router = router;
