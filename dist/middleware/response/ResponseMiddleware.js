"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMiddleware = void 0;
/**
 * Response helper middleware
 */
class ResponseMiddleware {
    /**
     * Add response helpers to res object
     */
    addHelpers = (req, res, next) => {
        /**
         * Send success response
         */
        res.success = function (data, message, statusCode = 200) {
            const response = { success: true };
            if (data !== undefined)
                response.data = data;
            if (message)
                response.message = message;
            return this.status(statusCode).json(response);
        };
        next();
    };
}
exports.ResponseMiddleware = ResponseMiddleware;
