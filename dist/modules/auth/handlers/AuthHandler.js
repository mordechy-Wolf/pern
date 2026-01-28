"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHandler = void 0;
const logger_1 = require("../../../core/logger");
/**
 * Auth handler (controller)
 */
class AuthHandler {
    service;
    logger;
    constructor(service, logger = logger_1.Logger.getInstance()) {
        this.service = service;
        this.logger = logger;
    }
    /**
     * Register new user
     */
    register = async (req, res, next) => {
        try {
            const result = await this.service.register(req.body);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(201).json({
                success: true,
                data: result.value,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Login user
     */
    login = async (req, res, next) => {
        try {
            const result = await this.service.login(req.body);
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
     * Refresh access token
     */
    refresh = async (req, res, next) => {
        try {
            const result = await this.service.refresh(req.body);
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
     * Get current user profile
     */
    getMe = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const result = await this.service.getMe(userId);
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
     * Update user profile
     */
    updateProfile = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const result = await this.service.updateProfile(userId, req.body);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                data: result.value,
                message: 'Profile updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Change password
     */
    changePassword = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const result = await this.service.changePassword(userId, req.body);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Delete account
     */
    deleteAccount = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const result = await this.service.deleteAccount(userId);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthHandler = AuthHandler;
