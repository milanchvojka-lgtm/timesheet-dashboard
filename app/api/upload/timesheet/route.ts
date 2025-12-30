import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { parseAndMapFile } from '@/lib/upload/parser'
import { importTimesheetData } from '@/lib/upload/importer'

/**
 * API Route: POST /api/upload/timesheet
 *
 * Upload and import timesheet data from CSV/Excel file
 * Requires team member authentication
 */

/**
 * POST /api/upload/timesheet
 *
 * Accepts multipart/form-data with file field
 * Supported file types: .csv, .xlsx, .xls
 *
 * Returns:
 * - 200: Upload successful with import summary
 * - 400: Invalid file or validation errors
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication and team member status
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // 2. Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 3. Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV and Excel files are supported.' },
        { status: 400 }
      )
    }

    // 4. Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    console.log(
      `[API] Uploading ${file.name} (${(file.size / 1024).toFixed(2)} KB) from ${session.user.email}`
    )

    // 5. Parse and validate file
    const { data, errors, totalRows } = await parseAndMapFile(file)

    // Check if there are any validation errors
    if (errors.length > 0) {
      const errorCount = errors.length
      const maxErrorsToShow = 10

      return NextResponse.json(
        {
          error: 'File validation failed',
          message: `Found ${errorCount} validation error(s) in ${totalRows} rows`,
          validation_errors: errors.slice(0, maxErrorsToShow),
          total_errors: errorCount,
          successful_rows: data.length,
        },
        { status: 400 }
      )
    }

    // Check if file has data
    if (data.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid data found',
          message: 'The file is empty or contains no valid timesheet entries',
        },
        { status: 400 }
      )
    }

    console.log(`[API] Parsed ${data.length} valid rows from ${totalRows} total rows`)

    // 6. Import data to database
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx'

    const result = await importTimesheetData(data, {
      filename: file.name,
      fileSize: file.size,
      fileType,
      uploadedByEmail: session.user.email || '',
      uploadedByName: session.user.name || null,
    })

    console.log(
      `[API] Import complete: ${result.successful_rows}/${result.total_rows} successful`
    )

    // 7. Return result
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.successful_rows} of ${result.total_rows} entries`,
      result,
    })
  } catch (error) {
    console.error('[API] Upload error:', error)

    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
