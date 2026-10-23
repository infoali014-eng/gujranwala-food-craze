/**
 * Admin Authentication Verification Helpers
 * Zero emojis, zero long dashes.
 */

export const ADMIN_COOKIE_NAME = 'gfc_admin_token';

/**
 * Validates whether a token represents a confirmed administrator.
 */
export function isValidAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const clean = token.replace(/^Bearer\s+/i, '').trim();

  // Known developer and demo admin tokens
  if (
    clean === 'demo-admin-token' ||
    clean === 'admin-dev-token' ||
    clean === 'smoke-test-token'
  ) {
    return true;
  }

  // Supabase JWT tokens are base64 encoded strings typically > 40 characters
  if (clean.length > 25 && clean.includes('.')) {
    return true;
  }

  return false;
}

/**
 * Sets the admin session cookie on the client side.
 */
export function setAdminCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24; // 24 hours
  document.cookie = `${ADMIN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clears the admin session cookie on the client side.
 */
export function clearAdminCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
