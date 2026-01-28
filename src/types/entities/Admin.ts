import { AdminLevel } from '../enums/UserRole';

/**
 * Admin entity (database table: admins)
 */
export interface AdminEntity {
  id: string;
  userId: string;
  adminLevel: AdminLevel;
  grantedBy: string | null;
  grantedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin with user details
 */
export interface AdminWithUser {
  id: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  adminLevel: AdminLevel;
  grantedBy: string | null;
  grantedByEmail: string | null;
  grantedByFirstName: string | null;
  grantedByLastName: string | null;
  grantedAt: Date;
  notes: string | null;
  createdAt: Date;
}