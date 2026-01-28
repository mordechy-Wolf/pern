"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const database_1 = require("./database");
const logger_1 = require("./core/logger");
const env_1 = require("./config/env");
// טען משתני סביבה
dotenv_1.default.config();
/**
 * הפעלת השרת
 */
async function startServer() {
    const logger = logger_1.Logger.getInstance();
    try {
        logger.info('='.repeat(60));
        logger.info('🚀 Starting Blog API Server...');
        logger.info('='.repeat(60));
        // הדפסת מידע על הסביבה
        logger.info(`📦 Environment: ${env_1.envConfig.get('NODE_ENV')}`);
        logger.info(`🔧 Node Version: ${process.version}`);
        // ==========================================
        // אתחול מסד הנתונים
        // ==========================================
        logger.info('🔌 Initializing database connection...');
        const dbLifecycle = (0, database_1.getDatabaseLifecycle)();
        const dbResult = await dbLifecycle.initialize({
            host: env_1.envConfig.get('PGHOST'),
            port: env_1.envConfig.get('PGPORT'),
            database: env_1.envConfig.get('PGDATABASE'),
            user: env_1.envConfig.get('PGUSER'),
            password: env_1.envConfig.get('PGPASSWORD'),
            max: env_1.envConfig.get('PGPOOL_MAX') || 20,
            min: env_1.envConfig.get('PGPOOL_MIN') || 2,
            idleTimeoutMillis: env_1.envConfig.get('PGPOOL_IDLE_TIMEOUT') || 30000,
            connectionTimeoutMillis: env_1.envConfig.get('PGPOOL_CONNECTION_TIMEOUT') || 5000,
            allowExitOnIdle: !env_1.envConfig.isProduction(),
        });
        if (!dbResult.ok) {
            throw dbResult.error;
        }
        const pool = dbLifecycle.getPool();
        logger.info('✅ Database connection established');
        // הגדרת סגירה מסודרת של השרת
        (0, database_1.setupDatabaseShutdownHandlers)();
        // ==========================================
        // יצירת אפליקציית Express
        // ==========================================
        logger.info('🔧 Creating Express application...');
        const app = (0, app_1.createApp)(pool.getPool());
        // ==========================================
        // הפעלת השרת
        // ==========================================
        const PORT = env_1.envConfig.get('PORT');
        const server = app.listen(PORT, () => {
            logger.info('='.repeat(60));
            logger.info('✅ Server started successfully!');
            logger.info('='.repeat(60));
            logger.info(`🌐 Server URL: http://localhost:${PORT}`);
            logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api`);
            logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
            logger.info('='.repeat(60));
            logger.info('📝 Available Routes:');
            logger.info(` - POST /api/auth/register`);
            logger.info(` - POST /api/auth/login`);
            logger.info(` - POST /api/auth/refresh`);
            logger.info(` - GET  /api/auth/me`);
            logger.info(` - PUT  /api/auth/me     (עדכון פרופיל)`);
            logger.info(` - PUT  /api/auth/password (שינוי סיסמה)`);
            logger.info(` - DELETE /api/auth/me    (מחיקת חשבון)`);
            logger.info(` - GET  /api/admin`);
            logger.info(` - POST /api/admin/grant`);
            logger.info(` - POST /api/admin/revoke`);
            logger.info('='.repeat(60));
            logger.info('🎉 Ready to accept connections!');
            logger.info('='.repeat(60));
        });
        // ==========================================
        // סגירה מסודרת (Graceful Shutdown)
        // ==========================================
        const gracefulShutdown = async (signal) => {
            logger.info(`\n${signal} received, starting graceful shutdown...`);
            // סגירת השרת – מפסיק לקבל בקשות חדשות
            server.close(async () => {
                logger.info('✅ HTTP server closed');
                try {
                    // סגירת חיבור למסד הנתונים
                    await dbLifecycle.shutdown();
                    logger.info('✅ Database connection closed');
                    logger.info('✅ Graceful shutdown completed');
                    process.exit(0);
                }
                catch (error) {
                    logger.error('❌ Error during shutdown', error);
                    process.exit(1);
                }
            });
            // כפיה על סגירה אחרי 15 שניות אם משהו תקוע
            setTimeout(() => {
                logger.error('⚠️ Forced shutdown after timeout');
                process.exit(1);
            }, 15000);
        };
        // האזנה לסיגנלים
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // טיפול בשגיאות לא מטופלות
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', { promise, reason });
        });
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
    }
    catch (error) {
        logger.error('❌ Failed to start server', error);
        process.exit(1);
    }
}
// הפעלת השרת
startServer();
