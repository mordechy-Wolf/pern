"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = void 0;
const BaseError_1 = require("./BaseError");
/**
 * Database operation error
 */
class DatabaseError extends BaseError_1.BaseError {
    constructor(code, message, details, cause) {
        super(message, `DB_${code}`, 500, details, cause);
    }
    static queryFailed(query, cause) {
        return new DatabaseError('QUERY_FAILED', 'Database query failed', { query }, cause);
    }
    static connectionFailed(cause) {
        return new DatabaseError('CONNECTION_FAILED', 'Failed to connect to database', undefined, cause);
    }
    static transactionFailed(cause) {
        return new DatabaseError('TRANSACTION_FAILED', 'Database transaction failed', undefined, cause);
    }
}
exports.DatabaseError = DatabaseError;
