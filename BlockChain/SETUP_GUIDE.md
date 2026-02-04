# 🎓 Complete Setup Guide - Alumni Verification Portal

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Foundry Installation](#foundry-installation)
3. [Smart Contract Setup](#smart-contract-setup)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Backend Setup](#backend-setup)
7. [Frontend Integration](#frontend-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Node.js** (v18+): https://nodejs.org/
- **Git**: https://git-scm.com/
- **MetaMask Wallet**: https://metamask.io/
- **Visual Studio Code**: https://code.visualstudio.com/

### Required Accounts

- MetaMask wallet with some MATIC tokens
- (Optional) Polygonscan API key for contract verification

---

## 🛠️ Foundry Installation

### Windows (PowerShell - Run as Administrator)

```powershell
# Install Foundry using foundryup
curl -L https://foundry.paradigm.xyz | bash

# Restart your terminal, then run:
foundryup

# Verify installation
forge --version
cast --version
```

### Alternative Installation (if above doesn't work)

1. Download Foundry binaries from: https://github.com/foundry-rs/foundry/releases
2. Extract and add to PATH
3. Or use WSL (Windows Subsystem for Linux):
   ```bash
   wsl --install
   # Then in WSL terminal:
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

### Verify Installation

```powershell
forge --version
# Should output: forge 0.x.x
```

---

## 📦 Smart Contract Setup

### 1. Navigate to BlockChain Directory

```powershell
cd "e:\Starting_June\Trading Software\MajorProject\BlockChain"
```

### 2. Install Dependencies

```powershell
forge install
```

This installs the `forge-std` library for testing.

### 3. Compile Contracts

```powershell
forge build
```

Expected output:

```
[⠊] Compiling...
[⠒] Compiling 3 files with 0.8.20
[⠢] Solc 0.8.20 finished in 2.34s
Compiler run successful!
```

---

## 🧪 Testing

### Run All Tests

```powershell
forge test
```

### Run Tests with Detailed Output

```powershell
# See function names and results
forge test -vv

# See detailed logs
forge test -vvvv
```

### Run Specific Test

```powershell
forge test --match-test test_AddAlumniRecord -vvvv
```

### Check Test Coverage

```powershell
forge coverage
```

### Expected Test Results

```
Running 30 tests for test/AlumniVerification.t.sol:AlumniVerificationTest
[PASS] test_AddAlumniRecord() (gas: 150234)
[PASS] test_AddMultipleRecords() (gas: 298765)
[PASS] test_AuthorizeIssuer() (gas: 56789)
[PASS] test_Deployment() (gas: 23456)
[PASS] test_GenerateDataHash() (gas: 12345)
[PASS] test_VerifyRecord_Valid() (gas: 89012)
...
Test result: ok. 30 passed; 0 failed; finished in 1.23s
```

---

## 🚀 Deployment

### Step 1: Setup Environment

```powershell
# Copy the example env file
Copy-Item env.example .env

# Edit .env file and add your details
notepad .env
```

Fill in your `.env`:

```env
PRIVATE_KEY=your_metamask_private_key_without_0x
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
INSTITUTION_NAME=XYZ University
```

### Step 2: Get Test MATIC

1. Go to: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Enter your wallet address
4. Request test MATIC

### Step 3: Deploy to Mumbai Testnet

```powershell
# Set environment variables (PowerShell)
$env:PRIVATE_KEY = "your_private_key"
$env:POLYGON_MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com"

# Deploy
forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification --rpc-url $env:POLYGON_MUMBAI_RPC_URL --broadcast -vvvv
```

### Step 4: Save Deployment Information

After successful deployment, you'll see:

```
====================================
AlumniVerification Contract Deployed!
====================================
Contract Address: 0x1234567890AbCdEf1234567890AbCdEf12345678
Owner Address: 0xYourWalletAddress...
Institution Name: XYZ University
Chain ID: 80001
Block Number: 42345678
====================================
```

**IMPORTANT**: Save the `Contract Address` - you'll need it for the backend!

### Step 5: Verify Contract (Optional)

```powershell
forge verify-contract --chain-id 80001 --watch \
  0xYourContractAddress \
  src/AlumniVerification.sol:AlumniVerification \
  --etherscan-api-key $env:POLYGONSCAN_API_KEY
```

---

## 💻 Backend Setup

### Step 1: Create Backend Directory

```powershell
cd ..
mkdir Backend
cd Backend
npm init -y
```

### Step 2: Install Dependencies

```powershell
npm install express ethers dotenv cors
npm install --save-dev nodemon
```

### Step 3: Create Directory Structure

```powershell
New-Item -ItemType Directory -Path blockchain, routes, utils
New-Item -ItemType File -Path server.js, .env
```

### Step 4: Setup Environment

Edit `Backend/.env`:

```env
CONTRACT_ADDRESS=0xYourDeployedContractAddress
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
ADMIN_PRIVATE_KEY=your_admin_private_key
NETWORK=mumbai
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Step 5: Get Contract ABI

```powershell
# Copy ABI from compiled contract
cd ../BlockChain
Get-Content out/AlumniVerification.sol/AlumniVerification.json | ConvertFrom-Json | Select-Object -ExpandProperty abi | ConvertTo-Json > ../Backend/contract-abi.json
```

### Step 6: Create Server Files

Copy the code from `BACKEND_INTEGRATION.md` to create:

- `blockchain/config.js`
- `routes/admin.js`
- `routes/verify.js`
- `utils/hashUtils.js`
- `server.js`

### Step 7: Update package.json

Add to `scripts` section:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 8: Start Backend

```powershell
npm run dev
```

Expected output:

```
🚀 Server running on port 5000
📡 Network: mumbai
📝 Contract: 0x1234567890AbCdEf1234567890AbCdEf12345678
```

---

## 🎨 Frontend Integration

### Step 1: Update Frontend Environment

Create `FrontEnd/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Step 2: Update AdminPanel.jsx

Replace the mock API call (around line 72-85) with the real API call as shown in `BACKEND_INTEGRATION.md`.

### Step 3: Start Frontend

```powershell
cd ../FrontEnd
npm run dev
```

---

## 🧪 End-to-End Testing

### Test Flow:

1. **Open Admin Panel**: http://localhost:5173/admin

2. **Fill in Alumni Form**:

   - Name: "Saurabh Singh"
   - Roll: "2214094"
   - Degree: "B.Tech"
   - Branch: "Information Technology"
   - Year: "2026"
   - Cert ID: Click "Generate" or enter manually

3. **Submit Form**:

   - Wait for blockchain confirmation (~15 seconds)
   - Should see success with transaction hash
   - QR code displayed

4. **Verify Record**:
   - Open: http://localhost:5000/api/verify/CERT-2025-XXXXX
   - Should return record details

---

## 🐛 Troubleshooting

### Foundry Not Found

**Problem**: `forge: command not found`

**Solution**:

```powershell
# Option 1: Reinstall
foundryup

# Option 2: Check PATH
$env:PATH

# Option 3: Use WSL
wsl
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Compilation Errors

**Problem**: `Compiler error: ...`

**Solution**:

```powershell
forge clean
forge build
```

### Insufficient Funds

**Problem**: `Error: insufficient funds for gas`

**Solution**:

- Get more test MATIC from faucet
- Check wallet balance: https://mumbai.polygonscan.com/

### Transaction Failed

**Problem**: `Transaction reverted`

**Solutions**:

1. Check if wallet is authorized issuer
2. Verify certificate ID doesn't already exist
3. Check gas limits
4. Ensure private key is correct

### Backend Connection Error

**Problem**: Frontend can't connect to backend

**Solution**:

1. Check backend is running: http://localhost:5000/health
2. Verify CORS settings in server.js
3. Check contract address in .env
4. Verify RPC URL is working

### Contract Not Found

**Problem**: `Contract not deployed at address`

**Solution**:

1. Verify contract address in .env
2. Check deployment was successful
3. Verify network (Mumbai vs Polygon)
4. Check block explorer: https://mumbai.polygonscan.com/

---

## 📝 Quick Command Reference

```powershell
# Foundry Commands
forge build              # Compile contracts
forge test               # Run tests
forge test -vvv          # Run tests with logs
forge clean              # Clean build artifacts
forge fmt                # Format code
forge coverage           # Test coverage

# Deployment
forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification --rpc-url <RPC> --broadcast

# Backend
npm start                # Start server
npm run dev              # Start with nodemon
curl http://localhost:5000/health  # Health check

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
```

---

## 📚 Additional Resources

- **Foundry Book**: https://book.getfoundry.sh/
- **Ethers.js Docs**: https://docs.ethers.org/v5/
- **Polygon Docs**: https://docs.polygon.technology/
- **Mumbai Testnet**: https://mumbai.polygonscan.com/
- **Polygon Faucet**: https://faucet.polygon.technology/

---

## ✅ Deployment Checklist

- [ ] Foundry installed and working
- [ ] Contracts compile successfully
- [ ] All tests passing
- [ ] Test MATIC obtained
- [ ] Contract deployed to Mumbai
- [ ] Contract address saved
- [ ] Backend .env configured
- [ ] Backend running successfully
- [ ] Frontend .env configured
- [ ] Frontend connected to backend
- [ ] End-to-end test successful

---

## 🎯 Next Steps After Deployment

1. **Add More Authorized Issuers**

   ```powershell
   cast send <CONTRACT_ADDRESS> "authorizeIssuer(address,string)" <NEW_ISSUER_ADDRESS> "College Name" --rpc-url <RPC> --private-key <OWNER_KEY>
   ```

2. **Monitor Transactions**

   - Check Mumbai explorer: https://mumbai.polygonscan.com/address/<CONTRACT_ADDRESS>

3. **Setup Production**
   - Deploy to Polygon Mainnet
   - Setup proper authentication
   - Add error monitoring
   - Implement rate limiting

---

**Need Help?** Check the contract tests for usage examples or review the BACKEND_INTEGRATION.md file.

**Happy Building! 🚀**
