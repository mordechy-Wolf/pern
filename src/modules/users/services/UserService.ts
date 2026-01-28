import { Pool } from 'pg';
import { IUserService } from './I_UserService';
import { IUserRepository } from '../repositories/I_UserRepository';
import { Result, ok, err } from '../../../core/result';
import { AppError, NotFoundError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { PaginationUtils } from '../../../core/utils';
import { RefreshTokenManager } from '../../../lib/auth';
import { UserWithStats, UserListItem, GetUsersQuery, GetPostsQuery, PaginatedResponse } from '../../../types';

/**
 * User service implementation
 */
export class UserService implements IUserService {
  constructor(
    private readonly repository: IUserRepository,
    private readonly refreshTokenManager: RefreshTokenManager,
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Get users list
   */
  async getUsers(query: GetUsersQuery): Promise<Result<PaginatedResponse<UserListItem>, AppError>> {
    try {
      const result = await this.repository.findAll(query);

      if (!result.ok) {
        return err(result.error);
      }

      const { users, total } = result.value;
      const pagination = PaginationUtils.paginate({
        page: query.page || 1,
        limit: query.limit || 20,
        total,
      });

      return ok({
        success: true,
        data: {
          items: users,
          pagination,
        },
      });

    } catch (error) {
      this.logger.error('Failed to get users', error);
      return err(new AppError('Failed to get users', 'GET_USERS_FAILED', 500));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Result<UserWithStats, AppError>> {
    try {
      const result = await this.repository.findById(id, true);

      if (!result.ok) {
        return err(result.error);
      }

      if (!result.value) {
        return err(new NotFoundError('User'));
      }

      return ok(result.value as UserWithStats);

    } catch (error) {
      this.logger.error('Failed to get user by ID', { id, error });
      return err(new AppError('Failed to get user', 'GET_USER_FAILED', 500));
    }
  }

  /**
   * Get user's posts
   */
  async getUserPosts(id: string, query: GetPostsQuery): Promise<Result<PaginatedResponse<any>, AppError>> {
    try {
      const { page = 1, limit = 10 } = query;

      const result = await this.repository.getUserPosts(id, page, limit);

      if (!result.ok) {
        return err(result.error);
      }

      const { posts, total } = result.value;
      const pagination = PaginationUtils.paginate({ page, limit, total });

      return ok({
        success: true,
        data: {
          items: posts,
          pagination,
        },
      });

    } catch (error) {
      this.logger.error('Failed to get user posts', { id, error });
      return err(new AppError('Failed to get user posts', 'GET_USER_POSTS_FAILED', 500));
    }
  }

  /**
   * Hard delete user
   */
  async hardDeleteUser(id: string): Promise<Result<void, AppError>> {
    try {
      const deleteResult = await this.repository.hardDelete(id);

      if (!deleteResult.ok) {
        return err(deleteResult.error);
      }

      // Revoke all refresh tokens
      await this.refreshTokenManager.revokeAllForUser(id);

      this.logger.info('User hard deleted', { userId: id });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to hard delete user', { id, error });
      return err(new AppError('Failed to delete user', 'DELETE_USER_FAILED', 500));
    }
  }
}