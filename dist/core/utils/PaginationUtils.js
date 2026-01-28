"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtils = void 0;
/**
 * Pagination utility functions
 */
class PaginationUtils {
    /**
     * Generate pagination metadata
     */
    static paginate(params) {
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
exports.PaginationUtils = PaginationUtils;
