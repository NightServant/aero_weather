# Locations Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AeroWeather Locations section with a summary-cards row, an info-icon-driven Location Details dialog (description + Wikimedia gallery + Leaflet map + metadata), and a second "Suggested locations" carousel with save-to-saved flow — all reusing the existing design system.

**Architecture:** `LocationsSection` composes `SummaryCardsSection` → saved carousel → `SuggestedLocationsCarousel`, with one `LocationDetailsDialog` mounted at the section level and opened via section state. A shared `useLocationForecasts` hook fetches all saved forecasts once and feeds both the summary aggregates and the saved cards. Keyless data: Open-Meteo (weather + elevation), Wikipedia REST (description + gallery), curated static suggestions.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind v4 (design tokens in `app/globals.css`), radix `Dialog`, embla carousel, Leaflet (new dep), lucide-react, sonner, vitest (jsdom) for `lib/**` logic.

**Design spec:** `docs/superpowers/specs/2026-07-08-locations-section-redesign-design.md`

**Testing note:** `vitest.config.ts` only includes `lib/**/*.test.ts` and `test/**/*.test.ts`. React components are **not** unit-tested in this repo; pure logic lives in `lib/` and is TDD'd. Component tasks are verified with `npx tsc --noEmit`, `npm run lint`, and browser preview.

---

## File structure

**New — logic (`lib/`, TDD):**
- `lib/api/city-details.ts` — keyless Wikipedia description + Wikimedia gallery, cached.
- `lib/api/city-details.test.ts`
- `lib/suggested-locations.ts` — curated list + `getSuggestedLocations(saved)`.
- `lib/suggested-locations.test.ts`
- `lib/locations-summary.ts` — pure summary aggregates.
- `lib/locations-summary.test.ts`

**New — components (`components/locations/`):**
- `use-location-forecasts.ts` — shared multi-forecast hook.
- `location-summary-card.tsx`
- `summary-cards-section.tsx`
- `saved-location-card.tsx`
- `suggested-location-card.tsx`
- `suggested-locations-carousel.tsx`
- `location-gallery.tsx`
- `location-map.tsx`
- `location-details-dialog.tsx`

**Modified:**
- `lib/api/types.ts` — optional `elevation` on `Forecast`.
- `lib/api/forecast.ts` — parse `elevation`.
- `components/locations/locations-carousel.tsx` — render `SavedLocationCard`, add `onOpenDetails`, drop `activeId` pin.
- `components/sections/locations-section.tsx` — compose new blocks + dialog state.
- `package.json` — add `leaflet`, `@types/leaflet`.

**Retired (only if unreferenced after Task 7):** `city-card.tsx`, `city-card-loader.tsx`.

---

## Task 1: Add Leaflet dep + `elevation` on the forecast

**Files:**
- Modify: `package.json` (via npm)
- Modify: `lib/api/types.ts`
- Modify: `lib/api/forecast.ts`

- [ ] **Step 1: Install Leaflet**

Run:
```bash
npm install leaflet@^1.9.4 && npm install -D @types/leaflet@^1.9.12
```
Expected: both packages added, no peer-dep errors.

- [ ] **Step 2: Add `elevation` to the `Forecast` type**

In `lib/api/types.ts`, extend the `Forecast` type (currently ends after `daily`):

```ts
export type Forecast = {
  place: Pick<Place, "latitude" | "longitude" | "timezone">;
  /** Metres above sea level, from Open-Meteo. Undefined if the API omits it. */
  elevation?: number;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};
```

- [ ] **Step 3: Parse `elevation` in the forecast fetch**

In `lib/api/forecast.ts`, add `elevation` to `RawForecast`:

```ts
type RawForecast = {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  current: Record<string, number | string | null>;
  hourly: Record<string, (number | string | null)[]>;
  daily: Record<string, (number | string | null)[]>;
};
```

Then in the returned object, add `elevation` right after `place`:

```ts
  return {
    place: { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone },
    elevation: raw.elevation,
    current: {
```

- [ ] **Step 4: Verify existing tests + types still pass**

Run:
```bash
npm run test && npx tsc --noEmit
```
Expected: all existing tests PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/api/types.ts lib/api/forecast.ts
git commit -m "Add leaflet dep and forecast elevation field"
```

---

## Task 2: `city-details.ts` — keyless description + gallery

Mirrors the pattern in `lib/api/city-image.ts` (never throws, localStorage cache w/ TTL, in-flight de-dupe). Description = Wikipedia REST summary `extract`. Gallery = Wikipedia REST `media-list` image `srcset` sources (served from `upload.wikimedia.org`, already whitelisted in `next.config.ts`).

**Files:**
- Create: `lib/api/city-details.ts`
- Test: `lib/api/city-details.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/api/city-details.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCityDescription, getCityGallery } from "./city-details";
import type { Place } from "./types";

const place = (over: Partial<Place>): Place => ({
  id: 1,
  name: "Testville",
  country: "Testland",
  countryCode: "TL",
  latitude: 0,
  longitude: 0,
  timezone: "UTC",
  ...over,
});

function stubFetch(handler: (url: string) => { ok: boolean; body?: unknown }) {
  const fn = vi.fn(async (url: string) => {
    const { ok, body } = handler(url);
    return { ok, status: ok ? 200 : 404, json: async () => body, text: async () => "" };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("getCityDescription", () => {
  it("returns the summary extract and caches it (one fetch for repeats)", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: { extract: "A test city." } }));
    const p = place({ id: 201, name: "Zzytown" });
    expect(await getCityDescription(p)).toBe("A test city.");
    expect(await getCityDescription(p)).toBe("A test city."); // cached
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("treats disambiguation pages as no description", async () => {
    stubFetch(() => ({ ok: true, body: { type: "disambiguation", extract: "x" } }));
    expect(await getCityDescription(place({ id: 202, name: "Springfield" }))).toBeNull();
  });

  it("resolves to null on failure", async () => {
    stubFetch(() => ({ ok: false }));
    expect(await getCityDescription(place({ id: 203, name: "Nowhere" }))).toBeNull();
  });
});

describe("getCityGallery", () => {
  it("returns https-normalized image sources, skips non-images, caps the count", async () => {
    const items = [
      { type: "image", srcset: [{ src: "//upload.wikimedia.org/a.jpg", scale: "1x" }] },
      { type: "video", srcset: [{ src: "//upload.wikimedia.org/clip.webm", scale: "1x" }] },
      { type: "image", srcset: [{ src: "//upload.wikimedia.org/b.jpg", scale: "1x" }] },
    ];
    stubFetch(() => ({ ok: true, body: { items } }));
    const urls = await getCityGallery(place({ id: 204, name: "Galleryville" }));
    expect(urls).toEqual(["https://upload.wikimedia.org/a.jpg", "https://upload.wikimedia.org/b.jpg"]);
  });

  it("resolves to an empty array on failure", async () => {
    stubFetch(() => ({ ok: false }));
    expect(await getCityGallery(place({ id: 205, name: "Nowhere" }))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- city-details`
Expected: FAIL — cannot resolve `./city-details`.

- [ ] **Step 3: Implement `city-details.ts`**

Create `lib/api/city-details.ts`:

```ts
import type { Place } from "./types";

const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const MEDIA_URL = "https://en.wikipedia.org/api/rest_v1/page/media-list";
const DESC_KEY = "aero.citydesc.v1";
const GALLERY_KEY = "aero.citygallery.v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_GALLERY = 6;

type CacheEntry<T> = { value: T; ts: number };
type CacheShape<T> = Record<string, CacheEntry<T>>;

type SummaryResponse = { type?: string; extract?: string };
type MediaItem = { type?: string; srcset?: { src?: string }[] };
type MediaResponse = { items?: MediaItem[] };

const descMemory = new Map<string, string | null>();
const galleryMemory = new Map<string, string[]>();
const descInFlight = new Map<string, Promise<string | null>>();
const galleryInFlight = new Map<string, Promise<string[]>>();

/** Wikipedia summary extract for a place, or null. Never throws. */
export async function getCityDescription(place: Place): Promise<string | null> {
  const key = placeKey(place);
  if (descMemory.has(key)) return descMemory.get(key) ?? null;
  const stored = readStored<string | null>(DESC_KEY, key);
  if (stored !== undefined) {
    descMemory.set(key, stored);
    return stored;
  }
  const pending = descInFlight.get(key);
  if (pending) return pending;

  const promise = fetchDescription(place)
    .then((value) => {
      descMemory.set(key, value);
      writeStored(DESC_KEY, key, value);
      return value;
    })
    .finally(() => descInFlight.delete(key));
  descInFlight.set(key, promise);
  return promise;
}

/** Up to MAX_GALLERY Wikimedia image URLs for a place, or []. Never throws. */
export async function getCityGallery(place: Place): Promise<string[]> {
  const key = placeKey(place);
  if (galleryMemory.has(key)) return galleryMemory.get(key) ?? [];
  const stored = readStored<string[]>(GALLERY_KEY, key);
  if (stored !== undefined) {
    galleryMemory.set(key, stored);
    return stored;
  }
  const pending = galleryInFlight.get(key);
  if (pending) return pending;

  const promise = fetchGallery(place)
    .then((value) => {
      galleryMemory.set(key, value);
      writeStored(GALLERY_KEY, key, value);
      return value;
    })
    .finally(() => galleryInFlight.delete(key));
  galleryInFlight.set(key, promise);
  return promise;
}

async function fetchDescription(place: Place): Promise<string | null> {
  try {
    const res = await fetch(`${SUMMARY_URL}/${encodeURIComponent(place.name)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as SummaryResponse;
    if (data.type === "disambiguation") return null;
    return data.extract?.trim() || null;
  } catch {
    return null;
  }
}

async function fetchGallery(place: Place): Promise<string[]> {
  try {
    const res = await fetch(`${MEDIA_URL}/${encodeURIComponent(place.name)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as MediaResponse;
    const urls: string[] = [];
    for (const item of data.items ?? []) {
      if (item.type !== "image") continue;
      const src = item.srcset?.[0]?.src;
      if (!src) continue;
      urls.push(src.startsWith("//") ? `https:${src}` : src);
      if (urls.length >= MAX_GALLERY) break;
    }
    return urls;
  } catch {
    return [];
  }
}

function placeKey(place: Place): string {
  if (Number.isFinite(place.id)) return String(place.id);
  return `${normalize(place.name)}:${normalize(place.country)}`;
}

function normalize(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").toLowerCase();
}

/** Returns the stored value, or `undefined` when absent/expired (distinct from a cached `null`). */
function readStored<T>(storageKey: string, key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;
    const cache = JSON.parse(raw) as CacheShape<T>;
    const entry = cache[key];
    if (!entry || typeof entry.ts !== "number") return undefined;
    if (Date.now() - entry.ts > TTL_MS) return undefined;
    return entry.value;
  } catch {
    return undefined;
  }
}

function writeStored<T>(storageKey: string, key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const cache: CacheShape<T> = raw ? (JSON.parse(raw) as CacheShape<T>) : {};
    cache[key] = { value, ts: Date.now() };
    window.localStorage.setItem(storageKey, JSON.stringify(cache));
  } catch {
    // storage full/unavailable — memory cache still applies
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- city-details`
Expected: all `city-details` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/api/city-details.ts lib/api/city-details.test.ts
git commit -m "Add keyless city description + gallery fetchers"
```

---

## Task 3: `suggested-locations.ts` — curated list + filter

**Files:**
- Create: `lib/suggested-locations.ts`
- Test: `lib/suggested-locations.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/suggested-locations.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SUGGESTED_LOCATIONS, getSuggestedLocations } from "./suggested-locations";
import type { Place } from "./api/types";

describe("getSuggestedLocations", () => {
  it("returns the full curated list when nothing is saved", () => {
    expect(getSuggestedLocations([]).length).toBe(SUGGESTED_LOCATIONS.length);
  });

  it("excludes places already saved (matched by proximity via findSamePlace)", () => {
    const first = SUGGESTED_LOCATIONS[0];
    const saved: Place[] = [{ ...first }];
    const result = getSuggestedLocations(saved);
    expect(result.some((p) => p.name === first.name)).toBe(false);
    expect(result.length).toBe(SUGGESTED_LOCATIONS.length - 1);
  });

  it("every curated entry has the fields a card needs", () => {
    for (const p of SUGGESTED_LOCATIONS) {
      expect(typeof p.id).toBe("number");
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.country.length).toBeGreaterThan(0);
      expect(Number.isFinite(p.latitude)).toBe(true);
      expect(Number.isFinite(p.longitude)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- suggested-locations`
Expected: FAIL — cannot resolve `./suggested-locations`.

- [ ] **Step 3: Implement `suggested-locations.ts`**

Create `lib/suggested-locations.ts`. Real Open-Meteo geocoding ids/coords; the four with seed photos in `/public/cities` are included first.

```ts
import type { Place } from "./api/types";
import { findSamePlace } from "./prefs";

/** Curated popular cities for the Suggested carousel. Real coordinates; the first
 *  four have bundled photos in /public/cities. Extend freely. */
export const SUGGESTED_LOCATIONS: Place[] = [
  { id: 1683286, name: "Manila", admin1: "Metro Manila", country: "Philippines", countryCode: "PH", latitude: 14.6042, longitude: 120.9822, timezone: "Asia/Manila" },
  { id: 1728111, name: "Baguio", admin1: "Cordillera", country: "Philippines", countryCode: "PH", latitude: 16.4164, longitude: 120.5931, timezone: "Asia/Manila" },
  { id: 1730751, name: "Bamban", admin1: "Central Luzon", country: "Philippines", countryCode: "PH", latitude: 15.2333, longitude: 120.5667, timezone: "Asia/Manila" },
  { id: 1699120, name: "Mabalacat", admin1: "Central Luzon", country: "Philippines", countryCode: "PH", latitude: 15.2216, longitude: 120.5736, timezone: "Asia/Manila" },
  { id: 5128581, name: "New York", admin1: "New York", country: "United States", countryCode: "US", latitude: 40.7143, longitude: -74.006, timezone: "America/New_York" },
  { id: 2643743, name: "London", admin1: "England", country: "United Kingdom", countryCode: "GB", latitude: 51.5085, longitude: -0.1257, timezone: "Europe/London" },
  { id: 1850147, name: "Tokyo", admin1: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.6895, longitude: 139.6917, timezone: "Asia/Tokyo" },
  { id: 2988507, name: "Paris", admin1: "Île-de-France", country: "France", countryCode: "FR", latitude: 48.8534, longitude: 2.3488, timezone: "Europe/Paris" },
  { id: 2147714, name: "Sydney", admin1: "New South Wales", country: "Australia", countryCode: "AU", latitude: -33.8679, longitude: 151.2073, timezone: "Australia/Sydney" },
  { id: 1880252, name: "Singapore", admin1: "", country: "Singapore", countryCode: "SG", latitude: 1.2897, longitude: 103.8501, timezone: "Asia/Singapore" },
  { id: 292223, name: "Dubai", admin1: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.0657, longitude: 55.1713, timezone: "Asia/Dubai" },
  { id: 3169070, name: "Rome", admin1: "Lazio", country: "Italy", countryCode: "IT", latitude: 41.8919, longitude: 12.5113, timezone: "Europe/Rome" },
];

/** The curated list minus anything already saved (proximity-matched). */
export function getSuggestedLocations(saved: Place[]): Place[] {
  return SUGGESTED_LOCATIONS.filter((s) => !findSamePlace(saved, s));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- suggested-locations`
Expected: all `suggested-locations` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/suggested-locations.ts lib/suggested-locations.test.ts
git commit -m "Add curated suggested locations list + filter"
```

---

## Task 4: `locations-summary.ts` — pure summary aggregates

**Files:**
- Create: `lib/locations-summary.ts`
- Test: `lib/locations-summary.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/locations-summary.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { summarizeLocations } from "./locations-summary";
import type { Forecast } from "./api/types";

function fc(temp: number, weatherCode: number): Forecast {
  return {
    place: { latitude: 0, longitude: 0, timezone: "UTC" },
    current: {
      time: "", temperature: temp, apparentTemperature: temp, humidity: 0,
      precipitation: 0, windSpeed: 0, windDirection: 0, weatherCode,
      isDay: true, pressure: 0, cloudCover: 0, visibility: 0, uvIndex: 0,
    },
    hourly: [],
    daily: [],
  };
}

describe("summarizeLocations", () => {
  it("counts saved places and averages available current temps", () => {
    const byId = { 1: fc(10, 0), 2: fc(20, 0), 3: undefined }; // 3 still loading
    const r = summarizeLocations([1, 2, 3], byId, 1, "celsius");
    expect(r.savedCount).toBe(3);
    expect(r.avgTemp).toBe(15); // (10 + 20) / 2, loaders ignored
  });

  it("counts locations whose current condition is rainy", () => {
    const byId = { 1: fc(10, 61), 2: fc(20, 3), 3: fc(15, 95) }; // rain, cloudy, thunderstorm
    const r = summarizeLocations([1, 2, 3], byId, 1, "celsius");
    expect(r.rainCount).toBe(2);
  });

  it("returns null avgTemp when no forecasts have loaded", () => {
    const r = summarizeLocations([1], { 1: undefined }, 1, "celsius");
    expect(r.avgTemp).toBeNull();
    expect(r.rainCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- locations-summary`
Expected: FAIL — cannot resolve `./locations-summary`.

- [ ] **Step 3: Implement `locations-summary.ts`**

Create `lib/locations-summary.ts`:

```ts
import type { Forecast, TempUnit } from "./api/types";
import { weatherCodeToKind, type WeatherKind } from "./api/weather-code";

export type ForecastMap = Record<number, Forecast | null | undefined>;

export type LocationsSummary = {
  savedCount: number;
  /** Rounded mean of available current temps, or null when none have loaded. */
  avgTemp: number | null;
  tempUnit: TempUnit;
  rainCount: number;
};

const RAIN_KINDS: ReadonlySet<WeatherKind> = new Set([
  "drizzle", "rain", "freezing-rain", "rain-showers", "thunderstorm", "thunderstorm-hail",
]);

/** Aggregate metrics for the summary cards. Loading (`undefined`) and failed
 *  (`null`) forecasts are excluded from temp/rain math. `activeId` is accepted
 *  for symmetry with the caller (active-name is resolved from prefs there). */
export function summarizeLocations(
  ids: number[],
  byId: ForecastMap,
  _activeId: number | null,
  tempUnit: TempUnit,
): LocationsSummary {
  const loaded: Forecast[] = [];
  for (const id of ids) {
    const f = byId[id];
    if (f) loaded.push(f);
  }
  const avgTemp = loaded.length
    ? Math.round(loaded.reduce((sum, f) => sum + f.current.temperature, 0) / loaded.length)
    : null;
  const rainCount = loaded.filter((f) => RAIN_KINDS.has(weatherCodeToKind(f.current.weatherCode))).length;
  return { savedCount: ids.length, avgTemp, tempUnit, rainCount };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- locations-summary`
Expected: all `locations-summary` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/locations-summary.ts lib/locations-summary.test.ts
git commit -m "Add pure locations summary aggregates"
```

---

## Task 5: `use-location-forecasts.ts` — shared multi-forecast hook

**Files:**
- Create: `components/locations/use-location-forecasts.ts`

- [ ] **Step 1: Implement the hook**

Create `components/locations/use-location-forecasts.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { getForecast } from "@/lib/api/forecast";
import type { Place, UnitPrefs } from "@/lib/api/types";
import type { ForecastMap } from "@/lib/locations-summary";

/**
 * Fetches every place's forecast once, in parallel, into a shared map keyed by
 * place id. Both the summary cards and the saved cards read from this, so each
 * city is fetched a single time. Entries are `undefined` while loading and
 * `null` on failure — same convention as `useCityForecast`.
 */
export function useLocationForecasts(places: Place[], units: UnitPrefs): ForecastMap {
  const [byId, setById] = useState<ForecastMap>({});

  // Re-fetch when the set of ids or any unit changes.
  const idsKey = places.map((p) => p.id).join(",");
  const unitsKey = `${units.temperature}|${units.wind}|${units.precipitation}`;

  useEffect(() => {
    const controller = new AbortController();
    // Seed loading state for the current ids; drop stale ids.
    setById(() => Object.fromEntries(places.map((p) => [p.id, undefined])) as ForecastMap);

    for (const place of places) {
      getForecast(place.latitude, place.longitude, units, controller.signal)
        .then((f) => setById((prev) => ({ ...prev, [place.id]: f })))
        .catch(() => {
          if (!controller.signal.aborted) {
            setById((prev) => ({ ...prev, [place.id]: null }));
          }
        });
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, unitsKey]);

  return byId;
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/locations/use-location-forecasts.ts
git commit -m "Add shared useLocationForecasts hook"
```

---

## Task 6: Summary cards UI

**Files:**
- Create: `components/locations/location-summary-card.tsx`
- Create: `components/locations/summary-cards-section.tsx`

- [ ] **Step 1: Implement `LocationSummaryCard`**

Reuses the exact card contract from `components/forecast/summary-cards.tsx`. Create `components/locations/location-summary-card.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

/** One summary metric. Left accent border on desktop, bottom accent on mobile —
 *  identical to the Forecast/Settings summary cards. */
export function LocationSummaryCard({
  label,
  icon,
  value,
  unit,
  accent,
  children,
}: {
  label: string;
  icon: ReactNode;
  value: string | number;
  unit?: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col p-5 border-b border-white/12 md:border-b-0 md:border-l" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="card-subtitle-caps">{label}</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl truncate">{value}</span>
        {unit ? (
          <span
            className={
              accent
                ? "text-xs font-semibold text-[color:var(--palette-accent,var(--accent))]"
                : "caption"
            }
          >
            {unit}
          </span>
        ) : null}
      </div>
      <p className="caption mt-3">{children}</p>
    </div>
  );
}
```

- [ ] **Step 2: Implement `SummaryCardsSection`**

Create `components/locations/summary-cards-section.tsx`:

```tsx
"use client";

import { MapPin, Star, Thermometer, CloudRain } from "lucide-react";
import { LocationSummaryCard } from "./location-summary-card";
import { summarizeLocations } from "@/lib/locations-summary";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import type { ForecastMap } from "@/lib/locations-summary";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  forecasts: ForecastMap;
  activeId: number | null;
  units: UnitPrefs;
};

export function SummaryCardsSection({ places, forecasts, activeId, units }: Props) {
  const ids = places.map((p) => p.id);
  const summary = summarizeLocations(ids, forecasts, activeId, units.temperature);
  const active = places.find((p) => p.id === activeId) ?? places[0];
  const iconCls = "size-4";

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <LocationSummaryCard
        label="Saved"
        icon={<MapPin className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.savedCount}
        unit={summary.savedCount === 1 ? "place" : "places"}
      >
        Weather across every place you follow.
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Active"
        icon={<Star className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={active?.name ?? "—"}
      >
        {active
          ? [active.admin1, active.country].filter(Boolean).join(", ") || active.countryCode
          : "Pick a place to view its forecast."}
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Average temp"
        icon={<Thermometer className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.avgTemp == null ? "—" : formatTemp(summary.avgTemp, units.temperature, false)}
        unit={summary.avgTemp == null ? undefined : `°${tempUnitLabel(units.temperature)}`}
      >
        Mean of current temperatures across saved places.
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Rain now"
        icon={<CloudRain className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.rainCount}
        unit={summary.rainCount === 1 ? "place" : "places"}
        accent={summary.rainCount > 0}
      >
        {summary.rainCount > 0
          ? "Currently seeing rain or showers."
          : "No rain reported right now."}
      </LocationSummaryCard>
    </div>
  );
}
```

- [ ] **Step 3: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/locations/location-summary-card.tsx components/locations/summary-cards-section.tsx
git commit -m "Add locations summary cards"
```

---

## Task 7: `SavedLocationCard` + carousel wiring

Replaces `CityCard`/`CityCardLoader`: no pin/active, adds a top-right Info button; the card no longer fetches its own forecast (the carousel passes it in from the shared hook).

**Files:**
- Create: `components/locations/saved-location-card.tsx`
- Modify: `components/locations/locations-carousel.tsx`

- [ ] **Step 1: Implement `SavedLocationCard`**

Create `components/locations/saved-location-card.tsx`:

```tsx
"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { CityPhoto } from "./city-photo";
import { CityCardSkeleton } from "./city-card-skeleton";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { Forecast, Place, TempUnit } from "@/lib/api/types";

type Props = {
  place: Place;
  /** undefined = loading (skeleton), null = failed, else the forecast. */
  forecast: Forecast | null | undefined;
  unit: TempUnit;
  onOpenDetails: (place: Place) => void;
};

function SavedLocationCardBase({ place, forecast, unit, onOpenDetails }: Props) {
  if (forecast === undefined) {
    return (
      <div aria-busy="true">
        <CityCardSkeleton />
      </div>
    );
  }

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  return (
    <div className="tint-card card-interactive relative w-full p-4">
      <div className="relative overflow-hidden rounded-[12px]">
        <CityPhoto
          place={place}
          width={208}
          height={247}
          className="h-[247px] w-full rounded-[12px]"
          initialClassName="text-6xl"
        />
      </div>

      <button
        type="button"
        onClick={() => onOpenDetails(place)}
        aria-label={`Details for ${place.name}`}
        className="glass-pill absolute top-6 right-6 grid size-9 place-items-center text-foreground/80 transition-colors duration-150 hover:bg-white/[0.14] hover:text-foreground focus-visible:text-foreground"
      >
        <Info className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-[0.9375rem] leading-snug font-semibold text-text-strong">
          {place.name}
        </h3>
        <p className="caption truncate">{region || place.countryCode}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {kind ? (
          <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={20} />
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full bg-white/10" />
        )}
        <span className="stat-value whitespace-nowrap">
          {forecast ? `${formatTemp(forecast.current.temperature, unit)}${tempUnitLabel(unit)}` : "--"}
        </span>
        <span className="caption ml-auto truncate text-right">
          {kind ? WEATHER_LABEL[kind] : "Unavailable"}
        </span>
      </div>
    </div>
  );
}

export const SavedLocationCard = memo(SavedLocationCardBase);
```

- [ ] **Step 2: Rewire `locations-carousel.tsx`**

Replace the props and slide body. Update `components/locations/locations-carousel.tsx`:

- Change the `Props` type and imports at the top:

```tsx
import { SavedLocationCard } from "./saved-location-card";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  units: UnitPrefs;
  forecasts: Record<number, Forecast | null | undefined>;
  onOpenDetails: (place: Place) => void;
};
```

- Change the function signature:

```tsx
export function LocationsCarousel({ places, units, forecasts, onOpenDetails }: Props) {
```

- Replace the slide body (the `<CityCardLoader .../>` line) with:

```tsx
              <SavedLocationCard
                place={place}
                forecast={forecasts[place.id]}
                unit={units.temperature}
                onOpenDetails={onOpenDetails}
              />
```

- Remove the now-unused `CityCardLoader` import.

- [ ] **Step 3: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (`locations-section.tsx` still passes `activeId` — that's fixed in Task 12; if you run before Task 12 there will be a type error on the carousel props, which is expected. To keep this task green in isolation, proceed to Task 12 before final verification, or temporarily update the call site. The full wiring is Task 12.)

- [ ] **Step 4: Commit**

```bash
git add components/locations/saved-location-card.tsx components/locations/locations-carousel.tsx
git commit -m "Add SavedLocationCard and wire it into the carousel"
```

---

## Task 8: `LocationGallery`

**Files:**
- Create: `components/locations/location-gallery.tsx`

- [ ] **Step 1: Implement the gallery**

Create `components/locations/location-gallery.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCityGallery } from "@/lib/api/city-details";
import type { Place } from "@/lib/api/types";

/** Responsive Wikimedia image grid: skeletons → lazy fade-in tiles → click-to-enlarge. */
export function LocationGallery({ place }: { place: Place }) {
  const [urls, setUrls] = useState<string[] | undefined>(undefined);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrls(undefined);
    getCityGallery(place).then((r) => {
      if (!cancelled) setUrls(r);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (urls === undefined) {
    return (
      <div aria-busy="true" className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} aria-hidden="true" className="aspect-square animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }
  if (urls.length === 0) {
    return <p className="caption">No photos available for this place yet.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-2">
        {urls.map((url) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setActive(url)}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg"
              aria-label="Enlarge photo"
            >
              <Image
                src={url}
                alt=""
                fill
                loading="lazy"
                sizes="(max-width: 640px) 30vw, 160px"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105 data-[loaded=true]:opacity-100"
                onLoadingComplete={(img) => img.setAttribute("data-loaded", "true")}
              />
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If `onLoadingComplete` is flagged as deprecated by the installed next version, switch to `onLoad={(e) => (e.currentTarget as HTMLImageElement).setAttribute("data-loaded","true")}`.)

- [ ] **Step 3: Commit**

```bash
git add components/locations/location-gallery.tsx
git commit -m "Add lazy Wikimedia photo gallery with lightbox"
```

---

## Task 9: `LocationMap` (Leaflet, dynamic)

**Files:**
- Create: `components/locations/location-map.tsx`

- [ ] **Step 1: Implement the map**

Create `components/locations/location-map.tsx`. Uses Leaflet directly with a `divIcon` marker (avoids the broken default-icon asset problem), a standard/satellite tile toggle, and an "Open in Google Maps" link. This module is imported dynamically (`ssr:false`) by the dialog, so Leaflet never ships in the initial bundle.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Props = { lat: number; lon: number; name: string };

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export default function LocationMap({ lat, lon, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [satellite, setSatellite] = useState(false);
  // Hold Leaflet map + the two tile layers across renders.
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<{ street: import("leaflet").TileLayer; sat: import("leaflet").TileLayer } | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([lat, lon], 11);
      mapRef.current = map;

      const street = L.tileLayer(OSM_URL, { maxZoom: 19, attribution: "© OpenStreetMap" });
      const sat = L.tileLayer(SAT_URL, { maxZoom: 19, attribution: "© Esri" });
      layersRef.current = { street, sat };
      street.addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:var(--primary,#3b82f6);box-shadow:0 0 0 4px rgba(59,130,246,0.35);"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([lat, lon], { icon, title: name }).addTo(map);
      // Leaflet needs a size recalc once its container becomes visible in the dialog.
      setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, [lat, lon, name]);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;
    if (satellite) {
      map.removeLayer(layers.street);
      layers.sat.addTo(map);
    } else {
      map.removeLayer(layers.sat);
      layers.street.addTo(map);
    }
  }, [satellite]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-xl border border-white/12 sm:h-64"
        aria-label={`Map showing ${name}`}
        role="img"
      />
      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="glass-pill absolute top-3 right-3 z-[500] px-3 py-1 text-xs font-medium text-foreground/90 hover:bg-white/[0.14]"
      >
        {satellite ? "Standard" : "Satellite"}
      </button>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-pill absolute bottom-3 right-3 z-[500] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-white/[0.14]"
      >
        <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        Open in Google Maps
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/locations/location-map.tsx
git commit -m "Add Leaflet map with satellite toggle and Google Maps link"
```

---

## Task 10: `LocationDetailsDialog`

**Files:**
- Create: `components/locations/location-details-dialog.tsx`

- [ ] **Step 1: Implement the dialog**

Create `components/locations/location-details-dialog.tsx`. Two-column on desktop, single column + sticky footer on mobile. Leaflet map dynamic-imported so it loads only when the dialog is open.

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin, Mountain, Clock, Sunrise, Sunset, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CityPhoto } from "./city-photo";
import { LocationGallery } from "./location-gallery";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { getCityDescription } from "@/lib/api/city-details";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { formatTemp, tempUnitLabel, formatTime } from "@/lib/format";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div aria-busy="true" className="h-56 w-full animate-pulse rounded-xl bg-white/10 sm:h-64" />,
});

export type DetailsMode = "saved" | "suggested";

type Props = {
  place: Place | null;
  mode: DetailsMode;
  forecast: Forecast | null | undefined;
  units: UnitPrefs;
  format12h: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewForecast?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  onSave?: (place: Place) => void;
};

export function LocationDetailsDialog({
  place, mode, forecast, units, format12h, open, onOpenChange,
  onViewForecast, onRemove, onSave,
}: Props) {
  const [description, setDescription] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!open || !place) return;
    let cancelled = false;
    setDescription(undefined);
    getCityDescription(place).then((d) => {
      if (!cancelled) setDescription(d);
    });
    return () => {
      cancelled = true;
    };
  }, [open, place]);

  if (!place) return null;

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ") || place.countryCode;
  const today = forecast?.daily[0];
  const tz = place.timezone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Header */}
          <DialogHeader className="relative gap-0 p-0">
            <div className="relative h-40 w-full sm:h-48">
              <CityPhoto place={place} width={768} height={192} className="h-full w-full rounded-none" initialClassName="text-7xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-3 left-4 right-4">
                <DialogTitle className="text-xl font-semibold text-white">{place.name}</DialogTitle>
                <DialogDescription className="text-sm text-white/80">{region}</DialogDescription>
              </div>
              {kind ? (
                <span className="glass-pill absolute top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-foreground">
                  <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={16} />
                  {forecast ? `${formatTemp(forecast.current.temperature, units.temperature)}${tempUnitLabel(units.temperature)}` : "--"}
                  <span className="text-foreground/70">· {WEATHER_LABEL[kind]}</span>
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-5">
              <section>
                <h4 className="card-subtitle-caps mb-2">Overview</h4>
                {description === undefined ? (
                  <div aria-busy="true" className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {description ?? `${place.name} is one of your tracked locations. A description isn't available yet.`}
                  </p>
                )}
              </section>
              <section>
                <h4 className="card-subtitle-caps mb-2">Photos</h4>
                <LocationGallery place={place} />
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <section>
                <h4 className="card-subtitle-caps mb-2">Map</h4>
                <LocationMap lat={place.latitude} lon={place.longitude} name={place.name} />
              </section>
              <section>
                <h4 className="card-subtitle-caps mb-2">Details</h4>
                <dl className="grid grid-cols-2 gap-3">
                  <Meta icon={<MapPin className="size-3.5" strokeWidth={1.5} />} label="Coordinates" value={`${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`} />
                  <Meta icon={<Mountain className="size-3.5" strokeWidth={1.5} />} label="Elevation" value={forecast?.elevation != null ? `${Math.round(forecast.elevation)} m` : "—"} />
                  <Meta icon={<Clock className="size-3.5" strokeWidth={1.5} />} label="Time zone" value={tz} />
                  <Meta icon={<Sunrise className="size-3.5" strokeWidth={1.5} />} label="Sunrise" value={today ? formatTime(today.sunrise, format12h, tz) : "—"} />
                  <Meta icon={<Sunset className="size-3.5" strokeWidth={1.5} />} label="Sunset" value={today ? formatTime(today.sunset, format12h, tz) : "—"} />
                </dl>
              </section>
            </div>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-white/12 bg-[oklch(0.2_0.025_245_/_0.85)] p-4 backdrop-blur sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          {mode === "saved" ? (
            <>
              <Button variant="ghost" className="text-destructive" onClick={() => { onRemove?.(place); onOpenChange(false); }}>
                <Trash2 className="size-4" strokeWidth={1.5} /> Remove
              </Button>
              <Button onClick={() => { onViewForecast?.(place); onOpenChange(false); }}>
                <Eye className="size-4" strokeWidth={1.5} /> View forecast
              </Button>
            </>
          ) : (
            <Button onClick={() => { onSave?.(place); onOpenChange(false); }}>Save location</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="card-subtitle-caps">{label}</span>
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (The dialog's default close "X" button from `DialogContent` remains; that's fine and gives an extra affordance.)

- [ ] **Step 3: Commit**

```bash
git add components/locations/location-details-dialog.tsx
git commit -m "Add responsive LocationDetailsDialog"
```

---

## Task 11: Suggested card + carousel with save animation

**Files:**
- Create: `components/locations/suggested-location-card.tsx`
- Create: `components/locations/suggested-locations-carousel.tsx`

- [ ] **Step 1: Implement `SuggestedLocationCard`**

Fetches its own forecast (few cards, and the set changes on save). Create `components/locations/suggested-location-card.tsx`:

```tsx
"use client";

import { memo, useState } from "react";
import { Info, Plus, Check } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { CityPhoto } from "./city-photo";
import { CityCardSkeleton } from "./city-card-skeleton";
import { useCityForecast } from "./use-city-forecast";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  place: Place;
  units: UnitPrefs;
  onOpenDetails: (place: Place) => void;
  onSave: (place: Place) => void;
};

function SuggestedLocationCardBase({ place, units, onOpenDetails, onSave }: Props) {
  const forecast = useCityForecast(place, units);
  const [saving, setSaving] = useState(false);

  if (forecast === undefined) {
    return (
      <div aria-busy="true">
        <CityCardSkeleton />
      </div>
    );
  }

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  return (
    <div
      className="tint-card card-interactive relative w-full p-4 transition-[opacity,transform] duration-300"
      data-saving={saving ? "true" : undefined}
      style={saving ? { opacity: 0, transform: "scale(0.94)" } : undefined}
    >
      <div className="relative overflow-hidden rounded-[12px]">
        <CityPhoto place={place} width={208} height={247} className="h-[247px] w-full rounded-[12px]" initialClassName="text-6xl" />
      </div>

      <button
        type="button"
        onClick={() => onOpenDetails(place)}
        aria-label={`Details for ${place.name}`}
        className="glass-pill absolute top-6 right-6 grid size-9 place-items-center text-foreground/80 transition-colors duration-150 hover:bg-white/[0.14] hover:text-foreground"
      >
        <Info className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-[0.9375rem] leading-snug font-semibold text-text-strong">{place.name}</h3>
        <p className="caption truncate">{region || place.countryCode}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {kind ? (
          <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={20} />
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full bg-white/10" />
        )}
        <span className="stat-value whitespace-nowrap">
          {forecast ? `${formatTemp(forecast.current.temperature, units.temperature)}${tempUnitLabel(units.temperature)}` : "--"}
        </span>
        <span className="caption ml-auto truncate text-right">{kind ? WEATHER_LABEL[kind] : "Unavailable"}</span>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => {
          setSaving(true);
          // Let the exit animation play before the parent removes this card.
          window.setTimeout(() => onSave(place), 300);
        }}
        className="glass-pill mt-4 inline-flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/[0.14] disabled:opacity-60"
      >
        {saving ? <Check className="size-4" strokeWidth={1.5} /> : <Plus className="size-4" strokeWidth={1.5} />}
        {saving ? "Saved" : "Save location"}
      </button>
    </div>
  );
}

export const SuggestedLocationCard = memo(SuggestedLocationCardBase);
```

- [ ] **Step 2: Implement `SuggestedLocationsCarousel`**

Create `components/locations/suggested-locations-carousel.tsx` (mirrors `locations-carousel.tsx` embla setup + arrows):

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { SuggestedLocationCard } from "./suggested-location-card";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  units: UnitPrefs;
  onOpenDetails: (place: Place) => void;
  onSave: (place: Place) => void;
};

export function SuggestedLocationsCarousel({ places, units, onOpenDetails, onSave }: Props) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    breakpoints: { "(min-width: 768px)": { align: "start" } },
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (places.length === 0) return null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Suggested locations" className="flex items-center gap-4">
      <IconCircleButton
        icon={<ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Previous suggestions"
        size={48}
        disabled={!canPrev}
        onClick={() => api?.scrollPrev()}
        className="hidden md:grid"
      />

      <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
        <div className="-ml-4 flex md:-ml-6">
          {places.map((place, i) => (
            <div
              key={place.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${places.length}`}
              className="min-w-0 shrink-0 grow-0 basis-[78vw] pl-4 sm:basis-[280px] md:basis-[264px] md:pl-6 backdrop-blur"
            >
              <SuggestedLocationCard place={place} units={units} onOpenDetails={onOpenDetails} onSave={onSave} />
            </div>
          ))}
        </div>
      </div>

      <IconCircleButton
        icon={<ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Next suggestions"
        size={48}
        disabled={!canNext}
        onClick={() => api?.scrollNext()}
        className="hidden md:grid"
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify types + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/locations/suggested-location-card.tsx components/locations/suggested-locations-carousel.tsx
git commit -m "Add suggested locations carousel with save animation"
```

---

## Task 12: Compose `LocationsSection`

Wires the shared hook, summary cards, both carousels, and the single dialog with all callbacks.

**Files:**
- Modify: `components/sections/locations-section.tsx`

- [ ] **Step 1: Rewrite the section**

Replace `components/sections/locations-section.tsx` with:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SectionHeader } from "./section-header";
import { CityCardSkeleton } from "@/components/locations/city-card-skeleton";
import { AddCityDialog } from "@/components/locations/add-city-dialog";
import { SummaryCardsSection } from "@/components/locations/summary-cards-section";
import { SuggestedLocationsCarousel } from "@/components/locations/suggested-locations-carousel";
import { LocationDetailsDialog, type DetailsMode } from "@/components/locations/location-details-dialog";
import { useLocationForecasts } from "@/components/locations/use-location-forecasts";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { Plus } from "lucide-react";
import { usePrefs } from "@/hooks/use-prefs";
import { getSuggestedLocations } from "@/lib/suggested-locations";
import { addPlace } from "@/lib/prefs";
import type { Place } from "@/lib/api/types";

const LocationsCarousel = dynamic(
  () => import("@/components/locations/locations-carousel").then((m) => ({ default: m.LocationsCarousel })),
  {
    ssr: false,
    loading: () => (
      <div aria-busy="true" className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[264px] shrink-0">
            <CityCardSkeleton />
          </div>
        ))}
      </div>
    ),
  },
);

export function LocationsSection() {
  const [prefs, setPrefs, hydrated] = usePrefs();
  const [addOpen, setAddOpen] = useState(false);
  const [details, setDetails] = useState<{ place: Place; mode: DetailsMode } | null>(null);
  const router = useRouter();

  const forecasts = useLocationForecasts(prefs.locations, prefs.units);
  const suggested = useMemo(() => getSuggestedLocations(prefs.locations), [prefs.locations]);

  if (!hydrated) return null;
  if (prefs.locations.length === 0) return null; // empty state handled by <AppSections/>

  const activeId = prefs.activeLocationId ?? prefs.locations[0]?.id ?? null;

  const openSaved = (place: Place) => setDetails({ place, mode: "saved" });
  const openSuggested = (place: Place) => setDetails({ place, mode: "suggested" });

  const saveLocation = (place: Place) => {
    setPrefs((p) => {
      const { list } = addPlace(p.locations, place);
      return { ...p, locations: list };
    });
    toast.success(`${place.name} added to your locations`);
    setDetails((d) => (d?.place.id === place.id ? null : d));
  };

  const removeLocation = (place: Place) => {
    setPrefs((p) => {
      const locations = p.locations.filter((l) => l.id !== place.id);
      const activeLocationId = p.activeLocationId === place.id ? (locations[0]?.id ?? null) : p.activeLocationId;
      return { ...p, locations, activeLocationId };
    });
    toast.success(`${place.name} removed`);
  };

  const viewForecast = (place: Place) => {
    setPrefs({ activeLocationId: place.id });
    router.push("/#today");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SectionHeader
            id="locations-h"
            kicker={`My locations — ${prefs.locations.length} saved`}
            title="Places at a glance"
            subtitle="View weather across your saved places."
          />
        </div>
        <IconCircleButton label="Add a city" onClick={() => setAddOpen(true)} icon={<Plus className="size-4" strokeWidth={1.5} />} />
      </div>

      <SummaryCardsSection places={prefs.locations} forecasts={forecasts} activeId={activeId} units={prefs.units} />

      <LocationsCarousel places={prefs.locations} units={prefs.units} forecasts={forecasts} onOpenDetails={openSaved} />

      {suggested.length > 0 ? (
        <div className="space-y-4">
          <p className="card-subtitle-caps">Suggested places</p>
          <SuggestedLocationsCarousel places={suggested} units={prefs.units} onOpenDetails={openSuggested} onSave={saveLocation} />
        </div>
      ) : null}

      <AddCityDialog open={addOpen} onOpenChange={setAddOpen} />

      <LocationDetailsDialog
        place={details?.place ?? null}
        mode={details?.mode ?? "saved"}
        forecast={details ? forecasts[details.place.id] : undefined}
        units={prefs.units}
        format12h={prefs.timeFormat === "12h"}
        open={details !== null}
        onOpenChange={(o) => !o && setDetails(null)}
        onViewForecast={viewForecast}
        onRemove={removeLocation}
        onSave={saveLocation}
      />
    </div>
  );
}
```

Note: for a suggested place, `forecasts[details.place.id]` is `undefined` (it's not in the saved map). The dialog degrades gracefully — badge shows `--`, elevation/sunrise show `—`. Acceptable per spec (suggested = discovery). If richer suggested-detail weather is wanted later, pass a small fetch here.

- [ ] **Step 2: Retire dead files if unreferenced**

Run:
```bash
grep -rn "city-card-loader\|from \"./city-card\"\|from \"@/components/locations/city-card\"" components app | grep -v city-card-skeleton
```
If no results (outside `saved-location-card` / skeleton), delete:
```bash
git rm components/locations/city-card.tsx components/locations/city-card-loader.tsx
```
If there are references, leave them.

- [ ] **Step 3: Verify types + lint + tests**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run test
```
Expected: no errors; all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add components/sections/locations-section.tsx
git add -A components/locations
git commit -m "Compose redesigned LocationsSection with summary, carousels, and details dialog"
```

---

## Task 13: Browser verification

**Files:** none (verification only)

- [ ] **Step 1: Ensure a launch config exists**

If `.claude/launch.json` is absent, create it:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "weather-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```

- [ ] **Step 2: Start the dev server and open Locations**

Start `weather-dev` via the preview tooling, load the app, ensure at least one saved location exists (add one via the "+" if the store is empty), and scroll to the `#locations` section.

- [ ] **Step 3: Verify against the spec**

Check and capture:
- Summary cards: 4 across on desktop (left border), stacked on mobile (bottom border) via `preview_resize` mobile.
- Saved carousel: info button top-right opens the dialog; no "Active" pill; hover elevation + image zoom.
- Dialog: two-column desktop / single-column mobile with sticky footer; description loads (skeleton→text); gallery lazy-loads with lightbox; Leaflet map renders with marker, Satellite toggle works, "Open in Google Maps" link present; metadata populated; "View forecast" navigates to Today and sets active; "Remove" removes.
- Suggested carousel present below saved; "Save location" animates the card out, shows a toast, adds to saved, updates summary, and removes from suggested.
- Console/network: no errors (`preview_console_logs`, `preview_network`).

- [ ] **Step 4: Fix any issues found, then final commit**

Address issues by editing source and re-verifying from Step 3. When clean:

```bash
git add -A
git commit -m "Polish Locations redesign after browser verification"
```

---

## Self-review notes (author)

- **Spec coverage:** summary cards (Task 6) w/ responsive borders; info-icon cards (Task 7); details dialog w/ header/description/gallery/map/metadata/footer (Tasks 8–10); suggested carousel + save flow + animation (Tasks 11–12); active model via "View forecast" (Task 12); Leaflet + elevation (Task 1); keyless data (Tasks 2–3). Accessibility/perf are satisfied by radix dialog, embla a11y, memoization, dynamic imports, and lazy images as built.
- **Deferred by design:** true cross-carousel FLIP, real alerts source, carousel virtualization (all "Out of scope" in the spec).
- **Type consistency:** `ForecastMap` defined in `lib/locations-summary.ts` and reused by the hook, summary section, and carousel; `DetailsMode` exported from the dialog and imported by the section; `onOpenDetails(place)` signature consistent across saved/suggested cards + carousels.
