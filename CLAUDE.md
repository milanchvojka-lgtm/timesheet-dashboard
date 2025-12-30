# Timesheet Analytics V2.0 - Project Guidelines

## Project Overview

This is a Next.js 14 application for analyzing design team timesheet data from Costlocker API. The app provides trend dashboards, monthly detailed breakdowns, and quality control for timesheet records.

**Key Technologies:**
- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL database + Auth)
- NextAuth.js v5 (Google OAuth)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)

**Target Deployment:**
- Vercel (free tier)
- All functionality must work within free tier limits

---

## Code Style & Conventions

### TypeScript
- **Always use TypeScript** - no JavaScript files
- **Strict mode enabled** - `strict: true` in tsconfig.json
- **Explicit types** - avoid `any`, use proper typing
- **Interface over type** - prefer `interface` for object shapes
- **Descriptive names** - `fetchTimesheetData` not `getData`

### React Components
- **Server Components by default** - use Client Components only when needed
- **"use client" directive** - add at top of file for client components
- **Functional components only** - no class components
- **Named exports for pages** - default exports for components
- **Props interface** - always define props type

Example:
```typescript
// ✅ Good - Server Component
export default async function DashboardPage() {
  const data = await fetchData()
  return <Dashboard data={data} />
}

// ✅ Good - Client Component
"use client"
interface ChartProps {
  data: TimeseriesData[]
}
export function Chart({ data }: ChartProps) {
  return <LineChart data={data} />
}
```

### File Naming
- **Pages:** `page.tsx` (Next.js convention)
- **Layouts:** `layout.tsx` (Next.js convention)
- **Components:** `kebab-case.tsx` (e.g., `metric-tile.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `fte-calculator.ts`)
- **Types:** `*.types.ts` (e.g., `costlocker.types.ts`)

### Project Structure
```
app/                    # Next.js App Router
  (dashboard)/          # Route groups for layouts
  api/                  # API routes
  
components/             # React components
  ui/                   # shadcn/ui components
  charts/               # Chart components
  dashboard/            # Feature-specific components
  
lib/                    # Business logic & utilities
  supabase/             # Database client & queries
  costlocker/           # API integration
  calculations/         # FTE, working days, etc.
  
types/                  # TypeScript type definitions
hooks/                  # Custom React hooks
```

---

## Database & Data Access

### Supabase Client
- **Server-side:** Use `createServerClient()` from `@/lib/supabase/server`
- **Client-side:** Use `createBrowserClient()` from `@/lib/supabase/client`
- **Never expose service role key** - use in API routes only

### Query Patterns
```typescript
// ✅ Server Component
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data, error } = await supabase
  .from('planned_fte')
  .select('*')
  .eq('valid_to', null)

// ✅ Client Component (via API route)
const response = await fetch('/api/admin/fte')
const data = await response.json()
```

### Database Schema
Tables defined in `supabase/migrations/`:
- `users` - User accounts
- `planned_fte` - Planned FTE values per person
- `activity_keywords` - Keywords for activity categorization
- `audit_log` - Admin action history
- `settings` - App configuration
- `ignored_timesheets` - User-ignored timesheet entries

**Always use migrations** - never manual schema changes.

---

## API Integration

### Costlocker API
- **Base URL:** `https://new.costlocker.com/api-public/v2/`
- **Auth:** Basic Auth with API token (server-side only)
- **Rate limit:** 20,000 requests/24h - be mindful
- **Client location:** `lib/costlocker/api.ts`

### API Route Structure
```typescript
// app/api/costlocker/timesheet/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  
  // 1. Validate params
  // 2. Check auth
  // 3. Fetch from Costlocker
  // 4. Transform data
  // 5. Return JSON
  
  return Response.json({ data })
}
```

---

## Authentication & Authorization

### NextAuth.js Configuration
- **Provider:** Google OAuth
- **Domain restriction:** Only `@2fresh.cz` emails
- **Session storage:** Database (Supabase)
- **Config location:** `app/api/auth/[...nextauth]/route.ts`

### Protected Routes
```typescript
// app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <>{children}</>
}
```

### Team Member Check
```typescript
// For Admin Panel access
const isTeamMember = await checkTeamMember(session.user.email)
if (!isTeamMember) {
  return <Unauthorized />
}
```

---

## UI & Styling

### Tailwind CSS
- **Use utility classes** - avoid custom CSS when possible
- **Responsive design** - mobile-first approach (though mobile not fully supported)
- **Dark mode** - use `dark:` prefix for dark mode styles
- **Custom colors** - defined in `tailwind.config.ts`

```typescript
// Project colors
const colors = {
  internal: '#3b82f6',  // blue
  ops: '#10b981',       // green
  rnd: '#f59e0b',       // orange
  guiding: '#8b5cf6',   // purple
  pr: '#ec4899',        // pink
  ux: '#06b6d4',        // cyan
}
```

### shadcn/ui Components
- **Copy-paste components** - not an npm package
- **Location:** `components/ui/`
- **Customization:** Edit component files directly
- **Add new components:** `npx shadcn-ui@latest add button`

### Dark Mode Implementation
```typescript
// Use next-themes
import { ThemeProvider } from 'next-themes'

// In component
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
```

---

## Data Processing & Calculations

### FTE Calculation
```typescript
// lib/calculations/fte.ts
export function calculateFTE(
  trackedHours: number,
  workingHoursInMonth: number
): number {
  return parseFloat((trackedHours / workingHoursInMonth).toFixed(2))
}
```

### Working Days Calculation
- Use `date-holidays` library for Czech holidays
- Formula: `(weekdays - holidays) × 8 hours`
- Location: `lib/calculations/working-days.ts`

### Activity Categorization
```typescript
// lib/calculations/activity-pairing.ts
export function categorizeActivity(
  description: string,
  keywords: ActivityKeyword[]
): ActivityCategory {
  // Case-insensitive matching
  // OPS Hiring: "hiring" or "interview"
  // OPS Jobs: "jobs" or "job"
  // OPS Reviews: "reviews" or "review"
  // Unpaired: no match found
}
```

### Project Name Mapping
```typescript
// config/projects.ts
export const PROJECT_MAPPING = {
  'Design tým OPS_2025': 'OPS',
  'Design tým OPS_2024': 'OPS',
  'Design tým Interní_2025': 'Internal',
  'Design tým Interní_2024': 'Internal',
  // ... handle _2024, _2025, _2026 variants
}
```

---

## Charts & Visualizations

### Recharts Usage
- **Library:** Recharts
- **Components:** LineChart, BarChart, AreaChart
- **Responsive:** Use ResponsiveContainer
- **Custom tooltips:** Always implement CustomTooltip component

Example:
```typescript
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function TrendChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Line type="monotone" dataKey="fte" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Chart Colors
Use project colors consistently:
- Internal: `#3b82f6`
- OPS: `#10b981`
- R&D: `#f59e0b`
- Guiding: `#8b5cf6`
- PR: `#ec4899`
- UX Maturity: `#06b6d4`

---

## Error Handling

### API Errors
```typescript
try {
  const data = await fetchCostlockerData()
} catch (error) {
  console.error('Costlocker API error:', error)
  return {
    error: 'Failed to fetch data from Costlocker',
    details: error.message
  }
}
```

### User-Facing Errors
- **Toast notifications** - use shadcn/ui toast component
- **Error boundaries** - wrap sections that might fail
- **Fallback UI** - show meaningful error messages

### Validation
- **Zod schemas** - for API input validation
- **Form validation** - use react-hook-form + Zod

---

## Performance Considerations

### Server Components
- Fetch data on server when possible
- Reduces client JavaScript bundle
- Faster initial page load

### Caching
```typescript
// API route caching
export const revalidate = 3600 // Cache for 1 hour

// ISR for pages
export const revalidate = 300 // Regenerate every 5 minutes
```

### Image Optimization
```typescript
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  width={40}
  height={40}
  alt="User avatar"
  priority={false}
/>
```

---

## Testing

### Unit Tests (Vitest)
- **Test calculations** - FTE, working days, categorization
- **Test transformers** - data transformation logic
- **Test utilities** - helper functions
- **Location:** `__tests__/` next to tested files

### Integration Tests
- **API routes** - test endpoints with mocked Costlocker API
- **Database queries** - test with Supabase test database

### E2E Tests (Playwright)
- **Critical flows:** Login → Dashboard → Data display
- **Admin flows:** FTE change, keyword management
- **Location:** `e2e/` directory

---

## Environment Variables

Required variables:
```bash
# Next.js
NEXT_PUBLIC_APP_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Costlocker
COSTLOCKER_API_URL=
COSTLOCKER_API_TOKEN=
```

**Never commit .env.local** - use .env.example for reference.

---

## Git Workflow

### Commit Messages
- **Format:** `type: description`
- **Types:** feat, fix, docs, style, refactor, test, chore
- **Example:** `feat: add FTE calculation function`

### Branch Strategy
- **Main branch:** `main` (production)
- **Feature branches:** `feat/feature-name`
- **Bug fixes:** `fix/bug-description`

### Pull Requests
- Create PR with clear description
- Reference issue number if applicable
- Request review from team

---

## Deployment

### Vercel Configuration
- **Framework:** Next.js
- **Build command:** `next build`
- **Output directory:** `.next`
- **Install command:** `npm install`

### Environment Variables in Vercel
- Set all required env vars in Vercel dashboard
- Use different values for preview vs. production

### Database Migrations
```bash
# Run migrations on deploy
npm run db:migrate
```

---

## Common Patterns

### Data Fetching Pattern
```typescript
// 1. Server Component fetches data
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// 2. Client Component for interactivity
"use client"
export function ClientComponent({ data }) {
  const [filtered, setFiltered] = useState(data)
  return <Chart data={filtered} />
}
```

### Loading States
```typescript
// Use loading.tsx in route folders
export default function Loading() {
  return <Skeleton />
}
```

### Error States
```typescript
// Use error.tsx in route folders
"use client"
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Security Best Practices

### Input Validation
- **Always validate** - never trust client input
- **Use Zod** - for schema validation
- **Sanitize** - escape user-provided text

### SQL Injection Prevention
- **Use Supabase client** - parameterized queries
- **Never concatenate** - don't build SQL strings manually

### XSS Prevention
- **React escapes by default** - but be careful with dangerouslySetInnerHTML
- **Sanitize HTML** - if you must render user HTML

### CSRF Protection
- **Next.js handles** - built-in CSRF protection for API routes

---

## Documentation

### Code Comments
- **Why, not what** - explain reasoning, not implementation
- **JSDoc for functions** - document public API
- **TODO comments** - mark incomplete work

Example:
```typescript
/**
 * Calculates FTE (Full-Time Equivalent) based on tracked hours
 * and working hours in the month.
 * 
 * @param trackedHours - Total hours tracked by person
 * @param workingHoursInMonth - Total working hours in month (e.g., 160)
 * @returns FTE value rounded to 2 decimal places
 */
export function calculateFTE(
  trackedHours: number,
  workingHoursInMonth: number
): number {
  return parseFloat((trackedHours / workingHoursInMonth).toFixed(2))
}
```

### README
- Keep README.md updated
- Include setup instructions
- Document environment variables
- Add troubleshooting section

---

## Important Notes for Claude Code

### When Creating Files
1. **Always use TypeScript** - .ts or .tsx extensions
2. **Follow structure** - place files in correct directories
3. **Import paths** - use `@/` alias for absolute imports
4. **Consistent naming** - follow conventions above

### When Implementing Features
1. **Read PRD first** - understand requirements fully
2. **Check existing code** - maintain consistency
3. **Use existing patterns** - don't reinvent
4. **Test as you go** - verify each component works

### When Debugging
1. **Check console** - look for errors
2. **Verify env vars** - ensure all are set
3. **Check API responses** - verify external data
4. **Use TypeScript** - catch type errors early

### Critical Rules
- ❌ **Never hardcode** - API keys, tokens, secrets
- ❌ **Never use `any`** - always proper TypeScript types
- ❌ **Never skip validation** - always validate input
- ✅ **Always use Server Components** - unless interactivity needed
- ✅ **Always handle errors** - graceful degradation
- ✅ **Always test** - verify functionality

---

## Getting Help

### Documentation Resources
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- NextAuth: https://next-auth.js.org/
- Tailwind: https://tailwindcss.com/docs
- Recharts: https://recharts.org/

### When Stuck
1. Check this CLAUDE.md file
2. Check PRD document
3. Check existing similar code
4. Search documentation
5. Ask for clarification if unclear

---

**Remember:** This is a production application. Write clean, maintainable, and well-tested code. Prioritize user experience and data accuracy.
