"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Authentication middleware class
 */
class AuthMiddleware {
    tokenVerifier;
    pool;
    logger;
    constructor(tokenVerifier, pool, logger = logger_1.Logger.getInstance()) {
        this.tokenVerifier = tokenVerifier;
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Require authentication - verify JWT token
     */
    requireAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new errors_1.AuthError('No token provided');
            }
            const token = authHeader.substring(7);
            const verifyResult = this.tokenVerifier.verify(token);
            if (!verifyResult.ok) {
                throw verifyResult.error;
            }
            req.user = verifyResult.value;
            this.logger.debug('User authenticated', { userId: req.user.id });
            next();
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Require admin privileges
     */
    requireAdmin = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new errors_1.AuthError('Authentication required');
            }
            const userId = req.user.id;
            const result = await this.pool.query('SELECT admin_level FROM admins WHERE user_id = $1', [userId]);
            if (!result.rows[0]) {
                this.logger.warn('Admin access denied', { userId });
                throw new errors_1.ForbiddenError('Admin access required');
            }
            req.user.adminLevel = result.rows[0].admin_level;
            req.user.effectiveRole = req.user.adminLevel;
            req.user.isAdmin = true;
            this.logger.debug('Admin access granted', {
                userId,
                adminLevel: req.user.adminLevel,
            });
            next();
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Require super admin privileges
     */
    requireSuperAdmin = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new errors_1.AuthError('Authentication required');
            }
            const userId = req.user.id;
            const result = await this.pool.query(`SELECT admin_level 
         FROM admins 
         WHERE user_id = $1 
         AND admin_level = 'SUPER_ADMIN'`, [userId]);
            if (!result.rows[0]) {
                this.logger.warn('Super Admin access denied', { userId });
                throw new errors_1.ForbiddenError('Super Admin access required');
            }
            req.user.adminLevel = 'SUPER_ADMIN';
            req.user.effectiveRole = 'SUPER_ADMIN';
            req.user.isAdmin = true;
            this.logger.debug('Super Admin access granted', { userId });
            next();
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Check admin status without requiring it
     */
    checkAdminStatus = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                return next();
            }
            const result = await this.pool.query('SELECT admin_level FROM admins WHERE user_id = $1', [req.user.id]);
            if (result.rows[0]) {
                req.user.adminLevel = result.rows[0].admin_level;
                req.user.effectiveRole = req.user.adminLevel;
                req.user.isAdmin = true;
            }
            next();
        }
        catch (error) {
            this.logger.error('Error checking admin status', error);
            next();
        }
    };
    /**
     * Require user is accessing their own resource OR is an admin
     */
    requireSelfOrAdmin = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new errors_1.AuthError('Authentication required');
            }
            const targetUserId = req.params.id || req.params.userId;
            const currentUserId = req.user.id;
            // If accessing own resource
            if (targetUserId === currentUserId) {
                return next();
            }
            // Check if admin
            const result = await this.pool.query('SELECT admin_level FROM admins WHERE user_id = $1', [currentUserId]);
            if (!result.rows[0]) {
                throw new errors_1.ForbiddenError('You can only access your own resources');
            }
            req.user.adminLevel = result.rows[0].admin_level;
            req.user.effectiveRole = req.user.adminLevel;
            req.user.isAdmin = true;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthMiddleware = AuthMiddleware;
