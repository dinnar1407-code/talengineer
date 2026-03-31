const { getClient } = require('../config/db');
const { generateMatchEmail } = require('./aiService');

async function runMatchmaker(demandId) {
    console.log(`\n🔍 [Matchmaker] Waking up to process Demand #${demandId}...`);
    try {
        const db = getClient();
        if (!db) return;

        // 1. Fetch the new demand
        const demandStmt = db.prepare(`SELECT * FROM demands WHERE id = ?`);
        const demand = demandStmt.get(demandId);
        
        if (!demand) {
            console.log(`❌ [Matchmaker] Demand #${demandId} not found.`);
            return;
        }

        console.log(`📍 [Matchmaker] Project Title: "${demand.title}"`);
        console.log(`📍 [Matchmaker] Required Skills: "${demand.role_required}"`);

        // 2. Query talents based on region (simplistic match for now)
        // In a real scenario, we'd use pgvector or complex SQL to rank skills.
        const talentStmt = db.prepare(`
            SELECT * FROM talents 
            WHERE region LIKE '%' || ? || '%'
            ORDER BY verified_score DESC, created_at DESC
            LIMIT 3
        `);
        
        // Extract country from region (e.g. "Mexico (MX)" -> "MX")
        const regionHint = demand.region.includes('MX') || demand.region.includes('Mexico') ? 'MX' : 
                           demand.region.includes('CA') ? 'CA' : 'US';
                           
        const matches = talentStmt.all(regionHint);

        if (matches.length === 0) {
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
