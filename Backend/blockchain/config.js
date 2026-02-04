const path = require('path');
const fs = require('fs');
const { ethers } = require('ethers');
const { loadLocalConfigIntoEnv } = require('../config/loadLocalConfig');

// Ensure config.local.json values are available in process.env if .env is not used.
loadLocalConfigIntoEnv();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  throw new Error(
    [
      'Missing blockchain config. Provide these values either via environment variables or Backend/config.local.json:',
      '- RPC_URL',
      '- PRIVATE_KEY',
      '- CONTRACT_ADDRESS',
      '',
      `Tried to load config.local.json from: ${path.join(__dirname, '..', 'config.local.json')}`,
    ].join('\n')
  );
}

// Provider and wallet (using ethers v5)
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);

// Load ABI from Foundry build output
// Make sure you have run `forge build` in the BlockChain/ folder
const artifactPath = path.join(
  __dirname,
  '..',
  '..',
  'BlockChain',
  'out',
  'AlumniVerification.sol',
  'AlumniVerification.json'
);

if (!fs.existsSync(artifactPath)) {
  throw new Error(
    `Contract artifact not found at ${artifactPath}. Have you run "forge build" in the BlockChain folder?`
  );
}

// eslint-disable-next-line security/detect-non-literal-fs-filename
const artifactJson = fs.readFileSync(artifactPath, 'utf8');
const artifact = JSON.parse(artifactJson);

const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

async function getNetworkInfo() {
  const network = await provider.getNetwork();
  return {
    chainId: network.chainId,
    name: network.name,
    rpcUrl: RPC_URL,
    contractAddress: CONTRACT_ADDRESS,
  };
}

module.exports = {
  provider,
  wallet,
  contract,
  getNetworkInfo,
};


