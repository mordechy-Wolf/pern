"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeMiddleware = void 0;
const logger_1 = require("../../core/logger");
/**
 * Input sanitization middleware
 */
class SanitizeMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Sanitize request body
     */
    sanitizeBody = (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObject(req.body);
        }
        next();
    };
    /**
     * Sanitize query parameters
     */
    sanitizeQuery = (req, res, next) => {
        if (req.query && typeof req.query === 'object') {
            req.query = this.sanitizeObject(req.query);
        }
        next();
    };
    /**
     * Sanitize all input
     */
    sanitizeAll = (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = this.sanitizeObject(req.query);
        }
        if (req.params && typeof req.params === 'object') {
            req.params = this.sanitizeObject(req.params);
        }
        next();
    };
    /**
     * Sanitize object recursively
     */
    sanitizeObject(obj) {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeObject(item));
        }
        if (obj !== null && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = this.sanitizeObject(obj[key]);
                }
            }
            return sanitized;
        }
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        return obj;
    }
    /**
     * Sanitize string value
     */
    sanitizeString(value) {
        return value
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }
}
exports.SanitizeMiddleware = SanitizeMiddleware;
