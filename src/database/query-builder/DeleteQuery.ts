import { WhereClause, WhereOperator } from './WhereClause';

/**
 * DELETE query builder
 */
export class DeleteQuery {
  private tableName: string = '';
  private whereClause: WhereClause = new WhereClause();
  private returningColumns: string[] = [];
  
  /**
   * FROM table
   */
  from(table: string): this {
    this.tableName = table;
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
   * Build DELETE query
   */
  build(): { sql: string; params: any[] } {
    if (!this.tableName) {
      throw new Error('Table name is required for DELETE');
    }
    
    let sql = `DELETE FROM ${this.tableName}`;
    let params: any[] = [];
    
    // WHERE clause
    if (this.whereClause.hasConditions()) {
      const whereResult = this.whereClause.build(1);
      sql += ` ${whereResult.sql}`;
      params = whereResult.params;
    } else {
      throw new Error('WHERE clause is required for DELETE (use where() to add a condition)');
    }
    
    // RETURNING clause
    if (this.returningColumns.length > 0) {
      sql += ` RETURNING ${this.returningColumns.join(', ')}`;
    }
    
    return { sql, params };
  }
}