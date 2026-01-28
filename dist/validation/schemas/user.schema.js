"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.updateUserRoleSchema = exports.getUsersQuerySchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * UUID schema (reusable)
 */
const uuidSchema = joi_1.default.string().uuid();
/**
 * Get users query schema
 */
exports.getUsersQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    search: joi_1.default.string().min(2).optional(),
    role: joi_1.default.string().valid('USER', 'ADMIN', 'SUPER_ADMIN').optional(),
    sortBy: joi_1.default.string().valid('createdAt', 'email', 'postsCount').default('createdAt'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
/**
 * Update user role schema
 */
exports.updateUserRoleSchema = joi_1.default.object({
    role: joi_1.default.string().valid('USER', 'ADMIN', 'SUPER_ADMIN').required(),
});
/**
 * User ID param schema
 */
exports.userIdParamSchema = joi_1.default.object({
    id: uuidSchema.required(),
});
