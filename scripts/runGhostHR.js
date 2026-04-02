const { getClient } = require('../src/config/db');
const { parseGhostProfile, generateGhostOutreachEmail } = require('../src/services/aiService');
const { sendOutreachEmail } = require('../src/config/email');

// Simulated Scraped Data from LinkedIn/Reddit/Forums
const MOCK_SCRAPED_PROFILES = [
  {
    rawText: `Soy Juan Carlos, ingeniero en Monterrey, México. Tengo 5 años de experiencia programando PLCs Allen Bradley y Siemens TIA Portal. He integrado robots KUKA en líneas de ensamblaje automotriz. Busco proyectos freelance los fines de semana. Mi correo es juan.carlos.automation@gmail.com.`,
    source: "Reddit r/PLC"
  },
  {
    rawText: `Senior Controls Engineer based in Detroit, Michigan. 10+ years working with Fanuc robots, SCADA systems (Ignition), and Omron PLCs. Specialized in emergency troubleshooting for manufacturing plants. Contact: david.smith.controls@outlook.com`,
    source: "LinkedIn Post"
  }
];

async function runGhostHR() {
    console.log(`\n👻 [Ghost HR] Waking up... Scanning for new talent leads...`);
    
    try {
        const supabase = getClient();
        if (!supabase) throw new Error("Database client not initialized");

        for (const lead of MOCK_SCRAPED_PROFILES) {
            console.log(`\n---------------------------------------------------`);
            console.log(`📡 [Ghost HR] Analyzing scraped profile from ${lead.source}...`);

            // 1. AI Parsing: Convert unstructured text into a standard DB Profile
            const profile = await parseGhostProfile(lead.rawText);
            
            if (!profile || !profile.email) {
                console.log(`⚠️ [Ghost HR] Could not extract valid email or profile data. Skipping.`);
                continue;
            }

            console.log(`🧠 [Ghost HR] Extracted Identity: ${profile.name} | Skills: ${profile.skills} | Expected Rate: ${profile.rate}`);

            // 2. Check if already exists in our DB
            const { data: existingUser } = await supabase
                .from('talents')
                .select('id')
                .eq('contact', profile.email)
                .single();

            if (existingUser) {
                console.log(`⏭️ [Ghost HR] ${profile.email} is already registered. Skipping.`);
                continue;
            }

            // 3. Shadow Creation: Insert a "Ghost Profile" into the DB
            // We set a temporary password and a 'pending_claim' flag (if our schema supported it)
            // For now, we just insert them as a regular talent with a default verification score of 0
            const { error: insertErr } = await supabase
                .from('talents')
                .insert([{
                    name: profile.name,
                    contact: profile.email,
                    skills: profile.skills,
                    region: profile.region,
                    level: profile.level,
                    rate: profile.rate,
                    bio: profile.bio + " (Auto-imported by Nexus HR)",
                    verified_score: 0 // Needs to claim profile and take the AI interview to verify
                }]);

            if (insertErr) {
                console.log(`❌ [Ghost HR] DB Insert failed for ${profile.email}: ${insertErr.message}`);
                continue;
            }
            console.log(`💾 [Ghost HR] Successfully created shadow profile for ${profile.email}`);

            // 4. Outreach: Generate highly personalized Cold Email
            console.log(`✉️ [Ghost HR] Drafting hyper-personalized outreach email...`);
            const emailBody = await generateGhostOutreachEmail(profile);
            const htmlBody = emailBody.split('\n').map(line => `<p>${line}</p>`).join('');

            // 5. Fire Email via Resend
            const subject = `Talengineer VIP Invite: We found your profile on ${lead.source}`;
            await sendOutreachEmail(profile.email, subject, htmlBody);
            
            console.log(`🚀 [Ghost HR] Outreach email sent to ${profile.email}!`);
            console.log(`---------------------------------------------------\n`);
        }

        console.log(`🏁 [Ghost HR] Scan complete. Going back to sleep.`);

    } catch (err) {
        console.error(`🚨 [Ghost HR Error]`, err);
    }
}

// Execute the script
runGhostHR().then(() => process.exit(0));
