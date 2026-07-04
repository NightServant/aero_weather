# AeroWeather Design Spec (v1)

Binding contract for the AeroWeather redesign. Source of truth: Figma file "AeroWeather Redesign"
(fileKey `o5oovDIMbvWj7xQG6gpIbQ`, page `0:1`, frames `1:2` Today, `1:3` 2-Week, `1:4` Locations,
`1:5` Settings) plus the Taste-skill refinements the user approved ("spec-only, no Figma edits":
this document, not the Figma file, is the implementation authority).

Design read: consumer weather app product UI, dark glassmorphism over full-bleed sky photography,
one blue accent, Poppins, restrained ambient motion. Dials: VARIANCE 4, MOTION 5, DENSITY 4.
Mode: redesign - preserve (Figma layout and intent kept; spacing rhythm, hierarchy, contrast and
copy slop are refined per the sections below).

Provenance note: exact geometry comes from Figma `get_metadata` of page `0:1`; colors were sampled
programmatically from full-resolution Figma frame renders (dominant-color scans, converted to
OKLch). `get_design_context` / `get_variable_defs` / `download_assets` became unavailable mid-task
(Figma Starter-plan MCP quota). Consequences are listed in "Missing assets" at the end. Nothing
here is invented: every number is measured from metadata or sampled from renders.

---

## 1. Color tokens

Dark-only. `:root` holds the final dark values (no `.dark` class variants; delete the current
light theme and `.dark` block). Values are OKLch; sampled hex given for traceability.

### 1.1 Base (shadcn variable names)

| Token | Value | Source / note |
|---|---|---|
| `--background` | `oklch(0.22 0.025 250)` | fallback page color behind sky photo (sky base #16222e region) |
| `--foreground` | `oklch(0.97 0.003 240)` | near-white, never pure #fff for body |
| `--card` | `oklch(0.28 0.025 242)` | solid card base; glass utilities apply their own alpha |
| `--card-foreground` | `oklch(0.97 0.003 240)` | |
| `--popover` | `oklch(0.25 0.022 245)` | solid (menus/drawers never translucent over photo) |
| `--popover-foreground` | `oklch(0.97 0.003 240)` | |
| `--primary` | `oklch(0.623 0.188 259.8)` | accent blue #3b82f6: 31°C display, headlines, active tab/nav |
| `--primary-foreground` | `oklch(0.99 0 0)` | |
| `--secondary` | `oklch(0.32 0.02 245)` | |
| `--secondary-foreground` | `oklch(0.95 0.004 240)` | |
| `--muted` | `oklch(0.30 0.015 245)` | |
| `--muted-foreground` | `oklch(0.78 0.008 245)` | raised from Figma's #919599 for AA on glass (see section 7) |
| `--accent` | `oklch(0.68 0.16 255)` | hover tint of primary |
| `--accent-foreground` | `oklch(0.99 0 0)` | |
| `--destructive` | `oklch(0.564 0.231 29.2)` | pin red #dd0202 family |
| `--border` | `oklch(1 0 0 / 14%)` | |
| `--input` | `oklch(1 0 0 / 16%)` | |
| `--ring` | `oklch(0.623 0.188 259.8)` | |
| `--radius` | `1rem` | cards 16px; hero surfaces use explicit 24px (section 2) |
| `--chart-1..5` | blue ramp `oklch(0.70 0.15 255)` to `oklch(0.35 0.03 250)` | keep existing shape, re-hue to 250-260 |

### 1.2 Named accents (register in `@theme inline` as colors)

| Token | Value | Sampled | Used by |
|---|---|---|---|
| `--accent-sun` | `oklch(0.753 0.172 55.7)` | #ff8d28 | sun icon fill/stroke, day forecast icons |
| `--accent-droplet` | `oklch(0.849 0.144 199.8)` | #03e9f2 | humidity/dew droplet icon stroke, precip |
| `--accent-pin` | `oklch(0.564 0.231 29.2)` | #dd0202 | location map-pin icon stroke only, never text |
| `--text-strong` | `oklch(1 0 0)` | #ffffff | stat values, card titles (large text only) |
| `--text-mid` | `oklch(0.853 0.004 236.5)` | #cccfd1 | secondary values, footer links |

Rule: `--primary` is the only interactive accent. Sun orange, droplet cyan and pin red are
iconographic only; they never color text, buttons or focus states.

### 1.3 Sky palettes (7 sets, `[data-palette="..."]`)

Single dark set per key (replaces both existing light and `.dark` sets). Variables per set:
`--hero-from/via/to` (gradient stops), `--hero-glow` (radial), `--scene-stroke` and
`--scene-accent` (animated icon strokes), `--palette-accent`, `--hero-text`. Stops for cloudy,
stormy, night and sunset are anchored to the sampled Figma sky range (L 0.22-0.30, C <= 0.035,
hue 225-255); the photo-less keys stay in the same luminance band so chrome contrast never breaks.

| Key | `--hero-from` | `--hero-via` | `--hero-to` | `--hero-glow` | `--scene-accent` |
|---|---|---|---|---|---|
| sunny | `oklch(0.48 0.09 230)` | `oklch(0.38 0.07 242)` | `oklch(0.28 0.05 250)` | `oklch(0.80 0.13 85 / 0.35)` | `oklch(0.78 0.15 70)` |
| sunset | `oklch(0.45 0.07 50)` | `oklch(0.33 0.06 25)` | `oklch(0.22 0.04 305)` | `oklch(0.60 0.12 45 / 0.35)` | `oklch(0.80 0.12 55)` |
| rainy | `oklch(0.38 0.03 240)` | `oklch(0.30 0.035 245)` | `oklch(0.21 0.035 250)` | `oklch(0.45 0.05 235 / 0.30)` | `oklch(0.72 0.06 235)` |
| stormy | `oklch(0.34 0.03 250)` | `oklch(0.25 0.03 255)` | `oklch(0.17 0.03 258)` | `oklch(0.45 0.06 250 / 0.30)` | `oklch(0.85 0.10 95)` |
| cloudy | `oklch(0.30 0.011 226)` | `oklch(0.27 0.02 240)` | `oklch(0.22 0.03 250)` | `oklch(0.40 0.01 240 / 0.30)` | `oklch(0.70 0.02 240)` |
| snowy | `oklch(0.50 0.02 230)` | `oklch(0.40 0.022 235)` | `oklch(0.30 0.025 245)` | `oklch(0.70 0.02 220 / 0.30)` | `oklch(0.82 0.04 215)` |
| night | `oklch(0.26 0.04 260)` | `oklch(0.20 0.04 258)` | `oklch(0.13 0.03 255)` | `oklch(0.40 0.05 265 / 0.30)` | `oklch(0.88 0.06 85)` |

All 7: `--hero-text: oklch(0.98 0.003 240)`, `--scene-stroke: oklch(0.92 0.01 240)` except
sunny/sunset where `--scene-accent` doubles as the sun stroke. `--palette-accent` = the hue-matched
mid tone (sunny `oklch(0.72 0.15 70)`, sunset `oklch(0.66 0.14 35)`, rainy `oklch(0.58 0.10 242)`,
stormy `oklch(0.66 0.16 275)`, cloudy `oklch(0.60 0.03 242)`, snowy `oklch(0.68 0.07 215)`,
night `oklch(0.70 0.13 275)`).

Keep the existing `.dark .grain-overlay` fix concept (grain at 2 to 6% only, `mix-blend-mode:
normal` on dark) since the app is now always dark.

---

## 2. Glass recipe

Sampled physics: the Figma navbar reads as white ~9% over the blurred sky; hero cards white ~12%;
tab pills white ~10% with a brighter 1px border. Exactly three glass utilities plus one plain
tint. Backdrop-blur is allowed ONLY on `.glass-navbar` and `.glass-card` (navbar + hero-level
cards). Everything else uses `.tint-card` (no blur) for perf: the 14-card grid, city cards,
settings cards and footer never blur.

```css
.glass-navbar {
  background: color-mix(in oklch, white 10%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid color-mix(in oklch, white 16%, transparent);
  border-radius: 24px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.10),
              0 12px 40px -12px rgb(0 0 0 / 0.45);
}
.glass-card {
  background: color-mix(in oklch, white 11%, transparent);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  border: 1px solid color-mix(in oklch, white 18%, transparent);
  border-radius: 24px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12),
              0 20px 50px -24px rgb(0 0 0 / 0.50);
}
.glass-pill {
  background: color-mix(in oklch, white 8%, transparent);
  border: 1px solid color-mix(in oklch, white 22%, transparent);
  border-radius: 9999px;
  /* no backdrop-filter */
}
.tint-card {
  background: oklch(0.25 0.03 240 / 0.55);
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 16px;
  /* no backdrop-filter, no shadow by default */
}
```

Hero-level (may use `.glass-card`): Today heading card, right-rail trio (Sunrise/Sunset/UV),
Today summary + wind + humidity cards, the four section-heading cards, 2-Week outlook label card.
Everything else is `.tint-card`. `prefers-reduced-transparency: reduce` swaps both glass classes
to solid `oklch(0.25 0.02 245 / 0.92)` and removes the blur.

Radius system (Shape Lock): 24px hero surfaces and navbar, 16px all other cards, 12px images
inside cards, 9999px pills/tabs/toggles/icon buttons. No other radii.

---

## 3. Typography

Poppins only, weights 300-800, via `next/font/google` with `variable: "--font-poppins"`,
`display: "swap"`, subset `latin`. Map `--font-sans` and `--font-heading` to it (replaces
Montserrat). Numerals: `font-variant-numeric: tabular-nums` on every temperature, time and stat
(`.tabular` utility exists).

| Style | Size / line-height | Weight | Tracking | Color | Example |
|---|---|---|---|---|---|
| Display temp | `clamp(4rem, 9vw, 6.5rem)` (64 to 104px) / 1.0 | 600 | -0.02em | `--primary` | "31°C" |
| Page headline | `clamp(2.25rem, 4vw, 3rem)` (36 to 48px) / 1.12 | 600 | -0.01em | `--primary` | "Good morning!" |
| Headline subtitle | 1.125rem (18px) / 1.5 | 400 | 0 | `--muted-foreground` | heading card second line |
| Kicker / eyebrow | 1rem (16px) / 1.2 | 600 | +0.08em, uppercase | `--foreground` | "2-WEEK OUTLOOK" |
| Card title caps | 1rem (16px) / 1.3 | 600 | +0.04em, uppercase | `--foreground` | "TODAY - JULY 1, 2026" |
| Card subtitle caps | 0.75rem (12px) / 1.3 | 500 | +0.08em, uppercase | `--muted-foreground` | "MANILA, PHILIPPINES" |
| Stat title | 1.125rem (18px) / 1.4 | 600 | 0 | `--text-strong` | "Humidity", "Sunrise" |
| Stat value | 1.25rem (20px) / 1.3 | 600 | 0 | `--text-strong` | "29°C" in city card |
| Body | 0.9375rem (15px) / 1.5 | 400 | 0 | `--foreground` | nav links, settings copy |
| Caption | 0.8125rem (13px) / 1.45 | 400 | +0.01em | `--muted-foreground` | "Dew point 1°C", "9 saved" |
| Footer heading | 0.9375rem (15px) / 1.4 | 600 | 0 | `--foreground` | "Weather", "Resources" |
| Footer link / legal | 0.875rem (14px) / 2.4 rows (34px pitch) | 400 | 0 | `--text-mid` | link items |

Eyebrow budget (Taste rule): each page keeps exactly one caps kicker (the small label card:
TODAY dateline, 2-WEEK OUTLOOK, MY LOCATIONS, SETTINGS). No additional caps labels above other
sections.

---

## 4. Motion table

All animations transform/opacity only. Spring feel via `cubic-bezier(0.16, 1, 0.3, 1)` (named
`--ease-out-quart` here). Keep existing `aero-rise`, `aero-pulse-ring`, `aero-droplet`; retire
`aero-spin-slow` in favor of `aero-ray-spin`.

| Keyframe | Duration / iteration | Easing | Animates | Used on |
|---|---|---|---|---|
| `aero-ray-spin` | 40s infinite | linear | `rotate(360deg)` on the ray group only (disc static) | sun icon rays |
| `aero-cloud-drift` | 14s infinite alternate | ease-in-out | `translateX(-8px)` to `8px` | cloud icon layers, offset delays per layer |
| `aero-rain-fall` | 1.2s infinite | linear | `translateY(-2px -> 14px)` + opacity 0 -> 1 -> 0 | rain drops, 3 drops with 0.15s stagger |
| `aero-flash` | 6s infinite | steps | opacity 0 (0-80%), 0.9 (82%), 0 (84%), 0.7 (86%), 0 (90-100%) | storm lightning bolt |
| `aero-float` | 6s infinite alternate | ease-in-out | `translateY(-5px)` to `0` | hero weather icon container, moon |
| `aero-rise` | 480ms, once, `both` | `--ease-out-quart` | opacity 0 -> 1, `translateY(12px -> 0)`, blur 6px -> 0 | entrances, `.stagger-1..6` at 80ms steps |
| `aero-pulse-ring` | 1.8s infinite | ease-in-out | box-shadow ring 0 -> 6px of `--palette-accent` | "now" marker in hourly view |
| `aero-droplet` | 1.6s infinite | ease-in | `translateY(-4px -> 16px)` + opacity | droplet icon detail |

Interaction motion:

| Target | Hover / active | Spec |
|---|---|---|
| Cards (`.glass-card`, `.tint-card` interactive) | hover | `translateY(-2px)`, border brightens to white/28%, shadow deepens; 200ms ease-out |
| Pills, buttons | active | `scale(0.98)`; 120ms |
| Icon circle buttons | hover | bg white/8% to white/14%; 150ms |
| Tab pill (Radix) | selection | white/12% thumb slides behind labels: `transform` 240ms `--ease-out-quart`; label color 150ms |
| Links | hover | color to `--foreground` (footer) or `--primary` (nav); 150ms; no underline animation |

Scroll reveal: `hooks/use-in-view.ts` (IntersectionObserver, `once: true`, threshold 0.2) sets
`data-inview` on the element. Content is VISIBLE by default (no-JS and SSR safe); only when a
`js` class is present on `<html>` does CSS apply the hidden initial state, then `[data-inview]`
plays `aero-rise`. Never hide content behind JS that has not run.

Global kill switch (mandatory):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Sky system

Layer order inside `components/shell/sky-background.tsx` (fixed, `inset-0`, `z-0`,
`pointer-events-none`; app content sits above at `z-10`):

1. Gradient base, ALWAYS painted: `radial-gradient(120% 80% at 75% 25%, var(--hero-glow),
   transparent 60%), linear-gradient(160deg, var(--hero-from) 0%, var(--hero-via) 55%,
   var(--hero-to) 100%)`.
2. Photo layer (only keys that have one): `next/image` `fill priority` `object-cover`,
   opacity 0.65, fade-in 600ms after load. The photo is enhancement; nothing may depend on it.
3. Scrim, always painted above photo: `linear-gradient(180deg, oklch(0.13 0.02 250 / 0.55) 0%,
   oklch(0.13 0.02 250 / 0.25) 35%, oklch(0.10 0.02 250 / 0.60) 100%)`.
4. Grain overlay (existing `--grain`), opacity 0.04, `mix-blend-mode: normal`.

| Sky key | Gradient stops | Photo (`public/skies/`) | Scrim |
|---|---|---|---|
| sunny | section 1.3 row | gradient-only | standard |
| sunset | section 1.3 row | `sunset.webp` (1920x846) | standard |
| rainy | section 1.3 row | gradient-only | standard |
| stormy | section 1.3 row | `stormy.webp` (1920x800) | standard |
| cloudy | section 1.3 row | `cloudy.webp` (1920x846) | standard + extra top band `oklch(0.10 0.02 250 / 0.15)` (photo is brightest) |
| snowy | section 1.3 row | gradient-only | standard |
| night | section 1.3 row | `night.webp` (1920x846) | standard |

Photo provenance: the Figma file reuses ONE dark cloudscape plate (2326x1024) across all four
frames; its originals were not exportable (see Missing assets). The four shipped plates are
open-license Wikimedia Commons photography curated to the same mood and luminance band:
night = "Moon in clouds over Kolleröd" by W.carter (CC0); stormy = "Grey stormy clouds over Don
Som island" by Basile Morin (CC BY-SA 4.0); sunset = "Blue stormy clouds at sunset, Don Det" by
Basile Morin (CC BY-SA 4.0); cloudy = "Nimbostratus pannus" by GerritR (CC BY-SA 4.0). Credit
line ships in the footer (section 8). No query strings in filenames; all <= 1920px wide, webp.

---

## 6. Responsive rules

Design canvas 1440. Content container: `max-w-[1188px] mx-auto` with `px-6` (matches the Figma
126px side margins at 1440). Breakpoints: 1440 (design), 1024, 768, 375.

| Region | >= 1280 | 1024 | 768 | 375 |
|---|---|---|---|---|
| Navbar | floating glass bar, `max-w-[1200px]`, logo + brand left, centered nav pills, search 289x40 right | search collapses to icon-circle button that expands inline | logo + hamburger only; nav pills and full search live in a vaul drawer (bottom sheet) | same; drawer items are 48px rows |
| Today | 2-col grid `[minmax(0,1fr)_338px] gap-6`: hero left, right rail stacked | same, rail 300px | hero stacks above rail; rail becomes 2-col grid of `.tint-card`s | 1-col; display temp clamps to 64px |
| 2-Week grid | 4 cols x 105px rows, gap 24 | 4 cols | 2 cols | 1 col |
| Locations | 4-card carousel row + prev/next icon buttons | 3 visible, arrows | horizontal `scroll-snap-x mandatory` touch scroll, arrows hidden, `scrollbar-width: none` | same, card width 78vw, snap-center |
| Settings | 4 cards in a row, gap 24 | 2x2 grid | 2x2 | 1 col |
| Footer | 4 columns (brand + 3 link lists) | 4 cols | brand full-width, then 3 cols wrap to 2 | 1 col, bottom bar stacks 2 lines |

Rules: never `h-screen`, use `min-h-[100dvh]` on the page shell. The sky background is fixed and
independent of breakpoints. Tab pills keep 44px hit areas at all sizes (section 7). Drawer =
vaul with nav pills + search input; focus is trapped, `aria-label="Menu"`.

---

## 7. Accessibility contract

- Contrast: all text over glass must measure >= 4.5:1 against the WORST-case composite (photo
  brightest region + scrim + card fill). Enforcement: (a) scrim from section 5 is mandatory,
  (b) `.tint-card` dark fill (L ~= 0.25 at 55%) keeps effective backdrop L <= 0.35 over any sky,
  (c) captions use `--muted-foreground` `oklch(0.78 0.008 245)`, deliberately raised from Figma's
  sampled #919599 (~3.6:1, fails) to ~5.1:1, (d) `--primary` blue text only at >= 18px semibold
  (large-text 3:1 rule; it measures ~4.6:1 on the sky base anyway).
- Focus: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }` plus
  `box-shadow: 0 0 0 4px oklch(0.623 0.188 259.8 / 0.25)` for visibility over photos. Never
  remove outlines. Radius inherits the control.
- Tabs: every pill tab group (Hourly/Daily/Grid, Carousel/List, Units and locale/Notifications)
  is Radix Tabs: `role=tablist/tab/tabpanel`, arrow-key roving focus, `aria-selected`,
  panels labelled by tabs. The sliding thumb is presentational (`aria-hidden`).
- Carousel (Locations): container `role="region"`, `aria-roledescription="carousel"`,
  `aria-label="Saved locations"`; prev/next are real buttons with `aria-label="Previous
  locations"` / `"Next locations"` and `disabled` at ends; each card wrapper
  `role="group"`, `aria-roledescription="slide"`, `aria-label="3 of 9"`. Scroll-snap variant
  keeps the same semantics.
- Touch targets: >= 44x44px for everything interactive. Tabs render 32px tall visually but get
  padding hit-slop to 44px; carousel arrows are 48px; drawer rows 48px.
- Headings: exactly one `h1` per page, and it is the page headline (Today "Good morning!",
  2-Week "Bright skies in 2 weeks.", Locations "Places at a glance", Settings "Preferences").
  Kicker labels are `<p>`, card titles are `h2`, stats inside cards are `h3` or plain `dl`.
- Live data: temperature/summary regions get `aria-live="polite"` on refresh; decorative weather
  icons `aria-hidden="true"` with adjacent text alternatives; the animated hero icon has
  `role="img"` + `aria-label` ("Clear sky, day").
- Skeletons match final layout shape (no spinners) and are `aria-hidden` with an `aria-busy`
  container.

---

## 8. Copy + slop fixes

| Where | Figma (slop) | Ship |
|---|---|---|
| Today summary card | "Brought to you by OpenWeatherAPI" | "Data by Open-Meteo" |
| Today summary card | "AERO ALMANAC - Clear" | "Aero Almanac" title + live condition text |
| Hero temp | static "31°C" | live `current.temperature` + unit pref |
| Wind card | "Wind - 4 km/h / From the north" | live value + bearing text; label/value hierarchy, no " - " joiner |
| Humidity card | "Humidity - 14% / Dew point 1°C" | live humidity + dew point (both exist in the API layer) |
| Right rail | sunrise "00:14", sunset "13:54" (impossible) | live daily sunrise/sunset via `timeFormat` pref |
| 2-Week grid | 16 cards, every card "42°C 27°C" | exactly 14 real days, live hi/lo, today first |
| Day labels | "Thurs", "Tues" (inconsistent) | 3-letter `Intl.DateTimeFormat` weekday: Thu, Tue; week starts per `firstDayOfWeek` pref |
| Locations heading | "MY LOCATIONS / 9 saved" | live count from prefs; keep phrasing |
| Settings card | "1st day of the week" | "First day of the week" (Sun / Mon toggles, default Mon) |
| Dateline | "TODAY - JULY 1, 2026" | keep pattern, live date, plain hyphen only (em/en dashes banned app-wide) |
| Footer columns | partial lists | Weather: Today, 2-week outlook, Locations, Settings. Features: Search cities, Use my location, Weather alerts. Resources: Weather Data by Open-Meteo, Reverse geocoding by BigDataCloud, UV index scale, US AQI categories, About Aero, Privacy |
| Footer bottom bar | "© 2026 Aero · v1.0.0" only | left: "© 2026 Aero · v1.0.0"; right: "Weather data © Open-Meteo (CC BY 4.0) · Made with Next.js" and "City & sky imagery via Wikimedia Commons" |
| Footer theme | (render ambiguity) | footer is a dark translucent panel (`.tint-card` treatment, full-bleed): fill `oklch(0.25 0.03 240 / 0.60)`, bottom bar strip `oklch(1 0 0 / 0.06)`. One theme per page, no light section |

City cards use the committed photos `public/cities/{bamban,manila,baguio,mabalacat}.webp` with
live weather per location. All placeholder numbers anywhere else become live API data or are
removed. Zero em-dashes and no `·` chains beyond one per line (footer bottom bar uses at most
one separator per phrase group).

---

## 9. Component inventory

Shared primitives; parallel agents must use these paths and shapes exactly.

| File | Props (one line) |
|---|---|
| `components/aero/glass-card.tsx` | `{ variant?: "glass" \| "tint" \| "navbar"; as?: ElementType; className?: string; children: ReactNode }` renders section-2 recipes; `glass` is the only blurred card |
| `components/aero/pill-tabs.tsx` | `{ tabs: { value: string; label: string }[]; value: string; onValueChange(v: string): void; ariaLabel: string }` Radix Tabs + sliding thumb |
| `components/aero/tag-toggle-group.tsx` | `{ options: { value: string; label: string }[]; value: string; onValueChange(v: string): void; ariaLabel: string }` Radix ToggleGroup (single, required) for settings units |
| `components/aero/icon-circle-button.tsx` | `{ icon: ReactNode; label: string; onClick?(): void; size?: 40 \| 48; disabled?: boolean }` round `.glass-pill` button, `aria-label` = label |
| `components/icons/animated-weather-icon.tsx` | `{ kind: WeatherKind; isDay: boolean; size: number; animated?: boolean }` SVG scenes using section-4 keyframes and `--scene-stroke/--scene-accent/--accent-sun/--accent-droplet` |
| `components/shell/navbar.tsx` | `{}` (derives active route itself); logo `public/brand/aero-logo.svg` 40px + "AeroWeather" wordmark ("Aero" in `--primary`, "Weather" white), nav pills, search, mobile drawer |
| `components/shell/site-footer.tsx` | `{}` static inventory from section 8 |
| `components/shell/sky-background.tsx` | `{ palette: PaletteKey }` layers from section 5 |
| `hooks/use-in-view.ts` | `useInView<T extends HTMLElement>(opts?: IntersectionObserverInit): { ref: RefObject<T>; inView: boolean }` and sets `data-inview` |

`WeatherKind` from `lib/api/weather-code.ts`; `PaletteKey` from `lib/prefs.ts`;
`paletteFromWeather()` from `lib/theme.ts` decides the sky key (`paletteMode: "auto"`).

---

## Per-screen blueprint

Measured from Figma metadata (frame-local px at 1440). Canvas-level nodes are listed with the
screen they belong to; normalize the noted irregular gaps to the 24px rhythm.

Global: sky background full-bleed; navbar 1200x99 glass bar at y=44 centered (logo 40x40 at
x=32 inside, brand text, nav pills 32px tall centered around x=601..909, search 289x40 at right
inner edge, map-pin 20px + city name adjacent to search on Today). Content container 1188px
(x=126..1314). Section heading card on every page: 1188x162 glass card containing the h1 +
subtitle.

### Today (`1:2` + canvas nodes 10:11415, 10:11580, 10:11613, 10:11643, 10:11468-group, 10:11053, 11:11725, 10:11423)
1. Heading card 819x181 at (126,176): h1 "Good morning!" + subtitle (canvas node 10:11415).
2. Right rail x=976, width 338, cards 338x181: Sunrise (y=176), Sunset (y=385), UV Index
   (y=600), Humidity + dew point (y=811). Figma gaps 28/34/30 normalize to 24 (rail pitch 205).
3. Hero left column: dateline card 295x90 at (130,364) "TODAY - {date}" / "{CITY}"; almanac
   label card 295x90 at (437,366); animated sun 300x300 at (125,467); display temp at
   (425,548) 378x137; wind card 295x181 at (437,767); summary card 295x181 at (126,769).
   Grid: `[minmax(0,1fr)_338px] gap-6`, left column internally 2-col at 295px rhythm.

### 2-Week (`1:3` + canvas node 11:11992)
1. Kicker card 338x73 at (129,34) "2-WEEK OUTLOOK"; tabs Hourly/Daily/Grid 191x30 at (1120,56).
2. Heading card 1188x162 at (126,102): h1 "Bright skies in 2 weeks." + subtitle (node 11:11992).
3. Grid view: 4 cols x 4 rows of stats cards 240x105 (cols at x=127/434/754/1074, rows at
   y=294/429/564/699). Ship: `grid-cols-4 gap-6`, 14 cards (today + 13), each card = weather
   icon 48px + day label + hi/lo temps. Hourly and Daily tabs reuse the same card grammar in
   list form.
4. Bottom summary card 1188x162 at (126,849).

### Locations (`1:4` + canvas nodes 15:365, 15:463, 15:479)
1. Pin card 240x157 at (133,39): red pin icon 24px, "MY LOCATIONS" kicker, "{n} saved" caption.
   Tabs Carousel/List 191x30 at (1083,112).
2. Heading card 1188x162 at (126,180): h1 "Places at a glance" (node 15:365).
3. Carousel: 4 visible city cards 240x425 (x=160/440/720/1013, y=363; normalize to equal
   gaps in an 1188 track), prev/next 48px icon circle buttons at x=102 / x=1266 vertically
   centered on the row (y=538). Card anatomy: 16px padding; photo 208x247 radius 12; name
   (2 lines, 15px); weather icon 20-24px; temp 20px semibold; condition caption 13px.
4. List tab: same data as rows (tint-card, 64px tall, photo thumb 48px).

### Settings (`1:5` + canvas nodes 15:656, 15:759, 15:910, 15:924, 15:938)
1. Gear card 240x165 at (130,23): gear icon 32px + "SETTINGS" kicker. Tabs "Units and locale" /
   "Notifications" 317x30 at (1007,111).
2. Heading card 1188x162 at (126,142): h1 "Preferences" + subtitle (node 15:656).
3. Units row y=350: four cards 294x182 (x=121/426/731/1036; Figma gap 11 normalize to
   `grid-cols-4 gap-6`): Temperature (°C/°F), Wind speed (km/h / mph / m/s), Time format
   (12h/24h), First day of the week (Sun/Mon). Card anatomy: icon 40px, tag-toggle-group 32px,
   label 15px, caption 13px. Notifications tab: toggle rows bound to `NotificationPrefs`.
4. Footer 1440x360 at y=664 (dark panel, section 8): inner content aligned to the 1188
   container; brand block (logo 40px, "AeroWeather", tagline) + three link columns 262px wide
   at 278px pitch; rows on a 34px pitch; bottom bar 1440x44 at y=945.

---

## Missing assets

Figma MCP quota (Starter plan) was exhausted mid-task; these could not be exported and were
substituted or deferred. Re-export when quota resets; until then this spec's substitutes stand.

| Asset | Figma node | Status |
|---|---|---|
| Sky plate 1 (Today bg) | `10:11032` "image 1" 2326x1024 | not exportable; shipped curated equivalents in `public/skies/` (section 5 credits) |
| Sky plate 2 (2-Week bg) | `11:11708` "image 2" | same (single photo reused across frames in Figma) |
| Sky plate 3 (Locations bg) | `11:11713` "image 3" | same |
| Sky plate 4 (Settings bg) | `11:11721` "image 4" | same |
| Logo mark | `10:10957` "icon 1", `0:128` "icon 2" | SVG export unavailable; `public/brand/aero-logo.svg` derived from the committed `app/icon.svg`, which is the identical 40x40 mark (rx-11 blue-gradient square #3b82f6 to #6366f1, white cloud, three rain strokes) |
| Variable defs / design context | page `0:1` | unavailable; colors sampled from full-res frame renders as documented in the Provenance note |
