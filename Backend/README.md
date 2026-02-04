# 🎓 Alumni Verification Backend (Node.js + Express)

This folder contains the **backend API** for the Blockchain-Based Alumni Verification Portal.  
It connects the React frontend to the `AlumniVerification.sol` smart contract deployed on Polygon.

---

## 📦 Tech Stack

- **Node.js + Express** – HTTP API server
- **Ethers.js v5** – Blockchain interaction
- **dotenv** – Environment variables
- **cors** – Cross-origin support

---

## 📁 Structure

```bash
Backend/
├── server.js              # Express app entrypoint
├── package.json           # Dependencies and scripts
├── blockchain/
│   └── config.js          # Provider, wallet, contract instance
├── routes/
│   ├── admin.js           # Admin endpoints
│   └── verify.js          # Verification endpoints
└── utils/
    └── hashUtils.js       # Hash generation (matches Solidity)
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `Backend/` with:

```env
RPC_URL=https://rpc-mumbai.maticvigil.com        # Or your Polygon RPC
CONTRACT_ADDRESS=0xYourDeployedContractAddress   # From forge deploy script
PRIVATE_KEY=your_private_key_without_0x_prefix   # Admin/deployer key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

> **Important:**  
> - Never commit `.env` with real keys.  
> - PRIVATE_KEY can optionally start with `0x` – the code handles both.

### Alternative (recommended on Windows): `config.local.json`

If you prefer not to use `.env`, you can create `Backend/config.local.json` instead.

- Copy `Backend/config.local.example.json` → `Backend/config.local.json`
- Fill in the real values:
  - `RPC_URL`
  - `CONTRACT_ADDRESS`
  - `PRIVATE_KEY`
  - `GOOGLE_CLIENT_ID`
  - `JWT_SECRET`
  - `ADMIN_EMAILS` (or set `ADMIN_EMAIL_DOMAIN`)

---

## 🚀 Setup & Run

From the `Backend/` folder:

```bash
npm install

# Development (auto-restart)
npm run dev

# Production
npm start
```

The API will default to: `http://localhost:5000`.

---

## 🔗 Smart Contract Build Requirement

`blockchain/config.js` loads the ABI from the Foundry build output:

```text
../BlockChain/out/AlumniVerification.sol/AlumniVerification.json
```

From the `BlockChain/` folder, run:

```bash
forge build
```

This must be done **after** any changes to `AlumniVerification.sol` and before starting the backend.

---

## 🛠 API Endpoints

### 0️⃣ Auth (`/api/auth`)

#### POST `/api/auth/google`

Exchange a Google ID token (credential) for a backend JWT session token.

**Body:**

```json
{
  "credential": "<google_id_token>",
  "userType": "admin"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "email": "admin@example.com", "name": "Admin", "role": "admin" }
}
```

**Notes:**
- To allow admin login, configure either:
  - `ADMIN_EMAILS` (comma-separated allow list), or
  - `ADMIN_EMAIL_DOMAIN` (example: `yourcollege.edu`)
- If you don’t configure either, **admin login is denied by default**.

### 1️⃣ Admin Endpoints (`/api/admin`)

#### POST `/api/admin/add`

Add a new alumni record to the blockchain.

**Auth**: `Authorization: Bearer <token>` (admin role)

**Body:**

```json
{
  "name": "Saurabh Singh",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "Information Technology",
  "graduationYear": "2026",
  "certId": "CERT-2025-ABC123"
}
```

**Response:**

```json
{
  "certId": "CERT-2025-ABC123",
  "transactionHash": "0x...",
  "blockNumber": 123456,
  "timestamp": "2025-11-16T12:34:56.000Z"
}
```

---

#### GET `/api/admin/stats`

Get basic stats and network info.

**Auth**: `Authorization: Bearer <token>` (admin role)

**Response:**

```json
{
  "totalRecords": 42,
  "network": {
    "chainId": 80001,
    "name": "maticmum",
    "rpcUrl": "https://rpc-mumbai.maticvigil.com",
    "contractAddress": "0x..."
  }
}
```

---

### 2️⃣ Verification Endpoints (`/api/verify`)

#### GET `/api/verify/:certId`

Fetch record details by certificate ID.

**Response (if exists):**

```json
{
  "certId": "CERT-2025-ABC123",
  "dataHash": "0x...",
  "issuer": "0xIssuerAddress",
  "issuerName": "XYZ University",
  "timestamp": 1731750000,
  "blockNumber": 847256,
  "exists": true
}
```

If not found:

```json
{
  "error": "Record not found",
  "certId": "CERT-2025-UNKNOWN"
}
```

---

#### POST `/api/verify/check`

Verify that provided alumni data matches the on-chain record.

**Body:**

```json
{
  "certId": "CERT-2025-ABC123",
  "name": "Saurabh Singh",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "Information Technology",
  "graduationYear": "2026"
}
```

**Response:**

```json
{
  "certId": "CERT-2025-ABC123",
  "valid": true,
  "issuer": "0xIssuerAddress",
  "issuerName": "XYZ University",
  "timestamp": 1731750000,
  "blockNumber": 847256
}
```

---

## 🔐 Hash Generation (Consistency with Solidity)

`utils/hashUtils.js` implements the same logic as the smart contract:

```solidity
keccak256(abi.encodePacked(
  name,
  rollNumber,
  degree,
  branch,
  graduationYear,
  certId
));
```

This ensures:
- Frontend/Backend and Smart Contract hashes always match
- `verifyRecord` works correctly for external data

---

## ✅ Next Frontend Integration Steps

- In `AdminPanel.jsx`, replace the mock `setTimeout` submission with:
  - `axios.post('http://localhost:5000/api/admin/add', formData)`
- For verification pages / student dashboard:
  - Use:
    - `GET /api/verify/:certId` to fetch record
    - `POST /api/verify/check` to validate full data

---

**Backend is now aligned with the project documentation and ready for integration.**


