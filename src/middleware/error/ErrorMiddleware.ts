import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../../core/errors';
import { Logger } from '../../core/logger';

/**
 * Error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
  };
}

/**
 * Error handling middleware class
 */
export class ErrorMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Global error handler
   */
  handle = (
    err: Error | BaseError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, any> | undefined;

    if (err instanceof BaseError) {
      statusCode = err.statusCode;
      code = err.code;
      message = err.message;
      details = err.details;

      this.logger.warn(`Error: ${code}`, {
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        details: err.details,
      });
    } else {
      this.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      if (process.env.NODE_ENV !== 'production') {
        message = err.message;
      }
    }

    const response: ErrorResponse = {
      success: false,
      error: { code, message },
    };

    if (details) {
      response.error.details = details;
    }

    if (process.env.NODE_ENV === 'development' && err.stack) {
      response.error.stack = err.stack;
    }

    res.status(statusCode).json(response);
  };

  /**
   * 404 Not Found handler
   */
  notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error: ErrorResponse = {
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    };

    this.logger.warn('Route not found', {
      method: req.method,
      path: req.path,
    });

    res.status(404).json(error);
  };
}