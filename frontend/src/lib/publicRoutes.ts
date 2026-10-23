/**
 * PUBLICLY ALLOWED ROUTES CONFIGURATION
 *
 * Normal visitors (unauthenticated or non-admin) can ONLY access the paths listed here.
 * The home page ('/') and all other pages are restricted to verified administrators.
 *
 * To open more pages to the public in the future, add a single entry to this array.
 * Example entries to unlock later:
 *   '/menu',
 *   '/deals',
 *   '/about',
 */
export const PUBLIC_ALLOWED_PATHS: readonly string[] = [
  '/craze-wall',
  '/admin/login',
  // Add new public pages below:
  // '/menu',
  // '/about',
  // '/deals',
];

/**
 * Checks if a given pathname is allowed for public visitors.
 */
export function isPathPublic(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  return PUBLIC_ALLOWED_PATHS.some((allowedPath) => {
    const cleanAllowed = allowedPath.toLowerCase().replace(/\/+$/, '');
    return normalized === cleanAllowed || normalized.startsWith(`${cleanAllowed}/`);
  });
}
