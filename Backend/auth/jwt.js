const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set (required for authentication)');
  }
  return secret;
}

function signSessionToken(payload) {
  const secret = getJwtSecret();
  // 7 days session by default
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifySessionToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

module.exports = {
  signSessionToken,
  verifySessionToken,
};


