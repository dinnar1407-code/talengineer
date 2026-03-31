const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { createEscrowSession } = require('../config/stripe');

router.post('/create-escrow', async (req, res) => {
    try {
        const { demandId, amountUSD, engineerId } = req.body;
        
        if (!demandId || !amountUSD || !engineerId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = getClient();
        
        let engineerStripeId = null;
        
        // Mock behavior if no DB or no Stripe
        if (!db || !process.env.STRIPE_SECRET_KEY) {
            return res.json({ 
                status: 'ok', 
                url: `${process.env.DOMAIN || 'http://localhost:4000'}/finance?session_id=mock_session_123&success=true`
            });
        }

        // 1. Fetch Engineer's Stripe Account ID from Supabase
        const { data: engineer, error: engError } = await db
            .from('talents')
            .select('stripe_account_id')
            .eq('user_id', engineerId)
            .single();
            
        if (engError || !engineer || !engineer.stripe_account_id) {
            throw new Error("Engineer has not connected a Stripe account for payouts.");
        }
        
        engineerStripeId = engineer.stripe_account_id;

        // 2. Create Stripe Checkout Session (Escrow)
        const session = await createEscrowSession(demandId, amountUSD, engineerStripeId);
        
        // 3. Update Milestone Status in DB to 'pending_payment'
        // (Assuming client will handle the actual update upon success webhook, 
        // but we could record the payment intent ID here)
        
        res.json({ status: 'ok', url: session.url });

    } catch (err) {
        console.error("Escrow Creation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Webhook endpoint to listen for successful payments and release funds
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    // In a real app, you would verify the Stripe signature here
    const event = req.body;
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`Payment successful for session: ${session.id}`);
            // Logic to update DB status to 'funded'
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

module.exports = router;
