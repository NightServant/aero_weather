"use client";

import { HourlyCell } from "@/components/today/hourly-cell";
import type { Forecast, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  units: UnitPrefs;
  format12h: boolean;
};

export function HourlyView({ forecast, units, format12h }: Props) {
  const now = new Date();
  const points = forecast.hourly;
  let nowIndex = points.findIndex((p) => new Date(p.time).getTime() >= now.getTime());
  if (nowIndex === -1) nowIndex = 0;

  return (
    <div className="tint-card p-4">
      <div className="flex flex-wrap gap-1">
        {points.map((p, i) => (
          <HourlyCell
            key={p.time}
            point={p}
            unit={units.temperature}
            format12h={format12h}
            isNow={i === nowIndex}
            timezone={forecast.place.timezone}
          />
        ))}
      </div>
    </div>
  );
}
