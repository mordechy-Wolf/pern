import { Result } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { UserEntity, CreateUserData } from '../../../types';

/**
 * Auth repository interface
 */
export interface IAuthRepository {
  /**
   * Create new user
   */
  createUser(data: CreateUserData): Promise<Result<UserEntity, DatabaseError>>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<Result<UserEntity | null, DatabaseError>>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<Result<UserEntity | null, DatabaseError>>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<Result<boolean, DatabaseError>>;
}