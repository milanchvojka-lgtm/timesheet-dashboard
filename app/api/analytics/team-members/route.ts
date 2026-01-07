import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { mapProjectCategory } from '@/config/projects'
import { categorizeTimesheet } from '@/lib/calculations/activity-pairing'
import { getWorkingHoursForPeriod } from '@/lib/calculations/working-days'

/**
 * API Route: GET /api/analytics/team-members
 *
 * Fetches individual breakdown for all team members who tracked time in the period
 * Returns projects breakdown and OPS activities for each person
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

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
    let entries: any[] = []
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
        console.error('[API] Error fetching timesheet entries:', error)
        return NextResponse.json(
          { error: 'Failed to fetch timesheet data' },
          { status: 500 }
        )
      }

      if (batch && batch.length > 0) {
        entries = entries.concat(batch)
        hasMore = batch.length === batchSize
        from += batchSize
      } else {
        hasMore = false
      }
    }

    // Calculate working hours for the period
    const workingHours = getWorkingHoursForPeriod(dateFrom, dateTo)

    // Get all unique people who tracked time
    const peopleSet = new Set(entries.map(e => e.person_name))
    const people = Array.from(peopleSet).sort()

    // Fetch activity keywords for categorization
    const { data: keywords } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('is_active', true)

    // Fetch planned FTE for all people
    const { data: plannedFTERecords } = await supabase
      .from('planned_fte')
      .select('*')
      .in('person_name', people)
      .lte('valid_from', dateTo)
      .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

    // Build data for each person
    const teamMembers = people.map(personName => {
      const personEntries = entries.filter(e => e.person_name === personName)
      const totalHours = personEntries.reduce((sum, e) => sum + Number(e.hours), 0)
      const actualFTE = workingHours > 0 ? Number((totalHours / workingHours).toFixed(2)) : 0

      // Get planned FTE (pick latest valid_from <= dateTo)
      const personFTERecords = plannedFTERecords?.filter(r => r.person_name === personName) || []
      const validRecord = personFTERecords
        .filter(r => r.valid_from <= dateTo)
        .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]
      const plannedFTE = validRecord?.fte_value || null
      const deviation = plannedFTE ? Number((((actualFTE - plannedFTE) / plannedFTE) * 100).toFixed(2)) : null

      // Projects breakdown
      const projectsMap = new Map<string, number>()
      personEntries.forEach(entry => {
        const category = mapProjectCategory(entry.project_name)
        const current = projectsMap.get(category) || 0
        projectsMap.set(category, current + Number(entry.hours))
      })

      const projects = Array.from(projectsMap.entries())
        .map(([project, hours]) => ({
          project,
          hours: Number(hours.toFixed(2)),
          percentage: Number(((hours / totalHours) * 100).toFixed(1))
        }))
        .sort((a, b) => b.hours - a.hours)

      // OPS Activities (if any)
      const opsEntries = personEntries.filter(e => {
        const cat = mapProjectCategory(e.project_name)
        return cat === 'OPS' || cat === 'Guiding'
      })

      let opsActivities = null

      if (opsEntries.length > 0) {
        const categorized = categorizeTimesheet(opsEntries, keywords || [], false)

        const activitiesMap = new Map<string, number>()
        categorized.forEach(entry => {
          if (entry.category !== 'Other') {
            const current = activitiesMap.get(entry.category) || 0
            activitiesMap.set(entry.category, current + Number(entry.hours))
          }
        })

        const opsTotal = opsEntries.reduce((sum, e) => sum + Number(e.hours), 0)

        opsActivities = Array.from(activitiesMap.entries())
          .map(([activity, hours]) => ({
            activity,
            hours: Number(hours.toFixed(2)),
            percentage: Number(((hours / opsTotal) * 100).toFixed(1))
          }))
          .filter(a => a.hours > 0)
          .sort((a, b) => b.hours - a.hours)

        if (opsActivities.length === 0) {
          opsActivities = null
        }
      }

      return {
        person: personName,
        totalHours: Number(totalHours.toFixed(2)),
        actualFTE,
        plannedFTE,
        deviation,
        projects,
        opsActivities
      }
    })

    // Calculate team summary
    const totalTeamHours = teamMembers.reduce((sum, m) => sum + m.totalHours, 0)
    const avgFTE = teamMembers.length > 0
      ? Number((teamMembers.reduce((sum, m) => sum + m.actualFTE, 0) / teamMembers.length).toFixed(2))
      : 0

    return NextResponse.json({
      period: {
        from: dateFrom,
        to: dateTo,
        workingHours
      },
      summary: {
        totalPeople: teamMembers.length,
        totalHours: Number(totalTeamHours.toFixed(2)),
        averageFTE: avgFTE
      },
      teamMembers
    })

  } catch (error) {
    console.error('[API] Team members error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch team members data',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
