"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const result_1 = require("../../../core/result");
const errors_1 = require("../../../core/errors");
const logger_1 = require("../../../core/logger");
const utils_1 = require("../../../core/utils");
const database_1 = require("../../../database");
/**
 * User repository implementation
 */
class UserRepository {
    pool;
    logger;
    constructor(pool, logger = logger_1.Logger.getInstance()) {
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Find user by ID
     */
    async findById(id, withStats = false) {
        try {
            if (withStats) {
                const result = await this.pool.query('SELECT * FROM user_stats WHERE id = $1', [id]);
                if (!result.rows[0]) {
                    return (0, result_1.ok)(null);
                }
                return (0, result_1.ok)(result.rows[0]);
            }
            const query = new database_1.QueryBuilder()
                .select('*')
                .from('users')
                .where('id', '=', id)
                .andWhere('deleted_at', 'IS NULL');
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            if (!result.rows[0]) {
                return (0, result_1.ok)(null);
            }
            const row = result.rows[0];
            const user = {
                id: row.id,
                email: row.email,
                password: row.password,
                firstName: row.first_name,
                lastName: row.last_name,
                role: row.role,
                isActive: row.is_active,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at,
            };
            return (0, result_1.ok)(user);
        }
        catch (error) {
            this.logger.error('Failed to find user by ID', { id, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT users', error));
        }
    }
    /**
     * Get users list with filters
     */
    async findAll(query) {
        try {
            const { page = 1, limit = 20, search, role, sortBy = 'createdAt', order = 'desc' } = query;
            const offset = (page - 1) * limit;
            let whereConditions = [];
            const params = [];
            let paramCount = 1;
            // Search filter
            if (search) {
                const sanitized = utils_1.StringUtils.sanitizeSearchQuery(search);
                whereConditions.push(`(email ILIKE $${paramCount} OR "firstName" ILIKE $${paramCount + 1} OR "lastName" ILIKE $${paramCount + 2})`);
                const pattern = `%${sanitized}%`;
                params.push(pattern, pattern, pattern);
                paramCount += 3;
            }
            // Role filter
            if (role) {
                whereConditions.push(`"effectiveRole" = $${paramCount}`);
                params.push(role);
                paramCount++;
            }
            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
            // Sort field mapping
            const sortField = sortBy === 'postsCount' ? 'posts_count' :
                sortBy === 'email' ? 'email' :
                    '"createdAt"';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            // Count total
            const countResult = await this.pool.query(`SELECT COUNT(*) AS total FROM user_stats ${whereClause}`, params);
            const total = parseInt(countResult.rows[0]?.total ?? '0');
            // Get users
            const usersResult = await this.pool.query(`SELECT * FROM user_stats ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT $${paramCount} OFFSET $${paramCount + 1}`, [...params, limit, offset]);
            return (0, result_1.ok)({
                users: usersResult.rows,
                total,
            });
        }
        catch (error) {
            this.logger.error('Failed to get users list', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT user_stats', error));
        }
    }
    /**
     * Update user profile
     */
    async update(id, data) {
        try {
            const cleanData = utils_1.StringUtils.removeNullish(data);
            if (Object.keys(cleanData).length === 0) {
                const userResult = await this.findById(id);
                if (!userResult.ok || !userResult.value) {
                    return (0, result_1.err)(new errors_1.DatabaseError('USER_NOT_FOUND', 'User not found'));
                }
                return (0, result_1.ok)(userResult.value);
            }
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (data.email) {
                updates.push(`email = $${paramCount++}`);
                values.push(data.email);
            }
            if (data.firstName !== undefined) {
                updates.push(`first_name = $${paramCount++}`);
                values.push(data.firstName);
            }
            if (data.lastName !== undefined) {
                updates.push(`last_name = $${paramCount++}`);
                values.push(data.lastName);
            }
            values.push(id);
            const result = await this.pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`, values);
            if (!result.rows[0]) {
                return (0, result_1.err)(new errors_1.DatabaseError('USER_NOT_FOUND', 'User not found'));
            }
            const row = result.rows[0];
            const user = {
                id: row.id,
                email: row.email,
                password: row.password,
                firstName: row.first_name,
                lastName: row.last_name,
                role: row.role,
                isActive: row.is_active,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at,
            };
            this.logger.info('User updated', { userId: id });
            return (0, result_1.ok)(user);
        }
        catch (error) {
            this.logger.error('Failed to update user', { id, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('UPDATE users', error));
        }
    }
    /**
     * Soft delete user
     */
    async softDelete(id) {
        try {
            const query = new database_1.UpdateQuery()
                .table('users')
                .set({ deleted_at: new Date() })
                .where('id', '=', id);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            if ((result.rowCount ?? 0) === 0) {
                return (0, result_1.err)(new errors_1.DatabaseError('USER_NOT_FOUND', 'User not found'));
            }
            this.logger.info('User soft deleted', { userId: id });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to soft delete user', { id, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('UPDATE users', error));
        }
    }
    /**
     * Hard delete user
     */
    async hardDelete(id) {
        try {
            const query = new database_1.DeleteQuery()
                .from('users')
                .where('id', '=', id);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            if ((result.rowCount ?? 0) === 0) {
                return (0, result_1.err)(new errors_1.DatabaseError('USER_NOT_FOUND', 'User not found'));
            }
            this.logger.info('User hard deleted', { userId: id });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to hard delete user', { id, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('DELETE users', error));
        }
    }
    /**
     * Get user's posts
     */
    async getUserPosts(id, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            // Count total
            const countResult = await this.pool.query('SELECT COUNT(*) AS total FROM posts WHERE user_id = $1 AND deleted_at IS NULL', [id]);
            const total = parseInt(countResult.rows[0]?.total ?? '0');
            // Get posts
            const postsResult = await this.pool.query(`SELECT * FROM posts_with_details WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`, [id, limit, offset]);
            return (0, result_1.ok)({
                posts: postsResult.rows,
                total,
            });
        }
        catch (error) {
            this.logger.error('Failed to get user posts', { id, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT posts', error));
        }
    }
}
exports.UserRepository = UserRepository;
