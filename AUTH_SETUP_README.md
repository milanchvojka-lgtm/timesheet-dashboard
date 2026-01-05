# Authentication Setup - Complete Guide

This document explains the authentication system implemented in the Timesheet Analytics application.

## Overview

The application uses **NextAuth.js v5** with **Google OAuth** for authentication, restricted to @2fresh.cz domain only. User sessions are stored in **Supabase** via the Supabase adapter.

## Architecture

### Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. Redirected to Google OAuth consent screen
3. Google verifies user is from @2fresh.cz domain
4. User approves access (email, profile)
5. Callback to `/api/auth/callback/google`
6. NextAuth creates user record in Supabase `users` table
7. Session created and stored in Supabase
8. User redirected to `/overview`

### Key Components

#### 1. NextAuth Configuration (`lib/auth.ts`)
- Defines Google OAuth provider with domain restriction
- Configures Supabase adapter for session storage
- Implements callbacks for domain validation and team member checking
- Adds custom user properties (isTeamMember)

#### 2. Auth Utilities (`lib/auth-utils.ts`)
Helper functions for server components:
- `getServerSession()` - Get current user session
- `checkTeamMember(email)` - Verify if user is a team member
- `getUserData(email)` - Fetch user details from database
- `requireAuth()` - Require authentication for a page
- `requireTeamMember()` - Require team member access

#### 3. API Route (`app/api/auth/[...nextauth]/route.ts`)
Handles all NextAuth endpoints:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/google` - OAuth callback
- `/api/auth/session` - Get session
- `/api/auth/csrf` - CSRF token

#### 4. Login Page (`app/login/page.tsx`)
- Server component that checks if user is already authenticated
- Redirects authenticated users to dashboard
- Renders login form for unauthenticated users

#### 5. Login Form (`components/auth/login-form.tsx`)
- Client component with Google sign-in button
- Handles loading states
- Displays user-friendly error messages

#### 6. Middleware (`middleware.ts`)
- Runs on every request (except static files)
- Simple pass-through for NextAuth v5
- Authentication checking happens at page level

#### 7. Protected Routes (Various layout files)
- Layout components wrap protected pages (`app/overview/layout.tsx`, `app/upload/layout.tsx`, etc.)
- Check authentication using `getServerSession()`
- Redirect to login if not authenticated

## Domain Restriction

Only @2fresh.cz emails are allowed to sign in. This is enforced in two places:

1. **Google OAuth configuration** - `hd: "2fresh.cz"` parameter
2. **NextAuth signIn callback** - Checks email domain and rejects others

```typescript
// In lib/auth.ts
async signIn({ user, profile }) {
  const email = user.email || profile?.email

  if (!email?.endsWith("@2fresh.cz")) {
    return false // Reject sign-in
  }

  return true
}
```

## Team Member Status

Users have an `is_team_member` flag in the database. This is used to:
- Grant access to team-specific features
- Display team member data in dashboards
- Filter analytics to team members only

Check team member status:
```typescript
import { checkTeamMember } from "@/lib/auth-utils"

const session = await getServerSession()
const isTeamMember = await checkTeamMember(session.user.email)

if (!isTeamMember) {
  return <Unauthorized />
}
```

## Protecting Pages

### Method 1: Layout-based Protection (Recommended)

Create a layout that checks authentication:

```typescript
// app/(protected)/layout.tsx
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"

export default async function ProtectedLayout({ children }) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login?callbackUrl=/protected")
  }

  return <>{children}</>
}
```

All pages under this layout are automatically protected.

### Method 2: Page-level Protection

Check authentication directly in the page:

```typescript
// app/profile/page.tsx
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"

export default async function ProfilePage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return <div>Profile for {session.user.name}</div>
}
```

### Method 3: Team Member Protection

Require team member access:

```typescript
import { redirect } from "next/navigation"
import { requireTeamMember } from "@/lib/auth-utils"

export default async function AdminPage() {
  const session = await requireTeamMember()

  if (!session) {
    redirect("/unauthorized")
  }

  return <div>Admin Panel</div>
}
```

## Session Management

Sessions are stored in Supabase using the NextAuth Supabase adapter:
- **Storage**: PostgreSQL database
- **Expiration**: 30 days (configurable in `lib/auth.ts`)
- **Strategy**: Database sessions (not JWT)

### Why Database Sessions?

- More secure (can be revoked immediately)
- Supports multiple devices
- Integrates with Supabase RLS policies
- Allows session metadata tracking

## API Route Protection

Protect API routes by checking authentication:

```typescript
// app/api/admin/route.ts
import { NextRequest } from "next/server"
import { getServerSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Your protected logic here
  return Response.json({ data: "..." })
}
```

## Sign Out

### Client Component

```typescript
"use client"
import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  )
}
```

### Server Component (Form)

```typescript
export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button type="submit">Sign Out</button>
    </form>
  )
}
```

## Environment Variables

Required environment variables (add to `.env.local`):

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase (for session storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## TypeScript Types

Custom session types are defined in `types/next-auth.d.ts`:

```typescript
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isTeamMember?: boolean
    } & DefaultSession["user"]
  }
}
```

Access custom properties:

```typescript
const session = await getServerSession()
console.log(session.user.id) // ✅ TypeScript knows this exists
console.log(session.user.isTeamMember) // ✅ TypeScript knows this exists
```

## Security Features

### 1. Domain Restriction
Only @2fresh.cz emails can sign in

### 2. CSRF Protection
Built into NextAuth.js

### 3. Secure Cookies
HTTPOnly, Secure, SameSite cookies

### 4. Row Level Security
Supabase RLS policies protect user data

### 5. Service Role Separation
Service role key only used server-side

## Testing Authentication

### 1. Test Login Flow
1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Use @2fresh.cz account
4. Should redirect to dashboard

### 2. Test Domain Restriction
1. Try signing in with non-@2fresh.cz email
2. Should see "Access denied" error

### 3. Test Protected Routes
1. Go to http://localhost:3000/overview (not logged in)
2. Should redirect to /login
3. After login, should access overview

### 4. Test Sign Out
1. Click "Sign Out" button
2. Should redirect to home page
3. Session should be cleared

## Troubleshooting

### Error: "Configuration" during sign in
- Check all environment variables are set
- Verify `NEXTAUTH_SECRET` is set
- Restart dev server after changing `.env.local`

### Error: "Access denied. Only @2fresh.cz emails are allowed"
- Working as intended for non-@2fresh.cz emails
- Check OAuth consent screen is set to "Internal"

### Error: "redirect_uri_mismatch"
- Verify redirect URI in Google Cloud Console
- Should be: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes (should not have any)

### User not marked as team member
- Check `users` table in Supabase
- Update `is_team_member` field manually:
  ```sql
  UPDATE users
  SET is_team_member = true
  WHERE email = 'user@2fresh.cz';
  ```

## Next Steps

1. Set up Google OAuth credentials (see `GOOGLE_OAUTH_SETUP.md`)
2. Configure Supabase project (see `SUPABASE_SETUP_GUIDE.md`)
3. Add environment variables to `.env.local`
4. Test authentication flow
5. Implement team member features
6. Build dashboard and analytics pages

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Supabase Adapter](https://authjs.dev/reference/adapter/supabase)

---

**Authentication setup complete!** You now have a fully functional Google OAuth system with domain restriction and Supabase session storage.
