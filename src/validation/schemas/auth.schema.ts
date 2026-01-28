import Joi from 'joi';

/**
 * Email schema (reusable)
 */
const emailSchema = Joi.string().email().max(255).required();

/**
 * Password schema (reusable)
 */
const passwordSchema = Joi.string().min(6).max(128).required();

/**
 * Register schema
 */
export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
});

/**
 * Login schema
 */
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * Update profile schema
 */
export const updateProfileSchema = Joi.object({
  email: Joi.string().email().max(255).optional(),
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
}).min(1);

/**
 * Change password schema
 */
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: passwordSchema,
});