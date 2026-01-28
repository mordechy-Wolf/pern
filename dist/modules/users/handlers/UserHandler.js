"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHandler = void 0;
const logger_1 = require("../../../core/logger");
/**
 * User handler (controller)
 */
class UserHandler {
    service;
    logger;
    constructor(service, logger = logger_1.Logger.getInstance()) {
        this.service = service;
        this.logger = logger;
    }
    /**
     * Get users list
     */
    getUsers = async (req, res, next) => {
        try {
            const result = await this.service.getUsers(req.query);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json(result.value);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get user by ID
     */
    getUserById = async (req, res, next) => {
        try {
            const result = await this.service.getUserById(req.params.id);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                data: result.value,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get user's posts
     */
    getUserPosts = async (req, res, next) => {
        try {
            const result = await this.service.getUserPosts(req.params.id, req.query);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json(result.value);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Hard delete user
     */
    hardDeleteUser = async (req, res, next) => {
        try {
            const result = await this.service.hardDeleteUser(req.params.id);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserHandler = UserHandler;
