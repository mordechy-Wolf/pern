"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
/**
 * Log levels (Java-style)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class (Singleton pattern)
 */
class Logger {
    static instance;
    config;
    constructor(config) {
        this.config = {
            level: LogLevel.INFO,
            enableColors: process.env.NODE_ENV !== 'production',
            enableTimestamp: true,
            ...config,
        };
    }
    /**
     * Get singleton instance
     */
    static getInstance(config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.config.level = level;
    }
    /**
     * Debug log
     */
    debug(message, meta) {
        this.log(LogLevel.DEBUG, message, meta);
    }
    /**
     * Info log
     */
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    /**
     * Warning log
     */
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    /**
     * Error log
     */
    error(message, meta) {
        this.log(LogLevel.ERROR, message, meta);
    }
    /**
     * Internal log method
     */
    log(level, message, meta) {
        if (!this.shouldLog(level))
            return;
        const timestamp = this.config.enableTimestamp
            ? new Date().toISOString()
            : '';
        const prefix = `[${level}] ${timestamp}`;
        const metaStr = meta ? JSON.stringify(meta, null, 2) : '';
        const fullMessage = `${prefix} - ${message} ${metaStr}`.trim();
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(fullMessage);
                break;
            case LogLevel.INFO:
                console.log(fullMessage);
                break;
            case LogLevel.WARN:
                console.warn(fullMessage);
                break;
            case LogLevel.ERROR:
                console.error(fullMessage);
                break;
        }
    }
    /**
     * Check if should log at this level
     */
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
}
exports.Logger = Logger;
/**
 * Export singleton instance
 */
exports.logger = Logger.getInstance({
    level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
});
