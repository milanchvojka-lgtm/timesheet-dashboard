# Tracking Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Tracking Guide" page to the dashboard — a static Czech cheat sheet (project → description format) plus a data-driven "kam to patří?" activity lookup.

**Architecture:** New top-level nav page at `/tracking-guide`. Part 1 (Guide) is a Server Component rendering a static typed constant. Part 2 (Lookup) is a client component that calls a GET API route; the route queries `timesheet_entries`, runs each row through the existing `categorizeActivity()` engine to detect mistakes, and recommends a destination based only on correctly-paired history. All data-shaping logic lives in a pure, unit-tested module.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (admin client), shadcn/ui (Card, Badge, Input), Tailwind, Vitest.

## Global Constraints

- TypeScript strict; no `any`; `interface` for object shapes.
- Server Components by default; `"use client"` only where interactivity is required.
- DB access ONLY via `createServerAdminClient()` (never `createServerClient()`).
- Component files: kebab-case. Utilities: kebab-case. Types co-located.
- Guide content language: **Czech**. Nav label/page title may be English.
- Category colors (hex): OPS `#3b82f6`, R&D `#f59e0b`, Guiding `#8b5cf6`, PR `#ec4899`, Internal `#64748b`, 2F Product `#14b8a6`.
- Stored `project_category` values: `OPS`, `Internal`, `R&D`, `Guiding`, `PR`, `UX Maturity`, `2F Product`, `Other`.
- `categorizeActivity(activityName, description, projectName, keywords, strictValidation)` returns `'Unpaired'` for mistakes when `strictValidation = true`.
- Commit after each task. Commit format: `type: description`.

---

### Task 1: Guide content data module

**Files:**
- Create: `lib/tracking-guide/guide-data.ts`
- Test: `lib/tracking-guide/__tests__/guide-data.test.ts`

**Interfaces:**
- Consumes: `ProjectCategory` from `@/types/costlocker.types`.
- Produces:
  - `interface TrackingEntry { title: string; descriptionFormat: string; examples?: string[]; belongsHere: string }`
  - `interface TrackingCategory { key: 'ops'|'guiding'|'rnd'|'pr'|'internal'|'product'; label: string; project: string; projectCategory: ProjectCategory; color: string; strict: boolean; intro: string; entries: TrackingEntry[] }`
  - `const TRACKING_GUIDE: TrackingCategory[]`
  - `function getGuideByProjectCategory(projectCategory: string): TrackingCategory | undefined`

- [ ] **Step 1: Write the failing test**

```ts
// lib/tracking-guide/__tests__/guide-data.test.ts
import { describe, it, expect } from 'vitest'
import { TRACKING_GUIDE, getGuideByProjectCategory } from '../guide-data'

describe('TRACKING_GUIDE', () => {
  it('has the six expected categories', () => {
    expect(TRACKING_GUIDE.map((c) => c.key)).toEqual([
      'ops', 'guiding', 'rnd', 'pr', 'internal', 'product',
    ])
  })

  it('every category is well-formed', () => {
    for (const cat of TRACKING_GUIDE) {
      expect(cat.project.length).toBeGreaterThan(0)
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(cat.entries.length).toBeGreaterThanOrEqual(1)
      expect(cat.intro.length).toBeGreaterThan(0)
    }
  })

  it('OPS is the only strict category', () => {
    const strict = TRACKING_GUIDE.filter((c) => c.strict).map((c) => c.key)
    expect(strict).toEqual(['ops'])
  })

  it('maps a stored project_category back to its guide entry', () => {
    expect(getGuideByProjectCategory('OPS')?.key).toBe('ops')
    expect(getGuideByProjectCategory('2F Product')?.key).toBe('product')
    expect(getGuideByProjectCategory('Other')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/tracking-guide/__tests__/guide-data.test.ts`
Expected: FAIL — cannot find module `../guide-data`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/tracking-guide/guide-data.ts
import { ProjectCategory } from '@/types/costlocker.types'

export interface TrackingEntry {
  title: string
  descriptionFormat: string
  examples?: string[]
  belongsHere: string
}

export interface TrackingCategory {
  key: 'ops' | 'guiding' | 'rnd' | 'pr' | 'internal' | 'product'
  label: string
  project: string
  projectCategory: ProjectCategory
  color: string
  strict: boolean
  intro: string
  entries: TrackingEntry[]
}

export const TRACKING_GUIDE: TrackingCategory[] = [
  {
    key: 'ops',
    label: 'OPS',
    project: 'Design tým OPS',
    projectCategory: 'OPS',
    color: '#3b82f6',
    strict: true,
    intro:
      'Popis musí začínat klíčovým slovem a dvojtečkou, jinak se záznam nespáruje (sníží quality score a nahlásí ho Review Buddy).',
    entries: [
      {
        title: 'Hiring',
        descriptionFormat: 'Hiring: Jméno Příjmení',
        examples: ['Hiring: Jan Novák'],
        belongsHere: 'Cokoli kolem náboru designerů — od přípravy na interview po onboarding.',
      },
      {
        title: 'Jobs',
        descriptionFormat: 'Jobs: Název jobu',
        examples: ['Jobs: Eurowag redesign'],
        belongsHere: 'Příprava jobu k realizaci, matchmaking schůzky, chemistry cally apod.',
      },
      {
        title: 'Reviews',
        descriptionFormat: 'Reviews: Jméno Příjmení',
        examples: ['Reviews: Petra Malá'],
        belongsHere: 'Reviews schůzky — od přípravy po měsíční maintenance.',
      },
    ],
  },
  {
    key: 'guiding',
    label: 'Guiding',
    project: 'Guiding',
    projectCategory: 'Guiding',
    color: '#8b5cf6',
    strict: false,
    intro: 'Cokoli na Guiding projektu se počítá jako Guiding.',
    entries: [
      {
        title: 'Guiding designer',
        descriptionFormat: 'Jméno Příjmení designera',
        belongsHere: 'Cokoli kolem guidingu designerů, od přípravy po schůzky.',
      },
      {
        title: 'Guiding project',
        descriptionFormat: 'Název jobu',
        belongsHere: 'Cokoli kolem guidingu projektů, od přípravy po schůzky.',
      },
    ],
  },
  {
    key: 'rnd',
    label: 'R&D',
    project: 'Design tým R&D',
    projectCategory: 'R&D',
    color: '#f59e0b',
    strict: false,
    intro: 'Volný text — popisuj název úkolu / aktivity.',
    entries: [
      {
        title: 'Inovace & ladění technik, postupů',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Vylepšování toho, jak design v 2F funguje.',
      },
    ],
  },
  {
    key: 'pr',
    label: 'PR',
    project: 'Design tým PR',
    projectCategory: 'PR',
    color: '#ec4899',
    strict: false,
    intro: 'Volný text — jakákoli komunikace o naší práci ven i dovnitř.',
    entries: [
      {
        title: 'Public talky, posty na socky, články',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Komunikace o naší práci směrem ven.',
      },
      {
        title: 'Budování vztahů v kanceláři',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Vztahy a networking v kanceláři.',
      },
      {
        title: 'Public & interní komunikace',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Design team news, Design therapy & Demoday report.',
      },
      {
        title: 'Kuchyňkový výzkum',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Neformální výzkum a sdílení.',
      },
    ],
  },
  {
    key: 'internal',
    label: 'Internal',
    project: 'Design tým interní',
    projectCategory: 'Internal',
    color: '#64748b',
    strict: false,
    intro: 'Všechny aktivity mimo OPS, R&D, PR a Guiding.',
    entries: [
      {
        title: 'Interní aktivity',
        descriptionFormat: 'Název aktivity',
        belongsHere:
          'Team sync / work / meetings, schůzky, trackování, komunikace (e-mail, chat, telefon…).',
      },
    ],
  },
  {
    key: 'product',
    label: '2F Product',
    project: '2F Product',
    projectCategory: '2F Product',
    color: '#14b8a6',
    strict: false,
    intro: 'Volný text — práce na produktu 2F (R&D-adjacent iniciativa).',
    entries: [
      {
        title: 'Práce na produktu 2F',
        descriptionFormat: 'Název úkolu / aktivity',
        belongsHere: 'Vývoj a ladění produktu 2F.',
      },
    ],
  },
]

export function getGuideByProjectCategory(
  projectCategory: string
): TrackingCategory | undefined {
  return TRACKING_GUIDE.find((c) => c.projectCategory === projectCategory)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/tracking-guide/__tests__/guide-data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/tracking-guide/guide-data.ts lib/tracking-guide/__tests__/guide-data.test.ts
git commit -m "feat: add tracking guide content data module"
```

---

### Task 2: Lookup pure logic (normalization + recommendation)

**Files:**
- Create: `lib/tracking-guide/lookup.ts`
- Test: `lib/tracking-guide/__tests__/lookup.test.ts`

**Interfaces:**
- Consumes: `getGuideByProjectCategory` from `./guide-data` (Task 1).
- Produces:
  - `function normalizeText(input: string): string`
  - `function matchesQuery(activityName: string, description: string | null, normalizedQuery: string): boolean`
  - `interface LookupCandidate { projectName: string; projectCategory: string; activityName: string; description: string | null; hours: number; isUnpaired: boolean }`
  - `interface BreakdownRow { projectCategory: string; entryCount: number; totalHours: number; unpairedCount: number }`
  - `interface LookupRecommendation { projectCategory: string; project: string | null; guideKey: string | null }`
  - `interface LookupResult { recommendation: LookupRecommendation | null; breakdown: BreakdownRow[]; warning: { unpairedCount: number; unpairedHours: number }; examples: { projectName: string; description: string | null }[] }`
  - `function buildRecommendation(candidates: LookupCandidate[]): LookupResult`

- [ ] **Step 1: Write the failing test**

```ts
// lib/tracking-guide/__tests__/lookup.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeText, matchesQuery, buildRecommendation } from '../lookup'
import type { LookupCandidate } from '../lookup'

describe('normalizeText', () => {
  it('treats dotted, camelCase, and spaced variants as equal', () => {
    const a = normalizeText('design.ops.status')
    const b = normalizeText('DesignOps status')
    const c = normalizeText('design ops status')
    expect(a).toBe('design ops status')
    expect(b).toBe('design ops status')
    expect(c).toBe('design ops status')
  })
})

describe('matchesQuery', () => {
  it('matches when normalized query is a substring of name or description', () => {
    const nq = normalizeText('DesignOps status')
    expect(matchesQuery('design.ops.status', null, nq)).toBe(true)
    expect(matchesQuery('Meeting', 'weekly design ops status sync', nq)).toBe(true)
    expect(matchesQuery('Hiring', 'Hiring: Jan Novák', nq)).toBe(false)
  })
})

describe('buildRecommendation', () => {
  const rows: LookupCandidate[] = [
    { projectName: 'Design tým interní', projectCategory: 'Internal', activityName: 'design.ops.status', description: 'sync', hours: 10, isUnpaired: false },
    { projectName: 'Design tým interní', projectCategory: 'Internal', activityName: 'design.ops.status', description: 'sync', hours: 5, isUnpaired: false },
    { projectName: 'Design tým OPS', projectCategory: 'OPS', activityName: 'design.ops.status', description: 'status', hours: 30, isUnpaired: true },
  ]

  it('recommends the dominant NON-unpaired category, ignoring mistakes', () => {
    const result = buildRecommendation(rows)
    // OPS has more raw hours (30) but they are all Unpaired → Internal wins.
    expect(result.recommendation?.projectCategory).toBe('Internal')
    expect(result.recommendation?.project).toBe('Design tým interní')
    expect(result.recommendation?.guideKey).toBe('internal')
  })

  it('reports the unpaired warning totals', () => {
    const result = buildRecommendation(rows)
    expect(result.warning.unpairedCount).toBe(1)
    expect(result.warning.unpairedHours).toBe(30)
  })

  it('returns a breakdown row per project_category', () => {
    const result = buildRecommendation(rows)
    const internal = result.breakdown.find((b) => b.projectCategory === 'Internal')
    expect(internal).toEqual({ projectCategory: 'Internal', entryCount: 2, totalHours: 15, unpairedCount: 0 })
  })

  it('falls back to no recommendation when every match is unpaired', () => {
    const allBad: LookupCandidate[] = [
      { projectName: 'Design tým OPS', projectCategory: 'OPS', activityName: 'x', description: 'x', hours: 4, isUnpaired: true },
    ]
    const result = buildRecommendation(allBad)
    expect(result.recommendation).toBeNull()
    expect(result.warning.unpairedCount).toBe(1)
  })

  it('handles an empty candidate list', () => {
    const result = buildRecommendation([])
    expect(result.recommendation).toBeNull()
    expect(result.breakdown).toEqual([])
    expect(result.examples).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/tracking-guide/__tests__/lookup.test.ts`
Expected: FAIL — cannot find module `../lookup`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/tracking-guide/lookup.ts
import { getGuideByProjectCategory } from './guide-data'

export interface LookupCandidate {
  projectName: string
  projectCategory: string
  activityName: string
  description: string | null
  hours: number
  isUnpaired: boolean
}

export interface BreakdownRow {
  projectCategory: string
  entryCount: number
  totalHours: number
  unpairedCount: number
}

export interface LookupRecommendation {
  projectCategory: string
  project: string | null
  guideKey: string | null
}

export interface LookupResult {
  recommendation: LookupRecommendation | null
  breakdown: BreakdownRow[]
  warning: { unpairedCount: number; unpairedHours: number }
  examples: { projectName: string; description: string | null }[]
}

/**
 * Normalize free-text so that "design.ops.status", "DesignOps status" and
 * "design ops status" all collapse to the same comparable string.
 */
export function normalizeText(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camelCase
    .toLowerCase()
    .replace(/[._\-/]+/g, ' ') // separators → space
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
}

export function matchesQuery(
  activityName: string,
  description: string | null,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return false
  const haystack = normalizeText(`${activityName} ${description ?? ''}`)
  return haystack.includes(normalizedQuery)
}

export function buildRecommendation(candidates: LookupCandidate[]): LookupResult {
  const byCategory = new Map<string, BreakdownRow>()
  const cleanHoursByCategory = new Map<string, number>()
  let unpairedCount = 0
  let unpairedHours = 0

  for (const c of candidates) {
    const row =
      byCategory.get(c.projectCategory) ??
      { projectCategory: c.projectCategory, entryCount: 0, totalHours: 0, unpairedCount: 0 }
    row.entryCount += 1
    row.totalHours += c.hours
    if (c.isUnpaired) {
      row.unpairedCount += 1
      unpairedCount += 1
      unpairedHours += c.hours
    } else {
      cleanHoursByCategory.set(
        c.projectCategory,
        (cleanHoursByCategory.get(c.projectCategory) ?? 0) + c.hours
      )
    }
    byCategory.set(c.projectCategory, row)
  }

  const breakdown = Array.from(byCategory.values()).sort((a, b) => b.totalHours - a.totalHours)

  let recommendation: LookupRecommendation | null = null
  let bestCategory: string | null = null
  let bestHours = -1
  for (const [category, hours] of cleanHoursByCategory.entries()) {
    if (hours > bestHours) {
      bestHours = hours
      bestCategory = category
    }
  }
  if (bestCategory) {
    const guide = getGuideByProjectCategory(bestCategory)
    recommendation = {
      projectCategory: bestCategory,
      project: guide?.project ?? null,
      guideKey: guide?.key ?? null,
    }
  }

  const examples = candidates
    .filter((c) => !c.isUnpaired)
    .slice(0, 3)
    .map((c) => ({ projectName: c.projectName, description: c.description }))

  return { recommendation, breakdown, warning: { unpairedCount, unpairedHours }, examples }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/tracking-guide/__tests__/lookup.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add lib/tracking-guide/lookup.ts lib/tracking-guide/__tests__/lookup.test.ts
git commit -m "feat: add tracking guide lookup logic"
```

---

### Task 3: Lookup API route

**Files:**
- Create: `app/api/tracking-guide/lookup/route.ts`

**Interfaces:**
- Consumes: `requireAuth` from `@/lib/auth-utils`; `createServerAdminClient` from `@/lib/supabase/server`; `categorizeActivity`, `ActivityKeyword` from `@/lib/calculations/activity-pairing`; `normalizeText`, `matchesQuery`, `buildRecommendation`, `LookupCandidate` from `@/lib/tracking-guide/lookup`.
- Produces: `GET /api/tracking-guide/lookup?q=<text>`.
  - With `q` (≥2 chars after normalization): returns `LookupResult` as JSON.
  - Without `q`: returns `{ common: { activityName: string; projectCategory: string | null; totalHours: number; entryCount: number }[] }` — top ~20 activity names by hours.

**Note:** This route's branching is verified manually (it depends on live DB). All testable logic lives in Task 2.

- [ ] **Step 1: Write the implementation**

```ts
// app/api/tracking-guide/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { categorizeActivity, ActivityKeyword } from '@/lib/calculations/activity-pairing'
import {
  normalizeText,
  matchesQuery,
  buildRecommendation,
  type LookupCandidate,
} from '@/lib/tracking-guide/lookup'

interface EntryRow {
  project_name: string
  project_category: string
  activity_name: string
  description: string | null
  hours: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerAdminClient()
    const rawQuery = request.nextUrl.searchParams.get('q') ?? ''
    const normalizedQuery = normalizeText(rawQuery)

    // ---- Browse mode: most common activities ----
    if (normalizedQuery.length < 2) {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('activity_name, project_category, hours')
      if (error) throw error

      const agg = new Map<
        string,
        { activityName: string; hoursByCategory: Map<string, number>; totalHours: number; entryCount: number }
      >()
      for (const row of (data ?? []) as Pick<EntryRow, 'activity_name' | 'project_category' | 'hours'>[]) {
        const key = row.activity_name
        const item = agg.get(key) ?? { activityName: key, hoursByCategory: new Map(), totalHours: 0, entryCount: 0 }
        item.totalHours += row.hours
        item.entryCount += 1
        item.hoursByCategory.set(
          row.project_category,
          (item.hoursByCategory.get(row.project_category) ?? 0) + row.hours
        )
        agg.set(key, item)
      }

      const common = Array.from(agg.values())
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 20)
        .map((item) => {
          let topCategory: string | null = null
          let topHours = -1
          for (const [cat, hours] of item.hoursByCategory.entries()) {
            if (hours > topHours) {
              topHours = hours
              topCategory = cat
            }
          }
          return {
            activityName: item.activityName,
            projectCategory: topCategory,
            totalHours: Math.round(item.totalHours * 10) / 10,
            entryCount: item.entryCount,
          }
        })

      return NextResponse.json({ common })
    }

    // ---- Search mode ----
    const { data: keywordsData, error: kwError } = await supabase
      .from('activity_keywords')
      .select('id, category, keyword')
      .eq('is_active', true)
    if (kwError) throw kwError
    const keywords = (keywordsData ?? []) as ActivityKeyword[]

    // Broad pre-filter on the first token, then refine with normalized matching in JS.
    const firstToken = normalizedQuery.split(' ')[0]
    const { data: entries, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('project_name, project_category, activity_name, description, hours')
      .or(`activity_name.ilike.%${firstToken}%,description.ilike.%${firstToken}%`)
      .limit(5000)
    if (entriesError) throw entriesError

    const candidates: LookupCandidate[] = []
    for (const row of (entries ?? []) as EntryRow[]) {
      if (!matchesQuery(row.activity_name, row.description, normalizedQuery)) continue
      const category = categorizeActivity(
        row.activity_name,
        row.description,
        row.project_name,
        keywords,
        true // strict — flags mistakes as 'Unpaired'
      )
      candidates.push({
        projectName: row.project_name,
        projectCategory: row.project_category,
        activityName: row.activity_name,
        description: row.description,
        hours: row.hours,
        isUnpaired: category === 'Unpaired',
      })
    }

    return NextResponse.json(buildRecommendation(candidates))
  } catch (error) {
    console.error('[API] tracking-guide lookup error:', error)
    return NextResponse.json(
      { error: 'Lookup failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`, sign in, then in the browser console or a terminal with the dev session cookie:
- `GET http://localhost:3000/api/tracking-guide/lookup` → `{ common: [...] }` with up to 20 items.
- `GET http://localhost:3000/api/tracking-guide/lookup?q=DesignOps%20status` → JSON with `recommendation`, `breakdown`, `warning`, `examples`.
Expected: 200 responses with the shapes above (or `recommendation: null` if no clean matches).

- [ ] **Step 4: Commit**

```bash
git add app/api/tracking-guide/lookup/route.ts
git commit -m "feat: add tracking guide lookup API route"
```

---

### Task 4: Static Guide page, layout, and nav item

**Files:**
- Create: `app/tracking-guide/layout.tsx`
- Create: `app/tracking-guide/page.tsx`
- Modify: `components/dashboard/dashboard-nav.tsx`

**Interfaces:**
- Consumes: `TRACKING_GUIDE`, `TrackingCategory` from `@/lib/tracking-guide/guide-data` (Task 1); `Card`/`CardContent`/`CardHeader`/`CardTitle`, `Badge` from `@/components/ui/*`.
- Produces: the `/tracking-guide` route rendering Part 1 (static cards). Part 2 mount point is added in Task 5.

- [ ] **Step 1: Add the nav item**

In `components/dashboard/dashboard-nav.tsx`, add `Map` to the lucide import:

```ts
import { Upload, TrendingUp, CheckCircle, Settings, HelpCircle, Users, Map } from "lucide-react"
```

Insert this entry into `allNavItems` immediately before the `Help` item:

```ts
  {
    title: "Tracking Guide",
    href: "/tracking-guide",
    icon: Map,
    requiresTeamMember: false, // Everyone can access
  },
```

- [ ] **Step 2: Create the layout** (mirrors `app/help/layout.tsx`)

```tsx
// app/tracking-guide/layout.tsx
import { redirect } from "next/navigation"
import { getServerSession, checkTeamMember } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function TrackingGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login?callbackUrl=/tracking-guide")
  }
  const isTeamMember = await checkTeamMember(session.user.email)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} isTeamMember={isTeamMember} />
      <DashboardNav isTeamMember={isTeamMember} />
      <main>{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Create the page** (Part 1: static guide)

```tsx
// app/tracking-guide/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TRACKING_GUIDE, type TrackingCategory } from "@/lib/tracking-guide/guide-data"

function CategoryCard({ category }: { category: TrackingCategory }) {
  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: category.color }}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle style={{ color: category.color }}>{category.label}</CardTitle>
          <Badge variant={category.strict ? "default" : "secondary"}>
            {category.strict ? "Systém hlídá formát" : "Volný text"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{category.project}</p>
        <p className="text-sm">{category.intro}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {category.entries.map((entry) => (
          <div key={entry.title} className="space-y-1">
            <h4 className="font-semibold">{entry.title}</h4>
            <code className="inline-block rounded bg-muted px-2 py-1 text-sm">
              {entry.descriptionFormat}
            </code>
            {entry.examples && (
              <p className="text-sm text-muted-foreground">
                Příklad: {entry.examples.join(", ")}
              </p>
            )}
            <p className="text-sm">{entry.belongsHere}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function TrackingGuidePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tracking Guide</h1>
        <p className="text-muted-foreground text-lg">
          Jak trackovat do Costlockeru a proč na tom záleží.
        </p>
      </div>

      <Card className="mb-6 bg-muted/40">
        <CardContent className="py-4 text-sm space-y-1">
          <p>
            <strong>Projekt → co napsat do popisu.</strong> U OPS systém kontroluje formát
            popisu (prefix s dvojtečkou) — u ostatních kategorií je popis jen pro čitelnost.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="flex items-center gap-2">
              <Badge variant="default">Systém hlídá formát</Badge> striktní párování
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="secondary">Volný text</Badge> bez striktní kontroly
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {TRACKING_GUIDE.map((category) => (
          <CategoryCard key={category.key} category={category} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual visual check**

Run `npm run dev`, open `http://localhost:3000/tracking-guide`. Verify: "Tracking Guide" appears in the nav; 6 colored cards render; OPS shows the "Systém hlídá formát" badge, the others "Volný text"; layout is 2 columns on desktop, 1 on mobile (narrow the window).

- [ ] **Step 6: Commit**

```bash
git add app/tracking-guide/layout.tsx app/tracking-guide/page.tsx components/dashboard/dashboard-nav.tsx
git commit -m "feat: add Tracking Guide page, layout, and nav item"
```

---

### Task 5: Activity Lookup client component

**Files:**
- Create: `components/tracking-guide/activity-lookup.tsx`
- Modify: `app/tracking-guide/page.tsx` (mount the component)

**Interfaces:**
- Consumes: the `GET /api/tracking-guide/lookup` route (Task 3); `Card`, `Input`, `Badge` from `@/components/ui/*`.
- Produces: `<ActivityLookup />` (default or named export) — a client component.

- [ ] **Step 1: Create the client component**

```tsx
// components/tracking-guide/activity-lookup.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface BreakdownRow {
  projectCategory: string
  entryCount: number
  totalHours: number
  unpairedCount: number
}
interface LookupResult {
  recommendation: { projectCategory: string; project: string | null; guideKey: string | null } | null
  breakdown: BreakdownRow[]
  warning: { unpairedCount: number; unpairedHours: number }
  examples: { projectName: string; description: string | null }[]
}
interface CommonActivity {
  activityName: string
  projectCategory: string | null
  totalHours: number
  entryCount: number
}

export function ActivityLookup() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<LookupResult | null>(null)
  const [common, setCommon] = useState<CommonActivity[]>([])
  const [loading, setLoading] = useState(false)

  // Load the common-activities list once.
  useEffect(() => {
    fetch("/api/tracking-guide/lookup")
      .then((r) => r.json())
      .then((d) => setCommon(d.common ?? []))
      .catch(() => setCommon([]))
  }, [])

  // Debounced search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null)
      return
    }
    const t = setTimeout(() => {
      setLoading(true)
      fetch(`/api/tracking-guide/lookup?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResult(d))
        .catch(() => setResult(null))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Kam to patří?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Napiš konkrétní aktivitu (např. <code>DesignOps status</code>) a zjisti, kam ji tým
          obvykle správně trackuje.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="DesignOps status, Demo day…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading && <p className="text-sm text-muted-foreground">Hledám…</p>}

        {result && (
          <div className="space-y-3">
            {result.recommendation ? (
              <p className="text-lg">
                → Patří do{" "}
                <strong>{result.recommendation.project ?? result.recommendation.projectCategory}</strong>{" "}
                <span className="text-muted-foreground">({result.recommendation.projectCategory})</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pro tenhle dotaz nemáme čistě spárované záznamy — řiď se pravidly v kartách níže.
              </p>
            )}

            {result.warning.unpairedCount > 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ {result.warning.unpairedCount} záznamů ({Math.round(result.warning.unpairedHours)} h)
                bylo natrackováno špatně (Unpaired).
              </p>
            )}

            {result.breakdown.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1">Kategorie</th>
                    <th>Záznamů</th>
                    <th>Hodin</th>
                    <th>Z toho špatně</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b) => (
                    <tr key={b.projectCategory} className="border-t">
                      <td className="py-1">{b.projectCategory}</td>
                      <td>{b.entryCount}</td>
                      <td>{Math.round(b.totalHours)}</td>
                      <td>{b.unpairedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {result.examples.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Příklady správného trackování:</p>
                <ul className="list-disc list-inside">
                  {result.examples.map((ex, i) => (
                    <li key={i}>
                      {ex.projectName}
                      {ex.description ? ` — ${ex.description}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && common.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Časté aktivity:</p>
            <div className="flex flex-wrap gap-2">
              {common.map((c) => (
                <button
                  key={c.activityName}
                  type="button"
                  onClick={() => setQuery(c.activityName)}
                  className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
                >
                  {c.activityName}
                  {c.projectCategory && (
                    <Badge variant="secondary" className="ml-2">
                      {c.projectCategory}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Mount it in the page**

In `app/tracking-guide/page.tsx`, add the import at the top:

```tsx
import { ActivityLookup } from "@/components/tracking-guide/activity-lookup"
```

Insert `<ActivityLookup />` directly after the legend card and before the `<div className="grid ...">` block:

```tsx
      <ActivityLookup />

      <div className="grid gap-6 md:grid-cols-2">
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual visual check**

Run `npm run dev`, open `/tracking-guide`. Verify: the "Kam to patří?" card shows "Časté aktivity" chips on load; typing `DesignOps status` shows a recommendation (or the "no clean matches" message), a breakdown table, and the ⚠️ warning when applicable; clicking a chip fills the input and runs the lookup.

- [ ] **Step 5: Run the full test suite + commit**

Run: `npx vitest run`
Expected: all tests pass.

```bash
git add components/tracking-guide/activity-lookup.tsx app/tracking-guide/page.tsx
git commit -m "feat: add activity lookup to Tracking Guide page"
```

---

## Notes for the implementer

- `categorizeActivity` matches OPS keywords as a **prefix + colon/space** in the description, and only on projects whose name contains "ops"; Guiding keywords match anywhere on "guiding" projects. Passing `strict = true` is what turns un-prefixed OPS-project entries into `'Unpaired'` — that's the signal the lookup uses to exclude mistakes.
- The lookup API has no automated test (it needs the live DB); keep all logic worth testing in `lib/tracking-guide/lookup.ts`, which is fully covered.
- Do not add a personal/per-user filter — v1 lookup is intentionally team-wide (see spec "Out of scope / future").
