import { getJSON } from "./client";
import type { Place } from "./types";

const SEARCH_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

type RawPlace = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
};

type SearchResponse = { results?: RawPlace[] };

type ReverseResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
};

const toPlace = (r: RawPlace): Place => ({
  id: r.id,
  name: r.name,
  admin1: r.admin1,
  country: r.country,
  countryCode: r.country_code,
  latitude: r.latitude,
  longitude: r.longitude,
  timezone: r.timezone,
  population: r.population,
});

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  if (query.trim().length < 2) return [];
  const data = await getJSON<SearchResponse>(
    SEARCH_URL,
    { name: query, count: 8, language: "en", format: "json" },
    { revalidate: 86400, signal },
  );
  return (data.results ?? []).map(toPlace);
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Place | null> {
  const data = await getJSON<ReverseResponse>(
    REVERSE_URL,
    { latitude: lat, longitude: lon, localityLanguage: "en" },
    { revalidate: 86400, signal },
  );
  const name = data.city || data.locality;
  if (!name) return null;
  return {
    id: idFromLatLon(lat, lon),
    name,
    admin1: data.principalSubdivision || undefined,
    country: data.countryName ?? "",
    countryCode: data.countryCode ?? "",
    latitude: lat,
    longitude: lon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

function idFromLatLon(lat: number, lon: number): number {
  // Stable, collision-resistant integer id per ~11m coordinate cell.
  return Math.abs(Math.round(lat * 10000) * 1_000_000 + Math.round(lon * 10000));
}
