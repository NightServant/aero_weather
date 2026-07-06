"use client";

import Link from "next/link";
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
import { EmptyLocation } from "@/components/shell/empty-location";

export default function TodayPage() {
  const { data, loading, error, place, hydrated } = useActiveForecast();
  const [prefs] = usePrefs();

  if (!hydrated) return <PageSkeleton />;
  if (!place) return <EmptyLocation />;
  if (loading && !data) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <PageSkeleton />;

  const today = data.daily[0];
  const format12h = prefs.timeFormat === "12h";

  return (
    <div className="space-y-8 pt-2">
      {/* Weather-safety banner: renders only when an alert is derived. */}
      <AlertCard />

      <GreetingHeader timezone={data.place.timezone} summary={summarizeToday(data)} />

      <hr className="border-white/[0.08]" />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_338px]">
        <CurrentConditions forecast={data} place={place} units={prefs.units} />

        <aside aria-label="Today's details" className="grid content-start gap-6 sm:grid-cols-2 md:grid-cols-1">
          <SunriseCard
            sunriseIso={today.sunrise}
            sunsetIso={today.sunset}
            format12h={format12h}
            timezone={data.place.timezone}
          />
          <SunsetCard
            sunriseIso={today.sunrise}
            sunsetIso={today.sunset}
            format12h={format12h}
            timezone={data.place.timezone}
          />
          <UvIndexCard uv={data.current.uvIndex} />
          <HumidityCard current={data.current} unit={prefs.units.temperature} />
        </aside>
      </div>

      <p className="caption pt-2">
        <Link href="/forecast" className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
          See the full 2-week outlook
        </Link>
      </p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8 pt-2">
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
    <div className="tint-card mx-auto mt-12 max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Couldn&apos;t load forecast</h1>
      <p className="caption mt-2">{message}</p>
    </div>
  );
}
