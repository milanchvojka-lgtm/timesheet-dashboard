import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { getWorkingHoursForPeriod, calculateWorkingDays } from '@/lib/calculations/working-days'

interface TimesheetEntry {
  id: string
  date: string
  person_name: string
  person_email: string | null
  project_name: string
  activity_name: string
  description: string | null
  hours: number
  is_billable: boolean | null
  project_category: string | null
  upload_id: string
  created_at: string
}

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

    // Fetch timesheet entries in batches (Supabase has 1000-row limit)
    let allEntries: TimesheetEntry[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true })
        .range(from, from + batchSize - 1)

      if (entriesError) {
        console.error('[API] Error fetching timesheet entries:', entriesError)
        return NextResponse.json(
          { error: 'Failed to fetch timesheet data' },
          { status: 500 }
        )
      }

      if (batch && batch.length > 0) {
        allEntries = allEntries.concat(batch)
        hasMore = batch.length === batchSize
        from += batchSize
      } else {
        hasMore = false
      }
    }

    const entries = allEntries

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

    // Group entries by person AND month for month-aware planned FTE calculation
    const personMonthMap = new Map<string, Set<string>>()

    entries.forEach((entry) => {
      const monthKey = entry.date.substring(0, 7) // YYYY-MM
      if (!personMonthMap.has(entry.person_name)) {
        personMonthMap.set(entry.person_name, new Set())
      }
      personMonthMap.get(entry.person_name)!.add(monthKey)
    })

    // Get unique person names who actually tracked time
    const activeTrackers = Array.from(personMap.keys())

    // Fetch planned FTE for people who tracked time, filtered by date range
    // Query: valid_from <= dateTo AND (valid_to IS NULL OR valid_to >= dateFrom)
    const { data: plannedFTEs, error: fteError } = await supabase
      .from('planned_fte')
      .select('*')
      .in('person_name', activeTrackers)
      .lte('valid_from', dateTo)
      .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

    if (fteError) {
      console.error('[API] Error fetching planned FTE:', fteError)
      return NextResponse.json(
        { error: 'Failed to fetch planned FTE data' },
        { status: 500 }
      )
    }

    // Calculate planned FTE for each person (period-proportional)
    // This shows their average FTE for the ENTIRE period, not just months they worked
    const personFTEMap = new Map<string, number>()

    activeTrackers.forEach((personName) => {
      const personRecords = plannedFTEs?.filter((p) => p.person_name === personName) || []
      const monthsWorked = personMonthMap.get(personName) || new Set()

      if (personRecords.length > 0 && monthsWorked.size > 0) {
        let totalPlannedFTEHours = 0

        // For each month this person worked, calculate their planned FTE
        monthsWorked.forEach((monthKey) => {
          const [year, month] = monthKey.split('-').map(Number)
          const workingDaysResult = calculateWorkingDays(year, month)
          const monthWorkingHours = workingDaysResult.workingHours

          // Find FTE record valid during this month
          const monthStart = `${monthKey}-01`
          const monthLastDay = new Date(year, month, 0).getDate()
          const monthEnd = `${monthKey}-${monthLastDay.toString().padStart(2, '0')}`

          const validRecord = personRecords
            .filter((r) => {
              const validFrom = r.valid_from
              const validTo = r.valid_to || '9999-12-31'
              return validFrom <= monthEnd && validTo >= monthStart
            })
            .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]

          if (validRecord) {
            totalPlannedFTEHours += validRecord.fte_value * monthWorkingHours
          }
        })

        // Calculate planned FTE proportional to the ENTIRE period (not just months worked)
        // This accounts for people who only worked part of the period
        if (workingHours > 0) {
          const periodProportionalFTE = totalPlannedFTEHours / workingHours
          personFTEMap.set(personName, periodProportionalFTE)
        }
      }
    })

    // Create team summary with planned vs actual
    const team = Array.from(personMap.entries())
      .filter(([, data]) => data.hours > 0) // Only include people who tracked hours
      .map(([person_name, data]) => {
        const actualFTE = Number((data.hours / workingHours).toFixed(2))
        const plannedFTE = personFTEMap.get(person_name) || 0
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

    // Calculate correct total FTE (sum hours first, then divide, then round)
    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
    const totalFTE = workingHours > 0 ? Number((totalHours / workingHours).toFixed(2)) : 0

    // Calculate total planned FTE using month-by-month approach (matches FTE trends API)
    // This accounts for people joining/leaving during the period
    let totalPlannedFTEHours = 0

    monthlyData.forEach((personHours, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number)
      const workingDaysResult = calculateWorkingDays(year, month)
      const monthWorkingHours = workingDaysResult.workingHours

      // Get people who tracked time in this month
      const monthPeople = Array.from(personHours.keys())

      // Calculate planned FTE for this month
      let monthPlannedFTE = 0

      monthPeople.forEach((personName) => {
        const personRecords = plannedFTEs?.filter((p) => p.person_name === personName) || []

        if (personRecords.length > 0) {
          // Find FTE record valid during this month
          const monthStart = `${monthKey}-01`
          const monthLastDay = new Date(year, month, 0).getDate()
          const monthEnd = `${monthKey}-${monthLastDay.toString().padStart(2, '0')}`

          const validRecord = personRecords
            .filter((r) => {
              const validFrom = r.valid_from
              const validTo = r.valid_to || '9999-12-31'
              return validFrom <= monthEnd && validTo >= monthStart
            })
            .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]

          if (validRecord) {
            monthPlannedFTE += validRecord.fte_value
          }
        }
      })

      totalPlannedFTEHours += monthPlannedFTE * monthWorkingHours
    })

    const totalPlannedFTE = workingHours > 0 ? Number((totalPlannedFTEHours / workingHours).toFixed(2)) : 0

    // Return team data
    return NextResponse.json({
      team,
      trends,
      totalHours,
      totalFTE, // Correctly calculated total (not sum of rounded values)
      totalPlannedFTE, // Month-by-month weighted planned FTE
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
