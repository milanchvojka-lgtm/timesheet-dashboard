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
import { Users } from "lucide-react"

interface TeamMember {
  person_name: string
  actualFTE: number
  plannedFTE: number
  deviation: number
  hours: number
  entryCount: number
}

interface PersonnelSectionProps {
  dateFrom: string
  dateTo: string
}

export function PersonnelSection({ dateFrom, dateTo }: PersonnelSectionProps) {
  const [data, setData] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/team?dateFrom=${dateFrom}&dateTo=${dateTo}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch team data')
        }

        const result = await response.json()
        setData(result.team || [])
      } catch (err) {
        console.error('Team fetch error:', err)
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

  const getDeviationColor = (deviation: number) => {
    if (deviation >= 10) return 'default'
    if (deviation >= -10) return 'secondary'
    return 'destructive'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Personnel Performance
        </CardTitle>
        <CardDescription>
          Planned vs Actual FTE comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actual FTE</TableHead>
              <TableHead className="text-right">Planned FTE</TableHead>
              <TableHead className="text-right">Deviation</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Entries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((member) => (
              <TableRow key={member.person_name}>
                <TableCell className="font-medium">{member.person_name || 'Unknown'}</TableCell>
                <TableCell className="text-right font-medium">{(member.actualFTE || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{(member.plannedFTE || 0) > 0 ? (member.plannedFTE || 0).toFixed(2) : '-'}</TableCell>
                <TableCell className="text-right">
                  {(member.plannedFTE || 0) > 0 ? (
                    <Badge variant={getDeviationColor(member.deviation || 0)}>
                      {(member.deviation || 0) > 0 ? '+' : ''}{member.deviation || 0}%
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">{(member.hours || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{member.entryCount || 0}</TableCell>
              </TableRow>
            ))}
            {data.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{data.reduce((sum, m) => sum + (m.actualFTE || 0), 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, m) => sum + (m.plannedFTE || 0), 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">{data.reduce((sum, m) => sum + (m.hours || 0), 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{data.reduce((sum, m) => sum + (m.entryCount || 0), 0)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No personnel data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
