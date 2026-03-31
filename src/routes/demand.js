const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { parseDemand } = require('../services/aiService');

// Submit raw demand and get AI parsed SoW
router.post('/parse', async (req, res) => {
    try {
        const { raw_text } = req.body;
        if (!raw_text) return res.status(400).json({ error: "Missing raw_text" });
        
        const parsedData = await parseDemand(raw_text);
        res.json({ status: 'ok', data: parsedData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save parsed demand to DB
router.post('/submit', async (req, res) => {
    try {
        const db = getClient();
        if (!db) {
            // Mock
            return res.json({ status: 'ok', id: 'mock-uuid-123' });
        }
        
        const { employer_id, title, role_required, region, project_type, location, budget, description, contact, milestones } = req.body;
        
        // 1. Insert Demand
        const { data: demand, error: demandErr } = await db
            .from('demands')
            .insert([{
                employer_id, title, role_required, region, project_type, location, budget, description, contact, status: 'open'
            }])
            .select()
            .single();
            
        if (demandErr) throw demandErr;
        
        // 2. Insert Milestones
        if (milestones && milestones.length > 0) {
            const msData = milestones.map(m => ({
                demand_id: demand.id,
                phase_name: m.phase_name,
                percentage: m.percentage,
                amount: parseFloat(budget) * m.percentage, // Need clean budget parsing in reality
                status: 'locked'
            }));
            
            const { error: msErr } = await db.from('project_milestones').insert(msData);
            if (msErr) throw msErr;
        }

        res.json({ status: 'ok', id: demand.id });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
