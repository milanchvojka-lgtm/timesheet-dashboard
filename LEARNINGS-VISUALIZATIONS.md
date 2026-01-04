# Learnings: Horizontal Bar Chart Visualizations

## Session Summary
Added horizontal bar chart visualizations to three Monthly Detail sections: Personnel Performance, Projects Breakdown, and OPS Activities Breakdown.

## Key Technical Learnings

### 1. Recharts Horizontal Bar Charts

**Layout Configuration:**
- Use `layout="vertical"` for horizontal bars
- `XAxis` becomes the value axis (type="number")
- `YAxis` becomes the category axis (type="category")
- This is the opposite of vertical bar charts

**Example:**
```typescript
<BarChart data={data} layout="vertical">
  <XAxis type="number" domain={[0, "auto"]} />
  <YAxis type="category" dataKey="name" />
  <Bar dataKey="value" />
</BarChart>
```

### 2. Custom Label Positioning

**Challenge:** Default labels appear at top of bars, not vertically centered.

**Solution:** Use `height` prop and `dominantBaseline="middle"`:
```typescript
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  return (
    <text
      x={x + width + 8}        // 8px right of bar end
      y={y + height / 2}       // Vertical center of bar
      dominantBaseline="middle" // SVG text alignment
    >
      {value.toFixed(2)} FTE
    </text>
  );
};
```

**Key Points:**
- `dominantBaseline="middle"` is crucial for vertical centering
- Without it, text aligns to baseline (top of text)
- Must destructure `height` from props
- Position relative to bar: `x + width` for end of bar

### 3. Bar Spacing Configuration

**Two Types of Spacing:**
1. `barGap` - Space between bars in same category (e.g., Actual vs Planned for same person)
2. `barCategoryGap` - Space between different categories (e.g., between different people)

**For Personnel Dual-Bar Chart:**
```typescript
<BarChart barGap={100} barCategoryGap={1}>
  <Bar dataKey="actualFTE" />
  <Bar dataKey="plannedFTE" />
</BarChart>
```
- Large `barGap` (100px) separates Actual and Planned bars
- Small `barCategoryGap` (1px) keeps people close together

**Important:** Chart height must accommodate spacing. If `barGap={100}` but height is too small, gap won't be visible.

### 4. Dynamic Height Calculation

**Formula:**
```typescript
height={Math.max(chartData.length * pixelsPerBar, minHeight)}
```

**Different Heights Per Use Case:**
- Personnel Performance: 100px per person (needs space for dual bars + 100px gap)
- Projects/Activities: 60px per category (single bar, smaller gap)
- Minimum: 300px (prevents tiny charts with few items)

### 5. Y-Axis Label Width

**Challenge:** Long names like "Petra Panáková" wrap to multiple lines.

**Solution:** Increase Y-axis width:
```typescript
<YAxis width={150} />  // Default is ~80px
```

**Trade-off:** Wider Y-axis = less space for bars, but better readability.

### 6. Removing Tooltips

**Default Behavior:** Recharts shows gray hover background even without Tooltip component.

**Solution:** Remove Tooltip component entirely:
```typescript
// ❌ Don't add Tooltip at all
<BarChart>
  {/* No <Tooltip /> component */}
</BarChart>
```

**Previous Mistake:** Adding `cursor={{ fill: "transparent" }}` to Tooltip still showed the tooltip box.

### 7. Axis Styling

**Clean Look:** Remove axis lines and tick marks:
```typescript
<YAxis
  axisLine={false}   // No vertical line
  tickLine={false}   // No horizontal ticks
/>
```

**Result:** Labels appear "floating" next to bars, cleaner visual appearance.

### 8. Color Selection Process

**Iteration:**
1. Started with theme colors (#10b981 for projects, #8b5cf6 for activities)
2. User requested specific colors for visual consistency
3. Final colors chosen for better differentiation:
   - Personnel Actual: #F9C57C (warm orange)
   - Personnel Planned: #B99EFB (soft purple)
   - Projects: #7BD4B4 (mint green)
   - Activities: #78D3E6 (cyan)

**Lesson:** Visual colors should be distinct from semantic project colors to avoid confusion.

### 9. Filtering Data for Charts

**Personnel Performance:**
- Filter: `actualFTE >= 0.25` (main contributors only)
- Rationale: Avoid clutter from infrequent contributors
- Title clearly states the threshold

**OPS Activities:**
- Filter: `totalHours > 0` (active categories only)
- Rationale: Don't show empty categories in visualization
- Still show all in table (including zeros)

**Projects:**
- No filter (show all categories)
- Rationale: All project categories are meaningful, even with low hours

### 10. Dual-Bar Charts

**Personnel Performance Implementation:**
```typescript
<Bar dataKey="actualFTE" fill="#F9C57C" barSize={30} />
<Bar dataKey="plannedFTE" fill="#B99EFB" barSize={30} />
```

**Key Points:**
- Two separate `<Bar>` components in same chart
- Same `barSize` for visual consistency
- Use `barGap` to control spacing between them
- Each bar gets its own custom label

## Iteration Process

**Total Iterations:** ~17 refinements

**Main Adjustments:**
1. Initial implementation with basic chart
2. Increase bar height (5px → 10px → 30px)
3. Increase bar width (default → 20px → 30px)
4. Space between persons (15px → 8px → 4px → 1px)
5. Space between bars (20px → 100px)
6. Chart height adjustments (55px → 120px → 100px per person)
7. Label centering fix (y + 10 → y + height / 2 + dominantBaseline)
8. Y-axis width (110px → 150px)
9. Color iterations (3 changes)
10. Tooltip removal
11. Axis styling cleanup

**Lesson:** Visual spacing requires trial and error. What looks right in code doesn't always match visual expectations.

## Deviation Badge Colors

**New Color Scheme:**
```typescript
const getDeviationColor = (deviation: number) => {
  if (deviation >= 0) return "#7BD4B4";      // Positive: mint green
  if (deviation >= -20) return "#8AB5FA";    // -0.01% to -20%: light blue
  return "#EB4899";                          // < -20%: pink
}
```

**Applied with inline styles:**
```typescript
<Badge style={{
  backgroundColor: getDeviationColor(deviation),
  color: "#FFFFFF"
}}>
  {deviation > 0 ? "+" : ""}{deviation}%
</Badge>
```

**Lesson:** Badge variants (default, secondary, destructive) weren't flexible enough. Inline styles with exact colors provide better control.

## Common Patterns Established

**1. Chart Container:**
```typescript
{data.length > 0 &&
  (() => {
    const chartData = prepareChartData();
    if (chartData.length === 0) return null;

    return (
      <div className="mt-8 pt-8 border-t">
        <h3>Chart Title</h3>
        <ResponsiveContainer>
          {/* Chart */}
        </ResponsiveContainer>
      </div>
    );
  })()}
```

**2. Standard Margins:**
```typescript
margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
```
- Left: 120px for Y-axis labels
- Right: 120px for value labels at bar ends
- Top/Bottom: 5px minimal padding

**3. Consistent Styling:**
- Bar thickness: 30px
- Bar radius: `[0, 4, 4, 0]` (rounded right corners only)
- Font: inherit (matches theme)
- Grid: `strokeDasharray="3 3"` with `stroke-muted` class

## Files Modified

**Components:**
1. `components/monthly-detail/personnel-section.tsx` - Dual-bar FTE comparison
2. `components/monthly-detail/projects-section.tsx` - Single-bar FTE chart
3. `components/monthly-detail/activities-section.tsx` - Single-bar hours chart

**Documentation:**
- `CLAUDE.md` - Added comprehensive visualization documentation

## Testing Recommendations

**Visual Testing Checklist:**
- [ ] Chart renders with correct colors
- [ ] Labels appear at end of bars, vertically centered
- [ ] No tooltip on hover
- [ ] Long names don't wrap (Y-axis width sufficient)
- [ ] Spacing between bars looks balanced
- [ ] Chart height scales with data length
- [ ] Minimum height applies for small datasets
- [ ] Filters work correctly (0.25 FTE threshold, hours > 0)
- [ ] Dual bars have visible gap (Personnel only)
- [ ] Deviation badges show correct colors

**Edge Cases:**
- Empty data (show "No data" message, hide chart)
- Single item (chart should still render at minimum height)
- Very long names (test with extended names)
- Zero values (don't show label)
- Negative values (not applicable for hours/FTE)

## Best Practices Learned

1. **Start Simple:** Begin with basic chart, refine iteratively
2. **User Feedback:** Visual design requires seeing it in browser
3. **Spacing Math:** Chart height must accommodate spacing values
4. **Label Positioning:** Use SVG text attributes (dominantBaseline) for precise alignment
5. **Color Consistency:** Document all colors in style guide
6. **Filter Rationale:** Clearly state filter criteria in chart titles
7. **Responsive Height:** Scale with data length, but enforce minimum
8. **Axis Cleanup:** Remove unnecessary lines for cleaner look

## Future Improvements

**Potential Enhancements:**
- Add animation on initial render
- Implement drill-down (click bar to see details)
- Export chart as image
- Add legend for dual-bar charts (currently manual legend below chart)
- Responsive breakpoints for mobile (adjust margins, hide charts on small screens)
- A11y improvements (ARIA labels, keyboard navigation)

**Performance:**
- Current implementation re-creates charts on every render
- Consider memoizing chart data preparation
- Recharts is generally performant for these data sizes (<50 bars)

## Conclusion

Successfully implemented three horizontal bar chart visualizations with consistent styling and user-friendly features. Key success factors:
1. Iterative refinement based on user feedback
2. Careful attention to spacing and positioning
3. Clear documentation of patterns and decisions
4. Consistent color scheme across all visualizations

Total implementation time: ~2-3 hours including iterations.
