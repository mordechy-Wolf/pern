import { Request, Response, NextFunction } from 'express';

/**
 * Success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Response helper middleware
 */
export class ResponseMiddleware {
  /**
   * Add response helpers to res object
   */
  addHelpers = (req: Request, res: Response, next: NextFunction): void => {
    /**
     * Send success response
     */
    res.success = function <T>(
      data?: T,
      message?: string,
      statusCode: number = 200
    ): Response {
      const response: SuccessResponse<T> = { success: true };

      if (data !== undefined) response.data = data;
      if (message) response.message = message;

      return this.status(statusCode).json(response);
    };

    next();
  };
}

/**
 * Extend Express Response
 */
declare global {
  namespace Express {
    interface Response {
      success<T = any>(data?: T, message?: string, statusCode?: number): Response;
    }
  }
}