import { DatabasePool } from '../pool/DatabasePool';
import { DatabaseConfig, DatabaseConfigBuilder } from '../config/DatabaseConfig';
import { Logger } from '../../core/logger';
import { Result } from '../../core/result';
import { DatabaseError } from '../../core/errors';

/**
 * Database lifecycle manager
 */
export class DatabaseLifecycle {
  private pool: DatabasePool;
  private logger: Logger;
  private isInitialized: boolean = false;
  
  constructor(logger: Logger = Logger.getInstance()) {
    this.logger = logger;
    this.pool = new DatabasePool(logger);
  }
  
  /**
   * Initialize database
   */
  async initialize(config?: DatabaseConfig): Promise<Result<void, DatabaseError>> {
    if (this.isInitialized) {
      this.logger.warn('Database already initialized');
      return { ok: true, value: undefined };
    }
    
    const dbConfig = config || DatabaseConfigBuilder.fromEnv();
    
    // Validate config
    const warnings = DatabaseConfigBuilder.validate(dbConfig);
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
  getPool(): DatabasePool {
    return this.pool;
  }
  
  /**
   * Shutdown database
   */
  async shutdown(): Promise<Result<void, DatabaseError>> {
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
  setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
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

/**
 * Global database lifecycle instance
 */
let globalLifecycle: DatabaseLifecycle | null = null;

/**
 * Get or create database lifecycle
 */
export function getDatabaseLifecycle(): DatabaseLifecycle {
  if (!globalLifecycle) {
    globalLifecycle = new DatabaseLifecycle();
  }
  return globalLifecycle;
}

/**
 * Setup database shutdown handlers
 */
export function setupDatabaseShutdownHandlers(): void {
  getDatabaseLifecycle().setupShutdownHandlers();
}