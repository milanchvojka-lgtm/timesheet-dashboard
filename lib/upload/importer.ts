import { createServerAdminClient } from '@/lib/supabase/server'
import { mapProjectCategory } from '@/config/projects'
import {
  ParsedTimesheetRow,
  ValidationError,
  UploadResult,
  TimesheetEntry,
  SkippedEntry,
} from '@/types/upload.types'

/**
 * Import parsed timesheet data to database
 * Creates upload history record and inserts timesheet entries
 */
export async function importTimesheetData(
  data: ParsedTimesheetRow[],
  metadata: {
    filename: string
    fileSize: number
    fileType: 'csv' | 'xlsx'
    uploadedByEmail: string
    uploadedByName: string | null
  }
): Promise<UploadResult> {
  const supabase = createServerAdminClient()

  // Calculate date range
  const dates = data.map((row) => row.date).sort()
  const dataDateFrom = dates[0] || null
  const dataDateTo = dates[dates.length - 1] || null

  // Create upload history record
  const { data: uploadHistory, error: uploadError } = await supabase
    .from('upload_history')
    .insert({
      filename: metadata.filename,
      file_size: metadata.fileSize,
      file_type: metadata.fileType,
      uploaded_by_email: metadata.uploadedByEmail,
      uploaded_by_name: metadata.uploadedByName,
      total_rows: data.length,
      successful_rows: 0,
      failed_rows: 0,
      skipped_rows: 0,
      data_date_from: dataDateFrom,
      data_date_to: dataDateTo,
      status: 'processing',
    })
    .select()
    .single()

  if (uploadError || !uploadHistory) {
    throw new Error(`Failed to create upload history: ${uploadError?.message}`)
  }

  const uploadId = uploadHistory.id

  // Delete existing entries for the same date range to avoid duplicates
  if (dataDateFrom && dataDateTo) {
    console.log(`[Importer] Deleting existing entries from ${dataDateFrom} to ${dataDateTo}`)
    const { error: deleteError, count } = await supabase
      .from('timesheet_entries')
      .delete()
      .gte('date', dataDateFrom)
      .lte('date', dataDateTo)

    if (deleteError) {
      console.error(`[Importer] Error deleting existing entries:`, deleteError)
    } else {
      console.log(`[Importer] Deleted ${count || 0} existing entries`)
    }
  }

  // Load team members for team-only project filtering.
  // Used by '2F Product' where external contributors must be excluded.
  // Match by name (Costlocker XLSX exports omit person_id, parser hashes the
  // name to fabricate one — so users.costlocker_person_id won't line up).
  const { data: teamUsers } = await supabase
    .from('users')
    .select('name')
    .eq('is_team_member', true)
    .not('name', 'is', null)

  const teamPersonNames = new Set<string>(
    (teamUsers || [])
      .map((u) => (u.name || '').trim().toLowerCase())
      .filter((n) => n.length > 0)
  )

  // Transform parsed rows to database format, skipping unrecognized projects
  // and external contributors on team-only projects.
  const skippedEntries: SkippedEntry[] = []
  const entries: Omit<TimesheetEntry, 'id' | 'created_at' | 'updated_at'>[] = data
    .filter((row) => {
      const category = mapProjectCategory(row.project_name)
      if (category === 'Other') {
        skippedEntries.push({
          date: row.date,
          person_name: row.person_name,
          project_name: row.project_name,
          activity_name: row.activity_name,
          hours: row.hours,
          description: row.description || null,
          reason: 'unrecognized_project',
        })
        return false
      }
      if (category === '2F Product' && !teamPersonNames.has(row.person_name.trim().toLowerCase())) {
        skippedEntries.push({
          date: row.date,
          person_name: row.person_name,
          project_name: row.project_name,
          activity_name: row.activity_name,
          hours: row.hours,
          description: row.description || null,
          reason: 'external_contributor',
        })
        return false
      }
      return true
    })
    .map((row) => ({
      person_id: row.person_id,
      person_name: row.person_name,
      person_email: row.person_email || null,
      project_id: row.project_id,
      project_name: row.project_name,
      project_category: mapProjectCategory(row.project_name),
      activity_id: row.activity_id,
      activity_name: row.activity_name,
      date: row.date,
      hours: row.hours,
      description: row.description || null,
      approved: row.approved || false,
      billable: row.billable || false,
      upload_id: uploadId,
    }))

  if (skippedEntries.length > 0) {
    const uniqueSkipped = [...new Set(skippedEntries.map((e) => e.project_name))]
    console.log(`[Importer] Skipped ${skippedEntries.length} entries from unrecognized projects: ${uniqueSkipped.join(', ')}`)
  }

  // Insert entries in batches
  const BATCH_SIZE = 1000
  let successfulRows = 0
  let failedRows = 0
  const validationErrors: ValidationError[] = []

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)

    try {
      const { error: insertError, count } = await supabase
        .from('timesheet_entries')
        .insert(batch)

      if (insertError) {
        console.error(`Batch insert error:`, insertError)
        failedRows += batch.length
        validationErrors.push({
          row: i + 1,
          message: `Batch insert failed: ${insertError.message}`,
        })
      } else {
        successfulRows += count || batch.length
      }
    } catch (error) {
      console.error(`Batch insert exception:`, error)
      failedRows += batch.length
      validationErrors.push({
        row: i + 1,
        message: `Batch insert exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  // Update upload history with results
  const status = failedRows === 0 ? 'completed' : failedRows === data.length ? 'failed' : 'partial'

  await supabase
    .from('upload_history')
    .update({
      successful_rows: successfulRows,
      failed_rows: failedRows,
      status,
      validation_errors: validationErrors.length > 0 ? validationErrors : null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', uploadId)

  return {
    success: status === 'completed' || status === 'partial',
    upload_id: uploadId,
    total_rows: data.length,
    successful_rows: successfulRows,
    failed_rows: failedRows,
    skipped_rows: skippedEntries.length,
    skipped_entries: skippedEntries,
    validation_errors: validationErrors,
    data_date_from: dataDateFrom,
    data_date_to: dataDateTo,
  }
}

/**
 * Get upload history
 */
export async function getUploadHistory(limit = 10) {
  const supabase = createServerAdminClient()

  const { data, error } = await supabase
    .from('upload_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch upload history: ${error.message}`)
  }

  return data
}

/**
 * Get timesheet entries by upload ID
 */
export async function getEntriesByUploadId(uploadId: string) {
  const supabase = createServerAdminClient()

  const { data, error } = await supabase
    .from('timesheet_entries')
    .select('*')
    .eq('upload_id', uploadId)
    .order('date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch entries: ${error.message}`)
  }

  return data
}

/**
 * Delete upload and all associated entries
 */
export async function deleteUpload(uploadId: string) {
  const supabase = createServerAdminClient()

  // Entries will be deleted automatically via CASCADE
  const { error } = await supabase.from('upload_history').delete().eq('id', uploadId)

  if (error) {
    throw new Error(`Failed to delete upload: ${error.message}`)
  }

  return { success: true }
}
