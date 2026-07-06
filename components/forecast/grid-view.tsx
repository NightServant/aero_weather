"use client";

import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatShortDate, formatTemp, formatWeekdayShort, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { DailyPoint, TempUnit } from "@/lib/api/types";

type Props = {
  daily: DailyPoint[];
  unit: TempUnit;
  timezone?: string;
};

/** Figma grid view: 14 real-data day cards in a 4-column grid (spec: 4 -> 2 -> 1). */
export function GridView({ daily, unit, timezone }: Props) {
  return (
    <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {daily.map((point, i) => (
        <GridCard key={point.date} point={point} index={i} unit={unit} timezone={timezone} />
      ))}
    </ul>
  );
}

function GridCard({
  point,
  index,
  unit,
  timezone,
}: {
  point: DailyPoint;
  index: number;
  unit: TempUnit;
  timezone?: string;
}) {
  const kind = weatherCodeToKind(point.weatherCode);
  const dayLabel = index === 0 ? "Today" : formatWeekdayShort(point.date, timezone);
  const unitLabel = tempUnitLabel(unit);

  return (
    <li
      className={`tint-card card-interactive flex items-center gap-4 p-4 backdrop-blur ${index < 6 ? `stagger-${index + 1}` : ""}`}
    >
      <AnimatedWeatherIcon kind={kind} isDay size={48} />
      <div className="min-w-0">
        <h3 className="stat-title leading-tight">{dayLabel}</h3>
        <p className="caption">
          {formatShortDate(point.date, timezone)} - {WEATHER_LABEL[kind]}
        </p>
        <p
          className="tabular mt-1 text-sm"
          aria-label={`High ${formatTemp(point.tempMax, unit)} degrees, low ${formatTemp(point.tempMin, unit)} degrees`}
        >
          <span className="font-semibold text-text-strong">
            {formatTemp(point.tempMax, unit)}
            {unitLabel}
          </span>{" "}
          <span className="text-muted-foreground">
            {formatTemp(point.tempMin, unit)}
            {unitLabel}
          </span>
        </p>
      </div>
    </li>
  );
}
