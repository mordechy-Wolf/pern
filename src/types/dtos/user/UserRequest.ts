import { UserRole } from '../../enums/UserRole';

/**
 * Update user role request (admin only)
 */
export interface UpdateUserRoleRequest {
  role: UserRole;
}

/**
 * User list item DTO
 */
export interface UserListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  effectiveRole: string;
  isAdmin: boolean;
  adminLevel?: string;
  createdAt: Date;
  stats: {
    postsCount: number;
    commentsCount: number;
  };
}