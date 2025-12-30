import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"
import { LoginForm } from "@/components/auth/login-form"

/**
 * Login Page
 *
 * Features:
 * - Google OAuth sign-in
 * - Restricted to @2fresh.cz domain
 * - Redirects to dashboard if already authenticated
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  // Check if user is already authenticated
  const session = await getServerSession()

  if (session) {
    // Redirect to dashboard or callback URL
    const callbackUrl = searchParams.callbackUrl || "/dashboard"
    redirect(callbackUrl)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md px-4">
        <LoginForm error={searchParams.error} />
      </div>
    </div>
  )
}
