"use server"

import { signOut } from "@/lib/auth"

/**
 * Server action to sign out the current user
 * Uses NextAuth v5's signOut function with proper CSRF handling
 */
export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}
