"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthTab } from "./month-tab"
import { QuarterTab } from "./quarter-tab"
import { YearTab } from "./year-tab"
import { RangeTab } from "./range-tab"

export type PeriodType = "month" | "quarter" | "year" | "range"

export interface PeriodSelection {
  type: PeriodType
  dateFrom: string
  dateTo: string
  label: string // e.g., "January 2026", "Q1 2025", "2025", "Jan 2025 - Oct 2025"
}

export interface DataRange {
  startDate: string | null
  endDate: string | null
}

interface PeriodSelectorProps {
  onPeriodChange: (selection: PeriodSelection) => void
  dataRange: DataRange
}

export function PeriodSelector({ onPeriodChange, dataRange }: PeriodSelectorProps) {
  const [periodType, setPeriodType] = useState<PeriodType>("month")

  return (
    <div className="space-y-4">
      <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
          <TabsTrigger value="range">Custom Range</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <MonthTab onPeriodChange={onPeriodChange} dataRange={dataRange} />
        </TabsContent>

        <TabsContent value="quarter" className="mt-4">
          <QuarterTab onPeriodChange={onPeriodChange} dataRange={dataRange} />
        </TabsContent>

        <TabsContent value="year" className="mt-4">
          <YearTab onPeriodChange={onPeriodChange} dataRange={dataRange} />
        </TabsContent>

        <TabsContent value="range" className="mt-4">
          <RangeTab onPeriodChange={onPeriodChange} dataRange={dataRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
