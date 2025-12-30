"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { handleSignOut } from "@/app/actions/auth"
import { useState } from "react"

/**
 * Logout Button Component
 *
 * Client component that handles user sign out using NextAuth v5 server action.
 * Includes loading state to prevent duplicate submissions.
 */
export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await handleSignOut()
    } catch (error) {
      console.error("Error signing out:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  )
}
