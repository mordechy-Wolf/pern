import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../services/I_UserService';
import { Logger } from '../../../core/logger';

/**
 * User handler (controller)
 */
export class UserHandler {
  constructor(
    private readonly service: IUserService,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Get users list
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getUsers(req.query as any);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getUserById(req.params.id);

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
   * Get user's posts
   */
  getUserPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getUserPosts(req.params.id, req.query as any);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Hard delete user
   */
  hardDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.hardDeleteUser(req.params.id);

      if (!result.ok) {
        return next(result.error);
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}