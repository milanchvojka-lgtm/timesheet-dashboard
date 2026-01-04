import { MonthlyDetailView } from "@/components/monthly-detail/monthly-detail-view"

/**
 * Monthly Detail Page
 *
 * Detailed breakdown of a single month's timesheet data:
 * - Working days and holidays information
 * - Projects breakdown with FTE calculations
 * - Personnel performance (planned vs actual)
 * - OPS activities categorization
 * - Unpaired items for quality control
 */
export default async function MonthlyDetailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monthly Detail</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of timesheet data for a specific month
        </p>
      </div>
      <MonthlyDetailView />
    </div>
  )
}
