import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { calculateWorkingDays, getWorkingHoursForPeriod } from '@/lib/calculations/working-days'

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
 * API Route: GET /api/analytics/fte-trends
 *
 * Returns FTE metrics and monthly breakdown for the selected period
 * IMPORTANT: Uses .limit(100000) to fetch all entries (Supabase default is 1000)
 *
 * Query params:
 * - dateFrom: Start date (YYYY-MM-DD)
 * - dateTo: End date (YYYY-MM-DD)
 *
 * Returns:
 * - metrics: Overall metrics (totalFTE, averageFTE, teamSize, totalHours)
 * - trends: Monthly breakdown array
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing dateFrom or dateTo parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch timesheet entries for period in batches (Supabase has 1000-row limit)
    let allEntries: TimesheetEntry[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true })
        .range(from, from + batchSize - 1)

      if (error) {
        console.error('[FTE Trends API] Database error:', error)
        throw error
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
        metrics: {
          plannedFTE: 0,
          totalFTE: 0,
          averageFTE: 0,
          teamSize: 0,
          totalHours: 0,
        },
        trends: [],
      })
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        metrics: {
          plannedFTE: 0,
          totalFTE: 0,
          averageFTE: 0,
          teamSize: 0,
          totalHours: 0,
        },
        trends: [],
      })
    }

    // Calculate overall metrics
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
    const uniquePeople = new Set(
      entries.map((e) => e.person_email || e.person_name)
    ).size

    // Calculate total working hours for the entire period
    const totalWorkingHoursForPeriod = getWorkingHoursForPeriod(dateFrom, dateTo)

    // Get unique person names who actually tracked time
    const activeTrackers = Array.from(new Set(entries.map((e) => e.person_name)))

    // Fetch planned FTE for people who tracked time, filtered by date range
    // Query: valid_from <= dateTo AND (valid_to IS NULL OR valid_to >= dateFrom)
    const { data: plannedFTEs, error: fteError } = await supabase
      .from('planned_fte')
      .select('*')
      .in('person_name', activeTrackers)
      .lte('valid_from', dateTo)
      .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

    if (fteError) {
      console.error('[FTE Trends API] Planned FTE error:', fteError)
    }

    // Group entries by month
    const monthlyGroups: Record<
      string,
      Array<(typeof entries)[0]>
    > = {}

    entries.forEach((entry) => {
      const monthKey = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = []
      }
      monthlyGroups[monthKey].push(entry)
    })

    // Calculate monthly FTE trends
    const trends = Object.keys(monthlyGroups)
      .sort()
      .map((monthKey) => {
        const monthEntries = monthlyGroups[monthKey]
        const monthHours = monthEntries.reduce((sum, e) => sum + e.hours, 0)
        const monthPeople = new Set(
          monthEntries.map((e) => e.person_email || e.person_name)
        ).size

        // Parse month for working hours calculation
        const [year, month] = monthKey.split('-').map(Number)
        const workingDaysResult = calculateWorkingDays(year, month)
        const totalWorkingHours = workingDaysResult.workingHours

        // Calculate FTE for this month
        const totalFTE =
          totalWorkingHours > 0 ? monthHours / totalWorkingHours : 0
        const averageFTE = monthPeople > 0 ? totalFTE / monthPeople : 0

        // Format month label
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        const monthLabel = `${monthNames[month - 1]} ${year}`

        return {
          month: monthLabel,
          totalFTE: parseFloat(totalFTE.toFixed(2)),
          averageFTE: parseFloat(averageFTE.toFixed(2)),
          teamSize: monthPeople,
        }
      })

    // Calculate planned FTE month-by-month (weighted by working hours)
    // This accounts for people joining/leaving and FTE changes over time
    let totalPlannedFTEHours = 0

    Object.keys(monthlyGroups).forEach((monthKey) => {
      const [year, month] = monthKey.split('-').map(Number)
      const workingDaysResult = calculateWorkingDays(year, month)
      const monthWorkingHours = workingDaysResult.workingHours

      // Get people who tracked time in this month
      const monthEntries = monthlyGroups[monthKey]
      const monthPeople = Array.from(new Set(monthEntries.map((e) => e.person_name)))

      // Calculate planned FTE for this month
      let monthPlannedFTE = 0

      monthPeople.forEach((personName) => {
        const personRecords = plannedFTEs?.filter((p) => p.person_name === personName) || []

        if (personRecords.length > 0) {
          // Find FTE record valid during this month
          const monthStart = `${monthKey}-01`
          const monthLastDay = new Date(year, month, 0).getDate()
          const monthEnd = `${monthKey}-${monthLastDay.toString().padStart(2, '0')}`

          // Find the most recent FTE record that was valid during this month
          const validRecord = personRecords
            .filter((r) => {
              const validFrom = r.valid_from
              const validTo = r.valid_to || '9999-12-31'
              // Record is valid if it overlaps with the month
              return validFrom <= monthEnd && validTo >= monthStart
            })
            .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]

          if (validRecord) {
            monthPlannedFTE += validRecord.fte_value
          }
        }
      })

      // Add weighted planned FTE-hours for this month
      totalPlannedFTEHours += monthPlannedFTE * monthWorkingHours
    })

    // Calculate average planned FTE for the entire period
    const plannedFTE = totalWorkingHoursForPeriod > 0
      ? totalPlannedFTEHours / totalWorkingHoursForPeriod
      : 0

    // Calculate period FTE (total hours / total working hours for entire period)
    // This is the correct way to calculate FTE for multi-month periods (quarter/year)
    const periodFTE = totalWorkingHoursForPeriod > 0
      ? totalHours / totalWorkingHoursForPeriod
      : 0

    return NextResponse.json({
      metrics: {
        plannedFTE: parseFloat(plannedFTE.toFixed(2)),
        totalFTE: parseFloat(periodFTE.toFixed(2)), // Renamed from sum of monthly FTEs
        averageFTE: parseFloat(periodFTE.toFixed(2)), // Same as totalFTE for consistency
        teamSize: uniquePeople,
        totalHours,
      },
      trends,
    })
  } catch (error) {
    console.error('[FTE Trends API] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch FTE trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
