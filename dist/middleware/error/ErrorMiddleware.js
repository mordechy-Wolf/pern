"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Error handling middleware class
 */
class ErrorMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Global error handler
     */
    handle = (err, req, res, next) => {
        let statusCode = 500;
        let code = 'INTERNAL_ERROR';
        let message = 'An unexpected error occurred';
        let details;
        if (err instanceof errors_1.BaseError) {
            statusCode = err.statusCode;
            code = err.code;
            message = err.message;
            details = err.details;
            this.logger.warn(`Error: ${code}`, {
                message: err.message,
                statusCode: err.statusCode,
                path: req.path,
                method: req.method,
                details: err.details,
            });
        }
        else {
            this.logger.error('Unhandled error', {
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
            });
            if (process.env.NODE_ENV !== 'production') {
                message = err.message;
            }
        }
        const response = {
            success: false,
            error: { code, message },
        };
        if (details) {
            response.error.details = details;
        }
        if (process.env.NODE_ENV === 'development' && err.stack) {
            response.error.stack = err.stack;
        }
        res.status(statusCode).json(response);
    };
    /**
     * 404 Not Found handler
     */
    notFound = (req, res, next) => {
        const error = {
            success: false,
            error: {
                code: 'ROUTE_NOT_FOUND',
                message: `Route ${req.method} ${req.path} not found`,
            },
        };
        this.logger.warn('Route not found', {
            method: req.method,
            path: req.path,
        });
        res.status(404).json(error);
    };
}
exports.ErrorMiddleware = ErrorMiddleware;
