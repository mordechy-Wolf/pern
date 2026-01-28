import { Result } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { UserEntity, UserWithStats, UserListItem, UpdateUserData, GetUsersQuery } from '../../../types';

/**
 * User repository interface
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string, withStats?: boolean): Promise<Result<UserEntity | UserWithStats | null, DatabaseError>>;

  /**
   * Get users list with filters
   */
  findAll(query: GetUsersQuery): Promise<Result<{ users: UserListItem[]; total: number }, DatabaseError>>;

  /**
   * Update user profile
   */
  update(id: string, data: UpdateUserData): Promise<Result<UserEntity, DatabaseError>>;

  /**
   * Soft delete user
   */
  softDelete(id: string): Promise<Result<void, DatabaseError>>;

  /**
   * Hard delete user
   */
  hardDelete(id: string): Promise<Result<void, DatabaseError>>;

  /**
   * Get user's posts
   */
  getUserPosts(id: string, page: number, limit: number): Promise<Result<{ posts: any[]; total: number }, DatabaseError>>;
}