# Visualization Plan for Analyzed Data

## Goal

After the backend has analyzed the data, the frontend should present the results in a clear, reusable, and maintainable way. The visualization layer should not do statistical work itself. It should only render already prepared results.

## Recommendation

Use **Highcharts**

Why this is a good fit for DermaTrack :

- It supports the chart types that are most useful for medical or diary-style trends.
- It works well with time series, grouped categories, stacked values, and heatmap-style views.
- It keeps the architecture clean: backend analyzes and aggregates, frontend visualizes.
- It allows a consistent UI without building a custom charting system from scratch.

## Recommended Chart Types and What to Visualize

This section focuses on practical chart choices for DermaTrack. The goal is to answer real user questions, not to show as many chart types as possible.

### 1. Line Chart (primary chart)

Use for: daily or weekly trends over time.

What to visualize:

- Symptom intensity trend per day.
- Stress level trend.
- Sleep quality trend.
- Nutrition score trend.

User question it answers:

- "Am I getting better, worse, or staying the same over time?"

### 2. Multi-series Line Chart

Use for: comparing two to four related metrics on the same time axis.

What to visualize:

- Sleep vs symptom intensity.
- Stress vs symptom intensity.
- Nutrition vs symptom intensity.

User question it answers:

- "Do these factors move together over time?"

### 3. Column or Bar Chart

Use for: category comparisons and rankings.

What to visualize:

- Most frequent symptom categories.
- Most frequent triggers.
- Count of bad-symptom days per week.

User question it answers:

- "Which categories matter most for me?"

### 4. Stacked Column Chart

Use for: composition within each period.

What to visualize:

- Symptom category composition per week.
- Trigger composition per month.

User question it answers:

- "How is each period made up, and what changed in that mix?"

### 5. Heatmap (optional but very useful)

Use for: dense calendar-like patterns.

What to visualize:

- Symptom intensity by weekday and hour.
- Stress intensity by weekday.

User question it answers:

- "When do bad phases usually happen?"

### 6. Area Range or Band Chart

Use for: showing min/max spread instead of only averages.

What to visualize:

- Weekly min and max symptom intensity.
- Weekly min and max sleep quality.

User question it answers:

- "How stable is my condition, not just what is the average?"

### 7. Scatter Plot (phase 2)

Use for: correlation exploration.

What to visualize:

- Sleep quality on x-axis vs symptom intensity on y-axis.
- Stress level on x-axis vs symptom intensity on y-axis.

User question it answers:

- "Is there a likely relationship between these two variables?"

### Recommended V1 Scope

For first implementation, use only:

1. Line chart for trends.
2. Multi-series line chart for two-metric comparison.
3. Bar chart for category frequency.

Then add heatmap and scatter plot in later iterations.

### Chart Selection Rules

- Prefer line charts when time is the main dimension.
- Prefer bar or column charts when comparing categories.
- Avoid pie charts for many categories because they are harder to compare accurately.
- Do not mix unrelated metrics on one y-axis unless they share a meaningful scale.
- Show units, time window, and aggregation in every chart subtitle.

### Minimal JSON Examples per Chart Type

These are intentionally small examples to show the data shape, not full payloads.

#### 1. Line Chart (trend)

```json
{
  "chartType": "line",
  "series": [
    {
      "name": "Symptoms",
      "data": [
        [1740787200000, 4],
        [1740873600000, 5]
      ]
    }
  ],
  "xAxis": { "type": "datetime" },
  "unit": "intensity"
}
```

#### 2. Multi-series Line Chart (comparison)

```json
{
  "chartType": "line",
  "series": [
    {
      "name": "Sleep",
      "data": [
        [1740787200000, 6],
        [1740873600000, 7]
      ]
    },
    {
      "name": "Symptoms",
      "data": [
        [1740787200000, 4],
        [1740873600000, 5]
      ]
    }
  ],
  "xAxis": { "type": "datetime" }
}
```

#### 3. Column or Bar Chart (category ranking)

```json
{
  "chartType": "bar",
  "categories": ["Dryness", "Redness", "Itching"],
  "series": [{ "name": "Count", "data": [12, 9, 7] }]
}
```

#### 4. Stacked Column Chart (composition)

```json
{
  "chartType": "stacked-column",
  "categories": ["Week 1", "Week 2"],
  "series": [
    { "name": "Mild", "data": [4, 5] },
    { "name": "Strong", "data": [2, 3] }
  ]
}
```

#### 5. Heatmap (pattern by time)

```json
{
  "chartType": "heatmap",
  "xCategories": ["Mon", "Tue"],
  "yCategories": ["Morning", "Evening"],
  "series": [
    {
      "name": "Intensity",
      "data": [
        [0, 0, 2],
        [0, 1, 5],
        [1, 0, 3],
        [1, 1, 4]
      ]
    }
  ]
}
```

#### 6. Area Range or Band Chart (min/max)

```json
{
  "chartType": "arearange",
  "series": [
    {
      "name": "Symptoms range",
      "data": [
        [1740787200000, 2, 6],
        [1740873600000, 3, 7]
      ]
    }
  ],
  "xAxis": { "type": "datetime" }
}
```

#### 7. Scatter Plot (correlation)

```json
{
  "chartType": "scatter",
  "series": [
    {
      "name": "Sleep vs Symptoms",
      "data": [
        [6, 4],
        [7, 3],
        [5, 6]
      ]
    }
  ],
  "xAxis": { "label": "Sleep" },
  "yAxis": { "label": "Symptoms" }
}
```

## Suggested Frontend Setup

Use the official Highcharts React integration in the Next.js app.

- Install Highcharts as npm packages: `highcharts` and `@highcharts/react`.
- The React wrapper is what connects Highcharts to the Next.js frontend.
- Render charts only on the client side if the chart component depends on browser APIs.
- Keep chart configuration in small adapter components, not directly inside pages.
- Build reusable chart wrappers for common options like colors, titles, tooltips, axis labels, and empty states.

## How the Analyzed Data Should Look

Highcharts works best when the backend returns chart-ready structures instead of raw entities.

Recommended response shape:

```json
{
  "chartType": "line",
  "title": "Sleep and symptom trend",
  "subtitle": "Last 30 days",
  "unit": "score",
  "timeRange": {
    "from": "2026-03-01",
    "to": "2026-03-30"
  },
  "xAxis": {
    "type": "datetime",
    "label": "Date"
  },
  "yAxis": {
    "label": "Intensity",
    "min": 0,
    "max": 10
  },
  "series": [
    {
      "name": "Sleep",
      "data": [
        [1740787200000, 6],
        [1740873600000, 7]
      ]
    },
    {
      "name": "Symptoms",
      "data": [
        [1740787200000, 4],
        [1740873600000, 5]
      ]
    }
  ],
  "metadata": {
    "aggregation": "daily",
    "sampleSize": 2,
    "timezone": "Europe/Berlin"
  }
}
```

### Data Rules

- Use `series` as the main container for all chart data.
- Use a `datetime` x-axis for trends over time.
- Prefer `[x, y]` points for most charts.
- Use named categories only when the chart is purely categorical.
- Include units, time range, and aggregation metadata so the chart can explain itself.
- Keep the API response stable and explicit instead of sending generic maps.

### Good Response Types for Likely Use Cases

- **Trend charts**: `[timestamp, value]` pairs for symptoms, sleep, stress, or nutrition scores.
- **Comparison charts**: multiple series with the same x-axis.
- **Category charts**: labels plus totals for symptom types, triggers, or mood groups.
- **Range charts**: min/max bands when the data contains variation or uncertainty.

## Implementation Plan

### 1. Define the chart contract first

Create backend DTOs for visualization responses before implementing chart screens.

- Define one DTO per chart family if needed.
- Keep the naming consistent across endpoints.
- Document which fields are required and which are optional.

### 2. Expose dedicated visualization endpoints

Add endpoints that return chart-ready data, not raw diary entities.

- Example: `/api/statistics/trends`
- Example: `/api/statistics/categories`
- Example: `/api/statistics/overview`

### 3. Add a chart adapter layer in the frontend

Create small adapter components that transform backend DTOs into Highcharts options.

- One adapter for line or area charts.
- One adapter for bar and column charts.
- One adapter for heatmaps or more specialized views.

### 4. Start with a small chart set

Implement the first version with the most useful views only.

- Daily trend chart.
- Category distribution chart.
- Comparison chart for two or three metrics.

Avoid advanced charts until the API contract is stable.

### 5. Add state handling for real-world data issues

The frontend should handle more than the happy path.

- Show an empty state when there is no data.
- Show a message when the time range is too short for a useful chart.
- Show a loading state while the backend prepares statistics.
- Show an error state when the statistics endpoint fails.

### 6. Add test coverage for the chart contract

Add tests for the DTO mapping and for the frontend chart adapters.

- Backend tests should verify that statistics endpoints return valid chart data.
- Frontend tests should verify that the adapter can handle empty data and normal data.

## Likely or possible Hiccups

### Licensing

Highcharts is free for educational projects at schools and universities, including coursework and non-funded academic research. For this module project, that makes it a valid option. It is not free for company projects, client work, internships, consulting, or internal operations.

### Client-side rendering

Highcharts often depends on browser behavior. In Next.js, the chart component may need to be rendered client-side only. If this is ignored, hydration or import issues can appear.

### Data shape drift

If the backend response is not stable, chart code becomes fragile quickly. That is why the DTO contract should be documented early and treated as part of the API.

### Too much raw data

Sending too many points at once can make charts slow or visually noisy. The backend should aggregate by day, week, or month where appropriate.

### Ambiguous interpretation

Medical or diary data can be easy to misread. Every chart should show the aggregation window, unit, and sample size so the user understands what the chart means.

### Missing or irregular timestamps

If there are days without entries, the chart may look broken unless the backend fills gaps intentionally or the frontend displays them clearly.

### Multiple metrics with different scales

Some metrics may not belong on the same axis. Mixing them without clear labels can produce misleading visualizations.

## Bottom Line

For this project, the best approach is:

1. Analyze and aggregate in the backend.
2. Return chart-ready DTOs.
3. Render the results with a chart library in the frontend.
4. Keep chart configuration reusable and simple.

## Alternatives to Highcharts

If someone on the team wants to evaluate other libraries, these are strong candidates:

- **Apache ECharts**: Fully open-source and very powerful for advanced visualizations (good), but the option model can feel more complex than Highcharts at first (slightly harder onboarding).
- **Chart.js**: Very simple to start with and lightweight for common charts (good), but less feature-rich for advanced interactions and complex dashboards than Highcharts (more limited long-term).
- **Recharts**: React-friendly and easy to compose as components (good for this frontend stack), but not as broad or polished for complex analytical chart types as Highcharts (less depth for advanced use cases).

## References

- Highcharts installation: https://www.highcharts.com/docs/getting-started/installation
- Highcharts series data structure: https://www.highcharts.com/docs/chart-concepts/series
- Highcharts React integration: https://www.highcharts.com/docs/react/getting-started
- Highcharts educational use: https://www.highcharts.com/education/
- Highcharts npm package: https://www.npmjs.com/package/highcharts
- Highcharts licensing: https://shop.highcharts.com/license
