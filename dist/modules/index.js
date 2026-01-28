"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleFactory = void 0;
const logger_1 = require("../core/logger");
// Auth
const auth_1 = require("./auth");
// Users
const users_1 = require("./users");
// Admin
const admin_1 = require("./admin");
// Middleware
const middleware_1 = require("../middleware");
// Lib
const auth_2 = require("../lib/auth");
/**
 * Module factory - Creates all modules with their dependencies
 */
class ModuleFactory {
    pool;
    logger;
    constructor(pool, logger = logger_1.Logger.getInstance()) {
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Create all modules and routes
     */
    createAll() {
        this.logger.info('Creating application modules...');
        // Create lib services
        const passwordService = new auth_2.PasswordService();
        const tokenService = new auth_2.TokenService();
        const refreshTokenManager = new auth_2.RefreshTokenManager(this.pool);
        const authTokenVerifier = new auth_2.AuthTokenVerifier(tokenService);
        // Create middleware
        const authMiddleware = new middleware_1.AuthMiddleware(authTokenVerifier, this.pool);
        const validationMiddleware = new middleware_1.ValidationMiddleware();
        // Create repositories
        const authRepository = new auth_1.AuthRepository(this.pool);
        const userRepository = new users_1.UserRepository(this.pool);
        const adminRepository = new admin_1.AdminRepository(this.pool);
        // Create services
        const authService = new auth_1.AuthService(authRepository, passwordService, tokenService, refreshTokenManager, this.pool);
        const userService = new users_1.UserService(userRepository, refreshTokenManager, this.pool);
        const adminService = new admin_1.AdminService(adminRepository, userRepository);
        // Create handlers
        const authHandler = new auth_1.AuthHandler(authService);
        const userHandler = new users_1.UserHandler(userService);
        const adminHandler = new admin_1.AdminHandler(adminService);
        // Create routes
        const authRoutes = (0, auth_1.createAuthRoutes)(authHandler, authMiddleware, validationMiddleware);
        const userRoutes = (0, users_1.createUserRoutes)(userHandler, authMiddleware, validationMiddleware);
        const adminRoutes = (0, admin_1.createAdminRoutes)(adminHandler, authMiddleware, validationMiddleware);
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
exports.ModuleFactory = ModuleFactory;
