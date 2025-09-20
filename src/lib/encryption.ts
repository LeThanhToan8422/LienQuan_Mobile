import CryptoJS from 'crypto-js';

/**
 * Encryption utility for sensitive account data
 * Uses AES encryption to protect passwords and sensitive information
 */

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";


/**
 * Encrypt sensitive text data
 * @param text - Plain text to encrypt
 * @returns Encrypted string
 */
export function encryptText(text: string): string {
  if (!text) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
}

/**
 * Decrypt encrypted text data
 * @param encryptedText - Encrypted string to decrypt
 * @returns Decrypted plain text
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    return originalText || encryptedText; // Return encrypted text if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
}

/**
 * Encrypt account credentials
 * @param credentials - Object containing sensitive account data
 * @returns Object with encrypted credentials
 */
export function encryptAccountCredentials(credentials: {
  gameUsername?: string;
  gamePassword?: string;
  additionalInfo?: string;
}) {
  return {
    gameUsername: credentials.gameUsername ? encryptText(credentials.gameUsername) : undefined,
    gamePassword: credentials.gamePassword ? encryptText(credentials.gamePassword) : undefined,
    additionalInfo: credentials.additionalInfo ? encryptText(credentials.additionalInfo) : undefined,
  };
}

/**
 * Decrypt account credentials
 * @param encryptedCredentials - Object containing encrypted account data
 * @returns Object with decrypted credentials
 */
export function decryptAccountCredentials(encryptedCredentials: {
  gameUsername?: string;
  gamePassword?: string;
  additionalInfo?: string;
}) {
  return {
    gameUsername: encryptedCredentials.gameUsername ? decryptText(encryptedCredentials.gameUsername) : undefined,
    gamePassword: encryptedCredentials.gamePassword ? decryptText(encryptedCredentials.gamePassword) : undefined,
    additionalInfo: encryptedCredentials.additionalInfo ? decryptText(encryptedCredentials.additionalInfo) : undefined,
  };
}