/**
 * WHERE clause operators
 */
export type WhereOperator = 
  | '=' | '!=' | '<>' 
  | '>' | '>=' | '<' | '<='
  | 'LIKE' | 'ILIKE' | 'NOT LIKE' | 'NOT ILIKE'
  | 'IN' | 'NOT IN'
  | 'IS NULL' | 'IS NOT NULL'
  | 'BETWEEN';

/**
 * WHERE condition
 */
export interface WhereCondition {
  column: string;
  operator: WhereOperator;
  value?: any;
  connector?: 'AND' | 'OR';
}

/**
 * WHERE clause builder
 */
export class WhereClause {
  private conditions: WhereCondition[] = [];
  
  /**
   * Add WHERE condition
   */
  where(column: string, operator: WhereOperator, value?: any): this {
    this.conditions.push({
      column,
      operator,
      value,
      connector: this.conditions.length === 0 ? undefined : 'AND',
    });
    return this;
  }
  
  /**
   * Add AND WHERE condition
   */
  andWhere(column: string, operator: WhereOperator, value?: any): this {
    this.conditions.push({
      column,
      operator,
      value,
      connector: 'AND',
    });
    return this;
  }
  
  /**
   * Add OR WHERE condition
   */
  orWhere(column: string, operator: WhereOperator, value?: any): this {
    this.conditions.push({
      column,
      operator,
      value,
      connector: 'OR',
    });
    return this;
  }
  
  /**
   * Build WHERE clause SQL
   */
  build(startParamIndex: number = 1): { sql: string; params: any[]; nextParamIndex: number } {
    if (this.conditions.length === 0) {
      return { sql: '', params: [], nextParamIndex: startParamIndex };
    }
    
    const params: any[] = [];
    let paramIndex = startParamIndex;
    
    const clauses = this.conditions.map((condition, index) => {
      let clause = '';
      
      // Add connector (AND/OR)
      if (index > 0 && condition.connector) {
        clause += ` ${condition.connector} `;
      }
      
      // Build condition
      if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        clause += `${condition.column} ${condition.operator}`;
      } else if (condition.operator === 'BETWEEN') {
        clause += `${condition.column} BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(condition.value[0], condition.value[1]);
        paramIndex += 2;
      } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const placeholders = condition.value.map((_: any, i: number) => `$${paramIndex + i}`).join(', ');
        clause += `${condition.column} ${condition.operator} (${placeholders})`;
        params.push(...condition.value);
        paramIndex += condition.value.length;
      } else {
        clause += `${condition.column} ${condition.operator} $${paramIndex}`;
        params.push(condition.value);
        paramIndex++;
      }
      
      return clause;
    });
    
    const sql = 'WHERE ' + clauses.join('');
    
    return { sql, params, nextParamIndex: paramIndex };
  }
  
  /**
   * Check if has conditions
   */
  hasConditions(): boolean {
    return this.conditions.length > 0;
  }
  
  /**
   * Clear all conditions
   */
  clear(): void {
    this.conditions = [];
  }
}