'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

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
  opsActivities: Array<{
    activity: string
    hours: number
    percentage: number
  }> | null
}

interface PersonSectionProps {
  member: TeamMember
}

const PROJECT_COLORS: Record<string, string> = {
  'Internal': '#3b82f6',
  'OPS': '#10b981',
  'R&D': '#f59e0b',
  'Guiding': '#8b5cf6',
  'PR': '#ec4899',
  'UX Maturity': '#06b6d4',
  'Other': '#6b7280'
}

export function PersonSection({ member }: PersonSectionProps) {
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
        {value.toFixed(1)}h
      </text>
    )
  }

  return (
    <div id={`person-${personId}`} className="scroll-mt-24">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{member.person}</CardTitle>
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: PROJECT_COLORS[project.project] || PROJECT_COLORS['Other'] }}
                        />
                        {project.project}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{project.hours}</TableCell>
                    <TableCell className="text-right">{project.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6">
              <ResponsiveContainer width="100%" height={Math.max(member.projects.length * 60, 200)}>
                <BarChart
                  data={member.projects}
                  layout="vertical"
                  margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 'auto']} />
                  <YAxis
                    type="category"
                    dataKey="project"
                    width={150}
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
                        fill={PROJECT_COLORS[entry.project] || PROJECT_COLORS['Other']}
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

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={Math.max(member.opsActivities.length * 60, 200)}>
                  <BarChart
                    data={member.opsActivities}
                    layout="vertical"
                    margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 'auto']} />
                    <YAxis
                      type="category"
                      dataKey="activity"
                      width={150}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
