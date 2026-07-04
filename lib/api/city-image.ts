import type { Place } from "./types";

const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const STORAGE_KEY = "aero.cityimg.v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Curated photos shipped in /public/cities — served without any network call.
 *  Keys are `normalize(place.name)`; extend the map as more seeds are exported. */
const SEED_IMAGES: Record<string, string> = {
  bamban: "/cities/bamban.webp",
  manila: "/cities/manila.webp",
  baguio: "/cities/baguio.webp",
  mabalacat: "/cities/mabalacat.webp",
};

type CacheEntry = { url: string | null; ts: number };
type CacheShape = Record<string, CacheEntry>;

type SummaryResponse = {
  type?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

const memoryCache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

/** Resolve a representative photo URL for a place, or null (caller renders a
 *  gradient fallback). Never throws — network errors, 404s and disambiguation
 *  pages all resolve to null, and misses are cached too. */
export async function getCityImage(place: Place): Promise<string | null> {
  const seed = SEED_IMAGES[normalize(place.name)];
  if (seed) return seed;

  const key = placeKey(place);

  if (memoryCache.has(key)) return memoryCache.get(key) ?? null;

  const stored = readStored(key);
  if (stored) {
    memoryCache.set(key, stored.url);
    return stored.url;
  }

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = resolveImage(place)
    .then((url) => {
      memoryCache.set(key, url);
      writeStored(key, url);
      return url;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, promise);
  return promise;
}

async function resolveImage(place: Place): Promise<string | null> {
  const titles = [place.name];
  if (place.admin1) titles.push(`${place.name}, ${place.admin1}`);
  titles.push(`${place.name}, ${place.country}`);

  for (const title of titles) {
    const url = await fetchSummaryImage(title);
    if (url) return url;
  }
  return null;
}

async function fetchSummaryImage(title: string): Promise<string | null> {
  try {
    // Wikipedia REST allows anonymous CORS; no custom headers keeps the
    // request "simple" so the browser skips the preflight round trip.
    const res = await fetch(`${SUMMARY_URL}/${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as SummaryResponse;
    if (data.type === "disambiguation") return null;
    return data.thumbnail?.source ?? data.originalimage?.source ?? null;
  } catch {
    return null;
  }
}

/** Lowercase, strip diacritics and whitespace: "São Paulo" → "saopaulo". */
function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function placeKey(place: Place): string {
  if (Number.isFinite(place.id)) return String(place.id);
  return `${normalize(place.name)}:${normalize(place.country)}`;
}

function readStored(key: string): CacheEntry | null {
  const cache = readCache();
  const entry = cache[key];
  if (!entry || typeof entry.ts !== "number") return null;
  if (Date.now() - entry.ts > TTL_MS) return null;
  return entry;
}

function writeStored(key: string, url: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    cache[key] = { url, ts: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable — the in-memory cache still applies.
  }
}

function readCache(): CacheShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as CacheShape;
  } catch {
    return {};
  }
}
