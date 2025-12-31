"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardCheck, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'

interface UnpairedItem {
  id: string
  date: string
  person_name: string
  project_name: string
  activity_name: string
  hours: number
  description: string
}

interface PersonQuality {
  person_name: string
  totalEntries: number
  pairedEntries: number
  unpairedEntries: number
  qualityScore: number
  totalHours: number
  unpairedHours: number
}

interface ValidationResult {
  success: boolean
  filename: string
  fileSize: number
  totalRows: number
  totalEntries: number
  pairedEntries: number
  unpairedEntries: number
  qualityScore: number
  totalHours: number
  unpairedHours: number
  unpairedItems: UnpairedItem[]
  people: PersonQuality[]
}

export function ReviewBuddyView() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setValidationResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/review-buddy/validate-file', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to validate file')
        return
      }

      setValidationResult(result)
    } catch (err) {
      console.error('Validation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const getQualityBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, text: 'Excellent' }
    if (score >= 70) return { variant: 'secondary' as const, text: 'Good' }
    return { variant: 'destructive' as const, text: 'Needs Review' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8" />
          Review Buddy
        </h1>
        <p className="text-muted-foreground mt-2">
          Pre-upload validation tool - Check your timesheet file before importing to ensure all entries are properly paired
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Timesheet File
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file to validate entries without saving to database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Validating...' : 'Select File to Validate'}
          </Button>

          {uploading && (
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing file, please wait...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Validation Results */}
      {validationResult && (
        <>
          {/* Overall Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.qualityScore >= 90 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                Overall Quality Score
              </CardTitle>
              <CardDescription>
                Results for {validationResult.filename} ({(validationResult.fileSize / 1024).toFixed(2)} KB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                  <div className="text-2xl font-bold">{validationResult.totalEntries}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Paired</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {validationResult.pairedEntries}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unpaired</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {validationResult.unpairedEntries}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                  <div className="text-2xl font-bold">{validationResult.qualityScore.toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-4">
                <Progress value={validationResult.qualityScore} className="h-3" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Hours: {validationResult.totalHours.toFixed(2)} ({validationResult.unpairedHours.toFixed(2)} unpaired)
                </span>
                <Badge variant={getQualityBadge(validationResult.qualityScore).variant}>
                  {getQualityBadge(validationResult.qualityScore).text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Unpaired Items - Main Focus */}
          {validationResult.unpairedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Unpaired Items - Needs Fixing in Costlocker
                </CardTitle>
                <CardDescription>
                  These {validationResult.unpairedItems.length} entries could not be matched to any activity category.
                  Please update them in Costlocker before importing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Person</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.unpairedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.date}</TableCell>
                          <TableCell>{item.person_name}</TableCell>
                          <TableCell>{item.project_name}</TableCell>
                          <TableCell>{item.activity_name}</TableCell>
                          <TableCell className="max-w-xs truncate" title={item.description}>
                            {item.description || '-'}
                          </TableCell>
                          <TableCell className="text-right">{item.hours.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success message if no unpaired items */}
          {validationResult.unpairedItems.length === 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                All entries are properly paired! Your file is ready to import.
              </AlertDescription>
            </Alert>
          )}

          {/* Per-Person Breakdown */}
          {validationResult.people.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Quality by Person</CardTitle>
                <CardDescription>
                  Individual quality scores for each team member in this file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paired</TableHead>
                      <TableHead className="text-right">Unpaired</TableHead>
                      <TableHead>Quality Score</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.people.map((person) => {
                      const badge = getQualityBadge(person.qualityScore)
                      return (
                        <TableRow key={person.person_name}>
                          <TableCell className="font-medium">{person.person_name}</TableCell>
                          <TableCell className="text-right">{person.totalEntries}</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            {person.pairedEntries}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">
                            {person.unpairedEntries}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={person.qualityScore} className="h-2 flex-1" />
                              <span className="text-sm font-medium w-12 text-right">
                                {person.qualityScore.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={badge.variant}>{badge.text}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
