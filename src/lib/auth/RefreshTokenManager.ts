import { Pool } from 'pg';
import { Result, ok, err } from '../../core/result';
import { DatabaseError } from '../../core/errors';
import { Logger } from '../../core/logger';
import { InsertQuery, UpdateQuery, DeleteQuery } from '../../database';

/**
 * Refresh token data
 */
export interface RefreshTokenData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Refresh token manager for database operations
 */
export class RefreshTokenManager {
  constructor(
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Store refresh token in database
   */
  async store(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<Result<void, DatabaseError>> {
    try {
      const query = new InsertQuery()
        .into('refresh_tokens')
        .set({
          user_id: userId,
          token,
          expires_at: expiresAt,
        });

      const { sql, params } = query.build();
      await this.pool.query(sql, params);

      this.logger.debug('Refresh token stored', { userId });
      return ok(undefined);
      
    } catch (error) {
      this.logger.error('Failed to store refresh token', { userId, error });
      return err(DatabaseError.queryFailed('INSERT refresh_tokens', error as Error));
    }
  }

  /**
   * Check if refresh token is valid
   */
  async isValid(token: string): Promise<Result<boolean, DatabaseError>> {
    try {
      const result = await this.pool.query(
        `SELECT 1 FROM refresh_tokens 
         WHERE token = $1 
         AND expires_at > NOW() 
         AND revoked_at IS NULL`,
        [token]
      );

      const isValid = result.rowCount ? result.rowCount > 0 : false;
      this.logger.debug('Refresh token validity checked', { isValid });
      
      return ok(isValid);
      
    } catch (error) {
      this.logger.error('Failed to check refresh token validity', error);
      return err(DatabaseError.queryFailed('SELECT refresh_tokens', error as Error));
    }
  }

  /**
   * Get refresh token data
   */
  async get(token: string): Promise<Result<RefreshTokenData | null, DatabaseError>> {
    try {
      const result = await this.pool.query<{
        id: string;
        user_id: string;
        token: string;
        expires_at: Date;
        created_at: Date;
      }>(
        `SELECT id, user_id, token, expires_at, created_at 
         FROM refresh_tokens 
         WHERE token = $1 
         AND revoked_at IS NULL`,
        [token]
      );

      if (!result.rows[0]) {
        return ok(null);
      }

      const row = result.rows[0];
      return ok({
        id: row.id,
        userId: row.user_id,
        token: row.token,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      });
      
    } catch (error) {
      this.logger.error('Failed to get refresh token', error);
      return err(DatabaseError.queryFailed('SELECT refresh_tokens', error as Error));
    }
  }

  /**
   * Revoke (invalidate) refresh token
   */
  async revoke(token: string): Promise<Result<void, DatabaseError>> {
    try {
      const query = new UpdateQuery()
        .table('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('token', '=', token);

      const { sql, params } = query.build();
      await this.pool.query(sql, params);

      this.logger.debug('Refresh token revoked');
      return ok(undefined);
      
    } catch (error) {
      this.logger.error('Failed to revoke refresh token', error);
      return err(DatabaseError.queryFailed('UPDATE refresh_tokens', error as Error));
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllForUser(userId: string): Promise<Result<void, DatabaseError>> {
    try {
      const query = new UpdateQuery()
        .table('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('user_id', '=', userId)
        .andWhere('revoked_at', 'IS NULL');

      const { sql, params } = query.build();
      await this.pool.query(sql, params);

      this.logger.debug('All refresh tokens revoked for user', { userId });
      return ok(undefined);
      
    } catch (error) {
      this.logger.error('Failed to revoke all refresh tokens', { userId, error });
      return err(DatabaseError.queryFailed('UPDATE refresh_tokens', error as Error));
    }
  }

  /**
   * Clean up expired refresh tokens (maintenance)
   */
  async cleanupExpired(): Promise<Result<number, DatabaseError>> {
    try {
      const query = new DeleteQuery()
        .from('refresh_tokens')
        .where('expires_at', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      const deletedCount = result.rowCount ?? 0;
      this.logger.info('Expired refresh tokens cleaned up', { count: deletedCount });
      
      return ok(deletedCount);
      
    } catch (error) {
      this.logger.error('Failed to cleanup expired refresh tokens', error);
      return err(DatabaseError.queryFailed('DELETE refresh_tokens', error as Error));
    }
  }

  /**
   * Get active tokens count for user
   */
  async getActiveCountForUser(userId: string): Promise<Result<number, DatabaseError>> {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count 
         FROM refresh_tokens 
         WHERE user_id = $1 
         AND expires_at > NOW() 
         AND revoked_at IS NULL`,
        [userId]
      );

      const count = parseInt(result.rows[0]?.count ?? '0', 10);
      return ok(count);
      
    } catch (error) {
      this.logger.error('Failed to get active tokens count', { userId, error });
      return err(DatabaseError.queryFailed('SELECT refresh_tokens', error as Error));
    }
  }
}