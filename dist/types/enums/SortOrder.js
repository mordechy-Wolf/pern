"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.SearchType = exports.UserSortBy = exports.PostSortBy = exports.SortOrder = void 0;
exports.isValidSortOrder = isValidSortOrder;
/**
 * Sort order enum
 */
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
/**
 * Post sort by options
 */
var PostSortBy;
(function (PostSortBy) {
    PostSortBy["CREATED_AT"] = "createdAt";
    PostSortBy["LIKES"] = "likes";
    PostSortBy["COMMENTS"] = "comments";
})(PostSortBy || (exports.PostSortBy = PostSortBy = {}));
/**
 * User sort by options
 */
var UserSortBy;
(function (UserSortBy) {
    UserSortBy["CREATED_AT"] = "createdAt";
    UserSortBy["EMAIL"] = "email";
    UserSortBy["POSTS_COUNT"] = "postsCount";
})(UserSortBy || (exports.UserSortBy = UserSortBy = {}));
/**
 * Search type enum
 */
var SearchType;
(function (SearchType) {
    SearchType["ALL"] = "all";
    SearchType["POSTS"] = "posts";
    SearchType["USERS"] = "users";
    SearchType["CATEGORIES"] = "categories";
})(SearchType || (exports.SearchType = SearchType = {}));
/**
 * Notification type enum
 */
var NotificationType;
(function (NotificationType) {
    NotificationType["COMMENT"] = "COMMENT";
    NotificationType["LIKE"] = "LIKE";
    NotificationType["MENTION"] = "MENTION";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
/**
 * Check if value is valid sort order
 */
function isValidSortOrder(value) {
    return Object.values(SortOrder).includes(value);
}
