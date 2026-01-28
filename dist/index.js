"use strict";
/**
 * Main entry point - Barrel export
 *
 * This file exports all public APIs from the application
 * Use this for importing when using the app as a library
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
// Core
__exportStar(require("./core"), exports);
// Database
__exportStar(require("./database"), exports);
// Middleware
__exportStar(require("./middleware"), exports);
// Types
__exportStar(require("./types"), exports);
// Validation
__exportStar(require("./validation"), exports);
// Config
__exportStar(require("./config"), exports);
// Lib
__exportStar(require("./lib"), exports);
// Modules
__exportStar(require("./modules"), exports);
// App
var app_1 = require("./app");
Object.defineProperty(exports, "createApp", { enumerable: true, get: function () { return app_1.createApp; } });
