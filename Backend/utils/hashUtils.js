const { ethers } = require("ethers");

/**
 * Generate data hash based only on personal data (no Certificate ID)
 * Hash depends on: name, rollNumber, degree, branch, graduationYear
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.rollNumber
 * @param {string} data.degree
 * @param {string} data.branch
 * @param {string|number} data.graduationYear
 * @returns {string} keccak256 hash (0x...)
 */
function generateDataHash({
  name,
  rollNumber,
  degree,
  branch,
  graduationYear,
}) {
  if (!name || !rollNumber || !degree || !branch || !graduationYear) {
    throw new Error("Missing required fields for hash generation");
  }

  // Normalize: trim whitespace and lowercase text fields for case-insensitive matching
  const normName = name.trim().toLowerCase();
  const normRoll = rollNumber.trim().toLowerCase();
  const normDegree = degree.trim().toLowerCase();
  const normBranch = branch.trim().toLowerCase();
  const yearAsString = String(graduationYear).trim();

  return ethers.utils.solidityKeccak256(
    ["string", "string", "string", "string", "string"],
    [normName, normRoll, normDegree, normBranch, yearAsString],
  );
}

module.exports = {
  generateDataHash,
};
