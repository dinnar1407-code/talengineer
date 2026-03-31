const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.get('/ledger', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'email required' });

        const db = getClient();
        if (!db) {
            // Mock data for UI testing
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

        // Production query (requires user table join)
        // Simplified for this phase
        res.json({ status: 'ok', data: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/milestones', async (req, res) => {
    try {
        const { demand_id } = req.query;
        
        const db = getClient();
        if (!db) {
            return res.json({
                status: 'ok',
                data: [
                    { phase_name: "Site Survey / Design Review", percentage: 0.10, amount: 800, status: "funded" },
                    { phase_name: "Cabinet Wiring & Basic IO", percentage: 0.30, amount: 2400, status: "locked" },
                    { phase_name: "PLC Logic & Dry Run", percentage: 0.40, amount: 3200, status: "locked" },
                    { phase_name: "Trial Run & Handoff", percentage: 0.20, amount: 1600, status: "locked" }
                ]
            });
        }
        res.json({ status: 'ok', data: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
