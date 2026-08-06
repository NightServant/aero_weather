<p align="center">
  <img src="public/brand/aero-logo.svg" alt="AeroWeather logo" width="96" height="96" />
</p>

# AeroWeather

A modern weather web app built with Next.js 16 (App Router, Turbopack) and React 19. AeroWeather shows current conditions and a two-week outlook for any city in the world, presented as a single scrolling page with a dark glassmorphic interface and weather-driven gradient palettes.

## 1. App Overview

AeroWeather is a single-page weather dashboard that runs entirely in the browser. There is no account, no backend, no analytics. All preferences (saved cities, units, time format) live in `localStorage` on the device. Weather, air quality, and geocoding data are fetched on demand from Open-Meteo's three public, key-less endpoints (Forecast, Geocoding, Air Quality).

The interface is one continuously scrolling page composed of four anchor-linked sections. A sticky top navbar links to each section and highlights the one currently in view (scroll-spy); on small screens the links collapse into a slide-up drawer menu:

- **Today** — current conditions plus detail cards (UV index, sunrise, sunset, humidity/dew point) for the active city.
- **2-Week** — a "Next 24 hours" hourly rail, a 14-day forecast grid, and summary cards.
- **Locations** — summary cards, tabbed Saved / Suggested carousels, and a per-place details dialog with description, photo gallery, and interactive map.
- **Settings** — units, time format, and notification toggles.

AeroWeather is designed to be free for everyone — no sign-up, no rate limits surfaced to the user, no premium tier.

## 2. Brand

### Icon

The AeroWeather mark is a white cloud with three rain strokes on a rounded square filled with the brand gradient (`#3b82f6` → `#6366f1`, top-left to bottom-right, 11px corner radius at 40×40).

| Asset | Purpose |
|---|---|
| [`public/brand/aero-logo.svg`](public/brand/aero-logo.svg) | Canonical brand mark — use this in docs and external material |
| [`app/icon.svg`](app/icon.svg) | The same mark wired into Next.js as the favicon / app icon |

The mark is a single SVG and scales to any size; don't recolor the gradient or remove the rain strokes.

### Color palette

<p align="center">
  <img src="public/brand/brand-palette-dark.svg" alt="AeroWeather brand palette: aero blue #3b82f6, dusk indigo #6366f1, sky base #16222e, sun #ff8d28, droplet #03e9f2, pin red #dd0202, cloud white #ffffff, mist gray #cccfd1" width="820" />
</p>

AeroWeather is dark-only. Tokens are authored in OKLch in [`app/globals.css`](app/globals.css); the hex values below are the sampled equivalents recorded in [`DESIGN-SPEC.md`](DESIGN-SPEC.md) (the binding design contract).

| Token | Hex | OKLch | Used for |
|---|---|---|---|
| `--primary` | `#3b82f6` | `oklch(0.623 0.188 259.8)` | The one accent blue: hero temperature, headlines, active tab/nav |
| brand gradient end | `#6366f1` | — | Second stop of the logo-mark gradient only |
| `--background` | `#16222e` | `oklch(0.22 0.025 250)` | Sky-base page color behind the photo layer |
| `--accent-sun` | `#ff8d28` | `oklch(0.753 0.172 55.7)` | Sun icon fill/stroke, day forecast icons |
| `--accent-droplet` | `#03e9f2` | `oklch(0.849 0.144 199.8)` | Humidity/dew droplet strokes, precipitation |
| `--accent-pin` | `#dd0202` | `oklch(0.564 0.231 29.2)` | Map-pin icon stroke only — never text |
| `--text-strong` | `#ffffff` | `oklch(1 0 0)` | Stat values and card titles (large text only) |
| `--text-mid` | `#cccfd1` | `oklch(0.853 0.004 236.5)` | Secondary values, footer links |

Beyond these fixed brand colors, the hero surface carries one of seven weather-driven **sky palettes** (sunny, sunset, rainy, stormy, cloudy, snowy, night), defined as `[data-palette="…"]` gradient tokens in `app/globals.css` and selected automatically from the active city's conditions. Full token definitions, spacing, and typography live in `DESIGN-SPEC.md`.

## 3. Features

### Inline location search
The top-bar search field is a real input, not a button. Typing immediately runs a debounced geocoding query against Open-Meteo's geocoding API and renders results in an opaque dropdown directly under the input. Saved cities appear in the dropdown when the query is empty. `⌘K` / `Ctrl+K` focuses the field from anywhere.

### Today section
- Greeting header with a plain-language summary of the day for the active city.
- Any active weather alert surfaces in an alert card at the top.
- Hero block with the temperature, weather summary, "feels like / high / low" line, and a weather-driven gradient scene (animated sun, clouds, rain droplets, snowflakes, lightning, or moon depending on conditions).
- Detail cards: UV Index (with a gradient scale), Sunrise and Sunset (with day-arc visualization), and Humidity (with dew point) — all timezone-correct for the selected city.

### 2-Week Outlook
A single scrolling section (no layout switcher):
- **Next 24 hours** — an hourly rail of temperature and conditions.
- **14-day forecast** — a grid of daily cards with weekday, weather icon, condition, precipitation probability, and high/low. (Open-Meteo provides up to 16 days of daily forecast.)
- **Summary cards** — cumulative rain total, peak wind, temperature range over the period, and any active weather alerts.

### Locations
- **Summary cards** — at-a-glance metrics across your saved places: total saved, active location, average temperature, and how many are seeing rain right now. Left accent border on desktop, bottom accent on mobile (matching the 2-Week and Settings sections).
- **Saved / Suggested tabs** — a tabbed pair of carousels. *Saved* holds your places; *Suggested* offers a curated set of popular cities, filtered to hide anything you already track.
- Each card shows a hero photo, name, region, live weather icon, temperature, and condition, with an **info** button in the top-right corner. Country-level places fall back to a gradient tile instead of a flag.
- **Location details dialog** — opens from any card's info button. A hero header with a current-weather badge, a short overview (Wikipedia), a photo gallery (Wikimedia Commons) with a full-screen lightbox (prev/next + keyboard nav), an interactive **OpenStreetMap / Leaflet** map with a satellite toggle and an "Open in Google Maps" link, and metadata (coordinates, elevation, time zone, sunrise, sunset). The map, gallery, and description load only when the dialog opens.
- From a saved place's dialog you can **View forecast** (makes it the active location and jumps to Today) or **Remove** it. From a suggested place you can **Save** it — which animates it into your saved list and updates the summary cards instantly.
- Add new cities via the **+** button (opens a search dialog) or via the top-bar search.

### Weather-driven palettes
Seven palettes — sunny, sunset, rainy, stormy, cloudy, snowy, night — each with weather-appropriate gradient hues, scene accent colors, and a `--hero-text` token that auto-selects a readable foreground. Palettes are tuned in chroma and lightness for the dark interface so hero cards sit quietly against the dark surface instead of glowing. The active palette is derived from the current conditions of the selected city.

### Glassmorphism + dark chrome
All surface cards use a semi-transparent background, a 1px strong-hairline border, and a backdrop blur. The base color system is a dark blue/slate palette — only the weather hero gradients carry weather hue.

### Use-my-location
The map-pin button in the top bar requests the browser's geolocation, reverse-geocodes the coordinates via Open-Meteo, and adds the resolved place to your saved cities as the active location.

### Units & locale
- Temperature: °C / °F
- Wind: km/h, mph, m/s
- Time format: 12h / 24h
- First day of week: Sun / Mon (used by the forecast grid)

### Notifications panel
Toggle rows for push permission, severe-weather alerts, daily morning briefing, and "rain starting soon" heads-up. (UI toggles persist locally; actual delivery requires a service worker which is not configured by default.)

### Local-first preferences
Every preference — units, time format, notifications, saved cities, active city — is stored in `localStorage` under the key `aero.prefs.v1`. Changes are broadcast to all open tabs via the `storage` event. Clearing site data wipes the app's state.

## 4. Localhost Installation

AeroWeather requires **Node.js 20.9+** (Node 20 LTS or newer recommended, per Next.js 16) and **npm**.

```bash
git clone <repository-url> weather_app
cd weather_app

npm install
npm run dev
```

The dev server (Turbopack) starts at <http://localhost:3000>. Open it and you'll land on the Today section with the default city until you search for or geolocate your own.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

No environment variables, API keys, or external services need to be configured. Open-Meteo's APIs are key-less and open.

## 5. Limitations

- **Forecast horizon** — daily forecasts are capped at 16 days by Open-Meteo, and the 2-Week section shows 14 of them. There is no true "monthly" outlook.
- **No backend / no account** — preferences and saved cities live in `localStorage` only. Clearing site data, switching browsers, or using private/incognito windows resets the app.
- **Notifications are toggles only** — the Notifications section persists user intent, but AeroWeather ships without a service worker, so no push notifications are actually delivered.
- **Geolocation accuracy** — "Use my location" uses the browser's coarse geolocation with an 8-second timeout. Indoor or VPN-affected positions can resolve to a nearby city rather than your exact spot.
- **Network-dependent** — data is fetched from Open-Meteo on load and on city change. Offline use is not supported; there is no cache layer beyond the browser's HTTP cache.
- **Rate limits** — Open-Meteo's free tier is generous but not infinite. Rapidly switching cities or hammering search may temporarily return HTTP 429.
- **Air-quality coverage** — air-quality data is fetched from the Open-Meteo air-quality endpoint (which has uneven coverage outside major regions) but is not currently surfaced in a dedicated card.
- **Time zones** — display uses the selected city's IANA timezone returned by the geocoder. Cities without a confident timezone fall back to UTC.
- **Accessibility** — keyboard navigation works for primary controls (search input, nav links, toggles), but a full screen-reader pass has not been done. Reduced-motion preferences are not yet wired into the gradient animations.
- **Browser support** — `backdrop-filter` (used for glassmorphism) requires a recent Chromium, Safari 15+, or Firefox 103+. Older browsers will render the cards as opaque surfaces.
