"use client"

import { useMemo } from "react"
import { Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataRange {
  startDate: string | null
  endDate: string | null
}

interface MonthSelectorProps {
  year: number
  month: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  dataRange?: DataRange
}

const ALL_MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export function MonthSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
  dataRange,
}: MonthSelectorProps) {
  // Calculate available years based on data range
  const availableYears = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      // No data range set, use default range
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const endYear = parseInt(dataRange.endDate.split('-')[0])

    const years: number[] = []
    for (let y = startYear; y <= endYear; y++) {
      years.push(y)
    }
    return years
  }, [dataRange])

  // Calculate available months based on data range and selected year
  const availableMonths = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      // No data range set, show all months
      return ALL_MONTHS
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const startMonth = parseInt(dataRange.startDate.split('-')[1])
    const endYear = parseInt(dataRange.endDate.split('-')[0])
    const endMonth = parseInt(dataRange.endDate.split('-')[1])

    return ALL_MONTHS.filter((m) => {
      // If current year is before start year or after end year, no months available
      if (year < startYear || year > endYear) return false

      // If current year is the start year, filter months >= startMonth
      if (year === startYear && m.value < startMonth) return false

      // If current year is the end year, filter months <= endMonth
      if (year === endYear && m.value > endMonth) return false

      return true
    })
  }, [dataRange, year])

  return (
    <div className="flex items-center gap-4">
      <Calendar className="h-5 w-5 text-muted-foreground" />

      <div className="flex items-center gap-2">
        <Select
          value={String(month)}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(value) => onYearChange(Number(value))}
        >
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
    </div>
  )
}
