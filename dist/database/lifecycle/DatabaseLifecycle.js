"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseLifecycle = void 0;
exports.getDatabaseLifecycle = getDatabaseLifecycle;
exports.setupDatabaseShutdownHandlers = setupDatabaseShutdownHandlers;
const DatabasePool_1 = require("../pool/DatabasePool");
const DatabaseConfig_1 = require("../config/DatabaseConfig");
const logger_1 = require("../../core/logger");
/**
 * Database lifecycle manager
 */
class DatabaseLifecycle {
    pool;
    logger;
    isInitialized = false;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
        this.pool = new DatabasePool_1.DatabasePool(logger);
    }
    /**
     * Initialize database
     */
    async initialize(config) {
        if (this.isInitialized) {
            this.logger.warn('Database already initialized');
            return { ok: true, value: undefined };
        }
        const dbConfig = config || DatabaseConfig_1.DatabaseConfigBuilder.fromEnv();
        // Validate config
        const warnings = DatabaseConfig_1.DatabaseConfigBuilder.validate(dbConfig);
        warnings.forEach(warning => this.logger.warn(warning));
        const result = await this.pool.initialize(dbConfig);
        if (result.ok) {
            this.isInitialized = true;
        }
        return result.ok
            ? { ok: true, value: undefined }
            : { ok: false, error: result.error };
    }
    /**
     * Get database pool
     */
    getPool() {
        return this.pool;
    }
    /**
     * Shutdown database
     */
    async shutdown() {
        if (!this.isInitialized) {
            return { ok: true, value: undefined };
        }
        const result = await this.pool.shutdown();
        this.isInitialized = false;
        return result;
    }
    /**
     * Setup shutdown handlers
     */
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            this.logger.info(`\n📥 Received ${signal}, gracefully shutting down...`);
            await this.shutdown();
            this.logger.info('👋 Shutdown complete');
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        // Handle uncaught errors
        process.on('uncaughtException', async (error) => {
            this.logger.error('💥 Uncaught Exception', error);
            await this.pool.forceShutdown();
            process.exit(1);
        });
        process.on('unhandledRejection', async (reason) => {
            this.logger.error('💥 Unhandled Rejection', reason);
            await this.pool.forceShutdown();
            process.exit(1);
        });
    }
}
exports.DatabaseLifecycle = DatabaseLifecycle;
/**
 * Global database lifecycle instance
 */
let globalLifecycle = null;
/**
 * Get or create database lifecycle
 */
function getDatabaseLifecycle() {
    if (!globalLifecycle) {
        globalLifecycle = new DatabaseLifecycle();
    }
    return globalLifecycle;
}
/**
 * Setup database shutdown handlers
 */
function setupDatabaseShutdownHandlers() {
    getDatabaseLifecycle().setupShutdownHandlers();
}
