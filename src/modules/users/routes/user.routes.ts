import { Router } from 'express';
import { UserHandler } from '../handlers/UserHandler';
import { AuthMiddleware } from '../../../middleware';
import { ValidationMiddleware } from '../../../middleware';
import * as schemas from '../../../validation';

/**
 * Create user routes
 */
export function createUserRoutes(
  handler: UserHandler,
  authMiddleware: AuthMiddleware,
  validationMiddleware: ValidationMiddleware
): Router {
  const router = Router();

  // Get users list (admin only)
  router.get(
    '/',
    authMiddleware.requireAuth,
    authMiddleware.requireAdmin,
    validationMiddleware.validateQuery(schemas.getUsersQuerySchema),
    handler.getUsers
  );

  // Get user by ID (authenticated users)
  router.get(
    '/:id',
    authMiddleware.requireAuth,
    validationMiddleware.validateParams(schemas.userIdParamSchema),
    handler.getUserById
  );

  // Get user's posts (authenticated users)
  router.get(
    '/:id/posts',
    authMiddleware.requireAuth,
    validationMiddleware.validateParams(schemas.userIdParamSchema),
  );

  // Hard delete user (super admin only)
  router.delete(
    '/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireSuperAdmin,
    validationMiddleware.validateParams(schemas.userIdParamSchema),
    handler.hardDeleteUser
  );

  return router;
}