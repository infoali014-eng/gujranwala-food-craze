import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPathPublic } from '@/lib/publicRoutes';
import { isValidAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

/**
 * Access Enforcement Middleware
 * Ensures normal visitors can only access public routes.
 * Home page and all other non-public routes are restricted to verified administrators.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Pass through internal Next.js assets, public images, icons, and fonts
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png' ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Allow publicly allowed pages (e.g. /craze-wall, /admin/login)
  if (isPathPublic(pathname)) {
    return NextResponse.next();
  }

  // 3. Allow admin portal routes (they enforce authentication in their respective pages)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 4. Restricted pages (e.g. '/' and unfinished pages):
  // Check for verified administrator session cookie
  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (isValidAdminToken(adminToken)) {
    const response = NextResponse.next();
    response.headers.set('x-admin-preview', 'true');
    return response;
  }

  // Allow request to proceed to the page handler where notFound() throws a genuine 404
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
