"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentParamsSchema = exports.getCommentsQuerySchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * UUID schema
 */
const uuidSchema = joi_1.default.string().uuid();
/**
 * Create comment schema
 */
exports.createCommentSchema = joi_1.default.object({
    content: joi_1.default.string().min(1).max(2000).required(),
});
/**
 * Update comment schema
 */
exports.updateCommentSchema = joi_1.default.object({
    content: joi_1.default.string().min(1).max(2000).required(),
});
/**
 * Get comments query schema
 */
exports.getCommentsQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sortBy: joi_1.default.string().valid('createdAt').default('createdAt'),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
/**
 * Comment params schema (postId + commentId)
 */
exports.commentParamsSchema = joi_1.default.object({
    postId: uuidSchema.required(),
    id: uuidSchema.required(),
});
