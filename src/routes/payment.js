const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
require('dotenv').config();

router.post('/fund-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id } = req.body;
        if (!milestone_id) return res.status(400).json({ error: "Missing milestone_id" });

        const supabase = getClient();
        
        const { data, error } = await supabase
            .from('project_milestones')
            .update({ status: 'funded' })
            .eq('id', milestone_id)
            .eq('demand_id', demand_id)
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
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

router.post('/release-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id } = req.body;
        if (!milestone_id) return res.status(400).json({ error: "Missing milestone_id" });

        const supabase = getClient();
        
        const { data: ms, error: msErr } = await supabase
            .from('project_milestones')
            .select('*')
            .eq('id', milestone_id)
            .eq('demand_id', demand_id)
            .single();

        if (msErr || !ms) return res.status(404).json({ error: "Milestone not found." });
        if (ms.status !== 'funded') return res.status(400).json({ error: "Milestone must be 'funded' before release." });

        const amount = parseFloat(ms.amount);
        const platformFee = amount * 0.15;
        const engineerPayout = amount - platformFee;

        const { error: updateErr } = await supabase
            .from('project_milestones')
            .update({ status: 'released' })
            .eq('id', milestone_id)
            .eq('demand_id', demand_id);

        if (updateErr) throw updateErr;

        console.log(`\n💸 [Stripe Connect Mock - PAYOUT TRIGGERED]`);
        console.log(`   Milestone: ${ms.phase_name}`);
        console.log(`   Total Escrow Amount: $${amount.toFixed(2)}`);
        console.log(`   Platform Fee (15%):  $${platformFee.toFixed(2)} -> Sent to Talengineer Treasury`);
        console.log(`   Engineer Payout:     $${engineerPayout.toFixed(2)} -> Sent to Engineer's Local Bank`);
        console.log(`---------------------------------------------------\n`);

        res.json({ 
            status: 'ok', 
            message: "Funds released to engineer.",
            payout_details: { total: amount, fee: platformFee, payout: engineerPayout }
        });

    } catch (err) {
        console.error("Release Milestone Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
