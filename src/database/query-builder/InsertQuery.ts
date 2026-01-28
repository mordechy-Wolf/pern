/**
 * INSERT query builder
 */
export class InsertQuery {
  private tableName: string = '';
  private columns: string[] = [];
  private values: any[] = [];
  private returningColumns: string[] = [];
  
  /**
   * INTO table
   */
  into(table: string): this {
    this.tableName = table;
    return this;
  }
  
  /**
   * Set values (object or array)
   */
  set(data: Record<string, any> | Record<string, any>[]): this {
    const rows = Array.isArray(data) ? data : [data];
    
    if (rows.length === 0) {
      throw new Error('No data provided for INSERT');
    }
    
    // Get columns from first row
    this.columns = Object.keys(rows[0]);
    
    // Validate all rows have same columns
    for (const row of rows) {
      const rowColumns = Object.keys(row);
      if (rowColumns.length !== this.columns.length || 
          !rowColumns.every(col => this.columns.includes(col))) {
        throw new Error('All rows must have the same columns');
      }
    }
    
    // Extract values
    this.values = rows.flatMap(row => 
      this.columns.map(col => row[col])
    );
    
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
   * Build INSERT query
   */
  build(): { sql: string; params: any[] } {
    if (!this.tableName) {
      throw new Error('Table name is required for INSERT');
    }
    
    if (this.columns.length === 0 || this.values.length === 0) {
      throw new Error('No data provided for INSERT');
    }
    
    const rowCount = this.values.length / this.columns.length;
    
    // Build VALUES placeholders
    const valuePlaceholders: string[] = [];
    let paramIndex = 1;
    
    for (let i = 0; i < rowCount; i++) {
      const rowPlaceholders = this.columns.map(() => `$${paramIndex++}`);
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    }
    
    let sql = `INSERT INTO ${this.tableName} (${this.columns.join(', ')}) VALUES ${valuePlaceholders.join(', ')}`;
    
    // RETURNING clause
    if (this.returningColumns.length > 0) {
      sql += ` RETURNING ${this.returningColumns.join(', ')}`;
    }
    
    return { sql, params: this.values };
  }
}