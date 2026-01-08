import { redirect } from 'next/navigation'
import { getServerSession, checkTeamMember } from '@/lib/auth-utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AdminNav } from '@/components/admin/admin-nav'

/**
 * Admin Layout
 *
 * This layout wraps the admin pages and enforces authentication.
 * Only team members can access this page - viewers are redirected to overview.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession()

  if (!session) {
    redirect('/login?callbackUrl=/admin')
  }

  // Check if user is a team member
  const isTeamMember = await checkTeamMember(session.user.email)

  // Redirect viewers to overview (team members only)
  if (!isTeamMember) {
    redirect('/overview')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header */}
      <DashboardHeader user={session.user} isTeamMember={isTeamMember} />

      {/* Main Navigation */}
      <DashboardNav isTeamMember={isTeamMember} />

      {/* Admin Sub-Navigation */}
      <AdminNav />

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
