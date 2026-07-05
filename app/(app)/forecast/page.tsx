"use client";

import { useState } from "react";
import { ForecastHeader, type ForecastView } from "@/components/forecast/forecast-header";
import { DailyRow } from "@/components/forecast/daily-row";
import { GridView } from "@/components/forecast/grid-view";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { HourlyView } from "@/components/forecast/hourly-view";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { summarizeOutlook } from "@/components/forecast/outlook-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyLocation } from "@/components/shell/empty-location";

export default function ForecastPage() {
  const { data, loading, error, hydrated, place } = useActiveForecast();
  const [prefs] = usePrefs();
  const [view, setView] = useState<ForecastView>("grid");

  if (!hydrated) return <PageSkeleton />;
  if (!place) return <EmptyLocation />;
  if (loading && !data) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <PageSkeleton />;

  const { title, subtitle } = summarizeOutlook(data);

  return (
    <div className="space-y-8 pt-2">
      <ForecastHeader
        title={title}
        subtitle={subtitle}
        days={data.daily.length}
        view={view}
        onChangeView={setView}
      />

      <div
        role="tabpanel"
        id={`forecast-view-${view}`}
        aria-labelledby={`forecast-view-tab-${view}`}
        className="stagger-4"
      >
        {view === "daily" ? (
          <div className="tint-card divide-y divide-white/[0.08] px-5 py-3">
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
          <GridView daily={data.daily} unit={prefs.units.temperature} timezone={data.place.timezone} />
        )}
      </div>

      <hr className="border-white/[0.08]" />

      <div className="stagger-5">
        <SummaryCards forecast={data} units={prefs.units} />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8 pt-2">
      <Skeleton aria-hidden="true" className="h-20 w-72 rounded-3xl" />
      <Skeleton aria-hidden="true" className="h-32 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} aria-hidden="true" className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="tint-card mx-auto mt-12 max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Couldn&apos;t load forecast</h1>
      <p className="caption mt-2">{message}</p>
    </div>
  );
}
