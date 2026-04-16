const FROM = process.env.EMAIL_FROM || 'TalEngineer <hello@talengineer.us>';
const DOMAIN = process.env.DOMAIN || 'https://talengineer.us';

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email to:', to);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[Email] Send failed:', err);
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

function wrap(body) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#111827">${body}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/><p style="font-size:12px;color:#6b7280">TalEngineer · <a href="${DOMAIN}" style="color:#6b7280">${DOMAIN.replace('https://', '')}</a></p></div>`;
}

function emailMilestoneFunded({ engineerEmail, engineerName, projectTitle, phaseName, amount }) {
  return sendEmail({
    to: engineerEmail,
    subject: `💰 Milestone funded: ${phaseName} — you're up!`,
    html: wrap(`
      <h2 style="color:#0056b3;margin-top:0">Milestone Funded</h2>
      <p>Hi ${engineerName || 'there'},</p>
      <p>The client has funded the <strong>${phaseName}</strong> milestone for <strong>${projectTitle}</strong>.</p>
      <p style="font-size:28px;font-weight:800;color:#0056b3;margin:16px 0">$${Number(amount).toLocaleString()} locked in escrow</p>
      <p><a href="${DOMAIN}/finance" style="background:#0056b3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Dashboard</a></p>
    `),
  });
}

function emailMilestoneReleased({ engineerEmail, engineerName, phaseName, payout }) {
  return sendEmail({
    to: engineerEmail,
    subject: `✅ Payment released: $${Number(payout).toFixed(2)} on its way`,
    html: wrap(`
      <h2 style="color:#10b981;margin-top:0">Funds Released!</h2>
      <p>Hi ${engineerName || 'there'},</p>
      <p>The client approved your work on <strong>${phaseName}</strong>.</p>
      <p style="font-size:28px;font-weight:800;color:#10b981;margin:16px 0">$${Number(payout).toFixed(2)}</p>
      <p>Funds typically arrive within 1–2 business days. Check your Stripe Express dashboard for details.</p>
    `),
  });
}

function emailPaymentFailed({ employerEmail, projectTitle, phaseName }) {
  return sendEmail({
    to: employerEmail,
    subject: `⚠️ Payment failed: ${phaseName} — ${projectTitle}`,
    html: wrap(`
      <h2 style="color:#ef4444;margin-top:0">Payment Failed</h2>
      <p>Your payment for the <strong>${phaseName}</strong> milestone on <strong>${projectTitle}</strong> could not be processed.</p>
      <p><a href="${DOMAIN}/finance" style="background:#0056b3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Retry Payment</a></p>
    `),
  });
}

function emailEngineerAssigned({ engineerEmail, engineerName, projectTitle, clientContact }) {
  return sendEmail({
    to: engineerEmail,
    subject: `🎉 You've been assigned to: ${projectTitle}`,
    html: wrap(`
      <h2 style="color:#0056b3;margin-top:0">Project Assignment</h2>
      <p>Hi ${engineerName || 'there'},</p>
      <p>You have been assigned to the project <strong>${projectTitle}</strong>.</p>
      <p>Client contact: <strong>${clientContact}</strong></p>
      <p><a href="${DOMAIN}/finance" style="background:#0056b3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Dashboard</a></p>
    `),
  });
}

function emailNewApplication({ employerEmail, projectTitle, engineerName, applicationMessage }) {
  return sendEmail({
    to: employerEmail,
    subject: `📋 New application for: ${projectTitle}`,
    html: wrap(`
      <h2 style="color:#0056b3;margin-top:0">New Application Received</h2>
      <p><strong>${engineerName}</strong> has applied to your project <strong>${projectTitle}</strong>.</p>
      ${applicationMessage ? `<blockquote style="border-left:4px solid #e5e7eb;margin:16px 0;padding:12px 16px;color:#374151;font-style:italic">${applicationMessage}</blockquote>` : ''}
      <p><a href="${DOMAIN}/finance" style="background:#0056b3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Review Applications</a></p>
    `),
  });
}

function emailPasswordReset({ userEmail, resetUrl }) {
  return sendEmail({
    to: userEmail,
    subject: 'Reset your TalEngineer password',
    html: wrap(`
      <h2 style="color:#0056b3;margin-top:0">Password Reset</h2>
      <p>We received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#0056b3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a></p>
      <p style="font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

module.exports = {
  emailMilestoneFunded,
  emailMilestoneReleased,
  emailPaymentFailed,
  emailEngineerAssigned,
  emailNewApplication,
  emailPasswordReset,
};
