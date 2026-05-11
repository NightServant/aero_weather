"use client";

import Link from "next/link";
import { useState } from "react";
import { GreetingHeader } from "@/components/today/greeting-header";
import { ViewTabs, type TodayView } from "@/components/today/view-tabs";
import { CurrentConditions } from "@/components/today/current-conditions";
import { HourlyForecast } from "@/components/today/hourly-forecast";
import { UvIndexCard } from "@/components/today/detail-cards/uv-index-card";
import { SunriseSunsetCard } from "@/components/today/detail-cards/sunrise-sunset-card";
import { VisibilityCard } from "@/components/today/detail-cards/visibility-card";
import { PressureCard } from "@/components/today/detail-cards/pressure-card";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeToday } from "@/lib/forecast-summary";
import { EmptyLocation } from "@/components/shell/empty-location";

export default function TodayPage() {
  const { data, airQuality, loading, error, place, hydrated } = useActiveForecast();
  const [prefs] = usePrefs();
  const [view, setView] = useState<TodayView>("today");

  if (!hydrated) return <PageSkeleton />;
  if (!place) return <EmptyLocation />;
  if (loading && !data) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <PageSkeleton />;

  const summary = summarizeToday(data);
  const todayDate = data.daily[0]?.date ?? new Date().toISOString();

  return (
    <div className="space-y-8 pt-2">
      <div className="flex items-start justify-between gap-6">
        <GreetingHeader isoDate={todayDate} timezone={data.place.timezone} summary={summary} />
        <div className="stagger-3 pt-1">
          <ViewTabs value={view} onChange={setView} />
        </div>
      </div>

      <div className="stagger-4">
        <CurrentConditions forecast={data} airQuality={airQuality} place={place} units={prefs.units} />
      </div>

      <div className="stagger-5">
        <HourlyForecast
          forecast={data}
          units={prefs.units}
          format12h={prefs.timeFormat === "12h"}
          view={view}
        />
      </div>

      <div className="stagger-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UvIndexCard uv={data.current.uvIndex} />
        <SunriseSunsetCard
          sunriseIso={data.daily[0].sunrise}
          sunsetIso={data.daily[0].sunset}
          format12h={prefs.timeFormat === "12h"}
          timezone={data.place.timezone}
        />
        <VisibilityCard meters={data.current.visibility} />
        <PressureCard
          current={data.current.pressure}
          laterHours={data.hourly.slice(0, 6).map((h) => h.temperature)}
        />
      </div>

      <div className="pt-4 text-sm text-muted-foreground">
        <Link href="/forecast" className="underline-offset-4 hover:underline">
          See the full seven-day outlook →
        </Link>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8 pt-2">
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[340px] w-full rounded-3xl" />
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="surface-card mx-auto mt-12 max-w-md p-8 text-center">
      <h2 className="text-lg font-semibold">Couldn't load forecast</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
