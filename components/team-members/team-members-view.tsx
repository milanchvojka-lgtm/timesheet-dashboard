'use client'

import { useState, useEffect } from 'react'
import { PeriodSelector } from '@/components/overview/period-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonSection } from './person-section'

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
  const [data, setData] = useState<TeamMembersData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const handlePeriodChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  useEffect(() => {
    if (!dateFrom || !dateTo) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/analytics/team-members?dateFrom=${dateFrom}&dateTo=${dateTo}`
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
  }, [dateFrom, dateTo])

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <PeriodSelector
        onPeriodChange={handlePeriodChange}
        dataRange={dataRange}
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading team members data...</p>
        </div>
      ) : data ? (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a period to view team members data</p>
        </div>
      )}
    </div>
  )
}
