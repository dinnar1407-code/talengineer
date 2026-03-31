const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.post('/register', async (req, res) => {
    try {
        const { email, role, name, engName, engSkills, engRate, engBio } = req.body;
        if (!email || !role) return res.status(400).json({ error: "Missing email or role" });
        
        const db = getClient();
        if (!db) {
            // Mock response
            return res.json({ status: 'ok', email, role, name });
        }

        // Production logic with Supabase here
        res.json({ status: 'ok', email, role, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
