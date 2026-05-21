const express = require('express');
const { signSessionToken } = require('../auth/jwt');

const router = express.Router();

// Dev-only helper: issue an admin JWT for local development/testing
// Usage: GET /api/dev/token?email=you@example.com
router.get('/token', (req, res) => {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  // Only allow requests from localhost (127.0.0.1 or ::1)
  const ip = req.ip || req.connection?.remoteAddress || '';
  if (!ip.includes('127.0.0.1') && !ip.includes('::1') && req.hostname !== 'localhost') {
    return res.status(403).json({ error: 'Dev token endpoint only available from localhost' });
  }

  const email = req.query.email || 'dev_admin@example.com';
  const payload = { email, role: 'admin' };
  try {
    const token = signSessionToken(payload);
    return res.json({ token, payload });
  } catch (err) {
    console.error('Failed to sign dev token:', err);
    return res.status(500).json({ error: 'Failed to create token' });
  }
});

module.exports = router;
