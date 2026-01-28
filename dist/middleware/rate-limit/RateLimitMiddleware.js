"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Rate limit middleware class
 */
class RateLimitMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Create rate limiter
     */
    create(config) {
        const options = {
            windowMs: config.windowMs,
            max: config.max,
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
            skipFailedRequests: config.skipFailedRequests ?? false,
            handler: (req, res) => {
                const message = config.message || 'Too many requests, please try again later';
                this.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    path: req.path,
                });
                throw new errors_1.RateLimitError(message);
            },
        };
        return (0, express_rate_limit_1.default)(options);
    }
    /**
     * API rate limiter (general)
     */
    api() {
        return this.create({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100,
            message: 'Too many requests from this IP',
        });
    }
    /**
     * Auth rate limiter (stricter)
     */
    auth() {
        return this.create({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5,
            message: 'Too many authentication attempts, please try again later',
            skipSuccessfulRequests: true,
        });
    }
    /**
     * Create operations rate limiter
     */
    create_operations() {
        return this.create({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 20,
            message: 'Too many creation requests, please slow down',
        });
    }
    /**
     * Custom rate limiter
     */
    custom(config) {
        return this.create(config);
    }
}
exports.RateLimitMiddleware = RateLimitMiddleware;
