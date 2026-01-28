"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePool = void 0;
const pg_1 = require("pg");
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
const result_1 = require("../../core/result");
/**
 * Database pool wrapper with enhanced functionality
 */
class DatabasePool {
    pool = null;
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Initialize database pool
     */
    async initialize(config) {
        if (this.pool) {
            this.logger.warn('Database pool already initialized');
            return (0, result_1.ok)(this.pool);
        }
        try {
            this.logger.info('🔌 Initializing database connection...');
            const poolConfig = {
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                max: config.max,
                min: config.min,
                idleTimeoutMillis: config.idleTimeoutMillis,
                connectionTimeoutMillis: config.connectionTimeoutMillis,
                allowExitOnIdle: config.allowExitOnIdle,
            };
            this.pool = new pg_1.Pool(poolConfig);
            // Setup event handlers
            this.setupEventHandlers();
            // Test connection
            const testResult = await this.testConnection();
            if (!testResult.ok) {
                await this.pool.end();
                this.pool = null;
                return (0, result_1.err)(testResult.error);
            }
            this.logger.info(`✅ Database connected: ${config.user}@${config.host}:${config.port}/${config.database}`);
            this.logger.info(`📊 Pool settings: min=${config.min}, max=${config.max}`);
            return (0, result_1.ok)(this.pool);
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize database', error);
            if (this.pool) {
                await this.pool.end().catch(() => { });
                this.pool = null;
            }
            return (0, result_1.err)(errors_1.DatabaseError.connectionFailed(error));
        }
    }
    /**
     * Get pool instance
     */
    getPool() {
        if (!this.pool) {
            throw errors_1.DatabaseError.connectionFailed(new Error('Database not initialized. Call initialize() first'));
        }
        return this.pool;
    }
    /**
     * Check if pool is initialized
     */
    isInitialized() {
        return this.pool !== null;
    }
    /**
     * Setup pool event handlers
     */
    setupEventHandlers() {
        if (!this.pool)
            return;
        this.pool.on('error', (err) => {
            this.logger.error('💥 Unexpected database pool error', {
                message: err.message,
                code: err.code,
            });
        });
        this.pool.on('connect', () => {
            this.logger.debug('✅ New database connection established');
        });
        this.pool.on('remove', () => {
            this.logger.debug('❌ Database connection removed from pool');
        });
    }
    /**
     * Test database connection
     */
    async testConnection() {
        if (!this.pool) {
            return (0, result_1.err)(errors_1.DatabaseError.connectionFailed(new Error('Pool not initialized')));
        }
        const startTime = Date.now();
        try {
            this.logger.info('Testing database connection...');
            // Basic query test
            const basicResult = await this.pool.query('SELECT NOW() as current_time, version() as pg_version');
            const pgVersion = basicResult.rows[0].pg_version;
            const serverTime = basicResult.rows[0].current_time;
            this.logger.info('✅ Basic query test passed', {
                pgVersion: pgVersion.split(',')[0],
                serverTime,
            });
            // Check tables
            const tablesResult = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
            const tables = tablesResult.rows.map((row) => row.table_name);
            if (tables.length === 0) {
                this.logger.warn('⚠️  No tables found in database');
            }
            else {
                this.logger.info('✅ Tables exist', { count: tables.length, tables });
            }
            const duration = Date.now() - startTime;
            this.logger.info(`✅ Database connection test completed in ${duration}ms`);
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`❌ Database connection test failed after ${duration}ms`, error);
            return (0, result_1.err)(errors_1.DatabaseError.connectionFailed(error));
        }
    }
    /**
     * Perform health check
     */
    async healthCheck() {
        if (!this.pool) {
            return {
                isHealthy: false,
                latency: 0,
                error: 'Pool not initialized',
            };
        }
        const startTime = Date.now();
        try {
            await this.pool.query('SELECT 1 as health_check');
            const latency = Date.now() - startTime;
            const poolStats = {
                total: this.pool.totalCount,
                idle: this.pool.idleCount,
                waiting: this.pool.waitingCount,
            };
            this.logger.debug('Database health check passed', { latency, poolStats });
            return {
                isHealthy: true,
                latency,
                poolStats,
            };
        }
        catch (error) {
            const latency = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Database health check failed', { latency, error: errorMessage });
            return {
                isHealthy: false,
                latency,
                error: errorMessage,
            };
        }
    }
    /**
     * Check if table exists
     */
    async tableExists(tableName) {
        if (!this.pool)
            return false;
        try {
            const result = await this.pool.query(`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) as exists`, [tableName]);
            return result.rows[0]?.exists || false;
        }
        catch (error) {
            this.logger.error('Failed to check table existence', { tableName, error });
            return false;
        }
    }
    /**
     * Get all tables in database
     */
    async getTables() {
        if (!this.pool)
            return [];
        try {
            const result = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
            return result.rows.map((row) => row.table_name);
        }
        catch (error) {
            this.logger.error('Failed to get database tables', error);
            return [];
        }
    }
    /**
     * Gracefully shutdown pool
     */
    async shutdown(timeoutMs = 10000) {
        if (!this.pool) {
            this.logger.debug('Database pool not initialized');
            return (0, result_1.ok)(undefined);
        }
        try {
            this.logger.info('🔌 Shutting down database connection...');
            this.logger.info('📊 Final pool statistics', {
                total: this.pool.totalCount,
                idle: this.pool.idleCount,
                waiting: this.pool.waitingCount,
            });
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Database shutdown timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            });
            // Race between shutdown and timeout
            await Promise.race([
                this.pool.end(),
                timeoutPromise,
            ]);
            this.pool = null;
            this.logger.info('✅ Database connection closed gracefully');
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('❌ Error during database shutdown', error);
            if (this.pool) {
                this.pool.removeAllListeners();
                await this.pool.end().catch(() => { });
                this.pool = null;
            }
            return (0, result_1.err)(errors_1.DatabaseError.connectionFailed(error));
        }
    }
    /**
     * Force shutdown (immediate)
     */
    async forceShutdown() {
        if (!this.pool)
            return;
        this.logger.warn('⚠️  Force shutting down database');
        try {
            this.pool.removeAllListeners();
            await this.pool.end();
            this.pool = null;
            this.logger.info('✅ Database force closed');
        }
        catch (error) {
            this.logger.error('❌ Error during force shutdown', error);
            this.pool = null;
        }
    }
}
exports.DatabasePool = DatabasePool;
