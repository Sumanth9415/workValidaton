// server/utils/powUtils.js
const crypto = require('crypto');

// Simple SHA256 hash function
const sha256 = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Simulates finding a nonce for a given prefix (e.g., '000')
const findNonce = (data, prefix = '000') => {
  let nonce = 0;
  let hash = '';
  const maxAttempts = 1000000; // Prevent infinite loops

  while (nonce < maxAttempts) {
    const attempt = data + nonce;
    hash = sha256(attempt);
    if (hash.startsWith(prefix)) {
      return { nonce, hash };
    }
    nonce++;
  }
  return { nonce: -1, hash: '' }; // Not found within max attempts
};

// Verifies if a given nonce and hash are valid for the data and prefix
const verifyProofOfWork = (data, nonce, expectedHash, prefix = '000') => {
  const attempt = data + nonce;
  const calculatedHash = sha256(attempt);
  return calculatedHash === expectedHash && calculatedHash.startsWith(prefix);
};

module.exports = { sha256, findNonce, verifyProofOfWork };
