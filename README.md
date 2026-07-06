<p align="center">
  <img src="app/icon.svg" alt="AeroWeather logo" width="96" height="96" />
</p>

# AeroWeather

A modern weather web app built with Next.js 16 (App Router, Turbopack) and React 19. AeroWeather shows current conditions and a two-week outlook for any city in the world, presented as a single scrolling page with a dark glassmorphic interface and weather-driven gradient palettes.

## 1. App Overview

AeroWeather is a single-page weather dashboard that runs entirely in the browser. There is no account, no backend, no analytics. All preferences (saved cities, units, time format) live in `localStorage` on the device. Weather, air quality, and geocoding data are fetched on demand from Open-Meteo's three public, key-less endpoints (Forecast, Geocoding, Air Quality).

The interface is one continuously scrolling page composed of four anchor-linked sections. A sticky top navbar links to each section and highlights the one currently in view (scroll-spy); on small screens the links collapse into a slide-up drawer menu:

- **Today** — current conditions plus detail cards (UV index, sunrise, sunset, humidity/dew point) for the active city.
- **2-Week** — a "Next 24 hours" hourly rail, a 14-day forecast grid, and summary cards.
- **Locations** — a carousel of saved cities, each card tinted by its live weather.
- **Settings** — units, time format, and notification toggles.

AeroWeather is designed to be free for everyone — no sign-up, no rate limits surfaced to the user, no premium tier.

## 2. Features

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
- A carousel of saved cities. Each card is tinted by its live weather (sunny, rainy, stormy, snowy, night, …) and shows local time, current temp, condition, and high/low.
- Tap a card to make it the active location across the app and jump back to Today.
- The active city is highlighted with a ring and an **Active** badge.
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

## 3. Localhost Installation

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

## 4. Limitations

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
