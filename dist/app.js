"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const logger_1 = require("./core/logger");
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const constants_1 = require("./config/constants");
/**
 * Create and configure Express application - מצומצם רק ל-auth + admin
 */
function createApp(pool) {
    const logger = logger_1.Logger.getInstance();
    const app = (0, express_1.default)();
    logger.info('🔧 Configuring Express application (users + admins only)...');
    // ==========================================
    // Basic Middleware
    // ==========================================
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    const corsMiddleware = new middleware_1.CorsMiddleware();
    app.use(corsMiddleware.create());
    const sanitizeMiddleware = new middleware_1.SanitizeMiddleware();
    app.use(sanitizeMiddleware.sanitizeAll);
    const timeoutMiddleware = new middleware_1.TimeoutMiddleware();
    app.use(timeoutMiddleware.timeout(30000));
    const responseMiddleware = new middleware_1.ResponseMiddleware();
    app.use(responseMiddleware.addHelpers);
    const loggingMiddleware = new middleware_1.LoggingMiddleware();
    app.use(loggingMiddleware.logRequest);
    // ==========================================
    // Health Check
    // ==========================================
    app.get('/health', (req, res) => {
        res.success({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    // ==========================================
    // API Routes - רק auth ו-admin
    // ==========================================
    const moduleFactory = new modules_1.ModuleFactory(pool);
    const { routes, middleware } = moduleFactory.createAll();
    // Auth routes (register, login, me, profile, password, delete)
    app.use(`${constants_1.API.PREFIX}/auth`, routes.auth);
    // Admin routes (grant, revoke, get list)
    app.use(`${constants_1.API.PREFIX}/admin`, routes.admin);
    // אם תרצה להוסיף list של כל המשתמשים - הוסף כאן:
    // app.use(`${API.PREFIX}/users`, routes.users);
    logger.info('✅ Routes mounted:');
    logger.info(` - ${constants_1.API.PREFIX}/auth/*`);
    logger.info(` - ${constants_1.API.PREFIX}/admin/*`);
    // ==========================================
    // Root Route
    // ==========================================
    app.get('/', (req, res) => {
        res.success({
            name: 'Blog API - Users & Admins Only',
            version: '1.0.0',
            description: 'מצב מצומצם: ניהול משתמשים ומנהלים בלבד',
            endpoints: {
                auth: `${constants_1.API.PREFIX}/auth`,
                admin: `${constants_1.API.PREFIX}/admin`,
                health: '/health',
            },
        });
    });
    // ==========================================
    // Error Handling
    // ==========================================
    const errorMiddleware = new middleware_1.ErrorMiddleware();
    app.use(errorMiddleware.notFound);
    app.use(errorMiddleware.handle);
    logger.info('✅ Express application configured (users + admins only)');
    return app;
}
