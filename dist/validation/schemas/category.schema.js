"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryQuerySchema = exports.getCategoriesQuerySchema = exports.categoryIdParamSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * UUID schema
 */
const uuidSchema = joi_1.default.string().uuid();
/**
 * Create category schema
 */
exports.createCategorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    description: joi_1.default.string().max(500).optional(),
});
/**
 * Update category schema
 */
exports.updateCategorySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).optional(),
    description: joi_1.default.string().max(500).optional(),
}).min(1);
/**
 * Category ID param schema
 */
exports.categoryIdParamSchema = joi_1.default.object({
    id: uuidSchema.required(),
});
/**
 * Get categories query schema
 */
exports.getCategoriesQuerySchema = joi_1.default.object({
    includePostCount: joi_1.default.boolean().default(false),
});
/**
 * Delete category query schema
 */
exports.deleteCategoryQuerySchema = joi_1.default.object({
    force: joi_1.default.boolean().default(false),
});
