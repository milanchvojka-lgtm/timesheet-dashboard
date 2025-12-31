"use client"

import { useEffect, useState } from "react"
import { MetricTile } from "./metric-tile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewMetrics {
  totalEntries: number
  totalHours: number
  totalFTE: number
  averageFTE: number
  highestFTE: number
  lowestFTE: number
  peopleCount: number
}

interface TrendData {
  month: string
  totalFTE: number
  averageFTE: number
  totalHours: number
  peopleCount: number
}

interface OverviewData {
  metrics: OverviewMetrics
  trends: TrendData[]
  period: {
    dateFrom: string
    dateTo: string
    workingHours: number
  }
}

interface OverviewTabProps {
  dateFrom: string
  dateTo: string
}

export function OverviewTab({ dateFrom, dateTo }: OverviewTabProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/overview?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch overview data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Overview fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFrom, dateTo])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error: {error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const { metrics, trends } = data

  return (
    <div className="space-y-6">
      {/* Metric Tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          title="Total Entries"
          value={metrics.totalEntries.toLocaleString()}
          subtitle={`${metrics.totalHours.toFixed(0)} hours tracked`}
          variant="default"
        />
        <MetricTile
          title="Average FTE"
          value={metrics.averageFTE.toFixed(2)}
          subtitle={`${metrics.peopleCount} team members`}
          variant="ops"
        />
        <MetricTile
          title="Highest FTE"
          value={metrics.highestFTE.toFixed(2)}
          subtitle="Best performer"
          variant="internal"
        />
        <MetricTile
          title="Lowest FTE"
          value={metrics.lowestFTE.toFixed(2)}
          subtitle="Needs attention"
          variant="rnd"
        />
      </div>

      {/* FTE Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>FTE Trends Over Time</CardTitle>
          <CardDescription>
            Monthly FTE evolution for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tickFormatter={(value) => {
                  const [year, month] = value.split('-')
                  return `${month}/${year.slice(2)}`
                }}
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelFormatter={(value) => `Month: ${value}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalFTE"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total FTE"
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="averageFTE"
                stroke="#10b981"
                strokeWidth={2}
                name="Average FTE"
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
