const axios = require('axios');
const FormData = require('form-data');

/**
 * Uploads a file buffer to IPFS via Pinata.
 * @param {Buffer} fileBuffer - The binary contents of the file.
 * @param {string} originalName - The original name of the file (e.g. CERT-2024-XXXXX.pdf).
 * @returns {Promise<string>} - The IPFS CID.
 */
async function uploadToIPFS(fileBuffer, originalName) {
  const pinataJWT = process.env.PINATA_JWT;
  if (!pinataJWT) {
    throw new Error('PINATA_JWT is not configured in the environment.');
  }

  const formData = new FormData();
  // Pinata API requires the file to be appended as 'file'
  // Using form-data with a Buffer requires us to specify the filename
  formData.append('file', fileBuffer, {
    filename: originalName || 'document.pdf',
    contentType: 'application/pdf',
  });

  const pinataMetadata = JSON.stringify({
    name: originalName || 'Uploaded Document',
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${pinataJWT}`,
      },
    });
    
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error?.response?.data || error.message);
    throw new Error('Failed to upload file to IPFS');
  }
}

module.exports = {
  uploadToIPFS,
};
