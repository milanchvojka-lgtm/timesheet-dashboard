import { NextRequest, NextResponse } from 'next/server'
import { parseAndMapFile } from '@/lib/upload/parser'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Parse the file
    const { data, errors, totalRows } = await parseAndMapFile(file)

    // Filter for November 2025 entries (Nov 1st and 2nd specifically)
    const novemberEntries = data.filter(row => {
      const date = row.date
      return date.startsWith('2025-11')
    })

    const nov1Entries = data.filter(row => row.date === '2025-11-01')
    const nov2Entries = data.filter(row => row.date === '2025-11-02')

    // Get Petra entries specifically
    const petraEntries = data.filter(row =>
      row.person_name.toLowerCase().includes('petra') ||
      row.person_name.toLowerCase().includes('panáková')
    )

    const petraNov1 = nov1Entries.filter(row =>
      row.person_name.toLowerCase().includes('petra') ||
      row.person_name.toLowerCase().includes('panáková')
    )

    const petraNov2 = nov2Entries.filter(row =>
      row.person_name.toLowerCase().includes('petra') ||
      row.person_name.toLowerCase().includes('panáková')
    )

    // Check database for comparison
    const supabase = createServerAdminClient()

    const { data: dbNov1, error: dbError1 } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('date', '2025-11-01')
      .order('person_name')

    const { data: dbNov2, error: dbError2 } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('date', '2025-11-02')
      .order('person_name')

    const { data: dbPetraNov, error: dbError3 } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', '2025-11-01')
      .lte('date', '2025-11-30')
      .ilike('person_name', '%petra%')
      .order('date', { ascending: true })

    return NextResponse.json({
      summary: {
        totalRows,
        validRows: data.length,
        invalidRows: errors.length,
        novemberEntries: novemberEntries.length,
        nov1Entries: nov1Entries.length,
        nov2Entries: nov2Entries.length,
        petraEntries: petraEntries.length,
        petraNov1: petraNov1.length,
        petraNov2: petraNov2.length,
      },
      parsedData: {
        nov1All: nov1Entries.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })),
        nov2All: nov2Entries.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })),
        petraNov1Parsed: petraNov1.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })),
        petraNov2Parsed: petraNov2.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })),
      },
      databaseData: {
        nov1InDb: dbNov1?.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })) || [],
        nov2InDb: dbNov2?.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })) || [],
        petraNovInDb: dbPetraNov?.map(row => ({
          person: row.person_name,
          date: row.date,
          project: row.project_name,
          activity: row.activity_name,
          hours: row.hours,
          description: row.description,
        })) || [],
      },
      errors: errors.map(err => ({
        row: err.row,
        field: err.field,
        message: err.message,
        value: err.value,
      })),
    })
  } catch (error) {
    console.error('Parse detailed error:', error)
    return NextResponse.json({
      error: 'Parse error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
