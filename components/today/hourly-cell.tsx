"use client";

import { cn } from "@/lib/utils";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { weatherCodeToKind } from "@/lib/api/weather-code";
import { formatHour, formatTemp } from "@/lib/format";
import type { CurrentConditions, HourlyPoint } from "@/lib/api/types";
import type { TempUnit } from "@/lib/api/types";

type Props = {
  point: HourlyPoint;
  unit: TempUnit;
  format12h: boolean;
  isNow: boolean;
  timezone?: string;
  /** Live conditions for the "Now" cell so it matches the hero (no current/hourly clash). */
  current?: CurrentConditions;
};

export function HourlyCell({ point, unit, format12h, isNow, timezone, current }: Props) {
  // For "Now", follow live conditions so the rail never contradicts the hero.
  const kind = weatherCodeToKind(current?.weatherCode ?? point.weatherCode);
  const isDay = current?.isDay ?? point.isDay;
  const temperature = current?.temperature ?? point.temperature;
  const label = isNow ? "Now" : formatHour(point.time, format12h, timezone).replace(/\s/g, " ");

  return (
    <div
      className={cn(
        "flex w-[74px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition",
        isNow
          ? "now-ring border border-[color:var(--palette-accent,var(--accent))] bg-card"
          : "border border-transparent",
      )}
    >
      <div className={cn("text-[13px] font-medium", isNow ? "text-foreground" : "text-foreground/70")}>
        {label}
      </div>
      <AnimatedWeatherIcon kind={kind} isDay={isDay} size={22} animated={false} />
      <div className="text-base font-semibold tabular text-foreground">
        {formatTemp(temperature, unit)}
      </div>
      <div
        className={cn(
          "text-[11px] font-semibold tabular",
          point.precipitationProbability > 0
            ? "text-[color:var(--palette-accent,var(--accent))]"
            : "text-foreground/30",
        )}
      >
        {Math.round(point.precipitationProbability)}%
      </div>
    </div>
  );
}
