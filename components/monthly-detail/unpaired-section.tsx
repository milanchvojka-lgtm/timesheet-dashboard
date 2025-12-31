"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface UnpairedEntry {
  date: string
  project: string
  activity: string
  hours: number
  description: string
}

interface UnpairedSectionProps {
  dateFrom: string
  dateTo: string
}

export function UnpairedSection({ dateFrom, dateTo }: UnpairedSectionProps) {
  const [unpairedEntries, setUnpairedEntries] = useState<UnpairedEntry[]>([])
  const [qualityScore, setQualityScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/activities?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activities data')
        }

        const result = await response.json()

        // Filter all entries to only OPS and Guiding projects
        const opsEntries = (result.entries || []).filter((entry: any) => {
          const projectNameLower = entry.project_name?.toLowerCase() || ''
          return projectNameLower.includes('ops') || projectNameLower.includes('guiding')
        })

        // Calculate quality score for OPS projects only
        if (opsEntries.length > 0) {
          const opsUnpairedCount = opsEntries.filter((e: any) => e.category === 'Unpaired').length
          const opsPairedCount = opsEntries.length - opsUnpairedCount
          const opsQualityScore = parseFloat(((opsPairedCount / opsEntries.length) * 100).toFixed(1))
          setQualityScore(opsQualityScore)
        } else {
          setQualityScore(100)
        }

        // Filter for unpaired entries ONLY from OPS projects
        const unpaired = opsEntries
          .filter((entry: any) => entry.category === 'Unpaired')
          .map((entry: any) => ({
            date: entry.date || '',
            project: entry.project_name || 'Unknown',
            activity: entry.activity_name || 'Unknown',
            hours: entry.hours || 0,
            description: entry.description || '-',
          }))

        setUnpairedEntries(unpaired)
      } catch (err) {
        console.error('Unpaired items fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFrom, dateTo])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const totalUnpairedHours = unpairedEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {qualityScore === 100 ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          )}
          Quality Control - Unpaired Items
        </CardTitle>
        <CardDescription>
          Items that couldn't be categorized automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unpairedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {qualityScore === 100 ? (
              <>
                <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">Perfect Quality Score!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All timesheet entries have been successfully categorized.
                </p>
                <Badge variant="default" className="mt-4 bg-green-600">
                  Quality Score: 100%
                </Badge>
              </>
            ) : (
              <>
                <div className="mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">No Data Available</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No timesheet entries found for this period.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    {unpairedEntries.length} Unpaired {unpairedEntries.length === 1 ? 'Entry' : 'Entries'}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Total: {totalUnpairedHours.toFixed(2)} hours
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100">
                Quality Score: {qualityScore}%
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpairedEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : '-'}
                    </TableCell>
                    <TableCell>{entry.project || 'Unknown'}</TableCell>
                    <TableCell>{entry.activity || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{(entry.hours || 0).toFixed(2)}</TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {entry.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={3}>Total Unpaired</TableCell>
                  <TableCell className="text-right">{totalUnpairedHours.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
