"use client"

import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { PeriodSelection, DataRange } from "./period-selector"

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

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

interface RangeTabProps {
  onPeriodChange: (selection: PeriodSelection) => void
  dataRange: DataRange
}

export function RangeTab({ onPeriodChange, dataRange }: RangeTabProps) {
  const today = new Date()

  // Initialize with data range if available, otherwise use current date
  const getInitialFromYear = () => {
    // Calculate 6 months back from the end date
    if (dataRange?.endDate) {
      const endYear = parseInt(dataRange.endDate.split('-')[0])
      const endMonth = parseInt(dataRange.endDate.split('-')[1])

      // Calculate 6 months back (subtract 5 to get start of 6-month period)
      let fromMonth = endMonth - 5
      let fromYear = endYear

      if (fromMonth < 1) {
        fromMonth += 12
        fromYear -= 1
      }

      // Check if this is within the data range start
      if (dataRange.startDate) {
        const startYear = parseInt(dataRange.startDate.split('-')[0])
        const startMonth = parseInt(dataRange.startDate.split('-')[1])

        // If calculated from date is before start date, use start date year
        if (fromYear < startYear || (fromYear === startYear && fromMonth < startMonth)) {
          return startYear
        }
      }

      return fromYear
    }
    return today.getFullYear()
  }

  const getInitialFromMonth = () => {
    // Calculate 6 months back from the end date
    if (dataRange?.endDate) {
      const endYear = parseInt(dataRange.endDate.split('-')[0])
      const endMonth = parseInt(dataRange.endDate.split('-')[1])

      // Calculate 6 months back (subtract 5 to get start of 6-month period)
      let fromMonth = endMonth - 5
      let fromYear = endYear

      if (fromMonth < 1) {
        fromMonth += 12
        fromYear -= 1
      }

      // Check if this is within the data range start
      if (dataRange.startDate) {
        const startYear = parseInt(dataRange.startDate.split('-')[0])
        const startMonth = parseInt(dataRange.startDate.split('-')[1])

        // If calculated from date is before start date, use start date
        if (fromYear < startYear || (fromYear === startYear && fromMonth < startMonth)) {
          return startMonth
        }
      }

      return fromMonth
    }
    return 1
  }

  const getInitialToYear = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[0])
    }
    return today.getFullYear()
  }

  const getInitialToMonth = () => {
    if (dataRange?.endDate) {
      return parseInt(dataRange.endDate.split('-')[1])
    }
    return 12 // Default to December
  }

  const [fromMonth, setFromMonth] = useState(getInitialFromMonth())
  const [fromYear, setFromYear] = useState(getInitialFromYear())
  const [toMonth, setToMonth] = useState(getInitialToMonth())
  const [toYear, setToYear] = useState(getInitialToYear())

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

  // Calculate available months for "From" selector
  const availableFromMonths = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      return ALL_MONTHS
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const startMonth = parseInt(dataRange.startDate.split('-')[1])
    const endYear = parseInt(dataRange.endDate.split('-')[0])
    const endMonth = parseInt(dataRange.endDate.split('-')[1])

    return ALL_MONTHS.filter((m) => {
      // If fromYear is before start year or after end year, no months available
      if (fromYear < startYear || fromYear > endYear) return false

      // If fromYear is the start year, filter months >= startMonth
      if (fromYear === startYear && m.value < startMonth) return false

      // If fromYear is the end year, filter months <= endMonth
      if (fromYear === endYear && m.value > endMonth) return false

      return true
    })
  }, [dataRange, fromYear])

  // Calculate available months for "To" selector
  const availableToMonths = useMemo(() => {
    if (!dataRange?.startDate || !dataRange?.endDate) {
      return ALL_MONTHS
    }

    const startYear = parseInt(dataRange.startDate.split('-')[0])
    const startMonth = parseInt(dataRange.startDate.split('-')[1])
    const endYear = parseInt(dataRange.endDate.split('-')[0])
    const endMonth = parseInt(dataRange.endDate.split('-')[1])

    return ALL_MONTHS.filter((m) => {
      // If toYear is before start year or after end year, no months available
      if (toYear < startYear || toYear > endYear) return false

      // If toYear is the start year, filter months >= startMonth
      if (toYear === startYear && m.value < startMonth) return false

      // If toYear is the end year, filter months <= endMonth
      if (toYear === endYear && m.value > endMonth) return false

      // If same year as fromYear, ensure toMonth >= fromMonth
      if (toYear === fromYear && m.value < fromMonth) return false

      return true
    })
  }, [dataRange, toYear, fromYear, fromMonth])

  useEffect(() => {
    // Validate: "To" must be after "From"
    const fromDate = new Date(fromYear, fromMonth - 1)
    const toDate = new Date(toYear, toMonth - 1)

    if (toDate < fromDate) {
      // Auto-adjust to make valid
      setToMonth(fromMonth)
      setToYear(fromYear)
      return
    }

    // Calculate date range
    const dateFrom = `${fromYear}-${String(fromMonth).padStart(2, '0')}-01`
    const lastDay = new Date(toYear, toMonth, 0).getDate()
    const dateTo = `${toYear}-${String(toMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const label = `${MONTH_NAMES_SHORT[fromMonth - 1]} ${fromYear} - ${MONTH_NAMES_SHORT[toMonth - 1]} ${toYear}`

    onPeriodChange({
      type: "range",
      dateFrom,
      dateTo,
      label
    })
  }, [fromMonth, fromYear, toMonth, toYear, onPeriodChange])

  // Calculate month count
  const monthCount = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1

  return (
    <div className="py-2 space-y-4">
      {/* From Date */}
      <div className="flex items-center gap-3">
        <label className="w-16 text-sm font-medium">From:</label>
        <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableFromMonths.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
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

      {/* To Date */}
      <div className="flex items-center gap-3">
        <label className="w-16 text-sm font-medium">To:</label>
        <Select value={String(toMonth)} onValueChange={(v) => setToMonth(Number(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableToMonths.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
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

      {/* Summary */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {monthCount} {monthCount === 1 ? 'month' : 'months'} selected
      </div>
    </div>
  )
}
