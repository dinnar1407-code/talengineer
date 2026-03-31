const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.post('/register', async (req, res) => {
    try {
        const { email, role, name, engName, engSkills, engRate, engBio, engRegion, engLevel, engPricingModel } = req.body;
        if (!email || !role) return res.status(400).json({ error: "Missing email or role" });
        
        const db = getClient();

        // 1. Insert/Update into users table
        const insertUser = db.prepare(`
            INSERT INTO users (email, role, name) 
            VALUES (?, ?, ?) 
            ON CONFLICT(email) DO UPDATE SET name=excluded.name 
            RETURNING *;
        `);
        const user = insertUser.get(email, role, engName || name || '');

        // 2. If role is engineer, insert into talents table
        if (role === 'engineer' && engName) {
            const checkTalent = db.prepare(`SELECT id FROM talents WHERE contact = ?`);
            const existingTalent = checkTalent.get(email);

            if (!existingTalent) {
                const insertTalent = db.prepare(`
                    INSERT INTO talents (user_id, name, skills, region, rate, pricing_model, level, verified_score, bio, contact)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                insertTalent.run(
                    user.id, engName, engSkills || 'Automation Engineer',
                    engRegion || 'US/CA/MX', engRate || 'Open',
                    engPricingModel || 'hourly', engLevel || 'Mid',
                    0, engBio || '', email
                );
                console.log(`[Auth] Registered new engineer: ${engName}`);
            }
        }

        res.json({ status: 'ok', email: user.email, role: user.role, name: user.name });
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
