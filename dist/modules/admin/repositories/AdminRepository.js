"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const result_1 = require("../../../core/result");
const errors_1 = require("../../../core/errors");
const logger_1 = require("../../../core/logger");
const database_1 = require("../../../database");
/**
 * Admin repository implementation
 */
class AdminRepository {
    pool;
    logger;
    constructor(pool, logger = logger_1.Logger.getInstance()) {
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Grant admin privileges
     */
    async grantAdmin(userId, adminLevel, grantedBy, notes) {
        try {
            // Check if already admin
            const existing = await this.pool.query('SELECT 1 FROM admins WHERE user_id = $1', [userId]);
            if ((existing.rowCount ?? 0) > 0) {
                return (0, result_1.err)(new errors_1.DatabaseError('ALREADY_ADMIN', 'User is already an admin'));
            }
            const query = new database_1.InsertQuery()
                .into('admins')
                .set({
                user_id: userId,
                admin_level: adminLevel,
                granted_by: grantedBy,
                notes: notes || null,
            })
                .returning('*');
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            const row = result.rows[0];
            const admin = {
                id: row.id,
                userId: row.user_id,
                adminLevel: row.admin_level,
                grantedBy: row.granted_by,
                grantedAt: row.granted_at,
                notes: row.notes,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
            this.logger.info('Admin privileges granted', { userId, adminLevel });
            return (0, result_1.ok)(admin);
        }
        catch (error) {
            this.logger.error('Failed to grant admin', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('INSERT admins', error));
        }
    }
    /**
     * Revoke admin privileges
     */
    async revokeAdmin(userId) {
        try {
            const query = new database_1.DeleteQuery()
                .from('admins')
                .where('user_id', '=', userId);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            if ((result.rowCount ?? 0) === 0) {
                return (0, result_1.err)(new errors_1.DatabaseError('ADMIN_NOT_FOUND', 'Admin record not found'));
            }
            this.logger.info('Admin privileges revoked', { userId });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to revoke admin', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('DELETE admins', error));
        }
    }
    /**
     * Get all admins
     */
    async getAll() {
        try {
            const result = await this.pool.query('SELECT * FROM admin_list ORDER BY "grantedAt" DESC');
            return (0, result_1.ok)(result.rows);
        }
        catch (error) {
            this.logger.error('Failed to get admins list', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT admin_list', error));
        }
    }
    /**
     * Check if user is admin
     */
    async isAdmin(userId) {
        try {
            const query = new database_1.QueryBuilder()
                .select('1')
                .from('admins')
                .where('user_id', '=', userId)
                .limit(1);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            return (0, result_1.ok)((result.rowCount ?? 0) > 0);
        }
        catch (error) {
            this.logger.error('Failed to check admin status', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT admins', error));
        }
    }
    /**
     * Check if user is super admin
     */
    async isSuperAdmin(userId) {
        try {
            const query = new database_1.QueryBuilder()
                .select('1')
                .from('admins')
                .where('user_id', '=', userId)
                .andWhere('admin_level', '=', 'SUPER_ADMIN')
                .limit(1);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            return (0, result_1.ok)((result.rowCount ?? 0) > 0);
        }
        catch (error) {
            this.logger.error('Failed to check super admin status', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT admins', error));
        }
    }
    /**
     * Get admin level
     */
    async getAdminLevel(userId) {
        try {
            const query = new database_1.QueryBuilder()
                .select('admin_level')
                .from('admins')
                .where('user_id', '=', userId);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            if (!result.rows[0]) {
                return (0, result_1.ok)(null);
            }
            return (0, result_1.ok)(result.rows[0].admin_level);
        }
        catch (error) {
            this.logger.error('Failed to get admin level', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT admins', error));
        }
    }
}
exports.AdminRepository = AdminRepository;
