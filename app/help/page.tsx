import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Users, FolderKanban, Activity, Upload, CheckCircle, AlertCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Help & Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Learn how to use the Timesheet Analytics application
        </p>
      </div>

      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Welcome to Timesheet Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This application helps you analyze design team timesheet data from Costlocker.
              You can track team performance, monitor FTE (Full-Time Equivalent) metrics,
              and ensure quality of activity categorization.
            </p>
            <p>
              <strong>Who is this for?</strong> Team leads, project managers, and anyone
              responsible for tracking team capacity and project allocation.
            </p>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Login Requirements</h3>
              <p>Sign in with your <code className="bg-muted px-2 py-1 rounded">@2fresh.cz</code> Google account.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">First Steps</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Log in with your Google account</li>
                <li>Navigate to the Dashboard to see the overview</li>
                <li>Use the date range selector to choose the period you want to analyze</li>
                <li>Explore Monthly Detail views for in-depth analysis</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Understanding FTE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Understanding FTE Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What is FTE?</h3>
              <p className="mb-2">
                FTE (Full-Time Equivalent) represents how much of a full-time workload someone is working.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>1.0 FTE</strong> = Full-time (typically 160 hours per month)</li>
                <li><strong>0.5 FTE</strong> = Half-time (typically 80 hours per month)</li>
                <li><strong>0.25 FTE</strong> = Quarter-time (typically 40 hours per month)</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                FTE is calculated by dividing tracked hours by working hours in the period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Planned vs Actual FTE</h3>
              <p className="mb-2">
                <strong>Planned FTE:</strong> The expected capacity for each team member (set in Admin Panel)
              </p>
              <p className="mb-2">
                <strong>Actual FTE:</strong> The actual tracked hours converted to FTE
              </p>
              <p className="mb-2">
                <strong>Deviation:</strong> The percentage difference between Actual and Planned FTE
              </p>
              <div className="flex gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: "#7BD4B4", color: "#FFFFFF" }}>+15%</Badge>
                  <span className="text-sm">Positive (working more than planned)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: "#8AB5FA", color: "#FFFFFF" }}>-10%</Badge>
                  <span className="text-sm">Minor deviation (-0.01% to -20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: "#EB4899", color: "#FFFFFF" }}>-25%</Badge>
                  <span className="text-sm">Major deviation (below -20%)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quality Score</h3>
              <p>
                The quality score shows what percentage of OPS/Guiding activities are properly
                categorized (Hiring, Jobs, Reviews, or Guiding). Higher scores mean better
                tracking discipline.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>100%</strong> = Perfect categorization</li>
                <li><strong>90-99%</strong> = Good (a few unpaired entries)</li>
                <li><strong>Below 90%</strong> = Needs attention</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <Card>
          <CardHeader>
            <CardTitle>Main Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dashboard */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard / Overview
              </h3>
              <p className="mb-2">
                The main dashboard shows high-level metrics and trends for your selected period:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Total FTE and hours tracked</li>
                <li>Team size and average FTE per person</li>
                <li>Monthly FTE trends over time</li>
                <li>Quick access to monthly detail views</li>
              </ul>
            </div>

            {/* Monthly Detail */}
            <div>
              <h3 className="font-semibold mb-2">Monthly Detail View</h3>
              <p className="mb-2">
                Deep dive into a specific month with three main sections:
              </p>
              <div className="space-y-3 ml-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personnel Performance
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    View each team member&apos;s Actual vs Planned FTE, including deviation percentages
                    and a visual comparison chart for main contributors (FTE ≥ 0.25).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projects Breakdown
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    See how hours are distributed across project categories (OPS, Internal, R&D, etc.)
                    with FTE calculations and visual comparison.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    OPS Activities Breakdown
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown of OPS activities (Hiring, Jobs, Reviews, Guiding) with
                    quality score and hours comparison chart.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Data */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Data
              </h3>
              <p className="mb-2">
                Import timesheet data from Costlocker:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to Costlocker → Timesheet view</li>
                <li>Select your desired date range</li>
                <li>Export to CSV or Excel format</li>
                <li>Navigate to Upload page in this app</li>
                <li>Drag and drop or browse for your file</li>
                <li>Review upload results and statistics</li>
              </ol>
              <p className="mt-2 text-sm text-muted-foreground">
                Supported formats: CSV, XLSX, XLS (max 10MB)
              </p>
            </div>

            {/* Review Buddy */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Review Buddy
              </h3>
              <p className="mb-2">
                Validate your timesheet file before uploading to catch mistakes early:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Export your timesheet from Costlocker</li>
                <li>Go to Review Buddy page</li>
                <li>Upload the file for validation (no data is saved)</li>
                <li>Review quality score and list of unpaired items</li>
                <li>Fix any issues in Costlocker</li>
                <li>Re-validate until quality score is 100%</li>
                <li>Upload via the regular Upload page</li>
              </ol>
              <p className="mt-2 text-sm text-muted-foreground">
                Review Buddy uses strict validation to help maintain data quality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reading Visualizations */}
        <Card>
          <CardHeader>
            <CardTitle>Reading the Visualizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personnel Performance Chart</h3>
              <p className="mb-2">
                Horizontal bar chart showing Actual FTE (orange/peach) vs Planned FTE (purple)
                for each team member:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Only shows main contributors (FTE ≥ 0.25)</li>
                <li>Longer bars = more hours tracked</li>
                <li>Compare the two bars to see if someone is over/under their plan</li>
                <li>Values shown at the end of each bar</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Projects Breakdown Chart</h3>
              <p className="mb-2">
                Single bar chart (green) showing FTE distribution across project categories:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Shows all project categories (OPS, Internal, R&D, etc.)</li>
                <li>Sorted by FTE (highest to lowest)</li>
                <li>Helps identify where team capacity is allocated</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">OPS Activities Chart</h3>
              <p className="mb-2">
                Single bar chart (cyan) showing hours across OPS activity categories:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Shows Hiring, Jobs, Reviews, Guiding activities</li>
                <li>Only shows categories with hours tracked</li>
                <li>Helps understand breakdown of OPS work</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Common Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Common Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Monthly Review Process</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Navigate to Dashboard and select the month to review</li>
                <li>Click on the month to open Monthly Detail view</li>
                <li>Review Personnel Performance - check for large deviations</li>
                <li>Review Projects Breakdown - verify allocation makes sense</li>
                <li>Review OPS Activities - check quality score</li>
                <li>Note any issues or trends for discussion</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Uploading New Data</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Export timesheet from Costlocker (CSV or Excel)</li>
                <li>Optional: Use Review Buddy to validate quality</li>
                <li>Go to Upload page</li>
                <li>Upload the file</li>
                <li>Review upload statistics</li>
                <li>Check Dashboard to see updated metrics</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Checking Team Performance</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Select a date range (month, quarter, or year)</li>
                <li>View FTE trends on Dashboard</li>
                <li>Drill into specific months for details</li>
                <li>Compare Actual vs Planned FTE for each person</li>
                <li>Identify over-utilization or under-utilization</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Use Review Buddy before uploading</strong> - Catch categorization
                mistakes before they enter the system
              </li>
              <li>
                <strong>Regular uploads</strong> - Upload data at least once per month
                for accurate tracking
              </li>
              <li>
                <strong>Monitor deviations</strong> - Large deviations (±20% or more)
                may indicate planning issues
              </li>
              <li>
                <strong>Check quality scores</strong> - Aim for 95%+ quality score
                on OPS activities
              </li>
              <li>
                <strong>Compare periods</strong> - Use date range selector to compare
                quarters or years
              </li>
              <li>
                <strong>Update planned FTE</strong> - Keep planned FTE values current in
                Admin Panel when team members change roles or leave
              </li>
              <li>
                <strong>Export from Costlocker correctly</strong> - Include all necessary
                columns (Date, Person, Project, Activity, Hours)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have questions or encounter issues not covered in this guide:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Contact your team lead or project manager</li>
              <li>Check the latest upload history for potential data issues</li>
              <li>Verify your Costlocker export includes all required columns</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
