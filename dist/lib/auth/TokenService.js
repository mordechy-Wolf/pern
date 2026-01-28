"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const result_1 = require("../../core/result");
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Token service for JWT operations
 */
class TokenService {
    config;
    logger;
    constructor(config, logger = logger_1.Logger.getInstance()) {
        this.config = {
            jwtSecret: config?.jwtSecret ?? this.getJwtSecret(),
            jwtRefreshSecret: config?.jwtRefreshSecret ?? this.getJwtRefreshSecret(),
            accessTokenExpiry: config?.accessTokenExpiry ?? process.env.JWT_EXPIRES_IN ?? '15m',
            refreshTokenExpiry: config?.refreshTokenExpiry ?? process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
        };
        this.logger = logger;
    }
    /**
     * Generate access token (short-lived)
     */
    signAccessToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign({ id: payload.id, role: payload.role }, this.config.jwtSecret, { expiresIn: this.config.accessTokenExpiry });
            this.logger.debug('Access token signed', { userId: payload.id });
            return (0, result_1.ok)(token);
        }
        catch (error) {
            this.logger.error('Failed to sign access token', error);
            return (0, result_1.err)(new errors_1.AuthError('Failed to sign access token', { error: error.message }));
        }
    }
    /**
     * Generate refresh token (long-lived)
     */
    signRefreshToken(payload) {
        try {
            const token = jsonwebtoken_1.default.sign({ id: payload.id, role: payload.role }, this.config.jwtRefreshSecret, { expiresIn: this.config.refreshTokenExpiry });
            this.logger.debug('Refresh token signed', { userId: payload.id });
            return (0, result_1.ok)(token);
        }
        catch (error) {
            this.logger.error('Failed to sign refresh token', error);
            return (0, result_1.err)(new errors_1.AuthError('Failed to sign refresh token', { error: error.message }));
        }
    }
    /**
     * Generate both tokens
     */
    signTokenPair(payload) {
        const accessResult = this.signAccessToken(payload);
        if (!accessResult.ok) {
            return (0, result_1.err)(accessResult.error);
        }
        const refreshResult = this.signRefreshToken(payload);
        if (!refreshResult.ok) {
            return (0, result_1.err)(refreshResult.error);
        }
        return (0, result_1.ok)({
            accessToken: accessResult.value,
            refreshToken: refreshResult.value,
        });
    }
    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.config.jwtSecret);
            this.logger.debug('Access token verified', { userId: decoded.id });
            return (0, result_1.ok)(decoded);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                this.logger.warn('Access token expired');
                return (0, result_1.err)(new errors_1.AuthError('Token has expired', { reason: 'expired' }));
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                this.logger.warn('Invalid access token');
                return (0, result_1.err)(new errors_1.AuthError('Invalid token', { reason: 'invalid' }));
            }
            this.logger.error('Token verification failed', error);
            return (0, result_1.err)(new errors_1.AuthError('Token verification failed'));
        }
    }
    /**
     * Verify refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.config.jwtRefreshSecret);
            this.logger.debug('Refresh token verified', { userId: decoded.id });
            return (0, result_1.ok)(decoded);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                this.logger.warn('Refresh token expired');
                return (0, result_1.err)(new errors_1.AuthError('Refresh token has expired', { reason: 'expired' }));
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                this.logger.warn('Invalid refresh token');
                return (0, result_1.err)(new errors_1.AuthError('Invalid refresh token', { reason: 'invalid' }));
            }
            this.logger.error('Refresh token verification failed', error);
            return (0, result_1.err)(new errors_1.AuthError('Refresh token verification failed'));
        }
    }
    /**
     * Decode token without verification
     */
    decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            this.logger.warn('Failed to decode token', error);
            return null;
        }
    }
    /**
     * Get token expiry date
     */
    getTokenExpiry(expiresIn) {
        const units = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format');
        }
        const [, amount, unit] = match;
        const ms = parseInt(amount) * units[unit];
        return new Date(Date.now() + ms);
    }
    /**
     * Get JWT secret (from env or generate)
     */
    getJwtSecret() {
        if (process.env.JWT_SECRET) {
            return process.env.JWT_SECRET;
        }
        if (process.env.NODE_ENV === 'production') {
            throw new Error('🚨 JWT_SECRET must be set in production environment!');
        }
        const generatedSecret = crypto_1.default.randomBytes(64).toString('hex');
        this.logger.warn('⚠️  JWT_SECRET not found - generated temporary secret for development');
        this.logger.warn('⚠️  Add to .env: JWT_SECRET=' + generatedSecret);
        return generatedSecret;
    }
    /**
     * Get JWT refresh secret (from env or generate)
     */
    getJwtRefreshSecret() {
        if (process.env.JWT_REFRESH_SECRET) {
            return process.env.JWT_REFRESH_SECRET;
        }
        if (process.env.NODE_ENV === 'production') {
            throw new Error('🚨 JWT_REFRESH_SECRET must be set in production environment!');
        }
        const generatedSecret = crypto_1.default.randomBytes(64).toString('hex');
        this.logger.warn('⚠️  JWT_REFRESH_SECRET not found - generated temporary secret');
        return generatedSecret;
    }
    /**
     * Extract token from Authorization header
     */
    extractBearerToken(authHeader) {
        if (!authHeader) {
            return (0, result_1.err)(new errors_1.AuthError('No authorization header provided'));
        }
        if (!authHeader.startsWith('Bearer ')) {
            return (0, result_1.err)(new errors_1.AuthError('Invalid authorization header format'));
        }
        const token = authHeader.substring(7);
        if (!token) {
            return (0, result_1.err)(new errors_1.AuthError('No token provided'));
        }
        return (0, result_1.ok)(token);
    }
}
exports.TokenService = TokenService;
