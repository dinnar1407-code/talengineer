require('dotenv').config({ path: __dirname + '/../.env' });
const { sendOutreachEmail } = require('../src/config/email');

async function test() {
    console.log("🚀 Testing real email delivery via Resend API...");
    try {
        const htmlBody = `
            <h2>¡Hola Terry! Welcome to Talengineer</h2>
            <p>This is a live test from the <strong>Talengineer V13.0</strong> production backend.</p>
            <p>If you are reading this, your custom domain (<strong>talengineer.us</strong>) DKIM and SPF records are fully verified, and the AI Matchmaker is ready to send cold outreach emails globally.</p>
            <br>
            <p><em>Saludos cordiales,</em><br><strong>Nexus AI Matchmaker</strong></p>
        `;
        
        await sendOutreachEmail('yhqin1980@gmail.com', 'System Test: Talengineer Domain Verified 🚀', htmlBody);
        console.log("✅ Check your inbox (yhqin1980@gmail.com)!");
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

test();
