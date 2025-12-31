import { NextRequest, NextResponse } from 'next/server'
import { parseAndMapFile } from '@/lib/upload/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const { data, errors, totalRows } = await parseAndMapFile(file)

    return NextResponse.json({
      totalRows,
      validRows: data.length,
      invalidRows: errors.length,
      errors: errors.slice(0, 50), // Show first 50 errors
      sampleValidData: data.slice(0, 3).map(row => ({
        person: row.person_name,
        date: row.date,
        project: row.project_name,
        activity: row.activity_name,
        hours: row.hours,
        description: row.description,
      })),
      invalidRowExamples: errors.filter(e => e.row <= 10), // Show first 10 rows with errors
    })
  } catch (error) {
    console.error('Parse test error:', error)
    return NextResponse.json({
      error: 'Parse error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
