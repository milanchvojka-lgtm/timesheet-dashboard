"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Upload, TrendingUp, CheckCircle, Settings, HelpCircle } from "lucide-react"

const navItems = [
  {
    title: "Overview",
    href: "/overview",
    icon: TrendingUp,
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Review Buddy",
    href: "/review-buddy",
    icon: CheckCircle,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

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
