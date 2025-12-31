"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]:', error)
  }, [error])

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl">Dashboard Error</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred while loading the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This could be due to a temporary issue with data loading or an
              unexpected error in the application. Please try refreshing the page.
            </p>

            <details className="text-sm">
              <summary className="cursor-pointer font-medium mb-2 text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                {error.message}
                {error.digest && `\n\nError ID: ${error.digest}`}
              </pre>
            </details>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
