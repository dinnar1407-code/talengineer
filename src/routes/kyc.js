const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// ── Get current user's KYC status ─────────────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    // 用 maybeSingle 而非 single：当该用户没有匹配行时返回 data=null 且不报错，
    // 避免 single 在“查不到记录”时抛 PGRST116 错误被 catch 成 500。
    const { data, error } = await supabase
      .from('users')
      .select('kyc_status, company_name, company_website, company_phone, kyc_submitted_at, kyc_note')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (error) throw error;
    // 无 KYC 记录(或 kyc_status 为空)时给出合理默认，返回 200 而非 500；
    // 字段名沿用 kyc_status 以兼容前端读取逻辑。
    res.json({ status: 'ok', data: data || { kyc_status: 'not_submitted' } });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[kyc:status]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Submit company info for KYC review ───────────────────────────────────────
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { company_name, company_website, company_phone } = req.body;

    if (!company_name?.trim()) return res.status(400).json({ error: 'Company name is required.' });

    // Check current status — don't allow re-submission if already verified
    const { data: user } = await supabase.from('users').select('kyc_status').eq('id', req.user.userId).single();
    if (user?.kyc_status === 'verified') return res.status(400).json({ error: 'Already verified.' });

    const { error } = await supabase
      .from('users')
      .update({
        company_name:     company_name.trim(),
        company_website:  company_website?.trim() || null,
        company_phone:    company_phone?.trim()   || null,
        kyc_status:       'pending',
        kyc_submitted_at: new Date().toISOString(),
        kyc_note:         null,
      })
      .eq('id', req.user.userId);

    if (error) throw error;
    res.json({ status: 'ok', message: 'Verification submitted. Our team will review within 24 hours.' });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[kyc:submit]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
