const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { parseDemand, generateTechQuestion, gradeTechAnswer } = require('../services/aiService');

router.get('/demands', async (req, res) => {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.from('demands').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
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
        const supabase = getClient();
        const { region, skills, min_score } = req.query;

        let query = supabase.from('talents').select('*').order('verified_score', { ascending: false }).limit(50);

        if (region && region !== 'all') query = query.ilike('region', `%${region}%`);
        if (skills)                    query = query.ilike('skills', `%${skills}%`);
        if (min_score)                 query = query.gte('verified_score', parseInt(min_score));

        const { data, error } = await query;
        if (error) throw error;
        res.json({ status: 'ok', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
