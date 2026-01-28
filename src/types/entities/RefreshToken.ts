/**
 * Refresh token entity (database table: refresh_tokens)
 */
export interface RefreshTokenEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

/**
 * Active refresh token (from view)
 */
export interface ActiveRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userEmail: string;
  userRole: string;
  hoursUntilExpiry: number;
}