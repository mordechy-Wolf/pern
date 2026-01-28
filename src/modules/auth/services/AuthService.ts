import { Pool } from 'pg';
import { IAuthService } from './I_AuthService';
import { IAuthRepository } from '../repositories/I_AuthRepository';
import { Result, ok, err } from '../../../core/result';
import { AppError, ConflictError, AuthError, NotFoundError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { PasswordService, TokenService, RefreshTokenManager } from '../../../lib/auth';
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
 * Auth service implementation
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly repository: IAuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenManager: RefreshTokenManager,
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<Result<AuthResponse, AppError>> {
    try {
      // Check if email exists
      const emailExistsResult = await this.repository.emailExists(data.email);
      if (!emailExistsResult.ok) {
        return err(emailExistsResult.error);
      }

      if (emailExistsResult.value) {
        return err(new ConflictError('User with this email already exists'));
      }

      // Hash password
      const hashResult = await this.passwordService.hash(data.password);
      if (!hashResult.ok) {
        return err(hashResult.error);
      }

      // Create user
      const createResult = await this.repository.createUser({
        email: data.email,
        password: hashResult.value,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (!createResult.ok) {
        return err(createResult.error);
      }

      const user = createResult.value;

      // Generate tokens
      const tokensResult = this.tokenService.signTokenPair({
        id: user.id,
        role: user.role,
      });

      if (!tokensResult.ok) {
        return err(tokensResult.error);
      }

      const { accessToken, refreshToken } = tokensResult.value;

      // Store refresh token
      const expiresAt = this.tokenService.getTokenExpiry('7d');
      const storeResult = await this.refreshTokenManager.store(user.id, refreshToken, expiresAt);

      if (!storeResult.ok) {
        this.logger.warn('Failed to store refresh token', { userId: user.id });
      }

      this.logger.info('User registered successfully', { userId: user.id, email: user.email });

      return ok({
        user: this.mapToUserResponse(user),
        token: accessToken,
        refreshToken,
      });

    } catch (error) {
      this.logger.error('Registration failed', error);
      return err(new AppError('Registration failed', 'REGISTRATION_FAILED', 500));
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<Result<AuthResponse, AppError>> {
    try {
      // Find user
      const userResult = await this.repository.findByEmail(data.email);
      if (!userResult.ok) {
        return err(userResult.error);
      }

      if (!userResult.value) {
        return err(new AuthError('Invalid credentials'));
      }

      const user = userResult.value;

      // Compare password
      const compareResult = await this.passwordService.compare(data.password, user.password);
      if (!compareResult.ok) {
        return err(compareResult.error);
      }

      if (!compareResult.value) {
        return err(new AuthError('Invalid credentials'));
      }

      // Check if user is active
      if (!user.isActive) {
        return err(new AuthError('Account is inactive'));
      }

      // Generate tokens
      const tokensResult = this.tokenService.signTokenPair({
        id: user.id,
        role: user.role,
      });

      if (!tokensResult.ok) {
        return err(tokensResult.error);
      }

      const { accessToken, refreshToken } = tokensResult.value;

      // Store refresh token
      const expiresAt = this.tokenService.getTokenExpiry('7d');
      const storeResult = await this.refreshTokenManager.store(user.id, refreshToken, expiresAt);

      if (!storeResult.ok) {
        this.logger.warn('Failed to store refresh token', { userId: user.id });
      }

      this.logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return ok({
        user: this.mapToUserResponse(user),
        token: accessToken,
        refreshToken,
      });

    } catch (error) {
      this.logger.error('Login failed', error);
      return err(new AppError('Login failed', 'LOGIN_FAILED', 500));
    }
  }

  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenRequest): Promise<Result<RefreshResponse, AppError>> {
    try {
      // Verify refresh token
      const verifyResult = this.tokenService.verifyRefreshToken(data.refreshToken);
      if (!verifyResult.ok) {
        return err(verifyResult.error);
      }

      // Check if token is valid in database
      const isValidResult = await this.refreshTokenManager.isValid(data.refreshToken);
      if (!isValidResult.ok) {
        return err(isValidResult.error);
      }

      if (!isValidResult.value) {
        return err(new AuthError('Invalid or expired refresh token'));
      }

      const payload = verifyResult.value;

      // Generate new tokens
      const tokensResult = this.tokenService.signTokenPair({
        id: payload.id,
        role: payload.role,
      });

      if (!tokensResult.ok) {
        return err(tokensResult.error);
      }

      const { accessToken, refreshToken } = tokensResult.value;

      // Revoke old token
      await this.refreshTokenManager.revoke(data.refreshToken);

      // Store new refresh token
      const expiresAt = this.tokenService.getTokenExpiry('7d');
      const storeResult = await this.refreshTokenManager.store(payload.id, refreshToken, expiresAt);

      if (!storeResult.ok) {
        this.logger.warn('Failed to store new refresh token', { userId: payload.id });
      }

      this.logger.info('Token refreshed successfully', { userId: payload.id });

      return ok({
        token: accessToken,
        refreshToken,
      });

    } catch (error) {
      this.logger.error('Token refresh failed', error);
      return err(new AppError('Token refresh failed', 'REFRESH_FAILED', 500));
    }
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string): Promise<Result<UserWithStats, AppError>> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM user_stats WHERE id = $1',
        [userId]
      );

      if (!result.rows[0]) {
        return err(new NotFoundError('User'));
      }

      const row = result.rows[0];
      const user: UserWithStats = {
        id: row.id,
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        role: row.role,
        effectiveRole: row.effectiveRole,
        isAdmin: row.isAdmin,
        adminLevel: row.adminLevel,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        stats: {
          postsCount: row.posts_count,
          commentsCount: row.comments_count,
          likesReceived: row.likes_received,
        },
        adminGrantedAt: row.adminGrantedAt,
      };

      return ok(user);

    } catch (error) {
      this.logger.error('Failed to get user profile', { userId, error });
      return err(new AppError('Failed to get profile', 'GET_PROFILE_FAILED', 500));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<Result<UserResponse, AppError>> {
    try {
      // Check if email is being changed
      if (data.email) {
        const emailExistsResult = await this.pool.query(
          'SELECT 1 FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
          [data.email, userId]
        );

        if ((emailExistsResult.rowCount ?? 0) > 0) {
          return err(new ConflictError('Email already in use'));
        }
      }

      // Update user
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(data.email);
      }

      if (data.firstName !== undefined) {
        updates.push(`first_name = $${paramIndex++}`);
        values.push(data.firstName);
      }

      if (data.lastName !== undefined) {
        updates.push(`last_name = $${paramIndex++}`);
        values.push(data.lastName);
      }

      if (updates.length === 0) {
        const userResult = await this.repository.findById(userId);
        if (!userResult.ok || !userResult.value) {
          return err(new NotFoundError('User'));
        }
        return ok(this.mapToUserResponse(userResult.value));
      }

      values.push(userId);

      const result = await this.pool.query(
        `UPDATE users 
         SET ${updates.join(', ')} 
         WHERE id = $${paramIndex} AND deleted_at IS NULL
         RETURNING *`,
        values
      );

      if (!result.rows[0]) {
        return err(new NotFoundError('User'));
      }

      const row = result.rows[0];
      const user: UserResponse = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        effectiveRole: row.role,
        isAdmin: false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      this.logger.info('User profile updated', { userId });
      return ok(user);

    } catch (error) {
      this.logger.error('Failed to update profile', { userId, error });
      return err(new AppError('Failed to update profile', 'UPDATE_PROFILE_FAILED', 500));
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    data: ChangePasswordRequest
  ): Promise<Result<void, AppError>> {
    try {
      // Get user
      const userResult = await this.repository.findById(userId);
      if (!userResult.ok || !userResult.value) {
        return err(new NotFoundError('User'));
      }

      const user = userResult.value;

      // Verify old password
      const compareResult = await this.passwordService.compare(data.oldPassword, user.password);
      if (!compareResult.ok) {
        return err(compareResult.error);
      }

      if (!compareResult.value) {
        return err(new AuthError('Invalid old password'));
      }

      // Hash new password
      const hashResult = await this.passwordService.hash(data.newPassword);
      if (!hashResult.ok) {
        return err(hashResult.error);
      }

      // Update password
      await this.pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashResult.value, userId]
      );

      // Revoke all refresh tokens
      await this.refreshTokenManager.revokeAllForUser(userId);

      this.logger.info('Password changed successfully', { userId });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to change password', { userId, error });
      return err(new AppError('Failed to change password', 'CHANGE_PASSWORD_FAILED', 500));
    }
  }

  /**
   * Soft delete account
   */
  async deleteAccount(userId: string): Promise<Result<void, AppError>> {
    try {
      await this.pool.query(
        'UPDATE users SET deleted_at = NOW() WHERE id = $1',
        [userId]
      );

      // Revoke all refresh tokens
      await this.refreshTokenManager.revokeAllForUser(userId);

      this.logger.info('Account deleted successfully', { userId });
      return ok(undefined);

    } catch (error) {
      this.logger.error('Failed to delete account', { userId, error });
      return err(new AppError('Failed to delete account', 'DELETE_ACCOUNT_FAILED', 500));
    }
  }

  /**
   * Map user entity to response DTO
   */
  private mapToUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      effectiveRole: user.role,
      isAdmin: false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}