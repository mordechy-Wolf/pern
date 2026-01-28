import { Pool } from 'pg';
import { IUserRepository } from './I_UserRepository';
import { Result, ok, err } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { StringUtils } from '../../../core/utils';
import { UserEntity, UserWithStats, UserListItem, UpdateUserData, GetUsersQuery } from '../../../types';
import { QueryBuilder, UpdateQuery, DeleteQuery } from '../../../database';

/**
 * User repository implementation
 */
export class UserRepository implements IUserRepository {
  constructor(
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Find user by ID
   */
  async findById(
    id: string,
    withStats: boolean = false
  ): Promise<Result<UserEntity | UserWithStats | null, DatabaseError>> {
    try {
      if (withStats) {
        const result = await this.pool.query(
          'SELECT * FROM user_stats WHERE id = $1',
          [id]
        );

        if (!result.rows[0]) {
          return ok(null);
        }

        return ok(result.rows[0] as UserWithStats);
      }

      const query = new QueryBuilder()
        .select('*')
        .from('users')
        .where('id', '=', id)
        .andWhere('deleted_at', 'IS NULL');

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      if (!result.rows[0]) {
        return ok(null);
      }

      const row = result.rows[0];
      const user: UserEntity = {
        id: row.id,
        email: row.email,
        password: row.password,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      };

      return ok(user);

    } catch (error) {
      this.logger.error('Failed to find user by ID', { id, error });
      return err(DatabaseError.queryFailed('SELECT users', error as Error));
    }
  }

  /**
   * Get users list with filters
   */
  async findAll(
    query: GetUsersQuery
  ): Promise<Result<{ users: UserListItem[]; total: number }, DatabaseError>> {
    try {
      const { page = 1, limit = 20, search, role, sortBy = 'createdAt', order = 'desc' } = query;
      const offset = (page - 1) * limit;
      let whereConditions: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      // Search filter
      if (search) {
        const sanitized = StringUtils.sanitizeSearchQuery(search);
        whereConditions.push(
          `(email ILIKE $${paramCount} OR "firstName" ILIKE $${paramCount + 1} OR "lastName" ILIKE $${paramCount + 2})`
        );
        const pattern = `%${sanitized}%`;
        params.push(pattern, pattern, pattern);
        paramCount += 3;
      }

      // Role filter
      if (role) {
        whereConditions.push(`"effectiveRole" = $${paramCount}`);
        params.push(role);
        paramCount++;
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      // Sort field mapping
      const sortField =
        sortBy === 'postsCount' ? 'posts_count' :
        sortBy === 'email' ? 'email' :
        '"createdAt"';

      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Count total
      const countResult = await this.pool.query(
        `SELECT COUNT(*) AS total FROM user_stats ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.total ?? '0');

      // Get users
      const usersResult = await this.pool.query(
        `SELECT * FROM user_stats ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
      );

      return ok({
        users: usersResult.rows as UserListItem[],
        total,
      });

    } catch (error) {
      this.logger.error('Failed to get users list', error);
      return err(DatabaseError.queryFailed('SELECT user_stats', error as Error));
    }
  }

  /**
   * Update user profile
   */
  async update(id: string, data: UpdateUserData): Promise<Result<UserEntity, DatabaseError>> {
    try {
      const cleanData = StringUtils.removeNullish(data);
      if (Object.keys(cleanData).length === 0) {
        const userResult = await this.findById(id);
        if (!userResult.ok || !userResult.value) {
          return err(new DatabaseError('USER_NOT_FOUND', 'User not found'));
        }
        return ok(userResult.value as UserEntity);
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.email) {
        updates.push(`email = $${paramCount++}`);
        values.push(data.email);
      }
      if (data.firstName !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(data.firstName);
      }
      if (data.lastName !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(data.lastName);
      }

      values.push(id);
      
      const result = await this.pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`,
        values
      );

      if (!result.rows[0]) {
        return err(new DatabaseError('USER_NOT_FOUND', 'User not found'));
      }

      const row = result.rows[0];
      const user: UserEntity = {
        id: row.id,
        email: row.email,
        password: row.password,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      };

      this.logger.info('User updated', { userId: id });
      return ok(user);

    } catch (error) {
      this.logger.error('Failed to update user', { id, error });
      return err(DatabaseError.queryFailed('UPDATE users', error as Error));
    }
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<Result<void, DatabaseError>> {
    try {
      const query = new UpdateQuery()
        .table('users')
        .set({ deleted_at: new Date() })
        .where('id', '=', id);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      if ((result.rowCount ?? 0) === 0) {
        return err(new DatabaseError('USER_NOT_FOUND', 'User not found'));
      }

      this.logger.info('User soft deleted', { userId: id });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to soft delete user', { id, error });
      return err(DatabaseError.queryFailed('UPDATE users', error as Error));
    }
  }

  /**
   * Hard delete user
   */
  async hardDelete(id: string): Promise<Result<void, DatabaseError>> {
    try {
      const query = new DeleteQuery()
        .from('users')
        .where('id', '=', id);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      if ((result.rowCount ?? 0) === 0) {
        return err(new DatabaseError('USER_NOT_FOUND', 'User not found'));
      }

      this.logger.info('User hard deleted', { userId: id });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to hard delete user', { id, error });
      return err(DatabaseError.queryFailed('DELETE users', error as Error));
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Result<{ posts: any[]; total: number }, DatabaseError>> {
    try {
      const offset = (page - 1) * limit;
      
      // Count total
      const countResult = await this.pool.query(
        'SELECT COUNT(*) AS total FROM posts WHERE user_id = $1 AND deleted_at IS NULL',
        [id]
      );
      const total = parseInt(countResult.rows[0]?.total ?? '0');

      // Get posts
      const postsResult = await this.pool.query(
        `SELECT * FROM posts_with_details WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      return ok({
        posts: postsResult.rows,
        total,
      });

    } catch (error) {
      this.logger.error('Failed to get user posts', { id, error });
      return err(DatabaseError.queryFailed('SELECT posts', error as Error));
    }
  }
}