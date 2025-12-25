/**
 * Encryption utilities for storing sensitive credential data
 */
import crypto from 'crypto';

// Use environment variable for encryption key, or generate a default for development
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || 
  crypto.createHash('sha256').update('dev-encryption-key-change-in-production').digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (API keys, tokens, etc.)
 */
export function encryptCredential(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData (all in hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptCredential(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt a credential object (for storing multiple fields)
 */
export function encryptCredentialData(data: Record<string, any>): string {
  return encryptCredential(JSON.stringify(data));
}

/**
 * Decrypt a credential object
 */
export function decryptCredentialData(encryptedData: string): Record<string, any> {
  const decrypted = decryptCredential(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Mask sensitive data for display (show only last 4 chars)
 */
export function maskCredential(value: string): string {
  if (!value || value.length <= 8) {
    return '••••••••';
  }
  return '••••••••' + value.slice(-4);
}
