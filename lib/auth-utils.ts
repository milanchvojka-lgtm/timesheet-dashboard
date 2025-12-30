import { auth } from "@/lib/auth"

/**
 * Get the current user session (server-side only)
 *
 * Use this in Server Components, API Routes, and Server Actions
 * to get the authenticated user's session.
 *
 * @returns Session object or null if not authenticated
 *
 * @example
 * ```typescript
 * const session = await getServerSession()
 * if (!session) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Check if a user is a design team member
 *
 * Team members have is_team_member = true in the users table.
 * This is used to restrict access to admin features and team-specific data.
 *
 * @param email - User email to check
 * @returns true if user is a team member, false otherwise
 *
 * @example
 * ```typescript
 * const session = await getServerSession()
 * const isTeamMember = await checkTeamMember(session.user.email)
 *
 * if (!isTeamMember) {
 *   return <Unauthorized />
 * }
 * ```
 */
export async function checkTeamMember(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false

  try {
    const { createServerAdminClient } = await import("@/lib/supabase/server")
    const supabase = createServerAdminClient()

    const { data, error } = await supabase
      .from("users")
      .select("is_team_member")
      .eq("email", email)
      .single()

    if (error) {
      console.error("Error checking team member status:", error)
      return false
    }

    return data?.is_team_member || false
  } catch (error) {
    console.error("Error checking team member status:", error)
    return false
  }
}

/**
 * Get the current user's data from the database
 *
 * This fetches additional user information beyond what's in the session,
 * including Costlocker person ID and team member status.
 *
 * @param email - User email
 * @returns User data or null if not found
 *
 * @example
 * ```typescript
 * const session = await getServerSession()
 * const userData = await getUserData(session.user.email)
 *
 * if (userData?.costlocker_person_id) {
 *   // Fetch timesheet data for this person
 * }
 * ```
 */
export async function getUserData(email: string | null | undefined) {
  if (!email) return null

  try {
    const { createServerAdminClient } = await import("@/lib/supabase/server")
    const supabase = createServerAdminClient()

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (error) {
      console.error("Error fetching user data:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

/**
 * Require authentication for a page or API route
 *
 * This helper function checks if the user is authenticated and
 * returns the session. If not authenticated, it returns null.
 *
 * Use with redirect to protect pages.
 *
 * @returns Session object or null
 *
 * @example
 * ```typescript
 * // In a Server Component
 * import { redirect } from 'next/navigation'
 *
 * const session = await requireAuth()
 * if (!session) {
 *   redirect('/login')
 * }
 * ```
 */
export async function requireAuth() {
  const session = await getServerSession()
  return session
}

/**
 * Require team member access
 *
 * This checks both authentication and team member status.
 * Returns the session if the user is authenticated and is a team member.
 *
 * @returns Session object or null
 *
 * @example
 * ```typescript
 * // In a Server Component for team-only pages
 * import { redirect } from 'next/navigation'
 *
 * const session = await requireTeamMember()
 * if (!session) {
 *   redirect('/unauthorized')
 * }
 * ```
 */
export async function requireTeamMember() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return null
  }

  const isTeamMember = await checkTeamMember(session.user.email)

  if (!isTeamMember) {
    return null
  }

  return session
}
