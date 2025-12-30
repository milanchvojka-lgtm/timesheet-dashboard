import { DefaultSession, DefaultUser } from "next-auth"

/**
 * Extend NextAuth types to include custom user properties
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isTeamMember?: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    isTeamMember?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isTeamMember?: boolean
  }
}
