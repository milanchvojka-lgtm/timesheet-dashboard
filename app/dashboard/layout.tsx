import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

/**
 * Dashboard Layout
 *
 * This layout wraps all dashboard pages and enforces authentication.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * Includes:
 * - Header with logo and user menu
 * - Navigation tabs (Dashboard, Projects, Activities, Team, Upload)
 * - Main content area
 *
 * All pages under /dashboard/* will automatically be protected.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <DashboardNav />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
