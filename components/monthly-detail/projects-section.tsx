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
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban } from "lucide-react"

interface ProjectData {
  category: string
  hours: number
  entryCount: number
  fte: number
  percentage: number
}

interface ProjectsSectionProps {
  dateFrom: string
  dateTo: string
}

export function ProjectsSection({ dateFrom, dateTo }: ProjectsSectionProps) {
  const [data, setData] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/projects?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch projects data')
        }

        const result = await response.json()
        setData(result.summary || [])
      } catch (err) {
        console.error('Projects fetch error:', err)
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

  const totalHours = data.reduce((sum, p) => sum + (p.hours || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Projects Breakdown
        </CardTitle>
        <CardDescription>
          Hours and FTE distribution by project category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">FTE</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((project) => (
              <TableRow key={project.category}>
                <TableCell className="font-medium">{project.category || 'Unknown'}</TableCell>
                <TableCell className="text-right">{(project.hours || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{project.entryCount || 0}</TableCell>
                <TableCell className="text-right">{(project.fte || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">{project.percentage || 0}%</TableCell>
              </TableRow>
            ))}
            {data.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totalHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, p) => sum + (p.entryCount || 0), 0)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, p) => sum + (p.fte || 0), 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No project data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
