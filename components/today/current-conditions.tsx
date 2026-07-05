"use client";

import { Wind } from "lucide-react";
import { GlassCard } from "@/components/aero/glass-card";
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
    <section aria-label="Current conditions" className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <GlassCard variant="glass" className="stagger-2 px-6 py-5">
          <h2 className="card-title-caps">Today - {dateline}</h2>
          <p className="card-subtitle-caps mt-1">{location}</p>
        </GlassCard>
        <GlassCard variant="glass" className="stagger-3 px-6 py-5">
          <h2 className="card-title-caps">Aero Almanac</h2>
          <p className="mt-1 text-sm text-foreground/85">{WEATHER_LABEL[kind]}</p>
          <p className="caption mt-0.5">Data by Open-Meteo</p>
        </GlassCard>
      </div>

      <div className="stagger-4 flex flex-wrap items-center gap-6 py-4 sm:gap-10">
        <span className="animate-float">
          <AnimatedWeatherIcon
            kind={kind}
            isDay={c.isDay}
            size={220}
            className="max-sm:!h-[140px] max-sm:!w-[140px]"
          />
        </span>
        <p aria-live="polite" className="text-display-temp">
          {formatTemp(c.temperature, units.temperature)}
          {tempLabel}
        </p>
      </div>

      <div className="stagger-5 flex flex-wrap gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <AnimatedWeatherIcon kind={kind} isDay={c.isDay} size={24} />
          <div>
            <h3 className="stat-title">{WEATHER_LABEL[kind]}</h3>
            <p className="caption tabular mt-0.5">
              High {formatTemp(today.tempMax, units.temperature)}
              {tempLabel} Low {formatTemp(today.tempMin, units.temperature)}
              {tempLabel}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 border-l border-white/12 pl-6">
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
