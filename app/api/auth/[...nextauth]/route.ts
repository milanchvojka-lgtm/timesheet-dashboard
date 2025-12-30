import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth.js API Route Handler
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
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
