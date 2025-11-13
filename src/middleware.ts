/**
 * Next.js Middleware
 * 
 * Handles route protection and role-based access control
 * Runs on all routes before page rendering
 * 
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes configuration
 * Maps route prefixes to required roles
 */
const PROTECTED_ROUTES = {
  '/dashboard/admin': 'admin',
  '/dashboard/enumerator': 'enumerator',
  '/dashboard': null, // Any authenticated user
} as const;

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/',
] as const;

/**
 * Check if route matches a protected path
 */
function getProtectedRouteConfig(pathname: string): string | null | undefined {
  for (const [route, role] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return role;
    }
  }
  return undefined;
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Middleware function
 * 
 * Checks authentication and role-based access
 * Redirects unauthorized requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route requires protection
  const requiredRole = getProtectedRouteConfig(pathname);

  // Route doesn't require protection
  if (requiredRole === undefined) {
    return NextResponse.next();
  }

  // Get session from cookie
  // Appwrite stores session in cookie named after the project
  const sessionCookie = request.cookies.get('a_session_console');

  // No session - redirect to login
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Note: We can't verify the role here without making an API call to Appwrite
  // Role-based redirect will be handled by the ProtectedRoute component on the client
  // This middleware primarily ensures a session exists

  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specifies which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
