"use client"

import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PeriodSelection, DataRange } from "./period-selector"

interface YearTabProps {
  onPeriodChange: (selection: PeriodSelection) => void
  dataRange: DataRange
}

export function YearTab({ onPeriodChange, dataRange }: YearTabProps) {
  const currentYear = new Date().getFullYear()

  // Initialize with latest available period (endDate), otherwise use current year
  const getInitialYear = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[0])
    }
    return currentYear
  }

  const [year, setYear] = useState(getInitialYear())

  // Calculate available years based on data range
  const availableYears = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      // No data range set, use default range (5 years back, 5 years forward)
      return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const endYear = parseInt(dataRange.endDate.split('-')[0])

    const years: number[] = []
    for (let y = startYear; y <= endYear; y++) {
      years.push(y)
    }
    return years
  }, [dataRange, currentYear])

  useEffect(() => {
    const dateFrom = `${year}-01-01`
    const dateTo = `${year}-12-31`
    const label = `${year}`

    onPeriodChange({
      type: "year",
      dateFrom,
      dateTo,
      label
    })
  }, [year, onPeriodChange])

  return (
    <div className="py-2">
      <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select year" />
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
