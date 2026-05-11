import type { Place, UnitPrefs } from "./api/types";

export type ThemeMode = "light" | "dark" | "system";
export type PaletteKey = "sunny" | "sunset" | "rainy" | "stormy" | "cloudy" | "snowy" | "night";
export type PaletteMode = "auto" | "manual";
export type TimeFormat = "12h" | "24h";
export type FirstDayOfWeek = "sun" | "mon";

export type NotificationPrefs = {
  push: boolean;
  severeWeather: boolean;
  dailyBriefing: boolean;
  rainStartingSoon: boolean;
};

export type Prefs = {
  units: UnitPrefs;
  timeFormat: TimeFormat;
  firstDayOfWeek: FirstDayOfWeek;
  palette: PaletteKey;
  paletteMode: PaletteMode;
  notifications: NotificationPrefs;
  locations: Place[];
  activeLocationId: number | null;
};

export const DEFAULT_PREFS: Prefs = {
  units: { temperature: "fahrenheit", wind: "kmh", precipitation: "mm" },
  timeFormat: "12h",
  firstDayOfWeek: "mon",
  palette: "sunny",
  paletteMode: "auto",
  notifications: {
    push: true,
    severeWeather: true,
    dailyBriefing: false,
    rainStartingSoon: true,
  },
  locations: [],
  activeLocationId: null,
};

const STORAGE_KEY = "aero.prefs.v1";
const listeners = new Set<(p: Prefs) => void>();

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      units: { ...DEFAULT_PREFS.units, ...(parsed.units ?? {}) },
      notifications: { ...DEFAULT_PREFS.notifications, ...(parsed.notifications ?? {}) },
      locations: dedupeLocations(parsed.locations ?? []),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Prefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  for (const fn of listeners) fn(p);
}

export function subscribePrefs(fn: (p: Prefs) => void): () => void {
  listeners.add(fn);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) fn(loadPrefs());
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", storageHandler);
  }
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", storageHandler);
    }
  };
}

export function activeLocation(p: Prefs): Place | null {
  if (p.activeLocationId == null) return p.locations[0] ?? null;
  return p.locations.find((l) => l.id === p.activeLocationId) ?? p.locations[0] ?? null;
}

// ~2 km tolerance. Tight enough to keep neighboring towns separate, loose enough that the
// same city resolved by two geocoders (different centroids) still merges.
const SAME_PLACE_DEG = 0.02;

export function findSamePlace(list: Place[], target: Place): Place | undefined {
  return list.find(
    (l) =>
      l.id === target.id ||
      (Math.abs(l.latitude - target.latitude) < SAME_PLACE_DEG &&
        Math.abs(l.longitude - target.longitude) < SAME_PLACE_DEG),
  );
}

/** Append `place` to `list`, or return `list` unchanged if a near-duplicate is already saved.
 *  Returns the (possibly unchanged) list AND the canonical id to set as active. */
export function addPlace(list: Place[], place: Place): { list: Place[]; id: number } {
  const existing = findSamePlace(list, place);
  if (existing) return { list, id: existing.id };
  return { list: [...list, place], id: place.id };
}

function dedupeLocations(list: Place[]): Place[] {
  const out: Place[] = [];
  for (const p of list) {
    if (!findSamePlace(out, p)) out.push(p);
  }
  return out;
}
