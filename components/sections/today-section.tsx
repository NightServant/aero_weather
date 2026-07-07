"use client";

import { GreetingHeader } from "@/components/today/greeting-header";
import { CurrentConditions } from "@/components/today/current-conditions";
import { UvIndexCard } from "@/components/today/detail-cards/uv-index-card";
import { SunriseCard, SunsetCard } from "@/components/today/detail-cards/sunrise-sunset-card";
import { HumidityCard } from "@/components/today/detail-cards/humidity-card";
import { AlertCard } from "@/components/shell/alert-card";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeToday } from "@/lib/forecast-summary";

/** Today section of the single-page scroll. Owns the page's only <h1>. */
export function TodaySection() {
  const { data, loading, error, place, hydrated } = useActiveForecast();
  const [prefs] = usePrefs();

  if (!hydrated) return <TodaySkeleton />;
  if (!place) return null; // empty state handled once by <AppSections/>
  if (loading && !data) return <TodaySkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <TodaySkeleton />;

  const today = data.daily[0];
  const format12h = prefs.timeFormat === "12h";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3 md:mx-auto md:my-auto">
        <div className="grid gap-6 grid-cols-1 w-full lg:col-span-2">
          <GreetingHeader timezone={data.place.timezone} summary={summarizeToday(data)} />
           <AlertCard />
          <CurrentConditions forecast={data} place={place} units={prefs.units} />
        </div>

        <aside aria-label="Today's details" className="grid gap-6 content-start sm:grid-cols-2 lg:grid-cols-1 lg:mt-8 w-full lg:col-span-1">
          <SunriseCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
          <SunsetCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
          <HumidityCard current={data.current} unit={prefs.units.temperature} />
          <UvIndexCard uv={data.current.uvIndex} isDay={data.current.isDay} />
        </aside>
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <Skeleton aria-hidden="true" className="h-32 w-full rounded-3xl" />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_338px]">
        <Skeleton aria-hidden="true" className="h-[420px] rounded-3xl" />
        <div className="grid content-start gap-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} aria-hidden="true" className="h-[120px] rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="tint-card mx-auto max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Couldn&apos;t load forecast</h1>
      <p className="caption mt-2">{message}</p>
    </div>
  );
}
