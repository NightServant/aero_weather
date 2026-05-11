"use client";

import { MapPin } from "lucide-react";
import { WeatherScene } from "./weather-scene";
import { WeatherIcon } from "./weather-icon";
import { ConditionStat } from "./condition-stat";
import { formatTemp, formatWind, tempUnitLabel, windUnitLabel, dewPoint, compassToWord } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { aqiCategory } from "@/lib/api/air-quality";
import type { AirQuality, Forecast, Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  airQuality: AirQuality | null;
  place: Place;
  units: UnitPrefs;
};

export function CurrentConditions({ forecast, airQuality, place, units }: Props) {
  const c = forecast.current;
  const today = forecast.daily[0];
  const kind = weatherCodeToKind(c.weatherCode);
  const tempLabel = tempUnitLabel(units.temperature);
  const aqi = airQuality?.usAqi;
  const aqiLabel = aqi != null ? aqiCategory(aqi).replace(/-/g, " ") : null;

  return (
    <section className="surface-card-elevated relative grid gap-6 overflow-hidden p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-6 pt-4 md:px-8">
        <div className="text-[10px] font-semibold tracking-[0.22em] text-foreground/40 uppercase">
          Aero Almanac · {WEATHER_LABEL[kind]}
        </div>
        <div className="font-mono text-[10px] tracking-wider text-foreground/30 tabular">
          {place.latitude.toFixed(2)}° · {place.longitude.toFixed(2)}°
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5" strokeWidth={1.5} />
          <span className="font-medium">{place.name}</span>
          {place.admin1 ? <span>· {place.admin1}</span> : null}
        </div>

        <div className="relative flex items-start gap-2">
          <div className="pointer-events-none absolute -left-3 top-3 hidden h-[80%] w-px bg-gradient-to-b from-transparent via-[var(--hairline-strong)] to-transparent md:block">
            <div className="absolute -left-1 top-0 h-px w-2 bg-[var(--hairline-strong)]" />
            <div className="absolute -left-1 top-1/4 h-px w-1.5 bg-[var(--hairline)]" />
            <div className="absolute -left-1 top-1/2 h-px w-2 bg-[var(--hairline-strong)]" />
            <div className="absolute -left-1 top-3/4 h-px w-1.5 bg-[var(--hairline)]" />
            <div className="absolute -left-1 bottom-0 h-px w-2 bg-[var(--hairline-strong)]" />
          </div>
          <span className="font-display text-[7.5rem] font-thin leading-[0.82] tracking-[-0.05em] text-foreground tabular sm:text-[9.5rem]">
            {formatTemp(c.temperature, units.temperature, false)}
          </span>
          <div className="mt-3 flex flex-col gap-0.5 text-base font-medium text-foreground/70">
            <span className="text-xl leading-none">°</span>
            <span className="text-sm">{tempLabel}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-[var(--hairline)] pt-4">
          <div className="text-[color:var(--scene-accent,var(--accent))]">
            <WeatherIcon kind={kind} isDay={c.isDay} className="size-8" />
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-semibold text-foreground">{WEATHER_LABEL[kind]} with light winds</div>
            <div className="text-sm text-muted-foreground tabular">
              Feels like {formatTemp(c.apparentTemperature, units.temperature)}{tempLabel}
              <span className="mx-2 text-foreground/30">·</span>
              High {formatTemp(today.tempMax, units.temperature)}{tempLabel}
              <span className="mx-2 text-foreground/30">·</span>
              Low {formatTemp(today.tempMin, units.temperature)}{tempLabel}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ConditionStat
            label="Humidity"
            value={`${Math.round(c.humidity)}`}
            unit="%"
            secondary={`Dew point ${Math.round(dewPoint(toCelsius(c.temperature, units), c.humidity))}°C`}
          />
          <ConditionStat
            label="Wind"
            value={formatWind(c.windSpeed)}
            unit={windUnitLabel(units.wind)}
            secondary={`From the ${compassToWord(c.windDirection)}`}
          />
          <ConditionStat
            label="Air quality"
            value={aqi != null ? String(aqi) : "—"}
            accent={aqiLabel ?? undefined}
            secondary={aqi != null ? "PM2.5 within range" : "Unavailable"}
          />
        </div>
      </div>

      <WeatherScene
        kind={kind}
        isDay={c.isDay}
        high={`${formatTemp(today.tempMax, units.temperature)}${tempLabel}`}
        low={`${formatTemp(today.tempMin, units.temperature)}${tempLabel}`}
      />
    </section>
  );
}

function toCelsius(value: number, units: UnitPrefs): number {
  if (units.temperature === "celsius") return value;
  return ((value - 32) * 5) / 9;
}
