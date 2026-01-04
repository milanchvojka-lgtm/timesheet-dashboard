import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerAdminClient()

    // Find duplicates: same person, date, project, activity, description, hours
    const { data: allEntries, error: fetchError } = await supabase
      .from('timesheet_entries')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    interface TimesheetEntry {
      id: string
      person_name: string
      date: string
      project_name: string
      activity_name: string
      description: string | null
      hours: number
      created_at: string
    }

    // Group by unique key
    const groups = new Map<string, TimesheetEntry[]>()

    allEntries?.forEach((entry) => {
      const key = `${entry.person_name}|${entry.date}|${entry.project_name}|${entry.activity_name}|${entry.description}|${entry.hours}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(entry)
    })

    // Find duplicates (groups with more than 1 entry)
    const duplicateGroups = Array.from(groups.values()).filter(group => group.length > 1)

    // For each duplicate group, keep the first (oldest) and delete the rest
    let deletedCount = 0
    const idsToDelete: string[] = []

    duplicateGroups.forEach((group) => {
      // Sort by created_at, keep first (oldest)
      group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // Mark all except first for deletion
      for (let i = 1; i < group.length; i++) {
        idsToDelete.push(group[i].id)
      }
    })

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('timesheet_entries')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      deletedCount = idsToDelete.length
    }

    return NextResponse.json({
      message: 'Duplicates cleaned up successfully',
      duplicateGroupsFound: duplicateGroups.length,
      entriesDeleted: deletedCount,
      duplicateExamples: duplicateGroups.slice(0, 5).map(group => ({
        person: group[0].person_name,
        date: group[0].date,
        project: group[0].project_name,
        description: group[0].description,
        duplicateCount: group.length,
      })),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
