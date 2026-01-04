"use client"

import { useState } from "react"
import { PeriodSelector, PeriodSelection } from "./period-selector"
import { FTETrendsSection } from "./fte-trends-section"
import { PeriodInfoCard } from "@/components/monthly-detail/period-info-card"
import { ProjectsSection } from "@/components/monthly-detail/projects-section"
import { PersonnelSection } from "@/components/monthly-detail/personnel-section"
import { ActivitiesSection } from "@/components/monthly-detail/activities-section"
import { UnpairedSection } from "@/components/monthly-detail/unpaired-section"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface DataRange {
  startDate: string | null
  endDate: string | null
}

interface OverviewViewProps {
  dataRange: DataRange
}

export function OverviewView({ dataRange }: OverviewViewProps) {
  const today = new Date()

  // Initialize with latest available period (endDate), otherwise use current month
  const getInitialPeriod = (): PeriodSelection => {
    if (dataRange?.endDate) {
      const endYear = parseInt(dataRange.endDate.split('-')[0])
      const endMonth = parseInt(dataRange.endDate.split('-')[1])
      const lastDay = new Date(endYear, endMonth, 0).getDate()

      return {
        type: "month",
        dateFrom: `${endYear}-${String(endMonth).padStart(2, '0')}-01`,
        dateTo: `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        label: `${MONTH_NAMES[endMonth - 1]} ${endYear}`
      }
    }

    // Fallback to current month
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    return {
      type: "month",
      dateFrom: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      dateTo: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`,
      label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`
    }
  }

  const [period, setPeriod] = useState<PeriodSelection>(getInitialPeriod())

  // Extract year and month for PeriodInfoCard (only used when period type is "month")
  const year = parseInt(period.dateFrom.split('-')[0])
  const month = parseInt(period.dateFrom.split('-')[1])

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <PeriodSelector onPeriodChange={setPeriod} dataRange={dataRange} />

      {/* Currently Viewing */}
      <div className="text-sm text-muted-foreground">
        Viewing: <span className="font-medium text-foreground">{period.label}</span>
      </div>

      {/* Period Info (for month only) */}
      {period.type === "month" && (
        <PeriodInfoCard year={year} month={month} />
      )}

      {/* FTE Trends Section */}
      <FTETrendsSection
        dateFrom={period.dateFrom}
        dateTo={period.dateTo}
        periodType={period.type}
      />

      {/* Projects Section */}
      <ProjectsSection dateFrom={period.dateFrom} dateTo={period.dateTo} />

      {/* Personnel Section */}
      <PersonnelSection dateFrom={period.dateFrom} dateTo={period.dateTo} />

      {/* Activities Section */}
      <ActivitiesSection dateFrom={period.dateFrom} dateTo={period.dateTo} />

      {/* Unpaired Section */}
      <UnpairedSection dateFrom={period.dateFrom} dateTo={period.dateTo} />
    </div>
  )
}
