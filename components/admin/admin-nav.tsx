'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, Target, Tag, Settings, FileText } from 'lucide-react'

const navItems = [
  {
    title: 'Team Members',
    href: '/admin/team-members',
    icon: Users,
  },
  {
    title: 'Planned FTE',
    href: '/admin/planned-fte',
    icon: Target,
  },
  {
    title: 'Activity Keywords',
    href: '/admin/keywords',
    icon: Tag,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Audit Log',
    href: '/admin/audit-log',
    icon: FileText,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
