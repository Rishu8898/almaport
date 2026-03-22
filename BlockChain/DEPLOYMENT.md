# AlumniVerification Contract Deployment Guide

Complete guide to deploy the AlumniVerification smart contract to Polygon Amoy testnet.

## Prerequisites

1. **Foundry installed** — [Install Foundry](https://book.getfoundry.sh/getting-started/installation)
2. **Private Key** — From MetaMask (Settings → Security & Privacy → Show Private Key)
3. **MATIC tokens** — For gas fees on Polygon Amoy (get from [Polygon Faucet](https://faucet.polygon.technology/))

## Quick Start (Recommended)

### 1. Configure Environment

Create or update `.env` file in the `BlockChain` folder:

```bash
PRIVATE_KEY=your_private_key_here
INSTITUTION_NAME=Your College Name
```

### 2. Run Deployment Script

```powershell
cd E:\Rishu\almaport\BlockChain
.\deploy.ps1
```

Or with custom institution name:

```powershell
.\deploy.ps1 -InstitutionName "NITJ"
```

The script will:

- ✅ Build the contract
- ✅ Deploy to Polygon Amoy
- ✅ Save deployment info to `deployment-info.json`
- ✅ Display contract address
- ✅ Show next steps

---

## Manual Deployment (Advanced)

### Step 1: Build Contract

```powershell
cd E:\Rishu\almaport\BlockChain
forge build
```

### Step 2: Deploy Using Forge Script

```powershell
$env:PRIVATE_KEY = "your_private_key_here"
$env:INSTITUTION_NAME = "Your College Name"

forge script script/DeployAlumniVerification.s.sol `
  --rpc-url https://polygon-amoy.gateway.tenderly.co `
  --private-key $env:PRIVATE_KEY `
  --broadcast `
  --chain-id 80002
```

### Step 3: Direct Deployment (One-liner)

```powershell
forge create src/AlumniVerification.sol:AlumniVerification `
  --rpc-url https://polygon-amoy.gateway.tenderly.co `
  --private-key 25e166b3491519b562dd593bffe1e32ae6491b885859e2931434b64e3f721642 `
  --constructor-args "NITJ" `
  --chain-id 80002
```

---

## After Deployment

### 1. Update Frontend Configuration

Copy the deployed **contract address** from the output and add it to `FrontEnd/.env`:

```env
VITE_CONTRACT_ADDRESS=0x_deployed_address_here_
```

### 2. Authorize Admin Wallet (If Needed)

If your admin wallet is **different** from the deployer wallet, authorize it as an issuer:

```powershell
$env:PRIVATE_KEY = "owner_private_key"
$env:CONTRACT_ADDRESS = "0x_deployed_address_"
$env:ISSUER_ADDRESS = "0x_admin_wallet_address_"
$env:ISSUER_NAME = "NITJ"

forge script script/AuthorizeIssuer.s.sol `
  --rpc-url https://polygon-amoy.gateway.tenderly.co `
  --private-key $env:PRIVATE_KEY `
  --broadcast `
  --chain-id 80002
```

### 3. Verify on Block Explorer

Visit **[Polygon Amoy Scan](https://amoy.polygonscan.com/)** and search for your contract address to verify deployment.

### 4. Test the Integration

1. Start frontend: `cd FrontEnd && npm run dev`
2. Connect MetaMask to Polygon Amoy (if not already)
3. Go to Admin Panel
4. Connect MetaMask wallet
5. Fill in student details
6. Click "Submit to Blockchain"
7. Confirm transaction in MetaMask
8. Wait for confirmation

---

## Deployment Variables

| Variable           | Description                                   | Example       |
| ------------------ | --------------------------------------------- | ------------- |
| `PRIVATE_KEY`      | Deployer's private key                        | `0x123abc...` |
| `INSTITUTION_NAME` | Institution name (constructor arg)            | `"NITJ"`      |
| `CONTRACT_ADDRESS` | Deployed contract address (for authorization) | `0x789def...` |
| `ISSUER_ADDRESS`   | Admin wallet to authorize                     | `0xabc123...` |
| `ISSUER_NAME`      | Institution name for issuer                   | `"NITJ"`      |

---

## Network Information

**Polygon Amoy Testnet:**

- Chain ID: `80002`
- RPC URL: `https://polygon-amoy.gateway.tenderly.co`
- Block Explorer: https://amoy.polygonscan.com
- Faucet: https://faucet.polygon.technology/

---

## Troubleshooting

### Error: "Constructor argument count mismatch"

- Make sure you're using the deployment scripts (they handle arguments correctly)
- The contract requires exactly **1 string argument** (institution name)

### Error: "Insufficient balance to pay gas fees"

- Get MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- Wait 1-2 minutes for funds to arrive
- Try deployment again

### Error: "Not an authorized issuer"

- Your wallet must be authorized as an issuer
- Run the `AuthorizeIssuer.s.sol` script
- Or use the same wallet that deployed the contract

### Contract Deployed but Frontend Can't Connect

- ✅ Verify contract address in `VITE_CONTRACT_ADDRESS`
- ✅ Verify MetaMask is connected to Polygon Amoy (Chain ID 80002)
- ✅ Verify wallet is authorized as issuer
- ✅ Check browser console for errors (F12)

---

## Files

- **`deploy.ps1`** — PowerShell deployment script (recommended)
- **`script/DeployAlumniVerification.s.sol`** — Forge deployment script
- **`script/AuthorizeIssuer.s.sol`** — Issuer authorization script
- **`.env`** — Environment configuration (private key, institution name)
- **`deployment-info.json`** — Auto-generated deployment record

---

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env` file with real private keys to git
- Keep private keys secret and secure
- Only use testnet credentials for development
- For production, use hardware wallets and multi-sig contracts

---

## Support

If deployment fails:

1. Check that all prerequisites are installed
2. Verify `.env` file has `PRIVATE_KEY` set
3. Ensure wallet has MATIC for gas fees
4. Check Polygon Amoy network is accessible
5. Review error messages in terminal output

---

**Last Updated:** March 2026
