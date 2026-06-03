const crypto = require('crypto');

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateResetToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function getAppBaseUrl() {
  const url = process.env.APP_BASE_URL || 'https://littleepicminds.vercel.app';
  return String(url).replace(/\/$/, '');
}

function buildResetUrl(token) {
  return `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

function isDevExposeAllowed() {
  return !process.env.VERCEL && process.env.PASSWORD_RESET_DEV_EXPOSE === 'true';
}

async function sendPasswordResetEmail({ to, username, resetUrl }) {
  const from = process.env.MAIL_FROM || 'littleEpicMinds <onboarding@resend.dev>';
  const apiKey = process.env.RESEND_API_KEY;
  const displayName = username || 'there';

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="color:#1a1a2e;">Reset your password</h2>
      <p>Hi ${displayName},</p>
      <p>We received a request to reset your littleEpicMinds password. Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin:28px 0;">
        <a href="${resetUrl}" style="background:#fd7e4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset password
        </a>
      </p>
      <p style="color:#666;font-size:14px;">If you did not request this, you can ignore this email.</p>
      <p style="color:#999;font-size:12px;word-break:break-all;">Or copy this link: ${resetUrl}</p>
    </div>
  `;

  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Reset your littleEpicMinds password',
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Email send failed: ${body}`);
    }
    return { sent: true };
  }

  if (isDevExposeAllowed()) {
    console.log(`[password-reset] Dev mode — reset link for ${to}: ${resetUrl}`);
    return { sent: false, devResetUrl: resetUrl };
  }

  console.error('[password-reset] RESEND_API_KEY is not set; cannot send reset email.');
  return { sent: false };
}

module.exports = {
  TOKEN_TTL_MS,
  generateResetToken,
  hashResetToken,
  getAppBaseUrl,
  buildResetUrl,
  sendPasswordResetEmail,
  isDevExposeAllowed,
};
