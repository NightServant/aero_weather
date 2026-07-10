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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:mx-auto md:my-auto">
        <div className="grid gap-6 grid-cols-1 w-full lg:col-span-2">
          <GreetingHeader timezone={data.place.timezone} summary={summarizeToday(data)} />
           <AlertCard />
          <CurrentConditions forecast={data} place={place} units={prefs.units} />
        </div>

        {/* Detail rail: horizontal snap-scroll carousel on smartphones (< sm),
            reverting to the 2-col / vertical rail grid from sm upward. */}
        <aside aria-label="Today's details" className="w-full lg:col-span-1 lg:mt-8">
          <ul
            role="list"
            className="
              -mx-4 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              sm:mx-0 sm:grid sm:snap-none sm:content-start sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0
              sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-1
            "
          >
            <li className="min-w-0 shrink-0 basis-full snap-start sm:basis-auto">
              <SunriseCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
            </li>
            <li className="min-w-0 shrink-0 basis-full snap-start sm:basis-auto">
              <SunsetCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
            </li>
            <li className="min-w-0 shrink-0 basis-full snap-start sm:basis-auto">
              <HumidityCard current={data.current} unit={prefs.units.temperature} />
            </li>
            <li className="min-w-0 shrink-0 basis-full snap-start sm:basis-auto">
              <UvIndexCard uv={data.current.uvIndex} isDay={data.current.isDay} />
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

/** Shape-matched to the real Today layout: hero column (greeting + big icon/temp
 *  + stat rows) spanning 2/3, and the 4-card detail rail in the last column. */
function TodaySkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hero column */}
        <div className="grid content-start gap-8 lg:col-span-2">
          <div className="mt-8 space-y-3 text-center lg:text-left">
            <Skeleton aria-hidden="true" className="mx-auto h-10 w-64 max-w-full rounded-2xl lg:mx-0" />
            <Skeleton aria-hidden="true" className="mx-auto h-5 w-80 max-w-full rounded-lg lg:mx-0" />
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6 py-4 sm:gap-10 lg:justify-start">
              <Skeleton aria-hidden="true" className="size-28 shrink-0 rounded-full sm:size-[180px]" />
              <Skeleton aria-hidden="true" className="h-16 w-40 rounded-3xl sm:h-24 sm:w-56" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
              <Skeleton aria-hidden="true" className="h-14 w-56 max-w-full rounded-2xl" />
              <Skeleton aria-hidden="true" className="h-14 w-44 max-w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Detail rail: horizontal on phones, 2-up on sm, stacked on lg. */}
        <div className="-mx-4 flex gap-4 overflow-hidden px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:px-0 lg:col-span-1 lg:mt-8 lg:grid-cols-1">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              aria-hidden="true"
              className="h-[132px] w-[78vw] shrink-0 rounded-2xl sm:w-auto"
            />
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
