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
