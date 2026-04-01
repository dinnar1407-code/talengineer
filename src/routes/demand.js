const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { parseDemand } = require('../services/aiService');
const { runMatchmaker } = require('../services/matchmakerService');

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
        const supabase = getClient();
        const { employer_id, title, role_required, region, project_type, location, budget, description, contact, milestones } = req.body;
        
        // Extract budget number
        const budgetAmount = parseFloat((budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000;

        // 1. Insert Demand
        const { data: demand, error: demandErr } = await supabase
            .from('demands')
            .insert([{
                employer_id: employer_id || 1, 
                title, role_required, region, project_type, location, budget, description, contact, status: 'open'
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
                amount: budgetAmount * m.percentage,
                status: 'locked'
            }));
            const { error: msErr } = await supabase.from('project_milestones').insert(msData);
            if (msErr) throw msErr;
        }

        // 3. Trigger Async Matchmaker Outreach
        setTimeout(() => {
            runMatchmaker(demand.id).catch(console.error);
        }, 1000);

        res.json({ status: 'ok', id: demand.id });
        
    } catch (err) {
        console.error("Demand Submit Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
