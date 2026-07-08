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
