/**
 * Result type for error handling (Go-style)
 * Replaces throw/catch with explicit error handling
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T; readonly error?: never }
  | { readonly ok: false; readonly error: E; readonly value?: never };

/**
 * Create successful result
 */
export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Create error result
 */
export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Type guard for success
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok === true;
};

/**
 * Type guard for error
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return result.ok === false;
};

/**
 * Unwrap result or throw
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) return result.value;
  throw result.error;
};

/**
 * Unwrap result or return default
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.ok ? result.value : defaultValue;
};

/**
 * Map result value
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  return result.ok ? ok(fn(result.value)) : err(result.error);
};

/**
 * Chain async operations
 */
export const andThen = async <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> => {
  return result.ok ? await fn(result.value) : err(result.error);
};