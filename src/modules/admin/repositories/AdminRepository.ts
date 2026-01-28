import { Pool } from 'pg';
import { IAdminRepository } from './I_AdminRepository';
import { Result, ok, err } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { AdminEntity, AdminWithUser, AdminLevel } from '../../../types';
import { InsertQuery, DeleteQuery, QueryBuilder } from '../../../database';

/**
 * Admin repository implementation
 */
export class AdminRepository implements IAdminRepository {
  constructor(
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Grant admin privileges
   */
  async grantAdmin(
    userId: string,
    adminLevel: AdminLevel,
    grantedBy: string,
    notes?: string
  ): Promise<Result<AdminEntity, DatabaseError>> {
    try {
      // Check if already admin
      const existing = await this.pool.query(
        'SELECT 1 FROM admins WHERE user_id = $1',
        [userId]
      );

      if ((existing.rowCount ?? 0) > 0) {
        return err(new DatabaseError('ALREADY_ADMIN', 'User is already an admin'));
      }

      const query = new InsertQuery()
        .into('admins')
        .set({
          user_id: userId,
          admin_level: adminLevel,
          granted_by: grantedBy,
          notes: notes || null,
        })
        .returning('*');

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      const row = result.rows[0];
      const admin: AdminEntity = {
        id: row.id,
        userId: row.user_id,
        adminLevel: row.admin_level,
        grantedBy: row.granted_by,
        grantedAt: row.granted_at,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      this.logger.info('Admin privileges granted', { userId, adminLevel });
      return ok(admin);

    } catch (error) {
      this.logger.error('Failed to grant admin', { userId, error });
      return err(DatabaseError.queryFailed('INSERT admins', error as Error));
    }
  }

  /**
   * Revoke admin privileges
   */
  async revokeAdmin(userId: string): Promise<Result<void, DatabaseError>> {
    try {
      const query = new DeleteQuery()
        .from('admins')
        .where('user_id', '=', userId);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      if ((result.rowCount ?? 0) === 0) {
        return err(new DatabaseError('ADMIN_NOT_FOUND', 'Admin record not found'));
      }

      this.logger.info('Admin privileges revoked', { userId });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to revoke admin', { userId, error });
      return err(DatabaseError.queryFailed('DELETE admins', error as Error));
    }
  }

  /**
   * Get all admins
   */
  async getAll(): Promise<Result<AdminWithUser[], DatabaseError>> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM admin_list ORDER BY granted_at DESC'
      );

      return ok(result.rows as AdminWithUser[]);

    } catch (error) {
      this.logger.error('Failed to get admins list', error);
      return err(DatabaseError.queryFailed('SELECT admin_list', error as Error));
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<Result<boolean, DatabaseError>> {
    try {
      const query = new QueryBuilder()
        .select('1')
        .from('admins')
        .where('user_id', '=', userId)
        .limit(1);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      return ok((result.rowCount ?? 0) > 0);

    } catch (error) {
      this.logger.error('Failed to check admin status', { userId, error });
      return err(DatabaseError.queryFailed('SELECT admins', error as Error));
    }
  }

  /**
   * Check if user is super admin
   */
  async isSuperAdmin(userId: string): Promise<Result<boolean, DatabaseError>> {
    try {
      const query = new QueryBuilder()
        .select('1')
        .from('admins')
        .where('user_id', '=', userId)
        .andWhere('admin_level', '=', 'SUPER_ADMIN')
        .limit(1);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      return ok((result.rowCount ?? 0) > 0);

    } catch (error) {
      this.logger.error('Failed to check super admin status', { userId, error });
      return err(DatabaseError.queryFailed('SELECT admins', error as Error));
    }
  }

  /**
   * Get admin level
   */
  async getAdminLevel(userId: string): Promise<Result<AdminLevel | null, DatabaseError>> {
    try {
      const query = new QueryBuilder()
        .select('admin_level')
        .from('admins')
        .where('user_id', '=', userId);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      if (!result.rows[0]) {
        return ok(null);
      }

      return ok(result.rows[0].admin_level as AdminLevel);

    } catch (error) {
      this.logger.error('Failed to get admin level', { userId, error });
      return err(DatabaseError.queryFailed('SELECT admins', error as Error));
    }
  }
}