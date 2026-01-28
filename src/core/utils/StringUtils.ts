/**
 * String utility functions
 */
export class StringUtils {
  /**
   * Truncate text to max length
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length).trim() + suffix;
  }

  /**
   * Generate URL-friendly slug
   */
  static slugify(text: string): string {
    const hebrewMap: Record<string, string> = {
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
  static sanitizeSearchQuery(query: string): string {
    return query
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
      .trim();
  }

  /**
   * Remove null/undefined from object
   */
  static removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  }
}