import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Result, ok, err } from '../../core/result';
import { AuthError } from '../../core/errors';
import { Logger } from '../../core/logger';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token service configuration
 */
export interface TokenServiceConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

/**
 * Token service for JWT operations
 */
export class TokenService {
  private readonly config: TokenServiceConfig;
  private readonly logger: Logger;

  constructor(
    config?: Partial<TokenServiceConfig>,
    logger: Logger = Logger.getInstance()
  ) {
    this.config = {
      jwtSecret: config?.jwtSecret ?? this.getJwtSecret(),
      jwtRefreshSecret: config?.jwtRefreshSecret ?? this.getJwtRefreshSecret(),
      accessTokenExpiry: config?.accessTokenExpiry ?? process.env.JWT_EXPIRES_IN ?? '15m',
      refreshTokenExpiry: config?.refreshTokenExpiry ?? process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    };
    this.logger = logger;
  }

  /**
   * Generate access token (short-lived)
   */
  signAccessToken(payload: { id: string; role: string }): Result<string, AuthError> {
    try {
      const token = jwt.sign(
        { id: payload.id, role: payload.role },
        this.config.jwtSecret as Secret,
        { expiresIn: this.config.accessTokenExpiry } as SignOptions
      );

      this.logger.debug('Access token signed', { userId: payload.id });
      return ok(token);
      
    } catch (error) {
      this.logger.error('Failed to sign access token', error);
      return err(new AuthError(
        'Failed to sign access token',
        { error: (error as Error).message }
      ));
    }
  }

  /**
   * Generate refresh token (long-lived)
   */
  signRefreshToken(payload: { id: string; role: string }): Result<string, AuthError> {
    try {
      const token = jwt.sign(
        { id: payload.id, role: payload.role },
        this.config.jwtRefreshSecret as Secret,
        { expiresIn: this.config.refreshTokenExpiry } as SignOptions
      );

      this.logger.debug('Refresh token signed', { userId: payload.id });
      return ok(token);
      
    } catch (error) {
      this.logger.error('Failed to sign refresh token', error);
      return err(new AuthError(
        'Failed to sign refresh token',
        { error: (error as Error).message }
      ));
    }
  }

  /**
   * Generate both tokens
   */
  signTokenPair(payload: { id: string; role: string }): Result<TokenPair, AuthError> {
    const accessResult = this.signAccessToken(payload);
    if (!accessResult.ok) {
      return err(accessResult.error);
    }

    const refreshResult = this.signRefreshToken(payload);
    if (!refreshResult.ok) {
      return err(refreshResult.error);
    }

    return ok({
      accessToken: accessResult.value,
      refreshToken: refreshResult.value,
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): Result<JwtPayload, AuthError> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret as Secret) as JwtPayload;

      this.logger.debug('Access token verified', { userId: decoded.id });
      return ok(decoded);
      
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn('Access token expired');
        return err(new AuthError('Token has expired', { reason: 'expired' }));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn('Invalid access token');
        return err(new AuthError('Invalid token', { reason: 'invalid' }));
      }

      this.logger.error('Token verification failed', error);
      return err(new AuthError('Token verification failed'));
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): Result<JwtPayload, AuthError> {
    try {
      const decoded = jwt.verify(token, this.config.jwtRefreshSecret as Secret) as JwtPayload;

      this.logger.debug('Refresh token verified', { userId: decoded.id });
      return ok(decoded);
      
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn('Refresh token expired');
        return err(new AuthError('Refresh token has expired', { reason: 'expired' }));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn('Invalid refresh token');
        return err(new AuthError('Invalid refresh token', { reason: 'invalid' }));
      }

      this.logger.error('Refresh token verification failed', error);
      return err(new AuthError('Refresh token verification failed'));
    }
  }

  /**
   * Decode token without verification
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      this.logger.warn('Failed to decode token', error);
      return null;
    }
  }

  /**
   * Get token expiry date
   */
  getTokenExpiry(expiresIn: string): Date {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!  match) {
      throw new Error('Invalid expiresIn format');
    }

    const [, amount, unit] = match;
    const ms = parseInt(amount) * units[unit];

    return new Date(Date.now() + ms);
  }

  /**
   * Get JWT secret (from env or generate)
   */
  private getJwtSecret(): string {
    if (process.env.JWT_SECRET) {
      return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚨 JWT_SECRET must be set in production environment!');
    }

    const generatedSecret = crypto.randomBytes(64).toString('hex');
    this.logger.warn('⚠️  JWT_SECRET not found - generated temporary secret for development');
    this.logger.warn('⚠️  Add to .env: JWT_SECRET=' + generatedSecret);

    return generatedSecret;
  }

  /**
   * Get JWT refresh secret (from env or generate)
   */
  private getJwtRefreshSecret(): string {
    if (process.env.JWT_REFRESH_SECRET) {
      return process.env.JWT_REFRESH_SECRET;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('🚨 JWT_REFRESH_SECRET must be set in production environment!');
    }

    const generatedSecret = crypto.randomBytes(64).toString('hex');
    this.logger.warn('⚠️  JWT_REFRESH_SECRET not found - generated temporary secret');

    return generatedSecret;
  }

  /**
   * Extract token from Authorization header
   */
  extractBearerToken(authHeader: string | undefined): Result<string, AuthError> {
    if (!authHeader) {
      return err(new AuthError('No authorization header provided'));
    }

    if (!authHeader.startsWith('Bearer ')) {
      return err(new AuthError('Invalid authorization header format'));
    }

    const token = authHeader.substring(7);

    if (!token) {
      return err(new AuthError('No token provided'));
    }

    return ok(token);
  }
}