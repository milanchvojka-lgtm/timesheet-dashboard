# Database & Data Access

## Supabase Client Configuration

**IMPORTANT: This app uses NextAuth (not Supabase Auth), so RLS policies don't work with regular client.**

### Client Types

- **For auth/user operations:** Use `createServerAdminClient()` - REQUIRED for NextAuth setup
- **For public data:** Use `createServerClient()` - when RLS allows public access
- **Client-side:** Use `createBrowserClient()` from `@/lib/supabase/client`
- **Never expose service role key** - only use admin client server-side

### Why Admin Client is Needed

- NextAuth manages its own sessions via JWT
- Supabase RLS policies check `auth.uid()` which only exists with Supabase Auth
- Without Supabase Auth, RLS blocks everything
- Admin client bypasses RLS completely

---

## Query Patterns

### Auth/User Queries (MUST use admin client)

```typescript
import { createServerAdminClient } from '@/lib/supabase/server'

const supabase = createServerAdminClient()
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
```

### Public Data Queries (IF RLS allows)

```typescript
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data, error } = await supabase
  .from('public_settings')
  .select('*')
```

### Client Component (via API route)

```typescript
const response = await fetch('/api/admin/fte')
const data = await response.json()
```

---

## Where to Use Admin Client

**ALWAYS use admin client in these locations:**
- `lib/auth.ts` - User sync in `signIn` callback
- `lib/auth.ts` - `checkTeamMember()` function
- `lib/auth-utils.ts` - All helper functions (`getUserData`, `checkTeamMember`, etc.)
- Any server component or API route that queries user data
- Any API route that queries timesheet data, planned FTE, etc.

**Example:**
```typescript
// ✅ CORRECT - Use admin client
import { createServerAdminClient } from '@/lib/supabase/server'

const supabase = createServerAdminClient()
const { data } = await supabase.from('users').select('*')

// ❌ WRONG - Don't use regular client with NextAuth
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()
// This will fail due to RLS policies!
```

---

## Database Schema

Tables defined in `supabase/migrations/`:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (synced from NextAuth) |
| `planned_fte` | Planned FTE values with temporal versioning |
| `activity_keywords` | Keywords for activity categorization |
| `audit_log` | Admin action history |
| `settings` | App configuration |
| `ignored_timesheets` | User-ignored timesheet entries |
| `upload_history` | CSV/Excel upload tracking with statistics |
| `timesheet_entries` | Imported timesheet data from uploads |

**Always use migrations** - never manual schema changes.

---

## Common Query Examples

### Get User Data
```typescript
const supabase = createServerAdminClient()
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

### Get Planned FTE (Date-Aware)
```typescript
const supabase = createServerAdminClient()
const { data: plannedFTEs } = await supabase
  .from('planned_fte')
  .select('*')
  .in('person_name', activeTrackers)
  .lte('valid_from', dateTo)
  .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)
```

### Get Timesheet Entries
```typescript
const supabase = createServerAdminClient()
const { data: entries } = await supabase
  .from('timesheet_entries')
  .select('*')
  .gte('date', dateFrom)
  .lte('date', dateTo)
```

### Get Activity Keywords
```typescript
const supabase = createServerAdminClient()
const { data: keywords } = await supabase
  .from('activity_keywords')
  .select('*')
  .eq('is_active', true)
```

---

## Error Handling

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')

if (error) {
  console.error('Database error:', error)
  return { error: 'Failed to fetch data' }
}

// Use data
```

---

## Security Notes

- **Service role key:** Only use server-side, never expose to client
- **API routes:** Always validate user session before queries
- **Input sanitization:** Validate and sanitize all user inputs
- **SQL injection:** Supabase client uses parameterized queries (safe)
