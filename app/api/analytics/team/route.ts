import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { calculateTeamMonthlyFTE } from '@/lib/calculations/fte'
import { getWorkingHoursForPeriod } from '@/lib/calculations/working-days'

/**
 * API Route: GET /api/analytics/team
 *
 * Returns team member FTE performance with planned vs actual comparison
 * Query params: dateFrom, dateTo (YYYY-MM-DD format)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing required parameters: dateFrom, dateTo' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch timesheet entries
    const { data: entries, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (entriesError) {
      console.error('[API] Error fetching timesheet entries:', entriesError)
      return NextResponse.json(
        { error: 'Failed to fetch timesheet data' },
        { status: 500 }
      )
    }

    // Fetch planned FTE (only active records where valid_to is null)
    const { data: plannedFTEs, error: fteError } = await supabase
      .from('planned_fte')
      .select('*')
      .is('valid_to', null)

    if (fteError) {
      console.error('[API] Error fetching planned FTE:', fteError)
      return NextResponse.json(
        { error: 'Failed to fetch planned FTE data' },
        { status: 500 }
      )
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        team: [],
        trends: [],
        totalHours: 0,
      })
    }

    // Calculate working hours for the period
    const workingHours = getWorkingHoursForPeriod(dateFrom, dateTo)

    // Group by person
    const personMap = new Map<string, { hours: number; entries: number }>()

    entries.forEach((entry) => {
      const existing = personMap.get(entry.person_name) || { hours: 0, entries: 0 }
      existing.hours += Number(entry.hours)
      existing.entries += 1
      personMap.set(entry.person_name, existing)
    })

    // Create team summary with planned vs actual
    const team = Array.from(personMap.entries())
      .map(([person_name, data]) => {
        const actualFTE = Number((data.hours / workingHours).toFixed(2))
        const plannedRecord = plannedFTEs?.find(p => p.person_name === person_name)
        const plannedFTE = plannedRecord?.fte_value || 0
        const deviation = plannedFTE > 0
          ? Number((((actualFTE - plannedFTE) / plannedFTE) * 100).toFixed(1))
          : 0

        return {
          person_name,
          actualFTE,
          plannedFTE,
          deviation,
          hours: Number(data.hours.toFixed(2)),
          entryCount: data.entries,
        }
      })
      .sort((a, b) => b.actualFTE - a.actualFTE)

    // Group by month and person for trends
    const monthlyData = new Map<string, Map<string, number>>()

    entries.forEach((entry) => {
      const month = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, new Map())
      }

      const monthMap = monthlyData.get(month)!
      const currentHours = monthMap.get(entry.person_name) || 0
      monthMap.set(entry.person_name, currentHours + Number(entry.hours))
    })

    // Get all unique people
    const allPeople = new Set(team.map(t => t.person_name))

    // Calculate monthly trends
    const trends = Array.from(monthlyData.entries())
      .map(([month, personHours]) => {
        const [year, monthNum] = month.split('-').map(Number)
        const monthWorkingHours = getWorkingHoursForPeriod(
          `${month}-01`,
          `${month}-${new Date(year, monthNum, 0).getDate()}`
        )

        const result: Record<string, number | string> = { month }

        // Add each person's FTE
        allPeople.forEach(person => {
          const hours = personHours.get(person) || 0
          result[person] = Number((hours / monthWorkingHours).toFixed(2))
        })

        return result
      })
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))

    // Return team data
    return NextResponse.json({
      team,
      trends,
      totalHours: entries.reduce((sum, e) => sum + Number(e.hours), 0),
      period: {
        dateFrom,
        dateTo,
        workingHours,
      },
    })
  } catch (error) {
    console.error('[API] Team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
