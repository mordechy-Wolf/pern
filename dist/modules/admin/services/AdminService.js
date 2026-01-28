"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const result_1 = require("../../../core/result");
const errors_1 = require("../../../core/errors");
const logger_1 = require("../../../core/logger");
/**
 * Admin service implementation
 */
class AdminService {
    repository;
    userRepository;
    logger;
    constructor(repository, userRepository, logger = logger_1.Logger.getInstance()) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.logger = logger;
    }
    /**
     * Grant admin privileges
     */
    async grantAdmin(data, grantedBy) {
        try {
            // Check if user exists
            const userResult = await this.userRepository.findById(data.userId);
            if (!userResult.ok) {
                return (0, result_1.err)(userResult.error);
            }
            if (!userResult.value) {
                return (0, result_1.err)(new errors_1.NotFoundError('User'));
            }
            // Grant admin
            const grantResult = await this.repository.grantAdmin(data.userId, data.adminLevel, grantedBy, data.notes);
            if (!grantResult.ok) {
                return (0, result_1.err)(grantResult.error);
            }
            this.logger.info('Admin privileges granted', {
                userId: data.userId,
                adminLevel: data.adminLevel,
                grantedBy,
            });
            return (0, result_1.ok)({ message: 'Admin privileges granted successfully' });
        }
        catch (error) {
            this.logger.error('Failed to grant admin', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to grant admin', 'GRANT_ADMIN_FAILED', 500));
        }
    }
    /**
     * Revoke admin privileges
     */
    async revokeAdmin(data) {
        try {
            const revokeResult = await this.repository.revokeAdmin(data.userId);
            if (!revokeResult.ok) {
                return (0, result_1.err)(revokeResult.error);
            }
            this.logger.info('Admin privileges revoked', { userId: data.userId });
            return (0, result_1.ok)({ message: 'Admin privileges revoked successfully' });
        }
        catch (error) {
            this.logger.error('Failed to revoke admin', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to revoke admin', 'REVOKE_ADMIN_FAILED', 500));
        }
    }
    /**
     * Get all admins
     */
    async getAdmins() {
        try {
            const result = await this.repository.getAll();
            if (!result.ok) {
                return (0, result_1.err)(result.error);
            }
            return (0, result_1.ok)({ admins: result.value });
        }
        catch (error) {
            this.logger.error('Failed to get admins', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to get admins', 'GET_ADMINS_FAILED', 500));
        }
    }
}
exports.AdminService = AdminService;
