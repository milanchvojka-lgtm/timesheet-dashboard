import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createServerAdminClient } from "@/lib/supabase/server"

/**
 * NextAuth.js v5 Configuration
 *
 * Features:
 * - Google OAuth with @2fresh.cz domain restriction
 * - JWT session storage (no database adapter needed)
 * - Custom callbacks for user synchronization with Supabase
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT sessions instead of database sessions for now
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Restrict to @2fresh.cz domain
          hd: "2fresh.cz",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * Allowlist-based authentication
     * Only users explicitly added as team members can log in
     */
    async signIn({ user, profile }) {
      const email = user.email || profile?.email

      if (!email) {
        console.error("No email provided during sign-in")
        return false
      }

      // Only allow @2fresh.cz emails
      if (!email.endsWith("@2fresh.cz")) {
        console.warn(`Sign-in rejected for non-2fresh email: ${email}`)
        return false
      }

      // Check if user is in the allowlist (is_team_member = true)
      try {
        const supabase = createServerAdminClient()

        const { data } = await supabase
          .from("users")
          .select("is_team_member")
          .eq("email", email)
          .maybeSingle()

        // If user doesn't exist or is not a team member, reject login
        if (!data || !data.is_team_member) {
          console.warn(`Login rejected: ${email} is not in the team members allowlist`)
          return false
        }

        // Update user info on successful login (name, avatar)
        await supabase
          .from("users")
          .update({
            name: user.name,
            avatar_url: user.image,
          })
          .eq("email", email)

        console.log(`Login successful for team member: ${email}`)
        return true
      } catch (error) {
        console.error("Error checking user allowlist:", error)
        return false
      }
    },

    /**
     * Add user data to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },

    /**
     * Add user ID and team member status to session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string

        // Check if user is a team member
        session.user.isTeamMember = await checkTeamMember(token.email as string)
      }
      return session
    },
  },

  events: {
    /**
     * Update user's team member status when they sign in
     */
    async signIn({ user }) {
      if (user.email) {
        // Update is_team_member status in Supabase
        await checkTeamMember(user.email)

        // You can add additional logic here to update the user record
        // For example, syncing with Costlocker API to get person_id
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
})

/**
 * Check if a user is a design team member
 * A team member is someone with a record in the users table
 * with is_team_member = true
 *
 * @param email - User email to check
 * @returns true if user is a team member
 */
async function checkTeamMember(email: string | null | undefined): Promise<boolean> {
  if (!email) return false

  try {
    const { createServerAdminClient } = await import("@/lib/supabase/server")
    const supabase = createServerAdminClient()

    const { data } = await supabase
      .from("users")
      .select("is_team_member")
      .eq("email", email)
      .single()

    if (!data) {
      return false
    }

    return data.is_team_member || false
  } catch (error) {
    console.error("Error checking team member status:", error)
    return false
  }
}
