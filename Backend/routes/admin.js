const express = require('express');
const { contract, provider, getNetworkInfo } = require('../blockchain/config');
const { generateDataHash } = require('../utils/hashUtils');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/add
// Body: { name, rollNumber, degree, branch, graduationYear, certId }
router.post('/add', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, rollNumber, degree, branch, graduationYear, certId } = req.body || {};

    if (!name || !rollNumber || !degree || !branch || !graduationYear || !certId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'rollNumber', 'degree', 'branch', 'graduationYear', 'certId'],
      });
    }

    const dataHash = generateDataHash({ name, rollNumber, degree, branch, graduationYear, certId });

    // Send transaction to blockchain
    const tx = await contract.addAlumniRecord(certId, dataHash);
    const receipt = await tx.wait();

    // Get block timestamp
    const block = await provider.getBlock(receipt.blockHash);

    return res.status(201).json({
      certId,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
    });
  } catch (err) {
    console.error('Error in POST /api/admin/add:', err);
    // Common revert or RPC error surface
    return res.status(500).json({
      error: 'Failed to add alumni record',
      details: err.message || 'Unknown error',
    });
  }
});

// GET /api/admin/stats
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const totalRecords = await contract.getTotalRecords();
    const network = await getNetworkInfo();

    return res.json({
      totalRecords: totalRecords.toNumber ? totalRecords.toNumber() : Number(totalRecords),
      network,
    });
  } catch (err) {
    console.error('Error in GET /api/admin/stats:', err);
    return res.status(500).json({
      error: 'Failed to fetch stats',
      details: err.message || 'Unknown error',
    });
  }
});

module.exports = router;


