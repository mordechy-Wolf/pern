import { WhereClause, WhereOperator } from './WhereClause';

/**
 * SQL Query Builder with SQL injection protection
 */
export class QueryBuilder {
  private selectColumns: string[] = [];
  private fromTable: string = '';
  private whereClause: WhereClause = new WhereClause();
  private orderByColumns: Array<{ column: string; direction: 'ASC' | 'DESC' }> = [];
  private limitValue?: number;
  private offsetValue?: number;
  
  /**
   * SELECT columns
   */
  select(columns: string | string[]): this {
    this.selectColumns = Array.isArray(columns) ? columns : [columns];
    return this;
  }
  
  /**
   * FROM table
   */
  from(table: string): this {
    this.fromTable = table;
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
   * OR WHERE condition
   */
  orWhere(column: string, operator: WhereOperator, value?: any): this {
    this.whereClause.orWhere(column, operator, value);
    return this;
  }
  
  /**
   * ORDER BY
   */
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumns.push({ column, direction });
    return this;
  }
  
  /**
   * LIMIT
   */
  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }
  
  /**
   * OFFSET
   */
  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }
  
  /**
   * Build final SQL query
   */
  build(): { sql: string; params: any[] } {
    if (!this.fromTable) {
      throw new Error('FROM table is required');
    }
    
    if (this.selectColumns.length === 0) {
      throw new Error('SELECT columns are required');
    }
    
    let sql = `SELECT ${this.selectColumns.join(', ')} FROM ${this.fromTable}`;
    let params: any[] = [];
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
  reset(): this {
    this.selectColumns = [];
    this.fromTable = '';
    this.whereClause.clear();
    this.orderByColumns = [];
    this.limitValue = undefined;
    this.offsetValue = undefined;
    return this;
  }
}