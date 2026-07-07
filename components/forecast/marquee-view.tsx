"use client";

import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatShortDate, formatTemp, formatWeekdayShort, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { CurrentConditions, DailyPoint, TempUnit } from "@/lib/api/types";

type Props = {
  daily: DailyPoint[];
  unit: TempUnit;
  timezone?: string;
  /** Live conditions used for the "Today" card so it matches the hero (no current/daily clash). */
  current?: CurrentConditions;
};

/**
 * 14 real-data day cards on an infinite horizontal marquee (grid removed).
 * The track holds two identical copies and slides 0 -> -50%, so copy #2 lands
 * exactly where copy #1 began — a seamless loop. Pauses on hover/focus, and
 * degrades to a plain horizontal scroller under prefers-reduced-motion.
 */
export function MarqueeView({ daily, unit, timezone, current }: Props) {
  return (
    <div className="marquee group">
      <ul className="marquee-track list-none" aria-label="14-day forecast">
        {daily.map((point, i) => (
          <MarqueeCard
            key={point.date}
            point={point}
            index={i}
            unit={unit}
            timezone={timezone}
            current={i === 0 ? current : undefined}
          />
        ))}
        {/* Duplicate set drives the seamless loop; hidden from the a11y tree. */}
        {daily.map((point, i) => (
          <MarqueeCard
            key={`dup-${point.date}`}
            point={point}
            index={i}
            unit={unit}
            timezone={timezone}
            current={i === 0 ? current : undefined}
            duplicate
          />
        ))}
      </ul>
    </div>
  );
}

function MarqueeCard({
  point,
  index,
  unit,
  timezone,
  current,
  duplicate = false,
}: {
  point: DailyPoint;
  index: number;
  unit: TempUnit;
  timezone?: string;
  current?: CurrentConditions;
  duplicate?: boolean;
}) {
  // For "Today", follow live conditions so the marquee never contradicts the hero.
  const kind = weatherCodeToKind(current?.weatherCode ?? point.weatherCode);
  const isDay = current?.isDay ?? true;
  const dayLabel = index === 0 ? "Today" : formatWeekdayShort(point.date, timezone);
  const unitLabel = tempUnitLabel(unit);

  return (
    <li
      aria-hidden={duplicate || undefined}
      className={`tint-card card-interactive flex w-64 shrink-0 items-center gap-4 p-4 backdrop-blur ${duplicate ? "marquee-dup" : ""}`}
    >
      <AnimatedWeatherIcon kind={kind} isDay={isDay} size={48} />
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
