import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"

/**
 * Dashboard Layout
 *
 * This layout wraps all dashboard pages and enforces authentication.
 * If the user is not authenticated, they are redirected to the login page.
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

  return <>{children}</>
}
