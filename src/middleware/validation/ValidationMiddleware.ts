import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../../core/errors';
import { Logger } from '../../core/logger';

/**
 * Validation source
 */
export type ValidationSource = 'body' | 'query' | 'params' | 'headers';

/**
 * Validation options
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  convert?: boolean;
}

/**
 * Validation middleware class
 */
export class ValidationMiddleware {
  constructor(private readonly logger: Logger = Logger.getInstance()) {}

  /**
   * Validate request data against Joi schema
   */
  validate(
    schema: Joi.ObjectSchema,
    source: ValidationSource = 'body',
    options: ValidationOptions = {}
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const dataToValidate = req[source];

        const validationOptions: Joi.ValidationOptions = {
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
          }, {} as Record<string, string>);

          this.logger.warn('Validation failed', { source, details });
          throw new ValidationError('Validation failed', details);
        }

        // Replace request data with validated/sanitized value
        (req as any)[source] = value;

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate body
   */
  validateBody(schema: Joi.ObjectSchema, options?: ValidationOptions) {
    return this.validate(schema, 'body', options);
  }

  /**
   * Validate query
   */
  validateQuery(schema: Joi.ObjectSchema, options?: ValidationOptions) {
    return this.validate(schema, 'query', options);
  }

  /**
   * Validate params
   */
  validateParams(schema: Joi.ObjectSchema, options?: ValidationOptions) {
    return this.validate(schema, 'params', options);
  }

  /**
   * Validate headers
   */
  validateHeaders(schema: Joi.ObjectSchema, options?: ValidationOptions) {
    return this.validate(schema, 'headers', options);
  }
}