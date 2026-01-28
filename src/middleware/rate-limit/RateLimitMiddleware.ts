import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { RateLimitError } from '../../core/errors';
import { Logger } from '../../core/logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limit middleware class
 */
export class RateLimitMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Create rate limiter
   */
  create(config: RateLimitConfig): RateLimitRequestHandler {
    const options: Partial<Options> = {
      windowMs: config.windowMs,
      max: config.max,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
      skipFailedRequests: config.skipFailedRequests ?? false,
      handler: (req, res) => {
        const message = config.message || 'Too many requests, please try again later';
        this.logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
        });
        throw new RateLimitError(message);
      },
    };

    return rateLimit(options);
  }

  /**
   * API rate limiter (general)
   */
  api(): RateLimitRequestHandler {
    return this.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP',
    });
  }

  /**
   * Auth rate limiter (stricter)
   */
  auth(): RateLimitRequestHandler {
    return this.create({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later',
      skipSuccessfulRequests: true,
    });
  }

  /**
   * Create operations rate limiter
   */
  create_operations(): RateLimitRequestHandler {
    return this.create({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20,
      message: 'Too many creation requests, please slow down',
    });
  }

  /**
   * Custom rate limiter
   */
  custom(config: RateLimitConfig): RateLimitRequestHandler {
    return this.create(config);
  }
}