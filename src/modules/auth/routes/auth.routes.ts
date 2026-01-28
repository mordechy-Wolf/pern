import { Router } from 'express';
import { AuthHandler } from '../handlers/AuthHandler';
import { AuthMiddleware } from '../../../middleware';
import { ValidationMiddleware } from '../../../middleware';
import * as schemas from '../../../validation';

/**
 * Create auth routes
 */
export function createAuthRoutes(
  handler: AuthHandler,
  authMiddleware: AuthMiddleware,
  validationMiddleware: ValidationMiddleware
): Router {
  const router = Router();

  // Public routes
  router.post(
    '/register',
    validationMiddleware.validateBody(schemas.registerSchema),
    handler.register
  );

  router.post(
    '/login',
    validationMiddleware.validateBody(schemas.loginSchema),
    handler.login
  );

  router.post(
    '/refresh',
    validationMiddleware.validateBody(schemas.refreshTokenSchema),
    handler.refresh
  );

  // Protected routes
  router.get(
    '/me',
    authMiddleware.requireAuth,
    handler.getMe
  );

  router.put(
    '/me',
    authMiddleware.requireAuth,
    validationMiddleware.validateBody(schemas.updateProfileSchema),
    handler.updateProfile
  );

  router.put(
    '/password',
    authMiddleware.requireAuth,
    validationMiddleware.validateBody(schemas.changePasswordSchema),
    handler.changePassword
  );

  router.delete(
    '/me',
    authMiddleware.requireAuth,
    handler.deleteAccount
  );

  return router;
}