/**
 * Sort order enum
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Post sort by options
 */
export enum PostSortBy {
  CREATED_AT = 'createdAt',
  LIKES = 'likes',
  COMMENTS = 'comments',
}

/**
 * User sort by options
 */
export enum UserSortBy {
  CREATED_AT = 'createdAt',
  EMAIL = 'email',
  POSTS_COUNT = 'postsCount',
}

/**
 * Search type enum
 */
export enum SearchType {
  ALL = 'all',
  POSTS = 'posts',
  USERS = 'users',
  CATEGORIES = 'categories',
}

/**
 * Notification type enum
 */
export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  MENTION = 'MENTION',
}

/**
 * Check if value is valid sort order
 */
export function isValidSortOrder(value: string): value is SortOrder {
  return Object.values(SortOrder).includes(value as SortOrder);
}