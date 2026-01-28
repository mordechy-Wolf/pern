"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const result_1 = require("../../../core/result");
const errors_1 = require("../../../core/errors");
const logger_1 = require("../../../core/logger");
const utils_1 = require("../../../core/utils");
/**
 * User service implementation
 */
class UserService {
    repository;
    refreshTokenManager;
    pool;
    logger;
    constructor(repository, refreshTokenManager, pool, logger = logger_1.Logger.getInstance()) {
        this.repository = repository;
        this.refreshTokenManager = refreshTokenManager;
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Get users list
     */
    async getUsers(query) {
        try {
            const result = await this.repository.findAll(query);
            if (!result.ok) {
                return (0, result_1.err)(result.error);
            }
            const { users, total } = result.value;
            const pagination = utils_1.PaginationUtils.paginate({
                page: query.page || 1,
                limit: query.limit || 20,
                total,
            });
            return (0, result_1.ok)({
                success: true,
                data: {
                    items: users,
                    pagination,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to get users', error);
            return (0, result_1.err)(new errors_1.AppError('Failed to get users', 'GET_USERS_FAILED', 500));
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const result = await this.repository.findById(id, true);
            if (!result.ok) {
                return (0, result_1.err)(result.error);
            }
            if (!result.value) {
                return (0, result_1.err)(new errors_1.NotFoundError('User'));
            }
            return (0, result_1.ok)(result.value);
        }
        catch (error) {
            this.logger.error('Failed to get user by ID', { id, error });
            return (0, result_1.err)(new errors_1.AppError('Failed to get user', 'GET_USER_FAILED', 500));
        }
    }
    /**
     * Get user's posts
     */
    async getUserPosts(id, query) {
        try {
            const { page = 1, limit = 10 } = query;
            const result = await this.repository.getUserPosts(id, page, limit);
            if (!result.ok) {
                return (0, result_1.err)(result.error);
            }
            const { posts, total } = result.value;
            const pagination = utils_1.PaginationUtils.paginate({ page, limit, total });
            return (0, result_1.ok)({
                success: true,
                data: {
                    items: posts,
                    pagination,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to get user posts', { id, error });
            return (0, result_1.err)(new errors_1.AppError('Failed to get user posts', 'GET_USER_POSTS_FAILED', 500));
        }
    }
    /**
     * Hard delete user
     */
    async hardDeleteUser(id) {
        try {
            const deleteResult = await this.repository.hardDelete(id);
            if (!deleteResult.ok) {
                return (0, result_1.err)(deleteResult.error);
            }
            // Revoke all refresh tokens
            await this.refreshTokenManager.revokeAllForUser(id);
            this.logger.info('User hard deleted', { userId: id });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to hard delete user', { id, error });
            return (0, result_1.err)(new errors_1.AppError('Failed to delete user', 'DELETE_USER_FAILED', 500));
        }
    }
}
exports.UserService = UserService;
