"use client";

import { useState } from "react";
import { ForecastHeader, type ForecastView } from "@/components/forecast/forecast-header";
import { DailyRow } from "@/components/forecast/daily-row";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { HourlyView } from "@/components/forecast/hourly-view";
import { MonthlyView } from "@/components/forecast/monthly-view";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { summarizeWeek } from "@/lib/forecast-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyLocation } from "@/components/shell/empty-location";

export default function ForecastPage() {
  const { data, loading, error, hydrated, place } = useActiveForecast();
  const [prefs] = usePrefs();
  const [view, setView] = useState<ForecastView>("daily");

  if (!hydrated) return <PageSkeleton />;
  if (!place) return <EmptyLocation />;
  if (loading && !data) return <PageSkeleton />;
  if (error) return <p className="mt-12 text-center text-sm text-muted-foreground">{error.message}</p>;
  if (!data) return <PageSkeleton />;

  const { title, subtitle } = summarizeWeek(data);

  return (
    <div className="space-y-8 pt-2">
      <ForecastHeader title={title} subtitle={subtitle} view={view} onChangeView={setView} />

      <div className="stagger-4">
        {view === "daily" ? (
          <div className="surface-card divide-y divide-[var(--hairline)] px-5 py-3">
            {data.daily.map((d, i) => (
              <DailyRow
                key={d.date}
                point={d}
                unit={prefs.units.temperature}
                index={i}
                timezone={data.place.timezone}
              />
            ))}
          </div>
        ) : view === "hourly" ? (
          <HourlyView forecast={data} units={prefs.units} format12h={prefs.timeFormat === "12h"} />
        ) : (
          <MonthlyView forecast={data} unit={prefs.units.temperature} />
        )}
      </div>

      <div className="stagger-5">
        <SummaryCards forecast={data} units={prefs.units} />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 pt-2">
      <Skeleton className="h-16 w-72" />
      <Skeleton className="h-[400px] w-full rounded-3xl" />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
