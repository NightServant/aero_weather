<p align="center">
  <img src="app/icon.svg" alt="Aero logo" width="96" height="96" />
</p>

# Aero — Weather

A modern weather web app built with Next.js 16 (App Router, Turbopack) and React 19. Aero shows current conditions, hourly trends, and a seven-day outlook for any city in the world, with a blue/gray/white visual language, glassmorphic surfaces, and weather-driven gradient palettes.

## 1. App Overview

Aero is a single-page weather dashboard that runs entirely in the browser. There is no account, no backend, no analytics. All preferences (saved cities, units, time format, theme) live in `localStorage` on the device. Weather, air quality, and geocoding data are fetched on demand from Open-Meteo's three public, key-less endpoints (Forecast, Geocoding, Air Quality).

The interface is organized around four pages reachable from the sidebar:

- **Today** — current conditions, an hourly strip, and detail tiles (UV, sunrise/sunset, visibility, pressure) for the active city.
- **7-Day** — a multi-day outlook with three layouts (Hourly / Daily / Grid).
- **Locations** — saved cities at a glance, each card tinted by its live weather.
- **Settings** — units, time format, notification toggles, and version/data-source info.

Aero is designed to be free for everyone — no sign-up, no rate limits surfaced to the user, no premium tier.

## 2. Features

### Inline location search
The top-bar search field is a real input, not a button. Typing immediately runs a debounced geocoding query against Open-Meteo's geocoding API and renders results in an opaque dropdown directly under the input. Saved cities appear in the dropdown when the query is empty. `⌘K` / `Ctrl+K` focuses the field from anywhere.

### Today page
- Hero block with the temperature, weather summary, "feels like / high / low" line, and a weather-driven gradient scene (animated sun, clouds, rain droplets, snowflakes, lightning, or moon depending on conditions).
- Tabbed view switcher: **Today** (hourly for today's calendar date) and **Tomorrow** (hourly for tomorrow's calendar date), both timezone-correct for the selected city.
- Three live stat cards (Humidity with dew point, Wind with cardinal direction, Air Quality with US AQI and category).
- Four detail tiles below the strip: UV Index (with a gradient scale), Sunrise/Sunset (with day-arc visualization), Visibility, and Pressure trend.

### 7-Day Outlook
Three layouts of the same data, selectable from the header:
- **Hourly** — full hourly chart for the next several days.
- **Daily** — a list of 7 days with weekday, weather icon, condition label, precipitation probability bar, and high/low.
- **Grid** — a compact card grid showing the same data, useful for at-a-glance comparison. (Open-Meteo provides up to 16 days of daily forecast.)

Summary cards at the bottom show cumulative rain total, peak wind, temperature range over the week, and any active weather alerts.

### Locations
- "Cities at a glance" grid of saved cities. Each card is tinted by its live weather (sunny, rainy, stormy, snowy, night, …) and shows local time, current temp, condition, and high/low.
- Tap a card to make it the active location across the app.
- The card marked **HOME** is the current active city.
- Add new cities via the **Add city** button (opens a search dialog) or via the top-bar search.

### Weather-driven palettes
Seven palettes — sunny, sunset, rainy, stormy, cloudy, snowy, night — each with weather-appropriate gradient hues, scene accent colors, and a `--hero-text` token that auto-selects readable foreground (dark text on light gradients, white text on dark gradients). Palettes are reduced in chroma and lightness when the app is in dark mode so hero cards sit quietly against the dark surface instead of glowing.

### Glassmorphism + blue/gray/white chrome
All surface cards use a semi-transparent background, a 1px strong-hairline border, and a 16–20px backdrop blur. The base color system is blue/gray/white in both light and dark mode — only the weather hero gradients carry weather hue.

### Use-my-location
The map-pin button in the top bar requests the browser's geolocation, reverse-geocodes the coordinates via Open-Meteo, and adds the resolved place to your saved cities as the active location.

### Units & locale
- Temperature: °C / °F
- Wind: km/h, mph, m/s
- Time format: 12h / 24h
- First day of week: Sun / Mon (used by the Daily view)

### Notifications panel
Toggle rows for push permission, severe-weather alerts, daily morning briefing, and "rain starting soon" heads-up. (UI toggles persist locally; actual delivery requires a service worker which is not configured by default.)

### Theme
Light and dark mode via `next-themes`. The top-bar sun/moon button toggles the theme; the choice persists across reloads. Theme transition is suppressed so the dark slate-and-glass look swaps in cleanly.

### Local-first preferences
Every preference — units, time format, palette mode, notifications, saved cities, active city — is stored in `localStorage` under the key `aero.prefs.v1`. Changes are broadcast to all open tabs via the `storage` event. Clearing site data wipes the app's state.

## 3. Localhost Installation

Aero requires **Node.js 18.18+** (Node 20 LTS recommended) and **npm**.

```bash
git clone <repository-url> weather_app
cd weather_app

npm install
npm run dev
```

The dev server (Turbopack) starts at <http://localhost:3000>. Open it and you'll see the Today page with the default city until you search for or geolocate your own.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

No environment variables, API keys, or external services need to be configured. Open-Meteo's APIs are key-less and open.

## 4. Limitations

- **Forecast horizon** — daily forecasts are capped at 16 days by Open-Meteo. There is no true "monthly" outlook; the Grid tab is just an alternative layout for the same data.
- **No backend / no account** — preferences and saved cities live in `localStorage` only. Clearing site data, switching browsers, or using private/incognito windows resets the app.
- **Notifications are toggles only** — the Notifications section persists user intent, but Aero ships without a service worker, so no push notifications are actually delivered.
- **Geolocation accuracy** — "Use my location" uses the browser's coarse geolocation with an 8-second timeout. Indoor or VPN-affected positions can resolve to a nearby city rather than your exact spot.
- **Network-dependent** — every page fetches from Open-Meteo on load and on city change. Offline use is not supported; there is no cache layer beyond the browser's HTTP cache.
- **Rate limits** — Open-Meteo's free tier is generous but not infinite. Rapidly switching cities or hammering search may temporarily return HTTP 429.
- **Air-quality coverage** — air-quality data depends on the Open-Meteo air-quality endpoint, which has uneven coverage outside major regions. Cards display `—` when the upstream returns no value.
- **Time zones** — display uses the selected city's IANA timezone returned by the geocoder. Cities without a confident timezone fall back to UTC.
- **Accessibility** — keyboard navigation works for primary controls (search input, tabs, toggles), but a full screen-reader pass has not been done. Reduced-motion preferences are not yet wired into the gradient animations.
- **Browser support** — `backdrop-filter` (used for glassmorphism) requires a recent Chromium, Safari 15+, or Firefox 103+. Older browsers will render the cards as opaque surfaces.
