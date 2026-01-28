"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteQuery = void 0;
const WhereClause_1 = require("./WhereClause");
/**
 * DELETE query builder
 */
class DeleteQuery {
    tableName = '';
    whereClause = new WhereClause_1.WhereClause();
    returningColumns = [];
    /**
     * FROM table
     */
    from(table) {
        this.tableName = table;
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
     * Build DELETE query
     */
    build() {
        if (!this.tableName) {
            throw new Error('Table name is required for DELETE');
        }
        let sql = `DELETE FROM ${this.tableName}`;
        let params = [];
        // WHERE clause
        if (this.whereClause.hasConditions()) {
            const whereResult = this.whereClause.build(1);
            sql += ` ${whereResult.sql}`;
            params = whereResult.params;
        }
        else {
            throw new Error('WHERE clause is required for DELETE (use where() to add a condition)');
        }
        // RETURNING clause
        if (this.returningColumns.length > 0) {
            sql += ` RETURNING ${this.returningColumns.join(', ')}`;
        }
        return { sql, params };
    }
}
exports.DeleteQuery = DeleteQuery;
