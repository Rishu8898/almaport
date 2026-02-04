const fs = require('fs');
const path = require('path');

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Loads Backend/config.local.json (if present) and applies missing keys into process.env.
 * This is useful on Windows where .env may be hidden/misplaced.
 */
function loadLocalConfigIntoEnv() {
  const backendRoot = path.join(__dirname, '..');
  const localConfigPath = path.join(backendRoot, 'config.local.json');
  const localConfig = readJsonIfExists(localConfigPath);

  if (!localConfig) {
    return { loaded: false, path: localConfigPath };
  }

  Object.entries(localConfig).forEach(([key, value]) => {
    if (process.env[key] === undefined && value !== undefined && value !== null) {
      process.env[key] = String(value);
    }
  });

  return { loaded: true, path: localConfigPath };
}

module.exports = {
  loadLocalConfigIntoEnv,
};


