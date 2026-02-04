const express = require('express');
const { contract } = require('../blockchain/config');
const { generateDataHash } = require('../utils/hashUtils');

const router = express.Router();

// GET /api/verify/:certId
router.get('/:certId', async (req, res) => {
  try {
    const { certId } = req.params;

    if (!certId) {
      return res.status(400).json({ error: 'certId is required' });
    }

    const result = await contract.getRecord(certId);

    // Tuple: [dataHash, issuer, issuerName, timestamp, blockNumber, exists]
    const dataHash = result[0];
    const issuer = result[1];
    const issuerName = result[2];
    const timestamp = result[3];
    const blockNumber = result[4];
    const exists = result[5];

    if (!exists) {
      return res.status(404).json({ error: 'Record not found', certId });
    }

    return res.json({
      certId,
      dataHash,
      issuer,
      issuerName,
      timestamp: timestamp.toNumber ? timestamp.toNumber() : Number(timestamp),
      blockNumber: blockNumber.toNumber ? blockNumber.toNumber() : Number(blockNumber),
      exists,
    });
  } catch (err) {
    console.error('Error in GET /api/verify/:certId:', err);
    return res.status(500).json({
      error: 'Failed to fetch record',
      details: err.message || 'Unknown error',
    });
  }
});

// POST /api/verify/check
// Body: { certId, name, rollNumber, degree, branch, graduationYear }
router.post('/check', async (req, res) => {
  try {
    const { certId, name, rollNumber, degree, branch, graduationYear } = req.body || {};

    if (!certId || !name || !rollNumber || !degree || !branch || !graduationYear) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['certId', 'name', 'rollNumber', 'degree', 'branch', 'graduationYear'],
      });
    }

    const dataHash = generateDataHash({ name, rollNumber, degree, branch, graduationYear, certId });

    // verifyRecord returns: (bool isValid, address issuer, string issuerName, uint256 timestamp, uint256 blockNumber)
    const result = await contract.verifyRecord(certId, dataHash);

    const isValid = result[0];
    const issuer = result[1];
    const issuerName = result[2];
    const timestamp = result[3];
    const blockNumber = result[4];

    return res.json({
      certId,
      valid: isValid,
      issuer,
      issuerName,
      timestamp: timestamp.toNumber ? timestamp.toNumber() : Number(timestamp),
      blockNumber: blockNumber.toNumber ? blockNumber.toNumber() : Number(blockNumber),
    });
  } catch (err) {
    console.error('Error in POST /api/verify/check:', err);
    return res.status(500).json({
      error: 'Failed to verify record',
      details: err.message || 'Unknown error',
    });
  }
});

module.exports = router;


