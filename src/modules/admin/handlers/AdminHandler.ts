import { Request, Response, NextFunction } from 'express';
import { IAdminService } from '../services/I_AdminService';
import { Logger } from '../../../core/logger';
import { AuthError } from '../../../core/errors';

/**
 * Admin handler (controller)
 */
export class AdminHandler {
  constructor(
    private readonly service: IAdminService,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Grant admin privileges
   */
  grantAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const grantedBy = req.user?.id;
      if (!grantedBy) {
        return next(new AuthError('Authentication required'));
      }

      const result = await this.service.grantAdmin(req.body, grantedBy);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        ...result.value,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Revoke admin privileges
   */
  revokeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.revokeAdmin(req.body);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        ...result.value,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all admins
   */
  getAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAdmins();

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      next(error);
    }
  };
}