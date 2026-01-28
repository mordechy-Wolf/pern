import Joi from 'joi';

/**
 * UUID schema (reusable)
 */
const uuidSchema = Joi.string().uuid();

/**
 * Get users query schema
 */
export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().min(2).optional(),
  role: Joi.string().valid('USER', 'ADMIN', 'SUPER_ADMIN').optional(),
  sortBy: Joi.string().valid('createdAt', 'email', 'postsCount').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Update user role schema
 */
export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN', 'SUPER_ADMIN').required(),
});

/**
 * User ID param schema
 */
export const userIdParamSchema = Joi.object({
  id: uuidSchema.required(),
});