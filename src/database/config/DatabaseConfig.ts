/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  
  // Pool settings
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  
  // Application settings
  allowExitOnIdle: boolean;
}

/**
 * Environment variables validation and parsing
 */
export class DatabaseConfigBuilder {
  /**
   * Build config from environment variables
   */
  static fromEnv(): DatabaseConfig {
    this.validateEnv();
    
    return {
      host: process.env.PGHOST!,
      port: parseInt(process.env.PGPORT!, 10),
      database: process.env.PGDATABASE!,
      user: process.env.PGUSER!,
      password: process.env.PGPASSWORD!,
      
      max: parseInt(process.env.PGPOOL_MAX || '20', 10),
      min: parseInt(process.env.PGPOOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.PGPOOL_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.PGPOOL_CONNECTION_TIMEOUT || '5000', 10),
      
      allowExitOnIdle: process.env.NODE_ENV !== 'production',
    };
  }
  
  /**
   * Validate required environment variables
   */
  private static validateEnv(): void {
    const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  /**
   * Validate configuration values
   */
  static validate(config: DatabaseConfig): string[] {
    const warnings: string[] = [];
    
    if (config.max < config.min) {
      warnings.push(`Pool max (${config.max}) is less than min (${config.min})`);
    }
    
    if (config.max > 50) {
      warnings.push(`Pool max (${config.max}) is very high - consider reducing`);
    }
    
    if (config.idleTimeoutMillis < 10000) {
      warnings.push(`Idle timeout (${config.idleTimeoutMillis}ms) is very low`);
    }
    
    if (process.env.NODE_ENV === 'production') {
      if (config.password === 'password' || config.password === 'postgres') {
        warnings.push('⚠️  Using default password in production!');
      }
    }
    
    return warnings;
  }
  
  /**
   * Get connection info string (for logging - no password)
   */
  static getConnectionInfo(config: DatabaseConfig): string {
    return `${config.user}@${config.host}:${config.port}/${config.database}`;
  }
}