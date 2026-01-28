import { Router } from 'express';
import { AdminHandler } from '../handlers/AdminHandler';
import { AuthMiddleware } from '../../../middleware';
import { ValidationMiddleware } from '../../../middleware';
import * as schemas from '../../../validation';

/**
 * Create admin routes
 */
export function createAdminRoutes(
  handler: AdminHandler,
  authMiddleware: AuthMiddleware,
  validationMiddleware: ValidationMiddleware
): Router {
  const router = Router();

  // Grant admin (super admin only)
  router.post(
    '/grant',
    authMiddleware.requireAuth,
    authMiddleware.requireSuperAdmin,
    validationMiddleware.validateBody(schemas.grantAdminSchema),
    handler.grantAdmin
  );

  // Revoke admin (super admin only)
  router.post(
    '/revoke',
    authMiddleware.requireAuth,
    authMiddleware.requireSuperAdmin,
    validationMiddleware.validateBody(schemas.revokeAdminSchema),
    handler.revokeAdmin
  );

  // Get all admins (admin only)
  router.get(
    '/',
    authMiddleware.requireAuth,
    authMiddleware.requireAdmin,
    handler.getAdmins
  );

  return router;
}