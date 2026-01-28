/**
 * Database Module Entry Point
 */

// Configuration
export * from './config/DatabaseConfig';

// Connection & Pool
export * from './pool/DatabasePool';

// Query Building Blocks
export * from './query-builder/WhereClause';

// Query Builders
export * from './query-builder/QueryBuilder'; // SELECT builder
export * from './query-builder/InsertQuery';
export * from './query-builder/UpdateQuery';
export * from './query-builder/DeleteQuery';

// Transactions
export * from './transaction/Transaction';

// Lifecycle - ADD THIS
export * from './lifecycle/DatabaseLifecycle';