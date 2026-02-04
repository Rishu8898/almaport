# 🎓 Alumni Verification - Blockchain Smart Contracts

This folder contains the Solidity smart contracts for the Blockchain-Based Alumni Verification Portal, built with Foundry.

## 📁 Project Structure

```
BlockChain/
├── src/
│   └── AlumniVerification.sol          # Main smart contract
├── script/
│   └── DeployAlumniVerification.s.sol  # Deployment & setup scripts
├── test/
│   └── AlumniVerification.t.sol        # Comprehensive test suite
├── lib/                                 # Dependencies (forge-std)
├── env.example                          # Environment variables template (copy to .env)
├── foundry.toml                         # Foundry configuration
└── README.md                            # This file
```

## 🔧 Prerequisites

- **Foundry** - Ethereum development toolkit

  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

- **MetaMask Wallet** with:
  - Private key for deployment
  - Some MATIC tokens (for gas fees)
  - Get free testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

## 🚀 Quick Start

### 1. Setup Environment

```powershell
# Copy the example environment file
Copy-Item env.example .env

# Edit .env and add your private key
# NEVER commit your real private key!
```

### 2. Install Dependencies

```powershell
forge install
```

### 3. Compile Contracts

```powershell
forge build
```

### 4. Run Tests

```powershell
# Run all tests
forge test

# Run with verbosity to see console logs
forge test -vv

# Run specific test
forge test --match-test test_AddAlumniRecord -vvvv

# Check test coverage
forge coverage
```

## 📝 Smart Contract Features

### AlumniVerification.sol

#### Core Functions

1. **addAlumniRecord(certId, dataHash)** ✅

   - Add verified alumni record to blockchain
   - Only authorized issuers can call
   - Emits `AlumniRecordAdded` event
   - Returns: success, timestamp, blockNumber

2. **verifyRecord(certId, dataHash)** 🔍

   - Verify if a record is valid
   - Compares provided hash with stored hash
   - Returns: isValid, issuer, issuerName, timestamp, blockNumber

3. **getRecord(certId)** 📋

   - Get record details without verification
   - Returns all record information
   - View function (no gas cost)

4. **generateDataHash(...)** 🔐
   - Helper function to generate consistent hash
   - Takes: name, rollNumber, degree, branch, year, certId
   - Returns: keccak256 hash

#### Admin Functions

- **authorizeIssuer(address, name)** - Add new authorized issuer
- **revokeIssuer(address)** - Remove issuer authorization
- **transferOwnership(address)** - Transfer contract ownership

#### View Functions

- **recordExists(certId)** - Check if record exists
- **getAllCertificateIds()** - Get all certificate IDs
- **getTotalRecords()** - Get total number of records
- **isAuthorizedIssuer(address)** - Check if address is authorized
- **getIssuerName(address)** - Get institution name for issuer

## 🌐 Deployment

### Deploy to Polygon Mumbai Testnet

```powershell
# Load environment variables
$env:PRIVATE_KEY = "your_private_key"
$env:POLYGON_MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com"

# Deploy contract
forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification --rpc-url $env:POLYGON_MUMBAI_RPC_URL --broadcast --verify -vvvv
```

### Deploy to Polygon Mainnet

```powershell
forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification --rpc-url $env:POLYGON_MAINNET_RPC_URL --broadcast --verify -vvvv
```

## 🧪 Testing

### Run Tests

```powershell
# All tests
forge test

# With gas report
forge test --gas-report

# Specific test file
forge test --match-path test/AlumniVerification.t.sol
```

### Test Coverage

```powershell
forge coverage
```

## 📊 Gas Usage Estimates

| Function        | Gas Cost (approx) |
| --------------- | ----------------- |
| Deploy Contract | ~2,000,000        |
| addAlumniRecord | ~150,000          |
| verifyRecord    | ~50,000           |
| getRecord       | 0 (view)          |
| authorizeIssuer | ~50,000           |

## 🔐 Security Features

- ✅ Access control (only authorized issuers)
- ✅ Owner-only admin functions
- ✅ Input validation
- ✅ Duplicate prevention
- ✅ Event emissions for transparency
- ✅ Immutable records
- ✅ Gas-optimized storage

## 📖 Usage Example

### For Backend Integration

```javascript
// 1. Generate hash (same as in contract)
const ethers = require("ethers");

function generateHash(name, roll, degree, branch, year, certId) {
  return ethers.utils.solidityKeccak256(
    ["string", "string", "string", "string", "string", "string"],
    [name, roll, degree, branch, year, certId]
  );
}

// 2. Add record
const dataHash = generateHash(
  "Saurabh Singh",
  "2214094",
  "B.Tech",
  "Information Technology",
  "2026",
  "CERT-2025-ABC123"
);

const tx = await contract.addAlumniRecord("CERT-2025-ABC123", dataHash);
const receipt = await tx.wait();

// 3. Verify record
const result = await contract.verifyRecord("CERT-2025-ABC123", dataHash);
console.log("Is Valid:", result.isValid);
```

## 🔗 Important Network Information

### Polygon Mumbai Testnet

- **Chain ID**: 80001
- **RPC**: https://rpc-mumbai.maticvigil.com
- **Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

### Polygon Mainnet

- **Chain ID**: 137
- **RPC**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com

## 🐛 Troubleshooting

### "Insufficient funds" error

- Get testnet MATIC from faucet
- Check wallet balance

### "Private key error"

- Ensure .env file exists
- Check PRIVATE_KEY format (without 0x prefix)

### Contract verification fails

- Add POLYGONSCAN_API_KEY to .env
- Get key from https://polygonscan.com/apis

## 📚 Additional Commands

```powershell
# Format code
forge fmt

# Check contract size
forge build --sizes

# Clean build artifacts
forge clean
```

## 📄 Foundry Documentation

For more details: https://book.getfoundry.sh/

---

**Built with ❤️ for Blockchain-Based Alumni Verification**
