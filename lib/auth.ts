import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"

/**
 * NextAuth.js v5 Configuration
 *
 * Features:
 * - Google OAuth with @2fresh.cz domain restriction
 * - Supabase session storage via adapter
 * - Custom callbacks for user synchronization
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

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

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * Restrict sign-in to @2fresh.cz email addresses only
     */
    async signIn({ user, account, profile }) {
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

      return true
    },

    /**
     * Add user ID and team member status to session
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Check if user is a team member
        session.user.isTeamMember = await checkTeamMember(user.email)
      }
      return session
    },

    /**
     * Sync user data with our users table
     */
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },

  events: {
    /**
     * Update user's team member status when they sign in
     */
    async signIn({ user }) {
      if (user.email) {
        // Update is_team_member status in Supabase
        const isTeamMember = await checkTeamMember(user.email)

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
    const { createServerClient } = await import("@/lib/supabase/server")
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("users")
      .select("is_team_member")
      .eq("email", email)
      .single()

    if (error || !data) {
      return false
    }

    return data.is_team_member || false
  } catch (error) {
    console.error("Error checking team member status:", error)
    return false
  }
}
