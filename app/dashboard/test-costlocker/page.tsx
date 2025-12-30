"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

/**
 * Costlocker API Test Page
 *
 * Test page for verifying Costlocker API connection and fetching sample data
 */
export default function TestCostlockerPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [timesheetResult, setTimesheetResult] = useState<any>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)

  async function testConnection() {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/costlocker/test")
      const data = await response.json()
      setTestResult({ success: response.ok, data })
    } catch (error) {
      setTestResult({
        success: false,
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  async function fetchSampleData() {
    setIsFetchingData(true)
    setTimesheetResult(null)

    try {
      // Fetch last 7 days of data
      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)

      const dateFrom = lastWeek.toISOString().split("T")[0]
      const dateTo = today.toISOString().split("T")[0]

      const response = await fetch(
        `/api/costlocker/timesheet?dateFrom=${dateFrom}&dateTo=${dateTo}&perPage=10`
      )
      const data = await response.json()
      setTimesheetResult({ success: response.ok, data })
    } catch (error) {
      setTimesheetResult({
        success: false,
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      })
    } finally {
      setIsFetchingData(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Costlocker API Test</h1>
        <p className="text-muted-foreground">
          Test the Costlocker API connection and fetch sample data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>
              Verify that the Costlocker API credentials are valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="w-full"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <Badge variant="default">Connection Successful</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge variant="destructive">Connection Failed</Badge>
                    </>
                  )}
                </div>

                <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-64">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Data Fetch */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch Sample Data</CardTitle>
            <CardDescription>
              Fetch timesheet data from the last 7 days (max 10 entries)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchSampleData}
              disabled={isFetchingData}
              className="w-full"
            >
              {isFetchingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch Sample Data"
              )}
            </Button>

            {timesheetResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {timesheetResult.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <Badge variant="default">
                        {timesheetResult.data.meta?.count || 0} entries fetched
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge variant="destructive">Fetch Failed</Badge>
                    </>
                  )}
                </div>

                <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-64">
                  {JSON.stringify(timesheetResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Connection Test:</strong> Verifies that your Costlocker API token is valid
            and the API is accessible.
          </p>
          <p className="text-sm">
            <strong>Sample Data:</strong> Fetches up to 10 timesheet entries from the last 7
            days to verify data transformation is working correctly.
          </p>
          <p className="text-sm text-muted-foreground">
            Note: You must be marked as a team member in the database to access these endpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
