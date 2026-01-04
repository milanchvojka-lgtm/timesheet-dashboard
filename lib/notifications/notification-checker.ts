import { createServerAdminClient } from '@/lib/supabase/server'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error'
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  priority: number // Higher = show first
}

/**
 * Check for unpaired timesheet items (quality score < 100%)
 */
async function checkUnpairedItems(dateFrom: string, dateTo: string): Promise<Notification | null> {
  const supabase = createServerAdminClient()

  // Query timesheets to check categorization
  const { data: timesheets, error } = await supabase
    .from('timesheet_entries')
    .select('id, activity_name, project_name')
    .gte('date', dateFrom)
    .lte('date', dateTo)

  if (error || !timesheets) {
    console.error('[Notifications] Error fetching timesheets:', error)
    return null
  }

  // Get active keywords
  const { data: keywords } = await supabase
    .from('activity_keywords')
    .select('keyword, category')
    .eq('is_active', true)

  if (!keywords) return null

  // Check how many entries are unpaired
  const unpairedCount = timesheets.filter((entry) => {
    const activityLower = entry.activity_name?.toLowerCase() || ''
    const matched = keywords.some((kw) => activityLower.includes(kw.keyword.toLowerCase()))
    return !matched
  }).length

  const totalCount = timesheets.length
  const qualityScore = totalCount > 0 ? ((totalCount - unpairedCount) / totalCount) * 100 : 100

  if (qualityScore < 100 && unpairedCount > 0) {
    return {
      id: 'unpaired-items',
      type: 'warning',
      title: 'Unpaired Timesheet Items',
      message: `${unpairedCount} timesheet entries (${(100 - qualityScore).toFixed(1)}%) are not categorized. Review and add missing keywords.`,
      actionText: 'Review in Review Buddy',
      actionUrl: '/review-buddy',
      priority: 2,
    }
  }

  return null
}

/**
 * Check for FTE deviations (actual vs planned > 30%)
 */
async function checkFTEDeviations(dateFrom: string, dateTo: string): Promise<Notification | null> {
  const supabase = createServerAdminClient()

  // Get current planned FTE values
  const { data: plannedFTEs, error: fteError } = await supabase
    .from('planned_fte')
    .select('person_name, fte_value')
    .is('valid_to', null)

  if (fteError || !plannedFTEs || plannedFTEs.length === 0) {
    return null
  }

  // Get actual FTE data from timesheets
  const { data: timesheets, error: timesheetsError } = await supabase
    .from('timesheet_entries')
    .select('person_name, hours, date')
    .gte('date', dateFrom)
    .lte('date', dateTo)

  if (timesheetsError || !timesheets) {
    return null
  }

  // Calculate actual FTE per person
  const personHours = new Map<string, number>()
  timesheets.forEach((entry) => {
    const current = personHours.get(entry.person_name) || 0
    personHours.set(entry.person_name, current + entry.hours)
  })

  // Calculate working hours in period (rough estimate: 160 hours/month)
  const startDate = new Date(dateFrom)
  const endDate = new Date(dateTo)
  const monthsDiff =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) +
    1
  const workingHours = monthsDiff * 160

  // Check deviations
  const deviations: Array<{ person: string; planned: number; actual: number; diff: number }> = []

  plannedFTEs.forEach((planned) => {
    const actualHours = personHours.get(planned.person_name) || 0
    const actualFTE = actualHours / workingHours
    const plannedFTE = planned.fte_value
    const deviation = Math.abs(actualFTE - plannedFTE)
    const deviationPercent = plannedFTE > 0 ? (deviation / plannedFTE) * 100 : 0

    if (deviationPercent > 30) {
      deviations.push({
        person: planned.person_name,
        planned: plannedFTE,
        actual: parseFloat(actualFTE.toFixed(2)),
        diff: parseFloat(deviationPercent.toFixed(1)),
      })
    }
  })

  if (deviations.length > 0) {
    const topDeviation = deviations.sort((a, b) => b.diff - a.diff)[0]

    return {
      id: 'fte-deviations',
      type: 'warning',
      title: 'FTE Deviations Detected',
      message: `${deviations.length} team member(s) have FTE deviations > 30%. Highest: ${topDeviation.person} (${topDeviation.diff}% off).`,
      actionText: 'View Team Dashboard',
      actionUrl: '/overview?tab=team',
      priority: 3,
    }
  }

  return null
}

/**
 * Check for new team members in timesheets not in users table
 */
async function checkNewTeamMembers(): Promise<Notification | null> {
  const supabase = createServerAdminClient()

  // Get all unique person names from recent timesheets (last 3 months)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const dateFrom = threeMonthsAgo.toISOString().split('T')[0]

  const { data: timesheets } = await supabase
    .from('timesheet_entries')
    .select('person_name')
    .gte('date', dateFrom)

  if (!timesheets) return null

  const uniquePeople = [...new Set(timesheets.map((t) => t.person_name))]

  // Get team members from users table
  const { data: users } = await supabase
    .from('users')
    .select('name, email')
    .eq('is_team_member', true)

  if (!users) return null

  const knownNames = new Set(users.map((u) => u.name).filter(Boolean))

  // Find people in timesheets but not in team members
  const newPeople = uniquePeople.filter((person) => !knownNames.has(person))

  if (newPeople.length > 0) {
    return {
      id: 'new-team-members',
      type: 'info',
      title: 'New Team Members Detected',
      message: `${newPeople.length} person(s) found in timesheets but not in team members: ${newPeople.slice(0, 3).join(', ')}${newPeople.length > 3 ? '...' : ''}`,
      actionText: 'Manage Team Members',
      actionUrl: '/admin/team-members',
      priority: 1,
    }
  }

  return null
}

/**
 * Get all active notifications for the current dashboard period
 */
export async function getActiveNotifications(
  dateFrom: string,
  dateTo: string
): Promise<Notification[]> {
  const notifications: Notification[] = []

  try {
    // Check for unpaired items
    const unpairedNotification = await checkUnpairedItems(dateFrom, dateTo)
    if (unpairedNotification) {
      notifications.push(unpairedNotification)
    }

    // Check for FTE deviations
    const fteNotification = await checkFTEDeviations(dateFrom, dateTo)
    if (fteNotification) {
      notifications.push(fteNotification)
    }

    // Check for new team members
    const newMembersNotification = await checkNewTeamMembers()
    if (newMembersNotification) {
      notifications.push(newMembersNotification)
    }
  } catch (error) {
    console.error('[Notifications] Error checking notifications:', error)
  }

  // Sort by priority (highest first)
  return notifications.sort((a, b) => b.priority - a.priority)
}
