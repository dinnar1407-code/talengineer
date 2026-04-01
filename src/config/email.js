const { Resend } = require('resend');
require('dotenv').config();

let resendClient = null;

if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("📧 [Email Service] Resend API initialized.");
} else {
    console.warn("⚠️ [Email Service] RESEND_API_KEY missing. Emails will only be logged, not sent.");
}

async function sendOutreachEmail(toEmail, subject, htmlBody) {
    if (!resendClient) {
        console.log(`\n[Simulated Email to: ${toEmail}]\nSubject: ${subject}\n${htmlBody}\n`);
        return true;
    }
    
    try {
        const data = await resendClient.emails.send({
            // Fallback to onboarding@resend.dev if domain not yet verified
            from: process.env.EMAIL_FROM || 'Talengineer <onboarding@resend.dev>',
            to: [toEmail],
            subject: subject,
            html: htmlBody,
        });
        
        console.log(`✅ [Email Sent] Successfully delivered to ${toEmail} (ID: ${data.id})`);
        return data;
    } catch (error) {
        console.error(`🚨 [Email Error] Failed to send to ${toEmail}:`, error);
        throw error;
    }
}

module.exports = { sendOutreachEmail };
