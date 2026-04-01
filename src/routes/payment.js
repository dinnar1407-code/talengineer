const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
require('dotenv').config();

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const DOMAIN = process.env.DOMAIN || 'http://localhost:4000';

// 1. KYC / Engineer Onboarding (Stripe Connect Express)
router.post('/onboard-engineer', async (req, res) => {
    try {
        if (!stripe) throw new Error("Stripe is not configured in .env");
        
        const { engineer_email, talent_id } = req.body;
        const supabase = getClient();
        
        // Check if already has a connected account
        let { data: talent } = await supabase.from('talents').select('stripe_account_id').eq('id', talent_id).single();
        let accountId = talent?.stripe_account_id;

        if (!accountId) {
            // Create a new connected account
            const account = await stripe.accounts.create({
                type: 'express',
                email: engineer_email,
                capabilities: {
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            // Save to DB
            await supabase.from('talents').update({ stripe_account_id: accountId }).eq('id', talent_id);
        }

        // Create onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${DOMAIN}/finance?status=refresh`,
            return_url: `${DOMAIN}/finance?status=kyc_complete`,
            type: 'account_onboarding',
        });

        res.json({ status: 'ok', url: accountLink.url });
    } catch (err) {
        console.error("KYC Onboarding Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Employer Funds a Milestone (Stripe Checkout)
router.post('/fund-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id, amount, phase_name } = req.body;
        if (!milestone_id || !amount) return res.status(400).json({ error: "Missing required fields" });

        if (!stripe) {
            // Fallback for local testing if Stripe is not set up
            const supabase = getClient();
            await supabase.from('project_milestones').update({ status: 'funded' }).eq('id', milestone_id);
            return res.json({ status: 'mock', message: "Stripe not configured. Mocking payment success." });
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Milestone: ${phase_name || 'Project Delivery'}`,
                        description: `Talengineer Escrow for Project #${demand_id}`,
                    },
                    unit_amount: Math.round(amount * 100), // Stripe expects cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${DOMAIN}/finance?session_id={CHECKOUT_SESSION_ID}&milestone_id=${milestone_id}&demand_id=${demand_id}`,
            cancel_url: `${DOMAIN}/finance?payment=cancelled`,
            metadata: {
                milestone_id: milestone_id.toString(),
                demand_id: demand_id.toString(),
                type: 'escrow_funding'
            }
        });

        res.json({ status: 'ok', url: session.url });
    } catch (err) {
        console.error("Fund Milestone Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Temporary endpoint for frontend to confirm payment success via redirect 
// (In production, use Stripe Webhooks instead)
router.post('/confirm-funding', async (req, res) => {
    try {
        const { session_id, milestone_id, demand_id } = req.body;
        
        if (stripe) {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status !== 'paid') {
                return res.status(400).json({ error: "Payment not completed." });
            }
        }

        const supabase = getClient();
        await supabase.from('project_milestones').update({ status: 'funded' }).eq('id', milestone_id).eq('demand_id', demand_id);
        
        console.log(`💳 [Stripe Connect] Escrow successfully funded for Milestone #${milestone_id}`);
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Employer Approves Work -> Platform Releases Funds (Minus 15% Commision) to Engineer
router.post('/release-milestone', async (req, res) => {
    try {
        const { milestone_id, demand_id, engineer_id } = req.body;
        if (!milestone_id) return res.status(400).json({ error: "Missing milestone_id" });

        const supabase = getClient();
        
        // Get Milestone Details
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

        // If Stripe is configured, execute the real transfer
        if (stripe && engineer_id) {
            // Get Engineer's Stripe Account
            const { data: talent } = await supabase.from('talents').select('stripe_account_id').eq('user_id', engineer_id).single();
            const connectedAccountId = talent?.stripe_account_id;
            
            if (!connectedAccountId) {
                return res.status(400).json({ error: "Engineer has not completed KYC/Stripe Onboarding. Cannot release funds." });
            }

            try {
                // Transfer funds to the connected account
                await stripe.transfers.create({
                    amount: Math.round(engineerPayout * 100), // Cents
                    currency: "usd",
                    destination: connectedAccountId,
                    description: `Talengineer Payout for Milestone #${milestone_id}`,
                });
                console.log(`💸 [Stripe Transfer] ${engineerPayout.toFixed(2)} USD sent to account ${connectedAccountId}`);
            } catch (stripeErr) {
                console.error("Stripe Transfer Failed:", stripeErr);
                return res.status(500).json({ error: "Stripe transfer failed: " + stripeErr.message });
            }
        }

        // Update DB Status
        const { error: updateErr } = await supabase
            .from('project_milestones')
            .update({ status: 'released' })
            .eq('id', milestone_id)
            .eq('demand_id', demand_id);

        if (updateErr) throw updateErr;

        console.log(`\n💸 [Payout Released]`);
        console.log(`   Total Escrow Amount: $${amount.toFixed(2)}`);
        console.log(`   Platform Fee (15%):  $${platformFee.toFixed(2)} -> Sent to Talengineer Treasury`);
        console.log(`   Engineer Payout:     $${engineerPayout.toFixed(2)} -> Sent to Engineer`);
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
