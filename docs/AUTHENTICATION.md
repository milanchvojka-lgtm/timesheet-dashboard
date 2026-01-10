# Authentication & Authorization

## NextAuth.js Configuration

- **Provider:** Google OAuth
- **Domain restriction:** Only `@2fresh.cz` emails
- **Session storage:** JWT (stateless tokens)
- **Config location:** `lib/auth.ts`
- **User sync:** Manual sync to Supabase in `signIn` callback

### Why JWT Instead of Database Sessions?

- Simpler setup with NextAuth v5 + Supabase
- Avoids adapter compatibility issues
- Serverless-friendly (no database writes per request)
- Users are still synced to Supabase for app data

---

## Protected Routes

```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## Team Member Check

```typescript
// For Admin Panel access
const isTeamMember = await checkTeamMember(session.user.email)
if (!isTeamMember) {
  return <Unauthorized />
}
```

---

## User Logout (NextAuth v5)

**CRITICAL: Always use server actions for logout** - form POST causes CSRF errors

### ✅ CORRECT - Server Action

```typescript
// app/actions/auth.ts
"use server"
import { signOut } from "@/lib/auth"

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}

// components/auth/logout-button.tsx
"use client"
import { handleSignOut } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <Button onClick={() => handleSignOut()}>
      Sign Out
    </Button>
  )
}
```

### ❌ WRONG - Form POST

```typescript
// This causes CSRF errors!
<form action="/api/auth/signout" method="POST">
  <Button type="submit">Sign Out</Button>
</form>
```

---

## Live Data vs Cached Data

**Problem:** JWT sessions cache user data - changes in database won't appear until re-login

**Solution:** Fetch fresh data on every request using admin client

```typescript
// Dashboard shows live data
const session = await auth() // JWT session (cached)
const userData = await getUserData(session.user.email) // Fresh from DB

// getUserData uses admin client, so data is always current
// Changes in Supabase appear immediately on page refresh
```

---

## Common Auth Patterns

### Get Current User
```typescript
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Use session.user.email, session.user.name, etc.
}
```

### Check Admin Access
```typescript
import { checkTeamMember } from '@/lib/auth-utils'

const isTeamMember = await checkTeamMember(session.user.email)
if (!isTeamMember) {
  return { error: 'Unauthorized' }
}
```

### Sync User to Database
```typescript
// This happens automatically in lib/auth.ts signIn callback
callbacks: {
  async signIn({ user, account, profile }) {
    const supabase = createServerAdminClient()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!existingUser) {
      // Create new user
      await supabase.from('users').insert({
        email: user.email,
        name: user.name,
        avatar_url: user.image,
      })
    }

    return true
  }
}
```

---

## Security Notes

- **Domain restriction:** Only `@2fresh.cz` emails can sign in
- **Session expiry:** JWT tokens expire after 30 days (configurable)
- **CSRF protection:** Built-in with NextAuth v5
- **Secure cookies:** HTTP-only, secure flags enabled in production
