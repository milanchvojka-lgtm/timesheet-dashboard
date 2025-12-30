import { handlers } from "@/lib/auth"

/**
 * NextAuth.js v5 API Route Handler
 *
 * This handles all authentication endpoints:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out
 * - /api/auth/callback/google - OAuth callback
 * - /api/auth/session - Get current session
 * - /api/auth/csrf - CSRF token
 *
 * All routes are automatically created by NextAuth.js
 */
export const { GET, POST } = handlers
