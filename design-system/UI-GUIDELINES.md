# UI Guidelines — Calorie Tracker Web App

## Navigation

Four sections: **Today** (log meals), **Food Diary** (history), **Goals**, and **Progress**
(dashboards/reports). Use a top bar with these as primary links on desktop, since logging is a
quick, frequent action that shouldn't require drilling through a sidebar. On mobile, show the
same sections as a bottom tab bar, since one-handed phone use is the primary logging context for
this product.

## Layout and density

Favor a spacious, consumer-app layout over a data-dense console: generous spacing (`space-3`/
`space-4`) between sections, since users are frequently non-technical people checking in briefly,
not power users scanning dense tables all day.

Breakpoints:
- **Mobile** (compact, phone widths): single-column stacked layout, bottom tab bar — this is the
  primary logging surface.
- **Desktop** (wide, laptop/desktop widths): top bar navigation, multi-column dashboards —
  reports and charts benefit from more horizontal space.

## Component usage

- Use `.card` for a single day's summary, a goal, or a dashboard metric — each is a distinct,
  glanceable unit of information.
- Use `.list-item` rows (in a `.stack`) for the day's logged meals — order and recency matter
  more than side-by-side comparison.
- Use `.table` for food diary history and report exports — these are comparison-heavy,
  multi-row/multi-column views where alignment across rows matters.
- Use `.chip` for tags like meal type (breakfast/lunch/dinner) or goal status — short, scannable
  labels attached to a list item or card.
- Use `.btn-primary` for the single most important action on a screen (e.g. "Log meal", "Save
  goal") and `.btn-secondary` for everything else, so users always have one obvious next step.
- Use `.input`/`.label` pairs for all form fields, so logging and goal-setting feel consistent
  across the app.

## Theme

Light theme only, by default. The target audience checks in casually throughout the day in
varied lighting (kitchen, gym, outdoors), where a light, high-contrast surface stays legible.

## Voice and tone

Encouraging and neutral, never judgmental about food choices or missed goals — tracking should
feel like a supportive habit, not a scorecard. Prefer plain language over clinical nutrition
jargon, since most users are casual trackers, not dietitians.
