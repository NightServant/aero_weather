"use client";

import { HourlyCell } from "@/components/today/hourly-cell";
import { findNowIndex } from "@/lib/format";
import type { Forecast, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  units: UnitPrefs;
  format12h: boolean;
};

/** Horizontal scroll rail of the next 24 hours (snap, hidden scrollbar). */
export function HourlyView({ forecast, units, format12h }: Props) {
  const nowIndex = Math.max(0, findNowIndex(forecast.hourly));
  const points = forecast.hourly.slice(nowIndex, nowIndex + 24);

  return (
    <div className="tint-card p-3">
      <ul
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Hourly forecast, next 24 hours"
      >
        {points.map((p, i) => (
          <li key={p.time} className="snap-start">
            <HourlyCell
              point={p}
              unit={units.temperature}
              format12h={format12h}
              isNow={i === 0}
              timezone={forecast.place.timezone}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
