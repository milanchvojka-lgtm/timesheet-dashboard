import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"

/**
 * Dashboard Home Page
 *
 * Main analytics dashboard with 4 tabs:
 * - Overview: Team FTE trends and key metrics
 * - Projects: Project distribution and evolution
 * - Activities: Activity categorization and OPS breakdown
 * - Team: Individual performance and planned vs actual FTE
 */
export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardTabs />
    </div>
  )
}
