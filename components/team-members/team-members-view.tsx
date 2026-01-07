'use client'

import { useState, useEffect } from 'react'
import { PeriodSelector, PeriodSelection } from '@/components/overview/period-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonSection } from './person-section'

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface DataRange {
  startDate: string | null
  endDate: string | null
}

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

interface TeamMembersData {
  period: {
    from: string
    to: string
    workingHours: number
  }
  summary: {
    totalPeople: number
    totalHours: number
    averageFTE: number
  }
  teamMembers: TeamMember[]
}

export function TeamMembersView({ dataRange }: { dataRange: DataRange }) {
  const today = new Date()

  // Initialize with latest available period (endDate), otherwise use current month
  const getInitialPeriod = (): PeriodSelection => {
    if (dataRange?.endDate) {
      const endYear = parseInt(dataRange.endDate.split('-')[0])
      const endMonth = parseInt(dataRange.endDate.split('-')[1])
      const lastDay = new Date(endYear, endMonth, 0).getDate()

      return {
        type: "month",
        dateFrom: `${endYear}-${String(endMonth).padStart(2, '0')}-01`,
        dateTo: `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        label: `${MONTH_NAMES[endMonth - 1]} ${endYear}`
      }
    }

    // Fallback to current month
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    return {
      type: "month",
      dateFrom: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      dateTo: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`,
      label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`
    }
  }

  const [period, setPeriod] = useState<PeriodSelection>(getInitialPeriod())
  const [data, setData] = useState<TeamMembersData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/analytics/team-members?dateFrom=${period.dateFrom}&dateTo=${period.dateTo}`
        )
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch team members data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period.dateFrom, period.dateTo])

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <PeriodSelector onPeriodChange={setPeriod} dataRange={dataRange} />

      {/* Currently Viewing */}
      <div className="text-sm text-muted-foreground">
        Viewing: <span className="font-medium text-foreground">{period.label}</span>
      </div>

      {loading && !data ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading team members data...</p>
        </div>
      ) : data && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total People</p>
                  <p className="text-2xl font-bold">{data.summary.totalPeople}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold">{data.summary.totalHours}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average FTE</p>
                  <p className="text-2xl font-bold">{data.summary.averageFTE}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          {data.teamMembers.length > 5 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Jump to:</span>
                  {data.teamMembers.map((member) => (
                    <button
                      key={member.person}
                      onClick={() => {
                        const element = document.getElementById(`person-${member.person.replace(/\s+/g, '-')}`)
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {member.person}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members Sections */}
          <div className="space-y-8">
            {data.teamMembers.map((member) => (
              <PersonSection
                key={member.person}
                member={member}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
