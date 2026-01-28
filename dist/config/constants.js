"use strict";
/**
 * Application constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP = exports.CACHE = exports.DATE_FORMATS = exports.PATTERNS = exports.CORS = exports.TIMEOUTS = exports.NOTIFICATION_TYPES = exports.SEARCH_TYPES = exports.USER_SORT_BY = exports.POST_SORT_BY = exports.SORT_ORDERS = exports.ADMIN_LEVELS = exports.USER_ROLES = exports.LOG_LEVELS = exports.ERROR_CODES = exports.HTTP_STATUS = exports.CONTENT = exports.DATABASE = exports.RATE_LIMIT = exports.AUTH = exports.PAGINATION = exports.API = void 0;
/**
 * API versioning
 */
exports.API = {
    VERSION: 'v1',
    PREFIX: '/api',
    FULL_PREFIX: '/api/v1',
};
/**
 * Pagination defaults
 */
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
/**
 * Auth/JWT constants
 */
exports.AUTH = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    BCRYPT_ROUNDS: 10,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
};
/**
 * Rate limiting
 */
exports.RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    API_MAX: 100,
    AUTH_MAX: 5,
    CREATE_MAX: 20,
};
/**
 * Database
 */
exports.DATABASE = {
    POOL_MIN: 2,
    POOL_MAX: 20,
    IDLE_TIMEOUT_MS: 30000,
    CONNECTION_TIMEOUT_MS: 5000,
};
/**
 * Content limits
 */
exports.CONTENT = {
    POST_TITLE_MIN: 3,
    POST_TITLE_MAX: 200,
    POST_CONTENT_MIN: 10,
    POST_CONTENT_MAX: 50000,
    COMMENT_MIN: 1,
    COMMENT_MAX: 2000,
    CATEGORY_NAME_MIN: 2,
    CATEGORY_NAME_MAX: 50,
    CATEGORY_DESC_MAX: 500,
    USER_NAME_MAX: 50,
    EMAIL_MAX: 255,
    IMAGE_URLS_MAX: 10,
    IMAGE_URL_MAX: 500,
};
/**
 * HTTP status codes
 */
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
/**
 * Error codes
 */
exports.ERROR_CODES = {
    // General
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    // Auth
    AUTH_ERROR: 'AUTH_ERROR',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    FORBIDDEN: 'FORBIDDEN',
    // Database
    DATABASE_ERROR: 'DATABASE_ERROR',
    QUERY_FAILED: 'QUERY_FAILED',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    // Rate Limit
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    // Resource specific
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    POST_NOT_FOUND: 'POST_NOT_FOUND',
    CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
    COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
    ADMIN_NOT_FOUND: 'ADMIN_NOT_FOUND',
    // Business logic
    ALREADY_LIKED: 'ALREADY_LIKED',
    ALREADY_ADMIN: 'ALREADY_ADMIN',
    EMAIL_IN_USE: 'EMAIL_IN_USE',
};
/**
 * Log levels
 */
exports.LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};
/**
 * User roles
 */
exports.USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
};
/**
 * Admin levels
 */
exports.ADMIN_LEVELS = {
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
};
/**
 * Sort orders
 */
exports.SORT_ORDERS = {
    ASC: 'asc',
    DESC: 'desc',
};
/**
 * Post sort options
 */
exports.POST_SORT_BY = {
    CREATED_AT: 'createdAt',
    LIKES: 'likes',
    COMMENTS: 'comments',
};
/**
 * User sort options
 */
exports.USER_SORT_BY = {
    CREATED_AT: 'createdAt',
    EMAIL: 'email',
    POSTS_COUNT: 'postsCount',
};
/**
 * Search types
 */
exports.SEARCH_TYPES = {
    ALL: 'all',
    POSTS: 'posts',
    USERS: 'users',
    CATEGORIES: 'categories',
};
/**
 * Notification types
 */
exports.NOTIFICATION_TYPES = {
    COMMENT: 'COMMENT',
    LIKE: 'LIKE',
    MENTION: 'MENTION',
};
/**
 * Timeouts
 */
exports.TIMEOUTS = {
    REQUEST_TIMEOUT_MS: 30000, // 30 seconds
    SHUTDOWN_TIMEOUT_MS: 10000, // 10 seconds
};
/**
 * CORS
 */
exports.CORS = {
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
    METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
};
/**
 * Regex patterns
 */
exports.PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};
/**
 * Date formats
 */
exports.DATE_FORMATS = {
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY HH:mm',
};
/**
 * Cache durations (in seconds)
 */
exports.CACHE = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
};
/**
 * Application metadata
 */
exports.APP = {
    NAME: 'Blog API',
    VERSION: '1.0.0',
    DESCRIPTION: 'RESTful Blog API with TypeScript, Express, and PostgreSQL',
    AUTHOR: 'Your Name',
};
