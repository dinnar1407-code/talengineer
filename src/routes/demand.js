const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { parseDemand } = require('../services/aiService');
const { runMatchmaker } = require('../services/matchmakerService');

// Submit raw demand and get AI parsed SoW (For UI / Manual confirmation)
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

// ZERO-UI QUICK LAUNCH API (For Voice / Chatbot integration)
router.post('/quick_launch', async (req, res) => {
    try {
        const { raw_text, employer_email } = req.body;
        if (!raw_text) return res.status(400).json({ error: "Missing raw_text" });

        // 1. Instantly parse the raw intent using AI
        const parsedData = await parseDemand(raw_text);
        if (!parsedData || !parsedData.title) throw new Error("AI failed to parse demand.");

        // We assume employer_id 1 for anonymous / chatbot quick launches if no email provided
        // In a real scenario, we would lookup employer_id by employer_email
        let employer_id = 1;

        const supabase = getClient();
        
        // 2. Insert Demand into DB automatically
        const budgetAmount = parseFloat((parsedData.budget || '1000').toString().replace(/[^0-9.]/g, '')) || 1000;
        
        const { data: demand, error: demandErr } = await supabase
            .from('demands')
            .insert([{
                employer_id: employer_id, 
                title: parsedData.title, 
                role_required: parsedData.role_required, 
                region: parsedData.region || 'Remote', 
                project_type: parsedData.project_type || 'Quick Launch', 
                location: parsedData.location || 'TBD', 
                budget: parsedData.budget || '$1000', 
                description: parsedData.standardized_description, 
                contact: employer_email || 'quicklaunch@talengineer.us', 
                status: 'open'
            }])
            .select()
            .single();
            
        if (demandErr) throw demandErr;

        // 3. Insert Milestones automatically
        if (parsedData.milestones && parsedData.milestones.length > 0) {
            const msData = parsedData.milestones.map(m => ({
                demand_id: demand.id,
                phase_name: m.phase_name,
                percentage: m.percentage,
                amount: budgetAmount * m.percentage,
                status: 'locked'
            }));
            const { error: msErr } = await supabase.from('project_milestones').insert(msData);
            if (msErr) throw msErr;
        }

        // 4. Trigger Async Matchmaker Outreach instantly
        setTimeout(() => {
            runMatchmaker(demand.id).catch(console.error);
        }, 1000);

        res.json({ 
            status: 'ok', 
            message: 'Zero-UI Launch Successful. Matchmaker is now hunting for engineers.',
            demand_id: demand.id,
            parsed_summary: parsedData
        });

    } catch (err) {
        console.error("Quick Launch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Save parsed demand to DB (Manual form submission)
router.post('/submit', async (req, res) => {
    try {
        const supabase = getClient();
        const { employer_id, title, role_required, region, project_type, location, budget, description, contact, milestones } = req.body;
        
        const budgetAmount = parseFloat((budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000;

        const { data: demand, error: demandErr } = await supabase
            .from('demands')
            .insert([{
                employer_id: employer_id || 1, 
                title, role_required, region, project_type, location, budget, description, contact, status: 'open'
            }])
            .select()
            .single();
            
        if (demandErr) throw demandErr;
        
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