"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLevel = exports.UserRole = void 0;
exports.isValidUserRole = isValidUserRole;
exports.isValidAdminLevel = isValidAdminLevel;
/**
 * User role enum
 * Note: In database, users.role is always 'USER'
 * Admin privileges are managed separately in admins table
 */
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Admin level enum (for admins table)
 */
var AdminLevel;
(function (AdminLevel) {
    AdminLevel["ADMIN"] = "ADMIN";
    AdminLevel["SUPER_ADMIN"] = "SUPER_ADMIN";
})(AdminLevel || (exports.AdminLevel = AdminLevel = {}));
/**
 * Check if value is valid user role
 */
function isValidUserRole(value) {
    return Object.values(UserRole).includes(value);
}
/**
 * Check if value is valid admin level
 */
function isValidAdminLevel(value) {
    return Object.values(AdminLevel).includes(value);
}
