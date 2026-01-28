"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHandler = void 0;
const logger_1 = require("../../../core/logger");
const errors_1 = require("../../../core/errors");
/**
 * Admin handler (controller)
 */
class AdminHandler {
    service;
    logger;
    constructor(service, logger = logger_1.Logger.getInstance()) {
        this.service = service;
        this.logger = logger;
    }
    /**
     * Grant admin privileges
     */
    grantAdmin = async (req, res, next) => {
        try {
            const grantedBy = req.user?.id;
            if (!grantedBy) {
                return next(new errors_1.AuthError('Authentication required'));
            }
            const result = await this.service.grantAdmin(req.body, grantedBy);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                ...result.value,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Revoke admin privileges
     */
    revokeAdmin = async (req, res, next) => {
        try {
            const result = await this.service.revokeAdmin(req.body);
            if (!result.ok) {
                return next(result.error);
            }
            res.status(200).json({
                success: true,
                ...result.value,
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get all admins
     */
    getAdmins = async (req, res, next) => {
        try {
            const result = await this.service.getAdmins();
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
}
exports.AdminHandler = AdminHandler;
