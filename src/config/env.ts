import dotenv from 'dotenv';

// ⬅️ טען את משתני הסביבה מיד בתחילת הקובץ!
dotenv.config();

import { Logger } from '../core/logger';

/**
 * Environment enum
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  // Server
  NODE_ENV: Environment;
  PORT: number;
  
  // Database
  PGHOST: string;
  PGPORT: number;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  PGPOOL_MAX?: number;
  PGPOOL_MIN?: number;
  PGPOOL_IDLE_TIMEOUT?: number;
  PGPOOL_CONNECTION_TIMEOUT?: number;
  
  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  
  // Bcrypt
  BCRYPT_ROUNDS?: number;
  
  // CORS
  ALLOWED_ORIGINS?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
}

/**
 * Environment configuration class
 */
export class EnvConfig {
  private static instance: EnvConfig;
  private env: EnvironmentVariables;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.env = this.loadAndValidate();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  /**
   * Load and validate environment variables
   */
  private loadAndValidate(): EnvironmentVariables {
    this.logger.info('Loading environment variables...');

    // Validate required variables
    this.validateRequired();

    const env: EnvironmentVariables = {
      // Server
      NODE_ENV: this.getNodeEnv(),
      PORT: this.getNumber('PORT', 3000),
      
      // Database
      PGHOST: this.getString('PGHOST'),
      PGPORT: this.getNumber('PGPORT'),
      PGDATABASE: this.getString('PGDATABASE'),
      PGUSER: this.getString('PGUSER'),
      PGPASSWORD: this.getString('PGPASSWORD'),
      PGPOOL_MAX: this.getNumber('PGPOOL_MAX', 20),
      PGPOOL_MIN: this.getNumber('PGPOOL_MIN', 2),
      PGPOOL_IDLE_TIMEOUT: this.getNumber('PGPOOL_IDLE_TIMEOUT', 30000),
      PGPOOL_CONNECTION_TIMEOUT: this.getNumber('PGPOOL_CONNECTION_TIMEOUT', 5000),
      
      // JWT
      JWT_SECRET: this.getString('JWT_SECRET'),
      JWT_REFRESH_SECRET: this.getString('JWT_REFRESH_SECRET'),
      JWT_EXPIRES_IN: this.getString('JWT_EXPIRES_IN', '15m'),
      JWT_REFRESH_EXPIRES_IN: this.getString('JWT_REFRESH_EXPIRES_IN', '7d'),
      
      // Bcrypt
      BCRYPT_ROUNDS: this.getNumber('BCRYPT_ROUNDS', 10),
      
      // CORS
      ALLOWED_ORIGINS: this.getString('ALLOWED_ORIGINS', ''),
      
      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: this.getNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 min
      RATE_LIMIT_MAX_REQUESTS: this.getNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    };

    this.validateEnvironment(env);
    this.logger.info('✅ Environment variables loaded and validated');

    return env;
  }

  /**
   * Validate required environment variables
   */
  private validateRequired(): void {
    const required = [
      'PGHOST',
      'PGPORT',
      'PGDATABASE',
      'PGUSER',
      'PGPASSWORD',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(', ')}`;
      this.logger.error(error);
      throw new Error(error);
    }
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironment(env: EnvironmentVariables): void {
    const warnings: string[] = [];

    // Production checks
    if (env.NODE_ENV === Environment.PRODUCTION) {
      if (env.JWT_SECRET === 'your-secret-key' || env.JWT_SECRET.length < 32) {
        warnings.push('⚠️  JWT_SECRET is weak in production!');
      }

      if (env.JWT_REFRESH_SECRET === 'your-refresh-secret' || env.JWT_REFRESH_SECRET.length < 32) {
        warnings.push('⚠️  JWT_REFRESH_SECRET is weak in production!');
      }

      if (env.PGPASSWORD === 'password' || env.PGPASSWORD === 'postgres') {
        warnings.push('⚠️  Using default database password in production!');
      }

      if (!env.ALLOWED_ORIGINS || env.ALLOWED_ORIGINS === '*') {
        warnings.push('⚠️  CORS is wide open in production (ALLOWED_ORIGINS not set)!');
      }
    }

    // Pool configuration checks
    if (env.PGPOOL_MAX && env.PGPOOL_MIN && env.PGPOOL_MAX < env.PGPOOL_MIN) {
      warnings.push(`⚠️  PGPOOL_MAX (${env.PGPOOL_MAX}) < PGPOOL_MIN (${env.PGPOOL_MIN})`);
    }

    if (env.PGPOOL_MAX && env.PGPOOL_MAX > 50) {
      warnings.push(`⚠️  PGPOOL_MAX (${env.PGPOOL_MAX}) is very high`);
    }

    // Bcrypt rounds check
    if (env.BCRYPT_ROUNDS && env.BCRYPT_ROUNDS < 10) {
      warnings.push(`⚠️  BCRYPT_ROUNDS (${env.BCRYPT_ROUNDS}) is too low (recommended: 10+)`);
    }

    // Log warnings
    if (warnings.length > 0) {
      warnings.forEach(warning => this.logger.warn(warning));
    }
  }

  /**
   * Get Node environment
   */
  private getNodeEnv(): Environment {
    const env = process.env.NODE_ENV?.toLowerCase();
    
    if (env === 'production') return Environment.PRODUCTION;
    if (env === 'test') return Environment.TEST;
    return Environment.DEVELOPMENT;
  }

  /**
   * Get string from environment
   */
  private getString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required`);
    }
    
    return value;
  }

  /**
   * Get number from environment
   */
  private getNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required`);
    }
    
    const parsed = parseInt(value, 10);
    
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a number`);
    }
    
    return parsed;
  }

  /**
   * Get boolean from environment
   */
  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required`);
    }
    
    return value.toLowerCase() === 'true';
  }

  /**
   * Get all environment variables
   */
  getAll(): EnvironmentVariables {
    return { ...this.env };
  }

  /**
   * Get specific environment variable
   */
  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.env[key];
  }

  /**
   * Check if in production
   */
  isProduction(): boolean {
    return this.env.NODE_ENV === Environment.PRODUCTION;
  }

  /**
   * Check if in development
   */
  isDevelopment(): boolean {
    return this.env.NODE_ENV === Environment.DEVELOPMENT;
  }

  /**
   * Check if in test
   */
  isTest(): boolean {
    return this.env.NODE_ENV === Environment.TEST;
  }
}

/**
 * Get environment config instance
 */
export const envConfig = EnvConfig.getInstance();