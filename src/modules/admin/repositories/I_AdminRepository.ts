import { Result } from '../../../core/result';
import { DatabaseError } from '../../../core/errors';
import { AdminEntity, AdminWithUser, AdminLevel } from '../../../types';

/**
 * Admin repository interface
 */
export interface IAdminRepository {
  /**
   * Grant admin privileges
   */
  grantAdmin(
    userId: string,
    adminLevel: AdminLevel,
    grantedBy: string,
    notes?: string
  ): Promise<Result<AdminEntity, DatabaseError>>;

  /**
   * Revoke admin privileges
   */
  revokeAdmin(userId: string): Promise<Result<void, DatabaseError>>;

  /**
   * Get all admins
   */
  getAll(): Promise<Result<AdminWithUser[], DatabaseError>>;

  /**
   * Check if user is admin
   */
  isAdmin(userId: string): Promise<Result<boolean, DatabaseError>>;

  /**
   * Check if user is super admin
   */
  isSuperAdmin(userId: string): Promise<Result<boolean, DatabaseError>>;

  /**
   * Get admin level
   */
  getAdminLevel(userId: string): Promise<Result<AdminLevel | null, DatabaseError>>;
}