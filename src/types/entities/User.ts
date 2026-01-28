import { UserRole } from '../enums/UserRole';

/**
 * User entity (database table: users)
 * Represents a row in the users table
 */
export interface UserEntity {
  id: string;
  email: string;
  password: string; // Hashed password
  firstName: string | null;
  lastName: string | null;
  role: UserRole; // Always 'USER' in database
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * User without sensitive data
 */
export type UserWithoutPassword = Omit<UserEntity, 'password'>;

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
}