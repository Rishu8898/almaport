# 📚 Alumni Verification Portal - Complete Documentation

## 🎯 Project Overview
A blockchain-based alumni credential verification system combining **React Frontend**, **Node.js Backend**, and **Solidity Smart Contracts** on Polygon Mumbai. This system provides tamper-proof, instantly verifiable educational credentials using decentralized blockchain storage.

**Key Features**:
- ✅ Tamper-proof credential storage
- ✅ Instant verification via QR codes
- ✅ Decentralized & immutable records
- ✅ Admin role-based access control
- ✅ Public verification (anyone can verify)

**Tech Stack**:
- Frontend: React 19 + Vite + React Router + Axios
- Backend: Node.js + Express + Ethers.js v5 + JWT Authentication
- Blockchain: Solidity 0.8.20 + Foundry + Polygon Mumbai
- Network: Polygon Mumbai testnet (chainId: 80001)

---

## 📁 Project Structure
```
alma-port/
├── FrontEnd/           # React app (3 main pages)
├── BlockChain/         # Solidity contracts & tests
└── Backend/            # Node.js API server
```

---

## 🎨 FRONTEND - 3 Main Pages

### 1. HomePage.jsx - Landing/Login
**Purpose**: Entry point with dual login options
- **Admin Portal**: Purple card with shield icon → Redirects to `/admin`
- **Student Portal**: Green card with graduation cap → Redirects to `/student/dashboard`
- **Stats**: Shows 1,247+ alumni verified, 98.5% success rate
- **Buttons**: Gmail login (TODO) + Demo access

**Key State**: `hoveredCard` tracks hover animations

---

### 2. AdminPanel.jsx ⭐ CRITICAL
**Purpose**: Add new alumni records to blockchain

**Form Fields**:
- Name, Roll Number, Degree, Branch, Graduation Year, Certificate ID

**Process**:
```
1. Admin fills form → Validates client-side
2. Clicks Submit → POST to /api/admin/add
3. Backend generates hash → Calls smart contract
4. Transaction mined → Returns receipt
5. Success screen shows:
   - Transaction Hash (clickable on Polygonscan)
   - Block Number
   - QR Code (for verification)
   - Auto-resets after 5 seconds
```

**Current**: Uses mock data (replace line 86-112 with real API call)

**Integration Code**:
```javascript
const response = await axios.post(
  'http://localhost:5000/api/admin/add',
  formData,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

### 3. StudentDashboard.jsx
**Purpose**: View verified credentials

**Displays**:
- Certificate details (name, roll number, degree, etc.)
- Blockchain transaction info (hash, block number)
- Tamper-proof badge + security features
- QR code for instant verification

**API Call**: 
```javascript
GET /api/verify/:certId  // Fetches from blockchain
```

---

## ⛓️ BLOCKCHAIN - Smart Contract

### AlumniVerification.sol ⭐ CRITICAL

**Core Functions**:
```solidity
addAlumniRecord(certId, dataHash)    // Add record (admin only)
getRecord(certId)                     // Fetch record (view - free)
verifyRecord(certId, dataHash)        // Verify data (public)
```

**Data Structure**:
```solidity
struct AlumniRecord {
  string certId;        // Unique ID
  bytes32 dataHash;     // Hash of alumni data
  address issuer;       // Admin wallet
  uint256 timestamp;    // When added
  uint256 blockNumber;  // Block number
  bool exists;          // Exists flag
  string issuerName;    // Institution name
}
```

**Security**:
- Only authorized issuers can add records
- No updates/deletes (immutable)
- Anyone can verify (public verification)
- Prevents duplicate certificate IDs

**Gas Costs**:
- Deploy: ~2M gas
- Add Record: ~150k gas
- Verify: ~50k gas
- Get Record: 0 gas (view function)

---

## 💼 BACKEND - Node.js API Server

### Core Files
- **server.js** - Express app setup
- **blockchain/config.js** - Web3 provider, wallet, contract
- **routes/admin.js** - Add record endpoint
- **routes/verify.js** - Get & verify record endpoints
- **routes/auth.js** - Google OAuth authentication
- **utils/hashUtils.js** - Generate keccak256 hash
- **middleware/auth.js** - JWT verification
- **auth/jwt.js** - Token signing/verification

### API Endpoints

#### POST /api/admin/add (Admin Only)
**Auth**: Bearer token required
**Body**:
```json
{
  "name": "John Doe",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "IT",
  "graduationYear": 2026,
  "certId": "CERT-2025-ABC123"
}
```
**Response**:
```json
{
  "certId": "CERT-2025-ABC123",
  "transactionHash": "0x...",
  "blockNumber": 123456,
  "timestamp": "2025-11-16T12:34:56.000Z"
}
```

#### GET /api/verify/:certId (Public)
**Auth**: None
**Response**:
```json
{
  "certId": "CERT-2025-ABC123",
  "dataHash": "0x...",
  "issuer": "0x...",
  "issuerName": "XYZ University",
  "timestamp": 1731750000,
  "blockNumber": 847256,
  "exists": true
}
```

#### POST /api/verify/check (Public)
**Body**: Provide alumni data to verify
```json
{
  "certId": "CERT-2025-ABC123",
  "name": "John Doe",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "IT",
  "graduationYear": 2026
}
```
**Response**:
```json
{
  "certId": "CERT-2025-ABC123",
  "valid": true,
  "issuer": "0x...",
  "issuerName": "XYZ University"
}
```

#### POST /api/auth/google (Login)
**Body**:
```json
{
  "credential": "<google_id_token>",
  "userType": "admin"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

---

## 🔄 Data Flow Example

### Adding Alumni Record
```
1. AdminPanel → POST /api/admin/add
2. Backend validates + authenticates (middleware/auth.js)
3. Backend generates hash (utils/hashUtils.js)
   Hash = keccak256(name + rollNumber + degree + branch + year + certId)
4. Backend calls contract.addAlumniRecord(certId, hash)
5. Transaction mined on Polygon network
6. Backend returns { transactionHash, blockNumber, timestamp }
7. Frontend displays success with QR code
```

### Verifying Alumni Record
```
1. Student/Employer → GET /api/verify/:certId
2. Backend queries contract.getRecord(certId)
3. Returns stored record data
4. (Optional) POST /api/verify/check with alumni data
5. Backend compares provided hash with on-chain hash
6. Returns valid=true/false
```

### Authentication Flow
```
1. User clicks "Login with Gmail" → Google OAuth flow
2. Google generates ID token → Frontend sends to backend
3. Backend verifies Google token signature
4. Checks if email authorized as admin
5. Generates JWT token (7-day expiration)
6. Frontend stores in localStorage
7. Subsequent requests include: Authorization: Bearer <token>
8. Backend middleware (requireAuth) verifies JWT
```

---

## ⚙️ Environment Setup

### Create config.local.json (Backend)
```json
{
  "RPC_URL": "https://rpc-mumbai.maticvigil.com",
  "CONTRACT_ADDRESS": "0x...",
  "PRIVATE_KEY": "0x...",
  "JWT_SECRET": "your-secret-key",
  "PORT": 5000,
  "CORS_ORIGIN": "http://localhost:5173",
  "GOOGLE_CLIENT_ID": "your-google-client-id",
  "ADMIN_EMAILS": "admin@example.com,admin2@example.com"
}
```

### Setup Steps
```bash
# 1. Blockchain - Build contract
cd BlockChain
forge build

# 2. Backend - Install & run
cd ../Backend
npm install
npm run dev

# 3. Frontend - Install & run (new terminal)
cd ../FrontEnd
npm install
npm run dev
```

---

## 🔑 Key Integration Points

### Frontend-to-Backend
- AdminPanel submits to `POST /api/admin/add` with Bearer token
- StudentDashboard fetches from `GET /api/verify/:certId`
- HomePage receives JWT from `POST /api/auth/google`

### Backend-to-Blockchain
- All contract calls via `blockchain/config.js`
- Hash generation must match Solidity exactly
- Transactions signed with admin wallet

### Hash Generation (Critical!)
**Must match in Frontend, Backend, AND Solidity**:
```javascript
keccak256(abi.encodePacked(name, rollNumber, degree, branch, graduationYear, certId))
```

---

## 📊 Important Files Summary

| File | Purpose |
|------|---------|
| HomePage.jsx | Landing page with login options |
| AdminPanel.jsx | Form to add records (mock → API) |
| StudentDashboard.jsx | Display verified credentials |
| AlumniVerification.sol | Smart contract (immutable records) |
| server.js | Express app entry point |
| routes/admin.js | Add record API endpoint |
| routes/verify.js | Get/verify record endpoints |
| blockchain/config.js | Web3 provider + contract |
| utils/hashUtils.js | Generate keccak256 hash |
| middleware/auth.js | JWT authentication |

---

---

## 🔧 Prerequisites & Installation

### Requirements
- **Node.js** (v16+) - For frontend and backend
- **Foundry** - For smart contract development
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Git** - For version control
- **MetaMask Wallet** - For testing transactions
- **Polygon Mumbai Testnet MATIC** - Get free from [Faucet](https://faucet.polygon.technology/)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/Rishu8898/almaport.git
cd alma-port
```

#### 2. Setup Blockchain
```bash
cd BlockChain
forge install
forge build
forge test
# Deploy to Mumbai (see deployment section below)
```

#### 3. Setup Backend
```bash
cd ../Backend
npm install
# Create config.local.json (see configuration section)
npm run dev
```

#### 4. Setup Frontend
```bash
cd ../FrontEnd
npm install
npm run dev
# Access at http://localhost:5173
```

---

## ⚙️ Detailed Configuration

### Blockchain - Foundry Setup

**foundry.toml**:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
[rpc_endpoints]
mumbai = "https://rpc-mumbai.maticvigil.com"
```

**Deploy Contract**:
```bash
cd BlockChain
export PRIVATE_KEY="0x..."
export INSTITUTION_NAME="Your University"
forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification \
  --rpc-url https://rpc-mumbai.maticvigil.com \
  --broadcast --verify
```

**Save the contract address** - needed for backend config.

---

### Backend - Complete Configuration

**config.local.json** (copy from config.local.example):
```json
{
  "RPC_URL": "https://rpc-mumbai.maticvigil.com",
  "CONTRACT_ADDRESS": "0x...",
  "PRIVATE_KEY": "0x...",
  "JWT_SECRET": "generate-random-secret-key-here",
  "PORT": 5000,
  "CORS_ORIGIN": "http://localhost:5173",
  "GOOGLE_CLIENT_ID": "your-google-client-id.apps.googleusercontent.com",
  "ADMIN_EMAILS": "admin@example.com,admin2@example.com"
}
```

**Alternative .env file**:
```env
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
JWT_SECRET=your-secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=...
ADMIN_EMAILS=admin@example.com
```

**Start Backend**:
```bash
cd Backend
npm run dev        # Development (auto-restart)
npm start          # Production
```

---

### Frontend - Environment Setup

**Create .env in FrontEnd folder**:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Start Frontend**:
```bash
cd FrontEnd
npm run dev        # Development
npm run build      # Production build
npm run preview    # Preview production
```

---

## 📝 Smart Contract Deep Dive

### AlumniVerification.sol - Complete Reference

#### Contract State
```solidity
mapping(address => bool) public authorizedIssuers;     // Admin whitelist
mapping(address => string) public issuerNames;        // Institution names
mapping(string => AlumniRecord) public records;       // Certificate -> Record
string[] public certificateIds;                       // All certificate IDs
uint256 public totalRecords;                          // Record counter
address public owner;                                 // Contract owner
```

#### Data Structure
```solidity
struct AlumniRecord {
  string certId;           // Unique certificate ID
  bytes32 dataHash;        // keccak256(name, rollNumber, degree, branch, year, certId)
  address issuer;          // Admin who added record
  uint256 timestamp;       // Block timestamp when added
  uint256 blockNumber;     // Block number
  bool exists;             // Existence flag
  string issuerName;       // Institution name
}
```

#### Core Functions

**1. addAlumniRecord(certId, dataHash)**
- **Access**: Only authorized issuers
- **Process**:
  1. Check caller is authorized
  2. Check certId not duplicate
  3. Store record with timestamp/block info
  4. Emit AlumniRecordAdded event
- **Returns**: (success, timestamp, blockNumber)
- **Gas**: ~150,000

**2. verifyRecord(certId, dataHash)**
- **Access**: Public (anyone)
- **Process**:
  1. Get stored record
  2. Compare hashes
  3. Return verification result
- **Returns**: (isValid, issuer, issuerName, timestamp, blockNumber)
- **Gas**: ~50,000

**3. getRecord(certId)**
- **Access**: Public (view)
- **Returns**: Complete AlumniRecord struct
- **Gas**: 0 (view function - free)

**4. generateDataHash(name, rollNumber, degree, branch, graduationYear, certId)**
- **Purpose**: Create consistent keccak256 hash
- **Critical**: Must match exactly with backend hash
- **Formula**: `keccak256(abi.encodePacked(name, rollNumber, degree, branch, graduationYear, certId))`

#### Admin Functions

**authorizeIssuer(address issuer, string memory name)**
- Owner only
- Adds new authorized issuer
- Stores institution name

**revokeIssuer(address issuer)**
- Owner only
- Removes authorization

**transferOwnership(address newOwner)**
- Current owner only
- Transfers contract ownership

#### Events

```solidity
event AlumniRecordAdded(string certId, bytes32 dataHash, address issuer, uint256 timestamp);
event IssuerAuthorized(address indexed issuer, string name);
event IssuerRevoked(address indexed issuer);
event RecordVerified(string certId, bool isValid);
```

---

## 💼 Backend API - Complete Reference

### Authentication

**JWT Token** (7-day expiration):
```json
{
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1704672000
}
```

**All admin endpoints require**:
```
Authorization: Bearer <jwt_token>
```

---

### API Endpoints

#### 1. POST /api/auth/google
**Login endpoint** - No auth required

**Request**:
```json
{
  "credential": "<google_id_token>",
  "userType": "admin"
}
```

**Response** (Success):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Response** (Unauthorized):
```json
{
  "error": "Not authorized for this role"
}
```

**Process**:
1. Verify Google ID token signature
2. Extract email from token
3. Check if email in ADMIN_EMAILS or matches ADMIN_EMAIL_DOMAIN
4. Generate JWT token (7 days)
5. Return token and user info

---

#### 2. POST /api/admin/add
**Add alumni record** - Admin only

**Auth**: Bearer token (admin role required)

**Request**:
```json
{
  "name": "John Doe",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "Information Technology",
  "graduationYear": 2026,
  "certId": "CERT-2025-ABC123"
}
```

**Response** (Success - 201):
```json
{
  "certId": "CERT-2025-ABC123",
  "transactionHash": "0x1234567890abcdef...",
  "blockNumber": 43982156,
  "timestamp": "2025-02-05T12:34:56.000Z"
}
```

**Response** (Missing Fields - 400):
```json
{
  "error": "Missing required fields",
  "required": ["name", "rollNumber", "degree", "branch", "graduationYear", "certId"]
}
```

**Response** (Unauthorized - 401):
```json
{
  "error": "Missing or invalid Authorization header"
}
```

**Response** (Forbidden - 403):
```json
{
  "error": "Forbidden"
}
```

**Response** (Error - 500):
```json
{
  "error": "Failed to add alumni record",
  "details": "Certificate ID already exists"
}
```

**Process**:
1. Verify JWT token
2. Check admin role
3. Validate all fields
4. Generate hash: `keccak256(name, rollNumber, degree, branch, graduationYear, certId)`
5. Call contract: `addAlumniRecord(certId, hash)`
6. Wait for transaction receipt
7. Fetch block data for timestamp
8. Return transaction details

---

#### 3. GET /api/admin/stats
**Get platform statistics** - Admin only

**Auth**: Bearer token (admin role required)

**Response** (Success):
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

#### 4. GET /api/verify/:certId
**Get record by certificate ID** - Public (no auth)

**Response** (Record Found):
```json
{
  "certId": "CERT-2025-ABC123",
  "dataHash": "0x1234567890abcdef...",
  "issuer": "0xAdminAddress",
  "issuerName": "XYZ University",
  "timestamp": 1738771200,
  "blockNumber": 43982156,
  "exists": true
}
```

**Response** (Record Not Found):
```json
{
  "error": "Record not found",
  "certId": "CERT-2025-UNKNOWN"
}
```

---

#### 5. POST /api/verify/check
**Verify alumni data against blockchain** - Public (no auth)

**Request**:
```json
{
  "certId": "CERT-2025-ABC123",
  "name": "John Doe",
  "rollNumber": "2214094",
  "degree": "B.Tech",
  "branch": "Information Technology",
  "graduationYear": 2026
}
```

**Response** (Valid):
```json
{
  "certId": "CERT-2025-ABC123",
  "valid": true,
  "issuer": "0xAdminAddress",
  "issuerName": "XYZ University",
  "timestamp": 1738771200,
  "blockNumber": 43982156
}
```

**Response** (Invalid/Not Found):
```json
{
  "certId": "CERT-2025-ABC123",
  "valid": false,
  "error": "Data mismatch or record not found"
}
```

**Process**:
1. Fetch record by certId
2. Generate hash from provided data
3. Compare with on-chain hash
4. Return verification result

---

#### 6. GET /health
**Health check** - No auth

**Response**:
```json
{
  "status": "ok",
  "message": "Alumni Verification Backend running"
}
```

---

## 🎨 Frontend Components - Detailed

### File Structure
```
FrontEnd/
├── src/
│   ├── App.jsx                    # Main router
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── App.css                    # App styles
│   ├── components/
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── HomePage.css
│   │   ├── AdminPanel.jsx         # Add records
│   │   ├── AdminPanel.css
│   │   ├── StudentDashboard.jsx   # View records
│   │   ├── StudentDashboard.css
│   │   ├── ProtectedRoute.jsx     # Auth wrapper
│   │   └── VerificationPage.jsx   # (Optional)
│   ├── assets/                    # Images, SVGs
│   └── auth/
│       └── session.js             # Auth helper
├── package.json
├── vite.config.js
├── eslint.config.js
└── index.html
```

### Routes
```javascript
/                       → HomePage (public)
/admin                  → AdminPanel (admin protected)
/student/dashboard      → StudentDashboard (public - shows mock data)
```

### HomePage.jsx
- **Hero Section**: Brand intro with blockchain badge
- **Admin Card**: Purple theme, add records feature
- **Student Card**: Green theme, view records feature
- **Stats**: 1,247+ verified, 100% secure, 98.5% success rate
- **Buttons**: Gmail login + Demo access

### AdminPanel.jsx ⭐ CRITICAL
- **Form Fields**: Name, Roll Number, Degree, Branch, Year, Cert ID
- **Current**: Mock submission (line 86-112)
- **Integration**: Replace with `POST /api/admin/add`
- **Validation**: Client-side checks for required fields
- **Success**: Shows transaction hash, block number, QR code
- **Auto-reset**: After 5 seconds

### StudentDashboard.jsx
- **Welcome Card**: Student name + verification status
- **Certificate Details**: All credential information
- **Blockchain Info**: Transaction hash, block number, network status
- **QR Code**: Toggleable verification code
- **Actions**: Download (TODO), Share, View QR
- **Current**: Mock data (line 11-24)
- **Integration**: Replace with `GET /api/verify/:certId`

---

## 🔄 Complete Data Flow Examples

### Example 1: Adding Alumni Record (End-to-End)

```
STEP 1: ADMIN INITIATES
├─ Opens AdminPanel.jsx at http://localhost:5173/admin
├─ Fills form:
│  ├─ Name: "John Doe"
│  ├─ Roll Number: "2214094"
│  ├─ Degree: "B.Tech"
│  ├─ Branch: "IT"
│  ├─ Graduation Year: "2026"
│  └─ Certificate ID: "CERT-2025-ABC123"
└─ Clicks "Submit"

STEP 2: FRONTEND VALIDATION
├─ Validates all fields present
├─ Validates year between 1950 and 2031
├─ Displays inline error if validation fails
└─ If valid, proceeds to API call

STEP 3: API REQUEST
├─ Frontend sends: POST http://localhost:5000/api/admin/add
├─ Headers: { Authorization: "Bearer <jwt_token>" }
├─ Body:
│  {
│    "name": "John Doe",
│    "rollNumber": "2214094",
│    "degree": "B.Tech",
│    "branch": "IT",
│    "graduationYear": 2026,
│    "certId": "CERT-2025-ABC123"
│  }
└─ Frontend shows loading state

STEP 4: BACKEND PROCESSING (routes/admin.js)
├─ Receives request
├─ Middleware requireAuth verifies JWT
│  ├─ Extracts token from Authorization header
│  ├─ Verifies signature with JWT_SECRET
│  └─ Attaches user info to request
├─ Middleware requireRole checks admin role
│  └─ Returns 403 if not admin
├─ Validates all fields present
│  └─ Returns 400 if missing
└─ Calls hashUtils.generateDataHash(data)

STEP 5: HASH GENERATION (utils/hashUtils.js)
├─ Takes all 6 fields as parameters
├─ Uses ethers.utils.solidityKeccak256()
├─ Encoding: ['string', 'string', 'string', 'string', 'string', 'string']
├─ Input: ['John Doe', '2214094', 'B.Tech', 'IT', '2026', 'CERT-2025-ABC123']
└─ Output: 0x1234567890abcdef... (64 hex chars)

STEP 6: BLOCKCHAIN TRANSACTION (blockchain/config.js)
├─ Backend calls: contract.addAlumniRecord(certId, dataHash)
├─ Smart contract executes:
│  ├─ Checks msg.sender is authorized issuer
│  ├─ Checks certId doesn't already exist
│  ├─ Creates AlumniRecord struct:
│  │  ├─ certId: "CERT-2025-ABC123"
│  │  ├─ dataHash: 0x...
│  │  ├─ issuer: 0xAdminAddress
│  │  ├─ timestamp: 1704067200
│  │  ├─ blockNumber: 43982156
│  │  ├─ exists: true
│  │  └─ issuerName: "XYZ University"
│  ├─ Stores in records mapping
│  ├─ Pushes certId to certificateIds array
│  ├─ Increments totalRecords
│  └─ Emits AlumniRecordAdded event
├─ Transaction sent to Polygon network
├─ Miners include in block
├─ Block mined (usually 2-5 seconds)
└─ Backend calls tx.wait() to get receipt

STEP 7: RECEIPT PROCESSING (routes/admin.js)
├─ Receives transaction receipt:
│  ├─ transactionHash: "0x1234567890..."
│  ├─ blockNumber: 43982156
│  ├─ status: 1 (success)
│  └─ gasUsed: 145000
├─ Fetches block data: provider.getBlock(blockHash)
├─ Extracts block timestamp: 1704067200
├─ Formats response:
│  {
│    "certId": "CERT-2025-ABC123",
│    "transactionHash": "0x1234567890...",
│    "blockNumber": 43982156,
│    "timestamp": "2025-02-05T12:34:56.000Z"
│  }
└─ Sends 201 Created response

STEP 8: FRONTEND SUCCESS
├─ Receives response
├─ Shows success screen with:
│  ├─ Green checkmark animation
│  ├─ Transaction hash (clickable link to Polygonscan)
│  ├─ Block number
│  ├─ QR code (encodes verification URL)
│  └─ Certificate ID
├─ Auto-resets form after 5 seconds
└─ User can add another record
```

### Example 2: Verifying Alumni Record

```
STEP 1: VERIFICATION REQUEST
├─ StudentDashboard gets certId from URL params
├─ Or external user scans QR code
└─ Sends: GET http://localhost:5000/api/verify/CERT-2025-ABC123

STEP 2: BACKEND QUERY (routes/verify.js)
├─ No authentication required (public endpoint)
├─ Calls: contract.getRecord(certId)
├─ Smart contract:
│  ├─ Looks up record in mapping
│  ├─ Returns stored AlumniRecord
│  └─ Returns empty if not found
└─ Formats response

STEP 3: FRONTEND DISPLAY (StudentDashboard.jsx)
├─ Shows certificate details:
│  ├─ Name, Roll Number, Degree, Branch
│  ├─ Graduation Year, Certificate ID
│  └─ Issue Date, Issuer Name
├─ Shows blockchain info:
│  ├─ Transaction hash (link to Polygonscan)
│  ├─ Block number
│  └─ Network (Polygon Mumbai)
├─ Shows security badges:
│  ├─ ✅ Tamper-Proof
│  ├─ ✅ Immutable
│  └─ ✅ Decentralized
└─ Shows QR code for scanning

STEP 4: OPTIONAL FULL VERIFICATION
├─ User provides complete alumni data
├─ Sends: POST http://localhost:5000/api/verify/check
├─ Backend:
│  ├─ Gets record from blockchain
│  ├─ Generates hash from provided data
│  ├─ Compares: provided_hash == on_chain_hash
│  └─ Returns valid=true/false
└─ Frontend shows verification result
```

### Example 3: Authentication Flow

```
STEP 1: USER CLICKS LOGIN
├─ Opens HomePage.jsx
├─ Clicks "Login with Gmail" button
└─ Google OAuth pop-up opens

STEP 2: GOOGLE AUTHENTICATION
├─ User logs into Google account
├─ Google generates ID token (JWT)
├─ Frontend receives credential
└─ Token contains: email, name, picture, aud, iss, etc.

STEP 3: BACKEND VERIFICATION (routes/auth.js)
├─ Frontend sends: POST http://localhost:5000/api/auth/google
├─ Body: { credential: "<google_id_token>", userType: "admin" }
├─ Backend uses google-auth-library:
│  ├─ Verifies token signature
│  ├─ Checks client ID matches GOOGLE_CLIENT_ID
│  ├─ Checks token not expired
│  └─ Extracts email: "admin@example.com"
├─ Checks authorization:
│  ├─ If userType="admin":
│  │  ├─ Check: email in ADMIN_EMAILS? OR
│  │  ├─ Check: domain matches ADMIN_EMAIL_DOMAIN?
│  │  └─ If no → return 401 "Not authorized"
│  └─ If userType="student" → allow
├─ Generates JWT token (auth/jwt.js):
│  ├─ Payload:
│  │  {
│  │    "email": "admin@example.com",
│  │    "name": "Admin User",
│  │    "role": "admin"
│  │  }
│  ├─ Secret: JWT_SECRET from config
│  └─ Expires: 7 days
└─ Returns response:
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { "email": "admin@example.com", "name": "Admin User", "role": "admin" }
   }

STEP 4: FRONTEND STORAGE
├─ Receives JWT token
├─ Stores in localStorage: localStorage.setItem('token', jwtToken)
├─ Stores in localStorage: localStorage.setItem('userRole', 'admin')
└─ Redirects to /admin

STEP 5: AUTHENTICATED REQUESTS
├─ All subsequent requests include JWT:
│  ├─ Headers: { Authorization: "Bearer <jwt_token>" }
│  └─ Example: POST /api/admin/add (AdminPanel form)
├─ Backend middleware (middleware/auth.js):
│  ├─ Extracts token from Authorization header
│  ├─ Calls jwt.verifySessionToken(token)
│  ├─ If valid: attaches user to request → continue
│  └─ If invalid/expired: return 401
└─ Request proceeds to route handler

STEP 6: TOKEN EXPIRATION (After 7 days)
├─ User makes request with expired token
├─ Backend returns 401 Unauthorized
├─ Frontend catches 401 error
├─ Frontend clears localStorage
└─ Frontend redirects to HomePage (login page)
```

---

## 🔑 Key Integration Points

### Critical Code Replacements

**1. AdminPanel.jsx (Line 86-112) - Replace Mock with Real API**
```javascript
// OLD (Mock):
const result = {
  certId: formData.certId,
  transactionHash: `0x${Math.random().toString(16).substr(2)}...`,
  blockNumber: Math.floor(Math.random() * 900000) + 1000000,
  timestamp: new Date().toISOString(),
};

// NEW (Real):
const token = localStorage.getItem('token');
const response = await axios.post(
  'http://localhost:5000/api/admin/add',
  {
    name: formData.name,
    rollNumber: formData.rollNumber,
    degree: formData.degree,
    branch: formData.branch,
    graduationYear: parseInt(formData.graduationYear),
    certId: formData.certId,
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
);
const result = response.data;
```

**2. StudentDashboard.jsx (Line 11-24) - Replace Mock Data with Real API**
```javascript
// OLD (Mock):
const [studentData] = useState({
  name: 'Saurabh Singh',
  rollNumber: '2214094',
  // ... more mock fields
});

// NEW (Real):
const [studentData, setStudentData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStudentData = async () => {
    try {
      const certId = new URLSearchParams(window.location.search).get('certId');
      const response = await axios.get(
        `http://localhost:5000/api/verify/${certId}`
      );
      setStudentData(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
      // Show error UI
    } finally {
      setLoading(false);
    }
  };
  fetchStudentData();
}, []);

if (loading) return <div>Loading...</div>;
if (!studentData) return <div>Record not found</div>;
```

---

## 🧪 Testing

### Run Blockchain Tests
```bash
cd BlockChain
forge test                           # Run all tests
forge test -vv                       # Verbose output
forge test --match-test testName     # Run specific test
forge coverage                       # Check coverage
```

### Test Coverage
Current test suite covers:
- ✅ Add alumni record
- ✅ Get record
- ✅ Verify record
- ✅ Access control (onlyAuthorizedIssuer)
- ✅ Duplicate prevention
- ✅ Event emissions

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Smart contract tested locally
- [ ] Contract compiled without errors (`forge build`)
- [ ] Backend environment variables configured
- [ ] Frontend environment variables set
- [ ] Google OAuth credentials obtained
- [ ] Admin email addresses configured

### Deployment Steps
- [ ] Deploy smart contract to Mumbai: `forge script DeployAlumniVerification.s.sol --rpc-url <RPC> --broadcast`
- [ ] Save contract address
- [ ] Update backend `config.local.json` with contract address
- [ ] Authorize admin issuers on contract
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Test add record flow
- [ ] Test verify record flow
- [ ] Test authentication

### Post-Deployment
- [ ] Verify contract on Polygonscan
- [ ] Test QR code scanning
- [ ] Monitor for errors in logs
- [ ] Setup error tracking (Sentry, etc.)

---

## 📚 Important Files Summary

| File | Type | Purpose | Status |
|------|------|---------|--------|
| AlumniVerification.sol | Smart Contract | Core blockchain logic | ✅ Complete |
| AdminPanel.jsx | Component | Add records form | ⚠️ Mock API |
| StudentDashboard.jsx | Component | View credentials | ⚠️ Mock data |
| routes/admin.js | Backend | Add record API | ✅ Complete |
| routes/verify.js | Backend | Verify record API | ✅ Complete |
| routes/auth.js | Backend | Google OAuth | ✅ Complete |
| blockchain/config.js | Backend | Web3 setup | ✅ Complete |
| utils/hashUtils.js | Backend | Hash generation | ✅ Complete |
| middleware/auth.js | Backend | JWT auth | ✅ Complete |

---

## 🚨 Troubleshooting

### Common Issues

**1. "Contract artifact not found" Error**
```
Solution: Run 'forge build' in BlockChain folder
```

**2. "Private key invalid" Error**
```
Solution: Check PRIVATE_KEY format (0x... or plain hex)
Make sure key is from authorized issuer account
```

**3. "Connection refused" Error**
```
Solution: Check backend is running on port 5000
Check RPC_URL is correct and accessible
```

**4. "Invalid JWT Token" Error**
```
Solution: Token may be expired (7 days)
Try logging in again
Clear localStorage and refresh
```

**5. "Certificate ID already exists" Error**
```
Solution: Certificate ID must be unique
Use different certificate ID
```

---

## ✅ Next Steps

1. **Deploy Smart Contract**: Use forge script to deploy to Mumbai
2. **Setup Backend Config**: Add deployed contract address to config.local.json
3. **Start Services**: Run backend and frontend
4. **Integrate Frontend APIs**: Replace mock data in AdminPanel and StudentDashboard
5. **Setup Google OAuth**: Configure GOOGLE_CLIENT_ID in backend
6. **Test End-to-End**: Add record → Verify → Check on Polygonscan
7. **Monitor Logs**: Watch for errors and optimize
8. **Production Deployment**: Deploy to mainnet when ready

---

## 📞 Support & Resources

- **Solidity Docs**: https://docs.soliditylang.org/
- **Foundry Docs**: https://book.getfoundry.sh/
- **Polygon Docs**: https://docs.polygon.technology/
- **Ethers.js Docs**: https://docs.ethers.org/v5/
- **React Docs**: https://react.dev/

---

**Built with ❤️ for blockchain-based alumni verification. Tamper-proof. Instant. Trustless.**


