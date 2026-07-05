"use client";

import { PrecipBar } from "./precip-bar";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatShortDate, formatTemp, formatWeekdayShort, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { DailyPoint, TempUnit } from "@/lib/api/types";

type Props = {
  point: DailyPoint;
  unit: TempUnit;
  index: number;
  timezone?: string;
};

export function DailyRow({ point, unit, index, timezone }: Props) {
  const kind = weatherCodeToKind(point.weatherCode);
  const dayLabel = index === 0 ? "Today" : formatWeekdayShort(point.date, timezone);

  return (
    <div className="grid grid-cols-[88px_42px_1fr_72px] items-center gap-4 py-3 sm:grid-cols-[96px_48px_1fr_120px]">
      <div className="leading-tight">
        <div className="text-sm font-semibold text-foreground">{dayLabel}</div>
        <div className="text-xs text-muted-foreground">{formatShortDate(point.date, timezone)}</div>
      </div>
      <AnimatedWeatherIcon kind={kind} isDay size={28} animated={false} />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground/80">{WEATHER_LABEL[kind]}</span>
          <span className="font-semibold tabular text-[color:var(--palette-accent,var(--accent))]">
            {Math.round(point.precipitationProbabilityMax)}% precip
          </span>
        </div>
        <PrecipBar value={point.precipitationProbabilityMax} />
      </div>
      <div className="flex items-baseline justify-end gap-2 tabular text-sm">
        <span className="text-muted-foreground">{formatTemp(point.tempMin, unit)}</span>
        <span className="font-semibold text-foreground">{formatTemp(point.tempMax, unit)}</span>
        <span className="hidden text-[10px] uppercase text-muted-foreground sm:inline">{tempUnitLabel(unit)}</span>
      </div>
    </div>
  );
}
