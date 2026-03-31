const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { parseDemand, generateTechQuestion, gradeTechAnswer } = require('../services/aiService');

router.get('/demands', async (req, res) => {
    try {
        const db = getClient();
        const stmt = db.prepare(`SELECT * FROM demands ORDER BY created_at DESC LIMIT 50`);
        const data = stmt.all();
        res.json({ status: 'ok', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/screen_question', async (req, res) => {
    try {
        const { skills, level, lang } = req.body;
        const question = await generateTechQuestion(skills, level, lang);
        res.json({ status: 'ok', question });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/screen_verify', async (req, res) => {
    try {
        const { question, answer, lang } = req.body;
        const result = await gradeTechAnswer(question, answer, lang);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const db = getClient();
        const stmt = db.prepare(`SELECT * FROM talents ORDER BY created_at DESC LIMIT 50`);
        const data = stmt.all();
        res.json({ status: 'ok', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
