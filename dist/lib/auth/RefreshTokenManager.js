"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenManager = void 0;
const result_1 = require("../../core/result");
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
const query_builder_1 = require("../../database/query-builder");
/**
 * Refresh token manager for database operations
 */
class RefreshTokenManager {
    pool;
    logger;
    constructor(pool, logger = logger_1.Logger.getInstance()) {
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Store refresh token in database
     */
    async store(userId, token, expiresAt) {
        try {
            const query = new query_builder_1.InsertQuery()
                .into('refresh_tokens')
                .set({
                user_id: userId,
                token,
                expires_at: expiresAt,
            });
            const { sql, params } = query.build();
            await this.pool.query(sql, params);
            this.logger.debug('Refresh token stored', { userId });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to store refresh token', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('INSERT refresh_tokens', error));
        }
    }
    /**
     * Check if refresh token is valid
     */
    async isValid(token) {
        try {
            const result = await this.pool.query(`SELECT 1 FROM refresh_tokens 
         WHERE token = $1 
         AND expires_at > NOW() 
         AND revoked_at IS NULL`, [token]);
            const isValid = result.rowCount ? result.rowCount > 0 : false;
            this.logger.debug('Refresh token validity checked', { isValid });
            return (0, result_1.ok)(isValid);
        }
        catch (error) {
            this.logger.error('Failed to check refresh token validity', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT refresh_tokens', error));
        }
    }
    /**
     * Get refresh token data
     */
    async get(token) {
        try {
            const result = await this.pool.query(`SELECT id, user_id, token, expires_at, created_at 
         FROM refresh_tokens 
         WHERE token = $1 
         AND revoked_at IS NULL`, [token]);
            if (!result.rows[0]) {
                return (0, result_1.ok)(null);
            }
            const row = result.rows[0];
            return (0, result_1.ok)({
                id: row.id,
                userId: row.user_id,
                token: row.token,
                expiresAt: row.expires_at,
                createdAt: row.created_at,
            });
        }
        catch (error) {
            this.logger.error('Failed to get refresh token', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT refresh_tokens', error));
        }
    }
    /**
     * Revoke (invalidate) refresh token
     */
    async revoke(token) {
        try {
            const query = new query_builder_1.UpdateQuery()
                .table('refresh_tokens')
                .set({ revoked_at: new Date() })
                .where('token', '=', token);
            const { sql, params } = query.build();
            await this.pool.query(sql, params);
            this.logger.debug('Refresh token revoked');
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to revoke refresh token', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('UPDATE refresh_tokens', error));
        }
    }
    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllForUser(userId) {
        try {
            const query = new query_builder_1.UpdateQuery()
                .table('refresh_tokens')
                .set({ revoked_at: new Date() })
                .where('user_id', '=', userId)
                .andWhere('revoked_at', 'IS NULL');
            const { sql, params } = query.build();
            await this.pool.query(sql, params);
            this.logger.debug('All refresh tokens revoked for user', { userId });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            this.logger.error('Failed to revoke all refresh tokens', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('UPDATE refresh_tokens', error));
        }
    }
    /**
     * Clean up expired refresh tokens (maintenance)
     */
    async cleanupExpired() {
        try {
            const query = new query_builder_1.DeleteQuery()
                .from('refresh_tokens')
                .where('expires_at', '<', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            const deletedCount = result.rowCount ?? 0;
            this.logger.info('Expired refresh tokens cleaned up', { count: deletedCount });
            return (0, result_1.ok)(deletedCount);
        }
        catch (error) {
            this.logger.error('Failed to cleanup expired refresh tokens', error);
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('DELETE refresh_tokens', error));
        }
    }
    /**
     * Get active tokens count for user
     */
    async getActiveCountForUser(userId) {
        try {
            const result = await this.pool.query(`SELECT COUNT(*) as count 
         FROM refresh_tokens 
         WHERE user_id = $1 
         AND expires_at > NOW() 
         AND revoked_at IS NULL`, [userId]);
            const count = parseInt(result.rows[0]?.count ?? '0', 10);
            return (0, result_1.ok)(count);
        }
        catch (error) {
            this.logger.error('Failed to get active tokens count', { userId, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT refresh_tokens', error));
        }
    }
}
exports.RefreshTokenManager = RefreshTokenManager;
