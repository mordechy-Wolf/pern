import { UserRole, AdminLevel } from '../../enums/UserRole';

/**
 * User response DTO (no password)
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  effectiveRole: string;
  isAdmin: boolean;
  adminLevel?: AdminLevel;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with statistics
 */
export interface UserWithStats extends UserResponse {
  stats: {
    postsCount: number;
    commentsCount: number;
    likesReceived: number;
  };
  adminGrantedAt?: Date;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
}

/**
 * Refresh response
 */
export interface RefreshResponse {
  token: string;
  refreshToken: string;
}