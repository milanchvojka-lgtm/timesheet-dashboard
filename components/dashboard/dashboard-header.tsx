"use client"

import Link from "next/link"
import { UserMenu } from "./user-menu"
import { ThemeToggle } from "./theme-toggle"
import { BarChart3, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  isTeamMember?: boolean
}

export function DashboardHeader({ user, isTeamMember = true }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/overview" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Timesheet Analytics</span>
            <span className="text-xs text-muted-foreground">2FRESH Design Team</span>
          </div>
        </Link>

        {/* Right Side: Viewer Badge + Theme Toggle + User Menu */}
        <div className="flex items-center gap-4">
          {!isTeamMember && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Read-Only
            </Badge>
          )}
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
