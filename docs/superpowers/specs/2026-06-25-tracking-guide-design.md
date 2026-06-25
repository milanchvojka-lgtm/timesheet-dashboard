# Tracking Guide — Design Spec

**Date:** 2026-06-25
**Status:** Approved (pending final spec review)

## Problem

Designers are unsure how to track their work into Costlocker. There used to be a printed/Figma
"cheat sheet" (project → keyword in activity description) that made it much easier. We want that
cheat sheet to live inside the Timesheet Analytics app as a clean, always-available reference page,
so tracking is consistent and our reporting/quality scores stay reliable.

## Goals

- A single, always-accessible page that shows **which Costlocker project to track to** and
  **what to write in the activity description** for each design-team activity type.
- Make explicit **where the system strictly checks the description format (OPS)** vs. where it is
  just a readability convention (R&D, PR, Internal, Guiding, 2F Product) — this is the key
  improvement over the original cheat sheet and explains *why* the `Hiring:` / `Jobs:` / `Reviews:`
  format matters.
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

- `app/tracking-guide/page.tsx` — Server Component, renders the guide. Follows the pattern of
  existing pages (e.g. `app/help/page.tsx`).
- `app/tracking-guide/layout.tsx` — layout wrapper following the existing per-page layout pattern.
- `lib/tracking-guide/guide-data.ts` — single source of truth for the guide content (typed
  constant). Editing the guide = editing this file only.
- `components/dashboard/dashboard-nav.tsx` — add the new nav item.

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

- The guide content is static; a lightweight unit test on `guide-data.ts` asserts the constant is
  well-formed (every category has a project, color, ≥1 entry; OPS is the only `strict: true`).
- Manual visual check of the rendered page (desktop + mobile widths) and nav link.

## Out of scope / future

- Linking live keyword data from Admin → Keywords (could be a future enhancement; deliberately not
  done now to keep content fully editorial and Czech).
- Deep links from Help / Upload / Review Buddy to this page (not requested).
