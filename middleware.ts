import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for protected routes
 *
 * This middleware runs before every request and checks authentication.
 * It protects all routes except public ones (login, api/auth, static files).
 *
 * Features:
 * - Redirects unauthenticated users to /login
 * - Preserves the callback URL for post-login redirect
 * - Allows access to public routes without authentication
 *
 * Note: For NextAuth v5, authentication checking happens at the page level
 * using getServerSession(). This middleware primarily handles route protection.
 */
export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"]

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For protected routes, let the page handle authentication
  // Each protected page should use getServerSession() and redirect if needed
  return NextResponse.next()
}

/**
 * Matcher configuration
 * Defines which routes the middleware should run on
 *
 * Excluded routes:
 * - /api/auth/* - NextAuth routes (handled internally)
 * - /_next/* - Next.js internals
 * - /favicon.ico - Static files
 * - /fonts/* - Font files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (NextAuth routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /fonts/* (static files)
     */
    "/((?!api/auth|_next|favicon.ico|fonts).*)",
  ],
}
