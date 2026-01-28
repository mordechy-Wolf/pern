import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/logger';

/**
 * Input sanitization middleware
 */
export class SanitizeMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Sanitize request body
   */
  sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  };

  /**
   * Sanitize query parameters
   */
  sanitizeQuery = (req: Request, res: Response, next: NextFunction): void => {
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }
    next();
  };

  /**
   * Sanitize all input
   */
  sanitizeAll = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = this.sanitizeObject(req.params);
    }
    next();
  };

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    return obj;
  }

  /**
   * Sanitize string value
   */
  private sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }
}