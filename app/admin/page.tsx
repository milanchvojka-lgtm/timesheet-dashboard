import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, Tag, Settings, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const features = [
  {
    title: 'Team Members',
    description: 'Add or remove team members and manage access permissions',
    icon: Users,
    href: '/admin/team-members',
    color: 'text-blue-600',
  },
  {
    title: 'Planned FTE',
    description: 'Set planned FTE values for team members to track performance',
    icon: Target,
    href: '/admin/planned-fte',
    color: 'text-green-600',
  },
  {
    title: 'Activity Keywords',
    description: 'Manage keywords for categorizing timesheet activities',
    icon: Tag,
    href: '/admin/keywords',
    color: 'text-purple-600',
  },
  {
    title: 'Settings',
    description: 'Configure default period and data range settings',
    icon: Settings,
    href: '/admin/settings',
    color: 'text-orange-600',
  },
  {
    title: 'Audit Log',
    description: 'View history of all admin actions and changes',
    icon: FileText,
    href: '/admin/audit-log',
    color: 'text-gray-600',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome to Admin Panel</h2>
        <p className="text-muted-foreground mt-1">
          Manage your team, configure settings, and monitor activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href}>
                  <Button variant="outline" className="w-full">
                    Manage
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
