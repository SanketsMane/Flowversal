import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get encryption key from environment or generate a default
 * In production, this should be a strong secret stored securely
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';
  
  // Derive a consistent key from the secret
  return crypto.pbkdf2Sync(secret, 'flowversal-salt', ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data (API keys, tokens, etc.)
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    
    return Buffer.from(combined).toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64').toString('hex');
    
    const parts = combined.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltHex, ivHex, tagHex, encrypted] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a string is encrypted (basic check)
 */
export function isEncrypted(text: string): boolean {
  try {
    // Encrypted data is base64 encoded and has specific structure
    const decoded = Buffer.from(text, 'base64').toString('hex');
    return decoded.includes(':') && decoded.split(':').length === 4;
  } catch {
    return false;
  }
}

/**
 * Encrypt object values (for API keys in config objects)
 */
export function encryptObjectValues(obj: Record<string, any>, keysToEncrypt: string[]): Record<string, any> {
  const encrypted = { ...obj };
  
  for (const key of keysToEncrypt) {
    if (encrypted[key] && typeof encrypted[key] === 'string' && !isEncrypted(encrypted[key])) {
      encrypted[key] = encrypt(encrypted[key]);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt object values
 */
export function decryptObjectValues(obj: Record<string, any>, keysToDecrypt: string[]): Record<string, any> {
  const decrypted = { ...obj };
  
  for (const key of keysToDecrypt) {
    if (decrypted[key] && typeof decrypted[key] === 'string' && isEncrypted(decrypted[key])) {
      try {
        decrypted[key] = decrypt(decrypted[key]);
      } catch (error) {
        // If decryption fails, keep original value (might be plain text)
        console.warn(`Failed to decrypt ${key}:`, error);
      }
    }
  }
  
  return decrypted;
}

// Convenience wrappers for field-level encryption using the same AES-GCM implementation
export function encryptField(value: string): string {
  return encrypt(value);
}

export function decryptField(value: string): string {
  // If value is not encrypted (e.g. plain text email), return as is
  if (!isEncrypted(value)) {
    return value;
  }
  return decrypt(value);
}

