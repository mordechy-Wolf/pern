"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("../../core/logger");
/**
 * CORS middleware class
 */
class CorsMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Create CORS middleware
     */
    create(config) {
        const allowedOrigins = config?.allowedOrigins || this.getDefaultOrigins();
        const corsOptions = {
            origin: (origin, callback) => {
                // Allow requests with no origin (mobile apps, Postman, etc.)
                if (!origin) {
                    return callback(null, true);
                }
                if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    this.logger.warn('CORS blocked origin', { origin });
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: config?.allowCredentials ?? true,
            maxAge: config?.maxAge ?? 86400, // 24 hours
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        };
        return (0, cors_1.default)(corsOptions);
    }
    /**
     * Get default allowed origins based on environment
     */
    getDefaultOrigins() {
        if (process.env.NODE_ENV === 'production') {
            return process.env.ALLOWED_ORIGINS?.split(',') || [];
        }
        return ['http://localhost:3000', 'http://localhost:5173'];
    }
    /**
     * Development CORS (allow all)
     */
    development() {
        return (0, cors_1.default)({
            origin: '*',
            credentials: true,
        });
    }
}
exports.CorsMiddleware = CorsMiddleware;
