"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.andThen = exports.map = exports.unwrapOr = exports.unwrap = exports.isErr = exports.isOk = exports.err = exports.ok = void 0;
/**
 * Create successful result
 */
const ok = (value) => ({
    ok: true,
    value,
});
exports.ok = ok;
/**
 * Create error result
 */
const err = (error) => ({
    ok: false,
    error,
});
exports.err = err;
/**
 * Type guard for success
 */
const isOk = (result) => {
    return result.ok === true;
};
exports.isOk = isOk;
/**
 * Type guard for error
 */
const isErr = (result) => {
    return result.ok === false;
};
exports.isErr = isErr;
/**
 * Unwrap result or throw
 */
const unwrap = (result) => {
    if (result.ok)
        return result.value;
    throw result.error;
};
exports.unwrap = unwrap;
/**
 * Unwrap result or return default
 */
const unwrapOr = (result, defaultValue) => {
    return result.ok ? result.value : defaultValue;
};
exports.unwrapOr = unwrapOr;
/**
 * Map result value
 */
const map = (result, fn) => {
    return result.ok ? (0, exports.ok)(fn(result.value)) : (0, exports.err)(result.error);
};
exports.map = map;
/**
 * Chain async operations
 */
const andThen = async (result, fn) => {
    return result.ok ? await fn(result.value) : (0, exports.err)(result.error);
};
exports.andThen = andThen;
