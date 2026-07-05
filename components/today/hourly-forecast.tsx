"use client";

import { HourlyCell } from "./hourly-cell";
import type { Forecast, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  units: UnitPrefs;
  format12h: boolean;
};

export function HourlyForecast({ forecast, units, format12h }: Props) {
  const points = forecast.hourly;
  const now = Date.now();
  let nowIndex = points.findIndex((p) => new Date(p.time).getTime() >= now);
  if (nowIndex === -1) nowIndex = 0;

  return (
    <section className="tint-card relative overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="card-title-caps">Next 24 hours</h2>
        <div className="caption flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-sm bg-[color:var(--palette-accent,var(--accent))]"
          />
          Precipitation %
        </div>
      </div>
      <div className="relative -mx-2 flex gap-1 overflow-x-auto pb-1 pl-2 pr-2 [scrollbar-width:thin]">
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
    </section>
  );
}
