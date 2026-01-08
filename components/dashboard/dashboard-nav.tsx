"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Upload, TrendingUp, CheckCircle, Settings, HelpCircle, Users } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
  requiresTeamMember?: boolean
}

const allNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/overview",
    icon: TrendingUp,
    requiresTeamMember: false, // Viewers can access
  },
  {
    title: "Team Members",
    href: "/team-members",
    icon: Users,
    requiresTeamMember: false, // Viewers can access
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
    requiresTeamMember: true, // Team members only
  },
  {
    title: "Timesheet Review Buddy",
    href: "/review-buddy",
    icon: CheckCircle,
    requiresTeamMember: true, // Team members only
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    requiresTeamMember: true, // Team members only
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
    requiresTeamMember: false, // Everyone can access
  },
]

interface DashboardNavProps {
  isTeamMember?: boolean
}

export function DashboardNav({ isTeamMember = false }: DashboardNavProps) {
  const pathname = usePathname()

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => {
    if (item.requiresTeamMember && !isTeamMember) {
      return false // Hide team member-only items from viewers
    }
    return true
  })

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            // For Admin, check if pathname starts with /admin
            // For others, check exact match
            const isActive = item.href === '/admin'
              ? pathname.startsWith('/admin')
              : pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
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
