/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for secure encryption of access tokens and secrets
 */

import crypto from 'crypto';

// Encryption key should be 32 bytes for AES-256
// Store in environment variable in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Warn if using auto-generated key in production
if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  console.error('[SECURITY WARNING] ENCRYPTION_KEY not set in production! Encrypted data will be unrecoverable after restart.');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes auth tag

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns base64 encoded string containing: IV + AuthTag + Ciphertext
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + Ciphertext
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypt data encrypted with encrypt()
 * Expects base64 encoded string containing: IV + AuthTag + Ciphertext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, AuthTag, and Ciphertext
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed - data may be corrupted or key changed:', error);
    // Return empty string rather than throwing to prevent crashes
    // Caller should handle empty response appropriately
    return '';
  }
}

/**
 * Check if a string appears to be encrypted
 * (Encrypted strings are base64 and have minimum length)
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) return false;
  
  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(data);
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Compute HMAC-SHA256 signature for webhook verification
 */
export function computeHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify HMAC signature for webhook payloads
 */
export function verifyHmacSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const expectedSignature = computeHmacSignature(payload, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
