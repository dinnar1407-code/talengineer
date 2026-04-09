const { getClient } = require('../config/db');
const { generateMatchEmail } = require('./aiService');
const { sendOutreachEmail } = require('../config/email');

async function runMatchmaker(demandId) {
    console.log(`\n🔍 [Matchmaker] Waking up to process Demand #${demandId}...`);
    try {
        const supabase = getClient();
        if (!supabase) return;

        // 1. Fetch the new demand
        const { data: demand, error: demandErr } = await supabase
            .from('demands')
            .select('*')
            .eq('id', demandId)
            .single();
        
        if (demandErr || !demand) {
            console.log(`❌ [Matchmaker] Demand #${demandId} not found.`);
            return;
        }

        console.log(`📍 [Matchmaker] Project Title: "${demand.title}"`);
        console.log(`📍 [Matchmaker] Required Skills: "${demand.role_required || 'Not specified'}"`);


        const demandRegion = (demand.region && demand.region !== 'null' && demand.region !== 'undefined') ? demand.region : 'US';
        const regionHint = demandRegion && demandRegion.includes('MX') ? 'MX' : 
                           demandRegion && demandRegion.includes('CA') ? 'CA' : 'US';
                           
        const { data: matches, error: talentErr } = await supabase
            .from('talents')
            .select('*')
            .ilike('region', `%${regionHint}%`)
            .order('verified_score', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(3);

        if (talentErr || !matches || matches.length === 0) {
            console.log(`⚠️ [Matchmaker] No engineers found in region ${regionHint}. Will expand search later.`);
            return;
        }

        console.log(`🎯 [Matchmaker] Found ${matches.length} highly matched engineers in ${regionHint}.`);

        // 3. For each matched engineer, generate personalized email
        for (const engineer of matches) {
            console.log(`\n---------------------------------------------------`);
            console.log(`✉️ Drafting outreach email to: ${engineer.name} (${engineer.contact})`);
            console.log(`   Engineer Skills: ${engineer.skills}`);
            
            // Generate the email content using Gemini
            const emailBody = await generateMatchEmail(
                demand.title, 
                demand.description, 
                demand.budget, 
                engineer.name, 
                engineer.skills, 
                engineer.region
            );

            // Format the text into HTML
            const htmlBody = emailBody.split('\n').map(line => `<p>${line}</p>`).join('');

            // Automatically create a pending ledger entry (Escrow tracking)
            const { data: ledgerEntry, error: ledgerErr } = await supabase
                .from('ledgers')
                .insert([{
                    demand_id: demand.id,
                    employer_id: demand.employer_id || 1,
                    employer_email: demand.contact,
                    engineer_id: engineer.id,
                    engineer_email: engineer.contact,
                    total_amount: parseFloat((demand.budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000,
                    status: 'pending'
                }]);

            if (ledgerErr) {
                 console.log(`⚠️ [Matchmaker] Failed to create ledger entry for ${engineer.name}:`, ledgerErr.message);
            }

            // Actually fire the email via Resend
            const subject = `Talengineer Match: ${demand.title}`;
            await sendOutreachEmail(engineer.contact, subject, htmlBody);
            
            console.log(`---------------------------------------------------\n`);
        }

        console.log(`✅ [Matchmaker] Finished outreach for Demand #${demandId}.`);

    } catch (err) {
        console.error(`🚨 [Matchmaker Error]`, err);
    }
}

module.exports = { runMatchmaker };
