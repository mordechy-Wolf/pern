"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const WhereClause_1 = require("./WhereClause");
/**
 * SQL Query Builder with SQL injection protection
 */
class QueryBuilder {
    selectColumns = [];
    fromTable = '';
    whereClause = new WhereClause_1.WhereClause();
    orderByColumns = [];
    limitValue;
    offsetValue;
    /**
     * SELECT columns
     */
    select(columns) {
        this.selectColumns = Array.isArray(columns) ? columns : [columns];
        return this;
    }
    /**
     * FROM table
     */
    from(table) {
        this.fromTable = table;
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
     * OR WHERE condition
     */
    orWhere(column, operator, value) {
        this.whereClause.orWhere(column, operator, value);
        return this;
    }
    /**
     * ORDER BY
     */
    orderBy(column, direction = 'ASC') {
        this.orderByColumns.push({ column, direction });
        return this;
    }
    /**
     * LIMIT
     */
    limit(limit) {
        this.limitValue = limit;
        return this;
    }
    /**
     * OFFSET
     */
    offset(offset) {
        this.offsetValue = offset;
        return this;
    }
    /**
     * Build final SQL query
     */
    build() {
        if (!this.fromTable) {
            throw new Error('FROM table is required');
        }
        if (this.selectColumns.length === 0) {
            throw new Error('SELECT columns are required');
        }
        let sql = `SELECT ${this.selectColumns.join(', ')} FROM ${this.fromTable}`;
        let params = [];
        let paramIndex = 1;
        // WHERE clause
        if (this.whereClause.hasConditions()) {
            const whereResult = this.whereClause.build(paramIndex);
            sql += ` ${whereResult.sql}`;
            params = params.concat(whereResult.params);
            paramIndex = whereResult.nextParamIndex;
        }
        // ORDER BY
        if (this.orderByColumns.length > 0) {
            const orderBy = this.orderByColumns
                .map(col => `${col.column} ${col.direction}`)
                .join(', ');
            sql += ` ORDER BY ${orderBy}`;
        }
        // LIMIT
        if (this.limitValue !== undefined) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(this.limitValue);
            paramIndex++;
        }
        // OFFSET
        if (this.offsetValue !== undefined) {
            sql += ` OFFSET $${paramIndex}`;
            params.push(this.offsetValue);
            paramIndex++;
        }
        return { sql, params };
    }
    /**
     * Reset builder
     */
    reset() {
        this.selectColumns = [];
        this.fromTable = '';
        this.whereClause.clear();
        this.orderByColumns = [];
        this.limitValue = undefined;
        this.offsetValue = undefined;
        return this;
    }
}
exports.QueryBuilder = QueryBuilder;
