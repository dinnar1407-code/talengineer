const { Resend } = require('resend');
require('dotenv').config();
const { maskEmail } = require('../services/referralService'); // 日志脱敏：收件人邮箱是 PII，落日志前打码（宪法 P1 红线）

let resendClient = null;

if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("📧 [Email Service] Resend API initialized.");
} else {
    console.warn("⚠️ [Email Service] RESEND_API_KEY missing. Emails will only be logged, not sent.");
}

async function sendOutreachEmail(toEmail, subject, htmlBody) {
    if (!resendClient) {
        console.log(`\n[Simulated Email to: ${maskEmail(toEmail)}]\nSubject: ${subject}\n${htmlBody}\n`);
        return true;
    }
    
    try {
        const data = await resendClient.emails.send({
            from: process.env.EMAIL_FROM || 'Talengineer <hello@talengineer.us>',
            to: [toEmail],
            subject: subject,
            html: htmlBody,
        });
        
        console.log(`✅ [Email Sent] Successfully delivered to ${maskEmail(toEmail)} (ID: ${data.id})`);
        return data;
    } catch (error) {
        console.error(`🚨 [Email Error] Failed to send to ${maskEmail(toEmail)}:`, error);
        throw error;
    }
}

module.exports = { sendOutreachEmail };
