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
