import { UserRole } from '../../enums';
import { SearchType } from '../../enums';
import { PaginationQuery, SortQuery } from './Pagination';

/**
 * Get users query
 */
export interface GetUsersQuery extends PaginationQuery, SortQuery {
  search?: string;
  role?: UserRole;
}

/**
 * Get posts query
 */
export interface GetPostsQuery extends PaginationQuery, SortQuery {
  search?: string;
  categoryId?: string;
  userId?: string;
}

/**
 * Get comments query
 */
export interface GetCommentsQuery extends PaginationQuery, SortQuery {}

/**
 * Get categories query
 */
export interface GetCategoriesQuery {
  includePostCount?: boolean;
}

/**
 * Delete category query
 */
export interface DeleteCategoryQuery {
  force?: boolean;
}

/**
 * Search query
 */
export interface SearchQuery extends PaginationQuery {
  q: string;
  type?: SearchType;
}

/**
 * Get notifications query
 */
export interface GetNotificationsQuery extends PaginationQuery {
  unreadOnly?: boolean;
}