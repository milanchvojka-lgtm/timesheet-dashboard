"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type PeriodPreset = "1m" | "3m" | "6m" | "12m" | "custom"

export interface PeriodSelectorProps {
  value?: PeriodPreset
  onChange?: (period: PeriodPreset) => void
  defaultValue?: PeriodPreset
}

const periodPresets = [
  { value: "1m", label: "Last Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "custom", label: "Custom Range" },
]

export function PeriodSelector({
  value,
  onChange,
  defaultValue = "12m",
}: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>(value || defaultValue)

  const handleChange = (newValue: string) => {
    const period = newValue as PeriodPreset
    setSelectedPeriod(period)
    onChange?.(period)
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedPeriod} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {periodPresets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Get date range for period preset
 *
 * @param period - Period preset
 * @returns Object with dateFrom and dateTo in YYYY-MM-DD format
 */
export function getPeriodDateRange(period: PeriodPreset): {
  dateFrom: string
  dateTo: string
} {
  const today = new Date()
  const dateTo = today.toISOString().split("T")[0]

  let dateFrom: string

  switch (period) {
    case "1m":
      const oneMonthAgo = new Date(today)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      dateFrom = oneMonthAgo.toISOString().split("T")[0]
      break
    case "3m":
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      dateFrom = threeMonthsAgo.toISOString().split("T")[0]
      break
    case "6m":
      const sixMonthsAgo = new Date(today)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      dateFrom = sixMonthsAgo.toISOString().split("T")[0]
      break
    case "12m":
      const twelveMonthsAgo = new Date(today)
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      dateFrom = twelveMonthsAgo.toISOString().split("T")[0]
      break
    case "custom":
      // For custom, default to last 12 months
      const customDate = new Date(today)
      customDate.setMonth(customDate.getMonth() - 12)
      dateFrom = customDate.toISOString().split("T")[0]
      break
  }

  return { dateFrom, dateTo }
}
