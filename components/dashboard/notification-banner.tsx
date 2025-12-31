"use client"

import { useState } from "react"
import { X, AlertCircle, Info, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export type NotificationType = "info" | "warning" | "error" | "success"

export interface NotificationBannerProps {
  type?: NotificationType
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  actionText?: string
  actionUrl?: string
  className?: string
}

const typeConfig: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ className?: string }>
    bgClass: string
    borderClass: string
    iconClass: string
  }
> = {
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/20",
    borderClass: "border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-yellow-50 dark:bg-yellow-950/20",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    iconClass: "text-yellow-500",
  },
  error: {
    icon: AlertCircle,
    bgClass: "bg-red-50 dark:bg-red-950/20",
    borderClass: "border-red-200 dark:border-red-800",
    iconClass: "text-red-500",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-50 dark:bg-green-950/20",
    borderClass: "border-green-200 dark:border-green-800",
    iconClass: "text-green-500",
  },
}

export function NotificationBanner({
  type = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
  actionText,
  actionUrl,
  className,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const config = typeConfig[type]
  const Icon = config.icon

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconClass)} />

        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            {title && (
              <p className="font-medium text-sm text-foreground">{title}</p>
            )}
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {actionText && actionUrl && (
            <div>
              <Button variant="outline" size="sm" asChild>
                <Link href={actionUrl}>
                  {actionText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
