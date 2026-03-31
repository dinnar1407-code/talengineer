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
        
        const db = getClient();
        const pwdHash = hashPassword(password);

        try {
            // 1. Insert into users table (do not overwrite if exists in register to prevent hijacking)
            const insertUser = db.prepare(`
                INSERT INTO users (email, password, role, name) 
                VALUES (?, ?, ?, ?) 
                RETURNING *;
            `);
            const user = insertUser.get(email, pwdHash, role, engName || name || '');

            // 2. If role is engineer, insert into talents table
            if (role === 'engineer' && engName) {
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

            res.json({ status: 'ok', email: user.email, role: user.role, name: user.name });
        } catch (e) {
            if (e.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Email already registered. Please sign in instead." });
            }
            throw e;
        }
    } catch (err) {
        console.error("Auth Register Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
        
        const db = getClient();
        const pwdHash = hashPassword(password);
        
        const user = db.prepare(`SELECT * FROM users WHERE email = ? AND password = ?`).get(email, pwdHash);
        
        if (!user) {
            // Also allow the old users without password to sign in with any password for demo purposes?
            // Actually, let's keep it strict but friendly. If they don't have a password, they need to re-register or update.
            const userWithoutPwd = db.prepare(`SELECT * FROM users WHERE email = ? AND password IS NULL`).get(email);
            if (userWithoutPwd) {
                db.prepare(`UPDATE users SET password = ? WHERE email = ?`).run(pwdHash, email);
                return res.json({ status: 'ok', email: userWithoutPwd.email, role: userWithoutPwd.role, name: userWithoutPwd.name, msg: "Legacy account migrated." });
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
