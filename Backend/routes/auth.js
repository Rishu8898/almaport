const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { signSessionToken } = require('../auth/jwt');

const router = express.Router();

function getGoogleClientId() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) {
    throw new Error('GOOGLE_CLIENT_ID is not set (required for Google OAuth)');
  }
  return id;
}

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

function isAdminEmailAllowed(email) {
  const emailLc = (email || '').toLowerCase();
  const allowList = parseAdminEmails();
  const allowDomain = (process.env.ADMIN_EMAIL_DOMAIN || '').trim().toLowerCase();

  if (allowList.length > 0) return allowList.includes(emailLc);
  if (allowDomain) return emailLc.endsWith(`@${allowDomain}`);

  // If no allow-list configured, deny admin access by default
  return false;
}

// POST /api/auth/google
// Body: { credential: "<google_id_token>", userType: "admin" | "student" }
router.post('/google', async (req, res) => {
  try {
    const { credential, userType } = req.body || {};

    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }
    if (userType !== 'admin' && userType !== 'student') {
      return res.status(400).json({ error: 'userType must be "admin" or "student"' });
    }

    const clientId = getGoogleClientId();
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload() || {};
    const email = payload.email;
    const name = payload.name || payload.given_name || 'User';
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    let role = 'student';
    if (userType === 'admin') {
      if (!isAdminEmailAllowed(email)) {
        return res.status(403).json({
          error: 'This Google account is not authorized as admin',
        });
      }
      role = 'admin';
    }

    const token = signSessionToken({
      email,
      name,
      role,
    });

    return res.json({
      token,
      user: { email, name, role },
    });
  } catch (err) {
    console.error('Error in POST /api/auth/google:', err);
    return res.status(500).json({
      error: 'Failed to authenticate with Google',
      details: err.message || 'Unknown error',
    });
  }
});

module.exports = router;


