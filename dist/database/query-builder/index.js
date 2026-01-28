"use strict";
// src/database/query-builder.ts  (או index.ts)
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteQuery = exports.UpdateQuery = exports.InsertQuery = exports.QueryBuilder = exports.WhereClause = void 0;
var WhereClause_1 = require("./WhereClause");
Object.defineProperty(exports, "WhereClause", { enumerable: true, get: function () { return WhereClause_1.WhereClause; } });
var QueryBuilder_1 = require("./QueryBuilder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return QueryBuilder_1.QueryBuilder; } });
var InsertQuery_1 = require("./InsertQuery");
Object.defineProperty(exports, "InsertQuery", { enumerable: true, get: function () { return InsertQuery_1.InsertQuery; } });
var UpdateQuery_1 = require("./UpdateQuery");
Object.defineProperty(exports, "UpdateQuery", { enumerable: true, get: function () { return UpdateQuery_1.UpdateQuery; } });
var DeleteQuery_1 = require("./DeleteQuery");
Object.defineProperty(exports, "DeleteQuery", { enumerable: true, get: function () { return DeleteQuery_1.DeleteQuery; } });
