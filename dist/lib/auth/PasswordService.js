"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const result_1 = require("../../core/result");
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Password service for hashing and comparing passwords
 */
class PasswordService {
    saltRounds;
    logger;
    constructor(config, logger = logger_1.Logger.getInstance()) {
        this.saltRounds = config?.saltRounds ?? parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
        this.logger = logger;
    }
    /**
     * Hash a password
     */
    async hash(password) {
        try {
            this.validatePassword(password);
            const salt = await bcrypt_1.default.genSalt(this.saltRounds);
            const hashed = await bcrypt_1.default.hash(password, salt);
            this.logger.debug('Password hashed successfully');
            return (0, result_1.ok)(hashed);
        }
        catch (error) {
            this.logger.error('Failed to hash password', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to hash password', 'PASSWORD_HASH_FAILED', 500, undefined, error));
        }
    }
    /**
     * Compare plain password with hashed password
     */
    async compare(plainPassword, hashedPassword) {
        try {
            this.validatePassword(plainPassword);
            const isMatch = await bcrypt_1.default.compare(plainPassword, hashedPassword);
            this.logger.debug('Password comparison completed', { isMatch });
            return (0, result_1.ok)(isMatch);
        }
        catch (error) {
            this.logger.error('Failed to compare passwords', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to compare passwords', 'PASSWORD_COMPARE_FAILED', 500, undefined, error));
        }
    }
    /**
     * Validate password (basic checks)
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        if (password.length > 128) {
            throw new Error('Password must be at most 128 characters');
        }
    }
    /**
     * Check password strength
     */
    checkStrength(password) {
        const feedback = [];
        let score = 0;
        // Length check
        if (password.length >= 8)
            score++;
        if (password.length >= 12)
            score++;
        // Complexity checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
            score++;
            feedback.push('Good: Contains both uppercase and lowercase letters');
        }
        else {
            feedback.push('Add both uppercase and lowercase letters');
        }
        if (/\d/.test(password)) {
            score++;
            feedback.push('Good: Contains numbers');
        }
        else {
            feedback.push('Add numbers');
        }
        if (/[^a-zA-Z0-9]/.test(password)) {
            score++;
            feedback.push('Good: Contains special characters');
        }
        else {
            feedback.push('Add special characters (!@#$%^&*)');
        }
        // Common patterns check
        if (/^(password|123456|qwerty)/i.test(password)) {
            score = 0;
            feedback.push('Avoid common passwords');
        }
        return {
            score: Math.min(score, 4),
            feedback,
        };
    }
    /**
     * Generate random password
     */
    generateRandomPassword(length = 16) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + symbols;
        let password = '';
        // Ensure at least one of each type
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        // Shuffle the password
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }
}
exports.PasswordService = PasswordService;
