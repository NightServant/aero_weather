"use client";

import { Wind, Calendar, Bell, Thermometer, Eye, Gauge, Cloudy } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import {
  compassToWord,
  formatTemp,
  formatWind,
  tempUnitLabel,
  windUnitLabel,
} from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { deriveAlerts } from "@/lib/api/alerts";
import {
  cloudCoverNote,
  feelsLikeNote,
  formatVisibility,
  visibilityNote,
} from "@/lib/weather-metrics";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  place: Place;
  units: UnitPrefs;
};

/**
 * Figma hero column: dateline + almanac cards, then the big animated icon and
 * display temperature, then the condition / wind stat row.
 */
const WIND_THRESHOLDS: Record<string, [number, number]> = {
  kmh: [12, 29],
  mph: [7, 18],
  ms: [3, 8],
};

/** Figma copy pattern: "Clear with light winds". Thresholds per display unit. */
function windWord(speed: number, unit: string): string {
  const [light, moderate] = WIND_THRESHOLDS[unit] ?? WIND_THRESHOLDS.kmh;
  if (speed < light) return "light";
  if (speed < moderate) return "moderate";
  return "strong";
}

export function CurrentConditions({ forecast, place, units }: Props) {
  const c = forecast.current;
  const today = forecast.daily[0];
  const kind = weatherCodeToKind(c.weatherCode);
  const tempLabel = tempUnitLabel(units.temperature);

  const dateline = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: forecast.place.timezone,
  })
    .format(new Date())
    .toUpperCase();
  const location = [place.name, place.country].filter(Boolean).join(", ").toUpperCase();
  const [alert] = deriveAlerts(forecast);

  return (
    <section
      aria-label="Current conditions"
      className="flex w-full flex-col gap-6"
    >
      {/* 1. Where and when, plus any advisory: the context the reading needs. */}
      <div className="stagger-5 grid gap-6 md:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6">
          <Calendar className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="card-title-caps">Today - {dateline}</h2>
            <p className="card-subtitle-caps mt-1">{location}</p>
          </div>
        </div>

        {alert ? (
          <div
            role="status"
            className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6"
          >
            <Bell className="size-6 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="card-title-caps">{alert.title}</h2>
              <p className="caption mt-0.5 truncate" title={alert.summary}>
                {alert.summary}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="stagger-4 flex flex-col items-center gap-1 py-2 sm:flex-row sm:items-center sm:gap-10 sm:py-4">
        <span className="animate-float shrink-0">
          <AnimatedWeatherIcon
            kind={kind}
            isDay={c.isDay}
            size={220}
            className="!h-[calc(var(--hero-temp)*2.1)] !w-[calc(var(--hero-temp)*2.1)]"
          />
        </span>
        <p aria-live="polite" className="text-display-temp min-w-0 whitespace-nowrap">
          {formatTemp(c.temperature, units.temperature)}
          {tempLabel}
        </p>
      </div>

      <div className="stagger-5 grid gap-6 md:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6">
          <AnimatedWeatherIcon kind={kind} isDay={c.isDay} size={24} />
          <div>
            <h3
              className="stat-title truncate"
              title={`${WEATHER_LABEL[kind]} with ${windWord(c.windSpeed, units.wind)} winds`}
            >
              {WEATHER_LABEL[kind]} with {windWord(c.windSpeed, units.wind)} winds
            </h3>
            <p className="caption tabular mt-0.5">
              High {formatTemp(today.tempMax, units.temperature)}
              {tempLabel} Low {formatTemp(today.tempMin, units.temperature)}
              {tempLabel}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6">
          <Wind className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h3 className="stat-title tabular">
              Wind {formatWind(c.windSpeed)} {windUnitLabel(units.wind)}
            </h3>
            <p className="caption mt-0.5">From the {compassToWord(c.windDirection)}</p>
          </div>
        </div>
      </div>

      <hr className="border-[var(--hairline)]" />

      {/* Four readings the API already returns and nothing displayed. Same
          grammar as the conditions row above: hairline, icon, value, note. */}
      <div className="stagger-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <Metric
          icon={<Thermometer className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />}
          title={`Feels like ${formatTemp(c.apparentTemperature, units.temperature)}${tempLabel}`}
          note={feelsLikeNote(c.apparentTemperature, c.temperature)}
        />
        <Metric
          icon={<Eye className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />}
          title={`Visibility ${formatVisibility(c.visibility)}`}
          note={visibilityNote(c.visibility)}
        />
        <Metric
          icon={<Gauge className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />}
          title={`Pressure ${Math.round(c.pressure)} hPa`}
          note="Surface pressure"
        />
        <Metric
          icon={<Cloudy className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />}
          title={`Cloud cover ${Math.round(c.cloudCover)}%`}
          note={cloudCoverNote(c.cloudCover)}
        />
      </div>
    </section>
  );
}

/** One reading in the hairline grammar shared with the conditions row. */
function Metric({
  icon,
  title,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6">
      {icon}
      <div className="min-w-0">
        <h3 className="stat-title tabular truncate">{title}</h3>
        <p className="caption mt-0.5">{note}</p>
      </div>
    </div>
  );
}
