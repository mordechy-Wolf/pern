import { Pool } from 'pg';
import { IAuthRepository } from './I_AuthRepository';
import { Result, ok, err } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { UserEntity, CreateUserData } from '../../../types';
import { InsertQuery, QueryBuilder } from '../../../database';

/**
 * Auth repository implementation
 */
export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<Result<UserEntity, DatabaseError>> {
    try {
      const query = new InsertQuery()
        .into('users')
        .set({
          email: data.email,
          password: data.password,
          first_name: data.firstName || null,
          last_name: data.lastName || null,
          role: 'USER',
        })
        .returning('*');

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

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

      this.logger.info('User created', { userId: user.id, email: user.email });
      return ok(user);

    } catch (error) {
      this.logger.error('Failed to create user', { email: data.email, error });
      return err(DatabaseError.queryFailed('INSERT users', error as Error));
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<Result<UserEntity | null, DatabaseError>> {
    try {
      const query = new QueryBuilder()
        .select('*')
        .from('users')
        .where('email', '=', email)
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
      this.logger.error('Failed to find user by email', { email, error });
      return err(DatabaseError.queryFailed('SELECT users', error as Error));
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<Result<UserEntity | null, DatabaseError>> {
    try {
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
   * Check if email exists
   */
  async emailExists(email: string): Promise<Result<boolean, DatabaseError>> {
    try {
      const query = new QueryBuilder()
        .select('1')
        .from('users')
        .where('email', '=', email)
        .andWhere('deleted_at', 'IS NULL')
        .limit(1);

      const { sql, params } = query.build();
      const result = await this.pool.query(sql, params);

      return ok((result.rowCount ?? 0) > 0);

    } catch (error) {
      this.logger.error('Failed to check email existence', { email, error });
      return err(DatabaseError.queryFailed('SELECT users', error as Error));
    }
  }
}