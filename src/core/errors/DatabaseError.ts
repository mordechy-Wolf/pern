import { BaseError } from './BaseError';

/**
 * Database operation error
 */
export class DatabaseError extends BaseError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, any>,
    cause?: Error
  ) {
    super(message, `DB_${code}`, 500, details, cause);
  }
  
  static queryFailed(query: string, cause?: Error): DatabaseError {
    return new DatabaseError(
      'QUERY_FAILED',
      'Database query failed',
      { query },
      cause
    );
  }
  
  static connectionFailed(cause?: Error): DatabaseError {
    return new DatabaseError(
      'CONNECTION_FAILED',
      'Failed to connect to database',
      undefined,
      cause
    );
  }
  
  static transactionFailed(cause?: Error): DatabaseError {
    return new DatabaseError(
      'TRANSACTION_FAILED',
      'Database transaction failed',
      undefined,
      cause
    );
  }
}