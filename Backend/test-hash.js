/**
 * Quick hash consistency test
 * Run: node test-hash.js
 * This simulates what AdminPanel computes vs what verify.js computes
 * so you can confirm both sides produce the same hash for fresh certs.
 */
const { ethers } = require("ethers"); // ethers v5

const { generateDataHash } = require("./utils/hashUtils");

// ── Test data (use whatever you type into both AdminPanel and StudentDashboard) ─
const TEST_DATA = {
  name: "S",
  rollNumber: "12",
  degree: "MCA",
  branch: "Civil",
  graduationYear: 2020,
};

// ── BACKEND hash (what verify.js computes at check time) ────────────────────
const backendHash = generateDataHash(TEST_DATA);
console.log("\n=== BACKEND hash (verify.js uses this) ===");
console.log("Input:", TEST_DATA);
console.log("Hash :", backendHash);

// ── FRONTEND hash (what AdminPanel computes before addAlumniRecord) ─────────
// AdminPanel uses ethers v6 ethers.solidityPackedKeccak256
// ethers v5 ethers.utils.solidityKeccak256 is EQUIVALENT (same packed encoding)
const frontendHash = ethers.utils.solidityKeccak256(
  ["string", "string", "string", "string", "string"],
  [
    TEST_DATA.name.trim().toLowerCase(),
    TEST_DATA.rollNumber.trim().toLowerCase(),
    TEST_DATA.degree.trim().toLowerCase(),
    TEST_DATA.branch.trim().toLowerCase(),
    String(TEST_DATA.graduationYear).trim(),
  ],
);
console.log("\n=== FRONTEND hash (AdminPanel computes this before submit) ===");
console.log("Hash :", frontendHash);

// ── Verdict ─────────────────────────────────────────────────────────────────
console.log("\n=== RESULT ===");
if (backendHash === frontendHash) {
  console.log(
    "✅ MATCH — both sides produce the same hash. New certs WILL verify.",
  );
} else {
  console.log(
    "❌ MISMATCH — code bug detected! Hashes differ between AdminPanel and backend.",
  );
  console.log("Backend :", backendHash);
  console.log("Frontend:", frontendHash);
}

// ── Explain the old-cert problem ─────────────────────────────────────────────
console.log("\n=== WHY OLD CERTS FAIL ===");
console.log(
  "If a cert was created BEFORE certId was removed from the hash,\n" +
    "its stored on-chain hash = keccak256(pack(name, roll, degree, branch, year, certId)).\n" +
    "The new verification uses keccak256(pack(name, roll, degree, branch, year)).\n" +
    "These will NEVER match even with correct personal data.\n" +
    "👉 FIX: Create a brand-new cert via AdminPanel → search that new certId → verify.",
);
