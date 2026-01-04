"use client"

import { useEffect, useState } from "react"
import { MetricTile } from "./metric-tile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { PROJECT_COLORS } from "@/config/colors"

interface ProjectSummary {
  category: string
  hours: number
  entryCount: number
  fte: number
  percentage: number
}

interface ProjectsData {
  summary: ProjectSummary[]
  trends: Array<Record<string, number | string>>
  period: {
    dateFrom: string
    dateTo: string
    workingHours: number
    totalHours: number
  }
}

interface ProjectsTabProps {
  dateFrom: string
  dateTo: string
}

export function ProjectsTab({ dateFrom, dateTo }: ProjectsTabProps) {
  const [data, setData] = useState<ProjectsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/projects?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch projects data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Projects fetch error:', err)
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

  const { summary, trends } = data

  // Get variant for metric tile based on category
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'Internal': return 'internal'
      case 'OPS': return 'ops'
      case 'R&D': return 'rnd'
      case 'Guiding': return 'guiding'
      case 'PR': return 'pr'
      case 'UX Maturity': return 'ux'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Metric Tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summary.map((project) => (
          <MetricTile
            key={project.category}
            title={project.category}
            value={`${project.percentage}%`}
            subtitle={`${project.hours.toFixed(0)} hours • ${project.fte.toFixed(2)} FTE`}
            variant={getCategoryVariant(project.category) as "default" | "internal" | "ops" | "rnd" | "guiding" | "pr" | "ux"}
          />
        ))}
      </div>

      {/* Project Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Project Distribution Over Time</CardTitle>
          <CardDescription>
            Monthly FTE by project category (stacked)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trends}>
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
              {summary.map((project) => (
                <Area
                  key={project.category}
                  type="monotone"
                  dataKey={project.category}
                  stackId="1"
                  stroke={PROJECT_COLORS[project.category as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                  fill={PROJECT_COLORS[project.category as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
