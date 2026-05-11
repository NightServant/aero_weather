import type { Forecast } from "./types";
import { weatherCodeToKind } from "./weather-code";

export type AlertSeverity = "advisory" | "watch" | "warning";

export type WeatherAlert = {
  id: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  windowLabel: string;
  startIso: string;
  endIso: string;
};

const HIGH_WIND_KMH = 50;
const HEAVY_PRECIP_MM = 10;

export function deriveAlerts(forecast: Forecast): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  const stormHours = forecast.hourly
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => {
      const kind = weatherCodeToKind(h.weatherCode);
      return kind === "thunderstorm" || kind === "thunderstorm-hail";
    });

  if (stormHours.length > 0) {
    const startIso = stormHours[0].h.time;
    const endIso = stormHours[stormHours.length - 1].h.time;
    alerts.push({
      id: `thunderstorm-${startIso}`,
      title: `${labelForDay(startIso, forecast.place.timezone)} alert`,
      summary: `Severe thunderstorm watch issued for your area, ${formatWindow(startIso, endIso, forecast.place.timezone)}.`,
      severity: "watch",
      windowLabel: formatWindow(startIso, endIso, forecast.place.timezone),
      startIso,
      endIso,
    });
  }

  const dailyHighWind = forecast.daily.find((d) => d.windSpeedMax >= HIGH_WIND_KMH);
  if (dailyHighWind && alerts.length === 0) {
    alerts.push({
      id: `wind-${dailyHighWind.date}`,
      title: "Wind advisory",
      summary: `Gusts expected to reach ${Math.round(dailyHighWind.windSpeedMax)} km/h ${labelForDay(dailyHighWind.date, forecast.place.timezone).toLowerCase()}.`,
      severity: "advisory",
      windowLabel: labelForDay(dailyHighWind.date, forecast.place.timezone),
      startIso: dailyHighWind.date,
      endIso: dailyHighWind.date,
    });
  }

  const heavyRain = forecast.daily.find((d) => d.precipitationSum >= HEAVY_PRECIP_MM);
  if (heavyRain && alerts.length === 0) {
    alerts.push({
      id: `rain-${heavyRain.date}`,
      title: "Heavy rain advisory",
      summary: `${Math.round(heavyRain.precipitationSum)} mm of rainfall expected ${labelForDay(heavyRain.date, forecast.place.timezone).toLowerCase()}.`,
      severity: "advisory",
      windowLabel: labelForDay(heavyRain.date, forecast.place.timezone),
      startIso: heavyRain.date,
      endIso: heavyRain.date,
    });
  }

  return alerts;
}

function labelForDay(iso: string, tz?: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz }).format(d);
}

function formatWindow(startIso: string, endIso: string, tz?: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", timeZone: tz };
  const s = new Intl.DateTimeFormat("en-US", opts).format(new Date(startIso));
  const e = new Intl.DateTimeFormat("en-US", opts).format(new Date(endIso));
  return `${s}–${e}`;
}
