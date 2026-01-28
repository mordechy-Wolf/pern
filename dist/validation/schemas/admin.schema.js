"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminsQuerySchema = exports.revokeAdminSchema = exports.grantAdminSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * UUID schema
 */
const uuidSchema = joi_1.default.string().uuid();
/**
 * Grant admin schema
 */
exports.grantAdminSchema = joi_1.default.object({
    userId: uuidSchema.required(),
    adminLevel: joi_1.default.string().valid('ADMIN', 'SUPER_ADMIN').required(),
    notes: joi_1.default.string().max(500).optional(),
});
/**
 * Revoke admin schema
 */
exports.revokeAdminSchema = joi_1.default.object({
    userId: uuidSchema.required(),
});
/**
 * Get admins query schema
 */
exports.getAdminsQuerySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    adminLevel: joi_1.default.string().valid('ADMIN', 'SUPER_ADMIN').optional(),
});
