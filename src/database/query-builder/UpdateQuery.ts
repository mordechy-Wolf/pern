import { WhereClause, WhereOperator } from './WhereClause';

/**
 * UPDATE query builder
 */
export class UpdateQuery {
  private tableName: string = '';
  private updates: Record<string, any> = {};
  private whereClause: WhereClause = new WhereClause();
  private returningColumns: string[] = [];
  
  /**
   * UPDATE table
   */
  table(table: string): this {
    this.tableName = table;
    return this;
  }
  
  /**
   * SET values
   */
  set(data: Record<string, any>): this {
    this.updates = { ...this.updates, ...data };
    return this;
  }
  
  /**
   * WHERE condition
   */
  where(column: string, operator: WhereOperator, value?: any): this {
    this.whereClause.where(column, operator, value);
    return this;
  }
  
  /**
   * AND WHERE condition
   */
  andWhere(column: string, operator: WhereOperator, value?: any): this {
    this.whereClause.andWhere(column, operator, value);
    return this;
  }
  
  /**
   * RETURNING clause
   */
  returning(columns: string | string[]): this {
    this.returningColumns = Array.isArray(columns) ? columns : [columns];
    return this;
  }
  
  /**
   * Build UPDATE query
   */
  build(): { sql: string; params: any[] } {
    if (!this.tableName) {
      throw new Error('Table name is required for UPDATE');
    }
    
    const columns = Object.keys(this.updates);
    if (columns.length === 0) {
      throw new Error('No data provided for UPDATE');
    }
    
    const params: any[] = [];
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
    } else {
      throw new Error('WHERE clause is required for UPDATE (use where() to add a condition)');
    }
    
    // RETURNING clause
    if (this.returningColumns.length > 0) {
      sql += ` RETURNING ${this.returningColumns.join(', ')}`;
    }
    
    return { sql, params };
  }
}