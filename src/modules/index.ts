import { Pool } from 'pg';
import { Logger } from '../core/logger';
// Auth
import { AuthRepository, AuthService, AuthHandler, createAuthRoutes } from './auth';
// Users
import { UserRepository, UserService, UserHandler, createUserRoutes } from './users';
// Admin
import { AdminRepository, AdminService, AdminHandler, createAdminRoutes } from './admin';
// Middleware
import { AuthMiddleware, ValidationMiddleware } from '../middleware';
// Lib
import { PasswordService, TokenService, RefreshTokenManager, AuthTokenVerifier } from '../lib/auth';

/**
 * Module factory - Creates all modules with their dependencies
 */
export class ModuleFactory {
  private readonly pool: Pool;
  private readonly logger: Logger;
  constructor(pool: Pool, logger: Logger = Logger.getInstance()) {
    this.pool = pool;
    this.logger = logger;
  }
  /**
   * Create all modules and routes
   */
  createAll() {
    this.logger.info('Creating application modules...');
    // Create lib services
    const passwordService = new PasswordService();
    const tokenService = new TokenService();
    const refreshTokenManager = new RefreshTokenManager(this.pool);
    const authTokenVerifier = new AuthTokenVerifier(tokenService);
    // Create middleware
    const authMiddleware = new AuthMiddleware(authTokenVerifier, this.pool);
    const validationMiddleware = new ValidationMiddleware();
    // Create repositories
    const authRepository = new AuthRepository(this.pool);
    const userRepository = new UserRepository(this.pool);
    const adminRepository = new AdminRepository(this.pool);
    // Create services
    const authService = new AuthService(
      authRepository,
      passwordService,
      tokenService,
      refreshTokenManager,
      this.pool
    );
    const userService = new UserService(
      userRepository,
      refreshTokenManager,
      this.pool
    );
    const adminService = new AdminService(
      adminRepository,
      userRepository
    );
    // Create handlers
    const authHandler = new AuthHandler(authService);
    const userHandler = new UserHandler(userService);
    const adminHandler = new AdminHandler(adminService);
    // Create routes
    const authRoutes = createAuthRoutes(authHandler, authMiddleware, validationMiddleware);
    const userRoutes = createUserRoutes(userHandler, authMiddleware, validationMiddleware);
    const adminRoutes = createAdminRoutes(adminHandler, authMiddleware, validationMiddleware);
    this.logger.info('✅ All modules created successfully');
    return {
      // Routes
      routes: {
        auth: authRoutes,
        users: userRoutes,
        admin: adminRoutes,
      },
    
      // Middleware
      middleware: {
        auth: authMiddleware,
        validation: validationMiddleware,
      },
    
      // Services (for direct access if needed)
      services: {
        auth: authService,
        user: userService,
        admin: adminService,
      },
    };
  }
}