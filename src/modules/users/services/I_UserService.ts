import { Result } from '../../../core/result';
import { AppError } from '../../../core/errors';
import { UserWithStats, UserListItem, GetUsersQuery, GetPostsQuery, PaginatedResponse } from '../../../types';

/**
 * User service interface
 */
export interface IUserService {
  /**
   * Get users list
   */
  getUsers(query: GetUsersQuery): Promise<Result<PaginatedResponse<UserListItem>, AppError>>;

  /**
   * Get user by ID
   */
  getUserById(id: string): Promise<Result<UserWithStats, AppError>>;

  /**
   * Get user's posts
   */
  getUserPosts(id: string, query: GetPostsQuery): Promise<Result<PaginatedResponse<any>, AppError>>;

  /**
   * Hard delete user (admin only)
   */
  hardDeleteUser(id: string): Promise<Result<void, AppError>>;
}