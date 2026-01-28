/**
 * Base error class for all application errors
 * Follows Java exception hierarchy pattern
 */
export abstract class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  
  constructor(
    message: string,
    code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }

  /**
   * Format for API response
   */
  toResponse(): Record<string, any> {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}