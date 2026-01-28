"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const errors_1 = require("../../core/errors");
const logger_1 = require("../../core/logger");
/**
 * Validation middleware class
 */
class ValidationMiddleware {
    logger;
    constructor(logger = logger_1.Logger.getInstance()) {
        this.logger = logger;
    }
    /**
     * Validate request data against Joi schema
     */
    validate(schema, source = 'body', options = {}) {
        return (req, res, next) => {
            try {
                const dataToValidate = req[source];
                const validationOptions = {
                    abortEarly: options.abortEarly ?? false,
                    stripUnknown: options.stripUnknown ?? true,
                    convert: options.convert ?? true,
                };
                const { error, value } = schema.validate(dataToValidate, validationOptions);
                if (error) {
                    const details = error.details.reduce((acc, detail) => {
                        const key = detail.path.join('.');
                        acc[key] = detail.message;
                        return acc;
                    }, {});
                    this.logger.warn('Validation failed', { source, details });
                    throw new errors_1.ValidationError('Validation failed', details);
                }
                // Replace request data with validated/sanitized value
                req[source] = value;
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Validate body
     */
    validateBody(schema, options) {
        return this.validate(schema, 'body', options);
    }
    /**
     * Validate query
     */
    validateQuery(schema, options) {
        return this.validate(schema, 'query', options);
    }
    /**
     * Validate params
     */
    validateParams(schema, options) {
        return this.validate(schema, 'params', options);
    }
    /**
     * Validate headers
     */
    validateHeaders(schema, options) {
        return this.validate(schema, 'headers', options);
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
