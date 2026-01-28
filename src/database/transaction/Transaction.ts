import { PoolClient } from 'pg';
import { DatabaseError } from '../../core/errors';
import { Logger } from '../../core/logger';
import { Result, ok, err } from '../../core/result';

/**
 * Transaction wrapper for safe database transactions
 */
export class Transaction {
  private client: PoolClient | null = null;
  private isActive: boolean = false;
  private logger: Logger;
  
  constructor(logger: Logger = Logger.getInstance()) {
    this.logger = logger;
  }
  
  /**
   * Begin transaction
   */
  async begin(client: PoolClient): Promise<Result<void, DatabaseError>> {
    if (this.isActive) {
      return err(new DatabaseError(
        'TRANSACTION_ALREADY_ACTIVE',
        'Transaction is already active'
      ));
    }
    
    try {
      await client.query('BEGIN');
      this.client = client;
      this.isActive = true;
      this.logger.debug('Transaction started');
      return ok(undefined);
    } catch (error) {
      return err(DatabaseError.transactionFailed(error as Error));
    }
  }
  
  /**
   * Commit transaction
   */
  async commit(): Promise<Result<void, DatabaseError>> {
    if (!this.isActive || !this.client) {
      return err(new DatabaseError(
        'NO_ACTIVE_TRANSACTION',
        'No active transaction to commit'
      ));
    }
    
    try {
      await this.client.query('COMMIT');
      this.isActive = false;
      this.logger.debug('Transaction committed');
      return ok(undefined);
    } catch (error) {
      return err(DatabaseError.transactionFailed(error as Error));
    }
  }
  
  /**
   * Rollback transaction
   */
  async rollback(): Promise<Result<void, DatabaseError>> {
    if (!this.isActive || !this.client) {
      return err(new DatabaseError(
        'NO_ACTIVE_TRANSACTION',
        'No active transaction to rollback'
      ));
    }
    
    try {
      await this.client.query('ROLLBACK');
      this.isActive = false;
      this.logger.debug('Transaction rolled back');
      return ok(undefined);
    } catch (error) {
      return err(DatabaseError.transactionFailed(error as Error));
    }
  }
  
  /**
   * Execute query within transaction
   */
  async query<T = any>(sql: string, params?: any[]): Promise<Result<T[], DatabaseError>> {
    if (!this.isActive || !this.client) {
      return err(new DatabaseError(
        'NO_ACTIVE_TRANSACTION',
        'No active transaction'
      ));
    }
    
    try {
      const result = await this.client.query(sql, params);
      return ok(result.rows as T[]);
    } catch (error) {
      this.logger.error('Transaction query failed', { sql, error });
      return err(DatabaseError.queryFailed(sql, error as Error));
    }
  }
  
  /**
   * Get client (for advanced usage)
   */
  getClient(): PoolClient | null {
    return this.client;
  }
  
  /**
   * Check if transaction is active
   */
  isTransactionActive(): boolean {
    return this.isActive;
  }
}

/**
 * Transaction manager for easy transaction handling
 */
export class TransactionManager {
  constructor(private logger: Logger = Logger.getInstance()) {}
  
  /**
   * Execute function within transaction
   */
  async execute<T>(
    getClient: () => Promise<PoolClient>,
    fn: (transaction: Transaction) => Promise<Result<T, DatabaseError>>
  ): Promise<Result<T, DatabaseError>> {
    const client = await getClient();
    const transaction = new Transaction(this.logger);
    
    try {
      // Begin transaction
      const beginResult = await transaction.begin(client);
      if (!beginResult.ok) {
        client.release();
        return err(beginResult.error);
      }
      
      // Execute function
      const result = await fn(transaction);
      
      if (result.ok) {
        // Success - commit
        const commitResult = await transaction.commit();
        if (!commitResult.ok) {
          await transaction.rollback();
          client.release();
          return err(commitResult.error);
        }
        
        client.release();
        return ok(result.value);
      } else {
        // Error - rollback
        await transaction.rollback();
        client.release();
        return err(result.error);
      }
      
    } catch (error) {
      // Unexpected error - rollback
      this.logger.error('Transaction failed with unexpected error', error);
      await transaction.rollback().catch(() => {});
      client.release();
      
      return err(DatabaseError.transactionFailed(error as Error));
    }
  }
}