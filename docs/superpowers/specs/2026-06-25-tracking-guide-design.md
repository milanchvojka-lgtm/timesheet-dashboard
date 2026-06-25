# Tracking Guide — Design Spec

**Date:** 2026-06-25
**Status:** Approved (pending final spec review)

## Problem

Designers are unsure how to track their work into Costlocker. There used to be a printed/Figma
"cheat sheet" (project → keyword in activity description) that made it much easier. We want that
cheat sheet to live inside the Timesheet Analytics app as a clean, always-available reference page,
so tracking is consistent and our reporting/quality scores stay reliable.

The page has **two complementary parts**:
1. **Tracking Guide** (static rules) — the cheat sheet: project → description format. *Part 1.*
2. **Activity Lookup** (data-driven) — answers the reverse question "kam patří *design.ops.status*?"
   by mining real historical entries, cleaned through the categorization rules. *Part 2.*

## Goals

- **Part 1 (Guide):** A single, always-accessible page that shows **which Costlocker project to
  track to** and **what to write in the activity description** for each design-team activity type.
- Make explicit **where the system strictly checks the description format (OPS)** vs. where it is
  just a readability convention (R&D, PR, Internal, Guiding, 2F Product) — this is the key
  improvement over the original cheat sheet and explains *why* the `Hiring:` / `Jobs:` / `Reviews:`
  format matters.
- **Part 2 (Lookup):** Let a designer type a specific activity (e.g. `design.ops.status`,
  `Demo day`) and get a recommendation of where it should be tracked, derived from how the team
  *correctly* tracked similar activities in the past.
- Accessible to everyone (including viewers without team-member role).

## Non-goals

- No dynamic/data-driven content. Content is **static**, hand-maintained in code.
- No editing UI. (Keyword management already lives in Admin → Keywords; this page is read-only.)
- No coverage of billable client-project tracking — the guide is only for the internal/ops
  categories where people get confused.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Content source | Static, hand-maintained |
| Placement | New top-level nav item "Tracking Guide", visible to everyone |
| Language | Czech content (page title/nav may stay English for consistency) |
| Visual style | App-native shadcn cards, category colors from app palette |
| 2F Product | Included as a 6th category |

## Architecture

### Files

- `app/tracking-guide/page.tsx` — Server Component. Renders the static Guide (Part 1) and mounts
  the `<ActivityLookup />` client component (Part 2). Follows the pattern of `app/help/page.tsx`.
- `app/tracking-guide/layout.tsx` — layout wrapper following the existing per-page layout pattern.
- `lib/tracking-guide/guide-data.ts` — single source of truth for the guide content (typed
  constant). Editing the guide = editing this file only.
- `components/dashboard/dashboard-nav.tsx` — add the new nav item.
- `components/tracking-guide/activity-lookup.tsx` — client component for Part 2 (search input,
  common-activities list, results display). Fetches the lookup API.
- `lib/tracking-guide/lookup.ts` — pure functions: query normalization + the
  recommendation/aggregation logic (input: matched rows + keywords → recommendation). Unit-tested.
- `app/api/tracking-guide/lookup/route.ts` — GET endpoint. `?q=` → matching aggregation; empty `q`
  → the "most common activities" list.

### Data model

```ts
interface TrackingEntry {
  title: string                 // e.g. "Hiring"
  descriptionFormat: string     // exact text to type, e.g. "Hiring: Jméno Příjmení"
  examples?: string[]           // e.g. ["Hiring: Jan Novák"]
  belongsHere: string           // what kind of work goes here
}

interface TrackingCategory {
  key: 'ops' | 'guiding' | 'rnd' | 'pr' | 'internal' | 'product'
  label: string                 // display label, e.g. "OPS"
  project: string               // Costlocker project name, e.g. "Design tým OPS"
  color: string                 // category color (hex) from app palette
  strict: boolean               // true = system enforces description format
  intro: string                 // short description of the category
  entries: TrackingEntry[]
}

export const TRACKING_GUIDE: TrackingCategory[]
```

### Category colors (app palette, from CLAUDE.md + 2F Product teal)

| Category | Color |
|---|---|
| OPS | `#3b82f6` (blue) |
| R&D | `#f59e0b` (orange) |
| Guiding | `#8b5cf6` (purple) |
| PR | `#ec4899` (pink) |
| Internal | `#64748b` (slate) |
| 2F Product | `#14b8a6` (teal) |

## Content (Czech, final)

### 🔵 OPS — project `Design tým OPS` — **strict** (system enforces format)
Description **must start** with the keyword + colon, otherwise the entry is "Unpaired" and lowers
the quality score / is flagged by Review Buddy.

| Entry | Description format | Example | Belongs here |
|---|---|---|---|
| Hiring | `Hiring: Jméno Příjmení` | `Hiring: Jan Novák` | Cokoli kolem náboru designerů — od přípravy na interview po onboarding |
| Jobs | `Jobs: Název jobu` | `Jobs: Eurowag redesign` | Příprava jobu k realizaci, matchmaking schůzky, chemistry cally |
| Reviews | `Reviews: Jméno Příjmení` | `Reviews: Petra Malá` | Reviews schůzky — od přípravy po měsíční maintenance |

### 🟣 Guiding — project `Guiding` — free text (anything on a Guiding project counts as Guiding)

| Entry | Description format | Belongs here |
|---|---|---|
| Guiding designer | `Jméno Příjmení designera` | Cokoli kolem guidingu designerů, od přípravy po schůzky |
| Guiding project | `Název jobu` | Cokoli kolem guidingu projektů, od přípravy po schůzky |

### 🟠 R&D — project `Design tým R&D` — free text
- Description: `Název úkolu / aktivity`
- Belongs here: inovace a ladění technik, postupů apod. — vylepšování toho, jak design v 2F funguje.

### 🩷 PR — project `Design tým PR` — free text
- Description: `Název úkolu / aktivity`. Belongs here: jakákoli komunikace o naší práci ven i dovnitř.
- Activity types:
  - Public talky, posty na socky, články
  - Budování vztahů v kanceláři
  - Public & interní komunikace (Design team news, Design therapy & Demoday report)
  - Kuchyňkový výzkum

### ⚪ Internal — project `Design tým interní` — free text
- Description: `Název aktivity`
- Belongs here: všechny aktivity mimo OPS, R&D, PR a Guiding — team sync / work / meetings,
  schůzky, trackování, komunikace (e-mail, chat, telefon…).

### 🟦 2F Product — project `2F Product` — free text
- Description: `Název úkolu / aktivity`
- Belongs here: práce na produktu 2F (vývoj a ladění produktu). R&D-adjacent iniciativa.
- (Import automatically counts team work only; external contributors are filtered out — not shown
  in the guide.)

## Part 2: Activity Lookup ("kam to patří?")

Answers the reverse question: a designer types a specific activity and learns where it *should* be
tracked, based on how the team **correctly** tracked similar activities historically.

### Data source

- Table `timesheet_entries`: `project_name`, `project_category`, `activity_name`, `description`,
  `hours`. Plus the active keywords (for `categorizeActivity`).
- Query via the **admin client** (per CLAUDE.md DB rules), in the API route.

### Query normalization

Same activity is written many ways (`design.ops.status`, `DesignOps status`, `design ops status`).
Normalize both the user query and the searched columns before matching:
- lowercase, split camelCase (`DesignOps` → `design ops`), replace separators (`.`, `_`, `-`, `/`)
  with spaces, collapse whitespace.
- Match = normalized query is a substring of normalized `activity_name` OR `description`.
  (Initial impl: fetch candidate rows with a broad SQL `ILIKE` on the first token, then refine the
  normalized match in JS. Acceptable at design-team data volume.)

### Recommendation logic (`lib/tracking-guide/lookup.ts`, pure & tested)

1. For each matched row, compute `categorizeActivity(activity_name, description, project_name,
   keywords, strict=true)` → detect `Unpaired` (a tracking mistake).
2. Aggregate by `project_category`: sum hours, count entries, count Unpaired.
3. **Recommendation** = the `project_category` with the most hours among **non-Unpaired** entries.
   Map it to its guide entry (project name + description format) via `TRACKING_GUIDE`.
4. Return: `{ recommendation, breakdown[], warning: { unpairedCount, unpairedHours }, examples[] }`.
   - `examples`: a few real, correctly-paired entries (project + description) for illustration.
   - If **no** clean matches exist, return no recommendation and show the relevant static rule
     instead.

### "Most common activities" list

Empty/short query → `GROUP BY activity_name ORDER BY total_hours DESC LIMIT ~20`, each annotated
with its recommended (dominant clean) category. Rendered as clickable chips that run the lookup.

### Lookup UI (`activity-lookup.tsx`, client)

- Debounced search input: "Kam to patří? Napiš aktivitu, např. `DesignOps status`".
- Result card: large recommendation (→ category + project), the description format, a breakdown
  table (kategorie · záznamů · hodin · z toho špatně), a ⚠️ warning banner when Unpaired usage
  exists, and a collapsible list of example entries.
- Below the input: "Časté aktivity" chips (the common-activities list).

### Privacy note

Descriptions can contain people's names (`Hiring: Jméno Příjmení`). This is an internal team tool;
acceptable. Examples show project + description as-is; no extra redaction in v1.

## Page layout

1. **Header** — page title + short intro: "Jak trackovat do Costlockeru a proč na tom záleží."
2. **Legend** — explains the "Projekt → co napsat do popisu" model and the two badges:
   **„Systém hlídá formát"** (strict) vs. **„Volný text"** (free).
3. **Category cards** — one card per category, colored left border in the category color:
   - Card header: project name + strict/free badge.
   - Sub-blocks (entries): entry title, exact `descriptionFormat` shown in `code` style,
     example(s), and "belongs here" text.
   - PR card lists its 4 activity types under one entry.
4. **Responsive grid** — 1 column on mobile, 2 columns on desktop.

## Testing

- **Guide:** lightweight unit test on `guide-data.ts` — every category has a project, color, ≥1
  entry; OPS is the only `strict: true`.
- **Lookup:** unit tests on `lib/tracking-guide/lookup.ts`:
  - Query normalization: `design.ops.status`, `DesignOps status`, `design ops status` all normalize
    equal and match the same rows.
  - Recommendation excludes `Unpaired` rows (fixture with mistakes proves they don't win).
  - "No clean matches" path falls back to the static rule.
- Manual visual check of the rendered page (desktop + mobile widths), nav link, and a live lookup.

## Out of scope / future

- Linking live keyword data from Admin → Keywords into the static Guide (kept editorial/Czech).
- Deep links from Help / Upload / Review Buddy to this page (not requested).
- Per-person / per-month lookup ("kam jsem *já* trackoval X minulý měsíc") — the v1 lookup is
  team-wide and answers "where does this belong", not "where did I personally put it". A personal
  filter (by `person_email` + date range) is a natural follow-up.
- Trigram/GIN index on `activity_name`/`description` if search latency grows.
