"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutMiddleware = void 0;
const logger_1 = require("../../core/logger");
/**
 * Request timeout middleware
 */
class TimeoutMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Set request timeout
     */
    timeout(ms = 30000) {
        return (req, res, next) => {
            const timer = setTimeout(() => {
                if (!res.headersSent) {
                    this.logger.error('Request timeout', {
                        method: req.method,
                        path: req.path,
                        timeout: ms,
                    });
                    res.status(408).json({
                        success: false,
                        error: {
                            code: 'REQUEST_TIMEOUT',
                            message: `Request timeout after ${ms}ms`,
                        },
                    });
                }
            }, ms);
            res.on('finish', () => {
                clearTimeout(timer);
            });
            next();
        };
    }
}
exports.TimeoutMiddleware = TimeoutMiddleware;
