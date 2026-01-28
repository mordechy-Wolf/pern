"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = exports.Transaction = void 0;
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
const result_1 = require("../../core/result");
/**
 * Transaction wrapper for safe database transactions
 */
class Transaction {
    client = null;
    isActive = false;
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Begin transaction
     */
    async begin(client) {
        if (this.isActive) {
            return (0, result_1.err)(new errors_1.DatabaseError('TRANSACTION_ALREADY_ACTIVE', 'Transaction is already active'));
        }
        try {
            await client.query('BEGIN');
            this.client = client;
            this.isActive = true;
            this.logger.debug('Transaction started');
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            return (0, result_1.err)(errors_1.DatabaseError.transactionFailed(error));
        }
    }
    /**
     * Commit transaction
     */
    async commit() {
        if (!this.isActive || !this.client) {
            return (0, result_1.err)(new errors_1.DatabaseError('NO_ACTIVE_TRANSACTION', 'No active transaction to commit'));
        }
        try {
            await this.client.query('COMMIT');
            this.isActive = false;
            this.logger.debug('Transaction committed');
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            return (0, result_1.err)(errors_1.DatabaseError.transactionFailed(error));
        }
    }
    /**
     * Rollback transaction
     */
    async rollback() {
        if (!this.isActive || !this.client) {
            return (0, result_1.err)(new errors_1.DatabaseError('NO_ACTIVE_TRANSACTION', 'No active transaction to rollback'));
        }
        try {
            await this.client.query('ROLLBACK');
            this.isActive = false;
            this.logger.debug('Transaction rolled back');
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            return (0, result_1.err)(errors_1.DatabaseError.transactionFailed(error));
        }
    }
    /**
     * Execute query within transaction
     */
    async query(sql, params) {
        if (!this.isActive || !this.client) {
            return (0, result_1.err)(new errors_1.DatabaseError('NO_ACTIVE_TRANSACTION', 'No active transaction'));
        }
        try {
            const result = await this.client.query(sql, params);
            return (0, result_1.ok)(result.rows);
        }
        catch (error) {
            this.logger.error('Transaction query failed', { sql, error });
            return (0, result_1.err)(errors_1.DatabaseError.queryFailed(sql, error));
        }
    }
    /**
     * Get client (for advanced usage)
     */
    getClient() {
        return this.client;
    }
    /**
     * Check if transaction is active
     */
    isTransactionActive() {
        return this.isActive;
    }
}
exports.Transaction = Transaction;
/**
 * Transaction manager for easy transaction handling
 */
class TransactionManager {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Execute function within transaction
     */
    async execute(getClient, fn) {
        const client = await getClient();
        const transaction = new Transaction(this.logger);
        try {
            // Begin transaction
            const beginResult = await transaction.begin(client);
            if (!beginResult.ok) {
                client.release();
                return (0, result_1.err)(beginResult.error);
            }
            // Execute function
            const result = await fn(transaction);
            if (result.ok) {
                // Success - commit
                const commitResult = await transaction.commit();
                if (!commitResult.ok) {
                    await transaction.rollback();
                    client.release();
                    return (0, result_1.err)(commitResult.error);
                }
                client.release();
                return (0, result_1.ok)(result.value);
            }
            else {
                // Error - rollback
                await transaction.rollback();
                client.release();
                return (0, result_1.err)(result.error);
            }
        }
        catch (error) {
            // Unexpected error - rollback
            this.logger.error('Transaction failed with unexpected error', error);
            await transaction.rollback().catch(() => { });
            client.release();
            return (0, result_1.err)(errors_1.DatabaseError.transactionFailed(error));
        }
    }
}
exports.TransactionManager = TransactionManager;
