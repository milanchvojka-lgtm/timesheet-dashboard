"use client"

import { useState, useEffect } from "react"
import { MonthSelector } from "@/components/monthly-detail/month-selector"
import { PeriodSelection, DataRange } from "./period-selector"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface MonthTabProps {
  onPeriodChange: (selection: PeriodSelection) => void
  dataRange: DataRange
}

export function MonthTab({ onPeriodChange, dataRange }: MonthTabProps) {
  const today = new Date()

  // Initialize with latest available period (endDate), otherwise use current date
  const getInitialYear = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[0])
    }
    return today.getFullYear()
  }

  const getInitialMonth = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[1])
    }
    return today.getMonth() + 1
  }

  const [year, setYear] = useState(getInitialYear())
  const [month, setMonth] = useState(getInitialMonth())

  useEffect(() => {
    // Calculate date range for selected month
    const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const label = `${MONTH_NAMES[month - 1]} ${year}`

    onPeriodChange({
      type: "month",
      dateFrom,
      dateTo,
      label
    })
  }, [year, month, onPeriodChange])

  return (
    <div className="py-2">
      <MonthSelector
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
        dataRange={dataRange}
      />
    </div>
  )
}
