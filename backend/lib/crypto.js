/**
 * Encryption utilities for sensitive data (OAuth tokens, etc.)
 * Uses AES-256-GCM for authenticated encryption
 */
const crypto = require('crypto');

// Encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'lootly-dev-encryption-key-32ch!'; // 32 chars for dev

// Validate key length
if (ENCRYPTION_KEY.length !== 32) {
  console.warn('[CRYPTO] Warning: ENCRYPTION_KEY should be exactly 32 characters for AES-256');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt a string value
 * @param {string} plaintext - The value to encrypt
 * @returns {string} - Base64 encoded encrypted value (iv:authTag:ciphertext)
 */
function encrypt(plaintext) {
  if (!plaintext) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine IV + auth tag + ciphertext, separated by colons
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted value
 * @param {string} encryptedValue - Base64 encoded encrypted value (iv:authTag:ciphertext)
 * @returns {string|null} - Decrypted plaintext, or null if invalid
 */
function decrypt(encryptedValue) {
  if (!encryptedValue) return null;

  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      console.error('[CRYPTO] Invalid encrypted value format');
      return null;
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[CRYPTO] Decryption failed:', error.message);
    return null;
  }
}

/**
 * Check if a token needs refresh (within 1 hour of expiry)
 * @param {Date|string} expiresAt - Token expiration timestamp
 * @returns {boolean} - True if token should be refreshed
 */
function shouldRefreshToken(expiresAt) {
  if (!expiresAt) return false;

  const expiry = new Date(expiresAt);
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  return expiry <= oneHourFromNow;
}

/**
 * Generate a random state parameter for OAuth
 * @returns {string} - Random state string
 */
function generateOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  shouldRefreshToken,
  generateOAuthState,
};
