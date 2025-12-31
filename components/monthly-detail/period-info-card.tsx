"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Sparkles } from "lucide-react"
import { calculateWorkingDays } from "@/lib/calculations/working-days"

interface PeriodInfoCardProps {
  year: number
  month: number
}

export function PeriodInfoCard({ year, month }: PeriodInfoCardProps) {
  const [info, setInfo] = useState<ReturnType<typeof calculateWorkingDays> | null>(null)

  useEffect(() => {
    const result = calculateWorkingDays(year, month)
    setInfo(result)
  }, [year, month])

  if (!info) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Period Information
        </CardTitle>
        <CardDescription>
          {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Working Hours
            </div>
            <div className="text-2xl font-bold text-primary">{info.workingHours}</div>
            <div className="text-xs text-muted-foreground">
              {info.workingDays} working days × 8 hours
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Working Days
            </div>
            <div className="text-2xl font-bold">{info.workingDays}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Holidays
            </div>
            <div className="text-2xl font-bold">{info.holidays.length}</div>
            {info.holidays.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {info.holidays.map(h => {
                  // Format date as "d. m." (e.g., "1. 11.")
                  const date = new Date(h.date)
                  const day = date.getDate()
                  const month = date.getMonth() + 1
                  return `${h.name} (${day}. ${month}.)`
                }).join(', ')}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Total Days
            </div>
            <div className="text-2xl font-bold">{info.totalDays}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
