# Timesheet Analytics V2.0 - Project Guidelines

## Project Overview

This is a Next.js 14 application for analyzing design team timesheet data from Costlocker. Users export data from Costlocker as CSV/Excel files and upload them to the app for analysis.

**Key Technologies:**
- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL database)
- NextAuth.js v5 (Google OAuth)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- PapaParse (CSV parsing), XLSX (Excel parsing)

**Target Deployment:** Vercel (free tier)

---

## 📚 Detailed Documentation

- **[Database & Supabase](docs/DATABASE.md)** - Client setup, query patterns, admin client usage
- **[Authentication](docs/AUTHENTICATION.md)** - NextAuth configuration, protected routes, logout patterns
- **[CSV/Excel Upload System](docs/UPLOAD-SYSTEM.md)** - File parsing, date handling, import flow
- **[Calculations](docs/CALCULATIONS.md)** - FTE calculation, temporal versioning, activity categorization
- **[Review Buddy](docs/REVIEW-BUDDY.md)** - Pre-upload validation tool
- **[UI & Charts](docs/UI-CHARTS.md)** - Recharts patterns, chart colors, visualizations
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

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
docs/                   # Detailed documentation
```

---

## Critical Rules ⚠️

### Database Operations
- ❌ **Never use `createServerClient()` for database ops** - ALWAYS use `createServerAdminClient()` with NextAuth
- ✅ **Always use admin client** - NextAuth sessions don't work with Supabase RLS
- 📖 **See:** [docs/DATABASE.md](docs/DATABASE.md) for full details

### Authentication
- ❌ **Never use form POST for logout** - ALWAYS use server actions with NextAuth v5
- ✅ **Always fetch fresh data** - JWT caches user data, use `getUserData()` for live values
- 📖 **See:** [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for patterns

### Data Quality
- ✅ **Sum hours first, then divide** - Prevents FTE rounding errors
- ✅ **Use UTC for Excel dates** - Prevents timezone shifts
- 📖 **See:** [docs/CALCULATIONS.md](docs/CALCULATIONS.md) and [docs/UPLOAD-SYSTEM.md](docs/UPLOAD-SYSTEM.md)

### General
- ❌ **Never hardcode** - API keys, tokens, secrets
- ❌ **Never use `any`** - always proper TypeScript types
- ❌ **Never skip validation** - always validate input
- ✅ **Always use Server Components** - unless interactivity needed
- ✅ **Always handle errors** - graceful degradation

---

## Common Patterns

### Data Fetching
```typescript
// Server Component fetches data
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// Client Component for interactivity
"use client"
export function ClientComponent({ data }) {
  const [filtered, setFiltered] = useState(data)
  return <Chart data={filtered} />
}
```

### API Route Structure
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // 1. Validate params
  // 2. Check auth
  // 3. Query database with admin client
  // 4. Transform data
  // 5. Return JSON

  return NextResponse.json({ data })
}
```

### Error Handling
```typescript
try {
  const data = await fetchData()
} catch (error) {
  console.error('Error:', error)
  return {
    error: 'Failed to fetch data',
    details: error.message
  }
}
```

---

## UI & Styling

### Tailwind CSS
- Use utility classes over custom CSS
- Responsive design: mobile-first approach
- Dark mode: use `dark:` prefix

### shadcn/ui Components
- Location: `components/ui/`
- Add new: `npx shadcn-ui@latest add button`
- Customize by editing component files directly

### Project Colors
```typescript
const colors = {
  internal: '#3b82f6',  // blue
  ops: '#10b981',       // green
  rnd: '#f59e0b',       // orange
  guiding: '#8b5cf6',   // purple
  pr: '#ec4899',        // pink
  ux: '#06b6d4',        // cyan
}
```

---

## Development Workflow

### Git Workflow
- **Commit format:** `type: description`
- **Types:** feat, fix, docs, style, refactor, test, chore
- **Example:** `feat: add FTE calculation function`

### Environment Variables
```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Testing
- **Unit tests:** Vitest - `__tests__/` next to tested files
- **E2E tests:** Playwright - `e2e/` directory

---

## Documentation Resources

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **NextAuth:** https://next-auth.js.org/
- **Tailwind:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org/

---

## Quick Start

1. Clone repository
2. Copy `.env.example` to `.env.local` and fill in values
3. Install dependencies: `npm install`
4. Run dev server: `npm run dev`
5. Open http://localhost:3000

---

**Remember:** This is a production application. Write clean, maintainable, and well-tested code. Prioritize user experience and data accuracy.
