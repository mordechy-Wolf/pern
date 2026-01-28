import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/logger';

/**
 * Request logging middleware
 */
export class LoggingMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Log incoming requests
   */
  logRequest = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Log request
    this.logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'warn' : 'info';

      this.logger[level]('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };

  /**
   * Log only errors
   */
  logErrors = (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        this.logger.error('Request error', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          ip: req.ip,
        });
      }
    });

    next();
  };
}