const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loadLocalConfigIntoEnv } = require('./config/loadLocalConfig');

// Load environment variables from .env if present
dotenv.config();
// Load config.local.json as a fallback (applies missing values into process.env)
loadLocalConfigIntoEnv();

const adminRoutes = require('./routes/admin');
const verifyRoutes = require('./routes/verify');

const app = express();

// Basic JSON + CORS setup
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Alumni Verification Backend running' });
});

// Mount API routes
app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);

// Global error handler (fallback)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend API listening on port ${PORT}`);
});


