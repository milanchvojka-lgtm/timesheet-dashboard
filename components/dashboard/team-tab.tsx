"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  person_name: string
  actualFTE: number
  plannedFTE: number
  deviation: number
  hours: number
  entryCount: number
}

interface TeamData {
  team: TeamMember[]
  trends: Array<Record<string, number | string>>
  totalHours: number
  period: {
    dateFrom: string
    dateTo: string
    workingHours: number
  }
}

interface TeamTabProps {
  dateFrom: string
  dateTo: string
}

const PERSON_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7'
]

export function TeamTab({ dateFrom, dateTo }: TeamTabProps) {
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/team?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch team data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Team fetch error:', err)
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
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

  const { team, trends } = data

  // Get color for deviation badge
  const getDeviationColor = (deviation: number) => {
    if (deviation >= 10) return 'default' // Over-performing
    if (deviation >= -10) return 'secondary' // On target
    return 'destructive' // Under-performing
  }

  return (
    <div className="space-y-6">
      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>
            Planned vs Actual FTE comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team.map((member) => (
              <div
                key={member.person_name}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium truncate">{member.person_name}</p>
                    {member.plannedFTE > 0 && (
                      <Badge variant={getDeviationColor(member.deviation)}>
                        {member.deviation > 0 ? '+' : ''}{member.deviation}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Actual: {member.actualFTE.toFixed(2)} FTE</span>
                    {member.plannedFTE > 0 && (
                      <span>Planned: {member.plannedFTE.toFixed(2)} FTE</span>
                    )}
                    <span>{member.hours.toFixed(0)} hours</span>
                  </div>
                  {member.plannedFTE > 0 && (
                    <Progress
                      value={(member.actualFTE / member.plannedFTE) * 100}
                      className="mt-2 h-2"
                    />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{member.actualFTE.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">FTE</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual FTE Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Individual FTE Trends</CardTitle>
          <CardDescription>
            Monthly FTE evolution by team member
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
              {team.map((member, index) => (
                <Line
                  key={member.person_name}
                  type="monotone"
                  dataKey={member.person_name}
                  stroke={PERSON_COLORS[index % PERSON_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: PERSON_COLORS[index % PERSON_COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
