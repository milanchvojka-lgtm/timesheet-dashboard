import { redirect } from "next/navigation"
import { getServerSession, checkTeamMember } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

/**
 * Help Layout
 *
 * This layout wraps the help page and enforces authentication.
 * Shares the same header and navigation as other dashboard pages.
 */
export default async function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/help")
  }

  // Check if user is a team member
  const isTeamMember = await checkTeamMember(session.user.email)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} isTeamMember={isTeamMember} />
      <DashboardNav isTeamMember={isTeamMember} />
      <main>
        {children}
      </main>
    </div>
  )
}
