import { TokenService, JwtPayload } from './TokenService';
import { Result, ok, err } from '../../core/result';
import { AuthError } from '../../core/errors';

/**
 * Token verifier for middleware integration
 * Implements TokenVerifier interface from AuthMiddleware
 */
export class AuthTokenVerifier {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Verify token and return authenticated user data
   */
  verify(token: string): Result<{ id: string; role: string }, AuthError> {
    const verifyResult = this.tokenService.verifyAccessToken(token);

    if (!verifyResult.ok) {
      return err(verifyResult.error);
    }

    const payload = verifyResult.value;

    if (!payload.id) {
      return err(new AuthError('Invalid token payload - missing user ID'));
    }

    return ok({
      id: payload.id,
      role: payload.role || 'USER',
    });
  }
}