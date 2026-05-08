/**
 * Exploratory analysis of "Interní" (Internal) activity.
 * Pulls last 6 months of entries with project_category='Internal' and writes
 * a markdown report + supporting CSVs to docs/analyses/.
 *
 * Run: npx tsx scripts/analyze-internal.ts [months]
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(__dirname, '..', '.env.local')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const MONTHS_BACK = parseInt(process.argv[2] ?? '6', 10)

interface Entry {
  person_name: string
  project_name: string
  project_category: string
  activity_name: string
  description: string | null
  date: string
  hours: number
  billable: boolean | null
  approved: boolean | null
}

const stopwords = new Set<string>([
  // CZ
  'a', 'i', 'o', 's', 'k', 'v', 'u', 'z', 'na', 'do', 'po', 'za', 'od', 'pro', 'se',
  've', 'ze', 'je', 'být', 'byt', 'byl', 'byla', 'bylo', 'byly', 'byli', 'jsem', 'jsi',
  'jsme', 'jste', 'jsou', 'ten', 'ta', 'to', 'ty', 'tu', 'ti', 'tě', 'mě', 'my', 'vy',
  'on', 'ona', 'ono', 'oni', 'ony', 'si', 'své', 'svuj', 'svůj', 'svou', 'jak', 'co',
  'kdo', 'kdy', 'kde', 'tak', 'než', 'nez', 'ale', 'nebo', 'pak', 'už', 'uz', 'jen',
  'ještě', 'jeste', 'aby', 'při', 'pri', 'mezi', 'bez', 'dle', 'nad', 'pod', 'před',
  'pred', 'kolem', 'asi', 'také', 'take', 'vše', 'vse', 'více', 'vic', 'velmi',
  'no', 'ano', 'ne', 'je', 'jsme', 'jsi', 'mám', 'mam', 'má', 'ma',
  // EN
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'shall', 'to', 'of', 'in', 'on', 'at',
  'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'from', 'up', 'down', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'now', 'i', 'we', 'you', 'he', 'she', 'it', 'they', 'them',
  'this', 'that', 'these', 'those', 'my', 'our', 'your', 'his', 'her', 'its', 'their',
])

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function tokenize(text: string): string[] {
  return stripDiacritics(text.toLowerCase())
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !stopwords.has(t) && !/^\d+$/.test(t))
}

async function fetchAllPaged<T = Entry>(
  builder: () => any
): Promise<T[]> {
  const pageSize = 1000
  let from = 0
  const all: T[] = []
  while (true) {
    const { data, error } = await builder().range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

function fmtNum(n: number, digits = 1): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function pct(part: number, total: number): string {
  if (total === 0) return '0.0%'
  return `${((part / total) * 100).toFixed(1)}%`
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function writeCsv(filepath: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) {
    fs.writeFileSync(filepath, '')
    return
  }
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => csvCell(row[h])).join(','))
  }
  fs.writeFileSync(filepath, lines.join('\n'))
}

async function main() {
  const today = new Date()
  const dateFromObj = new Date(today)
  dateFromObj.setMonth(dateFromObj.getMonth() - MONTHS_BACK)
  const dateFrom = dateFromObj.toISOString().slice(0, 10)
  const dateTo = today.toISOString().slice(0, 10)

  console.log(`Fetching Internal entries from ${dateFrom} to ${dateTo}…`)
  const internalEntries = await fetchAllPaged<Entry>(() =>
    supabase
      .from('timesheet_entries')
      .select('person_name, project_name, project_category, activity_name, description, date, hours, billable, approved')
      .eq('project_category', 'Internal')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })
  )
  console.log(`  → ${internalEntries.length} entries`)

  console.log(`Fetching ALL entries (any category) for same period for per-person ratios…`)
  const allEntries = await fetchAllPaged<Pick<Entry, 'person_name' | 'hours' | 'project_category'>>(() =>
    supabase
      .from('timesheet_entries')
      .select('person_name, hours, project_category')
      .gte('date', dateFrom)
      .lte('date', dateTo)
  )
  console.log(`  → ${allEntries.length} entries`)

  const totalHours = sum(internalEntries.map(e => Number(e.hours)))
  const totalEntries = internalEntries.length
  const people = new Set(internalEntries.map(e => e.person_name))
  const activities = new Set(internalEntries.map(e => e.activity_name))
  const projects = new Set(internalEntries.map(e => e.project_name))
  const billableHours = sum(internalEntries.filter(e => e.billable).map(e => Number(e.hours)))
  const withDescription = internalEntries.filter(e => e.description && e.description.trim().length > 0)

  // ---- (b) by activity ----
  const byActivity = groupAgg(internalEntries, e => e.activity_name)
  const byActivityRows = byActivity
    .sort((a, b) => b.hours - a.hours)
    .map(r => ({
      activity: r.key,
      hours: round(r.hours),
      pct_of_internal: pct(r.hours, totalHours),
      entries: r.entries,
      people: r.people,
    }))

  // pareto
  let cumHours = 0
  let activitiesFor80 = 0
  for (const r of byActivity.sort((a, b) => b.hours - a.hours)) {
    cumHours += r.hours
    activitiesFor80++
    if (cumHours / totalHours >= 0.8) break
  }

  // ---- (c) by person ----
  const personTotals = new Map<string, number>()
  for (const e of allEntries) {
    personTotals.set(e.person_name, (personTotals.get(e.person_name) ?? 0) + Number(e.hours))
  }
  const byPerson = groupAgg(internalEntries, e => e.person_name)
  // top 3 activities per person
  const personActivityHours = new Map<string, Map<string, number>>()
  for (const e of internalEntries) {
    if (!personActivityHours.has(e.person_name)) personActivityHours.set(e.person_name, new Map())
    const m = personActivityHours.get(e.person_name)!
    m.set(e.activity_name, (m.get(e.activity_name) ?? 0) + Number(e.hours))
  }
  const byPersonRows = byPerson
    .sort((a, b) => b.hours - a.hours)
    .map(r => {
      const top3 = [...(personActivityHours.get(r.key) ?? new Map())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([a, h]) => `${a} (${round(h)}h)`)
        .join('; ')
      const personTotal = personTotals.get(r.key) ?? 0
      return {
        person: r.key,
        internal_hours: round(r.hours),
        all_hours: round(personTotal),
        internal_share: pct(r.hours, personTotal),
        entries: r.entries,
        top_3_activities: top3,
      }
    })

  // ---- (d) person × activity matrix (top 10 × top 10) ----
  const topPeople = byPerson.sort((a, b) => b.hours - a.hours).slice(0, 10).map(r => r.key)
  const topActs = byActivity.sort((a, b) => b.hours - a.hours).slice(0, 10).map(r => r.key)
  const matrix: string[][] = [['person \\ activity', ...topActs.map(truncate(20))]]
  for (const p of topPeople) {
    const m = personActivityHours.get(p) ?? new Map()
    matrix.push([p, ...topActs.map(a => {
      const v = m.get(a) ?? 0
      return v > 0 ? round(v).toString() : '-'
    })])
  }

  // ---- (e) text mining ----
  const unigrams = new Map<string, number>() // hours-weighted
  const bigrams = new Map<string, number>()
  const subcategoryRe = /(meet|porad|standup|review|retro|1on1|onboard|hiring|recruit|admin|interview|workshop|skoleni|prezentac|nabidk|sales|hr |feedback|planning|sprint|sync|kickoff|ofsit|offsite|team)/i
  const subcatHits = new Map<string, { hours: number; count: number; samples: string[] }>()
  for (const e of withDescription) {
    const desc = e.description!
    const tokens = tokenize(desc)
    const h = Number(e.hours)
    for (const t of tokens) unigrams.set(t, (unigrams.get(t) ?? 0) + h)
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]} ${tokens[i + 1]}`
      bigrams.set(bg, (bigrams.get(bg) ?? 0) + h)
    }
    const m = desc.match(subcategoryRe)
    if (m) {
      const key = stripDiacritics(m[0].toLowerCase())
      const cur = subcatHits.get(key) ?? { hours: 0, count: 0, samples: [] }
      cur.hours += h
      cur.count++
      if (cur.samples.length < 5) cur.samples.push(desc.slice(0, 120))
      subcatHits.set(key, cur)
    }
  }
  const topUnigrams = [...unigrams].sort((a, b) => b[1] - a[1]).slice(0, 50)
  const topBigrams = [...bigrams].sort((a, b) => b[1] - a[1]).slice(0, 30)

  // longest descriptions (info-rich samples)
  const longestDescs = [...withDescription]
    .sort((a, b) => (b.description!.length - a.description!.length))
    .slice(0, 20)

  // ---- (f) time patterns ----
  const byMonth = new Map<string, { hours: number; entries: number; people: Set<string> }>()
  const byDow = new Map<number, { hours: number; entries: number }>()
  for (const e of internalEntries) {
    const month = e.date.slice(0, 7)
    if (!byMonth.has(month)) byMonth.set(month, { hours: 0, entries: 0, people: new Set() })
    const m = byMonth.get(month)!
    m.hours += Number(e.hours); m.entries++; m.people.add(e.person_name)

    const dow = new Date(e.date + 'T12:00:00Z').getUTCDay()
    if (!byDow.has(dow)) byDow.set(dow, { hours: 0, entries: 0 })
    const d = byDow.get(dow)!
    d.hours += Number(e.hours); d.entries++
  }
  const dowNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // ---- by project (extra) ----
  const byProject = groupAgg(internalEntries, e => e.project_name)
    .sort((a, b) => b.hours - a.hours)

  // ---- write outputs ----
  const stamp = today.toISOString().slice(0, 10)
  const outDir = path.join(__dirname, '..', 'docs', 'analyses', `internal-activity-${stamp}`)
  fs.mkdirSync(outDir, { recursive: true })
  const reportPath = path.join(__dirname, '..', 'docs', 'analyses', `internal-activity-${stamp}.md`)

  // CSVs
  writeCsv(path.join(outDir, 'entries.csv'), internalEntries.map(e => ({
    date: e.date, person: e.person_name, project: e.project_name,
    activity: e.activity_name, hours: e.hours, description: e.description ?? '',
    billable: e.billable, approved: e.approved,
  })))
  writeCsv(path.join(outDir, 'by-activity.csv'), byActivityRows)
  writeCsv(path.join(outDir, 'by-person.csv'), byPersonRows)
  writeCsv(path.join(outDir, 'by-month.csv'), [...byMonth.entries()]
    .sort()
    .map(([m, v]) => ({ month: m, hours: round(v.hours), entries: v.entries, people: v.people.size })))

  // Markdown report
  const md: string[] = []
  md.push(`# Interní Activity — Exploratory Analysis`)
  md.push(``)
  md.push(`**Period:** ${dateFrom} → ${dateTo} (${MONTHS_BACK} months)`)
  md.push(`**Generated:** ${new Date().toISOString()}`)
  md.push(``)
  md.push(`> Note: 2F Product is now a separate category (not Internal). It is excluded from this analysis.`)
  md.push(``)
  md.push(`## a) Headline metrics`)
  md.push(``)
  md.push(`| Metric | Value |`)
  md.push(`|---|---|`)
  md.push(`| Total Internal hours | **${fmtNum(totalHours)}** |`)
  md.push(`| Entries | ${totalEntries} |`)
  md.push(`| People tracking Internal | ${people.size} |`)
  md.push(`| Distinct \`activity_name\` values | ${activities.size} |`)
  md.push(`| Distinct \`project_name\` values | ${projects.size} |`)
  md.push(`| Billable hours (curiosity) | ${fmtNum(billableHours)} (${pct(billableHours, totalHours)}) |`)
  md.push(`| Entries with non-empty \`description\` | ${withDescription.length} (${pct(withDescription.length, totalEntries)}) |`)
  md.push(`| Activities covering 80% of hours (Pareto) | **${activitiesFor80}** of ${activities.size} |`)
  md.push(``)
  md.push(`## b) By activity (top 30)`)
  md.push(``)
  md.push(`| # | Activity | Hours | % | Entries | People |`)
  md.push(`|---|---|---:|---:|---:|---:|`)
  byActivityRows.slice(0, 30).forEach((r, i) => {
    md.push(`| ${i + 1} | ${r.activity} | ${r.hours} | ${r.pct_of_internal} | ${r.entries} | ${r.people} |`)
  })
  md.push(``)
  md.push(`Full list in \`internal-activity-${stamp}/by-activity.csv\`.`)
  md.push(``)
  md.push(`## c) By person`)
  md.push(``)
  md.push(`| # | Person | Internal h | Total h | Internal % | Entries | Top 3 activities |`)
  md.push(`|---|---|---:|---:|---:|---:|---|`)
  byPersonRows.forEach((r, i) => {
    md.push(`| ${i + 1} | ${r.person} | ${r.internal_hours} | ${r.all_hours} | ${r.internal_share} | ${r.entries} | ${r.top_3_activities} |`)
  })
  md.push(``)
  md.push(`## d) Person × Activity matrix (top 10 × top 10, hours)`)
  md.push(``)
  md.push(`| ${matrix[0].join(' | ')} |`)
  md.push(`| ${matrix[0].map(() => '---').join(' | ')} |`)
  for (let i = 1; i < matrix.length; i++) {
    md.push(`| ${matrix[i].join(' | ')} |`)
  }
  md.push(``)
  md.push(`## e) Text mining of descriptions`)
  md.push(``)
  md.push(`Coverage: **${withDescription.length}** of ${totalEntries} entries (${pct(withDescription.length, totalEntries)}) have a non-empty description.`)
  md.push(``)
  md.push(`### Top unigrams (weighted by hours)`)
  md.push(``)
  md.push(`| Token | Hours |`)
  md.push(`|---|---:|`)
  topUnigrams.forEach(([t, h]) => md.push(`| ${t} | ${fmtNum(h)} |`))
  md.push(``)
  md.push(`### Top bigrams (weighted by hours)`)
  md.push(``)
  md.push(`| Phrase | Hours |`)
  md.push(`|---|---:|`)
  topBigrams.forEach(([t, h]) => md.push(`| ${t} | ${fmtNum(h)} |`))
  md.push(``)
  md.push(`### Subcategory keyword hits`)
  md.push(``)
  md.push(`| Keyword | Hours | Entries | Sample descriptions |`)
  md.push(`|---|---:|---:|---|`)
  ;[...subcatHits.entries()].sort((a, b) => b[1].hours - a[1].hours).forEach(([k, v]) => {
    md.push(`| ${k} | ${fmtNum(v.hours)} | ${v.count} | ${v.samples.map(s => '`' + s.replace(/\|/g, '\\|').replace(/`/g, '\'') + '`').join(' / ')} |`)
  })
  md.push(``)
  md.push(`### 20 longest description samples (info-rich)`)
  md.push(``)
  longestDescs.forEach((e, i) => {
    md.push(`${i + 1}. **${e.person_name}** · ${e.date} · *${e.activity_name}* · ${e.hours}h`)
    md.push(`   > ${e.description!.replace(/\n+/g, ' ')}`)
  })
  md.push(``)
  md.push(`## f) Time patterns`)
  md.push(``)
  md.push(`### By month`)
  md.push(``)
  md.push(`| Month | Hours | Entries | Active people |`)
  md.push(`|---|---:|---:|---:|`)
  ;[...byMonth.entries()].sort().forEach(([m, v]) => {
    md.push(`| ${m} | ${fmtNum(v.hours)} | ${v.entries} | ${v.people.size} |`)
  })
  md.push(``)
  md.push(`### By day of week`)
  md.push(``)
  md.push(`| Day | Hours | Entries |`)
  md.push(`|---|---:|---:|`)
  for (let d = 1; d <= 5; d++) {
    const v = byDow.get(d) ?? { hours: 0, entries: 0 }
    md.push(`| ${dowNames[d]} | ${fmtNum(v.hours)} | ${v.entries} |`)
  }
  for (const d of [0, 6]) {
    const v = byDow.get(d)
    if (v && v.hours > 0) md.push(`| ${dowNames[d]} | ${fmtNum(v.hours)} | ${v.entries} |`)
  }
  md.push(``)
  md.push(`## g) By project (sanity check on the Internal mapping)`)
  md.push(``)
  md.push(`| Project | Hours | Entries | People |`)
  md.push(`|---|---:|---:|---:|`)
  byProject.forEach(r => md.push(`| ${r.key} | ${fmtNum(r.hours)} | ${r.entries} | ${r.people} |`))
  md.push(``)
  md.push(`---`)
  md.push(`Raw data + per-aggregate CSVs in \`internal-activity-${stamp}/\`.`)

  fs.writeFileSync(reportPath, md.join('\n'))
  console.log(`\nReport: ${reportPath}`)
  console.log(`CSVs:   ${outDir}/`)

  // ---- HTML visual report ----
  const htmlPath = path.join(__dirname, '..', 'docs', 'analyses', `internal-activity-${stamp}.html`)
  const subcatRows = [...subcatHits.entries()]
    .sort((a, b) => b[1].hours - a[1].hours)
    .slice(0, 20)
    .map(([k, v]) => ({ label: k, value: v.hours, sublabel: `${fmtNum(v.hours)}h · ${v.count} entries` }))
  const bigramRows = topBigrams.slice(0, 20).map(([t, h]) => ({
    label: t, value: h, sublabel: `${fmtNum(h)}h`,
  }))
  const personRows = byPersonRows.map(r => ({
    label: r.person,
    value: r.internal_hours,
    sublabel: `${r.internal_hours}h · ${r.internal_share} jeho času (z ${r.all_hours}h celk.)`,
  }))
  const dowRows: { label: string; value: number }[] = []
  for (let d = 1; d <= 5; d++) {
    const v = byDow.get(d) ?? { hours: 0, entries: 0 }
    dowRows.push({ label: dowNames[d], value: round(v.hours) })
  }
  for (const d of [6, 0]) {
    const v = byDow.get(d)
    if (v && v.hours > 0) dowRows.push({ label: dowNames[d], value: round(v.hours) })
  }

  const html = renderHtml({
    period: `${dateFrom} → ${dateTo}`,
    months: MONTHS_BACK,
    totalHours,
    people: people.size,
    personRows,
    bigramRows,
    subcatRows,
    dowRows,
  })
  fs.writeFileSync(htmlPath, html)
  console.log(`HTML:   ${htmlPath}`)
}

// ---- HTML/SVG render ----
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

interface BarItem { label: string; value: number; sublabel?: string }

function renderHorizontalBars(items: BarItem[], opts: { width?: number; barColor?: string } = {}): string {
  const width = opts.width ?? 900
  const barColor = opts.barColor ?? '#3b82f6'
  const rowH = 30
  const labelW = 240
  const sublabelW = 230
  const barAreaW = width - labelW - sublabelW - 20
  const max = Math.max(...items.map(i => i.value), 1)
  const height = items.length * rowH + 10

  const rows = items.map((item, i) => {
    const y = i * rowH + 5
    const barW = (item.value / max) * barAreaW
    return `
      <text x="${labelW - 8}" y="${y + 19}" text-anchor="end" font-size="13" fill="#1f2937">${escapeHtml(item.label)}</text>
      <rect x="${labelW}" y="${y + 6}" width="${barW.toFixed(1)}" height="18" fill="${barColor}" rx="2"></rect>
      <text x="${labelW + barW + 8}" y="${y + 19}" font-size="12" fill="#6b7280">${escapeHtml(item.sublabel ?? '')}</text>
    `
  }).join('')

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`
}

function renderVerticalBars(items: BarItem[], opts: { width?: number; height?: number; barColor?: string } = {}): string {
  const width = opts.width ?? 600
  const height = opts.height ?? 280
  const barColor = opts.barColor ?? '#3b82f6'
  const padTop = 30, padBottom = 36, padLeft = 20, padRight = 20
  const plotH = height - padTop - padBottom
  const plotW = width - padLeft - padRight
  const max = Math.max(...items.map(i => i.value), 1)
  const slot = plotW / items.length
  const barW = Math.min(slot * 0.6, 60)

  const bars = items.map((item, i) => {
    const cx = padLeft + slot * (i + 0.5)
    const h = (item.value / max) * plotH
    const y = padTop + plotH - h
    return `
      <rect x="${cx - barW / 2}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" fill="${barColor}" rx="2"></rect>
      <text x="${cx}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="12" fill="#1f2937">${fmtNum(item.value)}</text>
      <text x="${cx}" y="${padTop + plotH + 18}" text-anchor="middle" font-size="13" fill="#1f2937">${escapeHtml(item.label)}</text>
    `
  }).join('')
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px" xmlns="http://www.w3.org/2000/svg">
    <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - padRight}" y2="${padTop + plotH}" stroke="#e5e7eb"></line>
    ${bars}
  </svg>`
}

function renderHtml(d: {
  period: string; months: number; totalHours: number; people: number;
  personRows: BarItem[]; bigramRows: BarItem[]; subcatRows: BarItem[]; dowRows: BarItem[];
}): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>Interní Activity — Visual Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1000px; margin: 40px auto; padding: 0 20px; color: #1f2937; line-height: 1.5; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  h2 { font-size: 20px; margin-top: 40px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .meta { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
  .note { background: #f9fafb; border-left: 3px solid #3b82f6; padding: 10px 14px; margin: 16px 0; font-size: 14px; color: #374151; }
  section { margin-top: 24px; }
  svg { display: block; }
</style>
</head>
<body>
  <h1>Interní Activity — Visual Report</h1>
  <p class="meta"><strong>Period:</strong> ${d.period} (${d.months} months) · <strong>${fmtNum(d.totalHours)}h</strong> · ${d.people} lidí</p>
  <div class="note">Companion to <code>internal-activity-*.md</code>. Same data, four selected views.</div>

  <section>
    <h2>By person</h2>
    ${renderHorizontalBars(d.personRows)}
  </section>

  <section>
    <h2>Top 20 bigrams (hours-weighted)</h2>
    ${renderHorizontalBars(d.bigramRows)}
  </section>

  <section>
    <h2>Subcategory keyword hits (top ${d.subcatRows.length})</h2>
    ${renderHorizontalBars(d.subcatRows)}
  </section>

  <section>
    <h2>By day of week</h2>
    ${renderVerticalBars(d.dowRows)}
  </section>
</body>
</html>`
}

// ---- helpers ----
function sum(xs: number[]): number { return xs.reduce((a, b) => a + b, 0) }
function round(x: number, d = 1): number { return Math.round(x * 10 ** d) / 10 ** d }
function truncate(n: number) { return (s: string) => s.length > n ? s.slice(0, n - 1) + '…' : s }

function groupAgg<T>(items: T[], keyFn: (x: T) => string): { key: string; hours: number; entries: number; people: number }[] {
  const map = new Map<string, { hours: number; entries: number; people: Set<string> }>()
  for (const it of items as any[]) {
    const k = keyFn(it)
    if (!map.has(k)) map.set(k, { hours: 0, entries: 0, people: new Set() })
    const v = map.get(k)!
    v.hours += Number(it.hours)
    v.entries++
    v.people.add(it.person_name)
  }
  return [...map.entries()].map(([key, v]) => ({ key, hours: v.hours, entries: v.entries, people: v.people.size }))
}

main().catch(err => { console.error(err); process.exit(1) })
