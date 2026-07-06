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

export function formatTime(iso: string, format12h: boolean, timezone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: format12h,
    timeZone: timezone,
  }).format(d);
}

export function formatHour(iso: string, format12h: boolean, timezone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: format12h,
    timeZone: timezone,
  }).format(d);
}

export function formatDate(iso: string, timezone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(d);
}

export function formatShortDate(iso: string, timezone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(d);
}

export function formatWeekdayShort(iso: string, timezone?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timezone }).format(d);
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
