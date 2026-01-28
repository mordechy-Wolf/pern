"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingMiddleware = void 0;
const logger_1 = require("../../core/logger");
/**
 * Request logging middleware
 */
class LoggingMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Log incoming requests
     */
    logRequest = (req, res, next) => {
        const startTime = Date.now();
        // Log request
        this.logger.info('Incoming request', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const level = res.statusCode >= 400 ? 'warn' : 'info';
            this.logger[level]('Request completed', {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
            });
        });
        next();
    };
    /**
     * Log only errors
     */
    logErrors = (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode >= 400) {
                this.logger.error('Request error', {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    ip: req.ip,
                });
            }
        });
        next();
    };
}
exports.LoggingMiddleware = LoggingMiddleware;
