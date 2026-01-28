"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const result_1 = require("../../../core/result");
const errors_1 = require("../../../core/errors");
const logger_1 = require("../../../core/logger");
const database_1 = require("../../../database");
/**
 * Auth repository implementation
 */
class AuthRepository {
    pool;
    logger;
    constructor(pool, logger = logger_1.Logger.getInstance()) {
        this.pool = pool;
        this.logger = logger;
    }
    /**
     * Create new user
     */
    async createUser(data) {
        try {
            const query = new database_1.InsertQuery()
                .into('users')
                .set({
                email: data.email,
                password: data.password,
                first_name: data.firstName || null,
                last_name: data.lastName || null,
                role: 'USER',
            })
                .returning('*');
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
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
            this.logger.info('User created', { userId: user.id, email: user.email });
            return (0, result_1.ok)(user);
        }
        catch (error) {
            this.logger.error('Failed to create user', { email: data.email, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('INSERT users', error));
        }
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        try {
            const query = new database_1.QueryBuilder()
                .select('*')
                .from('users')
                .where('email', '=', email)
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
            this.logger.error('Failed to find user by email', { email, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT users', error));
        }
    }
    /**
     * Find user by ID
     */
    async findById(id) {
        try {
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
     * Check if email exists
     */
    async emailExists(email) {
        try {
            const query = new database_1.QueryBuilder()
                .select('1')
                .from('users')
                .where('email', '=', email)
                .andWhere('deleted_at', 'IS NULL')
                .limit(1);
            const { sql, params } = query.build();
            const result = await this.pool.query(sql, params);
            return (0, result_1.ok)((result.rowCount ?? 0) > 0);
        }
        catch (error) {
            this.logger.error('Failed to check email existence', { email, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed('SELECT users', error));
        }
    }
}
exports.AuthRepository = AuthRepository;
