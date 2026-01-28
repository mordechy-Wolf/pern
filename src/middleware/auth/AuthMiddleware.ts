import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { AuthError, ForbiddenError } from '../../core/errors';
import { Logger } from '../../core/logger';
import { Result, ok, err } from '../../core/result';

/**
 * Authenticated user interface
 */
export interface AuthenticatedUser {
  id: string;
  role: string;
  effectiveRole?: string;
  adminLevel?: 'ADMIN' | 'SUPER_ADMIN';
  isAdmin?: boolean;
}

/**
 * Extend Express Request with user
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * JWT Token verification service
 */
export interface TokenVerifier {
  verify(token: string): Result<AuthenticatedUser, AuthError>;
}

/**
 * Authentication middleware class
 */
export class AuthMiddleware {
  constructor(
    private readonly tokenVerifier: TokenVerifier,
    private readonly pool: Pool,
    private readonly logger: Logger = Logger.getInstance()
  ) {}

  /**
   * Require authentication - verify JWT token
   */
  requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthError('No token provided');
      }

      const token = authHeader.substring(7);
      const verifyResult = this.tokenVerifier.verify(token);

      if (!verifyResult.ok) {
        throw verifyResult.error;
      }

      req.user = verifyResult.value;
      this.logger.debug('User authenticated', { userId: req.user.id });
      
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Require admin privileges
   */
  requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AuthError('Authentication required');
      }

      const userId = req.user.id;

      const result = await this.pool.query<{ admin_level: string }>(
        'SELECT admin_level FROM admins WHERE user_id = $1',
        [userId]
      );

      if (!result.rows[0]) {
        this.logger.warn('Admin access denied', { userId });
        throw new ForbiddenError('Admin access required');
      }

      req.user.adminLevel = result.rows[0].admin_level as 'ADMIN' | 'SUPER_ADMIN';
      req.user.effectiveRole = req.user.adminLevel;
      req.user.isAdmin = true;

      this.logger.debug('Admin access granted', {
        userId,
        adminLevel: req.user.adminLevel,
      });

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Require super admin privileges
   */
  requireSuperAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AuthError('Authentication required');
      }

      const userId = req.user.id;

      const result = await this.pool.query<{ admin_level: string }>(
        `SELECT admin_level 
         FROM admins 
         WHERE user_id = $1 
         AND admin_level = 'SUPER_ADMIN'`,
        [userId]
      );

      if (!result.rows[0]) {
        this.logger.warn('Super Admin access denied', { userId });
        throw new ForbiddenError('Super Admin access required');
      }

      req.user.adminLevel = 'SUPER_ADMIN';
      req.user.effectiveRole = 'SUPER_ADMIN';
      req.user.isAdmin = true;

      this.logger.debug('Super Admin access granted', { userId });

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check admin status without requiring it
   */
  checkAdminStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        return next();
      }

      const result = await this.pool.query<{ admin_level: string }>(
        'SELECT admin_level FROM admins WHERE user_id = $1',
        [req.user.id]
      );

      if (result.rows[0]) {
        req.user.adminLevel = result.rows[0].admin_level as 'ADMIN' | 'SUPER_ADMIN';
        req.user.effectiveRole = req.user.adminLevel;
        req.user.isAdmin = true;
      }

      next();
    } catch (error) {
      this.logger.error('Error checking admin status', error);
      next();
    }
  };

  /**
   * Require user is accessing their own resource OR is an admin
   */
  requireSelfOrAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AuthError('Authentication required');
      }

      const targetUserId = req.params.id || req.params.userId;
      const currentUserId = req.user.id;

      // If accessing own resource
      if (targetUserId === currentUserId) {
        return next();
      }

      // Check if admin
      const result = await this.pool.query<{ admin_level: string }>(
        'SELECT admin_level FROM admins WHERE user_id = $1',
        [currentUserId]
      );

      if (!result.rows[0]) {
        throw new ForbiddenError('You can only access your own resources');
      }

      req.user.adminLevel = result.rows[0].admin_level as 'ADMIN' | 'SUPER_ADMIN';
      req.user.effectiveRole = req.user.adminLevel;
      req.user.isAdmin = true;

      next();
    } catch (error) {
      next(error);
    }
  };
}