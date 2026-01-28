/**
 * Register request DTO
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Login request DTO
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Refresh token request DTO
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Update profile request DTO
 */
export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Change password request DTO
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}