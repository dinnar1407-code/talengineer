const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.get('/ledger', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'email required' });

        const supabase = getClient();
        const { data, error } = await supabase
            .from('financial_ledgers')
            .select('*')
            .or(`employer_email.eq.${email},engineer_email.eq.${email}`)
            .order('created_at', { ascending: false });
            
        if (error) throw error;

        if (!data || data.length === 0) {
            return res.json({
                status: 'ok',
                data: [
                    {
                        demand_id: '1082',
                        employer_email: 'terry.qin@outlook.com',
                        engineer_email: 'juan.perez@mexico.com',
                        hourly_rate: 85,
                        hours_worked: 40,
                        total_amount: 3400,
                        status: 'pending'
                    }
                ]
            });
        }

        res.json({ status: 'ok', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/milestones', async (req, res) => {
    try {
        const { demand_id } = req.query;
        const supabase = getClient();
        
        let data = [];
        if (demand_id) {
            const { data: msData, error } = await supabase
                .from('project_milestones')
                .select('*')
                .eq('demand_id', demand_id);
            if (error) throw error;
            data = msData;
        }

        if (!data || data.length === 0) {
            return res.json({
                status: 'ok',
                data: [
                    { id: 991, demand_id: demand_id || 1, phase_name: "Site Survey / Design Review", percentage: 0.10, amount: 800, status: "funded" },
                    { id: 992, demand_id: demand_id || 1, phase_name: "Cabinet Wiring & Basic IO", percentage: 0.30, amount: 2400, status: "locked" },
                    { id: 993, demand_id: demand_id || 1, phase_name: "PLC Logic & Dry Run", percentage: 0.40, amount: 3200, status: "locked" },
                    { id: 994, demand_id: demand_id || 1, phase_name: "Trial Run & Handoff", percentage: 0.20, amount: 1600, status: "locked" }
                ]
            });
        }
        res.json({ status: 'ok', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
