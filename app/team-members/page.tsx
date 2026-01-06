import { TeamMembersView } from '@/components/team-members/team-members-view'
import { getDataRange } from '@/lib/settings/get-data-range'

/**
 * Team Members Page
 *
 * Individual performance breakdown for all team members
 * Shows projects and OPS activities breakdown for each person
 */
export default async function TeamMembersPage() {
  // Fetch data range settings from database
  const dataRange = await getDataRange()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">
          Individual performance breakdown for all team members
        </p>
      </div>
      <TeamMembersView dataRange={dataRange} />
    </div>
  )
}
