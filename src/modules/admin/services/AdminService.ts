import { IAdminService } from './I_AdminService';
import { IAdminRepository } from '../repositories/I_AdminRepository';
import { IUserRepository } from '../../users/repositories/I_UserRepository';
import { Result, ok, err } from '../../../core/result';
import { AppError, NotFoundError } from '../../../core/errors';
import { Logger } from '../../../core/logger';
import { GrantAdminRequest, RevokeAdminRequest, AdminWithUser } from '../../../types';

/**
 * Admin service implementation
 */
export class AdminService implements IAdminService {
  constructor(
    private readonly repository: IAdminRepository,
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Grant admin privileges
   */
  async grantAdmin(
    data: GrantAdminRequest,
    grantedBy: string
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      // Check if user exists
      const userResult = await this.userRepository.findById(data.userId);

      if (!userResult.ok) {
        return err(userResult.error);
      }

      if (!userResult.value) {
        return err(new NotFoundError('User'));
      }

      // Grant admin
      const grantResult = await this.repository.grantAdmin(
        data.userId,
        data.adminLevel,
        grantedBy,
        data.notes
      );

      if (!grantResult.ok) {
        return err(grantResult.error);
      }

      this.logger.info('Admin privileges granted', {
        userId: data.userId,
        adminLevel: data.adminLevel,
        grantedBy,
      });

      return ok({ message: 'Admin privileges granted successfully' });

    } catch (error) {
      this.logger.error('Failed to grant admin', error);
      return err(new AppError('Failed to grant admin', 'GRANT_ADMIN_FAILED', 500));
    }
  }

  /**
   * Revoke admin privileges
   */
  async revokeAdmin(data: RevokeAdminRequest): Promise<Result<{ message: string }, AppError>> {
    try {
      const revokeResult = await this.repository.revokeAdmin(data.userId);

      if (!revokeResult.ok) {
        return err(revokeResult.error);
      }

      this.logger.info('Admin privileges revoked', { userId: data.userId });

      return ok({ message: 'Admin privileges revoked successfully' });

    } catch (error) {
      this.logger.error('Failed to revoke admin', error);
      return err(new AppError('Failed to revoke admin', 'REVOKE_ADMIN_FAILED', 500));
    }
  }

  /**
   * Get all admins
   */
  async getAdmins(): Promise<Result<{ admins: AdminWithUser[] }, AppError>> {
    try {
      const result = await this.repository.getAll();

      if (!result.ok) {
        return err(result.error);
      }

      return ok({ admins: result.value });

    } catch (error) {
      this.logger.error('Failed to get admins', error);
      return err(new AppError('Failed to get admins', 'GET_ADMINS_FAILED', 500));
    }
  }
}