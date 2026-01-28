/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

/**
 * Pagination result
 */
export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Pagination utility functions
 */
export class PaginationUtils {
  /**
   * Generate pagination metadata
   */
  static paginate(params: PaginationParams): PaginationResult {
    const { page, limit, total } = params;
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}