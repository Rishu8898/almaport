const express = require('express');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const { contract, provider, wallet, getNetworkInfo } = require('../blockchain/config');
const { generateDataHash } = require('../utils/hashUtils');
const { sendCertificateEmail } = require('../utils/emailUtils');
const { uploadToIPFS } = require('../utils/ipfsUtils');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// Server-side storage for issued certificates
const dataDir = path.join(__dirname, '..', 'data');
const issuedFile = path.join(dataDir, 'issued.json');
const MIN_PRIORITY_FEE_GWEI = '30';

async function getTxOverrides() {
  const feeData = await provider.getFeeData();
  const priorityFee = ethers.utils.parseUnits(MIN_PRIORITY_FEE_GWEI, 'gwei');
  const maxFee = feeData.maxFeePerGas && feeData.maxFeePerGas.gt(priorityFee)
    ? feeData.maxFeePerGas
    : priorityFee.mul(2);

  return {
    maxPriorityFeePerGas: priorityFee,
    maxFeePerGas: maxFee,
  };
}

const router = express.Router();

// POST /api/admin/add
// Body: { name, rollNumber, degree, branch, graduationYear, certId, studentEmail }
router.post('/add', upload.single('pdfFile'), async (req, res) => {
  try {
    const { name, rollNumber, degree, branch, graduationYear, certId, studentEmail } = req.body || {};

    if (!name || !rollNumber || !degree || !branch || !graduationYear || !certId || !studentEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'rollNumber', 'degree', 'branch', 'graduationYear', 'certId', 'studentEmail'],
      });
    }

    let ipfsCID = null;
    if (req.file) {
      try {
        ipfsCID = await uploadToIPFS(req.file.buffer, `${certId}.pdf`);
      } catch (uploadErr) {
        console.error('IPFS upload failed:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload PDF to IPFS', details: uploadErr.message });
      }
    }

    const isAuthorizedIssuer = await contract.authorizedIssuers(wallet.address);
    if (!isAuthorizedIssuer) {
      return res.status(403).json({
        error: 'Backend wallet is not authorized to issue certificates',
        details: `Authorize ${wallet.address} on the smart contract or use the deployer/issuer wallet in Backend/config.local.json.`,
      });
    }

    const dataHash = generateDataHash({ name, rollNumber, degree, branch, graduationYear, certId });

    // Send transaction to blockchain
    const tx = await contract.addAlumniRecord(certId, dataHash, await getTxOverrides());
    const receipt = await tx.wait();

    // Get block timestamp
    const blockNumber = receipt.blockNumber || receipt?.events?.[0]?.blockNumber || null;
    const block = blockNumber ? await provider.getBlock(blockNumber) : null;

    // Persist issued record to server-side disk for admin lookup/history
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      let db = [];
      if (fs.existsSync(issuedFile)) {
        const raw = fs.readFileSync(issuedFile, 'utf8');
        db = raw ? JSON.parse(raw) : [];
      }

      const record = {
        certId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toNumber ? receipt.blockNumber.toNumber() : Number(receipt.blockNumber),
        timestamp: Math.floor(Date.now() / 1000),
        issuer: null,
        ipfsCID: ipfsCID || null,
      };

      db.push(record);
      fs.writeFileSync(issuedFile, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist issued record:', e);
      // do not fail the request because of persistence error
    }

    // Send the email to the student asynchronously
    sendCertificateEmail({ studentEmail, name, rollNumber, degree, branch, graduationYear, certId }).catch(e => {
      console.error('Failed to send certificate email:', e);
    });

    return res.status(201).json({
      certId,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      timestamp: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in POST /api/admin/add:', err);
    // Common revert or RPC error surface
    return res.status(500).json({
      error: 'Failed to add alumni record',
      details: err?.reason || err?.error?.reason || err?.message || 'Unknown error',
    });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
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

// GET /api/admin/issued - list persisted issued certs
router.get('/issued', async (req, res) => {
  try {
    if (!fs.existsSync(issuedFile)) return res.json([]);
    const raw = fs.readFileSync(issuedFile, 'utf8');
    const db = raw ? JSON.parse(raw) : [];
    return res.json(db);
  } catch (err) {
    console.error('Error loading issued records:', err);
    return res.status(500).json({ error: 'Failed to load issued records' });
  }
});

module.exports = router;


