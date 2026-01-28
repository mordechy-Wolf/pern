"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuery = void 0;
const WhereClause_1 = require("./WhereClause");
/**
 * UPDATE query builder
 */
class UpdateQuery {
    tableName = '';
    updates = {};
    whereClause = new WhereClause_1.WhereClause();
    returningColumns = [];
    /**
     * UPDATE table
     */
    table(table) {
        this.tableName = table;
        return this;
    }
    /**
     * SET values
     */
    set(data) {
        this.updates = { ...this.updates, ...data };
        return this;
    }
    /**
     * WHERE condition
     */
    where(column, operator, value) {
        this.whereClause.where(column, operator, value);
        return this;
    }
    /**
     * AND WHERE condition
     */
    andWhere(column, operator, value) {
        this.whereClause.andWhere(column, operator, value);
        return this;
    }
    /**
     * RETURNING clause
     */
    returning(columns) {
        this.returningColumns = Array.isArray(columns) ? columns : [columns];
        return this;
    }
    /**
     * Build UPDATE query
     */
    build() {
        if (!this.tableName) {
            throw new Error('Table name is required for UPDATE');
        }
        const columns = Object.keys(this.updates);
        if (columns.length === 0) {
            throw new Error('No data provided for UPDATE');
        }
        const params = [];
        let paramIndex = 1;
        // Build SET clause
        const setClauses = columns.map(col => {
            params.push(this.updates[col]);
            return `${col} = $${paramIndex++}`;
        });
        let sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')}`;
        // WHERE clause
        if (this.whereClause.hasConditions()) {
            const whereResult = this.whereClause.build(paramIndex);
            sql += ` ${whereResult.sql}`;
            params.push(...whereResult.params);
        }
        else {
            throw new Error('WHERE clause is required for UPDATE (use where() to add a condition)');
        }
        // RETURNING clause
        if (this.returningColumns.length > 0) {
            sql += ` RETURNING ${this.returningColumns.join(', ')}`;
        }
        return { sql, params };
    }
}
exports.UpdateQuery = UpdateQuery;
