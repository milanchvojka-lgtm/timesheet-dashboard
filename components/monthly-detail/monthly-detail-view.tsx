"use client"

import { useState } from "react"
import { MonthSelector } from "./month-selector"
import { PeriodInfoCard } from "./period-info-card"
import { ProjectsSection } from "./projects-section"
import { PersonnelSection } from "./personnel-section"
import { ActivitiesSection } from "./activities-section"
import { UnpairedSection } from "./unpaired-section"

export function MonthlyDetailView() {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)

  // Calculate date range for selected month
  const dateFrom = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
  const dateTo = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <MonthSelector
        year={selectedYear}
        month={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Period Info */}
      <PeriodInfoCard year={selectedYear} month={selectedMonth} />

      {/* Projects Section */}
      <ProjectsSection dateFrom={dateFrom} dateTo={dateTo} />

      {/* Personnel Section */}
      <PersonnelSection dateFrom={dateFrom} dateTo={dateTo} />

      {/* Activities Section */}
      <ActivitiesSection dateFrom={dateFrom} dateTo={dateTo} />

      {/* Unpaired Items Section */}
      <UnpairedSection dateFrom={dateFrom} dateTo={dateTo} />
    </div>
  )
}
