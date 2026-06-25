// components/tracking-guide/activity-lookup.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface BreakdownRow {
  projectCategory: string
  entryCount: number
  totalHours: number
  unpairedCount: number
}
interface LookupResult {
  recommendation: { projectCategory: string; project: string | null; guideKey: string | null } | null
  breakdown: BreakdownRow[]
  warning: { unpairedCount: number; unpairedHours: number }
  examples: { projectName: string; description: string | null }[]
}
interface CommonActivity {
  activityName: string
  projectCategory: string | null
  totalHours: number
  entryCount: number
}

export function ActivityLookup() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<LookupResult | null>(null)
  const [common, setCommon] = useState<CommonActivity[]>([])
  const [loading, setLoading] = useState(false)

  // Load the common-activities list once.
  useEffect(() => {
    fetch("/api/tracking-guide/lookup")
      .then((r) => r.json())
      .then((d) => setCommon(d.common ?? []))
      .catch(() => setCommon([]))
  }, [])

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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Kam to patří?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="DesignOps status, Demo day…"
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

        {!result && common.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {common.map((c) => (
              <button
                key={c.activityName}
                type="button"
                onClick={() => setQuery(c.activityName)}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {c.activityName}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
