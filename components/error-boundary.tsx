"use client"

import { Component, ReactNode } from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary Component
 *
 * Catches errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
            <CardDescription>
              An error occurred while rendering this component
            </CardDescription>
          </CardHeader>
          <CardContent>
            {this.state.error && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer font-medium mb-2">
                  Error details
                </summary>
                <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Data Error Fallback
 *
 * Displays a user-friendly error message for data fetching errors
 */
interface DataErrorFallbackProps {
  error?: string
  onRetry?: () => void
  title?: string
}

export function DataErrorFallback({
  error = "Failed to load data",
  onRetry,
  title = "Unable to Load Data",
}: DataErrorFallbackProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          <CardTitle className="text-yellow-900 dark:text-yellow-100">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          {error}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardFooter>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

/**
 * Empty State Component
 *
 * Displays when there's no data to show
 */
interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  title = "No Data Available",
  description = "There is no data to display for the selected period",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  )
}
