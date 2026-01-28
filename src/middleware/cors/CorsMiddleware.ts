import cors, { CorsOptions } from 'cors';
import { Request } from 'express';
import { Logger } from '../../core/logger';

/**
 * CORS configuration
 */
export interface CorsConfig {
  allowedOrigins?: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

/**
 * CORS middleware class
 */
export class CorsMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Create CORS middleware
   */
  create(config?: CorsConfig) {
    const allowedOrigins = config?.allowedOrigins || this.getDefaultOrigins();

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          this.logger.warn('CORS blocked origin', { origin });
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: config?.allowCredentials ?? true,
      maxAge: config?.maxAge ?? 86400, // 24 hours
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    return cors(corsOptions);
  }

  /**
   * Get default allowed origins based on environment
   */
  private getDefaultOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return process.env.ALLOWED_ORIGINS?.split(',') || [];
    }

    return ['http://localhost:3000', 'http://localhost:5173'];
  }

  /**
   * Development CORS (allow all)
   */
  development() {
    return cors({
      origin: '*',
      credentials: true,
    });
  }
}