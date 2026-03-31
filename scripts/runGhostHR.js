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
        const db = getClient();
        if (!db) {
            throw new Error("DB connection failed.");
        }

        // Create User (Role: Engineer)
        const insertUser = db.prepare(`
            INSERT INTO users (email, role, name) 
            VALUES (?, 'engineer', ?) 
            ON CONFLICT(email) DO UPDATE SET name=excluded.name 
            RETURNING *;
        `);
        const user = insertUser.get(profile.email || `ghost_${Date.now()}@temp.com`, profile.name);

        // Check if Talent exists
        const checkTalent = db.prepare(`SELECT id FROM talents WHERE contact = ?`).get(user.email);
        
        let talentId;
        if (!checkTalent) {
            const insertTalent = db.prepare(`
                INSERT INTO talents (user_id, name, skills, region, rate, pricing_model, level, verified_score, bio, contact)
                VALUES (?, ?, ?, ?, ?, 'hourly', ?, ?, ?, ?)
            `);
            const info = insertTalent.run(
                user.id, profile.name, profile.skills, 
                profile.region || 'Mexico (MX)', profile.rate || '$50/hr', 
                profile.level || 'Senior (7+ yrs)', 
                95, // Ghost profiles get artificially high verified score to attract them
                profile.bio, user.email
            );
            talentId = info.lastInsertRowid;
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
