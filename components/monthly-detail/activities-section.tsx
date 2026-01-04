"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

interface ActivityData {
  category: string
  totalHours: number
  entryCount: number
  percentage: number
}

interface ActivitiesSectionProps {
  dateFrom: string
  dateTo: string
}

export function ActivitiesSection({ dateFrom, dateTo }: ActivitiesSectionProps) {
  const [data, setData] = useState<ActivityData[]>([])
  const [qualityScore, setQualityScore] = useState(0)
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

        // Filter entries to only OPS and Guiding projects
        const opsEntries = (result.entries || []).filter((entry: any) => {
          const projectNameLower = entry.project_name?.toLowerCase() || ''
          return projectNameLower.includes('ops') || projectNameLower.includes('guiding')
        })

        // Calculate summary for OPS projects only
        const totalHours = opsEntries.reduce((sum: number, e: any) => sum + (e.hours || 0), 0)

        // Group by category
        const categoryMap = new Map<string, { hours: number; count: number }>()
        opsEntries.forEach((entry: any) => {
          const category = entry.category || 'Unknown'
          const existing = categoryMap.get(category)
          if (existing) {
            existing.hours += entry.hours || 0
            existing.count++
          } else {
            categoryMap.set(category, { hours: entry.hours || 0, count: 1 })
          }
        })

        // Convert to summary array with proper ordering
        const categoryOrder = ['OPS_Hiring', 'OPS_Jobs', 'OPS_Reviews', 'OPS_Guiding']

        // Always show all 4 main OPS categories (even if 0 hours)
        const summary = categoryOrder.map(category => {
          const data = categoryMap.get(category)
          return {
            category,
            totalHours: data ? parseFloat(data.hours.toFixed(2)) : 0,
            entryCount: data ? data.count : 0,
            percentage: totalHours > 0 && data ? parseFloat(((data.hours / totalHours) * 100).toFixed(1)) : 0,
          }
        })

        // Add Unpaired category if it exists and has entries
        const unpairedData = categoryMap.get('Unpaired')
        if (unpairedData && unpairedData.count > 0) {
          summary.push({
            category: 'Unpaired',
            totalHours: parseFloat(unpairedData.hours.toFixed(2)),
            entryCount: unpairedData.count,
            percentage: totalHours > 0 ? parseFloat(((unpairedData.hours / totalHours) * 100).toFixed(1)) : 0,
          })
        }

        // Calculate quality score for OPS projects only
        if (opsEntries.length > 0) {
          const opsUnpairedCount = opsEntries.filter((e: any) => e.category === 'Unpaired').length
          const opsPairedCount = opsEntries.length - opsUnpairedCount
          const opsQualityScore = parseFloat(((opsPairedCount / opsEntries.length) * 100).toFixed(1))
          setQualityScore(opsQualityScore)
        } else {
          setQualityScore(100)
        }

        setData(summary)
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const totalHours = data.reduce((sum, a) => sum + (a.totalHours || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          OPS Activities Breakdown
        </CardTitle>
        <CardDescription>
          Activity categorization and quality score: {qualityScore}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((activity) => {
              // Format category name for display
              const getCategoryLabel = (category: string) => {
                switch (category) {
                  case 'OPS_Hiring':
                    return 'OPS Hiring'
                  case 'OPS_Jobs':
                    return 'OPS Jobs'
                  case 'OPS_Reviews':
                    return 'OPS Reviews'
                  case 'OPS_Guiding':
                    return 'OPS Guiding'
                  case 'Unpaired':
                    return 'Unpaired'
                  default:
                    return category?.replace(/_/g, ' ') || 'Unknown'
                }
              }

              return (
                <TableRow key={activity.category}>
                  <TableCell className="font-medium">
                    {getCategoryLabel(activity.category)}
                  </TableCell>
                  <TableCell className="text-right">{(activity.totalHours || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{activity.entryCount || 0}</TableCell>
                  <TableCell className="text-right font-medium">{activity.percentage || 0}%</TableCell>
                </TableRow>
              )
            })}
            {data.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totalHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, a) => sum + (a.entryCount || 0), 0)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No activities data available for this period
          </div>
        )}

        {/* Chart: Show all activities with hours */}
        {data.length > 0 &&
          (() => {
            const chartData = data
              .filter((activity) => activity.totalHours > 0)
              .sort((a, b) => b.totalHours - a.totalHours)
              .map((activity) => {
                // Format category name for display
                const getCategoryLabel = (category: string) => {
                  switch (category) {
                    case 'OPS_Hiring':
                      return 'OPS Hiring'
                    case 'OPS_Jobs':
                      return 'OPS Jobs'
                    case 'OPS_Reviews':
                      return 'OPS Reviews'
                    case 'OPS_Guiding':
                      return 'OPS Guiding'
                    case 'Unpaired':
                      return 'Unpaired'
                    default:
                      return category?.replace(/_/g, ' ') || 'Unknown'
                  }
                }

                return {
                  name: getCategoryLabel(activity.category),
                  hours: activity.totalHours,
                };
              });

            if (chartData.length === 0) return null;

            const CustomLabel = (props: any) => {
              const { x, y, width, height, value } = props;
              if (!value || value === 0) return null;

              return (
                <text
                  x={x + width + 8}
                  y={y + height / 2}
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontFamily="inherit"
                  dominantBaseline="middle"
                >
                  {value.toFixed(2)} hrs
                </text>
              );
            };

            return (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-medium mb-4">
                  Hours Visual Comparison by Activity
                </h3>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(chartData.length * 60, 300)}
                >
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      type="number"
                      domain={[0, "auto"]}
                      tick={{
                        fontSize: 12,
                        fontFamily: "inherit",
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{
                        fontSize: 12,
                        fontFamily: "inherit",
                        fill: "hsl(var(--foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="hours"
                      fill="#78D3E6"
                      radius={[0, 4, 4, 0]}
                      label={<CustomLabel />}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
      </CardContent>
    </Card>
  )
}
