import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/logger';

/**
 * Request timeout middleware
 */
export class TimeoutMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Set request timeout
   */
  timeout(ms: number = 30000) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          this.logger.error('Request timeout', {
            method: req.method,
            path: req.path,
            timeout: ms,
          });

          res.status(408).json({
            success: false,
            error: {
              code: 'REQUEST_TIMEOUT',
              message: `Request timeout after ${ms}ms`,
            },
          });
        }
      }, ms);

      res.on('finish', () => {
        clearTimeout(timer);
      });

      next();
    };
  }
}