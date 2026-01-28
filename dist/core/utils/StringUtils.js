"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
/**
 * String utility functions
 */
class StringUtils {
    /**
     * Truncate text to max length
     */
    static truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength)
            return text;
        return text.slice(0, maxLength - suffix.length).trim() + suffix;
    }
    /**
     * Generate URL-friendly slug
     */
    static slugify(text) {
        const hebrewMap = {
            'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
            'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
            'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
            'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p',
            'ף': 'p', 'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r',
            'ש': 'sh', 'ת': 't',
        };
        let slug = text.toLowerCase().trim();
        slug = slug.split('').map(char => hebrewMap[char] || char).join('');
        slug = slug
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        return slug || 'untitled';
    }
    /**
     * Sanitize search query for SQL LIKE/ILIKE
     */
    static sanitizeSearchQuery(query) {
        return query
            .replace(/\\/g, '\\\\')
            .replace(/%/g, '\\%')
            .replace(/_/g, '\\_')
            .trim();
    }
    /**
     * Remove null/undefined from object
     */
    static removeNullish(obj) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }
}
exports.StringUtils = StringUtils;
