const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
require('dotenv').config();

// Since we don't have real Stripe keys locally yet, we will simulate the Stripe Connect flow
// with local DB updates to represent Escrow Funding and Escrow Release.

// 1. Employer Funds a Milestone (Money goes to Platform Escrow)
router.post('/fund-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id } = req.body;
        if (!milestone_id) return res.status(400).json({ error: "Missing milestone_id" });

        const db = getClient();
        
        // Simulate Stripe Checkout Success
        const updateStmt = db.prepare(`
            UPDATE project_milestones 
            SET status = 'funded' 
            WHERE id = ? AND demand_id = ?
        `);
        const info = updateStmt.run(milestone_id, demand_id);

        if (info.changes > 0) {
            console.log(`💳 [Stripe Connect Mock] Milestone ${milestone_id} FUNDED. Funds securely held in Escrow.`);
            res.json({ status: 'ok', message: "Milestone funded successfully." });
        } else {
            res.status(404).json({ error: "Milestone not found." });
        }
    } catch (err) {
        console.error("Fund Milestone Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Employer Approves Work -> Platform Releases Funds (Minus 15% Commision) to Engineer's Connected Account
router.post('/release-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id } = req.body;
        if (!milestone_id) return res.status(400).json({ error: "Missing milestone_id" });

        const db = getClient();
        
        // Get Milestone Details
        const ms = db.prepare(`SELECT * FROM project_milestones WHERE id = ? AND demand_id = ?`).get(milestone_id, demand_id);
        if (!ms) return res.status(404).json({ error: "Milestone not found." });
        if (ms.status !== 'funded') return res.status(400).json({ error: "Milestone must be 'funded' before release." });

        const amount = parseFloat(ms.amount);
        const platformFee = amount * 0.15;
        const engineerPayout = amount - platformFee;

        // Simulate Stripe Transfer to Connected Account
        const updateStmt = db.prepare(`
            UPDATE project_milestones 
            SET status = 'released' 
            WHERE id = ? AND demand_id = ?
        `);
        updateStmt.run(milestone_id, demand_id);

        console.log(`\n💸 [Stripe Connect Mock - PAYOUT TRIGGERED]`);
        console.log(`   Milestone: ${ms.phase_name}`);
        console.log(`   Total Escrow Amount: $${amount.toFixed(2)}`);
        console.log(`   Platform Fee (15%):  $${platformFee.toFixed(2)} -> Sent to Talengineer Treasury`);
        console.log(`   Engineer Payout:     $${engineerPayout.toFixed(2)} -> Sent to Engineer's Local Bank`);
        console.log(`---------------------------------------------------\n`);

        res.json({ 
            status: 'ok', 
            message: "Funds released to engineer.",
            payout_details: {
                total: amount,
                fee: platformFee,
                payout: engineerPayout
            }
        });

    } catch (err) {
        console.error("Release Milestone Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
