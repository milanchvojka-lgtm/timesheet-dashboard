import { redirect } from 'next/navigation'
import { requireTeamMember } from '@/lib/auth-utils'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.Node
}) {
  const session = await requireTeamMember()

  if (!session) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members, FTE planning, and activity keywords
          </p>
        </div>
      </div>

      <AdminNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
