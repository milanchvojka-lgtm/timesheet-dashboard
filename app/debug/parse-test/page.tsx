'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ParseTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [rawResult, setRawResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setRawResult(null)
      setError(null)
    }
  }

  const handleRawAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/debug/excel-raw', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed')
      }

      setRawResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/debug/parse-detailed', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parse Test - Detailed Debug</h1>
        <p className="text-muted-foreground">
          Upload your timesheet file to see detailed parsing results and compare with database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Select a CSV or Excel file to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-100"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={!file || loading}>
                {loading ? 'Analyzing...' : 'Analyze Parsed Data'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!file || loading}
                onClick={handleRawAnalysis}
              >
                {loading ? 'Analyzing...' : 'Check Raw Excel'}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {rawResult && (
        <div className="space-y-6">
          {/* Excel File Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Excel File Analysis</CardTitle>
              <CardDescription>Raw data from Excel file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Filename</p>
                    <p className="font-semibold">{rawResult.filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Size</p>
                    <p className="font-semibold">{(rawResult.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Sheets</p>
                    <p className="font-semibold text-2xl">{rawResult.sheetCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sheet Names</p>
                    <p className="font-semibold">{rawResult.sheetNames.join(', ')}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">First Sheet: "{rawResult.sheetNames[0]}"</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rows</p>
                      <p className="text-xl font-bold">{rawResult.firstSheetAnalysis.totalRows}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nov 1st (Formatted)</p>
                      <p className="text-xl font-bold text-red-600">{rawResult.firstSheetAnalysis.nov1EntriesCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nov 1st (Serial 45962)</p>
                      <p className="text-xl font-bold text-green-600">{rawResult.firstSheetAnalysis.nov1EntriesRawCount}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Column Names:</p>
                    <div className="flex flex-wrap gap-1">
                      {rawResult.firstSheetAnalysis.allColumnNames.map((name: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nov 1st Entries by Serial Number */}
          <Card>
            <CardHeader>
              <CardTitle>Nov 1st Entries (Serial 45962)</CardTitle>
              <CardDescription>
                {rawResult.firstSheetAnalysis.nov1EntriesRawCount} entries found by Excel serial number
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rawResult.firstSheetAnalysis.nov1EntriesRawCount > 0 ? (
                <div className="space-y-2">
                  {rawResult.firstSheetAnalysis.nov1EntriesRaw.map((entry: any, idx: number) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Serial:</span> {entry.dateSerial}</div>
                        <div><span className="font-semibold">Person:</span> {entry.person}</div>
                        <div><span className="font-semibold">Project:</span> {entry.project}</div>
                        <div><span className="font-semibold">Hours:</span> {entry.hours}</div>
                        <div className="col-span-2"><span className="font-semibold">Activity:</span> {entry.activity}</div>
                        <div className="col-span-2"><span className="font-semibold">Description:</span> {entry.description || '(none)'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    WARNING: No entries with serial number 45962 found!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The file doesn't contain any entries with Excel serial date 45962 (Nov 1st, 2025).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nov 1st Entries from Formatted Data */}
          <Card>
            <CardHeader>
              <CardTitle>Nov 1st Entries (Formatted Date)</CardTitle>
              <CardDescription>
                {rawResult.firstSheetAnalysis.nov1EntriesCount} entries found by formatted date string
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rawResult.firstSheetAnalysis.nov1EntriesCount > 0 ? (
                <div className="space-y-2">
                  {rawResult.firstSheetAnalysis.nov1Entries.map((entry: any, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Date:</span> {entry.date}</div>
                        <div><span className="font-semibold">Person:</span> {entry.person}</div>
                        <div><span className="font-semibold">Project:</span> {entry.project}</div>
                        <div><span className="font-semibold">Hours:</span> {entry.hours}</div>
                        <div className="col-span-2"><span className="font-semibold">Activity:</span> {entry.activity}</div>
                        <div className="col-span-2"><span className="font-semibold">Description:</span> {entry.description || '(none)'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    WARNING: No Nov 1st entries found by formatted date!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The XLSX library is not converting serial numbers to "1. 11. 2025" format.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Sheets Summary */}
          <Card>
            <CardHeader>
              <CardTitle>All Sheets Summary</CardTitle>
              <CardDescription>First 10 rows from each sheet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rawResult.sheets.map((sheet: any, idx: number) => (
                  <div key={idx} className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">
                      Sheet {idx + 1}: "{sheet.name}" ({sheet.rowCount} rows)
                    </h3>
                    <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto">
                      {JSON.stringify(sheet.firstTenRowsFormatted, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold">{result.summary.totalRows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Rows</p>
                  <p className="text-2xl font-bold text-green-600">{result.summary.validRows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invalid Rows</p>
                  <p className="text-2xl font-bold text-red-600">{result.summary.invalidRows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">November Entries</p>
                  <p className="text-2xl font-bold">{result.summary.novemberEntries}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nov 1st Entries</p>
                  <p className="text-xl font-bold">{result.summary.nov1Entries}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nov 2nd Entries</p>
                  <p className="text-xl font-bold">{result.summary.nov2Entries}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Petra Entries (All Nov)</p>
                  <p className="text-xl font-bold">{result.summary.petraEntries}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Petra Nov 1st</p>
                  <p className="text-xl font-bold text-blue-600">{result.summary.petraNov1}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Petra Nov 2nd</p>
                  <p className="text-xl font-bold text-blue-600">{result.summary.petraNov2}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Petra Nov 1st - Parsed */}
          <Card>
            <CardHeader>
              <CardTitle>Petra Nov 1st - Parsed from File</CardTitle>
              <CardDescription>{result.parsedData.petraNov1Parsed.length} entries found</CardDescription>
            </CardHeader>
            <CardContent>
              {result.parsedData.petraNov1Parsed.length > 0 ? (
                <div className="space-y-2">
                  {result.parsedData.petraNov1Parsed.map((entry: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Person:</span> {entry.person}</div>
                        <div><span className="font-semibold">Date:</span> {entry.date}</div>
                        <div><span className="font-semibold">Project:</span> {entry.project}</div>
                        <div><span className="font-semibold">Hours:</span> {entry.hours}</div>
                        <div className="col-span-2"><span className="font-semibold">Activity:</span> {entry.activity}</div>
                        <div className="col-span-2"><span className="font-semibold">Description:</span> {entry.description || '(none)'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No Petra entries for Nov 1st found in parsed file</p>
              )}
            </CardContent>
          </Card>

          {/* Petra Nov 1st - Database */}
          <Card>
            <CardHeader>
              <CardTitle>Petra Nov 1st - In Database</CardTitle>
              <CardDescription>
                {result.databaseData.nov1InDb.filter((e: any) =>
                  e.person.toLowerCase().includes('petra')
                ).length} entries found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.databaseData.nov1InDb.filter((e: any) =>
                e.person.toLowerCase().includes('petra')
              ).length > 0 ? (
                <div className="space-y-2">
                  {result.databaseData.nov1InDb
                    .filter((e: any) => e.person.toLowerCase().includes('petra'))
                    .map((entry: any, idx: number) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Person:</span> {entry.person}</div>
                        <div><span className="font-semibold">Date:</span> {entry.date}</div>
                        <div><span className="font-semibold">Project:</span> {entry.project}</div>
                        <div><span className="font-semibold">Hours:</span> {entry.hours}</div>
                        <div className="col-span-2"><span className="font-semibold">Activity:</span> {entry.activity}</div>
                        <div className="col-span-2"><span className="font-semibold">Description:</span> {entry.description || '(none)'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No Petra entries for Nov 1st in database</p>
              )}
            </CardContent>
          </Card>

          {/* All Nov 1st - Parsed */}
          <Card>
            <CardHeader>
              <CardTitle>All Nov 1st Entries - Parsed</CardTitle>
              <CardDescription>{result.parsedData.nov1All.length} entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {result.parsedData.nov1All.map((entry: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                    <strong>{entry.person}</strong> - {entry.project} - {entry.activity} - {entry.hours}h
                    {entry.description && <div className="text-muted-foreground ml-2">{entry.description}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Nov 1st - Database */}
          <Card>
            <CardHeader>
              <CardTitle>All Nov 1st Entries - In Database</CardTitle>
              <CardDescription>{result.databaseData.nov1InDb.length} entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {result.databaseData.nov1InDb.map((entry: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                    <strong>{entry.person}</strong> - {entry.project} - {entry.activity} - {entry.hours}h
                    {entry.description && <div className="text-muted-foreground ml-2">{entry.description}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {result.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Errors</CardTitle>
                <CardDescription>{result.errors.length} errors found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.errors.map((error: any, idx: number) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <p className="text-sm">
                        <span className="font-semibold">Row {error.row}:</span> {error.message}
                        {error.field && <span className="text-muted-foreground ml-2">(field: {error.field})</span>}
                        {error.value && <span className="text-muted-foreground ml-2">value: {error.value}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw JSON */}
          <Card>
            <CardHeader>
              <CardTitle>Raw JSON Response</CardTitle>
              <CardDescription>Complete data for debugging</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
