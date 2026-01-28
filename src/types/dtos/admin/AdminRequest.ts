import { AdminLevel } from '../../enums/UserRole';

/**
 * Grant admin request DTO
 */
export interface GrantAdminRequest {
  userId: string;
  adminLevel: AdminLevel;
  notes?: string;
}

/**
 * Revoke admin request DTO
 */
export interface RevokeAdminRequest {
  userId: string;
}