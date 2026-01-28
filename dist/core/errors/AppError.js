"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.AuthError = exports.ValidationError = exports.AppError = void 0;
const BaseError_1 = require("./BaseError");
/**
 * General application error
 */
class AppError extends BaseError_1.BaseError {
    constructor(message, code = 'APP_ERROR', statusCode = 500, details, cause) {
        super(message, code, statusCode, details, cause);
    }
}
exports.AppError = AppError;
/**
 * Validation error (400)
 */
class ValidationError extends BaseError_1.BaseError {
    constructor(message, details, cause) {
        super(message, 'VALIDATION_ERROR', 400, details, cause);
    }
}
exports.ValidationError = ValidationError;
/**
 * Authentication error (401)
 */
class AuthError extends BaseError_1.BaseError {
    constructor(message = 'Unauthorized', details, cause) {
        super(message, 'AUTH_ERROR', 401, details, cause);
    }
}
exports.AuthError = AuthError;
/**
 * Forbidden error (403)
 */
class ForbiddenError extends BaseError_1.BaseError {
    constructor(message = 'Forbidden', details, cause) {
        super(message, 'FORBIDDEN', 403, details, cause);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Not found error (404)
 */
class NotFoundError extends BaseError_1.BaseError {
    constructor(resource, details, cause) {
        super(`${resource} not found`, 'NOT_FOUND', 404, details, cause);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict error (409)
 */
class ConflictError extends BaseError_1.BaseError {
    constructor(message = 'Conflict', details, cause) {
        super(message, 'CONFLICT', 409, details, cause);
    }
}
exports.ConflictError = ConflictError;
/**
 * Rate limit error (429)
 */
class RateLimitError extends BaseError_1.BaseError {
    constructor(message = 'Too many requests', details, cause) {
        super(message, 'RATE_LIMIT_EXCEEDED', 429, details, cause);
    }
}
exports.RateLimitError = RateLimitError;
