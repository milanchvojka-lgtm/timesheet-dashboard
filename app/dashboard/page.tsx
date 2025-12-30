import { getServerSession, getUserData } from "@/lib/auth-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/components/auth/logout-button"
import { User } from "lucide-react"

/**
 * Dashboard Home Page
 *
 * Main dashboard view after successful authentication.
 * Displays user information and provides navigation to analytics.
 */
export default async function DashboardPage() {
  const session = await getServerSession()
  const userData = await getUserData(session?.user?.email)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Analytics</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Team Member</p>
              <p className="text-sm text-muted-foreground">
                {userData?.is_team_member ? "Yes" : "No"}
              </p>
            </div>
            {userData?.costlocker_person_id && (
              <div>
                <p className="text-sm font-medium">Costlocker Person ID</p>
                <p className="text-sm text-muted-foreground">
                  {userData.costlocker_person_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analytics and statistics will be displayed here once data is loaded.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your recent timesheet activities will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
