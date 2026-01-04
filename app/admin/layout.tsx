import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AdminNav } from '@/components/admin/admin-nav'

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

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header */}
      <DashboardHeader user={session.user} />

      {/* Main Navigation */}
      <DashboardNav />

      {/* Admin Sub-Navigation */}
      <AdminNav />

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
