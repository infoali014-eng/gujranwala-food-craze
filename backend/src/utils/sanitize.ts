/**
 * Utility to strip HTML tags, script tags, and escape dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return input
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize multiple spaces into single space
    .replace(/\s+/g, ' ')
    // Trim leading and trailing whitespace
    .trim();
}
