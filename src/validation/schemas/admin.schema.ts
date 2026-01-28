import Joi from 'joi';

/**
 * UUID schema
 */
const uuidSchema = Joi.string().uuid();

/**
 * Grant admin schema
 */
export const grantAdminSchema = Joi.object({
  userId: uuidSchema.required(),
  adminLevel: Joi.string().valid('ADMIN', 'SUPER_ADMIN').required(),
  notes: Joi.string().max(500).optional(),
});

/**
 * Revoke admin schema
 */
export const revokeAdminSchema = Joi.object({
  userId: uuidSchema.required(),
});

/**
 * Get admins query schema
 */
export const getAdminsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  adminLevel: Joi.string().valid('ADMIN', 'SUPER_ADMIN').optional(),
});