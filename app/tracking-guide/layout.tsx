// app/tracking-guide/layout.tsx
import { redirect } from "next/navigation"
import { getServerSession, checkTeamMember } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function TrackingGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login?callbackUrl=/tracking-guide")
  }
  const isTeamMember = await checkTeamMember(session.user.email)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} isTeamMember={isTeamMember} />
      <DashboardNav isTeamMember={isTeamMember} />
      <main>{children}</main>
    </div>
  )
}
