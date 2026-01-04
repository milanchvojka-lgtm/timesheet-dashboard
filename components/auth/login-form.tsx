"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Chrome } from "lucide-react"
import { useState } from "react"

interface LoginFormProps {
  error?: string
}

/**
 * Login Form Component
 *
 * Displays Google OAuth sign-in button with error handling
 */
export function LoginForm({ error }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/overview",
      })
    } catch (error) {
      console.error("Sign-in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">
          Timesheet Analytics
        </CardTitle>
        <CardDescription>
          Sign in with your 2Fresh Google account to access the dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {getErrorMessage(error)}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Chrome className="mr-2 h-5 w-5" />
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Only @2fresh.cz email addresses are allowed
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Convert NextAuth error codes to user-friendly messages
 */
function getErrorMessage(error: string): string {
  switch (error) {
    case "OAuthSignin":
      return "Error connecting to Google. Please try again."
    case "OAuthCallback":
      return "Error during authentication. Please try again."
    case "OAuthCreateAccount":
      return "Could not create account. Please contact support."
    case "EmailCreateAccount":
      return "Could not create account. Please contact support."
    case "Callback":
      return "Authentication error. Please try again."
    case "OAuthAccountNotLinked":
      return "This email is already associated with another account."
    case "EmailSignin":
      return "Email sign-in failed. Please try again."
    case "CredentialsSignin":
      return "Invalid credentials. Please try again."
    case "SessionRequired":
      return "Please sign in to access this page."
    case "AccessDenied":
      return "Access denied. Only @2fresh.cz emails are allowed."
    default:
      return "An error occurred during sign-in. Please try again."
  }
}
