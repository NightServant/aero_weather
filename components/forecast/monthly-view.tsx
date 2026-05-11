"use client";

import { WeatherIcon } from "@/components/today/weather-icon";
import { weatherCodeToKind } from "@/lib/api/weather-code";
import { formatTemp } from "@/lib/format";
import type { Forecast, TempUnit } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  unit: TempUnit;
};

export function MonthlyView({ forecast, unit }: Props) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="eyebrow">Next {forecast.daily.length} days · grid view</div>
        <div className="text-xs text-muted-foreground">Open-Meteo provides up to 16 days</div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {forecast.daily.map((d) => {
          const kind = weatherCodeToKind(d.weatherCode);
          const date = new Date(d.date);
          return (
            <div key={d.date} className="rounded-2xl border border-[var(--hairline)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {date.toLocaleDateString("en-US", { weekday: "short", timeZone: forecast.place.timezone })}
                </span>
                <span className="text-muted-foreground tabular">
                  {date.toLocaleDateString("en-US", { day: "numeric", timeZone: forecast.place.timezone })}
                </span>
              </div>
              <div className="my-2 text-[color:var(--scene-accent,var(--muted-foreground))]">
                <WeatherIcon kind={kind} isDay className="size-6" />
              </div>
              <div className="flex items-baseline gap-1.5 tabular text-sm">
                <span className="font-semibold text-foreground">{formatTemp(d.tempMax, unit)}</span>
                <span className="text-muted-foreground">{formatTemp(d.tempMin, unit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
