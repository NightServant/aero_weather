# AeroWeather v2 — Single-Page Redesign (design spec)

Status: approved for planning · Date: 2026-07-06 · Branch: `redesign/aeroweather`

This is the **second redesign attempt**. It builds on the existing dark-glass AeroWeather
system (already on this branch) rather than rebuilding it. The authority for tokens, glass
recipes, typography, motion, and per-screen geometry remains [`DESIGN-SPEC.md`](../../../DESIGN-SPEC.md);
this document only defines what changes in v2 and why. Where the two disagree, v2 wins for the
six workstreams below; `DESIGN-SPEC.md` still governs everything else.

## Goals (the six workstreams)

1. **One scrolling page.** Collapse the four routes (`today`, `forecast`, `locations`,
   `settings`) into a single vertically-scrolling page with anchor navigation and scroll-spy.
2. **Top-to-bottom color consistency.** Kill the "warm-band-at-top / dark-navy-below" and
   "white-frosting-top / dark-footer-bottom" splits. One fixed background + one surface system,
   consistent from hero to footer.
3. **Weather background for every condition.** All seven palette keys get a full-bleed photo,
   composited through one scrim so any sky (even a bright day) lands in the same dark band.
4. **Reposition the old page-headers.** The four standalone hero headers become consistent
   in-flow section headers.
5. **Fix 2-Week hourly + daily layouts** to match the redesign's card grammar.
6. **Fix Settings notifications layout** to match the Units-and-locale card grid.

## Non-goals

- No change to the data/API layer (`lib/api/*`, `hooks/use-forecast.ts`, prefs).
- No visual overhaul — keep the current dark-glass language (user chose "refine, don't overhaul").
- No pruning of the unused `components/ui/*` shadcn kit (out of scope; risk without benefit).

---

## 1. Single scrolling page

### Structure
- New single page renders four stacked `<section>` landmarks in order, each with an `id`:
  `#today`, `#forecast`, `#locations`, `#settings`.
- Implemented as **one page file** (`app/(app)/page.tsx`) that composes the existing section
  components, not four route files. Rationale: one provider/data tree, one scroll container,
  and scroll-spy works without cross-route coordination.
- Section components are extracted from today/forecast/locations/settings page bodies into
  `components/sections/{today,forecast,locations,settings}-section.tsx`. Loading / empty /
  error states move into each section (a broken section must not blank the whole page).
- `ActiveForecastProvider` continues to wrap the page (in `app/(app)/layout.tsx`, unchanged).

### Navigation
- Navbar links change from route hrefs to in-page anchors: `#today`, `#forecast`,
  `#locations`, `#settings`. Clicking smooth-scrolls to the section.
- **Scroll-spy:** an IntersectionObserver (new `hooks/use-scroll-spy.ts`) tracks which section
  is in view and sets the active nav pill (`aria-current="page"` on the active anchor).
- `html { scroll-behavior: smooth }` gated behind `prefers-reduced-motion: no-preference`
  (the existing reduced-motion kill switch already forces `scroll-behavior: auto`).
- Each `<section>` gets `scroll-margin-top` equal to the sticky navbar height + gap
  (≈ `6.5rem`) so anchored headings never hide under the navbar. (This also fixes the current
  bug where "Good morning!" renders under the navbar on load.)

### Back-compat & links
- `app/page.tsx` currently `redirect("/today")` → change to `redirect("/")` target being the
  single page, or render it directly. Old deep links `/today`, `/forecast`, `/locations`,
  `/settings` redirect to `/` + matching hash (keep the four route folders as thin redirect
  stubs, or a single catch-all — planner's choice; behavior is what matters).
- Footer links (`site-footer.tsx`) and city-card / list links (`city-card.tsx`,
  `locations-list.tsx`) switch from route hrefs to anchor hrefs.
- The "See the full 2-week outlook" link on Today becomes `href="#forecast"`.

### Accessibility
- Exactly **one `<h1>` per page** now. "Good morning!" stays `h1`; the other three section
  titles ("Bright skies in 2 weeks.", "Places at a glance", "Preferences") drop to `h2`, and
  the stats/labels beneath them shift down one level accordingly.
- Each `<section>` has `aria-labelledby` pointing at its heading.
- Skip-link target (`#main`) unchanged; add per-section anchors as landmarks.

---

## 2. Color consistency (top → bottom)

**Root cause.** Two independent splits: (a) warm palette glow (`--hero-glow` on
sunny/sunset) bleeds through a mid-scrim that's too light, clashing with neutral-dark cards
(see the 2-Week summary-cards screenshot); (b) glass surfaces are white-alpha ("frosting")
while tint cards + footer are dark oklch fills, so top and bottom read as different materials.

**Fixes.**
- **One unified scrim** in `sky-background.tsx`, tuned so the composite behind content lands
  in a single dark, hue-neutral band (target composite L ≤ ~0.35, low chroma) for **all seven
  palettes** — including the warm glows. Concretely: strengthen the mid stop and add a subtle
  hue-neutralizing layer so no warm/olive bleed reaches mid-page content. Verify per palette.
- **Bottom vignette:** the scrim darkens gently toward the page bottom so the page settles into
  the footer instead of a hard color break. The footer becomes a **flush `.tint-card`
  continuation** (same fill family), not a separate panel.
- **Surface parity:** confirm `.glass-card` (frosting) and `.tint-card` (dark tint) read as the
  same material family at the section boundaries. Where they visibly diverge across a scroll
  seam, prefer `.tint-card` for large in-flow surfaces (blur stays only on navbar + hero cards
  per DESIGN-SPEC §2).
- **Remove dead CSS:** delete the now-unused legacy aliases `.surface-card`,
  `.surface-card-elevated`, and `.eyebrow` from `globals.css` (grep confirms zero usage).

**Acceptance check.** On `sunny` and `sunset` palettes, no warm/olive bleed is visible behind
mid-page or lower content; background and all surfaces stay in the same luminance + hue band
from the hero through the summary cards to the footer. Body text keeps ≥ 4.5:1 (DESIGN-SPEC §7).

---

## 3. Weather background for every condition

- All seven palette keys ship a full-bleed photo: existing `cloudy`, `night`, `stormy`,
  `sunset` **plus new `sunny`, `rainy`, `snowy`** in `public/skies/`.
- **Sourcing:** CC-licensed Wikimedia Commons photography in the same dark luminance band as
  the existing plates (matches DESIGN-SPEC §5 provenance approach), downscaled to ≤ 1920px wide
  `.webp`, no query strings in filenames. Add credit lines to the footer alongside the existing
  ones. **Fallback** if a suitable licensed image can't be sourced for a key: keep that key
  gradient-only but with a scrim/gradient tuned so it never reads as "missing." (User preference
  is a photo for every condition; fallback only if sourcing genuinely fails.)
- **Unified scrim does double duty:** the §2 scrim is tuned so even a bright daytime `sunny`
  photo composites into the dark band — this is what keeps color consistency while adding photos.
- `SKY_PHOTOS` map in `sky-background.tsx` extends to all seven keys. Only the first-painted
  plate competes for LCP (`priority`); palette swaps cross-fade politely (existing logic kept).
- Background stays `fixed inset-0` behind the whole single-page scroll (already the case);
  confirm it doesn't reflow or re-fetch on scroll.

---

## 4. Reposition the old page-headers

The four page bodies each open with a standalone hero header built for an isolated route
(kicker card + tabs + big heading card). In one continuous scroll these need to read as
**section headers**, not four competing heroes.

- Each section gets a consistent header: one kicker (`.kicker`, one per section — DESIGN-SPEC
  §3 eyebrow budget), the section title (`h2` except Today's `h1`), optional subtitle, and the
  section's tab control (Grid/Daily/Hourly, Carousel/List, Units/Notifications) positioned
  cleanly within the section rather than floating at a route's top-right.
- Keep every working leaf component (glass/tint cards, animated icons, `PillTabs`,
  `CurrentConditions`, city cards, unit toggles). This is **repositioning + reheadering**, not a
  rebuild.
- Section rhythm: consistent vertical spacing between sections (a larger inter-section gap than
  intra-section) and an optional hairline divider between sections, matching the existing
  in-page dividers.

**Open decision deferred to planning:** whether to keep all three in-section tab controls or
simplify to one default view per section for a purer scroll. Default: **keep the tabs**
(they're working and add value); planner may flag if a section reads better without.

---

## 5. 2-Week hourly + daily layouts

**Hourly (`hourly-view.tsx` + `hourly-cell.tsx`).** Replace the `flex flex-wrap gap-1` blob
(24 cells wrapping into ragged rows, "Now" ring breaking the grid) with a **horizontal scroll
rail**: uniform hour cells in a single row, `scroll-snap-x`, hidden scrollbar
(`scrollbar-width: none`), 44px+ touch targets. The "Now" cell is emphasized (accent ring)
**without** changing its box size, so the row rhythm stays intact. Reads as a proper timeline
and matches the Grid view's card grammar.

**Daily (`daily-row.tsx`).** Keep list form but rebuild on the redesign card system:
`.tint-card` rows on the 24px rhythm, hi/lo temperatures leading using the stat-value
hierarchy (temps are the primary read, not the precip bar), and a **restrained** precip bar
(secondary, not full-width-dominant). Day label + date + condition + precip% + hi/lo, aligned
to a clean column grid consistent with the Grid cards.

**Acceptance check.** Hourly and Daily visibly share the Grid view's visual language (same
card fills, radii, type hierarchy, accent usage); no wrapping blob, no precip bar dominating
the row.

---

## 6. Settings notifications layout

Replace the four full-width toggle **bars** (`notifications-section.tsx` → stacked
`ToggleRow`s) with a **2×2 card grid** matching the Units-and-locale 4-card grid directly
above it. Each card: icon + label + description + `Switch`, on `.tint-card`, same radius and
spacing as the units cards. `ToggleRow` is refactored (or replaced by a `NotificationCard`)
to the card shape; the 44px switch hit-slop and `aria-describedby` wiring are preserved.

**Acceptance check.** Units-and-locale and Notifications tabs use the same card grammar; no
full-width bars remain.

---

## File-change map (indicative, for planning)

| Area | Files |
|---|---|
| Single page | `app/(app)/page.tsx` (new), `app/page.tsx`, route stubs under `app/(app)/{today,forecast,locations,settings}`, `components/sections/*` (new), `hooks/use-scroll-spy.ts` (new) |
| Nav / links | `components/shell/navbar.tsx`, `components/shell/site-footer.tsx`, `components/locations/city-card.tsx`, `components/locations/locations-list.tsx` |
| Color / scrim | `components/shell/sky-background.tsx`, `app/globals.css` (scrim vars, dead-CSS removal, `scroll-behavior`, `scroll-margin`) |
| Sky photos | `public/skies/{sunny,rainy,snowy}.webp` (new), `sky-background.tsx` (`SKY_PHOTOS`), footer credits |
| Section headers | `components/sections/*`, `components/{today,forecast,locations,settings}/*-header` |
| Hourly/Daily | `components/forecast/hourly-view.tsx`, `components/today/hourly-cell.tsx`, `components/forecast/daily-row.tsx` |
| Notifications | `components/settings/notifications-section.tsx`, `components/settings/toggle-row.tsx` |

## Verification (whole-spec)

- Single page scrolls Today → 2-Week → Locations → Settings → footer; nav pills smooth-scroll
  and reflect the active section; anchored headings clear the navbar.
- Color: no warm bleed or material split anywhere on the scroll, all seven palettes; text
  contrast holds (DESIGN-SPEC §7).
- Every palette shows a full-bleed photo (or an intentional-looking gradient fallback).
- Hourly/Daily/Notifications match the redesign card grammar.
- `prefers-reduced-motion` and `prefers-reduced-transparency` paths still honored.
- Verified in the browser preview (screenshots) before completion, per project verification rule.
