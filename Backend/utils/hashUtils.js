const { ethers } = require('ethers');

/**
 * Generate data hash exactly like AlumniVerification.generateDataHash in Solidity
 *
 * Solidity:
 * keccak256(abi.encodePacked(name, rollNumber, degree, branch, graduationYear, certId));
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.rollNumber
 * @param {string} data.degree
 * @param {string} data.branch
 * @param {string|number} data.graduationYear
 * @param {string} data.certId
 * @returns {string} keccak256 hash (0x...)
 */
function generateDataHash({ name, rollNumber, degree, branch, graduationYear, certId }) {
  if (!name || !rollNumber || !degree || !branch || !graduationYear || !certId) {
    throw new Error('Missing required fields for hash generation');
  }

  const yearAsString = String(graduationYear);

  return ethers.utils.solidityKeccak256(
    ['string', 'string', 'string', 'string', 'string', 'string'],
    [name, rollNumber, degree, branch, yearAsString, certId]
  );
}

module.exports = {
  generateDataHash,
};


