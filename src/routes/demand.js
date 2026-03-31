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
        const db = getClient();
        const { employer_id, title, role_required, region, project_type, location, budget, description, contact, milestones } = req.body;
        
        // Extract budget number
        const budgetAmount = parseFloat((budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000;

        // 1. Insert Demand
        const insertDemand = db.prepare(`
            INSERT INTO demands (employer_id, title, role_required, region, project_type, location, budget, description, contact, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
            RETURNING id;
        `);
        const demand = insertDemand.get(
            employer_id || 1, title, role_required, region, project_type, location, budget, description, contact
        );
        
        // 2. Insert Milestones
        if (milestones && milestones.length > 0) {
            const insertMilestone = db.prepare(`
                INSERT INTO project_milestones (demand_id, phase_name, percentage, amount, status)
                VALUES (?, ?, ?, ?, 'locked')
            `);
            const insertMany = db.transaction((msList) => {
                for (let m of msList) {
                    insertMilestone.run(demand.id, m.phase_name, m.percentage, budgetAmount * m.percentage);
                }
            });
            insertMany(milestones);
        }

        // 3. Trigger Async Matchmaker Outreach
        setTimeout(() => {
            runMatchmaker(demand.id).catch(console.error);
        }, 1000); // Slight delay to ensure DB transaction commits completely

        res.json({ status: 'ok', id: demand.id });
        
    } catch (err) {
        console.error("Demand Submit Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
