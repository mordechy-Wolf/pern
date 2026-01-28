"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
/**
 * Base error class for all application errors
 * Follows Java exception hierarchy pattern
 */
class BaseError extends Error {
    statusCode;
    details;
    cause;
    timestamp;
    code;
    constructor(message, code, statusCode = 500, details, cause) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.cause = cause;
        this.name = this.constructor.name;
        this.code = code;
        this.timestamp = new Date();
        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Serialize error for logging
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp.toISOString(),
            details: this.details,
            cause: this.cause?.message,
            stack: this.stack,
        };
    }
    /**
     * Format for API response
     */
    toResponse() {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
            },
        };
    }
}
exports.BaseError = BaseError;
