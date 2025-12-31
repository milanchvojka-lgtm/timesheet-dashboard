"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeriodSelector, PeriodPreset, getPeriodDateRange } from "./period-selector"
import { OverviewTab } from "./overview-tab"
import { ProjectsTab } from "./projects-tab"
import { ActivitiesTab } from "./activities-tab"
import { TeamTab } from "./team-tab"
import { NotificationBanner } from "./notification-banner"
import { BarChart3, TrendingUp, Activity, Users } from "lucide-react"

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error'
  title: string
  message: string
  actionText?: string
  actionUrl?: string
}

export function DashboardTabs() {
  const [period, setPeriod] = useState<PeriodPreset>("12m")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const dateRange = getPeriodDateRange(period)

  // Fetch notifications when period changes
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true)
      try {
        const response = await fetch(
          `/api/notifications?dateFrom=${dateRange.dateFrom}&dateTo=${dateRange.dateTo}`
        )
        const data = await response.json()

        if (response.ok && data.notifications) {
          setNotifications(data.notifications)
        } else {
          console.error('[Dashboard] Failed to fetch notifications:', data.error)
          setNotifications([])
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching notifications:', error)
        setNotifications([])
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()
  }, [dateRange.dateFrom, dateRange.dateTo])

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Viewing data from {dateRange.dateFrom} to {dateRange.dateTo}
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Notifications */}
      {!loadingNotifications && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationBanner
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              actionText={notification.actionText}
              actionUrl={notification.actionUrl}
              dismissible={true}
              onDismiss={() => handleDismissNotification(notification.id)}
            />
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsTab dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <ActivitiesTab dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTab dateFrom={dateRange.dateFrom} dateTo={dateRange.dateTo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
