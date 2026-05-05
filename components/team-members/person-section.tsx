'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, Cell,
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { PROJECT_COLORS, ACTIVITY_COLORS } from '@/config/colors'
import { PeriodType } from '@/components/overview/period-selector'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExpandCollapse } from './team-members-view'

interface TeamMember {
  person: string
  totalHours: number
  actualFTE: number
  plannedFTE: number | null
  deviation: number | null
  projects: Array<{
    project: string
    hours: number
    percentage: number
  }>
  projectTrends: Array<Record<string, number | string>>
  opsActivities: Array<{
    activity: string
    hours: number
    percentage: number
  }> | null
  activityTrends: Array<Record<string, number | string>>
}

interface PersonSectionProps {
  member: TeamMember
  periodType: PeriodType
}

const PROJECT_CATEGORIES = ['OPS', 'Internal', 'R&D', 'Guiding', 'PR', 'UX Maturity', '2F Product'] as const
const ACTIVITY_CATEGORIES = ['OPS_Hiring', 'OPS_Jobs', 'OPS_Reviews', 'OPS_Guiding', 'Unpaired'] as const

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
}

const tickFormatter = (value: string) => {
  const [year, month] = value.split('-')
  return `${month}/${year.slice(2)}`
}

export function PersonSection({ member, periodType }: PersonSectionProps) {
  const { expandedSections, toggleSection } = useExpandCollapse()
  const isExpanded = expandedSections.has(member.person)

  const getDeviationBadge = (deviation: number | null) => {
    if (deviation === null) return null
    if (deviation >= 0) {
      return <Badge className="bg-[#7BD4B4] text-black">+{deviation.toFixed(1)}%</Badge>
    }
    if (deviation >= -20) {
      return <Badge className="bg-[#8AB5FA] text-black">{deviation.toFixed(1)}%</Badge>
    }
    return <Badge className="bg-[#EB4899] text-white">{deviation.toFixed(1)}%</Badge>
  }

  const personId = member.person.replace(/\s+/g, '-')

  // Custom label for charts
  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props
    if (!value || value === 0) return null

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
    )
  }

  return (
    <div id={`person-${personId}`} className="scroll-mt-24">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(member.person)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <CardTitle className="text-2xl">{member.person}</CardTitle>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <p className="text-muted-foreground">Total Hours</p>
                <p className="text-lg font-semibold">{member.totalHours}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Actual FTE</p>
                <p className="text-lg font-semibold">{member.actualFTE}</p>
              </div>
              {member.plannedFTE !== null && (
                <div className="text-right">
                  <p className="text-muted-foreground">Planned FTE</p>
                  <p className="text-lg font-semibold">{member.plannedFTE}</p>
                </div>
              )}
              {member.deviation !== null && (
                <div className="text-right">
                  <p className="text-muted-foreground">Deviation</p>
                  <div className="mt-1">{getDeviationBadge(member.deviation)}</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-6 space-y-8">
          {/* Projects Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Projects Breakdown</h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {member.projects.map((project) => (
                  <TableRow key={project.project}>
                    <TableCell className="font-medium">{project.project}</TableCell>
                    <TableCell className="text-right">{project.hours}</TableCell>
                    <TableCell className="text-right">{project.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Project trend — quarter: multi-line, year/range: stacked area */}
            {periodType === 'quarter' && member.projectTrends.length > 1 && (() => {
              const activeCategories = PROJECT_CATEGORIES.filter(cat =>
                member.projectTrends.some(t => Number(t[cat]) > 0)
              )
              if (activeCategories.length === 0) return null
              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Project Hours Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={member.projectTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tickFormatter={tickFormatter} />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Month: ${v}`} />
                      <Legend />
                      {activeCategories.map(cat => (
                        <Line
                          key={cat}
                          type="monotone"
                          dataKey={cat}
                          stroke={PROJECT_COLORS[cat as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                          strokeWidth={2}
                          dot={{ fill: PROJECT_COLORS[cat as keyof typeof PROJECT_COLORS] || '#94a3b8' }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}

            {(periodType === 'year' || periodType === 'range') && member.projectTrends.length > 1 && (() => {
              const activeCategories = PROJECT_CATEGORIES.filter(cat =>
                member.projectTrends.some(t => Number(t[cat]) > 0)
              )
              if (activeCategories.length === 0) return null
              return (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Project Hours Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={member.projectTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tickFormatter={tickFormatter} />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Month: ${v}`} />
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

            <div className="mt-6">
              <ResponsiveContainer width="100%" height={Math.max(member.projects.length * 60, 200)}>
                <BarChart
                  data={member.projects}
                  layout="vertical"
                  margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    domain={[0, 'auto']}
                    tick={{
                      fontSize: 12,
                      fontFamily: "inherit",
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="project"
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
                    radius={[0, 4, 4, 0]}
                    label={<CustomLabel />}
                    barSize={30}
                  >
                    {member.projects.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PROJECT_COLORS[entry.project as keyof typeof PROJECT_COLORS] || '#94a3b8'}
                        fillOpacity={0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OPS Activities Breakdown */}
          {member.opsActivities && member.opsActivities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">OPS Activities Breakdown</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.opsActivities.map((activity) => (
                    <TableRow key={activity.activity}>
                      <TableCell className="font-medium">{activity.activity}</TableCell>
                      <TableCell className="text-right">{activity.hours}</TableCell>
                      <TableCell className="text-right">{activity.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Activity trend — quarter: multi-line, year/range: stacked area */}
              {periodType === 'quarter' && member.activityTrends.length > 1 && (() => {
                const activeCategories = ACTIVITY_CATEGORIES.filter(cat =>
                  member.activityTrends.some(t => Number(t[cat]) > 0)
                )
                if (activeCategories.length === 0) return null
                return (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">OPS Activity Hours Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={member.activityTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" tickFormatter={tickFormatter} />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Month: ${v}`} />
                        <Legend />
                        {activeCategories.map(cat => (
                          <Line
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stroke={ACTIVITY_COLORS[cat as keyof typeof ACTIVITY_COLORS] || '#94a3b8'}
                            strokeWidth={2}
                            dot={{ fill: ACTIVITY_COLORS[cat as keyof typeof ACTIVITY_COLORS] || '#94a3b8' }}
                            name={cat.replace('OPS_', 'OPS ')}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              })()}

              {(periodType === 'year' || periodType === 'range') && member.activityTrends.length > 1 && (() => {
                const activeCategories = ACTIVITY_CATEGORIES.filter(cat =>
                  member.activityTrends.some(t => Number(t[cat]) > 0)
                )
                if (activeCategories.length === 0) return null
                return (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">OPS Activity Hours Trend</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={member.activityTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" tickFormatter={tickFormatter} />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Month: ${v}`} />
                        <Legend />
                        {activeCategories.map(cat => (
                          <Area
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stackId="1"
                            stroke={ACTIVITY_COLORS[cat as keyof typeof ACTIVITY_COLORS] || '#94a3b8'}
                            fill={ACTIVITY_COLORS[cat as keyof typeof ACTIVITY_COLORS] || '#94a3b8'}
                            fillOpacity={0.6}
                            name={cat.replace('OPS_', 'OPS ')}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )
              })()}

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={Math.max(member.opsActivities.length * 60, 200)}>
                  <BarChart
                    data={member.opsActivities}
                    layout="vertical"
                    margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      domain={[0, 'auto']}
                      tick={{
                        fontSize: 12,
                        fontFamily: "inherit",
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="activity"
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
                      radius={[0, 4, 4, 0]}
                      label={<CustomLabel />}
                      barSize={30}
                    >
                      {member.opsActivities!.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ACTIVITY_COLORS[entry.activity as keyof typeof ACTIVITY_COLORS] || '#94a3b8'}
                          fillOpacity={0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
