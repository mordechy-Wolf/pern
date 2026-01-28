import { BaseError } from './BaseError';

/**
 * General application error
 */
export class AppError extends BaseError {
  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, code, statusCode, details, cause);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, 'VALIDATION_ERROR', 400, details, cause);
  }
}

/**
 * Authentication error (401)
 */
export class AuthError extends BaseError {
  constructor(
    message: string = 'Unauthorized',
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, 'AUTH_ERROR', 401, details, cause);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends BaseError {
  constructor(
    message: string = 'Forbidden',
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, 'FORBIDDEN', 403, details, cause);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends BaseError {
  constructor(
    resource: string,
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(`${resource} not found`, 'NOT_FOUND', 404, details, cause);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends BaseError {
  constructor(
    message: string = 'Conflict',
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, 'CONFLICT', 409, details, cause);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends BaseError {
  constructor(
    message: string = 'Too many requests',
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details, cause);
  }
}