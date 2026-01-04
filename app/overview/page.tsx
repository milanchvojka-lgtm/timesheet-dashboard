import { OverviewView } from "@/components/overview/overview-view"
import { getDataRange } from "@/lib/settings/get-data-range"

/**
 * Overview Page
 *
 * Unified analytics page combining dashboard and monthly detail functionality.
 * Features:
 * - Period selector: Month, Quarter, Year, or Custom Range
 * - Team FTE overview with trends (chart for multi-month periods)
 * - Projects breakdown
 * - Personnel performance
 * - OPS activities categorization
 * - Unpaired items for quality control
 */
export default async function OverviewPage() {
  // Fetch data range settings from database
  const dataRange = await getDataRange()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive team analytics and FTE tracking
        </p>
      </div>
      <OverviewView dataRange={dataRange} />
    </div>
  )
}
