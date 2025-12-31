"use client"

import { useEffect, useState } from "react"
import { MetricTile } from "./metric-tile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { ACTIVITY_COLORS } from "@/config/colors"

interface ActivitySummary {
  category: string
  hours: number
  entryCount: number
  percentage: number
}

interface ActivitiesData {
  summary: ActivitySummary[]
  qualityScore: number
  trends: Array<Record<string, number | string>>
  totalEntries: number
  period: {
    dateFrom: string
    dateTo: string
  }
}

interface ActivitiesTabProps {
  dateFrom: string
  dateTo: string
}

export function ActivitiesTab({ dateFrom, dateTo }: ActivitiesTabProps) {
  const [data, setData] = useState<ActivitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/activities?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activities data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Activities fetch error:', err)
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
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

  const { summary, qualityScore, trends } = data

  // Get color for activity category
  const getCategoryColor = (category: string) => {
    return ACTIVITY_COLORS[category as keyof typeof ACTIVITY_COLORS] || '#94a3b8'
  }

  return (
    <div className="space-y-6">
      {/* Activity Metric Tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quality Score Tile */}
        <MetricTile
          title="Quality Score"
          value={`${qualityScore}%`}
          subtitle={qualityScore >= 80 ? "Excellent" : qualityScore >= 60 ? "Good" : "Needs Improvement"}
          variant={qualityScore >= 80 ? "ops" : qualityScore >= 60 ? "rnd" : "default"}
        />

        {/* Category Tiles */}
        {summary.map((activity) => (
          <MetricTile
            key={activity.category}
            title={activity.category.replace(/_/g, ' ')}
            value={`${activity.percentage}%`}
            subtitle={`${activity.hours.toFixed(0)} hours • ${activity.entryCount} entries`}
            variant={activity.category === 'Unpaired' ? 'default' : 'ops'}
          />
        ))}
      </div>

      {/* Activity Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
          <CardDescription>
            Hours breakdown by activity category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={summary}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="category"
                className="text-xs"
                tickFormatter={(value) => value.replace(/_/g, ' ')}
              />
              <YAxis className="text-xs" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Hours']}
                labelFormatter={(label) => label.replace(/_/g, ' ')}
              />
              <Legend />
              <Bar
                dataKey="hours"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              >
                {summary.map((entry, index) => (
                  <Bar
                    key={`cell-${index}`}
                    dataKey="hours"
                    fill={getCategoryColor(entry.category)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
