/**
 * User role enum
 * Note: In database, users.role is always 'USER'
 * Admin privileges are managed separately in admins table
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Admin level enum (for admins table)
 */
export enum AdminLevel {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Check if value is valid user role
 */
export function isValidUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

/**
 * Check if value is valid admin level
 */
export function isValidAdminLevel(value: string): value is AdminLevel {
  return Object.values(AdminLevel).includes(value as AdminLevel);
}