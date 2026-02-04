# 🚀 Quick Reference Card - Alumni Verification Portal

## 📦 File Structure Overview

```
BlockChain/
├── src/AlumniVerification.sol           ⭐ Main Smart Contract
├── script/DeployAlumniVerification.s.sol ⭐ Deployment Scripts
├── test/AlumniVerification.t.sol        ⭐ Test Suite (30 tests)
├── env.example                          📝 Environment Template (copy to .env)
├── README.md                            📖 Quick Start
├── SETUP_GUIDE.md                       📖 Complete Setup
├── BACKEND_INTEGRATION.md               📖 Backend Guide
├── PROJECT_SUMMARY.md                   📖 Full Documentation
└── scripts.ps1                          🔧 PowerShell Helpers
```

---

## ⚡ Essential Commands

### Setup & Build

```powershell
# Load helper functions
. .\scripts.ps1

# Load environment variables
Load-Env

# Compile contracts
Build-Contracts

# Run tests
Test-Contracts
```

### Deployment

```powershell
# Deploy to Mumbai Testnet
Deploy-Mumbai

# After deployment, save:
# - Contract Address: 0x...
# - Transaction Hash: 0x...
```

### Contract Interaction

```powershell
# Get total records
Get-TotalRecords -ContractAddress "0x..."

# Check if authorized
Check-Issuer -ContractAddress "0x..." -IssuerAddress "0x..."

# Add new issuer
Add-Issuer -ContractAddress "0x..." -NewIssuer "0x..." -InstitutionName "College"
```

---

## 🔑 Key Contract Functions

| Function                        | Description        | Access             | Gas   |
| ------------------------------- | ------------------ | ------------------ | ----- |
| `addAlumniRecord(certId, hash)` | Add new record     | Authorized Issuers | ~150k |
| `verifyRecord(certId, hash)`    | Verify a record    | Anyone             | ~50k  |
| `getRecord(certId)`             | Get record details | Anyone             | FREE  |
| `authorizeIssuer(addr, name)`   | Add new issuer     | Owner Only         | ~50k  |
| `generateDataHash(...)`         | Create hash        | Anyone             | FREE  |

---

## 📊 Data Hash Formula

```javascript
hash = keccak256(name + rollNumber + degree + branch + graduationYear + certId);
```

**Example:**

```javascript
const hash = ethers.utils.solidityKeccak256(
  ["string", "string", "string", "string", "string", "string"],
  ["Saurabh Singh", "2214094", "B.Tech", "IT", "2026", "CERT-2025-ABC123"]
);
```

---

## 🔗 Network Info

### Mumbai Testnet (For Testing)

```
Chain ID: 80001
RPC: https://rpc-mumbai.maticvigil.com
Explorer: https://mumbai.polygonscan.com
Faucet: https://faucet.polygon.technology/
```

### Polygon Mainnet (Production)

```
Chain ID: 137
RPC: https://polygon-rpc.com
Explorer: https://polygonscan.com
```

---

## 📝 Environment Variables

```env
# Required
PRIVATE_KEY=your_private_key_without_0x
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Optional
POLYGONSCAN_API_KEY=your_api_key
INSTITUTION_NAME=XYZ University
```

---

## 🎯 Workflow Summary

### 1️⃣ Deploy Contract

```powershell
Deploy-Mumbai
# Save contract address!
```

### 2️⃣ Setup Backend

```bash
cd Backend
npm install express ethers dotenv cors
# Create files from BACKEND_INTEGRATION.md
# Add contract address to .env
npm start
```

### 3️⃣ Update Frontend

```javascript
// AdminPanel.jsx - Replace mock with:
const response = await axios.post(
  "http://localhost:5000/api/admin/add",
  formData
);
```

### 4️⃣ Test End-to-End

1. Open http://localhost:5173/admin
2. Fill form & submit
3. Verify record appears on blockchain

---

## 🔍 Verification Process

```
User Input: CERT-2025-ABC123
     ↓
Backend: getRecord(certId)
     ↓
Blockchain: Returns record data
     ↓
Frontend: Display verified ✅ or invalid ❌
```

---

## 💡 Tips & Tricks

### Get Free Test MATIC

```
1. Visit: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Paste wallet address
4. Request tokens (wait ~1 min)
```

### Check Transaction Status

```
https://mumbai.polygonscan.com/tx/0xYourTransactionHash
```

### View Contract

```
https://mumbai.polygonscan.com/address/0xYourContractAddress
```

### Calculate Gas Cost

```powershell
# Get gas price
Get-GasPrice

# Estimate cost
$gasUsed = 150000  # for addAlumniRecord
$gasPrice = 30  # in gwei
$costInMatic = ($gasUsed * $gasPrice) / 1000000000
# Result: ~0.0045 MATIC (~$0.003 USD)
```

---

## 🚨 Troubleshooting

| Issue                      | Solution                          |
| -------------------------- | --------------------------------- |
| `forge: command not found` | Install Foundry: `foundryup`      |
| `Insufficient funds`       | Get test MATIC from faucet        |
| `Transaction reverted`     | Check issuer authorization        |
| `Contract not found`       | Verify contract address & network |
| `Private key error`        | Remove "0x" prefix from key       |

---

## 📞 Quick Links

- **Foundry Docs**: https://book.getfoundry.sh/
- **Ethers.js Docs**: https://docs.ethers.org/v5/
- **Polygon Faucet**: https://faucet.polygon.technology/
- **Mumbai Explorer**: https://mumbai.polygonscan.com/
- **OpenZeppelin**: https://docs.openzeppelin.com/

---

## 🎓 Smart Contract Events

```solidity
event AlumniRecordAdded(
    string indexed certId,
    bytes32 dataHash,
    address indexed issuer,
    string issuerName,
    uint256 timestamp,
    uint256 blockNumber
);

event IssuerAuthorized(address indexed issuer, string name);
event IssuerRevoked(address indexed issuer);
event RecordVerified(string indexed certId, bool isValid);
```

Listen to these events in your backend for real-time updates!

---

## 📋 Pre-Launch Checklist

- [ ] Foundry installed
- [ ] Contracts compile successfully
- [ ] All tests pass (30/30)
- [ ] .env configured
- [ ] Test MATIC obtained
- [ ] Contract deployed to Mumbai
- [ ] Contract address saved
- [ ] Backend .env configured
- [ ] Backend running
- [ ] Frontend connected
- [ ] End-to-end test successful

---

## 🎯 API Endpoints (Backend)

```
POST /api/admin/add
  ➜ Add alumni record

GET /api/admin/stats
  ➜ Get statistics

POST /api/verify/check
  ➜ Verify record with data

GET /api/verify/:certId
  ➜ Get record by ID

GET /health
  ➜ Health check
```

---

## 💰 Cost Estimates

| Network        | Deploy | Per Record | Per Verification |
| -------------- | ------ | ---------- | ---------------- |
| Mumbai (Test)  | FREE   | FREE       | FREE             |
| Polygon (Prod) | ~$0.12 | ~$0.003    | ~$0.001          |

_Prices based on 30 gwei gas price and $0.60 MATIC_

---

## 🔐 Security Checklist

**Smart Contract:**

- [x] Access control implemented
- [x] Input validation
- [x] No reentrancy issues
- [x] Events for transparency
- [x] Tested thoroughly

**Backend:**

- [ ] Rate limiting (TODO)
- [ ] Authentication (TODO)
- [ ] Input validation (TODO)
- [ ] Error handling (TODO)

**Frontend:**

- [ ] OAuth integration (TODO)
- [ ] Input sanitization (TODO)
- [ ] XSS protection (TODO)

---

## 📖 Documentation Priority

1. **SETUP_GUIDE.md** ⭐ Start here for deployment
2. **BACKEND_INTEGRATION.md** ⭐ Implement backend
3. **PROJECT_SUMMARY.md** 📚 Complete overview
4. **README.md** 📝 Quick reference
5. **scripts.ps1** 🔧 Helper commands

---

**Keep this card handy for quick reference! 🚀**

**For detailed info, see SETUP_GUIDE.md and PROJECT_SUMMARY.md**
