const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.post('/register', async (req, res) => {
    try {
        const { email, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel } = req.body;
        if (!email || !role) return res.status(400).json({ error: "Missing email or role" });
        
        const db = getClient();
        if (!db) {
            // Mock response
            return res.json({ status: 'ok', email, role, name });
        }

        // 1. Insert into users table
        const { data: user, error: userErr } = await db
            .from('users')
            .upsert([{ email, role, name: engName || name || '' }], { onConflict: 'email' })
            .select()
            .single();

        if (userErr) throw userErr;

        // 2. If role is engineer, insert into talents table
        if (role === 'engineer' && engName) {
            const { data: existingTalent, error: checkErr } = await db
                .from('talents')
                .select('id')
                .eq('contact', email)
                .maybeSingle();

            if (!existingTalent) {
                const { error: talentErr } = await db.from('talents').insert([{
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
        }

        res.json({ status: 'ok', email: data.email, role: data.role, name: data.name });
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
