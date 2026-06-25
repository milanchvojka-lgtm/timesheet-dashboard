// app/tracking-guide/page.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TRACKING_GUIDE } from "@/lib/tracking-guide/guide-data"

const OPS = TRACKING_GUIDE.find((c) => c.key === "ops")!
const OTHERS = TRACKING_GUIDE.filter((c) => c.key !== "ops")

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-sm"
      style={{ backgroundColor: color }}
    />
  )
}

export default function TrackingGuidePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Tracking Guide</h1>
        <p className="text-muted-foreground">Kam trackovat a co napsat do popisu.</p>
      </div>

      {/* OPS hero — the only category where the system enforces the format */}
      <Card className="mb-4 border-t-4" style={{ borderTopColor: OPS.color }}>
        <CardContent className="py-5">
          <div className="flex items-center gap-3">
            <Dot color={OPS.color} />
            <span className="text-lg font-bold">{OPS.label}</span>
            <Badge variant="default">formát hlídá systém</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {OPS.project} — {OPS.intro}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {OPS.entries.map((entry) => (
              <div key={entry.title} className="rounded-lg border bg-muted/40 px-3 py-2.5">
                <div className="text-sm font-semibold">{entry.title}</div>
                <code className="mt-1 inline-block rounded bg-muted px-2 py-1 text-xs">
                  {entry.descriptionFormat}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other categories — free text, one short line each */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Ostatní projekty — popis volný
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {OTHERS.map((cat) => (
          <Card key={cat.key} className="border">
            <CardContent className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Dot color={cat.color} />
                {cat.label}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{cat.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
