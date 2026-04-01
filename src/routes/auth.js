const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const crypto = require('crypto');

function hashPassword(pwd) {
    return crypto.createHash('sha256').update(pwd || '').digest('hex');
}

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel } = req.body;
        if (!email || !role || !password) return res.status(400).json({ error: "Missing email, role, or password" });
        
        const supabase = getClient();
        const pwdHash = hashPassword(password);

        // 1. Insert into users table
        const { data: user, error: userErr } = await supabase
            .from('users')
            .insert([{ email, password: pwdHash, role, name: engName || name || '' }])
            .select()
            .single();

        if (userErr) {
            if (userErr.code === '23505') { // Postgres unique_violation
                return res.status(400).json({ error: "Email already registered. Please sign in instead." });
            }
            throw userErr;
        }

        // 2. If role is engineer, insert into talents table
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
                    contact: email
                }]);
            
            if (talentErr) throw talentErr;
            console.log(`[Auth] Registered new engineer: ${engName}`);
        }

        res.json({ status: 'ok', email: user.email, role: user.role, name: user.name });
        
    } catch (err) {
        console.error("Auth Register Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
        
        const supabase = getClient();
        const pwdHash = hashPassword(password);
        
        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (fetchErr || !user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        if (user.password !== pwdHash) {
            // Legacy migration fallback
            if (!user.password) {
                await supabase.from('users').update({ password: pwdHash }).eq('email', email);
                return res.json({ status: 'ok', email: user.email, role: user.role, name: user.name, msg: "Legacy account migrated." });
            }
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.json({ status: 'ok', email: user.email, role: user.role, name: user.name });
    } catch (err) {
        console.error("Auth Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
