import { Result } from '../../../core/result';
import { AppError } from '../../../core/errors';
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthResponse,
  RefreshResponse,
  UserResponse,
  UserWithStats,
} from '../../../types';

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Register new user
   */
  register(data: RegisterRequest): Promise<Result<AuthResponse, AppError>>;

  /**
   * Login user
   */
  login(data: LoginRequest): Promise<Result<AuthResponse, AppError>>;

  /**
   * Refresh access token
   */
  refresh(data: RefreshTokenRequest): Promise<Result<RefreshResponse, AppError>>;

  /**
   * Get current user profile
   */
  getMe(userId: string): Promise<Result<UserWithStats, AppError>>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: UpdateProfileRequest): Promise<Result<UserResponse, AppError>>;

  /**
   * Change password
   */
  changePassword(userId: string, data: ChangePasswordRequest): Promise<Result<void, AppError>>;

  /**
   * Soft delete account
   */
  deleteAccount(userId: string): Promise<Result<void, AppError>>;
}