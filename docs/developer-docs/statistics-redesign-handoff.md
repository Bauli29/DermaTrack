# Statistics Page Redesign — Handoff Document

> Session: 20 May 2026  
> Scope: Frontend-only changes. Backend API contract was **not** updated yet — this is the primary outstanding task.

---

## Summary of Changes

The statistics page was redesigned for mobile. The main driver was simplifying the controls (single date range picker + presets instead of separate end-date + period dropdowns) and removing visual noise (summary pills, series snapshot chips, card-in-card correlation layout).

---

## 1. API Contract Change (Backend action required)

### Before
All three statistics endpoints (`/api/statistics/psyche-symptoms`, `/api/statistics/symptoms`, `/api/statistics/correlation`) accepted:
```
GET /api/statistics/psyche-symptoms?endDate=2026-05-20&period=7d&mainCategory=care-products
```

| Param | Type | Description |
|---|---|---|
| `endDate` | `string (yyyy-MM-dd)` | End of the window |
| `period` | `"7d" \| "30d" \| "90d"` | Window length relative to endDate |
| `mainCategory` | `string` | Correlation only |

### After (frontend now sends)
```
GET /api/statistics/psyche-symptoms?startDate=2026-05-14&endDate=2026-05-20&mainCategory=care-products
```

| Param | Type | Description |
|---|---|---|
| `startDate` | `string (yyyy-MM-dd)` | Start of the window (new) |
| `endDate` | `string (yyyy-MM-dd)` | End of the window |
| `period` | removed | No longer sent |
| `mainCategory` | `string` | Correlation only, unchanged |

**Backend must:**
- Accept `startDate` as a query parameter on all three endpoints
- Derive the window from `startDate`→`endDate` rather than `endDate` - `period`
- Keep `period` optional/backwards-compatible or remove it depending on whether other clients still use it
- Return `dateRange.from` / `dateRange.to` in the response body as before (frontend uses this to display the range badge in each chart card)

### Frontend service file changed
`frontend/src/services/statistics/index.ts` — `buildStatisticsApiPath` now sets `startDate` in the query string.

`frontend/src/services/statistics/types.ts` — `IStatisticsRequestParams` now has:
```ts
export interface IStatisticsRequestParams {
  startDate?: string   // added
  endDate?: string
  period?: TStatisticsPeriod  // kept in type but no longer sent by the page
  mainCategory?: string
}
```

---

## 2. Frontend Proxy (`frontend/src/proxy.ts`)

If the proxy rewrites or validates query parameters for the statistics routes, it needs to allow `startDate` to pass through. Verify no allowlist or schema validation strips it.

---

## 3. Validation Schema (`frontend/src/validation/statistics`)

If there is a Zod schema validating outgoing request params, add `startDate` as an optional string field matching `yyyy-MM-dd`.

---

## 4. Frontend Component Changes

### `src/components/templates/statistics/index.tsx`
- **Removed:** `selectedPeriod` state, `selectedEndDate` state, period button group, end-date picker, RangeSummary pills, `Today` button
- **Added:** `startDate` + `endDate` state, `activePreset` state (tracks whether a preset is active)
- **Added:** `DatePicker` (react-datepicker) in `selectsRange` mode — EU format `dd.MM.yyyy`
- **Added:** `PRESETS` constant (`7d` = 7 days, `30d` = 30 days) rendered as buttons; selecting a preset sets both dates and marks the preset active; picking a custom range clears the active preset
- **Default range on load:** last 7 days ending today
- **Correlation card:** no longer wrapped in its own `CorrelationCardWrapper` — rendered as a plain `StatisticsChartCard` like the other two charts

### `src/components/templates/statistics/statistics-chart-card.tsx`
- **Removed:** `SeriesSnapshot` chip grid (the boxes showing latest value per series below the header)
- **Added props:**
  - `headerAction?: ReactNode` — rendered in the top-right of the card header (used for the correlation category select)
  - `note?: ReactNode` — rendered **below the chart** (used for the correlation scale legend)
  - `emptyMessage?: string` — overrides the default "No chart data" empty state text
- **Header layout:** `ChartHeader` → left: title+description, right: `ChartHeaderRight` (RangeBadge on top, headerAction below)
- **Note position:** after `ChartSurface`, not before it

### `src/components/templates/statistics/utils.ts`
- **Removed:** `STATISTICS_PERIOD_OPTIONS`, `getStatisticsPeriodLabel`, `buildStatisticsSeriesSnapshots`
- **Kept:** all chart-building and formatting utilities

### `src/components/templates/statistics/types.ts`
- **Removed:** `IStatisticsPeriodOption`

---

## 5. Unit Tests — What Needs Updating

### `statistics/index.tsx` tests (if any)
- Remove tests for `selectedPeriod`, period button rendering, `selectedEndDate`, `Today` button
- Add tests for:
  - Range picker renders with default 7-day range on mount
  - `7d` preset button sets `startDate` to today−6 and `endDate` to today
  - `30d` preset button sets `startDate` to today−29 and `endDate` to today
  - Custom range clears active preset
  - `startDate` and `endDate` are passed to all three fetch calls
  - Changing `selectedMainCategory` triggers a reload without scrolling (charts stay mounted — `statistics` state is not cleared to `null` between reloads)

### `statistics-chart-card` tests (if any)
- Remove tests asserting `SeriesSnapshot` / `SeriesChip` renders
- Add tests for `note` prop rendering below the chart surface
- Add tests for `headerAction` prop rendering in the header
- Add tests for `emptyMessage` prop overriding default empty state text

### Backend integration / API tests
- Update any test that builds a statistics request URL to use `startDate` + `endDate` instead of `endDate` + `period`
- Add tests for the backend endpoint accepting `startDate` and computing the correct window
- Add regression test: `period` param absent → no error

### Postman collection (`postman/DermaTrack.postman_collection.json`)
- Update statistics request examples to use `startDate` + `endDate`

---

## 6. Correlation Chart — Scale Legend

The correlation card now includes a `note` below the chart explaining the axis:

| Dot colour | Value | Meaning |
|---|---|---|
| Blue (primary) | −1 | Factor may help symptoms |
| Grey (textMuted) | 0 | No link |
| Red (critical) | +1 | Factor may worsen symptoms |

This is purely frontend UI — no backend change needed. The legend items are rendered via `CorrelationScaleNote` / `CorrelationScaleItem` / `CorrelationScaleDot` styled components in `styles.ts`.

---

## 7. Files Changed (frontend)

| File | Change type |
|---|---|
| `src/components/templates/statistics/index.tsx` | Major rewrite |
| `src/components/templates/statistics/statistics-chart-card.tsx` | Props added, SeriesSnapshot removed |
| `src/components/templates/statistics/styles.ts` | Many components removed/added |
| `src/components/templates/statistics/utils.ts` | Period/snapshot helpers removed |
| `src/components/templates/statistics/types.ts` | `IStatisticsPeriodOption` removed |
| `src/services/statistics/index.ts` | `startDate` added to query builder |
| `src/services/statistics/types.ts` | `startDate` added to `IStatisticsRequestParams` |
