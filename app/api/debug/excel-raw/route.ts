import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Parse with XLSX
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get all sheet names
    const sheetNames = workbook.SheetNames

    // Read data from each sheet
    const sheets = sheetNames.map(sheetName => {
      const sheet = workbook.Sheets[sheetName]

      // Get raw data with different formats
      const rawData = XLSX.utils.sheet_to_json(sheet, {
        raw: true, // Keep raw values
        defval: '',
      })

      const formattedData = XLSX.utils.sheet_to_json(sheet, {
        raw: false, // Convert to formatted strings
        defval: '',
        dateNF: 'd. m. yyyy',
      })

      return {
        name: sheetName,
        rowCount: rawData.length,
        firstTenRowsRaw: rawData.slice(0, 10),
        firstTenRowsFormatted: formattedData.slice(0, 10),
      }
    })

    // Get the first sheet specifically
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const firstSheetData = XLSX.utils.sheet_to_json(firstSheet, {
      raw: false,
      defval: '',
      dateNF: 'd. m. yyyy',
    }) as any[]

    // Also get raw data to check serial numbers
    const firstSheetRawData = XLSX.utils.sheet_to_json(firstSheet, {
      raw: true, // Keep raw serial numbers
      defval: '',
    }) as any[]

    // Filter for Nov 1st entries (Excel serial 45962 or formatted "1. 11. 2025")
    const nov1Entries = firstSheetData.filter((row: any) => {
      const dateField = row['Datum'] || row['Date'] || row['date'] || ''
      const dateStr = String(dateField).trim()
      return dateStr.startsWith('1. 11. 2025') || dateStr === '1. 11. 2025' || dateStr.startsWith('1.11.2025')
    })

    // Also check raw serial numbers for 45962 (Nov 1st, 2025)
    const nov1EntriesRaw = firstSheetRawData.filter((row: any) => {
      const dateField = row['Datum'] || row['Date'] || row['date'] || ''
      return String(dateField) === '45962' || dateField === 45962
    })

    return NextResponse.json({
      filename: file.name,
      fileSize: file.size,
      sheetCount: sheetNames.length,
      sheetNames,
      sheets,
      firstSheetAnalysis: {
        totalRows: firstSheetData.length,
        nov1EntriesCount: nov1Entries.length,
        nov1EntriesRawCount: nov1EntriesRaw.length,
        nov1Entries: nov1Entries.map((row: any) => ({
          date: row['Datum'] || row['Date'],
          project: row['Projekt'] || row['Project'],
          person: row['Osoba'] || row['Person'],
          activity: row['Činnost'] || row['Activity'] || row['Úkol'] || row['Task'],
          hours: row['Natrackováno'] || row['Hours'],
          description: row['Popis'] || row['Description'],
        })),
        nov1EntriesRaw: nov1EntriesRaw.map((row: any) => ({
          dateSerial: row['Datum'] || row['Date'],
          project: row['Projekt'] || row['Project'],
          person: row['Osoba'] || row['Person'],
          activity: row['Činnost'] || row['Activity'] || row['Úkol'] || row['Task'],
          hours: row['Natrackováno'] || row['Hours'],
          description: row['Popis'] || row['Description'],
        })),
        allColumnNames: firstSheetData.length > 0 ? Object.keys(firstSheetData[0]) : [],
        sampleRawDates: firstSheetRawData.slice(0, 5).map((row: any) => ({
          dateSerial: row['Datum'],
          person: row['Osoba'],
          description: row['Popis'],
        })),
      },
    })
  } catch (error) {
    console.error('Excel raw parse error:', error)
    return NextResponse.json({
      error: 'Parse error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
