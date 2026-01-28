"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Cryptographic utility functions
 */
class CryptoUtils {
    /**
     * Generate random string
     */
    static randomString(length = 32) {
        return crypto_1.default
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
    /**
     * Generate UUID v4
     */
    static generateUUID() {
        return crypto_1.default.randomUUID();
    }
}
exports.CryptoUtils = CryptoUtils;
