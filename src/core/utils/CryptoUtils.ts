import crypto from 'crypto';

/**
 * Cryptographic utility functions
 */
export class CryptoUtils {
  /**
   * Generate random string
   */
  static randomString(length: number = 32): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }
}