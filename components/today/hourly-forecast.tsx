"use client";

import { HourlyCell } from "./hourly-cell";
import type { Forecast, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  units: UnitPrefs;
  format12h: boolean;
  view?: "today" | "tomorrow";
};

function localDateKey(iso: string, timezone: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: timezone });
}

export function HourlyForecast({ forecast, units, format12h, view = "today" }: Props) {
  const tz = forecast.place.timezone;
  const todayKey = localDateKey(new Date().toISOString(), tz);
  const tomorrowKey = localDateKey(new Date(Date.now() + 86400000).toISOString(), tz);
  const targetKey = view === "tomorrow" ? tomorrowKey : todayKey;

  const points = forecast.hourly.filter((p) => localDateKey(p.time, tz) === targetKey);
  const now = Date.now();
  let nowIndex = view === "today" ? points.findIndex((p) => new Date(p.time).getTime() >= now) : -1;
  if (nowIndex === -1 && view === "today") nowIndex = 0;

  const eyebrow = view === "tomorrow" ? "Tomorrow" : "Today";

  return (
    <section className="surface-card relative overflow-hidden p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-[58px] h-px bg-gradient-to-r from-transparent via-[var(--hairline)] to-transparent"
      />
      <div className="mb-4 flex items-center justify-between">
        <div className="eyebrow flex items-center gap-2">
          <span className="font-mono text-foreground/40">{points.length}H</span>
          <span>{eyebrow} · hourly forecast</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-foreground/60 uppercase">
          <span className="size-2 rounded-sm bg-[color:var(--palette-accent,var(--accent))]" />
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
            isNow={view === "today" && i === nowIndex}
            timezone={forecast.place.timezone}
          />
        ))}
      </div>
    </section>
  );
}
