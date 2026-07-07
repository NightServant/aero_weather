"use client";

import { Wind, Calendar, BookOpen } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import {
  compassToWord,
  formatTemp,
  formatWind,
  tempUnitLabel,
  windUnitLabel,
} from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
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

  return (
    <section aria-label="Current conditions" className="space-y-6 mx-auto my-auto lg:mx-0 lg:my-0">
      <div className="stagger-5 flex flex-wrap gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <Calendar className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2 className="card-title-caps">Today - {dateline}</h2>
            <p className="card-subtitle-caps mt-1">{location}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-start gap-3 md:border-l md:border-white/12 md:pl-6">
          <BookOpen className="size-6 text-foreground/80" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2 className="card-title-caps">Aero Almanac - {WEATHER_LABEL[kind]}</h2>
            <p className="caption mt-0.5">Data by Open-Meteo</p>
          </div>
        </div>
      </div>
      <div className="stagger-4 flex flex-nowrap items-center gap-4 py-4 sm:gap-10">
        <span className="animate-float shrink-0">
          <AnimatedWeatherIcon
            kind={kind}
            isDay={c.isDay}
            size={220}
            className="max-sm:!h-[112px] max-sm:!w-[112px]"
          />
        </span>
        <p aria-live="polite" className="text-display-temp min-w-0 whitespace-nowrap">
          {formatTemp(c.temperature, units.temperature)}
          {tempLabel}
        </p>
      </div>

      <div className="stagger-5 flex flex-wrap gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <AnimatedWeatherIcon kind={kind} isDay={c.isDay} size={24} />
          <div>
            <h3 className="stat-title">
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
    </section>
  );
}
