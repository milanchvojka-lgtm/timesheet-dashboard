"use client"

import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PeriodSelection, DataRange } from "./period-selector"

const ALL_QUARTERS = [
  { value: 1, label: "Q1", months: "Jan - Mar", startMonth: 1, endMonth: 3 },
  { value: 2, label: "Q2", months: "Apr - Jun", startMonth: 4, endMonth: 6 },
  { value: 3, label: "Q3", months: "Jul - Sep", startMonth: 7, endMonth: 9 },
  { value: 4, label: "Q4", months: "Oct - Dec", startMonth: 10, endMonth: 12 },
]

interface QuarterTabProps {
  onPeriodChange: (selection: PeriodSelection) => void
  dataRange: DataRange
}

export function QuarterTab({ onPeriodChange, dataRange }: QuarterTabProps) {
  const today = new Date()
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1
  const currentYear = today.getFullYear()

  // Initialize with latest available period (endDate), otherwise use current date
  const getInitialYear = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[0])
    }
    return currentYear
  }

  const getInitialQuarter = () => {
    if (dataRange?.endDate) {
      const endMonth = parseInt(dataRange.endDate.split('-')[1])
      return Math.floor((endMonth - 1) / 3) + 1
    }
    return currentQuarter
  }

  const [quarter, setQuarter] = useState(getInitialQuarter())
  const [year, setYear] = useState(getInitialYear())

  // Calculate available years based on data range
  const availableYears = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      // No data range set, use default range
      return Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const endYear = parseInt(dataRange.endDate.split('-')[0])

    const years: number[] = []
    for (let y = startYear; y <= endYear; y++) {
      years.push(y)
    }
    return years
  }, [dataRange, currentYear])

  // Calculate available quarters based on data range and selected year
  const availableQuarters = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      // No data range set, show all quarters
      return ALL_QUARTERS
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const startMonth = parseInt(dataRange.startDate.split('-')[1])
    const endYear = parseInt(dataRange.endDate.split('-')[0])
    const endMonth = parseInt(dataRange.endDate.split('-')[1])

    return ALL_QUARTERS.filter((q) => {
      // If current year is before start year or after end year, no quarters available
      if (year < startYear || year > endYear) return false

      // If current year is the start year, check if quarter overlaps with start month
      if (year === startYear && q.endMonth < startMonth) return false

      // If current year is the end year, check if quarter overlaps with end month
      if (year === endYear && q.startMonth > endMonth) return false

      return true
    })
  }, [dataRange, year])

  useEffect(() => {
    // Calculate quarter date range
    const startMonth = (quarter - 1) * 3 + 1
    const endMonth = quarter * 3

    const dateFrom = `${year}-${String(startMonth).padStart(2, '0')}-01`
    const lastDay = new Date(year, endMonth, 0).getDate()
    const dateTo = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const label = `Q${quarter} ${year}`

    onPeriodChange({
      type: "quarter",
      dateFrom,
      dateTo,
      label
    })
  }, [quarter, year, onPeriodChange])

  return (
    <div className="py-2 flex items-center gap-3">
      <Select value={String(quarter)} onValueChange={(v) => setQuarter(Number(v))}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select quarter" />
        </SelectTrigger>
        <SelectContent>
          {availableQuarters.map((q) => (
            <SelectItem key={q.value} value={String(q.value)}>
              {q.label} ({q.months})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
