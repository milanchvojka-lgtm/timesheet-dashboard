# UI & Charts

## Recharts Usage

- **Library:** Recharts
- **Components:** LineChart, BarChart, AreaChart
- **Responsive:** Use ResponsiveContainer
- **Custom tooltips:** Always implement CustomTooltip component

### Basic Example

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

---

## Horizontal Bar Charts (Monthly Detail Views)

Monthly detail sections include horizontal bar chart visualizations below their data tables.

### Personnel Performance

- Dual-bar chart comparing Actual FTE vs Planned FTE
- Filters to show only main contributors (Actual FTE ≥ 0.25)
- Two bars per person with 100px gap between them
- Colors: #F9C57C (Actual), #B99EFB (Planned)
- Chart title: "FTE Visual Comparison for Main Contributors (more than 0.25 FTE)"

### Projects Breakdown

- Single-bar chart showing FTE by project category
- Shows all project categories sorted by FTE
- Color: #7BD4B4 (green)
- Chart title: "FTE Visual Comparison by Project"

### OPS Activities Breakdown

- Single-bar chart showing hours by activity category
- Filters to show only activities with hours > 0
- Color: #78D3E6 (cyan)
- Chart title: "Hours Visual Comparison by Activity"

---

## Common Chart Configuration

```typescript
// Standard horizontal bar chart setup
<ResponsiveContainer width="100%" height={Math.max(chartData.length * 60, 300)}>
  <BarChart
    data={chartData}
    layout="vertical"
    margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
    <XAxis type="number" domain={[0, "auto"]} />
    <YAxis
      type="category"
      dataKey="name"
      width={150}
      axisLine={false}
      tickLine={false}
    />
    <Bar
      dataKey="fte"
      fill="#7BD4B4"
      radius={[0, 4, 4, 0]}
      label={<CustomLabel />}
      barSize={30}
    />
  </BarChart>
</ResponsiveContainer>
```

### Custom Label Component

```typescript
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || value === 0) return null;

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="hsl(var(--foreground))"
      fontSize="12"
      fontFamily="inherit"
      dominantBaseline="middle"
    >
      {value.toFixed(2)} FTE
    </text>
  );
};
```

### Key Features

- No tooltip overlay (removed for cleaner UX)
- Labels show values at end of bars
- Labels vertically centered using `dominantBaseline="middle"`
- Bar thickness: 30px (`barSize={30}`)
- Y-axis width: 150px (accommodates longer names)
- Dynamic height: 60px per bar (projects/activities), 100px per person (personnel)
- Rounded right corners: `radius={[0, 4, 4, 0]}`

---

## Chart Colors

### Project Colors

```typescript
const projectColors = {
  internal: '#3b82f6',  // blue
  ops: '#10b981',       // green
  rnd: '#f59e0b',       // orange
  guiding: '#8b5cf6',   // purple
  pr: '#ec4899',        // pink
  ux: '#06b6d4',        // cyan
}
```

### Visualization Colors

- **Actual FTE (Personnel):** `#F9C57C` (peachy orange)
- **Planned FTE (Personnel):** `#B99EFB` (light purple)
- **Projects Breakdown:** `#7BD4B4` (mint green)
- **OPS Activities:** `#78D3E6` (cyan)

### Deviation Badge Colors

- **Positive deviation (≥ 0%):** `#7BD4B4` (mint green)
- **Minor deviation (-0.01% to -20%):** `#8AB5FA` (light blue)
- **Major deviation (< -20%):** `#EB4899` (pink)

---

## UI Best Practices

### Tailwind CSS

- Use utility classes over custom CSS
- Responsive design: mobile-first approach
- Dark mode: use `dark:` prefix

### shadcn/ui Components

- Location: `components/ui/`
- Add new: `npx shadcn-ui@latest add button`
- Customize by editing component files directly

### Dark Mode

```typescript
// Use next-themes
import { ThemeProvider } from 'next-themes'

// In component
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
```
