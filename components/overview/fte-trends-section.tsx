"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Users, Clock, Briefcase } from "lucide-react"
import { PeriodType } from "./period-selector"

interface FTETrendsData {
  metrics: {
    plannedFTE: number
    totalFTE: number
    averageFTE: number
    teamSize: number
    totalHours: number
  }
  trends: Array<{
    month: string
    totalFTE: number
    averageFTE: number
    teamSize: number
  }>
}

interface FTETrendsSectionProps {
  dateFrom: string
  dateTo: string
  periodType: PeriodType
}

export function FTETrendsSection({ dateFrom, dateTo, periodType }: FTETrendsSectionProps) {
  const [data, setData] = useState<FTETrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/fte-trends?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch FTE trends data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('FTE trends fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFrom, dateTo])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          {periodType !== "month" && <Skeleton className="h-[300px]" />}
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            {error || 'Failed to load FTE trends data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const showChart = periodType !== "month" && data.trends && data.trends.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Team FTE Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Metric Tiles */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Planned FTE</span>
            </div>
            <p className="text-2xl font-bold">{data.metrics.plannedFTE.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Average FTE</span>
            </div>
            <p className="text-2xl font-bold">{data.metrics.averageFTE.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Team Size</span>
            </div>
            <p className="text-2xl font-bold">{data.metrics.teamSize}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Total Hours</span>
            </div>
            <p className="text-2xl font-bold">{data.metrics.totalHours.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart (only for quarter/year/range) */}
        {showChart && (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  label={{ value: 'FTE', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  label={{ value: 'Team Size', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalFTE"
                  stroke="#3b82f6"
                  name="Total FTE"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="teamSize"
                  stroke="#10b981"
                  name="Team Size"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
