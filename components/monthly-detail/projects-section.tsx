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
import { FolderKanban } from "lucide-react"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts"
import { PeriodType } from "@/components/overview/period-selector"
import { PROJECT_COLORS } from "@/config/colors"

interface ProjectData {
  category: string
  hours: number
  entryCount: number
  fte: number
  percentage: number
}

interface ProjectsSectionProps {
  dateFrom: string
  dateTo: string
  periodType: PeriodType
}

export function ProjectsSection({ dateFrom, dateTo, periodType }: ProjectsSectionProps) {
  const [data, setData] = useState<ProjectData[]>([])
  const [trends, setTrends] = useState<Array<Record<string, number | string>>>([])
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
        setTrends(result.trends || [])
        setData(result.summary || [])
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

  const totalHours = data.reduce((sum, p) => sum + (p.hours || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Projects Breakdown
        </CardTitle>
        <CardDescription>
          Hours and FTE distribution by project category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">FTE</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((project) => (
              <TableRow key={project.category}>
                <TableCell className="font-medium">{project.category || 'Unknown'}</TableCell>
                <TableCell className="text-right">{(project.hours || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{project.entryCount || 0}</TableCell>
                <TableCell className="text-right">{(project.fte || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">{project.percentage || 0}%</TableCell>
              </TableRow>
            ))}
            {data.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totalHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, p) => sum + (p.entryCount || 0), 0)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, p) => sum + (p.fte || 0), 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No project data available for this period
          </div>
        )}

        {/* Quarter: single total FTE trend line */}
        {periodType === 'quarter' && trends.length > 1 && (() => {
          const PROJECT_CATEGORIES = ['OPS', 'Internal', 'R&D', 'Guiding', 'PR', 'UX Maturity']
          const trendData = trends.map(t => ({
            month: t.month,
            totalFTE: PROJECT_CATEGORIES.reduce((sum, cat) => sum + (Number(t[cat]) || 0), 0)
          }))
          return (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-medium mb-4">Total FTE Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tickFormatter={(value) => {
                      const [year, month] = String(value).split('-')
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
                    formatter={(value) => [`${(value as number).toFixed(2)} FTE`, 'Total']}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalFTE"
                    stroke="#7BD4B4"
                    strokeWidth={2}
                    dot={{ fill: '#7BD4B4' }}
                    name="Total FTE"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })()}

        {/* Year / Range: stacked area chart per project category */}
        {(periodType === 'year' || periodType === 'range') && trends.length > 1 && (() => {
          const PROJECT_CATEGORIES = ['OPS', 'Internal', 'R&D', 'Guiding', 'PR', 'UX Maturity'] as const
          const activeCategories = PROJECT_CATEGORIES.filter(cat =>
            trends.some(t => Number(t[cat]) > 0)
          )
          if (activeCategories.length === 0) return null
          return (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-medium mb-4">FTE Trend by Project</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tickFormatter={(value) => {
                      const [year, month] = String(value).split('-')
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
                  {activeCategories.map(cat => (
                    <Area
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stackId="1"
                      stroke={PROJECT_COLORS[cat as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                      fill={PROJECT_COLORS[cat as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        })()}

        {/* Chart: Show all projects with FTE data */}
        {data.length > 0 &&
          (() => {
            const chartData = data
              .sort((a, b) => b.fte - a.fte)
              .map((project) => ({
                name: project.category,
                fte: project.fte,
              }));

            if (chartData.length === 0) return null;

            const CustomLabel = (props: {
              x: number;
              y: number;
              width: number;
              height: number;
              value: number;
            }) => {
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
                  {value.toFixed(2)} FTE
                </text>
              );
            };

            return (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-medium mb-4">
                  FTE Visual Comparison by Project
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
                      dataKey="fte"
                      radius={[0, 4, 4, 0]}
                      label={<CustomLabel />}
                      barSize={30}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PROJECT_COLORS[entry.name as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                          fillOpacity={0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
      </CardContent>
    </Card>
  )
}
