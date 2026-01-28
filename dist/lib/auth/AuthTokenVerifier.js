"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenVerifier = void 0;
const result_1 = require("../../core/result");
const errors_1 = require("../../core/errors");
/**
 * Token verifier for middleware integration
 * Implements TokenVerifier interface from AuthMiddleware
 */
class AuthTokenVerifier {
    tokenService;
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    /**
     * Verify token and return authenticated user data
     */
    verify(token) {
        const verifyResult = this.tokenService.verifyAccessToken(token);
        if (!verifyResult.ok) {
            return (0, result_1.err)(verifyResult.error);
        }
        const payload = verifyResult.value;
        if (!payload.id) {
            return (0, result_1.err)(new errors_1.AuthError('Invalid token payload - missing user ID'));
        }
        return (0, result_1.ok)({
            id: payload.id,
            role: payload.role || 'USER',
        });
    }
}
exports.AuthTokenVerifier = AuthTokenVerifier;
