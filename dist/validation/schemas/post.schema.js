"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postIdOnlyParamSchema = exports.postIdParamSchema = exports.getPostsQuerySchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * UUID schema
 */
const uuidSchema = joi_1.default.string().uuid();
/**
 * Create post schema
 */
exports.createPostSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).required(),
    content: joi_1.default.string().min(10).max(50000).required(),
    imageUrls: joi_1.default.array().items(joi_1.default.string().uri().max(500)).max(10).optional(),
    categoryId: uuidSchema.optional(),
});
/**
 * Update post schema
 */
exports.updatePostSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).optional(),
    content: joi_1.default.string().min(10).max(50000).optional(),
    imageUrls: joi_1.default.array().items(joi_1.default.string().uri().max(500)).max(10).optional(),
    categoryId: uuidSchema.optional().allow(null),
}).min(1);
/**
 * Get posts query schema
 */
exports.getPostsQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().min(2).optional(),
    categoryId: uuidSchema.optional(),
    userId: uuidSchema.optional(),
    sortBy: joi_1.default.string().valid('createdAt', 'likes', 'comments').default('createdAt'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
/**
 * Post ID param schema
 */
exports.postIdParamSchema = joi_1.default.object({
    id: uuidSchema.required(),
});
/**
 * Post ID param schema (for nested routes)
 */
exports.postIdOnlyParamSchema = joi_1.default.object({
    postId: uuidSchema.required(),
});
