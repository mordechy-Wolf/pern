import { Result } from '../../../core/result';
import { AppError } from '../../../core/errors';
import { GrantAdminRequest, RevokeAdminRequest, AdminWithUser } from '../../../types';

/**
 * Admin service interface
 */
export interface IAdminService {
  /**
   * Grant admin privileges
   */
  grantAdmin(data: GrantAdminRequest, grantedBy: string): Promise<Result<{ message: string }, AppError>>;

  /**
   * Revoke admin privileges
   */
  revokeAdmin(data: RevokeAdminRequest): Promise<Result<{ message: string }, AppError>>;

  /**
   * Get all admins
   */
  getAdmins(): Promise<Result<{ admins: AdminWithUser[] }, AppError>>;
}