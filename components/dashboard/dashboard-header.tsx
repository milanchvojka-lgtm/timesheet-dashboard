"use client"

import Link from "next/link"
import { UserMenu } from "./user-menu"
import { ThemeToggle } from "./theme-toggle"
import { BarChart3 } from "lucide-react"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Timesheet Analytics</span>
            <span className="text-xs text-muted-foreground">2FRESH Design Team</span>
          </div>
        </Link>

        {/* Right Side: Theme Toggle + User Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
