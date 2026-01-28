import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/I_AuthService';
import { Logger } from '../../../core/logger';

/**
 * Auth handler (controller)
 */
export class AuthHandler {
  constructor(
    private readonly service: IAuthService,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Register new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(201).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);

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

  /**
   * Refresh access token
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.refresh(req.body);

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

  /**
   * Get current user profile
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const result = await this.service.getMe(userId);

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

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const result = await this.service.updateProfile(userId, req.body);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        data: result.value,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const result = await this.service.changePassword(userId, req.body);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete account
   */
  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const result = await this.service.deleteAccount(userId);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}