import type { TempUnit, WindUnit } from "./api/types";

export function formatTemp(value: number, _unit: TempUnit, withDegree = true): string {
  const rounded = Math.round(value);
  return withDegree ? `${rounded}°` : `${rounded}`;
}

export function tempUnitLabel(unit: TempUnit): string {
  return unit === "fahrenheit" ? "F" : "C";
}

export function formatWind(value: number): string {
  return `${Math.round(value)}`;
}

export function windUnitLabel(unit: WindUnit): string {
  if (unit === "mph") return "mph";
  if (unit === "ms") return "m/s";
  return "km/h";
}

/** An ISO-like local date, with or without a time, carrying no zone designator. */
const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/**
 * Open-Meteo is queried with `timezone=auto`, so it returns times already
 * localised to the place being viewed, written without an offset
 * ("2026-08-19T06:10"), and calendar days with no time at all ("2026-08-19").
 * Those are wall-clock readings, not instants: `new
 * Date` reads them in the viewer's own zone, and formatting the result back
 * into the place's zone shifts them a second time. Viewing New York from
 * Manila turned a 6:10 AM sunrise into "6:10 PM".
 *
 * Re-anchor such strings as UTC and format them in UTC, so the digits printed
 * are exactly the ones the API sent. Strings that do carry a Z or an offset
 * are real instants and keep their normal conversion.
 */
function resolveInstant(iso: string, timezone?: string): { date: Date; timeZone?: string } {
  const m = WALL_CLOCK.exec(iso);
  if (!m) return { date: new Date(iso), timeZone: timezone };
  const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0, m[6] ? +m[6] : 0);
  return { date: new Date(utc), timeZone: "UTC" };
}

export function formatTime(iso: string, format12h: boolean, timezone?: string): string {
  const { date, timeZone } = resolveInstant(iso, timezone);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: format12h,
    timeZone,
  }).format(date);
}

export function formatHour(iso: string, format12h: boolean, timezone?: string): string {
  const { date, timeZone } = resolveInstant(iso, timezone);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: format12h,
    timeZone,
  }).format(date);
}

export function formatDate(iso: string, timezone?: string): string {
  const { date, timeZone } = resolveInstant(iso, timezone);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  }).format(date);
}

export function formatShortDate(iso: string, timezone?: string): string {
  const { date, timeZone } = resolveInstant(iso, timezone);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
}

export function formatWeekdayShort(iso: string, timezone?: string): string {
  const { date, timeZone } = resolveInstant(iso, timezone);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
}

export function relativeGreeting(date: Date = new Date(), timezone?: string): string {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  }).format(date);
  const hour = parseInt(hourStr, 10);
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function dewPoint(temperatureC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temperatureC) / (b + temperatureC) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

/** Dew point in the given display unit: API value when present (already in the
 *  requested unit), else the Magnus approximation from temperature + humidity. */
export function resolveDewPoint(
  current: { dewPoint?: number; temperature: number; humidity: number },
  unit: TempUnit,
): number | null {
  if (current.dewPoint != null && Number.isFinite(current.dewPoint)) return current.dewPoint;
  if (!Number.isFinite(current.temperature) || current.humidity <= 0) return null;
  const tempC = unit === "fahrenheit" ? ((current.temperature - 32) * 5) / 9 : current.temperature;
  const dpC = dewPoint(tempC, current.humidity);
  return unit === "fahrenheit" ? (dpC * 9) / 5 + 32 : dpC;
}

/** Index of the first hourly point at or after now (0 when all are in the past). */
export function findNowIndex(points: { time: string }[]): number {
  const now = Date.now();
  const idx = points.findIndex((p) => new Date(p.time).getTime() >= now);
  return idx === -1 ? 0 : idx;
}

export function formatMinutes(totalMin: number): string {
  const safe = Math.max(0, Math.round(totalMin));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${m}m`;
}

export function durationBetween(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return formatMinutes(ms / 60000);
}

export function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function compassToWord(deg: number): string {
  const map: Record<string, string> = {
    N: "north",
    NE: "northeast",
    E: "east",
    SE: "southeast",
    S: "south",
    SW: "southwest",
    W: "west",
    NW: "northwest",
  };
  return map[windDirectionLabel(deg)] ?? "north";
}
