const { getClient } = require('../config/db');
const { generateMatchEmail } = require('./aiService');

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
        console.log(`📍 [Matchmaker] Required Skills: "${demand.role_required}"`);

        const regionHint = demand.region.includes('MX') || demand.region.includes('Mexico') ? 'MX' : 
                           demand.region.includes('CA') ? 'CA' : 'US';
                           
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

            console.log(`[Email Draft - Ready to Send]`);
            console.log(`To: ${engineer.contact}`);
            console.log(`Subject: Talengineer Match: ${demand.title}`);
            console.log(`Body:\n${emailBody}`);
            console.log(`---------------------------------------------------\n`);
            
            // Real implementation would use SendGrid or Nodemailer here
            // e.g. await sendEmail(engineer.contact, "Talengineer Match", emailBody);
        }

        console.log(`✅ [Matchmaker] Finished outreach for Demand #${demandId}.`);

    } catch (err) {
        console.error(`🚨 [Matchmaker Error]`, err);
    }
}

module.exports = { runMatchmaker };
