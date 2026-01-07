'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { PeriodSelector, PeriodSelection } from '@/components/overview/period-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonSection } from './person-section'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Context for managing expand/collapse state across all sections
interface ExpandCollapseContextType {
  expandedSections: Set<string>
  toggleSection: (personName: string) => void
  expandAll: () => void
  collapseAll: () => void
}

const ExpandCollapseContext = createContext<ExpandCollapseContextType | undefined>(undefined)

export function useExpandCollapse() {
  const context = useContext(ExpandCollapseContext)
  if (!context) {
    throw new Error('useExpandCollapse must be used within ExpandCollapseProvider')
  }
  return context
}

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Initialize all sections as expanded when data loads
  useEffect(() => {
    if (data?.teamMembers) {
      setExpandedSections(new Set(data.teamMembers.map(m => m.person)))
    }
  }, [data?.teamMembers])

  const toggleSection = (personName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(personName)) {
        newSet.delete(personName)
      } else {
        newSet.add(personName)
      }
      return newSet
    })
  }

  const expandAll = () => {
    if (data?.teamMembers) {
      setExpandedSections(new Set(data.teamMembers.map(m => m.person)))
    }
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

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

  const contextValue = {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll,
  }

  return (
    <ExpandCollapseContext.Provider value={contextValue}>
      <div className="space-y-6">
        {/* Period Selector */}
        <PeriodSelector onPeriodChange={setPeriod} dataRange={dataRange} />

        {/* Currently Viewing */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Viewing: <span className="font-medium text-foreground">{period.label}</span>
          </div>
          {data && data.teamMembers.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse All
              </Button>
            </div>
          )}
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
    </ExpandCollapseContext.Provider>
  )
}
