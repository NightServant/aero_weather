# Locations Section Redesign — Design Spec

**Date:** 2026-07-08
**Branch:** `redesign/locations-section`
**Status:** Approved (design), pending implementation plan

## Goal

Transform the AeroWeather **Locations** section into a more informative, organized,
and scalable experience — better information hierarchy, improved responsive layout,
reduced clutter, easier location management, better discovery of new places — while
staying pixel-consistent with the existing Aero design language (glassmorphism, spacing
scale, typography tokens, rounded corners, motion) and reusing existing components.

This is a redesign of one section, not a rewrite of the app.

## Constraints & context

- **No backend, no API keys.** All data comes from keyless public APIs
  (Open-Meteo, Wikipedia/Wikimedia REST) or ships static in the repo.
- **Design system is fixed.** Reuse tokens/classes from `app/globals.css`:
  `tint-card`, `glass-card`, `glass-pill`, `card-interactive`, `kicker`,
  `text-headline`, `stat-value`, `caption`, `card-subtitle-caps`, `hairline`.
- **Prefs model** (`lib/prefs.ts`) persists `locations: Place[]` and
  `activeLocationId: number | null` in localStorage; `usePrefs()` is the reactive hook.
- **Existing primitives to reuse:** radix `Dialog` (`components/ui/dialog.tsx`, already
  glass + fade/zoom + focus-trap + escape), embla carousel, `IconCircleButton`,
  `CityPhoto`, `AnimatedWeatherIcon`, `useCityForecast`/`getForecast`, `getCityImage`,
  `findSamePlace`/`addPlace`, sonner toasts.

## Decisions (locked)

| Topic | Decision |
| --- | --- |
| Map | **Leaflet** (added dep), dynamic `ssr:false`, loads on dialog open. Marker, zoom controls, standard/satellite layer toggle (Esri World Imagery, keyless), "Open in Google Maps" link. |
| Suggested data | **Curated popular-cities list** shipped in `lib/suggested-locations.ts`, filtered against saved via `findSamePlace`. |
| Detail content | **Real Wikipedia/Wikimedia** — REST `extract` for description, Wikimedia Commons images for gallery. Keyless, skeletons + graceful fallback, built API-ready. |
| Active model | Keep `activeLocationId`. Remove the card-level pin/Active UI. Dialog's **"View Forecast"** sets the place active and scrolls to Today. |
| Summary cards | **Four** cards: Saved total, Active location, Average temperature, Locations with rain. **Alerts** stays as the future-ready accent slot (matches Forecast section). |
| Save animation | Suggested card animates out (fade + scale + width-collapse); new saved card fades/slides in; sonner toast. True cross-carousel FLIP is out of scope. |
| New dependency | `leaflet` + `@types/leaflet`. Approved. |

## Architecture & data flow

`LocationsSection` composes, in order:

1. `SummaryCardsSection`
2. Saved carousel (`LocationsCarousel` → `SavedLocationCard`)
3. `SuggestedLocationsCarousel` (→ `SuggestedLocationCard`)

One `LocationDetailsDialog` is mounted **once** at the section level and opened via
section state `{ open, place, kind: "saved" | "suggested" }`. This keeps focus/escape/
animation in a single place rather than one dialog per card.

### Shared forecast hook

`useLocationForecasts(places, units) → Record<id, Forecast | null | undefined>`
fetches every saved location's forecast once, in parallel, and shares the result with
both the summary cards and the saved cards. This removes the current per-card duplicate
fetching and is the single source for summary aggregates. Suggested cards fetch their own
via the existing `useCityForecast` (fewer of them; the set changes on save).

- `undefined` = loading, `null` = failed — same convention as existing code.
- Aggregates ignore `null`/`undefined` entries.

## Components

### `SummaryCardsSection` + `LocationSummaryCard`

- Reuses the exact card markup contract from `components/forecast/summary-cards.tsx`:
  `flex flex-col p-5 border-b border-white/12 md:border-b-0 md:border-l`, same
  icon + `card-subtitle-caps` label, `stat-value text-3xl` value, `caption` sub-line,
  `data-animate` for fade/slide-in.
- Grid: `grid gap-6 sm:grid-cols-2 xl:grid-cols-4` (row on desktop, wrap on tablet,
  stacked on mobile with the bottom accent border).
- Metrics (from shared forecasts, recompute on save):
  - **Saved** — count of `prefs.locations`.
  - **Active** — name of `activeLocation(prefs)`.
  - **Avg temp** — mean of available current temps, formatted with unit.
  - **Rain** — count of locations whose current condition / today's precip indicates rain.
  - (Alerts accent slot reserved; renders "all clear" until an alert source exists.)

### `SavedLocationCard`

Refactor of `city-card.tsx`:

- Keep: hero `CityPhoto`, name, region, `AnimatedWeatherIcon` + temp + condition row,
  `card-interactive` hover elevation + image zoom.
- Remove: click-to-pin `onClick`, the "Active" pill, `aria-current` ring.
- Add: top-right **Info** icon button (`lucide-react` `Info` in a `glass-pill`),
  `aria-label`, hover/focus/keyboard states → calls `onOpenDetails(place)`.
- Card root is a non-navigating container; the info button (and future actions) are the
  interactive elements. Wrapped in `React.memo`.

### `SuggestedLocationCard`

- Same visual shell as `SavedLocationCard` (hero, name, region, temp, condition).
- Adds a **Save Location** button (existing `Button`) + Info icon.
- Save → `addPlace(prefs.locations, place)` via `usePrefs`, triggers exit animation +
  sonner toast. Fetches its own forecast via `useCityForecast`.

### `SuggestedLocationsCarousel`

- Second embla carousel mirroring `LocationsCarousel` layout/arrows/slide a11y.
- Source list = `getSuggestedLocations(prefs.locations)` → curated list minus saved
  (via `findSamePlace`). Hidden entirely when the filtered list is empty.

### `LocationDetailsDialog`

Built on radix `Dialog` (`glass-card`, fade+zoom, focus-trap, escape all free).

- **Desktop:** two columns — left (hero + description + gallery), right (map + metadata).
- **Mobile:** single column, **sticky footer** action bar.
- **Header:** hero image, name, region/country, current-weather badge.
- **Description:** Wikipedia REST `extract`, skeleton while loading, fallback copy when a
  place has none. Fetched only when the dialog opens.
- **`LocationGallery`:** responsive grid of Wikimedia Commons images, lazy-loaded,
  skeleton placeholders, click-to-enlarge lightbox, fade-in transitions.
- **`LocationMap`:** Leaflet via dynamic `ssr:false` import so it loads on open — marker,
  zoom controls, standard/satellite toggle (Esri World Imagery), "Open in Google Maps".
- **Additional info:** coordinates, elevation (from Open-Meteo response, "—" fallback),
  time zone (`place.timezone`), sunrise/sunset (that location's `daily[0]`).
- **Footer actions:**
  - Saved → Close · **View Forecast** (sets `activeLocationId`, scrolls to `#today`) · **Remove** (from `prefs.locations`).
  - Suggested → Close · **Save Location**.

### Data helpers

- `lib/suggested-locations.ts` — `SUGGESTED: Place[]` curated list (reuse the four seed
  photos in `/public/cities`; well-known world cities otherwise) +
  `getSuggestedLocations(saved): Place[]` filtering out saved places.
- `lib/api/city-details.ts` — keyless fetchers:
  - `getCityDescription(place): Promise<string | null>` (Wikipedia REST `extract`).
  - `getCityGallery(place): Promise<string[]>` (Wikimedia Commons images), capped to a
    small count, cached like `city-image.ts`.
  - Never throw; resolve to `null`/`[]` on any failure. localStorage cache + TTL,
    mirroring `city-image.ts`.

### Minor changes

- `lib/api/forecast.ts` + `types.ts`: capture `elevation` from the Open-Meteo response
  onto `Forecast` (optional; graceful "—" when absent).
- `components/sections/locations-section.tsx`: compose the new blocks; keep the existing
  header + Add-city button + `AddCityDialog`.

## Responsive behavior

- **Desktop:** summary cards single row; multiple carousel cards; two-column dialog.
- **Tablet:** summary cards wrap; responsive carousel sizing; adaptive dialog.
- **Mobile:** summary cards stacked with bottom accent; swipe carousels (embla touch);
  single-column dialog with sticky action bar.

## Animations

CSS transforms/opacity only. Summary cards fade+slide (`data-animate`). Carousel: embla
momentum scroll. Cards: `card-interactive` hover elevation + image zoom. Dialog: radix
fade+zoom. Gallery: skeleton → fade-in. Save: exit (fade+scale+width-collapse) + enter
(fade+slide) + toast. Respect `prefers-reduced-motion` / `prefers-reduced-transparency`.

## Accessibility

Radix dialog focus-trap + escape; carousels keep `role="region"` + slide labels +
keyboard-reachable arrows; info/save buttons have `aria-label`s; gallery lightbox is
keyboard-operable and escape-closable; proper heading hierarchy (section `h2` stays the
only one; cards use non-heading or lower-level text); visible focus rings from the global
`:focus-visible` contract; AA contrast preserved.

## Performance

Shared `useLocationForecasts` (no duplicate fetches); `React.memo` on cards; images
lazy-load with skeletons; map + gallery + description all deferred to dialog-open;
Leaflet dynamic-imported (`ssr:false`) so it never ships in the initial bundle;
Wikipedia/Wikimedia results cached in localStorage with TTL.

## New / changed files

**New**
- `components/locations/summary-cards-section.tsx`
- `components/locations/location-summary-card.tsx`
- `components/locations/saved-location-card.tsx`
- `components/locations/suggested-location-card.tsx`
- `components/locations/suggested-locations-carousel.tsx`
- `components/locations/location-details-dialog.tsx`
- `components/locations/location-gallery.tsx`
- `components/locations/location-map.tsx`
- `components/locations/use-location-forecasts.ts`
- `lib/suggested-locations.ts`
- `lib/api/city-details.ts`

**Changed**
- `components/sections/locations-section.tsx` (compose new blocks)
- `components/locations/locations-carousel.tsx` (pass `onOpenDetails`, drop `activeId` pin)
- `lib/api/forecast.ts`, `lib/api/types.ts` (optional `elevation`)
- `package.json` (`leaflet`, `@types/leaflet`)

**Possibly removed/retired**
- `city-card.tsx`, `city-card-loader.tsx` superseded by `SavedLocationCard` + shared hook
  (kept only if still referenced elsewhere).

## Out of scope

- Real alerts source (accent slot is future-ready only).
- True cross-carousel FLIP flight animation.
- Virtualized carousel rendering (dataset is small; noted as future-ready).
- Any change to Today/Forecast/Settings beyond the shared active-location mechanism.

## Testing

- Unit tests (vitest, jsdom) for pure logic: summary aggregates, `getSuggestedLocations`
  filtering, `city-details` fetch/cache/fallback (mirroring existing `*.test.ts` style).
- Manual/preview verification of responsive layouts, dialog, save flow, and map.
