"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeriodSelector, PeriodPreset, getPeriodDateRange } from "./period-selector"
import { OverviewTab } from "./overview-tab"
import { ProjectsTab } from "./projects-tab"
import { ActivitiesTab } from "./activities-tab"
import { TeamTab } from "./team-tab"
import { BarChart3, TrendingUp, Activity, Users } from "lucide-react"

export function DashboardTabs() {
  const [period, setPeriod] = useState<PeriodPreset>("12m")
  const dateRange = getPeriodDateRange(period)

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
