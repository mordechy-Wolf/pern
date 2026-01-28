"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Email schema (reusable)
 */
const emailSchema = joi_1.default.string().email().max(255).required();
/**
 * Password schema (reusable)
 */
const passwordSchema = joi_1.default.string().min(6).max(128).required();
/**
 * Register schema
 */
exports.registerSchema = joi_1.default.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: joi_1.default.string().min(1).max(50).optional(),
    lastName: joi_1.default.string().min(1).max(50).optional(),
});
/**
 * Login schema
 */
exports.loginSchema = joi_1.default.object({
    email: emailSchema,
    password: joi_1.default.string().required(),
});
/**
 * Refresh token schema
 */
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
/**
 * Update profile schema
 */
exports.updateProfileSchema = joi_1.default.object({
    email: joi_1.default.string().email().max(255).optional(),
    firstName: joi_1.default.string().min(1).max(50).optional(),
    lastName: joi_1.default.string().min(1).max(50).optional(),
}).min(1);
/**
 * Change password schema
 */
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: passwordSchema,
});
