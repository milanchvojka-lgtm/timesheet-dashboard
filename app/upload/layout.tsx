import { redirect } from "next/navigation"
import { getServerSession, checkTeamMember } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

/**
 * Upload Layout
 *
 * This layout wraps the upload page and enforces authentication.
 * Only team members can access this page - viewers are redirected to overview.
 */
export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/upload")
  }

  // Check if user is a team member
  const isTeamMember = await checkTeamMember(session.user.email)

  // Redirect viewers to overview (team members only)
  if (!isTeamMember) {
    redirect("/overview")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} isTeamMember={isTeamMember} />
      <DashboardNav isTeamMember={isTeamMember} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
