const { initDB, getClient } = require('../src/config/db');
const { parseGhostProfile, generateGhostOutreachEmail } = require('../src/services/aiService');

// Initialize local DB connection
initDB();

// Mock raw forum post or LinkedIn summary
const mockForumPost = `
Hola a todos en el foro de Automatización Industrial. 
Soy Carlos Mendoza, vivo en Monterrey, Nuevo León, México.
Llevo más de 8 años trabajando en campo integrando celdas robotizadas y sistemas de visión.
Especialista en PLCs Allen-Bradley (Studio 5000), Siemens TIA Portal V16/V17, y programación de robots Yaskawa y FANUC.
He trabajado mucho para la industria automotriz armando líneas de ensamblaje desde cero.
Actualmente busco proyectos freelance los fines de semana o después de las 5 pm.
Me pueden contactar en carlos.automation@monterrey.mx.
Cobro unos 1500 pesos al día dependiendo la falla. Saludos!
`;

async function runGhostHR() {
    console.log("👻 [Ghost HR Agent] Waking up...");
    console.log("🕵️  [Ghost HR Agent] Scraping target: LatAm Industrial Automation Forums...");
    console.log("📥  [Ghost HR Agent] Found 1 new post. Parsing unstructured data with Gemini...");

    try {
        // Step 1: AI Parse Profile
        const profile = await parseGhostProfile(mockForumPost);
        console.log("\n🧠 [Gemini Parsing Result]:");
        console.log(JSON.stringify(profile, null, 2));

        // Step 2: Create "Ghost" Profile in DB
        const supabase = getClient();
        if (!supabase) {
            throw new Error("DB connection failed.");
        }

        const mockEmail = profile.email || `ghost_${Date.now()}@temp.com`;

        // Create User (Role: Engineer)
        const { data: user, error: userErr } = await supabase
            .from('users')
            .upsert([{ email: mockEmail, role: 'engineer', name: profile.name, password: 'GHOST_NO_LOGIN' }], { onConflict: 'email' })
            .select()
            .single();
            
        if (userErr) throw userErr;

        // Check if Talent exists
        const { data: existingTalent } = await supabase
            .from('talents')
            .select('id')
            .eq('contact', user.email)
            .maybeSingle();
        
        let talentId;
        if (!existingTalent) {
            const { data: newTalent, error: talentErr } = await supabase
                .from('talents')
                .insert([{
                    user_id: user.id,
                    name: profile.name,
                    skills: profile.skills,
                    region: profile.region || 'Mexico (MX)',
                    rate: profile.rate || '$50/hr',
                    pricing_model: 'hourly',
                    level: profile.level || 'Senior (7+ yrs)',
                    verified_score: 95,
                    bio: profile.bio,
                    contact: user.email
                }])
                .select()
                .single();
                
            if (talentErr) throw talentErr;
            talentId = newTalent.id;
            console.log(`\n✅ [DB Injection] Created Ghost Profile for ${profile.name} (Talent ID: ${talentId})`);
        } else {
            console.log(`\n⚠️ [DB Injection] Profile for ${user.email} already exists. Skip creation.`);
        }

        // Step 3: Generate Cold Email
        console.log("\n✉️  [Ghost HR Agent] Drafting highly persuasive cold-outreach email...");
        const emailBody = await generateGhostOutreachEmail(profile);

        console.log("\n========================================================");
        console.log(`📧 TO: ${user.email}`);
        console.log(`✨ SUBJECT: ${profile.name}, You've been pre-approved as an Elite Engineer on Talengineer!`);
        console.log("--------------------------------------------------------");
        console.log(emailBody);
        console.log("========================================================\n");
        console.log("🚀 [Ghost HR Agent] Action completed. Back to sleep.");

    } catch (err) {
        console.error("🚨 [Ghost HR Agent Error]", err);
    }
}

// Run script
runGhostHR();
