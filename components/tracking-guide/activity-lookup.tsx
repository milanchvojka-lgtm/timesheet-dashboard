// components/tracking-guide/activity-lookup.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface BreakdownRow {
  projectCategory: string
  entryCount: number
  totalHours: number
  unpairedCount: number
}
interface LookupResult {
  recommendation: {
    projectCategory: string
    project: string | null
    guideKey: string | null
    overridden: boolean
    previousCategory: string | null
  } | null
  breakdown: BreakdownRow[]
  warning: { unpairedCount: number; unpairedHours: number }
  examples: { projectName: string; description: string | null }[]
}

export function ActivityLookup() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<LookupResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Debounced search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null)
      return
    }
    const t = setTimeout(() => {
      setLoading(true)
      fetch(`/api/tracking-guide/lookup?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResult(d))
        .catch(() => setResult(null))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <Input
          placeholder="Napiš název aktivity, např. Demoday"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading && <p className="text-sm text-muted-foreground">Hledám…</p>}

        {result && (
          <div className="space-y-1">
            {result.recommendation ? (
              <p className="text-base">
                →{" "}
                <strong className="text-teal-700">{result.recommendation.projectCategory}</strong>
                {result.recommendation.project ? ` · ${result.recommendation.project}` : ""}
                {result.recommendation.previousCategory && (
                  <span className="text-muted-foreground">
                    {" "}(nově — historicky šlo na {result.recommendation.previousCategory})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pro tenhle dotaz nemáme čistě spárované záznamy — řiď se pravidly nahoře.
              </p>
            )}

            {result.warning.unpairedCount > 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ {result.warning.unpairedCount} záznamů ({Math.round(result.warning.unpairedHours)} h)
                šlo omylem jinam.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
