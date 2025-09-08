// client/src/utils/powClient.js
import CryptoJS from 'crypto-js';

const sha256 = (input) => {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
};

// This function will be called on the client side to find the nonce
export const findClientNonce = (data, prefix = '000') => {
  let nonce = 0;
  let hash = '';
  const maxAttempts = 100000; // Reduced for client-side to prevent UI freeze

  while (nonce < maxAttempts) {
    const attempt = data + nonce;
    hash = sha256(attempt);
    if (hash.startsWith(prefix)) {
      return { nonce, hash };
    }
    nonce++;
  }
  // If not found within attempts, return indication
  return { nonce: -1, hash: '' };
};

// Add the missing verifyProofOfWork function
export const verifyProofOfWork = (data, nonce, prefix = '000') => {
  try {
    const attempt = data + nonce;
    const hash = sha256(attempt);
    return hash.startsWith(prefix);
  } catch (error) {
    console.error('Error verifying proof of work:', error);
    return false;
  }
};