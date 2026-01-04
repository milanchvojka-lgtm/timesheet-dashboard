import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

/**
 * Overview Layout
 *
 * This layout wraps the overview page and enforces authentication.
 * Shares the same header and navigation as the dashboard pages.
 */
export default async function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession()

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?callbackUrl=/overview")
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
